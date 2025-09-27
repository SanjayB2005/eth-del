'use client'

import { useState } from 'react'

export default function PinataAuthTest() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testCredentials = async () => {
    setLoading(true)
    setResult('Testing Pinata credentials...\n\n')

    try {
      // Get the environment variables
      const jwt = process.env.NEXT_PUBLIC_PINATA_JWT
      const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      // Log what we have
      setResult(prev => prev + `Environment Variables:\n`)
      setResult(prev => prev + `JWT Length: ${jwt?.length || 0}\n`)
      setResult(prev => prev + `API Key: ${apiKey}\n`)
      setResult(prev => prev + `Secret Key Length: ${secretKey?.length || 0}\n\n`)

      // Try with your current credentials
      const headers: Record<string, string> = {
        'pinata_api_key': '74805c466fc3c7bbe9db',
        'pinata_secret_api_key': '106cd5807d79c6109cad1f4b48c83c99f66a89c914dcf6b99e9732427bad43e'
      }

      setResult(prev => prev + 'Testing with API keys...\n')

      // Test authentication
      const authResponse = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers
      })

      setResult(prev => prev + `Auth Response: ${authResponse.status} ${authResponse.statusText}\n`)

      if (authResponse.ok) {
        const authText = await authResponse.text()
        setResult(prev => prev + `Auth Success: ${authText}\n\n`)

        // Try listing files
        setResult(prev => prev + 'Listing files...\n')
        const listResponse = await fetch('https://api.pinata.cloud/data/pinList?pageLimit=5', {
          method: 'GET',
          headers
        })

        setResult(prev => prev + `List Response: ${listResponse.status} ${listResponse.statusText}\n`)

        if (listResponse.ok) {
          const listData = await listResponse.json()
          setResult(prev => prev + `Files found: ${listData.count}\n`)
          setResult(prev => prev + `Data: ${JSON.stringify(listData, null, 2)}\n`)
        } else {
          const errorText = await listResponse.text()
          setResult(prev => prev + `List Error: ${errorText}\n`)
        }
      } else {
        const errorText = await authResponse.text()
        setResult(prev => prev + `Auth Error: ${errorText}\n`)
      }

    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`)
    }

    setLoading(false)
  }

  const testFileUpload = async () => {
    setLoading(true)
    setResult('Testing file upload...\n\n')

    try {
      // Create a simple test file
      const testContent = 'Hello from ETH-DEL evidence system!'
      const file = new File([testContent], 'test-evidence.txt', { type: 'text/plain' })
      
      const formData = new FormData()
      formData.append('file', file)
      
      const pinataMetadata = JSON.stringify({
        name: 'Test Evidence File',
        keyvalues: {
          category: 'test',
          source: 'eth-del-app'
        }
      })
      formData.append('pinataMetadata', pinataMetadata)

      const pinataOptions = JSON.stringify({
        cidVersion: 0
      })
      formData.append('pinataOptions', pinataOptions)

      const headers = {
        'pinata_api_key': '74805c466fc3c7bbe9db',
        'pinata_secret_api_key': '106cd5807d79c6109cad1f4b48c83c99f66a89c914dcf6b99e9732427bad43e'
      }

      setResult(prev => prev + 'Uploading test file...\n')

      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData
      })

      setResult(prev => prev + `Upload Response: ${response.status} ${response.statusText}\n`)

      if (response.ok) {
        const data = await response.json()
        setResult(prev => prev + `Upload Success!\n`)
        setResult(prev => prev + `IPFS Hash: ${data.IpfsHash}\n`)
        setResult(prev => prev + `File URL: https://coral-hollow-amphibian-910.mypinata.cloud/ipfs/${data.IpfsHash}\n`)
        setResult(prev => prev + `Full Response: ${JSON.stringify(data, null, 2)}\n`)
      } else {
        const errorText = await response.text()
        setResult(prev => prev + `Upload Error: ${errorText}\n`)
      }

    } catch (error) {
      setResult(prev => prev + `Error: ${error}\n`)
    }

    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Pinata Authentication & Upload Test</h1>
      
      <div className="space-x-4 mb-6">
        <button
          onClick={testCredentials}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Authentication
        </button>
        
        <button
          onClick={testFileUpload}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test File Upload
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
        <pre className="whitespace-pre-wrap">{result}</pre>
        {loading && <div className="animate-pulse">Testing...</div>}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Debug Info</h3>
        <p className="text-sm">Gateway: coral-hollow-amphibian-910.mypinata.cloud</p>
        <p className="text-sm">API Key: 74805c466fc3c7bbe9db</p>
        <p className="text-sm">Files will be accessible at: https://coral-hollow-amphibian-910.mypinata.cloud/ipfs/[hash]</p>
      </div>
    </div>
  )
}