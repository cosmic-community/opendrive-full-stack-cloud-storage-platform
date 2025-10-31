import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, File, FileText, Image, Video, Music, Archive, MoreVertical, Download, Share2, Trash2, Edit2, RotateCcw, Trash } from 'lucide-react';
import { formatDate } from '../utils/fileUtils';
import fileService from '../services/fileService';

function FileItem({ item, isFolder, viewMode, onUpdate, onDelete, onRestore, onPermanentDelete, isTrash }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const getFileIcon = (mimeType) => {
    if (!mimeType) return File;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.startsWith('audio/')) return Music;
    if (mimeType === 'application/pdf' || mimeType.includes('word')) return FileText;
    if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive;
    return File;
  };

  const getFileColor = (mimeType) => {
    if (!mimeType) return 'text-gray-500';
    if (mimeType.startsWith('image/')) return 'text-blue-500';
    if (mimeType.startsWith('video/')) return 'text-purple-500';
    if (mimeType.startsWith('audio/')) return 'text-pink-500';
    if (mimeType === 'application/pdf') return 'text-red-500';
    if (mimeType.includes('word')) return 'text-blue-600';
    return 'text-gray-500';
  };

  const handleDownload = async () => {
    try {
      const blob = await fileService.downloadFile(item.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = item.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleShare = async () => {
    try {
      const data = await fileService.shareFile(item.id);
      setShareUrl(data.share_url);
      setShowShareModal(true);
    } catch (error) {
      console.error('Error sharing file:', error);
    }
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard!');
  };

  if (isFolder) {
    return (
      <Link
        to={`/dashboard/folder/${item.id}`}
        className={`
          ${viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center space-x-3'}
          bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer
        `}
      >
        <FolderOpen className="text-primary" size={viewMode === 'grid' ? 40 : 24} />
        <div className={viewMode === 'grid' ? 'mt-2' : 'flex-1'}>
          <p className="font-medium truncate">{item.name}</p>
          {viewMode === 'list' && (
            <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
          )}
        </div>
      </Link>
    );
  }

  const Icon = getFileIcon(item.mime_type);
  const colorClass = getFileColor(item.mime_type);

  return (
    <>
      <div className={`
        ${viewMode === 'grid' ? 'p-4' : 'p-3 flex items-center space-x-3'}
        bg-white rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all relative group
      `}>
        <Icon className={colorClass} size={viewMode === 'grid' ? 40 : 24} />
        
        <div className={`${viewMode === 'grid' ? 'mt-2' : 'flex-1'} min-w-0`}>
          <p className="font-medium truncate">{item.name}</p>
          <p className="text-sm text-gray-500">{item.size_formatted}</p>
          {viewMode === 'list' && (
            <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
          )}
        </div>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              {!isTrash ? (
                <>
                  <button
                    onClick={() => {
                      handleDownload();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => {
                      handleShare();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={() => {
                      onDelete(item.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-left text-red-600"
                  >
                    <Trash2 size={18} />
                    <span>Move to Trash</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onRestore(item.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-left"
                  >
                    <RotateCcw size={18} />
                    <span>Restore</span>
                  </button>
                  <button
                    onClick={() => {
                      onPermanentDelete(item.id);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 text-left text-red-600"
                  >
                    <Trash size={18} />
                    <span>Delete Forever</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Share File</h3>
            <p className="text-sm text-gray-600 mb-4">Anyone with this link can view and download this file:</p>
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg"
              />
              <button
                onClick={copyShareUrl}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
              >
                Copy
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FileItem;