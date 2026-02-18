import type {
  ColumnRangeParams,
  ItemPositionParams,
  ItemStyleParams,
  RangeParams,
  ScrollAlignment,
  ScrollAlignmentOptions,
  ScrollDirection,
  ScrollTargetParams,
  ScrollTargetResult,
  ScrollToIndexOptions,
  SnapMode,
  SSRRange,
  StickyParams,
  TotalSizeParams,
} from '../types';

import { BROWSER_MAX_SIZE, isScrollToIndexOptions } from './scroll';

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
}

interface AxisAlignmentParams {
  align: ScrollAlignment;
  targetPos: number;
  itemSize: number;
  scrollPos: number;
  viewSize: number;
  stickyOffsetStart: number;
  stickyOffsetEnd: number;
}

/** Snap result. */
export interface SnapResult {
  /** Target index. */
  index: number;
  /** Alignment. */
  align: 'start' | 'center' | 'end';
}

// --- Internal Helpers ---

/**
 * Generic range calculation for a single axis (row or column).
 *
 * @param params - Range parameters.
 * @param params.scrollPos - Virtual scroll position.
 * @param params.containerSize - Usable viewport size.
 * @param params.count - Total item count.
 * @param params.bufferBefore - Buffer items before.
 * @param params.bufferAfter - Buffer items after.
 * @param params.gap - Item gap.
 * @param params.fixedSize - Fixed item size.
 * @param params.findLowerBound - Binary search for index.
 * @param params.query - Prefix sum for index.
 * @returns Start and end indices.
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
  const endOffset = scrollPos + containerSize;

  if (fixedSize !== null) {
    const step = fixedSize + gap;
    start = Math.floor(scrollPos / step);
    end = Math.ceil(endOffset / step);
  } else {
    start = findLowerBound(scrollPos);
    end = findLowerBound(endOffset);
    if (end < count && query(end) < endOffset) {
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
 *
 * @param stickyIndices - Sorted array of sticky indices.
 * @param index - Current index.
 * @returns Next sticky index or undefined.
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
 *
 * @param stickyIndices - Sorted array of sticky indices.
 * @param index - Current index.
 * @returns Previous sticky index or undefined.
 */
