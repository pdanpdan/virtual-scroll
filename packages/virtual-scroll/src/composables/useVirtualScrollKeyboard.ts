import type { ScrollAlignment, ScrollDetails, VirtualScrollProps } from '../types';
import type { Ref } from 'vue';

export interface UseVirtualScrollKeyboardOptions<T> {
  props: VirtualScrollProps<T>;
  virtualScrollProps: Ref<VirtualScrollProps<T>>;
  scrollDetails: Ref<ScrollDetails<T>>;
  isRtl: Ref<boolean>;
  scrollToIndex: (rowIndex?: number | null, colIndex?: number | null, options?: { align?: ScrollAlignment | 'auto'; behavior?: 'auto' | 'smooth'; }) => void;
  stopProgrammaticScroll: () => void;
  getRowHeight: (index: number) => number;
  getColumnWidth: (index: number) => number;
  getRowOffset: (index: number) => number;
  getColumnOffset: (index: number) => number;
  getItemOffset: (index: number) => number;
  getItemSize: (index: number) => number;
  getRowIndexAt: (offset: number) => number;
  getColIndexAt: (offset: number) => number;
}

export function useVirtualScrollKeyboard<T>({
  props,
  virtualScrollProps,
  scrollDetails,
  isRtl,
  scrollToIndex,
  stopProgrammaticScroll,
  getRowHeight,
  getColumnWidth,
  getRowOffset,
  getColumnOffset,
  getItemOffset,
  getItemSize,
  getRowIndexAt,
  getColIndexAt,
}: UseVirtualScrollKeyboardOptions<T>) {
  /**
   * Handles keyboard events for navigation (Home, End, Arrows, PageUp/Down).
   *
   * @param event - The keyboard event.
   */
  function handleKeyDown(event: KeyboardEvent) {
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

    /**
     * Helper to find center index.
     */
    const getCenterIndex = (isX: boolean) => {
      const centerPos = (isX ? scrollOffset.x : scrollOffset.y) + (isX ? viewportSize.width : viewportSize.height) / 2;
      // In this composable we can't easily recalculate getRowIndexAt by offset, so we find it by iterating if needed,
      // but actually we don't have getRowIndexAt passed.
      // Wait, we need getColIndexAt and getRowIndexAt!
      // I'll add them to options.
      return isX ? getColIndexAt(centerPos) : getRowIndexAt(centerPos);
    };

    /**
     * Helper to calculate the target index for PageUp/PageDown.
     */
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
        return endIdx; // default or snapMode === 'start'
      } else {
        // backward
        if (snapMode === 'center') {
          return Math.max(0, getCenterIndex(isHorizontalAxis) - pageSize);
        }
        if (snapMode === 'start') {
          return Math.max(0, startIdx - pageSize);
        }
        return startIdx; // default or snapMode === 'end'
      }
    };

    /**
     * Performs keyboard navigation for arrow keys.
     */
    const navigate = (isVerticalAxis: boolean, isForward: boolean) => {
      const isHorizontalAxis = !isVerticalAxis;

      if (snapMode === 'center') {
        const centerIdx = getCenterIndex(isHorizontalAxis);
        const maxIdx = isHorizontalAxis
          ? (props.columnCount ? props.columnCount - 1 : props.items.length - 1)
          : props.items.length - 1;
        const targetIdx = isForward ? Math.min(maxIdx, centerIdx + 1) : Math.max(0, centerIdx - 1);
        scrollToIndex(isVerticalAxis ? targetIdx : null, isHorizontalAxis ? targetIdx : null, { align: 'center' });
        return;
      }

      if (isVerticalAxis) {
        if (isForward) {
          if (snapMode === 'start') {
            scrollToIndex(Math.min(props.items.length - 1, currentIndex + 1), null, { align: 'start' });
          } else {
            const align = snapMode || 'end';
            const viewportBottom = scrollOffset.y + viewportSize.height - (sEnd.y + pEnd.y);
            const itemBottom = getRowOffset(currentEndIndex) + getRowHeight(currentEndIndex);

            if (itemBottom > viewportBottom + 1) {
              scrollToIndex(currentEndIndex, null, { align });
            } else if (currentEndIndex < props.items.length - 1) {
              scrollToIndex(currentEndIndex + 1, null, { align });
            }
          }
        } else {
          // backward
          if (snapMode === 'end') {
            scrollToIndex(Math.max(0, currentEndIndex - 1), null, { align: 'end' });
          } else {
            const align = snapMode || 'start';
            const viewportTop = scrollOffset.y + sStart.y + pStart.y;
            const itemPos = getRowOffset(currentIndex);

            if (itemPos < viewportTop - 1) {
              scrollToIndex(currentIndex, null, { align });
            } else if (currentIndex > 0) {
              scrollToIndex(currentIndex - 1, null, { align });
            }
          }
        }
      } else {
        // Horizontal axis
        const maxColIdx = props.columnCount ? props.columnCount - 1 : props.items.length - 1;
        const isLogicalForward = isRtl.value ? !isForward : isForward;

        if (isLogicalForward) {
          if (snapMode === 'start') {
            scrollToIndex(null, Math.min(maxColIdx, currentColIndex + 1), { align: 'start' });
          } else {
            const align = snapMode || 'end';
            const viewportRight = scrollOffset.x + viewportSize.width - (sEnd.x + pEnd.x);
            const colEndPos = (props.columnCount ? getColumnOffset(currentEndColIndex) + getColumnWidth(currentEndColIndex) : getItemOffset(currentEndColIndex) + getItemSize(currentEndColIndex));

            if (colEndPos > viewportRight + 1) {
              scrollToIndex(null, currentEndColIndex, { align });
            } else if (currentEndColIndex < maxColIdx) {
              scrollToIndex(null, currentEndColIndex + 1, { align });
            }
          }
        } else {
          // backward
          if (snapMode === 'end') {
            scrollToIndex(null, Math.max(0, currentEndColIndex - 1), { align: 'end' });
          } else {
            const align = snapMode || 'start';
            const viewportLeft = scrollOffset.x + sStart.x + pStart.x;
            const colStartPos = (props.columnCount ? getColumnOffset(currentColIndex) : getItemOffset(currentColIndex));

            if (colStartPos < viewportLeft - 1) {
              scrollToIndex(null, currentColIndex, { align });
            } else if (currentColIndex > 0) {
              scrollToIndex(null, currentColIndex - 1, { align });
            }
          }
        }
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
        const lastItemIndex = props.items.length - 1;
        const lastColIndex = (props.columnCount || 0) > 0 ? props.columnCount! - 1 : 0;

        const { totalSize } = scrollDetails.value;
        const distance = Math.max(
          totalSize.width - scrollOffset.x - viewportSize.width,
          totalSize.height - scrollOffset.y - viewportSize.height,
        );
        const viewport = props.direction === 'horizontal' ? viewportSize.width : viewportSize.height;
        const behavior = distance > 10 * viewport ? 'auto' : 'smooth';

        if (props.direction === 'both') {
          scrollToIndex(lastItemIndex, lastColIndex, { behavior, align: 'end' });
        } else {
          scrollToIndex(
            props.direction === 'vertical' ? lastItemIndex : 0,
            props.direction === 'horizontal' ? lastItemIndex : 0,
            { behavior, align: 'end' },
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
  }

  return {
    handleKeyDown,
  };
}
