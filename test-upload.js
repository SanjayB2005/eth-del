#!/usr/bin/env node

// Simple test script to verify the server upload endpoint works with wallet address authentication

const fs = require('fs');
const path = require('path');

async function testUpload() {
  const testWalletAddress = '0x1234567890123456789012345678901234567890';
  
  // Create a simple test file
  const testContent = 'This is a test file for Dynamic SDK authentication';
  const testFile = Buffer.from(testContent, 'utf8');
  
  const formData = new FormData();
  const blob = new Blob([testFile], { type: 'text/plain' });
  formData.append('file', blob, 'test.txt');
  formData.append('metadata', JSON.stringify({ test: true, timestamp: new Date().toISOString() }));
  
  try {
    console.log('🧪 Testing upload with wallet address authentication...');
    console.log('Wallet Address:', testWalletAddress);
    console.log('Server URL: http://localhost:3001/api/upload');
    
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      headers: {
        'X-Wallet-Address': testWalletAddress,
      },
      body: formData
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Upload successful!');
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Upload failed');
      console.log('Error response:', errorText);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Test health endpoint first
async function testHealth() {
  try {
    console.log('🏥 Testing health endpoint...');
    const response = await fetch('http://localhost:3001/api/health');
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Server is healthy');
      console.log('Health response:', JSON.stringify(result, null, 2));
      return true;
    } else {
      console.log('❌ Health check failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Health check error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting server tests...\n');
  
  const isHealthy = await testHealth();
  console.log('');
  
  if (isHealthy) {
    await testUpload();
  } else {
    console.log('Server not healthy, skipping upload test');
  }
}

main().catch(console.error);