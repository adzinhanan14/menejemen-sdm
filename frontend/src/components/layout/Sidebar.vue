<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

interface MenuItem {
  label: string;
  to: string;
  icon: string;
  desc?: string;
}

const menuItems: MenuItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  },
  {
    label: 'Karyawan',
    to: '/employees',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    label: 'Presensi',
    to: '/attendance',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  },
  {
    label: 'Izin & Cuti',
    to: '/leave',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  },
  {
    label: 'Penggajian',
    to: '/payroll',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
  {
    label: 'Rekrutmen',
    to: '/recruitment',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`,
  },
  {
    label: 'Performa',
    to: '/performance',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  },
  {
    label: 'Analitik',
    to: '/analytics',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  },
  {
    label: 'Pengaturan',
    to: '/settings',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  },
];

const userInitials = computed(() => {
  const email = authStore.user?.email ?? '';
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
});

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/');
}

function handleLogout() {
  authStore.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <aside class="flex h-full w-sidebar shrink-0 flex-col bg-gradient-primary overflow-hidden relative">
    <!-- Subtle pattern overlay -->
    <div class="absolute inset-0 opacity-[0.04] pointer-events-none"
      style="background-image: radial-gradient(circle at 1px 1px, rgba(255,255,255,0.8) 1px, transparent 0); background-size: 20px 20px;">
    </div>

    <!-- Logo -->
    <div class="relative flex h-navbar items-center px-6 border-b border-white/10">
      <div class="flex items-center gap-3">
        <!-- Logo Icon -->
        <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-accent shadow-accent">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4.5 h-4.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <span class="text-base font-heading font-bold text-white tracking-tight">HRMS</span>
          <span class="block text-[10px] font-medium text-white/50 leading-none -mt-0.5">Manajemen SDM</span>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="relative flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
      <!-- Menu Group Label -->
      <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Menu Utama</p>

      <router-link
        v-for="item in menuItems.slice(0, 6)"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-250 relative"
        :class="isActive(item.to)
          ? 'bg-white/12 text-white shadow-sm'
          : 'text-white/60 hover:bg-white/8 hover:text-white/90'"
      >
        <!-- Active Indicator -->
        <span
          v-if="isActive(item.to)"
          class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-accent"
        ></span>

        <!-- Icon -->
        <span
          class="shrink-0 transition-colors duration-250"
          :class="isActive(item.to) ? 'text-accent' : 'text-white/50 group-hover:text-white/80'"
          v-html="item.icon"
        ></span>

        <!-- Label -->
        <span class="font-medium">{{ item.label }}</span>
      </router-link>

      <!-- Divider -->
      <div class="section-divider !border-white/10 !my-3"></div>
      <p class="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-white/30">Lainnya</p>

      <router-link
        v-for="item in menuItems.slice(6)"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-250 relative"
        :class="isActive(item.to)
          ? 'bg-white/12 text-white shadow-sm'
          : 'text-white/60 hover:bg-white/8 hover:text-white/90'"
      >
        <span
          v-if="isActive(item.to)"
          class="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-accent"
        ></span>
        <span
          class="shrink-0 transition-colors duration-250"
          :class="isActive(item.to) ? 'text-accent' : 'text-white/50 group-hover:text-white/80'"
          v-html="item.icon"
        ></span>
        <span class="font-medium">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- User Profile at Bottom -->
    <div class="relative border-t border-white/10 px-3 py-3">
      <div class="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/8 transition-all duration-250 cursor-pointer group">
        <!-- Avatar -->
        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 border border-accent/30 text-xs font-bold text-accent-300">
          {{ userInitials }}
        </div>
        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-white/90 truncate">{{ authStore.user?.email?.split('@')[0] || 'Pengguna' }}</p>
          <p class="text-[10px] text-white/40 truncate">{{ authStore.user?.roles?.[0] || 'Admin' }}</p>
        </div>
        <!-- Logout Button -->
        <button
          @click.stop="handleLogout"
          class="shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-white/30 hover:bg-danger/20 hover:text-danger transition-all duration-250"
          title="Keluar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </div>
  </aside>
</template>
