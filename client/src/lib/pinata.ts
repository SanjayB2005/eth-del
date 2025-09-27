export interface UploadResult {
  IpfsHash: string
  PinSize: number
  Timestamp: string
  isDuplicate?: boolean
}

export interface UploadProgress {
  progress: number
  stage: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error'
  message?: string
}

export class PinataService {
  private static instance: PinataService
  private readonly apiKey: string
  private readonly secretKey: string
  private readonly jwt: string
  private readonly gateway: string
  
  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || ''
    this.secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || ''
    this.jwt = process.env.NEXT_PUBLIC_PINATA_JWT || ''
    this.gateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'
    
    console.log('Pinata Service initialized:')
    console.log('API Key:', this.apiKey ? 'Present' : 'Missing')
    console.log('Secret Key:', this.secretKey ? 'Present' : 'Missing')
    console.log('JWT:', this.jwt ? `Present (${this.jwt.length} chars)` : 'Missing')
    console.log('Gateway:', this.gateway)
    
    if (!this.apiKey || !this.secretKey) {
      console.warn('Pinata API credentials not found. Please set NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY in environment variables.')
    }
  }
  
  public static getInstance(): PinataService {
    if (!PinataService.instance) {
      PinataService.instance = new PinataService()
    }
    return PinataService.instance
  }
  
  /**
   * Upload a file to IPFS via Pinata
   */
  async uploadFile(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Validate file
      this.validateFile(file)
      
      onProgress?.({
        progress: 0,
        stage: 'preparing',
        message: 'Preparing file for upload...'
      })
      
      // Generate metadata for the file
      const metadata = this.generateMetadata(file)
      
      onProgress?.({
        progress: 20,
        stage: 'uploading',
        message: 'Uploading to IPFS...'
      })
      
      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      
      // Add metadata
      const pinataMetadata = JSON.stringify({
        name: metadata.name,
        keyvalues: {
          originalName: file.name,
          fileType: file.type,
          fileSize: file.size.toString(),
          uploadDate: new Date().toISOString(),
          category: this.getFileCategory(file),
          ...metadata.keyValues
        }
      })
      formData.append('pinataMetadata', pinataMetadata)
      
      // Pin options
      const pinataOptions = JSON.stringify({
        cidVersion: 0
      })
      formData.append('pinataOptions', pinataOptions)
      
      // Make request to Pinata API with API key authentication (preferred method)
      const headers: Record<string, string> = {}
      
      if (this.apiKey && this.secretKey) {
        headers['pinata_api_key'] = this.apiKey
        headers['pinata_secret_api_key'] = this.secretKey
        console.log('Using API key authentication')
      } else if (this.jwt) {
        headers['Authorization'] = `Bearer ${this.jwt}`
        console.log('Using JWT authentication')
      } else {
        throw new Error('No valid Pinata credentials found')
      }
      
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers,
        body: formData
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Pinata API error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        })
        throw new Error(`Pinata API error: ${response.status} ${response.statusText} - ${errorText}`)
      }
      
      onProgress?.({
        progress: 80,
        stage: 'processing',
        message: 'Processing upload...'
      })
      
      const data = await response.json()
      
      const result: UploadResult = {
        IpfsHash: data.IpfsHash,
        PinSize: data.PinSize,
        Timestamp: data.Timestamp,
        isDuplicate: data.isDuplicate || false
      }
      
      onProgress?.({
        progress: 100,
        stage: 'complete',
        message: 'Upload complete!'
      })
      
      return result
      
    } catch (error) {
      onProgress?.({
        progress: 0,
        stage: 'error',
        message: error instanceof Error ? error.message : 'Upload failed'
      })
      throw error
    }
  }
  
  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(
    data: any,
    filename: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      onProgress?.({
        progress: 0,
        stage: 'preparing',
        message: 'Preparing JSON data...'
      })
      
      onProgress?.({
        progress: 20,
        stage: 'uploading',
        message: 'Uploading JSON to IPFS...'
      })
      
      // Convert JSON to blob and then to file
      const jsonBlob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const jsonFile = new File([jsonBlob], filename, { type: 'application/json' })
      
      // Use the same upload method for consistency
      const result = await this.uploadFile(jsonFile, onProgress)
      
      return result
      
    } catch (error) {
      onProgress?.({
        progress: 0,
        stage: 'error',
        message: error instanceof Error ? error.message : 'JSON upload failed'
      })
      throw error
    }
  }
  
  /**
   * Get file from IPFS via Pinata gateway
   */
  async getFile(ipfsHash: string): Promise<Response> {
    try {
      const gatewayUrl = `https://${this.gateway}/ipfs/${ipfsHash}`
      const response = await fetch(gatewayUrl)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`)
      }
      
      return response
    } catch (error) {
      console.error('Error fetching file from IPFS:', error)
      throw error
    }
  }
  
  /**
   * Get file info from Pinata
   */
  async getFileInfo(ipfsHash: string) {
    try {
      const response = await fetch(`https://api.pinata.cloud/data/pinList?hashContains=${ipfsHash}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.jwt}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Failed to get file info: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.rows[0] || null
    } catch (error) {
      console.error('Error getting file info:', error)
      return null
    }
  }

  /**
   * List all pinned files from Pinata
   */
  async listFiles(options?: {
    status?: 'pinned' | 'unpinned'
    pageLimit?: number
    pageOffset?: number
    metadata?: Record<string, string>
  }) {
    try {
      const params = new URLSearchParams()
      
      if (options?.status) {
        params.append('status', options.status)
      }
      if (options?.pageLimit) {
        params.append('pageLimit', options.pageLimit.toString())
      }
      if (options?.pageOffset) {
        params.append('pageOffset', options.pageOffset.toString())
      }
      if (options?.metadata) {
        Object.entries(options.metadata).forEach(([key, value]) => {
          params.append(`metadata[keyvalues][${key}]`, value)
        })
      }

      const url = `https://api.pinata.cloud/data/pinList${params.toString() ? `?${params.toString()}` : ''}`
      
      const headers: Record<string, string> = {}
      
      if (this.apiKey && this.secretKey) {
        headers['pinata_api_key'] = this.apiKey
        headers['pinata_secret_api_key'] = this.secretKey
      } else if (this.jwt) {
        headers['Authorization'] = `Bearer ${this.jwt}`
      } else {
        throw new Error('No valid Pinata credentials found')
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      })
      
      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Transform the response to include gateway URLs
      const filesWithUrls = data.rows.map((file: any) => ({
        ...file,
        gatewayUrl: `https://${this.gateway}/ipfs/${file.ipfs_pin_hash}`,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${file.ipfs_pin_hash}`
      }))
      
      return {
        files: filesWithUrls,
        count: data.count
      }
    } catch (error) {
      console.error('Error listing files:', error)
      throw error
    }
  }

  /**
   * Get files by metadata category (evidence type)
   */
  async getFilesByCategory(category: 'screenshot' | 'audio' | 'video' | 'chat' | 'document') {
    try {
      return await this.listFiles({
        metadata: { category },
        status: 'pinned'
      })
    } catch (error) {
      console.error('Error getting files by category:', error)
      throw error
    }
  }
  
  /**
   * Delete/unpin file from Pinata
   */
  async deleteFile(ipfsHash: string): Promise<boolean> {
    try {
      const headers: Record<string, string> = {}
      
      if (this.apiKey && this.secretKey) {
        headers['pinata_api_key'] = this.apiKey
        headers['pinata_secret_api_key'] = this.secretKey
      } else if (this.jwt) {
        headers['Authorization'] = `Bearer ${this.jwt}`
      } else {
        throw new Error('No valid Pinata credentials found')
      }
      
      const response = await fetch(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
        method: 'DELETE',
        headers
      })
      
      return response.ok
    } catch (error) {
      console.error('Error deleting file:', error)
      return false
    }
  }
  
  // Private helper methods
  private validateFile(file: File): void {
    const maxSize = 100 * 1024 * 1024 // 100MB limit
    const allowedTypes = [
      // Images (screenshots)
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      // Audio
      'audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg',
      // Documents (chats)
      'application/pdf', 'text/plain', 'text/csv',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // JSON (chat exports)
      'application/json'
    ]
    
    if (file.size > maxSize) {
      throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds the 100MB limit`)
    }
    
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not supported`)
    }
  }
  
  private generateMetadata(file: File) {
    const category = this.getFileCategory(file)
    const timestamp = new Date().toISOString()
    
    return {
      name: `evidence_${category}_${Date.now()}_${file.name}`,
      keyValues: {
        evidenceType: category,
        originalMimeType: file.type,
        uploadTimestamp: timestamp,
        fileExtension: file.name.split('.').pop() || 'unknown'
      }
    }
  }
  
  private getFileCategory(file: File): 'screenshot' | 'audio' | 'document' | 'chat' {
    const mimeType = file.type.toLowerCase()
    
    if (mimeType.startsWith('image/')) {
      return 'screenshot'
    } else if (mimeType.startsWith('audio/')) {
      return 'audio'
    } else if (mimeType === 'application/json' || file.name.toLowerCase().includes('chat')) {
      return 'chat'
    } else {
      return 'document'
    }
  }
}

// Export singleton instance
export const pinataService = PinataService.getInstance()