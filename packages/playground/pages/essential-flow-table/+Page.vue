<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScrollTable } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

// Rows are index-derived (no per-row data stored): `flowTable` renders them
// in real table flow between spacer rows, with DYNAMIC measured heights - the
// rows carry 1-3 text lines each, so every row is measured by the engine.

const COUNT_OPTIONS = [ 5_000, 20_000, 100_000 ];

const itemCount = ref(20_000);
const stickyHeader = ref(true);
const stickyFooter = ref(false);
const virtualScrollbar = ref(true);

type WidthMode = 'auto' | 'first' | 'custom';
const widthMode = ref<WidthMode>('first');

const CUSTOM_WIDTHS = [ 80, 250, 300, 250, 150 ];

const NAMES = [ 'Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Linus Torvalds', 'Ada Chen', 'Edsger Dijkstra', 'Barbara Liskov', 'Guido Rossum', 'Margaret Hamilton', 'Dennis Ritchie', 'Radia Perlman', 'Ken Thompson', 'Hedy Lamarr', 'Brendan Eich', 'John Carmack', 'Frances Allen' ];
const ROLES = [ 'Admin', 'Editor', 'Viewer', 'Owner' ];
const STATUSES = [ 'Active', 'Away', 'Busy' ];
const META = [ 'Joined 2019', 'Core contributor', 'Last seen 2h ago', 'Weekend maintainer', 'Onboarding buddy', 'Docs champion', 'On call this week', 'In review round' ];

/** Deterministic pseudo-random number in [0, 1) derived from `i` and `salt`. */
function rnd(i: number, salt: number): number {
  let x = Math.imul(i + Math.imul(salt + 1, 0x9E3779B9), 2654435761);
  x ^= x >>> 16;
  x = Math.imul(x, 2246822507);
  x ^= x >>> 13;
  return (x >>> 0) / 4294967296;
}

const pick = (list: string[], i: number, salt: number) => list[ Math.floor(rnd(i, salt) * list.length) ]!;

const pad = (i: number) => String(i).padStart(5, '0');
const stripe = (i: number) => (i % 2 === 0 ? 'bg-base-200/50' : '');
const nameOf = (i: number) => pick(NAMES, i, 3);
const statusOf = (i: number) => pick(STATUSES, i, 7);
const emailOf = (i: number) => `${ nameOf(i).toLowerCase().replace(/[^a-z]+/g, '.').slice(0, 18) }${ pad(i) }@example.com`;

/** Rows alternate between short and long role labels in 200-row bands. */
function roleOf(i: number) {
  const role = pick(ROLES, i, 5);
  return i % 400 > 200 ? `${ role } (team lead)` : role;
}

/** Number of extra text lines under the name: 0, 1 or 2 per row. */
function metaLinesOf(i: number) {
  const r = rnd(i, 11);
  return r < 0.4 ? 0 : (r < 0.8 ? 1 : 2);
}
const metaOf = (i: number, line: number) => pick(META, i + 1, 17 + line * 5);

const items = computed(() => new Array(itemCount.value));

const statusBadge: Record<string, string> = {
  Active: 'badge-success',
  Away: 'badge-warning',
  Busy: 'badge-error',
};
const roleBadge: Record<string, string> = {
  Admin: 'badge-primary',
  Editor: 'badge-secondary',
  Viewer: 'badge-soft',
  Owner: 'badge-ghost',
};

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
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-5">Flow Table</span>
    </template>

    <template #description>
      A real <code>&lt;table&gt;</code> virtualized in flow: rows carry 1–3 text lines each and are <strong>measured</strong>, so every row has its natural height while spacer rows keep the virtual offsets exact. Column widths can be left to the browser (<em>auto</em>), pinned from the first window, or pinned from an explicit <code>colgroup</code>; when the table is wider than the container it scrolls horizontally with its own scrollbar.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v1.5m0-1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
      </svg>
    </template>

    <template #subtitle>
      Virtualized rows in a real flow table
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
          <span class="small-caps font-bold tracking-widest opacity-60">Column widths</span>
          <select v-model="widthMode" class="select select-sm">
            <option value="auto">Auto (current rows)</option>
            <option value="first">First window</option>
            <option value="custom">Colgroup widths</option>
          </select>
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Sticky header</span>
          <input v-model="stickyHeader" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>
        <label class="settings-item group">
          <span class="settings-label pe-4">Sticky footer</span>
          <input v-model="stickyFooter" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>
        <label class="settings-item group">
          <span class="settings-label pe-4">Virtual scrollbars</span>
          <input v-model="virtualScrollbar" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>
      </div>
    </template>

    <VirtualScrollTable
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container table-zebra"
      :items="items"
      direction="vertical"
      flow-table
      :auto-size-columns="widthMode === 'first'"
      :column-widths="widthMode === 'custom' ? CUSTOM_WIDTHS : []"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Flow table list"
      @scroll="onScroll"
      @scroll-to-index="handleScrollToIndex"
      @scroll-to-offset="handleScrollToOffset"
    >
      <template #header>
        <tr class="bg-base-200 shadow-sm z-1">
          <th class="w-16 text-end border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">#</th>
          <th class="w-48 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Name</th>
          <th class="w-72 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Email</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Role</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Status</th>
        </tr>
      </template>

      <template #item="{ index }">
        <td class="w-16 px-3 py-3 text-end font-mono text-sm opacity-50" :class="[stripe(index)]">{{ pad(index) }}</td>
        <td class="w-48 px-3 py-3 align-top" :class="[stripe(index)]">
          <div class="font-bold text-sm whitespace-nowrap">{{ nameOf(index) }}</div>
          <div v-for="line in metaLinesOf(index)" :key="line" class="text-[10px] leading-3 opacity-50 mt-0.5 whitespace-nowrap">
            {{ metaOf(index, line) }}
          </div>
        </td>
        <td class="w-72 px-3 py-3 align-top" :class="[stripe(index)]"><div class="truncate text-xs opacity-80">{{ emailOf(index) }}</div></td>
        <td class="w-24 px-3 py-3 text-center" :class="[stripe(index)]">
          <span
            class="badge badge-xs @4xl:badge-sm font-semibold"
            :class="roleBadge[ roleOf(index) ]"
          >
            <span class="truncate inline-block max-w-40 align-bottom">{{ roleOf(index) }}</span>
          </span>
        </td>
        <td class="w-24 px-3 py-3 text-center" :class="[stripe(index)]">
          <span
            class="badge badge-xs @4xl:badge-sm font-semibold"
            :class="statusBadge[ statusOf(index) ]"
          >{{ statusOf(index) }}</span>
        </td>
      </template>

      <template v-if="stickyFooter" #footer>
        <tr class="bg-base-200 shadow-sm z-1">
          <td class="w-full p-4 font-bold text-center border-t border-base-300 text-xs small-caps tracking-widest opacity-60" colspan="5">
            End of {{ itemCount.toLocaleString() }} rows
          </td>
        </tr>
      </template>
    </VirtualScrollTable>
  </ExampleContainer>
</template>
