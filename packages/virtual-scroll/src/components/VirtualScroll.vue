<script setup lang="ts" generic="T">
import type {
  RenderedItem,
  ScrollAlignment,
  ScrollAlignmentOptions,
  ScrollDetails,
  VirtualScrollProps,
} from '../types';
import type { VNodeChild } from 'vue';

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import {
  DEFAULT_ITEM_SIZE,
  useVirtualScroll,
} from '../composables/useVirtualScroll';
import { isWindowLike } from '../utils/scroll';
import { calculateItemStyle } from '../utils/virtual-scroll-logic';

export interface Props<T = unknown> {
  /**
   * Array of items to be virtualized.
   * Required.
   */
  items: T[];

  /**
   * Fixed size of each item (in pixels) or a function that returns the size of an item.
   * Pass 0, null or undefined for dynamic size detection via ResizeObserver.
   * @default 40
   */
  itemSize?: number | ((item: T, index: number) => number) | null;

  /**
   * Direction of the scroll.
   * - 'vertical': Standard vertical list.
   * - 'horizontal': Standard horizontal list.
   * - 'both': Grid mode virtualizing both rows and columns.
   * @default 'vertical'
   */
  direction?: 'vertical' | 'horizontal' | 'both';

  /**
   * Number of items to render before the visible viewport.
   * Useful for smoother scrolling and keyboard navigation.
   * @default 5
   */
  bufferBefore?: number;

  /**
   * Number of items to render after the visible viewport.
   * @default 5
   */
  bufferAfter?: number;

  /**
   * The scrollable container element or window.
   * If not provided, the host element (root of VirtualScroll) is used.
   * @default hostRef
   */
  container?: HTMLElement | Window | null;

  /**
   * Range of items to render during Server-Side Rendering.
   * When provided, these items will be rendered in-flow before hydration.
   * @see SSRRange
   */
  ssrRange?: {
    /** First row index to render. */
    start: number;
    /** Last row index to render (exclusive). */
    end: number;
    /** First column index to render (for grid mode). */
    colStart?: number;
    /** Last column index to render (exclusive, for grid mode). */
    colEnd?: number;
  };

  /**
   * Number of columns for bidirectional (grid) scroll.
   * Only applicable when direction="both".
   * @default 0
   */
  columnCount?: number;

  /**
   * Fixed width of columns (in pixels), an array of widths, or a function for column widths.
   * Pass 0, null or undefined for dynamic width detection via ResizeObserver.
   * Only applicable when direction="both".
   * @default 100
   */
  columnWidth?: number | number[] | ((index: number) => number) | null;

  /**
   * The HTML tag to use for the root container.
   * @default 'div'
   */
  containerTag?: string;

  /**
   * The HTML tag to use for the items wrapper.
   * Useful for <table> integration (e.g. 'tbody').
   * @default 'div'
   */
  wrapperTag?: string;

  /**
   * The HTML tag to use for each item.
   * Useful for <table> integration (e.g. 'tr').
   * @default 'div'
   */
  itemTag?: string;

  /**
   * Additional padding at the start of the scroll container (top or left).
   * Can be a number (applied to current direction) or an object with x/y.
   * @default 0
   */
  scrollPaddingStart?: number | { x?: number; y?: number; };

  /**
   * Additional padding at the end of the scroll container (bottom or right).
   * @default 0
   */
  scrollPaddingEnd?: number | { x?: number; y?: number; };

  /**
   * Whether the content in the 'header' slot is sticky.
   * If true, the header size is measured and accounted for in scroll padding.
   * @default false
   */
  stickyHeader?: boolean;

  /**
   * Whether the content in the 'footer' slot is sticky.
   * @default false
   */
  stickyFooter?: boolean;

  /**
   * Gap between items in pixels (vertical gap in vertical/grid mode, horizontal gap in horizontal mode).
   * @default 0
   */
  gap?: number;

