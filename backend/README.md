# Crypto Crash Game - Backend

A real-time multiplayer Crash game backend with cryptocurrency integration, WebSocket support, and provably fair algorithms.

## Features

- **Real-time Crash Game**: Multiplier increases exponentially until crash
- **Cryptocurrency Integration**: Real-time BTC/ETH price fetching from CoinGecko API
- **Provably Fair Algorithm**: Cryptographically secure crash point generation
- **WebSocket Support**: Real-time multiplayer updates and interactions
- **MongoDB Database**: Persistent storage for players, rounds, and transactions
- **RESTful API**: Complete API for game management and wallet operations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/crypto-crash
   NODE_ENV=development
   COINGECKO_API_URL=https://api.coingecko.com/api/v3
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system or use a cloud instance.

5. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Game Endpoints

#### GET `/api/game/state`
Get current game state information.

#### GET `/api/game/history?limit=10`
Get recent game rounds history.

#### GET `/api/game/round/:roundId`
Get specific round details.

#### GET `/api/game/verify/:roundId`
Verify round fairness using provably fair algorithm.

#### GET `/api/game/stats`
Get overall game statistics.

#### GET `/api/game/recent-crashes?limit=20`
Get recent crash points.

### Wallet Endpoints

#### GET `/api/wallet/balance/:playerId`
Get player wallet balance and USD equivalent.

#### GET `/api/wallet/stats/:playerId`
Get player statistics and transaction summary.

#### GET `/api/wallet/transactions/:playerId?page=1&limit=20`
Get player transaction history with pagination.

#### GET `/api/wallet/prices`
Get current cryptocurrency prices.

#### POST `/api/wallet/convert`
Convert USD to cryptocurrency.

**Request Body:**
```json
{
  "usdAmount": 100,
  "currency": "btc"
}
```

#### GET `/api/wallet/transaction/:transactionHash`
Get specific transaction details.

#### POST `/api/wallet/summary`
Get wallet summaries for multiple players.

**Request Body:**
```json
{
  "playerIds": ["player1", "player2", "player3"]
}
```

#### GET `/api/wallet/leaderboard?limit=10`
Get top players by USD equivalent.

## WebSocket Events

### Client to Server Events

#### `join-game`
Join the game room to receive real-time updates.

#### `place-bet`
Place a bet in the current round.

**Data:**
```json
{
  "usdAmount": 50,
  "currency": "btc"
}
```

#### `cashout`
Cash out during an active round.

### Server to Client Events

#### `game-state`
Current game state when joining.

#### `round-start`
New round started.

#### `game-active`
Round became active (betting closed, multiplier starts).

#### `multiplier-update`
Real-time multiplier updates (every 100ms).

#### `bet-placed`
Player placed a bet.

#### `player-cashout`
Player cashed out.

#### `game-crash`
Game crashed.

#### `bet-result`
Result of bet placement.

#### `cashout-result`
Result of cashout attempt.

#### `error`
Error message.

## Database Models

### Player
- `playerId`: Unique player identifier
- `wallet`: Object with btc, eth, usd balances
- `totalBets`, `totalWins`, `totalLosses`: Statistics
- `createdAt`, `lastActive`: Timestamps

### GameRound
- `roundId`: Unique round identifier
- `status`: waiting/active/crashed/finished
- `startTime`, `crashTime`: Timestamps
- `crashPoint`: Final crash multiplier
- `seed`, `hash`: Provably fair data
- `bets`: Array of player bets
- `houseProfit`: Calculated house profit

### Transaction
- `playerId`: Player identifier
- `transactionType`: bet/cashout/deposit/withdrawal
- `usdAmount`, `cryptoAmount`: Transaction amounts
- `currency`: btc/eth
- `priceAtTime`: Crypto price at transaction time
- `transactionHash`: Unique transaction identifier
- `roundId`: Associated game round
- `multiplier`: Cashout multiplier (if applicable)

## Provably Fair Algorithm

The game uses a cryptographically secure provably fair algorithm:

