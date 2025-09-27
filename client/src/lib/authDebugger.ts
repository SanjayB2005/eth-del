'use client';

/**
 * Debug utility to check authentication token status
 * Use this in your browser console or components for debugging
 */

export class AuthDebugger {
  static checkTokenStatus() {
    const authToken = localStorage.getItem('auth_token');
    const walletToken = localStorage.getItem('wallet_token');
    
    console.log('🔍 Authentication Debug Status');
    console.log('================================');
    console.log('auth_token:', authToken ? `Present (${authToken.substring(0, 20)}...)` : 'Missing');
    console.log('wallet_token:', walletToken ? `Present (${walletToken.substring(0, 20)}...)` : 'Missing');
    console.log('Tokens match:', authToken === walletToken ? '✅ Yes' : '❌ No');
    console.log('================================');
    
    return {
      authToken,
      walletToken,
      tokensMatch: authToken === walletToken,
      hasAnyToken: !!(authToken || walletToken)
    };
  }

  static async testAPICall() {
    console.log('🧪 Testing API call with current tokens...');
    
    const status = this.checkTokenStatus();
    
    if (!status.hasAnyToken) {
      console.log('❌ No tokens found - authentication required');
      return;
    }

    try {
      const response = await fetch('http://localhost:3002/api/upload/files', {
        headers: {
          'Authorization': `Bearer ${status.authToken || status.walletToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('✅ API call successful!');
        const data = await response.json();
        console.log('Response:', data);
      } else {
        console.log('❌ API call failed:', response.status, response.statusText);
        if (response.status === 401) {
          console.log('Token appears to be invalid or expired');
        }
      }
    } catch (error) {
      console.log('❌ Network error:', error);
    }
  }

  static clearAllTokens() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('wallet_token');
    console.log('🧹 All tokens cleared');
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).AuthDebugger = AuthDebugger;
}

export default AuthDebugger;