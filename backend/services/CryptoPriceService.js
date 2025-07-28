const axios = require('axios');
const crypto = require('crypto');

class CryptoPriceService {
  constructor() {
    this.apiUrl = 'https://api.coingecko.com/api/v3';
    this.cache = new Map();
    this.cacheTimeout = 10000; // 10 seconds
    this.lastFetch = 0;
    this.prices = {
      btc: 60000, // Default fallback prices
      eth: 3000
    };
  }

  // Generate a unique cache key
  generateCacheKey() {
    const now = Math.floor(Date.now() / this.cacheTimeout);
    return `prices_${now}`;
  }

  // Fetch current crypto prices from CoinGecko API
  async fetchPrices() {
    try {
      const cacheKey = this.generateCacheKey();
      
      // Check if we have cached prices
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Rate limiting: don't fetch more than once per 10 seconds
      const now = Date.now();
      if (now - this.lastFetch < this.cacheTimeout) {
        return this.prices;
      }

      console.log('Fetching new crypto prices from CoinGecko...');
      
      const response = await axios.get(`${this.apiUrl}/simple/price`, {
        params: {
          ids: 'bitcoin,ethereum',
          vs_currencies: 'usd'
        },
        timeout: 5000
      });

      const newPrices = {
        btc: response.data.bitcoin.usd,
        eth: response.data.ethereum.usd
      };

      // Update cache and last fetch time
      this.cache.set(cacheKey, newPrices);
      this.prices = newPrices;
      this.lastFetch = now;

      // Clean old cache entries
      this.cleanCache();

      console.log('Updated crypto prices:', newPrices);
      return newPrices;

    } catch (error) {
      console.error('Error fetching crypto prices:', error.message);
      
      // Return cached prices if available, otherwise fallback
      if (this.prices.btc && this.prices.eth) {
        console.log('Using cached prices due to API error');
        return this.prices;
      }
      
      // Return fallback prices
      console.log('Using fallback prices');
      return {
        btc: 60000,
        eth: 3000
      };
    }
  }

  // Clean old cache entries
  cleanCache() {
    const currentKey = this.generateCacheKey();
    for (const [key] of this.cache) {
      if (key !== currentKey) {
        this.cache.delete(key);
      }
    }
  }

  // Convert USD to crypto
  convertUsdToCrypto(usdAmount, currency) {
    const price = this.prices[currency];
    if (!price || price <= 0) {
      throw new Error(`Invalid price for ${currency}`);
    }
    return usdAmount / price;
  }

  // Convert crypto to USD
  convertCryptoToUsd(cryptoAmount, currency) {
    const price = this.prices[currency];
    if (!price || price <= 0) {
      throw new Error(`Invalid price for ${currency}`);
    }
    return cryptoAmount * price;
  }

  // Get current prices
  getCurrentPrices() {
    return { ...this.prices };
  }

  // Get price for specific currency
  getPrice(currency) {
    return this.prices[currency] || 0;
  }

  // Validate currency
  isValidCurrency(currency) {
    return ['btc', 'eth'].includes(currency);
  }

  // Get wallet USD equivalent
  getWalletUsdEquivalent(wallet) {
    const btcUsd = wallet.btc * this.prices.btc;
    const ethUsd = wallet.eth * this.prices.eth;
    return wallet.usd + btcUsd + ethUsd;
  }
}

module.exports = new CryptoPriceService(); 