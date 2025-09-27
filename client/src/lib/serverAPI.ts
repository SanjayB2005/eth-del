// API client for server communication
export interface AuthResponse {
  user: {
    id: string;
    walletAddress: string;
    role: 'victim' | 'police' | 'admin';
    isVerified: boolean;
    createdAt: string;
    lastLogin?: string;
  };
}

export interface NonceResponse {
  walletAddress: string;
  nonce: string;
  message: string;
}

export interface FileUploadResponse {
  message: string;
  fileRecord: {
    id: string;
    pinataCid: string;
    pieceCid?: string;
    pinataStatus: string;
    filecoinStatus: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    createdAt: string;
    metadata?: Record<string, any>;
  };
  isDuplicate?: boolean;
}

export interface FileRecord {
  id: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  fileHash: string;
  pinataCid: string;
  pieceCid?: string;
  pinataStatus: 'uploading' | 'pinned' | 'failed' | 'unpinned';
  filecoinStatus: 'queued' | 'uploading' | 'completed' | 'failed';
  pinataTimestamp: string;
  filecoinTimestamp?: string;
  dealId?: string;
  migrationAttempts: number;
  lastMigrationAttempt?: string;
  migrationError?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface FileStatusResponse {
  fileRecord: FileRecord;
  pinataMetadata?: any;
  filecoinDealStatus?: any;
  summary: {
    isAvailable: boolean;
    isPinned: boolean;
    isOnFilecoin: boolean;
    isMigrating: boolean;
    hasFailed: boolean;
  };
}

// ServerAPI class integrated with Dynamic SDK for wallet-based authentication
// No tokens are stored - authentication is handled by passing wallet addresses
// Usage: Import useDynamicContext and pass primaryWallet.address to methods
class ServerAPI {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
  }

  // Helper method to create authenticated headers with wallet address
  private createAuthHeaders(walletAddress?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (walletAddress) {
      // Use wallet address for authentication instead of token
      headers['X-Wallet-Address'] = walletAddress;
    }
    
    return headers;
  }

