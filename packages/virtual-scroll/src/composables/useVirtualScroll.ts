import type { Ref } from 'vue';

/* global ScrollToOptions */
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import { FenwickTree } from '../utils/fenwick-tree';
import { getPaddingX, getPaddingY, isElement, isScrollableElement, isScrollToIndexOptions } from '../utils/scroll';

export const DEFAULT_ITEM_SIZE = 50;
export const DEFAULT_COLUMN_WIDTH = 150;
export const DEFAULT_BUFFER = 5;

export type ScrollDirection = 'vertical' | 'horizontal' | 'both';
export type ScrollAlignment = 'start' | 'center' | 'end' | 'auto';

export interface ScrollAlignmentOptions {
  x?: ScrollAlignment;
  y?: ScrollAlignment;
}

export interface ScrollToIndexOptions {
  align?: ScrollAlignment | ScrollAlignmentOptions;
  behavior?: 'auto' | 'smooth';
  isCorrection?: boolean;
}

export interface VirtualScrollProps<T = unknown> {
  /** Array of items to be virtualized */
  items: T[];
  /** Fixed size of each item or a function that returns the size of an item */
  itemSize?: number | ((item: T, index: number) => number) | undefined;
  /** Direction of the scroll: 'vertical', 'horizontal', or 'both' */
  direction?: ScrollDirection | undefined;
  /** Number of items to render before the visible viewport */
  bufferBefore?: number | undefined;
  /** Number of items to render after the visible viewport */
  bufferAfter?: number | undefined;
  /** The scrollable container element or window */
  container?: HTMLElement | Window | null | undefined;
  /** The host element that contains the items */
  hostElement?: HTMLElement | null | undefined;
  /** Range of items to render for SSR */
  ssrRange?: {
    start: number;
    end: number;
    colStart?: number;
    colEnd?: number;
  } | undefined;
  /** Number of columns for bidirectional scroll */
  columnCount?: number | undefined;
  /** Fixed width of columns or an array of widths for alternating columns */
  columnWidth?: number | number[] | ((index: number) => number) | undefined;
  /** Padding at the start of the scroll container (e.g. for sticky headers) */
  scrollPaddingStart?: number | { x?: number; y?: number; } | undefined;
  /** Padding at the end of the scroll container */
  scrollPaddingEnd?: number | { x?: number; y?: number; } | undefined;
  /** Gap between items in pixels (vertical) */
  gap?: number | undefined;
  /** Gap between columns in pixels (horizontal/grid) */
  columnGap?: number | undefined;
  /** Indices of items that should stick to the top/start */
  stickyIndices?: number[] | undefined;
  /** Distance from the end of the scrollable area to trigger 'load' event */
  loadDistance?: number | undefined;
  /** Whether items are currently being loaded */
  loading?: boolean | undefined;
  /** Whether to restore scroll position when items are prepended */
  restoreScrollOnPrepend?: boolean | undefined;
  /** Initial scroll index to jump to on mount */
  initialScrollIndex?: number | undefined;
  /** Alignment for the initial scroll index */
  initialScrollAlign?: ScrollAlignment | ScrollAlignmentOptions | undefined;
  /** Default size for items before they are measured */
  defaultItemSize?: number | undefined;
  /** Default width for columns before they are measured */
  defaultColumnWidth?: number | undefined;
  /** Whether to enable debug mode (e.g. showing offsets) */
  debug?: boolean | undefined;
}

export interface RenderedItem<T = unknown> {
  item: T;
  index: number;
  offset: { x: number; y: number; };
  size: { width: number; height: number; };
  originalX: number;
  originalY: number;
  isSticky?: boolean;
  isStickyActive?: boolean;
  stickyOffset: { x: number; y: number; };
}

export interface ScrollDetails<T = unknown> {
  items: RenderedItem<T>[];
  currentIndex: number;
  currentColIndex: number;
  scrollOffset: { x: number; y: number; };
  viewportSize: { width: number; height: number; };
  totalSize: { width: number; height: number; };
  isScrolling: boolean;
  isProgrammaticScroll: boolean;
  /** Range of items currently being rendered */
  range: { start: number; end: number; };
  /** Range of columns currently being rendered (for grid mode) */
  columnRange: { start: number; end: number; padStart: number; padEnd: number; };
}

/**
 * Composable for virtual scrolling logic.
 * Handles calculation of visible items, scroll events, and dynamic item sizes.
 *
 * @param props - Reactive properties for virtual scroll configuration
 */
