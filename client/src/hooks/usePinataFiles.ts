'use client'

import { useState, useEffect, useCallback } from 'react'
import { pinataService } from '@/lib/pinata'

export interface PinataFile {
  id: string
  ipfs_pin_hash: string
  size: number
  user_id: string
  date_pinned: string
  date_unpinned?: string
  metadata: {
    name?: string
    keyvalues?: Record<string, string>
  }
  regions: Array<{
    regionId: string
    currentReplicationCount: number
    desiredReplicationCount: number
  }>
  mime_type?: string
  number_of_files: number
  gatewayUrl: string
  pinataUrl: string
}

export interface UsePinataFilesReturn {
  files: PinataFile[]
  isLoading: boolean
  error: string | null
  totalCount: number
  loadFiles: (options?: {
    status?: 'pinned' | 'unpinned'
    pageLimit?: number
    pageOffset?: number
    metadata?: Record<string, string>
  }) => Promise<void>
  loadFilesByCategory: (category: 'screenshot' | 'audio' | 'video' | 'chat' | 'document') => Promise<void>
  refreshFiles: () => Promise<void>
  deleteFile: (ipfsHash: string) => Promise<boolean>
  clearError: () => void
}

export function usePinataFiles(): UsePinataFilesReturn {
  const [files, setFiles] = useState<PinataFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [lastLoadOptions, setLastLoadOptions] = useState<any>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const loadFiles = useCallback(async (options?: {
    status?: 'pinned' | 'unpinned'
    pageLimit?: number
    pageOffset?: number
    metadata?: Record<string, string>
  }) => {
    setIsLoading(true)
    setError(null)
    setLastLoadOptions(options)

    try {
      const result = await pinataService.listFiles(options)
      setFiles(result.files)
      setTotalCount(result.count)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files'
      setError(errorMessage)
      setFiles([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadFilesByCategory = useCallback(async (category: 'screenshot' | 'audio' | 'video' | 'chat' | 'document') => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await pinataService.getFilesByCategory(category)
      setFiles(result.files)
      setTotalCount(result.count)
      setLastLoadOptions({ metadata: { category }, status: 'pinned' })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load files by category'
      setError(errorMessage)
      setFiles([])
      setTotalCount(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshFiles = useCallback(async () => {
    if (lastLoadOptions) {
      await loadFiles(lastLoadOptions)
    } else {
      await loadFiles()
    }
  }, [loadFiles, lastLoadOptions])

  const deleteFile = useCallback(async (ipfsHash: string): Promise<boolean> => {
    try {
      const success = await pinataService.deleteFile(ipfsHash)
      if (success) {
        // Remove the file from local state
        setFiles(prev => prev.filter(file => file.ipfs_pin_hash !== ipfsHash))
        setTotalCount(prev => Math.max(0, prev - 1))
      }
      return success
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete file'
      setError(errorMessage)
      return false
    }
  }, [])

  // Load files on mount
  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  return {
    files,
    isLoading,
    error,
    totalCount,
    loadFiles,
    loadFilesByCategory,
    refreshFiles,
    deleteFile,
    clearError
  }
}