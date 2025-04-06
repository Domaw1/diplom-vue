import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/user';

export const authService = {
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/sign_in`, credentials);
      localStorage.setItem('token', response.data.token);
      console.log(this.getToken());
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка входа');
    }
  },

  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}`, userData);
      const responseAuth = await axios.post(`${API_URL}/sign_in`, {
        email: userData.email,
        password: userData.password
      });
      localStorage.setItem('token', responseAuth.data.token);
      return responseAuth.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка регистрации');
    }
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  }
};