<script setup lang="ts" generic="T">
import type { MasonryRenderedItem, MasonryScrollDetails, VirtualScrollbarProps, VirtualScrollMasonryComponentProps, VirtualScrollMasonryProps } from '../types';

import { computed, onBeforeUnmount, ref, useId, watch } from 'vue';

import { useVirtualScrollMasonry } from '../composables/useVirtualScrollMasonry';
import { DEFAULT_MASONRY_GAP, DEFAULT_MASONRY_MAX_COLUMNS, DEFAULT_MASONRY_MIN_COLUMNS, DEFAULT_MASONRY_SEGMENT_SIZE, DEFAULT_MASONRY_TARGET_COLUMN_WIDTH } from '../types';
import VirtualScrollbar from './VirtualScrollbar.vue';

/**
 * Masonry grid virtualization in a single native scroll container.
 *
 * Cards are absolutely positioned from a canonical column layout (see
 * {@link useVirtualScrollMasonry}) and only the window around the current
 * scroll position is mounted, so the DOM stays bounded no matter the dataset
 * size or how far the user jumps. Column count re-flows responsively from the
 * container width and the topmost visible card stays pinned on relayout.
 *
 * In the default canonical mode heights come exclusively from the required
 * `itemHeight` oracle: give every card exactly the height the oracle returned
 * (reserve media space with `aspect-ratio` etc.) and keep the oracle a pure
 * function of `(item, index, columnWidth)`. With `measuredHeights`, mounted
 * cards are measured instead and the oracle only seeds the pre-measure
 * estimate.
 */
const props = withDefaults(defineProps<VirtualScrollMasonryComponentProps<T>>(), {
  targetColumnWidth: DEFAULT_MASONRY_TARGET_COLUMN_WIDTH,
  minColumns: DEFAULT_MASONRY_MIN_COLUMNS,
  maxColumns: DEFAULT_MASONRY_MAX_COLUMNS,
  gap: DEFAULT_MASONRY_GAP,
  segmentSize: DEFAULT_MASONRY_SEGMENT_SIZE,
  virtualScrollbar: true,
  debug: false,
  measuredHeights: false,
});

const emit = defineEmits<{
  (e: 'scroll', details: MasonryScrollDetails<T>): void;
}>();

const containerId = computed(() => `vs-masonry-${ useId() }`);

const hostRef = ref<HTMLElement | null>(null);

const virtualScrollProps = computed<VirtualScrollMasonryProps<T>>(() => ({
  items: props.items,
  itemHeight: props.itemHeight,
  targetColumnWidth: props.targetColumnWidth,
  minColumns: props.minColumns,
  maxColumns: props.maxColumns,
  gap: props.gap,
  segmentSize: props.segmentSize,
  measuredHeights: props.measuredHeights === true,
  hostRef: hostRef.value,
}));

const {
  renderedCards,
  scrollDetails,
  columns,
  columnWidth,
  totalHeight,
  totalHeightExact,
  scrollToIndex,
  scrollToOffset,
  refresh,
  applyMeasurements,
  internalState,
} = useVirtualScrollMasonry(virtualScrollProps);

watch(scrollDetails, (details) => {
  emit('scroll', details);
});

const containerRole = computed(() => (props.ariaLabel || props.ariaLabelledby) ? 'region' : 'none');
const rootAriaProps = computed(() => ({
  'aria-label': props.ariaLabel,
  'aria-labelledby': props.ariaLabelledby,
}));

const wrapperRole = computed(() => props.role ?? 'list');

const effectiveItemRole = computed(() => {
  if (props.itemRole) {
    return props.itemRole;
  }
  if (wrapperRole.value === 'grid') {
    return 'row';
  }
  if (wrapperRole.value === 'tree') {
    return 'treeitem';
  }
  if (wrapperRole.value === 'listbox') {
    return 'option';
  }
  if (wrapperRole.value === 'menu') {
    return 'menuitem';
  }
  return 'listitem';
});

const containerClasses = computed(() => ({
  'virtual-scroll--hide-scrollbar': props.virtualScrollbar === true,
  'virtual-scroll--debug': props.debug,
}));

const wrapperStyle = computed(() => ({
  inlineSize: '100%',
  blockSize: `${ totalHeight.value }px`,
}));

