<script setup lang="ts">
import type { ScrollDetails, VirtualScrollInstance } from '@pdanpdan/virtual-scroll';
import type { ComponentPublicInstance, Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, nextTick, reactive, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { createSeededRandom } from '#/random';

import rawCode from './+Page.vue?raw';

interface MasonryItem {
  id: number;
  height: number;
  color: string;
}

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

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
const scrollDetails = ref<ScrollDetails | null>(null);

const columnRefs = ref<VirtualScrollInstance<MasonryItem>[]>([]);
const itemRefs = reactive(new Map<number, HTMLElement>());

/**
 * Handles keyboard navigation for masonry items.
 *
 * @param event - Keyboard event
 * @param colIndex - Current column index
 * @param itemIndex - Current item index in the column
 * @param item - Current masonry item
 */
function handleKeyDown(event: KeyboardEvent, colIndex: number, itemIndex: number, item: MasonryItem) {
  const colVs = columnRefs.value[ colIndex ];
  if (!colVs) {
    return;
  }

  const offset = colVs.getRowOffset(itemIndex);
  const midY = offset + item.height / 2;

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      if (itemIndex > 0) {
        const nextIdx = itemIndex - 1;
        colVs.scrollToIndex(nextIdx, null, { align: 'center' });
        setTimeout(() => {
          const el = itemRefs.get(columns[ colIndex ][ nextIdx ].id);
          el?.focus({ preventScroll: true });
        });
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (itemIndex < columns[ colIndex ].length - 1) {
        const nextIdx = itemIndex + 1;
        colVs.scrollToIndex(nextIdx, null, { align: 'center' });
        setTimeout(() => {
          const el = itemRefs.get(columns[ colIndex ][ nextIdx ].id);
          el?.focus({ preventScroll: true });
        });
      }
      break;
    case 'ArrowLeft':
    case 'ArrowRight': {
      event.preventDefault();
      const isRight = event.key === 'ArrowRight';
      const nextColIdx = isRight ? colIndex + 1 : colIndex - 1;

      if (nextColIdx >= 0 && nextColIdx < COLUMN_COUNT) {
        const nextColVs = columnRefs.value[ nextColIdx ];
        const nextColItems = columns[ nextColIdx ];

        // Find item in next column that best matches vertical position
        let bestIdx = 0;
        let minDiff = Number.MAX_VALUE;

        for (let i = 0; i < nextColItems.length; i++) {
          const itemOffset = nextColVs.getRowOffset(i);
          const itemHeight = nextColItems[ i ].height;
          const itemMidY = itemOffset + itemHeight / 2;
          const diff = Math.abs(itemMidY - midY);

          if (diff < minDiff) {
            minDiff = diff;
            bestIdx = i;
          } else if (itemMidY > midY + 500) {
            // Optimization: stop searching if we are way past
            break;
          }
        }

        nextColVs.scrollToIndex(bestIdx, null, { align: 'auto' });
        nextTick(() => {
          const el = itemRefs.get(nextColItems[ bestIdx ].id);
          el?.focus();
        });
      }
      break;
    }
  }
}

/**
 * Sets the reference for a masonry item element.
 *
 * @param el - Item element
 * @param id - Item ID
 */
function setItemRef(el: Element | null | ComponentPublicInstance, id: number) {
  if (el) {
    itemRefs.set(id, el as HTMLElement);
  } else {
    itemRefs.delete(id);
  }
}
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

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
    </template>

    <div ref="containerRef" class="size-full overflow-auto bg-base-100">
      <!-- Common wrapper to hold all columns -->
      <div class="flex gap-4 p-4 min-h-full items-start">
        <div
          v-for="(colItems, colIndex) in columns"
          :key="colIndex"
          class="flex-1"
        >
          <VirtualScroll
            ref="columnRefs"
            class="outline-0"
            style="overflow: visible"
            :container="containerRef || undefined"
            :items="colItems"
            :debug="debugMode"
            @scroll="(details) => colIndex === 0 ? scrollDetails = details : undefined"
          >
            <template #item="{ item, index }">
              <div
                :ref="(el) => setItemRef(el, item.id)"
                role="button"
                tabindex="0"
                class="mb-4 rounded-box p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm border border-base-content/5 outline-none focus-visible:ring-4 focus-visible:ring-primary/50 cursor-pointer"
                :style="{
                  height: `${ item.height }px`,
                  backgroundColor: item.color,
                }"
                @keydown="handleKeyDown($event, colIndex, index, item)"
              >
                <div class="flex justify-between items-start">
                  <span class="bg-base-300/30 px-2 py-0.5 rounded text-xs font-bold small-caps tracking-wider text-base-content/70">
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
