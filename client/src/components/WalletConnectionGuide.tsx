'use client';

import React from 'react';

interface WalletConnectionGuideProps {
  error: string | null;
  onRetry: () => void;
  isConnecting: boolean;
}

export const WalletConnectionGuide: React.FC<WalletConnectionGuideProps> = ({ 
  error, 
  onRetry, 
  isConnecting 
}) => {
  // Check if it's a user rejection error
  const isRejectionError = error && (
    error.includes('rejected') || 
    error.includes('denied') || 
    error.includes('cancelled') ||
    error.includes('User denied')
  );

  if (!error) return null;

  return (
    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-red-800 text-sm mb-3">{error}</div>
      
      {isRejectionError && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">How to connect your wallet:</h4>
          <ol className="text-xs text-red-700 space-y-1 ml-4 list-decimal">
            <li>Click the "Connect Wallet" button again</li>
            <li>When MetaMask popup appears, click "Connect" or "Approve"</li>
            <li>If asked to sign a message, click "Sign" to verify your wallet</li>
            <li>Make sure MetaMask is unlocked and has at least one account</li>
          </ol>
        </div>
      )}
      
      {!isRejectionError && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Troubleshooting steps:</h4>
          <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
            <li>Make sure MetaMask is installed and enabled</li>
            <li>Check that MetaMask is unlocked</li>
            <li>Try refreshing the page and connecting again</li>
            <li>Make sure you're using a supported browser (Chrome, Firefox, etc.)</li>
          </ul>
        </div>
      )}
      
      <button
        onClick={onRetry}
        disabled={isConnecting}
        className="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Try Again'}
      </button>
    </div>
  );
};

export default WalletConnectionGuide;