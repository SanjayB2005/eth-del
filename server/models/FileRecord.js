import mongoose from 'mongoose';

const fileRecordSchema = new mongoose.Schema({
  // User identification
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  
  // File information
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileHash: {
    type: String,
    required: true,
    index: true
  },
  
  // Pinata information
  pinataCid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  pinataStatus: {
    type: String,
    enum: ['uploading', 'pinned', 'failed', 'unpinned'],
    default: 'uploading'
  },
  pinataTimestamp: {
    type: Date,
    default: Date.now
  },
  
  // Filecoin information
  pieceCid: {
    type: String,
    index: true
  },
  filecoinStatus: {
    type: String,
    enum: ['queued', 'uploading', 'completed', 'failed'],
    default: 'queued'
  },
  filecoinTimestamp: {
    type: Date
  },
  dealId: {
    type: String
  },
  
  // Metadata
  metadata: {
    reportId: String,
    caseId: String,
    evidenceType: String,
    description: String,
    tags: [String]
  },
  
  // Migration tracking
  migrationAttempts: {
    type: Number,
    default: 0
  },
  lastMigrationAttempt: {
    type: Date
  },
  migrationError: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
fileRecordSchema.index({ walletAddress: 1, createdAt: -1 });
fileRecordSchema.index({ pinataCid: 1 });
fileRecordSchema.index({ pieceCid: 1 });
fileRecordSchema.index({ filecoinStatus: 1 });
fileRecordSchema.index({ 'metadata.reportId': 1 });
fileRecordSchema.index({ 'metadata.caseId': 1 });

// Virtual for migration status
fileRecordSchema.virtual('migrationStatus').get(function() {
  if (this.filecoinStatus === 'completed') return 'completed';
  if (this.filecoinStatus === 'failed' && this.migrationAttempts >= 3) return 'failed';
  if (this.filecoinStatus === 'uploading') return 'in-progress';
  return 'pending';
});

export default mongoose.model('FileRecord', fileRecordSchema);