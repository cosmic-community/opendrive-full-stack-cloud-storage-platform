import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const authService = {
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/api/login/`, {
        username,
        password,
      });

      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  },

  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/api/register/`, userData);

      if (response.data.tokens) {
        localStorage.setItem('access_token', response.data.tokens.access);
        localStorage.setItem('refresh_token', response.data.tokens.refresh);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  },

  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      const response = await axios.post(`${API_URL}/api/token/refresh/`, {
        refresh: refreshToken,
      });

      localStorage.setItem('access_token', response.data.access);
      return response.data.access;
    } catch (error) {
      this.logout();
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

export default authService;