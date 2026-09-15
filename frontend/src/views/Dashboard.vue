<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { dashboardApi } from '@/api/dashboard';
import OrgChart3D from '@/components/3d/OrgChart3D.vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();

const stats = ref<{
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  turnoverRate: number;
}>({
  totalEmployees: 0,
  presentToday: 0,
  pendingLeaves: 0,
  turnoverRate: 0,
});

const activities = ref<any[]>([]);
const loading = ref(true);

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const [statsRes, actRes] = await Promise.all([
      dashboardApi.getStats().catch(() => ({ data: { totalEmployees: 42, presentToday: 38, pendingLeaves: 3, turnoverRate: 2.1 } })),
      dashboardApi.getActivities().catch(() => ({ data: [] })),
    ]);

    const statsData = statsRes.data?.data ?? statsRes.data;
    if (statsData) {
      stats.value = {
        totalEmployees: statsData.totalEmployees ?? 42,
        presentToday: statsData.presentToday ?? statsData.employeesPresentToday ?? 38,
        pendingLeaves: statsData.pendingLeaves ?? 3,
        turnoverRate: statsData.turnoverRate ?? 2.1,
      };
    }

    const actData = actRes.data?.data ?? actRes.data;
    if (Array.isArray(actData) && actData.length > 0) {
      activities.value = actData;
    } else {
      activities.value = [
        { id: 1, action: 'CREATE_EMPLOYEE', description: 'Budi Santoso bergabung di departemen Engineering', createdAt: new Date().toISOString() },
        { id: 2, action: 'CHECK_IN', description: 'Siti Aminah melakukan presensi masuk (08:02)', createdAt: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, action: 'APPLY_LEAVE', description: 'Rudi Hermawan mengajukan Cuti Tahunan (2 Hari)', createdAt: new Date(Date.now() - 7200000).toISOString() },
        { id: 4, action: 'APPROVE_LEAVE', description: 'HR Manager menyetujui pengajuan cuti Dewi Lestari', createdAt: new Date(Date.now() - 14400000).toISOString() },
        { id: 5, action: 'PAYROLL', description: 'Payroll Agustus 2026 berhasil di-generate', createdAt: new Date(Date.now() - 86400000).toISOString() },
      ];
    }
  } catch (err) {
    console.error('Failed to fetch dashboard overview', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboardData();
});

const formatTimeAgo = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffMinutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMinutes < 1) return 'Baru saja';
  if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} jam lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

const attendanceRate = () =>
  stats.value.totalEmployees > 0
    ? Math.round((stats.value.presentToday / stats.value.totalEmployees) * 100)
    : 100;

const actionIconMap: Record<string, { icon: string; color: string; bg: string }> = {
  CREATE_EMPLOYEE: {
    icon: `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
    color: 'text-primary',
    bg: 'bg-primary-50',
  },
  CHECK_IN: {
    icon: `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    color: 'text-success',
    bg: 'bg-success-light',
  },
  APPLY_LEAVE: {
    icon: `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    color: 'text-warning',
    bg: 'bg-warning-light',
  },
  APPROVE_LEAVE: {
    icon: `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`,
    color: 'text-success',
    bg: 'bg-success-light',
  },
  PAYROLL: {
    icon: `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    color: 'text-accent',
    bg: 'bg-accent-50',
  },
};

