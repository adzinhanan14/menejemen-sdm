<template>
  <div class="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm">
    <div class="flex flex-1 justify-between sm:hidden">
      <button
        :disabled="page <= 1"
        @click="$emit('page-change', page - 1)"
        class="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Previous
      </button>
      <button
        :disabled="page >= totalPages"
        @click="$emit('page-change', page + 1)"
        class="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Next
      </button>
    </div>
    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-slate-600">
          Menampilkan Halaman <span class="font-semibold text-slate-900">{{ page }}</span> dari <span class="font-semibold text-slate-900">{{ totalPages }}</span> (Total {{ total }} data)
        </p>
      </div>
      <div>
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button
            :disabled="page <= 1"
            @click="$emit('page-change', page - 1)"
            class="relative inline-flex items-center rounded-l-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 disabled:opacity-40"
          >
            ‹ Prev
          </button>
          <button
            v-for="p in visiblePages"
            :key="p"
            @click="$emit('page-change', p)"
            :class="[
              p === page
                ? 'relative z-10 inline-flex items-center bg-indigo-600 px-4 py-2 text-sm font-semibold text-white focus:z-20'
                : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20'
            ]"
          >
            {{ p }}
          </button>
          <button
            :disabled="page >= totalPages"
            @click="$emit('page-change', page + 1)"
            class="relative inline-flex items-center rounded-r-md px-3 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 disabled:opacity-40"
          >
            Next ›
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  page: number;
  totalPages: number;
  total: number;
}>();

defineEmits<{
  (e: 'page-change', page: number): void;
}>();

const visiblePages = computed(() => {
  const pages: number[] = [];
  const start = Math.max(1, props.page - 2);
  const end = Math.min(props.totalPages, start + 4);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});
</script>
