const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  wallet: {
    btc: {
      type: Number,
      default: 0.001, // Starting with 0.001 BTC
      min: 0
    },
    eth: {
      type: Number,
      default: 0.01, // Starting with 0.01 ETH
      min: 0
    },
    usd: {
      type: Number,
      default: 100, // Starting with $100 USD
      min: 0
    }
  },
  totalBets: {
    type: Number,
    default: 0
  },
  totalWins: {
    type: Number,
    default: 0
  },
  totalLosses: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Method to update wallet balance
playerSchema.methods.updateBalance = function(currency, amount, operation = 'add') {
  if (operation === 'add') {
    this.wallet[currency] += amount;
  } else if (operation === 'subtract') {
    this.wallet[currency] = Math.max(0, this.wallet[currency] - amount);
  }
  this.lastActive = new Date();
  return this.save();
};

// Method to get USD equivalent of crypto balance
playerSchema.methods.getUsdEquivalent = function(cryptoPrices) {
  const btcUsd = this.wallet.btc * (cryptoPrices.btc || 0);
  const ethUsd = this.wallet.eth * (cryptoPrices.eth || 0);
  return this.wallet.usd + btcUsd + ethUsd;
};

module.exports = mongoose.model('Player', playerSchema); 