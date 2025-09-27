# Hedera Integration Setup Guide

## 🚀 Quick Start

Your Node.js + Express backend now includes Hedera Hashgraph integration! Here's what has been set up for you:

### ✅ What's Been Added

1. **Hedera SDK**: `@hashgraph/sdk` installed and configured
2. **Hedera Service**: Complete service class with testnet client initialization
3. **Environment Variables**: Hedera configuration added to `.env`
4. **API Routes**: RESTful endpoints for Hedera operations
5. **Error Handling**: Comprehensive error handling and logging

### 🛠️ Setup Instructions

1. **Get Your Hedera Testnet Credentials**:

   - Go to [Hedera Portal](https://portal.hedera.com/)
   - Create a testnet account
   - Get your Account ID (format: 0.0.123456) and Private Key

2. **Configure Environment Variables**:

   ```bash
   # Edit your .env file
   HEDERA_OPERATOR_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_OPERATOR_KEY=YOUR_PRIVATE_KEY_HERE
   ```

3. **Test Your Connection**:

   ```bash
   # Run the Hedera test script
   node test-hedera.js
   ```

4. **Start Your Server**:
   ```bash
   # Start the development server
   npm run dev
   ```

### 📊 Available Endpoints

Once your server is running on port 4000, you can test these endpoints:

- **Health Check**: `GET http://localhost:4000/api/health`
- **Hedera Status**: `GET http://localhost:4000/api/hedera/status`
- **Account Balance**: `GET http://localhost:4000/api/hedera/balance`
- **Any Account Balance**: `GET http://localhost:4000/api/hedera/balance/0.0.123456`

### 🔍 Console Output

When you start your server, you should see:

```
🔧 Initializing Hedera service...
✅ Hedera client initialized for account: 0.0.123456
📊 Account balance: 100 ℏ
✅ Hedera service initialized
🚀 Server running on port 4000
📊 Health check: http://localhost:4000/api/health
```

### 🧪 Testing

1. **Connection Test**:

   ```bash
   node test-hedera.js
   ```

2. **API Test**:
   ```bash
   curl http://localhost:4000/api/hedera/status
   ```

### 🔧 Troubleshooting

- **Missing credentials**: Make sure `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY` are set in `.env`
- **Invalid account ID**: Format should be `0.0.123456`
- **Invalid private key**: Should start with `302e...`
- **Insufficient balance**: Make sure your testnet account has HBAR

### 📁 File Structure

```
server/
├── services/
│   └── hederaService.js     # Hedera service implementation
├── routes/
│   └── hedera.js           # Hedera API routes
├── test-hedera.js          # Connection test script
├── .env                    # Your environment variables
├── .env.example           # Template for environment variables
└── server.js              # Main server with Hedera integration
```

### 🌟 Next Steps

You can now:

- Create and manage Hedera accounts
- Send HBAR transfers
- Create and interact with smart contracts
- Store file metadata on Hedera Consensus Service
- Integrate with your existing evidence storage system

Happy building with Hedera! 🚀
