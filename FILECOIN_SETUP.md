# Filecoin Storage Implementation with Synapse SDK

This document provides comprehensive setup instructions for implementing Filecoin storage using Synapse SDK to store CIDs from Pinata.

## Overview

The implementation includes:
- ✅ Synapse SDK integration for Filecoin storage
- ✅ FIL token management and transaction handling  
- ✅ Payment setup and service approval workflows
- ✅ CID migration from Pinata to Filecoin storage
- ✅ Comprehensive API endpoints for Filecoin operations
- ✅ Error handling and retry mechanisms

## Environment Configuration

Create a `.env` file in the server directory with the following variables:

```bash
# Server Configuration
PORT=3002
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/eth-del

# Pinata Configuration (IPFS)
PINATA_API_KEY=your_pinata_api_key_here
PINATA_SECRET_KEY=your_pinata_secret_key_here
PINATA_JWT=your_pinata_jwt_token_here

# Pinata Dual Key Configuration (Recommended for production)
PINATA_UPLOAD_JWT=your_pinata_upload_jwt_here
PINATA_DOWNLOAD_JWT=your_pinata_download_jwt_here
PINATA_GATEWAY=gateway.pinata.cloud

# Filecoin / Synapse SDK Configuration
SYNAPSE_PRIVATE_KEY=0x_your_private_key_for_filecoin_here
SYNAPSE_RPC_URL=https://api.calibration.node.glif.io/rpc/v1

# Payment Configuration
USDFC_DEPOSIT_AMOUNT=100
RATE_ALLOWANCE=10
LOCKUP_ALLOWANCE=1000
MAX_LOCKUP_PERIOD=86400
MIN_USDFC_ALLOWANCE=10

# Authentication
JWT_SECRET=your_jwt_secret_here
```

## Network Configuration

### Calibration Testnet (Recommended for Development)
```bash
SYNAPSE_RPC_URL=https://api.calibration.node.glif.io/rpc/v1
```

### Mainnet (Production)
```bash
SYNAPSE_RPC_URL=https://api.node.glif.io/rpc/v1
```

## Getting Test FIL Tokens

