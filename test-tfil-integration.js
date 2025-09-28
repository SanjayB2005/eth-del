#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './server/.env' });

const METAMASK_ADDRESS = '0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89';
const RPC_URL = process.env.SYNAPSE_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1';

async function testTFILIntegration() {
  console.log('🧪 Testing tFIL Integration...\n');
  
  try {
    // Test 1: Connect to Filecoin Calibration testnet
    console.log('1️⃣ Testing Filecoin Calibration connection...');
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    const network = await provider.getNetwork();
    console.log(`✅ Connected to network: ${network.name} (Chain ID: ${network.chainId})`);
    
    // Test 2: Check wallet balance
    console.log('\n2️⃣ Checking tFIL balance...');
    const balance = await provider.getBalance(METAMASK_ADDRESS);
    const balanceInFIL = ethers.formatEther(balance);
    console.log(`✅ Wallet Address: ${METAMASK_ADDRESS}`);
    console.log(`✅ tFIL Balance: ${balanceInFIL} FIL`);
    
    if (parseFloat(balanceInFIL) < 0.1) {
      console.log('⚠️  WARNING: Balance is less than 0.1 tFIL');
      console.log('   Get test tokens from: https://faucet.calibration.fildev.network/');
    } else {
      console.log('✅ Sufficient tFIL balance for testing');
    }
    
    // Test 3: Check recent blocks
    console.log('\n3️⃣ Checking network status...');
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Current block number: ${blockNumber}`);
    
    // Test 4: Check gas price
    console.log('\n4️⃣ Checking gas prices...');
    const feeData = await provider.getFeeData();
    console.log(`✅ Gas price: ${feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : 'N/A'} gwei`);
    
    console.log('\n🎉 tFIL Integration Test Results:');
    console.log('✅ Filecoin Calibration connection: WORKING');
    console.log(`✅ Wallet balance: ${balanceInFIL} tFIL`);
    console.log(`✅ Network status: ACTIVE (Block ${blockNumber})`);
    console.log('✅ Ready for real Filecoin storage testing!');
    
    if (parseFloat(balanceInFIL) >= 0.1) {
      console.log('\n🚀 Next steps:');
      console.log('1. Start the server: cd server && node server.js');
      console.log('2. Test endpoints: curl http://localhost:3002/api/health');
      console.log('3. Test MetaMask integration: curl http://localhost:3002/api/metamask/status');
      console.log('4. Test storage upload with a Pinata CID');
    } else {
      console.log('\n⚠️  Please get test tFIL tokens first:');
      console.log('   https://faucet.calibration.fildev.network/');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your internet connection');
    console.log('2. Verify the RPC URL is correct');
    console.log('3. Make sure you have test tFIL tokens');
    console.log('4. Check your MetaMask wallet address');
  }
}

// Run the test
testTFILIntegration().catch(console.error);
