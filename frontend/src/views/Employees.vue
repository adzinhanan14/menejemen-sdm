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
const debouncedSearch = refDebounced(searchInput, 400);

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

// Avatar color generator based on name hash
const getAvatarBg = (name: string = '', email: string = '') => {
  const str = name || email || 'User';
  const colors = [
    'bg-primary-100 text-primary-800 border-primary-300',
    'bg-amber-100 text-amber-900 border-amber-300',
    'bg-emerald-100 text-emerald-900 border-emerald-300',
    'bg-purple-100 text-purple-900 border-purple-300',
    'bg-rose-100 text-rose-900 border-rose-300',
    'bg-sky-100 text-sky-900 border-sky-300',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string = '', email: string = '') => {
  const str = name || email.split('@')[0] || 'US';
  return str
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};
</script>

<template>
  <div class="p-6 md:p-8 space-y-6">
    <!-- Top Header & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
          Manajemen Data Karyawan
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Kelola direktori SDM, profil karyawan, struktur departemen, dan status kontrak kerja.
        </p>
      </div>
      <button
        @click="openCreateModal"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-900 to-primary-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-950/20 hover:from-primary-800 hover:to-primary-700 transition-all duration-200 active:scale-95 group"
      >
        <svg class="w-4 h-4 text-accent-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Tambah Karyawan</span>
      </button>
    </div>

    <!-- Quick Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center font-bold text-lg">
          👥
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total SDM</div>
          <div class="text-xl font-bold font-mono text-slate-900">{{ employeeStore.total || 0 }}</div>
        </div>
      </div>
      <div class="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg">
          💼
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Tetap</div>
          <div class="text-xl font-bold font-mono text-emerald-700">
            {{ employeeStore.employees.filter(e => e.employmentStatus === 'PERMANENT').length }}
          </div>
        </div>
      </div>
      <div class="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg">
          📜
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kontrak</div>
          <div class="text-xl font-bold font-mono text-amber-700">
            {{ employeeStore.employees.filter(e => e.employmentStatus === 'CONTRACT').length }}
          </div>
        </div>
      </div>
      <div class="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg">
          🌱
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Probation</div>
          <div class="text-xl font-bold font-mono text-sky-700">
            {{ employeeStore.employees.filter(e => e.employmentStatus === 'PROBATION').length }}
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & Search Toolbar -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl bg-white p-4 shadow-xs border border-slate-200/80">
      <!-- Search Input -->
      <div class="relative">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="searchInput"
          type="text"
          placeholder="Cari Nama, NIK, atau Email..."
          class="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-colors"
        />
      </div>

      <!-- Department Filter -->
      <div>
        <select
          v-model="selectedDepartment"
          class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white transition-colors"
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
          class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white transition-colors"
        >
          <option value="">Semua Status Kerja</option>
          <option value="PERMANENT">Tetap (Permanent)</option>
          <option value="CONTRACT">Kontrak (Contract)</option>
          <option value="PROBATION">Probation</option>
          <option value="RESIGNED">Resigned</option>
        </select>
      </div>
    </div>

    <!-- Data Table Container -->
    <div class="overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-200/80">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/90 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Karyawan</th>
              <th class="px-6 py-4">NIK</th>
              <th class="px-6 py-4">Departemen</th>
              <th class="px-6 py-4">Jabatan</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="employeeStore.loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                <div class="inline-flex items-center gap-2">
                  <svg class="w-5 h-5 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Memuat data karyawan...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="employeeStore.employees.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                <div class="max-w-xs mx-auto text-center space-y-2">
                  <span class="text-3xl">📭</span>
                  <p class="font-medium text-slate-600">Tidak ada data karyawan ditemukan</p>
                  <p class="text-xs text-slate-400">Coba ubah filter pencarian atau kata kunci NIK/nama.</p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="emp in employeeStore.employees"
              :key="emp.id"
              class="hover:bg-slate-50/90 transition-colors group"
            >
              <!-- Name & Avatar -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border shadow-xs transition-transform group-hover:scale-105',
                      getAvatarBg(emp.name, emp.email)
                    ]"
                  >
                    {{ getInitials(emp.name, emp.email) }}
                  </div>
                  <div>
                    <div class="font-bold text-slate-900 group-hover:text-primary-800 transition-colors">
                      {{ emp.name || emp.email?.split('@')[0] || 'Karyawan' }}
                    </div>
                    <div class="text-xs text-slate-400 font-mono">{{ emp.email }}</div>
                  </div>
                </div>
              </td>

              <!-- NIK -->
              <td class="px-6 py-4 font-mono font-semibold text-xs text-slate-700">
                <span class="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                  {{ emp.nik }}
                </span>
              </td>

              <!-- Department -->
              <td class="px-6 py-4">
                <span class="inline-flex items-center rounded-lg bg-primary-50/80 px-2.5 py-1 text-xs font-semibold text-primary-800 border border-primary-200/50">
                  {{ emp.department?.name || '-' }}
                </span>
              </td>

              <!-- Position -->
              <td class="px-6 py-4 text-slate-700 font-medium text-xs">
                {{ emp.position?.title || '-' }}
              </td>

              <!-- Status -->
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold tracking-wide border',
                    emp.employmentStatus === 'PERMANENT'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : emp.employmentStatus === 'CONTRACT'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : emp.employmentStatus === 'PROBATION'
                      ? 'bg-sky-50 text-sky-700 border-sky-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  ]"
                >
                  <span
                    :class="[
                      'w-1.5 h-1.5 rounded-full mr-1.5',
                      emp.employmentStatus === 'PERMANENT'
                        ? 'bg-emerald-500'
                        : emp.employmentStatus === 'CONTRACT'
                        ? 'bg-amber-500'
                        : emp.employmentStatus === 'PROBATION'
                        ? 'bg-sky-500'
                        : 'bg-rose-500'
                    ]"
                  ></span>
                  {{ emp.employmentStatus }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-6 py-4 text-right space-x-1">
                <button
                  @click="openEditModal(emp)"
                  class="rounded-lg p-2 text-slate-400 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                  title="Edit Data"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  @click="confirmDelete(emp)"
                  class="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Menonaktifkan / Resign"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto">
          ⚠️
        </div>
        <div class="text-center">
          <h3 class="text-lg font-bold text-slate-900">Konfirmasi Resign / Nonaktif</h3>
          <p class="mt-2 text-xs text-slate-600">
            Apakah Anda yakin ingin menonaktifkan karyawan <strong class="text-slate-900">{{ employeeToDelete?.name }}</strong>? Status karyawan akan diubah menjadi <strong>RESIGNED</strong>.
          </p>
        </div>
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="isDeleteModalOpen = false"
            class="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            @click="executeDelete"
            class="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-rose-700 transition-colors"
          >
            Ya, Menonaktifkan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
