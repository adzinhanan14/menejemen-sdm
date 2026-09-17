<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const activeTab = ref<'company' | 'policy' | 'payroll' | 'security' | 'notifications'>('company');
const saving = ref(false);
const showToast = ref(false);
const toastMessage = ref('');

// Settings Form State
const companyForm = ref({
  name: 'PT Menejemen SDM Indonesia',
  legalName: 'PT Menejemen SDM Indonesia Tbk',
  npwp: '01.234.567.8-012.000',
  email: 'hr@menejemen-sdm.co.id',
  phone: '+62 21 555 1234',
  website: 'https://menejemen-sdm.co.id',
  address: 'Jl. Jendral Sudirman No. 45, Jakarta Selatan 12190',
  timezone: 'Asia/Jakarta (WIB)',
});

const policyForm = ref({
  annualLeaveQuota: 12,
  gracePeriodMinutes: 15,
  workStartHour: '08:00',
  workEndHour: '17:00',
  geofenceRadiusMeters: 100,
  enableGeofencing: true,
  allowMobileCheckin: true,
  autoApproveOvertime: false,
});

const payrollForm = ref({
  cutoffDate: 25,
  paydayDate: 1,
  taxMethod: 'TER', // TER / Gross / Net / GrossUp
  bpjsHealthCompany: 4.0,
  bpjsHealthEmployee: 1.0,
  bpjsEmploymentJHTCompany: 3.7,
  bpjsEmploymentJHTEmployee: 2.0,
  currency: 'IDR (Rp)',
});

const securityForm = ref({
  email: authStore.user?.email || 'admin@hrms.com',
  role: 'Administrator / HR Super Admin',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  enable2FA: false,
});

const notificationForm = ref({
  emailAlerts: true,
  whatsappGateway: false,
  leaveRequestNotify: true,
  payrollRunNotify: true,
  lateAttendanceNotify: true,
});

// Load saved settings from localStorage if available
onMounted(() => {
  try {
    const savedCompany = localStorage.getItem('hrms_setting_company');
    if (savedCompany) companyForm.value = JSON.parse(savedCompany);

    const savedPolicy = localStorage.getItem('hrms_setting_policy');
    if (savedPolicy) policyForm.value = JSON.parse(savedPolicy);

    const savedPayroll = localStorage.getItem('hrms_setting_payroll');
    if (savedPayroll) payrollForm.value = JSON.parse(savedPayroll);

    const savedNotif = localStorage.getItem('hrms_setting_notification');
    if (savedNotif) notificationForm.value = JSON.parse(savedNotif);
  } catch (err) {
    console.error('Failed to parse saved settings', err);
  }
});

const triggerToast = (msg: string) => {
  toastMessage.value = msg;
  showToast.value = true;
  setTimeout(() => {
    showToast.value = false;
  }, 3500);
};

