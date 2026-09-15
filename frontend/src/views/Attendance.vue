<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { attendanceApi } from '@/api/attendance';
import Heatmap2D from '@/components/Heatmap2D.vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();

const activeTab = ref<'logs' | 'heatmap'>('logs');

const logs = ref<any[]>([]);
const loadingLogs = ref(false);
const todayStatus = ref<any>(null);

// Real-time clock
const currentTime = ref('');
const currentDate = ref('');
let timerId: any = null;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// Camera Modal State
const isCameraModalOpen = ref(false);
const isCheckingOut = ref(false);
const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const streamRef = ref<MediaStream | null>(null);

const locationCoords = ref<{ latitude?: number; longitude?: number }>({});
const photoBase64 = ref<string>('');
const isSubmitting = ref(false);

const fetchTodayLogs = async () => {
  loadingLogs.value = true;
  try {
    const res = await attendanceApi.getTodayLogs();
    const data = res.data.data ?? res.data;
    logs.value = Array.isArray(data) ? data : (data.logs || []);
    todayStatus.value = data.todayRecord || null;
  } catch (err) {
    console.error('Failed to fetch attendance logs', err);
  } finally {
    loadingLogs.value = false;
  }
};

const getLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        locationCoords.value = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      },
      (err) => {
        console.warn('Geolocation failed or denied, using fallback coords', err);
        locationCoords.value = { latitude: -6.2088, longitude: 106.8456 }; // Jakarta sample fallback
      }
    );
  }
};

const openCheckInCamera = async () => {
  isCheckingOut.value = false;
  getLocation();
  isCameraModalOpen.value = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.value = stream;
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
    }
  } catch (e) {
    console.warn('Webcam permission denied or unavailable', e);
  }
};

const stopCamera = () => {
  if (streamRef.value) {
    streamRef.value.getTracks().forEach((track) => track.stop());
    streamRef.value = null;
  }
  isCameraModalOpen.value = false;
};

const captureAndSubmitCheckIn = async () => {
  isSubmitting.value = true;
  try {
    if (videoRef.value && canvasRef.value) {
      const context = canvasRef.value.getContext('2d');
      if (context) {
        canvasRef.value.width = videoRef.value.videoWidth || 320;
        canvasRef.value.height = videoRef.value.videoHeight || 240;
        context.drawImage(videoRef.value, 0, 0, canvasRef.value.width, canvasRef.value.height);
        photoBase64.value = canvasRef.value.toDataURL('image/jpeg');
      }
    }

    const currentEmployeeId = authStore.user?.employeeId || authStore.user?.id || 'emp-demo';

    await attendanceApi.checkIn({
      employeeId: currentEmployeeId,
      latitude: locationCoords.value.latitude,
      longitude: locationCoords.value.longitude,
      facePhotoBase64: photoBase64.value || undefined,
    });

    stopCamera();
    await fetchTodayLogs();
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal melakukan check-in');
  } finally {
    isSubmitting.value = false;
  }
};

const executeCheckOut = async () => {
  isSubmitting.value = true;
  try {
    const currentEmployeeId = authStore.user?.employeeId || authStore.user?.id || 'emp-demo';
    await attendanceApi.checkOut({ employeeId: currentEmployeeId });
    await fetchTodayLogs();
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal melakukan check-out');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  updateClock();
  timerId = setInterval(updateClock, 1000);
  fetchTodayLogs();
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
  stopCamera();
});
</script>

