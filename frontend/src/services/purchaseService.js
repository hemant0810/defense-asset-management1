import api from './api';

export const purchaseService = {
  getAll: async (params) => {
    const response = await api.get('/api/purchases', { params });
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/purchases/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api/purchases', data);
    return response.data.data;
  },
};
