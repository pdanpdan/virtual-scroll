import type {
  RenderedItem,
  ScrollAlignment,
  ScrollAlignmentOptions,
  ScrollDetails,
  ScrollDirection,
  ScrollToIndexOptions,
  VirtualScrollProps,
} from '../types';
import type { MaybeRefOrGetter } from 'vue';

/* global ScrollToOptions */
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, ref, toValue, watch } from 'vue';

import { FenwickTree } from '../utils/fenwick-tree';
import { BROWSER_MAX_SIZE, getPaddingX, getPaddingY, isElement, isScrollableElement, isScrollToIndexOptions, isWindowLike } from '../utils/scroll';
import {
  calculateColumnRange,
  calculateItemPosition,
  calculateRange,
  calculateScrollTarget,
  calculateStickyItem,
  calculateTotalSize,
  displayToVirtual,
  findPrevStickyIndex,
  virtualToDisplay,
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
 * @param propsInput - The configuration properties. Can be a plain object, a Ref, or a getter function.
 * @see VirtualScrollProps
 */
export function useVirtualScroll<T = unknown>(propsInput: MaybeRefOrGetter<VirtualScrollProps<T>>) {
  const props = computed(() => toValue(propsInput));

  // --- State ---
  const scrollX = ref(0);
  const scrollY = ref(0);
  const isScrolling = ref(false);
  const isHydrated = ref(false);
  const isHydrating = ref(false);
  const isMounted = ref(false);
  const isRtl = ref(false);
  const viewportWidth = ref(0);
  const viewportHeight = ref(0);
  const hostOffset = reactive({ x: 0, y: 0 });
  const hostRefOffset = reactive({ x: 0, y: 0 });
  let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  const isProgrammaticScroll = ref(false);
  const internalScrollX = ref(0);
  const internalScrollY = ref(0);

  let computedStyle: CSSStyleDeclaration | null = null;

  /**
   * Detects the current direction (LTR/RTL) of the scroll container.
   */
  const updateDirection = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const container = props.value.container || props.value.hostRef || window;
    const el = isElement(container) ? container : document.documentElement;

    if (!computedStyle || !('direction' in computedStyle)) {
      computedStyle = window.getComputedStyle(el);
    }

    const newRtl = computedStyle.direction === 'rtl';
    if (isRtl.value !== newRtl) {
      isRtl.value = newRtl;
    }
  };

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
  const direction = computed(() => [ 'vertical', 'horizontal', 'both' ].includes(props.value.direction as string) ? props.value.direction as ScrollDirection : 'vertical' as ScrollDirection);

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

  const stickyStartX = computed(() => getPaddingX(props.value.stickyStart, props.value.direction));
  const stickyEndX = computed(() => getPaddingX(props.value.stickyEnd, props.value.direction));
  const stickyStartY = computed(() => getPaddingY(props.value.stickyStart, props.value.direction));
  const stickyEndY = computed(() => getPaddingY(props.value.stickyEnd, props.value.direction));

  const flowStartX = computed(() => getPaddingX(props.value.flowPaddingStart, props.value.direction));
  const flowEndX = computed(() => getPaddingX(props.value.flowPaddingEnd, props.value.direction));
  const flowStartY = computed(() => getPaddingY(props.value.flowPaddingStart, props.value.direction));
  const flowEndY = computed(() => getPaddingY(props.value.flowPaddingEnd, props.value.direction));

  const usableWidth = computed(() => viewportWidth.value - (direction.value !== 'vertical' ? (stickyStartX.value + stickyEndX.value) : 0));

  const usableHeight = computed(() => viewportHeight.value - (direction.value !== 'horizontal' ? (stickyStartY.value + stickyEndY.value) : 0));

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

      let width = 0;
      let height = 0;

      if (direction.value === 'both') {
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
      } else if (direction.value === 'horizontal') {
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
      direction: direction.value,
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

  const isWindowContainer = computed(() => isWindowLike(props.value.container));

  const virtualWidth = computed(() => totalSize.value.width + paddingStartX.value + paddingEndX.value);
  const virtualHeight = computed(() => totalSize.value.height + paddingStartY.value + paddingEndY.value);

  const totalWidth = computed(() => (flowStartX.value + stickyStartX.value + stickyEndX.value + flowEndX.value + virtualWidth.value));

  const totalHeight = computed(() => (flowStartY.value + stickyStartY.value + stickyEndY.value + flowEndY.value + virtualHeight.value));

  const componentOffset = reactive({
    x: computed(() => Math.max(0, hostOffset.x - (flowStartX.value + stickyStartX.value))),
    y: computed(() => Math.max(0, hostOffset.y - (flowStartY.value + stickyStartY.value))),
  });

  const renderedWidth = computed(() => (isWindowContainer.value ? totalWidth.value : Math.min(totalWidth.value, BROWSER_MAX_SIZE)));
  const renderedHeight = computed(() => (isWindowContainer.value ? totalHeight.value : Math.min(totalHeight.value, BROWSER_MAX_SIZE)));

  const renderedVirtualWidth = computed(() => (isWindowContainer.value ? virtualWidth.value : Math.max(0, renderedWidth.value - (flowStartX.value + stickyStartX.value + stickyEndX.value + flowEndX.value))));
  const renderedVirtualHeight = computed(() => (isWindowContainer.value ? virtualHeight.value : Math.max(0, renderedHeight.value - (flowStartY.value + stickyStartY.value + stickyEndY.value + flowEndY.value))));

  const scaleX = computed(() => {
    if (isWindowContainer.value || totalWidth.value <= BROWSER_MAX_SIZE) {
      return 1;
    }
    const realRange = totalWidth.value - viewportWidth.value;
    const displayRange = renderedWidth.value - viewportWidth.value;
    return displayRange > 0 ? realRange / displayRange : 1;
  });

  const scaleY = computed(() => {
    if (isWindowContainer.value || totalHeight.value <= BROWSER_MAX_SIZE) {
      return 1;
    }
    const realRange = totalHeight.value - viewportHeight.value;
    const displayRange = renderedHeight.value - viewportHeight.value;
    return displayRange > 0 ? realRange / displayRange : 1;
  });

  const relativeScrollX = computed(() => {
    if (direction.value === 'vertical') {
      return 0;
    }
    const flowPaddingX = flowStartX.value + stickyStartX.value + paddingStartX.value;
    return internalScrollX.value - flowPaddingX;
  });

  const relativeScrollY = computed(() => {
    if (direction.value === 'horizontal') {
      return 0;
    }
    const flowPaddingY = flowStartY.value + stickyStartY.value + paddingStartY.value;
    return internalScrollY.value - flowPaddingY;
  });

  /**
   * Returns the currently calculated width for a specific column index, taking measurements and gaps into account.
   *
   * @param index - The column index.
   * @returns The width in pixels (excluding gap).
   */
  const getColumnWidth = (index: number) => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const columnGap = props.value.columnGap || 0;
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
    const val = columnSizes.get(index);
    return val > 0 ? val - columnGap : (props.value.defaultColumnWidth || DEFAULT_COLUMN_WIDTH);
  };

  /**
   * Returns the currently calculated height for a specific row index, taking measurements and gaps into account.
   *
   * @param index - The row index.
   * @returns The height in pixels (excluding gap).
   */
  const getRowHeight = (index: number) => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    if (direction.value === 'horizontal') {
      return usableHeight.value;
    }

    const gap = props.value.gap || 0;
    const itemSize = props.value.itemSize;
    if (typeof itemSize === 'number' && itemSize > 0) {
      return itemSize;
    }
    if (typeof itemSize === 'function') {
      const item = props.value.items[ index ];
      return item !== undefined ? itemSize(item, index) : (props.value.defaultItemSize || DEFAULT_ITEM_SIZE);
    }

    const val = itemSizesY.get(index);
    return val > 0 ? val - gap : (props.value.defaultItemSize || DEFAULT_ITEM_SIZE);
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
  function scrollToIndex(
    rowIndex: number | null | undefined,
    colIndex: number | null | undefined,
    options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions,
  ) {
    const isCorrection = typeof options === 'object' && options !== null && 'isCorrection' in options
      ? options.isCorrection
      : false;

    const container = props.value.container || window;

    const { targetX, targetY, effectiveAlignX, effectiveAlignY } = calculateScrollTarget({
      rowIndex,
      colIndex,
      options,
      direction: direction.value,
      viewportWidth: viewportWidth.value,
      viewportHeight: viewportHeight.value,
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
      scaleX: scaleX.value,
      scaleY: scaleY.value,
      hostOffsetX: componentOffset.x,
      hostOffsetY: componentOffset.y,
      stickyIndices: sortedStickyIndices.value,
      stickyStartX: stickyStartX.value,
      stickyStartY: stickyStartY.value,
      stickyEndX: stickyEndX.value,
      stickyEndY: stickyEndY.value,
      flowPaddingStartX: flowStartX.value,
      flowPaddingStartY: flowStartY.value,
      flowPaddingEndX: flowEndX.value,
      flowPaddingEndY: flowEndY.value,
      paddingStartX: paddingStartX.value,
      paddingStartY: paddingStartY.value,
      paddingEndX: paddingEndX.value,
      paddingEndY: paddingEndY.value,
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

    const displayTargetX = virtualToDisplay(targetX, componentOffset.x, scaleX.value);
    const displayTargetY = virtualToDisplay(targetY, componentOffset.y, scaleY.value);

    const finalX = isRtl.value ? -displayTargetX : displayTargetX;
    const finalY = displayTargetY;

    let behavior: 'auto' | 'smooth' | undefined;
    if (isScrollToIndexOptions(options)) {
      behavior = options.behavior;
    }

    const scrollBehavior = isCorrection ? 'auto' : (behavior || 'smooth');
    isProgrammaticScroll.value = true;

    if (typeof window !== 'undefined' && container === window) {
      window.scrollTo({
        left: (colIndex === null || colIndex === undefined) ? undefined : (isRtl.value ? finalX : Math.max(0, finalX)),
        top: (rowIndex === null || rowIndex === undefined) ? undefined : Math.max(0, finalY),
        behavior: scrollBehavior,
      } as ScrollToOptions);
    } else if (isScrollableElement(container)) {
      const scrollOptions: ScrollToOptions = {
        behavior: scrollBehavior,
      };

      if (colIndex !== null && colIndex !== undefined) {
        scrollOptions.left = (isRtl.value ? finalX : Math.max(0, finalX));
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
        scrollX.value = (isRtl.value ? finalX : Math.max(0, finalX));
        internalScrollX.value = targetX;
      }
      if (rowIndex !== null && rowIndex !== undefined) {
        scrollY.value = Math.max(0, finalY);
        internalScrollY.value = targetY;
      }

      if (pendingScroll.value) {
        const currentOptions = pendingScroll.value.options;
        if (isScrollToIndexOptions(currentOptions)) {
          currentOptions.behavior = 'auto';
        } else {
          pendingScroll.value.options = {
            align: currentOptions as ScrollAlignment | ScrollAlignmentOptions,
            behavior: 'auto',
          };
        }
      }
    }
  }

  /**
   * Programmatically scroll to a specific pixel offset relative to the content start.
   *
   * @param x - The pixel offset to scroll to on the X axis. Pass null to keep current position.
   * @param y - The pixel offset to scroll to on the Y axis. Pass null to keep current position.
   * @param options - Scroll options (behavior).
   * @param options.behavior - The scroll behavior ('auto' | 'smooth'). Defaults to 'auto'.
   */
  const scrollToOffset = (x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => {
    const container = props.value.container || window;
    isProgrammaticScroll.value = true;
    pendingScroll.value = null;

    const clampedX = (x !== null && x !== undefined)
      ? Math.max(0, Math.min(x, totalWidth.value - viewportWidth.value))
      : null;
    const clampedY = (y !== null && y !== undefined)
      ? Math.max(0, Math.min(y, totalHeight.value - viewportHeight.value))
      : null;

    if (clampedX !== null) {
      internalScrollX.value = clampedX;
    }
    if (clampedY !== null) {
      internalScrollY.value = clampedY;
    }

    const currentX = (typeof window !== 'undefined' && container === window ? window.scrollX : (container as HTMLElement).scrollLeft);
    const currentY = (typeof window !== 'undefined' && container === window ? window.scrollY : (container as HTMLElement).scrollTop);

    const displayTargetX = (clampedX !== null) ? virtualToDisplay(clampedX, componentOffset.x, scaleX.value) : null;
    const displayTargetY = (clampedY !== null) ? virtualToDisplay(clampedY, componentOffset.y, scaleY.value) : null;

    const targetX = (displayTargetX !== null)
      ? (isRtl.value ? -displayTargetX : displayTargetX)
      : currentX;
    const targetY = (displayTargetY !== null) ? displayTargetY : currentY;

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
    for (let i = 0; i < len; i++) {
      const item = props.value.items[ i ];
      const currentX = itemSizesX.get(i);
      const currentY = itemSizesY.get(i);
      const isMeasuredX = measuredItemsX[ i ] === 1;
      const isMeasuredY = measuredItemsY[ i ] === 1;

      if (direction.value === 'horizontal') {
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

      if (direction.value !== 'horizontal') {
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
        if (direction.value === 'horizontal') {
          addedX += size + columnGap;
        } else { addedY += size + gap; }
      }

      if (addedX > 0 || addedY > 0) {
        nextTick(() => {
          scrollToOffset(
            addedX > 0 ? relativeScrollX.value + addedX : null,
            addedY > 0 ? relativeScrollY.value + addedY : null,
            { behavior: 'auto', isCorrection: true } as ScrollToIndexOptions,
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
    if (typeof window === 'undefined') {
      return;
    }
    const container = props.value.container || window;

    const calculateOffset = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      if (container === window) {
        return {
          x: isRtl.value
            ? document.documentElement.clientWidth - rect.right - window.scrollX
            : rect.left + window.scrollX,
          y: rect.top + window.scrollY,
        };
      }
      if (container === el) {
        return { x: 0, y: 0 };
      }
      if (isElement(container)) {
        const containerRect = container.getBoundingClientRect();
        return {
          x: isRtl.value
            ? containerRect.right - rect.right - container.scrollLeft
            : rect.left - containerRect.left + container.scrollLeft,
          y: rect.top - containerRect.top + container.scrollTop,
        };
      }
      return { x: 0, y: 0 };
    };

    if (props.value.hostElement) {
      const newOffset = calculateOffset(props.value.hostElement);
      if (Math.abs(hostOffset.x - newOffset.x) > 0.1 || Math.abs(hostOffset.y - newOffset.y) > 0.1) {
        hostOffset.x = newOffset.x;
        hostOffset.y = newOffset.y;
      }
    }

    if (props.value.hostRef) {
      const newOffset = calculateOffset(props.value.hostRef);
      if (Math.abs(hostRefOffset.x - newOffset.x) > 0.1 || Math.abs(hostRefOffset.y - newOffset.y) > 0.1) {
        hostRefOffset.x = newOffset.x;
        hostRefOffset.y = newOffset.y;
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

  watch(isRtl, (newRtl, oldRtl) => {
    if (oldRtl === undefined || newRtl === oldRtl || !isMounted.value) {
      return;
    }

    // Use the oldRtl to correctly interpret the current scrollX
    if (direction.value === 'vertical') {
      updateHostOffset();
      return;
    }

    const scrollValue = oldRtl ? Math.abs(scrollX.value) : scrollX.value;
    const oldRelativeScrollX = displayToVirtual(scrollValue, hostOffset.x, scaleX.value);

    // Update host offset for the new direction
    updateHostOffset();

    // Maintain logical horizontal position when direction changes
    scrollToOffset(oldRelativeScrollX, null, { behavior: 'auto' });
  }, { flush: 'sync' });

  watch([ () => props.value.items.length, () => props.value.columnCount ], ([ newLen, newColCount ], [ oldLen, oldColCount ]) => {
    nextTick(() => {
      const maxRelX = Math.max(0, totalWidth.value - viewportWidth.value);
      const maxRelY = Math.max(0, totalHeight.value - viewportHeight.value);

      if (internalScrollX.value > maxRelX || internalScrollY.value > maxRelY) {
        scrollToOffset(
          Math.min(internalScrollX.value, maxRelX),
          Math.min(internalScrollY.value, maxRelY),
          { behavior: 'auto' },
        );
      } else if ((newLen !== oldLen && scaleY.value !== 1) || (newColCount !== oldColCount && scaleX.value !== 1)) {
        // Even if within bounds, we must sync the display scroll position
        // because the coordinate scaling factor changed.
        scrollToOffset(internalScrollX.value, internalScrollY.value, { behavior: 'auto' });
      }
      updateHostOffset();
    });
  });

  // --- Range & Visible Items ---
  const getRowIndexAt = (offset: number) => {
    const gap = props.value.gap || 0;
    const columnGap = props.value.columnGap || 0;
    const fixedSize = fixedItemSize.value;

    if (direction.value === 'horizontal') {
      const step = (fixedSize || 0) + columnGap;
      if (fixedSize !== null && step > 0) {
        return Math.floor(offset / step);
      }
      return itemSizesX.findLowerBound(offset);
    }
    const step = (fixedSize || 0) + gap;
    if (fixedSize !== null && step > 0) {
      return Math.floor(offset / step);
    }
    return itemSizesY.findLowerBound(offset);
  };

  const getColIndexAt = (offset: number) => {
    if (direction.value === 'both') {
      return columnSizes.findLowerBound(offset);
    }
    if (direction.value === 'horizontal') {
      return getRowIndexAt(offset);
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
      direction: direction.value,
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

    const offsetX = relativeScrollX.value + stickyStartX.value;
    const offsetY = relativeScrollY.value + stickyStartY.value;
    const offset = direction.value === 'horizontal' ? offsetX : offsetY;
    return getRowIndexAt(offset);
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
      const prevStickyIdx = findPrevStickyIndex(stickyIndices, activeIdx);

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
      ssrOffsetY = (direction.value !== 'horizontal')
        ? (fixedSize !== null ? ssrStartRow * (fixedSize + gap) : itemSizesY.query(ssrStartRow))
        : 0;

      if (direction.value === 'horizontal') {
        ssrOffsetX = fixedSize !== null ? ssrStartCol * (fixedSize + columnGap) : itemSizesX.query(ssrStartCol);
      } else if (direction.value === 'both') {
        ssrOffsetX = columnSizes.query(ssrStartCol);
      }
    }

    const lastItemsMap = new Map(lastRenderedItems.map((it) => [ it.index, it ]));

    // Optimization: Cache sequential queries to avoid O(log N) tree traversal for every item
    let lastIndexX = -1;
    let lastOffsetX = 0;
    let lastIndexY = -1;
    let lastOffsetY = 0;

    const queryXCached = (idx: number) => {
      if (idx === lastIndexX + 1) {
        lastOffsetX += itemSizesX.get(lastIndexX);
        lastIndexX = idx;
        return lastOffsetX;
      }
      lastOffsetX = itemSizesX.query(idx);
      lastIndexX = idx;
      return lastOffsetX;
    };

    const queryYCached = (idx: number) => {
      if (idx === lastIndexY + 1) {
        lastOffsetY += itemSizesY.get(lastIndexY);
        lastIndexY = idx;
        return lastOffsetY;
      }
      lastOffsetY = itemSizesY.query(idx);
      lastIndexY = idx;
      return lastOffsetY;
    };

    const itemsStartVU_X = flowStartX.value + stickyStartX.value + paddingStartX.value;
    const itemsStartVU_Y = flowStartY.value + stickyStartY.value + paddingStartY.value;
    const wrapperStartDU_X = flowStartX.value + stickyStartX.value;
    const wrapperStartDU_Y = flowStartY.value + stickyStartY.value;

    const colRange = columnRange.value;

    for (const i of sortedIndices) {
      const item = props.value.items[ i ];
      if (item === undefined) {
        continue;
      }

      const { x, y, width, height } = calculateItemPosition({
        index: i,
        direction: direction.value,
        fixedSize: fixedItemSize.value,
        gap: props.value.gap || 0,
        columnGap: props.value.columnGap || 0,
        usableWidth: usableWidth.value,
        usableHeight: usableHeight.value,
        totalWidth: totalSize.value.width,
        queryY: queryYCached,
        queryX: queryXCached,
        getSizeY: (idx) => itemSizesY.get(idx),
        getSizeX: (idx) => itemSizesX.get(idx),
        columnRange: colRange,
      });

      const isSticky = stickySet.has(i);
      const originalX = x;
      const originalY = y;

      const { isStickyActive, stickyOffset } = calculateStickyItem({
        index: i,
        isSticky,
        direction: direction.value,
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

      const offsetX = isHydrated.value
        ? (internalScrollX.value / scaleX.value + (originalX + itemsStartVU_X - internalScrollX.value)) - wrapperStartDU_X
        : (originalX - ssrOffsetX);
      const offsetY = isHydrated.value
        ? (internalScrollY.value / scaleY.value + (originalY + itemsStartVU_Y - internalScrollY.value)) - wrapperStartDU_Y
        : (originalY - ssrOffsetY);
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
          stickyOffset: {
            x: stickyOffset.x,
            y: stickyOffset.y,
          },
        });
      }
    }

    lastRenderedItems = items;

    return items;
  });

  const scrollDetails = computed<ScrollDetails<T>>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    const currentScrollX = relativeScrollX.value + stickyStartX.value;
    const currentScrollY = relativeScrollY.value + stickyStartY.value;

    const currentEndScrollX = relativeScrollX.value + (viewportWidth.value - stickyEndX.value) - 1;
    const currentEndScrollY = relativeScrollY.value + (viewportHeight.value - stickyEndY.value) - 1;

    const currentColIndex = getColIndexAt(currentScrollX);
    const currentRowIndex = getRowIndexAt(currentScrollY);
    const currentEndIndex = getRowIndexAt(direction.value === 'horizontal' ? currentEndScrollX : currentEndScrollY);
    const currentEndColIndex = getColIndexAt(currentEndScrollX);

    return {
      items: renderedItems.value,
      currentIndex: currentRowIndex,
      currentColIndex,
      currentEndIndex,
      currentEndColIndex,
      scrollOffset: {
        x: internalScrollX.value,
        y: internalScrollY.value,
      },
      displayScrollOffset: {
        x: isRtl.value ? Math.abs(scrollX.value + hostRefOffset.x) : Math.max(0, scrollX.value - hostRefOffset.x),
        y: Math.max(0, scrollY.value - hostRefOffset.y),
      },
      viewportSize: {
        width: viewportWidth.value,
        height: viewportHeight.value,
      },
      displayViewportSize: {
        width: viewportWidth.value,
        height: viewportHeight.value,
      },
      totalSize: {
        width: totalWidth.value,
        height: totalHeight.value,
      },
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

    updateDirection();

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

    const scrollValueX = isRtl.value ? Math.abs(scrollX.value) : scrollX.value;
    internalScrollX.value = displayToVirtual(scrollValueX, componentOffset.x, scaleX.value);
    internalScrollY.value = displayToVirtual(scrollY.value, componentOffset.y, scaleY.value);

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

    const firstRowIndex = getRowIndexAt(direction.value === 'horizontal' ? currentRelX : currentRelY);
    const firstColIndex = getColIndexAt(currentRelX);

    const isHorizontalMode = direction.value === 'horizontal';
    const isBothMode = direction.value === 'both';

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
        if (!isHorizontalMode) {
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
        const contentStartLogicalX = flowStartX.value + stickyStartX.value + paddingStartX.value;
        const contentStartLogicalY = flowStartY.value + stickyStartY.value + paddingStartY.value;
        scrollToOffset(
          deltaX !== 0 ? currentRelX + deltaX + contentStartLogicalX : null,
          deltaY !== 0 ? currentRelY + deltaY + contentStartLogicalY : null,
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
  function checkPendingScroll() {
    if (pendingScroll.value && !isHydrating.value) {
      const { rowIndex, colIndex, options } = pendingScroll.value;

      const isSmooth = isScrollToIndexOptions(options) && options.behavior === 'smooth';

      // If it's a smooth scroll, we wait until it's finished before correcting.
      if (isSmooth && isScrolling.value) {
        return;
      }

      const container = props.value.container || window;
      const actualScrollX = (typeof window !== 'undefined' && container === window ? window.scrollX : (container as HTMLElement).scrollLeft);
      const actualScrollY = (typeof window !== 'undefined' && container === window ? window.scrollY : (container as HTMLElement).scrollTop);

      const scrollValueX = isRtl.value ? Math.abs(actualScrollX) : actualScrollX;
      const scrollValueY = actualScrollY;

      const currentRelX = displayToVirtual(scrollValueX, 0, scaleX.value);
      const currentRelY = displayToVirtual(scrollValueY, 0, scaleY.value);

      const { targetX, targetY } = calculateScrollTarget({
        rowIndex,
        colIndex,
        options,
        direction: direction.value,
        viewportWidth: viewportWidth.value,
        viewportHeight: viewportHeight.value,
        totalWidth: virtualWidth.value,
        totalHeight: virtualHeight.value,
        gap: props.value.gap || 0,
        columnGap: props.value.columnGap || 0,
        fixedSize: fixedItemSize.value,
        fixedWidth: fixedColumnWidth.value,
        relativeScrollX: currentRelX,
        relativeScrollY: currentRelY,
        getItemSizeY: (idx) => itemSizesY.get(idx),
        getItemSizeX: (idx) => itemSizesX.get(idx),
        getItemQueryY: (idx) => itemSizesY.query(idx),
        getItemQueryX: (idx) => itemSizesX.query(idx),
        getColumnSize: (idx) => columnSizes.get(idx),
        getColumnQuery: (idx) => columnSizes.query(idx),
        scaleX: scaleX.value,
        scaleY: scaleY.value,
        hostOffsetX: componentOffset.x,
        hostOffsetY: componentOffset.y,
        stickyIndices: sortedStickyIndices.value,
        stickyStartX: stickyStartX.value,
        stickyStartY: stickyStartY.value,
        stickyEndX: stickyEndX.value,
        stickyEndY: stickyEndY.value,
        flowPaddingStartX: flowStartX.value,
        flowPaddingStartY: flowStartY.value,
        flowPaddingEndX: flowEndX.value,
        flowPaddingEndY: flowEndY.value,
        paddingStartX: paddingStartX.value,
        paddingStartY: paddingStartY.value,
        paddingEndX: paddingEndX.value,
        paddingEndY: paddingEndY.value,
      });

      const toleranceX = 2;
      const toleranceY = 2;
      const reachedX = (colIndex === null || colIndex === undefined) || Math.abs(currentRelX - targetX) < toleranceX;
      const reachedY = (rowIndex === null || rowIndex === undefined) || Math.abs(currentRelY - targetY) < toleranceY;

      const isMeasuredX = colIndex == null || colIndex === undefined || measuredColumns[ colIndex ] === 1;
      const isMeasuredY = rowIndex == null || rowIndex === undefined || measuredItemsY[ rowIndex ] === 1;

      if (reachedX && reachedY) {
        if (isMeasuredX && isMeasuredY && !isScrolling.value && !isProgrammaticScroll.value) {
          pendingScroll.value = null;
        }
      } else {
        const correctionOptions: ScrollToIndexOptions = isScrollToIndexOptions(options)
          ? { ...options, isCorrection: true }
          : { align: options as ScrollAlignment | ScrollAlignmentOptions, isCorrection: true };
        scrollToIndex(rowIndex, colIndex, correctionOptions);
      }
    }
  }

  watch([ treeUpdateFlag, viewportWidth, viewportHeight ], checkPendingScroll);

  watch(isScrolling, (scrolling) => {
    if (!scrolling) {
      checkPendingScroll();
    }
  });

  let resizeObserver: ResizeObserver | null = null;
  let directionObserver: MutationObserver | null = null;
  let directionInterval: ReturnType<typeof setInterval> | undefined;

  const attachEvents = (container: HTMLElement | Window | null) => {
    if (!container || typeof window === 'undefined') {
      return;
    }
    const scrollTarget = container === window ? document : container;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });

    computedStyle = null;
    updateDirection();

    if (isElement(container)) {
      directionObserver = new MutationObserver(() => updateDirection());
      directionObserver.observe(container, { attributes: true, attributeFilter: [ 'dir', 'style' ] });
    }

    directionInterval = setInterval(updateDirection, 1000);

    if (container === window) {
      viewportWidth.value = document.documentElement.clientWidth;
      viewportHeight.value = document.documentElement.clientHeight;
      scrollX.value = window.scrollX;
      scrollY.value = window.scrollY;

      const onResize = () => {
        updateDirection();
        viewportWidth.value = document.documentElement.clientWidth;
        viewportHeight.value = document.documentElement.clientHeight;
        updateHostOffset();
      };
      window.addEventListener('resize', onResize);
      return () => {
        scrollTarget.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', onResize);
        clearInterval(directionInterval);
        computedStyle = null;
      };
    } else {
      viewportWidth.value = (container as HTMLElement).clientWidth;
      viewportHeight.value = (container as HTMLElement).clientHeight;
      scrollX.value = (container as HTMLElement).scrollLeft;
      scrollY.value = (container as HTMLElement).scrollTop;

      resizeObserver = new ResizeObserver((entries) => {
        updateDirection();
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
        directionObserver?.disconnect();
        clearInterval(directionInterval);
        computedStyle = null;
      };
    }
  };

  let cleanup: (() => void) | undefined;

  if (getCurrentInstance()) {
    onMounted(() => {
      isMounted.value = true;
      updateDirection();

      watch(() => props.value.container, (newContainer) => {
        cleanup?.();
        cleanup = attachEvents(newContainer || null);
      }, { immediate: true });

      updateHostOffset();

      // Ensure we have a layout cycle before considering it hydrated
      // and starting virtualization. This avoids issues with 0-size viewports.
      nextTick(() => {
        updateHostOffset();
        if (props.value.ssrRange || props.value.initialScrollIndex !== undefined) {
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
        } else {
          isHydrated.value = true;
        }
      });
    });

    onUnmounted(() => {
      cleanup?.();
    });
  }

  /**
   * The list of items currently rendered in the DOM.
   */
  /**
   * Resets all dynamic measurements and re-initializes from current props.
   * Useful if item source data has changed in a way that affects sizes without changing the items array reference.
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
     * Offsets are in Display Units (DU), sizes are in Virtual Units (VU).
     * @see RenderedItem
     */
    renderedItems,

    /**
     * Total calculated width of all items including gaps (in VU).
     */
    totalWidth,

    /**
     * Total calculated height of all items including gaps (in VU).
     */
    totalHeight,

    /**
     * Total width to be rendered in the DOM (clamped to browser limits, in DU).
     */
    renderedWidth,

    /**
     * Total height to be rendered in the DOM (clamped to browser limits, in DU).
     */
    renderedHeight,

    /**
     * Detailed information about the current scroll state.
     * Includes currentIndex, scrollOffset (VU), displayScrollOffset (DU), viewportSize (DU), totalSize (VU), and scrolling status.
     * @see ScrollDetails
     */
    scrollDetails,

    /**
     * Helper to get the height of a specific row based on current configuration and measurements.
     *
     * @param index - The row index.
     * @returns The height in VU (excluding gap).
     */
    getRowHeight,

    /**
     * Helper to get the width of a specific column based on current configuration and measurements.
     *
     * @param index - The column index.
     * @returns The width in VU (excluding gap).
     */
    getColumnWidth,

    /**
     * Helper to get the virtual offset of a specific row.
     *
     * @param index - The row index.
     * @returns The virtual offset in VU.
     */
    getRowOffset: (index: number) => (flowStartY.value + stickyStartY.value + paddingStartY.value) + itemSizesY.query(index),

    /**
     * Helper to get the virtual offset of a specific column.
     *
     * @param index - The column index.
     * @returns The virtual offset in VU.
     */
    getColumnOffset: (index: number) => (flowStartX.value + stickyStartX.value + paddingStartX.value) + columnSizes.query(index),

    /**
     * Helper to get the virtual offset of a specific item along the scroll axis.
     *
     * @param index - The item index.
     * @returns The virtual offset in VU.
     */
    getItemOffset: (index: number) => (direction.value === 'horizontal' ? (flowStartX.value + stickyStartX.value + paddingStartX.value) + itemSizesX.query(index) : (flowStartY.value + stickyStartY.value + paddingStartY.value) + itemSizesY.query(index)),

    /**
     * Helper to get the size of a specific item along the scroll axis.
     *
     * @param index - The item index.
     * @returns The size in VU (excluding gap).
     */
    getItemSize: (index: number) => {
      if (direction.value === 'horizontal') {
        return Math.max(0, itemSizesX.get(index) - (props.value.columnGap || 0));
      }
      const itemSize = props.value.itemSize;
      if (typeof itemSize === 'number' && itemSize > 0) {
        return itemSize;
      }
      if (typeof itemSize === 'function') {
        const item = props.value.items[ index ];
        return item !== undefined ? itemSize(item, index) : (props.value.defaultItemSize || DEFAULT_ITEM_SIZE);
      }
      return Math.max(0, itemSizesY.get(index) - (props.value.gap || 0));
    },

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
     * @param x - The pixel offset to scroll to on the X axis (VU). Pass null to keep current position.
     * @param y - The pixel offset to scroll to on the Y axis (VU). Pass null to keep current position.
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
     * @param width - The measured inlineSize (width in DU).
     * @param height - The measured blockSize (height in DU).
     * @param element - The measured element (optional, used for robust grid column detection).
     */
    updateItemSize,

    /**
     * Updates the stored size of multiple items simultaneously.
     *
     * @param updates - Array of measurement updates (sizes in DU).
     */
    updateItemSizes,

    /**
     * Recalculates the host element's offset relative to the scroll container.
     * Useful if the container or host moves without a resize event.
     */
    updateHostOffset,

    /**
     * Detects the current direction (LTR/RTL) of the scroll container.
     */
    updateDirection,

    /**
     * Information about the current visible range of columns and their paddings.
     * @see ColumnRange
     */
    columnRange,

    /**
     * Resets all dynamic measurements and re-initializes from props.
     * Useful if item sizes have changed externally.
     */
    refresh,

    /**
     * Whether the component has finished its first client-side mount and hydration.
     */
    isHydrated,

    /**
     * Whether the container is the window or body.
     */
    isWindowContainer,

    /**
     * Whether the scroll container is in Right-to-Left (RTL) mode.
     */
    isRtl,

    /**
     * Coordinate scaling factor for X axis (VU/DU).
     */
    scaleX,

    /**
     * Coordinate scaling factor for Y axis (VU/DU).
     */
    scaleY,

    /**
     * Absolute offset of the component within its container (DU).
     */
    componentOffset,

    /**
     * Physical width of the items wrapper in the DOM (clamped to browser limits, in DU).
     */
    renderedVirtualWidth,

    /**
     * Physical height of the items wrapper in the DOM (clamped to browser limits, in DU).
     */
    renderedVirtualHeight,
  };
}