  /**
   * Gap between columns in pixels. Only applicable when direction="both" or "horizontal".
   * @default 0
   */
  columnGap?: number;

  /**
   * Indices of items that should stick to the top/start of the viewport.
   * Supports iOS-style pushing effect where the next sticky item pushes the previous one.
   * @default []
   */
  stickyIndices?: number[];

  /**
   * Distance from the end of the scrollable area (in pixels) to trigger the 'load' event.
   * @default 200
   */
  loadDistance?: number;

  /**
   * Whether items are currently being loaded.
   * Prevents multiple 'load' events from triggering and shows the 'loading' slot.
   * @default false
   */
  loading?: boolean;

  /**
   * Whether to automatically restore and maintain scroll position when items are prepended to the list.
   * Perfect for chat applications.
   * @default false
   */
  restoreScrollOnPrepend?: boolean;

  /**
   * Initial scroll index to jump to immediately after mount.
   */
  initialScrollIndex?: number;

  /**
   * Alignment for the initial scroll index.
   * @default 'start'
   * @see ScrollAlignment
   */
  initialScrollAlign?: ScrollAlignment | ScrollAlignmentOptions;

  /**
   * Default size for items before they are measured by ResizeObserver.
   * Only used when itemSize is dynamic.
   * @default 40
   */
  defaultItemSize?: number;

  /**
   * Default width for columns before they are measured by ResizeObserver.
   * Only used when columnWidth is dynamic.
   * @default 100
   */
  defaultColumnWidth?: number;

  /**
   * Whether to show debug information (visible offsets and indices) over items.
   * @default false
   */
  debug?: boolean;
}

const props = withDefaults(defineProps<Props<T>>(), {
  direction: 'vertical',
  bufferBefore: 5,
  bufferAfter: 5,
  columnCount: 0,
  containerTag: 'div',
  wrapperTag: 'div',
  itemTag: 'div',
  scrollPaddingStart: 0,
  scrollPaddingEnd: 0,
  stickyHeader: false,
  stickyFooter: false,
  gap: 0,
  columnGap: 0,
  stickyIndices: () => [],
  loadDistance: 200,
  loading: false,
  restoreScrollOnPrepend: false,
  debug: false,
});

const emit = defineEmits<{
  (e: 'scroll', details: ScrollDetails<T>): void;
  (e: 'load', direction: 'vertical' | 'horizontal'): void;
  (e: 'visibleRangeChange', range: { start: number; end: number; colStart: number; colEnd: number; }): void;
}>();

const slots = defineSlots<{
  /**
   * Content rendered at the top of the scrollable area.
   * Can be made sticky using the `stickyHeader` prop.
   */
  header?: (props: Record<string, never>) => VNodeChild;

  /**
   * Scoped slot for rendering each individual item.
   */
  item?: (props: {
    /** The original data item from the `items` array. */
    item: T;
    /** The original index of the item in the `items` array. */
    index: number;
    /**
     * Information about the current visible range of columns (for grid mode).
     * @see ColumnRange
     */
    columnRange: {
      /** Index of the first rendered column. */
      start: number;
      /** Index of the last rendered column (exclusive). */
      end: number;
      /** Pixel offset from the start of the row to the first rendered cell. */
      padStart: number;
      /** Pixel offset from the last rendered cell to the end of the row. */
      padEnd: number;
    };
    /**
     * Helper function to get the width of a specific column.
     * Useful for setting consistent widths in grid mode.
     */
    getColumnWidth: (index: number) => number;
    /** Whether this item is configured to be sticky via `stickyIndices`. */
    isSticky?: boolean | undefined;
    /** Whether this item is currently in a sticky state (stuck at the top/start). */
    isStickyActive?: boolean | undefined;
  }) => VNodeChild;

  /**
   * Content shown at the end of the list when the `loading` prop is true.
   * Also prevents additional 'load' events from triggering while visible.
   */
  loading?: (props: Record<string, never>) => VNodeChild;

  /**
   * Content rendered at the bottom of the scrollable area.
   * Can be made sticky using the `stickyFooter` prop.
   */
  footer?: (props: Record<string, never>) => VNodeChild;
}>();

