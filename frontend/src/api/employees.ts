import { apiClient } from './axios';

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const employeeApi = {
  getAll: (params?: EmployeeQueryParams) => apiClient.get('/employees', { params }),
  getById: (id: string) => apiClient.get(`/employees/${id}`),
  create: (data: any) => apiClient.post('/employees', data),
  update: (id: string, data: any) => apiClient.patch(`/employees/${id}`, data),
  delete: (id: string) => apiClient.delete(`/employees/${id}`),
};
