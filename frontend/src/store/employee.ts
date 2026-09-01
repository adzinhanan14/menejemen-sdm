import { defineStore } from 'pinia';
import { ref } from 'vue';
import { employeeApi, type EmployeeQueryParams } from '@/api/employees';

export const useEmployeeStore = defineStore('employee', () => {
  const employees = ref<any[]>([]);
  const total = ref(0);
  const page = ref(1);
  const limit = ref(10);
  const totalPages = ref(1);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchEmployees(params: EmployeeQueryParams = {}) {
    loading.value = true;
    error.value = null;
    try {
      const response = await employeeApi.getAll(params);
      const resData = response.data.data ?? response.data;
      if (resData.data) {
        employees.value = resData.data;
        total.value = resData.meta.total;
        page.value = resData.meta.page;
        limit.value = resData.meta.limit;
        totalPages.value = resData.meta.totalPages;
      } else if (Array.isArray(resData)) {
        employees.value = resData;
        total.value = resData.length;
      }
    } catch (err: any) {
      error.value = err?.response?.data?.message || 'Gagal memuat data karyawan';
    } finally {
      loading.value = false;
    }
  }

  async function createEmployee(data: any) {
    loading.value = true;
    try {
      await employeeApi.create(data);
      await fetchEmployees({ page: page.value, limit: limit.value });
    } finally {
      loading.value = false;
    }
  }

  async function updateEmployee(id: string, data: any) {
    loading.value = true;
    try {
      await employeeApi.update(id, data);
      await fetchEmployees({ page: page.value, limit: limit.value });
    } finally {
      loading.value = false;
    }
  }

  async function deleteEmployee(id: string) {
    loading.value = true;
    try {
      await employeeApi.delete(id);
      await fetchEmployees({ page: page.value, limit: limit.value });
    } finally {
      loading.value = false;
    }
  }

  return {
    employees,
    total,
    page,
    limit,
    totalPages,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  };
});
