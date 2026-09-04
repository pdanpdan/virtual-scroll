<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref, watch } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ExampleXScrollbar from '#/components/ExampleXScrollbar.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

type LogLevel = 'INFO' | 'DEBUG' | 'WARN' | 'ERROR';

// --- Deterministic lazy log dataset: 200,000 lines are never materialized. ---
// Every line is derived from its index on demand, so filtering only allocates
// the (much smaller) array of matching indices.

const TOTAL_LINES = 200_000;
const LINE_HEIGHT = 40;
const BASE_TIME = Date.UTC(2026, 1, 3, 8, 0, 0);

const SERVICES = [ 'AuthService', 'CacheWorker', 'OrderService', 'PaymentGateway', 'SearchIndex', 'SyncEngine', 'RateLimiter', 'EventBus', 'FileStore', 'QueueConsumer' ];
const TOKENS = [ 'request', 'job', 'event', 'query', 'batch', 'session', 'payment', 'sync', 'upload', 'render', 'search', 'export' ];
const ERROR_CAUSES = [ 'timeout', 'connection refused', 'invalid payload', 'rate limited', 'disk full', 'unexpected EOF' ];

/** Deterministic pseudo-random number in [0, 1) derived from `i` and `salt`. */
function rnd(i: number, salt: number): number {
  let x = Math.imul(i + Math.imul(salt + 1, 0x9E3779B9), 2654435761);
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

function pick<T>(list: T[], i: number, salt: number): T {
  return list[ Math.floor(rnd(i, salt) * list.length) ]!;
}

function levelOf(i: number): LogLevel {
  const r = rnd(i, 7);
  if (r < 0.5) {
    return 'INFO';
  }
  if (r < 0.75) {
    return 'DEBUG';
  }
  if (r < 0.92) {
    return 'WARN';
  }
  return 'ERROR';
}

function messageOf(i: number): string {
  const service = pick(SERVICES, i, 3);
  const token = pick(TOKENS, i, 5);
  const id = 1000 + (i % 90000);
  switch (levelOf(i)) {
    case 'INFO':
      return `${ service }: completed ${ token } #${ id } in ${ 5 + (i % 250) }ms`;
    case 'DEBUG':
      return `${ service }: cache ${ i % 2 === 0 ? 'hit' : 'miss' } for ${ token } #${ id } (${ (i * 13) % 100 } entries)`;
    case 'WARN':
      return `${ service }: slow ${ token } #${ id } — took ${ 300 + (i % 700) }ms`;
    case 'ERROR':
      return `${ service }: failed ${ token } #${ id }: ${ pick(ERROR_CAUSES, i, 11) }`;
  }
}

function timeOf(i: number): string {
  const ts = BASE_TIME + i * 95 + (i % 11) * 5;
  const d = new Date(ts);
  const pad = (n: number, len = 2) => String(n).padStart(len, '0');
  return `${ pad(d.getUTCHours()) }:${ pad(d.getUTCMinutes()) }:${ pad(d.getUTCSeconds()) }.${ pad(d.getUTCMilliseconds(), 3) }`;
}

/** Rows are hole-y in the unfiltered view and global log indices when filtered. */
function rowIndexFor(item: unknown, index: number): number {
  return typeof item === 'number' ? item : index;
}

// Sparse placeholder for the unfiltered dataset: no per-line data is stored.
const baseItems = new Array(TOTAL_LINES);

// --- Filtering over the lazy dataset ---

/** Levels selected as toggles; an empty selection shows everything. */
const activeLevels = ref<LogLevel[]>([]);
const searchQuery = ref('');
const debouncedQuery = ref('');
const filteredIndices = ref<number[] | null>(null);

const LEVEL_ORDER: LogLevel[] = [ 'INFO', 'DEBUG', 'WARN', 'ERROR' ];

const levelSolid: Record<LogLevel, string> = {
  INFO: 'btn-info',
  DEBUG: 'btn-neutral',
  WARN: 'btn-warning',
  ERROR: 'btn-error',
};

const levelSoft: Record<LogLevel, string> = {
  INFO: 'btn-soft btn-info',
  DEBUG: 'btn-soft btn-neutral',
  WARN: 'btn-soft btn-warning',
  ERROR: 'btn-soft btn-error',
};

function toggleLevel(level: LogLevel) {
  activeLevels.value = activeLevels.value.includes(level)
    ? activeLevels.value.filter((l) => l !== level)
    : [ ...activeLevels.value, level ];
}

function clearLevels() {
  activeLevels.value = [];
}

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchQuery, (value) => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    debouncedQuery.value = value.trim().toLowerCase();
  }, 250);
});

const isFiltering = computed(() => activeLevels.value.length > 0 || debouncedQuery.value !== '');

const items = computed<(number | undefined)[]>(() => filteredIndices.value ?? baseItems);

const visibleCount = computed(() => filteredIndices.value?.length ?? TOTAL_LINES);

function matchesFilter(i: number): boolean {
  const levels = activeLevels.value;
  if (levels.length > 0 && !levels.includes(levelOf(i))) {
    return false;
  }
  const query = debouncedQuery.value;
  return query === '' || messageOf(i).toLowerCase().includes(query);
}

function rebuildFiltered() {
  if (!isFiltering.value) {
    filteredIndices.value = null;
    return;
  }
  const results: number[] = [];
  for (let i = 0; i < TOTAL_LINES; i++) {
    if (matchesFilter(i)) {
      results.push(i);
    }
  }
  filteredIndices.value = results;
}

