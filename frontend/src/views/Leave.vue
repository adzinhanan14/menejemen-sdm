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
        <h1 class="text-2xl font-bold text-slate-800">Manajemen Izin & Cuti</h1>
        <p class="text-sm text-slate-500 mt-1">Ajukan permohonan cuti tahunan, sakit, atau izin dan kelola persetujuan tim.</p>
      </div>
      <button
        @click="openModal"
        class="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 active:scale-95"
      >
        <span class="text-base font-bold">+</span> Ajukan Cuti
      </button>
    </div>

    <!-- Quota KPI Summary Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Kuota Cuti</p>
          <h3 class="text-2xl font-bold text-slate-800 mt-1">{{ quota.total || 12 }} Hari</h3>
        </div>
        <span class="text-3xl p-3 bg-indigo-50 rounded-2xl text-indigo-600">🏖️</span>
      </div>

      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Cuti Terpakai</p>
          <h3 class="text-2xl font-bold text-amber-600 mt-1">{{ quota.used || 0 }} Hari</h3>
        </div>
        <span class="text-3xl p-3 bg-amber-50 rounded-2xl text-amber-600">⌛</span>
      </div>

      <div class="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-slate-400">Sisa Kuota Cuti</p>
          <h3 class="text-2xl font-bold text-emerald-600 mt-1">{{ quota.remaining ?? 12 }} Hari</h3>
        </div>
        <span class="text-3xl p-3 bg-emerald-50 rounded-2xl text-emerald-600">✅</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-slate-200 gap-6 text-sm font-semibold">
      <button
        @click="activeTab = 'my'"
        :class="[
          'pb-3 transition border-b-2',
          activeTab === 'my'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        ]"
      >
        📄 Pengajuan Saya
      </button>
      <button
        @click="activeTab = 'approvals'"
        :class="[
          'pb-3 transition border-b-2 flex items-center gap-2',
          activeTab === 'approvals'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        ]"
      >
        <span>📑 Persetujuan Cuti</span>
        <span
          v-if="approvalApplications.length > 0"
          class="rounded-full bg-rose-500 px-2 py-0.5 text-xs text-white"
        >
          {{ approvalApplications.length }}
        </span>
      </button>
    </div>

    <!-- TAB 1: My Applications -->
    <div v-if="activeTab === 'my'" class="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Tipe Cuti</th>
              <th class="px-6 py-4">Tanggal Mula - Selesai</th>
              <th class="px-6 py-4">Durasi</th>
              <th class="px-6 py-4">Alasan</th>
              <th class="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="loading" class="animate-pulse">
              <td colspan="5" class="px-6 py-8 text-center text-slate-400">Memuat data pengajuan...</td>
            </tr>
            <tr v-else-if="applications.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-400">Belum ada permohonan cuti.</td>
            </tr>
            <tr v-else v-for="app in applications" :key="app.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4 font-semibold text-slate-800">
                {{ app.leaveType?.name || 'Cuti Tahunan' }}
              </td>
              <td class="px-6 py-4 text-slate-600">
                {{ app.startDate }} s/d {{ app.endDate }}
              </td>
              <td class="px-6 py-4 font-medium text-slate-900">
                {{ app.totalDays }} Hari
              </td>
              <td class="px-6 py-4 text-slate-500 max-w-xs truncate">
                {{ app.reason }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    app.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : app.status === 'PENDING'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
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

    <!-- TAB 2: Approvals Workflow -->
    <div v-if="activeTab === 'approvals'" class="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-600">
          <thead class="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="px-6 py-4">Pemohon</th>
              <th class="px-6 py-4">Tipe Cuti</th>
              <th class="px-6 py-4">Tanggal</th>
              <th class="px-6 py-4">Alasan</th>
              <th class="px-6 py-4 text-right">Keputusan Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="approvalApplications.length === 0">
              <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                Tidak ada permohonan cuti yang membutuhkan persetujuan saat ini.
              </td>
            </tr>
            <tr v-else v-for="app in approvalApplications" :key="app.id" class="hover:bg-slate-50/80 transition-colors">
              <td class="px-6 py-4 font-semibold text-slate-800">
                {{ app.employee?.name || 'Karyawan' }}
              </td>
              <td class="px-6 py-4 text-indigo-600 font-medium">
                {{ app.leaveType?.name || 'Cuti Tahunan' }}
              </td>
              <td class="px-6 py-4 text-slate-600">
                {{ app.startDate }} - {{ app.endDate }} ({{ app.totalDays }} Hari)
              </td>
              <td class="px-6 py-4 text-slate-500">
                {{ app.reason }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button
                  @click="handleProcessWorkflow(app.id, 'APPROVED')"
                  class="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  Setujui
                </button>
                <button
                  @click="handleProcessWorkflow(app.id, 'REJECTED')"
                  class="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700"
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-slate-800">Form Permohonan Cuti</h3>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <form @submit.prevent="submitApplication" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Tipe Cuti *</label>
            <select
              v-model="form.leaveTypeId"
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
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
                class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal Selesai *</label>
              <input
                v-model="form.endDate"
                type="date"
                class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div v-if="computedTotalDays > 0" class="rounded-xl bg-indigo-50 p-3 text-xs font-semibold text-indigo-700">
            Est. Total Durasi Cuti: {{ computedTotalDays }} Hari Kerja
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Alasan Pengajuan Cuti *</label>
            <textarea
              v-model="form.reason"
              rows="3"
              placeholder="Berikan penjelasan keperluan cuti Anda..."
              class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button
              type="button"
              @click="isModalOpen = false"
              class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {{ isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
