import type { ScrollAlignment, ScrollDetails, ScrollToOffsetOptions, VirtualScrollProps } from '../types';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { computed, ref, toValue } from 'vue';

export interface UseVirtualScrollKeyboardOptions<T> {
  props: VirtualScrollProps<T>;
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
  getLoadingSlotSize,
  activationMode = 'viewport',
  onActivate,
}: UseVirtualScrollKeyboardOptions<T>) {
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
    return index < 0 || index >= props.items.length ? '' : `Item ${ index + 1 } of ${ props.items.length }`;
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
    if (index === null || !Number.isFinite(index) || index < 0 || props.items.length === 0) {
      activeIndex.value = -1;
      return;
    }
    activeIndex.value = Math.min(Math.trunc(index), props.items.length - 1);
  };

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
    const count = props.items.length;
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
    const count = props.items.length;
    const direction = props.direction;
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
    if (resolvedActivationMode.value === 'viewport' || !Number.isFinite(index) || index < 0 || index >= props.items.length) {
      return;
    }
    setActiveIndex(index);
    // `onActivate` always receives the effective active index.
    onActivate?.(activeIndex.value);
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

    const { viewportSize, scrollOffset } = scrollDetails.value;
    const isHorizontal = props.direction !== 'vertical';
    const isVertical = props.direction !== 'horizontal';

    const vProps = virtualScrollProps.value;
    const sStart = (vProps.stickyStart || { x: 0, y: 0 }) as { x: number; y: number; };
    const sEnd = (vProps.stickyEnd || { x: 0, y: 0 }) as { x: number; y: number; };
    const pStart = (vProps.scrollPaddingStart || { x: 0, y: 0 }) as { x: number; y: number; };
    const pEnd = (vProps.scrollPaddingEnd || { x: 0, y: 0 }) as { x: number; y: number; };

    const snapModeProp = props.snap === true ? 'auto' : props.snap;
    const snapMode = (snapModeProp && snapModeProp !== 'auto')
      ? snapModeProp as 'start' | 'center' | 'end'
      : null;

    const { currentIndex, currentEndIndex, currentColIndex, currentEndColIndex } = scrollDetails.value;

    const getCenterIndex = (isX: boolean) => {
      const centerPos = (isX ? scrollOffset.x : scrollOffset.y) + (isX ? viewportSize.width : viewportSize.height) / 2;
      return isX ? getColumnIndexAt(centerPos) : getRowIndexAt(centerPos);
    };

    const navigateVerticalForward = () => {
      if (snapMode === 'start') {
        scrollToIndex(Math.min(props.items.length - 1, currentIndex + 1), null, { align: 'start' });
        return;
      }
      const align = snapMode || 'end';
      const viewportBottom = scrollOffset.y + viewportSize.height - (sEnd.y + pEnd.y);
      const itemBottom = getRowOffset(currentEndIndex) + getRowHeight(currentEndIndex);
      if (itemBottom > viewportBottom + 1) {
        scrollToIndex(currentEndIndex, null, { align });
      } else if (currentEndIndex < props.items.length - 1) {
        scrollToIndex(currentEndIndex + 1, null, { align });
      }
    };

    const navigateVerticalBackward = () => {
      if (snapMode === 'end') {
        scrollToIndex(Math.max(0, currentEndIndex - 1), null, { align: 'end' });
        return;
      }
      const align = snapMode || 'start';
      const viewportTop = scrollOffset.y + sStart.y + pStart.y;
      const itemPos = getRowOffset(currentIndex);
      if (itemPos < viewportTop - 1) {
        scrollToIndex(currentIndex, null, { align });
      } else if (currentIndex > 0) {
        scrollToIndex(currentIndex - 1, null, { align });
      }
    };

    const navigateHorizontalForward = () => {
      const maxColIdx = props.columnCount ? props.columnCount - 1 : props.items.length - 1;
      if (snapMode === 'start') {
        scrollToIndex(null, Math.min(maxColIdx, currentColIndex + 1), { align: 'start' });
        return;
      }
      const align = snapMode || 'end';
      const viewportRight = scrollOffset.x + viewportSize.width - (sEnd.x + pEnd.x);
      const colEndPos = props.columnCount
        ? getColumnOffset(currentEndColIndex) + getColumnWidth(currentEndColIndex)
        : getItemOffset(currentEndColIndex) + getItemSize(currentEndColIndex);
      if (colEndPos > viewportRight + 1) {
        scrollToIndex(null, currentEndColIndex, { align });
      } else if (currentEndColIndex < maxColIdx) {
        scrollToIndex(null, currentEndColIndex + 1, { align });
      }
    };

    const navigateHorizontalBackward = () => {
      if (snapMode === 'end') {
        scrollToIndex(null, Math.max(0, currentEndColIndex - 1), { align: 'end' });
        return;
      }
      const align = snapMode || 'start';
      const viewportLeft = scrollOffset.x + sStart.x + pStart.x;
      const colStartPos = props.columnCount
        ? getColumnOffset(currentColIndex)
        : getItemOffset(currentColIndex);
      if (colStartPos < viewportLeft - 1) {
        scrollToIndex(null, currentColIndex, { align });
      } else if (currentColIndex > 0) {
        scrollToIndex(null, currentColIndex - 1, { align });
      }
    };

    const navigateVertical = (isForward: boolean) => {
      if (isForward) {
        navigateVerticalForward();
      } else {
        navigateVerticalBackward();
      }
    };

    const navigateHorizontal = (isForward: boolean) => {
      if (isRtl.value ? !isForward : isForward) {
        navigateHorizontalForward();
      } else {
        navigateHorizontalBackward();
      }
    };

    const navigateCenter = (isVerticalAxis: boolean, isForward: boolean) => {
      const isHorizontalAxis = !isVerticalAxis;
      const centerIdx = getCenterIndex(isHorizontalAxis);
      const maxIdx = isHorizontalAxis
        ? (props.columnCount ? props.columnCount - 1 : props.items.length - 1)
        : props.items.length - 1;
      const targetIdx = isForward ? Math.min(maxIdx, centerIdx + 1) : Math.max(0, centerIdx - 1);
      scrollToIndex(isVerticalAxis ? targetIdx : null, isHorizontalAxis ? targetIdx : null, { align: 'center' });
    };

    const navigate = (isVerticalAxis: boolean, isForward: boolean) => {
      if (snapMode === 'center') {
        navigateCenter(isVerticalAxis, isForward);
        return;
      }

      if (isVerticalAxis) {
        navigateVertical(isForward);
      } else {
        navigateHorizontal(isForward);
      }
    };

    const getPageTarget = (isVerticalAxis: boolean, isForward: boolean) => {
      const isHorizontalAxis = !isVerticalAxis;
      const startIdx = isVerticalAxis ? currentIndex : currentColIndex;
      const endIdx = isVerticalAxis ? currentEndIndex : currentEndColIndex;
      const pageSize = Math.max(1, endIdx - startIdx);
      const maxIdx = isVerticalAxis
        ? props.items.length - 1
        : (props.columnCount ? props.columnCount - 1 : props.items.length - 1);

      if (isForward) {
        if (snapMode === 'center') {
          return Math.min(maxIdx, getCenterIndex(isHorizontalAxis) + pageSize);
        }
        if (snapMode === 'end') {
          return Math.min(maxIdx, endIdx + pageSize);
        }
        // One full page forward: the item after the current last visible one.
        return Math.min(maxIdx, endIdx + 1);
      } else {
        if (snapMode === 'center') {
          return Math.max(0, getCenterIndex(isHorizontalAxis) - pageSize);
        }
        if (snapMode === 'start') {
          return Math.max(0, startIdx - pageSize);
        }
        // One full page back: the item before the current first visible one.
        return Math.max(0, startIdx - 1);
      }
    };

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

        const { totalSize } = scrollDetails.value;
        const distance = Math.max(
          totalSize.width - scrollOffset.x - viewportSize.width,
          totalSize.height - scrollOffset.y - viewportSize.height,
        );
        const viewport = props.direction === 'horizontal' ? viewportSize.width : viewportSize.height;
        const behavior = distance > 10 * viewport ? 'auto' : 'smooth';
        // The loading slot is always rendered (hidden when idle): include its
        // height so the last item plus the slot fit in the viewport. The extra
        // also extends scrollToOffset's clamp, which otherwise caps at the
        // virtual content end and would hide the slot below it.
        const extra = getLoadingSlotSize ? getLoadingSlotSize() : 0;

        if (props.direction === 'both') {
          scrollToOffset(
            totalSize.width - viewportSize.width,
            totalSize.height - viewportSize.height + extra,
            { behavior, ...(extra > 0 ? { endExtraY: extra } : {}) },
          );
        } else if (props.direction === 'horizontal') {
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
        break;
      }
      case 'ArrowUp':
        event.preventDefault();
        stopProgrammaticScroll();
        if (isVertical) {
          navigate(true, false);
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        stopProgrammaticScroll();
        if (isVertical) {
          navigate(true, true);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        stopProgrammaticScroll();
        if (isHorizontal) {
          navigate(false, false);
        }
        break;
      case 'ArrowRight':
        event.preventDefault();
        stopProgrammaticScroll();
        if (isHorizontal) {
          navigate(false, true);
        }
        break;
      case 'PageUp':
        event.preventDefault();
        stopProgrammaticScroll();
        if (props.direction === 'horizontal') {
          scrollToIndex(null, getPageTarget(false, false), { align: snapMode || 'end' });
        } else {
          scrollToIndex(getPageTarget(true, false), null, { align: snapMode || 'end' });
        }
        break;
      case 'PageDown':
        event.preventDefault();
        stopProgrammaticScroll();
        if (props.direction === 'horizontal') {
          scrollToIndex(null, getPageTarget(false, true), { align: snapMode || 'start' });
        } else {
          scrollToIndex(getPageTarget(true, true), null, { align: snapMode || 'start' });
        }
        break;
    }
  };

  return {
    activeIndex,
    liveMessage,
    setActiveIndex,
    handleItemActivate,
    handleKeyDown,
  };
}
