<script setup lang="ts">
import type { DiffRow } from './diff-data';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ExampleXScrollbar from '#/components/ExampleXScrollbar.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';
import changedRaw from './changed.txt?raw';
import { diffData as initialDiffData } from './diff-data';
import originalRaw from './original.txt?raw';

const originalLines = originalRaw.split('\n');
const changedLines = changedRaw.split('\n');

function maxLineLength(lines: string[]): number {
  let max = 0;
  for (const line of lines) {
    if (line.length > max) {
      max = line.length;
    }
  }
  return max;
}

/** Longest line (in characters) across both files. */
const maxChars = Math.max(maxLineLength(originalLines), maxLineLength(changedLines));
/**
 * Uniform row width: both sides keep their columns aligned across rows with
 * different line lengths, and the horizontal scroll range stays stable.
 * `10rem` covers the two gutters plus the side paddings; `1ch` resolves in the
 * diff's monospace font, so the width tracks the responsive font size.
 */
const rowMinStyle = { minInlineSize: `calc(${ maxChars * 2 } * 1ch + 10rem)` };

const diffData = ref<DiffRow[]>(initialDiffData);

const additions = computed(() => initialDiffData.reduce((acc, row) => {
  if (row.type === 'diff' && row.newContent !== null) {
    return acc + 1;
  }
  return acc;
}, 0));

const deletions = computed(() => initialDiffData.reduce((acc, row) => {
  if (row.type === 'diff' && row.oldContent !== null) {
    return acc + 1;
  }
  return acc;
}, 0));

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
  handleScrollToIndex,
  handleScrollToOffset,
} = useExampleScroll();

const itemCount = computed(() => diffData.value.length);
const itemSize = ref(21);
const bufferBefore = ref(10);
const bufferAfter = ref(10);
const virtualScrollbar = ref(true);

function expandRegion(index: number) {
  const row = diffData.value[ index ];
  if (row.type !== 'collapsed' || !row.count || !row.oldStart || !row.newStart) {
    return;
  }

  const expandedRows: DiffRow[] = Array.from({ length: row.count }, (_, i) => {
    const oIdx = row.oldStart! + i - 1;
    const nIdx = row.newStart! + i - 1;
    return {
      type: 'common',
      oldLine: row.oldStart! + i,
      newLine: row.newStart! + i,
      oldContent: originalLines[ oIdx ] || '',
      newContent: changedLines[ nIdx ] || '',
    };
  });

  diffData.value.splice(index, 1, ...expandedRows);
}

