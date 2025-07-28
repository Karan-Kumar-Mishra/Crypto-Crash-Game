const GameRound = require('../models/GameRound');
const Player = require('../models/Player');
const Transaction = require('../models/Transaction');
const CryptoPriceService = require('../services/CryptoPriceService');
const ProvablyFair = require('../utils/ProvablyFair');
const crypto = require('crypto');

class GameManager {
  constructor(io) {
    this.io = io;
    this.currentRound = null;
    this.gameState = {
      status: 'waiting',
      roundId: null,
      startTime: null,
      crashTime: null,
      crashPoint: null,
      multiplier: 1.0,
      timeElapsed: 0,
      bets: [],
      cashouts: []
    };
    this.roundNumber = 0;
    this.gameInterval = null;
    this.updateInterval = null;
    this.roundDuration = 10000; // 10 seconds
    this.updateFrequency = 100; // 100ms updates
    this.growthFactor = 0.05; // Multiplier growth factor
  }

  // Start the game loop
  async startGameLoop() {
    console.log('Starting game loop...');
    await this.initializeGame();
    this.scheduleNextRound();
  }

  // Initialize game state
  async initializeGame() {
    // Get the latest round number from database
    const latestRound = await GameRound.findOne().sort({ roundId: -1 });
    if (latestRound) {
      this.roundNumber = parseInt(latestRound.roundId.split('-')[1]) + 1;
    } else {
      this.roundNumber = 1;
    }
    console.log(`Starting with round number: ${this.roundNumber}`);
  }

  // Schedule the next round
  scheduleNextRound() {
    setTimeout(() => {
      this.startNewRound();
    }, this.roundDuration);
  }

  // Start a new game round
  async startNewRound() {
    try {
      console.log(`Starting round ${this.roundNumber}`);
      
      // Generate crash point
      const crashData = ProvablyFair.generateCrashPoint(this.roundNumber);
      
      // Create new round in database
      const roundId = `round-${this.roundNumber}`;
      this.currentRound = new GameRound({
        roundId,
        status: 'waiting',
        startTime: new Date(),
        seed: crashData.seed,
        hash: crashData.hash,
        crashPoint: crashData.crashPoint
      });
      
      await this.currentRound.save();

      // Update game state
      this.gameState = {
        status: 'waiting',
        roundId,
        startTime: new Date(),
        crashTime: null,
        crashPoint: crashData.crashPoint,
        multiplier: 1.0,
        timeElapsed: 0,
        bets: [],
        cashouts: []
      };

      // Notify all clients
      this.io.to('game').emit('round-start', {
        roundId,
        startTime: this.gameState.startTime,
        crashPoint: crashData.crashPoint,
        seed: crashData.seed,
        hash: crashData.hash
      });

      // Start the active phase after 5 seconds
      setTimeout(() => {
        this.startActivePhase();
      }, 5000);

    } catch (error) {
      console.error('Error starting new round:', error);
      this.scheduleNextRound();
    }
  }

  // Start the active phase of the round
  startActivePhase() {
    if (!this.currentRound) return;

    console.log(`Round ${this.roundNumber} active phase started`);
    
    this.currentRound.status = 'active';
    this.currentRound.save();

    this.gameState.status = 'active';
    this.gameState.timeElapsed = 0;

    // Start multiplier updates
    this.updateInterval = setInterval(() => {
      this.updateMultiplier();
    }, this.updateFrequency);

    // Notify clients
    this.io.to('game').emit('game-active', {
      roundId: this.gameState.roundId,
      startTime: this.gameState.startTime
    });
  }

  // Update multiplier during active phase
  updateMultiplier() {
    if (this.gameState.status !== 'active') return;

    this.gameState.timeElapsed += this.updateFrequency;
    const timeInSeconds = this.gameState.timeElapsed / 1000;
    
    // Calculate multiplier using exponential growth
    this.gameState.multiplier = 1 + (timeInSeconds * this.growthFactor);
    
    // Check if game should crash
    if (this.gameState.multiplier >= this.gameState.crashPoint) {
      this.crashGame();
      return;
    }

    // Broadcast multiplier update
    this.io.to('game').emit('multiplier-update', {
      roundId: this.gameState.roundId,
      multiplier: parseFloat(this.gameState.multiplier.toFixed(2)),
      timeElapsed: this.gameState.timeElapsed
    });
  }

