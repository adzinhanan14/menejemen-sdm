<script setup lang="ts">
interface MenuItem {
  label: string;
  to: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Employees', to: '/employees' },
  { label: 'Attendance', to: '/attendance' },
  { label: 'Leave', to: '/leave' },
  { label: 'Payroll', to: '/payroll' },
  { label: 'Recruitment', to: '/recruitment' },
  { label: 'Performance', to: '/performance' },
  { label: 'Analytics', to: '/analytics' },
  { label: 'Settings', to: '/settings' },
];
</script>

<template>
  <aside class="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
    <div class="flex h-16 items-center px-6">
      <span class="text-lg font-semibold text-primary">HRMS</span>
    </div>

    <nav class="flex-1 space-y-1 px-3 py-2">
      <router-link
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        active-class="bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary"
      >
        {{ item.label }}
      </router-link>
    </nav>
  </aside>
</template>
