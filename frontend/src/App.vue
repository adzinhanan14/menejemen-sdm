<script setup lang="ts">
import { useRoute } from 'vue-router';
import DefaultLayout from '@/components/layout/DefaultLayout.vue';

const route = useRoute();
</script>

<template>
  <div id="app-shell" class="min-h-screen bg-slate-50">
    <!-- Public routes (e.g. /login) render without the sidebar/navbar. -->
    <router-view v-if="route.meta.public" />

    <DefaultLayout v-else>
      <router-view />
    </DefaultLayout>
  </div>
</template>
