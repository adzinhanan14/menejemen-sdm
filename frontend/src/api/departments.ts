import { apiClient } from './axios';

export const departmentApi = {
  getAll: () => apiClient.get('/departments'),
  getTree: () => apiClient.get('/departments/tree'),
  getById: (id: string) => apiClient.get(`/departments/${id}`),
  create: (data: any) => apiClient.post('/departments', data),
  update: (id: string, data: any) => apiClient.patch(`/departments/${id}`, data),
  delete: (id: string) => apiClient.delete(`/departments/${id}`),
};

export const positionApi = {
  getAll: (departmentId?: string) => apiClient.get('/positions', { params: { departmentId } }),
  getById: (id: string) => apiClient.get(`/positions/${id}`),
  create: (data: any) => apiClient.post('/positions', data),
  update: (id: string, data: any) => apiClient.patch(`/positions/${id}`, data),
  delete: (id: string) => apiClient.delete(`/positions/${id}`),
};