const hostRef = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const footerRef = ref<HTMLElement | null>(null);
const itemRefs = new Map<number, HTMLElement>();

const measuredPaddingStart = ref(0);
const measuredPaddingEnd = ref(0);

const isHeaderFooterInsideContainer = computed(() => {
  const container = props.container === undefined
    ? hostRef.value
    : props.container;

  return container === hostRef.value
    || (typeof window !== 'undefined' && (container === window || container === null));
});

const virtualScrollProps = computed(() => {
  const pStart = props.scrollPaddingStart;
  const pEnd = props.scrollPaddingEnd;

  /* Trigger re-evaluation on items array mutations */
  // eslint-disable-next-line ts/no-unused-expressions
  props.items.length;

  const startX = typeof pStart === 'object'
    ? (pStart.x || 0)
    : ((props.direction === 'horizontal' || props.direction === 'both') ? (pStart || 0) : 0);
  const startY = typeof pStart === 'object'
    ? (pStart.y || 0)
    : ((props.direction === 'vertical' || props.direction === 'both') ? (pStart || 0) : 0);

  const endX = typeof pEnd === 'object'
    ? (pEnd.x || 0)
    : ((props.direction === 'horizontal' || props.direction === 'both') ? (pEnd || 0) : 0);
  const endY = typeof pEnd === 'object'
    ? (pEnd.y || 0)
    : ((props.direction === 'vertical' || props.direction === 'both') ? (pEnd || 0) : 0);

  return {
    items: props.items,
    itemSize: props.itemSize,
    direction: props.direction,
    bufferBefore: props.bufferBefore,
    bufferAfter: props.bufferAfter,
    container: props.container === undefined
      ? hostRef.value
      : props.container,
    hostElement: wrapperRef.value,
    ssrRange: props.ssrRange,
    columnCount: props.columnCount,
    columnWidth: props.columnWidth,
    scrollPaddingStart: {
      x: startX,
      y: startY + (props.stickyHeader && isHeaderFooterInsideContainer.value ? measuredPaddingStart.value : 0),
    },
    scrollPaddingEnd: {
      x: endX,
      y: endY + (props.stickyFooter && isHeaderFooterInsideContainer.value ? measuredPaddingEnd.value : 0),
    },
    gap: props.gap,
    columnGap: props.columnGap,
    stickyIndices: props.stickyIndices,
    loadDistance: props.loadDistance,
    loading: props.loading,
    restoreScrollOnPrepend: props.restoreScrollOnPrepend,
    initialScrollIndex: props.initialScrollIndex,
    initialScrollAlign: props.initialScrollAlign,
    defaultItemSize: props.defaultItemSize,
    defaultColumnWidth: props.defaultColumnWidth,
    debug: props.debug,
  } as VirtualScrollProps<T>;
});

const {
  isHydrated,
  columnRange,
  renderedItems,
  scrollDetails,
  totalHeight,
  totalWidth,
  getColumnWidth,
  scrollToIndex,
  scrollToOffset,
  updateHostOffset,
  updateItemSizes,
  refresh: coreRefresh,
  stopProgrammaticScroll,
} = useVirtualScroll(virtualScrollProps);

/**
 * Resets all dynamic measurements and re-initializes from props.
 * Also triggers manual re-measurement of all currently rendered items.
 */
function refresh() {
  coreRefresh();
  nextTick(() => {
    const updates: { index: number; inlineSize: number; blockSize: number; element?: HTMLElement; }[] = [];

    for (const [ index, el ] of itemRefs.entries()) {
      if (el) {
        updates.push({
          index,
          inlineSize: el.offsetWidth,
          blockSize: el.offsetHeight,
          element: el,
        });
      }
    }

    if (updates.length > 0) {
      updateItemSizes(updates);
    }
  });
}

