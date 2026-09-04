<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

// CSS Custom Highlight API support check and types
const hasHighlightSupport = typeof CSS !== 'undefined' && 'highlights' in CSS;

const itemCount = ref(10000);
const searchQuery = ref('Ultimate');
const searchInputRef = ref<HTMLInputElement | null>(null);
const currentMatchIndex = ref(-1);
const virtualScrollbar = ref(true);

const reEscape = /[.*+?^${}()|[\\]/g;

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
const isMounted = ref(false);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: `This is item #${ i }. It contains some random content to search for.${ (i % 10 === 0) ? ' BINGO!' : '' } ${ (i % 100 === 42) ? ' ULTIMATE ANSWER' : '' }`,
})));

const matches = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    return [];
  }
  const query = searchQuery.value.toLowerCase();
  const results: number[] = [];
  for (let i = 0; i < items.value.length; i++) {
    if (items.value[ i ]!.text.toLowerCase().includes(query)) {
      results.push(i);
    }
  }
  return results;
});

const ssrRange = computed(() => {
  const matchIdx = matches.value[ 0 ];
  if (matchIdx == null) {
    return { start: 0, end: 20 };
  }
  return {
    start: Math.max(0, matchIdx - 1),
    end: Math.min(items.value.length, matchIdx + 19),
  };
});

const currentMatchNumber = computed(() => {
  if (currentMatchIndex.value === -1 || matches.value.length === 0) {
    return 0;
  }
  return currentMatchIndex.value + 1;
});

function nextMatch() {
  if (matches.value.length === 0) {
    return;
  }
  currentMatchIndex.value = (currentMatchIndex.value + 1) % matches.value.length;
  scrollToMatch();
}

function prevMatch() {
  if (matches.value.length === 0) {
    return;
  }
  currentMatchIndex.value = (currentMatchIndex.value - 1 + matches.value.length) % matches.value.length;
  scrollToMatch();
}

function scrollToMatch() {
  const itemIndex = matches.value[ currentMatchIndex.value ];
  if (itemIndex !== undefined) {
    virtualScrollRef.value?.scrollToIndex(itemIndex, null, { align: 'auto', behavior: 'smooth' });
  }
}

watch(searchQuery, () => {
  currentMatchIndex.value = matches.value.length > 0 ? 0 : -1;
  if (currentMatchIndex.value !== -1) {
    scrollToMatch();
  }
});

/**
 * Update highlights using the CSS Custom Highlight API.
 */
function updateHighlights() {
  if (!hasHighlightSupport) {
    return;
  }

  // Clear previous highlights
  CSS.highlights.clear();

  const query = searchQuery.value.toLowerCase();
  if (!query || query.length < 2) {
    return;
  }

  const container = virtualScrollRef.value?.$el;
  if (!container) {
    return;
  }

  const resultsRanges: Range[] = [];
  const currentRanges: Range[] = [];

  const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let currentNode = treeWalker.nextNode();

  const currentMatchIdx = matches.value[ currentMatchIndex.value ];

  while (currentNode) {
    const text = currentNode.textContent?.toLowerCase() || '';
    let start = text.indexOf(query);

    while (start !== -1) {
      const range = new Range();
      range.setStart(currentNode, start);
      range.setEnd(currentNode, start + query.length);

      const itemEl = (currentNode.parentElement as HTMLElement)?.closest('.virtual-scroll-item') as HTMLElement;
      const itemIndex = itemEl ? Number.parseInt(itemEl.dataset.index || '-1', 10) : -1;

      if (itemIndex === currentMatchIdx) {
        currentRanges.push(range);
      } else {
        resultsRanges.push(range);
      }

      start = text.indexOf(query, start + query.length);
    }
    currentNode = treeWalker.nextNode();
  }

  CSS.highlights.set('search-results', new Highlight(...resultsRanges));
  CSS.highlights.set('search-current', new Highlight(...currentRanges));
}

// Watch for changes that require re-highlighting
watch([
  () => scrollDetails.value?.items,
  searchQuery,
  currentMatchIndex,
], () => {
  if (hasHighlightSupport) {
    nextTick(updateHighlights);
  }
});

/**
 * Highlight fallback for browsers without Custom Highlight API.
 * Uses v-html to insert <mark> tags.
 */
