<script setup lang="ts">
import type { ScrollAlignment } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onUnmounted, ref, watch } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

interface DataItem {
  id: string;
  isHeader?: boolean;
  name: string;
  sub?: string;
  meta?: string;
  extra?: string;
  rowExtra?: string;
  count?: number;
  status?: 'active' | 'dormant';
}

const DATASETS = [
  { id: 'contacts', label: 'Contacts' },
  { id: 'atlas', label: 'World Atlas' },
  { id: 'ledger', label: 'Ledger' },
  { id: 'wiki', label: 'Knowledge Base' },
] as const;

type DatasetId = typeof DATASETS[ number ][ 'id' ];

const SIZES = [ 1_000, 10_000, 50_000, 250_000 ];
const ALIGNMENTS = [ 'start', 'center', 'end', 'auto' ] as const;

const FIRST_NAMES = [ 'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara' ];
const SURNAMES_BY_LETTER: Record<string, readonly string[]> = {
  A: [ 'Anderson', 'Adams', 'Allen', 'Arnold', 'Avery', 'Alvarez', 'Andrews' ],
  B: [ 'Baker', 'Brown', 'Bennett', 'Bishop', 'Boyd', 'Brooks', 'Bailey', 'Butler' ],
  C: [ 'Clark', 'Carter', 'Campbell', 'Collins', 'Cooper', 'Coleman', 'Cox' ],
  D: [ 'Davis', 'Dixon', 'Dunn', 'Douglas', 'Daniels', 'Diaz' ],
  E: [ 'Edwards', 'Ellis', 'Evans', 'Erickson', 'Elliott' ],
  F: [ 'Foster', 'Fisher', 'Fox', 'Franklin', 'Flores', 'Ford' ],
  G: [ 'Garcia', 'Green', 'Gonzalez', 'Gray', 'Griffin', 'Gomez', 'Graham' ],
  H: [ 'Harris', 'Hall', 'Hernandez', 'Howard', 'Hughes', 'Hill', 'Hayes' ],
  I: [ 'Ingram', 'Irwin', 'Ibarra', 'Isaacson' ],
  J: [ 'Johnson', 'Jones', 'Jackson', 'James', 'Jenkins', 'Jordan' ],
  K: [ 'King', 'Kelly', 'Kennedy', 'Knight', 'Kim' ],
  L: [ 'Lee', 'Lewis', 'Lopez', 'Long', 'Larson', 'Lawrence' ],
  M: [ 'Miller', 'Martin', 'Moore', 'Martinez', 'Mitchell', 'Morgan', 'Myers', 'Murphy' ],
  N: [ 'Nelson', 'Nguyen', 'Nichols', 'Norris', 'Newman' ],
  O: [ 'Ortiz', 'Oliver', 'Owens', 'Osborne', 'Olson' ],
  P: [ 'Perez', 'Parker', 'Phillips', 'Powell', 'Price', 'Peterson' ],
  Q: [ 'Quinn', 'Quinlan', 'Quintero' ],
  R: [ 'Robinson', 'Rodriguez', 'Rivera', 'Roberts', 'Ross', 'Reed', 'Ramirez' ],
  S: [ 'Smith', 'Scott', 'Sanchez', 'Stewart', 'Sullivan', 'Sanders', 'Simmons' ],
  T: [ 'Taylor', 'Thomas', 'Thompson', 'Turner', 'Torres', 'Tucker' ],
  U: [ 'Underwood', 'Upton', 'Ulrich' ],
  V: [ 'Vasquez', 'Vaughn', 'Vargas', 'Vega' ],
  W: [ 'Williams', 'Walker', 'White', 'Wilson', 'Wright', 'Watson' ],
  X: [ 'Xu', 'Xiong', 'Xiao' ],
  Y: [ 'Young', 'Yates', 'Yang' ],
  Z: [ 'Zimmerman', 'Zhou', 'Zamora', 'Zhang' ],
};
const DEPARTMENTS = [ 'Engineering', 'Product Design', 'Growth Marketing', 'Enterprise Sales', 'Customer Success', 'Legal & Compliance', 'Finance & Operations', 'Human Resources', 'Global Support' ];
const COUNTRIES = [ 'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'India', 'China', 'Italy', 'Spain', 'Mexico', 'South Korea', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Singapore', 'New Zealand', 'South Africa', 'Argentina', 'Egypt', 'Turkey', 'Saudi Arabia', 'United Arab Emirates' ];
const CITIES = [ 'Metropolis', 'Valoria', 'Oakhaven', 'Riverbend', 'Nova Crest', 'Beacon Hills', 'Sunnydale', 'Emerald Gates' ];
const MONTHS = [ 'January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026', 'June 2026' ];
const MERCHANTS = [ 'AWS Cloud Billing', 'Vercel Enterprise', 'Google APIs', 'Stripe Gateway', 'Figma Pro Suite', 'Auth0 Auth Server', 'Slack Comms Hub', 'MongoDB Shard Pool' ];
const CONCEPTS = [ 'Neural Networks', 'Quantum Mechanics', 'Consensus Protocol', 'Distributed Virtualization', 'Bio-Synthetic CRISPR', 'Superconducting Fields' ];
const WIKI_TEXTS = [
  'A brief introductory text node providing a simple overview of this dynamic topic to verify ResizeObserver is watching.',
  'Medium detailed research node explaining key historical milestones, current production viability, structural challenges, and real-time computation metrics. Provides an intermediate element height variance to test virtual calculations.',
  'Highly verbose, multi-paragraph conceptual blueprint detailing high-efficiency mathematical models, packet transmission safety vectors, environmental latency mitigation, global deployment consensus layers, and structural feedback algorithms designed to maintain complete operational integrity.',
  'An extremely detailed and complex technical record. This massive paragraph tests how the virtual scroll client coordinates with ResizeObserver on deeply dynamic text sizes. We detail theoretical foundations of sub-atomic scaling factors, mathematical equations showing performance delta improvements, and high-velocity UI compilation targets to prove scrolling rendering capability under severe load conditions.',
];

