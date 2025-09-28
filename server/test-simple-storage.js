#!/usr/bin/env node

import dotenv from 'dotenv';
import filecoinService from './services/filecoinService.js';

// Load environment variables
dotenv.config();

const PINATA_CID = 'QmfBN9841MyA7fWUp7kzS7xaJo6X3nUBDhE6eAoDjn6c78';
const WALLET_ADDRESS = '0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89';

async function testSimpleStorage() {
  console.log('🧪 Testing Filecoin Storage with your Pinata CID...\n');
  console.log(`📄 Pinata CID: ${PINATA_CID}`);
  console.log(`💰 Wallet: ${WALLET_ADDRESS}\n`);
  
  try {
    // Initialize Filecoin service only
    console.log('1️⃣ Initializing Filecoin service...');
    await filecoinService.initialize();
    console.log('✅ Filecoin service initialized\n');
    
    // Check payment status
    console.log('2️⃣ Checking payment status...');
    const paymentStatus = await filecoinService.getPaymentStatus();
    console.log(`✅ Payment Status: ${paymentStatus.status}`);
    console.log(`✅ Balance: ${paymentStatus.balance.fil} tFIL`);
    console.log(`✅ Ready: ${paymentStatus.isSetup ? 'YES' : 'NO'}\n`);
    
    if (!paymentStatus.isSetup) {
      console.log('⚠️  Payment setup required. Setting up now...');
      const setupResult = await filecoinService.setupPayments(WALLET_ADDRESS);
      console.log(`✅ Setup: ${setupResult.message}\n`);
    }
    
    // Upload to Filecoin storage
    console.log('3️⃣ Uploading to Filecoin storage...');
    console.log(`   📤 Migrating Pinata CID: ${PINATA_CID}`);
    
    const uploadResult = await filecoinService.uploadToFilecoin(PINATA_CID, {
      storageDuration: 365,
      paymentMethod: 'tFIL',
      walletAddress: WALLET_ADDRESS,
      testFile: true,
      originalFileName: 'test-file.txt'
    });
    
    console.log('\n🎉 FILECOIN STORAGE COMPLETE!\n');
    
    console.log('📋 YOUR EXTRACTED VALUES:');
    console.log(`   🎯 Piece CID: ${uploadResult.pieceCid}`);
    console.log(`   🎯 Deal ID: ${uploadResult.dealId}`);
    console.log(`   🎯 Provider: ${uploadResult.provider || 'f01234'}`);
    console.log(`   🎯 File Size: ${uploadResult.fileSize} bytes`);
    console.log(`   🎯 Timestamp: ${uploadResult.timestamp}`);
    console.log(`   🎯 Simulated: ${uploadResult.simulated}`);
    
    console.log('\n🔍 VERIFY ON FILECOIN EXPLORER:');
    if (uploadResult.dealId) {
      console.log(`   Deal ID: https://calibration.filfox.info/en/deal/${uploadResult.dealId}`);
    }
    console.log(`   Piece CID: Search for "${uploadResult.pieceCid}" on Filfox`);
    
    console.log('\n📊 STORAGE SUMMARY:');
    console.log(`   • Pinata CID: ${PINATA_CID}`);
    console.log(`   • Piece CID: ${uploadResult.pieceCid}`);
    console.log(`   • Deal ID: ${uploadResult.dealId}`);
    console.log(`   • Provider: ${uploadResult.provider || 'f01234'}`);
    console.log(`   • Network: Filecoin Calibration Testnet`);
    console.log(`   • Status: ${uploadResult.simulated ? 'SIMULATED' : 'REAL STORAGE'}`);
    
    console.log('\n✅ SUCCESS: Your file storage data extracted!');
    
    return uploadResult;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Error details:', error);
    return null;
  }
}

// Run the test
testSimpleStorage().then(result => {
  if (result) {
    console.log('\n🚀 You now have your Piece CID and Deal ID!');
    console.log('Use these values to verify on Filecoin explorer.');
  } else {
    console.log('\n❌ Could not extract storage data');
  }
}).catch(console.error);
