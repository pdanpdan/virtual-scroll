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
const itemSize = ref(100);
const bufferBefore = ref(20);
const bufferAfter = ref(20);
const virtualScrollbar = ref(true);

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
      <span class="example-title example-title--group-3">Horizontal Fixed</span>
    </template>

    <template #description>
      Optimized for {{ itemCount.toLocaleString() }} items where every item has the same width ({{ itemSize }}px). Row height is filled automatically. Default buffers are set to {{ bufferBefore }} for smoother horizontal panning.
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
      Horizontal scrolling with uniform item widths
    </template>

    <template #controls>
      <ScrollStatus
        dom-count-selector=".example-container"
        :scroll-details="scrollDetails"
        direction="horizontal"
      />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
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
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Fixed width horizontal list"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="example-horizontal-item example-horizontal-item--fixed">
          <span class="example-badge mb-4">#{{ index }}</span>
          <div class="font-bold text-sm">Fixed Item {{ index }}</div>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          To virtualize a horizontal strip in which every item has the same width, switch the axis to horizontal and give the
          engine a numeric <code>item-size</code>. Uniform sizes are the best case for virtualization: the visible window, each
          item's position, and the total scroll width are all derived arithmetically (<code>index × itemSize</code>), so range math stays arithmetic and scrolling a very long dataset stays smooth. That speed is the
          reward for a promise you make to the engine - that every item is exactly the declared width - so this mode is the
          right choice only while that promise holds.
        </p>

        <h3>1. Put the list on the horizontal axis and size it</h3>
        <p>
          <code>direction</code> defaults to <code>'vertical'</code>; pass <code>direction="horizontal"</code> to scroll along
          the inline (width) axis. The component renders its own scrollable host, which needs a <em>definite block size</em> so
          rows have a height to span (rows stretch to the viewport height automatically) and a constrained inline size so content
          overflows sideways rather than wrapping. In a flex/grid parent, remember <code>min-height: 0</code> /
          <code>min-width: 0</code> so the box is allowed to shrink below its content. The <code>buffer-before</code> /
          <code>buffer-after</code> props (default <code>5</code>) keep a few extra items mounted past each edge so fast panning
          does not flash blank cells; they count items, so widen them if cells are wide or travel is quick.
        </p>

        <h3>2. Pass a real array and render each row from <code>item</code></h3>
        <p>
          The mainstream data model is an ordinary array of item objects. The <code>#item</code> slot receives both
          <code>item</code> and <code>index</code>; render your cell from <code>item</code> and use <code>index</code> for
          position or keys. Only the window in view (plus the buffer) is mounted, but the full array still lives in memory -
          virtualization saves DOM nodes, not your data.
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

const items = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  label: `Item ${ i }`,
}));
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;h-list&quot;
    direction=&quot;horizontal&quot;
    :items=&quot;items&quot;
    :item-size=&quot;100&quot;
    aria-label=&quot;Horizontal list&quot;
  >
    &lt;template #item=&quot;{ item, index }&quot;>
      &lt;div class=&quot;h-row&quot;>
        &lt;strong>{{ item.label }}&lt;/strong>
        &lt;span>#{{ index }}&lt;/span>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
/* A definite block size fixes the row height; rows stretch to it and the
   content scrolls sideways. The inline size comes from the layout. */
.h-list {
  block-size: 140px;
  border: 1px solid oklch(50% 0 0 / 0.2);
}

/* Each cell is item-size (100px) wide along the scroll axis. The row root must
   fill it so nothing overlaps or leaks. */
.h-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  inline-size: 100%;
  block-size: 100%;
  border-inline-end: 1px solid oklch(50% 0 0 / 0.1);
}
&lt;/style>"
        />

        <h3>3. Use an index-only array when rows carry no data</h3>
        <p>
          When a cell is fully described by its position (a tick, an ordinal sequence, a pagination page) you can skip allocating
          data objects entirely. <code>items</code> only needs to provide a length - entries are read only for the rendered
          window - so a sparse <code>new Array(count)</code> works: the <code>item</code> slot prop is <code>undefined</code>
          for every hole and you render from <code>index</code>. Paired with a numeric <code>item-size</code> this keeps memory
          flat even into the millions of rows. Do not reach for it when rows carry content or vary in size; those need real data
          plus an <code>item-size</code> function/array or dynamic measurement.
        </p><CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

// A row fully described by its index needs no data: only the array length is
// used and every `item` slot prop is undefined, so render from `index`.
const items = new Array(1_000_000);
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;h-list&quot;
    direction=&quot;horizontal&quot;
    :items=&quot;items&quot;
    :item-size=&quot;100&quot;
    aria-label=&quot;Index-only horizontal list&quot;
  >
    &lt;template #item=&quot;{ index }&quot;>
      &lt;div class=&quot;h-row&quot;>#{{ index }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>4. Keep <code>item-size</code> equal to the rendered width</h3>
        <p>
          <code>item-size</code> is a contract, not a hint: the engine uses it for the total scroll width, the range math, and
          any scrollbar geometry. Each rendered row is mounted into a cell exactly that wide and as tall as the viewport, so the
          row root should fill the box (<code>inline-size: 100%; block-size: 100%</code>, borders included via
          <code>box-sizing: border-box</code>). Content wider than the declared size clips or overlaps; narrower content leaves
          gaps. When widths genuinely vary, move off uniform mode to an array, a function, or dynamic measurement (see the
          dynamic-width example) rather than fighting a fixed number.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
