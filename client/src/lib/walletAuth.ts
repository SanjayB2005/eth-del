import { ethers } from 'ethers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

interface WalletAuthResponse {
  token: string;
  user: {
    id: string;
    walletAddress: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    lastLogin: string;
  };
}

interface NonceResponse {
  nonce: string;
  message: string;
  exists: boolean;
}

export class WalletAuthService {
  
  // Get nonce for wallet authentication
  static async getNonce(walletAddress: string): Promise<NonceResponse> {
    const response = await fetch(`${API_BASE}/wallet/nonce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get nonce');
    }

    return response.json();
  }

  // Sign message with MetaMask
  static async signMessage(message: string, address: string): Promise<string> {
    if (!window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Ensure we're using the correct address
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Please switch to the correct MetaMask account');
      }

      const signature = await signer.signMessage(message);
      return signature;
    } catch (error: any) {
      if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
        throw new Error('You must sign the message to authenticate. Please try again and click "Sign" when prompted.');
      }
      if (error.message && error.message.includes('rejected')) {
        throw new Error('Authentication was cancelled. Please try again and approve the signature request.');
      }
      throw new Error(error.message || 'Failed to sign message');
    }
  }

  // Verify signature and authenticate
  static async verifyAndAuthenticate(
    walletAddress: string, 
    signature: string, 
    nonce: string
  ): Promise<WalletAuthResponse> {
    const response = await fetch(`${API_BASE}/wallet/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress, signature, nonce }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Authentication failed');
    }

    return response.json();
  }

  // Get user profile with token
  static async getProfile(token: string): Promise<{ user: WalletAuthResponse['user'] }> {
    const response = await fetch(`${API_BASE}/wallet/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }

    return response.json();
  }

  // Complete wallet authentication flow
  static async authenticateWallet(walletAddress: string): Promise<WalletAuthResponse> {
    try {
      // Step 1: Get nonce
      const { nonce, message } = await this.getNonce(walletAddress);
      
      // Step 2: Sign message
      const signature = await this.signMessage(message, walletAddress);
      
      // Step 3: Verify and authenticate
      const authResult = await this.verifyAndAuthenticate(walletAddress, signature, nonce);
      
      return authResult;
    } catch (error: any) {
      throw new Error(error.message || 'Wallet authentication failed');
    }
  }

  // Token management - no longer using localStorage
  private static token: string | null = null;

  static setToken(token: string): void {
    this.token = token;
  }

  static getToken(): string | null {
    return this.token;
  }

  static removeToken(): void {
    this.token = null;
  }
}