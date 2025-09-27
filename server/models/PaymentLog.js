import mongoose from 'mongoose';

const paymentLogSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // Transaction information
  transactionHash: {
    type: String,
    required: true,
    unique: true
  },
  transactionType: {
    type: String,
    enum: ['deposit', 'approval', 'service_approval', 'revoke'],
    required: true
  },
  
  // Payment details
  amount: {
    type: String, // Store as string to preserve precision
    required: true
  },
  token: {
    type: String,
    default: 'USDFC'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  blockNumber: {
    type: Number
  },
  confirmations: {
    type: Number,
    default: 0
  },
  
  // Service approval specifics
  serviceAddress: {
    type: String
  },
  rateAllowance: {
    type: String
  },
  lockupAllowance: {
    type: String
  },
  maxLockupPeriod: {
    type: String
  },
  
  // Error handling
  error: {
    type: String
  },
  retryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
paymentLogSchema.index({ walletAddress: 1, createdAt: -1 });
paymentLogSchema.index({ transactionHash: 1 });
paymentLogSchema.index({ status: 1 });

export default mongoose.model('PaymentLog', paymentLogSchema);