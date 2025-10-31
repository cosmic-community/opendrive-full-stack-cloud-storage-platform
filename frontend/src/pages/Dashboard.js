import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import FileList from '../components/FileList';
import storageService from '../services/storageService';

function Dashboard({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [storageInfo, setStorageInfo] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    loadStorageInfo();
  }, [refreshTrigger]);

  const loadStorageInfo = async () => {
    try {
      const data = await storageService.getStorageInfo();
      setStorageInfo(data);
    } catch (error) {
      console.error('Error loading storage info:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        storageInfo={storageInfo}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
          onRefresh={handleRefresh}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<FileList viewType="all" refreshTrigger={refreshTrigger} onUpdate={handleRefresh} />} />
            <Route path="/recent" element={<FileList viewType="recent" refreshTrigger={refreshTrigger} onUpdate={handleRefresh} />} />
            <Route path="/trash" element={<FileList viewType="trash" refreshTrigger={refreshTrigger} onUpdate={handleRefresh} />} />
            <Route path="/folder/:folderId" element={<FileList viewType="folder" refreshTrigger={refreshTrigger} onUpdate={handleRefresh} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;