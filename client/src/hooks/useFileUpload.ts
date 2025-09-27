'use client'

import { useState, useCallback } from 'react'
import { pinataService, UploadResult, UploadProgress } from '@/lib/pinata'

export interface UploadedEvidence {
  id: string
  name: string
  type: 'screenshot' | 'audio' | 'video' | 'chat' | 'document'
  size: string
  uploadDate: string
  ipfsHash: string
  description?: string
  pinSize?: number
}

export interface UseFileUploadReturn {
  uploadFile: (file: File, description?: string) => Promise<UploadedEvidence>
  uploadMultipleFiles: (files: FileList, descriptions?: string[]) => Promise<UploadedEvidence[]>
  uploadJSON: (data: any, filename: string, description?: string) => Promise<UploadedEvidence>
  isUploading: boolean
  progress: UploadProgress | null
  error: string | null
  clearError: () => void
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const uploadFile = useCallback(async (
    file: File,
    description?: string
  ): Promise<UploadedEvidence> => {
    setIsUploading(true)
    setError(null)
    setProgress(null)

    try {
      const result = await pinataService.uploadFile(file, (progressInfo) => {
        setProgress(progressInfo)
      })

      const evidence: UploadedEvidence = {
        id: Date.now().toString(),
        name: file.name,
        type: getFileType(file),
        size: formatFileSize(file.size),
        uploadDate: new Date().toISOString(),
        ipfsHash: result.IpfsHash,
        description,
        pinSize: result.PinSize
      }

      return evidence
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }, [])

  const uploadMultipleFiles = useCallback(async (
    files: FileList,
    descriptions?: string[]
  ): Promise<UploadedEvidence[]> => {
    setIsUploading(true)
    setError(null)
    const results: UploadedEvidence[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const description = descriptions?.[i]
        
        setProgress({
          progress: (i / files.length) * 100,
          stage: 'uploading',
          message: `Uploading ${i + 1} of ${files.length}: ${file.name}`
        })

        const evidence = await uploadFile(file, description)
        results.push(evidence)
      }

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }, [uploadFile])

  const uploadJSON = useCallback(async (
    data: any,
    filename: string,
    description?: string
  ): Promise<UploadedEvidence> => {
    setIsUploading(true)
    setError(null)
    setProgress(null)

    try {
      const result = await pinataService.uploadJSON(data, filename, (progressInfo) => {
        setProgress(progressInfo)
      })

      const evidence: UploadedEvidence = {
        id: Date.now().toString(),
        name: filename,
        type: 'chat',
        size: formatFileSize(JSON.stringify(data).length),
        uploadDate: new Date().toISOString(),
        ipfsHash: result.IpfsHash,
        description,
        pinSize: result.PinSize
      }

      return evidence
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'JSON upload failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }, [])

  return {
    uploadFile,
    uploadMultipleFiles,
    uploadJSON,
    isUploading,
    progress,
    error,
    clearError
  }
}

// Helper functions
function getFileType(file: File): UploadedEvidence['type'] {
  const mimeType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  if (mimeType.startsWith('image/')) {
    return 'screenshot'
  } else if (mimeType.startsWith('audio/')) {
    return 'audio'
  } else if (mimeType.startsWith('video/')) {
    return 'video'
  } else if (mimeType === 'application/json' || fileName.includes('chat') || fileName.includes('conversation')) {
    return 'chat'
  } else {
    return 'document'
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB'
  return Math.round(bytes / 1048576 * 100) / 100 + ' MB'
}