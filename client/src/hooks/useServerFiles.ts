import { useState, useCallback } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { serverAPI, FileUploadResponse, FileRecord } from '../lib/serverAPI';

export interface UploadProgress {
  progress: number;
  stage: 'preparing' | 'uploading' | 'processing' | 'complete' | 'error';
  message?: string;
}

export const useServerFileUpload = () => {
  const { primaryWallet } = useDynamicContext();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    metadata: Record<string, any> = {},
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileUploadResponse | null> => {
    try {
      if (!primaryWallet?.address) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      setIsUploading(true);
      setError(null);
      
      // Preparing stage
      const preparingProgress: UploadProgress = {
        progress: 0,
        stage: 'preparing',
        message: 'Preparing file for upload...'
      };
      setUploadProgress(preparingProgress);
      onProgress?.(preparingProgress);

      // Uploading stage
      const uploadingProgress: UploadProgress = {
        progress: 25,
        stage: 'uploading',
        message: `Uploading ${file.name}...`
      };
      setUploadProgress(uploadingProgress);
      onProgress?.(uploadingProgress);

      // Upload to server with wallet address
      const result = await serverAPI.uploadFile(file, primaryWallet.address, metadata);

      // Processing stage
      const processingProgress: UploadProgress = {
        progress: 75,
        stage: 'processing',
        message: 'Processing and migrating to Filecoin...'
      };
      setUploadProgress(processingProgress);
      onProgress?.(processingProgress);

      // Complete
      const completeProgress: UploadProgress = {
        progress: 100,
        stage: 'complete',
        message: result.isDuplicate ? 'File already exists' : 'Upload completed successfully'
      };
      setUploadProgress(completeProgress);
      onProgress?.(completeProgress);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      
      const errorProgress: UploadProgress = {
        progress: 0,
        stage: 'error',
        message: errorMessage
      };
      setUploadProgress(errorProgress);
      onProgress?.(errorProgress);
      
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [primaryWallet?.address]);

  const retryMigration = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      setError(null);
      await serverAPI.retryMigration(fileId, primaryWallet?.address);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Retry failed';
      setError(errorMessage);
      return false;
    }
  }, [primaryWallet?.address]);

  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    try {
      setError(null);
      await serverAPI.deleteFile(fileId, primaryWallet?.address);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      setError(errorMessage);
      return false;
    }
  }, [primaryWallet?.address]);

  return {
    uploadFile,
    retryMigration,
    deleteFile,
    isUploading,
    uploadProgress,
    error,
    clearError: () => setError(null),
  };
};

export const useServerFiles = () => {
  const { primaryWallet } = useDynamicContext();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);

  const loadFiles = useCallback(async (options: {
    page?: number;
    limit?: number;
    status?: string;
    reportId?: string;
    caseId?: string;
  } = {}) => {
    try {
      if (!primaryWallet?.address) {
        throw new Error('Wallet not connected. Please connect your wallet first.');
      }

      setIsLoading(true);
      setError(null);
      
      const result = await serverAPI.getFiles(primaryWallet.address, options);
      setFiles(result.files);
      setPagination(result.pagination);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load files';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [primaryWallet?.address]);

  const refreshFiles = useCallback(() => {
    return loadFiles();
  }, [loadFiles]);

  return {
    files,
    pagination,
    isLoading,
    error,
    loadFiles,
    refreshFiles,
    clearError: () => setError(null),
  };
};

export const useFileStatus = (fileId?: string) => {
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = useCallback(async (id?: string) => {
    const targetId = id || fileId;
    if (!targetId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await serverAPI.getFileStatus(targetId);
      setStatus(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fileId]);

  const refreshStatus = useCallback(() => {
    return loadStatus();
  }, [loadStatus]);

  return {
    status,
    isLoading,
    error,
    loadStatus,
    refreshStatus,
    clearError: () => setError(null),
  };
};

export const useFileSummary = () => {
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await serverAPI.getSummary();
      setSummary(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load summary';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    summary,
    isLoading,
    error,
    loadSummary,
    clearError: () => setError(null),
  };
};