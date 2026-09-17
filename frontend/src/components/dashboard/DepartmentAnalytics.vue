<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { dashboardApi } from '@/api/dashboard';

const router = useRouter();
const activeTab = ref<'departments' | 'attendance' | 'agenda'>('departments');
const loading = ref(true);

interface DeptItem {
  id: string;
  name: string;
  code: string;
  count: number;
  color: string;
  managerName?: string;
}

const departments = ref<DeptItem[]>([]);
const totalHeadcount = computed(() => {
  return departments.value.reduce((sum, d) => sum + d.count, 0) || 1;
});

const defaultDepts: DeptItem[] = [
  { id: 'dept-eng', name: 'Engineering & Tech', code: 'ENG', count: 18, color: '#2B5DBF', managerName: 'Budi Santoso' },
  { id: 'dept-hr', name: 'Human Capital', code: 'HR', count: 8, color: '#C8830A', managerName: 'Siti Aminah' },
  { id: 'dept-fin', name: 'Finance & Accounting', code: 'FIN', count: 10, color: '#1A6B4A', managerName: 'Rudi Hermawan' },
  { id: 'dept-mkt', name: 'Marketing & PR', code: 'MKT', count: 12, color: '#8B1A1A', managerName: 'Dewi Lestari' },
  { id: 'dept-ops', name: 'Operations & Logistics', code: 'OPS', count: 14, color: '#1A4A6B', managerName: 'Andi Wijaya' },
];

const attendanceStats = ref({
  onTime: 34,
  late: 4,
  leave: 3,
  absent: 1,
  avgCheckInTime: '07:54 WIB',
});

