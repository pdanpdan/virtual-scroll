import type { Point, ScrollAlignment, ScrollDetails, ScrollToOffsetOptions, VirtualScrollProps } from '../types';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { computed, ref, toValue } from 'vue';

/** Shared zero point: a missing sticky or padding value must not allocate on every key press. */
const ZERO_POINT: Point = { x: 0, y: 0 };

/** Jumps longer than this many viewports are applied without smooth scrolling. */
const INSTANT_JUMP_VIEWPORTS = 10;

/** Keys the viewport navigation handles; 'item' activation mode consumes its own first. */
const NAVIGATION_KEYS = new Set([ 'Home', 'End', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown' ]);

export interface UseVirtualScrollKeyboardOptions<T> {
  /**
   * Props of the list being navigated: a plain object, a ref or a getter. A ref
   * or getter keeps bounds (`items.length`), the axis and the column count live
   * when the surrounding configuration is itself derived - for example a
   * `computed` config built by a composable consumer.
   */
  props: MaybeRefOrGetter<VirtualScrollProps<T>>;
  virtualScrollProps: Ref<VirtualScrollProps<T>>;
  scrollDetails: Ref<ScrollDetails<T>>;
  isRtl: Ref<boolean>;
  scrollToIndex: (rowIndex?: number | null, colIndex?: number | null, options?: { align?: ScrollAlignment | 'auto'; behavior?: 'auto' | 'smooth'; }) => void;
  scrollToOffset: (x?: number | null, y?: number | null, options?: ScrollToOffsetOptions) => void;
  stopProgrammaticScroll: () => void;
  getRowHeight: (index: number) => number;
  getColumnWidth: (index: number) => number;
  getRowOffset: (index: number) => number;
  getColumnOffset: (index: number) => number;
  getItemOffset: (index: number) => number;
  getItemSize: (index: number) => number;
  getRowIndexAt: (offset: number) => number;
  getColumnIndexAt: (offset: number) => number;
  /** Height of the loading slot (when always rendered), so End can include it. */
  getLoadingSlotSize?: () => number;
  /**
   * How the keyboard interacts with the content.
   * - `'viewport'` (default): scrolls the viewport only, without tracking an
   *   active item.
   * - `'item'`: moves a roving active item (`activeIndex`), keeping it in view.
   *
   * A ref or getter is re-read on every key press, so a host can pick the mode
   * per ARIA role and react to a role change.
   * @default 'viewport'
   */
  activationMode?: MaybeRefOrGetter<'item' | 'viewport'>;
  /**
   * Called with the item index when the active item is activated: `Enter`/`Space`
   * on the container, or an explicit `handleItemActivate` call (e.g. a click in
   * the item slot). Never called in `'viewport'` activation mode.
   */
  onActivate?: (index: number) => void;
}

export function useVirtualScrollKeyboard<T>({
  props: propsInput,
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
  getLoadingSlotSize,
  activationMode = 'viewport',
  onActivate,
}: UseVirtualScrollKeyboardOptions<T>) {
  /** Props of the list, re-read on every access so a ref or getter stays live. */
  const props = computed(() => toValue(propsInput));

  /** Resolved activation mode, re-read whenever the source value changes. */
  const resolvedActivationMode = computed(() => toValue(activationMode));

  /**
   * Index of the roving active item, `-1` when no item is active.
   * @default -1
   */
  const activeIndex = ref(-1);

  /**
   * Polite announcement for the active item, e.g. `Item 21 of 100`; empty when
   * no item is active (or the list is shorter than the active index).
   */
  const liveMessage = computed(() => {
    const index = activeIndex.value;
    return index < 0 || index >= props.value.items.length ? '' : `Item ${ index + 1 } of ${ props.value.items.length }`;
  });

  /**
   * Sets the roving active item without scrolling it into view, so a component
   * can sync it from a click or an external selection.
   *
   * Indices are `items` indices: in grid mode the active item is the row that
   * renders item `index`. `null`, a negative or a non-finite index clears the
   * selection (`-1`); an index past the end clamps to the last item.
   *
   * @param index - The item index to activate, or `null` to clear the selection.
   */
  const setActiveIndex = (index: number | null) => {
    if (index === null || !Number.isFinite(index) || index < 0 || props.value.items.length === 0) {
      activeIndex.value = -1;
      return;
    }
    activeIndex.value = Math.min(Math.trunc(index), props.value.items.length - 1);
  };

  /**
   * Explicit snap alignment in effect, or `null` when snap is off, `true` or `'auto'`.
   *
   * `'next'` is a stepping mode, not an alignment: it is passed through as it is, the
   * way the previous inline narrowing did, and the engine decides what it means.
   */
  const getSnapAlignment = () => {
    const snap = props.value.snap;
    return snap && snap !== 'auto' && snap !== true ? snap as ScrollAlignment : null;
  };

  /** Index of the item at the middle of the viewport on one axis. */
  const getCenterIndex = (isVerticalAxis: boolean) => (isVerticalAxis
    ? getRowIndexAt(scrollDetails.value.scrollOffset.y + scrollDetails.value.viewportSize.height / 2)
    : getColumnIndexAt(scrollDetails.value.scrollOffset.x + scrollDetails.value.viewportSize.width / 2));

  /**
   * Scrolls to an index on one axis, leaving the other axis where it is.
   *
   * @param index - The index to reveal.
   * @param isVerticalAxis - `true` for the block axis, `false` for the inline axis.
   * @param options - Scroll alignment and behavior.
   * @param options.align - Alignment the index is scrolled to.
   * @param options.behavior - `'smooth'` to animate the move, `'auto'` to jump.
   */
  const scrollToAxisIndex = (
    index: number,
    isVerticalAxis: boolean,
    options: { align?: ScrollAlignment | 'auto'; behavior?: 'auto' | 'smooth'; },
  ) => (isVerticalAxis ? scrollToIndex(index, null, options) : scrollToIndex(null, index, options));

  /**
   * Scrolls an item into view with the smallest movement that reveals it,
   * leaving the position on the other axis untouched (so a multi-column list
   * keeps its current column).
   *
   * @param index - The item index to reveal.
   * @param isVerticalAxis - `true` for the block axis, `false` for the inline axis.
   */
  const scrollItemIntoView = (index: number, isVerticalAxis: boolean) => {
    scrollToIndex(isVerticalAxis ? index : null, isVerticalAxis ? null : index, { align: 'auto' });
  };

  /**
   * Moves the active item by `step` items along one axis and keeps it visible.
   *
   * With no active item yet, the first press activates the first currently
   * visible item and does not scroll.
   *
   * @param step - Signed number of items to move (`1` or `-1`).
   * @param isVerticalAxis - `true` for the block axis, `false` for the inline axis.
   */
  const moveActiveItem = (step: number, isVerticalAxis: boolean) => {
    const count = props.value.items.length;
    if (count === 0) {
      return;
    }
    if (activeIndex.value < 0) {
      setActiveIndex(isVerticalAxis ? scrollDetails.value.currentIndex : scrollDetails.value.currentColIndex);
      return;
    }
    const target = Math.max(0, Math.min(count - 1, activeIndex.value + step));
    setActiveIndex(target);
    scrollItemIntoView(target, isVerticalAxis);
  };

  /**
   * Handles a key press in `'item'` activation mode: the roving active item
   * moves (and is kept visible) instead of the viewport.
   *
   * @param event - The keyboard event.
   * @returns `true` when the key was consumed. `false` lets the viewport handler
   *   process it: unrelated keys, and `ArrowLeft`/`ArrowRight` in grid mode,
   *   where the active item is a row and the arrows pan the columns.
   */
  const handleItemKeyDown = (event: KeyboardEvent): boolean => {
    const count = props.value.items.length;
    const direction = props.value.direction;
    const isVerticalAxis = direction !== 'horizontal';

    switch (event.key) {
      case 'Enter':
      case ' ': {
        if (activeIndex.value < 0) {
          return false;
        }
        event.preventDefault();
        onActivate?.(activeIndex.value);
        return true;
      }
      case 'ArrowDown':
      case 'ArrowUp': {
        if (direction === 'horizontal') {
          return false;
        }
        event.preventDefault();
        stopProgrammaticScroll();
        moveActiveItem(event.key === 'ArrowDown' ? 1 : -1, true);
        return true;
      }
      case 'ArrowRight':
      case 'ArrowLeft': {
        if (direction !== 'horizontal') {
          return false;
        }
        event.preventDefault();
        stopProgrammaticScroll();
        const isForward = event.key === 'ArrowRight';
        moveActiveItem((isRtl.value ? !isForward : isForward) ? 1 : -1, false);
        return true;
      }
      case 'Home':
      case 'End': {
        event.preventDefault();
        stopProgrammaticScroll();
        if (count > 0) {
          const target = event.key === 'Home' ? 0 : count - 1;
          setActiveIndex(target);
          scrollItemIntoView(target, isVerticalAxis);
        }
        return true;
      }
      case 'PageUp':
      case 'PageDown': {
        event.preventDefault();
        stopProgrammaticScroll();
        if (count > 0) {
          const { currentIndex, currentEndIndex, currentColIndex, currentEndColIndex } = scrollDetails.value;
          const start = isVerticalAxis ? currentIndex : currentColIndex;
          const end = isVerticalAxis ? currentEndIndex : currentEndColIndex;
          const pageSize = Math.max(1, end - start + 1);
          const base = activeIndex.value < 0 ? start : activeIndex.value;
          const target = Math.max(0, Math.min(count - 1, base + (event.key === 'PageDown' ? pageSize : -pageSize)));
          setActiveIndex(target);
          scrollItemIntoView(target, isVerticalAxis);
        }
        return true;
      }
      default:
        return false;
    }
  };

  /**
   * Activates an item explicitly (e.g. from a click handler in the item slot):
   * marks it as the active item and calls `onActivate`. The item is not scrolled
   * into view, since a pointer activation is already on screen.
   *
   * No-op in `'viewport'` activation mode, where no item is ever activated.
   *
   * @param index - The item index to activate.
   */
  const handleItemActivate = (index: number) => {
    if (resolvedActivationMode.value === 'viewport' || !Number.isFinite(index) || index < 0 || index >= props.value.items.length) {
      return;
    }
    setActiveIndex(index);
    // `onActivate` always receives the effective active index.
    onActivate?.(activeIndex.value);
  };

  /**
   * Moves the viewport by one item on one axis: forward reveals the item after the
   * current last visible one, backward the one before the first visible one.
   *
   * With `snap: 'center'` the item at the middle of the viewport moves instead, and
   * an explicit alignment towards the direction of travel moves a single item to the
   * viewport edge without measuring the reveal.
   *
   * @param isVerticalAxis - `true` for the block axis, `false` for the inline axis.
   * @param isForward - `true` when the key points at the end of the line
   *   (`ArrowDown`, `ArrowRight`, `PageDown`), `false` at the start.
   */
  const navigateAxis = (isVerticalAxis: boolean, isForward: boolean) => {
    const { scrollOffset, viewportSize, currentIndex, currentEndIndex, currentColIndex, currentEndColIndex } = scrollDetails.value;
    const { items, columnCount = 0 } = props.value;
    const isColumnAxis = !isVerticalAxis && columnCount > 0;
    const snapAlignment = getSnapAlignment();
    const maxIndex = (isColumnAxis ? columnCount : items.length) - 1;
    const visibleStartIndex = isVerticalAxis ? currentIndex : currentColIndex;
    const visibleEndIndex = isVerticalAxis ? currentEndIndex : currentEndColIndex;

    if (snapAlignment === 'center') {
      const centerIndex = getCenterIndex(isVerticalAxis);
      const target = isForward ? Math.min(maxIndex, centerIndex + 1) : Math.max(0, centerIndex - 1);
      scrollToAxisIndex(target, isVerticalAxis, { align: 'center' });
      return;
    }

    // The inline axis follows reading order: in RTL a press towards the end of the
    // line moves the viewport towards the start of the data.
    const isForwardMove = isVerticalAxis || !isRtl.value ? isForward : !isForward;
    const align = snapAlignment ?? (isForwardMove ? 'end' : 'start');
    if (snapAlignment === (isForwardMove ? 'start' : 'end')) {
      const target = isForwardMove ? Math.min(maxIndex, visibleStartIndex + 1) : Math.max(0, visibleEndIndex - 1);
      scrollToAxisIndex(target, isVerticalAxis, { align });
      return;
    }

    const vProps = virtualScrollProps.value;
    const stickyStart = (vProps.stickyStart || ZERO_POINT) as Point;
    const stickyEnd = (vProps.stickyEnd || ZERO_POINT) as Point;
    const padStart = (vProps.scrollPaddingStart || ZERO_POINT) as Point;
    const padEnd = (vProps.scrollPaddingEnd || ZERO_POINT) as Point;

    if (isForwardMove) {
      const itemEnd = isVerticalAxis
        ? getRowOffset(visibleEndIndex) + getRowHeight(visibleEndIndex)
        : isColumnAxis
          ? getColumnOffset(visibleEndIndex) + getColumnWidth(visibleEndIndex)
          : getItemOffset(visibleEndIndex) + getItemSize(visibleEndIndex);
      const viewportEnd = isVerticalAxis
        ? scrollOffset.y + viewportSize.height - stickyEnd.y - padEnd.y
        : scrollOffset.x + viewportSize.width - stickyEnd.x - padEnd.x;
      if (itemEnd > viewportEnd + 1) {
        scrollToAxisIndex(visibleEndIndex, isVerticalAxis, { align });
      } else if (visibleEndIndex < maxIndex) {
        scrollToAxisIndex(visibleEndIndex + 1, isVerticalAxis, { align });
      }
      return;
    }

    const itemStart = isVerticalAxis
      ? getRowOffset(visibleStartIndex)
      : isColumnAxis ? getColumnOffset(visibleStartIndex) : getItemOffset(visibleStartIndex);
    const viewportStart = isVerticalAxis
      ? scrollOffset.y + stickyStart.y + padStart.y
      : scrollOffset.x + stickyStart.x + padStart.x;
    if (itemStart < viewportStart - 1) {
      scrollToAxisIndex(visibleStartIndex, isVerticalAxis, { align });
    } else if (visibleStartIndex > 0) {
      scrollToAxisIndex(visibleStartIndex - 1, isVerticalAxis, { align });
    }
  };

  /**
   * Index a page key moves to: a full page, keeping one item as the overlap, with
   * the alignment the snap mode asks for.
   *
   * @param isVerticalAxis - `true` for the block axis, `false` for the inline axis.
   * @param isForward - `true` for `PageDown`, `false` for `PageUp`.
   */
  const getPageTargetIndex = (isVerticalAxis: boolean, isForward: boolean) => {
    const { currentIndex, currentEndIndex, currentColIndex, currentEndColIndex } = scrollDetails.value;
    const { items, columnCount = 0 } = props.value;
    const snapAlignment = getSnapAlignment();
    const startIndex = isVerticalAxis ? currentIndex : currentColIndex;
    const endIndex = isVerticalAxis ? currentEndIndex : currentEndColIndex;
    const pageSize = Math.max(1, endIndex - startIndex);
    const isColumnAxis = !isVerticalAxis && columnCount > 0;
    const maxIndex = (isColumnAxis ? columnCount : items.length) - 1;

    if (isForward) {
      if (snapAlignment === 'center') {
        return Math.min(maxIndex, getCenterIndex(isVerticalAxis) + pageSize);
      }
      return snapAlignment === 'end'
        ? Math.min(maxIndex, endIndex + pageSize)
        // One full page forward: the item after the current last visible one.
        : Math.min(maxIndex, endIndex + 1);
    }

    if (snapAlignment === 'center') {
      return Math.max(0, getCenterIndex(isVerticalAxis) - pageSize);
    }
    return snapAlignment === 'start'
      ? Math.max(0, startIndex - pageSize)
      // One full page back: the item before the current first visible one.
      : Math.max(0, startIndex - 1);
  };

  /**
   * Handles keyboard events for navigation (Home, End, Arrows, PageUp/Down).
   *
   * @param event - The keyboard event.
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    if (resolvedActivationMode.value === 'item' && handleItemKeyDown(event)) {
      return;
    }
    if (!NAVIGATION_KEYS.has(event.key)) {
      return;
    }

    event.preventDefault();
    stopProgrammaticScroll();

    const { direction } = props.value;
    const { totalSize, viewportSize, scrollOffset } = scrollDetails.value;
    const { key } = event;

    if (key === 'Home') {
      const viewport = direction === 'horizontal' ? viewportSize.width : viewportSize.height;
      const distance = Math.max(scrollOffset.x, scrollOffset.y);
      scrollToIndex(0, 0, { align: 'start', behavior: distance > INSTANT_JUMP_VIEWPORTS * viewport ? 'auto' : 'smooth' });
      return;
    }

    if (key === 'End') {
      const viewport = direction === 'horizontal' ? viewportSize.width : viewportSize.height;
      const distance = Math.max(
        totalSize.width - scrollOffset.x - viewportSize.width,
        totalSize.height - scrollOffset.y - viewportSize.height,
      );
      const behavior = distance > INSTANT_JUMP_VIEWPORTS * viewport ? 'auto' : 'smooth';
      // The loading slot is always rendered (hidden when idle): include its height
      // so the last item plus the slot fit in the viewport. The extra also extends
      // scrollToOffset's clamp, which otherwise caps at the virtual content end and
      // would hide the slot below it.
      const extra = getLoadingSlotSize ? getLoadingSlotSize() : 0;

      if (direction === 'both') {
        scrollToOffset(
          totalSize.width - viewportSize.width,
          totalSize.height - viewportSize.height + extra,
          { behavior, ...(extra > 0 ? { endExtraY: extra } : {}) },
        );
      } else if (direction === 'horizontal') {
        scrollToOffset(
          totalSize.width - viewportSize.width + extra,
          null,
          { behavior, ...(extra > 0 ? { endExtraX: extra } : {}) },
        );
      } else {
        scrollToOffset(
          null,
          totalSize.height - viewportSize.height + extra,
          { behavior, ...(extra > 0 ? { endExtraY: extra } : {}) },
        );
      }
      return;
    }

    const isPageKey = key === 'PageUp' || key === 'PageDown';
    const isVerticalAxis = isPageKey ? direction !== 'horizontal' : key === 'ArrowUp' || key === 'ArrowDown';
    // Arrows only navigate the axis the list actually scrolls on.
    if (!isPageKey && (isVerticalAxis ? direction === 'horizontal' : direction === 'vertical')) {
      return;
    }
    const isForward = key === 'ArrowDown' || key === 'ArrowRight' || key === 'PageDown';

    if (isPageKey) {
      scrollToAxisIndex(
        getPageTargetIndex(isVerticalAxis, isForward),
        isVerticalAxis,
        { align: getSnapAlignment() ?? (isForward ? 'start' : 'end') },
      );
      return;
    }

    navigateAxis(isVerticalAxis, isForward);
  };

  return {
    activeIndex,
    liveMessage,
    setActiveIndex,
    handleItemActivate,
    handleKeyDown,
  };
}
