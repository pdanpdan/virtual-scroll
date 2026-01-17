<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions } from '@pdanpdan/virtual-scroll';

import { ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  itemCount: number;
  direction?: string;
  columnCount?: number;
  columnWidth?: number;
  itemSize?: number;
  bufferBefore?: number;
  bufferAfter?: number;
  stickyHeader?: boolean | undefined;
  stickyFooter?: boolean | undefined;
}>(), {
  direction: 'vertical',
  stickyHeader: undefined,
  stickyFooter: undefined,
});

const emit = defineEmits<{
  (e: 'update:itemCount', value: number): void;
  (e: 'update:columnCount', value: number): void;
  (e: 'update:columnWidth', value: number): void;
  (e: 'update:itemSize', value: number): void;
  (e: 'update:bufferBefore', value: number): void;
  (e: 'update:bufferAfter', value: number): void;
  (e: 'update:stickyHeader', value: boolean): void;
  (e: 'update:stickyFooter', value: boolean): void;
  (e: 'scrollToIndex', row: number | null, col: number | null, align: ScrollAlignment | ScrollAlignmentOptions): void;
  (e: 'scrollToOffset', x: number | null, y: number | null): void;
  (e: 'refresh'): void;
}>();

const localItemCount = ref(props.itemCount);
const localItemSize = ref(props.itemSize ?? 50);
const localColumnCount = ref(props.columnCount ?? 0);
const localColumnWidth = ref(props.columnWidth ?? 0);
const localBufferBefore = ref(props.bufferBefore ?? 5);
const localBufferAfter = ref(props.bufferAfter ?? 5);
const localStickyHeader = ref(props.stickyHeader ?? false);
const localStickyFooter = ref(props.stickyFooter ?? false);

const targetIndex = ref(0);
const targetColumn = ref(0);
const targetOffsetX = ref(0);
const targetOffsetY = ref(0);
const scrollAlignX = ref<ScrollAlignment>('start');
const scrollAlignY = ref<ScrollAlignment>('start');

function updateCounts() {
  emit('update:itemCount', localItemCount.value);
  emit('update:itemSize', localItemSize.value);
  if (props.direction === 'both') {
    emit('update:columnCount', localColumnCount.value);
    emit('update:columnWidth', localColumnWidth.value);
  }
}

watch(localBufferBefore, (val) => emit('update:bufferBefore', val));
watch(localBufferAfter, (val) => emit('update:bufferAfter', val));
watch(localStickyHeader, (val) => emit('update:stickyHeader', val));
watch(localStickyFooter, (val) => emit('update:stickyFooter', val));

function handleScrollToIndex() {
  const align = { x: scrollAlignX.value, y: scrollAlignY.value };
  if (props.direction === 'both') {
    emit('scrollToIndex', targetIndex.value, targetColumn.value, align);
  } else if (props.direction === 'horizontal') {
    emit('scrollToIndex', null, targetColumn.value, align);
  } else {
    emit('scrollToIndex', targetIndex.value, null, align);
  }
}

function handleScrollToOffset() {
  if (props.direction === 'both') {
    emit('scrollToOffset', targetOffsetX.value, targetOffsetY.value);
  } else if (props.direction === 'horizontal') {
    emit('scrollToOffset', targetOffsetX.value, null);
  } else {
    emit('scrollToOffset', null, targetOffsetY.value);
  }
}
</script>

