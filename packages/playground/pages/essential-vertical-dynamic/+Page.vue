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
const itemSize = ref(50);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);
const virtualScrollbar = ref(true);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
  return (_: unknown, index: number) => index % 2 === 0 ? base : base * 2;
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
      <span class="example-title example-title--group-1">Vertical Dynamic</span>
    </template>

    <template #description>
      Vertical scrolling with variable item heights for {{ itemCount.toLocaleString() }} items. Automatically measures item sizes using <strong>ResizeObserver</strong>. Even items are {{ itemSize }}px, odd items are {{ itemSize * 2 }}px.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Vertical scrolling with variable item heights
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
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Dynamic height list"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Sticky Header
        </div>
      </template>

      <template #item="{ index }">
        <div class="example-vertical-item py-4">
          <span class="example-badge me-8">#{{ index }}</span>
          <div class="font-bold" :style="{ minBlockSize: `${ itemSizeFn(null, index) }px` }">
            Dynamic Item {{ index }}
            <span class="opacity-50 font-normal">(Height: {{ itemSizeFn(null, index) }}px)</span>
          </div>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          Sticky Footer
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          To virtualize a vertical list whose rows differ in height, uniform-size arithmetic stops being sufficient: each row's
          offset depends on the heights of all the rows before it. Dynamic mode solves this by <em>measuring</em> each rendered
          row with a <code>ResizeObserver</code> so exact
          offsets and the total scroll height emerge from measured sizes rather than a formula. The real cost is that dynamic
          lists are heavier than uniform ones - they start from an estimate that corrects itself as rows mount, and only mounted
          rows can be measured.
        </p>

        <h3>1. Choose the size strategy that matches your data</h3>
        <p>
          <code>item-size</code> accepts four forms. A positive <code>number</code> means uniform heights and O(1) arithmetic -
          fastest, but only valid when every row really is that tall. An <code>array</code> describes a repeating pattern
          (e.g. <code>[50, 100]</code>) and a function <code>(item, index) =&gt; number</code> a height known up front that
          varies per row; both let the engine lay out far-off rows from the declared pattern or function without mounting them
          - avoiding measurement, at the cost of per-item storage rather than a uniform number's O(1). Pass
          <code>0</code>, <code>null</code>, or <code>undefined</code> - or omit the prop - to enable <strong>dynamic</strong>
          mode, where heights are measured from the DOM. Use dynamic only when heights are content-driven and unknowable until
          rendered (wrapping text, images, live data); if you can compute them, an array or function skips the measuring cost.
        </p>

        <h3>2. Render real rows at a definite, stable height</h3>
        <p>
          In dynamic mode the engine measures whatever box each rendered row actually has. Carry the intended size on your data
          and express it on the row - a <code>min-block-size</code> or a real height - so the box cannot collapse, and reserve
          space for media (<code>width</code>/<code>height</code> or <code>aspect-ratio</code>) so late content growth does not
          push neighbors down. The row's measured box (its border-box size, padding included) drives the layout, and a live
          resize is caught by the same observer and re-lays the list.
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

// Each row knows its own height; no `item-size` prop is passed, so heights
// are treated as dynamic and measured from the rendered DOM.
const items = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  height: i % 2 === 0 ? 50 : 100,
}));
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;v-dyn&quot;
    :items=&quot;items&quot;
    :default-item-size=&quot;80&quot;
    aria-label=&quot;Dynamic height list&quot;
  >
    &lt;template #item=&quot;{ item }&quot;>
      &amp;lt;!-- Omit item-size → ResizeObserver reports this row's block size. -->
      &lt;div class=&quot;row&quot; :style=&quot;{ minBlockSize: `${ item.height }px` }&quot;>
        #{{ item.id }} - {{ item.height }}px tall
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.v-dyn {
  block-size: 480px; /* fixed-height scroll viewport */
  border: 1px solid oklch(50% 0 0 / 0.2);
}
.row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  border-bottom: 1px solid oklch(50% 0 0 / 0.1);
}
&lt;/style>"
        />

        <h3>3. Follow the estimate-then-measure pipeline</h3>
        <p>
          Only rows that are mounted can be measured, so any row that has never entered the viewport keeps the fallback
          <code>default-item-size</code> (default <code>40</code>). That estimate drives the initial range and the total scroll
          height until the row renders, at which point the observed height replaces it. Expect the first layout - and any deep <code>scrollToIndex</code> into unmeasured regions - to settle over a frame or
          two as measurements land. Set <code>default-item-size</code> near your average row height to shrink the initial error;
          the <code>buffer-before</code>/<code>buffer-after</code> overscan (default <code>5</code>) keeps rows mounted just
          off-screen so this measuring happens before they scroll into view.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
