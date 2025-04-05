import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/wishlist';

export const favoritesService = {
  async getFavorites() {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка загрузки избранного');
    }
  },

  async addFavorite(productId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        API_URL,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          data: {
            productId: productId
          }
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка добавления в избранное');
    }
  },

  async removeFavorite(itemId) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: {
            productId: itemId
        }
      });
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка удаления из избранного');
    }
  }
};