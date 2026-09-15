<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './Sidebar.vue';
import Navbar from './Navbar.vue';

const route = useRoute();
const pageKey = computed(() => route.path);
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-surface-200">
    <Sidebar />

    <div class="flex flex-1 flex-col overflow-hidden">
      <Navbar />

      <main class="flex-1 overflow-y-auto">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="pageKey" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>
