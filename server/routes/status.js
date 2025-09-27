import express from 'express';
import authService from '../services/authService.js';
import filecoinService from '../services/filecoinService.js';
import pinataService from '../services/pinataService.js';
import FileRecord from '../models/FileRecord.js';
import PaymentLog from '../models/PaymentLog.js';

const router = express.Router();

/**
 * GET /api/status/:fileId
 * Get detailed status for a specific file
 */
router.get('/:fileId',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { fileId } = req.params;
      
      const fileRecord = await FileRecord.findOne({
        _id: fileId,
        walletAddress: req.user.walletAddress
      });
      
      if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Get additional status information
      let pinataMetadata = null;
      let filecoinDealStatus = null;
      
      try {
        // Get Pinata metadata if file is still pinned
        if (fileRecord.pinataStatus === 'pinned') {
          pinataMetadata = await pinataService.getFileMetadata(fileRecord.pinataCid);
        }
      } catch (error) {
        console.warn('Failed to get Pinata metadata:', error.message);
      }
      
      try {
        // Get Filecoin deal status if migrated
        if (fileRecord.pieceCid) {
          filecoinDealStatus = await filecoinService.checkDealStatus(fileRecord.pieceCid);
        }
      } catch (error) {
        console.warn('Failed to get Filecoin deal status:', error.message);
      }
      
      res.json({
        fileRecord: {
          id: fileRecord._id,
          originalName: fileRecord.originalName,
          fileSize: fileRecord.fileSize,
          mimeType: fileRecord.mimeType,
          fileHash: fileRecord.fileHash,
          
          // Pinata information
          pinataCid: fileRecord.pinataCid,
          pinataStatus: fileRecord.pinataStatus,
          pinataTimestamp: fileRecord.pinataTimestamp,
          
          // Filecoin information
          pieceCid: fileRecord.pieceCid,
          filecoinStatus: fileRecord.filecoinStatus,
          filecoinTimestamp: fileRecord.filecoinTimestamp,
          dealId: fileRecord.dealId,
          
          // Migration tracking
          migrationAttempts: fileRecord.migrationAttempts,
          lastMigrationAttempt: fileRecord.lastMigrationAttempt,
          migrationError: fileRecord.migrationError,
          migrationStatus: fileRecord.migrationStatus,
          
          // Metadata
          metadata: fileRecord.metadata,
          createdAt: fileRecord.createdAt,
          updatedAt: fileRecord.updatedAt
        },
        
        // Additional status information
        pinataMetadata,
        filecoinDealStatus,
        
        // Status summary
        summary: {
          isAvailable: fileRecord.pinataStatus === 'pinned' || fileRecord.filecoinStatus === 'completed',
          isPinned: fileRecord.pinataStatus === 'pinned',
          isOnFilecoin: fileRecord.filecoinStatus === 'completed',
          isMigrating: fileRecord.filecoinStatus === 'uploading',
          hasFailed: fileRecord.filecoinStatus === 'failed'
        }
      });
      
    } catch (error) {
      console.error('Get file status error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/status/pinata/:pinataCid
 * Get status by Pinata CID
 */
router.get('/pinata/:pinataCid',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { pinataCid } = req.params;
      
      const fileRecord = await FileRecord.findOne({
        pinataCid,
        walletAddress: req.user.walletAddress
      });
      
      if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Redirect to main status endpoint
      res.redirect(`/api/status/${fileRecord._id}`);
      
    } catch (error) {
      console.error('Get status by Pinata CID error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/status/filecoin/:pieceCid
 * Get status by Filecoin Piece CID
 */
router.get('/filecoin/:pieceCid',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { pieceCid } = req.params;
      
      const fileRecord = await FileRecord.findOne({
        pieceCid,
        walletAddress: req.user.walletAddress
      });
      
      if (!fileRecord) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      // Redirect to main status endpoint
      res.redirect(`/api/status/${fileRecord._id}`);
      
    } catch (error) {
      console.error('Get status by Piece CID error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/status/summary
 * Get summary statistics for user's files
 */
router.get('/summary',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const walletAddress = req.user.walletAddress;
      
      // Aggregate file statistics
      const stats = await FileRecord.aggregate([
        { $match: { walletAddress } },
        {
          $group: {
            _id: null,
            totalFiles: { $sum: 1 },
            totalSize: { $sum: '$fileSize' },
            pinnedFiles: {
              $sum: { $cond: [{ $eq: ['$pinataStatus', 'pinned'] }, 1, 0] }
            },
            filecoinFiles: {
              $sum: { $cond: [{ $eq: ['$filecoinStatus', 'completed'] }, 1, 0] }
            },
            uploadingToFilecoin: {
              $sum: { $cond: [{ $eq: ['$filecoinStatus', 'uploading'] }, 1, 0] }
            },
            failedMigrations: {
              $sum: { $cond: [{ $eq: ['$filecoinStatus', 'failed'] }, 1, 0] }
            },
            queuedForMigration: {
              $sum: { $cond: [{ $eq: ['$filecoinStatus', 'queued'] }, 1, 0] }
            }
          }
        }
      ]);
      
      const summary = stats[0] || {
        totalFiles: 0,
        totalSize: 0,
        pinnedFiles: 0,
        filecoinFiles: 0,
        uploadingToFilecoin: 0,
        failedMigrations: 0,
        queuedForMigration: 0
      };
      
      // Get recent files
      const recentFiles = await FileRecord.find({ walletAddress })
        .select('originalName pinataCid pieceCid pinataStatus filecoinStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(10);
      
      res.json({
        statistics: {
          ...summary,
          totalSizeMB: (summary.totalSize / 1024 / 1024).toFixed(2),
          migrationRate: summary.totalFiles > 0 
            ? ((summary.filecoinFiles / summary.totalFiles) * 100).toFixed(1) + '%'
            : '0%'
        },
        recentFiles
      });
      
    } catch (error) {
      console.error('Get summary error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/status/system
 * Get system-wide status (admin only)
 */
router.get('/system',
  authService.authenticateToken.bind(authService),
  authService.requireRole('admin'),
  async (req, res) => {
    try {
      // Get Filecoin service status
      let filecoinStatus = null;
      let paymentStatus = null;
      
      try {
        filecoinStatus = {
          isInitialized: filecoinService.isInitialized(),
          isPaymentSetup: filecoinService.isPaymentSetup()
        };
        
        if (filecoinService.isInitialized()) {
          paymentStatus = await filecoinService.getPaymentStatus();
        }
      } catch (error) {
        console.warn('Failed to get Filecoin status:', error.message);
      }
      
      // Get Pinata service status
      let pinataStatus = null;
      let pinataUsage = null;
      
      try {
        pinataStatus = {
          isInitialized: pinataService.isInitialized()
        };
        
        if (pinataService.isInitialized()) {
          pinataUsage = await pinataService.getUsageStats();
        }
      } catch (error) {
        console.warn('Failed to get Pinata status:', error.message);
      }
      
      // Get database statistics
      const dbStats = await Promise.all([
        FileRecord.countDocuments(),
        FileRecord.countDocuments({ filecoinStatus: 'completed' }),
        FileRecord.countDocuments({ filecoinStatus: 'failed' }),
        FileRecord.countDocuments({ filecoinStatus: 'uploading' }),
        PaymentLog.countDocuments(),
        PaymentLog.countDocuments({ status: 'confirmed' })
      ]);
      
      res.json({
        services: {
          filecoin: filecoinStatus,
          pinata: pinataStatus
        },
        payments: paymentStatus,
        pinataUsage,
        statistics: {
          totalFiles: dbStats[0],
          migratedFiles: dbStats[1],
          failedMigrations: dbStats[2],
          activeMigrations: dbStats[3],
          totalPayments: dbStats[4],
          confirmedPayments: dbStats[5]
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Get system status error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/status/setup-payments
 * Setup Filecoin payments (requires authentication)
 */
router.post('/setup-payments',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      if (!filecoinService.isInitialized()) {
        return res.status(503).json({ 
          error: 'Filecoin service not initialized' 
        });
      }
      
      if (filecoinService.isPaymentSetup()) {
        return res.status(400).json({ 
          error: 'Payments already set up' 
        });
      }
      
      const result = await filecoinService.setupPayments(req.user.walletAddress);
      
      res.json({
        message: 'Payment setup completed successfully',
        transactions: result
      });
      
    } catch (error) {
      console.error('Setup payments error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/status/payment-logs
 * Get payment transaction logs for user
 */
router.get('/payment-logs',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, type } = req.query;
      
      const query = { walletAddress: req.user.walletAddress };
      if (type) {
        query.transactionType = type;
      }
      
      const logs = await PaymentLog.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      const total = await PaymentLog.countDocuments(query);
      
      res.json({
        logs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('Get payment logs error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;