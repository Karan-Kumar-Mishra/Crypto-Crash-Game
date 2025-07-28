# Crypto Crash Game

A complete real-time multiplayer Crash game with cryptocurrency integration, WebSocket support, and provably fair algorithms. Built with Node.js/Express backend and React frontend.

## 🎮 Game Overview

Crypto Crash is an exciting multiplayer game where players bet in USD (converted to cryptocurrency) and watch a multiplier increase exponentially. Players must cash out before the game "crashes" to win. The longer they wait, the higher the potential payout, but also the higher the risk of losing their bet.

### Key Features

- **Real-time Multiplayer**: Live WebSocket updates for all game events
- **Cryptocurrency Integration**: Real-time BTC/ETH price fetching from CoinGecko API
- **Provably Fair**: Cryptographically secure crash point generation with transparency
- **Modern UI**: Beautiful, responsive frontend with smooth animations
- **Wallet System**: Simulated cryptocurrency wallet with real-time balance tracking
- **Game History**: Complete round history and statistics
- **Mobile Responsive**: Works perfectly on all devices

## 🏗️ Architecture

```
Crypto Crash Game
├── backend/                 # Node.js/Express API server
│   ├── models/             # MongoDB schemas
│   ├── routes/             # REST API endpoints
│   ├── game/               # Game logic and WebSocket handling
│   ├── services/           # External API services
│   ├── utils/              # Utility functions
│   └── scripts/            # Database seeding
└── frontend/               # React TypeScript frontend
    ├── src/                # Source code
    ├── public/             # Static assets
    └── dist/               # Build output
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/crypto-crash
   NODE_ENV=development
   COINGECKO_API_URL=https://api.coingecko.com/api/v3
   ```

4. **Start MongoDB:**
   Make sure MongoDB is running on your system.

5. **Seed the database (optional):**
   ```bash
   npm run seed
   ```

6. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🎯 How to Play

1. **Join the Game**: Enter a player ID to join
2. **Place a Bet**: Choose USD amount and cryptocurrency (BTC/ETH)
3. **Watch the Multiplier**: Real-time multiplier increases during active phase
4. **Cash Out**: Click "Cash Out" before the game crashes to win
5. **Collect Winnings**: Winnings are added to your wallet in cryptocurrency

### Game Rules

- **Betting Phase**: 5 seconds to place bets
- **Active Phase**: Multiplier increases exponentially
- **Crash Point**: Randomly determined using provably fair algorithm
- **House Edge**: 1% to ensure profitability
- **Multiplier Range**: 1.0x to 100x

## 🔧 API Documentation

### REST Endpoints

#### Game Endpoints
- `GET /api/game/state` - Get current game state
- `GET /api/game/history` - Get round history
- `GET /api/game/stats` - Get game statistics
- `GET /api/game/verify/:roundId` - Verify round fairness

#### Wallet Endpoints
- `GET /api/wallet/balance/:playerId` - Get player balance
- `GET /api/wallet/stats/:playerId` - Get player statistics
- `GET /api/wallet/prices` - Get current crypto prices
- `POST /api/wallet/convert` - Convert USD to crypto

### WebSocket Events

#### Client to Server
- `join-game` - Join game room
- `place-bet` - Place a bet
- `cashout` - Cash out during active round

#### Server to Client
- `game-state` - Current game state
- `multiplier-update` - Real-time multiplier updates
- `bet-placed` - Player placed a bet
- `player-cashout` - Player cashed out
- `game-crash` - Game crashed

## 🎨 Frontend Features

### Real-time Game Display
- Live multiplier updates every 100ms
- Color-coded multiplier values
- Status indicators (Waiting, Active, Crashed)
- Recent crash points display

### Player Interface
- Real-time wallet balance
- USD equivalent calculations
- Betting interface with currency selection
- One-click cashout during active games

### Live Activity Feed
- Real-time bet notifications
- Cashout announcements with amounts
- Player identification

### Game History
- Recent rounds with crash points
- Statistics and outcomes
- Visual timeline

## 🔐 Security Features

### Provably Fair Algorithm
- Cryptographically secure random number generation
- Transparent seed and hash system
- Verifiable crash points
- 1% house edge for sustainability

### Input Validation
- All user inputs validated
- Balance checks before transactions
- Game state validation
- Rate limiting on API calls

### Error Handling
- Comprehensive error responses
- Graceful degradation
- User-friendly error messages
- Logging and monitoring

## 📊 Database Schema

### Player Model
```javascript
{
  playerId: String,
  wallet: {
    btc: Number,
    eth: Number,
    usd: Number
  },
  totalBets: Number,
  totalWins: Number,
  totalLosses: Number
}
```

### GameRound Model
```javascript
{
  roundId: String,
  status: String,
  startTime: Date,
  crashTime: Date,
  crashPoint: Number,
  seed: String,
  hash: String,
  bets: Array,
  houseProfit: Number
}
```

### Transaction Model
```javascript
{
  playerId: String,
  transactionType: String,
  usdAmount: Number,
  cryptoAmount: Number,
  currency: String,
  priceAtTime: Number,
  transactionHash: String
}
```

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Frontend (Vercel)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Deploy automatically

### Environment Variables
```env
# Backend
PORT=5000
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=production

# Frontend
VITE_API_URL=your_backend_url
```

## 🧪 Testing

### API Testing
Import the provided Postman collection:
```
backend/Crypto_Crash_API.postman_collection.json
```

### Sample Data
Run the seeder to create test data:
```bash
cd backend
npm run seed
```

This creates 5 sample players with different balances and 2 completed game rounds.

### Manual Testing
1. Start both backend and frontend
2. Open multiple browser tabs
3. Join with different player IDs
4. Place bets and test cashouts
5. Verify real-time updates

## 📈 Performance

### Backend Optimizations
- Crypto price caching (10 seconds)
- Database indexing
- Efficient WebSocket broadcasting
- Connection pooling

### Frontend Optimizations
- React state management
- CSS Grid for layouts
- Hardware-accelerated animations
- Responsive design

## 🔍 Monitoring

### Health Check
```bash
curl http://localhost:5000/health
```

### Logs
- Game events logged to console
- Error tracking and reporting
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is for educational purposes. Please ensure compliance with local gambling regulations before production use.

## 🆘 Support

### Common Issues

**Backend won't start**
- Check MongoDB connection
- Verify environment variables
- Check port availability

**Frontend can't connect**
- Verify backend is running
- Check API_BASE_URL
- Check CORS settings

**WebSocket issues**
- Check network connectivity
- Verify Socket.IO configuration
- Check browser console for errors

### Getting Help
1. Check the logs for error details
2. Verify all prerequisites are met
3. Test API endpoints individually
4. Check WebSocket connection status

## 🎉 Acknowledgments

- CoinGecko API for cryptocurrency prices
- Socket.IO for real-time communication
- MongoDB for data persistence
- React and Vite for frontend development

---

**Happy Gaming! 🎮💰** 