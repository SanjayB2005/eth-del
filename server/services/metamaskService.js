import { ethers } from 'ethers';

class MetaMaskService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.walletAddress = process.env.METAMASK_WALLET_ADDRESS || '0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89';
    this.privateKey = process.env.SYNAPSE_PRIVATE_KEY;
    this.rpcUrl = process.env.SYNAPSE_RPC_URL || 'https://api.calibration.node.glif.io/rpc/v1';
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      console.log('🔧 Initializing MetaMask integration...');
      
      if (!this.privateKey || this.privateKey === '0x_your_private_key_for_filecoin_here') {
        console.warn('⚠️  MetaMask service disabled: Please set SYNAPSE_PRIVATE_KEY in .env file');
        console.warn(`⚠️  Target wallet: ${this.walletAddress}`);
        return;
      }

      // Create provider for Calibration testnet
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      
      // Create wallet with private key
      this.signer = new ethers.Wallet(this.privateKey, this.provider);
      
      // Verify wallet address matches
      const actualAddress = await this.signer.getAddress();
      if (actualAddress.toLowerCase() !== this.walletAddress.toLowerCase()) {
        console.warn(`⚠️  Wallet address mismatch:`);
        console.warn(`   Expected: ${this.walletAddress}`);
        console.warn(`   Actual: ${actualAddress}`);
        console.warn(`   Using actual address: ${actualAddress}`);
        this.walletAddress = actualAddress;
      }
      
      console.log(`✅ MetaMask integration initialized`);
      console.log(`💰 Wallet Address: ${this.walletAddress}`);
      console.log(`🌐 Network: Calibration Testnet`);
      
      this.initialized = true;
      
    } catch (error) {
      console.error('❌ Failed to initialize MetaMask service:', error.message);
      throw error;
    }
  }

  async getBalance() {
    if (!this.initialized) {
      throw new Error('MetaMask service not initialized');
    }

    try {
      const balance = await this.provider.getBalance(this.walletAddress);
      const balanceInFil = ethers.formatEther(balance);
      
      return {
        fil: balanceInFil,
        wei: balance.toString(),
        walletAddress: this.walletAddress
      };
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  async getTransactionHistory(limit = 10) {
    if (!this.initialized) {
      throw new Error('MetaMask service not initialized');
    }

    try {
      // This is a simplified version - in production you'd use a block explorer API
      const blockNumber = await this.provider.getBlockNumber();
      const transactions = [];
      
      // Check recent blocks for transactions involving this wallet
      for (let i = 0; i < Math.min(limit, 100); i++) {
        try {
          const block = await this.provider.getBlock(blockNumber - i, true);
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              if (tx.from?.toLowerCase() === this.walletAddress.toLowerCase() ||
                  tx.to?.toLowerCase() === this.walletAddress.toLowerCase()) {
                transactions.push({
                  hash: tx.hash,
                  from: tx.from,
                  to: tx.to,
                  value: ethers.formatEther(tx.value),
                  blockNumber: tx.blockNumber,
                  timestamp: block.timestamp,
                  gasUsed: tx.gasLimit?.toString(),
                  gasPrice: tx.gasPrice?.toString()
                });
              }
            }
          }
        } catch (blockError) {
          // Continue if block not found
          continue;
        }
      }
      
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  async sendTransaction(to, value, data = '0x') {
    if (!this.initialized) {
      throw new Error('MetaMask service not initialized');
    }

    try {
      console.log(`💰 Sending REAL transaction:`);
      console.log(`   To: ${to}`);
      console.log(`   Value: ${value} FIL`);
      console.log(`   Data: ${data}`);
      
      // Estimate gas first
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: ethers.parseEther(value),
        data
      });
      
      console.log(`⛽ Estimated gas: ${gasEstimate.toString()}`);
      
      // Get current gas price with buffer
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice ? (feeData.gasPrice * 120n) / 100n : undefined; // 20% buffer
      
      const tx = await this.signer.sendTransaction({
        to,
        value: ethers.parseEther(value),
        data,
        gasLimit: gasEstimate,
        gasPrice: gasPrice
      });
      
      console.log(`📝 Transaction sent: ${tx.hash}`);
      console.log(`⏳ Waiting for confirmation...`);
      
      // Wait for confirmation with timeout
      const receipt = await tx.wait(1); // Wait for 1 confirmation
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
      console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
      console.log(`💰 Effective gas price: ${receipt.gasPrice?.toString()} wei`);
      
      return {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: receipt.gasPrice?.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice?.toString(),
        status: receipt.status,
        from: receipt.from,
        to: receipt.to,
        value: ethers.formatEther(receipt.value || 0)
      };
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      
      // Provide more detailed error information
      let errorMessage = error.message;
      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient FIL balance for transaction';
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Transaction would likely fail - check contract or parameters';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error - check your connection to Filecoin network';
      }
      
      throw new Error(`Transaction failed: ${errorMessage}`);
    }
  }

  async estimateGas(to, value, data = '0x') {
    if (!this.initialized) {
      throw new Error('MetaMask service not initialized');
    }

    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        value: ethers.parseEther(value),
        data
      });
      
      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: (await this.provider.getFeeData()).gasPrice?.toString()
      };
    } catch (error) {
      console.error('Gas estimation failed:', error);
      throw new Error(`Gas estimation failed: ${error.message}`);
    }
  }

  async getNetworkInfo() {
    if (!this.initialized) {
      throw new Error('MetaMask service not initialized');
    }

    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const feeData = await this.provider.getFeeData();
      
      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        gasPrice: feeData.gasPrice?.toString(),
        maxFeePerGas: feeData.maxFeePerGas?.toString(),
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString()
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }

  isInitialized() {
    return this.initialized;
  }

  getWalletAddress() {
    return this.walletAddress;
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }

  /**
   * Send tFIL tokens to a specific address (for storage payments)
   */
  async sendTFILPayment(toAddress, amountInFIL) {
    if (!this.initialized) {
      throw new Error('MetaMask service not initialized');
    }

    try {
      console.log(`💰 Sending tFIL payment:`);
      console.log(`   To: ${toAddress}`);
      console.log(`   Amount: ${amountInFIL} tFIL`);

      // Check balance before sending
      const balance = await this.getBalance();
      const requiredAmount = parseFloat(amountInFIL);
      const currentBalance = parseFloat(balance.fil);

      if (currentBalance < requiredAmount + 0.01) { // Add 0.01 tFIL buffer for gas
        throw new Error(`Insufficient tFIL balance. Required: ${requiredAmount + 0.01} tFIL, Available: ${currentBalance} tFIL`);
      }

      // Send the transaction
      const result = await this.sendTransaction(toAddress, amountInFIL);
      
      console.log(`✅ tFIL payment sent successfully!`);
      console.log(`   Transaction Hash: ${result.hash}`);
      console.log(`   Block: ${result.blockNumber}`);
      console.log(`   Gas Used: ${result.gasUsed}`);

      return {
        success: true,
        transactionHash: result.hash,
        blockNumber: result.blockNumber,
        amount: amountInFIL,
        token: 'tFIL',
        toAddress: toAddress,
        fromAddress: result.from,
        gasUsed: result.gasUsed
      };

    } catch (error) {
      console.error('❌ tFIL payment failed:', error);
      throw new Error(`tFIL payment failed: ${error.message}`);
    }
  }

  /**
   * Get comprehensive wallet information for tFIL testing
   */
  async getWalletInfo() {
    if (!this.initialized) {
      throw new Error('MetaMask service not initialized');
    }

    try {
      const [filBalance, networkInfo] = await Promise.all([
        this.getBalance(),
        this.getNetworkInfo()
      ]);

      return {
        walletAddress: this.walletAddress,
        network: networkInfo,
        balances: {
          fil: filBalance
        },
        paymentMethod: 'tFIL',
        initialized: this.initialized
      };

    } catch (error) {
      console.error('❌ Failed to get wallet info:', error);
      throw new Error(`Failed to get wallet info: ${error.message}`);
    }
  }

  async getTransactionReceipt(txHash) {
    if (!this.initialized) {
      throw new Error('MetaMask service not initialized');
    }

    try {
      console.log(`🔍 Getting transaction receipt for: ${txHash}`);
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (receipt) {
        console.log(`✅ Transaction receipt found:`, {
          status: receipt.status,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString()
        });
      } else {
        console.log(`⚠️ Transaction receipt not found (may still be pending)`);
      }
      
      return receipt;
    } catch (error) {
      console.error('❌ Failed to get transaction receipt:', error.message);
      throw error;
    }
  }
}

export default new MetaMaskService();


