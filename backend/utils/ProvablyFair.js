const crypto = require('crypto');

class ProvablyFair {
  constructor() {
    this.maxCrash = 100; // Maximum crash point (100x)
    this.minCrash = 1.0; // Minimum crash point (1x)
  }

  // Generate a cryptographically secure seed
  generateSeed() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate a hash from seed and round number
  generateHash(seed, roundNumber) {
    const data = `${seed}-${roundNumber}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Convert hash to crash point using provably fair algorithm
  hashToCrashPoint(hash) {
    // Use first 8 bytes of hash for crash point calculation
    const hashBytes = Buffer.from(hash.substring(0, 16), 'hex');
    const randomValue = hashBytes.readUInt32BE(0) / Math.pow(2, 32);
    
    // Apply house edge and calculate crash point
    // This ensures the house has a slight edge while maintaining fairness
    const houseEdge = 0.01; // 1% house edge
    const crashPoint = this.minCrash + (this.maxCrash - this.minCrash) * Math.pow(1 - randomValue, 1 / (1 - houseEdge));
    
    return Math.max(this.minCrash, Math.min(this.maxCrash, crashPoint));
  }

  // Generate crash point for a round
  generateCrashPoint(roundNumber) {
    const seed = this.generateSeed();
    const hash = this.generateHash(seed, roundNumber);
    const crashPoint = this.hashToCrashPoint(hash);
    
    return {
      seed,
      hash,
      crashPoint: parseFloat(crashPoint.toFixed(2)),
      roundNumber
    };
  }

  // Verify a crash point (for transparency)
  verifyCrashPoint(seed, roundNumber, expectedCrashPoint) {
    const hash = this.generateHash(seed, roundNumber);
    const calculatedCrashPoint = this.hashToCrashPoint(hash);
    
    return {
      isValid: Math.abs(calculatedCrashPoint - expectedCrashPoint) < 0.01,
      calculatedCrashPoint: parseFloat(calculatedCrashPoint.toFixed(2)),
      hash,
      seed,
      roundNumber
    };
  }

  // Get house edge percentage
  getHouseEdge() {
    return 0.01; // 1%
  }

  // Calculate expected value for a given multiplier
  calculateExpectedValue(multiplier) {
    const houseEdge = this.getHouseEdge();
    return (1 - houseEdge) / multiplier;
  }

  // Generate verification data for transparency
  generateVerificationData(roundNumber) {
    const result = this.generateCrashPoint(roundNumber);
    return {
      ...result,
      verificationUrl: `/api/game/verify/${roundNumber}`,
      algorithm: 'SHA256',
      houseEdge: this.getHouseEdge(),
      maxCrash: this.maxCrash,
      minCrash: this.minCrash
    };
  }
}

module.exports = new ProvablyFair(); 