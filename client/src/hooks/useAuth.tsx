'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { serverAPI, AuthResponse } from '../lib/serverAPI';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (walletAddress: string, signMessage: (message: string) => Promise<string>) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      setIsLoading(true);
      const token = serverAPI.getToken();
      
      if (token) {
        // Verify token is still valid
        const result = await serverAPI.verifyToken();
        if (result.valid) {
          setUser(result.user);
        } else {
          serverAPI.clearToken();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      serverAPI.clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (walletAddress: string, signMessage: (message: string) => Promise<string>) => {
    try {
      setIsLoading(true);
      
      // Get nonce from server
      const nonceResponse = await serverAPI.getNonce(walletAddress);
      
      // Sign the nonce message
      const signature = await signMessage(nonceResponse.message);
      
      // Verify signature and get token
      const authResponse = await serverAPI.verifySignature(
        walletAddress,
        signature,
        nonceResponse.nonce
      );
      
      setUser(authResponse.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    serverAPI.clearToken();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await serverAPI.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Profile refresh failed:', error);
      logout(); // Auto-logout on profile fetch failure
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for wallet connection and signing
export const useWalletAuth = () => {
  const { login } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      setIsConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const walletAddress = accounts[0];
      
      // Sign message function
      const signMessage = async (message: string): Promise<string> => {
        if (!window.ethereum) {
          throw new Error('MetaMask not installed');
        }
        return await window.ethereum.request({
          method: 'personal_sign',
          params: [message, walletAddress],
        });
      };
      
      // Login with wallet
      await login(walletAddress, signMessage);
      
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  return {
    connectWallet,
    isConnecting,
  };
};

// Extend Window type for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}