<template>
  <div class="p-6 md:p-8 space-y-6">
    <!-- Top Bar Header & Real-time Digital Clock -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-900 font-heading tracking-tight">
          Manajemen Presensi & Kehadiran
        </h1>
        <p class="text-sm text-slate-500 mt-1">
          Pencatatan waktu kerja, presensi berbasis lokasi & foto, serta analitik heatmap harian.
        </p>
      </div>

      <!-- Digital Clock Widget -->
      <div class="flex items-center gap-4 bg-white border border-slate-200/80 px-5 py-3 rounded-2xl shadow-xs">
        <div class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
        <div>
          <div class="text-2xl font-extrabold font-mono text-primary-900 leading-tight">
            {{ currentTime }}
          </div>
          <div class="text-xs font-semibold text-slate-400 capitalize">
            {{ currentDate }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Action Cards (Check-In / Check-Out) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Check-In Card -->
      <div class="rounded-2xl bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 p-6 text-white shadow-lg shadow-primary-950/20 relative overflow-hidden flex flex-col justify-between space-y-6">
        <div class="absolute -right-6 -bottom-6 text-primary-700/20 text-9xl pointer-events-none select-none">
          📸
        </div>
        <div class="relative z-10 space-y-2">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-white/15 text-accent-300">
            <span class="w-2 h-2 rounded-full bg-accent-400"></span>
            Presensi Masuk
          </div>
          <h3 class="text-xl font-bold font-heading">Absen Masuk (Check-In)</h3>
          <p class="text-xs text-slate-300 leading-relaxed max-w-sm">
            Ambil verifikasi foto selfie dan lokasi GPS untuk mencatat waktu hadir resmi Anda hari ini.
          </p>
        </div>
        <button
          @click="openCheckInCamera"
          class="relative z-10 w-full rounded-xl bg-accent-500 hover:bg-accent-400 py-3 text-xs font-bold text-primary-950 shadow-md transition-all duration-200 active:scale-98 flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          </svg>
          Check-In Sekarang
        </button>
      </div>

      <!-- Check-Out Card -->
      <div class="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-lg shadow-slate-950/20 relative overflow-hidden flex flex-col justify-between space-y-6">
        <div class="absolute -right-6 -bottom-6 text-slate-700/20 text-9xl pointer-events-none select-none">
          ⏱️
        </div>
        <div class="relative z-10 space-y-2">
          <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md border border-white/15 text-emerald-300">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            Presensi Keluar
          </div>
          <h3 class="text-xl font-bold font-heading">Absen Keluar (Check-Out)</h3>
          <p class="text-xs text-slate-300 leading-relaxed max-w-sm">
            Selesaikan jam kerja hari ini untuk menghitung total durasi efektif dan lembur kerja.
          </p>
        </div>
        <button
          @click="executeCheckOut"
          :disabled="isSubmitting"
          class="relative z-10 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 py-3 text-xs font-bold text-white shadow-md transition-all duration-200 active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {{ isSubmitting ? 'Memproses...' : 'Check-Out Sekarang' }}
        </button>
      </div>
    </div>

    <!-- Tab Navigation -->
    <div class="flex border-b border-slate-200 gap-8 text-sm font-semibold">
      <button
        @click="activeTab = 'logs'"
        :class="[
          'pb-3 transition-colors border-b-2 flex items-center gap-2',
          activeTab === 'logs'
            ? 'border-primary-800 text-primary-800 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        ]"
      >
        <span>📋 Log Kehadiran Hari Ini</span>
      </button>
      <button
        @click="activeTab = 'heatmap'"
        :class="[
          'pb-3 transition-colors border-b-2 flex items-center gap-2',
          activeTab === 'heatmap'
            ? 'border-primary-800 text-primary-800 font-bold'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        ]"
      >
        <span>🗓️ Heatmap Presensi (2D)</span>
      </button>
    </div>

    <!-- TAB 1: Attendance Logs Table -->
    <div v-if="activeTab === 'logs'" class="space-y-4">
      <div class="overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-200/80">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50/90 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">Karyawan</th>
                <th class="px-6 py-4">Jam Masuk</th>
                <th class="px-6 py-4">Jam Keluar</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Koordinat GPS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loadingLogs" class="animate-pulse">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                  <div class="inline-flex items-center gap-2">
                    <svg class="w-5 h-5 animate-spin text-primary-600" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Memuat catatan presensi...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="logs.length === 0">
                <td colspan="5" class="px-6 py-12 text-center text-slate-400">
                  Belum ada log presensi untuk hari ini.
                </td>
              </tr>
              <tr
                v-else
                v-for="log in logs"
                :key="log.id"
                class="hover:bg-slate-50/90 transition-colors"
              >
                <td class="px-6 py-4 font-bold text-slate-900">
                  {{ log.employee?.name || log.employeeId || 'Karyawan' }}
                </td>
                <td class="px-6 py-4 font-mono font-semibold text-emerald-700">
                  {{ log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString('id-ID') : '-' }}
                </td>
                <td class="px-6 py-4 font-mono font-semibold text-rose-700">
                  {{ log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString('id-ID') : '-' }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border',
                      log.status === 'PRESENT'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : log.status === 'LATE'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    ]"
                  >
                    {{ log.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs font-mono text-slate-500">
                  <span v-if="log.latitude && log.longitude" class="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                    📍 {{ log.latitude.toFixed(4) }}, {{ log.longitude.toFixed(4) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: 2D Heatmap Grid -->
    <div v-if="activeTab === 'heatmap'">
      <Heatmap2D />
    </div>

    <!-- Camera Verification Modal -->
    <div
      v-if="isCameraModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-base font-bold text-slate-900 font-heading">Verifikasi Presensi Face & GPS</h3>
          <button @click="stopCamera" class="text-slate-400 hover:text-slate-600 text-lg">✕</button>
        </div>

        <div class="relative overflow-hidden rounded-xl bg-slate-900 aspect-video flex items-center justify-center border border-slate-800">
          <video ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
          <canvas ref="canvasRef" class="hidden"></canvas>
          <div class="absolute bottom-3 left-3 rounded-lg bg-slate-950/80 backdrop-blur-md px-3 py-1.5 text-xs text-white border border-white/10 font-mono">
            📍 Lat: {{ locationCoords.latitude?.toFixed(4) || 'Mencari...' }}, Long: {{ locationCoords.longitude?.toFixed(4) || 'Mencari...' }}
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="stopCamera"
            class="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            @click="captureAndSubmitCheckIn"
            :disabled="isSubmitting"
            class="rounded-xl bg-primary-900 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-primary-800 transition-colors disabled:opacity-50"
          >
            {{ isSubmitting ? 'Verifikasi...' : 'Foto & Catat Absen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
