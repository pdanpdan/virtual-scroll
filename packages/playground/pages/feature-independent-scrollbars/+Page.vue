<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { EMPTY_SCROLL_DETAILS, VirtualScrollbar } from '@pdanpdan/virtual-scroll';
import { inject, onMounted, onUnmounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import { html as highlightedCode } from './+Page.vue?highlight';

const containerRef = ref<HTMLElement | null>(null);
const scrollX = ref(0);
const scrollY = ref(0);
const totalWidth = ref(2000);
const totalHeight = ref(2000);
const viewportWidth = ref(0);
const viewportHeight = ref(0);

const mockScrollDetails = ref<ScrollDetails>({
  ...EMPTY_SCROLL_DETAILS,
  totalSize: { width: 2000, height: 2000 },
});

const rtlMode = inject<Ref<boolean>>('rtlMode', ref(false));

function onScroll(e: Event) {
  const target = e.target as HTMLElement;
  scrollX.value = target.scrollLeft;
  scrollY.value = target.scrollTop;

  mockScrollDetails.value.scrollOffset.x = scrollX.value;
  mockScrollDetails.value.scrollOffset.y = scrollY.value;
}

function scrollToX(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollLeft = offset;
  }
}

function scrollToY(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollTop = offset;
  }
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      viewportWidth.value = entry.contentRect.width;
      viewportHeight.value = entry.contentRect.height;

      mockScrollDetails.value.viewportSize.width = viewportWidth.value;
      mockScrollDetails.value.viewportSize.height = viewportHeight.value;
    }
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
    viewportWidth.value = containerRef.value.clientWidth;
    viewportHeight.value = containerRef.value.clientHeight;

    mockScrollDetails.value.viewportSize.width = viewportWidth.value;
    mockScrollDetails.value.viewportSize.height = viewportHeight.value;
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-5">Independent Scrollbars</span>
    </template>

    <template #description>
      This example shows how to use <code>VirtualScrollbar</code> components independently from <code>VirtualScroll</code>.
      They control a standard <code>div</code> with <code>overflow: auto</code> and hidden scrollbars, providing a custom scroll interface.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v16.5m16.5-16.5v16.5m-16.5-16.5h16.5m-16.5 16.5h16.5" />
      </svg>
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="mockScrollDetails" direction="both" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Content Width</span>
          <input
            v-model.number="totalWidth"
            type="range"
            min="500"
            max="15000"
            step="100"
            class="range range-xs range-primary w-48"
            aria-label="Content Width"
            @input="mockScrollDetails.totalSize.width = totalWidth"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Content Height</span>
          <input
            v-model.number="totalHeight"
            type="range"
            min="500"
            max="15000"
            step="100"
            class="range range-xs range-secondary w-48"
            aria-label="Content Height"
            @input="mockScrollDetails.totalSize.height = totalHeight"
          />
        </div>
      </div>
    </template>

    <div
      class="example-container flex flex-col overflow-auto"
      style="--vs-scrollbar-has-cross-gap: 1; --vs-scrollbar-cross-gap: 8px"
    >
      <!-- The standard scrollable area (hide scrollbars to use custom scrollbars) -->
      <div ref="containerRef" class="flex-1 overflow-auto scrollbar-hide" @scroll="onScroll">
        <div
          class="relative bg-grid-slate-100/[0.03]"
          :style="{
            width: `${ totalWidth }px`,
            height: `${ totalHeight }px`,
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            color: 'color-mix(in oklab, var(--color-primary) 60%, transparent)',
          }"
        >
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center">
              <div class="text-4xl font-black opacity-10 small-caps tracking-widest italic">Independent Content</div>
              <div class="text-sm opacity-20 mt-2">{{ totalWidth }} &times; {{ totalHeight }} pixels</div>
            </div>
          </div>

          <!-- Some content dots -->
          <div
            v-for="i in Math.ceil(Math.max(totalWidth, totalHeight) / 25)"
            :key="i"
            class="absolute size-6 rounded-full bg-accent text-accent-content flex items-center justify-center text-sm font-bold"
            :style="{
              insetInlineStart: `${ (i * 12345) % totalWidth }px`,
              top: `${ (i * 54321) % totalHeight }px`,
            }"
          >
            {{ i }}
          </div>
        </div>
      </div>

      <!-- Vertical Virtual Scrollbar -->
      <VirtualScrollbar
        axis="vertical"
        :total-size="totalHeight"
        :viewport-size="viewportHeight"
        :position="scrollY"
        :is-rtl="rtlMode"
        aria-label="Independent vertical scroll"
        @scroll-to-offset="scrollToY"
      />

      <!-- Horizontal Virtual Scrollbar -->
      <VirtualScrollbar
        axis="horizontal"
        :total-size="totalWidth"
        :viewport-size="viewportWidth"
        :position="scrollX"
        :is-rtl="rtlMode"
        aria-label="Independent horizontal scroll"
        @scroll-to-offset="scrollToX"
      />
    </div>
  </ExampleContainer>
</template>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
