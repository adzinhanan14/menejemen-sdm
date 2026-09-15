<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { leaveApi } from '@/api/leave';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();

const activeTab = ref<'my' | 'approvals'>('my');

const quota = ref<{ total: number; used: number; remaining: number }>({
  total: 12,
  used: 0,
  remaining: 12,
});

const applications = ref<any[]>([]);
const approvalApplications = ref<any[]>([]);
const leaveTypes = ref<any[]>([]);
const loading = ref(false);

// Modal state
const isModalOpen = ref(false);
const form = ref({
  leaveTypeId: '',
  startDate: '',
  endDate: '',
  reason: '',
});
const isSubmitting = ref(false);

const computedTotalDays = computed(() => {
  if (!form.value.startDate || !form.value.endDate) return 0;
  const start = new Date(form.value.startDate);
  const end = new Date(form.value.endDate);
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
});

const usedPercentage = computed(() => {
  const total = quota.value.total || 12;
  const used = quota.value.used || 0;
  return Math.min(100, Math.round((used / total) * 100));
});

const fetchTypes = async () => {
  try {
    const res = await leaveApi.getLeaveTypes();
    leaveTypes.value = res.data.data ?? res.data;
  } catch (err) {
    console.error('Failed to load leave types', err);
  }
};

const fetchQuota = async () => {
  const empId = authStore.user?.employeeId || authStore.user?.id || 'emp-demo';
  try {
    const res = await leaveApi.getQuota(empId);
    quota.value = res.data.data ?? res.data;
  } catch (err) {
    console.error('Failed to load quota', err);
  }
};

const fetchApplications = async () => {
  loading.value = true;
  try {
    const res = await leaveApi.getAll();
    const data = res.data.data ?? res.data;
    applications.value = Array.isArray(data) ? data : [];
    approvalApplications.value = applications.value.filter((item: any) => item.status === 'PENDING');
  } catch (err) {
    console.error('Failed to load applications', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchTypes();
  fetchQuota();
  fetchApplications();
});

const openModal = () => {
  form.value = { leaveTypeId: leaveTypes.value[0]?.id || '', startDate: '', endDate: '', reason: '' };
  isModalOpen.value = true;
};

const submitApplication = async () => {
  if (!form.value.startDate || !form.value.endDate || !form.value.reason) {
    alert('Harap isi seluruh field bertanda *');
    return;
  }

  isSubmitting.value = true;
  const empId = authStore.user?.employeeId || authStore.user?.id || 'emp-demo';

  try {
    await leaveApi.create({
      employeeId: empId,
      leaveTypeId: form.value.leaveTypeId,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
      totalDays: computedTotalDays.value,
      reason: form.value.reason,
    });
    isModalOpen.value = false;
    await fetchApplications();
    await fetchQuota();
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal mengajukan cuti');
  } finally {
    isSubmitting.value = false;
  }
};

const handleProcessWorkflow = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const notes = prompt(`Masukkan catatan pendukung untuk keputusan ${status}:`) || undefined;
  try {
    await leaveApi.processWorkflow(id, {
      status,
      notes,
      approvedBy: authStore.user?.id,
    });
    await fetchApplications();
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal memperbarui status cuti');
  }
};
</script>

