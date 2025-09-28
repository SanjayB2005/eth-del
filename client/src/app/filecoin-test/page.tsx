'use client';

import SimpleFilecoinUpload from '@/components/SimpleFilecoinUpload';

export default function FilecoinTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🗄️ Filecoin Storage Test
          </h1>
          <p className="text-gray-600">
            Test the complete MetaMask payment flow for Filecoin storage
          </p>
        </div>
        
        <SimpleFilecoinUpload />
        
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">🔧 Debug Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Server:</strong> http://localhost:3002</p>
            <p><strong>Client:</strong> http://localhost:3030</p>
            <p><strong>Network:</strong> Filecoin Calibration Testnet</p>
            <p><strong>Payment:</strong> 0.001 tFIL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