const upcomingEvents = ref([
  { id: 1, title: 'Maulid Nabi Muhammad SAW', date: '28 Sep 2026', type: 'holiday', badge: 'Libur Nasional', badgeClass: 'badge-danger' },
  { id: 2, title: 'Ulang Tahun Karyawan: Siti Aminah (HR)', date: '30 Sep 2026', type: 'birthday', badge: 'Ulang Tahun', badgeClass: 'badge-warning' },
  { id: 3, title: 'Evaluasi Masa Percobaan 3 Karyawan Baru', date: '05 Okt 2026', type: 'review', badge: 'Review HR', badgeClass: 'badge-primary' },
  { id: 4, title: 'Hari Sumpah Pemuda', date: '28 Okt 2026', type: 'holiday', badge: 'Libur Nasional', badgeClass: 'badge-danger' },
]);

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await dashboardApi.getOrgChartData().catch(() => null);
    const data = res?.data?.data ?? res?.data;

    if (Array.isArray(data) && data.length > 0) {
      const colors = ['#2B5DBF', '#C8830A', '#1A6B4A', '#8B1A1A', '#1A4A6B', '#5A6478'];
      departments.value = data.map((d: any, idx: number) => ({
        id: d.id || `dept-${idx}`,
        name: d.name,
        code: d.code || d.name.slice(0, 3).toUpperCase(),
        count: d.count ?? 0,
        color: colors[idx % colors.length],
        managerName: d.managerName || 'Manager Departemen',
      }));
    } else {
      departments.value = defaultDepts;
    }
  } catch {
    departments.value = defaultDepts;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const navigateToDeptEmployees = (deptId: string) => {
  router.push({ path: '/employees', query: { departmentId: deptId } });
};

const getPercentage = (count: number) => {
  if (totalHeadcount.value === 0) return 0;
  return Math.round((count / totalHeadcount.value) * 100);
};
</script>

<template>
  <div class="card p-6 space-y-6 shadow-card-lg bg-surface-50 border border-surface-200">
    
    <!-- Top Header & Tabs -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 pb-5">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary mb-1.5">
          <span class="h-2 w-2 rounded-full bg-primary animate-pulse-soft"></span>
          Analytics SDM
        </div>
        <h2 class="text-lg font-heading font-extrabold text-surface-900 tracking-tight">
          Distribusi Departemen & Agenda SDM
        </h2>
        <p class="text-xs text-surface-500 mt-0.5">
          Ringkasan alokasi karyawan per departemen, status kehadiran harian, dan agenda penting perusahaan.
        </p>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center gap-1.5 p-1 bg-surface-200/70 rounded-xl shrink-0 self-start sm:self-auto">
        <button
          @click="activeTab = 'departments'"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5"
          :class="activeTab === 'departments' ? 'bg-white text-primary shadow-card' : 'text-surface-600 hover:text-surface-900'"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>
          </svg>
          Departemen
        </button>

        <button
          @click="activeTab = 'attendance'"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5"
          :class="activeTab === 'attendance' ? 'bg-white text-primary shadow-card' : 'text-surface-600 hover:text-surface-900'"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          Presensi
        </button>

        <button
          @click="activeTab = 'agenda'"
          class="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 flex items-center gap-1.5"
          :class="activeTab === 'agenda' ? 'bg-white text-primary shadow-card' : 'text-surface-600 hover:text-surface-900'"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          Agenda
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-12 space-y-4">
      <div v-for="i in 3" :key="i" class="space-y-2">
        <div class="flex justify-between items-center">
          <div class="skeleton h-4 w-1/3"></div>
          <div class="skeleton h-4 w-1/6"></div>
        </div>
        <div class="skeleton h-3 w-full rounded-full"></div>
      </div>
    </div>

    <!-- TAB 1: DEPARTEMEN DISTRIBUTION -->
    <div v-else-if="activeTab === 'departments'" class="space-y-5 animate-fade-in">
      <!-- Quick Metric Overview -->
      <div class="grid grid-cols-3 gap-3 p-3.5 bg-surface-100 rounded-xl border border-surface-200/80 text-center">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-surface-400">Total Departemen</p>
          <p class="text-lg font-heading font-extrabold text-surface-800 mt-0.5">{{ departments.length }}</p>
        </div>
        <div class="border-x border-surface-200">
          <p class="text-[10px] font-bold uppercase tracking-wider text-surface-400">Total Karyawan</p>
          <p class="text-lg font-heading font-extrabold text-primary mt-0.5">{{ totalHeadcount }}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-surface-400">Rata-rata / Dept</p>
          <p class="text-lg font-heading font-extrabold text-accent mt-0.5">
            {{ Math.round(totalHeadcount / (departments.length || 1)) }}
          </p>
        </div>
      </div>

      <!-- Department Progress Bar Cards -->
      <div class="space-y-4">
        <div
          v-for="dept in departments"
          :key="dept.id"
          class="p-4 rounded-xl border border-surface-200 bg-white hover:border-primary-200 hover:shadow-card-md transition-all duration-250 cursor-pointer group"
          @click="navigateToDeptEmployees(dept.id)"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2.5">
              <span
                class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm"
                :style="{ backgroundColor: dept.color }"
              >
                {{ dept.code }}
              </span>
              <div>
                <h4 class="text-xs font-heading font-bold text-surface-900 group-hover:text-primary transition-colors">
                  {{ dept.name }}
                </h4>
                <p class="text-[11px] text-surface-400">
                  Manager: <span class="text-surface-600 font-medium">{{ dept.managerName }}</span>
                </p>
              </div>
            </div>

            <div class="text-right">
              <span class="text-sm font-heading font-extrabold text-surface-900">
                {{ dept.count }} <span class="text-[10px] font-normal text-surface-500">Karyawan</span>
              </span>
              <p class="text-[10px] font-semibold text-primary">
                {{ getPercentage(dept.count) }}% dari total
              </p>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="h-2 w-full rounded-full bg-surface-100 overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${getPercentage(dept.count)}%`, backgroundColor: dept.color }"
            ></div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between text-xs text-surface-500 pt-1">
        <span>Klik departemen untuk melihat daftar anggotanya.</span>
        <router-link to="/employees" class="font-semibold text-primary hover:underline inline-flex items-center gap-1">
          Buka Kelola Departemen →
        </router-link>
      </div>
    </div>

    <!-- TAB 2: PRESENSI & STATUS -->
    <div v-else-if="activeTab === 'attendance'" class="space-y-5 animate-fade-in">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <!-- Hadir Tepat Waktu -->
        <div class="p-3.5 rounded-xl bg-success-light border border-success-light/80">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-success-text">Tepat Waktu</span>
            <span class="h-2 w-2 rounded-full bg-success"></span>
          </div>
          <p class="text-xl font-heading font-extrabold text-success-text mt-1">
            {{ attendanceStats.onTime }}
          </p>
          <p class="text-[10px] text-success-text/80 mt-0.5">81% dari total presensi</p>
        </div>

        <!-- Terlambat -->
        <div class="p-3.5 rounded-xl bg-warning-light border border-warning-light/80">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-warning-text">Terlambat</span>
            <span class="h-2 w-2 rounded-full bg-warning"></span>
          </div>
          <p class="text-xl font-heading font-extrabold text-warning-text mt-1">
            {{ attendanceStats.late }}
          </p>
          <p class="text-[10px] text-warning-text/80 mt-0.5">Disiplin perlu ditingkatkan</p>
        </div>

        <!-- Cuti / Izin -->
        <div class="p-3.5 rounded-xl bg-primary-50 border border-primary-100">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-primary">Cuti / Izin</span>
            <span class="h-2 w-2 rounded-full bg-primary"></span>
          </div>
          <p class="text-xl font-heading font-extrabold text-primary mt-1">
            {{ attendanceStats.leave }}
          </p>
          <p class="text-[10px] text-primary/80 mt-0.5">Pengajuan disetujui HR</p>
        </div>

        <!-- Alpha / Tanpa Keterangan -->
        <div class="p-3.5 rounded-xl bg-danger-light border border-danger-light/80">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold uppercase tracking-wider text-danger-text">Absen / Alpha</span>
            <span class="h-2 w-2 rounded-full bg-danger"></span>
          </div>
          <p class="text-xl font-heading font-extrabold text-danger-text mt-1">
            {{ attendanceStats.absent }}
          </p>
          <p class="text-[10px] text-danger-text/80 mt-0.5">Perlu konfirmasi manager</p>
        </div>
      </div>

      <!-- Presensi Summary Details -->
      <div class="p-4 bg-white rounded-xl border border-surface-200 space-y-3">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-surface-800">Rata-rata Jam Masuk Hari Ini:</span>
          <span class="font-mono font-bold text-primary bg-primary-50 px-2 py-0.5 rounded">{{ attendanceStats.avgCheckInTime }}</span>
        </div>
        <div class="w-full bg-surface-100 h-3 rounded-full flex overflow-hidden">
          <div class="bg-success h-full" style="width: 81%" title="Tepat Waktu (81%)"></div>
          <div class="bg-warning h-full" style="width: 9.5%" title="Terlambat (9.5%)"></div>
          <div class="bg-primary h-full" style="width: 7.1%" title="Cuti (7.1%)"></div>
          <div class="bg-danger h-full" style="width: 2.4%" title="Alpha (2.4%)"></div>
        </div>
        <div class="flex flex-wrap gap-4 text-[11px] text-surface-600 justify-between pt-1">
          <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-success"></span> Tepat Waktu (81%)</span>
          <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-warning"></span> Terlambat (9.5%)</span>
          <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-primary"></span> Cuti/Izin (7.1%)</span>
          <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-danger"></span> Alpha (2.4%)</span>
        </div>
      </div>

      <div class="text-right">
        <router-link to="/attendance" class="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
          Lihat Rekap Presensi Lengkap →
        </router-link>
      </div>
    </div>

    <!-- TAB 3: AGENDA & LIBUR -->
    <div v-else-if="activeTab === 'agenda'" class="space-y-4 animate-fade-in">
      <div class="space-y-2.5">
        <div
          v-for="event in upcomingEvents"
          :key="event.id"
          class="p-3.5 rounded-xl border border-surface-200 bg-white flex items-center justify-between hover:border-primary-200 hover:shadow-card transition-all"
        >
          <div class="flex items-center gap-3">
            <div class="flex flex-col items-center justify-center h-10 w-10 rounded-xl bg-surface-100 border border-surface-200 text-center shrink-0">
              <span class="text-[9px] font-bold uppercase text-surface-500">{{ event.date.split(' ')[1] }}</span>
              <span class="text-sm font-heading font-extrabold text-surface-900 leading-none">{{ event.date.split(' ')[0] }}</span>
            </div>
            <div>
              <h4 class="text-xs font-bold text-surface-900">{{ event.title }}</h4>
              <p class="text-[11px] text-surface-400 mt-0.5">{{ event.date }}</p>
            </div>
          </div>
          <span :class="[event.badgeClass, 'text-[10px] shrink-0']">
            {{ event.badge }}
          </span>
        </div>
      </div>

      <div class="p-3 bg-accent-50 rounded-xl border border-accent-100 flex items-center justify-between text-xs">
        <span class="text-accent-700 font-medium">💡 Pengingat SDM: Evaluasi masa kerja karyawan probation dilakukan 7 hari sebelum kontrak berakhir.</span>
      </div>
    </div>

  </div>
</template>
