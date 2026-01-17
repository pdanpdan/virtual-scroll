<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, reactive, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const rowCount = ref(1000);
const colCount = ref(1000);
const defaultRowHeight = ref(35);
const defaultColWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);

const manualRowHeights = reactive<Record<number, number>>({});
const manualColWidths = reactive<Record<number, number>>({});

const getRowHeight = (_item: unknown, index: number) => manualRowHeights[ index ] ?? defaultRowHeight.value;
const getColWidth = (index: number) => manualColWidths[ index ] ?? defaultColWidth.value;

// Generate column labels (A, B, C, ..., AA, AB, ...)
function getColumnLabel(index: number): string {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
}

const items = computed(() => Array.from({ length: rowCount.value }, (_, i) => ({
  id: i,
  label: `Row ${ i + 1 }`,
})));

const virtualScrollRef = ref();
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}

function handleScrollToIndex(row: number | null, col: number | null, align: ScrollAlignment | ScrollAlignmentOptions) {
  virtualScrollRef.value?.scrollToIndex(row, col, align);
}

function handleScrollToOffset(x: number | null, y: number | null) {
  virtualScrollRef.value?.scrollToOffset(x, y);
}

function getCellContent(row: number, col: number) {
  if (row === 0) {
    return getColumnLabel(col - 1);
  }
  if (col === 0) {
    return row;
  }
  return `R${ row }C${ col }`;
}

// Resizing logic
const resizing = ref<{
  type: 'row' | 'col';
  index: number;
  initialPos: number;
  initialSize: number;
} | null>(null);

function startResizing(e: PointerEvent, type: 'row' | 'col', index: number) {
  e.preventDefault();
  e.stopPropagation();

  const initialSize = type === 'row' ? getRowHeight(null, index) : getColWidth(index);
  const initialPos = type === 'row' ? e.clientY : e.clientX;

  resizing.value = { type, index, initialPos, initialSize };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', stopResizing);
  document.body.style.cursor = type === 'row' ? 'row-resize' : 'col-resize';
}

let rafId: number | null = null;

function handlePointerMove(e: PointerEvent) {
  if (!resizing.value) {
    return;
  }

  const { type, index, initialPos, initialSize } = resizing.value;
  const currentPos = type === 'row' ? e.clientY : e.clientX;
  const delta = currentPos - initialPos;
  const newSize = Math.max(20, initialSize + delta);

  if (type === 'row') {
    manualRowHeights[ index ] = newSize;
  } else {
    manualColWidths[ index ] = newSize;
  }

  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      virtualScrollRef.value?.refresh();
      rafId = null;
    });
  }
}

function stopResizing() {
  resizing.value = null;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', stopResizing);
  document.body.style.cursor = '';
  virtualScrollRef.value?.refresh();
}
</script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="text-secondary font-bold uppercase opacity-60 pe-2 align-baseline">Spreadsheet</span>
    </template>

    <template #description>
      A bidirectional grid demonstrating spreadsheet-like functionality with {{ rowCount.toLocaleString() }} rows and {{ colCount.toLocaleString() }} columns.
      Features include <strong>sticky column headers</strong> (A, B, C...) and <strong>sticky row headers</strong> (1, 2, 3...).
      <strong>New:</strong> Drag the edges of headers to resize rows and columns.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5" />
      </svg>
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="both" />

        <ScrollControls
          v-model:item-count="rowCount"
          v-model:item-size="defaultRowHeight"
          v-model:column-count="colCount"
          v-model:column-width="defaultColWidth"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          direction="both"
          @scroll-to-index="handleScrollToIndex"
          @scroll-to-offset="handleScrollToOffset"
          @refresh="virtualScrollRef?.refresh()"
        />
      </div>
    </template>

    <div class="spreadsheet-wrapper border border-base-300 rounded-box overflow-hidden bg-base-200">
      <VirtualScroll
        ref="virtualScrollRef"
        :items="items"
        :item-size="getRowHeight"
        direction="both"
        :column-count="colCount"
        :column-width="getColWidth"
        :buffer-before="bufferBefore"
        :buffer-after="bufferAfter"
        :debug="debugMode"
        :sticky-indices="[0]"
        class="spreadsheet-grid"
        @scroll="onScroll"
      >
        <template #item="{ index, columnRange, isStickyActive }">
          <div
            class="spreadsheet-row flex-nowrap"
            :class="{ 'is-header-row': index === 0, 'is-sticky': isStickyActive }"
            :style="{ height: `${ getRowHeight(null, index) }px` }"
          >
            <!-- Row Header (Column 0) - Always rendered and sticky -->
            <div
              class="spreadsheet-cell row-header shrink-0"
              :style="{
                width: `${ getColWidth(0) }px`,
                height: `${ getRowHeight(null, index) }px`,
              }"
            >
              {{ index === 0 ? '' : index }}
              <div
                v-if="index > 0"
                class="row-resizer"
                @pointerdown="startResizing($event, 'row', index)"
              />
            </div>

            <!-- Spacer for virtualized columns (accounting for the manually rendered Column 0) -->
            <div
              class="shrink-0"
              :style="{
                width: `${ Math.max(0, columnRange.padStart - getColWidth(0)) }px`,
              }"
            />

            <!-- Visible Cells (excluding Column 0) -->
            <template v-for="colIdx in (columnRange.end - columnRange.start)" :key="colIdx + columnRange.start">
              <div
                v-if="(colIdx - 1 + columnRange.start) > 0"
                class="spreadsheet-cell shrink-0"
                :class="{ 'col-header': index === 0 }"
                :style="{
                  width: `${ getColWidth(colIdx - 1 + columnRange.start) }px`,
                  height: `${ getRowHeight(null, index) }px`,
                }"
              >
                {{ getCellContent(index, colIdx - 1 + columnRange.start) }}
                <div
                  v-if="index === 0"
                  class="col-resizer"
                  @pointerdown="startResizing($event, 'col', colIdx - 1 + columnRange.start)"
                />
              </div>
            </template>

            <!-- Spacer for end of row -->
            <div
              class="shrink-0"
              :style="{
                width: `${ columnRange.padEnd }px`,
              }"
            />
          </div>
        </template>
      </VirtualScroll>
    </div>
  </ExampleContainer>
</template>

<style scoped>
@reference "../../assets/style.css";

.spreadsheet-wrapper {
  height: 100%;
}

.spreadsheet-grid {
  @apply bg-base-100;
}

.spreadsheet-row {
  @apply flex whitespace-nowrap bg-base-100 transition-colors;

  &.is-header-row {
    z-index: 30;
  }

  &.is-sticky {
    z-index: 20;
  }

  &:hover {
    @apply bg-base-200/50;
  }
}

.spreadsheet-cell {
  @apply relative inline-flex items-center justify-center border-r border-b border-base-300 text-sm px-2 box-border bg-inherit;
}

.row-header {
  @apply sticky left-0 z-10 font-bold bg-base-300 border-r-2 border-base-300 text-base-content/60;

  .is-header-row & {
    @apply z-40 bg-base-300 text-neutral-content;
  }
}

.col-header {
  @apply font-bold bg-base-300 border-b-2 border-base-300 text-base-content/60;
}

.col-resizer {
  @apply absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-50;
}

.row-resizer {
  @apply absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/50 transition-colors z-50;
}
</style>
