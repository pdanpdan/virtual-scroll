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
const itemSize = ref(90);
const bufferBefore = ref(5);
const bufferAfter = ref(5);

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
      :item-size="itemSize"
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      aria-label="Fixed height body scroll list"
      @scroll="onScroll"
    >
      <template #header>
        <div class="example-body-header">
          <h2>Scrollable Header</h2>
          <p>This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-8">#{{ index }}</span>
          <div>
            <div class="font-bold">Item {{ index }}</div>
            <div class="text-xs opacity-60">Body Scroll Fixed Item {{ index }}</div>
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

    <template #implementation>
      <ImplementationGuide>
        <p>
          Usually <code>&lt;VirtualScroll&gt;</code> renders its own scrollable host and virtualizes inside it. Sometimes you
          want the list to live directly in the page so that the browser window itself scrolls - items pass under your normal
          page chrome, with headers and footers scrolling past naturally. The mechanism that enables this is the
          <code>container</code> prop: it tells the engine which element actually scrolls, and it may be another
          <code>HTMLElement</code> or the browser <code>window</code>/<code>body</code>. The rows are still virtualized (only the
          visible window is mounted), and uniform heights keep their placement O(1) arithmetic.
        </p>

        <h3>1. Decide who scrolls: the host or another element</h3>
        <p>
          <code>container</code> defaults to the component's own host element, which gives you a self-contained, internal
          scroller. Pass a different element or the <code>window</code>/<code>body</code> to virtualize against whatever actually
          scrolls - handy when the list must flow with the page rather than sit in a fixed-height box. Because the scroller is
          now outside the component, the component must be told about it explicitly; this is a case where the library's default
          ("the host scrolls") is not what you want.
        </p>

        <h3>2. Wire the window client-side and let the host grow</h3>
        <p>
          <code>window</code> only exists on the client, so hold it in a ref and assign it in <code>onMounted</code> - this keeps
          server-side rendering safe. Then, unlike the element-scroller demos, do <em>not</em> cap the list's height: the host
          must grow with the full virtual content so the document becomes tall enough for the window to scroll. The
          <code>#header</code> / <code>#footer</code> slots are ordinary in-flow content that scrolls past rather than sticking.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import { onMounted, ref } from 'vue';

// `window` exists only on the client - assign after mount (SSR-safe).
const scrollContainer = ref&lt;Window | null>(null);
onMounted(() => {
  scrollContainer.value = window;
});

// Uniform heights keep positioning arithmetic; the array still carries data.
const items = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  label: `Body item ${ i }`,
}));
&lt;/script>

&lt;template>
  &amp;lt;!-- container points the engine at the element that actually scrolls. -->
  &lt;VirtualScroll
    class=&quot;body-list&quot;
    :items=&quot;items&quot;
    :item-size=&quot;90&quot;
    :container=&quot;scrollContainer&quot;
    aria-label=&quot;Body-scrolling list&quot;
  >
    &lt;template #header>
      &lt;p class=&quot;page-header&quot;>Header that scrolls with the page&lt;/p>
    &lt;/template>
    &lt;template #item=&quot;{ item, index }&quot;>
      &lt;div class=&quot;row&quot;>
        &lt;span>#{{ index }}&lt;/span>
        {{ item.label }}
      &lt;/div>
    &lt;/template>
    &lt;template #footer>
      &lt;p class=&quot;page-footer&quot;>Page footer&lt;/p>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
/* No fixed height: the document is the scroller, so the host must grow with
   the full virtual content to make the page tall enough to scroll. */
.body-list {
  border: 1px solid oklch(50% 0 0 / 0.2);
}
.row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  block-size: 90px; /* must equal item-size */
  padding: 0 1rem;
  border-bottom: 1px solid oklch(50% 0 0 / 0.1);
}
&lt;/style>"
        />

        <h3>3. Uniform rows are O(1) - and may be index-only</h3>
        <p>
          With a numeric <code>item-size</code> the engine places rows arithmetically and never reads payloads outside the
          rendered window, so uniform lists can equally be data-less: a sparse <code>new Array(count)</code> works and you render
          each row from its <code>index</code> (the <code>item</code> slot prop is then <code>undefined</code>). Reach for real
          item objects when rows carry content; use the sparse form when a row is fully described by its position. In both cases
          <code>item-size</code> is a contract and must equal the rendered row height.
        </p>

        <h3>4. Account for window-mode behavior</h3>
        <p>
          Two conveniences drop away when the browser itself scrolls: the virtual scrollbar is disabled for a
          <code>window</code>/<code>body</code> container and coordinate scaling for the <code>window</code>, so native
          scrolling is used. The practical consequence is a size ceiling - content must stay under the browser's ~10M px DOM
          scroll limit, because nothing rescales it. Reserve element-scroller mode (where scaling and the themed scrollbar are
          available) for lists large enough to need them. The buffers still overscan rows and the virtualization logic is
          otherwise identical.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
