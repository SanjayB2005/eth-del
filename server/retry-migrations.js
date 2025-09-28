import dotenv from 'dotenv';
import mongoose from 'mongoose';
import FileRecord from './models/FileRecord.js';
import filecoinService from './services/filecoinService.js';

// Load environment variables
dotenv.config();

async function retryFailedMigrations() {
  console.log('🔄 Retry Failed Filecoin Migrations\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/eth-del');
    console.log('✅ Connected to MongoDB');

    // Initialize Filecoin service
    await filecoinService.initialize();
    console.log('✅ Filecoin service initialized\n');

    // Find failed migrations
    const failedFiles = await FileRecord.find({
      filecoinStatus: 'failed'
    }).sort({ updatedAt: -1 });

    console.log(`📋 Found ${failedFiles.length} failed migrations\n`);

    if (failedFiles.length === 0) {
      console.log('🎉 No failed migrations to retry!');
      return;
    }

    // Show failed files
    failedFiles.forEach((file, index) => {
      console.log(`${index + 1}. File: ${file.originalName}`);
      console.log(`   ID: ${file._id}`);
      console.log(`   Pinata CID: ${file.pinataCid}`);
      console.log(`   Error: ${file.migrationError}`);
      console.log(`   Attempts: ${file.migrationAttempts}`);
      console.log(`   Last Attempt: ${file.lastMigrationAttempt}\n`);
    });

    // Check payment status
    const paymentStatus = await filecoinService.getPaymentStatus();
    console.log('💰 Payment Status:');
    console.log(`   Setup: ${paymentStatus.isSetup ? '✅' : '❌'} ${paymentStatus.isSetup}`);
    console.log(`   Balance: ${paymentStatus.balance.fil} ${paymentStatus.balance.token}`);
    console.log(`   Message: ${paymentStatus.message}\n`);

    if (!paymentStatus.isSetup) {
      console.log('❌ Cannot retry migrations: Payment setup required');
      console.log(`📱 Get tFIL tokens: ${paymentStatus.faucetUrl}`);
      console.log(`💰 Send to wallet: ${paymentStatus.walletAddress}\n`);
      return;
    }

    // Retry each failed migration
    console.log('🚀 Starting migration retries...\n');
    
    for (const [index, file] of failedFiles.entries()) {
      try {
        console.log(`${index + 1}/${failedFiles.length} Retrying: ${file.originalName}`);
        
        // Update status
        file.filecoinStatus = 'uploading';
        file.lastMigrationAttempt = new Date();
        file.migrationAttempts += 1;
        await file.save();

        // Upload to Filecoin
        const result = await filecoinService.uploadToFilecoin(file.pinataCid, {
          originalName: file.originalName,
          walletAddress: file.walletAddress,
          fileHash: file.fileHash
        });

        // Update success
        file.pieceCid = result.pieceCid;
        file.dealId = result.dealId;
        file.filecoinStatus = 'completed';
        file.filecoinTimestamp = new Date();
        file.migrationError = null;
        await file.save();

        console.log(`   ✅ Success! Piece CID: ${result.pieceCid}`);

      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}`);
        
        // Update error
        file.filecoinStatus = 'failed';
        file.migrationError = error.message;
        await file.save();
      }
      
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Migration retry process completed!');

  } catch (error) {
    console.error('❌ Retry process failed:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  }
}

// Run the retry process
retryFailedMigrations();