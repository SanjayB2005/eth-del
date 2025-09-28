import dotenv from 'dotenv';
import filecoinService from './services/filecoinService.js';

// Load environment variables
dotenv.config();

async function setupFilecoinPayments() {
  console.log('🔧 Filecoin Payment Setup Helper\n');

  try {
    // Initialize service
    console.log('Step 1: Initialize Filecoin Service');
    await filecoinService.initialize();
    console.log('✅ Service initialized\n');

    // Check current status
    console.log('Step 2: Check Current Status');
    const paymentStatus = await filecoinService.getPaymentStatus();
    console.log('📊 Payment Status:');
    console.log(`   - Setup: ${paymentStatus.isSetup}`);
    console.log(`   - Wallet: ${paymentStatus.walletAddress}`);
    console.log(`   - Balance: ${paymentStatus.balance.fil} ${paymentStatus.balance.token}`);
    console.log(`   - Required: ${paymentStatus.balance.minRequired} ${paymentStatus.balance.token}`);
    console.log(`   - Status: ${paymentStatus.status}`);
    console.log(`   - Message: ${paymentStatus.message}\n`);

    if (!paymentStatus.isSetup) {
      console.log('❌ Payment setup required!\n');
      
      console.log('📋 Next Steps:');
      console.log(`1. Get tFIL tokens from: ${paymentStatus.faucetUrl}`);
      console.log(`2. Send tokens to wallet: ${paymentStatus.walletAddress}`);
      console.log(`3. Run this script again to verify`);
      console.log(`4. Or call the setup API: POST /api/status/setup-payments\n`);
      
      return;
    }

    // If setup is complete, try to setup payments
    console.log('Step 3: Setup Payments');
    const setupResult = await filecoinService.setupPayments();
    console.log('✅ Payment setup result:', setupResult);

    console.log('\n🎉 Payment setup completed! You can now migrate files to Filecoin.');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    if (error.message.includes('Insufficient tFIL balance')) {
      console.log('\n💡 Solution:');
      console.log('1. Visit: https://faucet.calibration.fildev.network/');
      console.log('2. Enter your wallet address and request tokens');
      console.log('3. Wait 2-5 minutes for tokens to arrive');
      console.log('4. Run this script again');
    }
  }
}

// Run the setup
setupFilecoinPayments();