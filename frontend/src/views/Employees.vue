<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useEmployeeStore } from '@/store/employee';
import { departmentApi } from '@/api/departments';
import EmployeeForm from '@/components/EmployeeForm.vue';
import Pagination from '@/components/Pagination.vue';
import { refDebounced } from '@vueuse/core';

const route = useRoute();
const employeeStore = useEmployeeStore();

const searchInput = ref('');
const debouncedSearch = refDebounced(searchInput, 500);

const selectedDepartment = ref<string>((route.query.departmentId as string) || '');
const selectedStatus = ref<string>('');

const departments = ref<any[]>([]);

// Modal State
const isModalOpen = ref(false);
const selectedEmployeeForEdit = ref<any>(null);

// Delete Confirmation Modal State
const isDeleteModalOpen = ref(false);
const employeeToDelete = ref<any>(null);

const fetchDepartments = async () => {
  try {
    const res = await departmentApi.getAll();
    departments.value = res.data.data ?? res.data;
  } catch (e) {
    console.error('Failed to load departments', e);
  }
};

const loadData = () => {
  employeeStore.fetchEmployees({
    page: employeeStore.page,
    limit: employeeStore.limit,
    search: debouncedSearch.value || undefined,
    departmentId: selectedDepartment.value || undefined,
    status: selectedStatus.value || undefined,
  });
};

onMounted(() => {
  fetchDepartments();
  loadData();
});

watch([debouncedSearch, selectedDepartment, selectedStatus], () => {
  employeeStore.page = 1;
  loadData();
});

const handlePageChange = (newPage: number) => {
  employeeStore.page = newPage;
  loadData();
};

const openCreateModal = () => {
  selectedEmployeeForEdit.value = null;
  isModalOpen.value = true;
};

const openEditModal = (employee: any) => {
  selectedEmployeeForEdit.value = employee;
  isModalOpen.value = true;
};

const confirmDelete = (employee: any) => {
  employeeToDelete.value = employee;
  isDeleteModalOpen.value = true;
};

const executeDelete = async () => {
  if (employeeToDelete.value) {
    await employeeStore.deleteEmployee(employeeToDelete.value.id);
    isDeleteModalOpen.value = false;
    employeeToDelete.value = null;
  }
};

const handleFormSubmitted = () => {
  isModalOpen.value = false;
  loadData();
};
</script>

<template>
  <div class="p-6 md:p-8 space-y-6">
    <!-- Header Title & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Manajemen Karyawan</h1>
        <p class="text-sm text-slate-500 mt-1">Kelola data seluruh karyawan, departemen, dan kontrak kerja.</p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
      >
        <span class="text-base font-bold">+</span> Tambah Karyawan
      </button>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200/80">
      <!-- Search Input -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Cari Nama atau NIK..."
          class="w-full rounded-xl border border-slate-300 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <!-- Department Filter -->
      <div>
        <select
          v-model="selectedDepartment"
          class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
        >
          <option value="">Semua Departemen</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>

      <!-- Status Filter -->
      <div>
        <select
          v-model="selectedStatus"
          class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
        >
          <option value="">Semua Status Kerja</option>
          <option value="PERMANENT">Tetap (Permanent)</option>
          <option value="CONTRACT">Kontrak (Contract)</option>
          <option value="PROBATION">Probation</option>
          <option value="RESIGNED">Resigned</option>
        </select>
      </div>
    </div>

    <!-- Table Container -->
    <div class="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">No</th>
              <th class="px-6 py-4">NIK</th>
              <th class="px-6 py-4">Nama Karyawan</th>
              <th class="px-6 py-4">Departemen</th>
              <th class="px-6 py-4">Jabatan</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="employeeStore.loading" class="animate-pulse">
              <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                Memuat data karyawan...
              </td>
            </tr>
            <tr v-else-if="employeeStore.employees.length === 0">
              <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                Tidak ada data karyawan ditemukan.
              </td>
            </tr>
            <tr
              v-else
              v-for="(emp, index) in employeeStore.employees"
              :key="emp.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <td class="px-6 py-4 font-medium text-slate-400">
                {{ (employeeStore.page - 1) * employeeStore.limit + index + 1 }}
              </td>
              <td class="px-6 py-4 font-semibold text-slate-800">
                {{ emp.nik }}
              </td>
              <td class="px-6 py-4">
                <div class="font-semibold text-slate-900">{{ emp.name }}</div>
                <div class="text-xs text-slate-400">{{ emp.email }}</div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                  {{ emp.department?.name || '-' }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-700 font-medium">
                {{ emp.position?.title || '-' }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    emp.employmentStatus === 'PERMANENT'
                      ? 'bg-emerald-100 text-emerald-800'
                      : emp.employmentStatus === 'CONTRACT'
                      ? 'bg-amber-100 text-amber-800'
                      : emp.employmentStatus === 'PROBATION'
                      ? 'bg-sky-100 text-sky-800'
                      : 'bg-rose-100 text-rose-800'
                  ]"
                >
                  {{ emp.employmentStatus }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="openEditModal(emp)"
                  class="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition"
                  title="Edit Data"
                >
                  ✏️
                </button>
                <button
                  @click="confirmDelete(emp)"
                  class="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                  title="Hapus / Resign"
                >
                  🗑️
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Component -->
      <Pagination
        v-if="employeeStore.totalPages > 1"
        :page="employeeStore.page"
        :total-pages="employeeStore.totalPages"
        :total="employeeStore.total"
        @page-change="handlePageChange"
      />
    </div>

    <!-- Create/Edit Modal Component -->
    <EmployeeForm
      :is-open="isModalOpen"
      :edit-data="selectedEmployeeForEdit"
      @close="isModalOpen = false"
      @submitted="handleFormSubmitted"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100">
        <h3 class="text-lg font-bold text-slate-900">Konfirmasi Resign / Hapus</h3>
        <p class="mt-2 text-sm text-slate-600">
          Apakah Anda yakin ingin menonaktifkan karyawan <strong class="text-slate-900">{{ employeeToDelete?.name }}</strong>? Status karyawan akan diubah menjadi <strong>RESIGNED</strong>.
        </p>
        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="isDeleteModalOpen = false"
            class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            @click="executeDelete"
            class="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-rose-700"
          >
            Ya, Menonaktifkan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
