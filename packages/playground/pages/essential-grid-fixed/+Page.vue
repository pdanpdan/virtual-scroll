<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const itemCount = ref(1000);
const itemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);
const virtualScrollbar = ref(true);

const columnWidths = computed(() => [ columnWidth.value, Math.ceil(columnWidth.value * 1.5) ]);

// Rows render purely from their index: the items array is a sparse placeholder
// of the right length, so no per-row data is materialized even for 10M+ rows
// (only the visible window is ever accessed).
const items = computed(() => new Array(itemCount.value));

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
      <span class="example-title example-title--group-4">Grid Fixed</span>
    </template>

    <template #description>
      Simultaneously virtualizes {{ itemCount.toLocaleString() }} rows and {{ columnCount.toLocaleString() }} columns. Uses fixed <strong>itemSize</strong> ({{ itemSize }}px) and alternating <strong>columnWidth</strong> values. Panning in any direction maintains high performance.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Bidirectional scrolling with uniform dimensions
    </template>

    <template #controls>
      <ScrollStatus
        dom-count-selector=".example-container"
        :scroll-details="scrollDetails"
        direction="both"
        :column-range="virtualScrollRef?.columnRange"
      />
      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:column-count="columnCount"
        v-model:column-width="columnWidth"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:sticky-header="stickyHeader"
        v-model:sticky-footer="stickyFooter"
        v-model:virtual-scrollbar="virtualScrollbar"
        direction="both"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="both"
      :items="items"
      :item-size="itemSize"
      :column-count="columnCount"
      :column-width="columnWidths"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Fixed dimensions grid"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Grid Header
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth, getCellAriaProps }">
        <div :key="`r_${ index }`" class="example-grid-row">
          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="`r_${ index }_c_${ columnRange.start + c - 1 }`"
            :data-col-index="columnRange.start + c - 1"
            class="example-grid-cell"
            :style="{ inlineSize: `${ getColumnWidth(columnRange.start + c - 1) }px` }"
            v-bind="getCellAriaProps(columnRange.start + c - 1)"
          >
            <div class="example-badge mb-2">R{{ index }} &times; C{{ columnRange.start + c - 1 }}</div>
            <div class="opacity-40 tabular-nums">{{ getColumnWidth(columnRange.start + c - 1) }}px</div>
          </div>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          End of Grid
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A two-dimensional grid - rows of equal height, columns of declared width - needs two virtual windows at
          once: one that picks which rows are mounted along the vertical axis, and one that picks which columns each
          mounted row renders along the horizontal axis. Because both axes have known sizes (a numeric
          and <code>column-width</code> forms you use), row placement is pure arithmetic with a numeric <code>item-size</code>, and the DOM stays bounded to roughly <code>row-window × column-window</code> cells instead of <code>rows × columns</code>. The trade-off is the
          contract: all rows share one height and column widths must be expressible as numbers - when content decides
          sizes, use the measured (dynamic) grid instead.
        </p>

        <h3>1. Give the scroll box a definite size in both axes</h3>
        <p>
          With <code>direction="both"</code>, <code>&lt;VirtualScroll&gt;</code> renders a scrollable host that pans
          horizontally and vertically. Virtualization needs a known viewport, so the host must be constrained in both
          dimensions: give it an explicit height (the width fills its parent) and let <code>overflow</code> scroll the
          content that extends past either edge. In flex/grid layouts, remember <code>min-height: 0</code> on the
          list so it can shrink below its content instead of growing forever.
        </p>

        <h3>2. Model the rows, then declare the column geometry</h3>
        <p>
          The row axis is your data: <code>items</code> is an array with one entry per row. Columns are not data -
          they are a declared grid: <code>column-count</code> sets how many columns exist in total (it drives the
          horizontal scroll extent and the column-window clamp), while <code>column-width</code> provides the width in
          px for each column. You can pass one number for a uniform width, an array that cycles as a repeating pattern
          over the column indices, or a function of the column index. A numeric <code>item-size</code> declares the
          uniform row height; both sizes are contracts - every rendered cell must match them, borders and padding
          included (<code>box-sizing: border-box</code>).
        </p>

        <h3>3. Render one windowed row per item</h3>
        <p>
          The <code>#item</code> slot is invoked once per mounted row and receives the row's <code>item</code> and
          <code>index</code> plus the current <code>columnRange</code> - <code>{ start, end }</code> with an exclusive
          <code>end</code> - and two helpers: <code>getColumnWidth(colIndex)</code> returns the declared width of any
          column, and <code>getCellAriaProps(colIndex)</code> returns the ARIA attributes for a cell. Loop over the
          range and emit one cell per column, sizing each cell's width from <code>getColumnWidth</code> and binding
          the aria props. The engine translates each row so its content starts at the first visible column and already
          accounts for the skipped columns (<code>columnRange.padStart</code>/<code>padEnd</code>), so the slot must
          not add its own horizontal offsets - lay the cells out flush (flex row) and make the row fill its
          wrapper, which is exactly <code>item-size</code> tall. In <code>both</code> mode the row wrapper carries
          the <code>row</code> role and <code>aria-rowindex</code> automatically.
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