function getDiffParts(oldStr: string | null | undefined, newStr: string | null | undefined) {
  if (oldStr == null || newStr == null || oldStr === newStr) {
    return {
      oldParts: [ { text: oldStr || '', changed: false } ],
      newParts: [ { text: newStr || '', changed: false } ],
    };
  }

  // Simple word-level diff (finds the first and last difference)
  let start = 0;
  while (start < oldStr.length && start < newStr.length && oldStr[ start ] === newStr[ start ]) {
    start++;
  }
  let endOld = oldStr.length - 1;
  let endNew = newStr.length - 1;
  while (endOld >= start && endNew >= start && oldStr[ endOld ] === newStr[ endNew ]) {
    endOld--;
    endNew--;
  }

  return {
    oldParts: [
      { text: oldStr.slice(0, start), changed: false },
      { text: oldStr.slice(start, endOld + 1), changed: true },
      { text: oldStr.slice(endOld + 1), changed: false },
    ].filter((p) => p.text),
    newParts: [
      { text: newStr.slice(0, start), changed: false },
      { text: newStr.slice(start, endNew + 1), changed: true },
      { text: newStr.slice(endNew + 1), changed: false },
    ].filter((p) => p.text),
  };
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-3">Git Diff</span>
    </template>

    <template #description>
      Showcases <strong>virtual-scroll</strong> with a side-by-side git diff view.
      It handles thousands of lines efficiently, including context-based collapsing.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6" />
      </svg>
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
      <ScrollControls
        v-model:item-size="itemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:virtual-scrollbar="virtualScrollbar"
        :item-count="itemCount"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <div class="diff-container relative flex flex-col border border-base-300 rounded-lg overflow-hidden">
      <!-- File Header -->
      <div class="diff-header flex items-center gap-2 px-4 py-2 bg-base-200 border-b border-base-300 text-xs font-medium sticky top-0 z-10">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4 -mt-[2px] opacity-70">
          <path d="M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l3.25 3.25c.329.328.513.773.513 1.237v9.25A1.75 1.75 0 0 1 13.586 16H3.75A1.75 1.75 0 0 1 2 14.25V1.75Z" />
        </svg>
        <span class="font-mono text-base-content/70">include/simdutf.h</span>
        <div class="flex items-center gap-1 ml-auto font-mono">
          <span class="text-success">+{{ additions }}</span>
          <span class="text-error">-{{ deletions }}</span>
        </div>
      </div>

      <div class="diff-viewer font-mono text-[10px] sm:text-xs overflow-hidden">
        <VirtualScroll
          ref="virtualScrollRef"
          class="example-container"
          :items="diffData"
          :item-size="itemSize"
          :buffer-before="bufferBefore"
          :buffer-after="bufferAfter"
          :virtual-scrollbar="virtualScrollbar"
          @scroll="onScroll"
        >
          <template #item="{ item, index }">
            <button
              v-if="item.type === 'collapsed'"
              type="button"
              class="diff-row diff-row--collapsed bg-info/20 hover:bg-info/30 appearance-none flex items-center"
              :style="rowMinStyle"
              @click="expandRegion(index)"
            >
              <div class="w-10 sm:w-12 flex-none flex justify-center opacity-50 bg-info/5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="size-4"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                </svg>
              </div>
              <div class="px-2 text-[11px]">@@ Expand {{ item.count }} lines @@</div>
            </button>

            <div v-else class="diff-row flex divide-x divide-base-300 hover:bg-base-200/50" :style="rowMinStyle">
              <!-- Left Side (Old) -->
              <div
                class="diff-side diff-side--old flex-1 flex pt-px"
                :class="{
                  'bg-error/30': item.oldContent !== null && item.newContent === null,
                  'bg-warning/30': item.oldContent !== null && item.newContent !== null && item.oldContent !== item.newContent,
                }"
              >
                <div
                  class="diff-gutter w-13 sm:w-15 flex-none text-right pe-2 select-none text-base-content/40 flex items-center justify-end gap-1"
                  :class="{
                    'bg-base-content/2 pe-4': item.oldContent === item.newContent,
                    'bg-error/5': item.oldContent !== null && item.newContent === null,
                    'bg-warning/5 pe-4': item.oldContent !== null && item.newContent !== null && item.oldContent !== item.newContent,
                  }"
                >
                  <span>{{ item.oldLine || '' }}</span>
                  <span v-if="item.oldContent !== null && item.newContent === null" class="opacity-50 w-1">-</span>
                </div>
                <div class="diff-content flex-1 px-2 whitespace-pre">
                  <template v-if="item.oldContent !== null && item.newContent !== null && item.oldContent !== item.newContent">
                    <span
                      v-for="(part, pIdx) in getDiffParts(item.oldContent, item.newContent).oldParts"
                      :key="pIdx"
                      :class="{ 'underline underline-offset-4': part.changed }"
                    >{{ part.text }}</span>
                  </template>
                  <template v-else>
                    {{ item.oldContent || '' }}
                  </template>
                </div>
              </div>
              <!-- Right Side (New) -->
              <div
                class="diff-side diff-side--new flex-1 flex pt-px"
                :class="{
                  'bg-success/30': item.oldContent === null && item.newContent !== null,
                  'bg-warning/30': item.oldContent !== null && item.newContent !== null && item.oldContent !== item.newContent,
                }"
              >
                <div
                  class="diff-gutter w-13 sm:w-15 flex-none text-right pe-2 select-none text-base-content/40 flex items-center justify-end gap-1"
                  :class="{
                    'bg-base-content/2 pe-4': item.oldContent === item.newContent,
                    'bg-success/5': item.oldContent === null && item.newContent !== null,
                    'bg-warning/5 pe-4': item.oldContent !== null && item.newContent !== null && item.oldContent !== item.newContent,
                  }"
                >
                  <span>{{ item.newLine || '' }}</span>
                  <span v-if="item.oldContent === null && item.newContent !== null" class="opacity-50 w-1">+</span>
                </div>
                <div class="diff-content flex-1 px-2 whitespace-pre">
                  <template v-if="item.oldContent !== null && item.newContent !== null && item.oldContent !== item.newContent">
                    <span
                      v-for="(part, pIdx) in getDiffParts(item.oldContent, item.newContent).newParts"
                      :key="pIdx"
                      :class="{ 'underline underline-offset-4': part.changed }"
                    >{{ part.text }}</span>
                  </template>
                  <template v-else>
                    {{ item.newContent || '' }}
                  </template>
                </div>
              </div>
            </div>
          </template>
        </VirtualScroll>
      </div>
      <ExampleXScrollbar :enabled="virtualScrollbar" />
    </div>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A side-by-side diff of two large files is a two-pane layout that must stay in vertical lockstep. The scalable
          approach is not two synchronized scroll lists but <strong>one</strong> virtualized list whose rows each paint
          both panes: content that belongs together is a single row, so alignment is structural, scroll state exists
          once, and only one set of rows is ever mounted. Because every row is one text line, the list is
          uniform-height, which gives arithmetic positioning and turns folded-context expansion into a plain reactive
          splice. The two hard parts are modeling rows whose sides can be absent (added/removed lines) and keeping
          rows from wrapping, which would silently break the uniform-height contract.
        </p>

        <h3>1. Model each pair of lines as one row</h3>
        <p>
          The naive layout - two lists side by side - forces you to synchronize scroll offsets by hand, and the sides
          stop being index-aligned at the first insertion or deletion. Model the pairing instead: each row owns its
          old and new line numbers and carries <em>nullable</em> content for the side that has no line. Produce these
          rows once, ahead of rendering, by running your diff algorithm over the two files; the shape below also
          includes a placeholder for a folded run of unchanged lines (see step 5).
        </p>

        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          Besides consistent cross-browser styling it is a performance improvement: the overlay bar is driven by the
          engine's own scroll math, so its rendering cost stays flat no matter how long the list grows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// Each virtual row is ONE model object that describes both panes. Line
