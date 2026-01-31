<script setup lang="ts" generic="T">
/**
 * A high-performance virtual scrolling component for Vue 3.
 * Supports large lists and grids by only rendering visible items and using coordinate scaling.
 * Features include sticky headers/footers, RTL support, custom scrollbars, and scroll restoration.
 */
import type {
  RenderedItem,
  ScrollAlignment,
  ScrollbarSlotProps,
  ScrollDetails,
  ScrollToIndexOptions,
  VirtualScrollbarProps,
  VirtualScrollComponentProps,
  VirtualScrollProps,
} from '../types';
import type { VNodeChild } from 'vue';

import { computed, nextTick, onMounted, onUnmounted, ref, toRefs, useId, watch } from 'vue';

import {
  useVirtualScroll,
} from '../composables/useVirtualScroll';
import { useVirtualScrollbar } from '../composables/useVirtualScrollbar';
import { getPaddingX, getPaddingY } from '../utils/scroll';
import { calculateItemStyle, displayToVirtual } from '../utils/virtual-scroll-logic';
import VirtualScrollbar from './VirtualScrollbar.vue';

export interface Props<T = unknown> extends VirtualScrollComponentProps<T> {}

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
  virtualScrollbar: false,
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
    /** Vertical gap between items. */
    gap: number;
    /** Horizontal gap between columns. */
    columnGap: number;
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

  /**
   * Scoped slot for rendering custom scrollbars.
   * If provided, the default VirtualScrollbar is not rendered.
   */
  scrollbar?: (props: ScrollbarSlotProps) => VNodeChild;
}>();

const hostRef = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const footerRef = ref<HTMLElement | null>(null);
const itemRefs = new Map<number, HTMLElement>();

const instanceId = useId();

/**
 * Unique ID for the scrollable container.
 * Used for accessibility (aria-controls) and to target the element in DOM.
 */
const containerId = computed(() => `vs-container-${ instanceId }`);

const measuredPaddingStart = ref(0);
const measuredPaddingEnd = ref(0);

const effectiveContainer = computed(() => (props.container === undefined ? hostRef.value : props.container));

const isHeaderFooterInsideContainer = computed(() => {
  const container = effectiveContainer.value;

  return container === hostRef.value
    || (typeof window !== 'undefined' && (container === window || container === null));
});