<template>
  <ul class="max-sm:w-full min-w-80 list bg-base-300 rounded-box shadow-md text-sm pointer-events-auto">
    <li class="list-row py-0 items-center">
      <div class="list-col-grow flex flex-wrap gap-3 items-center">
        <div class="py-4 opacity-60 tracking-wide uppercase">Controls</div>

        <div class="grow" />

        <button class="btn btn-sm btn-soft btn-warning w-20 ml-2" @click="emit('refresh')">Refresh</button>
      </div>
    </li>

    <li class="list-row py-2">
      <div class="list-col-grow flex flex-wrap gap-3 items-center">
        <label class="floating-label p-0">
          <span>Items #</span>
          <input v-model.number="localItemCount" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
        </label>

        <label class="floating-label p-0">
          <span>Item Size</span>
          <input v-model.number="localItemSize" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
        </label>

        <template v-if="direction === 'both'">
          <div class="w-full sm:hidden" />

          <label class="floating-label p-0">
            <span>Cols #</span>
            <input v-model.number="localColumnCount" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
          </label>
          <label class="floating-label p-0">
            <span>Col Width</span>
            <input v-model.number="localColumnWidth" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
          </label>
        </template>

        <div class="grow" />

        <button class="btn btn-sm btn-soft w-20" @click="updateCounts">Update</button>
      </div>
    </li>

    <li v-if="bufferBefore !== undefined || bufferAfter !== undefined || stickyHeader !== undefined || stickyFooter !== undefined" class="list-row py-2">
      <div class="list-col-grow flex flex-wrap gap-3 items-center">
        <label v-if="bufferBefore !== undefined" class="floating-label p-0">
          <span>Buffer Pre</span>
          <input v-model.number="localBufferBefore" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
        </label>
        <label v-if="bufferAfter !== undefined" class="floating-label p-0">
          <span>Buffer Post</span>
          <input v-model.number="localBufferAfter" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
        </label>

        <div v-if="(bufferBefore !== undefined || bufferAfter !== undefined) && (stickyHeader !== undefined || stickyFooter !== undefined)" class="w-full sm:hidden" />

        <label v-if="stickyHeader !== undefined" class="flex gap-2 items-center pl-1 cursor-pointer select-none">
          <input v-model="localStickyHeader" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
          <span>Sticky Header</span>
        </label>
        <label v-if="stickyFooter !== undefined" class="flex gap-2 items-center pl-1 cursor-pointer select-none">
          <input v-model="localStickyFooter" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
          <span>Sticky Footer</span>
        </label>
      </div>
    </li>

    <li class="list-row py-2">
      <div class="list-col-grow flex flex-wrap gap-3 items-center">
        <label v-if="direction !== 'horizontal'" class="floating-label p-0">
          <span>{{ direction === 'both' ? 'Row' : 'Item' }} #</span>
          <input v-model.number="targetIndex" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
        </label>

        <label v-if="direction !== 'horizontal'" class="floating-label p-0">
          <span>Align Y</span>
          <select v-model="scrollAlignY" class="select select-bordered select-sm w-22">
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="auto">Auto</option>
          </select>
        </label>

        <div v-if="direction === 'both'" class="w-full sm:hidden" />

        <label v-if="direction !== 'vertical'" class="floating-label p-0">
          <span>{{ direction === 'both' ? 'Col' : 'Item' }} #</span>
          <input v-model.number="targetColumn" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
        </label>

        <label v-if="direction !== 'vertical'" class="floating-label p-0">
          <span>Align X</span>
          <select v-model="scrollAlignX" class="select select-bordered select-sm w-22">
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
            <option value="auto">Auto</option>
          </select>
        </label>

        <div class="grow" />

        <button class="btn btn-sm btn-soft w-20" @click="handleScrollToIndex">Scroll #</button>
      </div>
    </li>

    <li class="list-row py-2">
      <div class="list-col-grow flex flex-wrap gap-3 items-center justify-between">
        <label v-if="direction !== 'horizontal'" class="floating-label p-0">
          <span>{{ direction === 'both' ? 'Y' : 'Offset' }} (px)</span>
          <input v-model.number="targetOffsetY" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
        </label>

        <label v-if="direction !== 'vertical'" class="floating-label p-0">
          <span>{{ direction === 'both' ? 'X' : 'Offset' }} (px)</span>
          <input v-model.number="targetOffsetX" type="number" placeholder=" " class="input input-bordered input-sm text-right w-22" />
        </label>

        <div class="grow" />

        <button class="btn btn-sm btn-soft w-20" @click="handleScrollToOffset">Scroll px</button>
      </div>
    </li>
  </ul>
</template>
