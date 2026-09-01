import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';

export function useAuth() {
  const authStore = useAuthStore();
  const { user, token, isAuthenticated } = storeToRefs(authStore);

  return {
    user,
    token,
    isAuthenticated,
    login: authStore.login,
    logout: authStore.logout,
  };
}
