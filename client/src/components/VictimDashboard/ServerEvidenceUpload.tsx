'use client';

import { useState, useRef } from 'react';
import { useServerFileUpload, UploadProgress } from '../../hooks/useServerFiles';
import { useAuth } from '../../hooks/useAuth';

interface ServerEvidenceUploadProps {
  reportId?: string;
  caseId?: string;
  evidenceType?: string;
  onUploadComplete?: (result: any) => void;
  onUploadError?: (error: string) => void;
}

export default function ServerEvidenceUpload({
  reportId,
  caseId,
  evidenceType,
  onUploadComplete,
  onUploadError
}: ServerEvidenceUploadProps) {
  const { isAuthenticated } = useAuth();
  const { uploadFile, isUploading, uploadProgress, error, clearError } = useServerFileUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0 || !isAuthenticated) return;
    
    const file = files[0];
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    clearError();
    
    const metadata = {
      reportId,
      caseId,
      evidenceType,
      description: description.trim(),
      tags: tags.filter(tag => tag.trim()),
      timestamp: new Date().toISOString(),
    };

    const result = await uploadFile(file, metadata, (progress: UploadProgress) => {
      console.log('Upload progress:', progress);
    });

    if (result) {
      onUploadComplete?.(result);
      // Reset form
      setDescription('');
      setTags([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (error) {
      onUploadError?.(error);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
        <p className="text-yellow-700">Please connect your wallet to upload evidence.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Upload Evidence</h2>
        
        {/* Description */}
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this evidence..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            disabled={isUploading}
          />
        </div>

        {/* Tags */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                  disabled={isUploading}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a tag..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isUploading}
            />
            <button
              type="button"
              onClick={addTag}
              disabled={isUploading || !newTag.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>

        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : isUploading
              ? 'border-gray-300 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={isUploading}
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt,.mp4,.avi,.mov,.mp3,.wav"
          />
          
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <div className="text-lg font-medium text-gray-900">
              {isUploading ? 'Uploading...' : 'Drop files here or click to browse'}
            </div>
            <div className="text-sm text-gray-500">
              Supports: Images, Documents, Videos, Audio (Max: 100MB)
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadProgress && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                {uploadProgress.message}
              </span>
              <span className="text-sm text-gray-500">
                {uploadProgress.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  uploadProgress.stage === 'error'
                    ? 'bg-red-500'
                    : uploadProgress.stage === 'complete'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${uploadProgress.progress}%` }}
              />
            </div>
            <div className="mt-2 text-xs text-gray-600">
              <span className="capitalize">{uploadProgress.stage}</span>
              {uploadProgress.stage === 'complete' && (
                <span className="text-green-600 ml-2">✓ Uploaded to Pinata, migrating to Filecoin...</span>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-500 mr-2">⚠️</div>
              <div className="text-red-800 text-sm">{error}</div>
            </div>
          </div>
        )}

        {/* Info about the process */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">How it works:</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. File is uploaded to Pinata (IPFS) for immediate availability</li>
            <li>2. File is automatically migrated to Filecoin for long-term storage</li>
            <li>3. You can track the migration status in the file manager</li>
            <li>4. Files remain accessible throughout the process</li>
          </ol>
        </div>
      </div>
    </div>
  );
}