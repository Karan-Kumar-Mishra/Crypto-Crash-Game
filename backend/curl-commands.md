# cURL Commands for Testing Crypto Crash Game API

## Base URL
```bash
BASE_URL="http://localhost:5000"
```

## Health Check
```bash
curl -X GET "$BASE_URL/health"
```

## Game Endpoints

### Get Game State
```bash
curl -X GET "$BASE_URL/api/game/state"
```

### Get Game History
```bash
curl -X GET "$BASE_URL/api/game/history?limit=10"
```

### Get Round Details
```bash
curl -X GET "$BASE_URL/api/game/round/round-1"
```

### Verify Round Fairness
```bash
curl -X GET "$BASE_URL/api/game/verify/round-1"
```

### Get Game Statistics
```bash
curl -X GET "$BASE_URL/api/game/stats"
```

### Get Recent Crashes
```bash
curl -X GET "$BASE_URL/api/game/recent-crashes?limit=20"
```

## Wallet Endpoints

### Get Player Balance
```bash
curl -X GET "$BASE_URL/api/wallet/balance/player1"
```

### Get Player Statistics
```bash
curl -X GET "$BASE_URL/api/wallet/stats/player1"
```

### Get Player Transactions
```bash
curl -X GET "$BASE_URL/api/wallet/transactions/player1?page=1&limit=20"
```

### Get Crypto Prices
```bash
curl -X GET "$BASE_URL/api/wallet/prices"
```

### Convert USD to Crypto
```bash
curl -X POST "$BASE_URL/api/wallet/convert" \
  -H "Content-Type: application/json" \
  -d '{
    "usdAmount": 100,
    "currency": "btc"
  }'
```

### Get Transaction Details
```bash
curl -X GET "$BASE_URL/api/wallet/transaction/tx-hash-1-1"
```

### Get Multiple Player Summaries
```bash
curl -X POST "$BASE_URL/api/wallet/summary" \
  -H "Content-Type: application/json" \
  -d '{
    "playerIds": ["player1", "player2", "player3"]
  }'
```

### Get Leaderboard
```bash
curl -X GET "$BASE_URL/api/wallet/leaderboard?limit=10"
```

## Sample Player Testing

### Player 1
```bash
curl -X GET "$BASE_URL/api/wallet/balance/player1"
```

### Player 2
```bash
curl -X GET "$BASE_URL/api/wallet/balance/player2"
```

### Player 3
```bash
curl -X GET "$BASE_URL/api/wallet/balance/player3"
```

### Player 4
```bash
curl -X GET "$BASE_URL/api/wallet/balance/player4"
```

### Player 5
```bash
curl -X GET "$BASE_URL/api/wallet/balance/player5"
```

## Testing Scripts

### Test All Endpoints
```bash
#!/bin/bash
BASE_URL="http://localhost:5000"

echo "Testing Crypto Crash Game API..."
echo "=================================="

echo "1. Health Check"
curl -s "$BASE_URL/health" | jq '.'

echo -e "\n2. Game State"
curl -s "$BASE_URL/api/game/state" | jq '.'

echo -e "\n3. Game History"
curl -s "$BASE_URL/api/game/history?limit=5" | jq '.'

echo -e "\n4. Crypto Prices"
curl -s "$BASE_URL/api/wallet/prices" | jq '.'

echo -e "\n5. Player 1 Balance"
curl -s "$BASE_URL/api/wallet/balance/player1" | jq '.'

echo -e "\n6. Game Statistics"
curl -s "$BASE_URL/api/game/stats" | jq '.'

echo -e "\n7. Recent Crashes"
curl -s "$BASE_URL/api/game/recent-crashes?limit=5" | jq '.'

echo -e "\n8. Convert USD to BTC"
curl -s -X POST "$BASE_URL/api/wallet/convert" \
  -H "Content-Type: application/json" \
  -d '{"usdAmount": 50, "currency": "btc"}' | jq '.'

echo -e "\n9. Leaderboard"
curl -s "$BASE_URL/api/wallet/leaderboard?limit=5" | jq '.'

echo -e "\n10. Multiple Player Summaries"
curl -s -X POST "$BASE_URL/api/wallet/summary" \
  -H "Content-Type: application/json" \
  -d '{"playerIds": ["player1", "player2", "player3"]}' | jq '.'

echo -e "\nAPI Testing Complete!"
```

### Test WebSocket Connection
```bash
#!/bin/bash
echo "Testing WebSocket connection..."
echo "Open http://localhost:5000/websocket-test.html in your browser"
echo "Or use a WebSocket client to connect to ws://localhost:5000"
```

## Windows PowerShell Commands

### Health Check
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/health" -Method GET
```

### Get Player Balance
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/balance/player1" -Method GET
```

### Convert USD to Crypto
```powershell
$body = @{
    usdAmount = 100
    currency = "btc"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/wallet/convert" -Method POST -Body $body -ContentType "application/json"
```

## Expected Responses

### Health Check
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Player Balance
```json
{
  "success": true,
  "playerId": "player1",
  "wallet": {
    "btc": 0.002,
    "eth": 0.02,
    "usd": 200
  },
  "usdEquivalent": 320.5,
  "currentPrices": {
    "btc": 60000,
    "eth": 3000
  },
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

### Game History
```json
{
  "success": true,
  "rounds": [
    {
      "roundId": "round-1",
      "status": "crashed",
      "crashPoint": 2.5,
      "startTime": "2024-01-01T11:55:00.000Z",
      "crashTime": "2024-01-01T11:56:00.000Z",
      "totalBets": 2,
      "totalCashouts": 1,
      "houseProfit": 25
    }
  ],
  "total": 1
}
```

## Error Responses

### Player Not Found
```json
{
  "error": "Player not found"
}
```

### Invalid Input
```json
{
  "error": "Invalid bet amount"
}
```

### Server Error
```json
{
  "error": "Internal server error"
}
```

## Notes

1. **jq Installation**: Install `jq` for JSON formatting:
   - macOS: `brew install jq`
   - Ubuntu: `sudo apt-get install jq`
   - Windows: Download from https://stedolan.github.io/jq/

2. **CORS**: The API supports CORS for frontend integration

3. **Rate Limiting**: Be mindful of API rate limits, especially for crypto price fetching

4. **WebSocket Testing**: Use the provided HTML test client or browser WebSocket tools

5. **Sample Data**: Run `npm run seed` in the backend directory to create sample data 