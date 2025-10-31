import React, { useState } from 'react';
import { Menu, Search, Upload, RefreshCw, LogOut, User } from 'lucide-react';
import authService from '../services/authService';
import UploadModal from './UploadModal';

function TopBar({ onMenuClick, onLogout, onRefresh }) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const user = authService.getCurrentUser();

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality will be handled by FileList component
    console.log('Search:', searchQuery);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-primary focus:bg-white"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Upload size={20} />
              <span className="hidden sm:inline">Upload</span>
            </button>

            <button
              onClick={onRefresh}
              className="p-2 hover:bg-gray-100 rounded-lg"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>

            <div className="relative group">
              <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg">
                <User size={20} />
                <span className="hidden md:inline">{user?.username}</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-3 border-b border-gray-200">
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left hover:bg-gray-100 text-red-600"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={onRefresh}
        />
      )}
    </>
  );
}

export default TopBar;