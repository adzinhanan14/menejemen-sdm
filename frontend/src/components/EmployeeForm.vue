<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl transition-all border border-slate-100">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 class="text-xl font-bold text-slate-800">
            {{ editData ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru' }}
          </h3>
          <p class="text-xs text-slate-500 mt-1">Lengkapi informasi karyawan melalui 3 langkah di bawah ini.</p>
        </div>
        <button @click="close" class="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          ✕
        </button>
      </div>

      <!-- Step Stepper Header -->
      <div class="my-6 flex items-center justify-between px-6">
        <div v-for="stepNum in 3" :key="stepNum" class="flex items-center">
          <div
            :class="[
              'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all',
              currentStep === stepNum
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                : currentStep > stepNum
                ? 'bg-emerald-500 text-white'
                : 'bg-slate-100 text-slate-400'
            ]"
          >
            <span v-if="currentStep > stepNum">✓</span>
            <span v-else>{{ stepNum }}</span>
          </div>
          <span
            :class="[
              'ml-3 text-xs font-semibold hidden sm:inline-block',
              currentStep === stepNum ? 'text-indigo-600' : 'text-slate-400'
            ]"
          >
            {{ stepTitles[stepNum - 1] }}
          </span>
          <div v-if="stepNum < 3" class="mx-4 h-0.5 w-12 bg-slate-200 hidden sm:block"></div>
        </div>
      </div>

      <!-- Form Content with Step Slide Animation -->
      <form @submit.prevent="handleSubmit">
        <transition name="slide-fade" mode="out-in">
          <!-- STEP 1: Personal Info -->
          <div v-if="currentStep === 1" key="step1" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">NIK *</label>
                <input
                  v-model="values.nik"
                  type="text"
                  placeholder="EMP001"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span class="text-xs text-rose-500">{{ errors.nik }}</span>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap *</label>
                <input
                  v-model="values.name"
                  type="text"
                  placeholder="John Doe"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span class="text-xs text-rose-500">{{ errors.name }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  v-model="values.email"
                  type="email"
                  placeholder="karyawan@perusahaan.com"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span class="text-xs text-rose-500">{{ errors.email }}</span>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">No. Telepon</label>
                <input
                  v-model="values.phone"
                  type="text"
                  placeholder="08123456789"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span class="text-xs text-rose-500">{{ errors.phone }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                <select
                  v-model="values.gender"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="MALE">Laki-laki</option>
                  <option value="FEMALE">Perempuan</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                <input
                  v-model="values.birthDate"
                  type="date"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Alamat Domisili</label>
              <textarea
                v-model="values.address"
                rows="2"
                placeholder="Jl. Merdeka No. 123..."
                class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              ></textarea>
            </div>
          </div>

          <!-- STEP 2: Employment -->
          <div v-else-if="currentStep === 2" key="step2" class="space-y-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Departemen *</label>
                <select
                  v-model="values.departmentId"
                  @change="onDepartmentChange"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">-- Pilih Departemen --</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
                <span class="text-xs text-rose-500">{{ errors.departmentId }}</span>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Jabatan (Position) *</label>
                <select
                  v-model="values.positionId"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="">-- Pilih Jabatan --</option>
                  <option v-for="pos in filteredPositions" :key="pos.id" :value="pos.id">
                    {{ pos.name }}
                  </option>
                </select>
                <span class="text-xs text-rose-500">{{ errors.positionId }}</span>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal Bergabung *</label>
                <input
                  v-model="values.joinDate"
                  type="date"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <span class="text-xs text-rose-500">{{ errors.joinDate }}</span>
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Tipe Kontrak</label>
                <select
                  v-model="values.contractType"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="PROBATION">Probation (Masa Percobaan)</option>
                  <option value="CONTRACT">Kontrak (PKWT)</option>
                  <option value="PERMANENT">Tetap (PKWTT)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- STEP 3: Salary & Bank -->
          <div v-else-if="currentStep === 3" key="step3" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Gaji Pokok (Basic Salary) *</label>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">Rp</span>
                <input
                  v-model.number="values.basicSalary"
                  type="number"
                  placeholder="5000000"
                  class="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <span class="text-xs text-rose-500">{{ errors.basicSalary }}</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Bank</label>
                <input
                  v-model="values.bankName"
                  type="text"
                  placeholder="BCA / Mandiri / BNI"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div>
                <label class="block text-xs font-semibold text-slate-700 mb-1">Nomor Rekening Bank</label>
                <input
                  v-model="values.bankAccountNumber"
                  type="text"
                  placeholder="1234567890"
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>
        </transition>

        <!-- Form Navigation Buttons -->
        <div class="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            v-if="currentStep > 1"
            @click="prevStep"
            class="rounded-xl border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← Kembali
          </button>
          <div v-else></div>

          <div class="flex items-center space-x-3">
            <button
              type="button"
              @click="close"
              class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="button"
              v-if="currentStep < 3"
              @click="nextStep"
              class="rounded-xl bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors"
            >
              Lanjut →
            </button>
            <button
              type="submit"
              v-else
              :disabled="submitting"
              class="rounded-xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {{ submitting ? 'Menyimpan...' : 'Simpan Karyawan' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { departmentApi, positionApi } from '@/api/departments';

const props = defineProps<{
  isOpen: boolean;
  editData?: any;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'saved'): void;
}>();

const currentStep = ref(1);
const submitting = ref(false);
const stepTitles = ['Personal Info', 'Employment', 'Salary & Bank'];

const departments = ref<any[]>([]);
const positions = ref<any[]>([]);

const employeeSchema = toTypedSchema(
  z.object({
    nik: z.string().min(3, 'NIK minimal 3 karakter'),
    name: z.string().min(2, 'Nama minimal 2 karakter'),
    email: z.string().email('Format email tidak valid'),
    phone: z.string().optional(),
    gender: z.string().optional(),
    birthDate: z.string().optional(),
    address: z.string().optional(),
    departmentId: z.string().min(1, 'Pilih departemen'),
    positionId: z.string().min(1, 'Pilih jabatan'),
    joinDate: z.string().min(1, 'Pilih tanggal bergabung'),
    contractType: z.string().optional(),
    basicSalary: z.number({ invalid_type_error: 'Gaji pokok harus angka' }).min(1, 'Gaji pokok wajib diisi'),
    bankName: z.string().optional(),
    bankAccountNumber: z.string().optional(),
  })
);

const { values, errors, setValues, validate } = useForm({
  validationSchema: employeeSchema,
  initialValues: {
    nik: '',
    name: '',
    email: '',
    phone: '',
    gender: 'MALE',
    birthDate: '',
    address: '',
    departmentId: '',
    positionId: '',
    joinDate: new Date().toISOString().split('T')[0],
    contractType: 'PROBATION',
    basicSalary: 5000000,
    bankName: 'BCA',
    bankAccountNumber: '',
  },
});

const fetchMasterData = async () => {
  try {
    const [deptRes, posRes] = await Promise.all([
      departmentApi.getAll(),
      positionApi.getAll(),
    ]);
    departments.value = deptRes.data.data ?? deptRes.data;
    positions.value = posRes.data.data ?? posRes.data;
  } catch (err) {
    console.error('Failed fetching master data', err);
  }
};

onMounted(fetchMasterData);

const filteredPositions = computed(() => {
  if (!values.departmentId) return positions.value;
  return positions.value.filter((p) => p.departmentId === values.departmentId);
});

const onDepartmentChange = () => {
  setValues({ positionId: '' });
};

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      currentStep.value = 1;
      fetchMasterData();
      if (props.editData) {
        setValues({
          nik: props.editData.nik || '',
          name: props.editData.fullName || props.editData.name || '',
          email: props.editData.email || '',
          phone: props.editData.phone || '',
          gender: props.editData.gender || 'MALE',
          birthDate: props.editData.birthDate ? props.editData.birthDate.split('T')[0] : '',
          address: props.editData.currentAddress || props.editData.address || '',
          departmentId: props.editData.currentDepartmentId || props.editData.departmentId || '',
          positionId: props.editData.currentPositionId || props.editData.positionId || '',
          joinDate: props.editData.joiningDate ? props.editData.joiningDate.split('T')[0] : new Date().toISOString().split('T')[0],
          contractType: 'PROBATION',
          basicSalary: props.editData.contracts?.[0]?.baseSalary ? Number(props.editData.contracts[0].baseSalary) : 5000000,
          bankName: props.editData.bankName || 'BCA',
          bankAccountNumber: props.editData.bankAccountNumber || '',
        });
      }
    }
  }
);

const nextStep = () => {
  if (currentStep.value < 3) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const close = () => {
  emit('close');
};

const { useEmployeeStore } = await import('@/store/employee');
const employeeStore = useEmployeeStore();

const handleSubmit = async () => {
  const result = await validate();
  if (!result.valid) return;

  submitting.value = true;
  try {
    if (props.editData?.id) {
      await employeeStore.updateEmployee(props.editData.id, values);
    } else {
      await employeeStore.createEmployee(values);
    }
    emit('saved');
    close();
  } catch (err: any) {
    alert(err?.response?.data?.message || 'Gagal menyimpan data karyawan.');
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.25s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
