import { Synapse } from '@filoz/synapse-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkWalletBalance() {
  try {
    console.log('🔍 Checking wallet balance for address: 0x420dB63802F51b792Df042216f65f900bbdef676');
    console.log('==========================================');
    
    const privateKey = process.env.SYNAPSE_PRIVATE_KEY;
    const rpcURL = process.env.SYNAPSE_RPC_URL;
    
    if (!privateKey || privateKey === '0x_your_private_key_for_filecoin_here') {
      console.error('❌ SYNAPSE_PRIVATE_KEY not properly configured');
      return;
    }
    
    console.log('🔧 Initializing Synapse SDK...');
    const synapse = await Synapse.create({
      privateKey,
      rpcURL: rpcURL || 'https://api.calibration.node.glif.io/rpc/v1',
      withCDN: true
    });
    
    console.log('✅ Synapse SDK initialized');
    
    // Get wallet information
    console.log('🔍 Synapse object keys:', Object.keys(synapse));
    console.log('🔍 Synapse methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(synapse)).filter(name => typeof synapse[name] === 'function'));
    
    // Try to get wallet address from signer
    let walletAddress = null;
    if (synapse._signer && synapse._signer.address) {
      walletAddress = synapse._signer.address;
    } else if (synapse._signer && synapse._signer.getAddress) {
      walletAddress = await synapse._signer.getAddress();
    }
    
    console.log('🔑 Wallet Address from Signer:', walletAddress || 'Not found');
    
    // Check if this matches your MetaMask address
    const metamaskAddress = '0x420dB63802F51b792Df042216f65f900bbdef676';
    console.log('💳 Your MetaMask Address:', metamaskAddress);
    
    if (walletAddress) {
      console.log('🔍 Address Match:', walletAddress.toLowerCase() === metamaskAddress.toLowerCase() ? '✅ YES' : '❌ NO');
    }
    
    // Get balance using provider directly
    console.log('\\n💰 Checking balance...');
    
    let balance = '0';
    if (synapse._provider && walletAddress) {
      try {
        const balanceWei = await synapse._provider.getBalance(walletAddress);
        const balanceEth = balanceWei / (10 ** 18); // Convert from Wei to FIL
        balance = balanceEth.toFixed(4);
        console.log('💰 Current Balance (via provider):', balance, 'FIL');
      } catch (providerError) {
        console.log('❌ Provider balance check failed:', providerError.message);
      }
    }
    
    // Try other balance methods
    if (synapse.getBalance) {
      try {
        balance = await synapse.getBalance();
        console.log('💰 Current Balance (via getBalance):', balance, 'FIL');
      } catch (balanceError) {
        console.log('❌ getBalance failed:', balanceError.message);
      }
    }
    
    // Convert to number for comparison
    const balanceNum = parseFloat(balance);
    const minRequired = 0.1;
    
    console.log('\\n📊 Payment Status:');
    console.log('   💰 Current Balance:', balanceNum.toFixed(4), 'FIL');
    console.log('   📈 Minimum Required:', minRequired, 'FIL');
    console.log('   ✅ Payment Setup Ready:', balanceNum >= minRequired ? '✅ YES' : '❌ NO');
    
    if (balanceNum < minRequired) {
      console.log('\\n🚨 NEXT STEPS:');
      console.log('   1. Visit: https://faucet.calibration.fildev.network/');
      console.log('   2. Enter your address:', metamaskAddress);
      console.log('   3. Request tFIL tokens');
      console.log('   4. Wait for tokens to arrive (usually 1-2 minutes)');
      console.log('   5. Run this script again to verify');
    } else {
      console.log('\\n🎉 Ready to proceed with payment setup!');
    }
    
  } catch (error) {
    console.error('❌ Error checking wallet balance:', error.message);
    if (error.message.includes('invalid private key')) {
      console.error('💡 Tip: Make sure your SYNAPSE_PRIVATE_KEY is valid and matches your MetaMask wallet');
    }
  }
}

checkWalletBalance();