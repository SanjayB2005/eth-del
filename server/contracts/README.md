# FileStorage Smart Contract

A well-structured Solidity smart contract for storing file metadata on Polygon blockchain, integrated with Filecoin storage.

## 📁 Project Structure

```
contracts/
├── contracts/
│   └── FileStorage.sol          # Main smart contract
├── scripts/
│   └── deploy.js              # Deployment script
├── test/
│   └── FileStorage.test.js    # Test suite
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies
└── env.example               # Environment variables template
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd server/contracts
npm install
```

### 2. Configure Environment

Copy the environment template and fill in your values:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Polygon Network Configuration
POLYGON_RPC_URL=https://rpc-amoy.polygon.technology
POLYGON_MAINNET_RPC_URL=https://polygon-rpc.com

# Private Key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Block Explorer API Keys
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

# Deployment Configuration
DEPLOYER_ADDRESS=your_wallet_address_here
```

### 3. Compile Contract

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

### 5. Deploy to Polygon Amoy

```bash
npm run deploy:amoy
```

### 6. Verify Contract (Optional)

```bash
npm run verify:amoy
```

## 📋 Contract Features

### Core Functions

- **`storeFile()`** - Store file metadata with Pinata hash and Filecoin details
- **`getFile()`** - Retrieve file data by ID
- **`updateFile()`** - Update existing file record
- **`deactivateFile()`** - Deactivate file record
- **`getUserFiles()`** - Get all files uploaded by a user

### View Functions

- **`getFileIdByPinataHash()`** - Get file ID by Pinata hash
- **`getTotalFiles()`** - Get total number of files
- **`getTotalStorageUsed()`** - Get total storage used in bytes

### Admin Functions

- **`transferOwnership()`** - Transfer contract ownership
- **`emergencyDeactivateFile()`** - Emergency file deactivation

## 🔧 Smart Contract Details

### FileRecord Structure

```solidity
struct FileRecord {
    string pinataHash;      // IPFS hash from Pinata
    string pieceCid;        // Filecoin Piece CID
    string dealId;          // Filecoin Deal ID
    string provider;        // Filecoin storage provider
    address uploader;       // Address of the uploader
    uint256 fileSize;       // File size in bytes
    uint256 timestamp;      // Upload timestamp
    bool isActive;          // Whether the record is active
    string fileName;        // Original file name
    string fileType;        // MIME type
}
```

### Events

- **`FileStored`** - Emitted when a file is stored
- **`FileUpdated`** - Emitted when a file is updated
- **`FileDeactivated`** - Emitted when a file is deactivated
- **`OwnershipTransferred`** - Emitted when ownership is transferred

## 🌐 Network Configuration

### Polygon Amoy Testnet
- **Chain ID**: 80002
- **RPC URL**: https://rpc-amoy.polygon.technology
- **Explorer**: https://www.oklink.com/amoy

### Polygon Mainnet
- **Chain ID**: 137
- **RPC URL**: https://polygon-rpc.com
- **Explorer**: https://polygonscan.com

## 📊 Gas Optimization

The contract is optimized for gas efficiency:
- **Compiler Version**: 0.8.19
- **Optimizer**: Enabled (200 runs)
- **Estimated Gas Cost**: ~150,000 gas per file storage

## 🧪 Testing

The test suite covers:
- ✅ Contract deployment
- ✅ File storage and retrieval
- ✅ File updates and deactivation
- ✅ User file management
- ✅ Ownership management
- ✅ Access control
- ✅ Error handling

Run tests with:
```bash
npm test
```

## 🔐 Security Features

- **Access Control**: Only file owners can update/deactivate their files
- **Input Validation**: Comprehensive validation of all inputs
- **Duplicate Prevention**: Prevents duplicate Pinata hashes
- **Emergency Functions**: Owner can deactivate files in emergencies
- **Ownership Management**: Secure ownership transfer

## 📝 Deployment Process

1. **Compile**: `npm run compile`
2. **Test**: `npm test`
3. **Deploy**: `npm run deploy:amoy`
4. **Verify**: `npm run verify:amoy`
5. **Update .env**: Set `CONTRACT_ADDRESS` in your server's `.env`

## 🔗 Integration

After deployment, update your server's `.env` file:

```env
CONTRACT_ADDRESS=0xYourDeployedContractAddress
```

The contract will be automatically used by the `polygonService.js` in your server.

## 📈 Monitoring

Monitor your contract:
- **Explorer**: Check transactions on Polygon explorer
- **Events**: Monitor contract events for file operations
- **Stats**: Use `getContractStats()` to get usage statistics

## 🆘 Troubleshooting

### Common Issues

1. **"Deployment file not found"**
   - Run `npm run deploy:amoy` first

2. **"Contract ABI not found"**
   - Run `npm run compile` first

3. **"Insufficient funds"**
   - Get test MATIC from Polygon faucet

4. **"Private key format error"**
   - Ensure private key doesn't have `0x` prefix

### Getting Test MATIC

For Polygon Amoy testnet:
- **Faucet**: https://faucet.polygon.technology/
- **Alternative**: https://mumbaifaucet.com/

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Polygon Documentation](https://docs.polygon.technology/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Solidity Documentation](https://docs.soliditylang.org/)