// Watch for scroll details and emit event
watch(scrollDetails, (details, oldDetails) => {
  if (!isHydrated.value) {
    return;
  }
  emit('scroll', details);

  if (
    !oldDetails
    || details.range.start !== oldDetails.range.start
    || details.range.end !== oldDetails.range.end
    || details.columnRange.start !== oldDetails.columnRange.start
    || details.columnRange.end !== oldDetails.columnRange.end
  ) {
    emit('visibleRangeChange', {
      start: details.range.start,
      end: details.range.end,
      colStart: details.columnRange.start,
      colEnd: details.columnRange.end,
    });
  }

  if (props.loading) {
    return;
  }

  // vertical or both
  if (props.direction !== 'horizontal') {
    const remaining = details.totalSize.height - (details.scrollOffset.y + details.viewportSize.height);
    if (remaining <= props.loadDistance) {
      emit('load', 'vertical');
    }
  }
  // horizontal or both
  if (props.direction !== 'vertical') {
    const remaining = details.totalSize.width - (details.scrollOffset.x + details.viewportSize.width);
    if (remaining <= props.loadDistance) {
      emit('load', 'horizontal');
    }
  }
});

watch(isHydrated, (hydrated) => {
  if (hydrated) {
    emit('visibleRangeChange', {
      start: scrollDetails.value.range.start,
      end: scrollDetails.value.range.end,
      colStart: scrollDetails.value.columnRange.start,
      colEnd: scrollDetails.value.columnRange.end,
    });
  }
}, { once: true });

const hostResizeObserver = typeof window === 'undefined'
  ? null
  : new ResizeObserver(updateHostOffset);

const itemResizeObserver = typeof window === 'undefined'
  ? null
  : new ResizeObserver((entries) => {
    const updates: { index: number; inlineSize: number; blockSize: number; element?: HTMLElement; }[] = [];

    for (const entry of entries) {
      const target = entry.target as HTMLElement;
      const index = Number(target.dataset.index);
      const colIndex = target.dataset.colIndex;

      let inlineSize = entry.contentRect.width;
      let blockSize = entry.contentRect.height;

      if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
        inlineSize = entry.borderBoxSize[ 0 ]!.inlineSize;
        blockSize = entry.borderBoxSize[ 0 ]!.blockSize;
      } else {
        // Fallback for older browsers or if borderBoxSize is missing
        inlineSize = target.offsetWidth;
        blockSize = target.offsetHeight;
      }

      if (colIndex !== undefined) {
        // It's a cell measurement. row index is not strictly needed for column width.
        // We use -1 as a placeholder for row index if it's a cell measurement.
        updates.push({ index: -1, inlineSize, blockSize, element: target });
      } else if (!Number.isNaN(index)) {
        updates.push({ index, inlineSize, blockSize, element: target });
      }
    }

    if (updates.length > 0) {
      updateItemSizes(updates);
    }
  });

const extraResizeObserver = typeof window === 'undefined'
  ? null
  : new ResizeObserver(() => {
    measuredPaddingStart.value = headerRef.value?.offsetHeight || 0;
    measuredPaddingEnd.value = footerRef.value?.offsetHeight || 0;
    updateHostOffset();
  });

watch(headerRef, (newEl, oldEl) => {
  if (oldEl) {
    extraResizeObserver?.unobserve(oldEl);
  }
  if (newEl) {
    extraResizeObserver?.observe(newEl);
  }
}, { immediate: true });

watch(footerRef, (newEl, oldEl) => {
  if (oldEl) {
    extraResizeObserver?.unobserve(oldEl);
  }
  if (newEl) {
    extraResizeObserver?.observe(newEl);
  }
}, { immediate: true });

