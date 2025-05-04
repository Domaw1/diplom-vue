

import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1';

export const productService = {
  async getAllProducts() {
    try {
      const response = await axios.get(`${API_URL}/products`
    );
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка загрузки товаров');
    }
  },

  async createProduct(productData) {
    try {
      const response = await axios.post(`${API_URL}/products/create`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка создания товара');
    }
  },

  async updateProduct(productId, productData) {
    try {
      const response = await axios.put(`${API_URL}/products/${productId}`, productData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка обновления товара');
    }
  },

  async deleteProduct(productId) {
    try {
      const response = await axios.delete(`${API_URL}/products/delete/${productId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Ошибка удаления товара');
    }
  }
};