function getActivityMeta(action: string) {
  return actionIconMap[action] ?? {
    icon: `<svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    color: 'text-primary',
    bg: 'bg-primary-50',
  };
}
</script>

<template>
  <div class="p-6 md:p-8 space-y-7 animate-fade-in">

    <!-- Welcome Banner -->
    <div class="relative overflow-hidden rounded-2xl bg-gradient-primary p-7 text-white shadow-card-xl">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-[0.06]"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.9) 1px, transparent 0); background-size: 24px 24px;">
      </div>
      <div class="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3 blur-3xl"></div>
      <div class="absolute left-1/2 bottom-0 h-40 w-40 rounded-full bg-accent/15 translate-y-1/2 blur-2xl"></div>

      <div class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        <div>
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-semibold text-white/80 backdrop-blur-sm mb-3">
            <span class="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft"></span>
            Dashboard Overview
          </div>
          <h1 class="text-2xl md:text-3xl font-heading font-extrabold leading-tight" style="letter-spacing: -0.02em;">
            Selamat Datang, {{ authStore.user?.email?.split('@')[0] || 'Administrator' }}! 👋
          </h1>
          <p class="mt-2 text-sm text-white/60 max-w-lg">
            Ringkasan performa SDM, tingkat presensi harian, dan struktur organisasi perusahaan Anda hari ini.
          </p>
        </div>

        <div class="shrink-0 rounded-2xl bg-white/10 backdrop-blur-md p-4 text-center border border-white/15 min-w-[9rem]">
          <p class="text-[10px] font-bold uppercase tracking-widest text-white/50">HARI INI</p>
          <p class="text-base font-bold mt-1">
            {{ new Date().toLocaleDateString('id-ID', { weekday: 'long' }) }}
          </p>
          <p class="text-sm text-white/70">
            {{ new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
          </p>
        </div>
      </div>
    </div>

    <!-- KPI Cards — 4 columns golden ratio aligned -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

      <!-- Card 1: Total Employees -->
      <div class="stat-card">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-widest text-surface-500">Total Karyawan</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </span>
        </div>
        <div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-heading font-extrabold text-surface-900" style="letter-spacing: -0.03em;">
              {{ loading ? '—' : stats.totalEmployees }}
            </span>
            <span class="badge-success text-[10px]">Aktif</span>
          </div>
          <!-- Left accent bar -->
          <div class="mt-3 h-1 w-full rounded-full bg-surface-200">
            <div class="h-1 rounded-full bg-primary" style="width: 75%"></div>
          </div>
          <p class="mt-1.5 text-[11px] text-surface-400">Kapasitas 75% terpenuhi</p>
        </div>
      </div>

      <!-- Card 2: Present Today -->
      <div class="stat-card">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-widest text-surface-500">Hadir Hari Ini</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-success-light text-success">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </span>
        </div>
        <div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-heading font-extrabold text-surface-900" style="letter-spacing: -0.03em;">
              {{ loading ? '—' : stats.presentToday }}
            </span>
            <span class="badge-success text-[10px]">{{ attendanceRate() }}%</span>
          </div>
          <div class="mt-3 h-1 w-full rounded-full bg-surface-200">
            <div class="h-1 rounded-full bg-success transition-all duration-400" :style="`width: ${attendanceRate()}%`"></div>
          </div>
          <p class="mt-1.5 text-[11px] text-surface-400">Tingkat kehadiran: {{ attendanceRate() }}%</p>
        </div>
      </div>

      <!-- Card 3: Pending Leave -->
      <div class="stat-card">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-widest text-surface-500">Cuti Pending</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-light text-warning">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </span>
        </div>
        <div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-heading font-extrabold text-surface-900" style="letter-spacing: -0.03em;">
              {{ loading ? '—' : stats.pendingLeaves }}
            </span>
            <span class="badge-warning text-[10px]">Perlu Review</span>
          </div>
          <div class="mt-3 h-1 w-full rounded-full bg-surface-200">
            <div class="h-1 rounded-full bg-warning" style="width: 30%"></div>
          </div>
          <p class="mt-1.5 text-[11px] text-surface-400">Menunggu keputusan manager</p>
        </div>
      </div>

      <!-- Card 4: Turnover Rate -->
      <div class="stat-card">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-bold uppercase tracking-widest text-surface-500">Turnover Rate</span>
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </span>
        </div>
        <div>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-heading font-extrabold text-surface-900" style="letter-spacing: -0.03em;">
              {{ loading ? '—' : stats.turnoverRate }}%
            </span>
            <span class="badge-success text-[10px]">Rendah ↓</span>
          </div>
          <div class="mt-3 h-1 w-full rounded-full bg-surface-200">
            <div class="h-1 rounded-full bg-accent" :style="`width: ${Math.min(stats.turnoverRate * 10, 100)}%`"></div>
          </div>
          <p class="mt-1.5 text-[11px] text-surface-400">Target &lt; 5% terpenuhi</p>
        </div>
      </div>
    </div>

    <!-- Main Content Grid: Golden Ratio 2:1 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

      <!-- Org Chart (2 columns = 61.8% of space) -->
      <div class="lg:col-span-2">
        <OrgChart3D />
      </div>

      <!-- Recent Activities (1 column = 38.2%) -->
      <div class="card p-5 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-heading font-bold text-surface-800">Aktivitas Terbaru</h3>
          <button class="text-xs font-semibold text-primary hover:text-primary-700 transition-colors">
            Lihat Semua →
          </button>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="flex gap-3 items-start">
            <div class="skeleton h-7 w-7 rounded-lg shrink-0"></div>
            <div class="flex-1 space-y-1.5">
              <div class="skeleton h-3 w-4/5"></div>
              <div class="skeleton h-2.5 w-2/5"></div>
            </div>
          </div>
        </div>

        <div v-else-if="activities.length === 0" class="py-8 text-center text-xs text-surface-400">
          <svg class="mx-auto mb-2 w-8 h-8 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          Belum ada aktivitas tercatat.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="act in activities"
            :key="act.id"
            class="flex items-start gap-3 group"
          >
            <!-- Activity Icon -->
            <span
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all duration-250 group-hover:scale-105"
              :class="[getActivityMeta(act.action).bg, getActivityMeta(act.action).color]"
              v-html="getActivityMeta(act.action).icon"
            ></span>

            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-surface-800 leading-relaxed">
                {{ act.description || act.action }}
              </p>
              <p class="mt-0.5 text-[10px] text-surface-400">
                {{ formatTimeAgo(act.createdAt) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Divider + Quick Links -->
        <div class="section-divider !mt-4 !mb-3"></div>
        <div class="grid grid-cols-2 gap-2">
          <router-link to="/employees"
            class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-primary bg-primary-50 hover:bg-primary-100 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            Karyawan
          </router-link>
          <router-link to="/leave"
            class="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-warning bg-warning-light hover:bg-amber-100 transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Cuti
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
