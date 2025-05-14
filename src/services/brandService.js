import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/brand';

export const brandService = {
  async addBrand(name, logoUrl) {
    return axios.post(`${API_URL}/add`, { name: name, logoUrl: logoUrl }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
    });
  },

    async deleteBrand(name, logoUrl) {
        return axios.delete(`${API_URL}/delete`, {
            data: { name, logoUrl },
            headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
            }
        });
    },


  async updateBrand(id, name, logoUrl) {
    return axios.put(`${API_URL}/update`, {id: id, name: name, logoUrl: logoUrl }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
    });
  }
};