onMounted(() => {
  if (hostRef.value) {
    hostResizeObserver?.observe(hostRef.value);
  }

  // Re-observe items that were set before observer was ready
  for (const el of itemRefs.values()) {
    itemResizeObserver?.observe(el);
    if (props.direction === 'both') {
      el.querySelectorAll('[data-col-index]').forEach((c) => itemResizeObserver?.observe(c));
    }
  }
});

watch([ hostRef, wrapperRef ], ([ newHost ], [ oldHost ]) => {
  if (oldHost) {
    hostResizeObserver?.unobserve(oldHost);
  }
  if (newHost) {
    hostResizeObserver?.observe(newHost);
  }
});

function setItemRef(el: unknown, index: number) {
  if (el) {
    itemRefs.set(index, el as HTMLElement);
    itemResizeObserver?.observe(el as HTMLElement);

    if (props.direction === 'both') {
      (el as HTMLElement).querySelectorAll('[data-col-index]').forEach((c) => itemResizeObserver?.observe(c));
    }
  } else {
    const oldEl = itemRefs.get(index);
    if (oldEl) {
      itemResizeObserver?.unobserve(oldEl);
      if (props.direction === 'both') {
        oldEl.querySelectorAll('[data-col-index]').forEach((c) => itemResizeObserver?.unobserve(c));
      }
      itemRefs.delete(index);
    }
  }
}

function handleKeyDown(event: KeyboardEvent) {
  const { viewportSize, scrollOffset } = scrollDetails.value;
  const isHorizontal = props.direction !== 'vertical';
  const isVertical = props.direction !== 'horizontal';

  switch (event.key) {
    case 'Home':
      event.preventDefault();
      stopProgrammaticScroll();
      scrollToIndex(0, 0, 'start');
      break;
    case 'End': {
      event.preventDefault();
      stopProgrammaticScroll();
      const lastItemIndex = props.items.length - 1;
      const lastColIndex = (props.columnCount || 0) > 0 ? props.columnCount - 1 : 0;

      if (isHorizontal) {
        if (isVertical) {
          scrollToIndex(lastItemIndex, lastColIndex, 'end');
        } else {
          scrollToIndex(0, lastItemIndex, 'end');
        }
      } else {
        scrollToIndex(lastItemIndex, 0, 'end');
      }
      break;
    }
    case 'ArrowUp':
      event.preventDefault();
      stopProgrammaticScroll();
      scrollToOffset(null, scrollOffset.y - DEFAULT_ITEM_SIZE);
      break;
    case 'ArrowDown':
      event.preventDefault();
      stopProgrammaticScroll();
      scrollToOffset(null, scrollOffset.y + DEFAULT_ITEM_SIZE);
      break;
    case 'ArrowLeft':
      event.preventDefault();
      stopProgrammaticScroll();
      scrollToOffset(scrollOffset.x - DEFAULT_ITEM_SIZE, null);
      break;
    case 'ArrowRight':
      event.preventDefault();
      stopProgrammaticScroll();
      scrollToOffset(scrollOffset.x + DEFAULT_ITEM_SIZE, null);
      break;
    case 'PageUp':
      event.preventDefault();
      stopProgrammaticScroll();
      scrollToOffset(
        !isVertical && isHorizontal ? scrollOffset.x - viewportSize.width : null,
        isVertical ? scrollOffset.y - viewportSize.height : null,
      );
      break;
    case 'PageDown':
      event.preventDefault();
      stopProgrammaticScroll();
      scrollToOffset(
        !isVertical && isHorizontal ? scrollOffset.x + viewportSize.width : null,
        isVertical ? scrollOffset.y + viewportSize.height : null,
      );
      break;
  }
}

onUnmounted(() => {
  hostResizeObserver?.disconnect();
  itemResizeObserver?.disconnect();
  extraResizeObserver?.disconnect();
});

const isWindowContainer = computed(() => isWindowLike(props.container));

