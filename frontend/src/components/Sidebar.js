import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HardDrive, FolderOpen, Clock, Trash2, Plus, X } from 'lucide-react';
import folderService from '../services/folderService';

function Sidebar({ isOpen, onClose, storageInfo }) {
  const [folders, setFolders] = useState([]);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const location = useLocation();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const data = await folderService.getFolders();
      setFolders(data);
    } catch (error) {
      console.error('Error loading folders:', error);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await folderService.createFolder(newFolderName);
      setNewFolderName('');
      setShowNewFolderModal(false);
      loadFolders();
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path ? 'bg-primary-50 text-primary border-r-4 border-primary' : 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <HardDrive className="text-primary" size={24} />
            <span className="text-xl font-bold text-gray-900">OpenDrive</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard')}`}
            >
              <HardDrive size={20} />
              <span className="font-medium">My Drive</span>
            </Link>

            <Link
              to="/dashboard/recent"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard/recent')}`}
            >
              <Clock size={20} />
              <span className="font-medium">Recent</span>
            </Link>

            <Link
              to="/dashboard/trash"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard/trash')}`}
            >
              <Trash2 size={20} />
              <span className="font-medium">Trash</span>
            </Link>
          </div>

          {/* Folders section */}
          <div className="mt-8">
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-sm font-semibold text-gray-600 uppercase">Folders</span>
              <button
                onClick={() => setShowNewFolderModal(true)}
                className="p-1 hover:bg-gray-100 rounded"
                title="New folder"
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="space-y-1">
              {folders.map((folder) => (
                <Link
                  key={folder.id}
                  to={`/dashboard/folder/${folder.id}`}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${isActive(`/dashboard/folder/${folder.id}`)}`}
                >
                  <FolderOpen size={18} />
                  <span className="truncate">{folder.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Storage info */}
        {storageInfo && (
          <div className="p-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Storage</span>
                <span className="font-medium">{storageInfo.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {storageInfo.used_formatted} of {storageInfo.total_formatted} used
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New folder modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Folder</h3>
            <form onSubmit={handleCreateFolder}>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;