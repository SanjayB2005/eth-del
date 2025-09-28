# Real Filecoin Storage & MetaMask Integration Setup (tFIL Testing)

This guide will help you set up actual Filecoin storage using tFIL (test FIL) tokens with MetaMask payments.

## Prerequisites

1. **MetaMask Wallet** with Filecoin Calibration testnet configured
2. **Test tFIL tokens** from Filecoin faucet (at least 0.1 tFIL)
3. **Private key** for server-side transactions

## Step 1: Configure MetaMask for Filecoin

### Add Filecoin Calibration Testnet to MetaMask

1. Open MetaMask and click on the network dropdown
2. Click "Add Network" or "Custom RPC"
3. Enter the following details:

```
Network Name: Filecoin Calibration
New RPC URL: https://api.calibration.node.glif.io/rpc/v1
Chain ID: 314159
Currency Symbol: tFIL
Block Explorer URL: https://calibration.filfox.info
```

### Alternative: Use ChainID.network

1. Visit [chainid.network](https://chainid.network)
2. Search for "Filecoin Calibration"
3. Click "Connect Wallet" and approve the network addition

## Step 2: Get Test Tokens

### Get tFIL Tokens

1. Visit [Calibration Faucet](https://faucet.calibration.fildev.network/)
2. Enter your MetaMask wallet address
3. Request test tFIL tokens (you need at least 0.1 tFIL)
4. Wait for tokens to arrive (usually within a few minutes)

**Note**: tFIL is the native token for Filecoin Calibration testnet, so you only need tFIL tokens for testing.

## Step 3: Configure Environment Variables

1. Copy `server/env.example` to `server/.env`
2. Fill in the following required values:

```bash
# Your MetaMask wallet address
METAMASK_WALLET_ADDRESS=0x_your_actual_wallet_address_here

# Private key for server transactions (NEVER commit this to git)
SYNAPSE_PRIVATE_KEY=0x_your_actual_private_key_for_filecoin_here

# Pinata configuration (for initial file storage)
PINATA_API_KEY=your_actual_pinata_api_key
PINATA_SECRET_KEY=your_actual_pinata_secret_key

# tFIL Testing Configuration
MIN_TFIL_BALANCE=0.1
STORAGE_COST_PER_FILE=0.001

# JWT secret for authentication
JWT_SECRET=your_secure_jwt_secret_here
```

### Getting Your Private Key

⚠️ **SECURITY WARNING**: Never share your private key or commit it to version control!

1. In MetaMask, click on account details
2. Click "Export Private Key"
3. Enter your MetaMask password
4. Copy the private key (starts with 0x)

## Step 4: Update USDFC Contract Address

The current implementation uses a placeholder contract address. You need to:

1. Find the actual USDFC token contract address on Calibration testnet
2. Update the address in `server/services/metamaskService.js`:

```javascript
const usdfcContractAddress = '0x_actual_usdfc_contract_address_here';
```

## Step 5: Test the Integration

### 1. Start the Server

```bash
cd server
npm install
npm start
```

### 2. Test MetaMask Connection

```bash
curl -X GET http://localhost:3002/api/metamask/status \
  -H "Authorization: Bearer your_jwt_token"
```

### 3. Test Wallet Balances

```bash
curl -X GET http://localhost:3002/api/metamask/wallet-info \
  -H "Authorization: Bearer your_jwt_token"
```

### 4. Test Filecoin Setup

```bash
curl -X POST http://localhost:3002/api/metamask/setup-filecoin \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json"
```

### 5. Test Real Storage Upload

```bash
curl -X POST http://localhost:3002/api/metamask/pay-for-storage \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{"pinataCid": "your_pinata_cid_here", "storageDuration": 365}'
```

## Step 6: Client-Side Integration

Update your client-side components to handle real payment flows:

### 1. Add MetaMask Connection

```javascript
// In your client component
const connectMetaMask = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      // Switch to Filecoin network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4cb2f' }], // Calibration testnet
      });
      
      console.log('Connected to:', accounts[0]);
      return accounts[0];
    } catch (error) {
      console.error('MetaMask connection failed:', error);
    }
  }
};
```

### 2. Handle Real Storage Payments

```javascript
const payForStorage = async (pinataCid) => {
  try {
    const response = await fetch('/api/metamask/pay-for-storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        pinataCid: pinataCid,
        storageDuration: 365
      })
    });
    
    const result = await response.json();
    
    if (result.uploadResult) {
      console.log('File stored on Filecoin:', result.uploadResult.pieceCid);
      console.log('Deal ID:', result.uploadResult.dealId);
    }
  } catch (error) {
    console.error('Storage payment failed:', error);
  }
};
```

## Step 7: Monitor Transactions

### View Transactions on Block Explorer

1. **Filecoin Calibration**: [calibration.filfox.info](https://calibration.filfox.info)
2. **Enter your wallet address** to see all transactions
3. **Monitor deal status** using the deal IDs returned from uploads

### Check Deal Status

```bash
curl -X GET http://localhost:3002/api/filecoin/deal/{pieceCid} \
  -H "Authorization: Bearer your_jwt_token"
```

## Troubleshooting

### Common Issues

1. **"Insufficient FIL balance"**
   - Get more test FIL from the faucet
   - Ensure you have at least 0.1 FIL for gas

2. **"MetaMask service not initialized"**
   - Check your private key in .env file
   - Verify RPC URL is correct

3. **"Storage API not available"**
   - Check Synapse SDK version
   - Verify Filecoin network connection

4. **"Transaction would likely fail"**
   - Check gas estimation
   - Verify contract addresses
   - Ensure sufficient token allowances

### Debug Commands

```bash
# Check server health
curl http://localhost:3002/api/health

# Check Filecoin service status
curl -X GET http://localhost:3002/api/filecoin/status \
  -H "Authorization: Bearer your_jwt_token"

# Check MetaMask service status
curl -X GET http://localhost:3002/api/metamask/status \
  -H "Authorization: Bearer your_jwt_token"
```

## Security Notes

1. **Never commit private keys** to version control
2. **Use environment variables** for sensitive data
3. **Test on testnet** before mainnet deployment
4. **Monitor transaction costs** and gas usage
5. **Implement proper error handling** for failed transactions

## Production Deployment

When moving to production:

1. **Switch to Filecoin Mainnet**
2. **Use real FIL tokens** (not test tokens)
3. **Update contract addresses** to mainnet versions
4. **Implement proper monitoring** and alerting
5. **Set up backup storage** strategies

## Support

- **Filecoin Documentation**: [docs.filecoin.io](https://docs.filecoin.io)
- **Synapse SDK**: [@filoz/synapse-sdk](https://www.npmjs.com/package/@filoz/synapse-sdk)
- **MetaMask Filecoin**: [docs.filecoin.io/basics/assets/metamask-setup](https://docs.filecoin.io/basics/assets/metamask-setup)
