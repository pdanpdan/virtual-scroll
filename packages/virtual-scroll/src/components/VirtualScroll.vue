<script setup lang="ts" generic="T">
import type {
  RenderedItem,
  ScrollAlignment,
  ScrollAlignmentOptions,
  ScrollDetails,
  VirtualScrollProps,
} from '../composables/useVirtualScroll.js';

import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import { useVirtualScroll } from '../composables/useVirtualScroll.js';
import { getPaddingX, getPaddingY } from '../utils/scroll.js';

export interface Props<T = unknown> {
  /** Array of items to be virtualized. */
  items: T[];
  /** Fixed size of each item or a function that returns the size of an item. Pass 0, null or undefined for dynamic size detection. */
  itemSize?: number | ((item: T, index: number) => number) | null;
  /** Direction of the scroll: 'vertical', 'horizontal', or 'both' (grid). */
  direction?: 'vertical' | 'horizontal' | 'both';
  /** Number of items to render before the visible viewport. */
  bufferBefore?: number;
  /** Number of items to render after the visible viewport. */
  bufferAfter?: number;
  /** The scrollable container element or window. If not provided, the host element is used. */
  container?: HTMLElement | Window | null;
  /** Range of items to render for SSR. */
  ssrRange?: {
    start: number;
    end: number;
    colStart?: number;
    colEnd?: number;
  };
  /** Number of columns for bidirectional (grid) scroll. */
  columnCount?: number;
  /** Fixed width of columns or an array/function for column widths. Pass 0, null or undefined for dynamic width. */
  columnWidth?: number | number[] | ((index: number) => number) | null;
  /** The HTML tag to use for the container. */
  containerTag?: string;
  /** The HTML tag to use for the items wrapper. */
  wrapperTag?: string;
  /** The HTML tag to use for each item. */
  itemTag?: string;
  /** Padding at the start of the scroll container. */
  scrollPaddingStart?: number | { x?: number; y?: number; };
  /** Padding at the end of the scroll container. */
  scrollPaddingEnd?: number | { x?: number; y?: number; };
  /** Whether the header slot content is sticky and should be accounted for in scroll padding. If true, header size is automatically measured. */
  stickyHeader?: boolean;
  /** Whether the footer slot content is sticky and should be accounted for in scroll padding. If true, footer size is automatically measured. */
  stickyFooter?: boolean;
  /** Gap between items in pixels (vertical). */
  gap?: number;
  /** Gap between columns in pixels (horizontal/grid). */
  columnGap?: number;
  /** Indices of items that should stick to the top/start. Supports iOS-style pushing effect. */
  stickyIndices?: number[];
  /** Distance from the end of the scrollable area to trigger 'load' event in pixels. */
  loadDistance?: number;
  /** Whether items are currently being loaded. Prevents multiple 'load' events and shows 'loading' slot. */
  loading?: boolean;
  /** Whether to automatically restore scroll position when items are prepended to the list. */
  restoreScrollOnPrepend?: boolean;
  /** Initial scroll index to jump to on mount. */
  initialScrollIndex?: number;
  /** Alignment for the initial scroll index. */
  initialScrollAlign?: ScrollAlignment | ScrollAlignmentOptions;
  /** Default size for items before they are measured. */
  defaultItemSize?: number;
  /** Default width for columns before they are measured. */
  defaultColumnWidth?: number;
  /** Whether to show debug information (buffers and offsets). */
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
  loadDistance: 50,
  loading: false,
  restoreScrollOnPrepend: false,
  debug: false,
});

const emit = defineEmits<{
  (e: 'scroll', details: ScrollDetails<T>): void;
  (e: 'load', direction: 'vertical' | 'horizontal'): void;
  (e: 'visibleRangeChange', range: { start: number; end: number; colStart: number; colEnd: number; }): void;
}>();

