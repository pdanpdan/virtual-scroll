<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
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
  </ExampleContainer>
</template>
