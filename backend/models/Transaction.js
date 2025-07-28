const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    index: true
  },
  transactionType: {
    type: String,
    enum: ['bet', 'cashout', 'deposit', 'withdrawal'],
    required: true
  },
  usdAmount: {
    type: Number,
    required: true
  },
  cryptoAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['btc', 'eth'],
    required: true
  },
  priceAtTime: {
    type: Number,
    required: true
  },
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  roundId: {
    type: String,
    default: null
  },
  multiplier: {
    type: Number,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ playerId: 1, createdAt: -1 });
transactionSchema.index({ roundId: 1, createdAt: -1 });
transactionSchema.index({ transactionType: 1, createdAt: -1 });

// Method to get transaction summary
transactionSchema.statics.getPlayerSummary = async function(playerId) {
  const summary = await this.aggregate([
    { $match: { playerId } },
    {
      $group: {
        _id: '$transactionType',
        count: { $sum: 1 },
        totalUsd: { $sum: '$usdAmount' },
        totalCrypto: { $sum: '$cryptoAmount' }
      }
    }
  ]);

  const result = {
    totalTransactions: 0,
    totalBets: 0,
    totalCashouts: 0,
    totalBetAmount: 0,
    totalCashoutAmount: 0
  };

  summary.forEach(item => {
    result.totalTransactions += item.count;
    if (item._id === 'bet') {
      result.totalBets = item.count;
      result.totalBetAmount = item.totalUsd;
    } else if (item._id === 'cashout') {
      result.totalCashouts = item.count;
      result.totalCashoutAmount = item.totalUsd;
    }
  });

  return result;
};

module.exports = mongoose.model('Transaction', transactionSchema); 