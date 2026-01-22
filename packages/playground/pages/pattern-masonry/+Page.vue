<script setup lang="ts">
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import { createSeededRandom } from '#/random';

import rawCode from './+Page.vue?raw';

interface MasonryItem {
  id: number;
  height: number;
  color: string;
}

const COLUMN_COUNT = 3;
const random = createSeededRandom(6789);

const items = Array.from({ length: 300 }, (_, i) => ({
  id: i,
  height: 150 + random() * 250,
  color: `hsl(${ (i * 137.5) % 360 }, 60%, 65%)`,
}));

// Distribute items into columns
const columns = Array.from({ length: COLUMN_COUNT }, () => [] as MasonryItem[]);
const columnHeights = Array.from({ length: COLUMN_COUNT }, () => 0);

for (const item of items) {
  // Find shortest column
  let shortestIndex = 0;
  for (let j = 1; j < COLUMN_COUNT; j++) {
    if (columnHeights[ j ] < columnHeights[ shortestIndex ]) {
      shortestIndex = j;
    }
  }
  columns[ shortestIndex ].push(item);
  columnHeights[ shortestIndex ] += item.height;
}

const containerRef = ref<HTMLElement | null>(null);
</script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-7">Masonry Grid</span>
    </template>

    <template #description>
      Achieved by placing multiple VirtualScroll components side-by-side, sharing a single scroll container. Each column handles its own virtualization and dynamic heights.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-7"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h8v11H3z M3 16h8v5H3z M13 3h8v6h-8z M13 11h8v10h-8z" />
      </svg>
    </template>

    <template #subtitle>
      Achieve masonry layout by combining multiple columns
    </template>

    <div ref="containerRef" class="size-full overflow-auto bg-base-300">
      <!-- Common wrapper to hold all columns -->
      <div class="flex gap-4 p-4 min-h-full items-start">
        <div
          v-for="(colItems, colIndex) in columns"
          :key="colIndex"
          class="flex-1"
        >
          <VirtualScroll
            class="outline-0"
            style="overflow: visible"
            :container="containerRef || undefined"
            :items="colItems"
          >
            <template #item="{ item }">
              <div
                class="mb-4 rounded-box p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm border border-base-content/5"
                :style="{
                  height: `${ item.height }px`,
                  backgroundColor: item.color,
                }"
              >
                <div class="flex justify-between items-start">
                  <span class="bg-base-300/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-base-content/70">
                    Card #{{ item.id }}
                  </span>
                </div>
                <div class="text-white/90 text-xs font-medium">
                  Dynamic Height: {{ Math.round(item.height) }}px
                </div>
              </div>
            </template>
          </VirtualScroll>
        </div>
      </div>
    </div>
  </ExampleContainer>
</template>
