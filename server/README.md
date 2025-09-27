# Server Setup Instructions

This document provides step-by-step instructions to set up the ETH-DEL server with Pinata and Filecoin (Synapse SDK) integration.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **MongoDB** (local or cloud instance)
3. **Pinata Account** with API credentials
4. **Filecoin Wallet** with some USDFC tokens for Calibration testnet

## Quick Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
CLIENT_URL=http://localhost:3000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/eth-del

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_here_change_in_production
JWT_EXPIRES_IN=24h

# Pinata Configuration (Server-side only)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
PINATA_JWT=your_pinata_jwt_here
PINATA_GATEWAY=gateway.pinata.cloud

# Filecoin/Synapse Configuration
SYNAPSE_PRIVATE_KEY=0x_your_private_key_for_filecoin_here
SYNAPSE_RPC_URL=wss://calibration.filfox.info/rpc/v1
SYNAPSE_NETWORK=calibration

# Payment Configuration
USDFC_DEPOSIT_AMOUNT=100
RATE_ALLOWANCE=10
LOCKUP_ALLOWANCE=1000
MAX_LOCKUP_PERIOD=86400

# Auto-setup for development (optional)
AUTO_SETUP_PAYMENTS=true
```

### 3. Get Pinata Credentials

1. Sign up at [pinata.cloud](https://pinata.cloud)
2. Go to API Keys section
3. Create a new API key with full permissions
4. Copy API Key, Secret Key, and JWT token to `.env`

### 4. Setup Filecoin Wallet

1. Create a new wallet or use existing one
2. Get private key and add to `SYNAPSE_PRIVATE_KEY` in `.env`
3. Get USDFC tokens from Calibration testnet faucet
4. The server will auto-setup payments in development mode

### 5. Start MongoDB

**Local MongoDB:**
```bash
mongod --dbpath /path/to/your/db
```

**Or use MongoDB Atlas (cloud):**
Update `MONGODB_URI` in `.env` with your Atlas connection string

### 6. Start the Server

```bash
npm run dev
```

The server will start on http://localhost:3001

## API Endpoints

### Authentication
- `GET /api/auth/nonce/:walletAddress` - Get nonce for wallet auth
- `POST /api/auth/verify` - Verify signature and get JWT token
- `GET /api/auth/profile` - Get user profile (requires auth)

### File Upload
- `POST /api/upload` - Upload file to Pinata + queue Filecoin migration
- `GET /api/upload/files` - List user's files
- `POST /api/upload/retry/:fileId` - Retry failed Filecoin migration
- `DELETE /api/upload/:fileId` - Delete file

### Status & Monitoring
- `GET /api/status/:fileId` - Get detailed file status
- `GET /api/status/summary` - Get user's file summary
- `GET /api/status/system` - Get system status (admin only)
- `POST /api/status/setup-payments` - Setup Filecoin payments

### Health Check
- `GET /api/health` - Server health and service status

## Testing the Setup

### 1. Check Health
```bash
curl http://localhost:3001/api/health
```

### 2. Test Authentication Flow
```bash
# Get nonce
curl "http://localhost:3001/api/auth/nonce/0x742d35Cc6835C0532FDD5716F16C3F15d17e8BEE"

# Sign the nonce with your wallet and verify
curl -X POST http://localhost:3001/api/auth/verify \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "0x742d35Cc6835C0532FDD5716F16C3F15d17e8BEE", "signature": "0x...", "nonce": "..."}'
```

### 3. Test File Upload
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/test/file.txt" \
  -F 'metadata={"reportId": "test-001"}'
```

## File Flow

1. **Client uploads file** → Server receives via `/api/upload`
2. **Server uploads to Pinata** → Gets Pinata CID
3. **Server saves to database** → Creates FileRecord
4. **Background process** → Downloads from Pinata, uploads to Filecoin
5. **Server updates record** → Saves Piece CID and deal info
6. **Client can query status** → Via `/api/status/:fileId`

## Development vs Production

### Development Mode
- Auto-setup payments if `AUTO_SETUP_PAYMENTS=true`
- Detailed error messages
- Uses Calibration testnet

### Production Mode
- Set `NODE_ENV=production`
- Use mainnet RPC URLs
- Secure JWT secrets
- Proper error handling
- Monitor payment balances

## Troubleshooting

### Common Issues

1. **"Pinata service not initialized"**
   - Check PINATA_API_KEY, PINATA_SECRET_KEY, PINATA_JWT in .env
   - Verify Pinata account has sufficient quota

2. **"Filecoin service not initialized"**
   - Check SYNAPSE_PRIVATE_KEY format (must start with 0x)
   - Ensure wallet has USDFC tokens
   - Check RPC URL connectivity

3. **"Payment setup required"**
   - Call `/api/status/setup-payments` endpoint
   - Or set `AUTO_SETUP_PAYMENTS=true` in development

4. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI format
   - Verify network connectivity for cloud instances

### Logs

Server logs show:
- Service initialization status
- File upload progress
- Filecoin migration status
- Payment transaction hashes
- Error details

## Security Considerations

1. **Never expose private keys** - Keep SYNAPSE_PRIVATE_KEY secure
2. **Rotate Pinata keys** if they were in client code
3. **Use strong JWT secrets** in production
4. **Enable HTTPS** for production deployment
5. **Rate limiting** on upload endpoints
6. **File type validation** for security
7. **Monitor payment balances** to prevent service interruption

## Next Steps

1. Deploy server to cloud provider
2. Set up MongoDB Atlas for production
3. Configure CI/CD pipeline
4. Set up monitoring and alerting
5. Update client to use server APIs instead of direct Pinata calls