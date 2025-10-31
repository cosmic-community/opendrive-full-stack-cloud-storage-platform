import api from './api';

const storageService = {
  async getStorageInfo() {
    const response = await api.get('/storage/');
    return response.data;
  },
};

export default storageService;