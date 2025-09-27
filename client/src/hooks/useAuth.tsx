'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { serverAPI, AuthResponse } from '../lib/serverAPI';
import { WalletAuthService } from '../lib/walletAuth';

interface AuthContextType {
  user: AuthResponse['user'] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (walletAddress: string, signMessage: (message: string) => Promise<string>) => Promise<void>;
  walletLogin: (walletAddress: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  checkWalletConnectivity: (walletAddress: string) => Promise<{ connected: boolean; needsAuthentication?: boolean; message?: string; user?: AuthResponse['user'] }>;
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
  const [walletCheckComplete, setWalletCheckComplete] = useState(false);

  // Check for existing token on mount and wallet connection
  useEffect(() => {
    initializeAuth();
  }, []);

  // Debug effect to monitor authentication state changes
  useEffect(() => {
    console.log('🔐 Auth state changed:', {
      isAuthenticated: !!user,
      isLoading,
      isInitialized: walletCheckComplete,
      hasUser: !!user,
      hasToken: !!serverAPI.getToken(),
      walletAddress: user?.walletAddress || 'none'
    });
  }, [user, isLoading, walletCheckComplete]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      console.log('� Initializing authentication system...');
      
      // Step 1: Check for stored token first
      const token = serverAPI.getToken();
      console.log('🔍 Found stored token:', !!token);
      
      if (token) {
        try {
          console.log('🔄 Verifying stored token...');
          const result = await serverAPI.verifyToken();
          if (result.valid && result.user) {
            console.log('✅ Token is valid, restoring user session:', result.user.walletAddress);
            setUser(result.user);
            setWalletCheckComplete(true);
            setIsLoading(false);
            return;
          } else {
            console.log('❌ Token is invalid, clearing...');
            serverAPI.clearToken();
          }
        } catch (error) {
          console.error('❌ Token verification failed:', error);
          serverAPI.clearToken();
        }
      }
      
      // Step 2: Check for wallet connection if no valid token
      await checkWalletConnectionAndAuth();
      
    } catch (error) {
      console.error('❌ Auth initialization failed:', error);
    } finally {
      setWalletCheckComplete(true);
      setIsLoading(false);
    }
  };

