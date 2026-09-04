<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: `orig-${ i }`, label: `Original Item ${ i }` })));
const prependCount = ref(0);
const restoreScrollOnPrepend = ref(true);
const virtualScrollbar = ref(true);

const {
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function prependItems() {
  const count = 5;
  const newItems = Array.from({ length: count }, (_, i) => ({
    id: `prepended-${ prependCount.value + i }`,
    label: `Prepended Item ${ prependCount.value + i }`,
  }));

  items.value = [ ...newItems, ...items.value ];
  prependCount.value += count;
}

const appendCount = ref(0);
function appendItems() {
  const count = 5;
  const newItems = Array.from({ length: count }, (_, i) => ({
    id: `appended-${ appendCount.value + i }`,
    label: `Appended Item ${ appendCount.value + i }`,
  }));

  items.value = [ ...items.value, ...newItems ];
  appendCount.value += count;
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-2">Scroll Restoration</span>
    </template>

    <template #description>
      Demonstrates the <strong>restoreScrollOnPrepend</strong> prop. Currently showing {{ items.length.toLocaleString() }} items. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" class="rotate-180 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Maintain scroll position when prepending items
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Restore on Prepend</span>
          <input v-model="restoreScrollOnPrepend" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Virtual Scrollbars</span>
          <input v-model="virtualScrollbar" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <button class="btn btn-sm btn-soft btn-primary" @click="prependItems">Prepend 5</button>
        <button class="btn btn-sm btn-soft btn-primary" @click="appendItems">Append 5</button>
        <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear Items</button>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :restore-scroll-on-prepend="restoreScrollOnPrepend"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Scroll restoration list"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          Prepending rows — new messages, live-updating feeds — moves everything the user is reading down by the height of the
          inserted rows, which makes the viewport visibly jump unless the scroll offset is corrected by the same amount. The
          <code>restoreScrollOnPrepend</code> prop (default <code>false</code>) does that correction for you: when it detects
          rows added to the front of the list, it re-issues the scroll offset so the content that was on screen stays exactly
          where it was — effectively anchoring the view to the first visible item instead of to the top of the document. Its
          main caveat: detection is by <em>reference identity</em>, so it only works when you prepend a new array while keeping
          the existing item objects untouched.
        </p>

        <h3>1. Constrain the scroll box and model reference-stable rows</h3>
        <p>
          As always the list needs a definite height. More importantly, restoration is triggered by the list engine comparing
          the previous and the new <code>items</code> arrays; it counts prepended rows by locating the <em>old first item</em>
          (by object reference) inside the new array's prefix. Keep each existing item object untouched across prepends and
          always assign a fresh array — the engine watches by identity (<code>deep: false</code>), so mutating the same array in
          place never fires. Replace the whole dataset or re-sort so the old first object is gone and no correction happens.
        </p>

        <h3>2. Prepend a new array on top of the old one</h3>
        <p>
          To prepend, you bind <code>:restore-scroll-on-prepend="true"</code> and reassign the array with the fresh rows spread in
          front of the previous ones — that spread is all the data side needs. The engine measures the inserted block's size and
          shifts the scroll offset by exactly that much, so if you scroll down a short distance and then prepend, the rows
          already on screen stay put. The batch size is arbitrary: any number of rows inserted in a single array replacement
          triggers one correction for their combined height.
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
import { ref } from 'vue';

const items = ref(Array.from({ length: 50 }, (_, i) => `Item ${ i }`));
let batch = 0;

function prepend(count = 5) {
  const fresh = Array.from(
    { length: count },
    (_, i) => `new-${ batch }-${ i }`,
  );
  batch += 1;
  // Keep the previous objects untouched: restoration identifies how many rows
  // were inserted by locating the OLD first item (by reference) in the prefix
  // of the new array. Always assign a fresh array (the watcher is identity).
  items.value = [...fresh, ...items.value];
}
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;list&quot;
    :items=&quot;items&quot;
    :item-size=&quot;60&quot;
    :restore-scroll-on-prepend=&quot;true&quot;
  >
    &lt;template #item=&quot;{ item, index }&quot;>
      &lt;div class=&quot;row&quot;>#{{ index }} · {{ item }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.list {
  height: 480px;
}
.row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 100%;
  padding-inline: 1rem;
  border-bottom: 1px solid rgb(0 0 0 / 0.1);
}
&lt;/style>"
        />

        <h3>3. What restoration guarantees — and its limits</h3>
        <p>
          The guarantee is that the correction happens <em>after</em> the inserted rows' sizes are known, so the rows that were
          visible remain at the same screen offsets (the item at the top of the viewport stays at the top). It is exact for a
          fixed <code>item-size</code>. With dynamic sizes the shift uses the current size oracle, so freshly inserted rows are
          estimated until <code>ResizeObserver</code> measures them — expect a tiny settle, not a wrong final position.
        </p>
        <ul>
          <li>
            <strong>Reference identity:</strong> replacing the whole dataset (the old first object disappears) yields a prepend
            count of <code>0</code>, so no correction runs.
          </li>
          <li>
            <strong>Identity watcher:</strong> mutating the existing array in place never triggers restoration; always assign a
            new array.
          </li>
          <li>
            <strong>Top of the list:</strong> restoration applies even at offset 0 — the engine re-issues the offset to the inserted height, so the new rows appear above the fold instead of pushing the old content down.
          </li>
        </ul>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
