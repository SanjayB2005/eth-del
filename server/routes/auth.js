import express from 'express';
import authService from '../services/authService.js';

const router = express.Router();

/**
 * GET /api/auth/nonce/:walletAddress
 * Get nonce for wallet authentication
 */
router.get('/nonce/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }
    
    const result = await authService.getNonceForWallet(walletAddress);
    res.json(result);
  } catch (error) {
    console.error('Get nonce error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/verify
 * Verify signature and issue JWT token
 */
router.post('/verify', async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;
    
    // Validate required fields
    if (!walletAddress || !signature || !nonce) {
      return res.status(400).json({ 
        error: 'Missing required fields: walletAddress, signature, nonce' 
      });
    }
    
    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }
    
    // Validate signature format
    if (!/^0x[a-fA-F0-9]{130}$/.test(signature)) {
      return res.status(400).json({ error: 'Invalid signature format' });
    }
    
    const result = await authService.verifySignatureAndIssueToken(
      walletAddress, 
      signature, 
      nonce
    );
    
    res.json(result);
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(401).json({ error: error.message });
  }
});

/**
 * GET /api/auth/profile
 * Get current user profile (requires authentication)
 */
router.get('/profile', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    const profile = await authService.getUserProfile(req.user.walletAddress);
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/role
 * Update user role (admin only)
 */
router.post('/role', 
  authService.authenticateToken.bind(authService),
  authService.requireRole('admin'),
  async (req, res) => {
    try {
      const { walletAddress, role } = req.body;
      
      if (!walletAddress || !role) {
        return res.status(400).json({ 
          error: 'Missing required fields: walletAddress, role' 
        });
      }
      
      const validRoles = ['victim', 'police', 'admin'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ 
          error: `Invalid role. Must be one of: ${validRoles.join(', ')}` 
        });
      }
      
      const result = await authService.updateUserRole(
        walletAddress, 
        role, 
        req.user.walletAddress
      );
      
      res.json(result);
    } catch (error) {
      console.error('Update role error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * GET /api/auth/users
 * List all users (admin only)
 */
router.get('/users',
  authService.authenticateToken.bind(authService),
  authService.requireRole('admin'),
  async (req, res) => {
    try {
      const { page = 1, limit = 50, role } = req.query;
      
      const options = {
        page: parseInt(page),
        limit: Math.min(parseInt(limit), 100), // Max 100 per page
        role
      };
      
      const result = await authService.listUsers(req.user.walletAddress, options);
      res.json(result);
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh JWT token (requires valid token)
 */
router.post('/refresh', authService.authenticateToken.bind(authService), async (req, res) => {
  try {
    // Generate new token with same user data
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      {
        userId: req.user.userId,
        walletAddress: req.user.walletAddress,
        role: req.user.role
      },
      process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/verify-token
 * Verify if current token is valid
 */
router.get('/verify-token', authService.authenticateToken.bind(authService), (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

export default router;