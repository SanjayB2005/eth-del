import { Synapse } from '@filoz/synapse-sdk';
import dotenv from 'dotenv';

dotenv.config();

const debugSynapse = async () => {
  console.log('🔍 Debugging Synapse SDK...');
  
  try {
    const privateKey = process.env.SYNAPSE_PRIVATE_KEY || '0x_your_private_key_for_filecoin_here';
    
    if (privateKey === '0x_your_private_key_for_filecoin_here') {
      console.log('⚠️  No private key configured, using dummy key for debugging');
      console.log('📋 Available methods on Synapse class:');
      console.log('   - Synapse.create()');
      console.log('   - synapse.getNetwork()');
      console.log('   - synapse.getProvider()');
      console.log('   - synapse.payments.*');
      console.log('   - synapse.storage.*');
      return;
    }

    const synapse = await Synapse.create({
      privateKey,
      rpcURL: process.env.SYNAPSE_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1'
    });

    console.log('✅ Synapse SDK created successfully');
    console.log('📋 Available methods:');
    console.log('   - getNetwork():', typeof synapse.getNetwork);
    console.log('   - getProvider():', typeof synapse.getProvider);
    console.log('   - payments:', typeof synapse.payments);
    console.log('   - storage:', typeof synapse.storage);

    if (synapse.payments) {
      console.log('📋 Payments methods:');
      console.log('   - deposit:', typeof synapse.payments.deposit);
      console.log('   - allowance:', typeof synapse.payments.allowance);
      console.log('   - approveService:', typeof synapse.payments.approveService);
      console.log('   - serviceApproval:', typeof synapse.payments.serviceApproval);
    }

    if (synapse.storage) {
      console.log('📋 Storage methods:');
      console.log('   - upload:', typeof synapse.storage.upload);
      console.log('   - download:', typeof synapse.storage.download);
      console.log('   - status:', typeof synapse.storage.status);
    }

    // Try to get addresses
    try {
      console.log('\n🔍 Testing address retrieval...');
      
      const provider = synapse.getProvider();
      console.log('✅ Provider retrieved');
      
      const signer = provider.getSigner();
      console.log('✅ Signer retrieved');
      
      const walletAddress = await signer.getAddress();
      console.log('✅ Wallet address:', walletAddress);
      
      // Try to find address methods
      const synapseKeys = Object.getOwnPropertyNames(synapse);
      console.log('📋 Synapse object keys:', synapseKeys);
      
      // Check if there are any address-related methods
      const addressMethods = synapseKeys.filter(key => 
        key.toLowerCase().includes('address') || 
        key.toLowerCase().includes('payment') ||
        key.toLowerCase().includes('warm')
      );
      console.log('📋 Potential address methods:', addressMethods);
      
    } catch (addressError) {
      console.error('❌ Address retrieval failed:', addressError.message);
    }

  } catch (error) {
    console.error('❌ Synapse SDK debug failed:', error.message);
  }
};

debugSynapse();


