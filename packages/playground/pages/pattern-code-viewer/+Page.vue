<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref, watch } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ExampleXScrollbar from '#/components/ExampleXScrollbar.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import changedRaw from '../pattern-diff/changed.txt?raw';
import originalRaw from '../pattern-diff/original.txt?raw';
import { html as highlightedCode } from './+Page.vue?highlight';

// The same source files shown in the Side-by-Side Code Diff example (simdutf
// amalgamated headers) — virtualized and colorized on the fly.

const LINE_HEIGHT = 20;

function loadLines(raw: string): string[] {
  const lines = raw.split('\n');
  if (lines[ lines.length - 1 ] === '') {
    lines.pop();
  }
  return lines;
}

interface SourceFile {
  name: string;
  label: string;
  lines: string[];
}

const FILES: Record<'original' | 'changed', SourceFile> = {
  original: { name: 'original.txt', label: 'Original', lines: loadLines(originalRaw) },
  changed: { name: 'changed.txt', label: 'Changed', lines: loadLines(changedRaw) },
};

const activeFile = ref<'original' | 'changed'>('original');

const lines = computed(() => FILES[ activeFile.value ].lines);
const totalLines = computed(() => lines.value.length);

/** Longest line of the active file, in characters. */
const maxChars = computed(() => Math.max(0, ...lines.value.map((line) => line.length)));
/** Uniform row width: keeps the horizontal scroll range stable while virtualized rows recycle. */
const codeMinStyle = computed(() => ({ minInlineSize: `${ maxChars.value }ch` }));

// --- Find & highlight ---

const searchQuery = ref('');
const debouncedQuery = ref('');
const currentMatchIndex = ref(-1);
const matches = ref<number[]>([]);
const searching = ref(false);

// --- Lightweight syntax coloring (no markup: spans with Tailwind classes) ---

interface CodeSegment {
  text: string;
  cls?: string;
  /** True when this piece matches the active search term. */
  mark?: boolean;
}

const KEYWORDS = new Set([
  'auto',
  'bool',
  'break',
  'case',
  'catch',
  'char',
  'class',
  'const',
  'constexpr',
  'continue',
  'default',
  'delete',
  'do',
  'double',
  'else',
  'enum',
  'explicit',
  'export',
  'false',
  'float',
  'for',
  'friend',
  'if',
  'inline',
  'int',
  'long',
  'namespace',
  'new',
  'nullptr',
  'operator',
  'private',
  'protected',
  'public',
  'return',
  'short',
  'signed',
  'sizeof',
  'static',
  'struct',
  'switch',
  'template',
  'this',
  'throw',
  'true',
  'try',
  'typedef',
  'typename',
  'union',
  'unsigned',
  'using',
  'virtual',
  'void',
  'volatile',
  'while',
]);

interface LineParts {
  /** Code part of the line (comments stripped, split around a closed block comment). */
  code: string;
  /** Trailing comment text, or '' when the line has none. */
  comment: string;
}

function buildParts(raw: string[]): LineParts[] {
  const parts: LineParts[] = [];
  let inBlockComment = false;
  for (const line of raw) {
    let code = '';
    let comment = '';
    const rest = line;
    let start = -1;
    if (inBlockComment) {
      start = 0;
    } else {
      const lineComment = rest.indexOf('//');
      const blockComment = rest.indexOf('/*');
      if (lineComment !== -1 && (blockComment === -1 || lineComment < blockComment)) {
        start = lineComment;
      } else if (blockComment !== -1) {
        start = blockComment;
      }
    }

    if (start === -1) {
      code = rest;
    } else {
      code = rest.slice(0, start);
      const close = rest.indexOf('*/', start + 2);
      if (close !== -1) {
        comment = rest.slice(start, close + 2);
        code += rest.slice(close + 2);
        inBlockComment = false;
      } else {
        comment = rest.slice(start);
        inBlockComment = true;
      }
    }
    parts.push({ code, comment });
  }
  return parts;
}

const parts = computed(() => buildParts(lines.value));

