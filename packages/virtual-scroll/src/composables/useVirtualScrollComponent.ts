import type { LoadDetails } from '../extensions/all';
import type {
  RenderedItem,
  ScrollbarSlotProps,
  ScrollDetails,
  VirtualScrollComponentProps,
  VirtualScrollProps,
} from '../types';
import type { MaybeRefOrGetter } from 'vue';

import { computed, nextTick, ref, toValue, useId, watch } from 'vue';

import {
  useCoordinateScalingExtension,
  useInfiniteLoadingExtension,
  usePrependRestorationExtension,
  useRtlExtension,
  useSnappingExtension,
  useStickyExtension,
} from '../extensions/all';
import { getPaddingX, getPaddingY, isWindowLike } from '../utils/scroll';
import { calculateItemStyle, scrollbarOffsetToVirtual } from '../utils/virtual-scroll-logic';
import { useLiveRegion } from './useLiveRegion';
import { useVirtualScroll } from './useVirtualScroll';
import { buildScrollbarSlotProps, useVirtualScrollbar } from './useVirtualScrollbar';
import { useVirtualScrollInertia } from './useVirtualScrollInertia';
import { useVirtualScrollKeyboard } from './useVirtualScrollKeyboard';
import { useVirtualScrollObservers } from './useVirtualScrollObservers';

/**
 * Component-level wiring shared by {@link VirtualScroll} and {@link VirtualScrollTable}.
 *
 * Both components render the same engine, the same optional features and the
 * same accessibility helpers, and differ only in their markup, their semantic
 * roles and the table's flow mode. Everything they have in common lives here:
 * the DOM refs, the engine call and its extension list, pointer/keyboard/
 * inertia wiring, the scrollbar overlay and the shared ARIA helpers.
 *
 * The optional wiring (keyboard navigation, custom scrollbars, snapping, sticky
 * items, infinite loading and prepend restoration) is guarded by
 * `__VS_CORE_BUILD__`, the flag `vite.config.core.ts` replaces, so the lean
 * `./core` entry prunes it out of every component that uses this composable.
 */

/** The props the shared wiring reads: the component props minus the tag props the table fixes itself. */
export type VirtualScrollComponentSharedProps<T = unknown> = Omit<VirtualScrollComponentProps<T>, 'containerTag' | 'footerTag' | 'headerTag' | 'itemTag' | 'wrapperTag'>;

export interface UseVirtualScrollComponentOptions<T> {
  /** Reactive props of the component. Defaults are already resolved by `withDefaults`. */
  props: VirtualScrollComponentSharedProps<T>;
  /** Tag the item styles are built for; a table sizes its cells differently from a list item. */
  containerTag: string;
  /** Role of an item, so the shared ARIA helper can tell roving items from set members. */
  itemRole?: MaybeRefOrGetter<string | null | undefined>;
  /**
   * How the keyboard interacts with the content.
   * - `'viewport'` (default): scrolls the viewport only.
   * - `'item'`: moves a roving active item.
   */
  activationMode?: MaybeRefOrGetter<'item' | 'viewport'>;
  /** Emitted whenever the scroll details change. */
  onScroll: (details: ScrollDetails<T>) => void;
  /** Emitted when the visible range changes. */
  onVisibleRangeChange: (range: { start: number; end: number; colStart: number; colEnd: number; }) => void;
  /** Emitted when an infinite-loading threshold is crossed. */
  onLoad: (direction: 'vertical' | 'horizontal', details: LoadDetails) => void;
  /** Emitted when an item is activated from the keyboard. */
  onItemActivate: (index: number, item: T | undefined) => void;
}

/**
 * Wires the engine and every shared feature for a scroll component.
 *
 * Call once per component with the component's own props; the returned surface
 * drives the template, the local markup-specific computeds and `defineExpose`.
 */