const isDebug = computed(() => props.debug);

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

  const startX = typeof pStart === 'object'
    ? (pStart.x || 0)
    : (props.direction === 'horizontal' ? (pStart || 0) : 0);
  const startY = typeof pStart === 'object'
    ? (pStart.y || 0)
    : (props.direction !== 'horizontal' ? (pStart || 0) : 0);

  const endX = typeof pEnd === 'object'
    ? (pEnd.x || 0)
    : (props.direction === 'horizontal' ? (pEnd || 0) : 0);
  const endY = typeof pEnd === 'object'
    ? (pEnd.y || 0)
    : (props.direction !== 'horizontal' ? (pEnd || 0) : 0);

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
    debug: isDebug.value,
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
  refresh,
  stopProgrammaticScroll,
} = useVirtualScroll(virtualScrollProps);

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

      if (colIndex !== undefined) {
        // It's a cell measurement. row index is not strictly needed for column width.
        // We use -1 as a placeholder for row index if it's a cell measurement.
        updates.push({ index: -1, inlineSize: 0, blockSize: 0, element: target });
      } else if (!Number.isNaN(index)) {
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

const firstRenderedIndex = computed(() => renderedItems.value[ 0 ]?.index);

watch(firstRenderedIndex, (newIdx, oldIdx) => {
  if (props.direction === 'both') {
    if (oldIdx !== undefined) {
      const oldEl = itemRefs.get(oldIdx);
      if (oldEl) {
        oldEl.querySelectorAll('[data-col-index]').forEach((c) => itemResizeObserver?.unobserve(c));
      }
    }
    if (newIdx !== undefined) {
      const newEl = itemRefs.get(newIdx);
      if (newEl) {
        newEl.querySelectorAll('[data-col-index]').forEach((c) => itemResizeObserver?.observe(c));
      }
    }
  }
}, { flush: 'post' });

onMounted(() => {
  if (hostRef.value) {
    hostResizeObserver?.observe(hostRef.value);
  }

  // Re-observe items that were set before observer was ready
  for (const el of itemRefs.values()) {
    itemResizeObserver?.observe(el);
  }

  // Observe cells of the first rendered item
  if (firstRenderedIndex.value !== undefined) {
    const el = itemRefs.get(firstRenderedIndex.value);
    if (el) {
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
  } else {
    const oldEl = itemRefs.get(index);
    if (oldEl) {
      itemResizeObserver?.unobserve(oldEl);
      itemRefs.delete(index);
    }
  }
}

function handleKeyDown(event: KeyboardEvent) {
  stopProgrammaticScroll();
  const { viewportSize, scrollOffset } = scrollDetails.value;
  const isHorizontal = props.direction !== 'vertical';
  const isVertical = props.direction !== 'horizontal';

  if (event.key === 'Home') {
    event.preventDefault();
    scrollToIndex(0, 0, 'start');
    return;
  }
  if (event.key === 'End') {
    event.preventDefault();
    const lastItemIndex = props.items.length - 1;
    const lastColIndex = (props.columnCount || 0) > 0 ? props.columnCount - 1 : 0;

    if (isHorizontal && isVertical) {
      scrollToIndex(lastItemIndex, lastColIndex, 'end');
    } else {
      scrollToIndex(0, lastItemIndex, 'end');
    }
    return;
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault();
    scrollToOffset(null, scrollOffset.y - 40);
    return;
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    scrollToOffset(null, scrollOffset.y + 40);
    return;
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    scrollToOffset(scrollOffset.x - 40, null);
    return;
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    scrollToOffset(scrollOffset.x + 40, null);
    return;
  }
  if (event.key === 'PageUp') {
    event.preventDefault();
    scrollToOffset(
      isHorizontal ? scrollOffset.x - viewportSize.width : null,
      isVertical ? scrollOffset.y - viewportSize.height : null,
    );
    return;
  }
  if (event.key === 'PageDown') {
    event.preventDefault();
    scrollToOffset(
      isHorizontal ? scrollOffset.x + viewportSize.width : null,
      isVertical ? scrollOffset.y + viewportSize.height : null,
    );
  }
}

onUnmounted(() => {
  hostResizeObserver?.disconnect();
  itemResizeObserver?.disconnect();
  extraResizeObserver?.disconnect();
});

const isWindowContainer = computed(() => {
  const c = props.container;
  if (
    c === null
    // window
    || (typeof window !== 'undefined' && c === window)
  ) {
    return true;
  }

  // body
  if (c && typeof c === 'object' && 'tagName' in c) {
    return (c as HTMLElement).tagName === 'BODY';
  }

  return false;
});

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
  const isVertical = props.direction === 'vertical';
  const isHorizontal = props.direction === 'horizontal';
  const isBoth = props.direction === 'both';
  const isDynamic = props.itemSize === undefined || props.itemSize === null || props.itemSize === 0;

  const style: Record<string, string | number | undefined> = {
    blockSize: isHorizontal ? '100%' : (!isDynamic ? `${ item.size.height }px` : 'auto'),
  };

  if (isVertical && props.containerTag === 'table') {
    style.minInlineSize = '100%';
  } else {
    style.inlineSize = isVertical ? '100%' : (!isDynamic ? `${ item.size.width }px` : 'auto');
  }

  if (isDynamic) {
    if (!isVertical) {
      style.minInlineSize = `${ item.size.width }px`;
    }
    if (!isHorizontal) {
      style.minBlockSize = `${ item.size.height }px`;
    }
  }

  if (isHydrated.value) {
    if (item.isStickyActive) {
      if (isVertical || isBoth) {
        style.insetBlockStart = `${ getPaddingY(props.scrollPaddingStart, props.direction) }px`;
      }

      if (isHorizontal || isBoth) {
        style.insetInlineStart = `${ getPaddingX(props.scrollPaddingStart, props.direction) }px`;
      }

      style.transform = `translate(${ item.stickyOffset.x }px, ${ item.stickyOffset.y }px)`;
    } else {
      style.transform = `translate(${ item.offset.x }px, ${ item.offset.y }px)`;
    }
  }

  return style;
}

defineExpose({
  scrollDetails,
  columnRange,
  getColumnWidth,
  scrollToIndex,
  scrollToOffset,
  refresh,
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
        'virtual-scroll--table': containerTag === 'table',
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
      :is="containerTag === 'table' ? 'thead' : 'div'"
      v-if="$slots.header"
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
        v-if="containerTag === 'table'"
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
      v-if="loading && $slots.loading"
      class="virtual-scroll-loading"
      :style="loadingStyle"
    >
      <slot name="loading" />
    </div>

    <component
      :is="containerTag === 'table' ? 'tfoot' : 'div'"
      v-if="$slots.footer"
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
