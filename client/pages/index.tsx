import Head from "next/head";
import Link from "next/link";

// Import the globals CSS with Tailwind
import "../src/app/globals.css";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>SafeGuard AI - Women Safety & Support Platform</title>
        <meta
          name="description"
          content="AI-powered women safety platform with blockchain security"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    SafeGuard AI
                  </h1>
                  <p className="text-sm text-gray-500">
                    Women Safety & Support Platform
                  </p>
                </div>
              </div>

              <nav className="hidden md:flex space-x-8">
                <Link
                  href="#features"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#security"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Security
                </Link>
                <Link
                  href="#about"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  About
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-20 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                AI-Powered Women Safety Platform
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Confidential AI assistant for women's safety, harassment
                documentation, and legal support. Secure blockchain logging
                ensures your evidence is tamper-proof while protecting your
                privacy. Get guidance on threats, legal rights, and safety
                protocols.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/chatbot"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  Launch AI Chatbot 🤖
                </Link>
                <Link
                  href="#features"
                  className="bg-white text-gray-900 px-8 py-4 rounded-xl text-lg font-semibold border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div id="features" className="py-20">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Platform Features
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Advanced AI technology meets blockchain security for
                comprehensive women safety support
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Safety Assistant
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Confidential AI counselor trained in women's safety, legal
                  rights, harassment cases, and emergency protocols. Get
                  step-by-step guidance while maintaining complete privacy.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Blockchain Security
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Every session is automatically logged to Hedera blockchain
                  with SHA-256 hashing, ensuring immutable audit trails while
                  protecting your privacy.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Evidence Documentation
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Secure, tamper-proof logging of conversations and incidents.
                  Create legally-admissible evidence while protecting your
                  identity and privacy.
                </p>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div id="security" className="py-20">
            <div className="bg-white rounded-3xl p-12 shadow-xl">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  🔒 Privacy & Security First
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Your privacy is our priority. We use advanced cryptographic
                  techniques to ensure security without compromising
                  confidentiality.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Private by Design
                      </h4>
                      <p className="text-gray-600">
                        Full conversations remain local. Only cryptographic
                        hashes are stored on blockchain.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Immutable Audit Trail
                      </h4>
                      <p className="text-gray-600">
                        Session integrity is permanently recorded on Hedera
                        blockchain for legal verification.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        End-to-End Security
                      </h4>
                      <p className="text-gray-600">
                        All communications are encrypted and secured using
                        industry-standard protocols.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      SHA-256 Hashing
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Every session is cryptographically hashed using SHA-256
                      algorithm. This creates a unique fingerprint that can
                      detect any tampering while keeping your data completely
                      private.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 text-center">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                Experience the future of secure AI assistance with
                blockchain-backed audit trails. Perfect for legal professionals,
                law enforcement, and security-conscious users.
              </p>
              <Link
                href="/chatbot"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg inline-block"
              >
                Launch SafeGuard AI Chatbot →
              </Link>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-600">
              <p>
                &copy; 2025 SafeGuard AI. Powered by Hedera Hashgraph & Gemini
                AI.
              </p>
              <p className="text-sm mt-2">
                Secure • Private • Blockchain-Verified
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
