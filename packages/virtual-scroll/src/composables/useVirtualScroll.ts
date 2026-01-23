import type {
  RenderedItem,
  ScrollAlignment,
  ScrollAlignmentOptions,
  ScrollDetails,
  ScrollDirection,
  ScrollToIndexOptions,
  VirtualScrollProps,
} from '../types';
import type { Ref } from 'vue';

/* global ScrollToOptions */
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue';

import { FenwickTree } from '../utils/fenwick-tree';
import { getPaddingX, getPaddingY, isElement, isScrollableElement, isScrollToIndexOptions } from '../utils/scroll';
import {
  calculateColumnRange,
  calculateItemPosition,
  calculateRange,
  calculateScrollTarget,
  calculateStickyItem,
  calculateTotalSize,
} from '../utils/virtual-scroll-logic';

export {
  type RenderedItem,
  type ScrollAlignment,
  type ScrollAlignmentOptions,
  type ScrollDetails,
  type ScrollDirection,
  type ScrollToIndexOptions,
  type VirtualScrollProps,
};

export const DEFAULT_ITEM_SIZE = 40;
export const DEFAULT_COLUMN_WIDTH = 100;
export const DEFAULT_BUFFER = 5;

/**
 * Composable for virtual scrolling logic.
 * Handles calculation of visible items, scroll events, dynamic item sizes, and programmatic scrolling.
 *
 * @param props - A Ref to the configuration properties.
 * @see VirtualScrollProps
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
  const itemSizesX = new FenwickTree(props.value.items?.length || 0);
  const itemSizesY = new FenwickTree(props.value.items?.length || 0);
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

  const fixedColumnWidth = computed(() =>
    (typeof props.value.columnWidth === 'number' && props.value.columnWidth > 0) ? props.value.columnWidth : null,
  );

  const defaultSize = computed(() => props.value.defaultItemSize || fixedItemSize.value || DEFAULT_ITEM_SIZE);

  const sortedStickyIndices = computed(() =>
    [ ...(props.value.stickyIndices || []) ].sort((a, b) => a - b),
  );

  const stickyIndicesSet = computed(() => new Set(sortedStickyIndices.value));

  const paddingStartX = computed(() => getPaddingX(props.value.scrollPaddingStart, props.value.direction));
  const paddingEndX = computed(() => getPaddingX(props.value.scrollPaddingEnd, props.value.direction));
  const paddingStartY = computed(() => getPaddingY(props.value.scrollPaddingStart, props.value.direction));
  const paddingEndY = computed(() => getPaddingY(props.value.scrollPaddingEnd, props.value.direction));

  const usableWidth = computed(() => {
    const isHorizontal = props.value.direction === 'horizontal' || props.value.direction === 'both';
    return viewportWidth.value - (isHorizontal ? (paddingStartX.value + paddingEndX.value) : 0);
  });

  const usableHeight = computed(() => {
    const isVertical = props.value.direction === 'vertical' || props.value.direction === 'both';
    return viewportHeight.value - (isVertical ? (paddingStartY.value + paddingEndY.value) : 0);
  });

  // --- Size Calculations ---
  /**
   * Total size (width and height) of all items in the scrollable area.
   */
  const totalSize = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    if (!isHydrated.value && props.value.ssrRange && !isMounted.value) {
      const { start = 0, end = 0, colStart = 0, colEnd = 0 } = props.value.ssrRange;
      const colCount = props.value.columnCount || 0;
      const gap = props.value.gap || 0;
      const columnGap = props.value.columnGap || 0;
      const direction = props.value.direction || 'vertical';

      let width = 0;
      let height = 0;

      if (direction === 'both') {
        if (colCount > 0) {
          const effectiveColEnd = colEnd || colCount;
          const total = columnSizes.query(effectiveColEnd) - columnSizes.query(colStart);
          width = Math.max(0, total - (effectiveColEnd > colStart ? columnGap : 0));
        }
        if (fixedItemSize.value !== null) {
          const len = end - start;
          height = Math.max(0, len * (fixedItemSize.value + gap) - (len > 0 ? gap : 0));
        } else {
          const total = itemSizesY.query(end) - itemSizesY.query(start);
          height = Math.max(0, total - (end > start ? gap : 0));
        }
      } else if (direction === 'horizontal') {
        if (fixedItemSize.value !== null) {
          const len = end - start;
          width = Math.max(0, len * (fixedItemSize.value + columnGap) - (len > 0 ? columnGap : 0));
        } else {
          const total = itemSizesX.query(end) - itemSizesX.query(start);
          width = Math.max(0, total - (end > start ? columnGap : 0));
        }
        height = usableHeight.value;
      } else {
        // vertical
        width = usableWidth.value;
        if (fixedItemSize.value !== null) {
          const len = end - start;
          height = Math.max(0, len * (fixedItemSize.value + gap) - (len > 0 ? gap : 0));
        } else {
          const total = itemSizesY.query(end) - itemSizesY.query(start);
          height = Math.max(0, total - (end > start ? gap : 0));
        }
      }

      return {
        width: Math.max(width, usableWidth.value),
        height: Math.max(height, usableHeight.value),
      };
    }

    return calculateTotalSize({
      direction: props.value.direction || 'vertical',
      itemsLength: props.value.items.length,
      columnCount: props.value.columnCount || 0,
      fixedSize: fixedItemSize.value,
      fixedWidth: fixedColumnWidth.value,
      gap: props.value.gap || 0,
      columnGap: props.value.columnGap || 0,
      usableWidth: usableWidth.value,
      usableHeight: usableHeight.value,
      queryY: (idx) => itemSizesY.query(idx),
      queryX: (idx) => itemSizesX.query(idx),
      queryColumn: (idx) => columnSizes.query(idx),
    });
  });

  const totalWidth = computed(() => totalSize.value.width);
  const totalHeight = computed(() => totalSize.value.height);

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
      const val = cw[ index % cw.length ];
      return (val != null && val > 0) ? val : (props.value.defaultColumnWidth || DEFAULT_COLUMN_WIDTH);
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
   *                  Defaults to { align: 'auto', behavior: 'auto' }.
   */
  const scrollToIndex = (
    rowIndex: number | null | undefined,
    colIndex: number | null | undefined,
    options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions,
  ) => {
    const isCorrection = typeof options === 'object' && options !== null && 'isCorrection' in options
      ? options.isCorrection
      : false;

    const container = props.value.container || window;

    const isVertical = props.value.direction === 'vertical' || props.value.direction === 'both';
    const isHorizontal = props.value.direction === 'horizontal' || props.value.direction === 'both';

    const { targetX, targetY, effectiveAlignX, effectiveAlignY } = calculateScrollTarget({
      rowIndex,
      colIndex,
      options,
      itemsLength: props.value.items.length,
      columnCount: props.value.columnCount || 0,
      direction: props.value.direction || 'vertical',
      usableWidth: usableWidth.value,
      usableHeight: usableHeight.value,
      totalWidth: totalWidth.value,
      totalHeight: totalHeight.value,
      gap: props.value.gap || 0,
      columnGap: props.value.columnGap || 0,
      fixedSize: fixedItemSize.value,
      fixedWidth: fixedColumnWidth.value,
      relativeScrollX: relativeScrollX.value,
      relativeScrollY: relativeScrollY.value,
      getItemSizeY: (idx) => itemSizesY.get(idx),
      getItemSizeX: (idx) => itemSizesX.get(idx),
      getItemQueryY: (idx) => itemSizesY.query(idx),
      getItemQueryX: (idx) => itemSizesX.query(idx),
      getColumnSize: (idx) => columnSizes.get(idx),
      getColumnQuery: (idx) => columnSizes.query(idx),
      stickyIndices: sortedStickyIndices.value,
    });

    if (!isCorrection) {
      const behavior = isScrollToIndexOptions(options) ? options.behavior : undefined;
      pendingScroll.value = {
        rowIndex,
        colIndex,
        options: {
          align: { x: effectiveAlignX, y: effectiveAlignY },
          ...(behavior != null ? { behavior } : {}),
        },
      };
    }

    const finalX = targetX + hostOffset.x - (isHorizontal ? paddingStartX.value : 0);
    const finalY = targetY + hostOffset.y - (isVertical ? paddingStartY.value : 0);

    let behavior: 'auto' | 'smooth' | undefined;
    if (isScrollToIndexOptions(options)) {
      behavior = options.behavior;
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

    // We do NOT clear pendingScroll here anymore.
    // It will be cleared in checkPendingScroll when fully stable,
    // or in handleScroll if the user manually scrolls.
  };

  /**
   * Programmatically scroll to a specific pixel offset relative to the content start.
   *
   * @param x - The pixel offset to scroll to on the X axis. Pass null to keep current position.
   * @param y - The pixel offset to scroll to on the Y axis. Pass null to keep current position.
   * @param options - Scroll options (behavior)
   * @param options.behavior - The scroll behavior ('auto' | 'smooth'). Defaults to 'auto'.
   */
  const scrollToOffset = (x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => {
    const container = props.value.container || window;
    isProgrammaticScroll.value = true;

    const isVertical = props.value.direction === 'vertical' || props.value.direction === 'both';
    const isHorizontal = props.value.direction === 'horizontal' || props.value.direction === 'both';

    const clampedX = (x !== null && x !== undefined)
      ? (isHorizontal ? Math.max(0, Math.min(x, Math.max(0, totalWidth.value - usableWidth.value))) : Math.max(0, x))
      : null;
    const clampedY = (y !== null && y !== undefined)
      ? (isVertical ? Math.max(0, Math.min(y, Math.max(0, totalHeight.value - usableHeight.value))) : Math.max(0, y))
      : null;

    const currentX = (typeof window !== 'undefined' && container === window ? window.scrollX : (container as HTMLElement).scrollLeft);
    const currentY = (typeof window !== 'undefined' && container === window ? window.scrollY : (container as HTMLElement).scrollTop);

    const targetX = (clampedX !== null) ? clampedX + hostOffset.x - (isHorizontal ? paddingStartX.value : 0) : currentX;
    const targetY = (clampedY !== null) ? clampedY + hostOffset.y - (isVertical ? paddingStartY.value : 0) : currentY;

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
  const resizeMeasurements = (len: number, colCount: number) => {
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
  };

  const initializeMeasurements = () => {
    const newItems = props.value.items;
    const len = newItems.length;
    const colCount = props.value.columnCount || 0;
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;
    const cw = props.value.columnWidth;

    let colNeedsRebuild = false;
    let itemsNeedRebuild = false;

    // Initialize columns
    if (colCount > 0) {
      for (let i = 0; i < colCount; i++) {
        const currentW = columnSizes.get(i);
        const isMeasured = measuredColumns[ i ] === 1;

        if (!isDynamicColumnWidth.value || (!isMeasured && currentW === 0)) {
          let baseWidth = 0;
          if (typeof cw === 'number' && cw > 0) {
            baseWidth = cw;
          } else if (Array.isArray(cw) && cw.length > 0) {
            baseWidth = cw[ i % cw.length ] || props.value.defaultColumnWidth || DEFAULT_COLUMN_WIDTH;
          } else if (typeof cw === 'function') {
            baseWidth = cw(i);
          } else {
            baseWidth = props.value.defaultColumnWidth || DEFAULT_COLUMN_WIDTH;
          }

          const targetW = baseWidth + columnGap;
          if (Math.abs(currentW - targetW) > 0.5) {
            columnSizes.set(i, targetW);
            measuredColumns[ i ] = isDynamicColumnWidth.value ? 0 : 1;
            colNeedsRebuild = true;
          } else if (!isDynamicColumnWidth.value) {
            measuredColumns[ i ] = 1;
          }
        }
      }
    }

    // Initialize items
    const isVertical = props.value.direction === 'vertical';
    const isHorizontal = props.value.direction === 'horizontal';
    const isBoth = props.value.direction === 'both';

    for (let i = 0; i < len; i++) {
      const item = props.value.items[ i ];
      const currentX = itemSizesX.get(i);
      const currentY = itemSizesY.get(i);
      const isMeasuredX = measuredItemsX[ i ] === 1;
      const isMeasuredY = measuredItemsY[ i ] === 1;

      if (isHorizontal) {
        if (!isDynamicItemSize.value || (!isMeasuredX && currentX === 0)) {
          const baseSize = typeof props.value.itemSize === 'function' ? props.value.itemSize(item as T, i) : defaultSize.value;
          const targetX = baseSize + columnGap;
          if (Math.abs(currentX - targetX) > 0.5) {
            itemSizesX.set(i, targetX);
            measuredItemsX[ i ] = isDynamicItemSize.value ? 0 : 1;
            itemsNeedRebuild = true;
          } else if (!isDynamicItemSize.value) {
            measuredItemsX[ i ] = 1;
          }
        }
      } else if (currentX !== 0) {
        itemSizesX.set(i, 0);
        measuredItemsX[ i ] = 0;
        itemsNeedRebuild = true;
      }

      if (isVertical || isBoth) {
        if (!isDynamicItemSize.value || (!isMeasuredY && currentY === 0)) {
          const baseSize = typeof props.value.itemSize === 'function' ? props.value.itemSize(item as T, i) : defaultSize.value;
          const targetY = baseSize + gap;
          if (Math.abs(currentY - targetY) > 0.5) {
            itemSizesY.set(i, targetY);
            measuredItemsY[ i ] = isDynamicItemSize.value ? 0 : 1;
            itemsNeedRebuild = true;
          } else if (!isDynamicItemSize.value) {
            measuredItemsY[ i ] = 1;
          }
        }
      } else if (currentY !== 0) {
        itemSizesY.set(i, 0);
        measuredItemsY[ i ] = 0;
        itemsNeedRebuild = true;
      }
    }

    if (colNeedsRebuild) {
      columnSizes.rebuild();
    }
    if (itemsNeedRebuild) {
      itemSizesX.rebuild();
      itemSizesY.rebuild();
    }
  };

  const initializeSizes = () => {
    const newItems = props.value.items;
    const len = newItems.length;
    const colCount = props.value.columnCount || 0;

    resizeMeasurements(len, colCount);

    let prependCount = 0;
    if (props.value.restoreScrollOnPrepend && lastItems.length > 0 && len > lastItems.length) {
      const oldFirstItem = lastItems[ 0 ];
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
        const size = typeof props.value.itemSize === 'function' ? props.value.itemSize(newItems[ i ] as T, i) : defaultSize.value;
        if (props.value.direction === 'horizontal') {
          addedX += size + columnGap;
        } else { addedY += size + gap; }
      }

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

    initializeMeasurements();

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
    () => props.value.items,
    () => props.value.items.length,
    () => props.value.direction,
    () => props.value.columnCount,
    () => props.value.columnWidth,
    () => props.value.itemSize,
    () => props.value.gap,
    () => props.value.columnGap,
    () => props.value.defaultItemSize,
    () => props.value.defaultColumnWidth,
  ], initializeSizes, { immediate: true });

  watch(() => [ props.value.container, props.value.hostElement ], () => {
    updateHostOffset();
  });

  // --- Range & Visible Items ---
  const getRowIndexAt = (offset: number) => {
    const isHorizontal = props.value.direction === 'horizontal';
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;
    const fixedSize = fixedItemSize.value;

    if (isHorizontal) {
      if (fixedSize !== null) {
        return Math.floor(offset / (fixedSize + columnGap));
      }
      return itemSizesX.findLowerBound(offset);
    }
    if (fixedSize !== null) {
      return Math.floor(offset / (fixedSize + gap));
    }
    return itemSizesY.findLowerBound(offset);
  };

  const getColIndexAt = (offset: number, rowIndex: number) => {
    if (props.value.direction === 'both') {
      return columnSizes.findLowerBound(offset);
    }
    if (props.value.direction === 'horizontal') {
      return rowIndex;
    }
    return 0;
  };

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

    const bufferBefore = (props.value.ssrRange && !isScrolling.value) ? 0 : (props.value.bufferBefore ?? DEFAULT_BUFFER);
    const bufferAfter = props.value.bufferAfter ?? DEFAULT_BUFFER;

    return calculateRange({
      direction: props.value.direction || 'vertical',
      relativeScrollX: relativeScrollX.value,
      relativeScrollY: relativeScrollY.value,
      usableWidth: usableWidth.value,
      usableHeight: usableHeight.value,
      itemsLength: props.value.items.length,
      bufferBefore,
      bufferAfter,
      gap: props.value.gap || 0,
      columnGap: props.value.columnGap || 0,
      fixedSize: fixedItemSize.value,
      findLowerBoundY: (offset) => itemSizesY.findLowerBound(offset),
      findLowerBoundX: (offset) => itemSizesX.findLowerBound(offset),
      queryY: (idx) => itemSizesY.query(idx),
      queryX: (idx) => itemSizesX.query(idx),
    });
  });

  /**
   * Index of the first visible item in the viewport.
   */
  const currentIndex = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const direction = props.value.direction || 'vertical';
    const offset = direction === 'horizontal' ? relativeScrollX.value : relativeScrollY.value;
    return getRowIndexAt(offset);
  });

  /**
   * List of items to be rendered with their calculated offsets and sizes.
   */

  let lastRenderedItems: RenderedItem<T>[] = [];

  const renderedItems = computed<RenderedItem<T>[]>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const { start, end } = range.value;
    const items: RenderedItem<T>[] = [];
    const fixedSize = fixedItemSize.value;
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;
    const stickyIndices = sortedStickyIndices.value;
    const stickySet = stickyIndicesSet.value;

    const sortedIndices: number[] = [];

    if (isHydrated.value || !props.value.ssrRange) {
      const activeIdx = currentIndex.value;
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

      if (prevStickyIdx !== undefined && prevStickyIdx < start) {
        sortedIndices.push(prevStickyIdx);
      }
    }

    for (let i = start; i < end; i++) {
      sortedIndices.push(i);
    }

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

    const lastItemsMap = new Map(lastRenderedItems.map((it) => [ it.index, it ]));

    for (const i of sortedIndices) {
      const item = props.value.items[ i ];
      if (item === undefined) {
        continue;
      }

      const { x, y, width, height } = calculateItemPosition({
        index: i,
        direction: props.value.direction || 'vertical',
        fixedSize: fixedItemSize.value,
        gap: props.value.gap || 0,
        columnGap: props.value.columnGap || 0,
        usableWidth: usableWidth.value,
        usableHeight: usableHeight.value,
        totalWidth: totalWidth.value,
        queryY: (idx) => itemSizesY.query(idx),
        queryX: (idx) => itemSizesX.query(idx),
        getSizeY: (idx) => itemSizesY.get(idx),
        getSizeX: (idx) => itemSizesX.get(idx),
      });

      const isSticky = stickySet.has(i);
      const originalX = x;
      const originalY = y;

      const { isStickyActive, stickyOffset } = calculateStickyItem({
        index: i,
        isSticky,
        direction: props.value.direction || 'vertical',
        relativeScrollX: relativeScrollX.value,
        relativeScrollY: relativeScrollY.value,
        originalX,
        originalY,
        width,
        height,
        stickyIndices,
        fixedSize: fixedItemSize.value,
        fixedWidth: fixedColumnWidth.value,
        gap: props.value.gap || 0,
        columnGap: props.value.columnGap || 0,
        getItemQueryY: (idx) => itemSizesY.query(idx),
        getItemQueryX: (idx) => itemSizesX.query(idx),
      });

      const offsetX = originalX - ssrOffsetX;
      const offsetY = originalY - ssrOffsetY;
      const last = lastItemsMap.get(i);

      if (
        last
        && last.item === item
        && last.offset.x === offsetX
        && last.offset.y === offsetY
        && last.size.width === width
        && last.size.height === height
        && last.isSticky === isSticky
        && last.isStickyActive === isStickyActive
        && last.stickyOffset.x === stickyOffset.x
        && last.stickyOffset.y === stickyOffset.y
      ) {
        items.push(last);
      } else {
        items.push({
          item,
          index: i,
          offset: { x: offsetX, y: offsetY },
          size: { width, height },
          originalX,
          originalY,
          isSticky,
          isStickyActive,
          stickyOffset,
        });
      }
    }

    lastRenderedItems = items;

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

    const colBuffer = (props.value.ssrRange && !isScrolling.value) ? 0 : 2;

    return calculateColumnRange({
      columnCount: totalCols,
      relativeScrollX: relativeScrollX.value,
      usableWidth: usableWidth.value,
      colBuffer,
      fixedWidth: fixedColumnWidth.value,
      columnGap: props.value.columnGap || 0,
      findLowerBound: (offset) => columnSizes.findLowerBound(offset),
      query: (idx) => columnSizes.query(idx),
      totalColsQuery: () => columnSizes.query(totalCols),
    });
  });

  const scrollDetails = computed<ScrollDetails<T>>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const currentColIndex = getColIndexAt(relativeScrollX.value, currentIndex.value);

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
      viewportWidth.value = document.documentElement.clientWidth;
      viewportHeight.value = document.documentElement.clientHeight;
    } else if (isScrollableElement(target)) {
      scrollX.value = target.scrollLeft;
      scrollY.value = target.scrollTop;
      viewportWidth.value = target.clientWidth;
      viewportHeight.value = target.clientHeight;
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
    let deltaX = 0;
    let deltaY = 0;
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;

    const currentRelX = relativeScrollX.value;
    const currentRelY = relativeScrollY.value;

    const firstRowIndex = getRowIndexAt(props.value.direction === 'horizontal' ? currentRelX : currentRelY);
    const firstColIndex = getColIndexAt(currentRelX, firstRowIndex);

    const isHorizontalMode = props.value.direction === 'horizontal';
    const isVerticalMode = props.value.direction === 'vertical';
    const isBothMode = props.value.direction === 'both';

    const processedRows = new Set<number>();
    const processedCols = new Set<number>();

    for (const { index, inlineSize, blockSize, element } of updates) {
      // Ignore 0-size measurements as they usually indicate hidden/detached elements
      if (inlineSize <= 0 && blockSize <= 0) {
        continue;
      }

      const isMeasurable = isDynamicItemSize.value || typeof props.value.itemSize === 'function';
      if (index >= 0 && !processedRows.has(index) && isMeasurable && blockSize > 0) {
        processedRows.add(index);
        if (isHorizontalMode && inlineSize > 0) {
          const oldWidth = itemSizesX.get(index);
          const targetWidth = inlineSize + columnGap;
          if (!measuredItemsX[ index ] || Math.abs(targetWidth - oldWidth) > 0.1) {
            const d = targetWidth - oldWidth;
            itemSizesX.update(index, d);
            measuredItemsX[ index ] = 1;
            needUpdate = true;
            if (index < firstRowIndex) {
              deltaX += d;
            }
          }
        }
        if (isVerticalMode || isBothMode) {
          const oldHeight = itemSizesY.get(index);
          const targetHeight = blockSize + gap;

          if (!measuredItemsY[ index ] || Math.abs(targetHeight - oldHeight) > 0.1) {
            const d = targetHeight - oldHeight;
            itemSizesY.update(index, d);
            measuredItemsY[ index ] = 1;
            needUpdate = true;
            if (index < firstRowIndex) {
              deltaY += d;
            }
          }
        }
      }

      // Dynamic column width measurement
      const isColMeasurable = isDynamicColumnWidth.value || typeof props.value.columnWidth === 'function';
      if (
        isBothMode
        && element
        && props.value.columnCount
        && isColMeasurable
        && (inlineSize > 0 || element.dataset.colIndex === undefined)
      ) {
        const colIndexAttr = element.dataset.colIndex;
        if (colIndexAttr != null) {
          const colIndex = Number.parseInt(colIndexAttr, 10);
          if (colIndex >= 0 && colIndex < (props.value.columnCount || 0) && !processedCols.has(colIndex)) {
            processedCols.add(colIndex);
            const oldW = columnSizes.get(colIndex);
            const targetW = inlineSize + columnGap;

            if (!measuredColumns[ colIndex ] || Math.abs(oldW - targetW) > 0.1) {
              const d = targetW - oldW;
              if (Math.abs(d) > 0.1) {
                columnSizes.update(colIndex, d);
                needUpdate = true;
                if (colIndex < firstColIndex) {
                  deltaX += d;
                }
              }
              measuredColumns[ colIndex ] = 1;
            }
          }
        } else {
          // If the element is a row, try to find cells with data-col-index
          const cells = element.dataset.colIndex !== undefined
            ? [ element ]
            : Array.from(element.querySelectorAll('[data-col-index]')) as HTMLElement[];

          for (const child of cells) {
            const colIndex = Number.parseInt(child.dataset.colIndex!, 10);

            if (colIndex >= 0 && colIndex < (props.value.columnCount || 0) && !processedCols.has(colIndex)) {
              processedCols.add(colIndex);
              const rect = child.getBoundingClientRect();
              const w = rect.width;
              const oldW = columnSizes.get(colIndex);
              const targetW = w + columnGap;
              if (!measuredColumns[ colIndex ] || Math.abs(oldW - targetW) > 0.1) {
                const d = targetW - oldW;
                if (Math.abs(d) > 0.1) {
                  columnSizes.update(colIndex, d);
                  needUpdate = true;
                  if (colIndex < firstColIndex) {
                    deltaX += d;
                  }
                }
                measuredColumns[ colIndex ] = 1;
              }
            }
          }
        }
      }
    }

    if (needUpdate) {
      treeUpdateFlag.value++;
      // Only compensate if not in a programmatic scroll,
      // as it would interrupt the browser animation or explicit alignment.
      const hasPendingScroll = pendingScroll.value !== null || isProgrammaticScroll.value;

      if (!hasPendingScroll && (deltaX !== 0 || deltaY !== 0)) {
        scrollToOffset(
          deltaX !== 0 ? currentRelX + deltaX : null,
          deltaY !== 0 ? currentRelY + deltaY : null,
          { behavior: 'auto' },
        );
      }
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

      const isSmooth = isScrollToIndexOptions(options) && options.behavior === 'smooth';

      // If it's a smooth scroll, we wait until it's finished before correcting.
      if (isSmooth && isScrolling.value) {
        return;
      }

      const { targetX, targetY } = calculateScrollTarget({
        rowIndex,
        colIndex,
        options,
        itemsLength: props.value.items.length,
        columnCount: props.value.columnCount || 0,
        direction: props.value.direction || 'vertical',
        usableWidth: usableWidth.value,
        usableHeight: usableHeight.value,
        totalWidth: totalWidth.value,
        totalHeight: totalHeight.value,
        gap: props.value.gap || 0,
        columnGap: props.value.columnGap || 0,
        fixedSize: fixedItemSize.value,
        fixedWidth: fixedColumnWidth.value,
        relativeScrollX: relativeScrollX.value,
        relativeScrollY: relativeScrollY.value,
        getItemSizeY: (idx) => itemSizesY.get(idx),
        getItemSizeX: (idx) => itemSizesX.get(idx),
        getItemQueryY: (idx) => itemSizesY.query(idx),
        getItemQueryX: (idx) => itemSizesX.query(idx),
        getColumnSize: (idx) => columnSizes.get(idx),
        getColumnQuery: (idx) => columnSizes.query(idx),
        stickyIndices: sortedStickyIndices.value,
      });

      const tolerance = 1;
      const reachedX = (colIndex === null || colIndex === undefined) || Math.abs(relativeScrollX.value - targetX) < tolerance;
      const reachedY = (rowIndex === null || rowIndex === undefined) || Math.abs(relativeScrollY.value - targetY) < tolerance;

      const isMeasuredX = colIndex == null || colIndex === undefined || measuredColumns[ colIndex ] === 1;
      const isMeasuredY = rowIndex == null || rowIndex === undefined || measuredItemsY[ rowIndex ] === 1;

      if (reachedX && reachedY) {
        if (isMeasuredX && isMeasuredY) {
          pendingScroll.value = null;
        }
      } else {
        const correctionOptions: ScrollToIndexOptions = isScrollToIndexOptions(options)
          ? { ...options, isCorrection: true }
          : { align: options as ScrollAlignment | ScrollAlignmentOptions, isCorrection: true };
        scrollToIndex(rowIndex, colIndex, correctionOptions);
      }
    }
  };

  watch([ treeUpdateFlag, viewportWidth, viewportHeight ], checkPendingScroll);

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
      viewportWidth.value = document.documentElement.clientWidth;
      viewportHeight.value = document.documentElement.clientHeight;
      scrollX.value = window.scrollX;
      scrollY.value = window.scrollY;

      const onResize = () => {
        viewportWidth.value = document.documentElement.clientWidth;
        viewportHeight.value = document.documentElement.clientHeight;
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
     * Array of items currently rendered in the DOM with their calculated offsets and sizes.
     * @see RenderedItem
     */
    renderedItems,

    /**
     * Total calculated width of all items including gaps (in pixels).
     */
    totalWidth,

    /**
     * Total calculated height of all items including gaps (in pixels).
     */
    totalHeight,

    /**
     * Detailed information about the current scroll state.
     * Includes currentIndex, scrollOffset, viewportSize, totalSize, and scrolling status.
     * @see ScrollDetails
     */
    scrollDetails,

    /**
     * Programmatically scroll to a specific row and/or column.
     *
     * @param rowIndex - The row index to scroll to. Pass null to only scroll horizontally.
     * @param colIndex - The column index to scroll to. Pass null to only scroll vertically.
     * @param options - Alignment and behavior options.
     * @see ScrollAlignment
     * @see ScrollToIndexOptions
     */
    scrollToIndex,

    /**
     * Programmatically scroll to a specific pixel offset relative to the content start.
     *
     * @param x - The pixel offset to scroll to on the X axis. Pass null to keep current position.
     * @param y - The pixel offset to scroll to on the Y axis. Pass null to keep current position.
     * @param options - Scroll options (behavior).
     */
    scrollToOffset,

    /**
     * Stops any currently active smooth scroll animation and clears pending corrections.
     */
    stopProgrammaticScroll,

    /**
     * Updates the stored size of an item. Should be called when an item is measured (e.g., via ResizeObserver).
     *
     * @param index - The item index.
     * @param width - The measured inlineSize (width).
     * @param height - The measured blockSize (height).
     * @param element - The measured element (optional, used for robust grid column detection).
     */
    updateItemSize,

    /**
     * Updates the stored size of multiple items simultaneously.
     *
     * @param updates - Array of measurement updates.
     */
    updateItemSizes,

    /**
     * Recalculates the host element's offset relative to the scroll container.
     * Useful if the container or host moves without a resize event.
     */
    updateHostOffset,

    /**
     * Information about the current visible range of columns and their paddings.
     * @see ColumnRange
     */
    columnRange,

    /**
     * Helper to get the width of a specific column based on current configuration and measurements.
     *
     * @param index - The column index.
     */
    getColumnWidth,

    /**
     * Resets all dynamic measurements and re-initializes from props.
     * Useful if item sizes have changed externally.
     */
    refresh,

    /**
     * Whether the component has finished its first client-side mount and hydration.
     */
    isHydrated,
  };
}
