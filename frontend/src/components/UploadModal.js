import React, { useState, useRef } from 'react';
import { X, Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import fileService from '../services/fileService';

function UploadModal({ onClose, onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const progress = {};

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      progress[i] = 'uploading';
      setUploadProgress({ ...progress });

      try {
        await fileService.uploadFile(file);
        progress[i] = 'success';
      } catch (error) {
        console.error('Error uploading file:', error);
        progress[i] = 'error';
      }

      setUploadProgress({ ...progress });
    }

    setUploading(false);
    
    // Close modal after a brief delay to show success
    setTimeout(() => {
      onUploadComplete();
      onClose();
    }, 1000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Upload Files</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
          >
            <Upload className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-lg font-medium text-gray-700">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Upload any type of file
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="font-medium text-gray-700">Selected Files ({selectedFiles.length})</h3>
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <File className="text-gray-400 flex-shrink-0" size={24} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {uploadProgress[index] === 'uploading' && (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    )}
                    {uploadProgress[index] === 'success' && (
                      <CheckCircle className="text-green-500" size={20} />
                    )}
                    {uploadProgress[index] === 'error' && (
                      <AlertCircle className="text-red-500" size={20} />
                    )}
                    {!uploading && !uploadProgress[index] && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploading}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;