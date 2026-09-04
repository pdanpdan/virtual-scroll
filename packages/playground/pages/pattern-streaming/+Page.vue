<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ExampleXScrollbar from '#/components/ExampleXScrollbar.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

// Live "market" stream: 5,000 symbols, prices kept only for rows that have been
// seen (a small reactive store). Every tick only the rows in the visible window
// are mutated, so the update cost stays constant regardless of dataset size.

const SYMBOL_COUNT = 5_000;
const ROW_HEIGHT = 44;
const SPARK_POINTS = 24;

const TICKERS = [ 'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'AVGO', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'IBM', 'CSCO', 'QCOM', 'ADBE', 'PLTR', 'UBER', 'COIN', 'SHOP', 'SNOW', 'PANW', 'MRVL', 'MU' ];
const NAMES = [ 'Alpha Works', 'Blue Ridge', 'Cascade Tech', 'Delta Systems', 'Evergreen Co', 'Falcon Labs', 'Glacier Soft', 'Harbor Inc', 'Iris Cloud', 'Juniper AI', 'Kepler Data', 'Lumen Grid', 'Meridian Pay', 'Northwind IO', 'Orbit Media', 'Pioneer Bio', 'Quartz Logic', 'Ridge Micro', 'Summit Bank', 'Titan Mobile', 'Ursa Energy', 'Vertex Games', 'Willow Health', 'Xeno Devices', 'Zenith Auto' ];

/** Deterministic pseudo-random number in [0, 1) derived from `i` and `salt`. */
function rnd(i: number, salt: number): number {
  let x = Math.imul(i + Math.imul(salt + 1, 0x9E3779B9), 2654435761);
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

function symbolOf(i: number): string {
  return `${ TICKERS[ i % TICKERS.length ] } ${ String(Math.floor(i / TICKERS.length)).padStart(3, '0') }`;
}

function nameOf(i: number): string {
  return NAMES[ i % NAMES.length ]!;
}

function openPriceOf(i: number): number {
  return Math.round((18 + rnd(i, 9) * 320) * 100) / 100;
}

/** Last price per index; only indices that entered the viewport are stored. */
const prices = reactive(new Map<number, number>());
/** Rolling price history per index (for the sparkline); same lazy scope. */
const series = reactive(new Map<number, number[]>());

function priceOf(i: number): number {
  let price = prices.get(i);
  if (price === undefined) {
    price = openPriceOf(i);
    prices.set(i, price);
  }
  return price;
}

function sparkOf(i: number): number[] {
  let points = series.get(i);
  if (points === undefined) {
    points = Array.from({ length: SPARK_POINTS }, (_, k) => Math.round(openPriceOf(i) * (1 + (rnd(i, 31 + k) - 0.5) * 0.01) * 100) / 100);
    series.set(i, points);
  }
  return points;
}

function sparkPath(i: number): string {
  const points = sparkOf(i);
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 0.001);
  return points.map((p, k) => {
    const x = (k / (points.length - 1)) * 100;
    const y = 26 - ((p - min) / range) * 22 - 2;
    return `${ k === 0 ? 'M' : 'L' }${ x.toFixed(2) },${ y.toFixed(2) }`;
  }).join(' ');
}

function changeOf(i: number): number {
  return Math.round((priceOf(i) - openPriceOf(i)) * 100) / 100;
}

// Sparse placeholder: rows are rendered from the index, nothing is stored.
const baseItems = new Array(SYMBOL_COUNT);

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

// --- Stream controls ---

const paused = ref(false);
const intervalMs = ref(1000);
const tickCount = ref(0);
const lastUpdated = ref<string | null>(null);

let timer: ReturnType<typeof setInterval> | undefined;

function applyTick() {
  const range = scrollDetails.value?.range;
  if (!range) {
    return;
  }
  const from = Math.max(0, range.start - 2);
  const to = Math.min(SYMBOL_COUNT - 1, range.end + 2);
  for (let i = from; i <= to; i++) {
    const previous = priceOf(i);
    const drift = (rnd(i + tickCount.value * 7919, 17) - 0.5) * 0.012;
    const next = Math.max(1, Math.round(previous * (1 + drift) * 100) / 100);
    prices.set(i, next);
    series.set(i, [ ...sparkOf(i).slice(1), next ]);
  }
  tickCount.value++;
  lastUpdated.value = new Date().toLocaleTimeString();
}

function restartTimer() {
  clearInterval(timer);
  if (!paused.value) {
    timer = setInterval(applyTick, intervalMs.value);
  }
}

watch([ paused, intervalMs ], restartTimer);
onMounted(restartTimer);
onUnmounted(() => clearInterval(timer));

function jumpToRandom() {
  const target = Math.floor(rnd(tickCount.value + 1, 99) * SYMBOL_COUNT);
  virtualScrollRef.value?.scrollToIndex(target, null, { align: 'center', behavior: 'smooth' });
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-4">Live Streaming</span>
    </template>

    <template #description>
      A simulated market feed over {{ SYMBOL_COUNT.toLocaleString() }} symbols. Prices are kept only for rows that entered the viewport, and every tick mutates just the visible window — the per-tick cost stays constant however large the dataset grows. Pause, resume, or change the feed speed.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
      </svg>
    </template>

    <template #subtitle>
      Live updates over a virtualized market feed
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
        <button class="btn btn-sm" :class="paused ? 'btn-primary' : 'btn-soft' " @click="paused = !paused">
          {{ paused ? 'Resume' : 'Pause' }}
        </button>

        <label class="flex items-center gap-2 text-xs">
          <span class="small-caps font-bold tracking-widest opacity-60">Speed</span>
          <select v-model="intervalMs" class="select select-sm">
            <option :value="250">4× (250 ms)</option>
            <option :value="500">2× (500 ms)</option>
            <option :value="1000">1× (1 s)</option>
            <option :value="2000">½× (2 s)</option>
          </select>
        </label>

        <button class="btn btn-sm btn-soft" @click="jumpToRandom">Jump to random row</button>

        <div class="text-xs opacity-60 ms-auto">
          <span v-if="lastUpdated">tick {{ tickCount }} · {{ lastUpdated }}</span>
          <span v-else>waiting for the first tick…</span>
        </div>
      </div>
    </template>

    <div class="relative flex min-h-0 flex-1 flex-col">
      <VirtualScroll
        ref="virtualScrollRef"
        :debug="debugMode"
        class="example-container"
        :items="baseItems"
        :item-size="ROW_HEIGHT"
        :buffer-before="6"
        :buffer-after="6"
        virtual-scrollbar
        aria-label="Live streaming market list"
        @scroll="onScroll"
      >
        <template #item="{ index }">
          <div class="flex items-center gap-3 h-11 px-3 border-b border-base-content/5">
            <div class="w-24 shrink-0">
              <div class="font-bold text-xs leading-tight">{{ symbolOf(index) }}</div>
              <div class="text-[10px] leading-tight opacity-50 truncate">{{ nameOf(index) }}</div>
            </div>

            <div class="w-28 shrink-0 text-end">
              <div class="font-mono tabular-nums font-bold text-sm leading-tight">
                ${{ priceOf(index).toFixed(2) }}
              </div>
            </div>

            <div class="w-20 shrink-0">
              <span
                class="badge badge-xs tabular-nums"
                :class="changeOf(index) >= 0 ? 'badge-success' : 'badge-error'"
              >{{ changeOf(index) >= 0 ? '▲' : '▼' }} {{ Math.abs(changeOf(index)).toFixed(2) }}</span>
            </div>

            <svg
              class="h-6 w-28 shrink-0 overflow-visible"
              viewBox="0 0 100 26"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                :d="sparkPath(index)"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                vector-effect="non-scaling-stroke"
                :class="changeOf(index) >= 0 ? 'text-success' : 'text-error'"
              />
            </svg>

            <div class="hidden @4xl:block text-[10px] tabular-nums opacity-50 truncate flex-1 min-w-0">
              #{{ index }} · {{ nameOf(index) }} · vol {{ ((index * 7919) % 90000 + 1000).toLocaleString() }}
            </div>
          </div>
        </template>
      </VirtualScroll>
      <ExampleXScrollbar />
    </div>

    <template #implementation>
      <ImplementationGuide>
        <p>
          Dashboards, market feeds, and log tails show a steady stream of data over a <em>stable</em> set of rows. When updates
          mutate values in place — no rows are inserted or removed, and every row keeps its size — the list has a decisive
          property for live refresh: the engine's geometry never changes, so an update cannot shift the layout or move the
          user's scroll position. The technique is to keep that geometry fixed and drive each tick from the visible range the
          engine reports, touching only mounted rows so the per-tick cost is O(viewport) no matter how large the dataset is.
          The tradeoff is architectural: you design for a fixed set of uniform-height rows that refresh in place, which is the
          right fit for live values but not for an ever-growing tail (that case needs the end-anchored append pattern instead).
        </p>

        <h3>1. Model rows for in-place updates</h3>
        <p>
          Two models fit a live feed. The mainstream one is a real array of row objects: every tick mutates a field (such as
          <code>price</code>) on existing items, reactivity re-renders the mounted rows, and a uniform numeric
          <code>item-size</code> keeps layout O(1) with no DOM measurement. Pass <code>items</code> the reactive array and read
          each row from the <code>#item</code> slot's <code>item</code>, as in the snippet below.
        </p>
        <p>
          If the dataset is huge, or each row's payload is a pure function of its index so storing every row is wasteful, use an
          index-only list instead: a sparse placeholder as <code>items</code> (<code>new Array(count)</code>), content derived
          inside the slot from <code>index</code>, and — when rows carry state — a reactive store keyed by index (a
          <code>Map</code>) that materializes a value only when the row first enters the viewport. The VirtualScroll props are
          identical; only the slot differs (<code>item</code> vs <code>index</code>). Reach for real objects when you already own
          the data, and index-only when deriving each row is inexpensive and you want zero storage cost for the unseen rows.
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
import { reactive } from 'vue';

// Mainstream model: a real array of row objects. All rows share one fixed
// height, so a numeric item-size keeps layout O(1) with no DOM measurement.
const rows = reactive(
  Array.from({ length: 5_000 }, (_, index) => ({ id: index, price: 100 })),
);
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    ref=&quot;feed&quot;
    class=&quot;feed&quot;
    :items=&quot;rows&quot;
    :item-size=&quot;44&quot;
    :buffer-before=&quot;6&quot;
    :buffer-after=&quot;6&quot;
    @scroll=&quot;onScroll&quot;
  >
    &lt;template #item=&quot;{ item }&quot;>
      &lt;div class=&quot;row&quot;>{{ item.id }} — ${{ item.price.toFixed(2) }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.feed { height: 480px; }
.row {
  box-sizing: border-box;
  height: 44px; /* must equal item-size */
  display: flex; align-items: center; padding-inline: 12px;
  font-variant-numeric: tabular-nums; /* digits keep a stable width */
}
&lt;/style>"
        />

        <h3>2. Keep the geometry fixed — that is what preserves the scroll</h3>
        <p>
          For updates not to jump the viewport, the list's geometry must stay constant: pass an <code>item-size</code> that equals
          the rendered row height, and keep value text from reflowing its row or column — fixed widths plus
          <code>font-variant-numeric: tabular-nums</code> so a price change does not change digit widths. Because the row count
          and every row's size are constant, the total content height never changes, so the browser keeps a valid
          <code>scrollTop</code> and you need no anchoring or restoration code for in-place updates.
        </p>
        <p>
          This is the key contrast with an appending list: when you push rows onto the end the content height grows, and keeping
          the newest row visible requires anchoring to the last index after each append (an end-aligned
          <code>scrollToIndex</code>) — a separate mechanism from the in-place refresh shown here.
        </p>

        <h3>3. Drive each tick from the reported visible range</h3>
        <p>
          The <code>@scroll</code> event emits a <code>ScrollDetails</code> whose <code>range</code> field
          (<code>{ start, end }</code>) is the window of mounted rows (buffers included). Cache it, and on every tick mutate only
          <code>[start − k, end + k]</code>, with a small <code>k</code> overscan so rows about to scroll into view are already
          fresh. Mutating an existing reactive item re-renders just that mounted row, so the work per tick stays proportional to
          what is visible — it never grows with the dataset, which is the point of pairing virtualization with a live feed.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="import type { ScrollDetails } from '@pdanpdan/virtual-scroll';

// The visible window, refreshed from every @scroll event.
let range: { start: number; end: number } | undefined;
function onScroll(d: ScrollDetails) {
  range = d.range;
}

// One feed tick updates only the rows that are (nearly) on screen, so the work
// is O(viewport) and never grows with the dataset. Mutating an existing
// reactive item re-renders just its mounted row.
function applyTick() {
  if (!range) return;
  const from = Math.max(0, range.start - 2);
  const to = Math.min(rows.length - 1, range.end + 2);
  for (let i = from; i &lt;= to; i++) {
    rows[i].price = Math.max(1, rows[i].price * (1 + (Math.random() - 0.5) * 0.02));
  }
}

setInterval(applyTick, 1000);"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>

<style scoped>
:deep(.virtual-scroll-container .virtual-scroll-wrapper) {
  contain: none;
}
</style>
