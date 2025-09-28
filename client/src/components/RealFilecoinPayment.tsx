import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

interface WalletInfo {
  walletAddress: string;
  network: {
    chainId: string;
    name: string;
    blockNumber: number;
  };
  balances: {
    fil: {
      fil: string;
      wei: string;
      walletAddress: string;
    };
  };
  paymentMethod: string;
  initialized: boolean;
}

interface StorageResult {
  pieceCid: string;
  dealId: string;
  provider: string;
  timestamp: string;
  fileSize: number;
  simulated: boolean;
}

const RealFilecoinPayment: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [pinataCid, setPinataCid] = useState<string>('');
  const [storageResult, setStorageResult] = useState<StorageResult | null>(null);

  // Connect to MetaMask
  const connectMetaMask = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        setError('');

        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        // Switch to Filecoin Calibration testnet
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4cb2f' }], // Calibration testnet chain ID
        });

        setWalletAddress(accounts[0]);
        setSuccess(`Connected to MetaMask: ${accounts[0]}`);
        
        // Get wallet info
        await getWalletInfo();
      } catch (error: any) {
        setError(`MetaMask connection failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setError('MetaMask is not installed. Please install MetaMask to continue.');
    }
  };

  // Get comprehensive wallet information
  const getWalletInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/metamask/wallet-info', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get wallet info');
      }

      const data = await response.json();
      setWalletInfo(data.walletInfo);
    } catch (error: any) {
      setError(`Failed to get wallet info: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Setup Filecoin payments
  const setupFilecoinPayments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/metamask/setup-filecoin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Setup failed');
      }

      const result = await response.json();
      setSuccess(`Filecoin payments setup completed: ${result.message}`);
      
      // Refresh wallet info
      await getWalletInfo();
    } catch (error: any) {
      setError(`Setup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Pay for storage and upload to Filecoin
  const payForStorage = async () => {
    if (!pinataCid.trim()) {
      setError('Please enter a Pinata CID');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/metamask/pay-for-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          pinataCid: pinataCid.trim(),
          storageDuration: 365 // 1 year
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Storage payment failed');
      }

      const result = await response.json();
      setStorageResult(result.uploadResult);
      setSuccess(`File successfully stored on Filecoin! PieceCID: ${result.uploadResult.pieceCid}`);
      
      // Refresh wallet info
      await getWalletInfo();
    } catch (error: any) {
      setError(`Storage payment failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check deal status
  const checkDealStatus = async (pieceCid: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/filecoin/deal/${pieceCid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check deal status');
      }

      const data = await response.json();
      setSuccess(`Deal Status: ${data.dealStatus.status} - ${data.dealStatus.message}`);
    } catch (error: any) {
      setError(`Failed to check deal status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Real Filecoin Storage with MetaMask</h2>
      
      {/* Connection Status */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">MetaMask Connection</h3>
        
        {!walletAddress ? (
          <button
            onClick={connectMetaMask}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Connected: <span className="font-mono">{walletAddress}</span></p>
            <button
              onClick={getWalletInfo}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Wallet Info'}
            </button>
          </div>
        )}
      </div>

      {/* Wallet Information */}
      {walletInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Wallet Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700">FIL Balance</h4>
              <p className="font-mono text-lg">{walletInfo.balances.fil.fil} FIL</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Payment Method</h4>
              <p className="text-sm text-blue-600">{walletInfo.paymentMethod}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Network</h4>
              <p className="text-sm">{walletInfo.network.name} (Chain ID: {walletInfo.network.chainId})</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Block Number</h4>
              <p className="text-sm">{walletInfo.network.blockNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* Setup Filecoin Payments */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Setup Filecoin Payments</h3>
        <p className="text-sm text-gray-600 mb-3">
          This will check your tFIL balance and setup payments for real Filecoin storage operations.
        </p>
        <button
          onClick={setupFilecoinPayments}
          disabled={loading || !walletAddress}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Setup Filecoin Payments'}
        </button>
      </div>

      {/* Storage Upload */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Upload to Filecoin Storage</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pinata CID
            </label>
            <input
              type="text"
              value={pinataCid}
              onChange={(e) => setPinataCid(e.target.value)}
              placeholder="Enter Pinata CID to migrate to Filecoin"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={payForStorage}
            disabled={loading || !walletAddress || !pinataCid.trim()}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Pay & Upload to Filecoin'}
          </button>
        </div>
      </div>

      {/* Storage Result */}
      {storageResult && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-green-800">Storage Result</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Piece CID:</span> <span className="font-mono">{storageResult.pieceCid}</span></p>
            <p><span className="font-medium">Deal ID:</span> <span className="font-mono">{storageResult.dealId}</span></p>
            <p><span className="font-medium">Provider:</span> <span className="font-mono">{storageResult.provider}</span></p>
            <p><span className="font-medium">File Size:</span> {storageResult.fileSize} bytes</p>
            <p><span className="font-medium">Timestamp:</span> {new Date(storageResult.timestamp).toLocaleString()}</p>
            <p><span className="font-medium">Simulated:</span> {storageResult.simulated ? 'Yes' : 'No (Real Storage!)'}</p>
            
            <button
              onClick={() => checkDealStatus(storageResult.pieceCid)}
              disabled={loading}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Check Deal Status'}
            </button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-blue-800">Need Help?</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p>• Make sure MetaMask is connected to Filecoin Calibration testnet</p>
          <p>• Get test tFIL tokens from: <a href="https://faucet.calibration.fildev.network/" target="_blank" rel="noopener noreferrer" className="underline">Calibration Faucet</a></p>
          <p>• You need at least 0.1 tFIL for storage operations</p>
          <p>• Check transactions on: <a href="https://calibration.filfox.info" target="_blank" rel="noopener noreferrer" className="underline">Filecoin Block Explorer</a></p>
        </div>
      </div>
    </div>
  );
};

export default RealFilecoinPayment;
