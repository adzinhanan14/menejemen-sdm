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
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
      <div class="mb-6 text-center">
        <h1 class="text-xl font-semibold text-slate-800">Masuk ke HRMS</h1>
        <p class="mt-1 text-sm text-slate-500">Gunakan akun perusahaan Anda</p>
      </div>

      <form class="space-y-4" novalidate @submit="onSubmit">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            autocomplete="email"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            :class="{ 'border-danger focus:border-danger focus:ring-danger/20': errors.email }"
            placeholder="nama@perusahaan.com"
          />
          <p v-if="errors.email" class="mt-1 text-xs text-danger">{{ errors.email }}</p>
        </div>

        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            :class="{ 'border-danger focus:border-danger focus:ring-danger/20': errors.password }"
            placeholder="••••••••"
          />
          <p v-if="errors.password" class="mt-1 text-xs text-danger">{{ errors.password }}</p>
        </div>

        <p v-if="serverError" class="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {{ serverError }}
        </p>

        <button
          type="submit"
          :disabled="isSubmitting"
          class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {{ isSubmitting ? 'Memproses…' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>