  // Handle game crash
  async crashGame() {
    if (!this.currentRound || this.gameState.status !== 'active') return;

    console.log(`Round ${this.roundNumber} crashed at ${this.gameState.multiplier.toFixed(2)}x`);

    // Stop multiplier updates
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.gameState.status = 'crashed';
    this.gameState.crashTime = new Date();

    // Update database
    this.currentRound.status = 'crashed';
    this.currentRound.crashTime = this.gameState.crashTime;
    await this.currentRound.save();

    // Process all pending bets as losses
    await this.processCrashedBets();

    // Calculate house profit
    this.currentRound.calculateHouseProfit();
    await this.currentRound.save();

    // Notify all clients
    this.io.to('game').emit('game-crash', {
      roundId: this.gameState.roundId,
      crashPoint: this.gameState.crashPoint,
      crashTime: this.gameState.crashTime,
      finalMultiplier: parseFloat(this.gameState.multiplier.toFixed(2))
    });

    // Schedule next round
    this.roundNumber++;
    this.scheduleNextRound();
  }

  // Process bets that crashed (lost)
  async processCrashedBets() {
    if (!this.currentRound) return;

    const pendingBets = this.currentRound.bets.filter(bet => bet.outcome === 'pending');
    
    for (const bet of pendingBets) {
      bet.outcome = 'crashed';
      await this.currentRound.save();

      // Update player statistics
      const player = await Player.findOne({ playerId: bet.playerId });
      if (player) {
        player.totalLosses += bet.usdAmount;
        await player.save();
      }
    }
  }

  // Place a bet
  async placeBet(playerId, betData) {
    try {
      const { usdAmount, currency } = betData;

      // Validate input
      if (!usdAmount || usdAmount <= 0) {
        throw new Error('Invalid bet amount');
      }

      if (!CryptoPriceService.isValidCurrency(currency)) {
        throw new Error('Invalid currency');
      }

      if (this.gameState.status !== 'waiting') {
        throw new Error('Betting is closed for this round');
      }

      // Get or create player
      let player = await Player.findOne({ playerId });
      if (!player) {
        player = new Player({ playerId });
        await player.save();
      }

      // Get current crypto prices
      const prices = await CryptoPriceService.fetchPrices();
      const cryptoAmount = CryptoPriceService.convertUsdToCrypto(usdAmount, currency);

      // Check if player has enough balance
      if (player.wallet[currency] < cryptoAmount) {
        throw new Error(`Insufficient ${currency.toUpperCase()} balance`);
      }

      // Generate transaction hash
      const transactionHash = crypto.randomBytes(16).toString('hex');

      // Deduct crypto from player wallet
      await player.updateBalance(currency, cryptoAmount, 'subtract');

      // Create transaction record
      const transaction = new Transaction({
        playerId,
        transactionType: 'bet',
        usdAmount,
        cryptoAmount,
        currency,
        priceAtTime: prices[currency],
        transactionHash,
        roundId: this.gameState.roundId
      });
      await transaction.save();

      // Add bet to current round
      const bet = {
        playerId,
        usdAmount,
        cryptoAmount,
        currency,
        priceAtTime: prices[currency],
        transactionHash,
        outcome: 'pending'
      };

      this.currentRound.bets.push(bet);
      await this.currentRound.save();

      // Update game state
      this.gameState.bets.push({
        playerId,
        usdAmount,
        currency,
        timestamp: new Date()
      });

      // Update player statistics
      player.totalBets += usdAmount;
      await player.save();

      // Notify all clients
      this.io.to('game').emit('bet-placed', {
        playerId,
        usdAmount,
        currency,
        timestamp: new Date()
      });

      return {
        success: true,
        transactionHash,
        cryptoAmount,
        currentBalance: player.wallet
      };

    } catch (error) {
      console.error('Error placing bet:', error);
      throw error;
    }
  }

