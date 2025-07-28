const express = require('express');
const router = express.Router();
const Player = require('../models/Player');
const Transaction = require('../models/Transaction');
const CryptoPriceService = require('../services/CryptoPriceService');

// Get player wallet balance
router.get('/balance/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    let player = await Player.findOne({ playerId });

    if (!player) {
      // Create new player with default balance
      player = new Player({ playerId });
      await player.save();
    }

    // Get current crypto prices
    const prices = await CryptoPriceService.fetchPrices();
    const usdEquivalent = CryptoPriceService.getWalletUsdEquivalent(player.wallet);

    res.json({
      success: true,
      playerId,
      wallet: player.wallet,
      usdEquivalent,
      currentPrices: prices,
      lastUpdated: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player statistics
router.get('/stats/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const player = await Player.findOne({ playerId });

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const transactionSummary = await Transaction.getPlayerSummary(playerId);
    const prices = await CryptoPriceService.fetchPrices();

    res.json({
      success: true,
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
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player transaction history
router.get('/transactions/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ playerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ playerId });

    res.json({
      success: true,
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current crypto prices
router.get('/prices', async (req, res) => {
  try {
    const prices = await CryptoPriceService.fetchPrices();
    
    res.json({
      success: true,
      prices,
      lastUpdated: new Date(),
      supportedCurrencies: ['btc', 'eth']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Convert USD to crypto
router.post('/convert', async (req, res) => {
  try {
    const { usdAmount, currency } = req.body;

    if (!usdAmount || usdAmount <= 0) {
      return res.status(400).json({ error: 'Invalid USD amount' });
    }

    if (!CryptoPriceService.isValidCurrency(currency)) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    const prices = await CryptoPriceService.fetchPrices();
    const cryptoAmount = CryptoPriceService.convertUsdToCrypto(usdAmount, currency);

    res.json({
      success: true,
      usdAmount,
      cryptoAmount,
      currency,
      priceAtTime: prices[currency],
      conversion: {
        from: 'USD',
        to: currency.toUpperCase(),
        rate: prices[currency]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction details
router.get('/transaction/:transactionHash', async (req, res) => {
  try {
    const { transactionHash } = req.params;
    const transaction = await Transaction.findOne({ transactionHash });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      success: true,
      transaction
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet summary for multiple players
router.post('/summary', async (req, res) => {
  try {
    const { playerIds } = req.body;

    if (!Array.isArray(playerIds)) {
      return res.status(400).json({ error: 'playerIds must be an array' });
    }

    const players = await Player.find({ playerId: { $in: playerIds } });
    const prices = await CryptoPriceService.fetchPrices();

    const summaries = players.map(player => ({
      playerId: player.playerId,
      wallet: player.wallet,
      usdEquivalent: CryptoPriceService.getWalletUsdEquivalent(player.wallet),
      statistics: {
        totalBets: player.totalBets,
        totalWins: player.totalWins,
        totalLosses: player.totalLosses
      }
    }));

    res.json({
      success: true,
      summaries,
      currentPrices: prices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard (top players by USD equivalent)
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const players = await Player.find()
      .sort({ 'wallet.usd': -1 })
      .limit(limit);

    const prices = await CryptoPriceService.fetchPrices();
    
    const leaderboard = players.map(player => ({
      playerId: player.playerId,
      wallet: player.wallet,
      usdEquivalent: CryptoPriceService.getWalletUsdEquivalent(player.wallet),
      statistics: {
        totalBets: player.totalBets,
        totalWins: player.totalWins,
        totalLosses: player.totalLosses
      }
    }));

    res.json({
      success: true,
      leaderboard,
      currentPrices: prices
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 