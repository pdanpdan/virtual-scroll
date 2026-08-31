<script setup lang="ts" generic="T">
/**
 * A high-performance virtual scrolling component for Vue 3.
 * Supports large lists and grids by only rendering visible items and using coordinate scaling.
 * Features include sticky headers/footers, RTL support, custom scrollbars, and scroll restoration.
 */
import type {
  ItemSlotProps,
  RenderedItem,
  ScrollAlignment,
  ScrollbarSlotProps,
  ScrollDetails,
  ScrollToIndexOptions,
  VirtualScrollComponentProps,
  VirtualScrollProps,
} from '../types';
import type { VNodeChild } from 'vue';

import { computed, nextTick, ref, toRefs, useId, watch } from 'vue';

import {
  useVirtualScroll,
} from '../composables/useVirtualScroll';
import { useVirtualScrollbar } from '../composables/useVirtualScrollbar';
import { useVirtualScrollInertia } from '../composables/useVirtualScrollInertia';
import { useVirtualScrollKeyboard } from '../composables/useVirtualScrollKeyboard';
import { useVirtualScrollObservers } from '../composables/useVirtualScrollObservers';
import {
  useCoordinateScalingExtension,
  useInfiniteLoadingExtension,
  usePrependRestorationExtension,
  useRtlExtension,
  useSnappingExtension,
  useStickyExtension,
} from '../extensions/all';
import { getPaddingX, getPaddingY, isWindowLike } from '../utils/scroll';
import {
  calculateItemStyle,
  displayToVirtual,
} from '../utils/virtual-scroll-logic';
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
  itemRole: undefined,
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
  item?: (props: ItemSlotProps<T>) => VNodeChild;

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
const loadingRef = ref<HTMLElement | null>(null);
const itemRefs = new Map<number, HTMLElement>();

const instanceId = useId();

/**
 * Unique ID for the scrollable container.
 * Used for accessibility (aria-controls) and to target the element in DOM.
 */
const containerId = computed(() => `vs-container-${ instanceId }`);

const extensions = [
  useRtlExtension<T>(),
  useSnappingExtension<T>(),
  useStickyExtension<T>(),
  useInfiniteLoadingExtension<T>({
    onLoad: (dir) => emit('load', dir),
  }),
  usePrependRestorationExtension<T>(),
  useCoordinateScalingExtension<T>(),
];

const measuredPaddingStart = ref(0);
const measuredPaddingEnd = ref(0);

const effectiveContainer = computed(() => (props.container === undefined ? hostRef.value : props.container));

const isHeaderFooterInsideContainer = computed(() => {
  const container = effectiveContainer.value;
  return container === hostRef.value || isWindowLike(container);
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
    snap: props.snap,
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
  updateItemSize,
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
  scrollbarOffset,
  renderedVirtualWidth,
  renderedVirtualHeight,
  getRowIndexAt,
  getColIndexAt,
} = useVirtualScroll(virtualScrollProps, extensions);

const useVirtualScrolling = computed(() => scaleX.value !== 1 || scaleY.value !== 1);

const showVirtualScrollbars = computed(() => {
  if (isWindowContainer.value) {
    return false;
  }
  return props.virtualScrollbar === true || scaleX.value !== 1 || scaleY.value !== 1;
});

function handleScrollbarScrollToOffset(axis: 'vertical' | 'horizontal', offset: number) {
  const { displayViewportSize } = scrollDetails.value;
  const isVertical = axis === 'vertical';
  const renderedSize = isVertical ? renderedHeight.value : renderedWidth.value;
  const viewportDim = isVertical ? displayViewportSize.height : displayViewportSize.width;
  const componentOff = isVertical ? componentOffset.y : componentOffset.x;
  const scale = isVertical ? scaleY.value : scaleX.value;
  const scrollableRange = renderedSize - viewportDim;
  if (offset >= scrollableRange - 0.5) {
    scrollToOffset(isVertical ? null : Number.POSITIVE_INFINITY, isVertical ? Number.POSITIVE_INFINITY : null);
  } else {
    const virtualOffset = displayToVirtual(offset, componentOff, scale);
    scrollToOffset(isVertical ? null : virtualOffset, isVertical ? virtualOffset : null);
  }
}

const verticalScrollbar = useVirtualScrollbar(computed(() => ({
  axis: 'vertical' as const,
  totalSize: renderedHeight.value,
  position: scrollDetails.value.displayScrollOffset.y,
  viewportSize: scrollDetails.value.displayViewportSize.height,
  scrollToOffset: (offset: number) => handleScrollbarScrollToOffset('vertical', offset),
  containerId: containerId.value,
  isRtl: isRtl.value,
})));

const horizontalScrollbar = useVirtualScrollbar(computed(() => ({
  axis: 'horizontal' as const,
  totalSize: renderedWidth.value,
  position: scrollDetails.value.displayScrollOffset.x,
  viewportSize: scrollDetails.value.displayViewportSize.width,
  scrollToOffset: (offset: number) => handleScrollbarScrollToOffset('horizontal', offset),
  containerId: containerId.value,
  isRtl: isRtl.value,
})));

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
      // v8 ignore next -- setItemRef deletes falsy refs, so entries never hold null
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
  if (!isHydrated.value || !details) {
    return;
  }
  emit('scroll', details);

  if (
    !oldDetails
    || !oldDetails.range
    || !oldDetails.columnRange
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
});