function getHighlightedContent(text: string, query: string) {
  // Always return raw text during SSR or initial hydration to avoid mismatch
  if ((isMounted.value && hasHighlightSupport) || !query || query.length < 2) {
    return text;
  }
  const escapedQuery = query.replace(reEscape, '\\$&');
  const regex = new RegExp(`(${ escapedQuery })`, 'gi');
  return text.replace(regex, '<mark class="search-highlight-fallback">$1</mark>');
}

// Activate search (Ctrl+K)
function handleGlobalKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInputRef.value?.focus();
    searchInputRef.value?.select();
  }
}

onMounted(() => {
  isMounted.value = true;
  window.addEventListener('keydown', handleGlobalKeyDown);
  if (hasHighlightSupport) {
    updateHighlights();
  }

  if (currentMatchIndex.value !== -1) {
    nextTick(() => {
      scrollToMatch();
    });
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-4">Search & Highlight</span>
    </template>

    <template #description>
      Generic way to provide native search in virtualized content using data-layer searching and CSS Custom Highlight API.
      Triggered by (<kbd class="kbd">⌘</kbd>+<kbd class="kbd">K</kbd>).
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
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </template>

    <template #subtitle>
      High-performance search using CSS Custom Highlight API
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-x-4 gap-y-1 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Virtual Scrollbars</span>
          <input v-model="virtualScrollbar" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <div class="join bg-base-100 rounded-field border border-base-content/10">
          <label class="input input-ghost join-item grow">
            <div>
              <kbd class="kbd kbd-sm">⌘</kbd> + <kbd class="kbd kbd-sm">K</kbd>
            </div>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Type to search..."
              @keydown.enter="nextMatch"
            />
            <span class="badge badge-primary badge-sm">
              {{ currentMatchNumber }}/{{ matches.length }}
            </span>
          </label>
          <button
            class="btn btn-soft btn-primary btn-square join-item"
            :disabled="matches.length === 0"
            aria-label="Previous match"
            @click="prevMatch"
          >
            ↑
          </button>
          <button
            class="btn btn-soft btn-primary btn-square join-item"
            :disabled="matches.length === 0"
            aria-label="Next match"
            @click="nextMatch"
          >
            ↓
          </button>
        </div>
        <div class="text-sm opacity-50 italic">
          <template v-if="matches.length > 0">
            Found {{ matches.length }} matches. Use arrows or <kbd class="kbd">Enter</kbd> to navigate.
          </template>
          <template v-else>
            Try searching for <strong>Bingo</strong> or <strong>Ultimate</strong>
          </template>
        </div>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :ssr-range="ssrRange"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Search results"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div
          class="example-vertical-item example-vertical-item--fixed"
          :class="{ 'search-match-active bg-primary/10 ring-inset ring-1 ring-primary/30': index === matches[currentMatchIndex] }"
        >
          <span class="example-badge me-4" :class="{ 'badge-primary': index === matches[currentMatchIndex] }">
            #{{ index }}
          </span>
          <div class="text-sm @4xl:text-base" v-html="getHighlightedContent(item.text, searchQuery)" />
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          Only the visible window of a virtualized list exists in the DOM, so search cannot scan rendered content the way a browser search scans a document. Search the <em>data</em> instead, then reconcile the results with the virtual window. Two shapes cover most needs: <strong>filtering</strong>, where a computed subset replaces <code>:items</code> and the results become the whole list; and <strong>find-and-jump</strong>, where <code>:items</code> stays the full dataset, matches are stored as indices, and navigation moves the viewport with <code>scrollToIndex()</code>. Highlighting applies to whatever rows are mounted at the moment and is repainted as the window moves — the CSS Custom Highlight API does that without touching row markup.
        </p>

        <h3>1. Filter: replace :items with a computed subset</h3>
        <p>
          Derive the visible rows from the query with a <code>computed</code> and bind it to <code>:items</code>. Every keystroke yields a new array instance, which is the supported update path: the engine watches the identity and length of <code>:items</code>, re-initializes sizes, and re-reads the scroll offset after the DOM updates. Rows are positioned by index, so after a replacement the same pixel offset lands on the same index — which now holds a different record; when the filtered list is shorter than the current offset, the viewport clamps to the new end. Keep rows uniform (numeric <code>item-size</code>) so the offset math stays exact, and remember that the rendered <code>index</code> is a position in the filtered array, not in the original data — keep an id on each row when you need the source record. This shape fits search-as-filter UIs where the results are the list.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

import '@pdanpdan/virtual-scroll/style.css';

const query = ref('');
const rows = ref(
  Array.from({ length: 50_000 }, (_, i) => ({
    id: i,
    text: `Item #${ i } ${ i % 3 === 0 ? 'alpha' : i % 3 === 1 ? 'beta' : 'gamma' }`,
  })),
);

// Every keystroke produces a NEW filtered array. VirtualScroll watches the
// :items identity (and length), re-initializes sizes and re-reads the scroll
// offset, so passing a fresh array each time is the supported update path.
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q
    ? rows.value.filter((row) => row.text.toLowerCase().includes(q))
    : rows.value;
});
&lt;/script>

&lt;template>
  &lt;div class=&quot;page&quot;>
    &lt;input v-model=&quot;query&quot; type=&quot;search&quot; placeholder=&quot;Filter rows...&quot; />
    &lt;VirtualScroll class=&quot;list&quot; :items=&quot;filtered&quot;>
      &amp;lt;!-- Rows are keyed by index: after a filter the same pixel offset lands
           on the same index, which now holds a different record. -->
      &lt;template #item=&quot;{ index, item }&quot;>
        &lt;div class=&quot;row&quot;>{{ index }} - {{ item.text }}&lt;/div>
      &lt;/template>
    &lt;/VirtualScroll>
  &lt;/div>
&lt;/template>

&lt;style scoped>
.page { display: flex; flex-direction: column; gap: 0.5rem; }
.list { height: 480px; border: 1px solid oklch(50% 0 0 / 0.2); }
.row { box-sizing: border-box; height: 40px; display: flex; align-items: center; padding-inline: 1rem; }
&lt;/style>"
        />

        <h3>2. Find: keep the full dataset, navigate between matches</h3>
        <p>
          When matches must be found anywhere in the dataset while original numbering and positions stay put, keep <code>:items</code> untouched and compute matching indices over the data; per-row state and absolute indices then stay stable while the user walks the hits. Move the viewport with the exposed <code>scrollToIndex(row, col, options)</code> — vertical lists pass <code>null</code> for the column; <code>align: 'auto'</code> scrolls only when the row is offscreen, and the default <code>behavior</code> is already <code>'smooth'</code>. Enforce a minimum query length so single characters do not scan the whole dataset, and lowercase both sides for a case-insensitive match. On a query change, reset the cursor to the first match and jump to it.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

import '@pdanpdan/virtual-scroll/style.css';

const listRef = ref&lt;InstanceType&lt;typeof VirtualScroll> | null>(null);
const query = ref('');
const current = ref(-1); // index into `matches`
// matches = ORIGINAL indices into the full :items array (search the data,
// not the DOM - only the visible window is ever mounted).
const rows = ref(Array.from({ length: 50_000 }, (_, i) => ({
  id: i, text: `Item #${ i }${ i % 100 === 42 ? ' - ULTIMATE ANSWER' : '' }`,
})));
const matches = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (q.length &lt; 2) return [];
  const out: number[] = [];
  for (let i = 0; i &lt; rows.value.length; i++) if (rows.value[i]!.text.toLowerCase().includes(q)) out.push(i);
  return out;
});
function jump(step: 1 | -1) {
  if (matches.value.length === 0) return;
  current.value = (current.value + step + matches.value.length) % matches.value.length;
  listRef.value?.scrollToIndex(matches.value[current.value], null, { align: 'auto' }); // (row, col, options)
}
&lt;/script>

