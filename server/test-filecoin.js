#!/usr/bin/env node

/**
 * Filecoin Integration Test Script
 * 
 * This script tests the Filecoin storage implementation with Synapse SDK
 * Run with: node test-filecoin.js
 */

import filecoinService from './services/filecoinService.js';
import pinataService from './services/pinataService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const testFilecoinIntegration = async () => {
  console.log('🧪 Starting Filecoin Integration Tests...\n');

  try {
    // Test 1: Initialize Services
    console.log('1️⃣  Testing service initialization...');
    await pinataService.initialize();
    console.log('✅ Pinata service initialized');
    
    await filecoinService.initialize();
    if (filecoinService.isInitialized()) {
      console.log('✅ Filecoin service initialized');
    } else {
      console.log('⚠️  Filecoin service not initialized (check configuration)');
      return;
    }

    // Test 2: Check Payment Status
    console.log('\n2️⃣  Testing payment status...');
    const paymentStatus = await filecoinService.getPaymentStatus();
    console.log('Payment Status:', JSON.stringify(paymentStatus, null, 2));

    // Test 3: Check Wallet Balance
    console.log('\n3️⃣  Testing wallet balance...');
    const balance = await filecoinService.getWalletBalance();
    console.log('Wallet Balance:', JSON.stringify(balance, null, 2));

    // Test 4: Check Service Readiness
    console.log('\n4️⃣  Testing service readiness...');
    const serviceReady = await filecoinService.isServiceReady();
    console.log('Service Ready:', JSON.stringify(serviceReady, null, 2));

    // Test 5: Test File Upload (if service is ready)
    if (serviceReady.ready) {
      console.log('\n5️⃣  Testing file upload to Pinata...');
      
      // Create a test file
      const testContent = `Test file for Filecoin integration - ${new Date().toISOString()}`;
      const testBuffer = Buffer.from(testContent, 'utf8');
      
      const pinataResult = await pinataService.uploadFile(
        testBuffer, 
        'test-file.txt',
        { testType: 'filecoin-integration' }
      );
      
      console.log('✅ Pinata upload successful:', pinataResult.pinataCid);

      // Test 6: Migrate to Filecoin
      console.log('\n6️⃣  Testing migration to Filecoin...');
      const filecoinResult = await filecoinService.uploadToFilecoin(
        pinataResult.pinataCid,
        { testType: 'filecoin-integration' }
      );
      
      console.log('✅ Filecoin upload successful:', filecoinResult.pieceCid);

      // Test 7: Download from Filecoin
      console.log('\n7️⃣  Testing download from Filecoin...');
      const downloadedBuffer = await filecoinService.downloadFromFilecoin(filecoinResult.pieceCid);
      const downloadedContent = downloadedBuffer.toString('utf8');
      
      if (downloadedContent === testContent) {
        console.log('✅ Filecoin download successful - content matches');
      } else {
        console.log('❌ Filecoin download failed - content mismatch');
      }

      // Test 8: Check Deal Status
      console.log('\n8️⃣  Testing deal status...');
      const dealStatus = await filecoinService.checkDealStatus(filecoinResult.pieceCid);
      console.log('Deal Status:', JSON.stringify(dealStatus, null, 2));

    } else {
      console.log('\n⚠️  Skipping file upload tests - service not ready');
      console.log('Reason:', serviceReady.reason);
      
      if (!paymentStatus.isSetup) {
        console.log('\n💡 To enable Filecoin operations:');
        console.log('   1. Get test FIL tokens from faucet');
        console.log('   2. Call POST /api/filecoin/setup endpoint');
        console.log('   3. Wait for transaction confirmations');
      }
    }

    console.log('\n🎉 Filecoin integration tests completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cleanup
    try {
      await filecoinService.cleanup();
      console.log('🧹 Cleanup completed');
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
  }
};

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testFilecoinIntegration().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
}

export { testFilecoinIntegration };
