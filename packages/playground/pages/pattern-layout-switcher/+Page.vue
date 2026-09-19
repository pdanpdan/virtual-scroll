<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll, VirtualScrollTable } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

type Layout = 'list' | 'grid' | 'table';

interface Item {
  id: number;
  name: string;
  team: string;
  score: number;
  status: 'active' | 'idle' | 'blocked';
}

const TEAMS = [ 'Atlas', 'Beacon', 'Cobalt', 'Delta', 'Ember' ];
const STATUSES: Item[ 'status' ][] = [ 'active', 'idle', 'blocked' ];
const STATUS_BADGE: Record<Item[ 'status' ], string> = {
  active: 'badge-success',
  idle: 'badge-ghost',
  blocked: 'badge-error',
};

const LAYOUTS: { value: Layout; label: string; icon: string; }[] = [
  { value: 'list', label: 'List', icon: 'M4 6h16M4 12h16M4 18h16' },
  { value: 'grid', label: 'Grid', icon: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z' },
  { value: 'table', label: 'Table', icon: 'M4 5h16v4H4zM4 11h16v4H4zM4 17h16v2H4z' },
];

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const layout = ref<Layout>('list');
const itemCount = ref(2_000);
const dense = ref(false);
const virtualScrollbar = ref(true);

/** One dataset, three virtualization units - the records never change with the layout. */
const records = computed<Item[]>(() => Array.from({ length: itemCount.value }, (_, id) => ({
  id,
  name: `Record ${ id + 1 }`,
  team: TEAMS[ id % TEAMS.length ]!,
  score: (id * 37) % 100,
  status: STATUSES[ id % STATUSES.length ]!,
})));

const GRID_COLUMNS = 4;
/** One gap for both axes - the engine prices it into the column offsets, the row applies it in CSS. */
const GRID_GAP = 8;

const rowHeight = computed(() => (dense.value ? 32 : 56));
const gridRowHeight = computed(() => (dense.value ? 112 : 136));

/** The grid virtualizes rows of records, so the cross axis can be derived. */
const gridRows = computed(() => {
  const rows: Item[][] = [];
  for (let start = 0; start < records.value.length; start += GRID_COLUMNS) {
    rows.push(records.value.slice(start, start + GRID_COLUMNS));
  }
  return rows;
});

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-2">Layout Switcher</span>
    </template>

    <template #description>
      The same {{ itemCount.toLocaleString() }} records as a virtualized list, grid or data table - only the virtualization
      unit changes, never the data.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    </template>

    <template #subtitle>
      One dataset, three layouts
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <div class="join" role="group" aria-label="Layout">
          <button
            v-for="option in LAYOUTS"
            :key="option.value"
            type="button"
            class="btn btn-sm join-item gap-2"
            :class="layout === option.value ? 'btn-primary' : 'btn-ghost'"
            :aria-pressed="layout === option.value"
            @click="layout = option.value"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-4"
            >
              <path stroke-linecap="round" stroke-linejoin="round" :d="option.icon" />
            </svg>
            {{ option.label }}
          </button>
        </div>

        <div class="flex flex-col gap-1">
          <span class="flex justify-between items-center">
            <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Records</span>
            <span class="badge badge-sm badge-primary font-mono">{{ itemCount.toLocaleString() }}</span>
          </span>
          <input
            v-model.number="itemCount"
            type="range"
            min="100"
            max="50000"
            step="100"
            class="range range-xs range-primary w-48"
            aria-label="Records"
          />
        </div>

        <label class="settings-item group">
          <span class="settings-label pe-4">Dense</span>
          <input v-model="dense" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Virtual Scrollbars</span>
          <input v-model="virtualScrollbar" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>
      </div>
    </template>

    <!-- List: one item per record, a single scrolling axis. -->
    <VirtualScroll
      v-if="layout === 'list'"
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="records"
      :item-size="rowHeight"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Records as a list"
      @scroll="onScroll"
    >
      <template #item="{ item }">
        <div class="flex items-center gap-3 px-4 h-full border-b border-base-content/5">
          <span class="font-mono text-xs opacity-40 w-16">{{ item.id + 1 }}</span>
          <span class="font-bold text-sm truncate">{{ item.name }}</span>
          <span class="badge badge-xs badge-ghost ms-auto">{{ item.team }}</span>
          <span class="font-mono text-xs tabular-nums w-10 text-end">{{ item.score }}</span>
          <span class="min-w-20 badge badge-xs" :class="[STATUS_BADGE[ item.status ]]">{{ item.status }}</span>
        </div>
      </template>
    </VirtualScroll>

    <!-- Grid: the cross axis is virtualized too, so a cell is the unit and rows are sized. -->
    <VirtualScroll
      v-else-if="layout === 'grid'"
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="both"
      :items="gridRows"
      :item-size="gridRowHeight"
      :column-count="GRID_COLUMNS"
      :column-width="240"
      :gap="GRID_GAP"
      :column-gap="GRID_GAP"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Records as a grid"
      @scroll="onScroll"
    >
      <template #item="{ item: row, index, columnRange, getColumnWidth, getCellAriaProps }">
        <!-- The item element is a grid: the row owns the cells' flow, so they tile instead of stacking. -->
        <div class="flex min-h-full items-stretch" :style="{ gap: `${ GRID_GAP }px` }">
          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="`r_${ index }_c_${ columnRange.start + c - 1 }`"
            class="box-border flex shrink-0 flex-col gap-1 rounded-box border border-base-content/10 bg-base-200/60 p-3 overflow-hidden"
            :style="{ inlineSize: `${ getColumnWidth(columnRange.start + c - 1) }px` }"
            v-bind="getCellAriaProps(columnRange.start + c - 1)"
          >
            <template v-if="row[ columnRange.start + c - 1 ]">
              <span class="font-mono text-[10px] opacity-40">{{ row[ columnRange.start + c - 1 ]!.id + 1 }}</span>
              <span class="font-bold text-sm truncate">{{ row[ columnRange.start + c - 1 ]!.name }}</span>
              <span class="badge badge-xs badge-ghost self-start">{{ row[ columnRange.start + c - 1 ]!.team }}</span>
              <span class="mt-auto flex justify-between border-t border-base-content/5 pt-2 font-mono text-xs tabular-nums">
                <span class="opacity-40">score</span>{{ row[ columnRange.start + c - 1 ]!.score }}
              </span>
            </template>
          </div>
        </div>
      </template>
    </VirtualScroll>

    <!-- Table: real table flow, so the unit is a row and the header sticks. -->
    <VirtualScrollTable
      v-else
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container table-zebra"
      flow-table
      :items="records"
      :item-size="rowHeight"
      :sticky-header="true"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Records as a table"
      @scroll="onScroll"
    >
      <template #header>
        <tr class="bg-base-200 shadow-sm z-1">
          <th class="w-16 text-end border-b border-base-300 py-3 text-xs small-caps tracking-widest opacity-60">#</th>
          <th class="w-64 border-b border-base-300 py-3 text-xs small-caps tracking-widest opacity-60">Name</th>
          <th class="w-32 border-b border-base-300 py-3 text-xs small-caps tracking-widest opacity-60">Team</th>
          <th class="w-24 text-end border-b border-base-300 py-3 text-xs small-caps tracking-widest opacity-60">Score</th>
          <th class="w-28 text-center border-b border-base-300 py-3 text-xs small-caps tracking-widest opacity-60">Status</th>
        </tr>
      </template>

      <template #item="{ item }">
        <td class="w-16 px-3 text-end font-mono text-xs opacity-50">{{ item.id + 1 }}</td>
        <td class="w-64 px-3 font-bold text-sm truncate">{{ item.name }}</td>
        <td class="w-32 px-3"><span class="badge badge-xs badge-ghost">{{ item.team }}</span></td>
        <td class="w-24 px-3 text-end font-mono text-xs tabular-nums">{{ item.score }}</td>
        <td class="w-28 px-3 text-center">
          <span class="badge badge-xs" :class="[STATUS_BADGE[ item.status ]]">{{ item.status }}</span>
        </td>
      </template>
    </VirtualScrollTable>

    <template #implementation>
      <ImplementationGuide>
        <p>
          One dataset, three layouts. The records, the scroll event and the controls are shared; only the
          <em>virtualization unit</em> changes. The list virtualizes records, the grid virtualizes rows of records on both
          axes, and the table virtualizes table rows.
        </p>

        <h3>1. Keep the data in one shape</h3>
        <p>
          Every view reads the same <code>records</code> array and hands the engine the unit it virtualizes. The list and the
          table take the records as they are; the grid takes <code>gridRows</code> - the same records grouped four per row -
          because in grid mode an <em>item is a row</em> and <code>column-count</code> spans the cross axis inside it. The
          grouping is a <code>computed</code> over <code>records</code>, so the data itself never changes shape, and the
          table renders real <code>&lt;tr&gt;</code> elements between spacer rows through <code>flow-table</code>.
        </p>

        <h3>2. Switch the component, keep the contract</h3>
        <p>
          The three views share the props that describe the data (<code>items</code>, <code>virtual-scrollbar</code>) and the
          event that reports position (<code>@scroll</code>). Only the geometry props differ: <code>item-size</code> for the
          list, <code>item-size</code>/<code>column-count</code>/<code>column-width</code> for the grid, and the same
          <code>item-size</code> for the table rows. A switch with <code>v-if</code>/<code>v-else-if</code> remounts the
          view, so keep one <code>ref</code> per layout if each layout should remember its own position.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;VirtualScroll
  v-if=&quot;layout === 'list'&quot;
  :items=&quot;records&quot;
  :item-size=&quot;rowHeight&quot;
  @scroll=&quot;onScroll&quot;
/&gt;

&lt;VirtualScroll
  v-else-if=&quot;layout === 'grid'&quot;
  direction=&quot;both&quot;
  :items=&quot;gridRows&quot;
  :item-size=&quot;gridRowHeight&quot;
  :column-count=&quot;4&quot;
  :column-width=&quot;240&quot;
  @scroll=&quot;onScroll&quot;
/&gt;

&lt;VirtualScrollTable
  v-else
  flow-table
  :items=&quot;records&quot;
  :item-size=&quot;rowHeight&quot;
  :sticky-header=&quot;true&quot;
  @scroll=&quot;onScroll&quot;
/&gt;"
        />

        <p>
          The grid's <code>#item</code> slot is called once per row with that row's visible
          <code>columnRange</code>, and its <code>getColumnWidth(index)</code> returns the gap-exclusive column width, so
          the row has to own the cells' flow: wrap them in a flex row carrying <code>column-gap</code> and size each cell
          from <code>getColumnWidth</code>. The item element is a grid container, so leaves handed to it directly become
          one cell per implicit row.
        </p>

        <h3>3. Sizes are inputs, not measurements</h3>
        <p>
          The density toggle swaps the numbers the engine positions from (<code>item-size</code> for list rows, grid rows and
          table rows); the scroll math, the render buffers and the scrollbar thumb follow. Measure rows instead of sizing
          them where the content is genuinely variable - for example rows whose text wraps.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
