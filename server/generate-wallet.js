// Generate a new Ethereum wallet for testing
import { ethers } from 'ethers';

const wallet = ethers.Wallet.createRandom();

console.log('='.repeat(60));
console.log('🚀 NEW ETHEREUM WALLET GENERATED FOR TESTING');
console.log('='.repeat(60));
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('='.repeat(60));
console.log('⚠️  IMPORTANT: Save this private key securely!');
console.log('⚠️  This is for TESTING only - do not use for mainnet!');
console.log('='.repeat(60));

// Add to your .env file:
console.log('\n📝 Add this to your server/.env file:');
console.log(`SYNAPSE_PRIVATE_KEY=${wallet.privateKey}`);

console.log('\n🔗 Get testnet tokens at:');
console.log(`https://faucet.calibration.fildev.network/`);
console.log(`Address to fund: ${wallet.address}`);