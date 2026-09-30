import api from './api';

export const auditService = {
  getAll: async (params) => {
    const response = await api.get('/api/audit-logs', { params });
    return response.data.data;
  },
};
