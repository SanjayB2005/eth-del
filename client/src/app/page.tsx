'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import WalletConnectionGuide from '@/components/WalletConnectionGuide';
import SimpleFilecoinUpload from '@/components/SimpleFilecoinUpload';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { QueryClient } from '@tanstack/react-query';

export default function Home() {
  const { primaryWallet, user } = useDynamicContext();
  const router = useRouter();
  const isAuthenticated = !!primaryWallet;
  const [showFilecoinDemo, setShowFilecoinDemo] = useState(false);

  // Redirect to dashboard if already authenticated (only from root page)
  useEffect(() => {
    if (isAuthenticated && user && typeof window !== 'undefined' && !showFilecoinDemo) {
      // Only redirect if we're exactly on the root path and not showing demo
      router.push('/reports');
    }
  }, [isAuthenticated, user, router, showFilecoinDemo]);

  // Show Filecoin demo if requested
  if (showFilecoinDemo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowFilecoinDemo(false)}
            className="mb-6 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Home
          </button>
          <SimpleFilecoinUpload />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Safe. Anonymous.<br />
            <span className="text-gray-600">Strong.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Log incidents, get AI legal help, and connect with trusted NGOs – all securely & privately.
          </p>


        </section>

        {/* Key Features */}
        <section id="features" className="py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Private Vault */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Private Vault</h3>
              <p className="text-gray-600">Upload evidence securely with end-to-end encryption and blockchain verification.</p>
            </div>

            {/* AI Guidance */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI Guidance</h3>
              <p className="text-gray-600">Get 24/7 legal & emotional support from our trained AI assistant.</p>
            </div>

            {/* Export & Report */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Export & Report</h3>
              <p className="text-gray-600">Generate police-ready files with one click. Encrypted and legally compliant.</p>
            </div>

            {/* Proxy Filing */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Proxy Filing</h3>
              <p className="text-gray-600">Trusted NGOs can help file cases on your behalf while maintaining anonymity.</p>
            </div>
          </div>
        </section>

        {/* Trust & Safety Section */}
        <section className="py-20 bg-gray-50 rounded-3xl px-8 md:px-16 my-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Your Privacy is Our Priority</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your data is encrypted. No names, no emails, no tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-lime-400 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">End-to-End Encryption</h3>
              <p className="text-gray-600">All data encrypted before leaving your device</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-lime-400 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Blockchain Verified</h3>
              <p className="text-gray-600">Immutable evidence with cryptographic proof</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-lime-400 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Zero Knowledge</h3>
              <p className="text-gray-600">We can't see your data, even if we wanted to</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How SafeGuard Works</h2>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-8">
                {/* Step 1 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    1
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Log in anonymously</h3>
                  <p className="text-gray-600 text-sm">Connect with World App Wallet</p>
                </div>

                <div className="text-gray-400 hidden md:block">→</div>

                {/* Step 2 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    2
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Upload evidence</h3>
                  <p className="text-gray-600 text-sm">Screenshots, audio, documents</p>
                </div>

                <div className="text-gray-400 hidden md:block">→</div>

                {/* Step 3 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    3
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Get AI help</h3>
                  <p className="text-gray-600 text-sm">Legal guidance & support</p>
                </div>

                <div className="text-gray-400 hidden md:block">→</div>

                {/* Step 4 */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-lime-400 text-gray-900 rounded-full flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    4
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Report or connect</h3>
                  <p className="text-gray-600 text-sm">Direct filing or NGO support</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Take control today.</h2>
          <p className="text-2xl text-gray-600 mb-12">You're not alone.</p>
          <div className="space-x-4">
            <button className="bg-lime-400 text-gray-900 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-lime-300 transition-all shadow-sm">
              Start Now
            </button>
            <button 
              onClick={() => setShowFilecoinDemo(true)}
              className="bg-purple-500 text-white px-8 py-4 rounded-lg text-xl font-semibold hover:bg-purple-600 transition-all shadow-sm"
            >
              🗄️ Try Filecoin Storage
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Emergency Numbers */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Emergency Helplines</h3>
              <ul className="space-y-2 text-gray-600">
                <li>National Women's Helpline: <span className="font-medium">1091</span></li>
                <li>Police Emergency: <span className="font-medium">100</span></li>
                <li>Cyber Crime Helpline: <span className="font-medium">1930</span></li>
                <li>Child Helpline: <span className="font-medium">1098</span></li>
              </ul>
            </div>

            {/* NGO Support */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">NGO Partners</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Women's Rights Foundation</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Legal Aid Society</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Safety Network India</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">View All Partners</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal & Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact NGO Partners</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Legal Resources</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">SafeGuard</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 SafeGuard. Built for women's safety and empowerment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}