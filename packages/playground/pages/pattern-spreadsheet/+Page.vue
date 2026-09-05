<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, reactive, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const rowCount = ref(1000);
const colCount = ref(1000);
const defaultRowHeight = ref(35);
const defaultColWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const virtualScrollbar = ref(true);
const stickyIndices = [ 0 ];

const manualRowHeights = reactive<Record<number, number>>({});
const manualColWidths = reactive<Record<number, number>>({});

const getRowHeight = (_item: unknown, index: number) => manualRowHeights[ index ] ?? defaultRowHeight.value;
const getColWidth = (index: number) => manualColWidths[ index ] ?? defaultColWidth.value;

// Generate column labels (A, B, C, ..., AA, AB, ...)
function getColumnLabel(index: number): string {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
}

// The first row/column are headers, so the virtual grid is one row and one
// column larger than the selected data size.
const items = computed(() => Array.from({ length: rowCount.value + 1 }, (_, i) => ({
  id: i,
  label: `Row ${ i + 1 }`,
})));

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
  handleScrollToIndex,
  handleScrollToOffset,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
const rtlMode = inject<Ref<boolean>>('rtlMode', ref(false));

function getCellContent(row: number, col: number) {
  if (row === 0) {
    return getColumnLabel(col - 1);
  }
  if (col === 0) {
    return row;
  }
  return `R${ row }C${ col }`;
}

// Resizing logic
const resizing = ref<{
  type: 'row' | 'col';
  index: number;
  initialPos: number;
  initialSize: number;
} | null>(null);

function startResizing(e: PointerEvent, type: 'row' | 'col', index: number) {
  e.preventDefault();
  e.stopPropagation();

  const initialSize = type === 'row' ? getRowHeight(null, index) : getColWidth(index);
  const initialPos = type === 'row' ? e.clientY : e.clientX;

  resizing.value = { type, index, initialPos, initialSize };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', stopResizing);
  document.body.style.cursor = type === 'row' ? 'row-resize' : 'col-resize';
}

let rafId: number | null = null;

function handlePointerMove(e: PointerEvent) {
  if (!resizing.value) {
    return;
  }

  const { type, index, initialPos, initialSize } = resizing.value;
  const currentPos = type === 'row' ? e.clientY : e.clientX;
  const delta = (type === 'col' && rtlMode.value) ? initialPos - currentPos : currentPos - initialPos;
  const newSize = Math.max(20, initialSize + delta);

  if (type === 'row') {
    manualRowHeights[ index ] = newSize;
  } else {
    manualColWidths[ index ] = newSize;
  }

  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      virtualScrollRef.value?.refresh();
      rafId = null;
    });
  }
}