export function findPrevStickyIndex(stickyIndices: number[], index: number): number | undefined {
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
 *
 * @param params - Alignment parameters.
 * @param params.align - Desired alignment.
 * @param params.targetPos - Virtual item position.
 * @param params.itemSize - Virtual item size.
 * @param params.scrollPos - Virtual scroll position.
 * @param params.viewSize - Full viewport size.
 * @param params.stickyOffsetStart - Dynamic sticky offset at start.
 * @param params.stickyOffsetEnd - Sticky offset at end.
 * @returns Target scroll position and effective alignment.
 */
function calculateAxisAlignment({
  align,
  targetPos,
  itemSize,
  scrollPos,
  viewSize,
  stickyOffsetStart,
  stickyOffsetEnd,
}: AxisAlignmentParams) {
  const targetStart = targetPos - stickyOffsetStart;
  const targetEnd = targetPos - (viewSize - stickyOffsetEnd - itemSize);

  if (align === 'start') {
    return { target: targetStart, effectiveAlign: 'start' as const };
  }
  if (align === 'center') {
    return {
      target: targetPos - stickyOffsetStart - (viewSize - stickyOffsetStart - stickyOffsetEnd - itemSize) / 2,
      effectiveAlign: 'center' as const,
    };
  }
  if (align === 'end') {
    return { target: targetEnd, effectiveAlign: 'end' as const };
  }

  if (isItemVisible(targetPos, itemSize, scrollPos, viewSize, stickyOffsetStart, stickyOffsetEnd)) {
    return { target: scrollPos, effectiveAlign: 'auto' as const };
  }

  const usableSize = viewSize - stickyOffsetStart - stickyOffsetEnd;

  if (itemSize <= usableSize) {
    return targetPos < scrollPos + stickyOffsetStart
      ? {
        target: targetStart,
        effectiveAlign: 'start' as const,
      }
      : {
        target: targetEnd,
        effectiveAlign: 'end' as const,
      };
  }

  return Math.abs(targetStart - scrollPos) < Math.abs(targetEnd - scrollPos)
    ? {
      target: targetStart,
      effectiveAlign: 'start' as const,
    }
    : {
      target: targetEnd,
      effectiveAlign: 'end' as const,
    };
}

/**
 * Helper to calculate total size for a single axis.
 *
 * @param count - Item count.
 * @param fixedSize - Fixed size if any.
 * @param gap - Gap size.
 * @param query - Prefix sum resolver.
 * @returns Total size.
 */
export function calculateAxisSize(
  count: number,
  fixedSize: number | null,
  gap: number,
  query: (index: number) => number,
): number {
  if (count <= 0) {
    return 0;
  }
  if (fixedSize !== null) {
    return Math.max(0, count * (fixedSize + gap) - gap);
  }
  return Math.max(0, query(count) - gap);
}

/**
 * Helper to calculate size for a range on a single axis.
 *
 * @param start - Start index.
 * @param end - End index.
 * @param fixedSize - Fixed size if any.
 * @param gap - Gap size.
 * @param query - Prefix sum resolver.
 * @returns Range size.
 */
export function calculateRangeSize(
  start: number,
  end: number,
  fixedSize: number | null,
  gap: number,
  query: (index: number) => number,
): number {
  const count = end - start;
  if (count <= 0) {
    return 0;
  }
  if (fixedSize !== null) {
    return Math.max(0, count * (fixedSize + gap) - gap);
  }
  return Math.max(0, query(end) - query(start) - gap);
}

/**
 * Helper to calculate offset at a specific index.
 *
 * @param index - Item index.
 * @param fixedSize - Fixed size if any.
 * @param gap - Gap size.
 * @param query - Prefix sum resolver.
 * @returns Offset at index.
 */
export function calculateOffsetAt(
  index: number,
  fixedSize: number | null,
  gap: number,
  query: (index: number) => number,
): number {
  if (fixedSize !== null) {
    return index * (fixedSize + gap);
  }
  return query(index);
}

/**
 * Helper to calculate target scroll position for a single axis.
 *
 * @param params - Axis target parameters.
 * @param params.index - Row/column index.
 * @param params.align - Desired alignment.
 * @param params.viewSize - Full viewport size.
 * @param params.scrollPos - Virtual scroll position.
 * @param params.fixedSize - Fixed item size.
 * @param params.gap - Item gap.
 * @param params.query - Prefix sum resolver.
 * @param params.getSize - Item size resolver.
 * @param params.stickyIndices - Sticky indices.
 * @param params.stickyStart - Sticky start element size.
 * @param params.stickyEnd - Sticky end element size.
 * @returns Target position, item size and effective alignment.
 */
function calculateAxisTarget({
  index,
  align,
  viewSize,
  scrollPos,
  fixedSize,
  gap,
  query,
  getSize,
  stickyIndices,
  stickyStart,
  stickyEnd = 0,
}: {
  index: number;
  align: ScrollAlignment;
  viewSize: number;
  scrollPos: number;
  fixedSize: number | null;
  gap: number;
  query: (idx: number) => number;
  getSize: (idx: number) => number;
  stickyIndices?: number[] | undefined;
  stickyStart: number;
  stickyEnd?: number;
}) {
  let stickyOffsetStart = stickyStart;
  if (stickyIndices && stickyIndices.length > 0) {
    const activeStickyIdx = findPrevStickyIndex(stickyIndices, index);
    if (activeStickyIdx !== undefined) {
      stickyOffsetStart += calculateAxisSize(1, fixedSize, 0, () => getSize(activeStickyIdx));
    }
  }

  const itemPos = (fixedSize !== null ? index * (fixedSize + gap) : query(index));
  const itemSize = fixedSize !== null ? fixedSize : getSize(index) - gap;

  const { target, effectiveAlign } = calculateAxisAlignment({
    align,
    targetPos: itemPos,
    itemSize,
    scrollPos,
    viewSize,
    stickyOffsetStart,
    stickyOffsetEnd: stickyEnd,
  });

  return { target, itemSize, effectiveAlign };
}

/**
 * Helper to calculate sticky state for a single axis.
 *
 * @param scrollPos - Virtual scroll position.
 * @param originalPos - Original virtual item position.
 * @param size - Virtual item size.
 * @param index - Item index.
 * @param stickyIndices - All sticky indices.
 * @param getNextStickyPos - Resolver for the next sticky item's position.
 * @returns Sticky state for this axis.
 */
function calculateAxisSticky(
  scrollPos: number,
  originalPos: number,
  size: number,
  index: number,
  stickyIndices: number[],
  getNextStickyPos: (idx: number) => number,
) {
  if (scrollPos <= originalPos) {
    return { isActive: false, offset: 0 };
  }

  const nextStickyIdx = findNextStickyIndex(stickyIndices, index);
  if (nextStickyIdx === undefined) {
    return { isActive: true, offset: 0 };
  }

  const nextStickyPos = getNextStickyPos(nextStickyIdx);
  if (scrollPos >= nextStickyPos) {
    return { isActive: false, offset: 0 };
  }

  return {
    isActive: true,
    offset: Math.max(0, Math.min(size, nextStickyPos - scrollPos)) - size,
  };
}

// --- Exported Functions ---

/**
 * Determines if an item is visible within the usable viewport.
 *
 * @param itemPos - Virtual start position of the item (VU).
 * @param itemSize - Virtual size of the item (VU).
 * @param scrollPos - Virtual scroll position (VU).
 * @param viewSize - Full size of the viewport (VU).
 * @param stickyOffsetStart - Dynamic offset from sticky items at start (VU).
 * @param stickyOffsetEnd - Offset from sticky items at end (VU).
 * @returns True if visible.
 */
export function isItemVisible(
  itemPos: number,
  itemSize: number,
  scrollPos: number,
  viewSize: number,
  stickyOffsetStart: number = 0,
  stickyOffsetEnd: number = 0,
): boolean {
  const usableStart = scrollPos + stickyOffsetStart;
  const usableEnd = scrollPos + viewSize - stickyOffsetEnd;
  const usableSize = viewSize - stickyOffsetStart - stickyOffsetEnd;

  if (itemSize <= usableSize) {
    return itemPos >= usableStart - 0.5 && (itemPos + itemSize) <= usableEnd + 0.5;
  }
  return itemPos <= usableStart + 0.5 && (itemPos + itemSize) >= usableEnd - 0.5;
}

/**
 * Calculates the coordinate scaling factor between virtual and display units.
 *
 * @param isWindow - If the container is the window.
 * @param totalSize - Total virtual size (VU).
 * @param viewportSize - Viewport size (DU).
 * @returns Scaling factor (VU/DU).
 */
export function calculateScale(isWindow: boolean, totalSize: number, viewportSize: number): number {
  if (isWindow || totalSize <= BROWSER_MAX_SIZE) {
    return 1;
  }
  const displaySize = Math.min(totalSize, BROWSER_MAX_SIZE);
  const realRange = totalSize - viewportSize;
  const displayRange = displaySize - viewportSize;
  return displayRange > 0 ? realRange / displayRange : 1;
}

/**
 * Calculates the physical size to be rendered in the DOM.
 *
 * @param isWindow - If the container is the window.
 * @param totalSize - Total virtual size (VU).
 * @returns Physical size (DU).
 */
export function calculateRenderedSize(isWindow: boolean, totalSize: number): number {
  return isWindow ? totalSize : Math.min(totalSize, BROWSER_MAX_SIZE);
}

/**
 * Maps a display scroll position to a virtual content position.
 *
 * @param displayPos - Display pixel position (DU).
 * @param hostOffset - Offset of the host element in display pixels (DU).
 * @param scale - Coordinate scaling factor (VU/DU).
 * @returns Virtual content position (VU).
 */
export function displayToVirtual(displayPos: number, hostOffset: number, scale: number): number {
  return (displayPos - hostOffset) * scale;
}

/**
 * Maps a virtual content position to a display scroll position.
 *
 * @param virtualPos - Virtual content position (VU).
 * @param hostOffset - Offset of the host element in display pixels (DU).
 * @param scale - Coordinate scaling factor (VU/DU).
 * @returns Display pixel position (DU).
 */
export function virtualToDisplay(virtualPos: number, hostOffset: number, scale: number): number {
  return virtualPos / scale + hostOffset;
}

/**
 * Calculates the target scroll position (relative to content) for a given row/column index and alignment.
 *
 * @param params - Scroll target parameters.
 * @param params.rowIndex - Row index to target.
 * @param params.colIndex - Column index to target.
 * @param params.options - Scroll options including alignment.
 * @param params.direction - Current scroll direction.
 * @param params.viewportWidth - Full viewport width (DU).
 * @param params.viewportHeight - Full viewport height (DU).
 * @param params.totalWidth - Total estimated width (VU).
 * @param params.totalHeight - Total estimated height (VU).
 * @param params.gap - Item gap (VU).
 * @param params.columnGap - Column gap (VU).
 * @param params.fixedSize - Fixed item size (VU).
 * @param params.fixedWidth - Fixed column width (VU).
 * @param params.relativeScrollX - Current relative X scroll (VU).
 * @param params.relativeScrollY - Current relative Y scroll (VU).
 * @param params.getItemSizeY - Resolver for item height (VU).
 * @param params.getItemSizeX - Resolver for item width (VU).
 * @param params.getItemQueryY - Prefix sum resolver for item height (VU).
 * @param params.getItemQueryX - Prefix sum resolver for item width (VU).
 * @param params.getColumnSize - Resolver for column size (VU).
 * @param params.getColumnQuery - Prefix sum resolver for column width (VU).
 * @param params.scaleX - Coordinate scaling factor for X axis.
 * @param params.scaleY - Coordinate scaling factor for Y axis.
 * @param params.hostOffsetX - Display pixels offset of items wrapper on X axis (DU).
 * @param params.hostOffsetY - Display pixels offset of items wrapper on Y axis (DU).
 * @param params.flowPaddingStartX - Display pixels padding at flow start on X axis (DU).
 * @param params.flowPaddingStartY - Display pixels padding at flow start on Y axis (DU).
 * @param params.paddingStartX - Display pixels padding at scroll start on X axis (DU).
 * @param params.paddingStartY - Display pixels padding at scroll start on Y axis (DU).
 * @param params.paddingEndX - Display pixels padding at scroll end on X axis (DU).
 * @param params.paddingEndY - Display pixels padding at scroll end on Y axis (DU).
 * @param params.stickyIndices - List of sticky indices.
 * @param params.stickyStartX - Sticky start offset on X axis (DU).
 * @param params.stickyStartY - Sticky start offset on Y axis (DU).
 * @param params.stickyEndX - Sticky end offset on X axis (DU).
 * @param params.stickyEndY - Sticky end offset on Y axis (DU).
 * @returns The target X and Y positions (VU) and item dimensions (VU).
 * @see ScrollTargetParams
 * @see ScrollTargetResult
 */
export function calculateScrollTarget({
  rowIndex,
  colIndex,
  options,
  direction,
  viewportWidth,
  viewportHeight,
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
  scaleX,
  scaleY,
  hostOffsetX,
  hostOffsetY,
  stickyIndices,
  stickyStartX = 0,
  stickyStartY = 0,
  stickyEndX = 0,
  stickyEndY = 0,
  flowPaddingStartX = 0,
  flowPaddingStartY = 0,
  paddingStartX = 0,
  paddingStartY = 0,
  paddingEndX = 0,
  paddingEndY = 0,
}: ScrollTargetParams): ScrollTargetResult {
  let align: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions | undefined;

  if (isScrollToIndexOptions(options)) {
    align = options.align;
  } else {
    align = options as ScrollAlignment | ScrollAlignmentOptions;
  }

  const alignX = (align && typeof align === 'object' ? align.x : align) || 'auto';
  const alignY = (align && typeof align === 'object' ? align.y : align) || 'auto';

  let targetX = relativeScrollX;
  let targetY = relativeScrollY;
  let itemWidth = 0;
  let itemHeight = 0;
  let effectiveAlignX: ScrollAlignment = 'auto';
  let effectiveAlignY: ScrollAlignment = 'auto';

  // Clamp to valid range
  const rWidth = scaleX === 1 ? totalWidth : BROWSER_MAX_SIZE;
  const rHeight = scaleY === 1 ? totalHeight : BROWSER_MAX_SIZE;

  const maxDisplayX = Math.max(0, hostOffsetX + rWidth - viewportWidth);
  const maxDisplayY = Math.max(0, hostOffsetY + rHeight - viewportHeight);

  // maxTarget should be in virtual internalScroll coordinates
  const maxTargetX = (maxDisplayX - hostOffsetX) * scaleX;
  const maxTargetY = (maxDisplayY - hostOffsetY) * scaleY;

  const itemsStartVirtualX = flowPaddingStartX + stickyStartX + paddingStartX;
  const itemsStartVirtualY = flowPaddingStartY + stickyStartY + paddingStartY;

  // Y calculation
  if (rowIndex != null) {
    const res = calculateAxisTarget({
      index: rowIndex,
      align: alignY as ScrollAlignment,
      viewSize: viewportHeight,
      scrollPos: relativeScrollY,
      fixedSize,
      gap,
      query: getItemQueryY,
      getSize: getItemSizeY,
      stickyIndices,
      stickyStart: stickyStartY + paddingStartY,
      stickyEnd: stickyEndY + paddingEndY,
    });
    targetY = res.target + itemsStartVirtualY;
    itemHeight = res.itemSize;
    effectiveAlignY = res.effectiveAlign;
  }

  // X calculation
  if (colIndex != null) {
    const isGrid = direction === 'both';
    const isHorizontal = direction === 'horizontal';
    const res = calculateAxisTarget({
      index: colIndex,
      align: alignX as ScrollAlignment,
      viewSize: viewportWidth,
      scrollPos: relativeScrollX,
      fixedSize: isGrid ? fixedWidth : fixedSize,
      gap: (isGrid || isHorizontal) ? columnGap : gap,
      query: isGrid ? getColumnQuery : getItemQueryX,
      getSize: isGrid ? getColumnSize : getItemSizeX,
      stickyIndices,
      stickyStart: stickyStartX + paddingStartX,
      stickyEnd: stickyEndX + paddingEndX,
    });
    targetX = res.target + itemsStartVirtualX;
    itemWidth = res.itemSize;
    effectiveAlignX = res.effectiveAlign;
  }

  targetX = Math.max(0, Math.min(targetX, maxTargetX));
  targetY = Math.max(0, Math.min(targetY, maxTargetY));

  return { targetX, targetY, itemWidth, itemHeight, effectiveAlignX, effectiveAlignY };
}

/**
 * Calculates the range of items to render based on scroll position and viewport size.
 *
 * @param params - Range parameters.
 * @param params.direction - Scroll direction.
 * @param params.relativeScrollX - Virtual horizontal position (VU).
 * @param params.relativeScrollY - Virtual vertical position (VU).
 * @param params.usableWidth - Usable viewport width (VU).
 * @param params.usableHeight - Usable viewport height (VU).
 * @param params.itemsLength - Total item count.
 * @param params.bufferBefore - Buffer items before.
 * @param params.bufferAfter - Buffer items after.
 * @param params.gap - Item gap (VU).
 * @param params.columnGap - Column gap (VU).
 * @param params.fixedSize - Fixed item size (VU).
 * @param params.findLowerBoundY - Resolver for vertical index.
 * @param params.findLowerBoundX - Resolver for horizontal index.
 * @param params.queryY - Resolver for vertical offset (VU).
 * @param params.queryX - Resolver for horizontal offset (VU).
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
 * @param params - Column range parameters.
 * @param params.columnCount - Total column count.
 * @param params.relativeScrollX - Virtual horizontal position (VU).
 * @param params.usableWidth - Usable viewport width (VU).
 * @param params.colBuffer - Column buffer size.
 * @param params.fixedWidth - Fixed column width (VU).
 * @param params.columnGap - Column gap (VU).
 * @param params.findLowerBound - Resolver for column index.
 * @param params.query - Resolver for column offset (VU).
 * @param params.totalColsQuery - Resolver for total width (VU).
 * @returns The start and end indices and paddings for columns (VU).
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

  const safeStart = start;
  const safeEnd = end;

  const padStart = fixedWidth !== null ? safeStart * (fixedWidth + columnGap) : query(safeStart);
  const totalWidth = fixedWidth !== null ? columnCount * (fixedWidth + columnGap) - columnGap : Math.max(0, totalColsQuery() - columnGap);

  const contentEnd = fixedWidth !== null
    ? (safeEnd * (fixedWidth + columnGap) - (safeEnd > 0 ? columnGap : 0))
    : (query(safeEnd) - (safeEnd > 0 ? columnGap : 0));

  return {
    start: safeStart,
    end: safeEnd,
    padStart,
    padEnd: Math.max(0, totalWidth - contentEnd),
  };
}

/**
 * Calculates the sticky state and offset for a single item.
 *
 * @param params - Sticky item parameters.
 * @param params.index - Item index.
 * @param params.isSticky - If configured as sticky.
 * @param params.direction - Scroll direction.
 * @param params.relativeScrollX - Virtual horizontal position (VU).
 * @param params.relativeScrollY - Virtual vertical position (VU).
 * @param params.originalX - Virtual original X position (VU).
 * @param params.originalY - Virtual original Y position (VU).
 * @param params.width - Virtual item width (VU).
 * @param params.height - Virtual item height (VU).
 * @param params.stickyIndices - All sticky indices.
 * @param params.fixedSize - Fixed item size (VU).
 * @param params.gap - Item gap (VU).
 * @param params.columnGap - Column gap (VU).
 * @param params.getItemQueryY - Resolver for vertical offset (VU).
 * @param params.getItemQueryX - Resolver for horizontal offset (VU).
 * @returns Sticky state and offset (VU).
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
  gap,
  columnGap,
  getItemQueryY,
  getItemQueryX,
}: StickyParams) {
  let isStickyActiveX = false;
  let isStickyActiveY = false;
  const stickyOffset = { x: 0, y: 0 };

  if (!isSticky) {
    return { isStickyActiveX, isStickyActiveY, isStickyActive: false, stickyOffset };
  }

  // Y Axis (Sticky Rows)
  if (direction === 'vertical' || direction === 'both') {
    const res = calculateAxisSticky(
      relativeScrollY,
      originalY,
      height,
      index,
      stickyIndices,
      (nextIdx) => (fixedSize !== null ? nextIdx * (fixedSize + gap) : getItemQueryY(nextIdx)),
    );
    isStickyActiveY = res.isActive;
    stickyOffset.y = res.offset;
  }

  // X Axis (Sticky Columns / Items)
  if (direction === 'horizontal') {
    const res = calculateAxisSticky(
      relativeScrollX,
      originalX,
      width,
      index,
      stickyIndices,
      (nextIdx) => (fixedSize !== null ? nextIdx * (fixedSize + columnGap) : getItemQueryX(nextIdx)),
    );

    if (res.isActive) {
      isStickyActiveX = true;
      stickyOffset.x = res.offset;
    }
  }

  return {
    isStickyActiveX,
    isStickyActiveY,
    isStickyActive: isStickyActiveX || isStickyActiveY,
    stickyOffset,
  };
}

/**
 * Calculates the position and size of a single item.
 *
 * @param params - Item position parameters.
 * @param params.index - Item index.
 * @param params.direction - Scroll direction.
 * @param params.fixedSize - Fixed item size (VU).
 * @param params.gap - Item gap (VU).
 * @param params.columnGap - Column gap (VU).
 * @param params.usableWidth - Usable viewport width (VU).
 * @param params.usableHeight - Usable viewport height (VU).
 * @param params.totalWidth - Total estimated width (VU).
 * @param params.queryY - Resolver for vertical offset (VU).
 * @param params.queryX - Resolver for horizontal offset (VU).
 * @param params.getSizeY - Resolver for height (VU).
 * @param params.getSizeX - Resolver for width (VU).
 * @param params.columnRange - Current column range (for grid mode).
 * @returns Item position and size (VU).
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
  columnRange,
}: ItemPositionParams) {
  let x = 0;
  let y = 0;
  let width = 0;
  let height = 0;

  if (direction === 'horizontal') {
    x = fixedSize !== null ? index * (fixedSize + columnGap) : queryX(index);
    width = fixedSize !== null ? fixedSize : getSizeX(index) - columnGap;
    height = usableHeight;
  } else if (direction === 'both' && columnRange) {
    y = fixedSize !== null ? index * (fixedSize + gap) : queryY(index);
    height = fixedSize !== null ? fixedSize : getSizeY(index) - gap;
    x = columnRange.padStart;
    width = Math.max(0, totalWidth - columnRange.padStart - columnRange.padEnd);
  } else {
    y = fixedSize !== null ? index * (fixedSize + gap) : queryY(index);
    height = fixedSize !== null ? fixedSize : getSizeY(index) - gap;
    width = direction === 'both' ? totalWidth : usableWidth;
  }

  return { height, width, x, y };
}

/**
 * Calculates the style object for a rendered item.
 *
 * @param params - Item style parameters.
 * @param params.item - Rendered item state.
 * @param params.direction - Scroll direction.
 * @param params.itemSize - Virtual item size (VU).
 * @param params.containerTag - Container HTML tag.
 * @param params.paddingStartX - Horizontal virtual padding (DU).
 * @param params.paddingStartY - Vertical virtual padding (DU).
 * @param params.isHydrated - If mounted and hydrated.
 * @param params.isRtl - If in RTL mode.
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
  isRtl,
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
    const isStickingVertically = item.isStickyActiveY ?? (item.isStickyActive && (isVertical || isBoth));
    const isStickingHorizontally = item.isStickyActiveX ?? (item.isStickyActive && isHorizontal);

    const tx = isRtl
      ? -(isStickingHorizontally ? item.stickyOffset.x : item.offset.x)
      : (isStickingHorizontally ? item.stickyOffset.x : item.offset.x);
    const ty = isStickingVertically ? item.stickyOffset.y : item.offset.y;

    if (item.isStickyActive || item.isStickyActiveX || item.isStickyActiveY) {
      style.insetBlockStart = isStickingVertically ? `${ paddingStartY }px` : 'auto';
      style.insetInlineStart = isStickingHorizontally ? `${ paddingStartX }px` : 'auto';
      style.transform = `translate(${ tx }px, ${ ty }px)`;
    } else {
      style.transform = `translate(${ tx }px, ${ item.offset.y }px)`;
    }
  }

  return style;
}

/**
 * Calculates the SSR offsets for items based on the configured SSR range and direction.
 *
 * @param direction - Scroll direction.
 * @param ssrRange - SSR configuration.
 * @param fixedItemSize - Fixed item size (VU).
 * @param fixedColumnWidth - Fixed column width (VU).
 * @param gap - Item gap (VU).
 * @param columnGap - Column gap (VU).
 * @param queryY - Resolver for vertical offset (VU).
 * @param queryX - Resolver for horizontal offset (VU).
 * @param queryColumn - Resolver for column offset (VU).
 * @returns Offset X and Y (VU).
 */
export function calculateSSROffsets(
  direction: ScrollDirection,
  ssrRange: SSRRange,
  fixedItemSize: number | null,
  fixedColumnWidth: number | null,
  gap: number,
  columnGap: number,
  queryY: (index: number) => number,
  queryX: (index: number) => number,
  queryColumn: (index: number) => number,
): { x: number; y: number; } {
  const ssrStartRow = ssrRange.start || 0;
  const ssrStartCol = ssrRange.colStart || 0;

  let x = 0;
  const y = (direction !== 'horizontal')
    ? calculateOffsetAt(ssrStartRow, fixedItemSize, gap, queryY)
    : 0;

  if (direction === 'horizontal') {
    x = calculateOffsetAt(ssrStartCol, fixedItemSize, columnGap, queryX);
  } else if (direction === 'both') {
    x = calculateOffsetAt(ssrStartCol, fixedColumnWidth, columnGap, queryColumn);
  }

  return { x, y };
}

/**
 * Detects how many items were prepended to the list based on item identity.
 *
 * @param oldItems - Previous items list.
 * @param newItems - Current items list.
 * @returns Number of prepended items.
 */
export function calculatePrependCount<T>(oldItems: T[], newItems: T[]): number {
  if (oldItems.length === 0 || newItems.length <= oldItems.length) {
    return 0;
  }
  const oldFirstItem = oldItems[ 0 ];
  if (oldFirstItem === undefined) {
    return 0;
  }
  const limit = newItems.length - oldItems.length;
  for (let i = 1; i <= limit; i++) {
    if (newItems[ i ] === oldFirstItem) {
      return i;
    }
  }
  return 0;
}

/**
 * Calculates the total width and height of the virtualized content.
 *
 * @param params - Total size parameters.
 * @param params.direction - Scroll direction.
 * @param params.itemsLength - Total item count.
 * @param params.columnCount - Column count.
 * @param params.fixedSize - Fixed item size (VU).
 * @param params.fixedWidth - Fixed column width (VU).
 * @param params.gap - Item gap (VU).
 * @param params.columnGap - Column gap (VU).
 * @param params.usableWidth - Usable viewport width (VU).
 * @param params.usableHeight - Usable viewport height (VU).
 * @param params.queryY - Resolver for vertical offset (VU).
 * @param params.queryX - Resolver for horizontal offset (VU).
 * @param params.queryColumn - Resolver for column offset (VU).
 * @returns Total width and height (VU).
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
  const isBoth = direction === 'both';
  const isHorizontal = direction === 'horizontal';

  let width = 0;
  let height = 0;

  if (isBoth) {
    width = calculateAxisSize(columnCount, fixedWidth, columnGap, queryColumn);
    height = calculateAxisSize(itemsLength, fixedSize, gap, queryY);
  } else if (isHorizontal) {
    width = calculateAxisSize(itemsLength, fixedSize, columnGap, queryX);
    height = usableHeight;
  } else {
    width = usableWidth;
    height = calculateAxisSize(itemsLength, fixedSize, gap, queryY);
  }

  return {
    width: isBoth ? Math.max(width, usableWidth) : width,
    height: isBoth ? Math.max(height, usableHeight) : height,
  };
}

/**
 * Calculates the next step in an inertia animation.
 *
 * @param velocity - Current velocity.
 * @param velocity.x - Horizontal velocity.
 * @param velocity.y - Vertical velocity.
 * @param friction - Friction coefficient (0-1).
 * @param frameTime - Time elapsed since last frame in ms (default 16ms).
 * @returns Next velocity and distance to move.
 */
export function calculateInertiaStep(
  velocity: { x: number; y: number; },
  friction: number,
  frameTime: number = 16,
) {
  const nextVelocity = {
    x: velocity.x * friction,
    y: velocity.y * friction,
  };

  return {
    nextVelocity,
    delta: {
      x: nextVelocity.x * frameTime,
      y: nextVelocity.y * frameTime,
    },
  };
}

/**
 * Calculates instantaneous velocity from position change.
 *
 * @param lastPos - Previous position.
 * @param lastPos.x - Horizontal position.
 * @param lastPos.y - Vertical position.
 * @param currentPos - Current position.
 * @param currentPos.x - Horizontal position.
 * @param currentPos.y - Vertical position.
 * @param dt - Time delta in ms.
 * @returns Calculated velocity {x, y}.
 */
export function calculateInstantaneousVelocity(
  lastPos: { x: number; y: number; },
  currentPos: { x: number; y: number; },
  dt: number,
) {
  if (dt <= 0) {
    return { x: 0, y: 0 };
  }
  return {
    x: (lastPos.x - currentPos.x) / dt,
    y: (lastPos.y - currentPos.y) / dt,
  };
}

/**
 * Resolves the target index and alignment for snapping on a single axis.
 *
 * @param mode - The snap mode ('start', 'center', 'end', 'auto').
 * @param dir - The scroll direction on this axis.
 * @param currentIdx - The current first visible index.
 * @param currentEndIdx - The current last visible index.
 * @param relScroll - The current virtual scroll offset.
 * @param viewSize - The viewport dimension.
 * @param count - Total number of items/columns.
 * @param getSize - Resolver for item size.
 * @param getQuery - Resolver for item prefix sum.
 * @param getIndexAt - Resolver for index at a virtual offset.
 * @returns Snap result or null.
 */
export function resolveSnap(
  mode: SnapMode,
  dir: 'start' | 'end' | null,
  currentIdx: number,
  currentEndIdx: number,
  relScroll: number,
  viewSize: number,
  count: number,
  getSize: (i: number) => number,
  getQuery: (i: number) => number,
  getIndexAt: (o: number) => number,
): SnapResult | null {
  let effectiveMode = mode;
  if (mode === 'auto') {
    if (dir === 'start') {
      effectiveMode = 'end';
    } else if (dir === 'end') {
      effectiveMode = 'start';
    } else {
      return null;
    }
  }

  if (effectiveMode === 'start') {
    const size = getSize(currentIdx);
    // Ignore items larger than viewport to prevent jarring jumps
    if (size > viewSize) {
      return null;
    }
    const visibleAmount = getQuery(currentIdx) + size - relScroll;
    return {
      index: Math.min(count - 1, visibleAmount / size >= 0.5 ? currentIdx : currentIdx + 1),
      align: 'start' as const,
    };
  }
  if (effectiveMode === 'end') {
    const size = getSize(currentEndIdx);
    if (size > viewSize) {
      return null;
    }
    const visibleAmount = relScroll + viewSize - getQuery(currentEndIdx);
    return {
      index: Math.max(0, visibleAmount / size >= 0.5 ? currentEndIdx : currentEndIdx - 1),
      align: 'end' as const,
    };
  }
  if (effectiveMode === 'center') {
    const center = relScroll + viewSize / 2;
    const idx = Math.max(0, Math.min(count - 1, getIndexAt(center)));
    const size = getSize(idx);
    if (size > viewSize) {
      return null;
    }
    return { index: idx, align: 'center' as const };
  }
  return null;
}

/**
 * Helper to get the index at a virtual offset.
 *
 * @param offset - Virtual offset.
 * @param fixedSize - Fixed size if any.
 * @param gap - Gap size.
 * @param findLowerBound - Binary search resolver.
 * @returns Index at offset.
 */
export function calculateIndexAt(
  offset: number,
  fixedSize: number | null,
  gap: number,
  findLowerBound: (offset: number) => number,
): number {
  const step = (fixedSize || 0) + gap;
  if (fixedSize !== null && step > 0) {
    return Math.floor(offset / step);
  }
  return findLowerBound(offset);
}
