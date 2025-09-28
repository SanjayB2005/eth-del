import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import filecoinService from './services/filecoinService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3002;

// Basic middleware
app.use(cors());
app.use(express.json());

async function startSimpleServer() {
  try {
    console.log('🚀 Starting simplified server for Filecoin testing...\n');

    // Initialize only Filecoin service
    console.log('📡 Initializing Filecoin service...');
    await filecoinService.initialize();
    console.log('✅ Filecoin service initialized\n');

    // Add a simple test endpoint
    app.get('/test-filecoin', async (req, res) => {
      try {
        const status = {
          initialized: filecoinService.isInitialized(),
          paymentSetup: filecoinService.isPaymentSetup(),
        };

        if (filecoinService.isInitialized()) {
          status.balance = await filecoinService.getWalletBalance();
          status.paymentStatus = await filecoinService.getPaymentStatus();
          status.serviceReady = await filecoinService.isServiceReady();
        }

        res.json({
          success: true,
          status,
          message: 'Filecoin service test successful'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message,
          stack: error.stack
        });
      }
    });

    // Add health check
    app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
          filecoin: filecoinService.isInitialized()
        }
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Simplified test server running on port ${PORT}`);
      console.log(`📊 Test endpoint: http://localhost:${PORT}/test-filecoin`);
      console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    console.error('❌ Failed to start simplified server:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Start the simplified server
startSimpleServer();