const levelBadge: Record<LogLevel, string> = {
  INFO: 'badge-soft badge-info',
  DEBUG: 'badge-soft badge-neutral',
  WARN: 'badge-soft badge-warning',
  ERROR: 'badge-soft badge-error',
};

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function jumpTo(position: number) {
  const count = filteredIndices.value?.length ?? TOTAL_LINES;
  if (count === 0) {
    return;
  }
  virtualScrollRef.value?.scrollToIndex(Math.max(0, Math.min(position, count - 1)), null, { align: 'start', behavior: 'smooth' });
}

watch([ activeLevels, debouncedQuery ], () => {
  rebuildFiltered();
  virtualScrollRef.value?.scrollToIndex(0, null, { align: 'start', behavior: 'auto' });
}, { immediate: true });

const currentPosition = computed(() => scrollDetails.value?.currentIndex ?? 0);

const currentGlobal = computed(() => (filteredIndices.value ? filteredIndices.value[ currentPosition.value ] : currentPosition.value) ?? 0);
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-2">Log Viewer</span>
    </template>

    <template #description>
      Filters and searches {{ TOTAL_LINES.toLocaleString() }} generated log lines without materializing them: every row is derived from its index on demand, and filtering builds only the array of matching indices. Any filter change rebuilds the index and jumps straight back to the first match.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 5.25h6.75l2.25 2.25H21M3 5.25A2.25 2.25 0 0 0 .75 7.5v9A2.25 2.25 0 0 0 3 18.75h18A2.25 2.25 0 0 0 23.25 16.5v-9A2.25 2.25 0 0 0 21 5.25h-9" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 12.75h3m-3 3h6m-6-6h9" />
      </svg>
    </template>

    <template #subtitle>
      Filter and search a large lazy log stream
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
        <div class="join bg-base-100 rounded-field border border-base-content/10">
          <button
            class="btn btn-sm join-item"
            :class="activeLevels.length === 0 ? 'btn-primary' : 'btn-soft'"
            :aria-pressed="activeLevels.length === 0"
            @click="clearLevels"
          >
            All
          </button>
          <button
            v-for="level in LEVEL_ORDER"
            :key="level"
            class="btn btn-sm join-item"
            :class="activeLevels.includes(level) ? levelSolid[ level ] : levelSoft[ level ]"
            :aria-pressed="activeLevels.includes(level)"
            @click="toggleLevel(level)"
          >
            {{ level }}
          </button>
        </div>

        <label class="input input-sm max-w-80">
          <span class="sr-only">Search log messages</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Search messages…"
          />
        </label>

        <button class="btn btn-sm btn-soft" :disabled="visibleCount === 0" @click="jumpTo(0)">First</button>
        <button class="btn btn-sm btn-soft" :disabled="currentPosition <= 0 || visibleCount === 0" @click="jumpTo(currentPosition - 1)">Prev</button>
        <button class="btn btn-sm btn-soft" :disabled="currentPosition >= visibleCount - 1 || visibleCount === 0" @click="jumpTo(currentPosition + 1)">Next</button>
        <button class="btn btn-sm btn-soft" :disabled="visibleCount === 0" @click="jumpTo(visibleCount - 1)">Last</button>

        <div class="text-xs opacity-60 ms-auto">
          Showing {{ visibleCount.toLocaleString() }} / {{ TOTAL_LINES.toLocaleString() }} lines · top line {{ currentGlobal.toLocaleString() }}
        </div>
      </div>
    </template>

    <div class="relative flex min-h-0 flex-1 flex-col">
      <VirtualScroll
        ref="virtualScrollRef"
        :debug="debugMode"
        class="example-container"
        :items="items"
        :item-size="LINE_HEIGHT"
        :buffer-before="10"
        :buffer-after="10"
        virtual-scrollbar
        aria-label="Log viewer list"
        @scroll="onScroll"
      >
        <template #item="{ item, index }">
          <div class="log-row">
            <span class="log-col log-col--index font-mono">{{ String(rowIndexFor(item, index)).padStart(6, '0') }}</span>
            <span class="log-col log-col--time font-mono">{{ timeOf(rowIndexFor(item, index)) }}</span>
            <span
              class="log-col log-col--level badge badge-xs min-w-14"
              :class="levelBadge[ levelOf(rowIndexFor(item, index)) ]"
            >{{ levelOf(rowIndexFor(item, index)) }}</span>
            <span class="log-col log-col--message font-mono">{{ messageOf(rowIndexFor(item, index)) }}</span>
          </div>
        </template>
      </VirtualScroll>
      <ExampleXScrollbar />
    </div>
  </ExampleContainer>
</template>

<style scoped>
@layer components {
  .log-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    block-size: 40px;
    padding-inline: 0.75rem;
    border-block-end: 1px solid color-mix(in oklab, currentColor 8%, transparent);
    font-size: 0.8125rem;
    white-space: nowrap;
  }

  .log-col--index {
    inline-size: 4.5rem;
    flex: none;
    opacity: 0.45;
    font-variant-numeric: tabular-nums;
  }

  .log-col--time {
    flex: none;
    opacity: 0.65;
    font-variant-numeric: tabular-nums;
  }

  .log-col--level {
    flex: none;
    letter-spacing: 0.05em;
  }

  .log-col--message {
    flex: 1;
    /* 58ch = longest generated message; uniform rows keep the horizontal scroll range stable. */
    min-inline-size: 58ch;
  }
}

:deep(.virtual-scroll-container .virtual-scroll-wrapper) {
  contain: none;
}
</style>
