import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Auth/Login.vue'),
    meta: { public: true },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
  },
  {
    path: '/employees',
    name: 'employees',
    component: () => import('@/views/Employees.vue'),
  },
  {
    path: '/attendance',
    name: 'attendance',
    component: () => import('@/views/Attendance.vue'),
  },
  {
    path: '/leave',
    name: 'leave',
    component: () => import('@/views/Leave.vue'),
  },
  {
    path: '/payroll',
    name: 'payroll',
    component: () => import('@/views/Payroll.vue'),
  },
  {
    path: '/payroll/batch/:id',
    name: 'payroll-batch-detail',
    component: () => import('@/views/Payroll/BatchDetail.vue'),
  },
  {
    path: '/recruitment',
    name: 'recruitment',
    component: () => import('@/views/Recruitment.vue'),
  },
  {
    path: '/performance',
    name: 'performance',
    component: () => import('@/views/Performance.vue'),
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/Analytics.vue'),
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/Settings.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Route guard: every route except those flagged `meta.public` requires
// a valid session. Unauthenticated users are bounced to /login with a
// `redirect` query param so Login.vue can send them back afterwards.
router.beforeEach((to) => {
  const authStore = useAuthStore();
  const isPublic = Boolean(to.meta.public);

  if (!isPublic && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    };
  }

  // Already logged in and trying to visit /login -> send to dashboard.
  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
