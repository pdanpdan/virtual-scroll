<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const itemCount = ref(1000);
const baseItemSize = ref(150);
const bufferBefore = ref(20);
const bufferAfter = ref(20);
const virtualScrollbar = ref(true);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

// Items render purely from their index: the items array is a sparse placeholder
// of the right length, so no per-row data is materialized even for 10M+ rows
// (only the visible window is ever accessed).
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
      <span class="example-title example-title--group-3">Horizontal Dynamic</span>
    </template>

    <template #description>
      Horizontal scrolling with {{ itemCount.toLocaleString() }} items with different widths measured via <strong>ResizeObserver</strong>. Even items are {{ baseItemSize }}px, odd items are {{ baseItemSize * 2 }}px. Try resizing the container!
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" class="-rotate-90 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Horizontal scrolling with variable item widths
    </template>

    <template #controls>
      <ScrollStatus
        dom-count-selector=".example-container"
        :scroll-details="scrollDetails"
        direction="horizontal"
      />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="baseItemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:virtual-scrollbar="virtualScrollbar"
        direction="horizontal"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="horizontal"
      :items="items"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Dynamic width horizontal list"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="example-horizontal-item px-4">
          <span class="example-badge mb-4">#{{ index }}</span>
          <div class="font-bold text-sm mb-1" :style="{ inlineSize: `${ itemSizeFn(null, index) }px` }">
            Dynamic Item {{ index }}
          </div>
          <div class="text-xs small-caps tracking-widest opacity-50">Width: {{ itemSizeFn(null, index) }}px</div>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          To virtualize a horizontal list whose items differ in width, the engine cannot place items arithmetically the way it
          does with uniform sizes - each item's offset depends on the widths of everything before it. Dynamic mode solves this
          by <em>measuring</em> each rendered cell with a <code>ResizeObserver</code> so totals follow the measured sizes. The cost is real but bounded: layout starts from an estimate that is corrected as cells
          mount, and totals only become exact once the relevant range has been measured. This page shows how to choose that mode
          deliberately rather than by accident.
        </p>

        <h3>1. Choose the size strategy that matches your data</h3>
        <p>
          <code>item-size</code> accepts four forms, each trading speed against flexibility. A positive <code>number</code>
          means uniform sizes and pure O(1) arithmetic - the fastest, but only valid when every item really is that size. An
          <code>array</code> describes a repeating width pattern (e.g. <code>[150, 300]</code>), and a function
          <code>(item, index) =&gt; number</code> expresses a width known up front that varies per item; both let the engine
          lay out far-off items from the declared pattern or function without mounting them - avoiding dynamic measurement, at
          the cost of per-item storage rather than a uniform number's O(1). Pass <code>0</code>, <code>null</code>, or
          <code>undefined</code> - or omit the prop entirely - to switch to <strong>dynamic</strong> mode, where sizes are
          measured from the DOM. Use dynamic only when widths are genuinely content-driven and unknowable until rendered
          (wrapping text, media, responsive cells); if you can compute them, an array or function skips the measuring cost.
        </p>

        <h3>2. Give every cell a definite, stable width</h3>
        <p>
          A measured cell must render at the width you intend and not change after it mounts. Drive the width from your data and
          apply it as an explicit inline size on the cell (the snippet uses <code>inlineSize</code> from a per-item
          <code>width</code>), and reserve space for late media content so a post-mount resize does not shift neighbors. Because
          each rendered box is observed, a live resize (window resize, data-driven width change) is caught and the axis is
          re-laid automatically.
        </p>

        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          Besides consistent cross-browser styling it is a performance improvement: the overlay bar is driven by the
          engine's own scroll math, so its rendering cost stays flat no matter how long the list grows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

// Each item knows its own width; no `item-size` prop is passed, so the engine
// treats the axis as dynamic and measures the rendered boxes.
const items = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  width: i % 2 === 0 ? 150 : 300,
}));
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;h-dyn&quot;
    direction=&quot;horizontal&quot;
    :items=&quot;items&quot;
    :default-item-size=&quot;220&quot;
    aria-label=&quot;Dynamic width list&quot;
  >
    &lt;template #item=&quot;{ item }&quot;>
      &amp;lt;!-- Omit item-size → ResizeObserver reports this box's inline size. -->
      &lt;div class=&quot;card&quot; :style=&quot;{ inlineSize: `${ item.width }px` }&quot;>
        #{{ item.id }} - {{ item.width }}px
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.h-dyn {
  block-size: 160px; /* rows span the viewport height */
  border: 1px solid oklch(50% 0 0 / 0.2);
}
.card {
  box-sizing: border-box;
  block-size: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0 1rem;
  border-inline-end: 1px solid oklch(50% 0 0 / 0.1);
}
&lt;/style>"
        />

        <h3>3. Accept the estimate-then-measure pipeline</h3>
        <p>
          Only cells that are actually mounted can be measured, so the engine cannot know the width of an item that has never
          been in the viewport. Until a row mounts it keeps the fallback <code>default-item-size</code> (default <code>40</code>),
          which drives the initial range and the total scroll width; as cells enter the window their real measurements replace the estimate, which is why a dynamic list "settles": the
          first paint (and any deep <code>scrollToIndex</code>) can be slightly off and correct itself over a couple of frames.
          Set <code>default-item-size</code> near your average width to shrink the initial error.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