export function useVirtualScrollComponent<T>(options: UseVirtualScrollComponentOptions<T>) {
  const props = options.props;
  const activationMode = computed<'item' | 'viewport'>(() => toValue(options.activationMode) ?? 'viewport');
  const itemRole = computed(() => toValue(options.itemRole) ?? null);

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
          onLoad: (dir, details) => options.onLoad(dir, details),
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
      containerTag: options.containerTag,
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

  /* The real implementation is installed by the full build below, so the whole
     mapping is compiled out of the lean entry. */
  /* v8 ignore start -- the no-op body only runs in the lean build */
  let handleScrollbarScrollToOffset: (axis: 'vertical' | 'horizontal', offset: number) => void = () => {};
  /* v8 ignore stop */

  /* v8 ignore next -- the `if` is always taken outside the lean build */
  if (!IS_CORE_BUILD) {
    /** Maps a scrollbar thumb offset (DU) onto the virtual offset (VU) to scroll to. */
    handleScrollbarScrollToOffset = (axis: 'vertical' | 'horizontal', offset: number) => {
      const { displayViewportSize } = scrollDetails.value;
      const isVertical = axis === 'vertical';
      const virtualOffset = scrollbarOffsetToVirtual(
        offset,
        isVertical ? renderedHeight.value : renderedWidth.value,
        isVertical ? displayViewportSize.height : displayViewportSize.width,
        isVertical ? componentOffset.y : componentOffset.x,
        isVertical ? scaleY.value : scaleX.value,
      );
      if (virtualOffset === null) {
        scrollToOffset(isVertical ? null : Number.POSITIVE_INFINITY, isVertical ? Number.POSITIVE_INFINITY : null);
        return;
      }
      scrollToOffset(isVertical ? null : virtualOffset, isVertical ? virtualOffset : null);
    };

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
    options.onScroll(details);

    if (
      !oldDetails
      || !oldDetails.range
      || !oldDetails.columnRange
      || details.range.start !== oldDetails.range.start
      || details.range.end !== oldDetails.range.end
      || details.columnRange.start !== oldDetails.columnRange.start
      || details.columnRange.end !== oldDetails.columnRange.end
    ) {
      options.onVisibleRangeChange({
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
      options.onVisibleRangeChange({
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
    // The components default this to 'vertical'; an omitted value means the same here.
    direction: props.direction ?? 'vertical',
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
      activationMode,
      onActivate: (index: number) => options.onItemActivate(index, props.items[ index ]),
    }));
  }

  /**
   * `aria-activedescendant` target while an item is active.
   *
   * Keyboard navigation drives the active item, so the lean build has no target
   * to point at and skips the live region entirely.
   */
  /* v8 ignore start -- only the full build's branch runs in these suites */
  const activeDescendant = IS_CORE_BUILD
    ? undefined
    : computed(() => (activeIndex.value >= 0 ? `${ containerId.value }-item-${ activeIndex.value }` : undefined));

  if (!IS_CORE_BUILD) {
    useLiveRegion(hostRef, liveMessage);
  }
  /* v8 ignore stop */

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

    verticalScrollbarProps = computed(() => {
      if (props.direction === 'horizontal') {
        return null;
      }
      const { displayViewportSize, displayScrollOffset } = scrollDetails.value;
      return buildScrollbarSlotProps({
        axis: 'vertical',
        totalSize: renderedHeight.value,
        position: displayScrollOffset.y,
        viewportSize: displayViewportSize.height,
        scrollToOffset: (offset: number) => handleScrollbarScrollToOffset('vertical', offset),
        containerId: containerId.value,
        isRtl: isRtl.value,
        scrollbar: verticalScrollbar,
      });
    });

    horizontalScrollbarProps = computed(() => {
      if (props.direction === 'vertical') {
        return null;
      }
      const { displayViewportSize, displayScrollOffset } = scrollDetails.value;
      return buildScrollbarSlotProps({
        axis: 'horizontal',
        totalSize: renderedWidth.value,
        position: displayScrollOffset.x,
        viewportSize: displayViewportSize.width,
        scrollToOffset: (offset: number) => handleScrollbarScrollToOffset('horizontal', offset),
        containerId: containerId.value,
        isRtl: isRtl.value,
        scrollbar: horizontalScrollbar,
      });
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
   * @param omitTransform - Leaves the position out, for items the browser lays out
   * itself (table rows in flow mode).
   * @returns CSS style object.
   */
  function getItemStyle(item: RenderedItem<T>, omitTransform = false) {
    // Sticky items stick below the sticky header/footer: the inset is the user
    // scroll padding plus the measured sticky start/end (e.g. the header slot).
    const scrollPadding = virtualScrollProps.value.scrollPaddingStart as { x: number; y: number; };
    const sticky = virtualScrollProps.value.stickyStart as { x: number; y: number; };

    const style = calculateItemStyle({
      containerTag: options.containerTag,
      direction: props.direction ?? 'vertical',
      isHydrated: isHydrated.value,
      item,
      itemSize: props.itemSize,
      omitTransform,
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

  const containerRole = computed(() => (props.ariaLabel || props.ariaLabelledby) ? 'region' : undefined);

  const shouldBindItemAria = computed(() => {
    const role = itemRole.value;
    return role == null || (role !== 'none' && role !== 'presentation');
  });

  const rootAriaProps = computed(() => ({
    'aria-label': props.ariaLabel,
    'aria-labelledby': props.ariaLabelledby,
    'aria-busy': props.loading ? 'true' : undefined,
  }));

  return {
    // --- DOM and identity ---
    /** Scroll container element. */
    hostRef,
    /** Items wrapper element. */
    wrapperRef,
    /** Header slot wrapper element. */
    headerRef,
    /** Footer slot wrapper element. */
    footerRef,
    /** Loading slot element. */
    loadingRef,
    /** Id of the scroll container, used for `aria-controls` targets. */
    containerId,
    /** Ref callback that registers an item element for measurement. */
    setItemRef,

    // --- Engine state ---
    /** Whether the engine finished its first client-side mount. */
    isHydrated,
    /** Whether the scroll container is in RTL mode. */
    isRtl,
    /** Whether the scroll container is the window (or a window-like element). */
    isWindowContainer,
    /** Whether coordinate scaling is active on either axis. */
    useVirtualScrolling,
    /** X coordinate scaling factor. */
    scaleX,
    /** Y coordinate scaling factor. */
    scaleY,
    /** Offset of the component inside its scroll container. */
    componentOffset,
    /** Offset applied by the virtual scrollbars. */
    scrollbarOffset,
    /** Current scroll details. */
    scrollDetails,
    /** Items to render, in order. */
    renderedItems,
    /** Visible column range. */
    columnRange,
    /** Content width in the DOM (DU). */
    renderedWidth,
    /** Content height in the DOM (DU). */
    renderedHeight,
    /** Content width in virtual units (VU). */
    renderedVirtualWidth,
    /** Content height in virtual units (VU). */
    renderedVirtualHeight,

    /** Visible column range, without the padding the slot must not see. */
    slotColumnRange,
    /** Whether the header/footer slots live inside the scroll container. */
    isHeaderFooterInsideContainer,
    /** Measured height of the header slot (DU). */
    measuredPaddingStart,
    /** Measured height of the footer slot (DU). */
    measuredPaddingEnd,

    // --- Styles ---
    /** Wrapper style (content box). */
    wrapperStyle,
    /** Loading slot style. */
    loadingStyle,
    /** Style of an item, including its position. */
    getItemStyle,

    // --- Pointer and keyboard ---
    /** Drag-to-scroll pointer handlers. */
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    /** Keydown handler, `undefined` in the lean build. */
    handleKeyDown,
    /** Index of the item tracked by keyboard navigation. */
    activeIndex,
    /** Sets the active item index without scrolling. */
    setActiveIndex,
    /** Marks an item active and emits `itemActivate`. */
    handleItemActivate,
    /** `aria-activedescendant` target, `undefined` when no item is active. */
    activeDescendant,

    // --- Scrollbars ---
    /** Whether the custom scrollbars replace the native one. */
    showVirtualScrollbars,
    /** Slot props of the vertical scrollbar. */
    verticalScrollbarProps,
    /** Slot props of the horizontal scrollbar. */
    horizontalScrollbarProps,
    /** Maps a scrollbar thumb offset (DU) onto the virtual offset (VU) to scroll to. */
    handleScrollbarScrollToOffset,

    // --- ARIA ---
    /** Role of the scroll container, when it is labelled. */
    containerRole,
    /** Label and busy state of the scroll container. */
    rootAriaProps,
    /** Whether an item should carry its own ARIA attributes. */
    shouldBindItemAria,
    /** Whether debug overlays are shown. */
    isDebug,

    // --- Engine methods ---
    /** Scrolls to a row and/or column. */
    scrollToIndex,
    /** Scrolls to a pixel offset. */
    scrollToOffset,
    /** Re-reads the component's offset inside its scroll container. */
    updateHostOffset,
    /** Updates the measured size of one item. */
    updateItemSize,
    /** Updates the measured sizes of several items. */
    updateItemSizes,
    /** Re-detects the writing direction of the container. */
    updateDirection,
    /** Virtual offset of an item. */
    getItemOffset,
    /** Size of an item along the scroll axis. */
    getItemSize,
    /** Virtual offset of a row. */
    getRowOffset,
    /** Virtual offset of a column. */
    getColumnOffset,
    /** Height of a row. */
    getRowHeight,
    /** Width of a column. */
    getColumnWidth,
    /** Row (or item) index at a vertical offset. */
    getRowIndexAt,
    /** Column index at a horizontal offset. */
    getColumnIndexAt,
    /** Resets the measurements and re-reads the props. */
    refresh,
    /** Stops a smooth scroll animation and clears pending corrections. */
    stopProgrammaticScroll,
    /** Stops inertia scrolling. */
    stopInertia,
    /** Follows a measurement correction during a drag. */
    shiftOrigin,
    /** Latest measurement correction. */
    scrollCorrection,
  };
}
