<script setup lang="ts">
import type { MasonryScrollDetails, VirtualScrollMasonryInstance } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScrollMasonry } from '@pdanpdan/virtual-scroll';
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { createSeededRandom } from '#/lib/random';

import { html as highlightedCode } from './+Page.vue?highlight';

interface MasonryItem {
  id: number;
  hue: number;
  lines: number;
}

/** Short words so body lines never wrap at the demo's column widths. */
const WORDS = [
  'amber',
  'basalt',
  'cobalt',
  'dune',
  'ember',
  'feldspar',
  'garnet',
  'harbor',
  'iris',
  'juniper',
  'kelp',
  'lagoon',
  'marble',
  'nebula',
  'onyx',
  'pumice',
  'quartz',
  'reed',
  'sienna',
  'tide',
  'umber',
  'vapor',
  'willow',
  'zephyr',
  'atlas',
  'boreal',
  'cinder',
  'delta',
  'elm',
  'fjord',
];

/** Deterministic short body line for a card row (pure function of the model). */
function lineOf(item: MasonryItem, row: number): string {
  return `${ WORDS[ (item.id * 13 + row * 7) % WORDS.length ] } ${ WORDS[ (item.id * 29 + row * 11) % WORDS.length ] }`;
}

/**
 * Natural content height of a card in px: padding + header row + `lines`
 * text rows at 12px/20px with 8px gaps.
 */
function naturalHeight(item: MasonryItem): number {
  return 48 + item.lines * 28;
}

function makeItems(count: number): MasonryItem[] {
  const random = createSeededRandom(6789);
  return Array.from({ length: count }, (_, id) => ({
    id,
    hue: (id * 137.5) % 360,
    lines: 2 + Math.floor(random() * 4),
  }));
}

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const items = ref<MasonryItem[]>(makeItems(3000));
const count = ref(3000);
const targetWidth = ref(240);
const virtualScrollbar = ref(true);
const measuredHeights = ref(false);

watch(count, (value) => {
  items.value = makeItems(value);
});

/**
 * Canonical oracle: pure function of the item model and the resolved column
 * width — the same (index, width) always yields the same height, so every
 * layout is reproducible and far jumps need no DOM measurement. It slightly
 * over-estimates the base content so measured mode has room to correct.
 */
function itemHeight(item: MasonryItem | undefined, _index: number, width: number): number {
  const estimate = item ? naturalHeight(item) * 1.3 : 200;
  return Math.max(48, Math.round(estimate * (width / 240)));
}

const masonryRef = ref<VirtualScrollMasonryInstance<MasonryItem> | null>(null);

/** Proof readouts refreshed on every scroll/layout emission. */
const stats = ref({ columns: 0, columnWidth: 0, totalHeight: 0, exact: false });
const scrollDetails = ref<MasonryScrollDetails<MasonryItem> | null>(null);

function handleScroll(details: MasonryScrollDetails<MasonryItem>) {
  scrollDetails.value = details;
  const instance = masonryRef.value;
  if (instance) {
    stats.value = {
      columns: details.columnRange.end,
      columnWidth: instance.columnWidth,
      totalHeight: details.totalSize.height,
      exact: instance.totalHeightExact,
    };
  }
}

/**
 * Measured-mode showcase: while the toggle is on, note rows are added to a
 * couple of visible cards every tick. The cards grow in the DOM, the
 * ResizeObserver measurements drive the layout, and every re-layout keeps
 * the topmost visible card pinned — canonical mode cannot track content it
 * never measures.
 */
const extraLines = ref(new Map<number, number>());
const growTick = ref(0);

function growVisibleCards(): void {
  const range = scrollDetails.value?.range;
  if (!range || range.end - range.start < 2) {
    return;
  }
  growTick.value++;
  const next = new Map(extraLines.value);
  for (const salt of [ 5, 7 ]) {
    const index = range.start + ((growTick.value * salt + 3) % (range.end - range.start));
    const id = items.value[ index ]?.id;
    if (id === undefined) {
      continue;
    }
    const grown = Math.min(5, (next.get(id) ?? 0) + 2);
    next.set(id, grown);
  }
  extraLines.value = next;
}

let growTimer: ReturnType<typeof setInterval> | undefined;

watch(measuredHeights, (enabled) => {
  if (enabled) {
    growTimer ??= setInterval(growVisibleCards, 700);
  } else {
    if (growTimer) {
      clearInterval(growTimer);
      growTimer = undefined;
    }
    extraLines.value = new Map();
  }
});

