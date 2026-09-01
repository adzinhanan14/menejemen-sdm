<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { attendanceApi } from '@/api/attendance';
import Heatmap2D from '@/components/Heatmap2D.vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();

const activeTab = ref<'logs' | 'heatmap'>('logs');

const logs = ref<any[]>([]);
const loadingLogs = ref(false);
const todayStatus = ref<any>(null);

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
    // Capture photo frame if video stream is active
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
  fetchTodayLogs();
});
</script>

<template>
  <div class="p-6 md:p-8 space-y-6">
    <!-- Header Title -->
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Manajemen Presensi & Kehadiran</h1>
      <p class="text-sm text-slate-500 mt-1">Lakukan check-in presensi harian, catat jam kerja, dan pantau kalender kehadiran.</p>
    </div>

    <!-- Quick Action Cards (Check-In / Check-Out) -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Check-In Card -->
      <div class="rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-100 flex flex-col justify-between space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              Presensi Masuk
            </span>
            <h3 class="text-xl font-extrabold mt-3">Absen Masuk (Check-In)</h3>
          </div>
          <span class="text-4xl">📸</span>
        </div>
        <p class="text-xs text-indigo-100">
          Ambil foto selfie dan verifikasi lokasi GPS Anda untuk mencatat kehadiran hari ini.
        </p>
        <button
          @click="openCheckInCamera"
          class="w-full rounded-xl bg-white py-3 text-sm font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50 active:scale-95"
        >
          Check-In Sekarang
        </button>
      </div>

      <!-- Check-Out Card -->
      <div class="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-100 flex flex-col justify-between space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <span class="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              Presensi Keluar
            </span>
            <h3 class="text-xl font-extrabold mt-3">Absen Keluar (Check-Out)</h3>
          </div>
          <span class="text-4xl">⏱️</span>
        </div>
        <p class="text-xs text-emerald-100">
          Selesaikan jam kerja hari ini dan hitung otomatis total menit kerja harian.
        </p>
        <button
          @click="executeCheckOut"
          :disabled="isSubmitting"
          class="w-full rounded-xl bg-white py-3 text-sm font-bold text-emerald-700 shadow-md transition hover:bg-emerald-50 active:scale-95 disabled:opacity-50"
        >
          {{ isSubmitting ? 'Memproses...' : 'Check-Out Sekarang' }}
        </button>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-slate-200 gap-6 text-sm font-semibold">
      <button
        @click="activeTab = 'logs'"
        :class="[
          'pb-3 transition border-b-2',
          activeTab === 'logs'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        ]"
      >
        📋 Log Kehadiran Hari Ini
      </button>
      <button
        @click="activeTab = 'heatmap'"
        :class="[
          'pb-3 transition border-b-2',
          activeTab === 'heatmap'
            ? 'border-indigo-600 text-indigo-600'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        ]"
      >
        🗓️ Heatmap Presensi (2D)
      </button>
    </div>

    <!-- TAB 1: Today Attendance Logs -->
    <div v-if="activeTab === 'logs'" class="space-y-4">
      <div class="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200/80">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th class="px-6 py-4">Karyawan</th>
                <th class="px-6 py-4">Waktu Masuk</th>
                <th class="px-6 py-4">Waktu Keluar</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4">Lokasi (Lat, Long)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-if="loadingLogs" class="animate-pulse">
                <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                  Memuat data log presensi...
                </td>
              </tr>
              <tr v-else-if="logs.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                  Belum ada catatan presensi hari ini.
                </td>
              </tr>
              <tr
                v-else
                v-for="log in logs"
                :key="log.id"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <td class="px-6 py-4 font-semibold text-slate-800">
                  {{ log.employee?.name || log.employeeId || 'Karyawan' }}
                </td>
                <td class="px-6 py-4 text-emerald-600 font-medium">
                  {{ log.checkInTime ? new Date(log.checkInTime).toLocaleTimeString() : '-' }}
                </td>
                <td class="px-6 py-4 text-rose-600 font-medium">
                  {{ log.checkOutTime ? new Date(log.checkOutTime).toLocaleTimeString() : '-' }}
                </td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      log.status === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.status === 'LATE'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    ]"
                  >
                    {{ log.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs font-mono text-slate-500">
                  {{ log.latitude && log.longitude ? `${log.latitude.toFixed(4)}, ${log.longitude.toFixed(4)}` : '-' }}
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

    <!-- Camera Snapshot Modal -->
    <div
      v-if="isCameraModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
    >
      <div class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-lg font-bold text-slate-800">Verifikasi Kamera & Lokasi</h3>
          <button @click="stopCamera" class="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        <div class="relative overflow-hidden rounded-xl bg-slate-900 aspect-video flex items-center justify-center">
          <video ref="videoRef" autoplay playsinline class="w-full h-full object-cover"></video>
          <canvas ref="canvasRef" class="hidden"></canvas>
          <div class="absolute bottom-2 left-2 rounded-lg bg-slate-900/70 backdrop-blur-md px-3 py-1 text-xs text-white">
            📍 Lat: {{ locationCoords.latitude?.toFixed(4) || 'Fetching...' }}, Long: {{ locationCoords.longitude?.toFixed(4) || 'Fetching...' }}
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="stopCamera"
            class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Batal
          </button>
          <button
            @click="captureAndSubmitCheckIn"
            :disabled="isSubmitting"
            class="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ isSubmitting ? 'Verifikasi...' : 'Foto & Ambil Absen' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
