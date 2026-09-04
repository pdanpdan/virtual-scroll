<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onMounted, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';
import AsyncRow from './AsyncRow.vue';
import { clearPostsCache, feedStats } from './post-feed';

// Items are plain ids: each visible row mounts a component that "fetches"
// simulated content (see AsyncRow.vue). Heights are dynamic and measured by
// ResizeObserver as content arrives; the per-post cache lives in the module,
// never in the recycled row DOM.

const COUNT_OPTIONS = [ 10_000, 50_000, 100_000 ];
const LATENCY_OPTIONS = [
  { label: 'Snappy', min: 40, max: 120 },
  { label: 'Normal', min: 120, max: 800 },
  { label: 'Slow', min: 800, max: 2500 },
];

const itemCount = ref(50_000);

// Live stats only exist client-side: while mounting/SSR the status line must
// show zeros so the server-rendered markup matches hydration exactly.
const mounted = ref(false);
const displayStats = computed(() => (mounted.value ? feedStats : { cached: 0, fetched: 0 }));
onMounted(() => {
  mounted.value = true;
});
const latency = ref(LATENCY_OPTIONS[ 1 ]!);
const cacheVersion = ref(0);

function clearCache() {
  clearPostsCache();
  cacheVersion.value++;
}

const items = computed(() => new Array(itemCount.value));
const latencyLabel = computed(() => `${ latency.value.min }–${ latency.value.max } ms`);

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-3">Async Content</span>
    </template>

    <template #description>
      Items are just ids: each visible row mounts a component that fetches simulated content. Revisiting a row reads from an in-memory cache, row heights are measured automatically as content arrives, and clearing the cache refetches what is on screen.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M12 17.25h8.25" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75 9 18l2.25-2.25" />
      </svg>
    </template>

    <template #subtitle>
      Async content inside recycled, measured rows
    </template>

    <template #controls>
      <ScrollStatus
        :scroll-details="scrollDetails"
        direction="vertical"
        dom-count-selector=".example-container"
      />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-2 items-center">
        <label class="flex items-center gap-2 text-xs">
          <span class="small-caps font-bold tracking-widest opacity-60">Rows</span>
          <select v-model="itemCount" class="select select-sm">
            <option v-for="count in COUNT_OPTIONS" :key="count" :value="count">{{ count.toLocaleString() }}</option>
          </select>
        </label>

        <label class="flex items-center gap-2 text-xs">
          <span class="small-caps font-bold tracking-widest opacity-60">Network</span>
          <select v-model="latency" class="select select-sm">
            <option v-for="option in LATENCY_OPTIONS" :key="option.label" :value="option">{{ option.label }} ({{ option.min }}–{{ option.max }} ms)</option>
          </select>
        </label>

        <button class="btn btn-sm btn-soft" @click="clearCache">Clear cache</button>

        <div class="text-xs opacity-60 ms-auto">
          cached {{ displayStats.cached.toLocaleString() }} · fetched {{ displayStats.fetched.toLocaleString() }} · latency {{ latencyLabel }}
        </div>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :buffer-before="4"
      :buffer-after="4"
      virtual-scrollbar
      aria-label="Async content feed list"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="border-b border-base-content/5">
          <AsyncRow :id="index" :latency-min="latency.min" :latency-max="latency.max" :version="cacheVersion" />
        </div>
      </template>
    </VirtualScroll>
    <template #implementation>
      <ImplementationGuide>
        <p>
          Rows whose content is fetched asynchronously — an API call per row that resolves to text of a different length each
          time — combine two concerns: <em>when</em> a row fetches (only rows in the window should, since only they are mounted)
          and <em>how</em> the engine knows a row's height before and after its content arrives. Virtualization makes the data
          model the anchor: keep the list as index-only items (<code>new Array(n)</code>) and let each visible row mount a small
          child component that fetches its own content, keyed by <code>id</code>. Sizes are dynamic: the row renders a
          skeleton placeholder at a sensible estimated height, and <code>ResizeObserver</code> updates the measurement once the
          real content paints. Because rows unmount when they scroll away, both the fetch result cache and the “is this still
          mounted?” guard must live outside the row's ephemeral DOM.
        </p>

        <h3>1. Model the list by index; fetch per visible row</h3>
        <p>
          When the payloads come from per-row requests you do not have the data up front, so the main (index-only) list is the
          fit: <code>items</code> only supplies a length, the slot provides <code>index</code>, and each mounted row renders a
          child component with that index. Fetching therefore happens only for rows that actually mount — never for the other
          ~99,990 — which is exactly the cost profile virtualization is meant to deliver. This is the index-only variant of the
          library's data-less rows: if you already hold full objects you would pass them and render from <code>item</code>
          instead; index-only rows defer all data work to the visible window and scale to very large counts.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { computed } from 'vue';
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import AsyncRow from './AsyncRow.vue';

