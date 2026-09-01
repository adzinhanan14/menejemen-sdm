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
      return 'bg-amber-100 text-amber-800';
    case 'PROCESSING':
      return 'bg-blue-100 text-blue-800';
    case 'APPROVED':
      return 'bg-emerald-100 text-emerald-800';
    case 'PAID':
      return 'bg-slate-100 text-slate-600';
    case 'CANCELLED':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-slate-100 text-slate-600';
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
        <h1 class="text-2xl font-bold text-slate-800">Manajemen Penggajian</h1>
        <p class="text-sm text-slate-500 mt-1">Generate payroll bulanan, review batch, dan distribute slip gaji karyawan.</p>
      </div>
      <button
        @click="openGenerateModal"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
      >
        <span class="text-base font-bold">⚙️</span> Generate Payroll
      </button>
    </div>

    <!-- Payroll Batches Table -->
    <div class="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Periode</th>
              <th class="px-6 py-4">Total Gross</th>
              <th class="px-6 py-4">Total Net</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4">Tanggal Dibuat</th>
              <th class="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                Memuat data payroll batches...
              </td>
            </tr>
            <tr v-else-if="batches.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                Belum ada batch payroll. Klik "Generate Payroll" untuk membuat batch baru.
              </td>
            </tr>
            <tr v-else v-for="batch in batches" :key="batch.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4 font-semibold text-slate-800">
                {{ months.find(m => m.value === batch.periodMonth)?.label }} {{ batch.periodYear }}
              </td>
              <td class="px-6 py-4 text-emerald-600 font-medium">
                {{ formatCurrency(batch.totalGross || 0) }}
              </td>
              <td class="px-6 py-4 text-indigo-600 font-bold">
                {{ formatCurrency(batch.totalNet || 0) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', getStatusBadgeClass(batch.status)]"
                >
                  {{ batch.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-500 text-xs">
                {{ new Date(batch.createdAt).toLocaleDateString('id-ID') }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="viewBatchDetail(batch.id)"
                  class="rounded-lg px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
                  title="View Details"
                >
                  View
                </button>
                <button
                  v-if="batch.status === 'DRAFT'"
                  @click="approveBatch(batch.id)"
                  class="rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition"
                  title="Approve"
                >
                  Approve
                </button>
                <button
                  v-if="batch.status === 'APPROVED'"
                  @click="markAsPaid(batch.id)"
                  class="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                  title="Mark as Paid"
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-slate-800">Generate Payroll Batch</h3>
          <button @click="isGenerateModalOpen = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form @submit.prevent="generatePayroll" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Bulan Periode *</label>
            <select
              v-model="selectedMonth"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option v-for="month in months" :key="month.value" :value="month.value">
                {{ month.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Tahun Periode *</label>
            <select
              v-model="selectedYear"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
            >
              <option v-for="year in years" :key="year" :value="year">
                {{ year }}
              </option>
            </select>
          </div>

          <div class="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-700">
            <strong>Info:</strong> Proses generate akan menghitung gaji berdasarkan kehadiran, komponen gaji, dan kontrak aktif di periode yang dipilih.
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="isGenerateModalOpen = false"
              class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isGenerating"
              class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ isGenerating ? 'Generating...' : 'Generate Batch' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
