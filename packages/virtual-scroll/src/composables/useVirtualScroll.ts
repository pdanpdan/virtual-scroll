import type { ExtensionContext, VirtualScrollExtension } from '../extensions';
import type {
  RenderedItem,
  ScrollAlignment,
  ScrollAlignmentOptions,
  ScrollDetails,
  ScrollDirection,
  ScrollToIndexOptions,
  ScrollToIndexResult,
  VirtualScrollProps,
} from '../types';
/* global ScrollToOptions */
import type { Ref } from 'vue';

import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, reactive, ref, toValue, watch } from 'vue';

import {
  DEFAULT_BUFFER,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ITEM_SIZE,
} from '../types';
import { getPaddingX, getPaddingY, isElement, isScrollableElement, isScrollToIndexOptions, isWindowLike, scrollTo } from '../utils/scroll';
import {
  calculateColumnRange,
  calculateIndexAt,
  calculateItemPosition,
  calculateOffsetAt,
  calculateRange,
  calculateRangeSize,
  calculateRenderedSize,
  calculateScrollTarget,
  calculateSSROffsets,
  calculateStickyItem,
  calculateTotalSize,
  displayToVirtual,
  findPrevStickyIndex,
  virtualToDisplay,
} from '../utils/virtual-scroll-logic';
import { useVirtualScrollSizes } from './useVirtualScrollSizes';

/**
 * Composable for virtual scrolling logic.
 * Handles calculation of visible items, scroll events, dynamic item sizes, and programmatic scrolling.
 *
 * @param propsInput - The configuration properties. Can be a plain object, a Ref, or a getter function.
 * @param extensions - Optional list of extensions to enhance functionality (RTL, Snapping, Sticky, etc.).
 * @see VirtualScrollProps
 */