// numbers live on the row rather than being derived from index + 1: an added
// or removed line shifts only its own side, so the old and new numbering are
// free to diverge (null = that side has no line here).
type DiffRow =
  | { type: 'common'; oldLine: number; newLine: number; oldContent: string; newContent: string }
  | { type: 'change'; oldLine: number | null; newLine: number | null; oldContent: string | null; newContent: string | null }
  | { type: 'collapsed'; oldStart: number; newStart: number; count: number };

// Produce these rows once, ahead of rendering, by running a real diff
// algorithm (Myers, patience, ...) over the two files. A removed line keeps
// newContent === null, an added line keeps oldContent === null, and long runs
// of unchanged lines can be folded into one 'collapsed' placeholder row.
const diffRows: DiffRow[] = [
  { type: 'common', oldLine: 1, newLine: 1, oldContent: 'const answer = 42;', newContent: 'const answer = 42;' },
  { type: 'change', oldLine: 2, newLine: null, oldContent: 'let enabled = true;', newContent: null },
  { type: 'change', oldLine: null, newLine: 2, oldContent: null, newContent: 'const enabled = true;' },
  { type: 'collapsed', oldStart: 3, newStart: 3, count: 120 },
];"
        />

        <h3>2. Virtualize the uniform-height rows</h3>
        <p>
          Every variant - changed rows and the full-width expand placeholder - shares one height, so a numeric
          <code>item-size</code> turns range and offset math into pure arithmetic: no <code>ResizeObserver</code>, no
          per-row allocation, <em>O(1)</em> positioning. Give the scroll host a definite height (or a flex-fill with
          <code>min-height: 0</code>), then bind the row array and the size. The <code>#item</code> slot renders either
          the expand button or the two panes; <code>index</code> addresses the data but is never used to display a line
          number - the row owns those.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import { computed, ref } from 'vue';

import { diffRows, type DiffRow } from './diff-data';

// Longest line (in characters) over both files decides the row width. Every
// row must be able to hold its longest half on a single line, or heights stop
// being uniform. `ch` is the width of '0' in the monospace font, so the
// formula follows the font size; the constant covers both gutters + paddings.
const maxChars = computed(() =>
  Math.max(0, ...diffRows.map((row) =>
    Math.max(row.oldContent?.length ?? 0, row.newContent?.length ?? 0))),
);
const rowMinStyle = computed(() => ({
  minInlineSize: `calc(${maxChars.value * 2} * 1ch + 10rem)`,
}));

const rows = ref&lt;DiffRow[]>(diffRows);
&lt;/script>