  const checkWalletConnectionAndAuth = async () => {
    try {
      // Check if MetaMask has connected accounts
      if (typeof window !== 'undefined' && window.ethereum) {
        // Give MetaMask time to initialize
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        
        if (accounts && accounts.length > 0) {
          const walletAddress = accounts[0];
          console.log('🔍 Found connected wallet during auth init:', walletAddress.substring(0, 6) + '...');
          
          // Check if this wallet is known and can be auto-authenticated
          const connectivityStatus = await checkWalletConnectivity(walletAddress);
          
          if (connectivityStatus.connected && connectivityStatus.user && !connectivityStatus.needsAuthentication) {
            console.log('🔄 Attempting automatic wallet re-authentication...');
            await walletLogin(walletAddress);
          } else {
            console.log('ℹ️ Wallet connected but needs fresh authentication');
          }
        } else {
          console.log('ℹ️ No wallet connection found');
        }
      }
    } catch (error) {
      console.log('⚠️ Error during wallet connection check:', error);
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

  const walletLogin = async (walletAddress: string) => {
    try {
      setIsLoading(true);
      
      // Try to authenticate with wallet (this handles both new and existing users)
      console.log('🔐 Starting wallet authentication for:', walletAddress);
      const authResult = await WalletAuthService.authenticateWallet(walletAddress);
      
      console.log('🔐 Authentication successful, token received:', !!authResult.token);
      console.log('🔐 User data:', authResult.user);
      
      // Store token in serverAPI (now persisted to localStorage)
      serverAPI.setToken(authResult.token);
      
      // Verify token was set correctly
      const verifyToken = serverAPI.getToken();
      console.log('🔐 Token verification after setting:', !!verifyToken);
      
      // Set user data
      setUser({
        ...authResult.user,
        role: authResult.user.role as 'victim' | 'police' | 'admin',
        lastLogin: authResult.user.lastLogin
      });
      
      console.log('🔐 Wallet login completed successfully');
      
    } catch (error: any) {
      console.error('🔐 Wallet authentication failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkWalletConnectivity = async (walletAddress: string) => {
    try {
      return await serverAPI.checkWalletConnectivity(walletAddress);
    } catch (error) {
      console.error('Wallet connectivity check failed:', error);
      return { connected: false, needsAuthentication: true };
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isInitialized: walletCheckComplete,
    login,
    walletLogin,
    logout,
    refreshProfile,
    checkWalletConnectivity,
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
    console.log('🔐 Starting wallet authentication process...');
    
    if (typeof window === 'undefined' || !window.ethereum) {
      console.log('❌ MetaMask not available in authentication');
      throw new Error('MetaMask not installed');
    }

    try {
      setIsConnecting(true);
      console.log('📱 Requesting account access for authentication...');
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      
      console.log('👤 Got accounts for auth:', accounts?.length || 0);
      
      if (accounts.length === 0) {
        console.log('❌ No accounts found during authentication');
        throw new Error('No accounts found');
      }
      
      const walletAddress = accounts[0];
      console.log('🎯 Authenticating wallet:', walletAddress.substring(0, 6) + '...' + walletAddress.substring(walletAddress.length - 4));
      
      // Sign message function
      const signMessage = async (message: string): Promise<string> => {
        console.log('✍️ Requesting message signature...');
        if (!window.ethereum) {
          throw new Error('MetaMask not installed');
        }
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, walletAddress],
        });
        console.log('✅ Message signed successfully');
        return signature;
      };
      
      // Login with wallet
      console.log('🚀 Proceeding with login...');
      await login(walletAddress, signMessage);
      console.log('🎉 Authentication completed successfully');
      
    } catch (error: any) {
      console.error('❌ Wallet authentication failed:', {
        message: error.message,
        code: error.code,
        name: error.name,
        isUserRejection: error.code === 4001 || error.code === -32002 || error.message?.includes('rejected'),
        timestamp: new Date().toISOString()
      });
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

// Hook for comprehensive wallet + auth integration with persistence
export const useWalletAuthIntegration = () => {
  const { user, isAuthenticated, isLoading: authLoading, walletLogin, checkWalletConnectivity } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for wallet connection and authentication on mount
  useEffect(() => {
    const initializeWalletAuth = async () => {
      try {
        console.log('🚀 Initializing wallet-auth integration...');
        
        // Skip if already authenticated
        if (isAuthenticated) {
          console.log('✅ Already authenticated');
          setIsInitializing(false);
          return;
        }

        // Check if MetaMask has connected accounts
        if (typeof window !== 'undefined' && window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          
          if (accounts && accounts.length > 0) {
            const walletAddress = accounts[0];
            console.log('🔍 Found connected wallet, checking auth status:', walletAddress.substring(0, 6) + '...');
            
            // Check if this wallet needs authentication
            const connectivityStatus = await checkWalletConnectivity(walletAddress);
            
            if (connectivityStatus.connected && connectivityStatus.user && !connectivityStatus.needsAuthentication) {
              console.log('🔄 Attempting automatic re-authentication...');
              await walletLogin(walletAddress);
            } else {
              console.log('ℹ️ Wallet connected but needs fresh authentication');
            }
          }
        }
      } catch (error) {
        console.error('⚠️ Error during wallet-auth initialization:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    // Only initialize after auth loading is complete
    if (!authLoading) {
      initializeWalletAuth();
    }
  }, [authLoading, isAuthenticated, walletLogin, checkWalletConnectivity]);

  return {
    isInitializing,
    isFullyLoaded: !authLoading && !isInitializing,
  };
};

// Extend Window type for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
      _metamask?: any;
      isConnected?: () => Promise<boolean>;
      chainId?: string;
    };
  }
}