const virtualScrollProps = computed(() => {
  /* Trigger re-evaluation on items array mutations */
  // eslint-disable-next-line ts/no-unused-expressions
  props.items.length;

  return {
    items: props.items,
    itemSize: props.itemSize,
    direction: props.direction,
    bufferBefore: props.bufferBefore,
    bufferAfter: props.bufferAfter,
    container: effectiveContainer.value,
    hostElement: wrapperRef.value,
    hostRef: hostRef.value,
    ssrRange: props.ssrRange,
    columnCount: props.columnCount,
    columnWidth: props.columnWidth,
    scrollPaddingStart: {
      x: getPaddingX(props.scrollPaddingStart, props.direction),
      y: getPaddingY(props.scrollPaddingStart, props.direction),
    },
    scrollPaddingEnd: {
      x: getPaddingX(props.scrollPaddingEnd, props.direction),
      y: getPaddingY(props.scrollPaddingEnd, props.direction),
    },
    flowPaddingStart: {
      x: 0,
      y: props.stickyHeader ? 0 : measuredPaddingStart.value,
    },
    flowPaddingEnd: {
      x: 0,
      y: props.stickyFooter ? 0 : measuredPaddingEnd.value,
    },
    stickyStart: {
      x: 0,
      y: props.stickyHeader && isHeaderFooterInsideContainer.value ? measuredPaddingStart.value : 0,
    },
    stickyEnd: {
      x: 0,
      y: props.stickyFooter && isHeaderFooterInsideContainer.value ? measuredPaddingEnd.value : 0,
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
  isRtl,
  columnRange,
  renderedItems,
  scrollDetails,
  renderedHeight,
  renderedWidth,
  getColumnWidth,
  getRowHeight,
  scrollToIndex,
  scrollToOffset,
  updateHostOffset,
  updateItemSizes,
  updateDirection,
  getItemOffset,
  getRowOffset,
  getColumnOffset,
  getItemSize,
  refresh: coreRefresh,
  stopProgrammaticScroll,
  scaleX,
  scaleY,
  isWindowContainer,
  componentOffset,
  renderedVirtualWidth,
  renderedVirtualHeight,
} = useVirtualScroll(virtualScrollProps);

const useVirtualScrolling = computed(() => scaleX.value !== 1 || scaleY.value !== 1);

const showVirtualScrollbars = computed(() => {
  if (isWindowContainer.value) {
    return false;
  }
  return props.virtualScrollbar === true || scaleX.value !== 1 || scaleY.value !== 1;
});

function handleVerticalScrollbarScrollToOffset(offset: number) {
  const { displayViewportSize } = scrollDetails.value;
  const scrollableRange = renderedHeight.value - displayViewportSize.height;
  if (offset >= scrollableRange - 0.5) {
    scrollToOffset(null, Number.POSITIVE_INFINITY);
  } else {
    const virtualOffset = displayToVirtual(offset, componentOffset.y, scaleY.value);
    scrollToOffset(null, virtualOffset);
  }
}

function handleHorizontalScrollbarScrollToOffset(offset: number) {
  const { displayViewportSize } = scrollDetails.value;
  const scrollableRange = renderedWidth.value - displayViewportSize.width;
  if (offset >= scrollableRange - 0.5) {
    scrollToOffset(Number.POSITIVE_INFINITY, null);
  } else {
    const virtualOffset = displayToVirtual(offset, componentOffset.x, scaleX.value);
    scrollToOffset(virtualOffset, null);
  }
}

const verticalScrollbar = useVirtualScrollbar({
  axis: 'vertical',
  totalSize: renderedHeight,
  position: computed(() => scrollDetails.value.displayScrollOffset.y),
  viewportSize: computed(() => scrollDetails.value.displayViewportSize.height),
  scrollToOffset: handleVerticalScrollbarScrollToOffset,
  containerId,
  isRtl,
});

const horizontalScrollbar = useVirtualScrollbar({
  axis: 'horizontal',
  totalSize: renderedWidth,
  position: computed(() => scrollDetails.value.displayScrollOffset.x),
  viewportSize: computed(() => scrollDetails.value.displayViewportSize.width),
  scrollToOffset: handleHorizontalScrollbarScrollToOffset,
  containerId,
  isRtl,
});

const slotColumnRange = computed(() => {
  if (props.direction !== 'both') {
    return columnRange.value;
  }
  return {
    ...columnRange.value,
    padStart: 0,
    padEnd: 0,
  };
});

/**
 * Resets all dynamic measurements and re-initializes from props.
 * Also triggers manual re-measurement of all currently rendered items.
 */
function refresh() {
  coreRefresh();
  updateDirection();
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
  } else {
    measuredPaddingStart.value = 0;
  }
}, { immediate: true });

watch(footerRef, (newEl, oldEl) => {
  if (oldEl) {
    extraResizeObserver?.unobserve(oldEl);
  }
  if (newEl) {
    extraResizeObserver?.observe(newEl);
  } else {
    measuredPaddingEnd.value = 0;
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

watch([ hostRef, useVirtualScrolling ], ([ host, virtual ], [ oldHost, oldVirtual ]) => {
  const needsUpdate = host !== oldHost || virtual !== oldVirtual;
  if (oldHost && needsUpdate) {
    oldHost.removeEventListener('wheel', handleWheel);
  }
  if (host && needsUpdate) {
    host.addEventListener('wheel', handleWheel, { passive: !virtual });
  }
}, { immediate: true });

/**
 * Callback ref to track and measure item elements.
 *
 * @param el - The element or null if unmounting.
 * @param index - The original index of the item.
 */
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

/**
 * State for inertia scrolling
 */
const isPointerScrolling = ref(false);
let startPointerPos = { x: 0, y: 0 };
let startScrollOffset = { x: 0, y: 0 };
let lastPointerPos = { x: 0, y: 0 };
let lastPointerTime = 0;
let velocity = { x: 0, y: 0 };
let inertiaAnimationFrame: number | null = null;

// Friction constant (0.9 to 0.98 is usually best)
const FRICTION = 0.95;
// Minimum velocity to continue the animation
const MIN_VELOCITY = 0.1;

/**
 * Recursively animates the scroll offset based on velocity and friction.
 */
function startInertiaAnimation() {
  const step = () => {
    // Apply friction to the velocity
    velocity.x *= FRICTION;
    velocity.y *= FRICTION;

    // Calculate the new scroll offset
    const currentX = scrollDetails.value.scrollOffset.x;
    const currentY = scrollDetails.value.scrollOffset.y;

    // Move the scroll position by the current velocity
    scrollToOffset(
      currentX + velocity.x * 16, // Assuming ~60fps (16ms per frame)
      currentY + velocity.y * 16,
      { behavior: 'auto' },
    );

    // Continue animation if we haven't slowed down to a halt
    if (Math.abs(velocity.x) > MIN_VELOCITY || Math.abs(velocity.y) > MIN_VELOCITY) {
      inertiaAnimationFrame = requestAnimationFrame(step);
    } else {
      stopInertia();
    }
  };

  inertiaAnimationFrame = requestAnimationFrame(step);
}

/**
 * Stops any ongoing inertia animation
 */
function stopInertia() {
  if (inertiaAnimationFrame !== null) {
    cancelAnimationFrame(inertiaAnimationFrame);
    inertiaAnimationFrame = null;
  }
  velocity = { x: 0, y: 0 };
}

/**
 * Handles pointer down events on the container to start emulated scrolling when scaling is active.
 *
 * @param event - The pointer down event.
 */
function handlePointerDown(event: PointerEvent) {
  stopProgrammaticScroll();
  stopInertia(); // Stop any existing momentum

  if (!useVirtualScrolling.value) {
    return;
  }

  // Only handle primary button or touch
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return;
  }

  isPointerScrolling.value = true;
  startPointerPos = { x: event.clientX, y: event.clientY };
  lastPointerPos = { x: event.clientX, y: event.clientY };
  lastPointerTime = performance.now();
  startScrollOffset = {
    x: scrollDetails.value.scrollOffset.x,
    y: scrollDetails.value.scrollOffset.y,
  };

  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
}

/**
 * Handles pointer move events on the container to perform emulated scrolling.
 *
 * @param event - The pointer move event.
 */
function handlePointerMove(event: PointerEvent) {
  if (!isPointerScrolling.value) {
    return;
  }

  const now = performance.now();
  const dt = now - lastPointerTime;

  if (dt > 0) {
    // Calculate instantaneous velocity (pixels per millisecond)
    const instantVelocityX = (lastPointerPos.x - event.clientX) / dt;
    const instantVelocityY = (lastPointerPos.y - event.clientY) / dt;

    // Use a moving average for smoother velocity tracking
    velocity.x = velocity.x * 0.2 + instantVelocityX * 0.8;
    velocity.y = velocity.y * 0.2 + instantVelocityY * 0.8;
  }

  lastPointerPos = { x: event.clientX, y: event.clientY };
  lastPointerTime = now;

  const deltaX = startPointerPos.x - event.clientX;
  const deltaY = startPointerPos.y - event.clientY;

  requestAnimationFrame(() => {
    scrollToOffset(
      startScrollOffset.x + deltaX,
      startScrollOffset.y + deltaY,
      { behavior: 'auto' },
    );
  });
}

/**
 * Handles pointer up and cancel events to end emulated scrolling.
 *
 * @param event - The pointer event.
 */
function handlePointerUp(event: PointerEvent) {
  if (!isPointerScrolling.value) {
    return;
  }

  isPointerScrolling.value = false;
  (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);

  // If the user was moving fast enough, start the inertia loop
  if (Math.abs(velocity.x) > MIN_VELOCITY || Math.abs(velocity.y) > MIN_VELOCITY) {
    // avoid unwanted cross-axis drift
    if (Math.abs(velocity.x) > 4 * Math.abs(velocity.y)) {
      velocity.y = 0;
    } else if (Math.abs(velocity.y) > 4 * Math.abs(velocity.x)) {
      velocity.x = 0;
    }

    startInertiaAnimation();
  }
}

/**
 * Handles mouse wheel events to support high-precision scrolling for large content or virtual scrollbars.
 *
 * @param event - The wheel event.
 */
function handleWheel(event: WheelEvent) {
  const { scrollOffset } = scrollDetails.value;
  stopProgrammaticScroll();

  if (useVirtualScrolling.value) {
    // Prevent default browser scroll as we are handling it manually
    event.preventDefault();

    // For large content we manually scroll to keep precision/control
    let deltaX = event.deltaX;
    let deltaY = event.deltaY;

    if (event.shiftKey && deltaX === 0) {
      deltaX = deltaY;
      deltaY = 0;
    }

    const targetX = scrollOffset.x + deltaX;
    const targetY = scrollOffset.y + deltaY;

    scrollToOffset(targetX, targetY, { behavior: 'auto' });
  }
}

/**
 * Handles keyboard events for navigation (Home, End, Arrows, PageUp/Down).
 *
 * @param event - The keyboard event.
 */
function handleKeyDown(event: KeyboardEvent) {
  const { viewportSize, scrollOffset } = scrollDetails.value;
  const isHorizontal = props.direction !== 'vertical';
  const isVertical = props.direction !== 'horizontal';

  const sStart = virtualScrollProps.value.stickyStart as { x: number; y: number; };
  const sEnd = virtualScrollProps.value.stickyEnd as { x: number; y: number; };

  switch (event.key) {
    case 'Home': {
      event.preventDefault();
      stopProgrammaticScroll();
      const distance = Math.max(scrollOffset.x, scrollOffset.y);
      const viewport = props.direction === 'horizontal' ? viewportSize.width : viewportSize.height;
      const behavior = distance > 10 * viewport ? 'auto' : 'smooth';

      scrollToIndex(0, 0, { behavior, align: 'start' });
      break;
    }
    case 'End': {
      event.preventDefault();
      stopProgrammaticScroll();
      const lastItemIndex = props.items.length - 1;
      const lastColIndex = (props.columnCount || 0) > 0 ? props.columnCount - 1 : 0;

      const { totalSize } = scrollDetails.value;
      const distance = Math.max(
        totalSize.width - scrollOffset.x - viewportSize.width,
        totalSize.height - scrollOffset.y - viewportSize.height,
      );
      const viewport = props.direction === 'horizontal' ? viewportSize.width : viewportSize.height;
      const behavior = distance > 10 * viewport ? 'auto' : 'smooth';

      if (props.direction === 'both') {
        scrollToIndex(lastItemIndex, lastColIndex, { behavior, align: 'end' });
      } else {
        scrollToIndex(
          props.direction === 'vertical' ? lastItemIndex : 0,
          props.direction === 'horizontal' ? lastItemIndex : 0,
          { behavior, align: 'end' },
        );
      }
      break;
    }
    case 'ArrowUp': {
      event.preventDefault();
      stopProgrammaticScroll();
      if (!isVertical) {
        return;
      }

      const { currentIndex, scrollOffset } = scrollDetails.value;
      const viewportTop = scrollOffset.y + sStart.y + (virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; }).y;
      const itemPos = getRowOffset(currentIndex);

      if (itemPos < viewportTop - 1) {
        scrollToIndex(currentIndex, null, { align: 'start' });
      } else if (currentIndex > 0) {
        scrollToIndex(currentIndex - 1, null, { align: 'start' });
      }
      break;
    }
    case 'ArrowDown': {
      event.preventDefault();
      stopProgrammaticScroll();
      if (!isVertical) {
        return;
      }

      const { currentEndIndex } = scrollDetails.value;
      const viewportBottom = scrollOffset.y + viewportSize.height - (sEnd.y + (virtualScrollProps.value.scrollPaddingEnd as { x: number; y: number; }).y);
      const itemBottom = getRowOffset(currentEndIndex) + getRowHeight(currentEndIndex);

      if (itemBottom > viewportBottom + 1) {
        scrollToIndex(currentEndIndex, null, { align: 'end' });
      } else if (currentEndIndex < props.items.length - 1) {
        scrollToIndex(currentEndIndex + 1, null, { align: 'end' });
      }
      break;
    }
    case 'ArrowLeft': {
      event.preventDefault();
      stopProgrammaticScroll();
      if (!isHorizontal) {
        return;
      }

      const { currentColIndex, currentEndColIndex } = scrollDetails.value;

      if (isRtl.value) {
        // RTL ArrowLeft -> towards logical END (Left)
        const viewportLeft = scrollOffset.x + viewportSize.width - (sEnd.x + (virtualScrollProps.value.scrollPaddingEnd as { x: number; y: number; }).x);
        const colEndPos = (props.columnCount ? getColumnOffset(currentEndColIndex) + getColumnWidth(currentEndColIndex) : getItemOffset(currentEndColIndex) + getItemSize(currentEndColIndex));

        if (colEndPos > viewportLeft + 1) {
          scrollToIndex(null, currentEndColIndex, { align: 'end' });
        } else {
          const maxColIdx = props.columnCount ? props.columnCount - 1 : props.items.length - 1;
          if (currentEndColIndex < maxColIdx) {
            scrollToIndex(null, currentEndColIndex + 1, { align: 'end' });
          }
        }
      } else {
        // LTR ArrowLeft -> towards logical START (Left)
        const viewportLeft = scrollOffset.x + sStart.x + (virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; }).x;
        const colStartPos = (props.columnCount ? getColumnOffset(currentColIndex) : getItemOffset(currentColIndex));

        if (colStartPos < viewportLeft - 1) {
          scrollToIndex(null, currentColIndex, { align: 'start' });
        } else if (currentColIndex > 0) {
          scrollToIndex(null, currentColIndex - 1, { align: 'start' });
        }
      }
      break;
    }
    case 'ArrowRight': {
      event.preventDefault();
      stopProgrammaticScroll();
      if (!isHorizontal) {
        return;
      }

      const { currentColIndex, currentEndColIndex } = scrollDetails.value;

      if (isRtl.value) {
        // RTL ArrowRight -> towards logical START (Right)
        const viewportRight = scrollOffset.x + sStart.x + (virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; }).x;
        const colStartPos = (props.columnCount ? getColumnOffset(currentColIndex) : getItemOffset(currentColIndex));

        if (colStartPos < viewportRight - 1) {
          scrollToIndex(null, currentColIndex, { align: 'start' });
        } else if (currentColIndex > 0) {
          scrollToIndex(null, currentColIndex - 1, { align: 'start' });
        }
      } else {
        // LTR ArrowRight -> towards logical END (Right)
        const viewportRight = scrollOffset.x + viewportSize.width - (sEnd.x + (virtualScrollProps.value.scrollPaddingEnd as { x: number; y: number; }).x);
        const colEndPos = (props.columnCount ? getColumnOffset(currentEndColIndex) + getColumnWidth(currentEndColIndex) : getItemOffset(currentEndColIndex) + getItemSize(currentEndColIndex));

        if (colEndPos > viewportRight + 1) {
          scrollToIndex(null, currentEndColIndex, { align: 'end' });
        } else {
          const maxColIdx = props.columnCount ? props.columnCount - 1 : props.items.length - 1;
          if (currentEndColIndex < maxColIdx) {
            scrollToIndex(null, currentEndColIndex + 1, { align: 'end' });
          }
        }
      }
      break;
    }
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

const containerStyle = computed(() => {
  const base: Record<string, string | number | undefined> = {
    ...(props.direction !== 'vertical' ? { whiteSpace: 'nowrap' as const } : {}),
  };

  if (showVirtualScrollbars.value) {
    base.overflow = 'auto';
  }

  if (useVirtualScrolling.value) {
    base.touchAction = 'none';
  }

  if (isWindowContainer.value) {
    return base;
  }

  if (props.containerTag === 'table') {
    return {
      ...base,
      minInlineSize: props.direction === 'vertical' ? '100%' : 'auto',
    };
  }

  return base;
});

const verticalScrollbarProps = computed<ScrollbarSlotProps | null>(() => {
  if (props.direction === 'horizontal') {
    return null;
  }
  const { displayViewportSize, displayScrollOffset } = scrollDetails.value;
  if (renderedHeight.value <= displayViewportSize.height) {
    return null;
  }

  const scrollbarProps: VirtualScrollbarProps = {
    axis: 'vertical',
    totalSize: renderedHeight.value,
    position: displayScrollOffset.y,
    viewportSize: displayViewportSize.height,
    scrollToOffset: handleVerticalScrollbarScrollToOffset,
    containerId: containerId.value,
    isRtl: isRtl.value,
  };

  return {
    positionPercent: verticalScrollbar.positionPercent.value,
    viewportPercent: verticalScrollbar.viewportPercent.value,
    trackProps: verticalScrollbar.trackProps.value,
    thumbProps: verticalScrollbar.thumbProps.value,
    scrollbarProps,
  };
});

const horizontalScrollbarProps = computed<ScrollbarSlotProps | null>(() => {
  if (props.direction === 'vertical') {
    return null;
  }
  const { displayViewportSize, displayScrollOffset } = scrollDetails.value;
  if (renderedWidth.value <= displayViewportSize.width) {
    return null;
  }

  const scrollbarProps: VirtualScrollbarProps = {
    axis: 'horizontal',
    totalSize: renderedWidth.value,
    position: displayScrollOffset.x,
    viewportSize: displayViewportSize.width,
    scrollToOffset: handleHorizontalScrollbarScrollToOffset,
    containerId: containerId.value,
    isRtl: isRtl.value,
  };

  return {
    positionPercent: horizontalScrollbar.positionPercent.value,
    viewportPercent: horizontalScrollbar.viewportPercent.value,
    trackProps: horizontalScrollbar.trackProps.value,
    thumbProps: horizontalScrollbar.thumbProps.value,
    scrollbarProps,
  };
});

const wrapperStyle = computed(() => {
  const isHorizontal = props.direction === 'horizontal';
  const isVertical = props.direction === 'vertical';
  const isBoth = props.direction === 'both';

  const style: Record<string, string | number | undefined> = {
    inlineSize: isVertical ? '100%' : `${ renderedVirtualWidth.value }px`,
    blockSize: isHorizontal ? '100%' : `${ renderedVirtualHeight.value }px`,
  };

  if (!isHydrated.value) {
    style.display = 'flex';
    style.flexDirection = isHorizontal ? 'row' : 'column';
    if ((isHorizontal || isBoth) && props.columnGap) {
      style.columnGap = `${ props.columnGap }px`;
    }
    if ((isVertical || isBoth) && props.gap) {
      style.rowGap = `${ props.gap }px`;
    }
  }

  return style;
});

const loadingStyle = computed(() => {
  const isHorizontal = props.direction === 'horizontal';

  return {
    display: isHorizontal ? 'inline-block' : 'block',
    ...(isHorizontal ? { blockSize: '100%', verticalAlign: 'top' } : { inlineSize: '100%' }),
  };
});

const spacerStyle = computed(() => ({
  inlineSize: props.direction === 'vertical' ? '1px' : `${ renderedVirtualWidth.value }px`,
  blockSize: props.direction === 'horizontal' ? '1px' : `${ renderedVirtualHeight.value }px`,
}));

/**
 * Calculates the final style object for an item, including position and dimensions.
 *
 * @param item - The rendered item state.
 * @returns CSS style object.
 */
function getItemStyle(item: RenderedItem<T>) {
  const style = calculateItemStyle({
    containerTag: props.containerTag,
    direction: props.direction,
    isHydrated: isHydrated.value,
    item,
    itemSize: props.itemSize,
    paddingStartX: (virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; }).x,
    paddingStartY: (virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; }).y,
    isRtl: isRtl.value,
  });

  if (!isHydrated.value && props.direction === 'both') {
    style.display = 'flex';
    if (props.columnGap) {
      style.columnGap = `${ props.columnGap }px`;
    }
  }

  return style;
}

