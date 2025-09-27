'use client';

import { useState, useEffect } from 'react';
import { useAuth, useWalletAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { connectWallet, isConnecting } = useWalletAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Redirect based on user role
      if (user?.role === 'police') {
        router.push('/police');
      } else {
        router.push('/'); // Default to victim dashboard
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  const handleConnect = async () => {
    try {
      setError(null);
      await connectWallet();
    } catch (error) {
      console.error('Connection failed:', error);
      setError(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticated!</h2>
          <p className="text-gray-600">Redirecting you to the dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">ETH-DEL</h1>
          <p className="text-lg text-gray-600">Digital Evidence Locker</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
            <p className="text-sm text-gray-600">
              Sign in with your Ethereum wallet to access the evidence locker
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <span className="mr-2">🦊</span>
                  Connect with MetaMask
                </>
              )}
            </button>

            <div className="text-xs text-gray-500 text-center">
              By connecting, you agree to sign a message to verify your wallet ownership.
              No gas fees required for authentication.
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">How it works:</h3>
            <ol className="text-xs text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">1</span>
                Connect your Ethereum wallet (MetaMask)
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">2</span>
                Sign a verification message (no gas fee)
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold mr-2 mt-0.5">3</span>
                Access secure evidence storage and Filecoin integration
              </li>
            </ol>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Secure Storage Features:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Immediate upload to IPFS via Pinata</li>
              <li>• Automatic migration to Filecoin for long-term storage</li>
              <li>• Cryptographic verification of file integrity</li>
              <li>• Wallet-based access control</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}