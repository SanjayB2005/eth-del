'use client';

import FilecoinPaymentSetup from '@/components/FilecoinPaymentSetup';

export default function PaymentSetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🔧 Filecoin Payment Setup
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Set up your Filecoin payments to enable decentralized storage for your uploaded files. 
            Follow the steps below to get started with tFIL tokens and payment configuration.
          </p>
        </div>

        <FilecoinPaymentSetup />
      </div>
    </div>
  );
}