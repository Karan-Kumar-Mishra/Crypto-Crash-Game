const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true
  },
  usdAmount: {
    type: Number,
    required: true,
    min: 0
  },
  cryptoAmount: {
    type: Number,
    required: true,
    min: 0
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
  cashoutMultiplier: {
    type: Number,
    default: null
  },
  cashoutCryptoAmount: {
    type: Number,
    default: null
  },
  cashoutUsdAmount: {
    type: Number,
    default: null
  },
  outcome: {
    type: String,
    enum: ['pending', 'cashed_out', 'crashed'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const gameRoundSchema = new mongoose.Schema({
  roundId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'crashed', 'finished'],
    default: 'waiting'
  },
  startTime: {
    type: Date,
    required: true
  },
  crashTime: {
    type: Date,
    default: null
  },
  crashPoint: {
    type: Number,
    default: null
  },
  seed: {
    type: String,
    required: true
  },
  hash: {
    type: String,
    required: true
  },
  bets: [betSchema],
  totalBets: {
    type: Number,
    default: 0
  },
  totalCashouts: {
    type: Number,
    default: 0
  },
  houseProfit: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Method to calculate house profit
gameRoundSchema.methods.calculateHouseProfit = function() {
  let totalBetAmount = 0;
  let totalPayoutAmount = 0;

  this.bets.forEach(bet => {
    totalBetAmount += bet.usdAmount;
    if (bet.outcome === 'cashed_out' && bet.cashoutUsdAmount) {
      totalPayoutAmount += bet.cashoutUsdAmount;
    }
  });

  this.houseProfit = totalBetAmount - totalPayoutAmount;
  return this.houseProfit;
};

// Method to get round statistics
gameRoundSchema.methods.getStats = function() {
  const stats = {
    totalBets: this.bets.length,
    totalBetAmount: this.bets.reduce((sum, bet) => sum + bet.usdAmount, 0),
    totalCashouts: this.bets.filter(bet => bet.outcome === 'cashed_out').length,
    totalCashoutAmount: this.bets
      .filter(bet => bet.outcome === 'cashed_out')
      .reduce((sum, bet) => sum + (bet.cashoutUsdAmount || 0), 0),
    averageCashoutMultiplier: 0
  };

  const cashedOutBets = this.bets.filter(bet => bet.outcome === 'cashed_out');
  if (cashedOutBets.length > 0) {
    stats.averageCashoutMultiplier = cashedOutBets.reduce((sum, bet) => sum + bet.cashoutMultiplier, 0) / cashedOutBets.length;
  }

  return stats;
};

module.exports = mongoose.model('GameRound', gameRoundSchema); 