const mongoose = require('mongoose');
const Player = require('../models/Player');
const GameRound = require('../models/GameRound');
const Transaction = require('../models/Transaction');
require('dotenv').config();

// Sample player data
const samplePlayers = [
  {
    playerId: 'player1',
    wallet: { btc: 0.002, eth: 0.02, usd: 200 },
    totalBets: 1500,
    totalWins: 1200,
    totalLosses: 300
  },
  {
    playerId: 'player2',
    wallet: { btc: 0.0015, eth: 0.015, usd: 150 },
    totalBets: 800,
    totalWins: 600,
    totalLosses: 200
  },
  {
    playerId: 'player3',
    wallet: { btc: 0.003, eth: 0.03, usd: 300 },
    totalBets: 2500,
    totalWins: 2200,
    totalLosses: 300
  },
  {
    playerId: 'player4',
    wallet: { btc: 0.0005, eth: 0.005, usd: 50 },
    totalBets: 300,
    totalWins: 250,
    totalLosses: 50
  },
  {
    playerId: 'player5',
    wallet: { btc: 0.004, eth: 0.04, usd: 400 },
    totalBets: 3000,
    totalWins: 2800,
    totalLosses: 200
  }
];

// Sample game rounds
const sampleRounds = [
  {
    roundId: 'round-1',
    status: 'crashed',
    startTime: new Date(Date.now() - 60000),
    crashTime: new Date(Date.now() - 45000),
    crashPoint: 2.5,
    seed: 'sample-seed-1',
    hash: 'sample-hash-1',
    bets: [
      {
        playerId: 'player1',
        usdAmount: 50,
        cryptoAmount: 0.000833,
        currency: 'btc',
        priceAtTime: 60000,
        outcome: 'cashed_out',
        cashoutMultiplier: 2.1,
        cashoutCryptoAmount: 0.001749,
        cashoutUsdAmount: 105,
        transactionHash: 'tx-hash-1-1'
      },
      {
        playerId: 'player2',
        usdAmount: 30,
        cryptoAmount: 0.01,
        currency: 'eth',
        priceAtTime: 3000,
        outcome: 'crashed',
        transactionHash: 'tx-hash-1-2'
      }
    ]
  },
  {
    roundId: 'round-2',
    status: 'crashed',
    startTime: new Date(Date.now() - 30000),
    crashTime: new Date(Date.now() - 15000),
    crashPoint: 1.8,
    seed: 'sample-seed-2',
    hash: 'sample-hash-2',
    bets: [
      {
        playerId: 'player3',
        usdAmount: 100,
        cryptoAmount: 0.001667,
        currency: 'btc',
        priceAtTime: 60000,
        outcome: 'crashed',
        transactionHash: 'tx-hash-2-1'
      },
      {
        playerId: 'player4',
        usdAmount: 25,
        cryptoAmount: 0.008333,
        currency: 'eth',
        priceAtTime: 3000,
        outcome: 'cashed_out',
        cashoutMultiplier: 1.5,
        cashoutCryptoAmount: 0.0125,
        cashoutUsdAmount: 37.5,
        transactionHash: 'tx-hash-2-2'
      }
    ]
  }
];

// Sample transactions
const sampleTransactions = [
  {
    playerId: 'player1',
    transactionType: 'bet',
    usdAmount: 50,
    cryptoAmount: 0.000833,
    currency: 'btc',
    priceAtTime: 60000,
    transactionHash: 'tx-hash-1-1',
    roundId: 'round-1'
  },
  {
    playerId: 'player1',
    transactionType: 'cashout',
    usdAmount: 105,
    cryptoAmount: 0.001749,
    currency: 'btc',
    priceAtTime: 60000,
    transactionHash: 'tx-cashout-1-1',
    roundId: 'round-1',
    multiplier: 2.1
  },
  {
    playerId: 'player2',
    transactionType: 'bet',
    usdAmount: 30,
    cryptoAmount: 0.01,
    currency: 'eth',
    priceAtTime: 3000,
    transactionHash: 'tx-hash-1-2',
    roundId: 'round-1'
  },
  {
    playerId: 'player3',
    transactionType: 'bet',
    usdAmount: 100,
    cryptoAmount: 0.001667,
    currency: 'btc',
    priceAtTime: 60000,
    transactionHash: 'tx-hash-2-1',
    roundId: 'round-2'
  },
  {
    playerId: 'player4',
    transactionType: 'bet',
    usdAmount: 25,
    cryptoAmount: 0.008333,
    currency: 'eth',
    priceAtTime: 3000,
    transactionHash: 'tx-hash-2-2',
    roundId: 'round-2'
  },
  {
    playerId: 'player4',
    transactionType: 'cashout',
    usdAmount: 37.5,
    cryptoAmount: 0.0125,
    currency: 'eth',
    priceAtTime: 3000,
    transactionHash: 'tx-cashout-2-2',
    roundId: 'round-2',
    multiplier: 1.5
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-crash';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Player.deleteMany({});
    await GameRound.deleteMany({});
    await Transaction.deleteMany({});

    // Insert sample players
    console.log('Inserting sample players...');
    await Player.insertMany(samplePlayers);
    console.log(`Inserted ${samplePlayers.length} players`);

    // Insert sample game rounds
    console.log('Inserting sample game rounds...');
    await GameRound.insertMany(sampleRounds);
    console.log(`Inserted ${sampleRounds.length} game rounds`);

    // Insert sample transactions
    console.log('Inserting sample transactions...');
    await Transaction.insertMany(sampleTransactions);
    console.log(`Inserted ${sampleTransactions.length} transactions`);

    console.log('Database seeding completed successfully!');
    console.log('\nSample data created:');
    console.log('- 5 players with different wallet balances');
    console.log('- 2 completed game rounds with various outcomes');
    console.log('- 6 sample transactions (bets and cashouts)');
    console.log('\nYou can now test the API with these sample players:');
    samplePlayers.forEach(player => {
      console.log(`- Player ID: ${player.playerId}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeder if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase; 