import { PinataSDK } from 'pinata';
import crypto from 'crypto';
import { Readable } from 'stream';

class PinataService {
  constructor() {
    this.uploadPinata = null;
    this.downloadPinata = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Check for dual key configuration first
      const uploadJwt = process.env.PINATA_UPLOAD_JWT;
      const downloadJwt = process.env.PINATA_DOWNLOAD_JWT;
      
      if (uploadJwt && downloadJwt) {
        // Use dual key configuration
        console.log('🔑 Using dual-key Pinata configuration');
        
        // Initialize upload client (V3 Write permissions)
        this.uploadPinata = new PinataSDK({
          pinataJwt: uploadJwt,
          pinataGateway: process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'
        });

        // Initialize download client (V3 Read permissions)
        this.downloadPinata = new PinataSDK({
          pinataJwt: downloadJwt,
          pinataGateway: process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'
        });

        // Test both connections with fallback
        try {
          await this.testUploadConnection();
          await this.testDownloadConnection();
        } catch (testError) {
          console.warn('⚠️  Pinata authentication test failed, but continuing with initialization:', testError.message);
          console.warn('⚠️  Service will attempt to work but may have limited functionality');
        }
        
      } else if (uploadJwt) {
        // Use single JWT configuration (upload JWT only)
        console.log('🔑 Using single JWT Pinata configuration');
        
        this.uploadPinata = new PinataSDK({
          pinataJwt: uploadJwt,
          pinataGateway: process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'
        });
        this.downloadPinata = this.uploadPinata; // Same client for both

        // Test the connection with fallback
        try {
          await this.testUploadConnection();
        } catch (testError) {
          console.warn('⚠️  Pinata authentication test failed, but continuing with initialization:', testError.message);
          console.warn('⚠️  Service will attempt to work but may have limited functionality');
        }
        
      } else {
        // Fallback to legacy single key configuration
        console.log('🔑 Using legacy single-key Pinata configuration');
        const jwt = process.env.PINATA_JWT;

        if (!jwt) {
          throw new Error('Missing Pinata credentials. Please set either PINATA_UPLOAD_JWT or PINATA_JWT in your environment variables.');
        }

        // Initialize single client for both operations
        this.uploadPinata = new PinataSDK({
          pinataJwt: jwt,
          pinataGateway: process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'
        });
        this.downloadPinata = this.uploadPinata; // Same client for both

        // Test the connection with fallback
        try {
          await this.testUploadConnection();
        } catch (testError) {
          console.warn('⚠️  Pinata authentication test failed, but continuing with initialization:', testError.message);
          console.warn('⚠️  Service will attempt to work but may have limited functionality');
        }
      }
      
      this.initialized = true;
      console.log('✅ Pinata service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Pinata service:', error.message);
      throw error;
    }
  }

  async testUploadConnection() {
    try {
      // Test with direct API call instead of SDK method
      const uploadJwt = process.env.PINATA_UPLOAD_JWT;
      if (!uploadJwt) {
        throw new Error('PINATA_UPLOAD_JWT not found in environment variables');
      }

      console.log('🔍 Testing Pinata upload authentication...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${uploadJwt}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Upload auth test failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
      }

      const testData = await response.json();
      console.log('✅ Pinata upload authentication test passed:', testData.message || testData);
      return true;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ Upload authentication test timed out');
        throw new Error('Pinata upload connection test timed out');
      }
      console.error('❌ Upload authentication test error:', error);
      throw new Error(`Pinata upload connection test failed: ${error.message}`);
    }
  }

  async testDownloadConnection() {
    try {
      if (this.downloadPinata !== this.uploadPinata) {
        // Test with direct API call instead of SDK method
        const downloadJwt = process.env.PINATA_DOWNLOAD_JWT;
        if (!downloadJwt) {
          throw new Error('PINATA_DOWNLOAD_JWT not found in environment variables');
        }

        const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${downloadJwt}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Authentication failed: ${response.status} - ${errorText}`);
        }

        const testData = await response.json();
        console.log('Pinata download authentication test passed:', testData.message);
        return true;
      }
      return true; // Same client, already tested
    } catch (error) {
      console.error('Download authentication test error:', error);
      throw new Error(`Pinata download connection test failed: ${error.message}`);
    }
  }

  isInitialized() {
    return this.initialized;
  }

  /**
   * Upload file buffer to Pinata
   */
  async uploadFile(fileBuffer, originalName, metadata = {}) {
    if (!this.initialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      // Generate file hash for verification
      const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      
      // Sanitize metadata - Pinata only accepts strings or numbers
      const sanitizedMetadata = {};
      Object.entries(metadata).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Convert to string if it's not already a string or number
          if (typeof value === 'object' || typeof value === 'boolean') {
            sanitizedMetadata[key] = JSON.stringify(value);
          } else if (typeof value === 'number' || typeof value === 'string') {
            sanitizedMetadata[key] = value;
          } else {
            sanitizedMetadata[key] = String(value);
          }
        }
      });
      
      // Prepare metadata
      const pinataMetadata = {
        name: originalName,
        keyvalues: {
          fileHash,
          uploadedAt: new Date().toISOString(),
          ...sanitizedMetadata
        }
      };

            // Upload to Pinata using upload client (V3 Write permissions)
      // Use direct API call with upload JWT (V3 Write permissions)
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), originalName);
      formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
      
      const uploadJwt = process.env.PINATA_UPLOAD_JWT;
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${uploadJwt}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const uploadResult = await response.json();

      return {
        pinataCid: uploadResult.IpfsHash,
        pinSize: uploadResult.PinSize,
        timestamp: uploadResult.Timestamp || new Date().toISOString(),
        fileHash,
        isDuplicate: uploadResult.is_duplicate || false
      };
    } catch (error) {
      console.error('Pinata upload failed:', error);
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  /**
   * Upload JSON data to Pinata
   */
  async uploadJSON(jsonData, name, metadata = {}) {
    if (!this.initialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      const pinataMetadata = {
        name,
        keyvalues: {
          dataType: 'json',
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      };

      const uploadResult = await this.uploadPinata.upload
        .json(jsonData)
        .addMetadata(pinataMetadata);

      return {
        pinataCid: uploadResult.IpfsHash,
        pinSize: uploadResult.PinSize,
        timestamp: uploadResult.Timestamp,
        isDuplicate: uploadResult.isDuplicate || false
      };
    } catch (error) {
      console.error('Pinata JSON upload failed:', error);
      throw new Error(`Failed to upload JSON to Pinata: ${error.message}`);
    }
  }

  /**
   * Download file from Pinata
   */
  async downloadFile(pinataCid) {
    if (!this.initialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      // Try public IPFS gateway first (no auth needed)
      let response = await fetch(`https://gateway.pinata.cloud/ipfs/${pinataCid}`);
      
      if (!response.ok) {
        // Fallback to other public gateways
        console.log(`Primary gateway failed (${response.status}), trying fallback...`);
        response = await fetch(`https://ipfs.io/ipfs/${pinataCid}`);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Pinata download failed:', error);
      throw new Error(`Failed to download from Pinata: ${error.message}`);
    }
  }

  /**
   * Get file metadata from Pinata
   */
  async getFileMetadata(pinataCid) {
    if (!this.initialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      const files = await this.downloadPinata.listFiles()
        .cid(pinataCid)
        .limit(1);
      
      if (files.files.length === 0) {
        throw new Error('File not found');
      }

      return files.files[0];
    } catch (error) {
      console.error('Failed to get file metadata:', error);
      throw new Error(`Failed to get metadata from Pinata: ${error.message}`);
    }
  }

  /**
   * Unpin file from Pinata
   */
  async unpinFile(pinataCid) {
    if (!this.initialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      await this.uploadPinata.unpin([pinataCid]);
      console.log(`Successfully unpinned file: ${pinataCid}`);
      return true;
    } catch (error) {
      console.error('Failed to unpin file:', error);
      throw new Error(`Failed to unpin from Pinata: ${error.message}`);
    }
  }

  /**
   * List all pinned files
   */
  async listFiles(options = {}) {
    if (!this.initialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      let query = this.downloadPinata.listFiles();
      
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      if (options.offset) {
        query = query.offset(options.offset);
      }

      if (options.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          query = query.metadata(key, value);
        });
      }

      const result = await query;
      return result.files;
    } catch (error) {
      console.error('Failed to list files:', error);
      throw new Error(`Failed to list files from Pinata: ${error.message}`);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats() {
    if (!this.initialized) {
      throw new Error('Pinata service not initialized');
    }

    try {
      const usage = await this.downloadPinata.usage();
      return usage;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      throw new Error(`Failed to get usage stats from Pinata: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new PinataService();