const isDebug = computed(() => props.debug);
const isTable = computed(() => props.containerTag === 'table');
const headerTag = computed(() => isTable.value ? 'thead' : 'div');
const footerTag = computed(() => isTable.value ? 'tfoot' : 'div');

defineExpose({
  ...toRefs(props),

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
   * Helper to get the height of a specific row.
   * @param index - The row index.
   * @see useVirtualScroll
   */
  getRowHeight,

  /**
   * Helper to get the virtual offset of a specific row.
   * @param index - The row index.
   * @see useVirtualScroll
   */
  getRowOffset,

  /**
   * Helper to get the virtual offset of a specific column.
   * @param index - The column index.
   * @see useVirtualScroll
   */
  getColumnOffset,

  /**
   * Helper to get the virtual offset of a specific item.
   * @param index - The item index.
   * @see useVirtualScroll
   */
  getItemOffset,

  /**
   * Helper to get the size of a specific item along the scroll axis.
   * @param index - The item index.
   * @see useVirtualScroll
   */
  getItemSize,

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
  stopProgrammaticScroll: () => {
    stopProgrammaticScroll();
    stopInertia();
  },

  /**
   * Detects the current direction (LTR/RTL) of the scroll container.
   */
  updateDirection,

  /**
   * Whether the scroll container is in Right-to-Left (RTL) mode.
   */
  isRtl,

  /**
   * Whether the component has finished its first client-side mount and hydration.
   */
  isHydrated,

  /**
   * Coordinate scaling factor for X axis.
   */
  scaleX,

  /**
   * Coordinate scaling factor for Y axis.
   */
  scaleY,

  /**
   * Physical width of the content in the DOM (clamped to browser limits).
   */
  renderedWidth,

  /**
   * Physical height of the content in the DOM (clamped to browser limits).
   */
  renderedHeight,

  /**
   * Absolute offset of the component within its container.
   */
  componentOffset,

  /**
   * Properties for the vertical scrollbar.
   * Useful when building custom scrollbar interfaces.
   */
  scrollbarPropsVertical: verticalScrollbarProps,

  /**
   * Properties for the horizontal scrollbar.
   * Useful when building custom scrollbar interfaces.
   */
  scrollbarPropsHorizontal: horizontalScrollbarProps,
});
</script>