export function useVirtualScroll<T = unknown>(
  propsInput: Ref<VirtualScrollProps<T>> | (() => VirtualScrollProps<T>),
  extensions: VirtualScrollExtension<T>[] = [],
) {
  const props = computed(() => toValue(propsInput));

  // --- State ---
  /** Current horizontal display scroll position (DU). */
  /**
   * Resolves the effective scroll container.
   * Falls back to the host element (not straight to `window`) so a self-scrolling
   * host gets zero offsets and element-targeted scroll writes even while the host
   * ref is still being wired during hydration/mount.
   */
  const getContainer = () => props.value.container || props.value.hostRef || window;

  const scrollX = ref(0);
  /** Current vertical display scroll position (DU). */
  const scrollY = ref(0);
  /** Current horizontal virtual scroll position (VU). */
  const internalScrollX = ref(0);
  /** Current vertical virtual scroll position (VU). */
  const internalScrollY = ref(0);
  /** Whether the container is currently being scrolled. */
  const isScrolling = ref(false);
  /** Whether the component has finished its first client-side mount. */
  const isHydrated = ref(false);
  /** Whether the component is in the process of initial hydration. */
  const isHydrating = ref(false);
  /** Whether the component is currently mounted in the DOM. */
  const isMounted = ref(false);
  /** Whether the current text direction is Right-to-Left. */
  const isRtl = ref(false);
  /** Current physical width of the visible viewport area (DU). */
  const viewportWidth = ref(0);
  /** Current physical height of the visible viewport area (DU). */
  const viewportHeight = ref(0);
  /** Current offset of the items wrapper relative to the scroll container (DU). */
  const hostOffset = reactive({ x: 0, y: 0 });
  /** Current offset of the root host element relative to the scroll container (DU). */
  const hostRefOffset = reactive({ x: 0, y: 0 });
  /** Inline-start/block-start padding of the scroll container (DU): the virtual scrollbar overlay is anchored to the content box while the viewport is sized to the padding box. */
  const scrollbarOffset = reactive({ x: 0, y: 0 });
  /** Timeout handle for the scroll end detection. */
  let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

  /** Scaling factor for horizontal virtual coordinates. */
  const scaleX = ref(1);
  /** Scaling factor for vertical virtual coordinates. */
  const scaleY = ref(1);

  /** Current horizontal scroll direction. */
  const scrollDirectionX = ref<'start' | 'end' | null>(null);
  /** Current vertical scroll direction. */
  const scrollDirectionY = ref<'start' | 'end' | null>(null);

  /** Information about a scroll operation that is waiting for measurements. */
  const pendingScroll = ref<{
    rowIndex: number | null | undefined;
    colIndex: number | null | undefined;
    options: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions | undefined;
    /** Offset-based target (from scrollToOffset): re-clamped when measurements settle. */
    offsetX?: number;
    /** Offset-based target (from scrollToOffset): re-clamped when measurements settle. */
    offsetY?: number;
    /** Extra clamp allowance (loading slot) for the offset-based target; always set (0 when none). */
    endExtraX: number;
    /** Extra clamp allowance (loading slot) for the offset-based target; always set (0 when none). */
    endExtraY: number;
    /** Virtual target issued with the original scroll (index-based): detects measurement-driven target changes. */
    targetX?: number;
    /** Virtual target issued with the original scroll (index-based): detects measurement-driven target changes. */
    targetY?: number;
  } | null>(null);

  /** Whether the current scroll operation was initiated programmatically. */
  const isProgrammaticScroll = ref(false);

  /**
   * Set when a programmatic scroll targets the content end (bottom/right edge).
   * While set, measurement settle updates re-clamp to the new end so the first
   * jump-to-end lands flush even when the tail rows were only estimates.
   */
  let bottomIntentX = false;
  let bottomIntentY = false;
  /** End allowance (loading slot) captured with the intent, kept during re-clamps. */
  let bottomExtraX = 0;
  let bottomExtraY = 0;
  /** Timeout handle for smooth programmatic scroll completion. */
  let programmaticScrollTimer: ReturnType<typeof setTimeout> | undefined;

  /**
   * Immediately stops any currently active smooth scroll animation and clears pending corrections.
   */
  const stopProgrammaticScroll = () => {
    isProgrammaticScroll.value = false;
    clearTimeout(programmaticScrollTimer);
    pendingScroll.value = null;
  };

  /**
   * Marks the scroll as programmatic and sets a timeout to clear the flag.
   * Smooth scrolls also trigger checkPendingScroll on completion.
   */
  function startProgrammaticScroll(behavior: 'auto' | 'smooth' | undefined) {
    isProgrammaticScroll.value = true;
    clearTimeout(programmaticScrollTimer);
    if (behavior === 'smooth') {
      programmaticScrollTimer = setTimeout(() => {
        isProgrammaticScroll.value = false;
        programmaticScrollTimer = undefined;
        checkPendingScroll();
      }, 1000);
    } else {
      programmaticScrollTimer = setTimeout(() => {
        isProgrammaticScroll.value = false;
        programmaticScrollTimer = undefined;
      }, 150);
    }
  }

  /** Horizontal virtual scroll position at the start of the current scroll interaction (VU). */
  let scrollStartX = 0;
  /** Vertical virtual scroll position at the start of the current scroll interaction (VU). */
  let scrollStartY = 0;

  // --- Computed Config ---
  /** Validated scroll direction. */
  const direction = computed(() => [ 'vertical', 'horizontal', 'both' ].includes(props.value.direction as string) ? props.value.direction as ScrollDirection : 'vertical' as ScrollDirection);

  /** Whether the items have dynamic height or width. */
  const isDynamicItemSize = computed(() =>
    props.value.itemSize === undefined || props.value.itemSize === null || props.value.itemSize === 0,
  );

  /** Whether the columns have dynamic widths. */
  const isDynamicColumnWidth = computed(() =>
    props.value.columnWidth === undefined || props.value.columnWidth === null || props.value.columnWidth === 0,
  );

  /** Fixed pixel size of items if configured as a number. */
  const fixedItemSize = computed(() =>
    (typeof props.value.itemSize === 'number' && props.value.itemSize > 0) ? props.value.itemSize : null,
  );

  /** Fixed pixel width of columns if configured as a number. */
  const fixedColumnWidth = computed(() =>
    (typeof props.value.columnWidth === 'number' && props.value.columnWidth > 0) ? props.value.columnWidth : null,
  );

  /** Fallback size for items before they are measured. */
  const defaultSize = computed(() => props.value.defaultItemSize || fixedItemSize.value || DEFAULT_ITEM_SIZE);
  const {
    itemSizesX,
    itemSizesY,
    columnSizes,
    measuredColumns,
    measuredItemsY,
    treeUpdateFlag,
    getSizeAt,
    getItemBaseSize,
    initializeSizes,
    updateItemSizes: coreUpdateItemSizes,
    refresh: coreRefresh,
  } = useVirtualScrollSizes(computed(() => ({
    props: props.value,
    isDynamicItemSize: isDynamicItemSize.value,
    isDynamicColumnWidth: isDynamicColumnWidth.value,
    defaultSize: defaultSize.value,
    fixedItemSize: fixedItemSize.value,
    direction: direction.value,
  })));

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

  const totalSize = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

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

  const renderedWidth = computed(() => calculateRenderedSize(isWindowContainer.value, totalWidth.value));
  const renderedHeight = computed(() => calculateRenderedSize(isWindowContainer.value, totalHeight.value));
  const renderedVirtualWidth = computed(() => calculateRenderedSize(isWindowContainer.value, virtualWidth.value));
  const renderedVirtualHeight = computed(() => calculateRenderedSize(isWindowContainer.value, virtualHeight.value));

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
   * Helper to get the row (or item) index at a specific vertical (or horizontal in horizontal mode) virtual offset (VU).
   * @param offset - The virtual pixel offset.
   */
  const getRowIndexAt = (offset: number) => {
    const isHorizontal = direction.value === 'horizontal';
    return calculateIndexAt(
      offset,
      fixedItemSize.value,
      isHorizontal ? (props.value.columnGap || 0) : (props.value.gap || 0),
      (off) => (isHorizontal ? itemSizesX.findLowerBound(off) : itemSizesY.findLowerBound(off)),
    );
  };

  /**
   * Helper to get the column index at a specific horizontal virtual offset (VU).
   * @param offset - The virtual pixel offset.
   */
  const getColIndexAt = (offset: number) => {
    if (direction.value === 'both') {
      return calculateIndexAt(
        offset,
        fixedColumnWidth.value,
        props.value.columnGap || 0,
        (off) => columnSizes.findLowerBound(off),
      );
    }
    if (direction.value === 'horizontal') {
      return getRowIndexAt(offset);
    }
    return 0;
  };

  /**
   * Helper to get the width of a specific column.
   * @param index - The column index.
   */
  const getColumnWidth = (index: number) => {
    if (direction.value === 'both') {
      return getSizeAt(
        index,
        props.value.columnWidth,
        props.value.defaultColumnWidth || DEFAULT_COLUMN_WIDTH,
        props.value.columnGap || 0,
        columnSizes,
        true,
      );
    }
    return getSizeAt(
      index,
      props.value.itemSize,
      props.value.defaultItemSize || DEFAULT_ITEM_SIZE,
      props.value.columnGap || 0,
      itemSizesX,
      true,
    );
  };

  /**
   * Helper to get the height of a specific row.
   * @param index - The row index.
   */
  const getRowHeight = (index: number) => {
    if (direction.value === 'horizontal') {
      return usableHeight.value;
    }
    return getSizeAt(
      index,
      props.value.itemSize,
      props.value.defaultItemSize || DEFAULT_ITEM_SIZE,
      props.value.gap || 0,
      itemSizesY,
      false,
    );
  };

  /**
   * Helper to get the virtual offset of a specific item.
   * @param index - The item index.
   */
  const getItemOffset = (index: number) => (direction.value === 'horizontal' ? (flowStartX.value + stickyStartX.value + paddingStartX.value) + calculateOffsetAt(index, fixedItemSize.value, props.value.columnGap || 0, (idx) => itemSizesX.query(idx)) : (flowStartY.value + stickyStartY.value + paddingStartY.value) + calculateOffsetAt(index, fixedItemSize.value, props.value.gap || 0, (idx) => itemSizesY.query(idx)));

  /**
   * Helper to get the size of a specific item along the scroll axis.
   * @param index - The item index.
   */
  const getItemSize = (index: number) => (direction.value === 'horizontal' ? getColumnWidth(index) : getRowHeight(index));
  const updateDirection = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const container = props.value.container || props.value.hostRef || window;
    const el = isElement(container) ? container : document.documentElement;
    const computedStyle = window.getComputedStyle(el);
    const newRtl = computedStyle.direction === 'rtl';
    if (isRtl.value !== newRtl) {
      isRtl.value = newRtl;
    }
  };

  const handleScrollCorrection = (addedX: number, addedY: number) => {
    nextTick(() => {
      scrollToOffset(
        addedX > 0 ? relativeScrollX.value + addedX : null,
        addedY > 0 ? relativeScrollY.value + addedY : null,
        { behavior: 'auto' },
      );
    });
  };

  /**
   * Marks end-intent axes when a programmatic target reaches the content end.
   */
  const markBottomIntents = (targetX: number | null, targetY: number | null, endExtraX = 0, endExtraY = 0) => {
    bottomIntentX = false;
    bottomIntentY = false;
    if (targetX !== null && !isRtl.value && direction.value !== 'vertical') {
      const maxX = Math.max(0, totalWidth.value - viewportWidth.value + endExtraX);
      if (targetX >= maxX - 0.5) {
        bottomIntentX = true;
        bottomExtraX = endExtraX;
      }
    }
    if (targetY !== null) {
      const maxY = Math.max(0, totalHeight.value - viewportHeight.value + endExtraY);
      if (targetY >= maxY - 0.5) {
        bottomIntentY = true;
        bottomExtraY = endExtraY;
      }
    }
  };

  function scrollToIndex(
    rowIndex?: number | null,
    colIndex?: number | null,
    options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions,
  ): ScrollToIndexResult {
    const isCorrection = isScrollToIndexOptions(options) ? options.isCorrection : false;
    const dryRun = isScrollToIndexOptions(options) ? options.dryRun : false;

    const container = getContainer();

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
      stickyIndices: (props.value.stickyIndices || []),
      stickyStartX: stickyStartX.value,
      stickyStartY: stickyStartY.value,
      stickyEndX: stickyEndX.value,
      stickyEndY: stickyEndY.value,
      flowPaddingStartX: flowStartX.value,
      flowPaddingStartY: flowStartY.value,
      paddingStartX: paddingStartX.value,
      paddingStartY: paddingStartY.value,
      paddingEndX: paddingEndX.value,
      paddingEndY: paddingEndY.value,
    });

    if (!isCorrection && !dryRun) {
      const behavior = isScrollToIndexOptions(options) ? options.behavior : undefined;
      pendingScroll.value = {
        rowIndex,
        colIndex,
        options: {
          align: { x: effectiveAlignX, y: effectiveAlignY },
          ...(behavior != null ? { behavior } : {}),
        },
        // Index-based pending: no loading-slot allowance.
        endExtraX: 0,
        endExtraY: 0,
        targetX,
        targetY,
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

    if (!dryRun) {
      startProgrammaticScroll(scrollBehavior);
    }

    const scrollOptions: ScrollToOptions = { behavior: scrollBehavior };
    if (colIndex !== null && colIndex !== undefined) {
      scrollOptions.left = isRtl.value ? finalX : Math.max(0, finalX);
    }
    if (rowIndex !== null && rowIndex !== undefined) {
      scrollOptions.top = Math.max(0, finalY);
    }

    if (!dryRun) {
      scrollTo(container, scrollOptions);
    }

    if (!isCorrection && !dryRun) {
      markBottomIntents(targetX, targetY);
    }

    if (!dryRun && (scrollBehavior === 'auto' || scrollBehavior === undefined)) {
      if (colIndex !== null && colIndex !== undefined) {
        scrollX.value = (isRtl.value ? finalX : Math.max(0, finalX));
        internalScrollX.value = targetX;
      }
      if (rowIndex !== null && rowIndex !== undefined) {
        scrollY.value = Math.max(0, finalY);
        internalScrollY.value = targetY;
      }
    }

    return { targetX, targetY, displayTargetX, displayTargetY };
  }

  function scrollToOffset(x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; isCorrection?: boolean; endExtraX?: number; endExtraY?: number; }) {
    const container = getContainer();
    // Internal corrections (settle re-clamps) must not restart the programmatic scroll state.
    if (!options?.isCorrection) {
      startProgrammaticScroll(options?.behavior);
    }

    // The virtual total excludes DOM content rendered after the wrapper (e.g.
    // the always-rendered loading slot); endExtra* lets the End key extend the
    // clamp so that content stays reachable.
    const clampMaxX = totalWidth.value - viewportWidth.value + (options?.endExtraX ?? 0);
    const clampMaxY = totalHeight.value - viewportHeight.value + (options?.endExtraY ?? 0);
    const clampedX = (x !== null && x !== undefined) ? Math.max(0, Math.min(x, clampMaxX)) : null;
    const clampedY = (y !== null && y !== undefined) ? Math.max(0, Math.min(y, clampMaxY)) : null;

    if (!options?.isCorrection) {
      markBottomIntents(clampedX, clampedY, options?.endExtraX ?? 0, options?.endExtraY ?? 0);
    }

    // Defer the final position until measurements settle: like scrollToIndex,
    // re-clamp against the updated totals when the scroll completes.
    pendingScroll.value = {
      rowIndex: null,
      colIndex: null,
      options: { behavior: options?.behavior ?? 'auto' },
      ...(clampedX !== null ? { offsetX: clampedX } : {}),
      ...(clampedY !== null ? { offsetY: clampedY } : {}),
      endExtraX: options?.endExtraX ?? 0,
      endExtraY: options?.endExtraY ?? 0,
    };

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
    const targetX = (displayTargetX !== null) ? (isRtl.value ? -displayTargetX : displayTargetX) : currentX;
    const targetY = (displayTargetY !== null) ? displayTargetY : currentY;

    const scrollOptions: ScrollToOptions = { behavior: options?.behavior || 'auto' };
    if (x !== null && x !== undefined) {
      scrollOptions.left = targetX;
    }
    if (y !== null && y !== undefined) {
      scrollOptions.top = targetY;
    }
    scrollTo(container, scrollOptions);

    if (options?.behavior === 'auto' || options?.behavior === undefined) {
      if (x !== null && x !== undefined) {
        scrollX.value = targetX;
      }
      if (y !== null && y !== undefined) {
        scrollY.value = targetY;
      }
    }
  }

  const range = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;
    if ((!isHydrated.value || isHydrating.value) && props.value.ssrRange) {
      return { start: props.value.ssrRange.start, end: props.value.ssrRange.end };
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
      return calculateColumnRange({
        columnCount: totalCols,
        relativeScrollX: calculateOffsetAt(safeStart, fixedColumnWidth.value, props.value.columnGap || 0, (idx) => columnSizes.query(idx)),
        usableWidth: calculateRangeSize(safeStart, safeEnd, fixedColumnWidth.value, props.value.columnGap || 0, (idx) => columnSizes.query(idx)),
        colBuffer: 0,
        fixedWidth: fixedColumnWidth.value,
        columnGap: props.value.columnGap || 0,
        findLowerBound: (offset) => columnSizes.findLowerBound(offset),
        query: (idx) => columnSizes.query(idx),
        totalColsQuery: () => columnSizes.query(totalCols),
      });
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

  const ctx: ExtensionContext<T> = {
    props,
    scrollDetails: null as unknown as Ref<ScrollDetails<T>>,
    totalSize: computed(() => ({ width: totalWidth.value, height: totalHeight.value })),
    range,
    currentIndex,
    internalState: {
      scrollX,
      scrollY,
      internalScrollX,
      internalScrollY,
      isRtl,
      isScrolling,
      isProgrammaticScroll,
      viewportWidth,
      viewportHeight,
      scaleX,
      scaleY,
      scrollDirectionX,
      scrollDirectionY,
      relativeScrollX,
      relativeScrollY,
    },
    methods: {
      scrollToIndex,
      scrollToOffset,
      updateDirection,
      getRowIndexAt,
      getColIndexAt,
      getItemSize,
      getItemBaseSize,
      getItemOffset,
      handleScrollCorrection,
    },
  };

  let lastRenderedItems: RenderedItem<T>[] = [];
  const renderedItems = computed<RenderedItem<T>[]>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;
    const { start, end } = range.value;
    const items: RenderedItem<T>[] = [];
    const stickyIndices = (props.value.stickyIndices || []).toSorted((a, b) => a - b);
    const stickySet = new Set(stickyIndices);
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
    const { x: ssrOffsetX, y: ssrOffsetY } = (!isHydrated.value && props.value.ssrRange)
      ? calculateSSROffsets(direction.value, props.value.ssrRange, fixedItemSize.value, fixedColumnWidth.value, props.value.gap || 0, props.value.columnGap || 0, (idx) => itemSizesY.query(idx), (idx) => itemSizesX.query(idx), (idx) => columnSizes.query(idx))
      : { x: 0, y: 0 };
    const lastItemsMap = new Map<number, RenderedItem<T>>();
    for (const item of lastRenderedItems) {
      lastItemsMap.set(item.index, item);
    }
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
    let currentStickyIndexPtr = 0;
    for (const i of sortedIndices) {
      // Hole-y datasets (e.g. `new Array(n)` for index-only rows) render every
      // index in range; the item slot prop is `undefined` for holes.
      const item = props.value.items[ i ] as T;
      const { x, y, width, height } = calculateItemPosition({ index: i, direction: direction.value, fixedSize: fixedItemSize.value, gap: props.value.gap || 0, columnGap: props.value.columnGap || 0, usableWidth: usableWidth.value, usableHeight: usableHeight.value, totalWidth: totalSize.value.width, queryY: queryYCached, queryX: queryXCached, getSizeY: (idx) => itemSizesY.get(idx), getSizeX: (idx) => itemSizesX.get(idx), columnRange: colRange });
      const isSticky = stickySet.has(i);
      const originalX = x;
      const originalY = y;
      while (currentStickyIndexPtr < stickyIndices.length && stickyIndices[ currentStickyIndexPtr ]! <= i) {
        currentStickyIndexPtr++;
      }
      const nextStickyIndex = currentStickyIndexPtr < stickyIndices.length ? stickyIndices[ currentStickyIndexPtr ] : undefined;
      const { isStickyActive, isStickyActiveX, isStickyActiveY, stickyOffset } = calculateStickyItem({ index: i, isSticky, direction: direction.value, relativeScrollX: relativeScrollX.value, relativeScrollY: relativeScrollY.value, originalX, originalY, width, height, stickyIndices, fixedSize: fixedItemSize.value, fixedWidth: fixedColumnWidth.value, gap: props.value.gap || 0, columnGap: props.value.columnGap || 0, getItemQueryY: (idx) => itemSizesY.query(idx), getItemQueryX: (idx) => itemSizesX.query(idx), nextStickyIndex, stickyStartX: stickyStartX.value, stickyStartY: stickyStartY.value });
      const offsetX = isHydrated.value ? (internalScrollX.value / scaleX.value + (x + itemsStartVU_X - internalScrollX.value)) - wrapperStartDU_X : (x - ssrOffsetX);
      const offsetY = isHydrated.value ? (internalScrollY.value / scaleY.value + (y + itemsStartVU_Y - internalScrollY.value)) - wrapperStartDU_Y : (y - ssrOffsetY);
      const last = lastItemsMap.get(i);
      if (last && last.item === item && last.offset.x === offsetX && last.offset.y === offsetY && last.size.width === width && last.size.height === height && last.isSticky === isSticky && last.isStickyActive === isStickyActive && last.isStickyActiveX === isStickyActiveX && last.isStickyActiveY === isStickyActiveY && last.stickyOffset.x === stickyOffset.x && last.stickyOffset.y === stickyOffset.y) {
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
          isStickyActiveX,
          isStickyActiveY,
          stickyOffset,
        });
      }
    }
    let finalItems = items;
    extensions.forEach((ext) => {
      if (ext.transformRenderedItems) {
        finalItems = ext.transformRenderedItems(finalItems, ctx);
      }
    });
    lastRenderedItems = finalItems;
    return finalItems;
  });

  const computedScrollDetails = computed<ScrollDetails<T>>(() => {
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
      scrollOffset: { x: internalScrollX.value, y: internalScrollY.value },
      displayScrollOffset: { x: isRtl.value ? Math.abs(scrollX.value + hostRefOffset.x) : Math.max(0, scrollX.value - hostRefOffset.x), y: Math.max(0, scrollY.value - hostRefOffset.y) },
      viewportSize: { width: viewportWidth.value, height: viewportHeight.value },
      displayViewportSize: { width: viewportWidth.value, height: viewportHeight.value },
      totalSize: { width: totalWidth.value, height: totalHeight.value },
      isScrolling: isScrolling.value,
      isProgrammaticScroll: isProgrammaticScroll.value,
      range: range.value,
      columnRange: columnRange.value,
    };
  });

  ctx.scrollDetails = computedScrollDetails;

  extensions.forEach((ext) => ext.onInit?.(ctx));

  const handleScroll = (e: Event) => {
    const target = e.target;
    // v8 ignore next 2 -- defensive SSR guard; the scroll listener is only attached when window exists
    if (typeof window === 'undefined') {
      return;
    }
    updateDirection();
    if (target === window || target === document) {
      scrollX.value = window.scrollX;
      scrollY.value = window.scrollY;
      viewportWidth.value = document.documentElement.clientWidth;
      viewportHeight.value = document.documentElement.clientHeight;
    // v8 ignore start -- every attached scroll target is an element/window, and elements always have scrollLeft
    } else if (isScrollableElement(target)) {
    // v8 ignore stop
      scrollX.value = target.scrollLeft;
      scrollY.value = target.scrollTop;
      viewportWidth.value = target.clientWidth;
      viewportHeight.value = target.clientHeight;
    }
    // Content before the list can grow/shrink without resizing the host — e.g.
    // a collapsible header above a window-scrolled list, or preceding content
    // inside an external scrollable element — moving the list within its scroll
    // container without a resize event. For user scrolls, re-measure the host
    // offset before mapping into item coordinates. Our own programmatic scrolls
    // don't move the list, so they skip the re-measure.
    if (!isProgrammaticScroll.value && (target === window || target === document || isScrollableElement(target))) {
      // updateHostOffset is defined below; handleScroll only runs at runtime
      // (module fully initialized), so this is not a real use-before-define.
      // eslint-disable-next-line ts/no-use-before-define
      updateHostOffset();
    }
    const scrollValueX = isRtl.value ? Math.abs(scrollX.value) : scrollX.value;
    const virtualX = displayToVirtual(scrollValueX, componentOffset.x, scaleX.value);
    const virtualY = displayToVirtual(scrollY.value, componentOffset.y, scaleY.value);

    if (!isProgrammaticScroll.value) {
      if (!isScrolling.value) {
        scrollStartX = internalScrollX.value;
        scrollStartY = internalScrollY.value;
      }
      const deltaX = virtualX - scrollStartX;
      const deltaY = virtualY - scrollStartY;

      if (Math.abs(deltaX) > 0.5) {
        scrollDirectionX.value = deltaX > 0 ? 'end' : 'start';
      }
      if (Math.abs(deltaY) > 0.5) {
        scrollDirectionY.value = deltaY > 0 ? 'end' : 'start';
      }
    }

    // A move away from the content end cancels the end-anchored re-clamp
    // (the engine's own re-anchor only ever moves towards the end).
    if (bottomIntentX && virtualX < internalScrollX.value - 0.5) {
      bottomIntentX = false;
    }
    if (bottomIntentY && virtualY < internalScrollY.value - 0.5) {
      bottomIntentY = false;
    }

    internalScrollX.value = virtualX;
    internalScrollY.value = virtualY;
    if (!isProgrammaticScroll.value) {
      pendingScroll.value = null;
    }
    if (!isScrolling.value) {
      isScrolling.value = true;
    }
    extensions.forEach((ext) => ext.onScroll?.(ctx, e));
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling.value = false;
      extensions.forEach((ext) => ext.onScrollEnd?.(ctx));
      if (programmaticScrollTimer === undefined) {
        isProgrammaticScroll.value = false;
      }
    }, 150);
  };

  const updateItemSizes = (updates: Array<{ index: number; inlineSize: number; blockSize: number; element?: HTMLElement | undefined; }>) => {
    coreUpdateItemSizes(updates, getRowIndexAt, getColIndexAt, relativeScrollX.value, relativeScrollY.value, (dx, dy) => {
      // While a load is in flight the appended content is still settling
      // (estimates -> measurements): do not move the container.
      if (!props.value.loading && !pendingScroll.value && !isProgrammaticScroll.value) {
        handleScrollCorrection(dx, dy);
      }
    });
  };

  const updateItemSize = (index: number, inlineSize: number, blockSize: number, element?: HTMLElement) => {
    updateItemSizes([ { index, inlineSize, blockSize, element } ]);
  };

  function checkPendingScroll() {
    if (pendingScroll.value && !isHydrating.value) {
      const { rowIndex, colIndex, options, offsetX, offsetY, endExtraX, endExtraY } = pendingScroll.value;
      const isSmooth = isScrollToIndexOptions(options) && options.behavior === 'smooth';
      const container = getContainer();
      const actualScrollX = (typeof window !== 'undefined' && container === window ? window.scrollX : (container as HTMLElement).scrollLeft);
      const actualScrollY = (typeof window !== 'undefined' && container === window ? window.scrollY : (container as HTMLElement).scrollTop);
      const scrollValueX = isRtl.value ? Math.abs(actualScrollX) : actualScrollX;
      const scrollValueY = actualScrollY;
      const currentRelX = displayToVirtual(scrollValueX, 0, scaleX.value);
      const currentRelY = displayToVirtual(scrollValueY, 0, scaleY.value);

      // Offset-based pending (scrollToOffset): re-clamp against the current totals.
      // endExtra* keeps the loading-slot allowance so the target is not pulled back.
      let targetX = offsetX !== undefined
        ? Math.max(0, Math.min(offsetX, totalWidth.value - viewportWidth.value + endExtraX))
        : currentRelX;
      let targetY = offsetY !== undefined
        ? Math.max(0, Math.min(offsetY, totalHeight.value - viewportHeight.value + endExtraY))
        : currentRelY;

      if (offsetX === undefined && offsetY === undefined) {
        const calculated = calculateScrollTarget({
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
          stickyIndices: props.value.stickyIndices || [],
          stickyStartX: stickyStartX.value,
          stickyStartY: stickyStartY.value,
          stickyEndX: stickyEndX.value,
          stickyEndY: stickyEndY.value,
          flowPaddingStartX: flowStartX.value,
          flowPaddingStartY: flowStartY.value,
          paddingStartX: paddingStartX.value,
          paddingStartY: paddingStartY.value,
          paddingEndX: paddingEndX.value,
          paddingEndY: paddingEndY.value,
        });
        targetX = calculated.targetX;
        targetY = calculated.targetY;
      }

      const toleranceX = 2 * scaleX.value;
      const toleranceY = 2 * scaleY.value;

      if (isSmooth && (isScrolling.value || isProgrammaticScroll.value)) {
        // A smooth scroll is still in flight: rebase it when measurements moved
        // the goal (e.g. the target item was still estimated when issued), so it
        // lands on the measured target instead of a stale one.
        if (offsetX === undefined && offsetY === undefined && isScrollToIndexOptions(options)) {
          const pendingTargetX = pendingScroll.value?.targetX;
          const pendingTargetY = pendingScroll.value?.targetY;
          const movedY = rowIndex != null && pendingTargetY !== undefined && Math.abs(targetY - pendingTargetY) > toleranceY;
          const movedX = colIndex != null && pendingTargetX !== undefined && Math.abs(targetX - pendingTargetX) > toleranceX;
          if (movedY || movedX) {
            // Defer past the render flush: the wrapper height still reflects the
            // pre-measurement totals here, so an immediate smooth scroll would be
            // clamped to the old max by the browser.
            nextTick(() => {
              scrollToIndex(rowIndex, colIndex, { ...options, behavior: 'smooth' });
            });
            return;
          }
        }
        return;
      }
      const reachedX = offsetX !== undefined
        ? (viewportWidth.value > 0 && Math.abs(currentRelX - targetX) < toleranceX)
        : (colIndex === null || colIndex === undefined) || (viewportWidth.value > 0 && Math.abs(currentRelX - targetX) < toleranceX);
      const reachedY = offsetY !== undefined
        ? (viewportHeight.value > 0 && Math.abs(currentRelY - targetY) < toleranceY)
        : (rowIndex === null || rowIndex === undefined) || (viewportHeight.value > 0 && Math.abs(currentRelY - targetY) < toleranceY);
      if (reachedX && reachedY) {
        const isMeasuredX = offsetX !== undefined || colIndex == null || colIndex === undefined || measuredColumns.value[ colIndex ] === 1;
        const isMeasuredY = offsetY !== undefined || rowIndex == null || rowIndex === undefined || measuredItemsY.value[ rowIndex ] === 1;
        if (isMeasuredX && isMeasuredY && !isScrolling.value && !isProgrammaticScroll.value) {
          pendingScroll.value = null;
        }
      } else if (offsetX !== undefined || offsetY !== undefined) {
        scrollToOffset(
          offsetX !== undefined ? targetX : null,
          offsetY !== undefined ? targetY : null,
          { behavior: 'auto', isCorrection: true, endExtraX, endExtraY },
        );
      } else {
        // v8 ignore next -- pendingScroll always stores normalized options, so the string fallback is unreachable
        const correctionOptions: ScrollToIndexOptions = isScrollToIndexOptions(options) ? { ...options, isCorrection: true } : { align: options as ScrollAlignment | ScrollAlignmentOptions, isCorrection: true };
        scrollToIndex(rowIndex, colIndex, correctionOptions);
      }
    }
  }

  /**
   * Re-clamps an end-anchored scroll once settling measurements moved the real
   * content end (dynamic rows measured after the first landing, appends, or
   * viewport changes): the first jump-to-end ends flush instead of short.
   */
  const checkBottomReanchor = () => {
    if (!isHydrated.value || isHydrating.value || isScrolling.value || isProgrammaticScroll.value || pendingScroll.value) {
      return;
    }
    if (!bottomIntentX && !bottomIntentY) {
      return;
    }
    const maxX = Math.max(0, totalWidth.value - viewportWidth.value + bottomExtraX);
    const maxY = Math.max(0, totalHeight.value - viewportHeight.value + bottomExtraY);
    const targetX = bottomIntentX && !isRtl.value && internalScrollX.value < maxX - 0.5 ? maxX : null;
    const targetY = bottomIntentY && internalScrollY.value < maxY - 0.5 ? maxY : null;
    if (targetX === null && targetY === null) {
      // Already flush at the end (or empty content): stay glued — further
      // settling measurements may still move the real end. The intent is only
      // cancelled when the user scrolls away from the end.
      return;
    }
    scrollToOffset(targetX, targetY, { behavior: 'auto', isCorrection: true });
  };

  watch([ treeUpdateFlag, viewportWidth, viewportHeight, isHydrating ], () => {
    checkPendingScroll();
    checkBottomReanchor();
  });
  watch(isScrolling, (scrolling) => {
    if (!scrolling) {
      checkPendingScroll();
      checkBottomReanchor();
    }
  });

  const updateHostOffset = () => {
    if (typeof window === 'undefined') {
      return;
    }
    const container = getContainer();
    const calculateOffset = (el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      if (container === window) {
        return {
          x: isRtl.value ? document.documentElement.clientWidth - rect.right - window.scrollX : rect.left + window.scrollX,
          y: rect.top + window.scrollY,
        };
      }
      if (container === el) {
        return { x: 0, y: 0 };
      }
      if (isElement(container)) {
        const containerRect = container.getBoundingClientRect();
        // Measure from the container's padding box: scroll positions are relative
        // to the scrollport origin, so a rendered border must not leak into the
        // content offset (it would shift every programmatic scroll target by the
        // border width). `border-style: none` widths have no layout effect.
        const containerStyle = getComputedStyle(container);
        const borderX = (isRtl.value
          ? containerStyle.borderRightStyle !== 'none' && Number.parseFloat(containerStyle.borderRightWidth) > 0
          : containerStyle.borderLeftStyle !== 'none' && Number.parseFloat(containerStyle.borderLeftWidth) > 0)
          ? Number.parseFloat(isRtl.value ? containerStyle.borderRightWidth : containerStyle.borderLeftWidth)
          : 0;
        const borderY = (containerStyle.borderTopStyle !== 'none' && Number.parseFloat(containerStyle.borderTopWidth) > 0)
          ? Number.parseFloat(containerStyle.borderTopWidth)
          : 0;
        return {
          x: isRtl.value ? containerRect.right - borderX - rect.right - container.scrollLeft : rect.left - containerRect.left - borderX + container.scrollLeft,
          y: rect.top - containerRect.top - borderY + container.scrollTop,
        };
      }
      return { x: 0, y: 0 };
    };
    if (props.value.hostElement && (container === window || container !== props.value.hostRef)) {
      // When the scroll container is the component's own host (default), the
      // wrapper is the first content of the scrollport, so its offset is a
      // constant 0 — re-measuring it against (possibly layout-less) rects on
      // every scroll would drift. Only the window and external-element
      // containers can have the list preceded by other content, so only there
      // do we re-measure the wrapper offset.
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

  const updateScrollbarOffset = (container: HTMLElement | Window | null) => {
    if (!isElement(container)) {
      scrollbarOffset.x = 0;
      scrollbarOffset.y = 0;
      return;
    }
    const cs = getComputedStyle(container);
    scrollbarOffset.x = isRtl.value
      ? (Number.parseFloat(cs.paddingRight) || 0)
      : (Number.parseFloat(cs.paddingLeft) || 0);
    scrollbarOffset.y = Number.parseFloat(cs.paddingTop) || 0;
  };

  const attachEvents = (container: HTMLElement | Window) => {
    // v8 ignore start -- defensive SSR guard; the scroll listener is only attached when window exists
    if (typeof window === 'undefined') {
      return;
    }
    // v8 ignore stop
    const effectiveContainer = container;
    const scrollTarget = (effectiveContainer === window || (isElement(effectiveContainer) && effectiveContainer === document.documentElement)) ? document : effectiveContainer;
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true });
    updateDirection();
    let directionObserver: MutationObserver | null = null;
    const observeElement = isElement(effectiveContainer) ? effectiveContainer : document.documentElement;
    directionObserver = new MutationObserver(() => updateDirection());
    directionObserver.observe(observeElement, { attributes: true, attributeFilter: [ 'dir', 'style' ] });
    if (effectiveContainer === window) {
      viewportWidth.value = document.documentElement.clientWidth;
      viewportHeight.value = document.documentElement.clientHeight;
      scrollX.value = window.scrollX;
      scrollY.value = window.scrollY;
      updateScrollbarOffset(effectiveContainer);
      const onResize = () => {
        updateDirection();
        viewportWidth.value = document.documentElement.clientWidth;
        viewportHeight.value = document.documentElement.clientHeight;
        updateHostOffset();
        updateScrollbarOffset(effectiveContainer);
      };
      window.addEventListener('resize', onResize);
      return () => {
        scrollTarget.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', onResize);
        directionObserver?.disconnect();
      };
    } else {
      viewportWidth.value = (effectiveContainer as HTMLElement).clientWidth;
      viewportHeight.value = (effectiveContainer as HTMLElement).clientHeight;
      scrollX.value = (effectiveContainer as HTMLElement).scrollLeft;
      scrollY.value = (effectiveContainer as HTMLElement).scrollTop;
      updateScrollbarOffset(effectiveContainer);
      const resizeObserver = new ResizeObserver(() => {
        updateDirection();
        viewportWidth.value = (effectiveContainer as HTMLElement).clientWidth;
        viewportHeight.value = (effectiveContainer as HTMLElement).clientHeight;
        updateHostOffset();
        updateScrollbarOffset(effectiveContainer);
      });
      resizeObserver.observe(effectiveContainer as HTMLElement);
      return () => {
        scrollTarget.removeEventListener('scroll', handleScroll);
        resizeObserver.disconnect();
        directionObserver?.disconnect();
      };
    }
  };

  let cleanup: (() => void) | undefined;
  if (getCurrentInstance()) {
    onMounted(() => {
      isMounted.value = true;
      updateDirection();
      watch(() => props.value.container, () => {
        cleanup?.();
        cleanup = attachEvents(getContainer());
      }, { immediate: true });
      updateHostOffset();
      nextTick(() => {
        updateHostOffset();
        if (props.value.ssrRange || props.value.initialScrollIndex !== undefined) {
          const initialIndex = props.value.initialScrollIndex !== undefined ? props.value.initialScrollIndex : props.value.ssrRange?.start;
          const initialAlign = props.value.initialScrollAlign || 'start';
          // v8 ignore next -- SSRRange.start is required by the type, so initialIndex is always defined here
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
  ], () => {
    initializeSizes();
    // Content size (and possibly the coordinate scale) changed: after the DOM
    // updates, re-read the actual container scroll position so the rendered
    // range always matches the viewport. The browser may clamp the scroll
    // offset, or the scale correction may be deferred, without a scroll event
    // reaching the handler — leaving items rendered for a stale offset until
    // the next scroll.
    nextTick(() => {
      // v8 ignore next 2 -- defensive SSR guard; the scroll listener is only attached when window exists
      if (typeof window === 'undefined') {
        return;
      }
      const container = getContainer();
      if (container === window) {
        scrollX.value = window.scrollX;
        scrollY.value = window.scrollY;
        internalScrollX.value = displayToVirtual(isRtl.value ? Math.abs(window.scrollX) : window.scrollX, componentOffset.x, scaleX.value);
        internalScrollY.value = displayToVirtual(window.scrollY, componentOffset.y, scaleY.value);
        return;
      }
      if (isElement(container)) {
        scrollX.value = container.scrollLeft;
        scrollY.value = container.scrollTop;
        internalScrollX.value = displayToVirtual(isRtl.value ? Math.abs(container.scrollLeft) : container.scrollLeft, componentOffset.x, scaleX.value);
        internalScrollY.value = displayToVirtual(container.scrollTop, componentOffset.y, scaleY.value);
      }
    });
  }, { immediate: true });

  watch(() => [ props.value.container, props.value.hostElement ], () => {
    updateHostOffset();
  });
  watch(isRtl, (newRtl, oldRtl) => {
    // v8 ignore next 2 -- registered after mount; isRtl only changes while mounted with a different value
    if (oldRtl === undefined || newRtl === oldRtl || !isMounted.value) {
      return;
    }
    updateScrollbarOffset(getContainer());
    if (direction.value === 'vertical') {
      updateHostOffset();
      return;
    }
    const scrollValue = oldRtl ? Math.abs(scrollX.value) : scrollX.value;
    const oldRelativeScrollX = displayToVirtual(scrollValue, hostOffset.x, scaleX.value);
    updateHostOffset();
    scrollToOffset(oldRelativeScrollX, null, { behavior: 'auto' });
  }, { flush: 'sync' });

  watch([ scaleX, scaleY ], () => {
    if (!isMounted.value || isScrolling.value || isProgrammaticScroll.value) {
      return;
    }
    scrollToOffset(internalScrollX.value, internalScrollY.value, { behavior: 'auto' });
  });

  watch([ () => props.value.items.length, () => props.value.columnCount ], ([ newLen, newColCount ], [ oldLen, oldColCount ]) => {
    nextTick(() => {
      const maxRelX = Math.max(0, totalWidth.value - viewportWidth.value);
      const maxRelY = Math.max(0, totalHeight.value - viewportHeight.value);
      if (internalScrollX.value > maxRelX || internalScrollY.value > maxRelY) {
        scrollToOffset(Math.min(internalScrollX.value, maxRelX), Math.min(internalScrollY.value, maxRelY), { behavior: 'auto' });
      } else if ((newLen !== oldLen && scaleY.value !== 1) || (newColCount !== oldColCount && scaleX.value !== 1)) {
        scrollToOffset(internalScrollX.value, internalScrollY.value, { behavior: 'auto' });
      }
      updateHostOffset();
    });
  });

  return {
    /** Reactive list of items to render in the current viewport. */
    renderedItems,
    /** Total calculated width of the scrollable content area (DU). */
    totalWidth,
    /** Total calculated height of the scrollable content area (DU). */
    totalHeight,
    /** Physical width of the content in the DOM (clamped to browser limits). */
    renderedWidth,
    /** Physical height of the content in the DOM (clamped to browser limits). */
    renderedHeight,
    /** Detailed information about the current scroll state. */
    scrollDetails: computedScrollDetails,
    /** Helper to get the height of a specific row. */
    getRowHeight,
    /** Helper to get the width of a specific column. */
    getColumnWidth,
    /** Helper to get the virtual offset of a specific row. */
    getRowOffset: (index: number) => (flowStartY.value + stickyStartY.value + paddingStartY.value) + calculateOffsetAt(index, fixedItemSize.value, props.value.gap || 0, (idx) => itemSizesY.query(idx)),
    /** Helper to get the virtual offset of a specific column. */
    getColumnOffset: (index: number) => {
      const itemsStartVU_X = flowStartX.value + stickyStartX.value + paddingStartX.value;
      if (direction.value === 'both') {
        return itemsStartVU_X + calculateOffsetAt(index, fixedColumnWidth.value, props.value.columnGap || 0, (idx) => columnSizes.query(idx));
      }
      return itemsStartVU_X + calculateOffsetAt(index, fixedItemSize.value, props.value.columnGap || 0, (idx) => itemSizesX.query(idx));
    },
    /** Helper to get the virtual offset of a specific item. */
    getItemOffset,
    /** Helper to get the size of a specific item along the scroll axis. */
    getItemSize,
    /** Programmatically scroll to a specific row and/or column. */
    scrollToIndex,
    /** Programmatically scroll to a specific virtual pixel offset. */
    scrollToOffset,
    /** Immediately stops any currently active smooth scroll animation and clears pending corrections. */
    stopProgrammaticScroll,
    /** Adjusts the scroll position to compensate for measurement changes. */
    handleScrollCorrection,
    /** Updates the size of a single item from measurements. */
    updateItemSize,
    /** Updates the size of multiple items from measurements. */
    updateItemSizes,
    /** Updates the physical offset of the component relative to its scroll container. */
    updateHostOffset,
    /** Detects the current direction (LTR/RTL) of the scroll container. */
    updateDirection,
    /** Information about the currently visible range of columns. */
    columnRange,
    /** Resets all dynamic measurements and re-initializes from current props. */
    refresh: () => coreRefresh(),
    /** Whether the component has finished its first client-side mount. */
    isHydrated,
    /** Whether the scroll container is the window object. */
    isWindowContainer,
    /** Whether the scroll container is in Right-to-Left (RTL) mode. */
    isRtl,
    /** Coordinate scaling factor for X axis. */
    scaleX,
    /** Coordinate scaling factor for Y axis. */
    scaleY,
    /** Absolute offset of the component within its container. */
    componentOffset,
    /** Inline-start/block-start padding of the scroll container, used to align the virtual scrollbar overlay (DU). */
    scrollbarOffset,
    /** Physical width of the virtualized content area (clamped). */
    renderedVirtualWidth,
    /** Physical height of the virtualized content area (clamped). */
    renderedVirtualHeight,
    /** Helper to get the row (or item) index at a specific virtual offset (VU). */
    getRowIndexAt,
    /** Helper to get the column index at a specific virtual offset (VU). */
    getColIndexAt,
    /** @internal */
    __internalState: ctx.internalState,
  };
}
