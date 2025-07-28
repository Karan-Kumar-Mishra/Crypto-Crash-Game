const express = require('express');
const router = express.Router();
const GameRound = require('../models/GameRound');
const ProvablyFair = require('../utils/ProvablyFair');

// Get current game state
router.get('/state', (req, res) => {
  try {
    // This will be handled by WebSocket, but provide a REST endpoint for compatibility
    res.json({
      message: 'Game state is managed via WebSocket. Connect to /socket.io for real-time updates.',
      endpoints: {
        history: '/api/game/history',
        verify: '/api/game/verify/:roundId'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get round history
router.get('/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const rounds = await GameRound.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('roundId status crashPoint startTime crashTime totalBets totalCashouts houseProfit');

    res.json({
      success: true,
      rounds,
      total: rounds.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific round details
router.get('/round/:roundId', async (req, res) => {
  try {
    const { roundId } = req.params;
    const round = await GameRound.findOne({ roundId });

    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }

    res.json({
      success: true,
      round: {
        roundId: round.roundId,
        status: round.status,
        startTime: round.startTime,
        crashTime: round.crashTime,
        crashPoint: round.crashPoint,
        seed: round.seed,
        hash: round.hash,
        stats: round.getStats(),
        houseProfit: round.houseProfit
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify round fairness
router.get('/verify/:roundId', async (req, res) => {
  try {
    const { roundId } = req.params;
    const round = await GameRound.findOne({ roundId });

    if (!round) {
      return res.status(404).json({ error: 'Round not found' });
    }

    const roundNumber = parseInt(roundId.split('-')[1]);
    const verification = ProvablyFair.verifyCrashPoint(
      round.seed,
      roundNumber,
      round.crashPoint
    );

    res.json({
      success: true,
      roundId,
      verification,
      algorithm: 'SHA256',
      houseEdge: ProvablyFair.getHouseEdge(),
      maxCrash: 100,
      minCrash: 1.0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get round statistics
router.get('/stats', async (req, res) => {
  try {
    const totalRounds = await GameRound.countDocuments();
    const completedRounds = await GameRound.countDocuments({ status: 'crashed' });
    const totalBets = await GameRound.aggregate([
      { $unwind: '$bets' },
      { $group: { _id: null, total: { $sum: '$bets.usdAmount' } } }
    ]);
    const totalCashouts = await GameRound.aggregate([
      { $unwind: '$bets' },
      { $match: { 'bets.outcome': 'cashed_out' } },
      { $group: { _id: null, total: { $sum: '$bets.cashoutUsdAmount' } } }
    ]);

    const averageCrashPoint = await GameRound.aggregate([
      { $match: { status: 'crashed' } },
      { $group: { _id: null, average: { $avg: '$crashPoint' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalRounds,
        completedRounds,
        totalBets: totalBets[0]?.total || 0,
        totalCashouts: totalCashouts[0]?.total || 0,
        averageCrashPoint: averageCrashPoint[0]?.average || 0,
        houseEdge: ProvablyFair.getHouseEdge()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent crash points
router.get('/recent-crashes', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const crashes = await GameRound.find({ status: 'crashed' })
      .sort({ crashTime: -1 })
      .limit(limit)
      .select('roundId crashPoint crashTime');

    res.json({
      success: true,
      crashes: crashes.map(crash => ({
        roundId: crash.roundId,
        crashPoint: crash.crashPoint,
        crashTime: crash.crashTime
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 