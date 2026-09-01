<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { payrollApi } from '@/api/payroll';
import PayslipModal from '@/components/PayslipModal.vue';

const route = useRoute();
const router = useRouter();

const batch = ref<any>(null);
const loading = ref(true);

// Payslip Modal State
const isPayslipModalOpen = ref(false);
const selectedDetail = ref<any>(null);

const fetchBatchDetail = async () => {
  loading.value = true;
  try {
    const batchId = route.params.id as string;
    const res = await payrollApi.getBatchDetail(batchId);
    batch.value = res.data.data ?? res.data;
  } catch (err) {
    console.error('Failed to load batch detail', err);
    alert('Gagal memuat detail batch');
    router.push('/payroll');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBatchDetail();
});

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-amber-100 text-amber-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800';
    case 'PAID':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const openPayslipModal = (detail: any) => {
  selectedDetail.value = detail;
  isPayslipModalOpen.value = true;
};
</script>

<template>
  <div class="p-6 md:p-8 space-y-6">
    <!-- Back Button + Header -->
    <div class="flex items-center gap-4">
      <button
        @click="router.push('/payroll')"
        class="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        ← Back
      </button>
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Detail Batch Payroll</h1>
        <p class="text-sm text-slate-500 mt-1" v-if="batch">
          {{ months[batch.periodMonth - 1] }} {{ batch.periodYear }}
        </p>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center text-slate-400 animate-pulse">
      Memuat detail batch...
    </div>

    <div v-else-if="batch" class="space-y-6">
      <!-- Batch Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Batch</p>
          <span
            :class="['mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold', getStatusBadgeClass(batch.status)]"
          >
            {{ batch.status }}
          </span>
        </div>

        <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Karyawan</p>
          <h3 class="text-2xl font-bold text-slate-900 mt-2">
            {{ batch.details?.length || 0 }}
          </h3>
        </div>

        <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Gross</p>
          <h3 class="text-xl font-bold text-emerald-600 mt-2">
            {{ formatCurrency(batch.totalGross || 0) }}
          </h3>
        </div>

        <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Net</p>
          <h3 class="text-xl font-bold text-indigo-600 mt-2">
            {{ formatCurrency(batch.totalNet || 0) }}
          </h3>
        </div>
      </div>

      <!-- Employee Details Table -->
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
        <div class="px-6 py-4 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-800">Daftar Karyawan & Slip Gaji</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">NIK</th>
                <th class="px-6 py-4">Nama Karyawan</th>
                <th class="px-6 py-4">Departemen</th>
                <th class="px-6 py-4">Kehadiran</th>
                <th class="px-6 py-4">Gross</th>
                <th class="px-6 py-4">Net</th>
                <th class="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="!batch.details || batch.details.length === 0">
                <td colspan="7" class="px-6 py-8 text-center text-slate-400">
                  Tidak ada data karyawan di batch ini.
                </td>
              </tr>
              <tr v-else v-for="detail in batch.details" :key="detail.id" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-6 py-4 font-mono text-xs text-slate-600">
                  {{ detail.employee?.nik || '-' }}
                </td>
                <td class="px-6 py-4 font-semibold text-slate-800">
                  {{ detail.employee?.fullName || 'Karyawan' }}
                </td>
                <td class="px-6 py-4 text-slate-600 text-xs">
                  {{ detail.employee?.currentDepartment?.name || '-' }}
                </td>
                <td class="px-6 py-4 text-xs">
                  <span class="text-emerald-600 font-medium">{{ detail.attendanceDays }}</span> /
                  <span class="text-slate-400">{{ detail.workDays }} hari</span>
                </td>
                <td class="px-6 py-4 text-emerald-600 font-medium">
                  {{ formatCurrency(detail.grossSalary || 0) }}
                </td>
                <td class="px-6 py-4 text-indigo-600 font-bold">
                  {{ formatCurrency(detail.netSalary || 0) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    @click="openPayslipModal(detail)"
                    class="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                  >
                    View Slip
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Payslip Modal -->
    <PayslipModal
      v-if="isPayslipModalOpen && selectedDetail"
      :is-open="isPayslipModalOpen"
      :detail="selectedDetail"
      :batch="batch"
      @close="isPayslipModalOpen = false"
    />
  </div>
</template>
