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

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

// Use a deterministic function for column width: first column 300px, others alternate 100/150
const columnWidthFn = computed(() => {
  const base = columnWidth.value;
  return (index: number) => {
    if (index === 0) {
      return base * 3;
    }
    return index % 2 === 0 ? base : Math.ceil(base * 1.5);
  };
});

// Rows render purely from their index: the items array is a sparse placeholder
// of the right length, so no per-row data is materialized even for 10M+ rows
// (only the visible window is ever accessed).
const items = computed(() => new Array(itemCount.value));

const stickyIndices = computed(() => {
  const indices: number[] = [];
  for (let i = 100; i < itemCount.value; i += 100) {
    indices.push(i);
  }
  return indices;
});

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
      <span class="example-title example-title--group-4">Grid Dynamic</span>
    </template>

    <template #description>
      Simultaneously virtualizes {{ itemCount.toLocaleString() }} rows and {{ columnCount.toLocaleString() }} columns. Uses <strong>querySelectorAll('[data-col-index]')</strong> to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically.
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
      Bidirectional scrolling with automatic measurement
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
      :column-count="columnCount"
      :default-item-size="120"
      :default-column-width="120"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :virtual-scrollbar="virtualScrollbar"
      :sticky-indices="stickyIndices"
      aria-label="Dynamic dimensions grid"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Grid Header
        </div>
      </template>

      <template #item="{ index, columnRange, isStickyActive, getCellAriaProps }">
        <div
          :key="`r_${ index }`"
          class="example-grid-row"
          :class="{ 'example-grid-row--sticky': isStickyActive }"
        >
          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="`r_${ index }_c_${ columnRange.start + c - 1 }`"
            :data-col-index="columnRange.start + c - 1"
            class="example-grid-cell"
            :style=" {
              inlineSize: `${ columnWidthFn(columnRange.start + c - 1) }px`,
              blockSize: `${ itemSizeFn(null, index) }px`,
            } "
            v-bind="getCellAriaProps(columnRange.start + c - 1)"
          >
            <div class="example-badge mb-2">R{{ index }} &times; C{{ columnRange.start + c - 1 }}</div>
            <div class="opacity-40 tabular-nums">{{ columnWidthFn(columnRange.start + c - 1) }}px</div>
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
          A grid whose rows or columns are <em>not</em> uniform cannot be positioned by arithmetic alone: the engine
          must know each row's height and each column's width before it can compute offsets, the window, and the scroll
          extent. There are two ways to supply variable sizes — declared (a function per index) or measured (read back
          from the DOM with a <code>ResizeObserver</code>). This pattern is the measured one: you render cells with the
          sizes your content actually needs, tag every cell with its column index, and let the engine discover the real
          geometry from the mounted window. Rows and columns that have not been visited yet are estimated from
          <code>default-item-size</code> / <code>default-column-width</code> until they scroll into view and get
          measured. The trade-off is measurement cost and late corrections against truthful sizes for content the DOM
          alone knows (wrapped text, loaded fonts, images).
        </p>

        <h3>1. Size the scroll box in both axes</h3>
        <p>
          Measured grids still use <code>direction="both"</code>, so the host element needs a definite width and
          height — set an explicit height, let the width fill its parent, and add <code>min-height: 0</code> inside
          flex/grid parents. Without a constrained viewport there are no scroll events and nothing to virtualize.
        </p>

        <h3>2. Choose how sizes are supplied</h3>
        <p>
          <code>item-size</code> (row height) and <code>column-width</code> accept the same forms, ordered from least
          to most flexible: a uniform number, a repeating array, a per-index function, or dynamic — pass <code>0</code>,
          <code>null</code>, or nothing to switch that axis to measurement. Functions receive
          <code>(item, index)</code> for rows and <code>(index)</code> for columns, and must return the size in px the
          slot will actually render.
        </p>

        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          Besides consistent cross-browser styling it is a performance improvement: the overlay bar is driven by the
          engine's own scroll math, so its rendering cost stays flat no matter how long the list grows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// item-size (rows) and column-width (columns) accept the same four forms.
