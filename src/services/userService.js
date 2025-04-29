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
  },

  async makeOrder() {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/order`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка создания заказа');
    }
  },
  async updateUser(userData) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          `${API_URL}/user/update`,
          {
            username: userData.username,
            email: userData.email,
            password: userData.password,
            currentPassword: userData.currentPassword
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка обновления профиля');
    }
  }
};