### For Calibration Testnet:
1. Visit [Calibration Testnet Faucet](https://faucet.calibration.fildev.network/)
2. Enter your wallet address
3. Request test FIL tokens
4. Use these tokens to get USDFC tokens for payments

## Service Architecture

### Core Services

1. **PinataService** (`services/pinataService.js`)
   - Handles IPFS file uploads and downloads
   - Manages Pinata API integration
   - Provides CID generation for files

2. **FilecoinService** (`services/filecoinService.js`)
   - Manages Synapse SDK integration
   - Handles FIL token transactions
   - Provides Filecoin storage operations
   - Manages payment setup and approvals

### Data Models

1. **FileRecord** (`models/FileRecord.js`)
   - Tracks files through Pinata and Filecoin storage
   - Stores both Pinata CIDs and Filecoin piece CIDs
   - Manages migration status and error tracking

2. **PaymentLog** (`models/PaymentLog.js`)
   - Logs all FIL/USDFC transactions
   - Tracks payment setup progress
   - Stores transaction hashes and status

## API Endpoints

### Filecoin Operations

#### Get Service Status
```http
GET /api/filecoin/status
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "isSetup": true,
  "network": "calibration",
  "walletAddress": "0x...",
  "allowance": {
    "amount": "100.0",
    "token": "USDFC"
  },
  "serviceApproval": {
    "isApproved": true,
    "rateAllowance": "10.0",
    "rateUsed": "0.0",
    "lockupAllowance": "1000.0",
    "maxLockupPeriod": "86400"
  },
  "addresses": {
    "wallet": "0x...",
    "payments": "0x...",
    "warmStorage": "0x..."
  }
}
```

#### Setup Payments
```http
POST /api/filecoin/setup
Authorization: Bearer <jwt_token>
```

Response:
```json
{
  "message": "Filecoin payment setup completed successfully",
  "results": {
    "deposit": {
      "hash": "0x...",
      "amount": "100.0"
    },
    "serviceApproval": {
      "hash": "0x...",
      "serviceAddress": "0x...",
      "rateAllowance": "10.0",
      "lockupAllowance": "1000.0",
      "maxLockupPeriod": "86400"
    }
  }
}
```

#### Migrate Pinata CID to Filecoin
```http
POST /api/filecoin/migrate/:pinataCid
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "metadata": {
    "reportId": "report_123",
    "caseId": "case_456"
  }
}
```

Response:
```json
{
  "message": "File successfully migrated to Filecoin",
  "result": {
    "pieceCid": "baga...",
    "dealId": "deal_123",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "metadata": {
      "originalPinataCid": "Qm...",
      "uploadTimestamp": "2024-01-01T00:00:00.000Z",
      "source": "pinata-migration"
    },
    "originalPinataCid": "Qm...",
    "fileSize": 1024
  }
}
```

#### Download from Filecoin
```http
GET /api/filecoin/download/:pieceCid
Authorization: Bearer <jwt_token>
```

#### Check Deal Status
```http
GET /api/filecoin/deal/:pieceCid
Authorization: Bearer <jwt_token>
```

#### Get Wallet Balance
```http
GET /api/filecoin/balance
Authorization: Bearer <jwt_token>
```

## File Upload Flow

1. **File Upload to Pinata**
   - User uploads file via `/api/upload`
   - File is stored on Pinata IPFS
   - Pinata CID is generated and stored in database

2. **Background Migration to Filecoin**
   - System automatically migrates Pinata CID to Filecoin
   - File is downloaded from Pinata
   - File is uploaded to Filecoin via Synapse SDK
   - Filecoin piece CID is stored in database

3. **Status Tracking**
   - Migration status is tracked in FileRecord model
   - Retry mechanisms handle failures
   - Users can monitor progress via API

## Error Handling

### Common Issues and Solutions

1. **Payment Setup Required**
   ```
   Error: Payment setup required before uploading to Filecoin
   Solution: Call /api/filecoin/setup endpoint
   ```

2. **Insufficient FIL Balance**
   ```
   Error: Insufficient FIL balance for transactions
   Solution: Get test FIL from faucet (Calibration testnet)
   ```

3. **Service Not Approved**
   ```
   Error: Service not approved
   Solution: Complete payment setup process
   ```

4. **Network Connection Issues**
   ```
   Error: Synapse SDK initialization timeout
   Solution: Check SYNAPSE_RPC_URL and network connectivity
   ```

## Development Workflow

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Start MongoDB
mongod

# Start server
npm run dev
```

### 2. Test Filecoin Integration
```bash
# Check service status
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/filecoin/status

# Setup payments (first time only)
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/filecoin/setup

# Upload a file (will automatically migrate to Filecoin)
curl -X POST -H "Authorization: Bearer <token>" \
  -F "file=@test-file.jpg" \
  http://localhost:3002/api/upload
```

### 3. Monitor Migration
```bash
# Check file migration status
curl -H "Authorization: Bearer <token>" \
  http://localhost:3002/api/upload/files
```

## Production Considerations

1. **Security**
   - Use strong JWT secrets
   - Implement rate limiting
   - Use HTTPS in production
   - Secure private keys

2. **Performance**
   - Implement file size limits
   - Use connection pooling for MongoDB
   - Monitor storage costs

3. **Monitoring**
   - Track migration success rates
   - Monitor payment balances
   - Log all transactions
   - Set up alerts for failures

4. **Cost Management**
   - Monitor FIL token usage
   - Set reasonable allowance limits
   - Implement cost controls

## Troubleshooting

### Service Initialization Issues
- Check environment variables
- Verify network connectivity
- Ensure MongoDB is running
- Check private key format

### Payment Issues
- Verify FIL token balance
- Check USDFC allowance
- Ensure service approval
- Monitor transaction confirmations

### Storage Issues
- Check Pinata connectivity
- Verify file permissions
- Monitor storage quotas
- Check deal status

## Support

For issues with:
- **Synapse SDK**: Check [Synapse Documentation](https://docs.filoz.io/)
- **Filecoin Network**: Visit [Filecoin Documentation](https://docs.filecoin.io/)
- **Pinata**: Check [Pinata Documentation](https://docs.pinata.cloud/)

## Next Steps

1. ✅ Implement basic Filecoin storage
2. ✅ Add FIL token management
3. ✅ Create payment workflows
4. ✅ Add CID migration
5. 🔄 Test with real files
6. 📋 Add blockchain integration (future)
7. 📋 Implement advanced monitoring
8. 📋 Add cost optimization features


