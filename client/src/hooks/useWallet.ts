'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { WalletDebugger } from '@/lib/walletDebugger';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    isConnected: false,
    isLoading: true, // Start as loading to check persisted state
    error: null,
  });

  // Check if MetaMask is installed and ready
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' &&
           typeof window.ethereum.request === 'function' &&
           (window.ethereum.isMetaMask === true || (window.ethereum as any)._metamask);
  };

  // Check if already connected on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log('🔄 Checking existing wallet connection...');
        
        if (!isMetaMaskInstalled()) {
          console.log('❌ MetaMask not installed');
          setWallet(prev => ({ ...prev, isLoading: false }));
          return;
        }

        // Small delay to ensure MetaMask is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const accounts = await window.ethereum!.request({ method: 'eth_accounts' }) as string[];
        if (accounts && accounts.length > 0) {
          console.log('✅ Found existing wallet connection:', accounts[0].substring(0, 6) + '...');
          setWallet({
            address: accounts[0],
            isConnected: true,
            isLoading: false,
            error: null,
          });
        } else {
          console.log('ℹ️ No existing wallet connection found');
          setWallet(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.log('⚠️ Error checking wallet connection (this is normal if no connection exists):', error);
        setWallet(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Delay initial check to ensure component is mounted and MetaMask is ready
    const timer = setTimeout(checkConnection, 200);
    return () => clearTimeout(timer);

  }, []);

  // Separate effect for account change listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      try {
        console.log('👤 MetaMask accounts changed:', accounts?.length || 0);
        if (accounts && accounts.length === 0) {
          // User disconnected
          console.log('🔌 User disconnected wallet');
          setWallet({
            address: null,
            isConnected: false,
            isLoading: false,
            error: null,
          });
        } else if (accounts && accounts.length > 0) {
          // User switched accounts
          const newAddress = accounts[0];
          console.log('🔄 User switched to account:', newAddress.substring(0, 6) + '...');
          setWallet({
            address: newAddress,
            isConnected: true,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error handling account change:', error);
      }
    };

    window.ethereum!.on('accountsChanged', handleAccountsChanged);

    // Clean up event listeners
    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = async (): Promise<string | null> => {
    console.log('🔗 Starting wallet connection process...');
    
    // Run diagnosis before attempting connection
    await WalletDebugger.testConnection();
    
    if (!isMetaMaskInstalled()) {
      console.log('❌ MetaMask not detected');
      setWallet(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to continue.',
      }));
      return null;
    }

    console.log('✅ MetaMask detected, initiating connection...');
    
    setWallet(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      console.log('📝 Requesting account access...');
      WalletDebugger.logConnectionAttempt('Starting eth_requestAccounts', true);
      
      // Request account access
      const accounts = await window.ethereum!.request({
        method: 'eth_requestAccounts',
      }) as string[];
      
      WalletDebugger.logConnectionAttempt('eth_requestAccounts completed', true);
      console.log('📋 Received accounts:', accounts?.length || 0);

      if (!accounts || accounts.length === 0) {
        console.log('❌ No accounts found or access was denied');
        throw new Error('No accounts found or access denied');
      }

      const address = accounts[0];
      
      if (!address || typeof address !== 'string') {
        console.log('❌ Invalid wallet address received:', address);
        throw new Error('Invalid wallet address received');
      }
      
      console.log('✅ Successfully connected to wallet:', address.substring(0, 6) + '...' + address.substring(address.length - 4));
      
      setWallet({
        address,
        isConnected: true,
        isLoading: false,
        error: null,
      });

      return address;
    } catch (error: any) {
      WalletDebugger.logConnectionAttempt('eth_requestAccounts', false, error);
      
      let errorMessage = 'An error occurred while connecting to MetaMask.';
      let shouldLog = true;
      
      // Handle specific MetaMask error codes
      if (error.code === 4001) {
        // User rejected the request
        errorMessage = 'Connection request was denied. Please try again and approve the connection in MetaMask.';
        shouldLog = false;
      } else if (error.code === -32002) {
        // Request already pending
        errorMessage = 'Connection request already pending. Please check MetaMask and approve the connection.';
        shouldLog = false;
      } else if (error.code === -32603) {
        // Internal error
        errorMessage = 'MetaMask internal error. Please refresh the page and try again.';
      } else if (error.message && error.message.includes('rejected')) {
        errorMessage = 'MetaMask connection was rejected. Please try again and approve the connection.';
        shouldLog = false;
      } else if (error.message && error.message.includes('No accounts found')) {
        errorMessage = 'No wallet accounts found. Please make sure MetaMask is unlocked and has accounts.';
      } else if (error.message && error.message.includes('User denied')) {
        errorMessage = 'Access denied. Please approve the connection request in MetaMask.';
        shouldLog = false;
      } else if (error.message && error.message.includes('Not connected')) {
        errorMessage = 'MetaMask is not connected. Please make sure MetaMask is unlocked.';
      } else if (error.message) {
        errorMessage = `Connection failed: ${error.message}`;
      }
      
      // Log detailed error information for debugging (except user rejections)
      if (shouldLog) {
        console.error('❌ MetaMask connection error details:', {
          code: error.code,
          message: error.message,
          name: error.name,
          stack: error.stack?.substring(0, 200),
          timestamp: new Date().toISOString(),
          metaMaskVersion: window.ethereum?.isMetaMask,
          error
        });
      } else {
        console.log('ℹ️ User rejected wallet connection request (this is normal behavior)');
      }
      
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      
      return null;
    }
  };

  // Disconnect wallet function
  const disconnectWallet = () => {
    setWallet({
      address: null,
      isConnected: false,
      isLoading: false,
      error: null,
    });
  };

  // Get shortened address for display
  const getShortAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
    getShortAddress,
    isMetaMaskInstalled: isMetaMaskInstalled(),
  };
};