function stopResizing() {
  resizing.value = null;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', stopResizing);
  document.body.style.cursor = '';
  virtualScrollRef.value?.refresh();
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-6">Spreadsheet</span>
    </template>

    <template #description>
      A bidirectional grid demonstrating spreadsheet-like functionality with {{ rowCount.toLocaleString() }} rows and {{ colCount.toLocaleString() }} columns.
      Features include <strong>sticky column headers</strong> (A, B, C...) and <strong>sticky row headers</strong> (1, 2, 3...).
      <strong>New:</strong> Drag the edges of headers to resize rows and columns.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5" />
      </svg>
    </template>

    <template #subtitle>
      Bidirectional grid with header resizing
    </template>

    <template #controls>
      <ScrollStatus
        :scroll-details="scrollDetails"
        direction="both"
        :column-range="virtualScrollRef?.columnRange"
      />

      <ScrollControls
        v-model:item-count="rowCount"
        v-model:item-size="defaultRowHeight"
        v-model:column-count="colCount"
        v-model:column-width="defaultColWidth"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
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
      :item-size="getRowHeight"
      :column-count="colCount + 1"
      :column-width="getColWidth"
      :default-item-size="defaultRowHeight"
      :default-column-width="defaultColWidth"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :virtual-scrollbar="virtualScrollbar"
      :sticky-indices="stickyIndices"
      aria-label="Interactive spreadsheet"
      @scroll="onScroll"
    >
      <template #item="{ index, columnRange, isStickyActive, offset, getCellAriaProps }">
        <div
          class="example-spreadsheet-row"
          :class="{ 'example-spreadsheet-row--header': index === 0, 'example-spreadsheet-row--sticky': isStickyActive }"
          :style="{ height: `${ getRowHeight(null, index) }px` }"
        >
          <!-- Row Header (Column 0) - Always rendered and sticky -->
          <div
            class="example-spreadsheet-cell example-spreadsheet-cell--row-header"
            data-col-index="0"
            :style="{
              width: `${ getColWidth(0) }px`,
              height: `${ getRowHeight(null, index) }px`,
              insetInlineStart: `${ -Math.max(0, offset.x) }px`,
            }"
            v-bind="getCellAriaProps(0)"
            :role="index === 0 ? 'gridcell' : 'rowheader'"
          >
            {{ index === 0 ? '' : index }}
            <div
              v-if="index > 0"
              class="example-spreadsheet-row-resizer"
              @pointerdown="startResizing($event, 'row', index)"
            />
          </div>

          <!-- Visible Cells (excluding Column 0) -->
          <template v-for="colIdx in (columnRange.end - columnRange.start)" :key="colIdx + columnRange.start">
            <div
              v-if="(colIdx - 1 + columnRange.start) > 0"
              class="example-spreadsheet-cell"
              :data-col-index="colIdx - 1 + columnRange.start"
              :class="{ 'example-spreadsheet-cell--col-header': index === 0 }"
              :style="{
                width: `${ getColWidth(colIdx - 1 + columnRange.start) }px`,
                height: `${ getRowHeight(null, index) }px`,
                // The sticky row-header cell above stays in flow and consumes
                // column 0's slot; once the range starts past column 0, pull the
                // first data cell back so columns stay aligned with their slots.
                marginInlineStart: colIdx === 1 && columnRange.start > 0 ? `-${ getColWidth(0) }px` : undefined,
              }"
              v-bind="getCellAriaProps(colIdx - 1 + columnRange.start)"
              :role="index === 0 ? 'columnheader' : 'gridcell'"
            >
              {{ getCellContent(index, colIdx - 1 + columnRange.start) }}
              <div
                v-if="index === 0"
                class="example-spreadsheet-col-resizer"
                @pointerdown="startResizing($event, 'col', colIdx - 1 + columnRange.start)"
              />
            </div>
          </template>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A spreadsheet scrolls on two independent axes, so it needs two virtualizations at once: rows are virtualized
          vertically like any list, and every mounted row must contain only the narrow slice of columns that fits the
          viewport. With <code>direction=&quot;both&quot;</code> and a <code>column-count</code>, one
          <code>VirtualScroll</code> instance handles both axes - it mounts only the visible rows and, inside each row,
          only the visible columns (the slot&apos;s <code>columnRange</code>). The two header rails are pinned by
          different mechanisms: the column-header row sticks to the top through the engine&apos;s
          <code>sticky-indices</code>, while the row-header column sticks to the left through plain CSS
          <code>position: sticky</code> cells rendered inside every row. Because row and column sizes come from functions
          you own, resizing is a data change: write the new size into an override map and call the exposed
          <code>refresh()</code> so the engine rebuilds its offsets.
        </p>

        <h3>1. Reserve a header row and a header column in the grid model</h3>
        <p>
          In grid mode (<code>direction=&quot;both&quot;</code>) the <code>items</code> array is a flat list of rows and
          each row is rendered by the <code>#item</code> slot. Reserve index 0 on each axis for the headers: render
          <code>ROWS + 1</code> items and set <code>:column-count=&quot;COLS + 1&quot;</code> so the top row holds the
          column labels and column 0 of every row holds the row number - the data cells live in the
          <code>1..ROWS × 1..COLS</code> region in between. The scroll host needs a definite width and height (both axes
          scroll, so give it a real box - an explicit size or a flex parent with <code>min-height: 0</code>).
          <code>buffer-before</code>/<code>buffer-after</code> (default <code>5</code>) keep extra rows mounted around
          the viewport; <code>gap</code>/<code>column-gap</code> add spacing between rows/columns in the scroll math.
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

// Grid model: a flat array of ROW indexes; every row is rendered by the
// #item slot. Row 0 and column 0 are reserved for the headers, so the
// virtual grid is one row/column larger than the displayed data.
const ROWS = 1_000;
const COLS = 1_000;
const rows = Array.from({ length: ROWS + 1 }, (_, index) => index);

const rowHeight = 35;
const colWidth = 100;
const rowSize = (_row: unknown, _index: number) => rowHeight;
const colSize = (_index: number) => colWidth;

// Spreadsheet column names: 0 -> A ... 25 -> Z, 26 -> AA ...
function columnLabel(index: number): string {
  let label = '';
  for (let i = index; i >= 0; i = Math.floor(i / 26) - 1) {
    label = String.fromCharCode(65 + (i % 26)) + label;
  }
  return label;
}

