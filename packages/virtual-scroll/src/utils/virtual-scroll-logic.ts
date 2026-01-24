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

// --- Internal Helper Types ---

interface GenericRangeParams {
  scrollPos: number;
  containerSize: number;
  count: number;
  bufferBefore: number;
  bufferAfter: number;
  gap: number;
  fixedSize: number | null;
  findLowerBound: (offset: number) => number;
  query: (index: number) => number;
  // Optional for total size calculation optimization if needed, currently unused in generic
}

interface AxisAlignmentParams {
  align: ScrollAlignment;
  targetPos: number;
  itemSize: number;
  scrollPos: number;
  viewSize: number;
  stickyOffset: number;
}

// --- Internal Helpers ---

/**
 * Generic range calculation for a single axis (row or column).
 */
function calculateGenericRange({
  scrollPos,
  containerSize,
  count,
  bufferBefore,
  bufferAfter,
  gap,
  fixedSize,
  findLowerBound,
  query,
}: GenericRangeParams) {
  let start = 0;
  let end = count;

  if (fixedSize !== null) {
    start = Math.floor(scrollPos / (fixedSize + gap));
    end = Math.ceil((scrollPos + containerSize) / (fixedSize + gap));
  } else {
    start = findLowerBound(scrollPos);
    const target = scrollPos + containerSize;
    end = findLowerBound(target);
    if (end < count && query(end) < target) {
      end++;
    }
  }

  return {
    start: Math.max(0, start - bufferBefore),
    end: Math.min(count, end + bufferAfter),
  };
}

/**
 * Binary search for the next sticky index after the current index.
 */