const handleSaveSettings = async () => {
  if (activeTab.value === 'security' && securityForm.value.newPassword) {
    if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
      triggerToast('⚠️ Konfirmasi kata sandi baru tidak cocok!');
      return;
    }
  }

  saving.value = true;
  try {
    // Save to localStorage for persistence
    localStorage.setItem('hrms_setting_company', JSON.stringify(companyForm.value));
    localStorage.setItem('hrms_setting_policy', JSON.stringify(policyForm.value));
    localStorage.setItem('hrms_setting_payroll', JSON.stringify(payrollForm.value));
    localStorage.setItem('hrms_setting_notification', JSON.stringify(notificationForm.value));

    await new Promise((resolve) => setTimeout(resolve, 600));
    triggerToast('✅ Pengaturan berhasil diperbarui!');
    
    // Clear password fields after save
    securityForm.value.currentPassword = '';
    securityForm.value.newPassword = '';
    securityForm.value.confirmPassword = '';
  } catch (e) {
    triggerToast('❌ Gagal menyimpan pengaturan');
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="p-6 md:p-8 space-y-7 animate-fade-in relative">
    
    <!-- Toast Notification Alert -->
    <Transition name="slide-down">
      <div
        v-if="showToast"
        class="fixed top-5 right-5 z-50 flex items-center gap-3 rounded-2xl bg-surface-900 text-white px-5 py-3.5 shadow-card-xl border border-surface-700 text-sm font-medium"
      >
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Header Banner -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-surface-200 shadow-card">
      <div>
        <div class="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary mb-2">
          <span class="h-2 w-2 rounded-full bg-primary animate-pulse-soft"></span>
          Konfigurasi Sistem
        </div>
        <h1 class="text-2xl font-heading font-extrabold text-surface-900 tracking-tight">
          Pengaturan Sistem & Profil Perusahaan
        </h1>
        <p class="text-xs text-surface-500 mt-1">
          Kelola profil organisasi, aturan cuti & jam kerja presensi, skema penggajian, serta preferensi akun Anda.
        </p>
      </div>

      <button
        @click="handleSaveSettings"
        :disabled="saving"
        class="btn-primary shrink-0 flex items-center gap-2 px-5 py-2.5 shadow-primary"
      >
        <svg v-if="saving" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
        </svg>
        {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
      </button>
    </div>

    <!-- Main Settings Container (Sidebar Tabs + Content) -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

      <!-- Navigation Sidebar -->
      <div class="card p-3 space-y-1 shadow-card border border-surface-200 bg-white">
        <button
          @click="activeTab = 'company'"
          class="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200"
          :class="activeTab === 'company' ? 'bg-primary text-white shadow-primary' : 'text-surface-700 hover:bg-surface-100'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/>
          </svg>
          Profil Perusahaan
        </button>

        <button
          @click="activeTab = 'policy'"
          class="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200"
          :class="activeTab === 'policy' ? 'bg-primary text-white shadow-primary' : 'text-surface-700 hover:bg-surface-100'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Kebijakan & Presensi
        </button>

        <button
          @click="activeTab = 'payroll'"
          class="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200"
          :class="activeTab === 'payroll' ? 'bg-primary text-white shadow-primary' : 'text-surface-700 hover:bg-surface-100'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
          </svg>
          Penggajian & BPJS
        </button>

        <button
          @click="activeTab = 'security'"
          class="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200"
          :class="activeTab === 'security' ? 'bg-primary text-white shadow-primary' : 'text-surface-700 hover:bg-surface-100'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Akun & Keamanan
        </button>

        <button
          @click="activeTab = 'notifications'"
          class="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl transition-all duration-200"
          :class="activeTab === 'notifications' ? 'bg-primary text-white shadow-primary' : 'text-surface-700 hover:bg-surface-100'"
        >
          <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifikasi & Alert
        </button>
      </div>

      <!-- Tab Content Area (3 Columns) -->
      <div class="lg:col-span-3 card p-6 md:p-8 space-y-6 shadow-card border border-surface-200 bg-white">
        
        <!-- TAB 1: PROFIL PERUSAHAAN -->
        <div v-if="activeTab === 'company'" class="space-y-6 animate-fade-in">
          <div>
            <h3 class="text-base font-heading font-extrabold text-surface-900">Profil Organisasi & Identitas Perusahaan</h3>
            <p class="text-xs text-surface-500">Informasi ini akan tercetak pada Slip Gaji, Laporan SDM, dan Dokumen Resmi.</p>
          </div>

          <!-- Logo & Header upload placeholder -->
          <div class="flex items-center gap-5 p-4 rounded-xl border border-surface-200 bg-surface-100/60">
            <div class="h-16 w-16 rounded-2xl bg-primary text-white font-heading font-extrabold text-xl flex items-center justify-center shadow-card shrink-0">
              HRMS
            </div>
            <div>
              <h4 class="text-xs font-bold text-surface-800">Logo Resmi Perusahaan</h4>
              <p class="text-[11px] text-surface-400 mt-0.5">Format PNG, JPG atau SVG. Maksimal ukuran berkas 2 MB.</p>
              <button class="mt-2 text-xs font-bold text-primary hover:underline">Unggah Logo Baru</button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Nama Perusahaan (Brand)</label>
              <input v-model="companyForm.name" type="text" class="input" placeholder="Nama Perusahaan" />
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Nama Badan Hukum (Legal)</label>
              <input v-model="companyForm.legalName" type="text" class="input" placeholder="PT / CV Nama Perusahaan" />
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Nomor NPWP Perusahaan</label>
              <input v-model="companyForm.npwp" type="text" class="input" placeholder="00.000.000.0-000.000" />
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Email HR / Resmi</label>
              <input v-model="companyForm.email" type="email" class="input" placeholder="email@perusahaan.com" />
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Telepon Kantor</label>
              <input v-model="companyForm.phone" type="text" class="input" placeholder="+62 21 xxx xxxx" />
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Website Resmi</label>
              <input v-model="companyForm.website" type="text" class="input" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-surface-700 mb-1.5">Alamat Kantor Pusat</label>
            <textarea v-model="companyForm.address" rows="3" class="input" placeholder="Alamat lengkap kantor..."></textarea>
          </div>

          <div>
            <label class="block text-xs font-bold text-surface-700 mb-1.5">Zona Waktu Default Operasional</label>
            <select v-model="companyForm.timezone" class="input">
              <option value="Asia/Jakarta (WIB)">Asia/Jakarta (WIB - UTC+7)</option>
              <option value="Asia/Makassar (WITA)">Asia/Makassar (WITA - UTC+8)</option>
              <option value="Asia/Jayapura (WIT)">Asia/Jayapura (WIT - UTC+9)</option>
            </select>
          </div>
        </div>

        <!-- TAB 2: KEBIJAKAN & PRESENSI -->
        <div v-else-if="activeTab === 'policy'" class="space-y-6 animate-fade-in">
          <div>
            <h3 class="text-base font-heading font-extrabold text-surface-900">Kebijakan Cuti, Presensi & Jam Kerja</h3>
            <p class="text-xs text-surface-500">Atur jatah cuti tahunan, batas toleransi keterlambatan, dan fitur presensi mobile GPS.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="p-4 rounded-xl border border-surface-200 bg-surface-100/50 space-y-3">
              <label class="block text-xs font-bold text-surface-800">Kuota Cuti Tahunan Standar (Hari)</label>
              <input v-model.number="policyForm.annualLeaveQuota" type="number" min="0" class="input bg-white" />
              <p class="text-[11px] text-surface-400">Jatah cuti default yang diberikan kepada karyawan baru tiap tahun.</p>
            </div>

            <div class="p-4 rounded-xl border border-surface-200 bg-surface-100/50 space-y-3">
              <label class="block text-xs font-bold text-surface-800">Toleransi Keterlambatan (Menit)</label>
              <input v-model.number="policyForm.gracePeriodMinutes" type="number" min="0" class="input bg-white" />
              <p class="text-[11px] text-surface-400">Presensi setelah batas waktu ini akan ditandai sebagai Terlambat.</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Jam Masuk Standar</label>
              <input v-model="policyForm.workStartHour" type="time" class="input" />
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Jam Pulang Standar</label>
              <input v-model="policyForm.workEndHour" type="time" class="input" />
            </div>
          </div>

          <div class="section-divider"></div>

          <!-- Toggles & Geofencing -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-surface-500">Validasi Presensi & GPS Geofencing</h4>

            <div class="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white">
              <div>
                <p class="text-xs font-bold text-surface-800">Aktifkan Pembatasan Radius GPS (Geofencing)</p>
                <p class="text-[11px] text-surface-400 mt-0.5">Membatasi lokasi check-in karyawan hanya di sekitar koordinat lokasi kantor.</p>
              </div>
              <input v-model="policyForm.enableGeofencing" type="checkbox" class="h-5 w-5 rounded text-primary focus:ring-primary" />
            </div>

            <div v-if="policyForm.enableGeofencing" class="p-4 rounded-xl border border-surface-200 bg-primary-50/50 space-y-2">
              <label class="block text-xs font-bold text-primary">Maksimal Radius Lokasi Kantor (Meter)</label>
              <input v-model.number="policyForm.geofenceRadiusMeters" type="number" min="10" class="input bg-white" />
              <p class="text-[11px] text-surface-500">Contoh: 100 meter dari titik GPS kantor.</p>
            </div>

            <div class="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white">
              <div>
                <p class="text-xs font-bold text-surface-800">Izinkan Presensi Mandiri Mobile (WFH / Field)</p>
                <p class="text-[11px] text-surface-400 mt-0.5">Karyawan dapat melakukan check-in via perangkat seluler.</p>
              </div>
              <input v-model="policyForm.allowMobileCheckin" type="checkbox" class="h-5 w-5 rounded text-primary focus:ring-primary" />
            </div>
          </div>
        </div>

        <!-- TAB 3: PENGGAJIAN & BPJS -->
        <div v-else-if="activeTab === 'payroll'" class="space-y-6 animate-fade-in">
          <div>
            <h3 class="text-base font-heading font-extrabold text-surface-900">Aturan Penggajian, PPh 21 & BPJS</h3>
            <p class="text-xs text-surface-500">Sesuaikan tanggal cut-off presensi, metode pajak PPh 21 TER, dan persentase potong BPJS.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Tanggal Cut-Off Presensi Bulanan</label>
              <select v-model.number="payrollForm.cutoffDate" class="input">
                <option v-for="d in 28" :key="d" :value="d">Tanggal {{ d }} tiap bulan</option>
              </select>
              <p class="text-[10px] text-surface-400 mt-1">Siklus perhitungan hadir & lembur untuk gajian bulan ini.</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Tanggal Pembayaran Gaji (Payday)</label>
              <select v-model.number="payrollForm.paydayDate" class="input">
                <option v-for="d in 28" :key="d" :value="d">Tanggal {{ d }} bulan berikutnya</option>
              </select>
              <p class="text-[10px] text-surface-400 mt-1">Tanggal transfer slip penggajian ke rekening karyawan.</p>
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Metode Perhitungan Pajak PPh 21</label>
              <select v-model="payrollForm.taxMethod" class="input">
                <option value="TER">Metode Tarif Efektif Rata-Rata (TER 2024)</option>
                <option value="Gross">Gross (Pajak dipotong dari gaji karyawan)</option>
                <option value="GrossUp">Gross-Up (Pajak ditunjang penuh perusahaan)</option>
                <option value="Nett">Nett (Gaji bersih tanpa potongan pajak)</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Mata Uang Default</label>
              <input v-model="payrollForm.currency" type="text" class="input" readonly />
            </div>
          </div>

          <div class="section-divider"></div>

          <!-- BPJS Rules -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-surface-500">Persentase Iuran BPJS Kesehatan & Ketenagakerjaan</h4>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="p-4 rounded-xl border border-surface-200 bg-surface-100/50 space-y-2">
                <label class="block text-xs font-bold text-surface-800">BPJS Kesehatan - Perusahaan (%)</label>
                <input v-model.number="payrollForm.bpjsHealthCompany" type="number" step="0.1" class="input bg-white" />
              </div>

              <div class="p-4 rounded-xl border border-surface-200 bg-surface-100/50 space-y-2">
                <label class="block text-xs font-bold text-surface-800">BPJS Kesehatan - Karyawan (%)</label>
                <input v-model.number="payrollForm.bpjsHealthEmployee" type="number" step="0.1" class="input bg-white" />
              </div>

              <div class="p-4 rounded-xl border border-surface-200 bg-surface-100/50 space-y-2">
                <label class="block text-xs font-bold text-surface-800">BPJS JHT - Perusahaan (%)</label>
                <input v-model.number="payrollForm.bpjsEmploymentJHTCompany" type="number" step="0.1" class="input bg-white" />
              </div>

              <div class="p-4 rounded-xl border border-surface-200 bg-surface-100/50 space-y-2">
                <label class="block text-xs font-bold text-surface-800">BPJS JHT - Karyawan (%)</label>
                <input v-model.number="payrollForm.bpjsEmploymentJHTEmployee" type="number" step="0.1" class="input bg-white" />
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 4: AKUN & KEAMANAN -->
        <div v-else-if="activeTab === 'security'" class="space-y-6 animate-fade-in">
          <div>
            <h3 class="text-base font-heading font-extrabold text-surface-900">Keamanan Akun & Kredensial Login</h3>
            <p class="text-xs text-surface-500">Perbarui alamat email admin, ubah kata sandi, dan atur keamanan dua faktor (2FA).</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Email Pengguna saat ini</label>
              <input v-model="securityForm.email" type="email" class="input" readonly />
            </div>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Hak Akses Role</label>
              <input v-model="securityForm.role" type="text" class="input" readonly />
            </div>
          </div>

          <div class="section-divider"></div>

          <!-- Change Password Form -->
          <div class="space-y-4">
            <h4 class="text-xs font-bold uppercase tracking-wider text-surface-500">Ubah Kata Sandi (Password)</h4>

            <div>
              <label class="block text-xs font-bold text-surface-700 mb-1.5">Kata Sandi Saat Ini</label>
              <input v-model="securityForm.currentPassword" type="password" class="input" placeholder="Masukkan kata sandi lama..." />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-surface-700 mb-1.5">Kata Sandi Baru</label>
                <input v-model="securityForm.newPassword" type="password" class="input" placeholder="Minimal 8 karakter..." />
              </div>

              <div>
                <label class="block text-xs font-bold text-surface-700 mb-1.5">Konfirmasi Kata Sandi Baru</label>
                <input v-model="securityForm.confirmPassword" type="password" class="input" placeholder="Ulangi kata sandi baru..." />
              </div>
            </div>
          </div>

          <div class="section-divider"></div>

          <!-- 2FA Security -->
          <div class="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-surface-100/50">
            <div>
              <p class="text-xs font-bold text-surface-800">Autentikasi Dua Faktor (2FA)</p>
              <p class="text-[11px] text-surface-400 mt-0.5">Memerlukan kode verifikasi Google Authenticator saat login.</p>
            </div>
            <input v-model="securityForm.enable2FA" type="checkbox" class="h-5 w-5 rounded text-primary focus:ring-primary" />
          </div>
        </div>

        <!-- TAB 5: NOTIFIKASI & ALERT -->
        <div v-else-if="activeTab === 'notifications'" class="space-y-6 animate-fade-in">
          <div>
            <h3 class="text-base font-heading font-extrabold text-surface-900">Channel Notifikasi & Alert Otomatis</h3>
            <p class="text-xs text-surface-500">Tentukan kapan sistem akan mengirimkan pemberitahuan otomatis ke email atau WhatsApp.</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white">
              <div>
                <p class="text-xs font-bold text-surface-800">Notifikasi Email HR Admin</p>
                <p class="text-[11px] text-surface-400 mt-0.5">Kirim salinan pengajuan cuti dan absensi ke email HR.</p>
              </div>
              <input v-model="notificationForm.emailAlerts" type="checkbox" class="h-5 w-5 rounded text-primary focus:ring-primary" />
            </div>

            <div class="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white">
              <div>
                <p class="text-xs font-bold text-surface-800">Pengajuan Cuti Karyawan</p>
                <p class="text-[11px] text-surface-400 mt-0.5">Alert instant ketika karyawan mengajukan permohonan cuti baru.</p>
              </div>
              <input v-model="notificationForm.leaveRequestNotify" type="checkbox" class="h-5 w-5 rounded text-primary focus:ring-primary" />
            </div>

            <div class="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white">
              <div>
                <p class="text-xs font-bold text-surface-800">Alert Pembayaran Payroll</p>
                <p class="text-[11px] text-surface-400 mt-0.5">Kirim email pemberitahuan slip gaji ke karyawan secara otomatis.</p>
              </div>
              <input v-model="notificationForm.payrollRunNotify" type="checkbox" class="h-5 w-5 rounded text-primary focus:ring-primary" />
            </div>

            <div class="flex items-center justify-between p-4 rounded-xl border border-surface-200 bg-white">
              <div>
                <p class="text-xs font-bold text-surface-800">Peringatan Keterlambatan Presensi</p>
                <p class="text-[11px] text-surface-400 mt-0.5">Beritahu supervisor jika staf terlambat presensi 3x berturut-turut.</p>
              </div>
              <input v-model="notificationForm.lateAttendanceNotify" type="checkbox" class="h-5 w-5 rounded text-primary focus:ring-primary" />
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