<template>
  <div class="p-6 md:p-8 space-y-6">
    <!-- Header Title & Action -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
          Manajemen Izin & Cuti
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Pengajuan cuti tahunan, sakit, atau izin keperluan pribadi dan alur persetujuan beregu.
        </p>
      </div>
      <button
        @click="openModal"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-900 to-primary-800 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-950/20 hover:from-primary-800 hover:to-primary-700 transition-all duration-200 active:scale-95 group"
      >
        <svg class="w-4 h-4 text-accent-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Ajukan Cuti Baru</span>
      </button>
    </div>

    <!-- Quota Bar & KPI Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Hak Cuti</span>
          <span class="text-xl">🏖️</span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-slate-900">
          {{ quota.total || 12 }} <span class="text-sm font-sans text-slate-500 font-normal">Hari / Tahun</span>
        </div>
        <div class="text-xs text-slate-400">Kuota standar per periode tahun berjalan.</div>
      </div>

      <div class="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Cuti Terpakai</span>
          <span class="text-xl">⌛</span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-amber-600">
          {{ quota.used || 0 }} <span class="text-sm font-sans text-slate-500 font-normal">Hari</span>
        </div>
        <!-- Progress Bar -->
        <div class="space-y-1">
          <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div class="bg-amber-500 h-2 rounded-full transition-all duration-500" :style="{ width: `${usedPercentage}%` }"></div>
          </div>
          <div class="text-right text-[10px] text-slate-400 font-mono">{{ usedPercentage }}% Terpakai</div>
        </div>
      </div>

      <div class="rounded-2xl bg-white p-5 shadow-xs border border-slate-200/80 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold uppercase tracking-wider text-slate-400">Sisa Kuota Cuti</span>
          <span class="text-xl">✅</span>
        </div>
        <div class="text-3xl font-extrabold font-mono text-emerald-600">
          {{ quota.remaining ?? 12 }} <span class="text-sm font-sans text-slate-500 font-normal">Hari Tersedia</span>
        </div>
        <div class="text-xs text-slate-400">Dapat digunakan sampai akhir periode berjalan.</div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-slate-200 gap-8 text-sm font-semibold">
      <button
        @click="activeTab = 'my'"
        :class="[
          'pb-3 transition-colors border-b-2 flex items-center gap-2',
          activeTab === 'my'
            ? 'border-primary-800 text-primary-800 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        ]"
      >
        <span>📄 Riwayat Pengajuan Saya</span>
      </button>
      <button
        @click="activeTab = 'approvals'"
        :class="[
          'pb-3 transition-colors border-b-2 flex items-center gap-2',
          activeTab === 'approvals'
            ? 'border-primary-800 text-primary-800 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        ]"
      >
        <span>📑 Persetujuan Cuti Tim</span>
        <span
          v-if="approvalApplications.length > 0"
          class="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white font-mono"
        >
          {{ approvalApplications.length }}
        </span>
      </button>
    </div>

    <!-- TAB 1: My Applications Table -->
    <div v-if="activeTab === 'my'" class="overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-200/80">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/90 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Jenis Cuti</th>
              <th class="px-6 py-4">Periode Tanggal</th>
              <th class="px-6 py-4">Total Durasi</th>
              <th class="px-6 py-4">Alasan Pengajuan</th>
              <th class="px-6 py-4">Status Approvals</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                Memuat riwayat pengajuan cuti...
              </td>
            </tr>
            <tr v-else-if="applications.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                Belum ada pengajuan cuti tercatat.
              </td>
            </tr>
            <tr v-else v-for="app in applications" :key="app.id" class="hover:bg-slate-50/90 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-900">
                {{ app.leaveType?.name || 'Cuti Tahunan' }}
              </td>
              <td class="px-6 py-4 text-xs font-mono text-slate-600">
                {{ app.startDate }} s/d {{ app.endDate }}
              </td>
              <td class="px-6 py-4 font-mono font-bold text-slate-900">
                {{ app.totalDays }} Hari
              </td>
              <td class="px-6 py-4 text-slate-500 max-w-xs truncate text-xs">
                {{ app.reason }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border',
                    app.status === 'APPROVED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : app.status === 'PENDING'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  ]"
                >
                  {{ app.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- TAB 2: Approvals Table -->
    <div v-if="activeTab === 'approvals'" class="overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-200/80">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/90 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Pemohon</th>
              <th class="px-6 py-4">Jenis Cuti</th>
              <th class="px-6 py-4">Periode</th>
              <th class="px-6 py-4">Alasan</th>
              <th class="px-6 py-4 text-right">Aksi Keputusan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="approvalApplications.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                Tidak ada permohonan cuti baru yang memerlukan tindakan persetujuan.
              </td>
            </tr>
            <tr v-else v-for="app in approvalApplications" :key="app.id" class="hover:bg-slate-50/90 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-900">
                {{ app.employee?.name || 'Karyawan' }}
              </td>
              <td class="px-6 py-4 text-primary-800 font-semibold text-xs">
                {{ app.leaveType?.name || 'Cuti Tahunan' }}
              </td>
              <td class="px-6 py-4 text-xs font-mono text-slate-600">
                {{ app.startDate }} - {{ app.endDate }} ({{ app.totalDays }} Hari)
              </td>
              <td class="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                {{ app.reason }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="handleProcessWorkflow(app.id, 'APPROVED')"
                  class="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  Setujui
                </button>
                <button
                  @click="handleProcessWorkflow(app.id, 'REJECTED')"
                  class="rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
                >
                  Tolak
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Apply Leave Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900 font-heading">Form Permohonan Cuti Baru</h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <form @submit.prevent="submitApplication" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Pilih Tipe Cuti *</label>
            <select
              v-model="form.leaveTypeId"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100 bg-white"
            >
              <option v-for="t in leaveTypes" :key="t.id" :value="t.id">
                {{ t.name }} (Kuota: {{ t.quotaPerYear }} Hari/Tahun)
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal Mulai *</label>
              <input
                v-model="form.startDate"
                type="date"
                class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai *</label>
              <input
                v-model="form.endDate"
                type="date"
                class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
              />
            </div>
          </div>

          <div v-if="computedTotalDays > 0" class="rounded-xl bg-primary-50 p-3 text-xs font-bold text-primary-900 border border-primary-200/60 flex items-center justify-between">
            <span>Estimasi Durasi Cuti:</span>
            <span class="font-mono text-sm font-extrabold">{{ computedTotalDays }} Hari Kerja</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Alasan Pengajuan Cuti *</label>
            <textarea
              v-model="form.reason"
              rows="3"
              placeholder="Jelaskan alasan atau kebutuhan cuti Anda..."
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-100"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="isModalOpen = false"
              class="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded-xl bg-primary-900 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-primary-800 transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