export function useVirtualScroll<T = unknown>(props: Ref<VirtualScrollProps<T>>) {
  // --- State ---
  const scrollX = ref(0);
  const scrollY = ref(0);
  const isScrolling = ref(false);
  const isHydrated = ref(false);
  const isHydrating = ref(false);
  const isMounted = ref(false);
  const viewportWidth = ref(0);
  const viewportHeight = ref(0);
  const hostOffset = reactive({ x: 0, y: 0 });
  let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  const isProgrammaticScroll = ref(false);

  // --- Fenwick Trees for efficient size and offset management ---
  const itemSizesX = new FenwickTree(props.value.items.length);
  const itemSizesY = new FenwickTree(props.value.items.length);
  const columnSizes = new FenwickTree(props.value.columnCount || 0);

  const treeUpdateFlag = ref(0);

  let measuredColumns = new Uint8Array(0);
  let measuredItemsX = new Uint8Array(0);
  let measuredItemsY = new Uint8Array(0);

  // --- Scroll Queue / Correction ---
  const pendingScroll = ref<{
    rowIndex: number | null | undefined;
    colIndex: number | null | undefined;
    options: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions | undefined;
  } | null>(null);

  // Track if sizes are initialized
  const sizesInitialized = ref(false);
  let lastItems: T[] = [];

  // --- Computed Config ---
  const isDynamicItemSize = computed(() =>
    props.value.itemSize === undefined || props.value.itemSize === null || props.value.itemSize === 0,
  );

  const isDynamicColumnWidth = computed(() =>
    props.value.columnWidth === undefined || props.value.columnWidth === null || props.value.columnWidth === 0,
  );

  const fixedItemSize = computed(() =>
    (typeof props.value.itemSize === 'number' && props.value.itemSize > 0) ? props.value.itemSize : null,
  );

  const defaultSize = computed(() => fixedItemSize.value || props.value.defaultItemSize || DEFAULT_ITEM_SIZE);

  const sortedStickyIndices = computed(() =>
    [ ...(props.value.stickyIndices || []) ].sort((a, b) => a - b),
  );

  // --- Size Calculations ---
  /**
   * Total width of all items in the scrollable area.
   */
  const totalWidth = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    if (!isHydrated.value && props.value.ssrRange && !isMounted.value) {
      const { start = 0, end = 0, colStart = 0, colEnd = 0 } = props.value.ssrRange;
      const colCount = props.value.columnCount || 0;
      if (props.value.direction === 'both' && colCount > 0) {
        return columnSizes.query(colEnd || colCount) - columnSizes.query(colStart);
      }
      /* v8 ignore else -- @preserve */
      if (props.value.direction === 'horizontal') {
        if (fixedItemSize.value !== null) {
          return (end - start) * (fixedItemSize.value + (props.value.columnGap || 0));
        }
        return itemSizesX.query(end) - itemSizesX.query(start);
      }
    }

    if (props.value.direction === 'both' && props.value.columnCount) {
      return columnSizes.query(props.value.columnCount);
    }
    if (props.value.direction === 'vertical') {
      return 0;
    }
    if (fixedItemSize.value !== null) {
      return props.value.items.length * (fixedItemSize.value + (props.value.columnGap || 0));
    }
    return itemSizesX.query(props.value.items.length);
  });

  /**
   * Total height of all items in the scrollable area.
   */
  const totalHeight = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    if (!isHydrated.value && props.value.ssrRange && !isMounted.value) {
      const { start, end } = props.value.ssrRange;
      /* v8 ignore else -- @preserve */
      if (props.value.direction === 'vertical' || props.value.direction === 'both') {
        if (fixedItemSize.value !== null) {
          return (end - start) * (fixedItemSize.value + (props.value.gap || 0));
        }
        return itemSizesY.query(end) - itemSizesY.query(start);
      }
    }

    if (props.value.direction === 'horizontal') {
      return 0;
    }
    if (fixedItemSize.value !== null) {
      return props.value.items.length * (fixedItemSize.value + (props.value.gap || 0));
    }
    return itemSizesY.query(props.value.items.length);
  });

  const relativeScrollX = computed(() => {
    const isHorizontal = props.value.direction === 'horizontal' || props.value.direction === 'both';
    const padding = isHorizontal ? getPaddingX(props.value.scrollPaddingStart, props.value.direction) : 0;
    return Math.max(0, scrollX.value + padding - hostOffset.x);
  });
  const relativeScrollY = computed(() => {
    const isVertical = props.value.direction === 'vertical' || props.value.direction === 'both';
    const padding = isVertical ? getPaddingY(props.value.scrollPaddingStart, props.value.direction) : 0;
    return Math.max(0, scrollY.value + padding - hostOffset.y);
  });

  // --- Scroll Helpers ---
  const getColumnWidth = (index: number) => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const cw = props.value.columnWidth;
    if (typeof cw === 'number' && cw > 0) {
      return cw;
    }
    if (Array.isArray(cw) && cw.length > 0) {
      return cw[ index % cw.length ] || DEFAULT_COLUMN_WIDTH;
    }
    if (typeof cw === 'function') {
      return cw(index);
    }
    return columnSizes.get(index) || props.value.defaultColumnWidth || DEFAULT_COLUMN_WIDTH;
  };

  // --- Public Scroll API ---
  /**
   * Scrolls to a specific row and column index.
   *
   * @param rowIndex - The row index to scroll to. Pass null to only scroll horizontally.
   * @param colIndex - The column index to scroll to. Pass null to only scroll vertically.
   * @param options - Scroll options including alignment ('start', 'center', 'end', 'auto') and behavior ('auto', 'smooth').
   */
  const scrollToIndex = (
    rowIndex: number | null | undefined,
    colIndex: number | null | undefined,
    options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions,
  ) => {
    const isCorrection = typeof options === 'object' && options !== null && 'isCorrection' in options
      ? options.isCorrection
      : false;

    if (!isCorrection) {
      pendingScroll.value = { rowIndex, colIndex, options };
    }

    const container = props.value.container || window;
    const fixedSize = fixedItemSize.value;
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;

    let align: ScrollAlignment | ScrollAlignmentOptions | undefined;
    let behavior: 'auto' | 'smooth' | undefined;

    if (isScrollToIndexOptions(options)) {
      align = options.align;
      behavior = options.behavior;
    } else {
      align = options as ScrollAlignment | ScrollAlignmentOptions;
    }

    const alignX = (typeof align === 'object' ? align.x : align) || 'auto';
    const alignY = (typeof align === 'object' ? align.y : align) || 'auto';

    const paddingStartX = getPaddingX(props.value.scrollPaddingStart, props.value.direction);
    const paddingEndX = getPaddingX(props.value.scrollPaddingEnd, props.value.direction);
    const paddingStartY = getPaddingY(props.value.scrollPaddingStart, props.value.direction);
    const paddingEndY = getPaddingY(props.value.scrollPaddingEnd, props.value.direction);

    const isVertical = props.value.direction === 'vertical' || props.value.direction === 'both';
    const isHorizontal = props.value.direction === 'horizontal' || props.value.direction === 'both';

    const usableWidth = viewportWidth.value - (isHorizontal ? (paddingStartX + paddingEndX) : 0);
    const usableHeight = viewportHeight.value - (isVertical ? (paddingStartY + paddingEndY) : 0);

    let targetX = relativeScrollX.value;
    let targetY = relativeScrollY.value;
    let itemWidth = 0;
    let itemHeight = 0;

    // Y calculation
    if (rowIndex !== null && rowIndex !== undefined) {
      if (rowIndex >= props.value.items.length) {
        targetY = totalHeight.value;
        itemHeight = 0;
      } else {
        targetY = fixedSize !== null ? rowIndex * (fixedSize + gap) : itemSizesY.query(rowIndex);
        itemHeight = fixedSize !== null ? fixedSize : itemSizesY.get(rowIndex) - gap;
      }

      // Apply Y Alignment
      if (alignY === 'start') {
        // targetY is already at the start of the list
      } else if (alignY === 'center') {
        targetY -= (usableHeight - itemHeight) / 2;
      } else if (alignY === 'end') {
        targetY -= (usableHeight - itemHeight);
      } else {
        const isVisibleY = targetY >= relativeScrollY.value && (targetY + itemHeight) <= (relativeScrollY.value + usableHeight);
        if (!isVisibleY) {
          if (targetY < relativeScrollY.value) {
            // keep targetY at start
          } else {
            targetY -= (usableHeight - itemHeight);
          }
        }
      }
    }

    // X calculation
    if (colIndex !== null && colIndex !== undefined) {
      const totalCols = props.value.columnCount || 0;
      if (colIndex >= totalCols && totalCols > 0) {
        targetX = totalWidth.value;
        itemWidth = 0;
      } else if (props.value.direction === 'horizontal') {
        targetX = fixedSize !== null ? colIndex * (fixedSize + columnGap) : itemSizesX.query(colIndex);
        itemWidth = fixedSize !== null ? fixedSize : itemSizesX.get(colIndex) - columnGap;
      } else {
        targetX = columnSizes.query(colIndex);
        itemWidth = columnSizes.get(colIndex);
      }

      // Apply X Alignment
      if (alignX === 'start') {
        // targetX is already at the start of the list
      } else if (alignX === 'center') {
        targetX -= (usableWidth - itemWidth) / 2;
      } else if (alignX === 'end') {
        targetX -= (usableWidth - itemWidth);
      } else {
        const isVisibleX = targetX >= relativeScrollX.value && (targetX + itemWidth) <= (relativeScrollX.value + usableWidth);
        if (!isVisibleX) {
          /* v8 ignore if -- @preserve */
          if (targetX < relativeScrollX.value) {
            // keep targetX at start
          } else {
            targetX -= (usableWidth - itemWidth);
          }
        }
      }
    }

    // Clamp to valid range
    targetX = Math.max(0, Math.min(targetX, Math.max(0, totalWidth.value - usableWidth)));
    targetY = Math.max(0, Math.min(targetY, Math.max(0, totalHeight.value - usableHeight)));

    const finalX = targetX + hostOffset.x - (isHorizontal ? paddingStartX : 0);
    const finalY = targetY + hostOffset.y - (isVertical ? paddingStartY : 0);

    // Check if we reached the target
    const tolerance = 1;
    let reachedX = (colIndex === null || colIndex === undefined) || Math.abs(relativeScrollX.value - targetX) < tolerance;
    let reachedY = (rowIndex === null || rowIndex === undefined) || Math.abs(relativeScrollY.value - targetY) < tolerance;

    if (!reachedX || !reachedY) {
      let curX = 0;
      let curY = 0;
      let maxW = 0;
      let maxH = 0;
      let viewW = 0;
      let viewH = 0;

      /* v8 ignore else -- @preserve */
      if (typeof window !== 'undefined') {
        if (container === window) {
          curX = window.scrollX;
          curY = window.scrollY;
          maxW = document.documentElement.scrollWidth;
          maxH = document.documentElement.scrollHeight;
          viewW = window.innerWidth;
          viewH = window.innerHeight;
        } else if (isElement(container)) {
          curX = container.scrollLeft;
          curY = container.scrollTop;
          maxW = container.scrollWidth;
          maxH = container.scrollHeight;
          viewW = container.clientWidth;
          viewH = container.clientHeight;
        }

        if (!reachedX && colIndex !== null && colIndex !== undefined) {
          const atLeft = curX <= tolerance && finalX <= tolerance;
          const atRight = curX >= maxW - viewW - tolerance && finalX >= maxW - viewW - tolerance;
          /* v8 ignore else -- @preserve */
          if (atLeft || atRight) {
            reachedX = true;
          }
        }

        if (!reachedY && rowIndex !== null && rowIndex !== undefined) {
          const atTop = curY <= tolerance && finalY <= tolerance;
          const atBottom = curY >= maxH - viewH - tolerance && finalY >= maxH - viewH - tolerance;
          if (atTop || atBottom) {
            reachedY = true;
          }
        }
      }
    }

    const scrollBehavior = isCorrection ? 'auto' : (behavior || 'smooth');
    isProgrammaticScroll.value = true;

    if (typeof window !== 'undefined' && container === window) {
      window.scrollTo({
        left: (colIndex === null || colIndex === undefined) ? undefined : Math.max(0, finalX),
        top: (rowIndex === null || rowIndex === undefined) ? undefined : Math.max(0, finalY),
        behavior: scrollBehavior,
      } as ScrollToOptions);
    } else if (isScrollableElement(container)) {
      const scrollOptions: ScrollToOptions = {
        behavior: scrollBehavior,
      };

      if (colIndex !== null && colIndex !== undefined) {
        scrollOptions.left = Math.max(0, finalX);
      }
      if (rowIndex !== null && rowIndex !== undefined) {
        scrollOptions.top = Math.max(0, finalY);
      }

      if (typeof container.scrollTo === 'function') {
        container.scrollTo(scrollOptions);
      } else {
        if (scrollOptions.left !== undefined) {
          container.scrollLeft = scrollOptions.left;
        }
        if (scrollOptions.top !== undefined) {
          container.scrollTop = scrollOptions.top;
        }
      }
    }

    if (scrollBehavior === 'auto' || scrollBehavior === undefined) {
      if (colIndex !== null && colIndex !== undefined) {
        scrollX.value = Math.max(0, finalX);
      }
      if (rowIndex !== null && rowIndex !== undefined) {
        scrollY.value = Math.max(0, finalY);
      }
    }

    if (reachedX && reachedY && !isScrolling.value) {
      pendingScroll.value = null;
    }
  };

  /**
   * Programmatically scroll to a specific pixel offset relative to the content start.
   *
   * @param x - The pixel offset to scroll to on the X axis. Pass null to keep current position.
   * @param y - The pixel offset to scroll to on the Y axis. Pass null to keep current position.
   * @param options - Scroll options (behavior)
   * @param options.behavior - The scroll behavior ('auto' | 'smooth')
   */
  const scrollToOffset = (x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => {
    const container = props.value.container || window;
    isProgrammaticScroll.value = true;

    const isVertical = props.value.direction === 'vertical' || props.value.direction === 'both';
    const isHorizontal = props.value.direction === 'horizontal' || props.value.direction === 'both';

    const paddingStartX = getPaddingX(props.value.scrollPaddingStart, props.value.direction);
    const paddingStartY = getPaddingY(props.value.scrollPaddingStart, props.value.direction);
    const paddingEndX = getPaddingX(props.value.scrollPaddingEnd, props.value.direction);
    const paddingEndY = getPaddingY(props.value.scrollPaddingEnd, props.value.direction);

    const usableWidth = viewportWidth.value - (isHorizontal ? (paddingStartX + paddingEndX) : 0);
    const usableHeight = viewportHeight.value - (isVertical ? (paddingStartY + paddingEndY) : 0);

    const clampedX = (x !== null && x !== undefined)
      ? Math.max(0, Math.min(x, Math.max(0, totalWidth.value - usableWidth)))
      : null;
    const clampedY = (y !== null && y !== undefined)
      ? Math.max(0, Math.min(y, Math.max(0, totalHeight.value - usableHeight)))
      : null;

    const currentX = (typeof window !== 'undefined' && container === window ? window.scrollX : (container as HTMLElement).scrollLeft);
    const currentY = (typeof window !== 'undefined' && container === window ? window.scrollY : (container as HTMLElement).scrollTop);

    const targetX = (clampedX !== null) ? clampedX + hostOffset.x - (isHorizontal ? paddingStartX : 0) : currentX;
    const targetY = (clampedY !== null) ? clampedY + hostOffset.y - (isVertical ? paddingStartY : 0) : currentY;

    if (typeof window !== 'undefined' && container === window) {
      window.scrollTo({
        left: (x !== null && x !== undefined) ? targetX : undefined,
        top: (y !== null && y !== undefined) ? targetY : undefined,
        behavior: options?.behavior || 'auto',
      } as ScrollToOptions);
    } else if (isScrollableElement(container)) {
      const scrollOptions: ScrollToOptions = {
        behavior: options?.behavior || 'auto',
      };

      if (x !== null && x !== undefined) {
        scrollOptions.left = targetX;
      }
      if (y !== null && y !== undefined) {
        scrollOptions.top = targetY;
      }

      if (typeof container.scrollTo === 'function') {
        container.scrollTo(scrollOptions);
      } else {
        if (scrollOptions.left !== undefined) {
          container.scrollLeft = scrollOptions.left;
        }
        if (scrollOptions.top !== undefined) {
          container.scrollTop = scrollOptions.top;
        }
      }
    }

    if (options?.behavior === 'auto' || options?.behavior === undefined) {
      if (x !== null && x !== undefined) {
        scrollX.value = targetX;
      }
      if (y !== null && y !== undefined) {
        scrollY.value = targetY;
      }
    }
  };

  // --- Measurement & Initialization ---
  const initializeSizes = () => {
    const newItems = props.value.items;
    const len = newItems.length;
    const colCount = props.value.columnCount || 0;

    itemSizesX.resize(len);
    itemSizesY.resize(len);
    columnSizes.resize(colCount);

    if (measuredItemsX.length !== len) {
      const newMeasuredX = new Uint8Array(len);
      newMeasuredX.set(measuredItemsX.subarray(0, Math.min(len, measuredItemsX.length)));
      measuredItemsX = newMeasuredX;
    }
    if (measuredItemsY.length !== len) {
      const newMeasuredY = new Uint8Array(len);
      newMeasuredY.set(measuredItemsY.subarray(0, Math.min(len, measuredItemsY.length)));
      measuredItemsY = newMeasuredY;
    }
    if (measuredColumns.length !== colCount) {
      const newMeasuredCols = new Uint8Array(colCount);
      newMeasuredCols.set(measuredColumns.subarray(0, Math.min(colCount, measuredColumns.length)));
      measuredColumns = newMeasuredCols;
    }

    let prependCount = 0;
    if (props.value.restoreScrollOnPrepend && lastItems.length > 0 && len > lastItems.length) {
      const oldFirstItem = lastItems[ 0 ];
      /* v8 ignore else -- @preserve */
      if (oldFirstItem !== undefined) {
        for (let i = 1; i <= len - lastItems.length; i++) {
          if (newItems[ i ] === oldFirstItem) {
            prependCount = i;
            break;
          }
        }
      }
    }

    if (prependCount > 0) {
      itemSizesX.shift(prependCount);
      itemSizesY.shift(prependCount);

      if (pendingScroll.value && pendingScroll.value.rowIndex !== null && pendingScroll.value.rowIndex !== undefined) {
        pendingScroll.value.rowIndex += prependCount;
      }

      const newMeasuredX = new Uint8Array(len);
      const newMeasuredY = new Uint8Array(len);
      newMeasuredX.set(measuredItemsX.subarray(0, Math.min(len - prependCount, measuredItemsX.length)), prependCount);
      newMeasuredY.set(measuredItemsY.subarray(0, Math.min(len - prependCount, measuredItemsY.length)), prependCount);
      measuredItemsX = newMeasuredX;
      measuredItemsY = newMeasuredY;

      // Calculate added size
      const gap = props.value.gap || 0;
      const columnGap = props.value.columnGap || 0;
      let addedX = 0;
      let addedY = 0;

      for (let i = 0; i < prependCount; i++) {
        const size = typeof props.value.itemSize === 'function'
          ? props.value.itemSize(newItems[ i ] as T, i)
          : defaultSize.value;

        if (props.value.direction === 'horizontal') {
          addedX += size + columnGap;
        } else {
          addedY += size + gap;
        }
      }

      /* v8 ignore else -- @preserve */
      if (addedX > 0 || addedY > 0) {
        nextTick(() => {
          scrollToOffset(
            addedX > 0 ? relativeScrollX.value + addedX : null,
            addedY > 0 ? relativeScrollY.value + addedY : null,
            { behavior: 'auto' },
          );
        });
      }
    }

    // Initialize columns if fixed width is provided
    if (colCount > 0) {
      const columnGap = props.value.columnGap || 0;
      let colNeedsRebuild = false;
      for (let i = 0; i < colCount; i++) {
        const width = getColumnWidth(i);
        const currentW = columnSizes.get(i);

        // Only initialize from getColumnWidth if it's not dynamic,
        // OR if it's dynamic but we don't have a measurement yet.
        if (!isDynamicColumnWidth.value || currentW === 0) {
          const targetW = width + columnGap;
          /* v8 ignore else -- @preserve */
          if (Math.abs(currentW - targetW) > 0.5) {
            columnSizes.set(i, targetW);
            colNeedsRebuild = true;
          }
        }
      }
      if (colNeedsRebuild) {
        columnSizes.rebuild();
      }
    }

    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;
    let itemsNeedRebuild = false;

    for (let i = 0; i < len; i++) {
      const item = props.value.items[ i ];
      const currentX = itemSizesX.get(i);
      const currentY = itemSizesY.get(i);

      // If it's dynamic and already has a measurement, keep it.
      if (isDynamicItemSize.value && (currentX > 0 || currentY > 0)) {
        continue;
      }

      const size = typeof props.value.itemSize === 'function'
        ? props.value.itemSize(item as T, i)
        : defaultSize.value;

      const isVertical = props.value.direction === 'vertical';
      const isHorizontal = props.value.direction === 'horizontal';
      const isBoth = props.value.direction === 'both';

      const targetX = isHorizontal ? size + columnGap : 0;
      const targetY = (isVertical || isBoth) ? size + gap : 0;

      if (Math.abs(currentX - targetX) > 0.5) {
        itemSizesX.set(i, targetX);
        itemsNeedRebuild = true;
      }
      if (Math.abs(currentY - targetY) > 0.5) {
        itemSizesY.set(i, targetY);
        itemsNeedRebuild = true;
      }
    }

    if (itemsNeedRebuild) {
      itemSizesX.rebuild();
      itemSizesY.rebuild();
    }

    lastItems = [ ...newItems ];
    sizesInitialized.value = true;
    treeUpdateFlag.value++;
  };

  /**
   * Updates the host element's offset relative to the scroll container.
   */
  const updateHostOffset = () => {
    if (props.value.hostElement && typeof window !== 'undefined') {
      const rect = props.value.hostElement.getBoundingClientRect();
      const container = props.value.container || window;

      let newX = 0;
      let newY = 0;

      if (container === window) {
        newX = rect.left + window.scrollX;
        newY = rect.top + window.scrollY;
      } else if (container === props.value.hostElement) {
        newX = 0;
        newY = 0;
      } else if (isElement(container)) {
        const containerRect = container.getBoundingClientRect();
        newX = rect.left - containerRect.left + container.scrollLeft;
        newY = rect.top - containerRect.top + container.scrollTop;
      }

      if (Math.abs(hostOffset.x - newX) > 0.1 || Math.abs(hostOffset.y - newY) > 0.1) {
        hostOffset.x = newX;
        hostOffset.y = newY;
      }
    }
  };

  watch([
    () => props.value.items.length,
    () => props.value.columnCount,
    () => props.value.columnWidth,
    () => props.value.itemSize,
    () => props.value.gap,
    () => props.value.columnGap,
  ], initializeSizes, { immediate: true });

  watch(() => [ props.value.container, props.value.hostElement ], () => {
    updateHostOffset();
  });

  // --- Range & Visible Items ---
  /**
   * Current range of items that should be rendered.
   */
  const range = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    if ((!isHydrated.value || isHydrating.value) && props.value.ssrRange) {
      return {
        start: props.value.ssrRange.start,
        end: props.value.ssrRange.end,
      };
    }

    const direction = props.value.direction || 'vertical';
    const bufferBefore = (props.value.ssrRange && !isScrolling.value) ? 0 : (props.value.bufferBefore ?? DEFAULT_BUFFER);
    const bufferAfter = props.value.bufferAfter ?? DEFAULT_BUFFER;
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;
    const fixedSize = fixedItemSize.value;
    const paddingStartX = getPaddingX(props.value.scrollPaddingStart, direction);
    const paddingEndX = getPaddingX(props.value.scrollPaddingEnd, direction);
    const paddingStartY = getPaddingY(props.value.scrollPaddingStart, direction);
    const paddingEndY = getPaddingY(props.value.scrollPaddingEnd, direction);

    const isVertical = direction === 'vertical' || direction === 'both';
    const isHorizontal = direction === 'horizontal' || direction === 'both';

    const usableWidth = viewportWidth.value - (isHorizontal ? (paddingStartX + paddingEndX) : 0);
    const usableHeight = viewportHeight.value - (isVertical ? (paddingStartY + paddingEndY) : 0);

    let start = 0;
    let end = props.value.items.length;

    if (isVertical) {
      if (fixedSize !== null) {
        start = Math.floor(relativeScrollY.value / (fixedSize + gap));
        end = Math.ceil((relativeScrollY.value + usableHeight) / (fixedSize + gap));
      } else {
        start = itemSizesY.findLowerBound(relativeScrollY.value);
        let currentY = itemSizesY.query(start);
        let i = start;
        while (i < props.value.items.length && currentY < relativeScrollY.value + usableHeight) {
          currentY = itemSizesY.query(++i);
        }
        end = i;
      }
    } else {
      if (fixedSize !== null) {
        start = Math.floor(relativeScrollX.value / (fixedSize + columnGap));
        end = Math.ceil((relativeScrollX.value + usableWidth) / (fixedSize + columnGap));
      } else {
        start = itemSizesX.findLowerBound(relativeScrollX.value);
        let currentX = itemSizesX.query(start);
        let i = start;
        while (i < props.value.items.length && currentX < relativeScrollX.value + usableWidth) {
          currentX = itemSizesX.query(++i);
        }
        end = i;
      }
    }

    return {
      start: Math.max(0, start - bufferBefore),
      end: Math.min(props.value.items.length, end + bufferAfter),
    };
  });

  /**
   * Index of the first visible item in the viewport.
   */
  const currentIndex = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const fixedSize = fixedItemSize.value;
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;

    if (props.value.direction === 'horizontal') {
      if (fixedSize !== null) {
        return Math.floor(relativeScrollX.value / (fixedSize + columnGap));
      }
      return itemSizesX.findLowerBound(relativeScrollX.value);
    }
    if (fixedSize !== null) {
      return Math.floor(relativeScrollY.value / (fixedSize + gap));
    }
    return itemSizesY.findLowerBound(relativeScrollY.value);
  });

  /**
   * List of items to be rendered with their calculated offsets and sizes.
   */
  const renderedItems = computed<RenderedItem<T>[]>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const { start, end } = range.value;
    const items: RenderedItem<T>[] = [];
    const fixedSize = fixedItemSize.value;
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;
    const stickyIndices = sortedStickyIndices.value;

    // Always include relevant sticky items
    const indicesToRender = new Set<number>();
    for (let i = start; i < end; i++) {
      indicesToRender.add(i);
    }

    if (isHydrated.value || !props.value.ssrRange) {
      const activeIdx = currentIndex.value;
      // find the largest index in stickyIndices that is < activeIdx
      let prevStickyIdx: number | undefined;
      let low = 0;
      let high = stickyIndices.length - 1;
      while (low <= high) {
        const mid = (low + high) >>> 1;
        if (stickyIndices[ mid ]! < activeIdx) {
          prevStickyIdx = stickyIndices[ mid ];
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (prevStickyIdx !== undefined) {
        indicesToRender.add(prevStickyIdx);
      }

      for (const idx of stickyIndices) {
        if (idx >= start && idx < end) {
          indicesToRender.add(idx);
        }
      }
    }

    const sortedIndices = Array.from(indicesToRender).sort((a, b) => a - b);

    const ssrStartRow = props.value.ssrRange?.start || 0;
    const ssrStartCol = props.value.ssrRange?.colStart || 0;

    let ssrOffsetX = 0;
    let ssrOffsetY = 0;

    if (!isHydrated.value && props.value.ssrRange) {
      ssrOffsetY = (props.value.direction === 'vertical' || props.value.direction === 'both')
        ? (fixedSize !== null ? ssrStartRow * (fixedSize + gap) : itemSizesY.query(ssrStartRow))
        : 0;

      if (props.value.direction === 'horizontal') {
        ssrOffsetX = fixedSize !== null ? ssrStartCol * (fixedSize + columnGap) : itemSizesX.query(ssrStartCol);
      } else if (props.value.direction === 'both') {
        ssrOffsetX = columnSizes.query(ssrStartCol);
      }
    }

    for (const i of sortedIndices) {
      const item = props.value.items[ i ];
      if (item === undefined) {
        continue;
      }

      let x = 0;
      let y = 0;
      let width = 0;
      let height = 0;

      if (props.value.direction === 'horizontal') {
        x = fixedSize !== null ? i * (fixedSize + columnGap) : itemSizesX.query(i);
        width = fixedSize !== null ? fixedSize : itemSizesX.get(i) - columnGap;
        height = viewportHeight.value;
      } else {
        // vertical or both
        y = (props.value.direction === 'vertical' || props.value.direction === 'both') && fixedSize !== null ? i * (fixedSize + gap) : itemSizesY.query(i);
        height = fixedSize !== null ? fixedSize : itemSizesY.get(i) - gap;
        width = props.value.direction === 'both' ? totalWidth.value : viewportWidth.value;
      }

      const isSticky = stickyIndices.includes(i);
      const originalX = x;
      const originalY = y;
      let isStickyActive = false;
      const stickyOffset = { x: 0, y: 0 };

      if (isSticky) {
        if (props.value.direction === 'vertical' || props.value.direction === 'both') {
          if (relativeScrollY.value > originalY) {
            isStickyActive = true;
            // Check if next sticky item pushes this one
            let nextStickyIdx: number | undefined;
            let low = 0;
            let high = stickyIndices.length - 1;
            while (low <= high) {
              const mid = (low + high) >>> 1;
              if (stickyIndices[ mid ]! > i) {
                nextStickyIdx = stickyIndices[ mid ];
                high = mid - 1;
              } else {
                low = mid + 1;
              }
            }

            if (nextStickyIdx !== undefined) {
              const nextStickyY = fixedSize !== null ? nextStickyIdx * (fixedSize + gap) : itemSizesY.query(nextStickyIdx);
              const distance = nextStickyY - relativeScrollY.value;
              /* v8 ignore else -- @preserve */
              if (distance < height) {
                stickyOffset.y = -(height - distance);
              }
            }
          }
        } else if (props.value.direction === 'horizontal') {
          if (relativeScrollX.value > originalX) {
            isStickyActive = true;
            // Check if next sticky item pushes this one
            let nextStickyIdx: number | undefined;
            let low = 0;
            let high = stickyIndices.length - 1;
            while (low <= high) {
              const mid = (low + high) >>> 1;
              if (stickyIndices[ mid ]! > i) {
                nextStickyIdx = stickyIndices[ mid ];
                high = mid - 1;
              } else {
                low = mid + 1;
              }
            }

            if (nextStickyIdx !== undefined) {
              const nextStickyX = fixedSize !== null ? nextStickyIdx * (fixedSize + columnGap) : itemSizesX.query(nextStickyIdx);
              const distance = nextStickyX - relativeScrollX.value;
              /* v8 ignore else -- @preserve */
              if (distance < width) {
                stickyOffset.x = -(width - distance);
              }
            }
          }
        }
      }

      items.push({
        item,
        index: i,
        offset: { x: originalX - ssrOffsetX, y: originalY - ssrOffsetY },
        size: { width, height },
        originalX,
        originalY,
        isSticky,
        isStickyActive,
        stickyOffset,
      });
    }
    return items;
  });

  const columnRange = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const totalCols = props.value.columnCount || 0;

    if (!totalCols) {
      return { start: 0, end: 0, padStart: 0, padEnd: 0 };
    }

    if ((!isHydrated.value || isHydrating.value) && props.value.ssrRange) {
      const { colStart = 0, colEnd = 0 } = props.value.ssrRange;
      const safeStart = Math.max(0, colStart);
      const safeEnd = Math.min(totalCols, colEnd || totalCols);
      return {
        start: safeStart,
        end: safeEnd,
        padStart: 0,
        padEnd: 0,
      };
    }

    const start = columnSizes.findLowerBound(relativeScrollX.value);
    let currentX = columnSizes.query(start);
    let end = start;

    while (end < totalCols && currentX < relativeScrollX.value + viewportWidth.value) {
      currentX = columnSizes.query(++end);
    }

    const colBuffer = (props.value.ssrRange && !isScrolling.value) ? 0 : 2;

    // Add buffer of columns
    const safeStart = Math.max(0, start - colBuffer);
    const safeEnd = Math.min(totalCols, end + colBuffer);

    return {
      start: safeStart,
      end: safeEnd,
      padStart: columnSizes.query(safeStart),
      padEnd: columnSizes.query(totalCols) - columnSizes.query(safeEnd),
    };
  });

  /**
   * Detailed information about the current scroll state.
   */
  const scrollDetails = computed<ScrollDetails<T>>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const fixedSize = fixedItemSize.value;
    const columnGap = props.value.columnGap || 0;

    let currentColIndex = 0;
    if (props.value.direction === 'horizontal' || props.value.direction === 'both') {
      if (fixedSize !== null) {
        currentColIndex = Math.floor(relativeScrollX.value / (fixedSize + columnGap));
      } else {
        currentColIndex = itemSizesX.findLowerBound(relativeScrollX.value);
      }
    }

    return {
      items: renderedItems.value,
      currentIndex: currentIndex.value,
      currentColIndex,
      scrollOffset: { x: relativeScrollX.value, y: relativeScrollY.value },
      viewportSize: { width: viewportWidth.value, height: viewportHeight.value },
      totalSize: { width: totalWidth.value, height: totalHeight.value },
      isScrolling: isScrolling.value,
      isProgrammaticScroll: isProgrammaticScroll.value,
      range: range.value,
      columnRange: columnRange.value,
    };
  });

  // --- Event Handlers & Lifecycle ---
  /**
   * Stops any currently active programmatic scroll and clears pending corrections.
   */
  const stopProgrammaticScroll = () => {
    isProgrammaticScroll.value = false;
    pendingScroll.value = null;
  };

  /**
   * Event handler for scroll events.
   */
  const handleScroll = (e: Event) => {
    const target = e.target;
    if (typeof window === 'undefined') {
      return;
    }

    if (target === window || target === document) {
      scrollX.value = window.scrollX;
      scrollY.value = window.scrollY;
    } else if (isScrollableElement(target)) {
      scrollX.value = target.scrollLeft;
      scrollY.value = target.scrollTop;
    }

    if (!isScrolling.value) {
      if (!isProgrammaticScroll.value) {
        pendingScroll.value = null;
      }
      isScrolling.value = true;
    }
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling.value = false;
      isProgrammaticScroll.value = false;
    }, 250);
  };

  /**
   * Updates the size of multiple items in the Fenwick tree.
   *
   * @param updates - Array of updates
   */
  const updateItemSizes = (updates: Array<{ index: number; inlineSize: number; blockSize: number; element?: HTMLElement | undefined; }>) => {
    let needUpdate = false;
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;

    for (const { index, inlineSize, blockSize, element } of updates) {
      if (isDynamicItemSize.value) {
        if (props.value.direction === 'horizontal') {
          const oldWidth = itemSizesX.get(index);
          const targetWidth = inlineSize + columnGap;
          if (Math.abs(oldWidth - targetWidth) > 0.5 && (targetWidth > oldWidth || !measuredItemsX[ index ])) {
            itemSizesX.update(index, targetWidth - oldWidth);
            measuredItemsX[ index ] = 1;
            needUpdate = true;
          }
        }
        if (props.value.direction === 'vertical' || props.value.direction === 'both') {
          const oldHeight = itemSizesY.get(index);
          const targetHeight = blockSize + gap;
          // For grid, keep max height encountered to avoid shrinking on horizontal scroll
          if (props.value.direction === 'both') {
            if (targetHeight > oldHeight || !measuredItemsY[ index ]) {
              itemSizesY.update(index, targetHeight - oldHeight);
              measuredItemsY[ index ] = 1;
              needUpdate = true;
            }
          } else if (Math.abs(oldHeight - targetHeight) > 0.5 && (targetHeight > oldHeight || !measuredItemsY[ index ])) {
            itemSizesY.update(index, targetHeight - oldHeight);
            measuredItemsY[ index ] = 1;
            needUpdate = true;
          }
        }
      }

      // Dynamic column width measurement
      if (
        props.value.direction === 'both'
        && element
        && props.value.columnCount
        && isDynamicColumnWidth.value
      ) {
        const cells = element.dataset.colIndex !== undefined
          ? [ element ]
          : Array.from(element.querySelectorAll('[data-col-index]')) as HTMLElement[];

        for (const child of cells) {
          const colIndex = Number.parseInt(child.dataset.colIndex!, 10);

          /* v8 ignore else -- @preserve */
          if (colIndex >= 0 && colIndex < (props.value.columnCount || 0)) {
            const w = child.offsetWidth;
            const oldW = columnSizes.get(colIndex);
            const targetW = w + columnGap;
            /* v8 ignore else -- @preserve */
            if (targetW > oldW || !measuredColumns[ colIndex ]) {
              columnSizes.update(colIndex, targetW - oldW);
              measuredColumns[ colIndex ] = 1;
              needUpdate = true;
            }
          }
        }
      }
    }

    if (needUpdate) {
      treeUpdateFlag.value++;
    }
  };

  /**
   * Updates the size of a specific item in the Fenwick tree.
   *
   * @param index - Index of the item
   * @param inlineSize - New inlineSize
   * @param blockSize - New blockSize
   * @param element - The element that was measured (optional)
   */
  const updateItemSize = (index: number, inlineSize: number, blockSize: number, element?: HTMLElement) => {
    updateItemSizes([ { index, inlineSize, blockSize, element } ]);
  };

  // --- Scroll Queue / Correction Watchers ---
  const checkPendingScroll = () => {
    if (pendingScroll.value && !isHydrating.value) {
      const { rowIndex, colIndex, options } = pendingScroll.value;
      const correctionOptions: ScrollToIndexOptions = isScrollToIndexOptions(options)
        ? { ...options, isCorrection: true }
        : { align: options as ScrollAlignment | ScrollAlignmentOptions, isCorrection: true };
      scrollToIndex(rowIndex, colIndex, correctionOptions);
    }
  };

  watch(treeUpdateFlag, checkPendingScroll);

  watch(isScrolling, (scrolling) => {
    if (!scrolling) {
      checkPendingScroll();
    }
  });

  let resizeObserver: ResizeObserver | null = null;

  const attachEvents = (container: HTMLElement | Window | null) => {
    if (!container || typeof window === 'undefined') {
      return;
    }
    const scrollTarget = container === window ? document : container;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    if (container === window) {
      viewportWidth.value = window.innerWidth;
      viewportHeight.value = window.innerHeight;
      scrollX.value = window.scrollX;
      scrollY.value = window.scrollY;

      const onResize = () => {
        viewportWidth.value = window.innerWidth;
        viewportHeight.value = window.innerHeight;
        updateHostOffset();
      };
      window.addEventListener('resize', onResize);
      return () => {
        scrollTarget.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', onResize);
      };
    } else {
      viewportWidth.value = (container as HTMLElement).clientWidth;
      viewportHeight.value = (container as HTMLElement).clientHeight;
      scrollX.value = (container as HTMLElement).scrollLeft;
      scrollY.value = (container as HTMLElement).scrollTop;

      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          /* v8 ignore else -- @preserve */
          if (entry.target === container) {
            viewportWidth.value = (container as HTMLElement).clientWidth;
            viewportHeight.value = (container as HTMLElement).clientHeight;
            updateHostOffset();
          }
        }
      });
      resizeObserver.observe(container as HTMLElement);
      return () => {
        scrollTarget.removeEventListener('scroll', handleScroll);
        resizeObserver?.disconnect();
      };
    }
  };

  let cleanup: (() => void) | undefined;

  if (getCurrentInstance()) {
    onMounted(() => {
      isMounted.value = true;

      watch(() => props.value.container, (newContainer) => {
        cleanup?.();
        cleanup = attachEvents(newContainer || null);
      }, { immediate: true });

      updateHostOffset();

      if (props.value.ssrRange || props.value.initialScrollIndex !== undefined) {
        nextTick(() => {
          updateHostOffset();
          const initialIndex = props.value.initialScrollIndex !== undefined
            ? props.value.initialScrollIndex
            : props.value.ssrRange?.start;
          const initialAlign = props.value.initialScrollAlign || 'start';

          /* v8 ignore else -- @preserve */
          if (initialIndex !== undefined && initialIndex !== null) {
            scrollToIndex(initialIndex, props.value.ssrRange?.colStart, { align: initialAlign, behavior: 'auto' });
          }

          isHydrated.value = true;
          isHydrating.value = true;
          nextTick(() => {
            isHydrating.value = false;
          });
        });
      } else {
        isHydrated.value = true;
      }
    });

    onUnmounted(() => {
      cleanup?.();
    });
  }

  /**
   * The list of items currently rendered in the DOM.
   */
  const refresh = () => {
    itemSizesX.resize(0);
    itemSizesY.resize(0);
    columnSizes.resize(0);
    measuredColumns.fill(0);
    measuredItemsX.fill(0);
    measuredItemsY.fill(0);
    initializeSizes();
  };

  return {
    /**
     * Array of items to be rendered with their calculated offsets and sizes.
     */
    renderedItems,
    /**
     * Total calculated width of all items including gaps.
     */
    totalWidth,
    /**
     * Total calculated height of all items including gaps.
     */
    totalHeight,
    /**
     * Detailed information about the current scroll state.
     * Includes currentIndex, scrollOffset, viewportSize, totalSize, and isScrolling.
     */
    scrollDetails,
    /**
     * Programmatically scroll to a specific row and/or column.
     * @param rowIndex - The row index to scroll to
     * @param colIndex - The column index to scroll to
     * @param options - Alignment and behavior options
     */
    scrollToIndex,
    /**
     * Programmatically scroll to a specific pixel offset.
     * @param x - The pixel offset to scroll to on the X axis
     * @param y - The pixel offset to scroll to on the Y axis
     * @param options - Behavior options
     */
    scrollToOffset,
    /**
     * Stops any currently active programmatic scroll and clears pending corrections.
     */
    stopProgrammaticScroll,
    /**
     * Updates the stored size of an item. Should be called when an item is measured (e.g., via ResizeObserver).
     * @param index - The item index
     * @param width - The measured width
     * @param height - The measured height
     * @param element - The measured element (optional, used for grid column detection)
     */
    updateItemSize,
    /**
     * Updates the stored size of multiple items. Should be called when items are measured (e.g., via ResizeObserver).
     * @param updates - Array of item updates
     */
    updateItemSizes,
    /**
     * Recalculates the host element's offset relative to the scroll container.
     */
    updateHostOffset,
    /**
     * Information about the current visible range of columns.
     */
    columnRange,
    /**
     * Helper to get the width of a specific column based on current configuration.
     * @param index - The column index
     */
    getColumnWidth,
    /**
     * Resets all dynamic measurements and re-initializes from props.
     */
    refresh,
    /**
     * Whether the component has finished its first client-side mount and hydration.
     */
    isHydrated,
  };
}
