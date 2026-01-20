<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onMounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const scrollContainer = ref<Window | null>(null);

onMounted(() => {
  scrollContainer.value = window;
});

const itemCount = ref(1000);
const itemSize = ref(90);
const bufferBefore = ref(5);
const bufferAfter = ref(5);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: `Body Scroll Fixed Item ${ i }`,
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
</script>

<template>
  <ExampleContainer height="auto" :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-2">Vertical Fixed Body</span>
    </template>

    <template #description>
      This example uses the main browser window for scrolling {{ itemCount.toLocaleString() }} items instead of a nested container. Item height is fixed at {{ itemSize }}px.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with uniform item heights
    </template>

    <template #controls>
      <div class="sticky top-0 z-100 flex flex-wrap gap-4 items-start pointer-events-none py-4 -mx-4 px-4 backdrop-blur-sm bg-base-100/30">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" class="shadow-strong" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="itemSize"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          direction="vertical"
          class="shadow-strong"
          @scroll-to-index="handleScrollToIndex"
          @scroll-to-offset="handleScrollToOffset"
          @refresh="virtualScrollRef?.refresh()"
        />
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #header>
        <div class="example-body-header">
          <h2>Scrollable Header</h2>
          <p>This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-8">#{{ index }}</span>
          <div>
            <div class="font-bold">Item {{ index }}</div>
            <div class="text-xs opacity-60">{{ item.text }}</div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="example-body-footer">
          <h2>Page Footer</h2>
          <p>End of the {{ itemCount.toLocaleString() }} fixed items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
