import express from 'express';
import crypto from 'crypto';
import authService from '../services/authService.js';
import pinataService from '../services/pinataService.js';
import filecoinService from '../services/filecoinService.js';
import FileRecord from '../models/FileRecord.js';

const router = express.Router();

/**
 * POST /api/upload
 * Upload file to Pinata and queue for Filecoin migration
 */
router.post('/', 
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    const upload = req.app.locals.upload;
    
    // Use multer middleware for this specific route
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(400).json({ 
          error: 'File upload failed', 
          details: err.message 
        });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }
      
      try {
        const { originalname, buffer, mimetype, size } = req.file;
        const { metadata = '{}' } = req.body;
        
        // Parse metadata
        let parsedMetadata = {};
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch (error) {
          console.warn('Invalid metadata JSON, using empty object');
        }
        
        // Validate file size (100MB limit)
        const maxSize = 100 * 1024 * 1024; // 100MB
        if (size > maxSize) {
          return res.status(400).json({ 
            error: 'File too large', 
            maxSize: '100MB',
            fileSize: `${(size / 1024 / 1024).toFixed(2)}MB`
          });
        }
        
        // Generate file hash for deduplication
        const fileHash = crypto.createHash('sha256').update(buffer).digest('hex');
        
        // Check if file already exists
        const existingFile = await FileRecord.findOne({ 
          fileHash,
          walletAddress: req.user.walletAddress 
        });
        
        if (existingFile) {
          return res.json({
            message: 'File already exists',
            isDuplicate: true,
            fileRecord: {
              id: existingFile._id,
              pinataCid: existingFile.pinataCid,
              pieceCid: existingFile.pieceCid,
              pinataStatus: existingFile.pinataStatus,
              filecoinStatus: existingFile.filecoinStatus,
              originalName: existingFile.originalName,
              fileSize: existingFile.fileSize,
              createdAt: existingFile.createdAt
            }
          });
        }
        
        // Upload to Pinata
        console.log(`Uploading file to Pinata: ${originalname} (${size} bytes)`);
        
        const pinataMetadata = {
          walletAddress: req.user.walletAddress,
          uploadedAt: new Date().toISOString(),
          ...parsedMetadata
        };
        
        const pinataResult = await pinataService.uploadFile(
          buffer, 
          originalname, 
          pinataMetadata
        );
        
        console.log(`Pinata upload successful: ${pinataResult.pinataCid}`);
        
        // Create file record in database
        const fileRecord = await FileRecord.create({
          walletAddress: req.user.walletAddress,
          originalName: originalname,
          fileSize: size,
          mimeType: mimetype,
          fileHash,
          pinataCid: pinataResult.pinataCid,
          pinataStatus: 'pinned',
          pinataTimestamp: new Date(pinataResult.timestamp),
          filecoinStatus: 'queued',
          metadata: parsedMetadata
        });
        
        console.log(`File record created: ${fileRecord._id}`);
        
        // Queue Filecoin migration (async)
        setImmediate(async () => {
          try {
            await migrateToFilecoin(fileRecord._id);
          } catch (error) {
            console.error('Background Filecoin migration failed:', error);
          }
        });
        
        res.status(201).json({
          message: 'File uploaded successfully',
          fileRecord: {
            id: fileRecord._id,
            pinataCid: fileRecord.pinataCid,
            pinataStatus: fileRecord.pinataStatus,
            filecoinStatus: fileRecord.filecoinStatus,
            originalName: fileRecord.originalName,
            fileSize: fileRecord.fileSize,
            mimeType: fileRecord.mimeType,
            createdAt: fileRecord.createdAt,
            metadata: fileRecord.metadata
          }
        });
        
      } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ error: error.message });
      }
    });
  }
);

/**
 * Background function to migrate file to Filecoin
 */
