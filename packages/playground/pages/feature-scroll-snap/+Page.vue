<script setup lang="ts">
import type { SnapMode } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const itemCount = ref(100);
const itemSize = ref(300); // Large items to make snapping obvious
const snap = ref<SnapMode>('next');

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  label: `Page ${ i + 1 }`,
  color: `hsl(${ (i * 45) % 360 }, 70%, 80%)`,
})));

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
  handleScrollToIndex,
  handleScrollToOffset,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const isItemTooLarge = computed(() => {
  if (!scrollDetails.value) {
    return false;
  }
  return itemSize.value > scrollDetails.value.viewportSize.height;
});
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-7">Scroll Snapping</span>
    </template>

    <template #description>
      Demonstrates the built-in <strong>snap</strong> feature. When scrolling stops, the view automatically smooth-scrolls to align with the nearest item. Useful for carousels, page-by-page navigation, or pickers.
      <br />
      <strong>Note:</strong> Snapping is disabled if the item is larger than the viewport.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
      </svg>
    </template>

    <template #subtitle>
      Auto-alignment after scroll
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
      />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Snap Mode</span>
          <select v-model="snap" class="select select-bordered select-sm w-32" aria-label="Snap mode">
            <option :value="false">None</option>
            <option value="auto">Auto (true)</option>
            <option value="next">Next</option>
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </label>

        <div v-if="isItemTooLarge && snap !== false" class="badge badge-soft badge-warning gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Item larger than viewport: Snapping disabled
        </div>

        <div class="flex flex-col gap-1 ms-auto">
          <span class="flex justify-between items-center">
            <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Item Height</span>
            <span class="badge badge-sm badge-primary font-mono">{{ itemSize }}px</span>
          </span>
          <input
            v-model.number="itemSize"
            type="range"
            min="100"
            max="1500"
            step="10"
            class="range range-xs range-primary w-48"
            aria-label="Item size"
          />
        </div>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      :snap="snap"
      aria-label="Snapping list"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div
          class="example-vertical-item h-full flex flex-col items-center justify-center text-center p-8 transition-transform duration-500"
          :style="{
            backgroundColor: item.color,
            color: '#333',
          }"
        >
          <div class="text-6xl font-black opacity-20 mb-4">
            {{ index + 1 }}
          </div>
          <div class="text-2xl font-bold">
            {{ item.label }}
          </div>
          <div class="mt-4 opacity-60">
            Scroll, then release to snap
          </div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
