import api from './api';

export const transferService = {
  getAll: async (params) => {
    const response = await api.get('/api/transfers', { params });
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api/transfers', data);
    return response.data.data;
  },
};