&lt;template>
  &lt;div class=&quot;page&quot;>
    &lt;div class=&quot;bar&quot;>
      &lt;input v-model=&quot;query&quot; type=&quot;search&quot; placeholder=&quot;Search...&quot; @keydown.enter=&quot;jump(1)&quot; />
      &lt;span>{{ matches.length ? current + 1 : 0 }}/{{ matches.length }}&lt;/span>
      &lt;button :disabled=&quot;!matches.length&quot; @click=&quot;jump(-1)&quot;>Prev&lt;/button> &lt;button :disabled=&quot;!matches.length&quot; @click=&quot;jump(1)&quot;>Next&lt;/button>
    &lt;/div>
    &lt;VirtualScroll ref=&quot;listRef&quot; class=&quot;list&quot; :items=&quot;rows&quot; :item-size=&quot;60&quot;>
      &lt;template #item=&quot;{ item, index }&quot;>
        &lt;div class=&quot;row&quot; :class=&quot;{ 'row--current': index === matches[current] }&quot;>
          #{{ index }} {{ item.text }}
        &lt;/div>
      &lt;/template>
    &lt;/VirtualScroll>
  &lt;/div>
&lt;/template>

&lt;style scoped>
.page { display: flex; flex-direction: column; gap: 0.5rem; }
.list { height: 480px; border: 1px solid oklch(50% 0 0 / 0.2); }
.row { box-sizing: border-box; height: 60px; display: flex; align-items: center; padding-inline: 1rem; }
.row--current { outline: 2px solid oklch(60% 0.2 25 / 0.7); outline-offset: -2px; }
&lt;/style>"
        />

        <h3>3. Highlight the rows that are actually mounted</h3>
        <p>
          A match becomes visible only after its row mounts, so highlight application must run against the live DOM of the mounted window. Walk the text nodes under the container root with a <code>TreeWalker</code>, turn each query occurrence into a <code>Range</code>, and register the ranges with the CSS Custom Highlight API under named highlights. Every virtualized row wrapper carries <code>data-index</code> and the class <code>.virtual-scroll-item</code>, which lets you classify a range as the current match versus the other results. Re-run the walk whenever the query or the current match changes, and whenever scrolling changes the mounted window (watch the rendered range exposed by the <code>@scroll</code> event); apply after <code>nextTick()</code>. Only mounted rows can produce ranges, so the pass is bounded by the window size, not the dataset size.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          line-numbers
          code="// CSS Custom Highlight API: paint-level marks that never touch row markup.