// A grid item is ONE ROW of data; cells are looked up from it per column.
interface Row { id: number; sku: string; name: string; }
const rows: Row[] = Array.from({ length: 10_000 }, (_, id) => ({
  id, sku: `SKU-${ id }`, name: `Product ${ id }`,
}));

// Column geometry is declared, not data: 80 columns whose widths repeat the
  // [100, 180, 260] pattern. Row placement is arithmetic (O(1)).
const columnCount = 80;
const itemSize = 44;                   // uniform row height (px)
const columnWidth = [ 100, 180, 260 ]; // cycles over columns

function cellText(row: Row, col: number): string {
  if (col === 0) return String(row.id);
  if (col === 1) return row.sku;
  if (col === 2) return row.name;
  return `metric ${ row.id * 7 + col }`;
}
&lt;/script>

&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;grid&quot;
    direction=&quot;both&quot;
    :items=&quot;rows&quot;
    :item-size=&quot;itemSize&quot;
    :column-count=&quot;columnCount&quot;
    :column-width=&quot;columnWidth&quot;
    aria-label=&quot;Data grid&quot;
  >
    &lt;template #item=&quot;{ item, columnRange, getColumnWidth, getCellAriaProps }&quot;>
      &lt;div class=&quot;grid-row&quot;>
        &lt;div
          v-for=&quot;c in columnRange.end - columnRange.start&quot;
          :key=&quot;columnRange.start + c - 1&quot;
          class=&quot;grid-cell&quot;
          :style=&quot;{ inlineSize: `${ getColumnWidth(columnRange.start + c - 1) }px` }&quot;
          v-bind=&quot;getCellAriaProps(columnRange.start + c - 1)&quot;
        >
          {{ cellText(item, columnRange.start + c - 1) }}
        &lt;/div>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.grid {
  height: 480px;
  border: 1px solid oklch(50% 0 0 / 0.2);
} /* definite 2-D viewport */

/* Each row wrapper is exactly item-size tall; the row must fill it. */
.grid-row {
  display: flex;
  align-items: stretch;
  height: 100%;
}

/* Cells are laid out by you, sized by the engine's width oracle. */
.grid-cell {
  box-sizing: border-box;
  flex: none;
  display: flex;
  align-items: center;
  padding-inline: 0.5rem;
  overflow: hidden;
  white-space: nowrap;
  border-right: 1px solid oklch(50% 0 0 / 0.1);
  border-bottom: 1px solid oklch(50% 0 0 / 0.1);
}
&lt;/style>"
        />

        <h3>4. Skip the data objects when cells are pure coordinates</h3>
        <p>
          Uniform grids often have no payload: cell content is derived from the <code>(row, column)</code> coordinates
          (indices, metrics, formulas), so materializing a million row objects buys nothing. Pass a sparse array of the
          right length - <code>new Array(n)</code> - and render from the slot's <code>index</code>; only the windowed
          indices are ever read from <code>items</code>, so memory stays flat. Keep the <code>.grid-row</code> /
          <code>.grid-cell</code> styles from the full example above; they are all this variant needs.
        </p><CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

// Index-only variant: cells are pure functions of (row, column) coordinates,
// so the dataset never materializes row objects. A sparse array of the right
// length is enough - only the windowed indices are ever touched.
const rows = new Array(10_000_000);
&lt;/script>
&nbsp;
&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;grid&quot;
    direction=&quot;both&quot;
    :items=&quot;rows&quot;
    :item-size=&quot;48&quot;
    :column-count=&quot;100&quot;
    :column-width=&quot;[ 120, 160 ]&quot;
  >
    &lt;template #item=&quot;{ index, columnRange, getColumnWidth, getCellAriaProps }&quot;>
      &lt;div class=&quot;grid-row&quot;>
        &lt;div
          v-for=&quot;c in columnRange.end - columnRange.start&quot;
          :key=&quot;columnRange.start + c - 1&quot;
          class=&quot;grid-cell&quot;
          :style=&quot;{ inlineSize: `${ getColumnWidth(columnRange.start + c - 1) }px` }&quot;
          v-bind=&quot;getCellAriaProps(columnRange.start + c - 1)&quot;
        >
          R{{ index }} x C{{ columnRange.start + c - 1 }}
        &lt;/div>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>5. Overscan both windows, not just one</h3>
        <p>
          <code>buffer-before</code> / <code>buffer-after</code> (default <code>5</code>) keep rows mounted past each
          viewport edge so fast panning does not flash blanks while rows mount; they count rows, not pixels. The column
          window keeps its own small built-in overscan on each side, so horizontal panning is covered too. Watch the
          cost model: the DOM holds roughly
          <code>(visible rows + buffers) × (visible columns + column overscan)</code> cells, so make the buffers large
          enough to hide mounting latency but no larger - every extra buffered row multiplies the cell count of the
          whole window.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
