import express from 'express';
import authService from '../services/authService.js';
import metamaskService from '../services/metamaskService.js';
import filecoinService from '../services/filecoinService.js';

const router = express.Router();

/**
 * GET /api/metamask/status
 * Get MetaMask wallet status and balance
 */
router.get('/status',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      await metamaskService.initialize();
      
      const balance = await metamaskService.getBalance();
      const networkInfo = await metamaskService.getNetworkInfo();
      const filecoinStatus = await filecoinService.getPaymentStatus();
      
      res.json({
        metamask: {
          walletAddress: metamaskService.getWalletAddress(),
          balance,
          network: networkInfo,
          initialized: metamaskService.isInitialized()
        },
        filecoin: filecoinStatus
      });
    } catch (error) {
      console.error('MetaMask status error:', error);
      res.status(500).json({ 
        error: 'Failed to get MetaMask status', 
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/metamask/balance
 * Get wallet balance in FIL
 */
router.get('/balance',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      await metamaskService.initialize();
      const balance = await metamaskService.getBalance();
      
      res.json({
        balance,
        walletAddress: metamaskService.getWalletAddress()
      });
    } catch (error) {
      console.error('Balance check error:', error);
      res.status(500).json({ 
        error: 'Failed to get balance', 
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/metamask/transactions
 * Get recent transaction history
 */
router.get('/transactions',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { limit = 10 } = req.query;
      
      await metamaskService.initialize();
      const transactions = await metamaskService.getTransactionHistory(parseInt(limit));
      
      res.json({
        transactions,
        walletAddress: metamaskService.getWalletAddress(),
        count: transactions.length
      });
    } catch (error) {
      console.error('Transaction history error:', error);
      res.status(500).json({ 
        error: 'Failed to get transaction history', 
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/metamask/network
 * Get network information
 */
router.get('/network',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      await metamaskService.initialize();
      const networkInfo = await metamaskService.getNetworkInfo();
      
      res.json({
        network: networkInfo,
        walletAddress: metamaskService.getWalletAddress()
      });
    } catch (error) {
      console.error('Network info error:', error);
      res.status(500).json({ 
        error: 'Failed to get network info', 
        details: error.message 
      });
    }
  }
);

/**
 * POST /api/metamask/setup-filecoin
 * Setup Filecoin payments using MetaMask wallet
 */
router.post('/setup-filecoin',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      console.log('🔧 Setting up Filecoin payments with MetaMask wallet...');
      
      await metamaskService.initialize();
      await filecoinService.initialize();
      
      // Check if we have sufficient FIL balance
      const balance = await metamaskService.getBalance();
      const minBalance = 1.0; // Minimum 1 FIL for operations
      
      if (parseFloat(balance.fil) < minBalance) {
        return res.status(400).json({
          error: 'Insufficient FIL balance',
          currentBalance: balance.fil,
          minimumRequired: minBalance.toString(),
          walletAddress: metamaskService.getWalletAddress(),
          faucetUrl: 'https://faucet.calibration.fildev.network/'
        });
      }
      
      // Setup Filecoin payments
      const results = await filecoinService.setupPayments(metamaskService.getWalletAddress());
      
      res.json({
        message: 'Filecoin payment setup completed successfully',
        walletAddress: metamaskService.getWalletAddress(),
        balance: balance.fil,
        results
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
 * POST /api/metamask/estimate-gas
 * Estimate gas for a transaction
 */
router.post('/estimate-gas',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { to, value } = req.body;
      
      if (!to || !value) {
        return res.status(400).json({
          error: 'Missing required fields: to, value'
        });
      }
      
      await metamaskService.initialize();
      const gasEstimate = await metamaskService.estimateGas(to, value);
      
      res.json({
        gasEstimate,
        walletAddress: metamaskService.getWalletAddress()
      });
    } catch (error) {
      console.error('Gas estimation error:', error);
      res.status(500).json({ 
        error: 'Failed to estimate gas', 
        details: error.message 
      });
    }
  }
);

/**
 * GET /api/metamask/faucet-info
 * Get information about getting test FIL tokens
 */
router.get('/faucet-info',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      await metamaskService.initialize();
      
      const balance = await metamaskService.getBalance();
      const faucets = [
        {
          name: 'Calibration Faucet',
          url: 'https://faucet.calibration.fildev.network/',
          description: 'Official Filecoin Calibration testnet faucet'
        },
        {
          name: 'GLIF Faucet',
          url: 'https://faucet.calibration.glif.io/',
          description: 'Alternative faucet for test FIL tokens'
        }
      ];
      
      res.json({
        walletAddress: metamaskService.getWalletAddress(),
        currentBalance: balance.fil,
        faucets,
        instructions: [
          '1. Visit one of the faucet URLs above',
          '2. Enter your wallet address',
          `3. Request test FIL tokens (you need at least 1-2 FIL for storage operations)`,
          '4. Wait for tokens to arrive (usually within a few minutes)',
          '5. Check your balance using /api/metamask/balance'
        ]
      });
    } catch (error) {
      console.error('Faucet info error:', error);
      res.status(500).json({ 
        error: 'Failed to get faucet info', 
        details: error.message 
      });
    }
  }
);

/**
 * POST /api/metamask/send-payment
 * Send tFIL payment to a specific address
 */
router.post('/send-payment',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { toAddress, amount } = req.body;
      
      if (!toAddress || !amount) {
        return res.status(400).json({
          error: 'Missing required fields: toAddress, amount'
        });
      }
      
      await metamaskService.initialize();
      const result = await metamaskService.sendTFILPayment(toAddress, amount);
      
      res.json({
        message: 'tFIL payment sent successfully',
        result,
        walletAddress: metamaskService.getWalletAddress()
      });
    } catch (error) {
      console.error('Send payment error:', error);
      res.status(500).json({ 
        error: 'Failed to send tFIL payment', 
        details: error.message 
      });
    }
  }
);


/**
 * GET /api/metamask/wallet-info
 * Get comprehensive wallet information
 */
router.get('/wallet-info',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      await metamaskService.initialize();
      const walletInfo = await metamaskService.getWalletInfo();
      
      res.json({
        walletInfo,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Wallet info error:', error);
      res.status(500).json({ 
        error: 'Failed to get wallet info', 
        details: error.message 
      });
    }
  }
);

/**
 * POST /api/metamask/pay-for-storage
 * Complete tFIL payment flow for Filecoin storage
 */
router.post('/pay-for-storage',
  authService.authenticateToken.bind(authService),
  async (req, res) => {
    try {
      const { pinataCid, storageDuration = 365, paymentHash, walletAddress } = req.body;
      
      if (!pinataCid) {
        return res.status(400).json({
          error: 'Missing required field: pinataCid'
        });
      }
      
      console.log('🔧 Starting tFIL payment flow for Filecoin storage...');
      console.log('📄 Pinata CID:', pinataCid);
      console.log('💰 Payment Hash:', paymentHash);
      console.log('👤 Wallet Address:', walletAddress);
      
      await metamaskService.initialize();
      await filecoinService.initialize();
      
      // Step 1: Verify payment hash if provided
      if (paymentHash) {
        console.log('🔍 Verifying payment transaction...');
        try {
          const txReceipt = await metamaskService.getTransactionReceipt(paymentHash);
          if (txReceipt && txReceipt.status === 1) {
            console.log('✅ Payment transaction verified:', paymentHash);
          } else {
            console.log('⚠️ Payment transaction not confirmed yet');
          }
        } catch (error) {
          console.log('⚠️ Could not verify payment hash:', error.message);
        }
      }
      
      // Step 2: Check tFIL balance
      const walletInfo = await metamaskService.getWalletInfo();
      console.log('💰 tFIL balance:', walletInfo.balances.fil.fil);
      
      // Step 3: Calculate storage cost (simplified for testing)
      const estimatedCost = 0.001; // 0.001 tFIL per file (example)
      
      // Step 4: Check if we have sufficient tFIL
      const filBalance = parseFloat(walletInfo.balances.fil.fil);
      const minBalance = parseFloat(process.env.MIN_TFIL_BALANCE || '0.1');
      
      if (filBalance < minBalance) {
        return res.status(400).json({
          error: 'Insufficient tFIL balance for storage operations',
          currentBalance: filBalance,
          minimumRequired: minBalance,
          suggestion: 'Get test tFIL from faucet: https://faucet.calibration.fildev.network/'
        });
      }
      
      // Step 5: Setup tFIL payments (just check balance)
      console.log('🔧 Checking tFIL payment setup...');
      const setupResult = await filecoinService.setupPayments(metamaskService.getWalletAddress());
      
      // Step 6: Upload to Filecoin storage
      console.log('📤 Uploading to Filecoin storage with tFIL...');
      const uploadResult = await filecoinService.uploadToFilecoin(pinataCid, {
        storageDuration: storageDuration,
        paymentMethod: 'tFIL',
        walletAddress: walletAddress || metamaskService.getWalletAddress(),
        estimatedCost: estimatedCost,
        paymentHash: paymentHash,
        testFile: true,
        originalFileName: 'uploaded-file.txt'
      });
      
      res.json({
        message: 'tFIL storage payment completed successfully',
        paymentMethod: 'tFIL',
        walletInfo: walletInfo.balances,
        setupResult,
        uploadResult,
        estimatedCost: estimatedCost,
        storageDuration: storageDuration,
        network: 'calibration_testnet',
        paymentHash: paymentHash
      });
      
    } catch (error) {
      console.error('❌ tFIL storage payment flow error:', error);
      res.status(500).json({ 
        error: 'Failed to complete tFIL storage payment', 
        details: error.message 
      });
    }
  }
);

export default router;