function cellText(row: number, col: number) {
  if (row === 0) return columnLabel(col - 1); // column header
  if (col === 0) return String(row);          // row header
  return `R${row}C${col}`;
}
&lt;/script>"
        />

        <h3>2. Render each row from its visible column slice</h3>
        <p>
          The <code>#item</code> slot exposes <code>index</code>, <code>columnRange</code> (the visible column interval,
          inclusive start / exclusive end), <code>getColumnWidth(col)</code>, <code>getCellAriaProps(col)</code> and
          <code>offset</code>. Only rows inside the vertical window are mounted, and each mounted row contains only the
          columns in <code>columnRange</code> - loop that range instead of iterating every column. Cells must carry their
          exact size inline (column width, row height) because the row is a flex strip whose alignment depends on those
          widths; the first column (the pinned row-header cell, rendered separately below) is skipped in the loop. When
          the visible range starts past column 0 the pinned cell still occupies its flow slot, so the first mounted data
          cell is pulled back by that cell&apos;s width with a negative margin to keep every column at its virtual
          offset. ARIA roles are per-cell: <code>rowheader</code> for the row-number cells, <code>columnheader</code> for
          the header row and <code>gridcell</code> elsewhere, wired with <code>v-bind=&quot;getCellAriaProps(col)&quot;</code>
          (the engine already gives the container <code>role=&quot;grid&quot;</code> with <code>aria-rowcount</code>/
          <code>aria-colcount</code> and each row wrapper its <code>role=&quot;row&quot;</code>). Keep the slot light:
          rows and cells mount and unmount as you scroll.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    ref=&quot;grid&quot;
    class=&quot;sheet&quot;
    direction=&quot;both&quot;
    :items=&quot;rows&quot;
    :item-size=&quot;rowSize&quot;
    :column-count=&quot;COLS + 1&quot;
    :column-width=&quot;colSize&quot;
    :sticky-indices=&quot;[0]&quot;
    aria-label=&quot;Spreadsheet grid&quot;
  >
    &lt;template #item=&quot;{ item: row, index, columnRange, isStickyActive, getCellAriaProps }&quot;>
      &lt;div class=&quot;row&quot; :class=&quot;{ 'row--header': index === 0, 'row--pinned': isStickyActive }&quot;>
        &amp;lt;!-- Column 0 (row header / corner): re-rendered in every row and
             pinned to the inline-start edge via CSS position: sticky. -->
        &lt;div
          class=&quot;cell cell--row-head&quot;
          :role=&quot;index === 0 ? 'gridcell' : 'rowheader'&quot;
          v-bind=&quot;getCellAriaProps(0)&quot;
          :style=&quot;{ width: colSize(0) + 'px', height: rowSize(null, index) + 'px' }&quot;
        >
          {{ index === 0 ? '' : index }}
        &lt;/div>

        &amp;lt;!-- Only the visible columns (columnRange) are mounted; cells are
             sized to their column width so the flex strip stays aligned. -->
        &lt;template v-for=&quot;n in columnRange.end - columnRange.start&quot; :key=&quot;columnRange.start + n&quot;>
          &lt;div
            v-if=&quot;columnRange.start + n > 1&quot;
            class=&quot;cell&quot;
            :class=&quot;{ 'cell--col-head': index === 0 }&quot;
            :role=&quot;index === 0 ? 'columnheader' : 'gridcell'&quot;
            v-bind=&quot;getCellAriaProps(columnRange.start + n - 1)&quot;
            :style=&quot;{
              width: colSize(columnRange.start + n - 1) + 'px',
              height: rowSize(null, index) + 'px',
              marginInlineStart:
                n === 1 &amp;&amp; columnRange.start > 0 ? -colSize(0) + 'px' : undefined,
            }&quot;
          >
            {{ cellText(index, columnRange.start + n - 1) }}
          &lt;/div>
        &lt;/template>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>3. Pin the header row and the header column</h3>
        <p>
          The two axes pin differently. Vertically, list the header row in <code>sticky-indices</code> (here
          <code>[0]</code>): the engine sticks it to the top edge while you scroll down and reports
          <code>isStickyActive</code> on the slot while it is pinned. In <code>both</code> mode that index list applies to
          rows on the vertical axis only, so the horizontal rail is a CSS job: render column 0 as a dedicated first cell
          in every row and pin it with <code>position: sticky; inset-inline-start: 0</code>. It sticks because the rest
          of the row strip actually moves underneath it inside the scrollport - each mounted row is translated with the
          scroll offset and remounts its visible column window. Two details matter: the cell needs an opaque background
          (data cells slide under it while it overlaps them), and stacking must be ordered - row-versus-row layering is
          handled by the engine (a pinned row is marked <code>virtual-scroll--sticky</code> and raised with z-index 10 in
          the library stylesheet), while the cell z-indexes here only lift the pinned cell above its own row&apos;s data
          cells. The top-left corner cell combines both rails: it belongs to the sticky header row and carries the same
          sticky-cell class, raised above the column headers of its row.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="css"
          line-numbers
          code=".sheet {
  height: 480px; /* definite size - virtualization needs a real viewport */
  border: 1px solid #8884;
}

