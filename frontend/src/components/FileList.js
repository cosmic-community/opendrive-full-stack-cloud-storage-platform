import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, List, MoreVertical, Download, Share2, Trash2, Edit2, RotateCcw } from 'lucide-react';
import fileService from '../services/fileService';
import folderService from '../services/folderService';
import FileItem from './FileItem';

function FileList({ viewType, refreshTrigger, onUpdate }) {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const { folderId } = useParams();

  useEffect(() => {
    loadFiles();
  }, [viewType, folderId, refreshTrigger]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      if (viewType === 'all') {
        const [filesData, foldersData] = await Promise.all([
          fileService.getFiles(),
          folderService.getFolders()
        ]);
        setFiles(filesData);
        setFolders(foldersData.filter(f => !f.parent));
      } else if (viewType === 'recent') {
        const data = await fileService.getRecentFiles();
        setFiles(data);
        setFolders([]);
      } else if (viewType === 'trash') {
        const data = await fileService.getTrash();
        setFiles(data);
        setFolders([]);
      } else if (viewType === 'folder' && folderId) {
        const data = await folderService.getFolderContents(folderId);
        setFiles(data.files || []);
        setFolders(data.subfolders || []);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      setFiles([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    try {
      await fileService.deleteFile(fileId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleRestore = async (fileId) => {
    try {
      await fileService.restoreFile(fileId);
      onUpdate();
    } catch (error) {
      console.error('Error restoring file:', error);
    }
  };

  const handlePermanentDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to permanently delete this file? This cannot be undone.')) {
      try {
        await fileService.permanentDelete(fileId);
        onUpdate();
      } catch (error) {
        console.error('Error permanently deleting file:', error);
      }
    }
  };

  const getTitle = () => {
    if (viewType === 'recent') return 'Recent Files';
    if (viewType === 'trash') return 'Trash';
    if (viewType === 'folder') return 'Folder';
    return 'My Drive';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'hover:bg-gray-100'}`}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {files.length === 0 && folders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No files found</p>
          <p className="text-gray-400 mt-2">Upload files to get started</p>
        </div>
      ) : (
        <>
          {folders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-3">Folders</h2>
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
                {folders.map((folder) => (
                  <FileItem
                    key={`folder-${folder.id}`}
                    item={folder}
                    isFolder={true}
                    viewMode={viewMode}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>
            </div>
          )}

          {files.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-600 uppercase mb-3">Files</h2>
              <div className={viewMode === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
                {files.map((file) => (
                  <FileItem
                    key={`file-${file.id}`}
                    item={file}
                    isFolder={false}
                    viewMode={viewMode}
                    onUpdate={onUpdate}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    onPermanentDelete={handlePermanentDelete}
                    isTrash={viewType === 'trash'}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default FileList;