<template>
  <component
    :is="containerTag"
    :id="containerId"
    ref="hostRef"
    class="virtual-scroll-container"
    :class="[
      `virtual-scroll--${ direction }`,
      {
        'virtual-scroll--hydrated': isHydrated,
        'virtual-scroll--window': isWindowContainer,
        'virtual-scroll--table': isTable,
        'virtual-scroll--hide-scrollbar': showVirtualScrollbars,
      },
    ]"
    :style="containerStyle"
    tabindex="0"
    @keydown="handleKeyDown"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  >
    <div
      v-if="showVirtualScrollbars"
      class="virtual-scroll-scrollbar-container"
    >
      <div
        class="virtual-scroll-scrollbar-viewport"
        :style="{
          'inlineSize': `${ scrollDetails.displayViewportSize.width }px`,
          'blockSize': `${ scrollDetails.displayViewportSize.height }px`,
          '--vsi-scrollbar-has-cross-gap': direction === 'both' ? 1 : 0,
        }"
      >
        <slot v-if="slots.scrollbar && verticalScrollbarProps" name="scrollbar" v-bind="verticalScrollbarProps" />
        <VirtualScrollbar v-else-if="verticalScrollbarProps" v-bind="verticalScrollbarProps.scrollbarProps" />

        <slot v-if="slots.scrollbar && horizontalScrollbarProps" name="scrollbar" v-bind="horizontalScrollbarProps" />
        <VirtualScrollbar v-else-if="horizontalScrollbarProps" v-bind="horizontalScrollbarProps.scrollbarProps" />
      </div>
    </div>

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
          :column-range="slotColumnRange"
          :get-column-width="getColumnWidth"
          :gap="props.gap"
          :column-gap="props.columnGap"
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

  &.virtual-scroll--hide-scrollbar {
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &.virtual-scroll--horizontal,
  &.virtual-scroll--both {
    white-space: nowrap;
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
