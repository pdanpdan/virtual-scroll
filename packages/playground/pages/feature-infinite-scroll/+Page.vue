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

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: i, label: `Initial Item ${ i }` })));
const loading = ref(false);
const autoLoad = ref(true);
const virtualScrollbar = ref(true);
// The demo source is finite: once the limit is reached there is no more data,
// so the loading slot must not show (and nothing should be fetched).
const TOTAL_LIMIT = 500;
const hasMore = ref(true);
const {
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

async function loadMore() {
  if (loading.value || !hasMore.value) {
    return;
  }

  loading.value = true;
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const start = items.value.length;
  if (start >= TOTAL_LIMIT) {
    hasMore.value = false;
    loading.value = false;
    return;
  }
  const newItems = Array.from({ length: Math.min(20, TOTAL_LIMIT - start) }, (_, i) => ({
    id: start + i,
    label: `Loaded Item ${ start + i }`,
  }));

  items.value = [ ...items.value, ...newItems ];
  loading.value = false;
}

async function onLoad(direction: 'vertical' | 'horizontal') {
  if (autoLoad.value && direction === 'vertical') {
    await loadMore();
  }
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-1">Infinite Scroll</span>
    </template>

    <template #description>
      Demonstrates the <strong>load</strong> event and <strong>loading</strong> prop/slot. Currently showing {{ items.length.toLocaleString() }} items. When you reach the end of the list, more items are automatically fetched and appended. The demo source is capped at {{ TOTAL_LIMIT.toLocaleString() }} items — the loading slot only appears while auto-loading is on and there is still data to fetch.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </template>

    <template #subtitle>
      Automatic pagination with loading indicators
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Auto-loading</span>
          <input v-model="autoLoad" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Virtual Scrollbars</span>
          <input v-model="virtualScrollbar" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <button class="btn btn-sm btn-soft btn-primary" :disabled="loading" @click="loadMore">Load More</button>
        <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear</button>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :loading="loading"
      :load-distance="300"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Infinite scrolling list"
      @load="onLoad"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>

      <template v-if="autoLoad && hasMore" #loading>
        <div class="p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300">
          <span class="loading loading-spinner loading-md text-primary" />
          <span class="text-xs font-bold small-caps tracking-widest opacity-70">Fetching more items...</span>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          The goal is a list that keeps fetching and appending as the user nears the bottom, so there is no visible "end of
          data" pause. The one mechanism that makes it work is the <code>load</code> event: the list engine watches its own
          scroll state and, whenever the remaining distance to the bottom of the content drops to <code>loadDistance</code>,
          emits <code>load</code> with the axis that crossed the threshold. Your handler fetches and appends rows, and the
          <code>loading</code> prop reveals the <code>#loading</code> slot <em>and</em> suppresses repeated <code>load</code>
          events while a request is in flight. The main thing to design around: an "endless" feed is still a finite source, so
          it must be able to signal that no more data exists — otherwise the reserved loading slot would keep showing forever.
        </p>

        <h3>1. Constrain the scroll box and model a source that can end</h3>
        <p>
          As with any virtualized list the scroll host needs a definite height (a flex parent needs <code>min-height: 0</code>
          so the box can shrink). Infinite loading also requires <em>real data objects</em>: because every appended row shows
          distinct content, a sparse <code>new Array(n)</code> placeholder is not enough here. Keep your rows in a
          <code>ref</code> array and replace that array on every page append (see step 2) so the list observes the change.
        </p>

        <h3>2. Fetch on demand with a guarded async loader</h3>
        <p>
          Bind <code>:loading="loading"</code>, <code>:load-distance</code>, and handle <code>@load</code>. Set
          <code>load-distance</code> to a lead-in of at least one viewport, measured in display pixels (the default is
          <code>200</code>; <code>300</code> suits a ~600px viewport). Two re-entrancy guards matter: set <code>loading</code>
          <code>true</code> for
          the whole fetch (the engine then suppresses further <code>load</code> events), and also check <code>hasMore</code> —
          because the event can fire again immediately after an append when you are still inside <code>loadDistance</code> of the
          <em>new</em> end. Prefer reassigning <code>items.value = [...items, ...chunk]</code> over mutating in place, and always
          reset <code>loading</code> in a <code>finally</code> so an error does not leave the spinner stuck.
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

const items = ref(Array.from({ length: 40 }, (_, i) => `Item ${ i }`));
const loading = ref(false); // shows #loading and suppresses 'load' re-fires
const hasMore = ref(true);  // a finite source must be able to signal its end
const PAGE = 20;
const LIMIT = 500;

async function loadMore(direction: 'vertical' | 'horizontal') {
  // 'load' can fire mid-fetch and again right after an append if you are still
  // within loadDistance of the (new) end, so guard on both conditions.
  if (direction !== 'vertical' || loading.value || !hasMore.value) return;
  loading.value = true;
  try {
    await new Promise((r) => setTimeout(r, 800)); // simulated request
    if (items.value.length >= LIMIT) { hasMore.value = false; return; }
    const start = items.value.length;
    const chunk = Array.from(
      { length: Math.min(PAGE, LIMIT - start) },
      (_, i) => `Item ${ start + i }`,
    );
    items.value = [...items.value, ...chunk]; // assign a NEW array
  } finally {
    loading.value = false;
  }
}
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;feed&quot;
    :items=&quot;items&quot;
    :item-size=&quot;60&quot;
    :loading=&quot;loading&quot;
    :load-distance=&quot;300&quot;
    @load=&quot;loadMore&quot;
  >
    &lt;template #item=&quot;{ item, index }&quot;>
      &lt;div class=&quot;row&quot;>#{{ index }} · {{ item }}&lt;/div>
    &lt;/template>

    &amp;lt;!-- Kept mounted but hidden (visibility) while idle so it reserves height;
         drop it via v-if=&quot;hasMore&quot; once exhausted to free that space. -->
    &lt;template v-if=&quot;hasMore&quot; #loading>
      &lt;div class=&quot;spinner&quot;>Fetching more…&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.feed {
  height: 480px;
} /* the scroll viewport needs a definite height */
.row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 100%;
  padding-inline: 1rem;
  border-bottom: 1px solid rgb(0 0 0 / .1);
}
.spinner {
  padding: 1rem;
  text-align: center;
}
&lt;/style>"
        />

        <h3>3. The loading slot reserves space and must be gated by data</h3>
        <p>
          The <code>#loading</code> slot is <em>always rendered</em> once you provide it: while <code>loading</code> is false it
          is kept mounted and hidden with <code>visibility: hidden</code> (class <code>virtual-scroll-loading--hidden</code>), so
          it still reserves its height below the items — which is also why the <code>End</code> key can include its size in the
          scroll target. Because it always reserves space, stop providing it once there is no more data: put your own condition on
          the slot (e.g. <code>v-if="autoLoadEnabled &amp;&amp; hasMore"</code> on <code>&lt;template #loading&gt;</code>) so that
          disabling auto-loading or exhausting the source makes the reserved space disappear instead of leaving a permanent empty
          footer.
        </p>

        <h3>4. Tune loadDistance against buffers and row size</h3>
        <p>
          <code>loadDistance</code> decides <em>when</em> to fetch; <code>buffer-after</code>/<code>buffer-before</code> decide
          how many extra rows stay mounted beyond each edge (row counts, default <code>5</code>). Set <code>loadDistance</code>
          to at least roughly one viewport so the request starts while content is still visible and typically resolves before
          the user reaches the new tail; a value that is too small means the user reaches the actual end and waits on the
          spinner. Because the distance is measured from the total content end in pixels, taller rows consume that budget faster,
          so relate it to your <code>item-size</code> rather than to a row count. The two interact at the boundary: a generous
          <code>buffer-after</code> pre-mounts the rows right at the fetch threshold, so newly appended items appear without a
          blank flash when you cross it.
        </p>

        <h3>5. Gate the automatic path behind your own switch</h3>
        <p>
          <code>load</code> is the automatic trigger, but you can also offer a manual "Load More" button or an auto-load toggle
          that route through the same guarded handler. Because <code>load</code> also fires for the horizontal axis in
          two-directional lists, branch on the axis argument. The <code>loading</code> prop also drives the button's disabled
          state, so a request cannot be started twice.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
// Optionally gate the automatic path behind a user-facing &quot;auto-load&quot; switch
// while still offering a manual button; both funnel into one guarded fetcher.
const autoLoad = ref(true);

function onLoad(axis: 'vertical' | 'horizontal') {
  if (autoLoad.value &amp;&amp; axis === 'vertical') {
    void loadMore(axis);
  }
}
&lt;/script>
&nbsp;
&lt;template>
  &amp;lt;!-- :loading also disables the button while a request is running. -->
  &lt;button :disabled=&quot;loading&quot; @click=&quot;loadMore('vertical')&quot;>Load more&lt;/button>

  &lt;label>&lt;input v-model=&quot;autoLoad&quot; type=&quot;checkbox&quot; /> Auto-load on scroll&lt;/label>
&lt;/template>"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
