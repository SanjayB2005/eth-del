import dotenv from 'dotenv';
import pinataService from './services/pinataService.js';

// Load environment variables
dotenv.config();

async function testPinataUpload() {
  try {
    console.log('Initializing Pinata service...');
    await pinataService.initialize();
    console.log('✅ Pinata service initialized');

    // Create a test file buffer
    const testContent = 'This is a test file for Pinata upload verification';
    const testBuffer = Buffer.from(testContent, 'utf8');
    const testFilename = 'test-upload.txt';

    console.log('Attempting to upload test file...');
    const result = await pinataService.uploadFile(testBuffer, testFilename, {
      description: 'Test upload to verify Pinata integration'
    });

    console.log('✅ Upload successful!');
    console.log('Result:', result);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

testPinataUpload();