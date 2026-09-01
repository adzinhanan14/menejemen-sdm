import { apiClient } from './axios';

export const payrollApi = {
  // Salary Components
  getSalaryComponents: () => apiClient.get('/salary-components'),
  createSalaryComponent: (data: any) => apiClient.post('/salary-components', data),
  
  // Employee Salary Settings
  getEmployeeSalarySettings: (employeeId: string) => 
    apiClient.get(`/employees/${employeeId}/salary-settings`),
  createEmployeeSalarySetting: (data: any) => 
    apiClient.post('/employees/salary-settings', data),
  
  // Payroll Batches
  generateBatch: (data: { periodMonth: number; periodYear: number }) =>
    apiClient.post('/payroll/batches', data),
  getBatches: () => apiClient.get('/payroll/batches'),
  getBatchDetail: (batchId: string) => apiClient.get(`/payroll/batches/${batchId}`),
  approveBatch: (batchId: string, data: { approvedBy: string }) =>
    apiClient.patch(`/payroll/batches/${batchId}/approve`, data),
  markAsPaid: (batchId: string) => apiClient.patch(`/payroll/batches/${batchId}/mark-paid`),
  
  // Payroll Details
  getPayrollDetail: (detailId: string) => apiClient.get(`/payroll/details/${detailId}`),
};
