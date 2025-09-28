import dotenv from 'dotenv';
import filecoinService from './services/filecoinService.js';

// Load environment variables
dotenv.config();

async function testFilecoinInitialization() {
  console.log('🔧 Testing Filecoin Service Initialization...\n');

  try {
    // Test initialization
    console.log('Step 1: Initialize Filecoin Service');
    await filecoinService.initialize();
    
    // Check if initialized
    console.log('\nStep 2: Check Initialization Status');
    console.log(`✅ Is Initialized: ${filecoinService.isInitialized()}`);
    console.log(`⚙️ Is Payment Setup: ${filecoinService.isPaymentSetup()}`);

    // Test wallet balance check
    console.log('\nStep 3: Check Wallet Balance');
    const balance = await filecoinService.getWalletBalance();
    console.log(`💰 Wallet Balance:`, balance);

    // Test payment status
    console.log('\nStep 4: Get Payment Status');
    const paymentStatus = await filecoinService.getPaymentStatus();
    console.log(`📊 Payment Status:`, paymentStatus);

    // Test service readiness
    console.log('\nStep 5: Check Service Readiness');
    const serviceReady = await filecoinService.isServiceReady();
    console.log(`🚀 Service Ready:`, serviceReady);

    console.log('\n✅ All tests passed! Filecoin service is working correctly.');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the test
testFilecoinInitialization();