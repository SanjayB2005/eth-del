# MetaMask Integration Setup for Filecoin Storage

## Your MetaMask Wallet Configuration
- **Wallet Address**: `0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89`
- **Network**: Calibration Testnet
- **Required Tokens**: Test FIL tokens for storage operations

## Step 1: Get Test FIL Tokens

### Calibration Testnet Faucet
1. Visit: https://faucet.calibration.fildev.network/
2. Enter your wallet address: `0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89`
3. Request test FIL tokens (you'll need at least 10-20 FIL for testing)

### Alternative Faucets
- GLIF Faucet: https://faucet.calibration.glif.io/
- Filecoin Foundation Faucet: https://faucet.calibration.fildev.network/

## Step 2: Add Calibration Testnet to MetaMask

### Network Configuration
```json
{
  "networkName": "Filecoin Calibration",
  "rpcUrl": "https://api.calibration.node.glif.io/rpc/v1",
  "chainId": "314159",
  "symbol": "tFIL",
  "blockExplorer": "https://calibration.filfox.info"
}
```

### Manual Addition Steps
1. Open MetaMask
2. Click on network dropdown (top of MetaMask)
3. Click "Add Network" or "Custom RPC"
4. Enter the network details above
5. Save and switch to Calibration network

## Step 3: Environment Configuration

Create a `.env` file in the server directory with:

```bash
# Server Configuration
PORT=3002
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/eth-del

# Pinata Configuration (Replace with your actual keys)
PINATA_UPLOAD_JWT=your_actual_pinata_upload_jwt
PINATA_DOWNLOAD_JWT=your_actual_pinata_download_jwt
PINATA_GATEWAY=gateway.pinata.cloud

# Filecoin / Synapse SDK Configuration
# IMPORTANT: Replace with your actual private key from MetaMask
SYNAPSE_PRIVATE_KEY=0x_your_actual_private_key_from_metamask
SYNAPSE_RPC_URL=https://api.calibration.node.glif.io/rpc/v1

# Payment Configuration
USDFC_DEPOSIT_AMOUNT=100
RATE_ALLOWANCE=10
LOCKUP_ALLOWANCE=1000
MAX_LOCKUP_PERIOD=86400
MIN_USDFC_ALLOWANCE=10

# Authentication
JWT_SECRET=your_jwt_secret_here

# MetaMask Wallet Configuration
METAMASK_WALLET_ADDRESS=0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89
```

## Step 4: Get Your Private Key from MetaMask

⚠️ **SECURITY WARNING**: Never share your private key or commit it to version control!

### How to Export Private Key
1. Open MetaMask
2. Click on account details (three dots)
3. Select "Account details"
4. Click "Export Private Key"
5. Enter your MetaMask password
6. Copy the private key (starts with 0x)
7. Replace `0x_your_actual_private_key_from_metamask` in .env

## Step 5: Test the Integration

### 1. Start the Server
```bash
cd server
npm run dev
```

### 2. Check Service Status
```bash
curl http://localhost:3002/api/health
```

### 3. Setup Payments (First Time)
```bash
# Get a valid JWT token first, then:
curl -X POST -H "Authorization: Bearer <your-jwt-token>" \
  http://localhost:3002/api/filecoin/setup
```

### 4. Upload a File
```bash
curl -X POST -H "Authorization: Bearer <your-jwt-token>" \
  -F "file=@test-file.jpg" \
  http://localhost:3002/api/upload
```

## Step 6: Monitor Transactions

### Filecoin Explorer
- Calibration Explorer: https://calibration.filfox.info/
- GLIF Explorer: https://explorer.glif.io/?network=calibration

### Check Your Wallet
1. Switch to Calibration network in MetaMask
2. View your balance and transactions
3. Monitor storage deals and payments

## Troubleshooting

### Common Issues

1. **"Insufficient FIL balance"**
   - Get more test FIL from faucet
   - Ensure you're on Calibration network

2. **"Private key not found"**
   - Verify private key is correctly copied
   - Ensure it starts with 0x

3. **"Network connection failed"**
   - Check RPC URL is correct
   - Verify Calibration network is added to MetaMask

4. **"Payment setup failed"**
   - Ensure sufficient FIL balance
   - Check transaction gas fees
   - Wait for transaction confirmations

### Debug Commands

```bash
# Check wallet balance
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/filecoin/balance

# Check service status
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/filecoin/status

# Check service readiness
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/filecoin/ready
```

## Security Best Practices

1. **Never commit private keys** to version control
2. **Use testnet only** for development
3. **Keep private keys secure** and never share them
4. **Use environment variables** for sensitive data
5. **Test with small amounts** first

## Cost Estimation

### Calibration Testnet (Free)
- Test FIL: Free from faucet
- Storage deals: Free
- Gas fees: Minimal (testnet)

### Mainnet (Real Costs)
- FIL tokens: Real money
- Storage deals: Real FIL payments
- Gas fees: Real FIL costs

## Next Steps After Setup

1. ✅ Configure MetaMask with Calibration testnet
2. ✅ Get test FIL tokens
3. ✅ Set up environment variables
4. ✅ Test file upload and migration
5. ✅ Monitor storage deals
6. 🔄 Deploy to production (when ready)

## Support Resources

- [Filecoin Documentation](https://docs.filecoin.io/)
- [Calibration Testnet Guide](https://docs.filecoin.io/networks/calibration/)
- [Synapse SDK Documentation](https://docs.filoz.io/)
- [MetaMask Documentation](https://docs.metamask.io/)


