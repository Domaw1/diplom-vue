import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/cart';

export const cartService = {
  async getCart() {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка загрузки корзины');
    }
  },

  async updateItem(itemId, count) {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/post`,
          {
            productVariantId: itemId,
            quantity: count
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
        throw new Error(error.response?.data?.message || 'Ошибка обновления товара');
      }
  },

  async removeItem(itemId) {
    try {
      await axios.delete(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: {
            productVariantId: itemId
        }
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка удаления товара');
    }
  },

  async removeItemFromCart(itemId, quantity) {
    try {
      await axios.delete(`${API_URL}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        data: {
            productVariantId: itemId,
            quantity: quantity
        }
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка удаления товара');
    }
  },

  async clearCart() {
    try {
      await axios.delete(`${API_URL}/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка очистки корзины');
    }
  }
};