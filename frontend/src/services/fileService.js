import api from './api';

const fileService = {
  async getFiles() {
    const response = await api.get('/files/');
    return response.data;
  },

  async getFile(id) {
    const response = await api.get(`/files/${id}/`);
    return response.data;
  },

  async uploadFile(file, folderId = null) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', file.name);
    if (folderId) {
      formData.append('folder', folderId);
    }

    const response = await api.post('/files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateFile(id, data) {
    const response = await api.patch(`/files/${id}/`, data);
    return response.data;
  },

  async deleteFile(id) {
    const response = await api.delete(`/files/${id}/`);
    return response.data;
  },

  async downloadFile(id) {
    const response = await api.get(`/files/${id}/download/`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async shareFile(id) {
    const response = await api.post(`/files/${id}/share/`);
    return response.data;
  },

  async unshareFile(id) {
    const response = await api.post(`/files/${id}/unshare/`);
    return response.data;
  },

  async getRecentFiles() {
    const response = await api.get('/files/recent/');
    return response.data;
  },

  async getTrash() {
    const response = await api.get('/files/trash/');
    return response.data;
  },

  async restoreFile(id) {
    const response = await api.post(`/files/${id}/restore/`);
    return response.data;
  },

  async permanentDelete(id) {
    const response = await api.delete(`/files/${id}/permanent_delete/`);
    return response.data;
  },

  async searchFiles(query) {
    const response = await api.get(`/search/?q=${encodeURIComponent(query)}`);
    return response.data;
  },
};

export default fileService;