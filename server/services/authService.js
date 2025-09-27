import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ethers } from 'ethers';
import User from '../models/User.js';

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_change_in_production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
  }

  /**
   * Generate a random nonce for wallet signature
   */
  generateNonce() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get or create user with nonce for wallet authentication
   */
  async getNonceForWallet(walletAddress) {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      let user = await User.findOne({ walletAddress: normalizedAddress });
      
      if (!user) {
        // Create new user
        const nonce = this.generateNonce();
        user = await User.create({
          walletAddress: normalizedAddress,
          nonce,
          isVerified: false
        });
      } else {
        // Generate new nonce for existing user
        user.nonce = this.generateNonce();
        await user.save();
      }
      
      return {
        walletAddress: user.walletAddress,
        nonce: user.nonce,
        message: `Please sign this message to authenticate with ETH-DEL: ${user.nonce}`
      };
    } catch (error) {
      console.error('Error getting nonce for wallet:', error);
      throw new Error('Failed to generate authentication nonce');
    }
  }

  /**
   * Verify wallet signature and issue JWT token
   */
  async verifySignatureAndIssueToken(walletAddress, signature, nonce) {
    try {
      const normalizedAddress = walletAddress.toLowerCase();
      
      // Find user with this wallet and nonce
      const user = await User.findOne({ 
        walletAddress: normalizedAddress,
        nonce: nonce
      });
      
      if (!user) {
        throw new Error('Invalid nonce or wallet address');
      }
      
      // Verify the signature
      const message = `Please sign this message to authenticate with ETH-DEL: ${nonce}`;
      const messageHash = ethers.hashMessage(message);
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);
      
      if (recoveredAddress.toLowerCase() !== normalizedAddress) {
        throw new Error('Invalid signature');
      }
      
      // Update user as verified and generate new nonce for next auth
      user.isVerified = true;
      user.lastLogin = new Date();
      user.nonce = this.generateNonce(); // Invalidate current nonce
      await user.save();
      
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          walletAddress: user.walletAddress,
          role: user.role
        },
        this.jwtSecret,
        { expiresIn: this.jwtExpiresIn }
      );
      
      return {
        token,
        user: {
          id: user._id,
          walletAddress: user.walletAddress,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      };
    } catch (error) {
      console.error('Signature verification failed:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Verify JWT token and return user data
   */
  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Get fresh user data from database
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isVerified) {
        throw new Error('User not found or not verified');
      }
      
      return {
        userId: user._id,
        walletAddress: user.walletAddress,
        role: user.role,
        isVerified: user.isVerified
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid token');
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else {
        throw new Error(`Token verification failed: ${error.message}`);
      }
    }
  }

  /**
   * Middleware to protect routes
   */
  authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    this.verifyToken(token)
      .then(user => {
        req.user = user;
        next();
      })
      .catch(error => {
        res.status(403).json({ error: error.message });
      });
  }

  /**
   * Middleware to check user role
   */
  requireRole(requiredRole) {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      if (req.user.role !== requiredRole && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      
      next();
    };
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(walletAddress, newRole, adminWalletAddress) {
    try {
      // Verify admin permissions
      const admin = await User.findOne({ walletAddress: adminWalletAddress.toLowerCase() });
      if (!admin || admin.role !== 'admin') {
        throw new Error('Admin permissions required');
      }
      
      const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
      if (!user) {
        throw new Error('User not found');
      }
      
      user.role = newRole;
      await user.save();
      
      return {
        walletAddress: user.walletAddress,
        role: user.role,
        updatedAt: new Date()
      };
    } catch (error) {
      console.error('Error updating user role:', error);
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(walletAddress) {
    try {
      const user = await User.findOne({ 
        walletAddress: walletAddress.toLowerCase() 
      }).select('-nonce');
      
      if (!user) {
        throw new Error('User not found');
      }
      
      return {
        id: user._id,
        walletAddress: user.walletAddress,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  /**
   * List all users (admin only)
   */
  async listUsers(adminWalletAddress, options = {}) {
    try {
      // Verify admin permissions
      const admin = await User.findOne({ walletAddress: adminWalletAddress.toLowerCase() });
      if (!admin || admin.role !== 'admin') {
        throw new Error('Admin permissions required');
      }
      
      const { page = 1, limit = 50, role } = options;
      const skip = (page - 1) * limit;
      
      let query = {};
      if (role) {
        query.role = role;
      }
      
      const users = await User.find(query)
        .select('-nonce')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await User.countDocuments(query);
      
      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error listing users:', error);
      throw new Error(`Failed to list users: ${error.message}`);
    }
  }
}

export default new AuthService();