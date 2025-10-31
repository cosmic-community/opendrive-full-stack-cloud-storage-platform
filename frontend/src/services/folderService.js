import api from './api';

const folderService = {
  async getFolders() {
    const response = await api.get('/folders/');
    return response.data;
  },

  async getFolder(id) {
    const response = await api.get(`/folders/${id}/`);
    return response.data;
  },

  async getFolderContents(id) {
    const response = await api.get(`/folders/${id}/contents/`);
    return response.data;
  },

  async createFolder(name, parentId = null) {
    const response = await api.post('/folders/', {
      name,
      parent: parentId,
    });
    return response.data;
  },

  async updateFolder(id, data) {
    const response = await api.patch(`/folders/${id}/`, data);
    return response.data;
  },

  async deleteFolder(id) {
    const response = await api.delete(`/folders/${id}/`);
    return response.data;
  },
};

export default folderService;