/**
 * Deterministic PRNG (mulberry32). The dataset generator is seeded per
 * (dataset, size) so the server-rendered HTML and the client hydration
 * produce identical data — no hydration mismatches, and the demo shows
 * the same records on every load.
 */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Small deterministic string hash (FNV-1a) for deriving data seeds. */
function hashString(value: string): number {
  let hash = 0x811C9DC5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function pick<T>(arr: readonly T[], random: () => number): T {
  return arr[ Math.floor(random() * arr.length) ] as T;
}

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function sectionSize(count: number, sections: number, random: () => number): number {
  return Math.max(1, Math.round((count / sections) * (0.8 + random() * 0.4)));
}

function generateDataset(dataset: DatasetId, count: number): { items: DataItem[]; sticky: number[]; } {
  const items: DataItem[] = [];
  const sticky: number[] = [];

  const random = createRandom(hashString(`${ dataset }:${ count }`));

  if (dataset === 'contacts') {
    for (let s = 0; s < 26; s++) {
      const letter = String.fromCharCode(65 + s);
      const headerIndex = items.length;
      const header: DataItem = { id: `sec-${ letter }`, isHeader: true, name: `Section ${ letter }` };
      items.push(header);
      sticky.push(headerIndex);
      const n = sectionSize(count, 26, random);
      const surnames = SURNAMES_BY_LETTER[ letter ];
      for (let j = 0; j < n; j++) {
        const fName = pick(FIRST_NAMES, random);
        const lName = pick(surnames ?? SURNAMES_BY_LETTER.A, random);
        const name = `${ lName }, ${ fName }`;
        const description = `${ name } is an active directory member overseeing scalable interfaces, cluster configuration management, and real-time data streams across network nodes.`;
        items.push({
          id: `con-${ letter }-${ j }`,
          name,
          sub: `${ fName.toLowerCase() }.${ lName.toLowerCase() }@enterprise.org`,
          meta: pick(DEPARTMENTS, random),
          status: random() > 0.3 ? 'active' : 'dormant',
          rowExtra: description,
          extra: description,
        });
      }
      header.count = n;
    }
  } else if (dataset === 'atlas') {
    for (let s = 0; s < COUNTRIES.length; s++) {
      const country = COUNTRIES[ s ];
      const headerIndex = items.length;
      const header: DataItem = { id: `sec-geo-${ s }`, isHeader: true, name: country };
      items.push(header);
      sticky.push(headerIndex);
      const n = sectionSize(count, COUNTRIES.length, random);
      for (let j = 0; j < n; j++) {
        const city = `${ pick(CITIES, random) } ${ j + 1 }`;
        const description = `Located under the jurisdiction of ${ country }, ${ city } serves as a global administrative hub processing structural logistics and energy distribution feeds.`;
        items.push({
          id: `city-${ s }-${ j }`,
          name: city,
          sub: `${ country } · GMT ${ random() > 0.5 ? '+' : '-' }${ Math.floor(random() * 12) }`,
          meta: formatNumber(Math.floor(random() * 9_500_000) + 45_000),
          status: random() > 0.15 ? 'active' : 'dormant',
          rowExtra: description,
          extra: description,
        });
      }
      header.count = n;
    }
  } else if (dataset === 'ledger') {
    for (let s = 0; s < MONTHS.length; s++) {
      const headerIndex = items.length;
      const header: DataItem = { id: `sec-ledger-${ s }`, isHeader: true, name: MONTHS[ s ] };
      items.push(header);
      sticky.push(headerIndex);
      const n = sectionSize(count, MONTHS.length, random);
      for (let j = 0; j < n; j++) {
        const merchant = pick(MERCHANTS, random);
        const description = `Transaction settled automatically on the core routing index for ${ merchant }. Security signature verified. Zero latency transaction cycle.`;
        items.push({
          id: `tx-${ s }-${ j }`,
          name: merchant,
          sub: `TXID: 0x${ Math.floor(random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0') }`,
          meta: `$${ formatNumber(Math.round((random() * 9_500 + 15) * 100) / 100) }`,
          status: random() > 0.05 ? 'active' : 'dormant',
          rowExtra: description,
          extra: description,
        });
      }
      header.count = n;
    }
  } else {
    for (let s = 0; s < CONCEPTS.length; s++) {
      const concept = CONCEPTS[ s ];
      const headerIndex = items.length;
      const header: DataItem = { id: `sec-wiki-${ s }`, isHeader: true, name: concept };
      items.push(header);
      sticky.push(headerIndex);
      const n = sectionSize(count, CONCEPTS.length, random);
      for (let j = 0; j < n; j++) {
        const text = WIKI_TEXTS[ j % WIKI_TEXTS.length ];
        items.push({
          id: `wiki-${ s }-${ j }`,
          name: `Theorem Definition Ref #${ j + 1 }`,
          sub: concept,
          meta: `Delta ${ (random() * 100).toFixed(1) }%`,
          rowExtra: text,
          extra: text,
          status: random() > 0.2 ? 'active' : 'dormant',
        });
      }
      header.count = n;
    }
  }

  return { items, sticky };
}

const activeDataset = ref<DatasetId>('contacts');
const count = ref(10_000);
const useDynamicSizing = ref(false);
const gap = ref(4);
const searchQuery = ref('');
const sectionIndex = ref<number | null>(null);
const targetIndexInput = ref('');
const align = ref<ScrollAlignment>('start');
const visibleRange = ref({ start: 0, end: 0 });
const selectedItem = ref<DataItem | null>(null);
const selectedItemIndex = ref<number | null>(null);
const toastMessage = ref('');
const itemModalRef = ref<HTMLDialogElement | null>(null);
const toastRef = ref<HTMLElement | null>(null);

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

watch([ activeDataset, searchQuery ], () => {
  sectionIndex.value = null;
});

const allData = computed(() => generateDataset(activeDataset.value, count.value));

function matchesQuery(item: DataItem, query: string): boolean {
  return item.name.toLowerCase().includes(query)
    || (item.sub ?? '').toLowerCase().includes(query)
    || (item.meta ?? '').toLowerCase().includes(query);
}

const display = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return allData.value;
  }

  const items: DataItem[] = [];
  const sticky: number[] = [];
  let currentHeader: DataItem | null = null;
  let currentHeaderIndex = -1;

  for (const item of allData.value.items) {
    if (item.isHeader) {
      currentHeader = { ...item, count: 0 };
      currentHeaderIndex = -1;
      continue;
    }
    if (!matchesQuery(item, query)) {
      continue;
    }
    if (currentHeader && currentHeaderIndex === -1) {
      currentHeaderIndex = items.length;
      sticky.push(currentHeaderIndex);
      items.push(currentHeader);
    }
    const header = currentHeaderIndex === -1 ? null : items[ currentHeaderIndex ];
    if (header) {
      header.count = (header.count ?? 0) + 1;
    }
    items.push(item);
  }

  return { items, sticky };
});

