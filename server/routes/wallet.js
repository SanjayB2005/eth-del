import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ethers } from 'ethers';

const router = express.Router();

// Generate nonce for wallet authentication
router.post('/nonce', async (req, res) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate Ethereum address format
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Generate a random nonce
    const nonce = crypto.randomBytes(32).toString('hex');

    // Find or create user
    let user = await User.findOne({ walletAddress: normalizedAddress });
    
    if (!user) {
      user = new User({
        walletAddress: normalizedAddress,
        nonce,
        isVerified: false
      });
    } else {
      user.nonce = nonce;
    }

    await user.save();

    res.json({ 
      nonce,
      message: `Sign this message to authenticate with ETH-DEL: ${nonce}`,
      exists: !!user.isVerified
    });

  } catch (error) {
    console.error('Error generating nonce:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify wallet signature and authenticate
router.post('/verify', async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body;

    if (!walletAddress || !signature || !nonce) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Find user by wallet address
    const user = await User.findOne({ walletAddress: normalizedAddress });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify the nonce matches
    if (user.nonce !== nonce) {
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    try {
      // Verify the signature
      const message = `Sign this message to authenticate with ETH-DEL: ${nonce}`;
      const recoveredAddress = ethers.verifyMessage(message, signature);
      
      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      // Update user verification status and last login
      user.isVerified = true;
      user.lastLogin = new Date();
      // Generate new nonce for security
      user.nonce = crypto.randomBytes(32).toString('hex');
      
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          walletAddress: normalizedAddress,
          role: user.role 
        },
        process.env.JWT_SECRET || 'your_jwt_secret_change_in_production',
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });

    } catch (signatureError) {
      console.error('Signature verification failed:', signatureError);
      return res.status(400).json({ error: 'Invalid signature' });
    }

  } catch (error) {
    console.error('Error verifying wallet:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user profile (protected route)
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      });

    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid token' });
    }

  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Simple wallet connectivity check without authentication
router.get('/check/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    // Validate Ethereum address format
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Check if user exists in database
    const user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      return res.json({ 
        connected: false, 
        needsAuthentication: true,
        message: 'Wallet not registered. Please sign in to register.'
      });
    }

    if (!user.isVerified) {
      return res.json({ 
        connected: false, 
        needsAuthentication: true,
        message: 'Wallet found but not verified. Please complete authentication.'
      });
    }

    // User exists and is verified
    return res.json({ 
      connected: true,
      needsAuthentication: false,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Error checking wallet connectivity:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check wallet connectivity (no auth required)
router.get('/check/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    // Validate wallet address format
    if (!walletAddress || !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ 
        connected: false, 
        message: 'Invalid wallet address format' 
      });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Check if user exists and is verified in database
    const user = await User.findOne({ walletAddress: normalizedAddress });
    
    if (!user) {
      return res.json({
        connected: false,
        needsAuthentication: true,
        message: 'Wallet not registered. Please connect your wallet to register.'
      });
    }
    
    if (!user.isVerified) {
      return res.json({
        connected: false,
        needsAuthentication: true,
        message: 'Wallet not verified. Please complete the authentication process.'
      });
    }

    // User exists and is verified
    res.json({
      connected: true,
      user: {
        id: user._id,
        walletAddress: user.walletAddress,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Error checking wallet connectivity:', error);
    res.status(500).json({ 
      connected: false, 
      message: 'Server error while checking wallet connectivity' 
    });
  }
});

export default router;