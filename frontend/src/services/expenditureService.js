import api from './api';

export const expenditureService = {
  getAll: async (params) => {
    const response = await api.get('/api/expenditures', { params });
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api/expenditures', data);
    return response.data.data;
  },
};
