<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';

import rawCode from './+Page.vue?raw';

interface DraggableItem {
  id: number;
  label: string;
  color: string;
}

const items = ref<DraggableItem[]>(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    label: `${ String.fromCharCode(65 + i % 26) } Item ${ i }`,
    color: `hsl(${ (i * 137.5) % 360 }, 70%, 60%)`,
  })),
);

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const draggedIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);
const virtualScrollRef = ref();
const scrollDetails = ref<ScrollDetails | null>(null);

let scrollInterval: ReturnType<typeof setInterval> | null = null;

function stopAutoScroll() {
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function startAutoScroll(direction: 'up' | 'down') {
  if (scrollInterval !== null) {
    return;
  }
  scrollInterval = setInterval(() => {
    if (!virtualScrollRef.value) {
      return;
    }
    const { scrollOffset } = virtualScrollRef.value.scrollDetails;
    const delta = direction === 'up' ? -10 : 10;
    virtualScrollRef.value.scrollToOffset(null, scrollOffset.y + delta, { behavior: 'auto' });
  }, 16);
}

/**
 * Handles the start of a drag operation.
 *
 * @param index - The index of the item being dragged.
 */
function handleDragStart(index: number) {
  draggedIndex.value = index;
}

/**
 * Handles an item being dragged over another item.
 *
 * @param index - The index of the item being dragged over.
 */
function handleDragOver(index: number, event: DragEvent) {
  dropTargetIndex.value = index;

  // Auto-scroll logic
  const container = (event.currentTarget as HTMLElement).closest('.virtual-scroll-container');
  if (container) {
    const rect = container.getBoundingClientRect();
    const threshold = 60;
    if (event.clientY < rect.top + threshold) {
      startAutoScroll('up');
    } else if (event.clientY > rect.bottom - threshold) {
      startAutoScroll('down');
    } else {
      stopAutoScroll();
    }
  }
}

/**
 * Handles the drop event to reorder the list.
 */
function handleDrop() {
  stopAutoScroll();
  if (draggedIndex.value !== null && dropTargetIndex.value !== null) {
    const list = [ ...items.value ];
    const [ draggedItem ] = list.splice(draggedIndex.value, 1);
    list.splice(dropTargetIndex.value, 0, draggedItem);
    items.value = list;
  }
  draggedIndex.value = null;
  dropTargetIndex.value = null;
}
</script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-5">Draggable List</span>
    </template>

    <template #description>
      Reorder items using native drag and drop. Virtualization maintains performance even during complex list mutations.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </template>

    <template #subtitle>
      Reorder virtualized items using native drag and drop
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      class="example-container"
      :items="items"
      :debug="debugMode"
      @scroll="(details) => scrollDetails = details"
    >
      <template #item="{ item, index }">
        <div
          role="button"
          tabindex="0"
          class="example-vertical-item py-2 outline-none focus-visible:bg-base-300"
          :class="{
            'opacity-30 scale-95': draggedIndex === index,
            'border-t-4 border-t-primary': dropTargetIndex === index && draggedIndex !== index,
          }"
          draggable="true"
          @dragstart="handleDragStart(index)"
          @dragover.prevent="handleDragOver(index, $event)"
          @drop="handleDrop"
          @dragend="draggedIndex = null; dropTargetIndex = null; stopAutoScroll()"
          @keydown.enter.prevent
          @keydown.space.prevent
        >
          <div
            class="size-10 rounded-lg mr-4 flex items-center justify-center text-white font-bold shadow-sm"
            :style="{ backgroundColor: item.color }"
          >
            {{ item.label[0] }}
          </div>
          <div>
            <div class="font-bold text-sm">{{ item.label }}</div>
            <div class="text-xs opacity-40 font-mono">ID: {{ item.id }}</div>
          </div>
          <div class="ml-auto cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
