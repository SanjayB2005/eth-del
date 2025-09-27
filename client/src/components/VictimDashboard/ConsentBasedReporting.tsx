'use client'

import React, { useState } from 'react'
import Link from 'next/link'

interface StoredEvidence {
  id: string
  name: string
  type: 'screenshot' | 'audio' | 'video' | 'chat' | 'document'
  size: string
  uploadDate: string
  ipfsHash: string
  description?: string
}

// Note: In a real app, this would come from a global state or context
// For demo purposes, using localStorage to persist evidence between sessions
function getStoredEvidenceFromStorage(): StoredEvidence[] {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('victim-evidence')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Error parsing stored evidence:', e)
      }
    }
  }
  return []
}

export default function ConsentBasedReporting() {
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([])
  const [reportingMethod, setReportingMethod] = useState<'online' | 'offline' | null>(null)
  const [reportDetails, setReportDetails] = useState({
    title: '',
    description: '',
    urgency: 'medium' as 'low' | 'medium' | 'high'
  })
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [storedEvidence, setStoredEvidence] = useState<StoredEvidence[]>([])
  
  // Load stored evidence on component mount
  React.useEffect(() => {
    const evidence = getStoredEvidenceFromStorage()
    setStoredEvidence(evidence)
  }, [])

  const toggleEvidenceSelection = (evidenceId: string) => {
    setSelectedEvidence(prev =>
      prev.includes(evidenceId)
        ? prev.filter(id => id !== evidenceId)
        : [...prev, evidenceId]
    )
  }

  const getFileIcon = (type: StoredEvidence['type']) => {
    switch (type) {
      case 'screenshot':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'audio':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const handleSubmitReport = () => {
    setShowConfirmation(true)
  }

  if (showConfirmation) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-green-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Report Successfully Submitted</h1>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Your report has been submitted and your selected evidence is now accessible to law enforcement.
            You will receive updates on the progress of your case.
          </p>
          
          {reportingMethod === 'offline' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Offline Reporting Code</h3>
              <p className="text-sm text-blue-800 mb-3">
                Provide this code to law enforcement when filing your report in person or over the phone:
              </p>
              <div className="font-mono text-lg bg-white p-3 rounded border border-blue-300 text-blue-900">
                VR-{Date.now().toString().slice(-8).toUpperCase()}
              </div>
              <p className="text-xs text-blue-700 mt-2">
                This code gives police access only to the evidence you selected for this specific report.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
            <Link
              href="/reports"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View My Reports
            </Link>
            <Link
              href="/storage"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Return to Storage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File Official Report</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose which evidence to share with law enforcement and how you want to file your report.
            You have complete control over what gets shared.
          </p>
        </div>
      </div>

      {/* Report Details */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Title *
            </label>
            <input
              type="text"
              value={reportDetails.title}
              onChange={(e) => setReportDetails(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief title describing the incident (e.g., 'Online harassment and stalking')"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={reportDetails.description}
              onChange={(e) => setReportDetails(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what happened, when it occurred, and any relevant context..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              rows={4}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <div className="flex space-x-4">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={reportDetails.urgency === level}
                    onChange={(e) => setReportDetails(prev => ({ ...prev, urgency: e.target.value as any }))}
                    className="mr-2 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="capitalize text-sm text-gray-700">{level}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Evidence to Share ({selectedEvidence.length} of {storedEvidence.length})
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose which evidence from your private storage to include with this report. Only selected items will be accessible to law enforcement.
        </p>
        
        <div className="space-y-3">
          {storedEvidence.map((evidence: StoredEvidence) => (
            <div key={evidence.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedEvidence.includes(evidence.id)}
                onChange={() => toggleEvidenceSelection(evidence.id)}
                className="w-5 h-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <div className="flex-shrink-0">
                {getFileIcon(evidence.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{evidence.name}</p>
                <p className="text-sm text-gray-600">{evidence.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">{evidence.size}</p>
                  <span className="text-xs text-gray-400">•</span>
                  <p className="text-xs text-blue-600 font-mono">IPFS: {evidence.ipfsHash}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {storedEvidence.length === 0 && (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-gray-600 mb-4">No evidence stored yet</p>
            <Link
              href="/storage"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Store Evidence First
            </Link>
          </div>
        )}
      </div>

      {/* Reporting Method */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Reporting Method</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => setReportingMethod('online')}
            className={`p-6 border-2 rounded-xl text-left transition-colors ${
              reportingMethod === 'online'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
              </svg>
              <h3 className="font-semibold text-gray-900">Online Report</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Submit your report directly through this platform. Law enforcement will be notified immediately.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Instant notification to police</li>
              <li>• Digital case tracking</li>
              <li>• Immediate evidence access</li>
            </ul>
          </button>
          
          <button
            onClick={() => setReportingMethod('offline')}
            className={`p-6 border-2 rounded-xl text-left transition-colors ${
              reportingMethod === 'offline'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <h3 className="font-semibold text-gray-900">Offline Report</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Get an access code to provide when filing your report in person or by phone with police.
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Report in person or by phone</li>
              <li>• Secure access code provided</li>
              <li>• Evidence shared only when code is used</li>
            </ul>
          </button>
        </div>
      </div>

      {/* Submit Section */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Ready to Submit?</h3>
            <p className="text-sm text-gray-600">
              {selectedEvidence.length > 0 
                ? `${selectedEvidence.length} evidence file(s) will be shared with law enforcement.`
                : 'Please select at least one evidence file to include.'
              }
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Link
              href="/storage"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Storage
            </Link>
            <button
              onClick={handleSubmitReport}
              disabled={!reportDetails.title || !reportDetails.description || selectedEvidence.length === 0 || !reportingMethod}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Report
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-purple-900 mb-1">Your Privacy & Control</h3>
            <div className="text-sm text-purple-800 space-y-1">
              <p>• Only selected evidence will be accessible to law enforcement</p>
              <p>• Unselected evidence remains completely private in your IPFS storage</p>
              <p>• You can add or remove evidence from reports later if needed</p>
              <p>• All evidence sharing requires your explicit consent</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}