function tokenizeCode(code: string): CodeSegment[] {
  const segments: CodeSegment[] = [];

  const tokenPattern = /('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Z_$][\w$]*)|(\s+)|(.)/gi;
  for (const match of code.matchAll(tokenPattern)) {
    const [ , str, num, word ] = match;
    if (str !== undefined) {
      segments.push({ text: str, cls: 'text-success' });
    } else if (num !== undefined) {
      segments.push({ text: num, cls: 'text-warning' });
    } else if (word !== undefined) {
      segments.push({ text: word, cls: KEYWORDS.has(word) ? 'text-primary' : undefined });
    } else {
      // Whitespace (kept for indentation) and punctuation.
      segments.push({ text: match[ 0 ] });
    }
  }

  return segments;
}

/** Splits a tokenized line into pieces, marking occurrences of the search term. */
function highlightSegments(segments: CodeSegment[], query: string): CodeSegment[] {
  if (query.length < 2) {
    return segments;
  }
  const pieces: CodeSegment[] = [];
  for (const segment of segments) {
    const lower = segment.text.toLowerCase();
    let from = 0;
    let hit = lower.indexOf(query, from);
    if (hit === -1) {
      pieces.push(segment);
      continue;
    }
    while (hit !== -1) {
      if (hit > from) {
        pieces.push({ text: segment.text.slice(from, hit), cls: segment.cls });
      }
      pieces.push({ text: segment.text.slice(hit, hit + query.length), cls: segment.cls, mark: true });
      from = hit + query.length;
      hit = lower.indexOf(query, from);
    }
    if (from < segment.text.length) {
      pieces.push({ text: segment.text.slice(from), cls: segment.cls });
    }
  }
  return pieces;
}

function lineSegments(i: number): CodeSegment[] {
  const line = parts.value[ i ]!;
  const segments = tokenizeCode(line.code);
  if (line.comment !== '') {
    segments.push({ text: line.comment, cls: 'text-base-content/40 italic' });
  }
  return highlightSegments(segments, debouncedQuery.value);
}

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

let debounceTimer: ReturnType<typeof setTimeout> | undefined;
watch(searchQuery, (value) => {
  clearTimeout(debounceTimer);
  const query = value.trim().toLowerCase();
  if (query.length < 2) {
    debouncedQuery.value = '';
    matches.value = [];
    currentMatchIndex.value = -1;
    searching.value = false;
    return;
  }
  searching.value = true;
  debounceTimer = setTimeout(() => {
    scanMatches(query);
  }, 200);
});

function scanMatches(query: string) {
  debouncedQuery.value = query;
  matches.value = [];
  const fileLines = lines.value;
  for (let i = 0; i < fileLines.length; i++) {
    if (fileLines[ i ]!.toLowerCase().includes(query)) {
      matches.value.push(i);
    }
  }
  currentMatchIndex.value = matches.value.length > 0 ? 0 : -1;
  searching.value = false;
  if (currentMatchIndex.value !== -1) {
    scrollToMatch();
  }
}

function scrollToMatch() {
  const target = matches.value[ currentMatchIndex.value ];
  if (target !== undefined) {
    virtualScrollRef.value?.scrollToIndex(target, null, { align: 'center', behavior: 'smooth' });
  }
}

function findFirst() {
  if (matches.value.length === 0) {
    return;
  }
  currentMatchIndex.value = 0;
  scrollToMatch();
}

function findLast() {
  if (matches.value.length === 0) {
    return;
  }
  currentMatchIndex.value = matches.value.length - 1;
  scrollToMatch();
}

function findNext() {
  if (matches.value.length === 0) {
    return;
  }
  currentMatchIndex.value = (currentMatchIndex.value + 1) % matches.value.length;
  scrollToMatch();
}

function findPrev() {
  if (matches.value.length === 0) {
    return;
  }
  currentMatchIndex.value = (currentMatchIndex.value - 1 + matches.value.length) % matches.value.length;
  scrollToMatch();
}

const matchCounter = computed(() => (matches.value.length === 0 ? null : `${ currentMatchIndex.value + 1 } / ${ matches.value.length }`));

watch(activeFile, () => {
  matches.value = [];
  currentMatchIndex.value = -1;
  if (debouncedQuery.value.length >= 2) {
    scanMatches(debouncedQuery.value);
  }
  virtualScrollRef.value?.scrollToIndex(0, null, { align: 'start', behavior: 'auto' });
});
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-1">Code Viewer</span>
    </template>

    <template #description>
      Browses the same {{ totalLines.toLocaleString() }}-line simdutf header used in the Side-by-Side Code Diff example, colorized on the fly. Find scans the file and jumps to the next occurrence; matching terms are highlighted as they scroll into view.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
      </svg>
    </template>

    <template #subtitle>
      Find and jump inside a real C++ source file
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
          <span class="sr-only">Source file</span>
          <span class="small-caps font-bold tracking-widest opacity-60">File</span>
          <select v-model="activeFile" class="select select-sm">
            <option value="original">original.txt ({{ FILES.original.lines.length.toLocaleString() }} lines)</option>
            <option value="changed">changed.txt ({{ FILES.changed.lines.length.toLocaleString() }} lines)</option>
          </select>
        </label>

        <label class="input input-sm max-w-72">
          <span class="sr-only">Find in file</span>
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Find in file…"
            @keydown.enter="findNext"
          />
        </label>

        <button class="btn btn-sm btn-soft" :disabled="matches.length === 0" @click="findFirst">First</button>
        <button class="btn btn-sm btn-soft" :disabled="matches.length === 0" @click="findPrev">Prev</button>
        <button class="btn btn-sm btn-soft" :disabled="matches.length === 0" @click="findNext">Next</button>
        <button class="btn btn-sm btn-soft" :disabled="matches.length === 0" @click="findLast">Last</button>

        <div class="text-xs opacity-60 ms-auto">
          <span v-if="searching">Scanning…</span>
          <span v-else-if="matchCounter">{{ matchCounter }} match{{ matches.length === 1 ? '' : 'es' }}</span>
          <span v-else>{{ totalLines.toLocaleString() }} lines · {{ FILES[ activeFile ].name }}</span>
        </div>
      </div>
    </template>

    <div class="relative flex min-h-0 flex-1 flex-col">
      <VirtualScroll
        ref="virtualScrollRef"
        :debug="debugMode"
        class="example-container"
        :items="lines"
        :item-size="LINE_HEIGHT"
        :buffer-before="10"
        :buffer-after="10"
        virtual-scrollbar
        aria-label="Code viewer list"
        @scroll="onScroll"
      >
        <template #item="{ index }">
          <div class="flex items-center h-5 px-2 text-xs leading-none">
            <span class="w-20 shrink-0 pe-5 text-end select-none font-mono tabular-nums text-base-content/35">{{ index + 1 }}</span>
            <span class="flex-1 whitespace-pre font-mono" :style="codeMinStyle">
              <template v-for="(segment, k) in lineSegments(index)" :key="k">
                <span
                  :class="[segment.cls, { 'bg-primary/25 rounded-[2px]': segment.mark }]"
                >{{ segment.text }}</span>
              </template>
            </span>
          </div>
        </template>
      </VirtualScroll>
      <ExampleXScrollbar />
    </div>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A code viewer is the ideal virtual-scroll workload: thousands of rows that are all exactly one text line
          tall. Treat the file as an array of strings and virtualize with a numeric <code>item-size</code>, so the engine positions rows arithmetically — no DOM measurement — and only the visible window is ever mounted. Uniformity holds because monospace text on one line cannot wrap away from the fixed
          row height, and <code>1ch</code> gives you exact, font-size-relative widths for the gutter and the longest
          line. Two further behaviors make it an editor rather than a pager: find-and-jump that scrolls
          programmatically to a model-side match index, and on-the-fly coloring that runs per mounted row as a pure
          function of the text.
        </p>

        <h3>1. Model the file as an array of uniform lines</h3>
        <p>
          Split the source into an array — element <code>i</code> is line <code>i + 1</code> — and pass it as
          <code>items</code> with a numeric <code>item-size</code>. A real array is the mainstream choice: rows carry
          the text they render. (If a view truly needs only numbering, an index-only sparse array
          works too — the slot receives <code>index</code> and never reads a payload.) Give the scroll host a definite
          height, or flex-fill it with <code>min-height: 0</code> in a flex/grid parent.
        </p>

        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          Besides consistent cross-browser styling it is a performance improvement: the overlay bar is driven by the
          engine's own scroll math, so its rendering cost stays flat no matter how long the list grows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import { computed, ref } from 'vue';

const virtualScrollRef = ref&lt;InstanceType&lt;typeof VirtualScroll> | null>(null);

const LINE_HEIGHT = 20; // px; must equal the CSS row height below

// A file is an array of strings, one element per virtual row. A numeric
// item-size lets the engine position rows arithmetically and never measure
// the DOM.
const lines = ref&lt;string[]>([]); // lines[0] === file line 1

// Longest line in `ch` units. `ch` is the width of '0' in the monospace font,
// so maxChars * 1ch is the true pixel width of the widest line. Because every
// row gets this min width, rows never wrap - and the horizontal scroll range
// stays constant while rows recycle in and out of the DOM.
const maxChars = computed(() => lines.value.reduce((m, l) => Math.max(m, l.length), 0));
const codeMinStyle = computed(() => ({ minInlineSize: `${maxChars.value}ch` }));
&lt;/script>
&nbsp;
&lt;template>
  &amp;lt;!-- Uniform-height, vertical-only virtualization. -->
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;code-viewer&quot;
    :items=&quot;lines&quot;
    :item-size=&quot;LINE_HEIGHT&quot;
    :buffer-before=&quot;10&quot;
    :buffer-after=&quot;10&quot;
    ref=&quot;virtualScrollRef&quot;
    aria-label=&quot;Code viewer&quot;
  >
    &amp;lt;!-- One row = line number + code: the gutter is in lockstep with its line
         by construction and scrolls away with it - no second scroll surface,
         no gutter/list synchronization. -->
    &lt;template #item=&quot;{ index }&quot;>
      &lt;div class=&quot;row&quot;>
        &lt;span class=&quot;gutter&quot;>{{ index + 1 }}&lt;/span>
        &lt;span class=&quot;code&quot; :style=&quot;codeMinStyle&quot;>{{ lines[index] }}&lt;/span>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>2. Lock the line geometry with monospace CSS</h3>
        <p>
          Every row is exactly <code>LINE_HEIGHT</code> tall: the row root fixes the height, flex centering plus a
          compact <code>line-height</code> keep the row height independent of font metrics, and
          <code>white-space: pre</code> guarantees the code is one line that never wraps. The gutter is a fixed-width,
          right-aligned span <em>inside</em> the row — no second scroll surface to keep in sync, and the number
          provably matches the code beside it. Because each line is one row, the line box math is uniform even when
          content differs; a fixed-height row with wrapping text would be the case for dynamic measurement instead.
        </p>
        <ul>
          <li>
            Use a monospace font: every glyph advances exactly <code>1ch</code>, so a line's pixel width is its length
            in <code>ch</code> — the formula above is exact, and gutter digits stay constant-width.
          </li>
          <li>Give the numbers <code>font-variant-numeric: tabular-nums</code> so digits do not jitter while scrolling.</li>
          <li>
            If numbers must stay pinned like an editor's, the gutter has to live outside the scroll host as a fixed
            sibling column that shares the row-height math — inside-row gutters scroll away with their lines, which is
            the zero-sync approach shown here.
          </li>
        </ul>

        <CodeBlock
          class="guide-code-block"
          lang="css"
          code="&lt;style scoped>
.code-viewer {
  height: 480px; /* the scroll viewport needs a definite height */
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

/* Exactly LINE_HEIGHT tall. Flex centering plus a compact line-height make
   the row height independent of font metrics: every line stays one 20px row
   even though the 12px text itself is shorter than the row. */
.row {
  display: flex;
  align-items: center;
  height: 20px;
  font-size: 12px;
  line-height: 1;
}
.gutter {
  flex: none;
  width: 5rem; /* fixed width, right-aligned numbers */
  padding-inline-end: 1rem;
  text-align: end;
  color: color-mix(in oklab, currentColor 45%, transparent);
  font-variant-numeric: tabular-nums; /* digits do not jitter while scrolling */
}
.code {
  flex: 1;
  white-space: pre;
}

/* Wide rows overflow the viewport and the host pans them natively; opt the
   wrapper out of its default `contain: layout` so they extend the host's
   scrollable area. */
:deep(.virtual-scroll-container .virtual-scroll-wrapper) {
  contain: none;
}
&lt;/style>"
        />
        <p>
          Note why the min-width is applied to <em>every</em> row and not left to content: rows mount and unmount as
          you scroll, so a scroll range derived from whatever is currently mounted would shrink and grow with each
          window. Reserving <code>maxChars × 1ch</code> on every row keeps the horizontal range — and the horizontal
          scrollbar — stable for the whole scroll.
        </p>

        <h3>3. Find and jump with programmatic scroll</h3>
        <p>
          Searching is kept out of the DOM: on a debounced query, scan the file once and store the matching line
          indices; the renderer only consults that array when a row is mounted. Navigation is then
          <code>scrollToIndex(matchIndex, null, options)</code> — the second argument is the column (grid mode only, so
          <code>null</code> here) and the options choose alignment and animation. With uniform sizes the engine jumps
          straight to the row offset, so a <code>'center'</code> jump to match #500 costs no more than a jump to #1.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// Find-and-jump: matches are precomputed model-side (one full-file
// scan per search), then navigation is pure index math + programmatic scroll.
const matches = ref&lt;number[]>([]);
let current = -1;
let debounce: ReturnType&lt;typeof setTimeout> | undefined;

watch(searchQuery, (query) => {
  clearTimeout(debounce);
  const q = query.trim().toLowerCase();
  if (q.length &lt; 2) {
    matches.value = [];
    return;
  }
  debounce = setTimeout(() => scan(q), 150);
});

function scan(q: string) {
  matches.value = [];
  for (let i = 0; i &lt; lines.value.length; i++) {
    if (lines.value[i]!.toLowerCase().includes(q)) {
      matches.value.push(i);
    }
  }
  current = matches.value.length > 0 ? 0 : -1;
  if (current !== -1) {
    scrollToMatch();
  }
}

function scrollToMatch() {
  const target = matches.value[current];
  if (target !== undefined) {
    // (row, col, options): col is null for a vertical list; 'center' puts the
    // match mid-viewport. The engine can jump straight to the offset because
    // uniform sizes make every row offset arithmetic.
    virtualScrollRef.value?.scrollToIndex(target, null, { align: 'center', behavior: 'smooth' });
  }
}

function findNext() {
  if (matches.value.length === 0) {
    return;
  }
  current = (current + 1) % matches.value.length;
  scrollToMatch();
}"
        />

        <h3>4. Colorize rows as they mount</h3>
        <p>
          Syntax coloring is applied only to mounted rows: call the tokenizer from the
          <code>#item</code> slot, so a 5,000-line file pays for only the mounted window (a few dozen rows) per frame
          instead of 5,000 passes, and scrolling stays smooth because rows recycle. Make the tokenizer a pure function
          of the line text — same input, same segments — which is exactly what recycled rows require. Handle block comments by pre-stripping them per line
          with a carry-over state machine (one pass over the file), then append the trailing comment as a single
          styled segment. Active search terms can be split out of any segment as an extra marked piece using the match
          array from step 3.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// On-the-fly coloring runs ONLY for rows entering the window: call it from
// the #item slot. It is a pure function of the line text, so the same index
// always yields the same segments - safe under row recycling.
function lineSegments(line: string): CodeSegment[] {
  const segments: CodeSegment[] = [];
  const pattern =
    /('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Z_$][\w$]*)|(\s+)|(.)/gi;
  for (const m of line.matchAll(pattern)) {
    const [ , str, num, word ] = m;
    if (str !== undefined) {
      segments.push({ text: str, cls: 'string' });
    } else if (num !== undefined) {
      segments.push({ text: num, cls: 'number' });
    } else if (word !== undefined) {
      segments.push({ text: word, cls: KEYWORDS.has(word) ? 'keyword' : undefined });
    } else {
      segments.push({ text: m[ 0 ] }); // whitespace &amp; punctuation
    }
  }
  return segments;
}

// In the #item template, replace the plain text interpolation with a v-for
// over these segments, rendering each with its class. A trailing comment
// (stripped beforehand, tracking /* */ state across lines) can be appended
// as one extra italic segment."
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>

<style scoped>
:deep(.virtual-scroll-container .virtual-scroll-wrapper) {
  contain: none;
}
</style>
