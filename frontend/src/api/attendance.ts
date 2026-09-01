import { apiClient } from './axios';

export const attendanceApi = {
  checkIn: (data: { employeeId: string; latitude?: number; longitude?: number; facePhotoBase64?: string }) =>
    apiClient.post('/attendance/check-in', data),
  checkOut: (data: { employeeId: string }) => apiClient.post('/attendance/check-out', data),
  getTodayLogs: () => apiClient.get('/attendance/today'),
  getLogs: (startDate?: string, endDate?: string, employeeId?: string) =>
    apiClient.get('/attendance/logs', { params: { startDate, endDate, employeeId } }),
  getHeatmap: (month?: string) => apiClient.get('/attendance/heatmap', { params: { month } }),
};
