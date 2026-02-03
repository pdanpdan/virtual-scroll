<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const rowCount = ref(1000000);
const columnCount = ref(1000);
const itemSize = ref(50);
const columnWidth = ref(150);
const gap = ref(0);
const columnGap = ref(0);
const scrollbarCrossGap = ref(8);
const virtualScrollbars = ref(false);
const useCustomSlot = ref(false);

const items = computed(() => Array.from({ length: rowCount.value }, (_, i) => ({
  id: i,
  text: `Row ${ i }`,
})));

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-5">Custom Scrollbar</span>
    </template>

    <template #description>
      Demonstrates the virtual scrollbar implementation in a grid layout. The scrollbars are rendered as children of the virtual scroll container and are fully customizable.
      Virtual scrollbars are automatically used for massive content, but can also be forced for smaller lists to maintain consistent cross-browser styling.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    </template>

    <template #controls>
      <ScrollStatus
        :scroll-details="scrollDetails"
        direction="both"
        :column-range="virtualScrollRef?.columnRange"
      />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Force Virtual Scrollbars</span>
          <input v-model="virtualScrollbars" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Show Custom Scrollbars</span>
          <input v-model="useCustomSlot" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Rows</span>
          <select v-model="rowCount" class="select select-bordered select-sm w-24" aria-label="Row count">
            <option :value="10">10</option>
            <option :value="100">100</option>
            <option :value="1000">1,000</option>
            <option :value="10000">10,000</option>
            <option :value="100000">100,000</option>
            <option :value="1000000">1,000,000</option>
          </select>
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Cols</span>
          <select v-model="columnCount" class="select select-bordered select-sm w-24" aria-label="Column count">
            <option :value="10">10</option>
            <option :value="100">100</option>
            <option :value="1000">1,000</option>
            <option :value="10000">10,000</option>
            <option :value="100000">100,000</option>
            <option :value="1000000">1,000,000</option>
          </select>
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Item H</span>
          <input
            v-model.number="itemSize"
            type="number"
            min="10"
            max="200"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Item W</span>
          <input
            v-model.number="columnWidth"
            type="number"
            min="50"
            max="500"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Row Gap</span>
          <input
            v-model.number="gap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Col Gap</span>
          <input
            v-model.number="columnGap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50" title="Scrollbar cross gap">SB Gap</span>
          <input
            v-model.number="scrollbarCrossGap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      direction="both"
      :column-count="columnCount"
      :column-width="columnWidth"
      :gap="gap"
      :column-gap="columnGap"
      :virtual-scrollbar="virtualScrollbars"
      :style="{
        '--vs-scrollbar-has-cross-gap': 1,
        '--vs-scrollbar-cross-gap': `${ scrollbarCrossGap }px`,
      }"
      @scroll="onScroll"
    >
      <template #item="{ index, columnRange, getColumnWidth, columnGap: slotColumnGap }">
        <div class="example-grid-row">
          <div
            v-for="colIndex in Array.from({ length: columnRange.end - columnRange.start }, (_, i) => columnRange.start + i)"
            :key="colIndex"
            class="example-grid-cell border-e border-b"
            :style="{
              width: `${ getColumnWidth(colIndex) }px`,
              marginInlineStart: colIndex > 0 ? `${ slotColumnGap }px` : 0,
            }"
          >
            <span class="example-badge">#{{ index }},{{ colIndex }}</span>
          </div>
        </div>
      </template>

      <template v-if="useCustomSlot" #scrollbar="{ trackProps, thumbProps, scrollbarProps: { axis } }">
        <div
          v-if="axis === 'vertical'"
          v-bind="trackProps"
          class="w-4 bg-primary/25 end-0 rounded-e-none rounded-s-xl overflow-clip"
        >
          <div
            v-bind="thumbProps"
            class="bg-primary/60 hover:bg-primary/90 transition-colors rounded-sm"
          />
        </div>
        <div
          v-else-if="axis === 'horizontal'"
          v-bind="trackProps"
          class="h-4 bg-secondary/25 bottom-0 rounded-b-none rounded-t-xl overflow-clip"
        >
          <div
            v-bind="thumbProps"
            class="bg-secondary/60 hover:bg-secondary/90 transition-colors rounded-sm"
          />
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
