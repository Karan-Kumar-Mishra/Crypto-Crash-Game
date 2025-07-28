import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { TrendingUp, DollarSign, Bitcoin, Zap, Users, Trophy, Clock, AlertTriangle } from 'lucide-react';
import './App.css';

interface GameState {
  status: 'waiting' | 'active' | 'crashed';
  roundId: string | null;
  startTime: Date | null;
  crashTime: Date | null;
  crashPoint: number | null;
  multiplier: number;
  timeElapsed: number;
  bets: any[];
  cashouts: any[];
}

interface Player {
  playerId: string;
  wallet: {
    btc: number;
    eth: number;
    usd: number;
  };
  usdEquivalent: number;
  currentPrices: {
    btc: number;
    eth: number;
  };
}

interface Bet {
  playerId: string;
  usdAmount: number;
  currency: string;
  timestamp: Date;
}

interface Cashout {
  playerId: string;
  multiplier: number;
  usdAmount: number;
  cryptoAmount: number;
  currency: string;
  timestamp: Date;
}

const API_BASE_URL = 'http://localhost:5000';

// Generate a random player ID
const generatePlayerId = () => {
  return 'player_' + Math.random().toString(36).substr(2, 9);
};

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    status: 'waiting',
    roundId: null,
    startTime: null,
    crashTime: null,
    crashPoint: null,
    multiplier: 1.0,
    timeElapsed: 0,
    bets: [],
    cashouts: []
  });
  const [player, setPlayer] = useState<Player | null>(null);
  const [playerId] = useState<string>(generatePlayerId());
  const [betAmount, setBetAmount] = useState<number>(10);
  const [selectedCurrency, setSelectedCurrency] = useState<'btc' | 'eth'>('btc');
  const [recentCrashes, setRecentCrashes] = useState<number[]>([]);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize WebSocket connection
  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('game-state', (state: GameState) => {
      setGameState(state);
    });

    newSocket.on('round-start', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'waiting',
        roundId: data.roundId,
        startTime: new Date(data.startTime),
        crashPoint: data.crashPoint,
        multiplier: 1.0,
        timeElapsed: 0,
        bets: [],
        cashouts: []
      }));
    });

    newSocket.on('game-active', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'active'
      }));
    });

    newSocket.on('multiplier-update', (data) => {
      setGameState(prev => ({
        ...prev,
        multiplier: data.multiplier,
        timeElapsed: data.timeElapsed
      }));
    });

    newSocket.on('bet-placed', (bet: Bet) => {
      setGameState(prev => ({
        ...prev,
        bets: [...prev.bets, bet]
      }));
    });

    newSocket.on('player-cashout', (cashout: Cashout) => {
      setGameState(prev => ({
        ...prev,
        cashouts: [...prev.cashouts, cashout]
      }));
    });

    newSocket.on('game-crash', (data) => {
      setGameState(prev => ({
        ...prev,
        status: 'crashed',
        crashTime: new Date(data.crashTime),
        multiplier: data.finalMultiplier
      }));
      
      // Add crash point to recent crashes
      setRecentCrashes(prev => [data.crashPoint, ...prev.slice(0, 9)]);
    });

    newSocket.on('bet-result', (result) => {
      if (result.success) {
        fetchPlayerBalance();
      } else {
        setError(result.message || 'Bet failed');
      }
    });

    newSocket.on('cashout-result', (result) => {
      if (result.success) {
        fetchPlayerBalance();
      } else {
        setError(result.message || 'Cashout failed');
      }
    });

    newSocket.on('error', (data) => {
      setError(data.message);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Join game when connected
  useEffect(() => {
    if (socket && isConnected) {
      socket.emit('join-game');
    }
  }, [socket, isConnected]);

  // Fetch initial data and player balance
  useEffect(() => {
    fetchRecentCrashes();
    fetchGameHistory();
    fetchPlayerBalance();
  }, []);

  const fetchPlayerBalance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/balance/${playerId}`);
      setPlayer(response.data);
    } catch (error) {
      console.error('Error fetching player balance:', error);
    }
  };

  const fetchRecentCrashes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/game/recent-crashes?limit=10`);
      setRecentCrashes(response.data.crashes.map((crash: any) => crash.crashPoint));
    } catch (error) {
      console.error('Error fetching recent crashes:', error);
    }
  };

  const fetchGameHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/game/history?limit=5`);
      setGameHistory(response.data.rounds);
    } catch (error) {
      console.error('Error fetching game history:', error);
    }
  };

  const handlePlaceBet = () => {
    if (!socket || betAmount <= 0) {
      setError('Invalid bet parameters');
      return;
    }

    socket.emit('place-bet', {
      usdAmount: betAmount,
      currency: selectedCurrency
    });
  };

  const handleCashout = () => {
    if (!socket) {
      setError('Cannot cashout');
      return;
    }

    socket.emit('cashout');
  };

  const formatMultiplier = (multiplier: number) => {
    return multiplier.toFixed(2) + 'x';
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'btc') {
      return `${amount.toFixed(8)} BTC`;
    } else if (currency === 'eth') {
      return `${amount.toFixed(6)} ETH`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 10) return '#ff4757';
    if (multiplier >= 5) return '#ffa502';
    if (multiplier >= 2) return '#2ed573';
    return '#3742fa';
  };

  return (
    <div className="app">
      <header className="header ">
        <div className="header-content">
          <h1 className="title">
            <Bitcoin className="title-icon" />
            Crypto Crash Game
          </h1>
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </header>

      <main className="main">
        <div className="game-container">
          {/* Game Display */}
          <div className="game-display">
            <div className="multiplier-display">
              <div 
                className="multiplier-value"
                style={{ color: getMultiplierColor(gameState.multiplier) }}
              >
                {formatMultiplier(gameState.multiplier)}
              </div>
              <div className="game-status">
                {gameState.status === 'waiting' && (
                  <div className="status waiting">
                    <Clock size={20} />
                    Waiting for bets...
                  </div>
                )}
                {gameState.status === 'active' && (
                  <div className="status active">
                    <TrendingUp size={20} />
                    Game Active - Cash out now!
                  </div>
                )}
                {gameState.status === 'crashed' && (
                  <div className="status crashed">
                    <AlertTriangle size={20} />
                    Crashed at {formatMultiplier(gameState.crashPoint || 0)}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Crashes */}
            <div className="recent-crashes">
              <h3>Recent Crashes</h3>
              <div className="crash-list">
                {recentCrashes.map((crash, index) => (
                  <div 
                    key={index} 
                    className="crash-item"
                    style={{ color: getMultiplierColor(crash) }}
                  >
                    {crash.toFixed(2)}x
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Player Section */}
          <div className="player-section">
            <div className="player-info">
              <h2>Welcome! 🎮</h2>
              
              {/* Wallet Balance */}
              <div className="wallet-balance">
                <h3>Your Wallet</h3>
                <div className="balance-grid">
                  <div className="balance-item">
                    <Bitcoin size={16} />
                    <span>{player ? formatCurrency(player.wallet.btc, 'btc') : '0.001 BTC'}</span>
                  </div>
                  <div className="balance-item">
                    <Zap size={16} />
                    <span>{player ? formatCurrency(player.wallet.eth, 'eth') : '0.01 ETH'}</span>
                  </div>
                  <div className="balance-item">
                    <DollarSign size={16} />
                    <span>{player ? formatCurrency(player.wallet.usd, 'usd') : '$100.00'}</span>
                  </div>
                </div>
                <div className="total-value">
                  Total: ${player ? player.usdEquivalent.toFixed(2) : '100.00'}
                </div>
              </div>

              {/* Betting Section */}
              {gameState.status === 'waiting' && (
                <div className="betting-section">
                  <h3>Place Your Bet</h3>
                  <div className="bet-form">
                    <div className="input-group">
                      <input
                        type="number"
                        placeholder="Bet Amount (USD)"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        className="input"
                        min="1"
                      />
                    </div>
                    <div className="currency-selector">
                      <button
                        className={`currency-btn ${selectedCurrency === 'btc' ? 'active' : ''}`}
                        onClick={() => setSelectedCurrency('btc')}
                      >
                        <Bitcoin size={16} />
                        BTC
                      </button>
                      <button
                        className={`currency-btn ${selectedCurrency === 'eth' ? 'active' : ''}`}
                        onClick={() => setSelectedCurrency('eth')}
                      >
                        <Zap size={16} />
                        ETH
                      </button>
                    </div>
                    <button onClick={handlePlaceBet} className="btn btn-primary">
                      Place Bet
                    </button>
                  </div>
                </div>
              )}

              {/* Cashout Section */}
              {gameState.status === 'active' && (
                <div className="cashout-section">
                  <h3>Cash Out</h3>
                  <button onClick={handleCashout} className="btn btn-success">
                    Cash Out at {formatMultiplier(gameState.multiplier)}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live Activity */}
          <div className="live-activity">
            <h3>Live Activity</h3>
            
            {/* Recent Bets */}
            <div className="activity-section">
              <h4>Recent Bets</h4>
              <div className="activity-list">
                {gameState.bets.slice(-5).map((bet, index) => (
                  <div key={index} className="activity-item bet">
                    <Users size={14} />
                    <span>{bet.playerId}</span>
                    <span>bet ${bet.usdAmount}</span>
                    <span className="currency">{bet.currency.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Cashouts */}
            <div className="activity-section">
              <h4>Recent Cashouts</h4>
              <div className="activity-list">
                {gameState.cashouts.slice(-5).map((cashout, index) => (
                  <div key={index} className="activity-item cashout">
                    <Trophy size={14} />
                    <span>{cashout.playerId}</span>
                    <span>cashed out at {formatMultiplier(cashout.multiplier)}</span>
                    <span className="amount">+${cashout.usdAmount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="game-history">
          <h3>Game History</h3>
          <div className="history-list">
            {gameHistory.map((round) => (
              <div key={round.roundId} className="history-item">
                <div className="round-id">{round.roundId}</div>
                <div 
                  className="crash-point"
                  style={{ color: getMultiplierColor(round.crashPoint) }}
                >
                  {formatMultiplier(round.crashPoint)}
                </div>
                <div className="round-stats">
                  <span>{round.totalBets} bets</span>
                  <span>{round.totalCashouts} cashouts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Error Display */}
      {error && (
        <div className="error-toast">
          <AlertTriangle size={16} />
          {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}
    </div>
  );
}

export default App;
