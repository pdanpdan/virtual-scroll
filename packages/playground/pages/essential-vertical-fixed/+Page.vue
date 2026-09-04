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

    <template #implementation>
      <ImplementationGuide>
        <p>
          To virtualize a vertical list whose rows all share one height you declare only a few things: a
          scroll container with a definite height, an <code>items</code> array, and a numeric
          <code>item-size</code>. With a uniform size the engine derives every row position from
          <code>index × item-size</code>, so computing the visible window on each scroll is
          <em>O(1)</em> and only the window — plus a small overscan buffer — is ever mounted, no matter
          whether the list has 1,000 or millions of rows. Rows may carry real data objects or be pure
          index placeholders; both models are shown below.
        </p>

        <h3>1. Give the scroll container a definite height</h3>
        <p>
          <code>&lt;VirtualScroll&gt;</code> renders its own scrollable host element, so your CSS must
          give that box a definite size along the scroll axis: a fixed height, a viewport-relative one
          (e.g. <code>h-dvh</code>), or a flex/grid fill inside a sized parent. If the box is
          unconstrained it grows with its content and never scrolls — there is no viewport to serve.
          Inside a flex column parent add <code>min-height: 0</code>: flex items default to
          <code>min-height: auto</code> and refuse to shrink below their content.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="css"
          line-numbers
          code="/* The scroll box needs a definite height from your layout — fixed
   (480px), viewport-based, or flex fill with min-height: 0. */
.virtual-list {
  height: 480px;
}"
        />

        <h3>2. Provide the data: real item objects, or index-only placeholders</h3>
        <p>
          The common case is a real array of your records — API results, store state, computed values.
          <code>VirtualScroll</code> only needs the array; its length is the row count. The
          <code>#item</code> slot decides what each row renders and receives the payload as
          <code>item</code> together with <code>index</code>.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

// Real rows — typical case: objects fetched from an API or held in state.
// The list reads only the length; the slot decides what to render per row.
const items = Array.from({ length: 10_000 }, (_, i) => ({
  id: i,
  title: `Item ${ i }`,
}));
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    class=&quot;virtual-list&quot;
    :items=&quot;items&quot;
    :item-size=&quot;50&quot;
    aria-label=&quot;Fixed-height list&quot;
    virtual-scrollbar
  >
    &amp;lt;!-- Scoped slot receives the row payload and its index. -->
    &lt;template #item=&quot;{ item, index }&quot;>
      &lt;div class=&quot;row&quot;>
        &lt;span class=&quot;row-index&quot;>#{{ index }}&lt;/span>
        &lt;strong>{{ item.title }}&lt;/strong>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
/* The scroll viewport needs a definite height (480px here) — without it the
   container cannot scroll and virtualization has no viewport to serve. */
.virtual-list {
  height: 480px;
  border: 1px solid oklch(50% 0 0 / 0.2);
}

/* Each row wrapper is exactly item-size (50px) tall; the inner div must fill
   it with border-box sizing so borders do not add to the measured height. */
.row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 100%;
  padding-inline: 1rem;
  border-bottom: 1px solid oklch(50% 0 0 / 0.1);
}

.row-index {
  font-size: 0.75rem;
  opacity: 0.5;
}
&lt;/style>"
        />

        <p>
          The payload is optional. When a row's content derives entirely from its index — numbered rows,
          patterns, skeleton placeholders — you can skip the data objects and pass a sparse array of the
          right length: <code>new Array(count)</code>. The engine accesses only the length and the visible
          window, so holes are never materialized and memory stays flat however long the list is. With a
          sparse array <code>item</code> is <code>undefined</code>, so render from <code>index</code>. Type
          the component with the generic (e.g. <code>&lt;VirtualScroll&lt;Row&gt;&gt;</code>) when your slot
          reads typed fields.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
// Alternative — index-only rows: nothing is rendered from the payload, so no
// objects are needed. A sparse array of the right length costs nothing: the
// list only accesses the visible window, so memory stays O(1) no matter how
// long the list is (uniform sizes keep the math purely arithmetic).
const items = new Array(1_000_000);
&lt;/script>

&lt;template>
  &lt;VirtualScroll class=&quot;virtual-list&quot; :items=&quot;items&quot; :item-size=&quot;50&quot; virtual-scrollbar>
    &amp;lt;!-- item is undefined for sparse holes; render from the index. -->
    &lt;template #item=&quot;{ index }&quot;>
      &lt;div class=&quot;row&quot;>Row #{{ index }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>3. Declare the uniform size and overscan, and fill the row box</h3>
        <p>
          <code>item-size</code> is a contract, not a hint: the engine sizes every row wrapper to exactly
          this value and derives total scroll size, range math, and scrollbar geometry from it. Your slot
          root must therefore fill that box — <code>height: 100%</code> with
          <code>box-sizing: border-box</code> so borders and padding do not add to the measured size (see
          <code>.row</code> above). Because omitting <code>item-size</code> switches the axis to measured (dynamic) mode, declare the numeric size whenever your rows really are uniform — and use a value that matches your CSS row height.
          Uniform sizes are one option — if rows vary you would pass a size function or repeating pattern
          array instead, or <code>0</code>/<code>null</code> to measure dynamically (covered by the dynamic
          example pages).
        </p>
        <p>
          The boolean <code>virtual-scrollbar</code> draws the built-in overlay bars instead of the native ones; besides
          consistent cross-browser styling it is a performance improvement — the bars are driven by the engine's own
          scroll math, so their rendering cost stays flat no matter how long the list grows. It is also turned on
          automatically once content exceeds the browser's ~10M px limit.
        </p>

        <p>
          <code>buffer-before</code> / <code>buffer-after</code> (default <code>5</code>) keep extra rows
          mounted past each edge of the viewport so fast scrolling or inertia never flashes empty space
          while new rows mount. They count rows, not pixels — raise them when rows are expensive to render
          (images, complex layouts) and keep them low otherwise, because every buffered row is real DOM.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