.row {
  display: flex;
  white-space: nowrap;
  background: #fff;
}
.row--header {
  background: #f3f4f6;
}

.cell {
  position: relative;
  box-sizing: border-box;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #8883;
  border-bottom: 1px solid #8883;
}

/* The column-0 cell pins itself to the scrollport's inline-start edge with
   plain CSS sticky while the rest of the row scrolls beneath it. For that
   to work the row strip must actually move (VirtualScroll translates each
   mounted row with the scroll offset) and the cell needs an opaque
   background, or the sliding data cells show through underneath. */
.cell--row-head {
  position: sticky;
  inset-inline-start: 0;
  z-index: 2; /* orders this cell above its own row's data cells */
  background: #f3f4f6;
  font-weight: 700;
}
.row--header .cell--row-head {
  z-index: 3;
} /* corner above column headers */

/* Row-versus-row stacking belongs to the engine: while a sticky row is
   pinned it is marked .virtual-scroll--sticky and raised (z-index 10 in the
   library stylesheet) above the body rows scrolling under it. The z-indexes
   in this file only order cells within a single row. */"
        />

        <h3>4. Resize rows and columns by editing their sizes</h3>
        <p>
          Because <code>item-size</code> and <code>column-width</code> are functions you provide, resizing needs no
          library mode: keep per-index override maps, read them first in the size functions, and let a drag write into
          them. Cells update reactively (their inline width/height re-evaluates), and calling the exposed
          <code>refresh()</code> makes the engine rebuild offsets, ranges and the total scroll extent from the new sizes
          - coalesce that call with <code>requestAnimationFrame</code> while dragging and issue one final
          <code>refresh()</code> on pointer-up. Attach the drag to thin hit areas: along the bottom edge of every
          row-header cell for row heights, along the inline-end edge of every column-header cell for column widths, both
          absolutely positioned with <code>row-resize</code>/<code>col-resize</code> cursors. A window-level
          <code>pointermove</code>/<code>pointerup</code> pair tracks the drag outside the cell, <code>preventDefault()</code>
          on <code>pointerdown</code> stops text selection, and the new size is clamped to a sensible minimum.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
// Resizing is a data change, not a layout mode: dragging writes new sizes
// into per-index override maps. Replace the plain rowSize()/colSize() from
// step 1 with these override-aware versions:
import { reactive, ref } from 'vue';

const grid = ref&lt;InstanceType&lt;typeof VirtualScroll> | null>(null); // template ref=&quot;grid&quot;

const manualRowSizes = reactive&lt;Record&lt;number, number>>({});
const manualColSizes = reactive&lt;Record&lt;number, number>>({});
const rowSize = (_row: unknown, index: number) => manualRowSizes[index] ?? rowHeight;
const colSize = (index: number) => manualColSizes[index] ?? colWidth;

let dragging: { axis: 'row' | 'col'; index: number; start: number; size: number } | null = null;
let frame: number | null = null;

function startResize(event: PointerEvent, axis: 'row' | 'col', index: number) {
  event.preventDefault(); // keep the drag from selecting text / native drag
  dragging = {
    axis,
    index,
    start: axis === 'row' ? event.clientY : event.clientX,
    size: axis === 'row' ? rowSize(null, index) : colSize(index),
  };
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', stopResize);
}

function onPointerMove(event: PointerEvent) {
  if (!dragging) return;
  const delta = (dragging.axis === 'row' ? event.clientY : event.clientX) - dragging.start;
  const size = Math.max(20, dragging.size + delta); // clamp to a minimum
  if (dragging.axis === 'row') manualRowSizes[dragging.index] = size;
  else manualColSizes[dragging.index] = size;

  // Cell boxes update reactively; refresh() once per frame so the engine
  // rebuilds offsets, ranges and the scroll extent from the new sizes.
  if (!frame) {
    frame = requestAnimationFrame(() => {
      frame = null;
      grid.value?.refresh();
    });
  }
}

function stopResize() {
  dragging = null;
  window.removeEventListener('pointermove', onPointerMove);
  window.removeEventListener('pointerup', stopResize);
}
&lt;/script>"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
