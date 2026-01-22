<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';

import rawCode from './+Page.vue?raw';

interface Photo {
  id: number;
  thumb: string;
  full: string;
  author: string;
}

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const itemCount = ref(2000);
const columns = ref(4);

const photos = computed(() => Array.from(
  { length: Math.ceil(itemCount.value / columns.value) },
  (_, rowIdx) => Array.from({ length: columns.value }, (_, colIdx) => {
    const id = rowIdx * columns.value + colIdx;

    return {
      id,
      thumb: `https://picsum.photos/seed/${ id + 1 }/400/400`,
      full: `https://picsum.photos/seed/${ id + 1 }/1200/800`,
      author: `Photographer ${ id }`,
    } as Photo;
  }),
));

const selectedPhoto = ref<Photo | null>(null);

function openLightbox(photo: Photo) {
  selectedPhoto.value = photo;
}

function closeLightbox() {
  selectedPhoto.value = null;
}
</script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-6">Photo Gallery</span>
    </template>

    <template #description>
      A high-performance grid gallery displaying {{ itemCount.toLocaleString() }} photos virtualized in both directions. Features lazy-loading placeholders and a lightbox.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-6"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </template>

    <template #subtitle>
      Lazy-loaded image grid with bidirectional virtualization
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-4 items-center">
        <div class="bg-base-300 p-4 rounded-box border border-base-content/5 shadow-sm flex flex-col gap-2 min-w-64">
          <div class="flex justify-between items-center px-1">
            <span class="text-xs font-bold small-caps tracking-widest opacity-70">Grid Columns</span>
            <span class="badge badge-sm badge-primary font-mono">{{ columns }}</span>
          </div>
          <input
            v-model.number="columns"
            type="range"
            min="1"
            max="8"
            step="1"
            class="range range-primary range-xs"
            aria-label="Grid Columns"
          />
        </div>
      </div>
    </template>

    <VirtualScroll
      class="example-container p-4"
      :items="photos"
      :gap="16"
      :debug="debugMode"
    >
      <template #item="{ index: rowIndex, item: rowItems }">
        <div
          :key="`r_${ rowIndex }`"
          class="inline-flex gap-4"
        >
          <button
            v-for="(photo, colIndex) in rowItems"
            :key="`r_${ rowIndex }_c_${ colIndex }`"
            class="rounded-box overflow-hidden relative shadow-sm outline-none border border-base-content/5 focus-visible:ring-2 focus-visible:ring-primary transition-transform active:scale-95 group"
            aria-label="View photo"
            @click="openLightbox(photo)"
          >
            <img
              :src="photo.thumb"
              :alt="`Photo by ${ photo.author }`"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 md:p-4">
              <span class="text-white text-xs md:text-sm font-medium truncate">{{ photo.author }}</span>
            </div>
          </button>
        </div>
      </template>
    </VirtualScroll>

    <!-- Lightbox -->
    <!-- eslint-disable-next-line vue-a11y/no-static-element-interactions -->
    <dialog
      class="modal"
      :class="{ 'modal-open': selectedPhoto }"
      @keydown.esc="closeLightbox"
    >
      <div
        v-if="selectedPhoto"
        class="modal-box p-0 max-w-3xl overflow-hidden bg-transparent shadow-none relative"
      >
        <img
          :src="selectedPhoto.full"
          class="w-full h-auto rounded-box shadow-2xl"
          :alt="`Photo by ${ selectedPhoto.author }`"
        />
        <div class="mt-4 flex items-center justify-between text-white bg-black/40 backdrop-blur-md p-4 rounded-xl">
          <div>
            <h3 class="font-bold text-lg">Image #{{ selectedPhoto.id }}</h3>
            <p class="text-sm opacity-80">By {{ selectedPhoto.author }}</p>
          </div>

          <button class="btn btn-circle btn-ghost" @click="closeLightbox">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <form method="dialog" class="modal-backdrop bg-base-100/60">
        <button type="button" @click="closeLightbox">close</button>
      </form>
    </dialog>
  </ExampleContainer>
</template>
