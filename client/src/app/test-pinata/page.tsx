'use client'

import { useState } from 'react'

export default function TestPinata() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testPinataAuth = async () => {
    setLoading(true)
    try {
      // Test authentication with Pinata API
      const jwt = process.env.NEXT_PUBLIC_PINATA_JWT
      const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      console.log('JWT length:', jwt?.length)
      console.log('API Key:', apiKey)
      console.log('Secret Key length:', secretKey?.length)

      // Test with JWT first
      if (jwt) {
        setResult('Testing JWT authentication...')
        const jwtResponse = await fetch('https://api.pinata.cloud/data/testAuthentication', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        })

        if (jwtResponse.ok) {
          const jwtData = await jwtResponse.text()
          setResult(`JWT Auth Success: ${jwtData}`)
          setLoading(false)
          return
        } else {
          setResult(`JWT Auth Failed: ${jwtResponse.status} - ${jwtResponse.statusText}`)
        }
      }

      // Test with API keys
      if (apiKey && secretKey) {
        setResult(prev => prev + '\n\nTesting API Key authentication...')
        const keyResponse = await fetch('https://api.pinata.cloud/data/testAuthentication', {
          method: 'GET',
          headers: {
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': secretKey
          }
        })

        if (keyResponse.ok) {
          const keyData = await keyResponse.text()
          setResult(prev => prev + `\n\nAPI Key Auth Success: ${keyData}`)
        } else {
          setResult(prev => prev + `\n\nAPI Key Auth Failed: ${keyResponse.status} - ${keyResponse.statusText}`)
        }
      }

    } catch (error) {
      setResult(`Error: ${error}`)
    }
    setLoading(false)
  }

  const listFiles = async () => {
    setLoading(true)
    try {
      const jwt = process.env.NEXT_PUBLIC_PINATA_JWT
      const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY
      const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

      const headers: Record<string, string> = {}
      
      if (jwt) {
        headers['Authorization'] = `Bearer ${jwt}`
      } else if (apiKey && secretKey) {
        headers['pinata_api_key'] = apiKey
        headers['pinata_secret_api_key'] = secretKey
      }

      const response = await fetch('https://api.pinata.cloud/data/pinList?pageLimit=10', {
        method: 'GET',
        headers
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`Files found: ${data.count}\n\n${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`List files failed: ${response.status} - ${response.statusText}`)
      }

    } catch (error) {
      setResult(`Error listing files: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Pinata Authentication Test</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testPinataAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Authentication
        </button>
        
        <button 
          onClick={listFiles}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          List Files
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Environment Variables:</h2>
        <pre className="text-sm">
{`JWT: ${process.env.NEXT_PUBLIC_PINATA_JWT ? `${process.env.NEXT_PUBLIC_PINATA_JWT.substring(0, 50)}...` : 'Not set'}
API Key: ${process.env.NEXT_PUBLIC_PINATA_API_KEY || 'Not set'}
Secret Key: ${process.env.NEXT_PUBLIC_PINATA_SECRET_KEY ? `${process.env.NEXT_PUBLIC_PINATA_SECRET_KEY.substring(0, 20)}...` : 'Not set'}
Gateway: ${process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'Not set'}`}
        </pre>
      </div>

      {loading && <p>Loading...</p>}
      
      <div className="mt-6">
        <h2 className="font-bold mb-2">Result:</h2>
        <pre className="bg-black text-green-400 p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap">
          {result}
        </pre>
      </div>
    </div>
  )
}