// The array is only a length: real content is fetched by each visible row's
// child component, keyed by index, so nothing else is materialized even for
// 100k rows. Fetching happens only for rows that actually mount.
const itemCount = 100_000;
const items = computed(() => new Array(itemCount));
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    class=&quot;feed&quot;
    :items=&quot;items&quot;
    :buffer-before=&quot;4&quot;
    :buffer-after=&quot;4&quot;
  >
    &lt;template #item=&quot;{ index }&quot;>
      &lt;AsyncRow :id=&quot;index&quot; />
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>2. Fetch in the row, but guard against unmounting</h3>
        <p>
          The row component fetches when its <code>id</code> changes (<code>watch</code> + <code>immediate</code>): it nulls the
          post to show the skeleton again, awaits the load, and stores the result. The critical detail is lifecycle safety — a
          row can scroll out of the window (and be unmounted) while its request is in flight. Keep an <code>alive</code> flag set
          false in <code>onUnmounted</code> and only assign the resolved post when it is still true, so a recycled row never
          receives a stale write. Rendering the skeleton (<code>v-if=&quot;post&quot;</code> / <code>v-else</code>) gives the row
          something stable to measure from frame one; when the content lands it swaps in and the measured height updates.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { onUnmounted, shallowRef, watch } from 'vue';
import { loadPost, type Post } from './post-feed';

const props = defineProps&lt;{ id: number }>();

const post = shallowRef&lt;Post | null>(null);
let alive = true; // discard the result if the row scrolled away mid-fetch

watch(
  () => props.id,
  async () => {
    post.value = null; // back to the skeleton for the new id
    const result = await loadPost(props.id);
    if (alive) post.value = result; // never write to an unmounted component
  },
  { immediate: true },
);

onUnmounted(() => {
  alive = false;
});
&lt;/script>
&nbsp;
&lt;template>
  &lt;div class=&quot;row&quot;>
    &lt;div v-if=&quot;post&quot; class=&quot;content&quot;>
      &lt;strong>{{ post.author }}&lt;/strong>
      &lt;p>{{ post.excerpt }}&lt;/p>
    &lt;/div>
    &lt;div
      v-else
      class=&quot;skeleton&quot;
      role=&quot;status&quot;
      aria-label=&quot;Loading&quot;
    >
      &amp;lt;!-- placeholder sized like the content it will become, so the row's
           measured height barely changes when the real content lands -->
    &lt;/div>
  &lt;/div>
&lt;/template>"
        />

        <h3>3. Cache and dedupe outside the rows</h3>
        <p>
          Virtualization mounts a row when it enters the window and unmounts it when it leaves — so a naive component-level
          cache is wiped every time the row scrolls away, and coming back would refetch. Keep the store at module scope, shared
          by every mount: a resolved <code>Map</code> makes a revisit resolve from memory (instant), and a second map of in-flight
          promises dedupes concurrent mounts of the same id (two overscanned rows requesting once). Because rows recycle, all
          authoritative state lives in this model layer, never in recycled row DOM. If you later need to invalidate (for example
          a “clear cache” control), clear the maps and bump a <code>version</code> prop the rows watch, so only the currently
          mounted rows refetch.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          line-numbers
          code="import type { Post } from './post-feed';

// Module-scope store, OUTSIDE any row component. Rows are recycled (mounted and
// unmounted as they scroll), so per-row state would be lost on scroll-away; the
// cache is shared and survives every unmount, making a revisit instant.
const posts = new Map&lt;number, Post>();
const inFlight = new Map&lt;number, Promise&lt;Post>>();

// Your real HTTP/stream loader goes here; this stands in for it.
function fetchPost(id: number): Promise&lt;Post> {
  return new Promise((resolve) => setTimeout(() => resolve({ id } as Post), 250));
}

export function loadPost(id: number): Promise&lt;Post> {
  const cached = posts.get(id);
  if (cached) return Promise.resolve(cached);

  // An in-flight map dedupes concurrent mounts of the same id: if two rows for
  // one id mount at once (buffer overscan), only one network request runs.
  let pending = inFlight.get(id);
  if (!pending) {
    pending = fetchPost(id).then((p) => {
      posts.set(id, p);
      return p;
    });
    inFlight.set(id, pending);
  }
  return pending;
}"
        />

        <h3>4. Let heights be measured — skeleton first, then the real row</h3>
        <p>
          Each row's final height is unknown until its content renders, so leave <code>item-size</code> unset (or pass
          <code>0</code>/<code>null</code>) to select dynamic mode: the engine measures every mounted row with
          <code>ResizeObserver</code> and updates the offset tree when content arrives. Make the placeholder approximate the
          content it precedes (a <code>min-height</code> close to the expected row, matching avatar/title/excerpt blocks) so the
          first frame and the initial scroll estimate are sane and the measured correction is small; you can also provide a
          <code>default-item-size</code> estimate for the engine until the first measurements land. Because the fetch is
          client-only work, render the skeleton during SSR and fetch on the client after mount — never run (or schedule) the
          simulated request server-side or server-rendered output becomes nondeterministic. Buffers above the default help
          because a still-loading row keeps a small skeleton height; <code>buffer-before</code>/<code>buffer-after</code> of a
          few rows give the engine time to measure before a row scrolls fully into view.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
