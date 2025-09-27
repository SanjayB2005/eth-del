import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';

// Load environment variables
dotenv.config();

// Import services
import pinataService from './services/pinataService.js';
import filecoinService from './services/filecoinService.js';
import authService from './services/authService.js';

// Import routes
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import statusRoutes from './routes/status.js';
import walletRoutes from './routes/wallet.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:3000',
    'http://localhost:3030',  // Add support for port 3030
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3030',  // Add support for 127.0.0.1:3030
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:3002',
    'http://127.0.0.1:3002'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Make upload middleware available globally
app.locals.upload = upload;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eth-del', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Initialize services
async function initializeServices() {
  try {
    console.log('Initializing services...');
    
    // Initialize Pinata service
    await pinataService.initialize();
    console.log('✅ Pinata service initialized');
    
    // Initialize Filecoin service
    await filecoinService.initialize();
    if (filecoinService.isInitialized()) {
      console.log('✅ Filecoin service initialized');
    } else {
      console.log('⚠️  Filecoin service disabled (check configuration)');
    }
    
  } catch (error) {
    console.error('❌ Service initialization failed:', error);
    process.exit(1);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/wallet', walletRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      pinata: pinataService.isInitialized(),
      filecoin: filecoinService.isInitialized()
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  try {
    await initializeServices();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await filecoinService.cleanup();
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await filecoinService.cleanup();
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
  process.exit(0);
});

startServer();