const displayItems = computed(() => display.value.items);
const stickyIndices = computed(() => display.value.sticky);

const stuckHeader = computed(() => {
  let found = -1;
  for (const i of stickyIndices.value) {
    if (i <= visibleRange.value.start) {
      found = i;
    } else {
      break;
    }
  }
  return found === -1 ? 'None' : (displayItems.value[ found ]?.name ?? 'None');
});
const sectionOptions = computed(() => {
  const result: { name: string; index: number; }[] = [];
  displayItems.value.forEach((item, index) => {
    if (item.isHeader) {
      result.push({ name: item.name, index });
    }
  });
  return result;
});
const activeDatasetLabel = computed(() => DATASETS.find((d) => d.id === activeDataset.value)?.label ?? '');

const fixedItemSize = (item: DataItem) => (item.isHeader ? 52 : 64);

function jumpToSection(event: Event) {
  const value = Number.parseInt((event.target as HTMLSelectElement).value, 10);
  if (Number.isNaN(value)) {
    return;
  }
  sectionIndex.value = value;
  virtualScrollRef.value?.scrollToIndex(value, 0, { align: 'start' });
}

function jumpToIndex() {
  const index = Number.parseInt(targetIndexInput.value, 10);
  if (Number.isNaN(index)) {
    return;
  }
  const clamped = Math.max(0, Math.min(index, displayItems.value.length - 1));
  virtualScrollRef.value?.scrollToIndex(clamped, 0, { align: align.value });
}

