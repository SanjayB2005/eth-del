'use client';

import VictimLayout from '@/components/VictimDashboard/VictimLayout'
import ServerEvidenceUpload from '@/components/VictimDashboard/ServerEvidenceUpload'
import ServerFileManager from '@/components/VictimDashboard/ServerFileManager'
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export default function StoragePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  // const { isAuthenticated, isLoading, isInitialized, user } = useAuth();
  const {user, primaryWallet} = useDynamicContext();
  const router = useRouter();
  const isAuthenticated = !!primaryWallet;

  // Redirect to home if not authenticated after proper initialization
  useEffect(() => {
    const checkAuth = async () => {
      // console.log('Storage page auth check:', { 
      //   isLoading, 
      //   isInitialized, 
      //   isAuthenticated, 
      //   hasUser: !!user 
      // });
      
      // Wait for complete auth initialization (both loading and wallet checks)
      // if (isLoading || !isInitialized) {
      //   console.log('Still initializing authentication...');
      //   return;
      // }
      
      // Only redirect if definitively not authenticated after full initialization
      if (!isAuthenticated && !user) {
        console.log('Not authenticated after full initialization, redirecting to home');
        router.push('/');
      } else if (isAuthenticated && user) {
        console.log('✅ User is authenticated:', primaryWallet.address);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, router, user]);

  const handleUploadComplete = (result: any) => {
    console.log('Upload completed:', result);
    // Trigger refresh of file manager
    setRefreshKey(prev => prev + 1);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  // Show loading state while authentication is initializing
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


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