async function migrateToFilecoin(fileRecordId) {
  try {
    console.log(`Starting Filecoin migration for file record: ${fileRecordId}`);
    
    const fileRecord = await FileRecord.findById(fileRecordId);
    if (!fileRecord) {
      throw new Error('File record not found');
    }
    
    // Update status to uploading
    fileRecord.filecoinStatus = 'uploading';
    fileRecord.lastMigrationAttempt = new Date();
    fileRecord.migrationAttempts += 1;
    await fileRecord.save();
    
    // Check if Filecoin service is ready
    if (!filecoinService.isPaymentSetup()) {
      throw new Error('Filecoin payment setup required');
    }
    
    // Upload to Filecoin
    const filecoinResult = await filecoinService.uploadToFilecoin(
      fileRecord.pinataCid,
      {
        originalName: fileRecord.originalName,
        walletAddress: fileRecord.walletAddress,
        fileHash: fileRecord.fileHash
      }
    );
    
    // Update file record with Filecoin details
    fileRecord.pieceCid = filecoinResult.pieceCid;
    fileRecord.dealId = filecoinResult.dealId;
    fileRecord.filecoinStatus = 'completed';
    fileRecord.filecoinTimestamp = new Date();
    fileRecord.migrationError = null;
    await fileRecord.save();
    
    console.log(`✅ Filecoin migration completed: ${filecoinResult.pieceCid}`);
    
  } catch (error) {
    console.error('Filecoin migration failed:', error);
    
    // Update error status
    try {
      const fileRecord = await FileRecord.findById(fileRecordId);
      if (fileRecord) {
        fileRecord.filecoinStatus = 'failed';
        fileRecord.migrationError = error.message;
        await fileRecord.save();
      }
    } catch (updateError) {
      console.error('Failed to update error status:', updateError);
    }
  }
}

/**
 * POST /api/upload/retry/:fileId
 * Retry failed Filecoin migration
 */
router.post('/retry/:fileId',
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
      
      if (fileRecord.filecoinStatus === 'completed') {
        return res.status(400).json({ 
          error: 'File already migrated to Filecoin' 
        });
      }
      
      if (fileRecord.migrationAttempts >= 3) {
        return res.status(400).json({ 
          error: 'Maximum retry attempts exceeded' 
        });
      }
      
      // Reset status and retry
      fileRecord.filecoinStatus = 'queued';
      fileRecord.migrationError = null;
      await fileRecord.save();
      
      // Queue migration
      setImmediate(async () => {
        try {
          await migrateToFilecoin(fileRecord._id);
        } catch (error) {
          console.error('Retry migration failed:', error);
        }
      });
      
      res.json({ 
        message: 'Migration retry queued',
        fileId: fileRecord._id,
        status: 'queued'
      });
      
    } catch (error) {
      console.error('Retry migration error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/upload/files
 * List user's uploaded files
 */
router.get('/files',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { page = 1, limit = 20, status, reportId, caseId } = req.query;
      
      const query = { walletAddress: req.user.walletAddress };
      
      if (status) {
        if (status === 'pinata') query.pinataStatus = 'pinned';
        else if (status === 'filecoin') query.filecoinStatus = 'completed';
        else if (status === 'failed') query.filecoinStatus = 'failed';
        else if (status === 'uploading') query.filecoinStatus = 'uploading';
      }
      
      if (reportId) query['metadata.reportId'] = reportId;
      if (caseId) query['metadata.caseId'] = caseId;
      
      const files = await FileRecord.find(query)
        .select('-__v')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
      
      const total = await FileRecord.countDocuments(query);
      
      res.json({
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
      
    } catch (error) {
      console.error('List files error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * DELETE /api/upload/:fileId
 * Delete file (unpin from Pinata, keep record for auditing)
 */
router.delete('/:fileId',
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
      
      // Unpin from Pinata if still pinned
      if (fileRecord.pinataStatus === 'pinned') {
        try {
          await pinataService.unpinFile(fileRecord.pinataCid);
          fileRecord.pinataStatus = 'unpinned';
          await fileRecord.save();
        } catch (unpinError) {
          console.error('Failed to unpin from Pinata:', unpinError);
          // Continue with deletion even if unpin fails
        }
      }
      
      res.json({ 
        message: 'File deleted successfully',
        fileId: fileRecord._id,
        pinataCid: fileRecord.pinataCid,
        status: 'deleted'
      });
      
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;