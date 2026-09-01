<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  detail: any;
  batch: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const formatCurrency = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);
};

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const periodLabel = computed(() => {
  if (!props.batch) return '';
  return `${months[props.batch.periodMonth - 1]} ${props.batch.periodYear}`;
});

const additions = computed(() => {
  return props.detail?.breakdowns?.filter((b: any) => b.componentType === 'ADDITION') || [];
});

const deductions = computed(() => {
  return props.detail?.breakdowns?.filter((b: any) => b.componentType === 'DEDUCTION') || [];
});

const downloadPDF = () => {
  alert('Fitur Download PDF akan segera tersedia!');
  // TODO: Implement PDF generation endpoint
  // window.open(`/api/v1/payroll/payslips/${props.detail.id}/pdf`, '_blank');
};

const sendEmail = () => {
  alert('Email slip gaji akan segera dikirim ke karyawan!');
  // TODO: Implement email sending endpoint
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-100">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <h3 class="text-lg font-bold text-slate-800">Slip Gaji Karyawan</h3>
        <button @click="emit('close')" class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          ✕
        </button>
      </div>

      <!-- Payslip Content -->
      <div class="p-6 space-y-6" id="payslip-content">
        <!-- Company Header -->
        <div class="text-center border-b border-slate-200 pb-6">
          <h2 class="text-2xl font-extrabold text-indigo-600">PT Contoh Sejahtera</h2>
          <p class="text-xs text-slate-500 mt-1">Jl. Sudirman No. 123, Jakarta Pusat</p>
          <p class="text-xs text-slate-500">Telp: (021) 1234-5678 | Email: hr@contoh.com</p>
          <div class="mt-4">
            <h3 class="text-lg font-bold text-slate-800">SLIP GAJI</h3>
            <p class="text-sm text-slate-600">Periode: {{ periodLabel }}</p>
          </div>
        </div>

        <!-- Employee Info -->
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-semibold text-slate-700">NIK:</span>
              <span class="text-slate-900">{{ detail.employee?.nik || '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-semibold text-slate-700">Nama:</span>
              <span class="text-slate-900">{{ detail.employee?.fullName || '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-semibold text-slate-700">Departemen:</span>
              <span class="text-slate-900">{{ detail.employee?.currentDepartment?.name || '-' }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-semibold text-slate-700">Jabatan:</span>
              <span class="text-slate-900">{{ detail.employee?.currentPosition?.name || '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-semibold text-slate-700">Bank:</span>
              <span class="text-slate-900">{{ detail.employee?.bankName || '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="font-semibold text-slate-700">No. Rekening:</span>
              <span class="text-slate-900">{{ detail.employee?.bankAccountNumber || '-' }}</span>
            </div>
          </div>
        </div>

        <!-- Attendance Info -->
        <div class="rounded-xl bg-slate-50 p-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex justify-between">
              <span class="font-semibold text-slate-700">Hari Kerja:</span>
              <span class="text-slate-900">{{ detail.workDays }} hari</span>
            </div>
            <div class="flex justify-between">
              <span class="font-semibold text-slate-700">Kehadiran:</span>
              <span class="text-emerald-600 font-bold">{{ detail.attendanceDays }} hari</span>
            </div>
          </div>
        </div>

        <!-- Salary Breakdown -->
        <div class="space-y-4">
          <!-- Base Salary -->
          <div class="flex justify-between text-sm border-b border-slate-200 pb-2">
            <span class="font-semibold text-slate-700">Gaji Pokok</span>
            <span class="font-bold text-slate-900">{{ formatCurrency(detail.baseSalary || 0) }}</span>
          </div>

          <!-- Additions (Tunjangan) -->
          <div v-if="additions.length > 0">
            <p class="text-xs font-bold text-emerald-700 mb-2 uppercase">Tunjangan (+)</p>
            <div v-for="item in additions" :key="item.id" class="flex justify-between text-sm mb-1">
              <span class="text-slate-600">{{ item.componentName }}</span>
              <span class="text-emerald-600">{{ formatCurrency(item.amount || 0) }}</span>
            </div>
          </div>

          <!-- Gross Salary -->
          <div class="flex justify-between text-sm font-semibold bg-emerald-50 px-3 py-2 rounded-lg">
            <span class="text-emerald-700">Total Penghasilan Kotor (Gross)</span>
            <span class="text-emerald-700">{{ formatCurrency(detail.grossSalary || 0) }}</span>
          </div>

          <!-- Deductions (Potongan) -->
          <div v-if="deductions.length > 0">
            <p class="text-xs font-bold text-rose-700 mb-2 uppercase">Potongan (-)</p>
            <div v-for="item in deductions" :key="item.id" class="flex justify-between text-sm mb-1">
              <span class="text-slate-600">{{ item.componentName }}</span>
              <span class="text-rose-600">-{{ formatCurrency(item.amount || 0) }}</span>
            </div>
          </div>

          <!-- Net Salary -->
          <div class="flex justify-between text-base font-bold bg-indigo-600 text-white px-4 py-3 rounded-xl">
            <span>Total Gaji Bersih (Take Home Pay)</span>
            <span>{{ formatCurrency(detail.netSalary || 0) }}</span>
          </div>
        </div>

        <!-- Footer Note -->
        <div class="text-center text-xs text-slate-500 pt-4 border-t border-slate-200">
          <p>Slip gaji ini dibuat secara elektronik dan sah tanpa tanda tangan.</p>
          <p class="mt-1">Dicetak pada: {{ new Date().toLocaleString('id-ID') }}</p>
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
        <button
          @click="downloadPDF"
          class="rounded-xl border border-indigo-600 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 transition"
        >
          📄 Download PDF
        </button>
        <button
          @click="sendEmail"
          class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
        >
          📧 Send Email
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .modal-actions {
    display: none;
  }
}
</style>