  private async fetch(endpoint: string, options: RequestInit = {}, walletAddress?: string): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      ...this.createAuthHeaders(walletAddress),
      ...options.headers as Record<string, string>,
    };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    return response;
  }

  // Authentication methods
  async getNonce(walletAddress: string): Promise<NonceResponse> {
    const response = await this.fetch(`/api/auth/nonce/${walletAddress}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get nonce');
    }
    return response.json();
  }

  async verifySignature(walletAddress: string, signature: string, nonce: string): Promise<AuthResponse> {
    const response = await this.fetch('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ walletAddress, signature, nonce }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signature verification failed');
    }
    
    const result = await response.json();
    return result;
  }

  async getProfile(walletAddress: string): Promise<AuthResponse['user']> {
    const response = await this.fetch('/api/auth/profile', {}, walletAddress);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }
    return response.json();
  }

  async verifyToken(walletAddress: string): Promise<{ valid: boolean; user: AuthResponse['user'] }> {
    const response = await this.fetch('/api/auth/verify-token', {}, walletAddress);
    if (!response.ok) {
      return { valid: false, user: null as any };
    }
    return response.json();
  }

  // Simple wallet connectivity check without token requirement
  async checkWalletConnectivity(walletAddress: string): Promise<{ 
    connected: boolean; 
    user?: AuthResponse['user'];
    needsAuthentication?: boolean;
    message?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/api/wallet/check/${walletAddress}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      return { connected: false, needsAuthentication: true };
    }
    
    const result = await response.json();
    return result;
  }

  // File upload methods
  async uploadFile(file: File, walletAddress: string, metadata: Record<string, any> = {}): Promise<FileUploadResponse> {
    if (!walletAddress) {
      throw new Error('Authentication required. Please connect your wallet first.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    // Use direct fetch for FormData uploads with wallet address authentication
    const headers: Record<string, string> = {
      'X-Wallet-Address': walletAddress,
    };
    // Don't set Content-Type for FormData - let browser set it with boundary
    
    console.log('📤 Making uploadFile request with Dynamic SDK authentication');
    const response = await fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
    
    return response.json();
  }

  async getFiles(walletAddress: string, options: {
    page?: number;
    limit?: number;
    status?: string;
    reportId?: string;
    caseId?: string;
  } = {}): Promise<{
    files: FileRecord[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    console.log('🔍 Making getFiles request with Dynamic SDK authentication');
    const response = await this.fetch(`/api/upload/files?${params}`, {}, walletAddress);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get files');
    }
    return response.json();
  }

  async retryMigration(fileId: string, walletAddress?: string): Promise<{ message: string; fileId: string; status: string }> {
    const response = await this.fetch(`/api/upload/retry/${fileId}`, {
      method: 'POST',
    }, walletAddress);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Retry failed');
    }
    
    return response.json();
  }

  async deleteFile(fileId: string, walletAddress?: string): Promise<{ message: string; fileId: string; status: string }> {
    const response = await this.fetch(`/api/upload/${fileId}`, {
      method: 'DELETE',
    }, walletAddress);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Delete failed');
    }
    
    return response.json();
  }

  // Status methods
  async getFileStatus(fileId: string): Promise<FileStatusResponse> {
    const response = await this.fetch(`/api/status/${fileId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get file status');
    }
    return response.json();
  }

  async getFileStatusByPinataCid(pinataCid: string): Promise<FileStatusResponse> {
    const response = await this.fetch(`/api/status/pinata/${pinataCid}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get file status');
    }
    return response.json();
  }

  async getSummary(): Promise<{
    statistics: {
      totalFiles: number;
      totalSize: number;
      totalSizeMB: string;
      pinnedFiles: number;
      filecoinFiles: number;
      uploadingToFilecoin: number;
      failedMigrations: number;
      queuedForMigration: number;
      migrationRate: string;
    };
    recentFiles: FileRecord[];
  }> {
    const response = await this.fetch('/api/status/summary');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get summary');
    }
    return response.json();
  }

  async setupPayments(): Promise<{ message: string; transactions: any }> {
    const response = await this.fetch('/api/status/setup-payments', {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Payment setup failed');
    }
    
    return response.json();
  }

  // Health check
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    services: {
      pinata: boolean;
      filecoin: boolean;
    };
  }> {
    const response = await this.fetch('/api/health');
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  }
}

// Helper function to create an authenticated ServerAPI instance with Dynamic SDK
// Usage: const api = createAuthenticatedAPI(primaryWallet?.address);
export const createAuthenticatedAPI = (walletAddress?: string) => {
  return {
    ...serverAPI,
    // Wrap methods that require authentication with wallet address
    uploadFile: (file: File, metadata: Record<string, any> = {}) => 
      serverAPI.uploadFile(file, walletAddress!, metadata),
    getFiles: (options?: Parameters<typeof serverAPI.getFiles>[1]) => 
      serverAPI.getFiles(walletAddress!, options),
    getProfile: () => serverAPI.getProfile(walletAddress!),
    verifyToken: () => serverAPI.verifyToken(walletAddress!),
    retryMigration: (fileId: string) => serverAPI.retryMigration(fileId, walletAddress),
    deleteFile: (fileId: string) => serverAPI.deleteFile(fileId, walletAddress),
    // Keep non-authenticated methods as-is
    getNonce: serverAPI.getNonce.bind(serverAPI),
    verifySignature: serverAPI.verifySignature.bind(serverAPI),
    checkWalletConnectivity: serverAPI.checkWalletConnectivity.bind(serverAPI),
    getFileStatus: serverAPI.getFileStatus.bind(serverAPI),
    getFileStatusByPinataCid: serverAPI.getFileStatusByPinataCid.bind(serverAPI),
    getSummary: serverAPI.getSummary.bind(serverAPI),
    setupPayments: serverAPI.setupPayments.bind(serverAPI),
    getHealth: serverAPI.getHealth.bind(serverAPI),
  };
};

// Export singleton instance
export const serverAPI = new ServerAPI();