&lt;template>
  &amp;lt;!-- ONE vertical list whose rows each paint both panes: the sides are in
       lockstep by construction, so no scroll synchronization is involved. -->
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;diff-viewer&quot;
    :items=&quot;rows&quot;
    :item-size=&quot;20&quot;
    :buffer-before=&quot;10&quot;
    :buffer-after=&quot;10&quot;
    aria-label=&quot;Side-by-side diff&quot;
  >
    &lt;template #item=&quot;{ item, index }&quot;>
      &lt;button v-if=&quot;item.type === 'collapsed'&quot; class=&quot;row collapsed&quot; @click=&quot;expand(index)&quot;>
        Expand {{ item.count }} lines
      &lt;/button>

      &lt;div v-else class=&quot;row&quot; :style=&quot;rowMinStyle&quot;>
        &lt;div class=&quot;side&quot;>
          &lt;div class=&quot;gutter&quot;>{{ item.oldLine ?? '' }}&lt;/div>
          &lt;div class=&quot;code&quot;>{{ item.oldContent ?? '' }}&lt;/div>
        &lt;/div>
        &lt;div class=&quot;side&quot;>
          &lt;div class=&quot;gutter&quot;>{{ item.newLine ?? '' }}&lt;/div>
          &lt;div class=&quot;code&quot;>{{ item.newContent ?? '' }}&lt;/div>
        &lt;/div>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>3. Size rows so they can never wrap</h3>
        <p>
          A long line must overflow horizontally, never wrap onto a second line - a wrapped row changes height and
          breaks the uniform-size contract. In a monospace font the width of a line is exactly
          <code>length × 1ch</code>, so give each row a <code>min-inline-size</code> that fits its longest half: twice
          the longest line in <code>ch</code>, plus an allowance for both gutters and side paddings. Because
          <code>ch</code> tracks the font size, the rule survives responsive font changes. The wide rows overflow the
          host, which pans them with its native horizontal overflow - opt the items wrapper out of its default
          <code>contain: layout</code> so the overflow actually extends the host's scrollable area.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="css"
          code="&lt;style scoped>
.diff-viewer {
  height: 480px; /* the scroll viewport needs a definite height */
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* item-size (20) must equal the rendered row height: the 20px line box keeps
   every variant - the collapsed button and the two-pane row - exactly one
   line tall, so the engine's arithmetic matches the DOM. */
.row {
  display: flex;
  line-height: 20px;
}
.collapsed {
  font: inherit;
  border: 0;
  padding: 0;
  width: 100%;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}
.side {
  flex: 1;
  display: flex;
  min-width: 0;
}
.gutter {
  flex: none;
  width: 3.5rem;
  padding-inline-end: 0.5rem;
  text-align: end;
  color: color-mix(in oklab, currentColor 45%, transparent);
  font-variant-numeric: tabular-nums;
}
.code {
  flex: 1;
  white-space: pre;
}

/* Long lines make rows wider than the viewport; the host pans them natively.
   The wrapper's default `contain: layout` would keep that overflow inside, so
   opt out to make the wide rows part of the host's scrollable area. */
:deep(.virtual-scroll-container .virtual-scroll-wrapper) {
  contain: none;
}
&lt;/style>"
        />

        <h3>4. Signal the change kind per row</h3>
        <p>
          Each side renders its own gutter (right-aligned, tabular numbers) and its code. Derive color and marker from
          the model: a removed line keeps <code>newContent === null</code>, an added line keeps
          <code>oldContent === null</code>, and a modified line has both sides present but different. For a word-level
          highlight, split the changed pair into unchanged-prefix / changed-middle / unchanged-suffix segments and
          emphasize the middle. The segments are a pure function of the row, which keeps rendering idempotent under
          row recycling.
        </p>

        <h3>5. Fold context runs and expand them on demand</h3>
        <p>
          Files with large untouched regions do not need a row per line: fold each run of identical lines into one
          placeholder row carrying the run metadata, then materialize on click by splicing the real rows into the
          array at that index. With a numeric <code>item-size</code> the engine derives everything from the length, so
          a mid-list splice is a plain reactive array update. Keep the two raw file line arrays in scope - the
          expansion rebuilds content from them.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// Optional context folding: keep the two raw files around and expand a folded
// run into real rows on demand instead of mounting thousands of lines.
function expand(index: number) {
  const row = rows.value[index];
  if (row.type !== 'collapsed' || !row.count) {
    return;
  }

  const expanded: DiffRow[] = Array.from({ length: row.count }, (_, i) => ({
    type: 'common',
    oldLine: row.oldStart + i,
    newLine: row.newStart + i,
    oldContent: oldLines[row.oldStart + i - 1] ?? '',
    newContent: newLines[row.newStart + i - 1] ?? '',
  }));

  // Splice in place: with a numeric item-size the engine derives everything
  // from the length, so inserting rows mid-list is a plain array update.
  rows.value.splice(index, 1, ...expanded);
}"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>

<style scoped>
.diff-row {
  line-height: 20px;
}

:deep(.virtual-scroll-container .virtual-scroll-wrapper) {
  contain: none;
}
</style>
