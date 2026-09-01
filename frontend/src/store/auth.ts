import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';

export interface AuthUser {
  id: string;
  email: string;
  employeeId: string;
  roles: string[];
}

const TOKEN_STORAGE_KEY = 'hrms_access_token';
const REFRESH_TOKEN_STORAGE_KEY = 'hrms_refresh_token';

export const useAuthStore = defineStore('auth', () => {
  // ---- State ----
  const user = ref<AuthUser | null>(null);
  const token = ref<string | null>(
    localStorage.getItem(TOKEN_STORAGE_KEY),
  );

  // ---- Getters ----
  const isAuthenticated = computed(() => Boolean(token.value));

  // ---- Actions ----

  /**
   * Calls POST /auth/login, persists the access token (localStorage +
   * state), and hydrates `user` from the decoded access token payload.
   * Throws on failure so the calling component (Login.vue) can show an
   * error message.
   */
  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password });
    const { access_token, refresh_token } = response.data.data ?? response.data;

    token.value = access_token;
    localStorage.setItem(TOKEN_STORAGE_KEY, access_token);
    if (refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token);
    }

    await fetchCurrentUser();
  }

  /**
   * Fetches GET /auth/me using the token that was just set, so `user`
   * reflects real backend data instead of a hand-decoded JWT.
   */
  async function fetchCurrentUser() {
    const response = await authApi.me();
    user.value = response.data.data ?? response.data;
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    fetchCurrentUser,
  };
});
