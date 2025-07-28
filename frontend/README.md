# Crypto Crash Game - Frontend

A modern, responsive React frontend for the Crypto Crash Game with real-time WebSocket integration, beautiful UI, and seamless user experience.

## Features

- **Real-time Game Display**: Live multiplier updates with smooth animations
- **WebSocket Integration**: Instant updates for game state, bets, and cashouts
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Beautiful gradient design with glassmorphism effects
- **Player Wallet**: Real-time balance display with crypto/USD conversion
- **Live Activity Feed**: Real-time bet and cashout notifications
- **Game History**: Recent rounds and crash points
- **Error Handling**: User-friendly error messages and notifications

## Technologies Used

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Socket.IO Client** for real-time communication
- **Axios** for HTTP requests
- **Lucide React** for beautiful icons
- **CSS3** with modern features (Grid, Flexbox, Animations)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running (see backend README)

## Installation

1. **Navigate to the frontend directory:**
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

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── App.tsx          # Main application component
├── App.css          # Global styles
├── main.tsx         # Application entry point
└── vite-env.d.ts    # Vite type definitions
```

## Features Overview

### Game Display
- **Real-time Multiplier**: Updates every 100ms during active games
- **Status Indicators**: Waiting, Active, and Crashed states
- **Recent Crashes**: Display of last 10 crash points
- **Color-coded Multipliers**: Visual feedback based on multiplier value

### Player Interface
- **Wallet Balance**: Real-time display of BTC, ETH, and USD balances
- **USD Equivalent**: Total wallet value in USD
- **Betting Interface**: Place bets in USD with crypto conversion
- **Cashout Button**: One-click cashout during active games

### Live Activity
- **Recent Bets**: Real-time feed of player bets
- **Recent Cashouts**: Live cashout notifications with amounts
- **Player Identification**: Clear display of player actions

### Game History
- **Round Information**: Recent game rounds with crash points
- **Statistics**: Bet and cashout counts per round
- **Visual Timeline**: Easy-to-scan history display

## API Integration

### WebSocket Events

#### Listening to Events
- `game-state` - Initial game state
- `round-start` - New round started
- `game-active` - Round became active
- `multiplier-update` - Real-time multiplier updates
- `bet-placed` - Player placed a bet
- `player-cashout` - Player cashed out
- `game-crash` - Game crashed
- `bet-result` - Result of bet placement
- `cashout-result` - Result of cashout attempt
- `error` - Error messages

#### Emitting Events
- `join-game` - Join the game room
- `place-bet` - Place a bet with amount and currency
- `cashout` - Cash out during active round

### REST API Calls
- Player balance and statistics
- Game history and recent crashes
- Crypto price information

## Styling

### Design System
- **Color Palette**: Modern gradients and vibrant colors
- **Typography**: Clean, readable fonts with proper hierarchy
- **Spacing**: Consistent spacing using CSS Grid and Flexbox
- **Animations**: Smooth transitions and micro-interactions

### Responsive Breakpoints
- **Desktop**: 1024px and above
- **Tablet**: 768px to 1023px
- **Mobile**: Below 768px

### Key CSS Features
- **Glassmorphism**: Translucent backgrounds with blur effects
- **CSS Grid**: Responsive layout system
- **CSS Animations**: Smooth transitions and keyframe animations
- **CSS Variables**: Consistent theming and easy customization

## State Management

### Local State
- Game state (multiplier, status, bets, cashouts)
- Player information and wallet
- UI state (errors, loading states)
- Connection status

### Real-time Updates
- WebSocket connection management
- Automatic reconnection handling
- Event-driven state updates

## Error Handling

### User Experience
- **Connection Status**: Visual indicator of WebSocket connection
- **Error Toasts**: Non-intrusive error notifications
- **Graceful Degradation**: Fallback behavior when services are unavailable
- **Input Validation**: Client-side validation with helpful messages

### Error Types
- **Network Errors**: Connection issues and API failures
- **Game Errors**: Invalid bets, insufficient balance
- **WebSocket Errors**: Connection drops and message failures

## Performance Optimizations

### React Optimizations
- **useEffect Dependencies**: Proper dependency arrays
- **Event Cleanup**: Proper WebSocket cleanup on unmount
- **State Updates**: Efficient state management
- **Component Structure**: Logical component separation

### CSS Optimizations
- **CSS Grid**: Efficient layout system
- **Transform Animations**: Hardware-accelerated animations
- **Backdrop Filter**: Modern blur effects
- **Responsive Images**: Optimized for different screen sizes

## Browser Support

### Modern Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features Used
- CSS Grid and Flexbox
- CSS Custom Properties
- Backdrop Filter
- Modern JavaScript (ES2020+)

## Deployment

### Build Process
```bash
npm run build
```

### Deployment Options
- **Vercel**: Automatic deployment from Git
- **Netlify**: Drag and drop deployment
- **GitHub Pages**: Static site hosting
- **AWS S3**: Cloud hosting

### Environment Variables
```env
VITE_API_URL=http://localhost:5000
```

## Development Tips

### Hot Reload
The development server supports hot reload for instant feedback during development.

### TypeScript
Full TypeScript support with proper type definitions for all components and API responses.

### ESLint
Configured with React and TypeScript rules for code quality.

### Debugging
- Browser DevTools for React components
- Network tab for API calls
- Console for WebSocket events

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

**WebSocket Connection Failed**
- Check if backend server is running
- Verify API_BASE_URL in App.tsx
- Check network connectivity

**Build Errors**
- Clear node_modules and reinstall
- Check TypeScript errors
- Verify all dependencies are installed

**Styling Issues**
- Check browser compatibility
- Verify CSS is loading properly
- Test on different screen sizes

## License

This project is for educational purposes. Please ensure compliance with local gambling regulations before production use.
