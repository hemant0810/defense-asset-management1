import api from './api';

export const assignmentService = {
  getAll: async (params) => {
    const response = await api.get('/api/assignments', { params });
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api/assignments', data);
    return response.data.data;
  },
};