  // Handle cashout
  async cashout(playerId) {
    try {
      if (this.gameState.status !== 'active') {
        throw new Error('Cannot cashout - game not active');
      }

      if (!this.currentRound) {
        throw new Error('No active round');
      }

      // Find player's bet in current round
      const bet = this.currentRound.bets.find(b => b.playerId === playerId && b.outcome === 'pending');
      if (!bet) {
        throw new Error('No active bet found for this player');
      }

      // Get current crypto prices
      const prices = await CryptoPriceService.fetchPrices();

      // Calculate cashout amounts
      const cashoutCryptoAmount = bet.cryptoAmount * this.gameState.multiplier;
      const cashoutUsdAmount = CryptoPriceService.convertCryptoToUsd(cashoutCryptoAmount, bet.currency);

      // Update bet
      bet.outcome = 'cashed_out';
      bet.cashoutMultiplier = parseFloat(this.gameState.multiplier.toFixed(2));
      bet.cashoutCryptoAmount = cashoutCryptoAmount;
      bet.cashoutUsdAmount = cashoutUsdAmount;

      // Get or create player
      let player = await Player.findOne({ playerId });
      if (!player) {
        player = new Player({ playerId });
      }

      // Add crypto to player wallet
      await player.updateBalance(bet.currency, cashoutCryptoAmount, 'add');

      // Create transaction record
      const transactionHash = crypto.randomBytes(16).toString('hex');
      const transaction = new Transaction({
        playerId,
        transactionType: 'cashout',
        usdAmount: cashoutUsdAmount,
        cryptoAmount: cashoutCryptoAmount,
        currency: bet.currency,
        priceAtTime: prices[bet.currency],
        transactionHash,
        roundId: this.gameState.roundId,
        multiplier: bet.cashoutMultiplier
      });
      await transaction.save();

      // Update player statistics
      player.totalWins += cashoutUsdAmount;
      await player.save();

      // Update game state
      this.gameState.cashouts.push({
        playerId,
        multiplier: bet.cashoutMultiplier,
        usdAmount: cashoutUsdAmount,
        cryptoAmount: cashoutCryptoAmount,
        currency: bet.currency,
        timestamp: new Date()
      });

      // Save round
      await this.currentRound.save();

      // Notify all clients
      this.io.to('game').emit('player-cashout', {
        playerId,
        multiplier: bet.cashoutMultiplier,
        usdAmount: cashoutUsdAmount,
        cryptoAmount: cashoutCryptoAmount,
        currency: bet.currency,
        timestamp: new Date()
      });

      return {
        success: true,
        multiplier: bet.cashoutMultiplier,
        usdAmount: cashoutUsdAmount,
        cryptoAmount: cashoutCryptoAmount,
        transactionHash,
        currentBalance: player.wallet
      };

    } catch (error) {
      console.error('Error processing cashout:', error);
      throw error;
    }
  }

  // Get current game state
  getCurrentGameState() {
    return { ...this.gameState };
  }

  // Get round history
  async getRoundHistory(limit = 10) {
    return await GameRound.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('roundId status crashPoint startTime crashTime totalBets totalCashouts houseProfit');
  }

  // Get player statistics
  async getPlayerStats(playerId) {
    const player = await Player.findOne({ playerId });
    if (!player) return null;

    const transactionSummary = await Transaction.getPlayerSummary(playerId);
    const prices = await CryptoPriceService.fetchPrices();

    return {
      playerId,
      wallet: player.wallet,
      usdEquivalent: CryptoPriceService.getWalletUsdEquivalent(player.wallet),
      statistics: {
        totalBets: player.totalBets,
        totalWins: player.totalWins,
        totalLosses: player.totalLosses,
        ...transactionSummary
      },
      currentPrices: prices
    };
  }
}

module.exports = GameManager; 