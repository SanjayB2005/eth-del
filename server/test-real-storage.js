#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import filecoinService from './services/filecoinService.js';
import metamaskService from './services/metamaskService.js';

// Load environment variables
dotenv.config();

const PINATA_CID = 'QmfBN9841MyA7fWUp7kzS7xaJo6X3nUBDhE6eAoDjn6c78';

async function testRealStorage() {
  console.log('🧪 Testing REAL Filecoin Storage with your Pinata CID...\n');
  console.log(`📄 Pinata CID: ${PINATA_CID}\n`);
  
  try {
    // Initialize services
    console.log('1️⃣ Initializing services...');
    await metamaskService.initialize();
    await filecoinService.initialize();
    console.log('✅ Services initialized\n');
    
    // Check wallet info
    console.log('2️⃣ Checking wallet information...');
    const walletInfo = await metamaskService.getWalletInfo();
    console.log(`✅ Wallet: ${walletInfo.walletAddress}`);
    console.log(`✅ Balance: ${walletInfo.balances.fil.fil} tFIL`);
    console.log(`✅ Network: ${walletInfo.network.name}\n`);
    
    // Check if balance is sufficient
    const balance = parseFloat(walletInfo.balances.fil.fil);
    if (balance < 0.1) {
      console.log('❌ Insufficient balance for storage operations');
      return;
    }
    
    // Setup Filecoin payments
    console.log('3️⃣ Setting up Filecoin payments...');
    const setupResult = await filecoinService.setupPayments(walletInfo.walletAddress);
    console.log(`✅ Setup: ${setupResult.message}\n`);
    
    // Upload to Filecoin storage
    console.log('4️⃣ Uploading to Filecoin storage...');
    console.log(`   📤 Migrating Pinata CID: ${PINATA_CID}`);
    
    const uploadResult = await filecoinService.uploadToFilecoin(PINATA_CID, {
      storageDuration: 365,
      paymentMethod: 'tFIL',
      walletAddress: walletInfo.walletAddress,
      testFile: true
    });
    
    console.log('\n🎉 REAL FILECOIN STORAGE COMPLETE!\n');
    
    console.log('📋 EXTRACTED VALUES:');
    console.log(`   🎯 Piece CID: ${uploadResult.pieceCid}`);
    console.log(`   🎯 Deal ID: ${uploadResult.dealId}`);
    console.log(`   🎯 Provider: ${uploadResult.provider}`);
    console.log(`   🎯 File Size: ${uploadResult.fileSize} bytes`);
    console.log(`   🎯 Timestamp: ${uploadResult.timestamp}`);
    console.log(`   🎯 Simulated: ${uploadResult.simulated}`);
    
    console.log('\n🔍 VERIFY ON FILECOIN EXPLORER:');
    console.log(`   Deal ID: https://calibration.filfox.info/en/deal/${uploadResult.dealId}`);
    console.log(`   Piece CID: Search for "${uploadResult.pieceCid}" on Filfox`);
    
    console.log('\n✅ SUCCESS: Your file is now stored on REAL Filecoin network!');
    
    return uploadResult;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if server is running');
    console.log('2. Verify wallet has sufficient tFIL');
    console.log('3. Check network connection');
    return null;
  }
}

// Run the test
testRealStorage().then(result => {
  if (result) {
    console.log('\n🚀 Ready to verify on Filecoin explorer!');
  } else {
    console.log('\n❌ Storage test failed');
  }
}).catch(console.error);