onBeforeUnmount(() => {
  if (growTimer) {
    clearInterval(growTimer);
  }
});

const jumpIndex = ref(0);
const maxIndex = computed(() => Math.max(0, items.value.length - 1));

function handleJump() {
  masonryRef.value?.scrollToIndex(Math.min(jumpIndex.value, maxIndex.value), { align: 'center' });
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-6">Masonry Grid</span>
    </template>

    <template #description>
      Real masonry in a single scroll container: responsive columns derived from the container width and a bounded
      DOM window no matter the dataset size. Card heights come from a deterministic oracle (canonical layout) — or
      flip <em>Measure card heights</em> on: mounted cards are measured and every few ticks two visible cards grow
      a note row, so you can watch the measured layout track the real DOM with the viewport pinned.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-6"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h8v11H3z M3 16h8v5H3z M13 3h8v6h-8z M13 11h8v10h-8z" />
      </svg>
    </template>

    <template #subtitle>
      Single scroll container: canonical oracle heights or measured card heights
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" dom-count-selector=".masonry-demo" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Cards</span>
          <input
            v-model.number="count"
            type="range"
            min="100"
            max="20000"
            step="100"
            class="range range-primary range-xs"
          />
          <span class="settings-value font-mono font-bold text-primary">{{ count.toLocaleString() }}</span>
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Target column width</span>
          <input
            v-model.number="targetWidth"
            type="range"
            min="120"
            max="480"
            step="10"
            class="range range-primary range-xs"
          />
          <span class="settings-value font-mono font-bold text-primary">{{ targetWidth }}px</span>
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Measure card heights</span>
          <input v-model="measuredHeights" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Virtual Scrollbars</span>
          <input v-model="virtualScrollbar" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <div class="settings-item group gap-2">
          <span class="settings-label">Jump to card</span>
          <input
            v-model.number="jumpIndex"
            type="number"
            min="0"
            :max="maxIndex"
            aria-label="Card index to jump to"
            class="input input-sm input-bordered w-28 font-mono"
          />
          <button class="btn btn-sm btn-primary" @click="handleJump">Go</button>
        </div>

        <div class="hidden xl:flex items-center gap-2 font-mono text-xs">
          <span class="badge badge-secondary">cols {{ stats.columns }}</span>
          <span class="badge badge-neutral badge-outline">{{ Math.round(stats.columnWidth) }}px</span>
          <span class="badge badge-neutral badge-outline">{{ Math.round(stats.totalHeight).toLocaleString() }}px</span>
          <span class="badge badge-success badge-outline">{{ stats.exact ? 'exact total' : 'estimating…' }}</span>
          <span v-if="measuredHeights" class="badge badge-info">measured</span>
        </div>
      </div>
    </template>

    <div class="relative flex-1 min-h-0">
      <VirtualScrollMasonry
        ref="masonryRef"
        class="masonry-demo outline-0"
        :items="items"
        :item-height="itemHeight"
        :target-column-width="targetWidth"
        :min-columns="1"
        :max-columns="8"
        :gap="16"
        :measured-heights="measuredHeights"
        :virtual-scrollbar="virtualScrollbar"
        :debug="debugMode"
        :aria-label="`Masonry demo with ${ items.length } cards`"
        @scroll="handleScroll"
      >
        <template #item="{ item, index, column }">
          <div v-if="item" class="relative">
            <div
              class="absolute inset-0 rounded-box border border-base-content/10 shadow-sm"
              :style="{
                backgroundColor: `hsl(${ item.hue }, 55%, 78%)`,
              }"
            />
            <div class="relative p-3 flex flex-col gap-2">
              <div class="flex justify-between items-center gap-2">
                <span class="bg-base-300/40 px-2 py-0.5 rounded text-xs font-bold small-caps tracking-wider text-base-content/70">
                  Card #{{ index }}
                </span>
                <span class="bg-base-300/40 px-2 py-0.5 rounded font-mono text-[10px] font-bold text-base-content/70">
                  c{{ column }}
                </span>
              </div>
              <p
                v-for="row in item.lines + (extraLines.get(item.id) ?? 0)"
                :key="row"
                class="text-xs leading-5 text-base-content/80 m-0"
              >
                {{ lineOf(item, row - 1) }}
              </p>
            </div>
          </div>
        </template>
      </VirtualScrollMasonry>
    </div>
  </ExampleContainer>
</template>
