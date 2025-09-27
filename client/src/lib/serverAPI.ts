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

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    
    return null;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
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
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle auth errors
    if (response.status === 401 || response.status === 403) {
      this.clearToken();
      // Optionally redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
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

  // File upload methods
  async uploadFile(file: File, metadata: Record<string, any> = {}): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));
    
    const token = this.getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
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
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
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