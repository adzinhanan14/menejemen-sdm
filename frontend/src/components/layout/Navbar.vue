<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { onClickOutside } from '@vueuse/core';
import { useAuthStore } from '@/store/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isProfileOpen = ref(false);
const profileMenuRef = ref<HTMLElement | null>(null);

onClickOutside(profileMenuRef, () => {
  isProfileOpen.value = false;
});

function handleLogout() {
  authStore.logout();
  isProfileOpen.value = false;
  router.push({ name: 'login' });
}

// Breadcrumb
const breadcrumb = computed(() => {
  const pathMap: Record<string, string> = {
    '/dashboard':   'Dashboard',
    '/employees':   'Manajemen Karyawan',
    '/attendance':  'Presensi & Kehadiran',
    '/leave':       'Izin & Cuti',
    '/payroll':     'Penggajian',
    '/recruitment': 'Rekrutmen',
    '/performance': 'Performa',
    '/analytics':   'Analitik',
    '/settings':    'Pengaturan',
  };
  const matched = Object.entries(pathMap).find(([path]) =>
    route.path === path || route.path.startsWith(path + '/')
  );
  return matched ? matched[1] : 'HRMS';
});

const userInitials = computed(() => {
  const email = authStore.user?.email ?? '';
  const parts = email.split('@')[0].split('.');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return email.slice(0, 2).toUpperCase();
});
</script>

<template>
  <header class="flex h-navbar items-center justify-between border-b border-surface-300/60 bg-white px-6 shadow-card z-10">

    <!-- Left: Breadcrumb -->
    <div class="flex items-center gap-2 text-sm">
      <span class="text-surface-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      </span>
      <span class="text-surface-400">/</span>
      <span class="font-semibold text-surface-800">{{ breadcrumb }}</span>
    </div>

    <!-- Right: Actions -->
    <div class="flex items-center gap-3">

      <!-- Search -->
      <div class="relative hidden md:block">
        <svg
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
        </svg>
        <input
          type="search"
          placeholder="Cari karyawan, departemen…"
          class="w-56 rounded-xl border border-surface-300 bg-surface-100 py-2 pl-9 pr-3 text-sm text-surface-800 placeholder:text-surface-400 outline-none transition-all duration-250 focus:w-72 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary-100"
        />
      </div>

      <!-- Notification Bell -->
      <button
        type="button"
        class="relative flex h-9 w-9 items-center justify-center rounded-xl text-surface-500 transition-all duration-250 hover:bg-surface-200 hover:text-primary"
        aria-label="Notifikasi"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75">
          <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <!-- Notification dot -->
        <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger border-2 border-white"></span>
      </button>

      <!-- Divider -->
      <div class="h-6 w-px bg-surface-300"></div>

      <!-- Profile dropdown -->
      <div ref="profileMenuRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-all duration-250 hover:bg-surface-100"
          @click="isProfileOpen = !isProfileOpen"
        >
          <!-- Avatar -->
          <div class="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-xs font-bold text-white shadow-primary/20 shadow-sm">
            {{ userInitials }}
          </div>
          <!-- User Info -->
          <div class="hidden sm:block text-left">
            <p class="text-xs font-semibold text-surface-800 leading-tight">
              {{ authStore.user?.email?.split('@')[0] || 'Pengguna' }}
            </p>
            <p class="text-[10px] text-surface-400 leading-tight">
              {{ authStore.user?.roles?.[0] || 'Administrator' }}
            </p>
          </div>
          <!-- Chevron -->
          <svg
            class="h-4 w-4 text-surface-400 transition-transform duration-250"
            :class="{ 'rotate-180': isProfileOpen }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <!-- Dropdown Menu -->
        <Transition name="dropdown">
          <div
            v-if="isProfileOpen"
            class="absolute right-0 mt-2 w-52 rounded-2xl border border-surface-300/60 bg-white py-1.5 shadow-card-lg z-50"
          >
            <!-- Header -->
            <div class="px-4 py-2.5 border-b border-surface-200">
              <p class="text-xs font-semibold text-surface-800">{{ authStore.user?.email }}</p>
              <p class="text-[10px] text-surface-400 mt-0.5">Masuk sebagai {{ authStore.user?.roles?.[0] || 'Admin' }}</p>
            </div>

            <div class="py-1">
              <router-link
                to="/settings"
                class="flex items-center gap-2.5 px-4 py-2 text-sm text-surface-700 hover:bg-surface-100 hover:text-primary transition-colors"
                @click="isProfileOpen = false"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Pengaturan Akun
              </router-link>

              <div class="mx-4 my-1 h-px bg-surface-200"></div>

              <button
                type="button"
                class="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-danger-light transition-colors"
                @click="handleLogout"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Keluar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}
</style>
