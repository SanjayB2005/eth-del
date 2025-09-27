'use client';

/**
 * Debug utility to check Dynamic SDK authentication status
 * Use this in your browser console or components for debugging
 */

export class AuthDebugger {
  static checkDynamicAuthStatus() {
    // Check if Dynamic SDK context is available
    const isDynamic = typeof window !== 'undefined' && (window as any).DynamicContext;
    
    console.log('🔍 Dynamic SDK Authentication Debug Status');
    console.log('==========================================');
    console.log('Dynamic SDK available:', isDynamic ? '✅ Yes' : '❌ No');
    
    if (isDynamic) {
      try {
        const context = (window as any).DynamicContext;
        console.log('Primary wallet:', context.primaryWallet?.address || 'Not connected');
        console.log('User authenticated:', !!context.primaryWallet ? '✅ Yes' : '❌ No');
        console.log('Wallet provider:', context.primaryWallet?.connector?.name || 'N/A');
      } catch (error) {
        console.log('Error accessing Dynamic context:', error);
      }
    }
    console.log('==========================================');
    
    return {
      isDynamicAvailable: isDynamic,
      isAuthenticated: isDynamic && !!(window as any).DynamicContext?.primaryWallet
    };
  }

  static async testAPICall(walletAddress?: string) {
    console.log('🧪 Testing API call with Dynamic SDK authentication...');
    
    if (!walletAddress) {
      const status = this.checkDynamicAuthStatus();
      if (!status.isAuthenticated) {
        console.log('❌ No wallet connected - authentication required');
        return;
      }
      
      try {
        walletAddress = (window as any).DynamicContext?.primaryWallet?.address;
      } catch (error) {
        console.log('❌ Could not get wallet address');
        return;
      }
    }

    try {
      const response = await fetch('http://localhost:3001/api/upload/files', {
        headers: {
          'X-Wallet-Address': walletAddress!,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ API call successful!');
        const data = await response.json();
        console.log('Response:', data);
      } else {
        console.log('❌ API call failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.log('Error details:', errorData);
      }
    } catch (error) {
      console.log('❌ Network error:', error);
    }
  }

  static async testUpload(file: File, walletAddress?: string) {
    console.log('🧪 Testing file upload with Dynamic SDK authentication...');
    
    if (!walletAddress) {
      try {
        walletAddress = (window as any).DynamicContext?.primaryWallet?.address;
      } catch (error) {
        console.log('❌ Could not get wallet address');
        return;
      }
    }

    if (!walletAddress) {
      console.log('❌ No wallet address available');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify({ testUpload: true }));

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'X-Wallet-Address': walletAddress,
        },
        body: formData
      });

      if (response.ok) {
        console.log('✅ Upload successful!');
        const data = await response.json();
        console.log('Upload response:', data);
      } else {
        console.log('❌ Upload failed:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.log('Error details:', errorData);
      }
    } catch (error) {
      console.log('❌ Upload error:', error);
    }
  }

  static clearLegacyTokens() {
    // Clean up any old tokens that might still be in localStorage
    const keysToRemove = [
      'auth_token', 
      'wallet_token', 
      'eth_del_auth_token',
      'jwt_token'
    ];
    
    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`🧹 Removed legacy token: ${key}`);
      }
    });
    
    console.log('🧹 Legacy token cleanup complete');
  }

  static displayUsage() {
    console.log('📚 AuthDebugger Usage:');
    console.log('====================');
    console.log('AuthDebugger.checkDynamicAuthStatus() - Check Dynamic SDK status');
    console.log('AuthDebugger.testAPICall(walletAddress?) - Test API call');
    console.log('AuthDebugger.testUpload(file, walletAddress?) - Test file upload');
    console.log('AuthDebugger.clearLegacyTokens() - Clear old tokens');
    console.log('====================');
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).AuthDebugger = AuthDebugger;
  // Show usage on load
  console.log('🔧 AuthDebugger loaded! Type AuthDebugger.displayUsage() for help.');
}

export default AuthDebugger;