watch(isHydrated, (hydrated) => {
  // v8 ignore next -- fires once with hydrated=true; scrollDetails is always defined by then
  if (hydrated && scrollDetails.value?.range && scrollDetails.value?.columnRange) {
    emit('visibleRangeChange', {
      start: scrollDetails.value.range.start,
      end: scrollDetails.value.range.end,
      colStart: scrollDetails.value.columnRange.start,
      colEnd: scrollDetails.value.columnRange.end,
    });
  }
}, { once: true });

const { setItemRef } = useVirtualScrollObservers({
  hostRef,
  wrapperRef,
  headerRef,
  footerRef,
  measuredPaddingStart,
  measuredPaddingEnd,
  itemRefs,
  direction: props.direction,
  updateHostOffset,
  updateItemSizes,
});

const {
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleWheel,
  stopInertia,
} = useVirtualScrollInertia({
  useVirtualScrolling,
  scrollDetails,
  scrollToOffset,
  stopProgrammaticScroll,
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

const { handleKeyDown } = useVirtualScrollKeyboard({
  props,
  virtualScrollProps,
  scrollDetails,
  isRtl,
  scrollToIndex,
  scrollToOffset,
  stopProgrammaticScroll,
  getRowHeight,
  getColumnWidth,
  getRowOffset,
  getColumnOffset,
  getItemOffset,
  getItemSize,
  getRowIndexAt,
  getColIndexAt,
  getLoadingSlotSize: () => loadingRef.value?.offsetHeight ?? 0,
});

const containerStyle = computed(() => {
  const base: Record<string, string | number | undefined> = {
    ...(props.direction !== 'vertical' ? { whiteSpace: 'nowrap' as const } : {}),
  };

  if (showVirtualScrollbars.value || !isWindowContainer.value) {
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
      display: 'block',
      minInlineSize: props.direction === 'vertical' ? '100%' : 'auto',
    };
  }

  return base;
});

/**
 * Internal helper to generate consistent ScrollbarSlotProps.
 *
 * @param axis - The scroll axis.
 * @param totalSize - Total scrollable size (DU).
 * @param position - Current scroll position (DU).
 * @param viewportSize - Current viewport size (DU).
 * @param scrollToOffsetCallback - Callback to perform scroll.
 * @param scrollbar - Scrollbar state from useVirtualScrollbar.
 * @returns Props for the scrollbar slot or null if content fits.
 */
function getScrollbarSlotProps(
  axis: 'vertical' | 'horizontal',
  totalSize: number,
  position: number,
  viewportSize: number,
  scrollToOffsetCallback: (offset: number) => void,
  scrollbar: ReturnType<typeof useVirtualScrollbar>,
): ScrollbarSlotProps | null {
  if (totalSize <= viewportSize) {
    return null;
  }

  return {
    axis,
    positionPercent: scrollbar.positionPercent.value,
    viewportPercent: scrollbar.viewportPercent.value,
    thumbSizePercent: scrollbar.thumbSizePercent.value,
    thumbPositionPercent: scrollbar.thumbPositionPercent.value,
    trackProps: scrollbar.trackProps.value,
    thumbProps: scrollbar.thumbProps.value,
    scrollbarProps: {
      axis,
      totalSize,
      position,
      viewportSize,
      scrollToOffset: scrollToOffsetCallback,
      containerId: containerId.value,
      isRtl: isRtl.value,
      ariaLabel: `${ axis === 'vertical' ? 'Vertical' : 'Horizontal' } scroll`,
    },
    isDragging: scrollbar.isDragging.value,
  };
}

const verticalScrollbarProps = computed(() => {
  if (props.direction === 'horizontal') {
    return null;
  }
  const { displayViewportSize, displayScrollOffset } = scrollDetails.value;
  return getScrollbarSlotProps(
    'vertical',
    renderedHeight.value,
    displayScrollOffset.y,
    displayViewportSize.height,
    (offset: number) => handleScrollbarScrollToOffset('vertical', offset),
    verticalScrollbar,
  );
});

const horizontalScrollbarProps = computed(() => {
  if (props.direction === 'vertical') {
    return null;
  }
  const { displayViewportSize, displayScrollOffset } = scrollDetails.value;
  return getScrollbarSlotProps(
    'horizontal',
    renderedWidth.value,
    displayScrollOffset.x,
    displayViewportSize.width,
    (offset: number) => handleScrollbarScrollToOffset('horizontal', offset),
    horizontalScrollbar,
  );
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
  // Sticky items stick below the sticky header/footer: the inset is the user
  // scroll padding plus the measured sticky start/end (e.g. the header slot).
  const scrollPadding = virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; };
  const sticky = virtualScrollProps.value.stickyStart as { x: number; y: number; };

  const style = calculateItemStyle({
    // v8 ignore next -- containerTag has a default, so the falsy fallback is unreachable
    containerTag: props.containerTag || 'div',
    direction: props.direction,
    isHydrated: isHydrated.value,
    item,
    itemSize: props.itemSize,
    paddingStartX: scrollPadding.x + sticky.x,
    paddingStartY: scrollPadding.y + sticky.y,
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

const effectiveRole = computed(() => {
  if (props.role) {
    return props.role;
  }
  return isTable.value ? null : (props.direction === 'both' ? 'grid' : 'list');
});

const isGrid = computed(() => effectiveRole.value === 'grid' || isTable.value);

// v8 ignore start -- template short-circuits on isTable, so the isTable branch never evaluates
const containerRole = computed(() => isTable.value
  ? null
  : ((props.ariaLabel || props.ariaLabelledby) ? 'region' : 'none'));
// v8 ignore stop
const wrapperRole = computed(() => isTable.value ? null : effectiveRole.value);
const internalItemRole = computed(() => {
  if (isGrid.value) {
    return 'row';
  }

  const role = effectiveRole.value;
  if (role === 'tree') {
    return 'treeitem';
  }
  if (role === 'listbox') {
    return 'option';
  }
  if (role === 'menu') {
    return 'menuitem';
  }
  return 'listitem';
});
const itemRole = computed(() => props.itemRole ?? internalItemRole.value);
const cellRole = computed(() => {
  if (props.role === 'grid' || (!props.role && props.direction === 'both')) {
    return 'gridcell';
  }
  return isTable.value ? 'cell' : null;
});

const shouldBindItemAria = computed(() => {
  const role = itemRole.value;
  return role == null || (role !== 'none' && role !== 'presentation');
});

const rootAriaProps = computed(() => ({
  'aria-label': props.ariaLabel,
  'aria-labelledby': props.ariaLabelledby,
  'aria-busy': props.loading ? 'true' : undefined,
}));

const wrapperAriaProps = computed(() => {
  const aria: Record<string, string | number | undefined> = {};

  const role = effectiveRole.value;
  const supportsOrientation = role && [ 'grid', 'tree', 'listbox', 'menu', 'tablist' ].includes(role);

  if (supportsOrientation) {
    aria[ 'aria-orientation' ] = props.direction === 'both' ? undefined : props.direction;
  }

  if (isGrid.value) {
    aria[ 'aria-rowcount' ] = props.items.length;
    if (props.columnCount > 0) {
      aria[ 'aria-colcount' ] = props.columnCount;
    }
  }

  return aria;
});

function getItemAriaProps(index: number) {
  const aria: Record<string, string | number | undefined> = {};

  if (isGrid.value) {
    aria[ 'aria-rowindex' ] = index + 1;
  } else {
    aria[ 'aria-setsize' ] = props.items.length;
    aria[ 'aria-posinset' ] = index + 1;
  }

  const role = itemRole.value;
  // v8 ignore next -- itemRole falls back to internalItemRole, which is never null
  if (role !== null) {
    aria.role = (role === 'none' || role === 'presentation')
      ? internalItemRole.value
      : role;
  }

  return aria;
}

function getCellAriaProps(colIndex: number) {
  const role = cellRole.value;
  if (!role) {
    return {};
  }

  const aria: Record<string, string | number | undefined> = {
    role,
  };

  // v8 ignore next -- a truthy cellRole implies grid or table mode, so isGrid is always true here
  if (isGrid.value) {
    aria[ 'aria-colindex' ] = colIndex + 1;
  }

  return aria;
}

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
   * Helper to get ARIA attributes for a cell.
   * @param colIndex - The column index.
   */
  getCellAriaProps,

  /**
   * Helper to get ARIA attributes for an item.
   * @param index - The item index.
   */
  getItemAriaProps,

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
   * Whether the component is in table mode.
   */
  isTable,

  /**
   * The ARIA role of the items wrapper.
   */
  wrapperRole,

  /**
   * The ARIA role of each cell in grid mode.
   */
  cellRole,

  /**
   * The tag used for rendering items.
   */
  // v8 ignore next -- itemTag has a default, so the falsy fallback is unreachable
  itemTag: computed(() => props.itemTag || 'div'),

  /**
   * Helper to get the row (or item) index at a specific vertical (or horizontal in horizontal mode) virtual offset (VU).
   * @param offset - The virtual pixel offset.
   * @see useVirtualScroll
   */
  getRowIndexAt,

  /**
   * Helper to get the column index at a specific horizontal virtual offset (VU).
   * @param offset - The virtual pixel offset.
   * @see useVirtualScroll
   */
  getColIndexAt,

  /**
   * Programmatically scroll to a specific row and/or column.
   *
   * @param rowIndex - The row index to scroll to. Pass null to only scroll horizontally. Optional.
   * @param colIndex - The column index to scroll to. Pass null to only scroll vertically. Optional.
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
   * Updates the physical offset of the component relative to its scroll container.
   * Useful after layout changes (e.g., parent resize, DOM mutations).
   * @see useVirtualScroll
   */
  updateHostOffset,

  /**
   * Updates the size of a single item in the measurement tree.
   * @param index - The item index.
   * @param inlineSize - Measured inline size of the element (width for horizontal, width in both modes).
   * @param blockSize - Measured block size of the element (height for vertical, height in both modes).
   * @param element - Optional DOM element used for column measurement in grid mode.
   * @see useVirtualScroll
   */
  updateItemSize,

  /**
   * Batch-updates sizes for multiple items.
   * @param updates - Array of size measurements.
   * @see useVirtualScroll
   */
  updateItemSizes,

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
    :role="isTable ? undefined : containerRole"
    v-bind="isTable ? { ...rootAriaProps, ...wrapperAriaProps } : rootAriaProps"
    @keydown="handleKeyDown"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  >
    <div
      v-if="showVirtualScrollbars"
      class="virtual-scroll-scrollbar-container"
      aria-hidden="true"
    >
      <div
        class="virtual-scroll-scrollbar-viewport"
        :style="{
          'inlineSize': `${ scrollDetails.displayViewportSize.width }px`,
          'blockSize': `${ scrollDetails.displayViewportSize.height }px`,
          'insetInlineStart': `${ -scrollbarOffset.x }px`,
          'insetBlockStart': `${ -scrollbarOffset.y }px`,
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
      :role="isTable ? undefined : 'none'"
    >
      <slot name="header" />
    </component>

    <component
      :is="wrapperTag"
      ref="wrapperRef"
      class="virtual-scroll-wrapper"
      :style="wrapperStyle"
      :role="isTable ? undefined : wrapperRole"
      v-bind="isTable ? {} : wrapperAriaProps"
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
        v-bind="shouldBindItemAria ? getItemAriaProps(renderedItem.index) : { role: 'none' }"
      >
        <slot
          name="item"
          :item="renderedItem.item"
          :index="renderedItem.index"
          :get-item-aria-props="getItemAriaProps"
          :column-range="slotColumnRange"
          :get-column-width="getColumnWidth"
          :get-cell-aria-props="getCellAriaProps"
          :gap="props.gap"
          :column-gap="props.columnGap"
          :is-sticky="renderedItem.isSticky"
          :is-sticky-active="renderedItem.isStickyActive"
          :is-sticky-active-x="renderedItem.isStickyActiveX"
          :is-sticky-active-y="renderedItem.isStickyActiveY"
          :offset="renderedItem.offset"
        />

        <div v-if="isDebug" class="virtual-scroll-debug-info">
          #{{ renderedItem.index }} ({{ Math.round(renderedItem.offset.x) }}, {{ Math.round(renderedItem.offset.y) }})
        </div>
      </component>
    </component>

    <div
      v-if="slots.loading"
      ref="loadingRef"
      class="virtual-scroll-loading"
      :class="{ 'virtual-scroll-loading--hidden': !loading }"
      :style="loadingStyle"
      aria-live="polite"
      aria-atomic="true"
    >
      <slot name="loading" />
    </div>

    <component
      :is="footerTag"
      v-if="slots.footer"
      ref="footerRef"
      class="virtual-scroll-footer"
      :class="{ 'virtual-scroll--sticky': stickyFooter }"
      :role="isTable ? undefined : 'none'"
    >
      <slot name="footer" />
    </component>
  </component>
</template>

<style scoped>
@layer components {
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

  .virtual-scroll-loading--hidden {
    visibility: hidden;
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
}
</style>
