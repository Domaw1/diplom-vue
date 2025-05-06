import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export const orderService = {
  async updateOrderStatus(status) {
    try {
      const response = await axios.put(`${API_URL}/order/update`, status, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка обновления заказа');
    }
  },

  async getAllOrders() {
      try {
        const response = await axios.get(`${API_URL}/order/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
        return response.data;
      } catch (error) {
        throw new Error(error.response?.data?.message || 'Ошибка загрузки товаров');
      }
    },
};
