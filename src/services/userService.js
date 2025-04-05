import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export const userService = {
  async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка загрузки профиля');
    }
  },

  async getOrders() {
    try {
      const response = await axios.get(`${API_URL}/order/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка загрузки заказов');
    }
  }
};