<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { dashboardApi } from '@/api/dashboard';
import { TresCanvas } from '@tresjs/core';
import { OrbitControls } from '@tresjs/cientos';

const router = useRouter();
const nodes = ref<any[]>([]);
const loading = ref(true);

const fetchOrgChartData = async () => {
  loading.value = true;
  try {
    const res = await dashboardApi.getOrgChartData();
    const data = res.data.data ?? res.data;
    if (Array.isArray(data) && data.length > 0) {
      nodes.value = data;
    } else {
      // Sample fallback node data for 3D layout demonstration
      nodes.value = [
        { id: 'dept-hq', name: 'Direksi / HQ', position: [0, 2, 0], color: '#6366f1', count: 5 },
        { id: 'dept-eng', name: 'Engineering', position: [-2.5, 0, 0], color: '#10b981', count: 18 },
        { id: 'dept-hr', name: 'Human Resources', position: [0, 0, 0], color: '#f59e0b', count: 8 },
        { id: 'dept-fin', name: 'Finance & Ops', position: [2.5, 0, 0], color: '#ec4899', count: 10 },
        { id: 'dept-mkt', name: 'Marketing', position: [-1.2, -2, 0], color: '#3b82f6', count: 12 },
        { id: 'dept-sal', name: 'Sales', position: [1.2, -2, 0], color: '#8b5cf6', count: 14 },
      ];
    }
  } catch (e) {
    console.warn('Failed to load org chart API, using sample structure', e);
    nodes.value = [
      { id: 'dept-hq', name: 'Direksi / HQ', position: [0, 2, 0], color: '#6366f1', count: 5 },
      { id: 'dept-eng', name: 'Engineering', position: [-2.5, 0, 0], color: '#10b981', count: 18 },
      { id: 'dept-hr', name: 'Human Resources', position: [0, 0, 0], color: '#f59e0b', count: 8 },
      { id: 'dept-fin', name: 'Finance & Ops', position: [2.5, 0, 0], color: '#ec4899', count: 10 },
      { id: 'dept-mkt', name: 'Marketing', position: [-1.2, -2, 0], color: '#3b82f6', count: 12 },
      { id: 'dept-sal', name: 'Sales', position: [1.2, -2, 0], color: '#8b5cf6', count: 14 },
    ];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchOrgChartData();
});

const handleNodeClick = (node: any) => {
  if (node && node.id) {
    router.push({ path: '/employees', query: { departmentId: node.id } });
  }
};
</script>

<template>
  <div class="relative w-full h-[420px] rounded-2xl bg-slate-900 overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between">
    <!-- Header Overlay -->
    <div class="absolute top-4 left-4 z-10 pointer-events-none">
      <div class="flex items-center gap-2">
        <span class="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        <h3 class="text-sm font-bold text-white tracking-wide">3D Organization Hierarchy</h3>
      </div>
      <p class="text-xs text-slate-400 mt-0.5">Rotasi 360° dengan mouse & klik node sphere untuk melihat karyawan per departemen.</p>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="flex-1 flex items-center justify-center text-sm text-slate-400">
      Menginisialisasi 3D Canvas Node Tree...
    </div>

    <!-- TresJS 3D Canvas -->
    <TresCanvas v-else clear-color="#0f172a">
      <TresPerspectiveCamera :position="([0, 0, 7.5] as any)" :fov="50" />
      <OrbitControls :enable-zoom="true" :enable-pan="true" />
      <TresAmbientLight :intensity="0.8" />
      <TresDirectionalLight :position="([5, 5, 5] as any)" :intensity="1.2" />

      <!-- Interactive Department Spheres -->
      <TresMesh
        v-for="node in nodes"
        :key="node.id"
        :position="(node.position as any)"
        @click="handleNodeClick(node)"
      >
        <TresSphereGeometry :args="[0.55 + (node.count || 0) * 0.015, 32, 32]" />
        <TresMeshStandardMaterial :color="node.color" :roughness="0.3" :metalness="0.4" />
      </TresMesh>
    </TresCanvas>

    <!-- Legend Footer Overlay -->
    <div class="absolute bottom-3 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md p-2 px-3 rounded-xl border border-slate-800 text-xs">
      <div v-for="node in nodes" :key="'legend-' + node.id" @click="handleNodeClick(node)" class="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition">
        <span class="h-2.5 w-2.5 rounded-full" :style="{ backgroundColor: node.color }"></span>
        <span class="text-slate-300 font-medium">{{ node.name }}</span>
        <span class="text-slate-500 text-[10px]">({{ node.count }})</span>
      </div>
    </div>
  </div>
</template>
