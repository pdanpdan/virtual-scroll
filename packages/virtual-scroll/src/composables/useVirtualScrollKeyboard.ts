import type { ScrollAlignment, ScrollDetails, VirtualScrollProps } from '../types';
import type { Ref } from 'vue';

export interface UseVirtualScrollKeyboardOptions<T> {
  props: VirtualScrollProps<T>;
  virtualScrollProps: Ref<VirtualScrollProps<T>>;
  scrollDetails: Ref<ScrollDetails<T>>;
  isRtl: Ref<boolean>;
  scrollToIndex: (rowIndex?: number | null, colIndex?: number | null, options?: { align?: ScrollAlignment | 'auto'; behavior?: 'auto' | 'smooth'; }) => void;
  scrollToOffset: (x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void;
  stopProgrammaticScroll: () => void;
  getRowHeight: (index: number) => number;
  getColumnWidth: (index: number) => number;
  getRowOffset: (index: number) => number;
  getColumnOffset: (index: number) => number;
  getItemOffset: (index: number) => number;
  getItemSize: (index: number) => number;
  getRowIndexAt: (offset: number) => number;
  getColIndexAt: (offset: number) => number;
  /** Height of the loading slot (when always rendered), so End can include it. */
  getLoadingSlotSize?: () => number;
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
  getColIndexAt,
  getLoadingSlotSize,
}: UseVirtualScrollKeyboardOptions<T>) {
  /**
   * Handles keyboard events for navigation (Home, End, Arrows, PageUp/Down).
   *
   * @param event - The keyboard event.
   */
  const handleKeyDown = (event: KeyboardEvent) => {
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
      return isX ? getColIndexAt(centerPos) : getRowIndexAt(centerPos);
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
        // height so the last item plus the slot fit in the viewport.
        const extra = getLoadingSlotSize ? getLoadingSlotSize() : 0;

        if (props.direction === 'both') {
          scrollToOffset(
            totalSize.width - viewportSize.width,
            totalSize.height - viewportSize.height + extra,
            { behavior },
          );
        } else if (props.direction === 'horizontal') {
          scrollToOffset(totalSize.width - viewportSize.width + extra, null, { behavior });
        } else {
          scrollToOffset(null, totalSize.height - viewportSize.height + extra, { behavior });
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
    handleKeyDown,
  };
}
