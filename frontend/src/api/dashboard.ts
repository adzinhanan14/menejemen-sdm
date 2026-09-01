import { apiClient } from './axios';

export const dashboardApi = {
  getStats: () => apiClient.get('/dashboard/stats'),
  getOrgChartData: () => apiClient.get('/dashboard/org-chart-data'),
  getActivities: (limit = 10) => apiClient.get('/dashboard/activities', { params: { limit } }),
};