function scrollToStart() {
  virtualScrollRef.value?.scrollToIndex(0, 0, { align: 'start' });
}

function scrollToEnd() {
  virtualScrollRef.value?.scrollToIndex(displayItems.value.length - 1, 0, { align: 'end' });
}

function scrollToRandom() {
  if (displayItems.value.length === 0) {
    return;
  }
  const randomIndex = Math.floor(Math.random() * displayItems.value.length);
  virtualScrollRef.value?.scrollToIndex(randomIndex, 0, { align: 'center' });
}

function onVisibleRangeChange(range: { start: number; end: number; }) {
  visibleRange.value = { start: range.start, end: range.end };
}

function openDetails(item: DataItem, index: number) {
  selectedItem.value = item;
  selectedItemIndex.value = index;
  itemModalRef.value?.showModal();
}

function initials(name: string): string {
  const parts = name.split(/[\s,]+/).filter(Boolean);
  const first = parts[ 0 ] ?? '';
  if (parts.length > 1 && !/\d/.test(parts[ 1 ][ 0 ] ?? '')) {
    return `${ first[ 0 ] ?? '' }${ parts[ 1 ][ 0 ] ?? '' }`.toUpperCase();
  }
  return first.slice(0, 2).toUpperCase();
}

async function copyId() {
  if (!selectedItem.value) {
    return;
  }
  try {
    await navigator.clipboard.writeText(selectedItem.value.id);
    showToast(`Copied ${ selectedItem.value.id }`);
  } catch {
    showToast('Clipboard unavailable');
  }
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

function showToast(message: string) {
  toastMessage.value = message;
  // The toast is a top-layer popover so it stays visible above the item dialog.
  toastRef.value?.showPopover();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastRef.value?.hidePopover();
    toastMessage.value = '';
  }, 2500);
}

