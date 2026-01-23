import type {
  ColumnRangeParams,
  ItemPositionParams,
  ItemStyleParams,
  RangeParams,
  ScrollAlignment,
  ScrollAlignmentOptions,
  ScrollTargetParams,
  ScrollTargetResult,
  ScrollToIndexOptions,
  StickyParams,
  TotalSizeParams,
} from '../types';

import { isScrollToIndexOptions } from './scroll';

/**
 * Calculates the target scroll position (relative to content) for a given row/column index and alignment.
 *
 * @param params - The parameters for calculation.
 * @returns The target X and Y positions and item dimensions.
 * @see ScrollTargetParams
 * @see ScrollTargetResult
 */
export function calculateScrollTarget(params: ScrollTargetParams): ScrollTargetResult {
  const {
    rowIndex,
    colIndex,
    options,
    itemsLength,
    columnCount,
    direction,
    usableWidth,
    usableHeight,
    totalWidth,
    totalHeight,
    gap,
    columnGap,
    fixedSize,
    fixedWidth,
    relativeScrollX,
    relativeScrollY,
    getItemSizeY,
    getItemSizeX,
    getItemQueryY,
    getItemQueryX,
    getColumnSize,
    getColumnQuery,
    stickyIndices,
  } = params;

  let align: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions | undefined;

  if (isScrollToIndexOptions(options)) {
    align = options.align;
  } else {
    align = options as ScrollAlignment | ScrollAlignmentOptions;
  }

  const alignX = (typeof align === 'object' ? align.x : align) || 'auto';
  const alignY = (typeof align === 'object' ? align.y : align) || 'auto';

  const isVertical = direction === 'vertical' || direction === 'both';
  const isHorizontal = direction === 'horizontal' || direction === 'both';

  let targetX = relativeScrollX;
  let targetY = relativeScrollY;
  let itemWidth = 0;
  let itemHeight = 0;
  let effectiveAlignX: ScrollAlignment = alignX === 'auto' ? 'auto' : alignX;
  let effectiveAlignY: ScrollAlignment = alignY === 'auto' ? 'auto' : alignY;

  // Y calculation
  if (rowIndex != null) {
    let stickyOffsetY = 0;
    if (isVertical && stickyIndices && stickyIndices.length > 0) {
      let activeStickyIdx: number | undefined;
      let low = 0;
      let high = stickyIndices.length - 1;
      while (low <= high) {
        const mid = (low + high) >>> 1;
        if (stickyIndices[ mid ]! < rowIndex) {
          activeStickyIdx = stickyIndices[ mid ];
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (activeStickyIdx !== undefined) {
        stickyOffsetY = fixedSize !== null ? fixedSize : getItemSizeY(activeStickyIdx) - gap;
      }
    }

    let itemY = 0;
    if (rowIndex >= itemsLength) {
      itemY = totalHeight;
      itemHeight = 0;
    } else {
      itemY = fixedSize !== null ? rowIndex * (fixedSize + gap) : getItemQueryY(rowIndex);
      itemHeight = fixedSize !== null ? fixedSize : getItemSizeY(rowIndex) - gap;
    }

    // Apply Y Alignment
    if (alignY === 'start') {
      targetY = itemY - stickyOffsetY;
    } else if (alignY === 'center') {
      targetY = itemY - (usableHeight - itemHeight) / 2;
    } else if (alignY === 'end') {
      targetY = itemY - (usableHeight - itemHeight);
    } else {
      // Auto alignment: stay if visible, otherwise align to nearest edge (minimal movement)
      const isVisibleY = itemHeight <= (usableHeight - stickyOffsetY)
        ? (itemY >= relativeScrollY + stickyOffsetY - 0.5 && (itemY + itemHeight) <= (relativeScrollY + usableHeight + 0.5))
        : (itemY <= relativeScrollY + stickyOffsetY + 0.5 && (itemY + itemHeight) >= (relativeScrollY + usableHeight - 0.5));

      if (!isVisibleY) {
        const targetStart = itemY - stickyOffsetY;
        const targetEnd = itemY - (usableHeight - itemHeight);

        if (itemHeight <= usableHeight - stickyOffsetY) {
          if (itemY < relativeScrollY + stickyOffsetY) {
            targetY = targetStart;
            effectiveAlignY = 'start';
          } else {
            targetY = targetEnd;
            effectiveAlignY = 'end';
          }
        } else {
          // Large item: minimal movement
          if (Math.abs(targetStart - relativeScrollY) < Math.abs(targetEnd - relativeScrollY)) {
            targetY = targetStart;
            effectiveAlignY = 'start';
          } else {
            targetY = targetEnd;
            effectiveAlignY = 'end';
          }
        }
      }
    }
  }

  // X calculation
  if (colIndex != null) {
    let stickyOffsetX = 0;
    if (isHorizontal && stickyIndices && stickyIndices.length > 0 && (direction === 'horizontal' || direction === 'both')) {
      let activeStickyIdx: number | undefined;
      let low = 0;
      let high = stickyIndices.length - 1;
      while (low <= high) {
        const mid = (low + high) >>> 1;
        if (stickyIndices[ mid ]! < colIndex) {
          activeStickyIdx = stickyIndices[ mid ];
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }

      if (activeStickyIdx !== undefined) {
        stickyOffsetX = direction === 'horizontal'
          ? (fixedSize !== null ? fixedSize : getItemSizeX(activeStickyIdx) - columnGap)
          : (fixedWidth !== null ? fixedWidth : getColumnSize(activeStickyIdx) - columnGap);
      }
    }

    let itemX = 0;
    if (colIndex >= columnCount && columnCount > 0) {
      itemX = totalWidth;
      itemWidth = 0;
    } else if (direction === 'horizontal') {
      itemX = fixedSize !== null ? colIndex * (fixedSize + columnGap) : getItemQueryX(colIndex);
      itemWidth = fixedSize !== null ? fixedSize : getItemSizeX(colIndex) - columnGap;
    } else {
      itemX = getColumnQuery(colIndex);
      itemWidth = getColumnSize(colIndex) - columnGap;
    }

    // Apply X Alignment
    if (alignX === 'start') {
      targetX = itemX - stickyOffsetX;
    } else if (alignX === 'center') {
      targetX = itemX - (usableWidth - itemWidth) / 2;
    } else if (alignX === 'end') {
      targetX = itemX - (usableWidth - itemWidth);
    } else {
      // Auto alignment: stay if visible, otherwise align to nearest edge (minimal movement)
      const isVisibleX = itemWidth <= (usableWidth - stickyOffsetX)
        ? (itemX >= relativeScrollX + stickyOffsetX - 0.5 && (itemX + itemWidth) <= (relativeScrollX + usableWidth + 0.5))
        : (itemX <= relativeScrollX + stickyOffsetX + 0.5 && (itemX + itemWidth) >= (relativeScrollX + usableWidth - 0.5));

      if (!isVisibleX) {
        const targetStart = itemX - stickyOffsetX;
        const targetEnd = itemX - (usableWidth - itemWidth);

        if (itemWidth <= usableWidth - stickyOffsetX) {
          if (itemX < relativeScrollX + stickyOffsetX) {
            targetX = targetStart;
            effectiveAlignX = 'start';
          } else {
            targetX = targetEnd;
            effectiveAlignX = 'end';
          }
        } else {
          // Large item: minimal movement
          if (Math.abs(targetStart - relativeScrollX) < Math.abs(targetEnd - relativeScrollX)) {
            targetX = targetStart;
            effectiveAlignX = 'start';
          } else {
            targetX = targetEnd;
            effectiveAlignX = 'end';
          }
        }
      }
    }
  }

  // Clamp to valid range
  targetX = Math.max(0, Math.min(targetX, Math.max(0, totalWidth - usableWidth)));
  targetY = Math.max(0, Math.min(targetY, Math.max(0, totalHeight - usableHeight)));

  return { targetX, targetY, itemWidth, itemHeight, effectiveAlignX, effectiveAlignY };
}

/**
 * Calculates the range of items to render based on scroll position and viewport size.
 *
 * @param params - The parameters for calculation.
 * @returns The start and end indices of the items to render.
 * @see RangeParams
 */
export function calculateRange(params: RangeParams) {
  const {
    direction,
    relativeScrollX,
    relativeScrollY,
    usableWidth,
    usableHeight,
    itemsLength,
    bufferBefore,
    bufferAfter,
    gap,
    columnGap,
    fixedSize,
    findLowerBoundY,
    findLowerBoundX,
    queryY,
    queryX,
  } = params;

  const isVertical = direction === 'vertical' || direction === 'both';

  let start = 0;
  let end = itemsLength;

  if (isVertical) {
    if (fixedSize !== null) {
      start = Math.floor(relativeScrollY / (fixedSize + gap));
      end = Math.ceil((relativeScrollY + usableHeight) / (fixedSize + gap));
    } else {
      start = findLowerBoundY(relativeScrollY);
      const targetY = relativeScrollY + usableHeight;
      end = findLowerBoundY(targetY);
      if (end < itemsLength && queryY(end) < targetY) {
        end++;
      }
    }
  } else {
    if (fixedSize !== null) {
      start = Math.floor(relativeScrollX / (fixedSize + columnGap));
      end = Math.ceil((relativeScrollX + usableWidth) / (fixedSize + columnGap));
    } else {
      start = findLowerBoundX(relativeScrollX);
      const targetX = relativeScrollX + usableWidth;
      end = findLowerBoundX(targetX);
      if (end < itemsLength && queryX(end) < targetX) {
        end++;
      }
    }
  }

  return {
    start: Math.max(0, start - bufferBefore),
    end: Math.min(itemsLength, end + bufferAfter),
  };
}

/**
 * Calculates the range of columns to render for bidirectional scroll.
 *
 * @param params - The parameters for calculation.
 * @returns The start and end indices and paddings for columns.
 * @see ColumnRangeParams
 * @see ColumnRange
 */
export function calculateColumnRange(params: ColumnRangeParams) {
  const {
    columnCount,
    relativeScrollX,
    usableWidth,
    colBuffer,
    fixedWidth,
    columnGap,
    findLowerBound,
    query,
    totalColsQuery,
  } = params;

  if (!columnCount) {
    return { start: 0, end: 0, padStart: 0, padEnd: 0 };
  }

  let start = 0;
  let end = columnCount;

  if (fixedWidth !== null) {
    start = Math.floor(relativeScrollX / (fixedWidth + columnGap));
    end = Math.ceil((relativeScrollX + usableWidth) / (fixedWidth + columnGap));
  } else {
    start = findLowerBound(relativeScrollX);
    const targetX = relativeScrollX + usableWidth;
    end = findLowerBound(targetX);
    if (end < columnCount && query(end) < targetX) {
      end++;
    }
  }

  // Add buffer of columns
  const safeStart = Math.max(0, start - colBuffer);
  const safeEnd = Math.min(columnCount, end + colBuffer);

  const padStart = fixedWidth !== null ? safeStart * (fixedWidth + columnGap) : query(safeStart);
  const totalWidth = fixedWidth !== null ? columnCount * (fixedWidth + columnGap) - columnGap : Math.max(0, totalColsQuery() - columnGap);

  const renderedEnd = fixedWidth !== null
    ? (safeEnd * (fixedWidth + columnGap) - (safeEnd >= columnCount ? columnGap : 0))
    : (query(safeEnd) - (safeEnd >= columnCount ? columnGap : 0));

  return {
    start: safeStart,
    end: safeEnd,
    padStart,
    padEnd: Math.max(0, totalWidth - renderedEnd),
  };
}

/**
 * Calculates the sticky state and offset for a single item.
 *
 * @param params - The parameters for calculation.
 * @returns Sticky state and offset.
 * @see StickyParams
 */
export function calculateStickyItem(params: StickyParams) {
  const {
    index,
    isSticky,
    direction,
    relativeScrollX,
    relativeScrollY,
    originalX,
    originalY,
    width,
    height,
    stickyIndices,
    fixedSize,
    fixedWidth,
    gap,
    columnGap,
    getItemQueryY,
    getItemQueryX,
  } = params;

  let isStickyActive = false;
  const stickyOffset = { x: 0, y: 0 };

  if (!isSticky) {
    return { isStickyActive, stickyOffset };
  }

  if (direction === 'vertical' || direction === 'both') {
    if (relativeScrollY > originalY) {
      // Check if next sticky item pushes this one
      let nextStickyIdx: number | undefined;
      let low = 0;
      let high = stickyIndices.length - 1;
      while (low <= high) {
        const mid = (low + high) >>> 1;
        if (stickyIndices[ mid ]! > index) {
          nextStickyIdx = stickyIndices[ mid ];
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      if (nextStickyIdx !== undefined) {
        const nextStickyY = fixedSize !== null ? nextStickyIdx * (fixedSize + gap) : getItemQueryY(nextStickyIdx);
        if (relativeScrollY >= nextStickyY) {
          isStickyActive = false;
        } else {
          isStickyActive = true;
          stickyOffset.y = Math.max(0, Math.min(height, nextStickyY - relativeScrollY)) - height;
        }
      } else {
        isStickyActive = true;
      }
    }
  }

  if (direction === 'horizontal' || (direction === 'both' && !isStickyActive)) {
    if (relativeScrollX > originalX) {
      let nextStickyIdx: number | undefined;
      let low = 0;
      let high = stickyIndices.length - 1;
      while (low <= high) {
        const mid = (low + high) >>> 1;
        if (stickyIndices[ mid ]! > index) {
          nextStickyIdx = stickyIndices[ mid ];
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      if (nextStickyIdx !== undefined) {
        const nextStickyX = direction === 'horizontal'
          ? (fixedSize !== null ? nextStickyIdx * (fixedSize + columnGap) : getItemQueryX(nextStickyIdx))
          : (fixedWidth !== null ? nextStickyIdx * (fixedWidth + columnGap) : getItemQueryX(nextStickyIdx));

        if (relativeScrollX >= nextStickyX) {
          isStickyActive = false;
        } else {
          isStickyActive = true;
          stickyOffset.x = Math.max(0, Math.min(width, nextStickyX - relativeScrollX)) - width;
        }
      } else {
        isStickyActive = true;
      }
    }
  }

  return { isStickyActive, stickyOffset };
}

/**
 * Calculates the position and size of a single item.
 *
 * @param params - The parameters for calculation.
 * @returns Item position and size.
 * @see ItemPositionParams
 */
export function calculateItemPosition(params: ItemPositionParams) {
  const {
    index,
    direction,
    fixedSize,
    gap,
    columnGap,
    usableWidth,
    usableHeight,
    totalWidth,
    queryY,
    queryX,
    getSizeY,
    getSizeX,
  } = params;

  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;

  if (direction === 'horizontal') {
    x = fixedSize !== null ? index * (fixedSize + columnGap) : queryX(index);
    width = fixedSize !== null ? fixedSize : getSizeX(index) - columnGap;
    height = usableHeight;
  } else {
    // vertical or both
    y = (direction === 'vertical' || direction === 'both') && fixedSize !== null ? index * (fixedSize + gap) : queryY(index);
    height = fixedSize !== null ? fixedSize : getSizeY(index) - gap;
    width = direction === 'both' ? totalWidth : usableWidth;
  }

  return { height, width, x, y };
}

/**
 * Calculates the style object for a rendered item.
 *
 * @param params - The parameters for calculation.
 * @returns Style object.
 * @see ItemStyleParams
 */
export function calculateItemStyle<T = unknown>(params: ItemStyleParams<T>) {
  const {
    item,
    direction,
    itemSize,
    containerTag,
    paddingStartX,
    paddingStartY,
    isHydrated,
  } = params;

  const isVertical = direction === 'vertical';
  const isHorizontal = direction === 'horizontal';
  const isBoth = direction === 'both';
  const isDynamic = itemSize === undefined || itemSize === null || itemSize === 0;

  const style: Record<string, string | number | undefined> = {
    blockSize: isHorizontal ? '100%' : (!isDynamic ? `${ item.size.height }px` : 'auto'),
  };

  if (isVertical && containerTag === 'table') {
    style.minInlineSize = '100%';
  } else {
    style.inlineSize = isVertical ? '100%' : (!isDynamic ? `${ item.size.width }px` : 'auto');
  }

  if (isDynamic) {
    if (!isVertical) {
      style.minInlineSize = '1px';
    }
    if (!isHorizontal) {
      style.minBlockSize = '1px';
    }
  }

  if (isHydrated) {
    if (item.isStickyActive) {
      if (isVertical || isBoth) {
        style.insetBlockStart = `${ paddingStartY }px`;
      }

      if (isHorizontal || isBoth) {
        style.insetInlineStart = `${ paddingStartX }px`;
      }

      style.transform = `translate(${ item.stickyOffset.x }px, ${ item.stickyOffset.y }px)`;
    } else {
      style.transform = `translate(${ item.offset.x }px, ${ item.offset.y }px)`;
    }
  }

  return style;
}

/**
 * Calculates the total width and height of the virtualized content.
 *
 * @param params - The parameters for calculation.
 * @returns Total width and height.
 * @see TotalSizeParams
 */
export function calculateTotalSize(params: TotalSizeParams) {
  const {
    direction,
    itemsLength,
    columnCount,
    fixedSize,
    fixedWidth,
    gap,
    columnGap,
    usableWidth,
    usableHeight,
    queryY,
    queryX,
    queryColumn,
  } = params;

  let width = 0;
  let height = 0;

  if (direction === 'both') {
    if (columnCount > 0) {
      width = fixedWidth !== null ? columnCount * (fixedWidth + columnGap) - columnGap : Math.max(0, queryColumn(columnCount) - columnGap);
    }
    if (fixedSize !== null) {
      height = Math.max(0, itemsLength * (fixedSize + gap) - (itemsLength > 0 ? gap : 0));
    } else {
      height = Math.max(0, queryY(itemsLength) - (itemsLength > 0 ? gap : 0));
    }
    width = Math.max(width, usableWidth);
    height = Math.max(height, usableHeight);
  } else if (direction === 'horizontal') {
    if (fixedSize !== null) {
      width = Math.max(0, itemsLength * (fixedSize + columnGap) - (itemsLength > 0 ? columnGap : 0));
    } else {
      width = Math.max(0, queryX(itemsLength) - (itemsLength > 0 ? columnGap : 0));
    }
    height = usableHeight;
  } else {
    // vertical
    width = usableWidth;
    if (fixedSize !== null) {
      height = Math.max(0, itemsLength * (fixedSize + gap) - (itemsLength > 0 ? gap : 0));
    } else {
      height = Math.max(0, queryY(itemsLength) - (itemsLength > 0 ? gap : 0));
    }
  }

  return { width, height };
}
