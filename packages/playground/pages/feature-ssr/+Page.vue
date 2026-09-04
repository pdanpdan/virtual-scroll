<script setup lang="ts">
import type { Data } from './+data';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { useData } from 'vike-vue/useData';
import { computed, inject, ref, watch } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
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
const virtualScrollbar = ref(true);

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
      Demonstrates the <strong>ssrRange</strong> prop. The grid is configured to start pre-rendered at <strong>Row {{ ssrRange.start }}, Column {{ ssrRange.colStart }}</strong>. On the client, it automatically scrolls to match this range on mount.
      <div class="alert alert-info -mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 size-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs @4xl:text-sm font-medium">In a real SSR environment, the content for this range would be present in the initial HTML.</span>
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
        v-model:virtual-scrollbar="virtualScrollbar"
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
      :virtual-scrollbar="virtualScrollbar"
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

    <template #implementation>
      <ImplementationGuide>
        <p>
          A virtualized list normally mounts only a small, viewport-sized window — and when the page is server-rendered there is
          no browser layout yet, so a plain render would emit an empty scroll box that crawlers and no-JS clients can never read.
          To virtualize for the server you instead pick which rows (and, in a grid, columns) should already exist as real static
          HTML, describe them with the <code>ssrRange</code> prop, and let the component scroll to that range once the client
          hydrates. Because the same range drives the server output and the very first client render, Vue hydrates against an
          identical tree; afterwards the component switches to its usual recycled, absolutely-positioned window. Two consequences
          shape the code: the pre-rendered slice must be described by deterministic numeric sizes (nothing can be measured on the
          server), and the items plus range must be identical on both sides of hydration.
        </p>

        <h3>1. Feed the list from a data source both renders share</h3>
        <p>
          Pass your rows to <code>:items</code> and add <code>:ssr-range</code> — an object of the shape
          <code>{ start, end, colStart?, colEnd? }</code> where <code>start</code>/<code>end</code> bound the rows and
          <code>colStart</code>/<code>colEnd</code> bound columns in grid mode; <code>end</code> and <code>colEnd</code> are
          <em>exclusive</em>. Vue hydration matches the first client render against the server HTML, so load <code>items</code>
          and <code>ssrRange</code> through a mechanism that runs identically on both sides — your framework's data loader (for
          example a Vike <code>+data.ts</code>) or any SSR-capable store — never inside a client-only <code>onMounted</code>
          effect. The range is your chosen first paint; it does not have to begin at index <code>0</code>, because the component
          scrolls to it on hydration. Keep it small enough to be a sensible initial paint — the client virtualizes everything
          around it.
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

// Load items + ssrRange from a source that runs on the server and again on
// the first client render (framework data loader / SSR-capable store), so
// the initial HTML and the tree Vue hydrates are identical.
const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, label: `Row ${ i }` }));

// Pre-render rows 200..214 as static HTML. end is EXCLUSIVE.
const ssrRange = { start: 200, end: 215 };
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;list&quot;
    :items=&quot;items&quot;
    :item-size=&quot;48&quot;
    :ssr-range=&quot;ssrRange&quot;
  >
    &amp;lt;!-- Mainstream: render the row payload from `item`. -->
    &lt;template #item=&quot;{ item }&quot;>
      &lt;div class=&quot;row&quot;>{{ item.label }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
/* The client host needs a definite height so it can scroll. */
.list {
  height: 480px;
  border: 1px solid oklch(50% 0 0 / 0.2);
}
/* Each row wrapper is exactly item-size (48px) tall; the inner div fills it. */
.row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 100%;
  padding-inline: 1rem;
}
&lt;/style>"
        />

        <h3>2. Render rows from your data — and when to skip payloads</h3>
        <p>
          The <code>#item</code> slot holds your row markup and re-renders every time a row enters the window. The mainstream
          form is real objects: the slot destructures <code>{ item }</code> and renders the payload's fields, keeping the content
          in one source of truth. The specialized form applies when a row is fully described by its position — numbering,
          separators, ticks, or content you address by index: read only <code>{ index }</code> and pass a length-only placeholder
          array instead of materializing a per-row object. Prefer the real-object form unless your rows are purely positional, and
          render idempotently either way — a recycled row can mount and unmount many times as you scroll.
        </p><CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&amp;lt;!-- Specialized: when a row is fully described by its position (numbering,
     separators, ticks, store-keyed content) read only `index` and hand the
     list a length-only array - no per-row objects are materialized. -->
&lt;script setup lang=&quot;ts&quot;>
const items = new Array(10_000); // length-only array; rows addressed by index

