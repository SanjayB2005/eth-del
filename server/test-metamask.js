#!/usr/bin/env node

/**
 * MetaMask Integration Test Script
 * 
 * This script tests the MetaMask integration with your wallet:
 * 0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89
 */

import metamaskService from './services/metamaskService.js';
import filecoinService from './services/filecoinService.js';
import dotenv from 'dotenv';

dotenv.config();

const testMetaMaskIntegration = async () => {
  console.log('🧪 Testing MetaMask Integration...\n');
  console.log(`🎯 Target Wallet: 0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89\n`);

  try {
    // Test 1: Initialize MetaMask Service
    console.log('1️⃣  Initializing MetaMask service...');
    await metamaskService.initialize();
    
    if (!metamaskService.isInitialized()) {
      console.log('⚠️  MetaMask service not initialized - check private key configuration');
      return;
    }
    
    console.log('✅ MetaMask service initialized successfully');
    console.log(`💰 Wallet Address: ${metamaskService.getWalletAddress()}`);

    // Test 2: Check Balance
    console.log('\n2️⃣  Checking wallet balance...');
    const balance = await metamaskService.getBalance();
    console.log(`✅ Current Balance: ${balance.fil} FIL`);
    console.log(`   Wei: ${balance.wei}`);
    
    if (parseFloat(balance.fil) < 1.0) {
      console.log('\n⚠️  Low balance detected!');
      console.log('💡 Get test FIL tokens from:');
      console.log('   - https://faucet.calibration.fildev.network/');
      console.log('   - https://faucet.calibration.glif.io/');
      console.log(`   - Enter wallet: ${metamaskService.getWalletAddress()}`);
    }

    // Test 3: Check Network Info
    console.log('\n3️⃣  Checking network information...');
    const networkInfo = await metamaskService.getNetworkInfo();
    console.log(`✅ Network: ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);
    console.log(`   Block Number: ${networkInfo.blockNumber}`);
    console.log(`   Gas Price: ${networkInfo.gasPrice} wei`);

    // Test 4: Initialize Filecoin Service
    console.log('\n4️⃣  Initializing Filecoin service...');
    await filecoinService.initialize();
    
    if (!filecoinService.isInitialized()) {
      console.log('⚠️  Filecoin service not initialized');
      return;
    }
    
    console.log('✅ Filecoin service initialized');

    // Test 5: Check Filecoin Payment Status
    console.log('\n5️⃣  Checking Filecoin payment status...');
    const paymentStatus = await filecoinService.getPaymentStatus();
    console.log(`✅ Payment Status:`);
    console.log(`   Setup: ${paymentStatus.isSetup}`);
    console.log(`   Network: ${paymentStatus.network}`);
    console.log(`   Wallet: ${paymentStatus.walletAddress}`);

    // Test 6: Test Transaction History
    console.log('\n6️⃣  Checking recent transactions...');
    const transactions = await metamaskService.getTransactionHistory(5);
    console.log(`✅ Found ${transactions.length} recent transactions`);
    
    if (transactions.length > 0) {
      console.log('📋 Recent transactions:');
      transactions.forEach((tx, index) => {
        console.log(`   ${index + 1}. ${tx.hash.substring(0, 10)}... (${tx.value} FIL)`);
      });
    } else {
      console.log('   No recent transactions found');
    }

    // Test 7: Test Gas Estimation
    console.log('\n7️⃣  Testing gas estimation...');
    try {
      const gasEstimate = await metamaskService.estimateGas(
        '0x0000000000000000000000000000000000000000', // Dummy address
        '0.001' // 0.001 FIL
      );
      console.log(`✅ Gas estimation working:`);
      console.log(`   Gas Limit: ${gasEstimate.gasLimit}`);
      console.log(`   Gas Price: ${gasEstimate.gasPrice} wei`);
    } catch (gasError) {
      console.log(`⚠️  Gas estimation failed: ${gasError.message}`);
    }

    console.log('\n🎉 MetaMask integration test completed!');
    
    console.log('\n📋 Summary:');
    console.log(`   ✅ MetaMask Service: Working`);
    console.log(`   ✅ Wallet Address: ${metamaskService.getWalletAddress()}`);
    console.log(`   ✅ Balance: ${balance.fil} FIL`);
    console.log(`   ✅ Network: ${networkInfo.name}`);
    console.log(`   ✅ Filecoin Service: ${filecoinService.isInitialized() ? 'Working' : 'Not Working'}`);
    console.log(`   ✅ Payment Setup: ${paymentStatus.isSetup ? 'Complete' : 'Required'}`);

    if (!paymentStatus.isSetup && parseFloat(balance.fil) >= 1.0) {
      console.log('\n💡 Ready for Filecoin setup!');
      console.log('   Call POST /api/metamask/setup-filecoin to setup payments');
    } else if (parseFloat(balance.fil) < 1.0) {
      console.log('\n💡 Get test FIL tokens first:');
      console.log('   1. Visit https://faucet.calibration.fildev.network/');
      console.log(`   2. Enter wallet: ${metamaskService.getWalletAddress()}`);
      console.log('   3. Request test FIL tokens');
      console.log('   4. Wait for confirmation');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cleanup
    try {
      await filecoinService.cleanup();
      console.log('\n🧹 Cleanup completed');
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
  }
};

testMetaMaskIntegration().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Test script failed:', error);
  process.exit(1);
});


