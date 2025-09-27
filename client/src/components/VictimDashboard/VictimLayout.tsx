'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import AuthDebugger from '@/lib/authDebugger'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'

interface VictimLayoutProps {
  children: React.ReactNode
}

export default function VictimLayout({ children }: VictimLayoutProps) {
  // const { user, logout } = useAuth();
  const {user, primaryWallet, handleLogOut} = useDynamicContext();
  const [showDebug, setShowDebug] = useState(false);

  const getShortAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleDebugTest = async () => {
    console.log('🔧 Running authentication debug test...');
    AuthDebugger.checkTokenStatus();
    await AuthDebugger.testAPICall();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-purple-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Safe Report</h1>
              <p className="text-xs text-purple-600">Your voice matters. You are not alone.</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user && primaryWallet && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-mono text-gray-700">
                  {getShortAddress(primaryWallet?.address)}
                </span>
              </div>
            )}
            <button className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-sm font-medium">Get Help Now</span>
            </button>
            <button 
              onClick={() => {handleLogOut}}
              className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-purple-200 min-h-screen shadow-sm">
          <div className="p-4">
            <nav className="space-y-2">
              {/* Main Actions */}
              <Link href="/storage" className="flex items-center px-4 py-3 text-blue-600 bg-blue-50 rounded-lg font-medium border border-blue-200">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Store Evidence
              </Link>
              
              <Link href="/report" className="flex items-center px-4 py-3 text-purple-600 bg-purple-50 rounded-lg font-medium border border-purple-200">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                File Report
              </Link>
              
              <Link href="/reports" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>My Reports</span>
                <span className="ml-auto bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full font-medium">2</span>
              </Link>
              
              <Link href="/pinata-files" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>IPFS Files</span>
              </Link>

              {/* Support Section */}
              <div className="pt-6">
                <div className="px-4 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Support & Safety</h3>
                </div>
                
                <a href="/report/safety-tips" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Safety Tips</span>
                </a>
                
                <a href="/report/resources" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Support Resources</span>
                </a>
                
                <a href="/report/privacy" className="flex items-center px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Privacy & Security</span>
                </a>
              </div>

              {/* Emergency Contact */}
              <div className="pt-6 border-t border-purple-200 mt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <h4 className="font-medium text-red-900 text-sm">Emergency?</h4>
                  </div>
                  <p className="text-xs text-red-800 mb-3">If you are in immediate danger, call emergency services</p>
                  <button className="w-full bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                    Call 911
                  </button>
                </div>
              </div>

              {/* Debug Section (Development Only) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <button 
                    onClick={() => setShowDebug(!showDebug)}
                    className="flex items-center px-4 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Debug Tools
                  </button>
                  
                  {showDebug && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <button 
                        onClick={handleDebugTest}
                        className="w-full text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors mb-2"
                      >
                        Test API Auth
                      </button>
                      <button 
                        onClick={() => AuthDebugger.checkTokenStatus()}
                        className="w-full text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition-colors mb-2"
                      >
                        Check Tokens
                      </button>
                      <button 
                        onClick={() => AuthDebugger.clearAllTokens()}
                        className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors"
                      >
                        Clear Tokens
                      </button>
                    </div>
                  )}
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}