// API client for server communication
export interface AuthResponse {
  token: string;
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

class ServerAPI {
  private baseUrl: string;
  private token: string | null = null;
  private readonly TOKEN_KEY = 'eth_del_auth_token';

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3002';
    // Initialize token from localStorage on startup
    this.initializeToken();
  }

  private initializeToken() {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      if (storedToken) {
        console.log('🔄 Initializing token from localStorage');
        this.token = storedToken;
      }
    }
  }

  setToken(token: string) {
    console.log('🔑 Setting authentication token:', !!token);
    this.token = token;
    // Persist token to localStorage for persistence across refreshes
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    // If token is not in memory, try to get it from localStorage
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem(this.TOKEN_KEY);
    }
    console.log('🔍 Getting token, exists:', !!this.token, 'length:', this.token?.length);
    return this.token;
  }

  clearToken() {
    console.log('🧹 Clearing authentication token');
    this.token = null;
    // Clear from localStorage as well
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const hasToken = !!this.token;
    console.log('🔒 Authentication check - has token:', hasToken);
    return hasToken;
  }

  private async fetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };
    
    if (token && !headers.Authorization) {
      headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Adding Authorization header with token to request:', endpoint);
    } else if (!token) {
      console.warn('⚠️ No token available for authenticated request to:', endpoint);
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle auth errors
    if (response.status === 401 || response.status === 403) {
      this.clearToken();
      // Don't redirect - let the component handle the authentication state
    }
    
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
    this.setToken(result.token);
    return result;
  }

  async getProfile(): Promise<AuthResponse['user']> {
    const response = await this.fetch('/api/auth/profile');
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get profile');
    }
    return response.json();
  }

  async verifyToken(): Promise<{ valid: boolean; user: AuthResponse['user'] }> {
    const response = await this.fetch('/api/auth/verify-token');
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
  async uploadFile(file: File, metadata: Record<string, any> = {}): Promise<FileUploadResponse> {
    // Check if we have a token before making the request
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required. Please connect your wallet first.');
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    // Use direct fetch for FormData uploads
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let browser set it with boundary
    
    console.log('📤 Making uploadFile request with token:', !!token);
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

  async getFiles(options: {
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
    // Check if we have a token before making the request
    const token = this.getToken();
    if (!token) {
      throw new Error('Authentication required. Please connect your wallet first.');
    }
    
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    console.log('🔍 Making getFiles request with token:', !!token);
    const response = await this.fetch(`/api/upload/files?${params}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to get files');
    }
    return response.json();
  }

  async retryMigration(fileId: string): Promise<{ message: string; fileId: string; status: string }> {
    const response = await this.fetch(`/api/upload/retry/${fileId}`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Retry failed');
    }
    
    return response.json();
  }

  async deleteFile(fileId: string): Promise<{ message: string; fileId: string; status: string }> {
    const response = await this.fetch(`/api/upload/${fileId}`, {
      method: 'DELETE',
    });
    
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

// Export singleton instance
export const serverAPI = new ServerAPI();