'use client';

import { useState } from 'react';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header / Navbar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-900">SafeGuard</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">How it Works</a>
              <a href="#help" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Help</a>
              <button className="bg-lime-400 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-lime-300 transition-all">
                Connect Wallet
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#about" className="text-gray-600 hover:text-gray-900">About</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">How it Works</a>
                <a href="#help" className="text-gray-600 hover:text-gray-900">Help</a>
                <button className="bg-lime-400 text-gray-900 px-6 py-2 rounded-lg font-medium hover:bg-lime-300 transition-all w-full">
                  Connect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-lime-400 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-lime-300 transition-all shadow-sm">
              Login with World App Wallet
            </button>
            <button className="border border-gray-300 text-gray-900 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all">
              Get Started Anonymously
            </button>
          </div>
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
          <button className="bg-lime-400 text-gray-900 px-12 py-4 rounded-lg text-xl font-semibold hover:bg-lime-300 transition-all shadow-sm">
            Start Now
          </button>
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
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "Secure Evidence Vault",
      description: "Upload screenshots, voice notes, and chat proofs. Encrypted storage with blockchain verification.",
      bgColor: "bg-pink-100",
      iconColor: "text-pink-600"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "AI Legal Guidance",
      description: "24/7 AI chatbot providing legal advice, explaining rights, and sharing helpline numbers.",
      bgColor: "bg-indigo-100",
      iconColor: "text-indigo-600"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: "One-Click Reports",
      description: "Generate encrypted PDF reports and send directly to police or cyber cell with a single click.",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Trust Network",
      description: "Connect with verified NGOs and trusts who can file cases on your behalf if you prefer anonymity.",
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM12 17H3a1 1 0 01-1-1V4a1 1 0 011-1h9m0 14v-3m0 0V7a1 1 0 011-1h2a1 1 0 011 1v7a1 1 0 01-1 1h-2z" />
        </svg>
      ),
      title: "Live Case Tracking",
      description: "Track report status, police responses, and NGO case progress - all within the secure app environment.",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    }
  ];

  const processSteps = [
    {
      number: 1,
      title: "Anonymous Onboarding",
      description: "Open the app and log in with World App wallet (MiniKit). No personal information required - your identity stays completely private.",
      gradient: "bg-gradient-to-r from-purple-600 to-pink-600"
    },
    {
      number: 2,
      title: "Secure Evidence Collection",
      description: "Upload screenshots, voice notes, and chat proofs. All evidence is encrypted and stored with blockchain verification for tamper-proof security.",
      gradient: "bg-gradient-to-r from-pink-600 to-indigo-600"
    },
    {
      number: 3,
      title: "AI-Powered Legal Support",
      description: "Get instant legal advice from our AI chatbot. Understand your rights, learn about applicable laws, and receive mental health resources.",
      gradient: "bg-gradient-to-r from-indigo-600 to-purple-600"
    },
    {
      number: 4,
      title: "Choose Your Path",
      description: "Either generate an encrypted report for direct police filing, or connect with verified NGOs who can represent you anonymously in court.",
      gradient: "bg-gradient-to-r from-purple-600 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-100">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Safety,
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Our Priority</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Anonymous, secure, and trusted platform for women's safety. Log incidents, get AI-powered legal guidance, 
            and access support networks - all while protecting your identity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg">
              Launch App
            </button>
            <button className="border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-50 transition-all">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-gray-600">Anonymous & Secure</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
            <div className="text-gray-600">AI Legal Support</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">Instant</div>
            <div className="text-gray-600">Evidence Backup</div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Powerful Features for Your Safety</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                bgColor={feature.bgColor}
                iconColor={feature.iconColor}
              />
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">How SafeGuard Works</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-12">
              {processSteps.map((step, index) => (
                <ProcessStep
                  key={index}
                  number={step.number}
                  title={step.title}
                  description={step.description}
                  gradient={step.gradient}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-8 md:p-12 mb-20">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">In Immediate Danger?</h2>
            <p className="text-gray-600 text-lg mb-8">If you're in immediate danger, please contact emergency services directly</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:100" className="bg-red-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-700 transition-all">
                Call Police: 100
              </a>
              <a href="tel:1091" className="bg-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-pink-700 transition-all">
                Women Helpline: 1091
              </a>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Trusted by Women Everywhere</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4">"SafeGuard gave me the courage to report harassment knowing my identity would remain protected. The AI legal advisor was incredibly helpful."</p>
              <div className="text-sm text-gray-500">- Anonymous User</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4">"The ability to securely store evidence and connect with trusted NGOs made all the difference. This app is revolutionary for women's safety."</p>
              <div className="text-sm text-gray-500">- Anonymous User</div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4">"Finally, a platform that understands privacy concerns while providing real support. The blockchain evidence storage gives me peace of mind."</p>
              <div className="text-sm text-gray-500">- Anonymous User</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-white rounded-3xl p-8 md:p-12 shadow-lg">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Take Control of Your Safety?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of women who trust SafeGuard to protect their privacy while ensuring their safety and access to justice.
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-lg text-xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all shadow-lg">
            Get Started Now
          </button>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold">SafeGuard</span>
              </div>
              <p className="text-gray-400">Empowering women with anonymous, secure, and trusted safety solutions.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Legal Resources</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Emergency</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Police: 100</li>
                <li>Women Helpline: 1091</li>
                <li>Cyber Crime: 1930</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SafeGuard. All rights reserved. Built for women's safety and empowerment.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
