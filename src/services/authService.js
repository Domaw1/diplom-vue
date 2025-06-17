import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api/v1/user';

export const authService = {
  async login(credentials) {
    try {
      const response = await axios.post(`${API_URL}/sign_in`, credentials);
      localStorage.setItem('token', response.data.token);
      const decoded = jwtDecode(response.data.token);

      if (decoded.role === 'ROLE_ADMIN') {
        console.log('Вы вошли как администратор');
      }
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
  },

  async resetPassword(email) {
    try {
      const response = await axios.post(`${API_URL}/reset-password-request`, { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Не удалось отправить письмо для сброса');
    }
  },

  async confirmResetPassword(token, newPassword) {
    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        token,
        newPassword
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка при установке нового пароля');
    }
  }
};
