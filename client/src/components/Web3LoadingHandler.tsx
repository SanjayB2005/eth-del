'use client';

import { useEffect, useState } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export default function Web3LoadingHandler({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);
  const { user, primaryWallet } = useDynamicContext();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during SSR and initial client load
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Web3...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}