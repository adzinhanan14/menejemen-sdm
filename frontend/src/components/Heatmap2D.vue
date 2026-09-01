<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { attendanceApi } from '@/api/attendance';

const selectedMonth = ref<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
const heatmapData = ref<Record<string, { status: string; count?: number }>>({});
const loading = ref(false);

const daysOfWeek = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const calendarDays = computed(() => {
  const [yearStr, monthStr] = selectedMonth.value.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1; // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const days = [];

  // Padding days from previous month
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ dayNumber: null, dateStr: null, status: null });
  }

  // Days of current month
  for (let d = 1; d <= totalDays; d++) {
    const dayPadded = String(d).padStart(2, '0');
    const dateStr = `${selectedMonth.value}-${dayPadded}`;
    const log = heatmapData.value[dateStr] || heatmapData.value[d];
    const status = log ? log.status : null;
    days.push({ dayNumber: d, dateStr, status });
  }

  return days;
});

const fetchHeatmap = async () => {
  loading.value = true;
  try {
    const res = await attendanceApi.getHeatmap(selectedMonth.value);
    const data = res.data.data ?? res.data;
    if (typeof data === 'object' && data !== null) {
      heatmapData.value = data;
    }
  } catch (err) {
    console.error('Failed to fetch heatmap data', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHeatmap();
});

watch(selectedMonth, () => {
  fetchHeatmap();
});

const getStatusColorClass = (status: string | null) => {
  if (!status) return 'bg-slate-100 text-slate-400 border-slate-200';
  switch (status.toUpperCase()) {
    case 'PRESENT':
      return 'bg-emerald-500 text-white shadow-emerald-200';
    case 'LATE':
      return 'bg-amber-400 text-slate-900 shadow-amber-200';
    case 'ABSENT':
      return 'bg-rose-500 text-white shadow-rose-200';
    case 'ON_LEAVE':
      return 'bg-sky-500 text-white shadow-sky-200';
    default:
      return 'bg-slate-200 text-slate-700';
  }
};
</script>

<template>
  <div class="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h3 class="text-lg font-bold text-slate-800">Heatmap Kehadiran Bulanan (2D)</h3>
        <p class="text-xs text-slate-500 mt-0.5">Visualisasi kalender tingkat presensi dan status kehadiran harian.</p>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-xs font-semibold text-slate-600">Pilih Bulan:</label>
        <input
          v-model="selectedMonth"
          type="month"
          class="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 bg-white"
        />
      </div>
    </div>

    <!-- Status Legend -->
    <div class="flex flex-wrap gap-4 text-xs font-medium pt-2 pb-1 border-b border-slate-100">
      <div class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full bg-emerald-500"></span>
        <span class="text-slate-600">Hadir (Present)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full bg-amber-400"></span>
        <span class="text-slate-600">Terlambat (Late)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full bg-rose-500"></span>
        <span class="text-slate-600">Absen (Absent)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="h-3 w-3 rounded-full bg-sky-500"></span>
        <span class="text-slate-600">Cuti (On Leave)</span>
      </div>
    </div>

    <!-- Calendar Grid Header -->
    <div class="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 py-1">
      <div v-for="dayName in daysOfWeek" :key="dayName">
        {{ dayName }}
      </div>
    </div>

    <!-- Calendar Grid Cells -->
    <div v-if="loading" class="py-12 text-center text-sm text-slate-400 animate-pulse">
      Memuat kalender heatmap...
    </div>

    <div v-else class="grid grid-cols-7 gap-2">
      <div
        v-for="(cell, index) in calendarDays"
        :key="index"
        :class="[
          'relative flex h-12 sm:h-14 items-center justify-center rounded-xl text-xs font-bold transition-all border shadow-sm',
          cell.dayNumber ? getStatusColorClass(cell.status) : 'bg-slate-50/40 border-transparent'
        ]"
      >
        <span v-if="cell.dayNumber">{{ cell.dayNumber }}</span>
        <div v-if="cell.status" class="absolute bottom-1 right-1 h-1.5 w-1.5 rounded-full bg-white/70"></div>
      </div>
    </div>
  </div>
</template>
