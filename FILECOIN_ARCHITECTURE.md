# Filecoin Storage Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ETH Delhi Evidence Storage                   │
│                    Filecoin Integration                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   Backend API   │    │   Filecoin      │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   Network       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Pinata IPFS   │
                       │   (Temporary)   │
                       └─────────────────┘
```

## Data Flow

```
1. File Upload
   User ──► Client ──► API ──► Pinata ──► Pinata CID
                                    │
                                    ▼
2. Background Migration
   Pinata CID ──► Download ──► Synapse SDK ──► Filecoin ──► Piece CID
                                          │
                                          ▼
3. Storage Tracking
   Database ──► FileRecord ──► Pinata CID + Piece CID + Status
```

## Service Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Backend Services                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  PinataService  │  │ FilecoinService │  │   AuthService   │ │
│  │                 │  │                 │  │                 │ │
│  │ • Upload files  │  │ • Synapse SDK   │  │ • JWT auth      │ │
│  │ • Download CID  │  │ • FIL payments  │  │ • Wallet auth   │ │
│  │ • Manage pins   │  │ • Deal tracking │  │ • User mgmt     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## API Endpoints Structure

```
/api/filecoin/
├── GET    /status           # Service status & payment info
├── POST   /setup            # Setup FIL payments
├── POST   /migrate/:cid     # Migrate Pinata CID to Filecoin
├── GET    /download/:cid    # Download from Filecoin
├── GET    /deal/:cid        # Check deal status
├── GET    /balance          # Wallet balance (FIL/USDFC)
└── POST   /ready            # Check service readiness

/api/upload/
├── POST   /                 # Upload file (Pinata + Filecoin)
├── GET    /files            # List user files
├── POST   /retry/:fileId    # Retry failed migration
└── DELETE /:fileId          # Delete file
```

## Database Models

```
FileRecord:
├── walletAddress (String)
├── originalName (String)
├── fileSize (Number)
├── fileHash (String)
├── pinataCid (String)      # IPFS CID
├── pinataStatus (Enum)
├── pieceCid (String)       # Filecoin piece CID
├── filecoinStatus (Enum)   # queued/uploading/completed/failed
├── dealId (String)
├── metadata (Object)
└── migrationTracking (Object)

PaymentLog:
├── walletAddress (String)
├── transactionHash (String)
├── transactionType (Enum)  # deposit/approval/service_approval
├── amount (String)
├── token (String)          # USDFC
├── status (Enum)           # pending/confirmed/failed
└── serviceDetails (Object)
```

## Payment Flow

```
1. Initial Setup:
   User ──► Setup Request ──► Deposit USDFC ──► Approve Service

2. File Operations:
   Upload File ──► Check Payment Status ──► Process if Ready

3. Transaction Logging:
   All Transactions ──► PaymentLog ──► Blockchain Tracking
```

## Error Handling & Retry Logic

```
File Upload:
├── Pinata Upload ──► Success ──► Queue Filecoin Migration
└── Pinata Upload ──► Failure ──► Return Error

Filecoin Migration:
├── Download from Pinata ──► Success ──► Upload to Filecoin
├── Download from Pinata ──► Failure ──► Retry (3 attempts)
├── Upload to Filecoin ──► Success ──► Update Status
└── Upload to Filecoin ──► Failure ──► Retry (3 attempts)

Payment Operations:
├── Deposit ──► Success ──► Service Approval
├── Deposit ──► Failure ──► Log Error
├── Service Approval ──► Success ──► Ready for Operations
└── Service Approval ──► Failure ──► Log Error
```

## Environment Configuration

```
Required Environment Variables:
├── SYNAPSE_PRIVATE_KEY     # Filecoin wallet private key
├── SYNAPSE_RPC_URL         # Filecoin RPC endpoint
├── USDFC_DEPOSIT_AMOUNT    # Initial deposit amount
├── RATE_ALLOWANCE          # Rate allowance for service
├── LOCKUP_ALLOWANCE        # Lockup allowance for service
└── MAX_LOCKUP_PERIOD       # Maximum lockup period

Optional Configuration:
├── MIN_USDFC_ALLOWANCE     # Minimum required allowance
├── STORAGE_RETRY_ATTEMPTS  # Retry attempts for storage
└── STORAGE_RETRY_DELAY     # Delay between retries
```

## Network Support

```
Calibration Testnet (Development):
├── RPC: https://api.calibration.node.glif.io/rpc/v1
├── Faucet: https://faucet.calibration.fildev.network/
└── Explorer: https://calibration.filfox.info/

Mainnet (Production):
├── RPC: https://api.node.glif.io/rpc/v1
├── Explorer: https://filfox.info/
└── Requires real FIL tokens
```

## Security Considerations

```
Authentication:
├── JWT tokens for API access
├── Wallet signature verification
└── Rate limiting on endpoints

Data Security:
├── Private key protection
├── Secure environment variables
└── Transaction validation

Network Security:
├── HTTPS in production
├── CORS configuration
└── Input validation
```

## Monitoring & Observability

```
Logging:
├── Service initialization
├── Payment transactions
├── File upload/migration
└── Error tracking

Metrics:
├── Upload success rates
├── Migration completion times
├── Payment status
└── Storage costs

Health Checks:
├── Service status endpoints
├── Database connectivity
├── External service availability
└── Payment system health
```

## Future Enhancements

```
Phase 2 (Blockchain Integration):
├── Smart contract integration
├── Evidence verification
├── Decentralized storage proofs
└── Cross-chain compatibility

Phase 3 (Advanced Features):
├── Automatic cost optimization
├── Multi-provider storage
├── Advanced monitoring
└── Cost analytics dashboard
```


