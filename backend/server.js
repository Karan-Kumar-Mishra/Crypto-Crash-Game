const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes and game logic
const gameRoutes = require('./routes/game');
const walletRoutes = require('./routes/wallet');
const GameManager = require('./game/GameManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-crash';
mongoose.connect(MONGODB_URI,{
    family: 4, // Force IPv4
    authSource: "admin" 
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/game', gameRoutes);
app.use('/api/wallet', walletRoutes);

// Initialize game manager
const gameManager = new GameManager(io);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join game room
  socket.on('join-game', () => {
    socket.join('game');
    socket.emit('game-state', gameManager.getCurrentGameState());
  });
  
  // Handle bet placement
  socket.on('place-bet', async (data) => {
    try {
      const result = await gameManager.placeBet(socket.id, data);
      socket.emit('bet-result', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle cashout
  socket.on('cashout', async () => {
    try {
      const result = await gameManager.cashout(socket.id);
      socket.emit('cashout-result', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready`);
  
  // Start the game loop
  gameManager.startGameLoop();
}); 