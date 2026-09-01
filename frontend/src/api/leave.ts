import { apiClient } from './axios';

export const leaveApi = {
  getLeaveTypes: () => apiClient.get('/leave-applications/types'),
  getAll: (status?: string, employeeId?: string) =>
    apiClient.get('/leave-applications', { params: { status, employeeId } }),
  create: (data: {
    employeeId: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    attachment?: string;
  }) => apiClient.post('/leave-applications', data),
  processWorkflow: (id: string, data: { status: 'APPROVED' | 'REJECTED'; notes?: string; approvedBy?: string }) =>
    apiClient.put(`/leave-applications/${id}/workflow`, data),
  getQuota: (employeeId: string) => apiClient.get(`/employees/${employeeId}/leave-quota`),
};