// Choose the form that best matches your content - the engine positions
// from it, no DOM measurement needed:
//   number      uniform size          -> pure arithmetic, no storage
//   number[]    repeating pattern     -> cycles per index
//   function    per-index size        -> rows: (item, index); cols: (index)
//   0/null/omit dynamic, measured     -> default-item-size / default-column-width
//                                        seed the pre-measure estimate
const uniform = 48;
const pattern = [ 100, 180, 260 ];
const perRow = (item: Note) => 24 + item.lines.length * 20;
const perCol = (index: number) => (index === 0 ? 300 : [ 100, 150 ][ (index - 1) % 2 ]!);"
        />

        <h3>3. Tag cells, render content-sized rows, and let the engine measure</h3>
        <p>
          With both size props unset, the engine measures what it mounts. Row heights come from the rendered row box,
          so a row grows with its tallest cell — let wrapped text, images, or explicit cell heights define it. Column
          widths come from the cells, and to attribute a measured box to a column the engine scans the mounted row for
          elements carrying <code>data-col-index</code> (a plain attribute whose value is the <em>absolute</em> column
          index). That makes column detection independent of your slot structure: the tag can sit on the cell itself or
          on a wrapper, one level deep or nested. Give cells their intended rendered width (<code>inline-size</code> or
          CSS) — the engine reads the real box, so what you render is what gets stored. Before the first window is
          measured, <code>default-item-size</code> and <code>default-column-width</code> seed the estimates used for
          the initial range, scrollbar, and total size.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

// 1-3 wrapped text lines per row: the real height is only known after layout.
interface Note { id: number; who: string; lines: string[]; }
const WORDS = [ 'amber', 'basalt', 'cobalt', 'dune', 'ember', 'fjord' ];
const notes: Note[] = Array.from({ length: 4_000 }, (_, id) => ({
  id,
  who: [ 'Ada', 'Grace', 'Linus', 'Guido' ][ id % 4 ]!,
  lines: Array.from({ length: 1 + (id % 3) }, (_, line) =>
    `${ WORDS[ (id * 13 + line * 7) % WORDS.length ] } `.repeat(9 + (id * 7 + line) % 12).trim()),
}));

// The SLOT decides the rendered sizes; the engine MEASURES them, so no
// item-size / column-width prop is passed. The default-* props only seed the
// pre-measure estimate (first range, scrollbar) before the first paint.
const columnCount = 4;
const widths = [ 72, 120, 420, 130 ]; // rendered cell widths (px)
const cellStyle = (col: number) => ({ inlineSize: `${ widths[ col ] }px` });
const cellText = (note: Note, col: number) =>
  col === 0 ? String(note.id) : col === 1 ? note.who
    : [ 'Backlog', 'Active', 'Review', 'Done' ][ (note.id + col) % 4 ]!;
&lt;/script>

&lt;template>
  &lt;VirtualScroll
  virtual-scrollbar class=&quot;board&quot; direction=&quot;both&quot; :items=&quot;notes&quot; :column-count=&quot;columnCount&quot;
    :default-item-size=&quot;120&quot; :default-column-width=&quot;140&quot; aria-label=&quot;Note board grid&quot;>
    &lt;template #item=&quot;{ item, columnRange, getCellAriaProps }&quot;>
      &lt;div class=&quot;grid-row&quot;>
        &lt;div v-for=&quot;c in columnRange.end - columnRange.start&quot; :key=&quot;columnRange.start + c - 1&quot;
          :data-col-index=&quot;columnRange.start + c - 1&quot; class=&quot;grid-cell&quot;
          :style=&quot;cellStyle(columnRange.start + c - 1)&quot;
          v-bind=&quot;getCellAriaProps(columnRange.start + c - 1)&quot;>
          &lt;template v-if=&quot;columnRange.start + c - 1 === 2&quot;>
            &lt;p v-for=&quot;(line, i) in item.lines&quot; :key=&quot;i&quot; class=&quot;line&quot;>{{ line }}&lt;/p>
          &lt;/template>
          &lt;template v-else>{{ cellText(item, columnRange.start + c - 1) }}&lt;/template>
        &lt;/div>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.board { height: 480px; border: 1px solid oklch(50% 0 0 / 0.2); } /* definite 2-D viewport */
.grid-row { display: flex; align-items: stretch; } /* rows stretch to the tallest cell */
.grid-cell {
  box-sizing: border-box; flex: none; padding: 8px; overflow: hidden;
  border-right: 1px solid oklch(50% 0 0 / 0.1);
  border-bottom: 1px solid oklch(50% 0 0 / 0.1);
}
.line { margin: 0; font-size: 12px; line-height: 18px; }
&lt;/style>"
        />

        <h3>4. Re-measurement is automatic — keep it that way</h3>
        <p>
          Every newly mounted row and cell is observed, so scrolling, buffer changes, or container resizes that bring
          new content into the window extend the measurements on the fly; a size change above the current viewport
          shifts the content end, and the engine corrects the scroll position so the user does not jump. When a
          measured box grows after mount (late font, image load), the observer picks it up and the layout self-corrects
          — reserve space for media to avoid churn. If a dataset replacement or external style change invalidates the
          cached geometry, call the exposed <code>refresh()</code> to reset all cached measurements and re-initialize
          sizes from the current props and defaults; already-mounted rows and cells are then measured again as their
          boxes change. Declared (function) sizes skip this whole feedback loop: prefer them whenever the sizes are
          known before render, and keep the DOM in agreement with what the function returns.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