const containerStyle = computed(() => {
  if (isWindowContainer.value) {
    return {
      ...(props.direction !== 'vertical' ? { whiteSpace: 'nowrap' as const } : {}),
    };
  }

  if (props.containerTag === 'table') {
    return {
      minInlineSize: props.direction === 'vertical' ? '100%' : 'auto',
    };
  }

  return {
    ...(props.direction !== 'vertical' ? { whiteSpace: 'nowrap' as const } : {}),
  };
});

const wrapperStyle = computed(() => ({
  inlineSize: props.direction === 'vertical' ? '100%' : `${ totalWidth.value }px`,
  blockSize: props.direction === 'horizontal' ? '100%' : `${ totalHeight.value }px`,
}));

const loadingStyle = computed(() => {
  const isHorizontal = props.direction === 'horizontal';

  return {
    display: isHorizontal ? 'inline-block' : 'block',
    ...(isHorizontal ? { blockSize: '100%', verticalAlign: 'top' } : { inlineSize: '100%' }),
  };
});

const spacerStyle = computed(() => ({
  inlineSize: props.direction === 'vertical' ? '1px' : `${ totalWidth.value }px`,
  blockSize: props.direction === 'horizontal' ? '1px' : `${ totalHeight.value }px`,
}));

function getItemStyle(item: RenderedItem<T>) {
  return calculateItemStyle({
    containerTag: props.containerTag,
    direction: props.direction,
    isHydrated: isHydrated.value,
    item,
    itemSize: props.itemSize,
    paddingStartX: (virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; }).x,
    paddingStartY: (virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; }).y,
  });
}

const isDebug = computed(() => props.debug);
const isTable = computed(() => props.containerTag === 'table');
const headerTag = computed(() => isTable.value ? 'thead' : 'div');
const footerTag = computed(() => isTable.value ? 'tfoot' : 'div');

defineExpose({
  /**
   * Detailed information about the current scroll state.
   * @see ScrollDetails
   * @see useVirtualScroll
   */
  scrollDetails,

  /**
   * Information about the current visible range of columns.
   * @see ColumnRange
   * @see useVirtualScroll
   */
  columnRange,

  /**
   * Helper to get the width of a specific column.
   * @param index - The column index.
   * @see useVirtualScroll
   */
  getColumnWidth,

  /**
   * Programmatically scroll to a specific row and/or column.
   *
   * @param rowIndex - The row index to scroll to. Pass null to only scroll horizontally.
   * @param colIndex - The column index to scroll to. Pass null to only scroll vertically.
   * @param options - Alignment and behavior options. Defaults to { align: 'auto', behavior: 'auto' }.
   * @see ScrollAlignment
   * @see ScrollToIndexOptions
   * @see useVirtualScroll
   */
  scrollToIndex,

  /**
   * Programmatically scroll to a specific pixel offset.
   *
   * @param x - The pixel offset to scroll to on the X axis. Pass null to keep current position.
   * @param y - The pixel offset to scroll to on the Y axis. Pass null to keep current position.
   * @param options - Scroll options (behavior). Defaults to { behavior: 'auto' }.
   * @see useVirtualScroll
   */
  scrollToOffset,

  /**
   * Resets all dynamic measurements and re-initializes from props.
   * @see useVirtualScroll
   */
  refresh,

  /**
   * Immediately stops any currently active smooth scroll animation and clears pending corrections.
   * @see useVirtualScroll
   */
  stopProgrammaticScroll,
});
</script>

