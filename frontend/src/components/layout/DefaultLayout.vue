<script setup lang="ts">
import Sidebar from './Sidebar.vue';
import Navbar from './Navbar.vue';
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-50">
    <Sidebar />

    <div class="flex flex-1 flex-col overflow-hidden">
      <Navbar />

      <main class="flex-1 overflow-y-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
