'use client';

import VictimLayout from '@/components/VictimDashboard/VictimLayout'
import ServerEvidenceUpload from '@/components/VictimDashboard/ServerEvidenceUpload'
import ServerFileManager from '@/components/VictimDashboard/ServerFileManager'
import { useState } from 'react';

export default function StoragePage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadComplete = (result: any) => {
    console.log('Upload completed:', result);
    // Trigger refresh of file manager
    setRefreshKey(prev => prev + 1);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  return (
    <VictimLayout>
      <div className="space-y-8">
        {/* Server-based Evidence Upload */}
        <ServerEvidenceUpload
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />
        
        {/* Server-based File Manager */}
        <div key={refreshKey}>
          <ServerFileManager />
        </div>

        {/* Info section about the new architecture */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-3">🆕 Enhanced Storage System</h3>
          <div className="text-green-700 space-y-2">
            <p><strong>New Features:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Wallet-based authentication with secure server API</li>
              <li>Immediate IPFS storage via Pinata</li>
              <li>Automatic Filecoin migration for long-term storage</li>
              <li>Real-time migration status tracking</li>
              <li>Enhanced file metadata and organization</li>
              <li>Server-side API key management for security</li>
            </ul>
            <p className="mt-3"><strong>Migration Status:</strong> Files are first stored on IPFS (Pinata) for immediate access, then automatically migrated to Filecoin for permanent, decentralized storage.</p>
          </div>
        </div>
      </div>
    </VictimLayout>
  )
}