onUnmounted(() => clearTimeout(toastTimer));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-7">Data Browser</span>
    </template>

    <template #description>
      A grouped directory browser combining <strong>sticky section headers</strong> (the next header pushes the stuck one out of view), <strong>instant search</strong> that rebuilds the section index, and <strong>jump-to navigation</strong> with configurable alignment. Switch between {{ DATASETS.length }} datasets and sizes up to {{ SIZES.at(-1)?.toLocaleString() }} records — the telemetry strip shows the rendered window stays constant no matter the dataset size. Toggle <strong>dynamic sizing</strong> to reveal each record's full description and let ResizeObserver measure the variable row heights (the Knowledge Base dataset has the widest variance).
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-7"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    </template>

    <template #subtitle>
      Sticky sections, search and jump navigation
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap items-center gap-x-5 gap-y-3">
        <div class="flex items-center gap-2">
          <span class="settings-label whitespace-nowrap">Dataset</span>
          <select v-model="activeDataset" class="select select-sm min-w-36" aria-label="Dataset">
            <option v-for="d in DATASETS" :key="d.id" :value="d.id">
              {{ d.label }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <span class="settings-label whitespace-nowrap">Size</span>
          <select v-model="count" class="select select-sm min-w-18" aria-label="Record count">
            <option v-for="size in SIZES" :key="size" :value="size">
              {{ size >= 1000 ? `${ size / 1000 }k` : size }}
            </option>
          </select>
        </div>

        <label class="settings-item gap-2">
          <span class="settings-label">Dynamic sizes</span>
          <input v-model="useDynamicSizing" type="checkbox" class="toggle toggle-sm toggle-primary" />
        </label>

        <label class="settings-item gap-2">
          <span class="settings-label">Gap</span>
          <input
            v-model.number="gap"
            type="range"
            min="0"
            max="12"
            class="range range-xs w-22"
            aria-label="Row gap"
          />
          <span class="badge badge-sm badge-ghost tabular-nums w-10">{{ gap }}px</span>
        </label>

        <label class="input input-sm w-31">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-3.5 opacity-60"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Filter..."
            class="grow"
            aria-label="Filter records"
          />
        </label>

        <div class="join">
          <button type="button" class="join-item btn btn-sm btn-soft" @click="scrollToStart">Top</button>
          <button type="button" class="join-item btn btn-sm btn-soft" @click="scrollToRandom">Random</button>
          <button type="button" class="join-item btn btn-sm btn-soft" @click="scrollToEnd">Bottom</button>
        </div>

        <select
          v-model="sectionIndex"
          class="select select-sm flex-1"
          aria-label="Jump to section"
          @change="jumpToSection"
        >
          <option :value="null" disabled>Section…</option>
          <option v-for="h in sectionOptions" :key="h.index" :value="h.index">
            {{ h.name }} · #{{ h.index }}
          </option>
        </select>

        <div class="flex items-center gap-2">
          <span class="settings-label">Index</span>
          <input
            v-model="targetIndexInput"
            type="number"
            class="input input-sm w-18 text-end"
            min="0"
            :max="displayItems.length - 1"
            aria-label="Target index"
            placeholder="e.g. 520"
          />
          <select v-model="align" class="select select-sm min-w-22" aria-label="Scroll alignment">
            <option v-for="a in ALIGNMENTS" :key="a" :value="a">
              {{ a }}
            </option>
          </select>
          <button type="button" class="btn btn-sm btn-soft btn-primary" @click="jumpToIndex">
            Jump
          </button>
        </div>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="displayItems"
      :item-size="useDynamicSizing ? null : fixedItemSize"
      :sticky-indices="stickyIndices"
      :gap="gap"
      virtual-scrollbar
      aria-label="Virtualized data browser"
      @scroll="onScroll"
      @visible-range-change="onVisibleRangeChange"
    >
      <template #item="{ item, index, isStickyActive }">
        <div
          v-if="item.isHeader"
          class="example-sticky-header example-sticky-header--start flex h-full items-center justify-between gap-2"
          :class="{ 'shadow-md z-1': isStickyActive }"
        >
          <span class="truncate">{{ item.name }}</span>
          <span class="badge badge-sm badge-ghost tabular-nums shrink-0">{{ item.count }} items</span>
        </div>

        <button
          v-else
          type="button"
          class="example-vertical-item example-vertical-item--fixed group w-full min-h-16 cursor-pointer overflow-hidden text-start"
          @click="openDetails(item, index)"
        >
          <span class="grid size-9 shrink-0 place-items-center rounded-lg bg-base-300 text-xs font-bold text-base-content me-3">
            {{ initials(item.name) }}
          </span>
          <span class="flex min-w-0 flex-1 flex-col py-1.5">
            <span class="truncate text-sm font-bold">{{ item.name }}</span>
            <span class="truncate text-xs opacity-60">{{ item.sub }}</span>
            <span v-if="item.rowExtra && useDynamicSizing" class="line-clamp-2 text-xs opacity-50">{{ item.rowExtra }}</span>
          </span>
          <span class="ms-3 hidden shrink-0 sm:inline-block">
            <span class="example-badge">{{ item.meta }}</span>
          </span>
          <span class="ms-3 shrink-0">
            <span
              class="status"
              :class="item.status === 'active' ? 'status-success' : 'status-error'"
              aria-hidden="true"
            />
          </span>
        </button>
      </template>
    </VirtualScroll>

    <div class="shrink-0 p-2">
      <div class="stats w-full border border-base-300 bg-base-100 shadow-sm">
        <div class="stat">
          <div class="stat-title">{{ activeDatasetLabel }} dataset</div>
          <div class="stat-value text-base truncate">{{ stuckHeader }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Records</div>
          <div class="stat-value text-base tabular-nums">{{ displayItems.length.toLocaleString() }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Sections</div>
          <div class="stat-value text-base tabular-nums">{{ stickyIndices.length }}</div>
        </div>
      </div>
    </div>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A grouped, searchable directory is still one virtualized vertical list: the array passed to <code>items</code>
          holds rows, and turning some of them into section headers is a data-modeling decision rather than a library
          mode. Each header is an ordinary row object flagged as such, and its index is listed in
          <code>sticky-indices</code>; the engine then pins that row to the top edge while you scroll and lets the next
          pinned row push the current one out of view — the familiar iOS-style section effect. Because filtering and
          section jumps only ever reshape the row array and call <code>scrollToIndex()</code>, the hard part of this UI
          is data shaping, and the virtualizer&apos;s job stays constant: render the visible rows of whatever array it is
          given.
        </p>

        <h3>1. Size the scroll container</h3>
        <p>
          Virtualization needs a viewport of known size: when the host element is not height-constrained it grows with
          its content and never produces scroll events. Give the list an explicit height (the demo&apos;s resizable card
          sizes it with flex, <code>flex-1 min-h-0</code>); in your own layout any explicit or viewport-relative height
          works. In flex/grid parents remember <code>min-height: 0</code> so the box may shrink below its content.
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

type Row =
  | { kind: 'header'; title: string; count: number }
  | { kind: 'record'; id: number; name: string };

// Grouping is a data concern: one flat array where a section is a header row
// followed by its records; the virtualizer only sees rows.
const items = ref&lt;Row[]>([
  { kind: 'header', title: 'Section A', count: 2 },
  { kind: 'record', id: 1, name: 'Ada Lovelace' },
  { kind: 'record', id: 2, name: 'Alan Turing' },
]);

// Header row indices pin to the top edge while scrolling; consecutive ones
// push each other out iOS-style when the next header reaches the top.
const stickyIndices = items.value
  .flatMap((row, index) => (row.kind === 'header' ? [index] : []));

const rowSize = (item: Row, _index: number) => (item.kind === 'header' ? 48 : 64);
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;browser&quot;
    :items=&quot;items&quot;
    :item-size=&quot;rowSize&quot;
    :sticky-indices=&quot;stickyIndices&quot;
    :gap=&quot;4&quot;
    aria-label=&quot;Sectioned list&quot;
  >
    &lt;template #item=&quot;{ item, isStickyActive }&quot;>
      &lt;div
        v-if=&quot;item.kind === 'header'&quot;
        class=&quot;section-header&quot;
        :class=&quot;{ 'section-header--pinned': isStickyActive }&quot;
      >
        {{ item.title }} · {{ item.count }} records
      &lt;/div>
      &lt;div v-else class=&quot;record&quot;>#{{ item.id }} — {{ item.name }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.browser { height: 480px; border: 1px solid #8884; } /* definite viewport */
.section-header,
.record {
  box-sizing: border-box; /* wrappers are sized to :item-size: fill them */
  height: 100%;
  display: flex;
  align-items: center;
  padding-inline: 0.75rem;
  border-bottom: 1px solid #8883;
}
.section-header { font-weight: 700; background: #eee; }
.section-header--pinned { box-shadow: 0 2px 6px #0003; } /* isStickyActive */
&lt;/style>"
        />

        <h3>2. Model every section as rows in one flat array</h3>
        <p>
          Flatten the grouped data so each section is a header row followed by its record rows; the same <code>#item</code>
          slot renders both, branching on a type flag on the row object. Headers stay ordinary items — they occupy their
          own index, scroll with the list, and can be addressed by <code>scrollToIndex()</code>. Build the
          <code>sticky-indices</code> list from the header positions: rows at those indices pin to the viewport top, and
          when several sticky rows are consecutive an approaching header pushes the previous one out of view. While a row
          is actually pinned the slot reports <code>isStickyActive</code> — the hook for the elevated &quot;stuck&quot;
          look. Keep the data nested and derive the flat array with a <code>computed</code> when your source is grouped by
          a field or folder tree.
        </p>

        <h3>3. Choose a sizing strategy</h3>
        <p>
          The scroll math needs a height for every row; three strategies, in increasing cost: a single numeric
          <code>item-size</code> when all rows share one height (positions are then pure arithmetic); a function
          <code>(item, index) =&gt; number</code> when heights are known per row but differ (headers vs. records,
          compact vs. expanded rows); or <code>null</code>/<code>0</code>/<code>undefined</code> for fully dynamic sizing,
          where each mounted row is measured with a ResizeObserver and the layout follows the real content. With known
          sizes the returned value is a contract: the engine sizes each row wrapper to it, so the slot root must fill the
          wrapper (<code>height: 100%</code>, borders inside via <code>box-sizing: border-box</code>). With dynamic sizing
          the contract is inverted — let the content decide the height and do not force one on the slot root. Dynamic
          measurement costs per mounted row and corrects as you scroll; pass <code>default-item-size</code> so the first
          frame and the scrollbar are not empty. <code>gap</code> adds spacing between rows in the scroll math, and
          <code>buffer-before</code>/<code>buffer-after</code> (default <code>5</code>) keep extra rows mounted around the
          viewport so fast scrolling does not flash blanks.
        </p><CodeBlock
          class="guide-code-block"
          lang="vue"
          code="// Content-driven heights: pass null (or 0 / undefined) as :item-size — every
// mounted row is then measured with a ResizeObserver and the layout follows
// the actual content (wrapped text, expandable rows, ...). Give the engine a
// fallback estimate so the first frame and scrollbar are not empty.
const dynamicSizing = ref(false);

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    :items=&quot;items&quot;
    :item-size=&quot;dynamicSizing ? null : rowSize&quot;
    :default-item-size=&quot;64&quot;
    :gap=&quot;4&quot;
    :sticky-indices=&quot;stickyIndices&quot;
  >
    &lt;template #item=&quot;{ item, isStickyActive }&quot;>
      &amp;lt;!-- same slot markup as before -->
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>4. Filter by deriving new arrays</h3>
        <p>
          Search is not a library feature: on every query, compute a new <code>items</code> array plus a matching
          <code>sticky-indices</code> list and pass them down — the component re-ranges automatically when the props
          change. Re-emit a header (cloned, with its count rebuilt from matches) only when its section keeps at least one
          matching record, because the sticky list must refer to the filtered array&apos;s indices; keep the unfiltered
          arrays as the fallback for an empty query. Then bind the derived arrays —
          <code>:items="display.rows"</code> with <code>:sticky-indices="display.sticky"</code> —
          instead of the originals.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
// Filtering happens BEFORE virtualization: derive a fresh row array and a
// matching sticky-index list; the component re-ranges whenever a prop
// changes. (Add `computed` to the vue import, plus the type import.)
import type { ScrollAlignment } from '@pdanpdan/virtual-scroll';
import { computed } from 'vue';

const query = ref('');
const display = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return { rows: items.value, sticky: stickyIndices };

  const rows: Row[] = [];
  const sticky: number[] = [];
  let header: Row | null = null;
  let headerIndex = -1;

  for (const row of items.value) {
    if (row.kind === 'header') {
      header = { ...row, count: 0 };
      headerIndex = -1;
      continue;
    }
    if (!row.name.toLowerCase().includes(q)) continue;
    if (headerIndex === -1) {
      headerIndex = rows.length; // header goes live with its first match
      sticky.push(headerIndex);
      rows.push(header!);
    }
    const current = rows[headerIndex];
    if (current &amp;&amp; current.kind === 'header') current.count += 1;
    rows.push(row);
  }
  return { rows, sticky };
});

// Programmatic jumps use the methods exposed on the component ref.
const list = ref&lt;InstanceType&lt;typeof VirtualScroll> | null>(null);

function jumpToSection(headerIndex: number) {
  list.value?.scrollToIndex(headerIndex, null, { align: 'start' });
}
function jumpToRow(rowIndex: number, align: ScrollAlignment) {
  list.value?.scrollToIndex(rowIndex, null, { align });
}
&lt;/script>"
        />

        <h3>5. Jump to a section or a row</h3>
        <p>
          The component instance (template ref) exposes <code>scrollToIndex(rowIndex, colIndex, options)</code> — for a
          vertical list pass <code>null</code> for the column. Alignment options make jumps land predictably:
          <code>start</code> puts the row at the top edge, <code>center</code> centers it, <code>end</code> pins it to the
          bottom, and <code>auto</code> (the default) scrolls only when the row is not already fully visible. Jumping to
          a section is scrolling to that header row&apos;s index, so the section picker, a &quot;jump to #520&quot; input
          and random-access buttons are all the same call. If a dataset or query change invalidates stored targets (header
          indices shift after filtering), clear the selection in a <code>watch</code> on those inputs.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>

  <dialog ref="itemModalRef" class="modal modal-bottom sm:modal-middle" aria-labelledby="item-modal-title">
    <div class="modal-box">
      <form method="dialog">
        <button class="btn btn-sm btn-circle btn-ghost absolute end-2 top-2" aria-label="Close details">✕</button>
      </form>

      <div v-if="selectedItem" class="flex items-start gap-4 pe-8">
        <div class="avatar avatar-placeholder shrink-0">
          <div class="bg-base-300 text-base-content size-14 rounded-2xl text-lg font-black">
            <span>{{ initials(selectedItem.name) }}</span>
          </div>
        </div>
        <div class="min-w-0 pt-1">
          <h3 id="item-modal-title" class="truncate text-lg font-bold">{{ selectedItem.name }}</h3>
          <p class="mt-0.5 truncate text-sm opacity-60">{{ selectedItem.sub }}</p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap gap-2">
        <span class="badge badge-ghost badge-sm tabular-nums">Index #{{ selectedItemIndex }}</span>
        <span class="badge badge-soft badge-sm">{{ selectedItem?.meta }}</span>
        <span class="badge badge-sm" :class="selectedItem?.status === 'active' ? 'badge-success' : 'badge-error'">
          {{ selectedItem?.status === 'active' ? 'Active' : 'Dormant' }}
        </span>
      </div>

      <p v-if="selectedItem?.extra" class="mt-4 rounded-box bg-base-200 p-3 text-sm leading-relaxed opacity-80">
        {{ selectedItem.extra }}
      </p>

      <div class="modal-action">
        <button type="button" class="btn btn-sm btn-soft btn-primary" @click="copyId">Copy ID</button>
        <form method="dialog">
          <button class="btn btn-sm">Close</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>

  <div ref="toastRef" popover="manual" class="toast toast-end toast-bottom">
    <div v-if="toastMessage" role="alert" class="alert alert-success">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        stroke="currentColor"
        class="size-4 shrink-0"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
      </svg>
      <span>{{ toastMessage }}</span>
    </div>
  </div>
</template>