1. **Seed Generation**: Random 32-byte seed for each round
2. **Hash Calculation**: SHA256 hash of seed + round number
3. **Crash Point**: Derived from hash using house edge formula
4. **Verification**: Players can verify fairness using seed and hash

### House Edge
- 1% house edge ensures profitability
- Crash points range from 1.0x to 100x
- Algorithm is transparent and verifiable

## Cryptocurrency Integration

### Supported Currencies
- **Bitcoin (BTC)**
- **Ethereum (ETH)**

### Price Fetching
- Real-time prices from CoinGecko API
- 10-second caching to respect rate limits
- Fallback prices if API is unavailable
- Automatic USD conversion for all operations

### Conversion Logic
- USD → Crypto: `cryptoAmount = usdAmount / cryptoPrice`
- Crypto → USD: `usdAmount = cryptoAmount * cryptoPrice`
- All conversions use price at transaction time

## Game Mechanics

### Round Structure
1. **Waiting Phase** (5 seconds): Players can place bets
2. **Active Phase**: Multiplier increases exponentially
3. **Crash**: Game ends when multiplier reaches crash point

### Multiplier Calculation
```
multiplier = 1 + (timeElapsed * growthFactor)
```
- `growthFactor = 0.05`
- Updates every 100ms
- Exponential growth pattern

### Betting Rules
- Minimum bet: $1 USD
- Maximum bet: Limited by player balance
- Betting closes when round becomes active
- Players can cash out anytime during active phase

### Cashout Rules
- Only available during active phase
- Payout = betAmount * currentMultiplier
- Automatic conversion back to USD for display
- Crypto added to player wallet

## Error Handling

The API includes comprehensive error handling:

- **Input Validation**: All inputs are validated
- **Balance Checks**: Insufficient balance errors
- **Game State Validation**: Appropriate game phase checks
- **API Rate Limiting**: Graceful handling of crypto API limits
- **Database Errors**: Proper error responses
- **WebSocket Errors**: Connection and message validation

## Security Features

- **Input Sanitization**: All user inputs are validated
- **Rate Limiting**: Crypto API calls are rate-limited
- **Transaction Atomicity**: Database transactions ensure consistency
- **Provably Fair**: Transparent and verifiable game outcomes
- **Error Logging**: Comprehensive error tracking

## Testing

### Sample Data
Run the seeder to create sample data:
```bash
npm run seed
```

This creates:
- 5 sample players with different balances
- 2 completed game rounds
- 6 sample transactions

### API Testing
Use the provided endpoints with tools like Postman or curl:

```bash
# Get player balance
curl http://localhost:5000/api/wallet/balance/player1

# Get game history
curl http://localhost:5000/api/game/history

# Get crypto prices
curl http://localhost:5000/api/wallet/prices
```

### WebSocket Testing
Use a WebSocket client to test real-time features:

```javascript
const socket = io('http://localhost:5000');

socket.emit('join-game');
socket.on('multiplier-update', (data) => {
  console.log('Multiplier:', data.multiplier);
});
```

## Deployment

### Environment Variables
Set these for production:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production
```

### MongoDB Atlas
For cloud deployment, use MongoDB Atlas:
1. Create a cluster
2. Get connection string
3. Update MONGODB_URI in environment variables

### Render Deployment
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## Performance Considerations

- **Caching**: Crypto prices cached for 10 seconds
- **Database Indexing**: Optimized queries with proper indexes
- **WebSocket Efficiency**: Minimal data transfer
- **Connection Pooling**: MongoDB connection optimization
- **Error Recovery**: Graceful handling of API failures

## Monitoring

### Logs
- Game events logged to console
- Error tracking and reporting
- Performance metrics

### Health Check
```bash
curl http://localhost:5000/health
```

## Support

For issues or questions:
1. Check the logs for error details
2. Verify MongoDB connection
3. Test API endpoints individually
4. Check WebSocket connection status

## License

This project is for educational purposes. Please ensure compliance with local gambling regulations before production use. 