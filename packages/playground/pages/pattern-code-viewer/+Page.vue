<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref, watch } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
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
      <span class="example-title example-title--group-5">Code Viewer</span>
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
        class="example-icon example-icon--group-5"
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
        <div class="flex items-center h-5 overflow-hidden px-2 text-xs leading-none">
          <span class="w-20 shrink-0 pe-5 text-end select-none font-mono tabular-nums text-base-content/35">{{ index + 1 }}</span>
          <span class="flex-1 min-w-0 whitespace-pre font-mono">
            <template v-for="(segment, k) in lineSegments(index)" :key="k">
              <span
                :class="[segment.cls, { 'bg-primary/25 rounded-[2px]': segment.mark }]"
              >{{ segment.text }}</span>
            </template>
          </span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
