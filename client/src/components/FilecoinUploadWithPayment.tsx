'use client';

import React, { useState, useRef } from 'react';
import { ethers } from 'ethers';

interface UploadState {
  step: 'upload' | 'payment' | 'processing' | 'success' | 'error';
  file: File | null;
  pinataCid: string | null;
  pieceCid: string | null;
  dealId: string | null;
  provider: string | null;
  error: string | null;
  paymentHash: string | null;
}

const FilecoinUploadWithPayment: React.FC = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    step: 'upload',
    file: null,
    pinataCid: null,
    pieceCid: null,
    dealId: null,
    provider: null,
    error: null,
    paymentHash: null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1: Handle file upload to Pinata
  const handleFileUpload = async (file: File) => {
    setUploadState(prev => ({ ...prev, step: 'processing', file }));
    
    try {
      console.log('📤 Uploading file to Pinata...');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Upload to Pinata
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Pinata upload failed');
      }
      
      const uploadResult = await uploadResponse.json();
      const pinataCid = uploadResult.cid;
      
      console.log('✅ Pinata upload successful:', pinataCid);
      
      setUploadState(prev => ({ 
        ...prev, 
        pinataCid,
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

  // Step 2: Handle MetaMask payment
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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      
      console.log('👤 User address:', userAddress);
      
      // Check network (should be Filecoin Calibration)
      const network = await provider.getNetwork();
      const expectedChainId = 314159; // Filecoin Calibration
      
      if (Number(network.chainId) !== expectedChainId) {
        // Request network switch
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${expectedChainId.toString(16)}` }]
        });
      }
      
      // Check tFIL balance
      const balance = await provider.getBalance(userAddress);
      const balanceInFIL = ethers.formatEther(balance);
      const requiredAmount = '0.001'; // 0.001 tFIL for storage
      
      if (parseFloat(balanceInFIL) < parseFloat(requiredAmount)) {
        throw new Error(`Insufficient tFIL balance. You have ${balanceInFIL} tFIL but need ${requiredAmount} tFIL. Please get tFIL from a faucet.`);
      }
      
      console.log(`✅ Balance check passed: ${balanceInFIL} tFIL`);
      
      // Create payment transaction
      const tx = await signer.sendTransaction({
        to: '0xB70C8Fc04118C415Fa48CF492Cb5130242f19E89', // Your wallet address
        value: ethers.parseEther(requiredAmount),
        gasLimit: 21000
      });
      
      console.log('🔄 Payment transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('✅ Payment confirmed:', receipt?.hash);
      
      setUploadState(prev => ({ 
        ...prev, 
        paymentHash: receipt?.hash || tx.hash
      }));
      
      // Step 3: Process Filecoin storage
      await processFilecoinStorage();
      
    } catch (error) {
      console.error('❌ Payment failed:', error);
      setUploadState(prev => ({ 
        ...prev, 
        step: 'error',
        error: error instanceof Error ? error.message : 'Payment failed'
      }));
    }
  };

  // Step 3: Process Filecoin storage after successful payment
  const processFilecoinStorage = async () => {
    if (!uploadState.pinataCid || !uploadState.paymentHash) return;
    
    try {
      console.log('🗄️ Processing Filecoin storage...');
      
      // Call the storage API with payment confirmation
      const storageResponse = await fetch('/api/metamask/pay-for-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pinataCid: uploadState.pinataCid,
          paymentHash: uploadState.paymentHash,
          walletAddress: await getCurrentWalletAddress()
        })
      });
      
      if (!storageResponse.ok) {
        throw new Error('Filecoin storage failed');
      }
      
      const storageResult = await storageResponse.json();
      
      console.log('✅ Filecoin storage successful:', storageResult);
      
      setUploadState(prev => ({ 
        ...prev, 
        step: 'success',
        pieceCid: storageResult.uploadResult?.pieceCid,
        dealId: storageResult.uploadResult?.dealId,
        provider: storageResult.uploadResult?.provider
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

  // Helper function to get current wallet address
  const getCurrentWalletAddress = async (): Promise<string> => {
    if (!window.ethereum) return '';
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
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
      provider: null,
      error: null,
      paymentHash: null
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
              {uploadState.paymentHash ? 'Storing on Filecoin...' : 'Confirming payment...'}
            </p>
            {uploadState.paymentHash && (
              <p className="text-sm text-gray-600 mt-2">
                Payment Hash: {uploadState.paymentHash.substring(0, 20)}...
              </p>
            )}
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
              
              <div>
                <strong className="text-green-700">Provider:</strong>
                <p className="text-green-600 font-mono">{uploadState.provider}</p>
              </div>
              
              <div>
                <strong className="text-green-700">Payment Hash:</strong>
                <p className="text-green-600 font-mono text-sm">
                  {uploadState.paymentHash}
                </p>
              </div>
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
          <li>4. You get Piece CID and Deal ID</li>
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

export default FilecoinUploadWithPayment;
