import api from './api';

export const equipmentService = {
  getAll: async () => {
    const response = await api.get('/api/equipment-types');
    return response.data.data;
  },

  getById: async (id) => {
    const response = await api.get(`/api/equipment-types/${id}`);
    return response.data.data;
  },

  create: async (data) => {
    const response = await api.post('/api/equipment-types', data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/api/equipment-types/${id}`, data);
    return response.data.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/api/equipment-types/${id}`);
    return response.data.data;
  },
};
