<script setup lang="ts">
import type { DiffRow } from './diff-data';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';
import changedRaw from './changed.txt?raw';
import { diffData as initialDiffData } from './diff-data';
import originalRaw from './original.txt?raw';

const originalLines = originalRaw.split('\n');
const changedLines = changedRaw.split('\n');

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
      <span class="example-title example-title--group-2">Git Diff</span>
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
        class="example-icon example-icon--group-2"
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
        :item-count="itemCount"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <div class="diff-container flex flex-col border border-base-300 rounded-lg overflow-hidden">
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
          @scroll="onScroll"
        >
          <template #item="{ item, index }">
            <button v-if="item.type === 'collapsed'" type="button" class="diff-row diff-row--collapsed bg-info/20 hover:bg-info/30 appearance-none flex items-center" @click="expandRegion(index)">
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

            <div v-else class="diff-row flex divide-x divide-base-300 hover:bg-base-200/50">
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
                <div class="diff-content flex-1 px-2 whitespace-pre overflow-hidden">
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
                <div class="diff-content flex-1 px-2 whitespace-pre overflow-hidden">
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
    </div>
  </ExampleContainer>
</template>

<style scoped>
:deep(.virtual-scroll-item) {
  container-type: inline-size;
}

.diff-row {
  line-height: 20px;
  width: 100cqw;
}

.diff-side {
  min-width: 0;
}

.diff-content {
  text-overflow: clip;
}
</style>