<template>
  <component
    :is="containerTag"
    ref="hostRef"
    class="virtual-scroll-container"
    :class="[
      `virtual-scroll--${ direction }`,
      {
        'virtual-scroll--hydrated': isHydrated,
        'virtual-scroll--window': isWindowContainer,
        'virtual-scroll--table': isTable,
      },
    ]"
    :style="containerStyle"
    tabindex="0"
    @keydown="handleKeyDown"
    @wheel.passive="stopProgrammaticScroll"
    @pointerdown.passive="stopProgrammaticScroll"
    @touchstart.passive="stopProgrammaticScroll"
  >
    <component
      :is="headerTag"
      v-if="slots.header"
      ref="headerRef"
      class="virtual-scroll-header"
      :class="{ 'virtual-scroll--sticky': stickyHeader }"
    >
      <slot name="header" />
    </component>

    <component
      :is="wrapperTag"
      ref="wrapperRef"
      class="virtual-scroll-wrapper"
      :style="wrapperStyle"
    >
      <!-- Phantom element to push scroll height -->
      <component
        :is="itemTag"
        v-if="isTable"
        class="virtual-scroll-spacer"
        :style="spacerStyle"
      >
        <td style="padding: 0; border: none; block-size: inherit;" />
      </component>

      <component
        :is="itemTag"
        v-for="renderedItem in renderedItems"
        :key="renderedItem.index"
        :ref="(el: unknown) => setItemRef(el, renderedItem.index)"
        :data-index="renderedItem.index"
        class="virtual-scroll-item"
        :class="{
          'virtual-scroll--sticky': renderedItem.isStickyActive,
          'virtual-scroll--debug': isDebug,
        }"
        :style="getItemStyle(renderedItem)"
      >
        <slot
          name="item"
          :item="renderedItem.item"
          :index="renderedItem.index"
          :column-range="columnRange"
          :get-column-width="getColumnWidth"
          :is-sticky="renderedItem.isSticky"
          :is-sticky-active="renderedItem.isStickyActive"
        />
        <div v-if="isDebug" class="virtual-scroll-debug-info">
          #{{ renderedItem.index }} ({{ Math.round(renderedItem.offset.x) }}, {{ Math.round(renderedItem.offset.y) }})
        </div>
      </component>
    </component>

    <div
      v-if="loading && slots.loading"
      class="virtual-scroll-loading"
      :style="loadingStyle"
    >
      <slot name="loading" />
    </div>

    <component
      :is="footerTag"
      v-if="slots.footer"
      ref="footerRef"
      class="virtual-scroll-footer"
      :class="{ 'virtual-scroll--sticky': stickyFooter }"
    >
      <slot name="footer" />
    </component>
  </component>
</template>

<style scoped>
.virtual-scroll-container {
  position: relative;
  block-size: 100%;
  inline-size: 100%;
  outline-offset: 1px;

  &:not(.virtual-scroll--window) {
    overflow: auto;
    overscroll-behavior: contain;
  }

  &.virtual-scroll--table {
    display: block;
  }
}

.virtual-scroll--horizontal {
  white-space: nowrap;
}

.virtual-scroll-wrapper {
  contain: layout;
  position: relative;

  :where(.virtual-scroll--hydrated > & > .virtual-scroll-item) {
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

.virtual-scroll-spacer {
  pointer-events: none;
}

.virtual-scroll-header,
.virtual-scroll-footer {
  position: relative;
  z-index: 20;
}

.virtual-scroll--sticky {
  position: sticky;

  &:where(.virtual-scroll-header) {
    inset-block-start: 0;
    inset-inline-start: 0;
    min-inline-size: 100%;
    box-sizing: border-box;
  }

  &:where(.virtual-scroll-footer) {
    inset-block-end: 0;
    inset-inline-start: 0;
    min-inline-size: 100%;
    box-sizing: border-box;
  }

  &:where(.virtual-scroll-item) {
    z-index: 10;
  }
}

:is(tbody.virtual-scroll-wrapper, thead.virtual-scroll-header, tfoot.virtual-scroll-footer) {
  display: inline-flex;
  min-inline-size: 100%;
  & > :deep(tr) {
    display: inline-flex;
    min-inline-size: 100%;

    & > :is(td, th) {
      display: inline-block;
      align-items: center;
    }
  }
}
</style>
