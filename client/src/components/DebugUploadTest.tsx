'use client';

import { useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export default function DebugUploadTest() {
  const { primaryWallet } = useDynamicContext();
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');

  const testDirectUpload = async () => {
    if (!primaryWallet?.address) {
      setError('No wallet connected');
      return;
    }

    setUploadStatus('Starting upload test...');
    setError('');

    try {
      const testContent = 'Test file from React component';
      const blob = new Blob([testContent], { type: 'text/plain' });
      
      const formData = new FormData();
      formData.append('file', blob, 'react-test.txt');
      formData.append('metadata', JSON.stringify({ 
        source: 'react-debug',
        timestamp: new Date().toISOString(),
        wallet: primaryWallet.address
      }));

      setUploadStatus(`Using wallet: ${primaryWallet.address}`);
      setUploadStatus(prev => prev + '\nTrying upload...');

      const response = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        headers: {
          'X-Wallet-Address': primaryWallet.address,
        },
        body: formData
      });

      setUploadStatus(prev => prev + `\nResponse status: ${response.status}`);

      if (response.ok) {
        const result = await response.json();
        setUploadStatus(prev => prev + `\n✅ SUCCESS: ${JSON.stringify(result, null, 2)}`);
      } else {
        const errorText = await response.text();
        setError(`HTTP ${response.status}: ${errorText}`);
      }

    } catch (err) {
      const error = err as Error;
      setError(`Network Error: ${error.message}`);
    }
  };

  if (!primaryWallet) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Connect Wallet</h3>
        <p className="text-yellow-700">Please connect your wallet to test uploads.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Debug Upload Test</h2>
      
      <div className="space-y-4">
        <div>
          <p><strong>Wallet:</strong> {primaryWallet.address}</p>
          <p><strong>Server URL:</strong> http://localhost:3001</p>
        </div>

        <div className="space-x-4">
          <button
            onClick={testDirectUpload}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Upload
          </button>
        </div>

        {uploadStatus && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Status:</h4>
            <pre className="text-sm whitespace-pre-wrap">{uploadStatus}</pre>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Error:</h4>
            <pre className="text-sm text-red-700 whitespace-pre-wrap">{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
