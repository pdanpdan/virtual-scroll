<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

// CSS Custom Highlight API support check and types
const hasHighlightSupport = typeof CSS !== 'undefined' && 'highlights' in CSS;

const itemCount = ref(10000);
const searchQuery = ref('Ultimate');
const searchInputRef = ref<HTMLInputElement | null>(null);
const currentMatchIndex = ref(-1);
const virtualScrollRef = ref();
const scrollDetails = ref<ScrollDetails | null>(null);
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

currentMatchIndex.value = matches.value.length > 0 ? 0 : -1;

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

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}

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
  const escapedQuery = query.replace(/[.*+?^${}()|[\\]/g, '\\$&');
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
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-1">Search & Highlight</span>
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
        class="example-icon example-icon--group-1"
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
          <div class="text-sm md:text-base" v-html="getHighlightedContent(item.text, searchQuery)" />
        </div>
      </template>
    </VirtualScroll>
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
