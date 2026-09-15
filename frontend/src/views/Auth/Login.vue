<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loginSchema = z.object({
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
});

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
});

const [email, emailAttrs] = defineField('email');
const [password, passwordAttrs] = defineField('password');

const isSubmitting = ref(false);
const serverError = ref<string | null>(null);
const showPassword = ref(false);

const onSubmit = handleSubmit(async (values) => {
  isSubmitting.value = true;
  serverError.value = null;

  try {
    await authStore.login(values.email, values.password);
    const redirectTo =
      typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    router.push(redirectTo);
  } catch (error: any) {
    serverError.value =
      error?.response?.data?.message ?? 'Email atau password salah. Silakan coba lagi.';
  } finally {
    isSubmitting.value = false;
  }
});

const stats = [
  { value: '500+', label: 'Karyawan Dikelola' },
  { value: '99.9%', label: 'Uptime Sistem' },
  { value: '12+', label: 'Fitur Modul' },
];
</script>

<template>
  <div class="flex min-h-screen bg-surface-200">

    <!-- LEFT PANEL — Branding -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-primary flex-col justify-between p-12">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-[0.05]"
        style="background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0); background-size: 28px 28px;">
      </div>
      <!-- Decorative circles -->
      <div class="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
      <div class="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-accent/10 blur-3xl"></div>

      <!-- Top: Logo -->
      <div class="relative flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent shadow-accent">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>
        <div>
          <span class="text-xl font-heading font-bold text-white">HRMS</span>
          <span class="block text-xs font-medium text-white/50 -mt-0.5">Human Resource Management System</span>
        </div>
      </div>

      <!-- Middle: Headline -->
      <div class="relative space-y-6">
        <div class="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm">
          <span class="h-2 w-2 rounded-full bg-accent animate-pulse-soft"></span>
          Sistem SDM Terintegrasi
        </div>

        <div>
          <h1 class="text-4xl xl:text-5xl font-heading font-extrabold text-white leading-tight">
            Kelola Sumber Daya<br/>
            <span class="text-accent">Manusia</span> dengan<br/>
            Lebih Efisien
          </h1>
          <p class="mt-4 text-base text-white/60 leading-relaxed max-w-md">
            Platform manajemen SDM terpadu — dari presensi, penggajian, hingga rekrutmen — semua dalam satu sistem yang terintegrasi.
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 pt-2">
          <div v-for="stat in stats" :key="stat.label" class="text-center">
            <p class="text-2xl font-heading font-bold text-white">{{ stat.value }}</p>
            <p class="text-xs text-white/50 mt-0.5">{{ stat.label }}</p>
          </div>
        </div>
      </div>

      <!-- Bottom: Features list -->
      <div class="relative space-y-3">
        <p class="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Fitur Unggulan</p>
        <div v-for="feature in ['Manajemen Karyawan & Kontrak', 'Presensi dengan Verifikasi Kamera', 'Penggajian & Slip Gaji Otomatis', 'Workflow Persetujuan Cuti']"
          :key="feature"
          class="flex items-center gap-2.5 text-sm text-white/70">
          <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/20 border border-accent/30">
            <svg class="w-3 h-3 text-accent-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          {{ feature }}
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL — Login Form -->
    <div class="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12">
      <div class="w-full max-w-sm animate-fade-in">

        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center gap-3 mb-8">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" class="w-4 h-4">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <span class="text-lg font-heading font-bold text-surface-900">HRMS</span>
        </div>

        <!-- Title -->
        <div class="mb-8">
          <h2 class="text-2xl font-heading font-bold text-surface-900">Selamat Datang Kembali</h2>
          <p class="mt-1.5 text-sm text-surface-500">Masuk dengan akun perusahaan Anda untuk melanjutkan</p>
        </div>

        <!-- Form -->
        <form class="space-y-5" novalidate @submit="onSubmit">
          <!-- Email Field -->
          <div>
            <label for="email" class="form-label">Email Perusahaan</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-3.5 flex items-center text-surface-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </span>
              <input
                id="email"
                v-model="email"
                v-bind="emailAttrs"
                type="email"
                autocomplete="email"
                class="form-input pl-10"
                :class="{ '!border-danger focus:!ring-danger/20': errors.email }"
                placeholder="nama@perusahaan.com"
              />
            </div>
            <p v-if="errors.email" class="mt-1.5 flex items-center gap-1 text-xs text-danger">
              <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errors.email }}
            </p>
          </div>

          <!-- Password Field -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="form-label !mb-0">Password</label>
              <a href="#" class="text-xs font-medium text-primary hover:text-primary-700 transition-colors">Lupa password?</a>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-3.5 flex items-center text-surface-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input
                id="password"
                v-model="password"
                v-bind="passwordAttrs"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                class="form-input pl-10 pr-10"
                :class="{ '!border-danger focus:!ring-danger/20': errors.password }"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-3.5 flex items-center text-surface-400 hover:text-surface-700 transition-colors"
                @click="showPassword = !showPassword"
              >
                <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <p v-if="errors.password" class="mt-1.5 flex items-center gap-1 text-xs text-danger">
              <svg class="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              {{ errors.password }}
            </p>
          </div>

          <!-- Server Error -->
          <div
            v-if="serverError"
            class="flex items-center gap-2.5 rounded-xl bg-danger-light border border-danger/20 px-4 py-3 text-sm text-danger"
          >
            <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
            {{ serverError }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="btn-primary w-full py-3 text-base"
          >
            <svg v-if="isSubmitting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ isSubmitting ? 'Memproses…' : 'Masuk ke Sistem' }}
          </button>
        </form>

        <!-- Demo accounts hint -->
        <div class="mt-6 rounded-xl bg-primary-50 border border-primary-100 p-4">
          <p class="text-xs font-semibold text-primary-600 mb-2">Akun Demo:</p>
          <div class="space-y-1">
            <p class="text-xs text-primary-500 font-mono">admin@hrms.local / Admin@1234</p>
            <p class="text-xs text-primary-500 font-mono">hr@hrms.local / Hr@12345</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
