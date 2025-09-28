import express from 'express';
import authService from '../services/authService.js';
import filecoinService from '../services/filecoinService.js';

const router = express.Router();

/**
 * GET /api/filecoin/status
 * Get Filecoin service status and payment information
 */
router.get('/status',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const status = await filecoinService.getPaymentStatus();
      const balance = await filecoinService.getWalletBalance();
      const serviceReady = await filecoinService.isServiceReady();
      
      res.json({
        ...status,
        balance,
        serviceReady
      });
    } catch (error) {
      console.error('Filecoin status error:', error);
      res.status(500).json({ 
        error: 'Failed to get Filecoin status', 
        details: error.message 
      });
    }
  }
);

/**
 * POST /api/filecoin/setup
 * Setup Filecoin payments (deposit USDFC and approve service)
 */
router.post('/setup',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      console.log('Setting up Filecoin payments...');
      
      const results = await filecoinService.setupPayments(req.user.walletAddress);
      
      res.json({
        message: 'Filecoin payment setup completed successfully',
        results,
        walletAddress: req.user.walletAddress
      });
    } catch (error) {
      console.error('Filecoin setup error:', error);
      res.status(500).json({ 
        error: 'Failed to setup Filecoin payments', 
        details: error.message 
      });
    }
  }
);

/**
 * POST /api/filecoin/migrate/:pinataCid
 * Migrate a specific Pinata CID to Filecoin storage
 */
router.post('/migrate/:pinataCid',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { pinataCid } = req.params;
      const { metadata = {} } = req.body;
      
      if (!pinataCid) {
        return res.status(400).json({ error: 'Pinata CID is required' });
      }
      
      console.log(`Starting Filecoin migration for CID: ${pinataCid}`);
      
      const result = await filecoinService.uploadToFilecoin(pinataCid, {
        ...metadata,
        walletAddress: req.user.walletAddress,
        migratedBy: req.user.walletAddress
      });
      
      res.json({
        message: 'File successfully migrated to Filecoin',
        result,
        pinataCid
      });
    } catch (error) {
      console.error('Filecoin migration error:', error);
      res.status(500).json({ 
        error: 'Failed to migrate to Filecoin', 
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/filecoin/download/:pieceCid
 * Download file from Filecoin using piece CID
 */
router.get('/download/:pieceCid',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { pieceCid } = req.params;
      
      if (!pieceCid) {
        return res.status(400).json({ error: 'Piece CID is required' });
      }
      
      console.log(`Downloading from Filecoin: ${pieceCid}`);
      
      const fileBuffer = await filecoinService.downloadFromFilecoin(pieceCid);
      
      // Set appropriate headers
      res.set({
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="filecoin-${pieceCid}"`,
        'Content-Length': fileBuffer.length
      });
      
      res.send(fileBuffer);
    } catch (error) {
      console.error('Filecoin download error:', error);
      res.status(500).json({ 
        error: 'Failed to download from Filecoin', 
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/filecoin/deal/:pieceCid
 * Check deal status for a piece CID
 */
router.get('/deal/:pieceCid',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { pieceCid } = req.params;
      
      if (!pieceCid) {
        return res.status(400).json({ error: 'Piece CID is required' });
      }
      
      const dealStatus = await filecoinService.checkDealStatus(pieceCid);
      
      res.json({
        pieceCid,
        dealStatus
      });
    } catch (error) {
      console.error('Deal status check error:', error);
      res.status(500).json({ 
        error: 'Failed to check deal status', 
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/filecoin/balance
 * Get wallet balance for FIL and USDFC tokens
 */
router.get('/balance',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const balance = await filecoinService.getWalletBalance();
      
      res.json({
        balance,
        walletAddress: req.user.walletAddress
      });
    } catch (error) {
      console.error('Balance check error:', error);
      res.status(500).json({ 
        error: 'Failed to get wallet balance', 
        details: error.message 
      });
    }
  }
);

/**
 * POST /api/filecoin/ready
 * Check if Filecoin service is ready for operations
 */
router.post('/ready',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const serviceReady = await filecoinService.isServiceReady();
      
      res.json({
        serviceReady,
        walletAddress: req.user.walletAddress
      });
    } catch (error) {
      console.error('Service ready check error:', error);
      res.status(500).json({ 
        error: 'Failed to check service readiness', 
        details: error.message 
      });
    }
  }
);

export default router;




