<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { payrollApi } from '@/api/payroll';

const router = useRouter();

const batches = ref<any[]>([]);
const loading = ref(false);

// Generate Modal State
const isGenerateModalOpen = ref(false);
const isGenerating = ref(false);
const selectedMonth = ref(new Date().getMonth() + 1);
const selectedYear = ref(new Date().getFullYear());

const months = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const years = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
});

const totalDisbursedNet = computed(() => {
  return batches.value.reduce((acc, b) => acc + (parseFloat(b.totalNet) || 0), 0);
});

const fetchBatches = async () => {
  loading.value = true;
  try {
    const res = await payrollApi.getBatches();
    batches.value = res.data.data ?? res.data ?? [];
  } catch (err) {
    console.error('Failed to load payroll batches', err);
    batches.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchBatches();
});

const openGenerateModal = () => {
  isGenerateModalOpen.value = true;
};

const generatePayroll = async () => {
  isGenerating.value = true;
  try {
    const res = await payrollApi.generateBatch({
      periodMonth: selectedMonth.value,
      periodYear: selectedYear.value,
    });

    const data = res.data.data ?? res.data;
    
    if (data.success) {
      alert(`Payroll berhasil di-generate! Batch ID: ${data.batchId}`);
      isGenerateModalOpen.value = false;
      await fetchBatches();
    } else {
      alert(data.message || 'Gagal generate payroll');
    }
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal generate payroll batch');
  } finally {
    isGenerating.value = false;
  }
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'PROCESSING':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'APPROVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'PAID':
      return 'bg-primary-50 text-primary-800 border-primary-200';
    case 'CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

const viewBatchDetail = (batchId: string) => {
  router.push(`/payroll/batch/${batchId}`);
};

const approveBatch = async (batchId: string) => {
  if (!confirm('Apakah Anda yakin ingin menyetujui batch payroll ini?')) return;
  
  try {
    await payrollApi.approveBatch(batchId, { approvedBy: 'admin' });
    alert('Batch berhasil disetujui!');
    await fetchBatches();
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal menyetujui batch');
  }
};

const markAsPaid = async (batchId: string) => {
  if (!confirm('Tandai batch ini sebagai sudah dibayar?')) return;
  
  try {
    await payrollApi.markAsPaid(batchId);
    alert('Batch ditandai sebagai PAID!');
    await fetchBatches();
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal menandai batch sebagai paid');
  }
};
</script>

<template>
  <div class="p-6 md:p-8 space-y-6">
    <!-- Header Title & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
          Manajemen Penggajian & Payroll
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Kalkulasi penggajian bulanan, kompensasi karyawan, distribusi slip gaji, dan persetujuan batch.
        </p>
      </div>
      <button
        @click="openGenerateModal"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-900 to-primary-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-950/20 hover:from-primary-800 hover:to-primary-700 transition-all duration-200 active:scale-95 group"
      >
        <svg class="w-4 h-4 text-accent-400 group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>Generate Payroll Batch</span>
      </button>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-2">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Payroll Batches</div>
        <div class="text-3xl font-extrabold font-mono text-slate-900">{{ batches.length }}</div>
        <div class="text-xs text-slate-400">Batch periode gaji yang pernah diproses.</div>
      </div>

      <div class="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-2">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Disbursed (Net)</div>
        <div class="text-2xl font-extrabold font-mono text-primary-900 truncate">
          {{ formatCurrency(totalDisbursedNet) }}
        </div>
        <div class="text-xs text-slate-400">Akumulasi pengeluaran bersih gaji.</div>
      </div>

      <div class="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-2">
        <div class="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Batch Terbaru</div>
        <div class="text-xl font-bold text-emerald-700">
          {{ batches.length > 0 ? batches[0].status : 'Belum Ada' }}
        </div>
        <div class="text-xs text-slate-400">Periode: {{ batches.length > 0 ? months.find(m => m.value === batches[0].periodMonth)?.label + ' ' + batches[0].periodYear : '-' }}</div>
      </div>
    </div>

    <!-- Payroll Batches Table -->
    <div class="overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-200/80">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/90 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Periode</th>
              <th class="px-6 py-4">Total Gross</th>
              <th class="px-6 py-4">Total Net Gaji</th>
              <th class="px-6 py-4">Status Batch</th>
              <th class="px-6 py-4">Tanggal Dibuat</th>
              <th class="px-6 py-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                <div class="inline-flex items-center gap-2">
                  <svg class="w-5 h-5 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Memuat daftar batch penggajian...</span>
                </div>
              </td>
            </tr>
            <tr v-else-if="batches.length === 0">
              <td colspan="6" class="px-6 py-12 text-center text-slate-400">
                Belum ada batch payroll. Klik "Generate Payroll Batch" untuk membuat periode baru.
              </td>
            </tr>
            <tr v-else v-for="batch in batches" :key="batch.id" class="hover:bg-slate-50/90 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-900">
                {{ months.find(m => m.value === batch.periodMonth)?.label }} {{ batch.periodYear }}
              </td>
              <td class="px-6 py-4 font-mono font-semibold text-slate-700">
                {{ formatCurrency(batch.totalGross || 0) }}
              </td>
              <td class="px-6 py-4 font-mono font-bold text-primary-900">
                {{ formatCurrency(batch.totalNet || 0) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border', getStatusBadgeClass(batch.status)]"
                >
                  {{ batch.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-500 font-mono text-xs">
                {{ new Date(batch.createdAt).toLocaleDateString('id-ID') }}
              </td>
              <td class="px-6 py-4 text-right space-x-1">
                <button
                  @click="viewBatchDetail(batch.id)"
                  class="rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-800 hover:bg-primary-50 transition-colors"
                  title="Lihat Detail Batch"
                >
                  Detail
                </button>
                <button
                  v-if="batch.status === 'DRAFT'"
                  @click="approveBatch(batch.id)"
                  class="rounded-lg px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Setujui Batch"
                >
                  Approve
                </button>
                <button
                  v-if="batch.status === 'APPROVED'"
                  @click="markAsPaid(batch.id)"
                  class="rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Tandai Sudah Dibayar"
                >
                  Mark Paid
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Generate Payroll Modal -->
    <div
      v-if="isGenerateModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900 font-heading">Generate Payroll Batch Baru</h3>
          <button @click="isGenerateModalOpen = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <form @submit.prevent="generatePayroll" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Bulan Periode Gaji *</label>
            <select
              v-model="selectedMonth"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white"
            >
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Tahun Periode Gaji *</label>
            <select
              v-model="selectedYear"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white"
            >
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="rounded-xl bg-primary-50 p-3 text-xs text-primary-900 border border-primary-200/60">
            <strong>Catatan System:</strong> Kalkulasi otomatis akan menarik data rekapitulasi presensi, gaji pokok, tunjangan, dan potongan BPJS per karyawan.
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="isGenerateModalOpen = false"
              class="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isGenerating"
              class="rounded-xl bg-primary-900 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-primary-800 transition-colors disabled:opacity-50"
            >
              {{ isGenerating ? 'Proses...' : 'Generate Batch' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
