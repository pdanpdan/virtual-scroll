<script setup lang="ts">
import type { Data } from './+data';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { useData } from 'vike-vue/useData';
import { computed, inject, ref, watch } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const data = useData<Data>();

const itemCount = ref(data.itemCount);
const itemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(120);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

const columnWidths = computed(() => [ Math.ceil(columnWidth.value * 1.5), columnWidth.value ]);

// SSR Range: from data (simulates state from a store)
const { items, ssrRange } = data;

watch(itemCount, (count) => {
  items.length = 0;
  for (let i = 0; i < count; i += 1) {
    items[ i ] = {
      id: i,
    };
  }
});

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
  handleScrollToIndex,
  handleScrollToOffset,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-4">SSR Support</span>
    </template>

    <template #description>
      Demonstrates the <strong>ssrRange</strong> prop. The grid is configured to start pre-rendered at <strong>Row {{ ssrRange.start }}, Column {{ ssrRange.colStart }}</strong>. On the client, it automatically scrolls to match this range on mount.<br /><br />
      <div class="alert alert-info alert-soft">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 size-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs md:text-sm font-medium">In a real SSR environment, the content for this range would be present in the initial HTML.</span>
      </div>
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-4"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.5a2.25 2.25 0 0 0-2.25-2.25Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15.75h9m-9-3h9m-9-3h3.75" />
        <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 2.625 3 3L12 15l-3 1 1-3 9.375-10.375Z" />
      </svg>
    </template>

    <template #subtitle>
      Pre-rendering and auto-scrolling for Server-Side Rendering
    </template>

    <template #controls>
      <ScrollStatus
        :scroll-details="scrollDetails"
        direction="both"
        :column-range="virtualScrollRef?.columnRange"
      />
      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:column-count="columnCount"
        v-model:column-width="columnWidth"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:sticky-header="stickyHeader"
        v-model:sticky-footer="stickyFooter"
        direction="both"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="both"
      :items="items"
      :item-size="itemSize"
      :column-count="columnCount"
      :column-width="columnWidths"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :ssr-range="ssrRange"
      aria-label="SSR enabled list"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Grid Header
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth, getCellAriaProps }">
        <div :key="`r_${ index }`" class="example-grid-row">
          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="`r_${ index }_c_${ columnRange.start + c - 1 }`"
            :data-col-index="columnRange.start + c - 1"
            class="example-grid-cell"
            :style="{ inlineSize: `${ getColumnWidth(columnRange.start + c - 1) }px` }"
            v-bind="getCellAriaProps(columnRange.start + c - 1)"
          >
            <div class="example-badge mb-2">R{{ index }} &times; C{{ columnRange.start + c - 1 }}</div>
            <div class="opacity-40 tabular-nums">{{ getColumnWidth(columnRange.start + c - 1) }}px</div>
          </div>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          End of Grid
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
