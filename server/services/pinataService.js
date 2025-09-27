import { PinataSDK } from 'pinata';
import crypto from 'crypto';

class PinataService {
  constructor() {
    this.pinata = null;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Validate environment variables
      const apiKey = process.env.PINATA_API_KEY;
      const secretKey = process.env.PINATA_SECRET_KEY;
      const jwt = process.env.PINATA_JWT;

      if (!apiKey || !secretKey || !jwt) {
        throw new Error('Missing Pinata credentials. Please set PINATA_API_KEY, PINATA_SECRET_KEY, and PINATA_JWT in environment variables.');
      }

      // Initialize Pinata SDK
      this.pinata = new PinataSDK({
        pinataJwt: jwt,
        pinataGateway: process.env.PINATA_GATEWAY || 'gateway.pinata.cloud'
      });

      // Test the connection
      await this.testConnection();
      
      this.initialized = true;
      console.log('✅ Pinata service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Pinata service:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      // Test with a simple API call
      const testData = await this.pinata.testAuthentication();
      console.log('Pinata authentication test passed:', testData.authenticated);
      return testData.authenticated;
    } catch (error) {
      throw new Error(`Pinata connection test failed: ${error.message}`);
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
      
      // Prepare metadata
      const pinataMetadata = {
        name: originalName,
        keyvalues: {
          fileHash,
          uploadedAt: new Date().toISOString(),
          ...metadata
        }
      };

      // Upload to Pinata
      const uploadResult = await this.pinata.upload
        .buffer(fileBuffer)
        .addMetadata(pinataMetadata);

      return {
        pinataCid: uploadResult.IpfsHash,
        pinSize: uploadResult.PinSize,
        timestamp: uploadResult.Timestamp,
        fileHash,
        isDuplicate: uploadResult.isDuplicate || false
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

      const uploadResult = await this.pinata.upload
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
      const response = await fetch(`https://${process.env.PINATA_GATEWAY}/ipfs/${pinataCid}`);
      
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
      const files = await this.pinata.listFiles()
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
      await this.pinata.unpin([pinataCid]);
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
      let query = this.pinata.listFiles();
      
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
      const usage = await this.pinata.usage();
      return usage;
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      throw new Error(`Failed to get usage stats from Pinata: ${error.message}`);
    }
  }
}

// Export singleton instance
export default new PinataService();