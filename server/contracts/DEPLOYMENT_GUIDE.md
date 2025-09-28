# 🚀 Simple Pinata Storage Deployment Guide

This guide will help you deploy the `SimplePinataStorage` contract to Polygon Amoy testnet.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Test MATIC** for gas fees
3. **Private Key** for deployment wallet

## 🔧 Setup Steps

### 1. Install Dependencies

```bash
cd server/contracts
npm install
```

### 2. Configure Environment

```bash
cp env.example .env
```

Edit `.env` file:

```env
# Polygon Amoy Testnet
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_private_key_without_0x_prefix
POLYGONSCAN_API_KEY=your_polygonscan_api_key_optional
```

### 3. Get Test MATIC

Visit [Polygon Faucet](https://faucet.polygon.technology/) to get test MATIC for gas fees.

### 4. Compile Contract

```bash
npm run compile
```

### 5. Run Tests (Optional)

```bash
npm test
```

### 6. Deploy to Polygon Amoy

```bash
npm run deploy:amoy
```

## 📊 Expected Output

```
🚀 Starting SimplePinataStorage contract deployment...
📝 Deploying contracts with the account: 0xYourAddress
💰 Account balance: 0.5 ETH
📦 Deploying SimplePinataStorage contract...
✅ SimplePinataStorage deployed to: 0xContractAddress
📊 Deployment Details:
  Contract Address: 0xContractAddress
  Transaction Hash: 0xTxHash
  Block Number: 12345678
  Gas Used: 150000
💾 Deployment info saved to: deployment.json
✅ Contract verified successfully!
🎉 Deployment completed successfully!
```

## 🔗 After Deployment

1. **Update Server Configuration:**
   - The deployment info is saved in `deployment.json`
   - Update your server's `.env` with the contract address

2. **Test the Contract:**
   - Visit the explorer URL to see your transaction
   - The contract is now ready to store Pinata hashes

## 📝 Contract Functions

### Store Pinata Hash
```solidity
function storePinataHash(
    string memory pinataHash,
    string memory fileName,
    uint256 fileSize
) external returns (uint256)
```

### Get Record
```solidity
function getRecord(uint256 recordId) external view returns (PinataRecord memory)
```

### Get User Records
```solidity
function getUserRecords(address user) external view returns (uint256[] memory)
```

## 🧪 Testing the Contract

After deployment, you can test the contract by calling:

```javascript
// Store a Pinata hash
const tx = await contract.storePinataHash(
    "QmYourPinataHash",
    "test-file.txt",
    1024
);

// Get the record
const record = await contract.getRecord(1);
console.log(record);
```

## 🔍 Monitoring

- **Explorer**: Check your transaction on [Polygon Amoy Explorer](https://www.oklink.com/amoy)
- **Contract**: View your contract on the explorer
- **Events**: Monitor `PinataStored` events for new uploads

## 🆘 Troubleshooting

### Common Issues

1. **"Insufficient funds"**
   - Get more test MATIC from the faucet

2. **"Private key format error"**
   - Remove `0x` prefix from your private key

3. **"Contract ABI not found"**
   - Run `npm run compile` first

4. **"Deployment file not found"**
   - The deployment script creates this automatically

## 📚 Next Steps

1. **Integrate with Server**: Update your server's `.env` with the contract address
2. **Test Upload Flow**: Use the frontend to test the complete flow
3. **Monitor Events**: Watch for `PinataStored` events on the blockchain

## 🎯 What This Contract Does

- **Stores Pinata hashes** on Polygon blockchain
- **Tracks file metadata** (name, size, uploader, timestamp)
- **Prevents duplicates** by checking existing hashes
- **Provides easy retrieval** by hash or user address
- **Gas optimized** for minimal transaction costs

The contract is simple, focused, and perfect for storing Pinata CIDs on Polygon!

