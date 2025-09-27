'use client';

import { useState, useEffect } from 'react';
import { useServerFiles, useServerFileUpload } from '../../hooks/useServerFiles';
import { useAuth } from '../../hooks/useAuth';
import { FileRecord } from '../../lib/serverAPI';

interface ServerFileManagerProps {
  reportId?: string;
  caseId?: string;
}

export default function ServerFileManager({ reportId, caseId }: ServerFileManagerProps) {
  const { isAuthenticated } = useAuth();
  const { files, pagination, isLoading, error, loadFiles, refreshFiles } = useServerFiles();
  const { retryMigration, deleteFile } = useServerFileUpload();
  
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadFiles({ reportId, caseId });
    }
  }, [isAuthenticated, reportId, caseId, loadFiles]);

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    loadFiles({ reportId, caseId, status: status || undefined });
  };

  const handleRetry = async (fileId: string) => {
    const success = await retryMigration(fileId);
    if (success) {
      refreshFiles();
    }
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const success = await deleteFile(fileId);
      if (success) {
        refreshFiles();
        if (selectedFile?.id === fileId) {
          setSelectedFile(null);
          setShowDetails(false);
        }
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pinned': return 'text-blue-600 bg-blue-100';
      case 'uploading': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'queued': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDownloadUrl = (file: FileRecord) => {
    // Use IPFS gateway for Pinata files
    return `https://gateway.pinata.cloud/ipfs/${file.pinataCid}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h3>
        <p className="text-yellow-700">Please connect your wallet to view your files.</p>
      </div>
    );
  }

  if (isLoading && files.length === 0) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading files...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">File Manager</h2>
        <button
          onClick={refreshFiles}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleStatusFilter('')}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedStatus === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All Files
        </button>
        <button
          onClick={() => handleStatusFilter('pinata')}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedStatus === 'pinata' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Pinata Only
        </button>
        <button
          onClick={() => handleStatusFilter('filecoin')}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedStatus === 'filecoin' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          On Filecoin
        </button>
        <button
          onClick={() => handleStatusFilter('uploading')}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedStatus === 'uploading' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Migrating
        </button>
        <button
          onClick={() => handleStatusFilter('failed')}
          className={`px-3 py-1 rounded-full text-sm ${
            selectedStatus === 'failed' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Failed
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Files List */}
      {files.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No files found</h3>
          <p className="text-gray-500">Upload some evidence to get started.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Storage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{file.originalName}</div>
                          <div className="text-gray-500">{file.mimeType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(file.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(file.filecoinStatus)}`}>
                        {file.filecoinStatus}
                      </span>
                      {file.filecoinStatus === 'uploading' && (
                        <div className="mt-1 w-16 bg-gray-200 rounded-full h-1">
                          <div className="bg-yellow-500 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className={`flex items-center ${file.pinataStatus === 'pinned' ? 'text-blue-600' : 'text-gray-400'}`}>
                          <span className="mr-1">📌</span> Pinata
                        </div>
                        <div className={`flex items-center ${file.filecoinStatus === 'completed' ? 'text-green-600' : 'text-gray-400'}`}>
                          <span className="mr-1">🗃️</span> Filecoin
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedFile(file);
                          setShowDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Details
                      </button>
                      
                      {file.pinataStatus === 'pinned' && (
                        <a
                          href={getDownloadUrl(file)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                        >
                          Download
                        </a>
                      )}
                      
                      {file.filecoinStatus === 'failed' && (
                        <button
                          onClick={() => handleRetry(file.id)}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          Retry
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(file.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => loadFiles({ reportId, caseId, page })}
              className={`px-3 py-2 rounded-md ${
                page === pagination.page
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* File Details Modal */}
      {showDetails && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">File Details</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">File Information</h4>
                  <div className="mt-2 text-sm space-y-2">
                    <div><strong>Name:</strong> {selectedFile.originalName}</div>
                    <div><strong>Size:</strong> {formatFileSize(selectedFile.fileSize)}</div>
                    <div><strong>Type:</strong> {selectedFile.mimeType}</div>
                    <div><strong>Hash:</strong> <code className="bg-gray-100 px-1 rounded">{selectedFile.fileHash}</code></div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Storage Information</h4>
                  <div className="mt-2 text-sm space-y-2">
                    <div><strong>Pinata CID:</strong> <code className="bg-gray-100 px-1 rounded">{selectedFile.pinataCid}</code></div>
                    {selectedFile.pieceCid && (
                      <div><strong>Filecoin Piece CID:</strong> <code className="bg-gray-100 px-1 rounded">{selectedFile.pieceCid}</code></div>
                    )}
                    <div><strong>Pinata Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedFile.pinataStatus)}`}>{selectedFile.pinataStatus}</span></div>
                    <div><strong>Filecoin Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedFile.filecoinStatus)}`}>{selectedFile.filecoinStatus}</span></div>
                  </div>
                </div>

                {selectedFile.metadata && Object.keys(selectedFile.metadata).length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700">Metadata</h4>
                    <div className="mt-2 text-sm space-y-2">
                      {Object.entries(selectedFile.metadata).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedFile.migrationError && (
                  <div>
                    <h4 className="font-medium text-red-700">Migration Error</h4>
                    <div className="mt-2 text-sm text-red-600">
                      {selectedFile.migrationError}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}