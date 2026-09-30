import api from './api';

export const userService = {
  getAll: async (params) => {
    const response = await api.get('/api/users', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/users/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api/users', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/users/${id}`);
    return response.data.data;
  },
};
