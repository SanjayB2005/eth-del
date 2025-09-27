'use client';

/**
 * Debugging utility for MetaMask connection issues
 * This helps diagnose common problems with wallet connections
 */

export class WalletDebugger {
  static async diagnoseConnection() {
    const results = {
      timestamp: new Date().toISOString(),
      browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      metamaskInstalled: false,
      metamaskVersion: 'Not detected',
      ethereumObject: false,
      isConnected: false,
      accounts: [] as string[],
      chainId: 'Unknown',
      errors: [] as string[]
    };

    try {
      // Check if window.ethereum exists
      if (typeof window !== 'undefined' && window.ethereum) {
        results.ethereumObject = true;
        
        // Check if it's MetaMask
        if (window.ethereum.isMetaMask) {
          results.metamaskInstalled = true;
          results.metamaskVersion = 'MetaMask detected';
        }

        // Try to get current accounts (won't trigger popup)
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          results.accounts = accounts || [];
          results.isConnected = accounts && accounts.length > 0;
        } catch (error: any) {
          results.errors.push(`Getting accounts failed: ${error.message}`);
        }

        // Try to get chain ID
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          results.chainId = chainId;
        } catch (error: any) {
          results.errors.push(`Getting chain ID failed: ${error.message}`);
        }

        // Check if MetaMask is locked
        try {
          const isUnlocked = await window.ethereum._metamask?.isUnlocked?.();
          if (isUnlocked === false) {
            results.errors.push('MetaMask is locked');
          }
        } catch (error: any) {
          // This is expected if _metamask is not available
        }

      } else {
        results.errors.push('window.ethereum not found');
      }
    } catch (error: any) {
      results.errors.push(`Diagnosis error: ${error.message}`);
    }

    return results;
  }

  static async testConnection() {
    console.log('🔍 Starting wallet connection diagnosis...');
    
    const diagnosis = await this.diagnoseConnection();
    
    console.log('📊 Wallet Diagnosis Results:', diagnosis);
    
    if (diagnosis.errors.length > 0) {
      console.log('⚠️ Issues found:', diagnosis.errors);
    }
    
    if (!diagnosis.metamaskInstalled) {
      console.log('❌ MetaMask not installed or not detected');
      return false;
    }
    
    if (diagnosis.accounts.length === 0) {
      console.log('ℹ️ No connected accounts (this is normal before connection)');
    } else {
      console.log('✅ Connected accounts found:', diagnosis.accounts.length);
    }
    
    return diagnosis.metamaskInstalled;
  }

  static logConnectionAttempt(step: string, success: boolean, error?: any) {
    const emoji = success ? '✅' : '❌';
    console.log(`${emoji} ${step}:`, success ? 'Success' : error?.message || 'Failed');
    
    if (!success && error) {
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200)
      });
    }
  }
}

export default WalletDebugger;