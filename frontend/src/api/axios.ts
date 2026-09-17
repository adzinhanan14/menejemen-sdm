import axios from 'axios';
import { useAuthStore } from '@/store/auth';
import router from '@/router';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://menejemen-sdm.onrender.com/api/v1',
  timeout: 15000,
});

// Attach the JWT access token to every outgoing request, if we have one.
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`;
  }
  return config;
});

// On a 401 from the backend (expired/invalid token), clear the session
// and bounce the user back to the login screen. We avoid an infinite
// loop by skipping this when the failing request *was* the login call
// itself (wrong credentials should just show an inline form error).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginRequest) {
      const authStore = useAuthStore();
      authStore.logout();

      if (router.currentRoute.value.name !== 'login') {
        router.push({
          name: 'login',
          query: { redirect: router.currentRoute.value.fullPath },
        });
      }
    }

    return Promise.reject(error);
  },
);
