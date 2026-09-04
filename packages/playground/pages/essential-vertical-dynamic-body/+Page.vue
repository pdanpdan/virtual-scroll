<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onMounted, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const scrollContainer = ref<Window | null>(null);

onMounted(() => {
  scrollContainer.value = window;
});

const itemCount = ref(1000);
const itemSize = ref(50); // Approximate base size
const bufferBefore = ref(5);
const bufferAfter = ref(5);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
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
  <ExampleContainer height="auto" :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-2">Vertical Dynamic Body</span>
    </template>

    <template #description>
      This example uses the main browser window for scrolling {{ itemCount.toLocaleString() }} dynamic items. Sizes are automatically detected via <strong>ResizeObserver</strong>.
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
      Native window scrolling with variable item heights
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
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      aria-label="Dynamic height body scroll list"
      @scroll="onScroll"
    >
      <template #header>
        <div class="example-body-header">
          <h2>Scrollable Header</h2>
          <p>This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ index }">
        <div class="example-vertical-item py-4">
          <span class="example-badge me-8">#{{ index }}</span>
          <div class="font-bold" :style="{ minBlockSize: `${ itemSizeFn(null, index) }px` }">
            Body Scroll Dynamic Item {{ index }}
            <span class="opacity-50 font-normal">(Height: {{ itemSizeFn(null, index) }}px)</span>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="example-body-footer">
          <h2>Page Footer</h2>
          <p>End of the {{ itemCount.toLocaleString() }} dynamic items list</p>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          This pattern combines two independent mechanisms. First, the list is not scrolled by its own host — the browser window
          is the scroller, which the <code>container</code> prop declares. Second, rows have <em>variable</em> heights, so
          <code>item-size</code> is left unset and each rendered row's height is measured with a <code>ResizeObserver</code>
          rather than computed. Understand them separately and the combination is straightforward; conflating them is the usual
          source of surprise.
        </p>

        <h3>1. Declare the window as the real scroll container</h3>
        <p>
          <code>container</code> defaults to the component's own host, which gives a self-contained internal scroller. To make
          the page itself scroll instead, pass the <code>window</code> (or <code>body</code>) element. Because
          <code>window</code> exists only on the client, hold it in a ref assigned in <code>onMounted</code> — that is also
          SSR-safe. Do not cap the list height: the host grows with the full virtual content so the document becomes tall enough
          for the window to scroll, and the header/footer slots scroll past as ordinary in-flow content.
        </p>

        <h3>2. Leave <code>item-size</code> unset and give rows a definite height</h3>
        <p>
          Passing no <code>item-size</code> (or <code>0</code>/<code>null</code>) puts the axis in dynamic mode: heights come
          from measuring each mounted row. Carry the intended height on your data and apply it to the row (a
          <code>min-block-size</code> keeps it from collapsing) so the observer has a stable box to report. Only mounted rows can
          be measured; rows that have not yet entered the viewport keep the <code>default-item-size</code> estimate (default
          <code>40</code>), which is replaced as they render. In window mode you feel this as the document height subtly
          adjusting while the first rows settle.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import { onMounted, ref } from 'vue';

const scrollContainer = ref&lt;Window | null>(null);
onMounted(() => {
  scrollContainer.value = window; // client only — SSR-safe
});

const items = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  height: i % 2 === 0 ? 50 : 100,
}));
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    class=&quot;body-list&quot;
    :items=&quot;items&quot;
    :container=&quot;scrollContainer&quot;
    aria-label=&quot;Body-scrolling dynamic list&quot;
  >
    &lt;template #header>
      &lt;p class=&quot;page-header&quot;>Header that scrolls with the page&lt;/p>
    &lt;/template>
    &lt;template #item=&quot;{ item }&quot;>
      &amp;lt;!-- No item-size → heights are measured off the page flow. -->
      &lt;div class=&quot;row&quot; :style=&quot;{ minBlockSize: `${ item.height }px` }&quot;>Item {{ item.id }}&lt;/div>
    &lt;/template>
    &lt;template #footer>
      &lt;p class=&quot;page-footer&quot;>Page footer&lt;/p>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.body-list {
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

        <h3>3. Expect a settle as estimates become measurements</h3>
        <p>
          Dynamic rows make the layout correct in stages: unmeasured rows are laid out at <code>default-item-size</code>, and
          each measurement replaces the estimate, moving later rows and the total.
          Because the window scrolls natively, that correction surfaces as the page height changing during the first pass or
          after a deep <code>scrollToIndex</code>. Set <code>default-item-size</code> near your average row height to shorten it,
          and keep the <code>buffer</code> (default <code>5</code>) so rows measure just off-screen, before they are needed.
        </p>

        <h3>4. Respect the window-mode size ceiling</h3>
        <p>
          When the scroll container is the browser <code>window</code>, the virtual scrollbar and coordinate scaling are
          disabled and native scrolling is used. That removes the safety net that rescales oversized content, so keep the
          total height under the browser's ~10M px DOM scroll limit. If a window-scrolled list needs to exceed that, move it
          into an element scroller instead, where scaling is available.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
