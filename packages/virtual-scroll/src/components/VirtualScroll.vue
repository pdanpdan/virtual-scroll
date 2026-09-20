<script setup lang="ts" generic="T">
/**
 * Virtual scrolling component for Vue 3: renders only the items near the viewport
 * and switches to coordinate scaling when the content passes the browser's scroll
 * limit. Sticky items, RTL, snapping, infinite loading, prepend restoration and
 * custom scrollbars are wired in as extensions; the `./core` entry builds the same
 * component without them.
 */
import type { LoadDetails } from '../extensions/all';
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
import type { Component, VNodeChild } from 'vue';

import { computed, nextTick, ref, toRefs, useId, watch } from 'vue';

import { useLiveRegion } from '../composables/useLiveRegion';
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
import VirtualScrollbars from './VirtualScrollbars.vue';

export interface Props<T = unknown> extends VirtualScrollComponentProps<T> {}

const props = withDefaults(defineProps<Props<T>>(), {
  direction: 'vertical',
  bufferBefore: 5,
  bufferAfter: 5,
  columnCount: 0,
  containerTag: 'div',
  wrapperTag: 'div',
  itemTag: 'div',
  headerTag: 'div',
  footerTag: 'div',
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
  (e: 'load', direction: 'vertical' | 'horizontal', details: LoadDetails): void;
  (e: 'itemActivate', index: number, item: T | undefined): void;
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

/**
 * `true` in the lean `./core` entry, where the optional wiring (keyboard,
 * custom scrollbars, snapping, sticky items, infinite loading and prepend
 * restoration) is compiled out. Replaced by the bundler; `false` in the full
 * build, in tests and in dev.
 */
/* v8 ignore next 2 -- the flag is undefined outside the two builds (vite.config.core.ts) */
const IS_CORE_BUILD
  /* eslint-disable-next-line no-undef -- injected by the bundler (see src/globals.d.ts) */
  = typeof __VS_CORE_BUILD__ === 'boolean' && __VS_CORE_BUILD__;

/**
 * Extensions wired by the component: the two the engine relies on for correct
 * behaviour (RTL detection and coordinate scaling), plus the optional ones.
 */
const extensions = [
  useRtlExtension<T>(),
  useCoordinateScalingExtension<T>(),
  /* The optional half of this list is compiled out of the lean build; both
     builds are asserted by tests/bundle-size and tests/build-output. */
  /* v8 ignore start -- only the full build's branch runs in these suites */
  ...(IS_CORE_BUILD
    ? []
    : [
      useSnappingExtension<T>(),
      useStickyExtension<T>(),
      useInfiniteLoadingExtension<T>({
        onLoad: (dir, details) => emit('load', dir, details),
      }),
      usePrependRestorationExtension<T>(),
    ]),
  /* v8 ignore stop */
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
  getColumnIndexAt,
  scrollCorrection,
} = useVirtualScroll(virtualScrollProps, extensions);

const useVirtualScrolling = computed(() => scaleX.value !== 1 || scaleY.value !== 1);

/** The scrollbar overlay, or `null` in the lean build. */
/* v8 ignore next -- the lean build is asserted by tests/build-output.test.ts */
const ScrollbarOverlay: Component | null = IS_CORE_BUILD ? null : VirtualScrollbars;

/* The three defaults below only survive in the lean build; both builds are
   asserted by tests/build-output.test.ts. */
/* v8 ignore start -- lean build only */
/** Whether the custom scrollbars are shown instead of the native one. */
let showVirtualScrollbars = computed(() => false);
/** Slot props of the vertical scrollbar, or `null` when it is not shown. */
let verticalScrollbarProps = computed<ScrollbarSlotProps | null>(() => null);
/** Slot props of the horizontal scrollbar, or `null` when it is not shown. */
let horizontalScrollbarProps = computed<ScrollbarSlotProps | null>(() => null);
/* v8 ignore stop */

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

/* v8 ignore next -- the `if` is always taken outside the lean build */
if (!IS_CORE_BUILD) {
  showVirtualScrollbars = computed(() => {
    if (isWindowContainer.value) {
      return false;
    }
    return props.virtualScrollbar === true || scaleX.value !== 1 || scaleY.value !== 1;
  });
}

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
  shiftOrigin,
} = useVirtualScrollInertia({
  useVirtualScrolling,
  scrollDetails,
  scrollToOffset,
  stopProgrammaticScroll,
});

// Measurement corrections move the content under a drag: follow them instead of
// letting the next pointer move undo them.
watch(scrollCorrection, ({ x, y }) => {
  shiftOrigin(x, y);
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
 * Roles that publish an active descendant. A `grid` is deliberately not one of
 * them: a two-axis list defaults to that role, and flipping its keyboard model
 * is opt-in through `keyboardActivation`.
 */
const ACTIVE_DESCENDANT_ROLES = new Set([ 'listbox', 'menu', 'tree' ]);

/** ARIA role of the component, from the `role` prop or the direction. */
const effectiveRole = computed((): string => {
  if (props.role) {
    return props.role;
  }
  return props.direction === 'both' ? 'grid' : 'list';
});

/** Keydown handler installed in the full build; `undefined` in the lean build. */
let handleKeyDown: ((event: KeyboardEvent) => void) | undefined;
/** Index of the item tracked by keyboard navigation, `-1` when none. */
let activeIndex = ref(-1);
/* The four defaults below only survive in the lean build, where the composable
   that overwrites them is compiled out. */
/* v8 ignore start -- lean build only */
/** Polite announcement for the active item. */
let liveMessage = computed(() => '');
/** Sets the active item index without scrolling. */
let setActiveIndex: (index: number | null) => void = () => {};
/** Marks an item active and emits `itemActivate` (e.g. from a click handler). */
let handleItemActivate: (index: number) => void = () => {};
/* v8 ignore stop */

/* v8 ignore next -- the `if` is always taken outside the lean build */
if (!IS_CORE_BUILD) {
  ({
    handleKeyDown,
    activeIndex,
    liveMessage,
    setActiveIndex,
    handleItemActivate,
  } = useVirtualScrollKeyboard({
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
    getColumnIndexAt,
    getLoadingSlotSize: () => loadingRef.value?.offsetHeight ?? 0,
    /**
     * Roles with an active descendant read the active item, so they get the
     * roving model; a plain list keeps scrolling the viewport.
     */
    activationMode: computed<'item' | 'viewport'>(() => {
      const requested = props.keyboardActivation ?? 'auto';
      if (requested !== 'auto') {
        return requested;
      }
      return ACTIVE_DESCENDANT_ROLES.has(effectiveRole.value) ? 'item' : 'viewport';
    }),
    onActivate: (index: number) => emit('itemActivate', index, props.items[ index ]),
  }));
}

/** `aria-activedescendant` target while an item is active. */
const activeDescendant = computed(() => (activeIndex.value >= 0 ? `${ containerId.value }-item-${ activeIndex.value }` : undefined));

useLiveRegion(hostRef, liveMessage);

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

  return base;
});

/* v8 ignore next -- the `if` is always taken outside the lean build */
if (!IS_CORE_BUILD) {
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

  /**
   * Internal helper to generate consistent ScrollbarSlotProps.
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

  verticalScrollbarProps = computed(() => {
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

  horizontalScrollbarProps = computed(() => {
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
}

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
    containerTag: 'div',
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

const isGrid = computed(() => effectiveRole.value === 'grid');

const containerRole = computed(() => (props.ariaLabel || props.ariaLabelledby) ? 'region' : undefined);
const wrapperRole = computed(() => effectiveRole.value);
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
  return null;
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
   * Index of the item tracked by keyboard navigation, `-1` when no item is active.
   * @see useVirtualScrollKeyboard
   */
  activeIndex,

  /**
   * Sets the active item index without scrolling. Pass `null` to clear it.
   * @param index - The item index, or `null`.
   */
  setActiveIndex,

  /**
   * Marks an item active and emits `itemActivate` - wire it to your click handler.
   * @param index - The item index.
   */
  handleItemActivate,

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
   * The ARIA role of the items wrapper.
   */
  wrapperRole,

  /**
   * The ARIA role of each cell in grid mode.
   */
  cellRole,

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
  getColumnIndexAt,

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
        'virtual-scroll--hide-scrollbar': showVirtualScrollbars,
      },
    ]"
    :style="containerStyle"
    tabindex="0"
    :role="containerRole"
    v-bind="rootAriaProps"
    @keydown="handleKeyDown?.($event)"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  >
    <component
      :is="ScrollbarOverlay"
      v-if="ScrollbarOverlay && showVirtualScrollbars"
      :vertical="verticalScrollbarProps"
      :horizontal="horizontalScrollbarProps"
      :viewport-width="scrollDetails.displayViewportSize.width"
      :viewport-height="scrollDetails.displayViewportSize.height"
      :offset-x="scrollbarOffset.x"
      :offset-y="scrollbarOffset.y"
      :both="direction === 'both'"
    >
      <template v-if="slots.scrollbar" #scrollbar="slotProps">
        <slot name="scrollbar" v-bind="slotProps" />
      </template>
    </component>

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
      :role="wrapperRole"
      :aria-activedescendant="activeDescendant"
      v-bind="wrapperAriaProps"
    >
      <component
        :is="itemTag"
        v-for="renderedItem in renderedItems"
        :id="`${ containerId }-item-${ renderedItem.index }`"
        :key="renderedItem.index"
        :ref="(el: unknown) => setItemRef(el, renderedItem.index)"
        :data-index="renderedItem.index"
        class="virtual-scroll-item"
        :class="{
          'virtual-scroll--sticky': renderedItem.isStickyActive,
          'virtual-scroll--active': renderedItem.index === activeIndex,
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
          :is-active="renderedItem.index === activeIndex"
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
    overflow-anchor: none;

    &:not(.virtual-scroll--window) {
      overflow: auto;
      overscroll-behavior: contain;
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

  .virtual-scroll--active {
    outline: 2px solid currentColor;
    outline-offset: -2px;
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
}
</style>
