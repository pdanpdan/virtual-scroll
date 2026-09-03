<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const itemCount = ref(1000);
const itemSize = ref(50);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);
const virtualScrollbar = ref(true);

// Uniform sizes mean rows can be rendered purely from their index: the items
// array is a sparse placeholder of the right length, so no per-row data is
// materialized even for 10M+ rows (only the visible window is ever accessed).
const items = computed(() => new Array(itemCount.value));

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
      <span class="example-title example-title--group-1">Vertical Fixed</span>
    </template>

    <template #description>
      Optimized for {{ itemCount.toLocaleString() }} items where every item has the same height. Items are only rendered when they enter the visible viewport. Row height is fixed at {{ itemSize }}px.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Standard vertical scrolling with uniform item heights
    </template>

    <template #controls>
      <ScrollStatus
        dom-count-selector=".example-container"
        :scroll-details="scrollDetails"
        direction="vertical"
      />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:sticky-header="stickyHeader"
        v-model:sticky-footer="stickyFooter"
        v-model:virtual-scrollbar="virtualScrollbar"
        direction="vertical"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Fixed height list"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Sticky Header
        </div>
      </template>

      <template #item="{ index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-8">#{{ index }}</span>
          <span class="font-bold">Fixed Item {{ index }}</span>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          Sticky Footer
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