const supportsHighlight = typeof CSS !== 'undefined' &amp;&amp; 'highlights' in CSS;

export function applyHighlights(
  container: HTMLElement,
  query: string,
  currentMatchIndex: number | null,
) {
  if (!supportsHighlight) {
    return;
  }
  const q = query.trim().toLowerCase();
  CSS.highlights.clear();
  if (q.length &lt; 2) {
    return;
  }

  const results: Range[] = [];
  const current: Range[] = [];

  // Walk only the mounted text nodes. Each hit becomes a Range; the owning
  // row is identified through the data-index attribute every virtualized row
  // wrapper carries, so the active match can be styled differently.
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = (node.textContent ?? '').toLowerCase();
    let at = text.indexOf(q);
    while (at !== -1) {
      const range = new Range();
      range.setStart(node, at);
      range.setEnd(node, at + q.length);
      const row = (node.parentElement as HTMLElement | null)?.closest('.virtual-scroll-item');
      const rowIndex = row ? Number.parseInt(row.getAttribute('data-index') ?? '-1', 10) : -1;
      (rowIndex === currentMatchIndex ? current : results).push(range);
      at = text.indexOf(q, at + q.length);
    }
  }

  CSS.highlights.set('search-results', new Highlight(...results));
  CSS.highlights.set('search-current', new Highlight(...current));
}"
        />

        <h3>4. Style the marks and cover older engines</h3>
        <p>
          <code>::highlight()</code> rules apply at paint time, so matches are colored without inserting elements and rows do not re-render while scrolling. For engines without the Custom Highlight API, fall back to wrapping matches in a <code>&lt;mark&gt;</code> during row rendering: escape the query's regular-expression metacharacters, build a <code>RegExp</code>, and emit the highlighted HTML through <code>v-html</code>. Keep server and initial client markup identical — for example, render the raw text until the component has mounted — so hydration does not mismatch.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="css"
          code="/* ::highlight paints only the matched text inside the named Highlight
   object - no markup is inserted, so nothing re-renders on scroll. */
::highlight(search-results) {
  background-color: oklch(80% 0.1 230 / 0.55);
  color: inherit;
}

::highlight(search-current) {
  background-color: oklch(55% 0.2 25 / 0.85);
  color: white;
}

/* Fallback styling for engines without the Custom Highlight API: the row
   template then emits &amp;lt;mark class=&quot;search-hit&quot;> around matches instead. */
mark.search-hit {
  background-color: oklch(80% 0.1 230 / 0.55);
  color: inherit;
  border-radius: 2px;
}"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>

<style>
::highlight(search-results) {
  background-color: var(--color-primary);
  color: var(--color-primary-content);
}

::highlight(search-current) {
  background-color: var(--color-accent);
  color: var(--color-accent-content);
}

/* Fallback styling for older browsers */
.search-highlight-fallback {
  background-color: var(--color-primary);
  color: var(--color-primary-content);
  border-radius: 2px;
}

.search-match-active .search-highlight-fallback {
  background-color: var(--color-accent);
  color: var(--color-accent-content);
}
</style>
