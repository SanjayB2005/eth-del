import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { serverAPI } from '@/lib/serverAPI';

interface PaymentStatus {
  isSetup: boolean;
  network: string;
  walletAddress: string;
  paymentMethod: string;
  balance: {
    fil: string;
    token: string;
    minRequired: string;
  };
  status: string;
  message: string;
  faucetUrl?: string;
}

const FilecoinPaymentSetup: React.FC = () => {
  const { primaryWallet } = useDynamicContext();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const checkPaymentStatus = async () => {
    if (!primaryWallet?.address) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:3001/api/filecoin/status', {
        headers: {
          'X-Wallet-Address': primaryWallet.address,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const status = await response.json();
        setPaymentStatus(status);
        
        if (status.isSetup) {
          setSuccess('✅ Filecoin payments are set up and ready!');
        }
      } else {
        const errorData = await response.json();
        setError(`Failed to check payment status: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Error checking payment status: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const setupPayments = async () => {
    if (!primaryWallet?.address) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await fetch('http://localhost:3001/api/status/setup-payments', {
        method: 'POST',
        headers: {
          'X-Wallet-Address': primaryWallet.address,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess('✅ Payment setup completed successfully!');
        
        // Refresh payment status
        setTimeout(() => checkPaymentStatus(), 1000);
      } else {
        const errorData = await response.json();
        setError(`Payment setup failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Error setting up payments: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const retryFilecoinMigration = async (pinataCid: string) => {
    if (!primaryWallet?.address) return;

    try {
      setLoading(true);
      setError('');

      const response = await fetch(`http://localhost:3001/api/filecoin/migrate/${pinataCid}`, {
        method: 'POST',
        headers: {
          'X-Wallet-Address': primaryWallet.address,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(`✅ File migration started! Piece CID: ${result.result.pieceCid}`);
      } else {
        const errorData = await response.json();
        setError(`Migration failed: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setError(`Error during migration: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (primaryWallet?.address) {
      checkPaymentStatus();
    }
  }, [primaryWallet?.address]);

  if (!primaryWallet?.address) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">Please connect your wallet to set up Filecoin payments.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Filecoin Payment Setup</h2>

      {/* Payment Status */}
      {paymentStatus && (
        <div className={`mb-6 p-4 rounded-lg ${paymentStatus.isSetup ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className="text-lg font-semibold mb-3">Payment Status</h3>
          <div className="space-y-2">
            <p><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded text-sm ${paymentStatus.isSetup ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {paymentStatus.isSetup ? 'Ready' : 'Setup Required'}
              </span>
            </p>
            <p><span className="font-medium">Wallet:</span> <span className="font-mono text-sm">{paymentStatus.walletAddress}</span></p>
            <p><span className="font-medium">Network:</span> {paymentStatus.network}</p>
            <p><span className="font-medium">Balance:</span> {paymentStatus.balance.fil} {paymentStatus.balance.token}</p>
            <p><span className="font-medium">Required:</span> {paymentStatus.balance.minRequired} {paymentStatus.balance.token}</p>
            <p><span className="font-medium">Message:</span> {paymentStatus.message}</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-4">
        {!paymentStatus?.isSetup && (
          <>
            {/* Get Test Tokens */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Step 1: Get Test FIL Tokens</h3>
              <p className="text-blue-700 mb-3">You need at least 0.1 tFIL tokens to use Filecoin storage.</p>
              <a
                href="https://faucet.calibration.fildev.network/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
              >
                🚰 Get Test FIL Tokens
              </a>
            </div>

            {/* Setup Payments */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2 text-purple-800">Step 2: Setup Payments</h3>
              <p className="text-purple-700 mb-3">After getting tokens, click to set up your Filecoin payments.</p>
              <button
                onClick={setupPayments}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
              >
                {loading ? 'Setting up...' : '⚙️ Setup Payments'}
              </button>
            </div>
          </>
        )}

        {/* Retry Migration */}
        {paymentStatus?.isSetup && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-green-800">Step 3: Retry File Migration</h3>
            <p className="text-green-700 mb-3">Now that payments are set up, you can retry migrating your file to Filecoin.</p>
            <button
              onClick={() => retryFilecoinMigration('QmXaqdAZVohaUBurc7Lk71jDA8kcF9wVqyorQcYDCkWGEB')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
            >
              {loading ? 'Migrating...' : '🔄 Retry Filecoin Migration'}
            </button>
          </div>
        )}

        {/* Refresh Status */}
        <button
          onClick={checkPaymentStatus}
          disabled={loading}
          className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Checking...' : '🔍 Check Payment Status'}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p>{success}</p>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Need Help?</h3>
        <div className="text-sm text-gray-600 space-y-2">
          <p>• Make sure you're connected to <strong>Filecoin Calibration testnet</strong></p>
          <p>• Get test tokens from the <a href="https://faucet.calibration.fildev.network/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Calibration Faucet</a></p>
          <p>• Minimum balance required: <strong>0.1 tFIL</strong></p>
          <p>• Check transactions on: <a href="https://calibration.filfox.info" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Filecoin Block Explorer</a></p>
        </div>
      </div>
    </div>
  );
};

export default FilecoinPaymentSetup;