const ssrRange = { start: 0, end: 15 };
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    :items=&quot;items&quot;
    :item-size=&quot;48&quot;
    :ssr-range=&quot;ssrRange&quot;
  >
    &lt;template #item=&quot;{ index }&quot;>
      &lt;div class=&quot;row&quot;>#{{ index }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>3. Give the pre-rendered slice deterministic sizes</h3>
        <p>
          Before hydration the component lays the range out as a real static in-flow block — normal document flow, no absolute
          positioning — so that markup exists in the HTML without any JavaScript. Because there is no layout pass on the server
          (and the first client render must match it), that block cannot be sized by <code>ResizeObserver</code>. Describe it with
          fixed sizes: a numeric <code>item-size</code> for uniform rows, a repeating array such as <code>[180, 120]</code>, or a
          size function for per-row variation. Dynamic, measured sizing still works after hydration but cannot define the
          pre-rendered slice. Each row wrapper is mounted at exactly <code>item-size</code> tall, so the slot root must fill that
          box (<code>height: 100%</code> plus <code>box-sizing: border-box</code>), and the client host needs a definite height so
          it can scroll.
        </p>

        <h3>4. Extend to a grid — pre-render a rectangle of rows &times; columns</h3>
        <p>
          For a <code>direction="both"</code> grid the same mechanism covers two axes: set <code>column-count</code> and
          <code>column-width</code> alongside <code>item-size</code>, and add <code>colStart</code>/<code>colEnd</code> to
          <code>ssrRange</code> so the pre-rendered slice becomes a rectangle. The <code>#item</code> slot receives a
          <code>columnRange</code> (<code>{ start, end }</code>) describing the visible — or, pre-hydration, pre-rendered — column
          window plus a <code>getColumnWidth()</code> helper to size each cell; map the row across that column window exactly as in the interactive grid examples.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

const items = Array.from({ length: 200 }, (_, id) => ({ id }));

// A grid pre-renders a RECTANGLE: rows AND columns. end/colEnd exclusive.
const ssrRange = { start: 100, end: 115, colStart: 50, colEnd: 70 };
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;grid&quot;
    direction=&quot;both&quot;
    :items=&quot;items&quot;
    :item-size=&quot;80&quot;
    :column-count=&quot;100&quot;
    :column-width=&quot;[180, 120]&quot;
    :ssr-range=&quot;ssrRange&quot;
  >
    &amp;lt;!-- columnRange = { start, end } of the visible/pre-rendered columns. -->
    &lt;template #item=&quot;{ index, columnRange, getColumnWidth }&quot;>
      &lt;div class=&quot;grid-row&quot;>
        &lt;div
          v-for=&quot;c in columnRange.end - columnRange.start&quot;
          :key=&quot;c&quot;
          class=&quot;grid-cell&quot;
          :style=&quot;{ inlineSize: getColumnWidth(columnRange.start + c - 1) + 'px' }&quot;
        >
          R{{ index }} &amp;times; C{{ columnRange.start + c - 1 }}
        &lt;/div>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>5. Pre-render, or jump on the client only</h3>
        <p>
          Two props can move the initial viewport, and which one you need depends on whether the first HTML must hold content.
          <code>ssrRange</code> embeds real HTML for the slice <em>and</em> scrolls to it after mount. If you only want to open
          the list at a deep index and need no pre-rendered markup, skip <code>ssrRange</code> and pass
          <code>initialScrollIndex</code> (the index to jump to on mount; default <code>undefined</code>) together with
          <code>initialScrollAlign</code> (default <code>'start'</code>) to control alignment. When <code>ssrRange</code> is
          present its <code>start</code> is the default jump target, which <code>initialScrollIndex</code> overrides if you want
          to land elsewhere. Either way you write no scroll code: in the tick after first layout the component performs the jump,
          then hydrates into the windowed, absolutely-positioned layout.
        </p>

        <h3>6. Pitfalls: guard <code>window</code> and keep the first render identical</h3>
        <p>
          The component itself is SSR-safe — scroll listeners and its <code>ResizeObserver</code> attach only inside
          <code>onMounted</code>, and it starts with <code>isHydrated = false</code>, so nothing touches <code>window</code> while
          rendering on the server. What <em>you</em> run during that render must be careful too: loading <code>items</code>,
          computing <code>ssrRange</code>, or anything in the slot for the pre-rendered slice must not read
          <code>window</code>/<code>location</code>/<code>matchMedia</code>, and the first client render must be byte-identical to
          the server output. Keep range and row content deterministic — no client-only randomness, timestamps, or
          async-fetch-after-mount inside the slice — by sourcing the data from the shared server path.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
