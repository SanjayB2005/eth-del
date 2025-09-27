'use client'

import { useState, useEffect } from 'react'

interface PinataFile {
  id: string
  ipfs_pin_hash: string
  size: number
  user_id: string
  date_pinned: string
  date_unpinned: string | null
  metadata: {
    name?: string
    keyvalues?: Record<string, string>
  }
}

interface PinataResponse {
  count: number
  rows: PinataFile[]
}

export default function PinataFileListing() {
  const [files, setFiles] = useState<PinataFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [authStatus, setAuthStatus] = useState<string>('')

  const testAuth = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Get environment variables
      const jwt = process.env.NEXT_PUBLIC_PINATA_JWT
      const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      console.log('Environment check:')
      console.log('JWT exists:', !!jwt)
      console.log('JWT length:', jwt?.length || 0)
      console.log('API Key:', apiKey)
      console.log('Secret Key exists:', !!secretKey)

      setAuthStatus(`JWT: ${jwt ? 'Present (' + jwt.length + ' chars)' : 'Missing'}, API Key: ${apiKey || 'Missing'}, Secret: ${secretKey ? 'Present' : 'Missing'}`)

      // Test authentication endpoint
      let headers: Record<string, string> = {}
      
      if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`
      } else if (apiKey && secretKey) {
        headers['pinata_api_key'] = apiKey
        headers['pinata_secret_api_key'] = secretKey
      } else {
        throw new Error('No Pinata credentials found')
      }

      // Test auth first
      const authResponse = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers
      })

      if (!authResponse.ok) {
        const errorText = await authResponse.text()
        throw new Error(`Authentication failed: ${authResponse.status} - ${errorText}`)
      }

      const authResult = await authResponse.text()
      console.log('Auth test result:', authResult)

      // Now try to list files
      const listResponse = await fetch('https://api.pinata.cloud/data/pinList?pageLimit=20', {
        method: 'GET',
        headers
      })

      if (!listResponse.ok) {
        const errorText = await listResponse.text()
        throw new Error(`Failed to list files: ${listResponse.status} - ${errorText}`)
      }

      const data: PinataResponse = await listResponse.json()
      setFiles(data.rows)
      setAuthStatus(`✅ Success! Found ${data.count} files`)
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setAuthStatus(`❌ Failed: ${errorMessage}`)
    }
    
    setLoading(false)
  }

  const getFileUrl = (hash: string) => {
    return `https://coral-hollow-amphibian-910.mypinata.cloud/ipfs/${hash}`
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pinata File Manager</h1>
      
      <div className="mb-6">
        <button
          onClick={testAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Pinata Connection & List Files'}
        </button>
      </div>

      {authStatus && (
        <div className={`p-4 rounded-lg mb-4 ${authStatus.startsWith('✅') ? 'bg-green-100 text-green-800' : authStatus.startsWith('❌') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
          <strong>Status:</strong> {authStatus}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold">Your IPFS Files</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hash</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {file.metadata?.name || 'Unnamed'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-mono">
                        {file.ipfs_pin_hash.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.date_pinned).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={getFileUrl(file.ipfs_pin_hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(file.ipfs_pin_hash)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Copy Hash
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold mb-2">Gateway Information</h3>
        <p className="text-sm text-gray-600">
          Custom Gateway: <span className="font-mono">coral-hollow-amphibian-910.mypinata.cloud</span>
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Files are accessible at: <span className="font-mono">https://coral-hollow-amphibian-910.mypinata.cloud/ipfs/[hash]</span>
        </p>
      </div>
    </div>
  )
}