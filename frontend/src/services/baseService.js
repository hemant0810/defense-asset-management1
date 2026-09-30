import api from './api';

export const baseService = {
  getAll: async () => {
    const response = await api.get('/api/bases');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/bases/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api/bases', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/bases/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/bases/${id}`);
    return response.data.data;
  },
};
