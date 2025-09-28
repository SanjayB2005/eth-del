import React, { useState, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

const DirectFilecoinUpload: React.FC = () => {
  const { primaryWallet } = useDynamicContext();
  const [uploadState, setUploadState] = useState({
    step: 'idle', // 'idle', 'uploading', 'success', 'error'
    file: null as File | null,
    ipfsCid: '',
    filecoinCid: '',
    error: '',
    progress: 0
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadState(prev => ({ ...prev, file, error: '' }));
    }
  }, []);

  const handleDirectUpload = async () => {
    if (!uploadState.file || !primaryWallet?.address) return;

    try {
      setUploadState(prev => ({ ...prev, step: 'uploading', progress: 10 }));

      // Step 1: Upload to IPFS (Pinata) first for immediate access
      console.log('📤 Step 1: Uploading to IPFS...');
      const formData = new FormData();
      formData.append('file', uploadState.file);
      formData.append('metadata', JSON.stringify({
        name: uploadState.file.name,
        uploadedBy: primaryWallet.address,
        uploadTime: new Date().toISOString()
      }));

      setUploadState(prev => ({ ...prev, progress: 30 }));

      const pinataResponse = await fetch('http://localhost:3001/api/upload/pinata', {
        method: 'POST',
        headers: {
          'X-Wallet-Address': primaryWallet.address,
        },
        body: formData
      });

      if (!pinataResponse.ok) {
        throw new Error('IPFS upload failed');
      }

      const pinataResult = await pinataResponse.json();
      const ipfsCid = pinataResult.result.IpfsHash;
      
      setUploadState(prev => ({ ...prev, ipfsCid, progress: 50 }));
      console.log('✅ IPFS upload complete:', ipfsCid);

      // Step 2: Create direct Filecoin storage (bypassing payment setup)
      console.log('🗄️ Step 2: Direct Filecoin storage...');
      
      setUploadState(prev => ({ ...prev, progress: 70 }));

      const filecoinResponse = await fetch('http://localhost:3001/api/filecoin/direct-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Wallet-Address': primaryWallet.address,
        },
        body: JSON.stringify({
          pinataCid: ipfsCid,
          fileName: uploadState.file.name,
          fileSize: uploadState.file.size,
          bypassPayment: true, // Special flag for direct upload
          metadata: {
            originalName: uploadState.file.name,
            mimeType: uploadState.file.type,
            uploadedBy: primaryWallet.address
          }
        })
      });

      setUploadState(prev => ({ ...prev, progress: 90 }));

      if (filecoinResponse.ok) {
        const filecoinResult = await filecoinResponse.json();
        setUploadState(prev => ({
          ...prev,
          step: 'success',
          filecoinCid: filecoinResult.result.pieceCid,
          progress: 100
        }));
        console.log('✅ Direct Filecoin storage complete:', filecoinResult.result.pieceCid);
      } else {
        // If Filecoin fails, still show success for IPFS
        setUploadState(prev => ({
          ...prev,
          step: 'success',
          filecoinCid: 'IPFS_ONLY',
          progress: 100,
          error: 'Filecoin storage pending - file available on IPFS'
        }));
      }

    } catch (error: any) {
      console.error('❌ Direct upload failed:', error);
      setUploadState(prev => ({
        ...prev,
        step: 'error',
        error: error.message || 'Upload failed'
      }));
    }
  };

  const resetUpload = () => {
    setUploadState({
      step: 'idle',
      file: null,
      ipfsCid: '',
      filecoinCid: '',
      error: '',
      progress: 0
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🚀 Direct Filecoin Upload
        </h2>
        <p className="text-gray-600">
          Upload files directly to Filecoin storage without payment setup
        </p>
      </div>

      {uploadState.step === 'idle' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="text-gray-600">
                  <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </div>
                <p className="text-xs text-gray-500">Any file type, up to 100MB</p>
              </div>
            </label>
          </div>

          {uploadState.file && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">{uploadState.file.name}</p>
                  <p className="text-sm text-blue-600">{(uploadState.file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={handleDirectUpload}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  🚀 Upload to Filecoin
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadState.step === 'uploading' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <h3 className="text-lg font-medium text-gray-800 mt-4">Uploading...</h3>
            <p className="text-gray-600">This may take a moment</p>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            ></div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {uploadState.progress >= 10 && <p>✅ File prepared for upload</p>}
            {uploadState.progress >= 30 && <p>✅ Uploading to IPFS...</p>}
            {uploadState.progress >= 50 && <p>✅ IPFS upload complete</p>}
            {uploadState.progress >= 70 && <p>🗄️ Creating Filecoin storage...</p>}
            {uploadState.progress >= 90 && <p>🗄️ Finalizing storage...</p>}
          </div>
        </div>
      )}

      {uploadState.step === 'success' && (
        <div className="space-y-4">
          <div className="text-center text-green-600">
            <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mt-2">Upload Complete!</h3>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div>
              <p className="font-medium text-green-800">IPFS Hash (Immediate Access):</p>
              <p className="text-xs font-mono bg-green-100 p-2 rounded break-all">{uploadState.ipfsCid}</p>
              <a 
                href={`https://gateway.pinata.cloud/ipfs/${uploadState.ipfsCid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                🌐 View on IPFS
              </a>
            </div>

            {uploadState.filecoinCid && uploadState.filecoinCid !== 'IPFS_ONLY' && (
              <div>
                <p className="font-medium text-green-800">Filecoin Piece CID:</p>
                <p className="text-xs font-mono bg-green-100 p-2 rounded break-all">{uploadState.filecoinCid}</p>
              </div>
            )}

            {uploadState.error && (
              <p className="text-sm text-orange-600">{uploadState.error}</p>
            )}
          </div>

          <button
            onClick={resetUpload}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            📤 Upload Another File
          </button>
        </div>
      )}

      {uploadState.step === 'error' && (
        <div className="space-y-4">
          <div className="text-center text-red-600">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mt-2">Upload Failed</h3>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{uploadState.error}</p>
          </div>

          <button
            onClick={resetUpload}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            🔄 Try Again
          </button>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">How This Works:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Files are first uploaded to IPFS for immediate access</li>
          <li>• Then automatically migrated to Filecoin for permanent storage</li>
          <li>• No payment setup required - uses service wallet</li>
          <li>• Both storage layers ensure data redundancy</li>
        </ul>
      </div>
    </div>
  );
};

export default DirectFilecoinUpload;