function getCardStyle(card: MasonryRenderedItem<T>): Record<string, string> {
  // Measured mode lets cards size to their content: the engine height becomes
  // a minimum (seeding the pre-measurement box) and the ResizeObserver reads
  // the real box afterwards.
  const style: Record<string, string> = {
    width: `${ card.width }px`,
    transform: `translate(${ card.x }px, ${ card.y }px)`,
  };
  style[ props.measuredHeights === true ? 'minHeight' : 'height' ] = `${ card.height }px`;
  return style;
}
// ---------------------------------- measurement wiring ----------------------------------
let measureObserver: ResizeObserver | null = null;
const measuredElements = new Map<number, Element>();
/** Lazily created per-component observer for every mounted card element. */
function ensureMeasureObserver(): ResizeObserver | null {
  // v8 ignore start -- jsdom suites always provide a window; SSR never mounts cards
  if (typeof window === 'undefined') {
    return null;
  }
  // v8 ignore stop
  if (!measureObserver) {
    measureObserver = new ResizeObserver((entries) => {
      const updates: Array<{ index: number; height: number; }> = [];
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const index = Number(target.dataset.index);
        if (!Number.isInteger(index) || index < 0) {
          continue;
        }
        let blockSize = entry.contentRect.height;
        if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
          blockSize = entry.borderBoxSize[ 0 ]!.blockSize;
        } else {
          // Older browsers / non-borderBox entries: read the rendered box.
          blockSize = target.offsetHeight;
        }
        if (Number.isFinite(blockSize)) {
          updates.push({ index, height: blockSize });
        }
      }
      if (updates.length > 0) {
        applyMeasurements(updates);
      }
    });
  }
  return measureObserver;
}
function setCardRef(el: unknown, index: number): void {
  if (props.measuredHeights !== true) {
    return;
  }
  const element = el as Element | null;
  const observer = ensureMeasureObserver();
  // v8 ignore next -- without a window no cards mount, so the observer exists here
  if (!observer) {
    return;
  }
  const previous = measuredElements.get(index);
  if (element) {
    if (previous !== element) {
      observer.observe(element);
      measuredElements.set(index, element);
    }
  } else if (previous) {
    observer.unobserve(previous);
    measuredElements.delete(index);
  }
}
onBeforeUnmount(() => {
  measureObserver?.disconnect();
  measureObserver = null;
  measuredElements.clear();
});

const scrollbarViewportStyle = computed(() => ({
  inlineSize: `${ internalState.viewportWidth.value }px`,
  blockSize: `${ internalState.viewportHeight.value }px`,
}));

function handleScrollbarScrollToOffset(offset: number): void {
  const scrollableRange = totalHeight.value - internalState.viewportHeight.value;
  if (offset >= scrollableRange - 0.5) {
    scrollToOffset(Number.POSITIVE_INFINITY);
  } else {
    scrollToOffset(offset);
  }
}

const scrollbarProps = computed<VirtualScrollbarProps | null>(() => {
  if (props.virtualScrollbar !== true) {
    return null;
  }
  const viewport = internalState.viewportHeight.value;
  const total = totalHeight.value;
  if (total <= viewport) {
    return null;
  }
  return {
    axis: 'vertical',
    totalSize: total,
    position: internalState.scrollY.value,
    viewportSize: viewport,
    containerId: containerId.value,
    scrollToOffset: handleScrollbarScrollToOffset,
    ariaLabel: 'Vertical scroll',
  };
});

defineExpose({
  scrollDetails,
  columns,
  columnWidth,
  totalHeight,
  totalHeightExact,
  scrollToIndex,
  scrollToOffset,
  refresh,
});
</script>

<template>
  <div
    :id="containerId"
    ref="hostRef"
    class="virtual-scroll-container virtual-scroll--vertical virtual-scroll--masonry"
    :class="containerClasses"
    tabindex="0"
    :role="containerRole"
    v-bind="rootAriaProps"
  >
    <div
      v-if="scrollbarProps"
      class="virtual-scroll-scrollbar-container"
      aria-hidden="true"
    >
      <div
        class="virtual-scroll-scrollbar-viewport"
        :style="scrollbarViewportStyle"
      >
        <VirtualScrollbar v-bind="scrollbarProps" />
      </div>
    </div>

    <div
      class="virtual-scroll-wrapper"
      :style="wrapperStyle"
      :role="wrapperRole"
    >
      <div
        v-for="card in renderedCards"
        :key="card.index"
        :ref="(el: unknown) => setCardRef(el, card.index)"
        :data-index="card.index"
        class="virtual-scroll-item"
        :class="{ 'virtual-scroll--debug': debug }"
        :style="getCardStyle(card)"
        :role="effectiveItemRole"
      >
        <slot
          name="item"
          :item="card.item"
          :index="card.index"
          :column="card.column"
          :x="card.x"
          :y="card.y"
          :width="card.width"
          :height="card.height"
        />
        <div
          v-if="debug"
          class="virtual-scroll-debug-info"
        >
          #{{ card.index }} ({{ Math.round(card.x) }}, {{ Math.round(card.y) }})
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@layer components {
  .virtual-scroll-container.virtual-scroll--masonry {
    position: relative;
    block-size: 100%;
    inline-size: 100%;
    outline-offset: 1px;
    overflow-anchor: none;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    scrollbar-gutter: stable;

    &.virtual-scroll--hide-scrollbar {
      scrollbar-color: transparent transparent;

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: transparent;
      }
    }
  }

  .virtual-scroll-scrollbar-container {
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 100%;
    block-size: 0;
    z-index: 30;
    pointer-events: none;
    overflow: visible;
  }

  .virtual-scroll-scrollbar-viewport {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    pointer-events: none;
  }

  .virtual-scroll-wrapper {
    contain: layout;
    position: relative;

    :where(& > .virtual-scroll-item) {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
    }
  }

  .virtual-scroll-item {
    display: grid;
    box-sizing: border-box;
    will-change: transform;

    &:where(.virtual-scroll--debug) {
      outline: 1px dashed rgba(255, 0, 0, 0.5);
      background-color: rgba(255, 0, 0, 0.05);

      &:where(:hover) {
        background-color: rgba(255, 0, 0, 0.1);
        z-index: 100;
      }
    }
  }

  .virtual-scroll-debug-info {
    position: absolute;
    inset-block-start: 2px;
    inset-inline-end: 2px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 100;
    font-family: monospace;
  }
}
</style>