function findNextStickyIndex(stickyIndices: number[], index: number): number | undefined {
  let low = 0;
  let high = stickyIndices.length - 1;
  let nextStickyIdx: number | undefined;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (stickyIndices[ mid ]! > index) {
      nextStickyIdx = stickyIndices[ mid ];
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return nextStickyIdx;
}

/**
 * Binary search for the previous sticky index before the current index.
 */
function findPrevStickyIndex(stickyIndices: number[], index: number): number | undefined {
  let low = 0;
  let high = stickyIndices.length - 1;
  let prevStickyIdx: number | undefined;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    if (stickyIndices[ mid ]! < index) {
      prevStickyIdx = stickyIndices[ mid ];
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  return prevStickyIdx;
}

/**
 * Generic alignment calculation for a single axis.
 */
function calculateAxisAlignment({
  align,
  targetPos,
  itemSize,
  scrollPos,
  viewSize,
  stickyOffset,
}: AxisAlignmentParams) {
  let target = scrollPos;
  let effectiveAlign: ScrollAlignment = align === 'auto' ? 'auto' : align;

  if (align === 'start') {
    target = targetPos - stickyOffset;
  } else if (align === 'center') {
    target = targetPos - (viewSize - itemSize) / 2;
  } else if (align === 'end') {
    target = targetPos - (viewSize - itemSize);
  } else {
    // Auto alignment: stay if visible, otherwise align to nearest edge (minimal movement)
    const isVisible = itemSize <= (viewSize - stickyOffset)
      ? (targetPos >= scrollPos + stickyOffset - 0.5 && (targetPos + itemSize) <= (scrollPos + viewSize + 0.5))
      : (targetPos <= scrollPos + stickyOffset + 0.5 && (targetPos + itemSize) >= (scrollPos + viewSize - 0.5));

    if (!isVisible) {
      const targetStart = targetPos - stickyOffset;
      const targetEnd = targetPos - (viewSize - itemSize);

      if (itemSize <= viewSize - stickyOffset) {
        if (targetPos < scrollPos + stickyOffset) {
          target = targetStart;
          effectiveAlign = 'start';
        } else {
          target = targetEnd;
          effectiveAlign = 'end';
        }
      } else {
        // Large item: minimal movement
        if (Math.abs(targetStart - scrollPos) < Math.abs(targetEnd - scrollPos)) {
          target = targetStart;
          effectiveAlign = 'start';
        } else {
          target = targetEnd;
          effectiveAlign = 'end';
        }
      }
    }
  }
  return { target, effectiveAlign };
}

// --- Exported Functions ---

/**
 * Calculates the target scroll position (relative to content) for a given row/column index and alignment.
 *
 * @param params - The parameters for calculation.
 * @param params.rowIndex - Row index to target.
 * @param params.colIndex - Column index to target.
 * @param params.options - Scroll options including alignment.
 * @param params.itemsLength - Total items count.
 * @param params.columnCount - Total columns count.
 * @param params.direction - Current scroll direction.
 * @param params.usableWidth - Usable viewport width.
 * @param params.usableHeight - Usable viewport height.
 * @param params.totalWidth - Total estimated width.
 * @param params.totalHeight - Total estimated height.
 * @param params.gap - Item gap.
 * @param params.columnGap - Column gap.
 * @param params.fixedSize - Fixed item size.
 * @param params.fixedWidth - Fixed column width.
 * @param params.relativeScrollX - Current relative X scroll.
 * @param params.relativeScrollY - Current relative Y scroll.
 * @param params.getItemSizeY - Resolver for item height.
 * @param params.getItemSizeX - Resolver for item width.
 * @param params.getItemQueryY - Prefix sum resolver for item height.
 * @param params.getItemQueryX - Prefix sum resolver for item width.
 * @param params.getColumnSize - Resolver for column size.
 * @param params.getColumnQuery - Prefix sum resolver for column width.
 * @param params.stickyIndices - List of sticky indices.
 * @returns The target X and Y positions and item dimensions.
 * @see ScrollTargetParams
 * @see ScrollTargetResult
 */
export function calculateScrollTarget({
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
}: ScrollTargetParams): ScrollTargetResult {
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
      const activeStickyIdx = findPrevStickyIndex(stickyIndices, rowIndex);

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
    const { target, effectiveAlign } = calculateAxisAlignment({
      align: alignY,
      targetPos: itemY,
      itemSize: itemHeight,
      scrollPos: relativeScrollY,
      viewSize: usableHeight,
      stickyOffset: stickyOffsetY,
    });
    targetY = target;
    effectiveAlignY = effectiveAlign;
  }

  // X calculation
  if (colIndex != null) {
    let stickyOffsetX = 0;
    if (isHorizontal && stickyIndices && stickyIndices.length > 0 && (direction === 'horizontal' || direction === 'both')) {
      const activeStickyIdx = findPrevStickyIndex(stickyIndices, colIndex);

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
    const { target, effectiveAlign } = calculateAxisAlignment({
      align: alignX,
      targetPos: itemX,
      itemSize: itemWidth,
      scrollPos: relativeScrollX,
      viewSize: usableWidth,
      stickyOffset: stickyOffsetX,
    });
    targetX = target;
    effectiveAlignX = effectiveAlign;
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
 * @param params.direction - Scroll direction.
 * @param params.relativeScrollX - Relative horizontal scroll position.
 * @param params.relativeScrollY - Relative vertical scroll position.
 * @param params.usableWidth - Usable viewport width.
 * @param params.usableHeight - Usable viewport height.
 * @param params.itemsLength - Total item count.
 * @param params.bufferBefore - Buffer items before.
 * @param params.bufferAfter - Buffer items after.
 * @param params.gap - Item gap.
 * @param params.columnGap - Column gap.
 * @param params.fixedSize - Fixed item size.
 * @param params.findLowerBoundY - Binary search for row index.
 * @param params.findLowerBoundX - Binary search for row index (horizontal).
 * @param params.queryY - Prefix sum for row height.
 * @param params.queryX - Prefix sum for row width.
 * @returns The start and end indices of the items to render.
 * @see RangeParams
 */
export function calculateRange({
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
}: RangeParams) {
  const isVertical = direction === 'vertical' || direction === 'both';

  return calculateGenericRange({
    scrollPos: isVertical ? relativeScrollY : relativeScrollX,
    containerSize: isVertical ? usableHeight : usableWidth,
    count: itemsLength,
    bufferBefore,
    bufferAfter,
    gap: isVertical ? gap : columnGap,
    fixedSize,
    findLowerBound: isVertical ? findLowerBoundY : findLowerBoundX,
    query: isVertical ? queryY : queryX,
  });
}

/**
 * Calculates the range of columns to render for bidirectional scroll.
 *
 * @param params - The parameters for calculation.
 * @param params.columnCount - Column count.
 * @param params.relativeScrollX - Relative horizontal scroll position.
 * @param params.usableWidth - Usable viewport width.
 * @param params.colBuffer - Column buffer count.
 * @param params.fixedWidth - Fixed column width.
 * @param params.columnGap - Column gap.
 * @param params.findLowerBound - Binary search for column index.
 * @param params.query - Prefix sum for column width.
 * @param params.totalColsQuery - Resolver for total column width.
 * @returns The start and end indices and paddings for columns.
 * @see ColumnRangeParams
 * @see ColumnRange
 */
export function calculateColumnRange({
  columnCount,
  relativeScrollX,
  usableWidth,
  colBuffer,
  fixedWidth,
  columnGap,
  findLowerBound,
  query,
  totalColsQuery,
}: ColumnRangeParams) {
  if (!columnCount) {
    return { start: 0, end: 0, padStart: 0, padEnd: 0 };
  }

  // Use generic range to find start/end
  const { start, end } = calculateGenericRange({
    scrollPos: relativeScrollX,
    containerSize: usableWidth,
    count: columnCount,
    bufferBefore: colBuffer,
    bufferAfter: colBuffer,
    gap: columnGap,
    fixedSize: fixedWidth,
    findLowerBound,
    query,
  });

  const safeStart = start; // calculated by generic range with buffer
  const safeEnd = end;

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
 * @param params.index - Item index.
 * @param params.isSticky - Is sticky configured.
 * @param params.direction - Scroll direction.
 * @param params.relativeScrollX - Relative horizontal scroll.
 * @param params.relativeScrollY - Relative vertical scroll.
 * @param params.originalX - Original X offset.
 * @param params.originalY - Original Y offset.
 * @param params.width - Current width.
 * @param params.height - Current height.
 * @param params.stickyIndices - All sticky indices.
 * @param params.fixedSize - Fixed item size.
 * @param params.fixedWidth - Fixed column width.
 * @param params.gap - Item gap.
 * @param params.columnGap - Column gap.
 * @param params.getItemQueryY - Prefix sum resolver for rows.
 * @param params.getItemQueryX - Prefix sum resolver for rows (horizontal).
 * @returns Sticky state and offset.
 * @see StickyParams
 */
export function calculateStickyItem({
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
}: StickyParams) {
  let isStickyActive = false;
  const stickyOffset = { x: 0, y: 0 };

  if (!isSticky) {
    return { isStickyActive, stickyOffset };
  }

  // Y Axis (Sticky Rows)
  if (direction === 'vertical' || direction === 'both') {
    if (relativeScrollY > originalY) {
      const nextStickyIdx = findNextStickyIndex(stickyIndices, index);

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

  // X Axis (Sticky Columns / Items)
  if (direction === 'horizontal' || (direction === 'both' && !isStickyActive)) {
    if (relativeScrollX > originalX) {
      const nextStickyIdx = findNextStickyIndex(stickyIndices, index);

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
 * @param params.index - Item index.
 * @param params.direction - Scroll direction.
 * @param params.fixedSize - Fixed item size.
 * @param params.gap - Item gap.
 * @param params.columnGap - Column gap.
 * @param params.usableWidth - Usable viewport width.
 * @param params.usableHeight - Usable viewport height.
 * @param params.totalWidth - Total estimated width.
 * @param params.queryY - Prefix sum for row height.
 * @param params.queryX - Prefix sum for row width.
 * @param params.getSizeY - Height resolver.
 * @param params.getSizeX - Width resolver.
 * @returns Item position and size.
 * @see ItemPositionParams
 */
export function calculateItemPosition({
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
}: ItemPositionParams) {
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
 * @param params.item - The rendered item state.
 * @param params.direction - Scroll direction.
 * @param params.itemSize - Configured item size logic.
 * @param params.containerTag - Parent container tag.
 * @param params.paddingStartX - Padding start on X axis.
 * @param params.paddingStartY - Padding start on Y axis.
 * @param params.isHydrated - Hydration state.
 * @returns Style object.
 * @see ItemStyleParams
 */
export function calculateItemStyle<T = unknown>({
  item,
  direction,
  itemSize,
  containerTag,
  paddingStartX,
  paddingStartY,
  isHydrated,
}: ItemStyleParams<T>) {
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
 * @param params.direction - The scroll direction.
 * @param params.itemsLength - The number of items in the list.
 * @param params.columnCount - The number of columns (for grid mode).
 * @param params.fixedSize - The fixed size of items, if applicable.
 * @param params.fixedWidth - The fixed width of columns, if applicable.
 * @param params.gap - The gap between items.
 * @param params.columnGap - The gap between columns.
 * @param params.usableWidth - Usable viewport width.
 * @param params.usableHeight - Usable viewport height.
 * @param params.queryY - Function to query the prefix sum of item heights.
 * @param params.queryX - Function to query the prefix sum of item widths.
 * @param params.queryColumn - Function to query the prefix sum of column widths.
 * @returns Total width and height.
 * @see TotalSizeParams
 */
export function calculateTotalSize({
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
}: TotalSizeParams) {
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
