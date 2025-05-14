import axios from 'axios';

const API_URL = 'http://localhost:8080/api/v1/category';

export const categoryService = {
  async add(name) {
    return axios.post(`${API_URL}/add`, { name: name }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
    });
  },

    async delete(id) {
        return axios.delete(`${API_URL}/delete`, {
            data: { id },
            headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
            }
        });
    },


  async update(id, name) {
    return axios.put(`${API_URL}/update`, {id: id, name: name }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
    });
  }
};
