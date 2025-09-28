'use client';

import React, { useState, useRef } from 'react';

interface UploadState {
  step: 'upload' | 'payment' | 'processing' | 'success' | 'error';
  file: File | null;
  pinataCid: string | null;
  pieceCid: string | null;
  dealId: string | null;
  error: string | null;
  polygonTransaction: {
    hash: string;
    blockNumber: number;
    fileId: string;
    explorerUrl: string;
  } | null;
}

const SimpleFilecoinUpload: React.FC = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    step: 'upload',
    file: null,
    pinataCid: null,
    pieceCid: null,
    dealId: null,
    error: null,
    polygonTransaction: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload to Pinata
  const handleFileUpload = async (file: File) => {
    setUploadState(prev => ({ ...prev, step: 'processing', file }));
    
    try {
      console.log('📤 Uploading file to Pinata...');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('http://localhost:3002/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Pinata upload failed');
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('✅ Pinata upload successful:', uploadResult.cid);
      
      setUploadState(prev => ({ 
        ...prev, 
        pinataCid: uploadResult.cid,
        step: 'payment' 
      }));
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      setUploadState(prev => ({ 
        ...prev, 
        step: 'error',
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  };

  // Handle MetaMask payment
  const handleMetaMaskPayment = async () => {
    if (!uploadState.pinataCid) return;
    
    setUploadState(prev => ({ ...prev, step: 'processing' }));
    
    try {
      console.log('💰 Initiating MetaMask payment...');
      
      // Check if MetaMask is installed
      if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];
      
      console.log('👤 User address:', userAddress);
      
      // Check network (should be Filecoin Calibration)
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      const expectedChainId = '0x4cb2f'; // Filecoin Calibration in hex
      
      if (chainId !== expectedChainId) {
        // Request network switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: expectedChainId }]
        });
      }
      
      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [userAddress, 'latest']
      });
      
      const balanceInETH = parseInt(balance, 16) / 1e18;
      console.log(`💰 Balance: ${balanceInETH} tFIL`);
      
      if (balanceInETH < 0.001) {
        throw new Error(`Insufficient tFIL balance. You have ${balanceInETH} tFIL but need 0.001 tFIL. Please get tFIL from a faucet.`);
      }
      
      // Create payment transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: '0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89', // Your wallet
          value: '0x38D7EA4C68000', // 0.001 tFIL in hex
          gasLimit: '0x5208' // 21000 gas
        }]
      });
      
      console.log('🔄 Payment transaction sent:', txHash);
      
      // Wait for transaction confirmation
      let receipt = null;
      while (!receipt) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          receipt = await window.ethereum.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          });
        } catch (e) {
          console.log('⏳ Waiting for transaction confirmation...');
        }
      }
      
      console.log('✅ Payment confirmed:', receipt);
      
      // Now process Filecoin storage
      await processFilecoinStorage(txHash);
      
    } catch (error) {
      console.error('❌ Payment failed:', error);
      setUploadState(prev => ({ 
        ...prev, 
        step: 'error',
        error: error instanceof Error ? error.message : 'Payment failed'
      }));
    }
  };

  // Process Filecoin storage after payment
  const processFilecoinStorage = async (paymentHash: string) => {
    if (!uploadState.pinataCid) return;
    
    try {
      console.log('🗄️ Processing Filecoin storage...');
      
      const storageResponse = await fetch('http://localhost:3002/api/metamask/pay-for-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataCid: uploadState.pinataCid,
          paymentHash: paymentHash,
          storageDuration: 365
        })
      });
      
      if (!storageResponse.ok) {
        const errorData = await storageResponse.json();
        throw new Error(errorData.error || 'Filecoin storage failed');
      }
      
      const storageResult = await storageResponse.json();
      console.log('✅ Filecoin storage successful:', storageResult);
      
      setUploadState(prev => ({ 
        ...prev, 
        step: 'success',
        pieceCid: storageResult.uploadResult?.pieceCid,
        dealId: storageResult.uploadResult?.dealId,
        polygonTransaction: storageResult.uploadResult?.polygonTransaction || null
      }));
      
    } catch (error) {
      console.error('❌ Filecoin storage failed:', error);
      setUploadState(prev => ({ 
        ...prev, 
        step: 'error',
        error: error instanceof Error ? error.message : 'Filecoin storage failed'
      }));
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Reset for new upload
  const handleReset = () => {
    setUploadState({
      step: 'upload',
      file: null,
      pinataCid: null,
      pieceCid: null,
      dealId: null,
      error: null,
      polygonTransaction: null
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        🗄️ Filecoin Storage with MetaMask Payment
      </h2>

      {/* Step 1: File Upload */}
      {uploadState.step === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold mb-2">Upload Your File</h3>
            <p className="text-gray-600 mb-4">
              Select a file to upload to Pinata and then store on Filecoin
            </p>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="*/*"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Choose File
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment */}
      {uploadState.step === 'payment' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              ✅ File Uploaded Successfully!
            </h3>
            <p className="text-green-700">
              <strong>File:</strong> {uploadState.file?.name}
            </p>
            <p className="text-green-700">
              <strong>Pinata CID:</strong> {uploadState.pinataCid}
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-800 mb-4">
              💰 Pay with MetaMask
            </h3>
            <div className="space-y-3">
              <p className="text-blue-700">
                <strong>Storage Cost:</strong> 0.001 tFIL
              </p>
              <p className="text-blue-700">
                <strong>Network:</strong> Filecoin Calibration Testnet
              </p>
              <p className="text-blue-700">
                <strong>Your Wallet:</strong> Will be connected automatically
              </p>
            </div>
            
            <button
              onClick={handleMetaMaskPayment}
              className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              🦊 Pay with MetaMask (0.001 tFIL)
            </button>
            
            <p className="text-sm text-gray-600 mt-2 text-center">
              MetaMask will open to confirm the payment
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Processing */}
      {uploadState.step === 'processing' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">
              Processing...
            </h3>
            <p className="text-yellow-700">
              {uploadState.pinataCid ? 'Storing on Filecoin...' : 'Uploading to Pinata...'}
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {uploadState.step === 'success' && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-4">
              🎉 Storage Complete!
            </h3>
            
            <div className="space-y-3">
              <div>
                <strong className="text-green-700">File:</strong>
                <p className="text-green-600">{uploadState.file?.name}</p>
              </div>
              
              <div>
                <strong className="text-green-700">Pinata CID:</strong>
                <p className="text-green-600 font-mono">{uploadState.pinataCid}</p>
              </div>
              
              <div>
                <strong className="text-green-700">Piece CID:</strong>
                <p className="text-green-600 font-mono">{uploadState.pieceCid}</p>
              </div>
              
              <div>
                <strong className="text-green-700">Deal ID:</strong>
                <p className="text-green-600 font-mono">{uploadState.dealId}</p>
              </div>
              
              {uploadState.polygonTransaction && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="text-purple-800 font-semibold mb-2">🔗 Polygon Blockchain Record</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong className="text-purple-700">Transaction Hash:</strong></p>
                    <p className="text-purple-600 font-mono break-all">{uploadState.polygonTransaction.hash}</p>
                    <p><strong className="text-purple-700">Block Number:</strong> {uploadState.polygonTransaction.blockNumber}</p>
                    <p><strong className="text-purple-700">File ID:</strong> {uploadState.polygonTransaction.fileId}</p>
                    <a 
                      href={uploadState.polygonTransaction.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-500 hover:text-purple-700 underline"
                    >
                      View on Polygon Explorer →
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-4 space-x-2">
              <button
                onClick={handleReset}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upload Another File
              </button>
              
              {uploadState.dealId && (
                <a
                  href={`https://calibration.filfox.info/en/deal/${uploadState.dealId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors inline-block"
                >
                  View on Filfox
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Error */}
      {uploadState.step === 'error' && (
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-red-800 mb-2">
              ❌ Error
            </h3>
            <p className="text-red-700 mb-4">{uploadState.error}</p>
            
            <button
              onClick={handleReset}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold mb-2">💡 How it works:</h4>
        <ol className="text-sm text-gray-700 space-y-1">
          <li>1. Upload file to Pinata (IPFS)</li>
          <li>2. Pay 0.001 tFIL with MetaMask</li>
          <li>3. File gets stored on Filecoin network</li>
          <li>4. Data gets recorded on Polygon blockchain</li>
          <li>5. You get Piece CID, Deal ID, and Polygon TX hash</li>
        </ol>
        
        <div className="mt-3 text-sm">
          <p className="text-gray-600">
            <strong>Need tFIL?</strong> Get test tokens from:{' '}
            <a 
              href="https://faucet.calibnet.chainsafe-fil.io/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Filecoin Faucet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimpleFilecoinUpload;
