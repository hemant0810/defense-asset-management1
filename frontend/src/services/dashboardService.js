import api from './api';

export const dashboardService = {
  getSummary: async (params) => {
    const response = await api.get('/api/dashboard/summary', { params });
    return response.data.data;
  },

  getNetMovementDetails: async (params) => {
    const response = await api.get('/api/dashboard/net-movement', { params });
    return response.data.data;
  },
};
