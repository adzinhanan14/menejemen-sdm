<script setup lang="ts">
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

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

const initials = () => {
  const name = authStore.user?.email ?? '?';
  return name.slice(0, 2).toUpperCase();
};
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
    <!-- Search -->
    <div class="w-full max-w-md">
      <div class="relative">
        <svg
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m0 0a7.5 7.5 0 10-10.6 0 7.5 7.5 0 0010.6 0z" />
        </svg>
        <input
          type="search"
          placeholder="Cari karyawan, departemen…"
          class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>

    <div class="flex items-center gap-4">
      <!-- Notifications -->
      <button
        type="button"
        class="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Notifikasi"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>
        <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger"></span>
      </button>

      <!-- Profile dropdown -->
      <div ref="profileMenuRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 transition hover:bg-slate-100"
          @click="isProfileOpen = !isProfileOpen"
        >
          <span
            class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white"
          >
            {{ initials() }}
          </span>
          <span class="text-sm font-medium text-slate-700">
            {{ authStore.user?.email ?? 'Pengguna' }}
          </span>
        </button>

        <div
          v-if="isProfileOpen"
          class="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <router-link
            to="/settings"
            class="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            @click="isProfileOpen = false"
          >
            Pengaturan
          </router-link>
          <button
            type="button"
            class="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-danger/5"
            @click="handleLogout"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
