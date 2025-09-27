'use client'

import React, { useState } from 'react'
import { useFileUpload, UploadedEvidence } from '@/hooks/useFileUpload'

interface StoredEvidence extends UploadedEvidence {
  isSharedWithPolice: boolean
}

export default function EvidenceStorage() {
  const [storedEvidence, setStoredEvidence] = useState<StoredEvidence[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [description, setDescription] = useState('')
  const { uploadFile, uploadMultipleFiles, isUploading, progress, error, clearError } = useFileUpload()

  // Load evidence from localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('victim-evidence')
      if (stored) {
        try {
          setStoredEvidence(JSON.parse(stored))
        } catch (e) {
          console.error('Error loading stored evidence:', e)
        }
      }
    }
  }, [])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const saveToLocalStorage = (evidence: StoredEvidence[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('victim-evidence', JSON.stringify(evidence))
    }
  }

  const handleFiles = async (files: FileList) => {
    try {
      clearError()
      
      if (files.length === 1) {
        // Single file upload
        const file = files[0]
        const evidence = await uploadFile(file, description || undefined)
        
        const newStoredEvidence: StoredEvidence = {
          ...evidence,
          isSharedWithPolice: false
        }
        
        const updatedEvidence = [...storedEvidence, newStoredEvidence]
        setStoredEvidence(updatedEvidence)
        saveToLocalStorage(updatedEvidence)
      } else {
        // Multiple files upload
        const descriptions = description ? Array.from(files).map(() => description) : undefined
        const evidenceList = await uploadMultipleFiles(files, descriptions)
        
        const newStoredEvidenceList = evidenceList.map(evidence => ({
          ...evidence,
          isSharedWithPolice: false
        }))
        
        const updatedEvidence = [...storedEvidence, ...newStoredEvidenceList]
        setStoredEvidence(updatedEvidence)
        saveToLocalStorage(updatedEvidence)
      }
      
      setDescription('')
    } catch (err) {
      console.error('Upload failed:', err)
      // Error is handled by the hook
    }
  }



  const getFileIcon = (type: StoredEvidence['type']) => {
    switch (type) {
      case 'screenshot':
        return (
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      case 'audio':
        return (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )
      case 'video':
        return (
          <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'chat':
        return (
          <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
    }
  }

  const deleteEvidence = (id: string) => {
    const updatedEvidence = storedEvidence.filter(e => e.id !== id)
    setStoredEvidence(updatedEvidence)
    saveToLocalStorage(updatedEvidence)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Private Evidence Storage</h1>
          <p className="text-gray-600 mb-4">
            Store your evidence privately and securely. Only YOU control who can see it. Evidence is encrypted and stored on a decentralized network.
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              IPFS Stored
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Private & Encrypted
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              You Control Access
            </div>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Store New Evidence</h2>
        
        {/* Description Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Briefly describe this evidence (e.g., 'Screenshot of threatening message', 'Voice recording from incident')"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
            rows={2}
          />
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {isUploading ? (
            <div className="space-y-4">
              <div className="animate-spin mx-auto w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full"></div>
              {progress ? (
                <>
                  <p className="text-lg font-medium text-gray-900">{progress.message || 'Uploading to IPFS...'}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">{Math.round(progress.progress)}% complete</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-900">Uploading to IPFS...</p>
                  <p className="text-sm text-gray-500">Encrypting and storing your evidence securely</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                  <button
                    onClick={clearError}
                    className="text-red-600 hover:text-red-800 text-xs underline mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              <div className="flex justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Drop files here or click to store privately</p>
                <p className="text-sm text-gray-500 mt-1">
                  Supports: Screenshots, Audio, Video, Documents, Chat logs
                </p>
              </div>
              <input
                type="file"
                multiple
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.gif,.mp3,.wav,.m4a,.mp4,.avi,.mov,.pdf,.txt,.doc,.docx,.json"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-6 py-3 rounded-lg transition-colors cursor-pointer ${
                  isUploading 
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Choose Files
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Stored Evidence */}
      {storedEvidence.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Private Evidence Storage ({storedEvidence.length})</h2>
            <div className="flex space-x-2">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Export Backup
              </button>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                File Report
              </button>
            </div>
          </div>
          
          <div className="space-y-3">
            {storedEvidence.map((evidence) => (
              <div key={evidence.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  {getFileIcon(evidence.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">{evidence.name}</p>
                    {evidence.isSharedWithPolice ? (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200">
                        Shared with Police
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full border border-green-200">
                        Private
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <p className="text-xs text-gray-500">{evidence.size}</p>
                    <span className="text-xs text-gray-400">•</span>
                    <p className="text-xs text-gray-500">{evidence.uploadDate}</p>
                    {evidence.description && (
                      <>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-600 truncate">{evidence.description}</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <p className="text-xs text-blue-600 font-mono">IPFS: {evidence.ipfsHash}</p>
                    <button
                      onClick={() => window.open(`https://${process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'}/ipfs/${evidence.ipfsHash}`, '_blank')}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      View on IPFS
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteEvidence(evidence.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-purple-900 mb-1">How Private Storage Works</h3>
            <div className="text-sm text-purple-800 space-y-2">
              <p>• Evidence stored on IPFS (InterPlanetary File System) - completely decentralized</p>
              <p>• Files are encrypted with your device key - only you can decrypt them</p>
              <p>• No one (including us) can access your evidence without your explicit permission</p>
              <p>• When you're ready to report, you choose which evidence to share</p>
              <p>• You can create reports online or provide access codes for offline reporting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}