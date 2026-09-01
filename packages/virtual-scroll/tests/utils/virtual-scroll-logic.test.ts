import type { RenderedItem } from '../../src/types';

import { describe, expect, it } from 'vitest';

import { BROWSER_MAX_SIZE } from '../../src/utils/scroll';
import {
  calculateAxisSize,
  calculateColumnRange,
  calculateInertiaStep,
  calculateInstantaneousVelocity,
  calculateItemPosition,
  calculateItemStyle,
  calculateOffsetAt,
  calculatePrependCount,
  calculateRange,
  calculateRangeSize,
  calculateScale,
  calculateScrollTarget,
  calculateSSROffsets,
  calculateStickyItem,
  calculateTotalSize,
  displayToVirtual,
  isItemVisible,
  resolveSnap,
  virtualToDisplay,
} from '../../src/utils/virtual-scroll-logic';

describe('virtual-scroll-logic', () => {
  describe('calculate total size', () => {
    it('calculates vertical total size with fixed size', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 10,
        itemsLength: 100,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      // 50 * 100 + 10 * 99
      expect(result.height).toBe(5990);
      expect(result.width).toBe(500);
    });

    it('calculates vertical total size with dynamic sizes', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 5,
        itemsLength: 10,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: (idx) => idx * 45,
        usableHeight: 500,
        usableWidth: 500,
      });
      // 45 * 10 - 5 (gap after last item)
      expect(result.height).toBe(445);
      expect(result.width).toBe(500);
    });

    it('calculates horizontal total size with fixed size', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        itemsLength: 100,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.width).toBe(5990);
      expect(result.height).toBe(500);
    });

    it('calculates horizontal total size with dynamic sizes', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        itemsLength: 100,
        queryColumn: () => 0,
        queryX: (idx) => idx * 60,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.width).toBe(5990);
      expect(result.height).toBe(500);
    });

    it('calculates grid (both) total size with fixed sizes', () => {
      const result = calculateTotalSize({
        columnCount: 5,
        columnGap: 5,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: 100,
        gap: 10,
        itemsLength: 100,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(5990);
      expect(result.width).toBe(520);
    });

    it('calculates grid (both) total size with fixed row size and dynamic column width', () => {
      const result = calculateTotalSize({
        columnCount: 5,
        columnGap: 5,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: null,
        gap: 10,
        itemsLength: 100,
        queryColumn: (idx) => idx * 105,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(5990);
      expect(result.width).toBe(520);
    });

    it('calculates grid (both) total size with dynamic sizes', () => {
      const result = calculateTotalSize({
        columnCount: 5,
        columnGap: 5,
        direction: 'both',
        fixedSize: null,
        fixedWidth: null,
        gap: 10,
        itemsLength: 100,
        queryColumn: (idx) => idx * 105,
        queryX: () => 0,
        queryY: (idx) => idx * 60,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(5990);
      expect(result.width).toBe(520);
    });

    it('calculates total sizes for single item (both, fixed rows, fixed cols)', () => {
      const result = calculateTotalSize({
        columnCount: 1,
        columnGap: 10,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: 100,
        gap: 10,
        itemsLength: 1,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(500);
      expect(result.width).toBe(500);
    });

    it('calculates total width for single item (horizontal, fixed size)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        itemsLength: 1,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.width).toBe(50);
    });

    it('calculates total width for single item (horizontal, dynamic size)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        itemsLength: 1,
        queryColumn: () => 0,
        queryX: (idx) => idx * 60,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.width).toBe(50);
    });

    it('calculates total height for single item (vertical, dynamic size)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 10,
        itemsLength: 1,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: (idx) => idx * 60,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(50);
    });

    it('calculates total height for single small item (vertical, dynamic size, itemslength 1)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 10,
        itemsLength: 1,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: (idx) => (idx === 0 ? 0 : 5),
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(0);
    });

    it('calculates total width for single small item (horizontal, dynamic size, itemslength 1)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        itemsLength: 1,
        queryColumn: () => 0,
        queryX: (idx) => (idx === 0 ? 0 : 5),
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.width).toBe(0);
    });

    it('calculates total height for single item (both, dynamic size, queryy)', () => {
      const result = calculateTotalSize({
        columnCount: 1,
        columnGap: 10,
        direction: 'both',
        fixedSize: null,
        fixedWidth: null,
        gap: 10,
        itemsLength: 1,
        queryColumn: (idx) => (idx === 0 ? 0 : 110),
        queryX: () => 0,
        queryY: (idx) => (idx === 0 ? 0 : 60),
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(500);
      expect(result.width).toBe(500);
    });

    it('calculates total height for single item (both, fixed rows, dynamic cols)', () => {
      const result = calculateTotalSize({
        columnCount: 1,
        columnGap: 10,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: null,
        gap: 10,
        itemsLength: 1,
        queryColumn: (idx) => (idx === 0 ? 0 : 110),
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(500);
      expect(result.width).toBe(500);
    });

    it('returns viewport size for empty items with fixed sizes (both)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: 100,
        gap: 10,
        itemsLength: 0,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(500);
      expect(result.width).toBe(500);
    });

    it('returns viewport size for empty items with dynamic sizes (both)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'both',
        fixedSize: null,
        fixedWidth: null,
        gap: 10,
        itemsLength: 0,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(500);
      expect(result.width).toBe(500);
    });

    it('returns 0 for empty items with fixed sizes (horizontal)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        itemsLength: 0,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.width).toBe(0);
    });

    it('returns 0 for empty items with fixed sizes (vertical)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 10,
        itemsLength: 0,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(0);
    });

    it('returns 0 for empty items with dynamic sizes (horizontal)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        itemsLength: 0,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.width).toBe(0);
    });

    it('returns 0 for empty items with dynamic sizes (vertical)', () => {
      const result = calculateTotalSize({
        columnCount: 0,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 10,
        itemsLength: 0,
        queryColumn: () => 0,
        queryX: () => 0,
        queryY: () => 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.height).toBe(0);
    });
  });

  describe('calculateAxisSize and calculateRangeSize', () => {
    it('handles empty or negative count in calculateAxisSize', () => {
      expect(calculateAxisSize(0, 50, 10, () => 50)).toBe(0);
      expect(calculateAxisSize(-1, 50, 10, () => 50)).toBe(0);
    });

    it('handles empty or inverse range in calculateRangeSize', () => {
      expect(calculateRangeSize(10, 10, 50, 10, () => 500)).toBe(0);
      expect(calculateRangeSize(10, 5, 50, 10, () => 500)).toBe(0);
    });
  });

  describe('calculateOffsetAt', () => {
    it('handles fixed and dynamic size cases', () => {
      expect(calculateOffsetAt(5, 50, 10, () => 0)).toBe(5 * (50 + 10));
      expect(calculateOffsetAt(5, null, 10, (i) => i * 60)).toBe(5 * 60);
    });
  });

  describe('isItemVisible', () => {
    it('handles sticky offsets and large items', () => {
      // itemPos, itemSize, scrollPos, viewSize, stickyOffsetStart, stickyOffsetEnd
      expect(isItemVisible(100, 50, 0, 500, 50, 50)).toBe(true);
      expect(isItemVisible(20, 50, 0, 500, 50, 50)).toBe(false); // partially hidden by sticky header

      // item larger than usable viewport
      expect(isItemVisible(0, 1000, 0, 500, 50, 50)).toBe(true); // covering the whole viewport
    });
  });

  describe('resolveSnap', () => {
    const getSize = (i: number) => (i === 100 ? 1000 : 50);
    const getQuery = (i: number) => i * 50;
    const getIndexAt = (o: number) => Math.floor(o / 50);

    it('handles directional auto snapping', () => {
      // Toward end (start direction) -> should snap to end
      expect(resolveSnap('auto', 'start', 0, 9, 0, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 9,
        align: 'end',
      });
      // Toward start (end direction) -> should snap to start
      expect(resolveSnap('auto', 'end', 0, 9, 0, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 0,
        align: 'start',
      });
      expect(resolveSnap('auto', null, 0, 10, 0, 500, 100, getSize, getQuery, getIndexAt)).toBeNull();
    });

    it('handles center mode snapping', () => {
      expect(resolveSnap('center', null, 0, 20, 25, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 5,
        align: 'center',
      });
    });

    it('handles start mode snapping with visibility thresholds', () => {
      // Mostly visible -> stay at current
      expect(resolveSnap('start', null, 2, 12, 110, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 2,
        align: 'start',
      });
      // Less than 50% visible -> next
      expect(resolveSnap('start', null, 2, 12, 130, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 3,
        align: 'start',
      });
    });

    it('handles end mode snapping with visibility thresholds', () => {
      // relScroll 20 + viewSize 500 = 520. getQuery(10) = 500. visible = 20. size = 50. 20/50 = 0.4 < 0.5 -> prev index 9.
      expect(resolveSnap('end', null, 0, 10, 20, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 9,
        align: 'end',
      });
      // relScroll 40 + viewSize 500 = 540. visible = 40. 40/50 = 0.8 >= 0.5 -> stay at 10.
      expect(resolveSnap('end', null, 0, 10, 40, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 10,
        align: 'end',
      });
    });

    it('returns null if target item is larger than viewport', () => {
      expect(resolveSnap('start', null, 100, 110, 5000, 500, 200, getSize, getQuery, getIndexAt)).toBeNull();
      expect(resolveSnap('end', null, 90, 100, 4500, 500, 200, getSize, getQuery, getIndexAt)).toBeNull();
      expect(resolveSnap('center', null, 90, 110, 4750, 500, 200, getSize, getQuery, getIndexAt)).toBeNull();
    });
  });

  describe('calculate range', () => {
    it('calculates vertical range with dynamic size', () => {
      const result = calculateRange({
        bufferAfter: 0,
        bufferBefore: 0,
        columnGap: 0,
        direction: 'vertical',
        findLowerBoundX: () => 0,
        findLowerBoundY: (offset) => Math.floor(offset / 50),
        fixedSize: null,
        gap: 0,
        itemsLength: 100,
        queryX: () => 0,
        queryY: (idx) => idx * 50,
        relativeScrollX: 0,
        relativeScrollY: 100,
        usableHeight: 200,
        usableWidth: 500,
      });
      expect(result.start).toBe(2);
      expect(result.end).toBe(6);
    });

    it('calculates horizontal range with fixed size', () => {
      const result = calculateRange({
        bufferAfter: 0,
        bufferBefore: 0,
        columnGap: 10,
        direction: 'horizontal',
        findLowerBoundX: () => 0,
        findLowerBoundY: () => 0,
        fixedSize: 50,
        gap: 0,
        itemsLength: 100,
        queryX: () => 0,
        queryY: () => 0,
        relativeScrollX: 120,
        relativeScrollY: 0,
        usableHeight: 500,
        usableWidth: 100,
      });
      expect(result.start).toBe(2);
      expect(result.end).toBe(4);
    });

    it('calculates vertical range with fixed size', () => {
      const result = calculateRange({
        bufferAfter: 5,
        bufferBefore: 5,
        columnGap: 0,
        direction: 'vertical',
        findLowerBoundX: () => 0,
        findLowerBoundY: () => 0,
        fixedSize: 50,
        gap: 0,
        itemsLength: 1000,
        queryX: () => 0,
        queryY: () => 0,
        relativeScrollX: 0,
        relativeScrollY: 1000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.start).toBe(15);
      expect(result.end).toBe(35);
    });

    it('calculates horizontal range with dynamic size', () => {
      const result = calculateRange({
        bufferAfter: 0,
        bufferBefore: 0,
        columnGap: 0,
        direction: 'horizontal',
        findLowerBoundX: (offset) => Math.floor(offset / 50),
        findLowerBoundY: () => 0,
        fixedSize: null,
        gap: 0,
        itemsLength: 1000,
        queryX: (idx) => idx * 50,
        queryY: () => 0,
        relativeScrollX: 1000,
        relativeScrollY: 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.start).toBe(20);
      expect(result.end).toBe(30);
    });

    it('calculates horizontal range with dynamic size where end item is partially visible (edge case)', () => {
      const result = calculateRange({
        bufferAfter: 0,
        bufferBefore: 0,
        columnGap: 0,
        direction: 'horizontal',
        findLowerBoundX: (val) => val >= 200 ? 2 : (val >= 100 ? 1 : 0),
        findLowerBoundY: () => 0,
        fixedSize: null,
        gap: 0,
        itemsLength: 2,
        queryX: (idx) => idx * 100,
        queryY: () => 0,
        relativeScrollX: 0,
        relativeScrollY: 0,
        usableHeight: 500,
        usableWidth: 150,
      });
      expect(result.start).toBe(0);
      expect(result.end).toBe(2);
    });
  });

  describe('calculate scroll target', () => {
    it('calculates target for horizontal end alignment', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        getItemSizeX: () => 50,
        getItemSizeY: () => 0,
        options: 'end',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5000,
      });
      expect(result.targetX).toBe(50);
    });

    it('calculates target for grid column start alignment', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 10,
        direction: 'both',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: (idx) => idx * 110,
        getColumnSize: () => 110,
        getItemQueryX: () => 0,
        getItemQueryY: () => 0,
        getItemSizeX: () => 0,
        getItemSizeY: () => 0,
        options: { align: { x: 'start' } },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5500,
      });
      expect(result.targetX).toBe(1100);
    });

    it('calculates target for vertical start alignment with partial align in options object', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: { align: { y: 'start' } },
        relativeScrollX: 50,
        relativeScrollY: 0,
        rowIndex: 10,
        totalHeight: 5000,
        totalWidth: 5000,
      });
      expect(result.targetY).toBe(500);
      expect(result.targetX).toBe(50);
    });

    it('calculates target for horizontal start alignment with partial options object', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        getItemSizeX: () => 50,
        getItemSizeY: () => 0,
        options: { align: { x: 'start' } },
        relativeScrollX: 0,
        relativeScrollY: 50,
        rowIndex: 10,
        totalHeight: 5000,
        totalWidth: 5000,
      });
      expect(result.targetX).toBe(500);
      expect(result.targetY).toBe(50);
    });

    it('calculates target for horizontal start alignment with options object', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        getItemSizeX: () => 50,
        getItemSizeY: () => 0,
        options: { align: { x: 'start' } },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5000,
      });
      expect(result.targetX).toBe(500);
    });

    it('calculates target for vertical start alignment with dynamic size', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 10,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 60,
        getItemSizeX: () => 0,
        getItemSizeY: () => 60,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 10,
        totalHeight: 6000,
        totalWidth: 0,
      });
      expect(result.targetY).toBe(600);
      expect(result.itemHeight).toBe(50);
    });

    it('calculates target for horizontal start alignment with dynamic size', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 60,
        getItemQueryY: () => 0,
        getItemSizeX: () => 60,
        getItemSizeY: () => 0,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 6000,
      });
      expect(result.targetX).toBe(600);
      expect(result.itemWidth).toBe(50);
    });

    it('calculates target for vertical center alignment', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'center',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 20,
        totalHeight: 5000,
        totalWidth: 0,
      });
      expect(result.targetY).toBe(775);
    });

    it('calculates target when rowindex is past itemslength', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 200,
        totalHeight: 5000,
        totalWidth: 0,
      });
      expect(result.targetY).toBe(4500);
    });

    it('calculates target for grid bidirectional alignment', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: (idx) => idx * 100,
        getColumnSize: () => 100,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: { x: 'center', y: 'end' },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 20,
        totalHeight: 5000,
        totalWidth: 5000,
      });
      expect(result.targetY).toBe(550);
      expect(result.targetX).toBe(800);
    });

    it('calculates target accounting for active sticky item (vertical start alignment)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 150,
        totalHeight: 10000,
        totalWidth: 0,
        stickyIndices: [ 100 ],
      });
      expect(result.targetY).toBe(7450);
    });

    it('does not reserve the previous header space when the target itself is sticky (vertical start alignment)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 100,
        totalHeight: 10000,
        totalWidth: 0,
        stickyIndices: [ 50, 100 ],
      });
      // 100 * 50 = 5000: the header lands exactly at the top, not below the
      // previous sticky header (50) which it pushes out of view.
      expect(result.targetY).toBe(5000);
    });

    it('calculates target accounting for active sticky item (horizontal start alignment)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        getItemSizeX: () => 50,
        getItemSizeY: () => 0,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 10000,
        stickyIndices: [ 100 ],
      });
      expect(result.targetX).toBe(7450);
    });

    it('calculates target for vertical start alignment (sticky indices present but none active)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 50,
        totalHeight: 10000,
        totalWidth: 0,
        stickyIndices: [ 100 ],
      });
      expect(result.targetY).toBe(2500);
    });

    it('calculates target accounting for active sticky item (vertical start alignment, dynamic size)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 150,
        totalHeight: 10000,
        totalWidth: 0,
        stickyIndices: [ 100 ],
      });
      expect(result.targetY).toBe(7450);
    });

    it('calculates target accounting for active sticky item (vertical auto alignment, scrolling up)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 8000,
        rowIndex: 120,
        totalHeight: 10000,
        totalWidth: 0,
        stickyIndices: [ 100 ],
      });
      expect(result.targetY).toBe(5950);
    });

    it('calculates target accounting for active sticky item (grid start alignment, fixed width)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: 100,
        gap: 0,
        getColumnQuery: (idx) => idx * 100,
        getColumnSize: () => 100,
        getItemQueryX: () => 0,
        getItemQueryY: () => 0,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: { x: 'start' },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 10000,
        totalWidth: 20000,
        stickyIndices: [ 100 ],
      });
      expect(result.targetX).toBe(14900);
    });

    it('calculates target accounting for active sticky item (horizontal start alignment, dynamic size)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        getItemSizeX: () => 50,
        getItemSizeY: () => 0,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 10000,
        stickyIndices: [ 100 ],
      });
      expect(result.targetX).toBe(7450);
    });

    it('calculates target accounting for active sticky item (grid start alignment, dynamic width)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'both',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: (idx) => idx * 100,
        getColumnSize: () => 100,
        getItemQueryX: () => 0,
        getItemQueryY: () => 0,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: { x: 'start' },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 10000,
        totalWidth: 20000,
        stickyIndices: [ 100 ],
      });
      expect(result.targetX).toBe(14900);
    });

    it('calculates target accounting for active sticky item (vertical auto alignment, dynamic size)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 8000,
        rowIndex: 120,
        totalHeight: 10000,
        totalWidth: 0,
        stickyIndices: [ 100 ],
      });
      expect(result.targetY).toBe(5950);
    });

    it('calculates target for vertical auto alignment (item taller than viewport)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 1000,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 1000,
        getItemSizeX: () => 0,
        getItemSizeY: () => 1000,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 5,
        totalHeight: 10000,
        totalWidth: 0,
      });
      expect(result.targetY).toBe(5000);
    });

    it('calculates target for vertical auto alignment (sticky indices present but none active)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 8000,
        rowIndex: 50,
        totalHeight: 10000,
        totalWidth: 0,
        stickyIndices: [ 100 ],
      });
      expect(result.targetY).toBe(2500);
    });

    it('calculates target for horizontal start alignment (sticky indices present but none active)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 50,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        getItemSizeX: () => 50,
        getItemSizeY: () => 0,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 10000,
        stickyIndices: [ 100 ],
      });
      expect(result.targetX).toBe(2500);
    });

    it('calculates target for vertical auto alignment (large item already visible)', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 1000,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 1000,
        getItemSizeX: () => 0,
        getItemSizeY: () => 1000,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 200,
        rowIndex: 0,
        totalHeight: 10000,
        totalWidth: 0,
      });
      expect(result.targetY).toBe(200);
    });

    it('detects visibility correctly when under a sticky item (auto alignment)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        columnCount: 100,
        columnGap: 0,
        direction: 'vertical' as const,
        fixedSize: 100,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: (idx: number) => idx * 100,
        getColumnSize: () => 100,
        getItemQueryX: (idx: number) => idx * 100,
        getItemQueryY: (index: number) => index * 100,
        getItemSizeX: () => 100,
        getItemSizeY: () => 100,
        itemsLength: 1000,
        options: 'auto' as const,
        relativeScrollX: 0,
        relativeScrollY: 14950,
        rowIndex: 150,
        stickyIndices: [ 100 ],
        totalHeight: 120000,
        totalWidth: 10000,
        usableHeight: 800,
        usableWidth: 1000,
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(14900);
    });

    it('aligns correctly under a sticky item (start alignment)', () => {
      const getItemQueryY = (index: number) => {
        if (index <= 100) {
          return index * 120;
        }
        let sum = 12000;
        for (let i = 100; i < index; i++) {
          sum += (i % 2 === 0 ? 80 : 160);
        }
        return sum;
      };

      const getItemSizeY = (index: number) => (index % 2 === 0 ? 80 : 160);

      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 50,
        viewportWidth: 500,
        viewportHeight: 500,
        columnCount: 100,
        columnGap: 0,
        direction: 'both' as const,
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: (idx: number) => idx * 100,
        getColumnSize: () => 100,
        getItemQueryX: (idx: number) => idx * 100,
        getItemQueryY,
        getItemSizeX: () => 100,
        getItemSizeY,
        itemsLength: 1000,
        options: 'start' as const,
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 150,
        stickyIndices: [ 100, 200, 300 ],
        totalHeight: 120000,
        totalWidth: 10000,
        usableHeight: 800,
        usableWidth: 1000,
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(17920);
    });

    it('aligns to end when scrolling forward (vertical)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: null,
        options: 'auto' as const,
        itemsLength: 1000,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 800,
        totalWidth: 1000,
        totalHeight: 100000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(14600);
      expect(result.effectiveAlignY).toBe('end');
    });

    it('aligns to start when scrolling backward (vertical)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: null,
        options: 'auto' as const,
        itemsLength: 1000,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 800,
        totalWidth: 1000,
        totalHeight: 100000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 15000,
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(1000);
      expect(result.effectiveAlignY).toBe('start');
    });

    it('stays put if already visible (vertical)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: null,
        options: 'auto' as const,
        itemsLength: 1000,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 800,
        totalWidth: 1000,
        totalHeight: 100000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 14500,
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(14600);
      expect(result.effectiveAlignY).toBe('end');
    });

    it('aligns to start if partially visible at top (backward scroll effect)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: null,
        options: 'auto' as const,
        itemsLength: 1000,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 800,
        totalWidth: 1000,
        totalHeight: 100000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 15050,
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(15000);
      expect(result.effectiveAlignY).toBe('start');
    });

    it('does not account for non-sticky header (flowpaddingstarty) in scroll target calculation', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: null,
        options: 'end' as const,
        itemsLength: 100,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 1000,
        totalWidth: 1000,
        totalHeight: 10000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
        flowPaddingStartY: 150,
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(750);
    });

    it('aligns to end if partially visible at bottom (forward scroll effect)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: null,
        options: 'auto' as const,
        itemsLength: 1000,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 800,
        totalWidth: 1000,
        totalHeight: 100000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 14250,
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(14600);
      expect(result.effectiveAlignY).toBe('end');
    });

    it('aligns large item correctly when scrolling forward (minimal movement)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 150,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: null,
        options: 'auto' as const,
        itemsLength: 1000,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 500,
        totalWidth: 1000,
        totalHeight: 1000000,
        gap: 0,
        columnGap: 0,
        fixedSize: 1000,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 1000,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 1000,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(150000);
      expect(result.effectiveAlignY).toBe('start');
    });

    it('aligns large item correctly when scrolling backward (minimal movement)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 10,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: null,
        options: 'auto' as const,
        itemsLength: 1000,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 500,
        totalWidth: 1000,
        totalHeight: 1000000,
        gap: 0,
        columnGap: 0,
        fixedSize: 1000,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 100000,
        getItemSizeY: () => 1000,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 1000,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(10500);
      expect(result.effectiveAlignY).toBe('end');
    });

    it('aligns large item correctly on x axis (minimal movement)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: 150,
        options: 'auto' as const,
        itemsLength: 0,
        columnCount: 1000,
        direction: 'horizontal' as const,
        usableWidth: 500,
        usableHeight: 1000,
        totalWidth: 1000000,
        totalHeight: 1000,
        gap: 0,
        columnGap: 0,
        fixedSize: 1000,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 1000,
        getItemSizeX: () => 1000,
        getItemQueryY: () => 0,
        getItemQueryX: (idx: number) => idx * 1000,
        getColumnSize: () => 1000,
        getColumnQuery: (idx: number) => idx * 1000,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetX).toBe(150000);
      expect(result.effectiveAlignX).toBe('start');
    });

    it('aligns large item correctly on x axis scrolling backward (minimal movement)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: 10,
        options: 'auto' as const,
        itemsLength: 0,
        columnCount: 1000,
        direction: 'horizontal' as const,
        usableWidth: 500,
        usableHeight: 1000,
        totalWidth: 1000000,
        totalHeight: 1000,
        gap: 0,
        columnGap: 0,
        fixedSize: 1000,
        fixedWidth: null,
        relativeScrollX: 100000,
        relativeScrollY: 0,
        getItemSizeY: () => 1000,
        getItemSizeX: () => 1000,
        getItemQueryY: () => 0,
        getItemQueryX: (idx: number) => idx * 1000,
        getColumnSize: () => 1000,
        getColumnQuery: (idx: number) => idx * 1000,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetX).toBe(10500);
      expect(result.effectiveAlignX).toBe('end');
    });

    it('calculates target when colindex is past columncount', () => {
      const result = calculateScrollTarget({
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        colIndex: 200,
        viewportWidth: 500,
        viewportHeight: 500,
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 60,
        getItemQueryY: () => 0,
        getItemSizeX: () => 50,
        getItemSizeY: () => 0,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 6000,
      });
      expect(result.targetX).toBe(5500);
    });

    it('aligns to start when scrolling backward on x axis (horizontal)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: 10,
        options: 'auto' as const,
        itemsLength: 0,
        columnCount: 1000,
        direction: 'horizontal' as const,
        usableWidth: 1000,
        usableHeight: 800,
        totalWidth: 100000,
        totalHeight: 1000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 15000,
        relativeScrollY: 0,
        getItemSizeY: () => 1000,
        getItemSizeX: () => 100,
        getItemQueryY: () => 0,
        getItemQueryX: (idx: number) => idx * 100,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetX).toBe(1000);
      expect(result.effectiveAlignX).toBe('start');
    });

    it('aligns to end when scrolling forward on x axis (horizontal)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: 150,
        options: 'auto' as const,
        itemsLength: 0,
        columnCount: 1000,
        direction: 'horizontal' as const,
        usableWidth: 1000,
        usableHeight: 800,
        totalWidth: 100000,
        totalHeight: 1000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 1000,
        getItemSizeX: () => 100,
        getItemQueryY: () => 0,
        getItemQueryX: (idx: number) => idx * 100,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetX).toBe(14600);
      expect(result.effectiveAlignX).toBe('end');
    });

    it('stays put if colindex already visible (horizontal)', () => {
      const params = {
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: null,
        viewportWidth: 500,
        viewportHeight: 500,
        colIndex: 150,
        options: 'auto' as const,
        itemsLength: 0,
        columnCount: 1000,
        direction: 'horizontal' as const,
        usableWidth: 1000,
        usableHeight: 800,
        totalWidth: 100000,
        totalHeight: 1000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: null,
        relativeScrollX: 14500,
        relativeScrollY: 0,
        getItemSizeY: () => 1000,
        getItemSizeX: () => 100,
        getItemQueryY: () => 0,
        getItemQueryX: (idx: number) => idx * 100,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetX).toBe(14600);
      expect(result.effectiveAlignX).toBe('end');
    });

    it('handles coordinate scaling for x and y axes when content exceeds browser_max_size', () => {
      const params = {
        scaleX: 2,
        scaleY: 2,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 100,
        colIndex: 100,
        options: 'start' as const,
        itemsLength: 1000,
        columnCount: 1000,
        direction: 'both' as const,
        usableWidth: 500,
        usableHeight: 500,
        viewportWidth: 500,
        viewportHeight: 500,
        totalWidth: 30000000,
        totalHeight: 30000000,
        gap: 0,
        columnGap: 0,
        fixedSize: 50,
        fixedWidth: 50,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 50,
        getItemSizeX: () => 50,
        getItemQueryY: (idx: number) => idx * 50,
        getItemQueryX: (idx: number) => idx * 50,
        getColumnSize: () => 50,
        getColumnQuery: (idx: number) => idx * 50,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(5000);
      expect(result.targetX).toBe(5000);
    });

    it('correctly clamps targets when scaling is active', () => {
      const params = {
        scaleX: 2,
        scaleY: 2,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 1000000,
        colIndex: 1000000,
        options: 'start' as const,
        itemsLength: 1000,
        columnCount: 1000,
        direction: 'both' as const,
        usableWidth: 500,
        usableHeight: 500,
        viewportWidth: 500,
        viewportHeight: 500,
        totalWidth: 30000000,
        totalHeight: 30000000,
        gap: 0,
        columnGap: 0,
        fixedSize: 50,
        fixedWidth: 50,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 50,
        getItemSizeX: () => 50,
        getItemQueryY: (idx: number) => idx * 50,
        getItemQueryX: (idx: number) => idx * 50,
        getColumnSize: () => 50,
        getColumnQuery: (idx: number) => idx * 50,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(19999000);
      expect(result.targetX).toBe(19999000);
    });

    it('handles mixed coordinate scaling (x scaled, y not scaled)', () => {
      const params = {
        scaleX: 2,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 100,
        colIndex: 100,
        options: 'start' as const,
        itemsLength: 1000,
        columnCount: 1000,
        direction: 'both' as const,
        usableWidth: 500,
        usableHeight: 500,
        viewportWidth: 500,
        viewportHeight: 500,
        totalWidth: 30000000,
        totalHeight: 10000,
        gap: 0,
        columnGap: 0,
        fixedSize: 50,
        fixedWidth: 50,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 50,
        getItemSizeX: () => 50,
        getItemQueryY: (idx: number) => idx * 50,
        getItemQueryX: (idx: number) => idx * 50,
        getColumnSize: () => 50,
        getColumnQuery: (idx: number) => idx * 50,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetX).toBe(5000);
      expect(result.targetY).toBe(5000);
    });

    it('handles mixed coordinate scaling (y scaled, x not scaled)', () => {
      const params = {
        scaleX: 1,
        scaleY: 2,
        hostOffsetX: 0,
        hostOffsetY: 0,
        rowIndex: 100,
        colIndex: 100,
        options: 'start' as const,
        itemsLength: 1000,
        columnCount: 1000,
        direction: 'both' as const,
        usableWidth: 500,
        usableHeight: 500,
        viewportWidth: 500,
        viewportHeight: 500,
        totalWidth: 10000,
        totalHeight: 30000000,
        gap: 0,
        columnGap: 0,
        fixedSize: 50,
        fixedWidth: 50,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 50,
        getItemSizeX: () => 50,
        getItemQueryY: (idx: number) => idx * 50,
        getItemQueryX: (idx: number) => idx * 50,
        getColumnSize: () => 50,
        getColumnQuery: (idx: number) => idx * 50,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetX).toBe(5000);
      expect(result.targetY).toBe(5000);
    });
  });

  describe('calculate column range', () => {
    it('calculates column range with dynamic width and 0 columns', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 0,
        columnGap: 10,
        fixedWidth: null,
        findLowerBound: () => 0,
        query: () => 0,
        relativeScrollX: 0,
        totalColsQuery: () => 0,
        usableWidth: 200,
      });
      expect(result.padStart).toBe(0);
      expect(result.padEnd).toBe(0);
    });

    it('calculates column range with dynamic width', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 100,
        columnGap: 10,
        fixedWidth: null,
        findLowerBound: (offset) => Math.floor(offset / 110),
        query: (idx) => idx * 110,
        relativeScrollX: 220,
        totalColsQuery: () => 100 * 110,
        usableWidth: 200,
      });
      expect(result.start).toBe(2);
      expect(result.end).toBe(4);
      expect(result.padStart).toBe(220);
      expect(result.padEnd).toBe(10560);
    });

    it('calculates column range with dynamic width where safeend is 0', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 10,
        columnGap: 10,
        fixedWidth: null,
        findLowerBound: () => 0,
        query: () => 0,
        relativeScrollX: -1000,
        totalColsQuery: () => 1090,
        usableWidth: 100,
      });
      expect(result.end).toBe(0);
      expect(result.padEnd).toBe(1080);
    });

    it('calculates column range with fixed width where safeend is 0', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 10,
        columnGap: 10,
        fixedWidth: 100,
        findLowerBound: () => 0,
        query: () => 0,
        relativeScrollX: 0,
        totalColsQuery: () => 1090,
        usableWidth: 0,
      });
      expect(result.end).toBe(0);
      expect(result.padEnd).toBe(1090);
    });

    it('calculates column range with fixed width and 1 column', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 1,
        columnGap: 10,
        fixedWidth: 100,
        findLowerBound: () => 0,
        query: () => 0,
        relativeScrollX: 0,
        totalColsQuery: () => 100,
        usableWidth: 200,
      });
      expect(result.padStart).toBe(0);
      expect(result.padEnd).toBe(0);
    });

    it('calculates column range with fixed width and 0 columns', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 0,
        columnGap: 10,
        fixedWidth: 100,
        findLowerBound: () => 0,
        query: () => 0,
        relativeScrollX: 0,
        totalColsQuery: () => 0,
        usableWidth: 200,
      });
      expect(result.padStart).toBe(0);
      expect(result.padEnd).toBe(0);
    });

    it('calculates column range with fixed width', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 100,
        columnGap: 10,
        fixedWidth: 100,
        findLowerBound: () => 0,
        query: () => 0,
        relativeScrollX: 220,
        totalColsQuery: () => 100 * 110,
        usableWidth: 200,
      });
      expect(result.start).toBe(2);
      expect(result.end).toBe(4);
      expect(result.padStart).toBe(220);
      expect(result.padEnd).toBe(10560);
    });

    it('returns empty range when columncount is 0', () => {
      const result = calculateColumnRange({
        colBuffer: 2,
        columnCount: 0,
        columnGap: 0,
        fixedWidth: null,
        findLowerBound: () => 0,
        query: () => 0,
        relativeScrollX: 0,
        totalColsQuery: () => 0,
        usableWidth: 500,
      });
      expect(result.end).toBe(0);
    });

    it('calculates column range', () => {
      const result = calculateColumnRange({
        colBuffer: 2,
        columnCount: 100,
        columnGap: 0,
        fixedWidth: null,
        findLowerBound: (offset) => Math.floor(offset / 100),
        query: (idx) => idx * 100,
        relativeScrollX: 1000,
        totalColsQuery: () => 10000,
        usableWidth: 500,
      });
      expect(result.start).toBe(8);
      expect(result.end).toBe(17);
    });

    it('calculates column range reaching the end of columns', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 10,
        columnGap: 10,
        fixedWidth: 100,
        findLowerBound: () => 0,
        query: () => 0,
        relativeScrollX: 1000,
        totalColsQuery: () => 1090,
        usableWidth: 500,
      });
      expect(result.start).toBe(9);
      expect(result.end).toBe(10);
      expect(result.padStart).toBe(990);
      expect(result.padEnd).toBe(0);
    });

    it('calculates column range with dynamic width reaching the end of columns', () => {
      const result = calculateColumnRange({
        colBuffer: 0,
        columnCount: 10,
        columnGap: 10,
        fixedWidth: null,
        findLowerBound: (offset) => Math.floor(offset / 110),
        query: (idx) => idx * 110,
        relativeScrollX: 1000,
        totalColsQuery: () => 10 * 110,
        usableWidth: 500,
      });
      expect(result.start).toBe(9);
      expect(result.end).toBe(10);
      expect(result.padStart).toBe(990);
      expect(result.padEnd).toBe(0);
    });
  });

  describe('calculate item position', () => {
    it('calculates position for vertical item with fixed size', () => {
      const result = calculateItemPosition({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        gap: 10,
        getSizeX: () => 0,
        getSizeY: () => 50,
        index: 10,
        queryX: () => 0,
        queryY: () => 0,
        totalWidth: 500,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.y).toBe(600);
      expect(result.height).toBe(50);
      expect(result.width).toBe(500);
    });

    it('calculates position for vertical item with dynamic size', () => {
      const result = calculateItemPosition({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        gap: 10,
        getSizeX: () => 0,
        getSizeY: () => 60,
        index: 10,
        queryX: () => 0,
        queryY: (idx) => idx * 60,
        totalWidth: 500,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.y).toBe(600);
      expect(result.height).toBe(50);
      expect(result.width).toBe(500);
    });

    it('calculates position for horizontal item with fixed size', () => {
      const result = calculateItemPosition({
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: 50,
        gap: 0,
        getSizeX: () => 50,
        getSizeY: () => 0,
        index: 10,
        queryX: () => 0,
        queryY: () => 0,
        totalWidth: 5000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.x).toBe(600);
      expect(result.width).toBe(50);
      expect(result.height).toBe(500);
    });

    it('calculates position for horizontal item with dynamic size', () => {
      const result = calculateItemPosition({
        columnGap: 10,
        direction: 'horizontal',
        fixedSize: null,
        gap: 0,
        getSizeX: () => 60,
        getSizeY: () => 0,
        index: 10,
        queryX: (idx) => idx * 60,
        queryY: () => 0,
        totalWidth: 5000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.x).toBe(600);
      expect(result.width).toBe(50);
      expect(result.height).toBe(500);
    });

    it('calculates position for grid (both) item with dynamic size', () => {
      const result = calculateItemPosition({
        columnGap: 10,
        direction: 'both',
        fixedSize: null,
        gap: 10,
        getSizeX: () => 0,
        getSizeY: () => 60,
        index: 10,
        queryX: () => 0,
        queryY: (idx) => idx * 60,
        totalWidth: 5000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.y).toBe(600);
      expect(result.height).toBe(50);
      expect(result.width).toBe(5000);
    });
  });

  describe('calculate sticky item', () => {
    it('calculates sticky offset when pushing (vertical, dynamic size)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 0,
        relativeScrollY: 480,
        stickyIndices: [ 0, 10 ],
        width: 500,
      });
      expect(result.isStickyActive).toBe(true);
      expect(result.stickyOffset.y).toBe(-30);
    });

    it('sticks at the sticky start line before reaching the top (vertical)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 0,
        relativeScrollY: -20,
        stickyIndices: [ 0, 10 ],
        stickyStartY: 48,
        width: 500,
      });
      // The item is caught at the sticky line (48px) although its original
      // position is still below the viewport top.
      expect(result.isStickyActive).toBe(true);
      expect(result.stickyOffset.y).toBe(0);
    });

    it('pushes the previous header out while the next one approaches the sticky line (vertical, with sticky start)', () => {
      // Half-way: the next header (at 500) is 25px above the sticky line (48).
      const half = calculateStickyItem({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 0,
        relativeScrollY: 427,
        stickyIndices: [ 0, 10 ],
        stickyStartY: 48,
        width: 500,
      });
      expect(half.isStickyActive).toBe(true);
      expect(half.stickyOffset.y).toBe(-25);

      // At the sticky line the previous header is fully displaced and the
      // next one takes over.
      const locked = calculateStickyItem({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: null,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 0,
        relativeScrollY: 452, // next sticky (500) minus the 48px sticky line
        stickyIndices: [ 0, 10 ],
        stickyStartY: 48,
        width: 500,
      });
      expect(locked.isStickyActive).toBe(false);
    });

    it('calculates sticky offset when pushing (horizontal, fixed size)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        height: 500,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 480,
        relativeScrollY: 0,
        stickyIndices: [ 0, 10 ],
        width: 50,
      });
      expect(result.isStickyActive).toBe(true);
      expect(result.stickyOffset.x).toBe(-30);
    });

    it('is not sticky if scroll is before original position (horizontal)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: 100,
        gap: 0,
        getItemQueryX: (idx) => idx * 100,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 1,
        isSticky: true,
        originalX: 100,
        originalY: 0,
        relativeScrollX: 50,
        relativeScrollY: 0,
        stickyIndices: [ 1 ],
        width: 100,
      });
      expect(result.isStickyActive).toBe(false);
    });

    it('does not calculate horizontal sticky if vertical is already active in grid mode', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: 100,
        gap: 0,
        getItemQueryX: (idx) => idx * 100,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 10,
        relativeScrollY: 10,
        stickyIndices: [ 0 ],
        width: 100,
      });
      expect(result.isStickyActive).toBe(true);
      expect(result.stickyOffset.y).toBe(0);
      expect(result.stickyOffset.x).toBe(0);
    });

    it('calculates sticky active state for both directions (horizontal first)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: 100,
        gap: 0,
        getItemQueryX: (idx) => idx * 100,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 10,
        relativeScrollY: 0,
        stickyIndices: [ 0 ],
        width: 100,
      });
      expect(result.isStickyActive).toBe(true);
      expect(result.isStickyActiveX).toBe(true);
      expect(result.stickyOffset.x).toBe(0);
      expect(result.stickyOffset.y).toBe(0);
    });

    it('calculates sticky active state when past next item (grid, fixed size)', () => {
      const result = calculateStickyItem({
        columnGap: 10,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: null,
        gap: 10,
        getItemQueryX: (idx) => idx * 60,
        getItemQueryY: (idx) => idx * 60,
        height: 50,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 60,
        relativeScrollY: 0,
        stickyIndices: [ 0, 1 ],
        width: 50,
      });
      expect(result.isStickyActive).toBe(false);
    });

    it('calculates sticky active state when past next item (grid, fixed width)', () => {
      const result = calculateStickyItem({
        columnGap: 10,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: 100,
        gap: 10,
        getItemQueryX: (idx) => idx * 110,
        getItemQueryY: (idx) => idx * 60,
        height: 50,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 110,
        relativeScrollY: 0,
        stickyIndices: [ 0, 1 ],
        width: 100,
      });
      expect(result.isStickyActive).toBe(false);
    });

    it('calculates sticky active state when past next item (horizontal, fixed width)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: null,
        fixedWidth: 50,
        gap: 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        height: 500,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 600,
        relativeScrollY: 0,
        stickyIndices: [ 0, 10 ],
        width: 50,
      });
      expect(result.isStickyActive).toBe(false);
    });

    it('calculates sticky active state when past next item (horizontal, fixed size)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        height: 500,
        index: 0,
        isSticky: true,
        originalX: 0,
        originalY: 0,
        relativeScrollX: 600,
        relativeScrollY: 0,
        stickyIndices: [ 0, 10 ],
        width: 50,
      });
      expect(result.isStickyActive).toBe(false);
    });

    it('calculates sticky active state when no next sticky item (horizontal)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: (idx) => idx * 50,
        getItemQueryY: () => 0,
        height: 500,
        index: 10,
        isSticky: true,
        originalX: 500,
        originalY: 0,
        relativeScrollX: 600,
        relativeScrollY: 0,
        stickyIndices: [ 0, 10 ],
        width: 50,
      });
      expect(result.isStickyActive).toBe(true);
      expect(result.stickyOffset.x).toBe(0);
    });

    it('calculates sticky active state when no next sticky item (vertical)', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 10,
        isSticky: true,
        originalX: 0,
        originalY: 500,
        relativeScrollX: 0,
        relativeScrollY: 600,
        stickyIndices: [ 0, 10 ],
        width: 500,
      });
      expect(result.isStickyActive).toBe(true);
      expect(result.stickyOffset.y).toBe(0);
    });

    it('ensures only one sticky item is active at a time in a sequence', () => {
      const stickyIndices = [ 0, 1, 2, 3, 4 ];
      const scrollY = 75;

      const results = stickyIndices.map((idx) => calculateStickyItem({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: () => 0,
        getItemQueryY: (i) => i * 50,
        height: 50,
        index: idx,
        isSticky: true,
        originalX: 0,
        originalY: idx * 50,
        relativeScrollX: 0,
        relativeScrollY: scrollY,
        stickyIndices,
        width: 500,
      }));

      const activeIndices = results.map((r, i) => r.isStickyActive ? i : -1).filter((i) => i !== -1);
      expect(activeIndices).toEqual([ 1 ]);
    });

    it('does not make non-sticky items active sticky', () => {
      const result = calculateStickyItem({
        columnGap: 0,
        direction: 'vertical',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        height: 50,
        index: 5,
        isSticky: false,
        originalX: 0,
        originalY: 250,
        relativeScrollX: 0,
        relativeScrollY: 300,
        stickyIndices: [ 0, 10 ],
        width: 500,
      });
      expect(result.isStickyActive).toBe(false);
    });
  });

  describe('calculate item style', () => {
    it('calculates style for table container', () => {
      const result = calculateItemStyle({
        containerTag: 'table',
        direction: 'vertical',
        isHydrated: true,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: false,
          offset: { x: 0, y: 600 },
          size: { height: 50, width: 500 },
          stickyOffset: { x: 0, y: 0 },
        } as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 0,
        paddingStartY: 0,
      });
      expect(result.minInlineSize).toBe('100%');
    });

    it('calculates style for dynamic item size', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'vertical',
        isHydrated: true,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: false,
          offset: { x: 0, y: 600 },
          size: { height: 50, width: 500 },
          stickyOffset: { x: 0, y: 0 },
        } as RenderedItem<unknown>,
        itemSize: 0,
        paddingStartX: 0,
        paddingStartY: 0,
      });
      expect(result.blockSize).toBe('auto');
      expect(result.minBlockSize).toBe('1px');
    });

    it('calculates style for dynamic item size (horizontal)', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'horizontal',
        isHydrated: true,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: false,
          offset: { x: 600, y: 0 },
          size: { height: 500, width: 50 },
          stickyOffset: { x: 0, y: 0 },
        } as RenderedItem<unknown>,
        itemSize: 0,
        paddingStartX: 0,
        paddingStartY: 0,
      });
      expect(result.inlineSize).toBe('auto');
      expect(result.minInlineSize).toBe('1px');
    });

    it('calculates style for sticky item (vertical only)', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'vertical',
        isHydrated: true,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: true,
          offset: { x: 0, y: 600 },
          size: { height: 50, width: 500 },
          stickyOffset: { x: 0, y: -10 },
        } as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 10,
        paddingStartY: 10,
      });
      expect(result.insetBlockStart).toBe('10px');
      expect(result.insetInlineStart).toBe('auto');
    });

    it('calculates style for sticky item (grid both directions)', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'both',
        isHydrated: true,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: true,
          isStickyActiveX: true,
          isStickyActiveY: true,
          offset: { x: 600, y: 600 },
          size: { height: 50, width: 50 },
          stickyOffset: { x: -10, y: -10 },
        } as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 10,
        paddingStartY: 10,
      });
      expect(result.insetBlockStart).toBe('10px');
      expect(result.insetInlineStart).toBe('10px');
    });

    it('calculates style for sticky item (grid)', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'both',
        isHydrated: true,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: true,
          isStickyActiveX: true,
          isStickyActiveY: true,
          offset: { x: 600, y: 600 },
          size: { height: 50, width: 50 },
          stickyOffset: { x: -10, y: -10 },
        } as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 10,
        paddingStartY: 10,
      });
      expect(result.insetBlockStart).toBe('10px');
      expect(result.insetInlineStart).toBe('10px');
      expect(result.transform).toBe('translate(-10px, -10px)');
    });
    it('calculates style for non-hydrated item', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'vertical',
        isHydrated: false,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: false,
          offset: { x: 0, y: 600 },
          size: { height: 50, width: 500 },
          stickyOffset: { x: 0, y: 0 },
        } as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 0,
        paddingStartY: 0,
      });
      expect(result.transform).toBeUndefined();
    });

    it('calculates style for sticky item (horizontal)', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'horizontal',
        isHydrated: true,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: true,
          offset: { x: 600, y: 0 },
          size: { height: 500, width: 50 },
          stickyOffset: { x: -10, y: 0 },
        } as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 10,
        paddingStartY: 10,
      });
      expect(result.insetInlineStart).toBe('10px');
      expect(result.transform).toBe('translate(-10px, 0px)');
    });

    it('calculates style for sticky item with padding', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'both',
        isHydrated: true,
        isRtl: false,
        item: {
          index: 10,
          isStickyActive: true,
          isStickyActiveX: true,
          isStickyActiveY: true,
          offset: { x: 600, y: 600 },
          size: { height: 50, width: 50 },
          stickyOffset: { x: -10, y: -20 },
        } as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 10,
        paddingStartY: 20,
      });
      expect(result.insetBlockStart).toBe('20px');
      expect(result.insetInlineStart).toBe('10px');
      expect(result.transform).toBe('translate(-10px, -20px)');
    });
    it('correctly inverts transform in rtl mode', () => {
      const item: RenderedItem = {
        index: 0,
        item: {},
        offset: { x: 100, y: 200 },
        originalX: 100,
        originalY: 200,
        size: { height: 50, width: 100 },
        stickyOffset: { x: 10, y: 20 },
      };

      // LTR
      let result = calculateItemStyle({
        containerTag: 'div',
        direction: 'vertical',
        isHydrated: true,
        isRtl: false,
        item,
        itemSize: 50,
        paddingStartX: 0,
        paddingStartY: 0,
      });
      expect(result.transform).toBe('translate(100px, 200px)');

      // RTL
      result = calculateItemStyle({
        containerTag: 'div',
        direction: 'vertical',
        isHydrated: true,
        isRtl: true,
        item,
        itemSize: 50,
        paddingStartX: 0,
        paddingStartY: 0,
      });
      expect(result.transform).toBe('translate(-100px, 200px)');

      // RTL sticky
      result = calculateItemStyle({
        containerTag: 'div',
        direction: 'vertical',
        isHydrated: true,
        isRtl: true,
        item: { ...item, isStickyActive: true },
        itemSize: 50,
        paddingStartX: 0,
        paddingStartY: 0,
      });
      expect(result.transform).toBe('translate(-100px, 20px)');

      result = calculateItemStyle({
        containerTag: 'div',
        direction: 'horizontal',
        isHydrated: true,
        isRtl: true,
        item: { ...item, isStickyActive: true },
        itemSize: 50,
        paddingStartX: 0,
        paddingStartY: 0,
      });

      expect(result.transform).toBe('translate(-10px, 200px)');
    });

    it('maintains 1:1 movement even when scale is high', () => {
      const item: RenderedItem<unknown> = {
        index: 100,
        isSticky: false,
        isStickyActive: false,
        item: {},
        offset: { x: 0, y: 600 },
        originalX: 0,
        originalY: 5100,
        size: { height: 50, width: 100 },
        stickyOffset: { x: 0, y: 0 },
      };

      const style = calculateItemStyle({
        containerTag: 'div',
        direction: 'vertical',
        isHydrated: true,
        isRtl: false,
        item,
        itemSize: 50,
        paddingStartX: 0,
        paddingStartY: 0,
      });

      expect(style.transform).toBe('translate(0px, 600px)');
    });
  });

  describe('coordinate mapping', () => {
    it('maps display pixels to virtual coordinates correctly', () => {
      // displayPos, hostOffset, scale
      expect(displayToVirtual(100, 10, 2)).toBe(180); // (100 - 10) * 2
    });

    it('maps virtual coordinates to display pixels correctly', () => {
      // virtualPos, hostOffset, scale
      expect(virtualToDisplay(180, 10, 2)).toBe(100); // 180 / 2 + 10
    });
  });

  describe('additional utility coverage', () => {
    it('handles gap subtraction in calculateRangeSize', () => {
      // start, end, fixedSize, gap, query
      expect(calculateRangeSize(0, 10, null, 10, (i) => i * 60)).toBe(590);
    });

    it('handles horizontal SSR offsets', () => {
      const offsets = calculateSSROffsets(
        'horizontal',
        { start: 0, end: 10, colStart: 5, colEnd: 10 },
        null,
        null,
        10,
        10,
        () => 0,
        (i) => i * 60,
        () => 0,
      );
      expect(offsets.x).toBe(300);
    });

    it('handles both direction SSR offsets', () => {
      const offsets = calculateSSROffsets(
        'both',
        { start: 10, end: 20, colStart: 5, colEnd: 10 },
        null,
        null,
        10,
        10,
        (i) => i * 60,
        () => 0,
        (i) => i * 120,
      );
      expect(offsets.y).toBe(600);
      expect(offsets.x).toBe(600);
    });

    it('detects prepend count correctly', () => {
      expect(calculatePrependCount([], [ 1, 2 ])).toBe(0);
      const items = [ { id: 1 } ];
      expect(calculatePrependCount(items, [ { id: 2 }, items[ 0 ] ])).toBe(1);

      // Items identity check
      const obj = { id: 1 };
      expect(calculatePrependCount([ obj ], [ { id: 2 }, obj ])).toBe(1);
      expect(calculatePrependCount([ obj ], [ { id: 2 }, { id: 1 } ])).toBe(0); // different object reference
    });

    it('calculates scroll target with start alignment', () => {
      const result = calculateScrollTarget({
        rowIndex: 10,
        colIndex: 10,
        options: 'start',
        direction: 'both',
        viewportWidth: 500,
        viewportHeight: 500,
        totalWidth: 10000,
        totalHeight: 10000,
        gap: 10,
        columnGap: 10,
        fixedSize: 50,
        fixedWidth: 50,
        relativeScrollX: 0,
        relativeScrollY: 0,
        getItemSizeY: () => 50,
        getItemSizeX: () => 50,
        getItemQueryY: (i) => i * 60,
        getItemQueryX: (i) => i * 60,
        getColumnSize: () => 50,
        getColumnQuery: (i) => i * 60,
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
      });
      expect(result.targetX).toBe(600);
    });

    it('handles horizontal direction in calculateRange', () => {
      const res = calculateRange({
        direction: 'horizontal',
        relativeScrollX: 100,
        relativeScrollY: 0,
        usableWidth: 500,
        usableHeight: 500,
        itemsLength: 100,
        bufferBefore: 0,
        bufferAfter: 0,
        gap: 10,
        columnGap: 10,
        fixedSize: 50,
        findLowerBoundY: () => 0,
        findLowerBoundX: (o) => Math.floor(o / 60),
        queryY: () => 0,
        queryX: (i) => i * 60,
      });
      expect(res.start).toBe(1);
    });

    it('calculates range size with dynamic sizes (fixedSize is null)', () => {
      expect(calculateRangeSize(0, 5, null, 10, (i) => i * 100)).toBe(5 * 100 - 10);
    });

    it('calculates range size with fixed sizes', () => {
      expect(calculateRangeSize(0, 5, 100, 10, () => 0)).toBe(5 * 110 - 10);
    });

    it('handles empty oldItems in calculatePrependCount', () => {
      expect(calculatePrependCount([], [ 1, 2 ])).toBe(0);
    });

    it('returns 0 in calculatePrependCount when first old item is undefined (sparse array)', () => {
      const oldItems: (number | undefined)[] = [];
      oldItems.length = 5; // [empty x 5]
      const newItems = [ 1, ...oldItems ];
      expect(calculatePrependCount(oldItems, newItems)).toBe(0);
    });
  });

  describe('calculateInstantaneousVelocity', () => {
    it('returns zero velocity when dt is zero or negative', () => {
      expect(calculateInstantaneousVelocity({ x: 0, y: 0 }, { x: 10, y: 10 }, 0)).toEqual({ x: 0, y: 0 });
      expect(calculateInstantaneousVelocity({ x: 0, y: 0 }, { x: 10, y: 10 }, -1)).toEqual({ x: 0, y: 0 });
    });

    it('calculates velocity correctly with positive dt', () => {
      const v = calculateInstantaneousVelocity({ x: 0, y: 0 }, { x: 10, y: 20 }, 10);
      expect(v.x).toBe(-1);
      expect(v.y).toBe(-2);
    });
  });

  describe('calculateInertiaStep', () => {
    it('calculates the next inertia step correctly', () => {
      const { nextVelocity, delta } = calculateInertiaStep({ x: 10, y: 20 }, 0.95, 16);
      expect(nextVelocity.x).toBe(10 * 0.95);
      expect(nextVelocity.y).toBe(20 * 0.95);
      expect(delta.x).toBe(nextVelocity.x * 16);
      expect(delta.y).toBe(nextVelocity.y * 16);
    });

    it('uses default frameTime', () => {
      const { delta } = calculateInertiaStep({ x: 10, y: 20 }, 0.95);
      expect(delta.x).toBe(10 * 0.95 * 16);
    });
  });

  describe('snap', () => {
    it('returns null in resolveSnap for auto mode when direction is null', () => {
      expect(resolveSnap('auto', null, 0, 10, 0, 500, 100, () => 50, (i) => i * 50, (_o) => 0)).toBeNull();
    });

    it('returns null in resolveSnap for unsupported modes', () => {
      // @ts-expect-error - testing invalid mode
      expect(resolveSnap('invalid', null, 0, 10, 0, 500, 100, () => 50, (i) => i * 50, (_o) => 0)).toBeNull();
    });

    it('handles "next" mode in resolveSnap', () => {
      const getSize = () => 100;
      const getQuery = (i: number) => i * 100;
      const getIndexAt = (o: number) => Math.floor(o / 100);

      // dir 'end' -> effectiveMode 'start' -> snap to NEXT item
      expect(resolveSnap('next', 'end', 5, 10, 520, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 6,
        align: 'start',
      });

      // dir 'start' -> effectiveMode 'end' -> snap to PREVIOUS item
      expect(resolveSnap('next', 'start', 5, 10, 520, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 9,
        align: 'end',
      });

      // null dir -> returns null
      expect(resolveSnap('next', null, 5, 10, 520, 500, 100, getSize, getQuery, getIndexAt)).toBeNull();

      // item larger than viewport -> returns null
      expect(resolveSnap('next', 'end', 5, 10, 520, 50, 100, getSize, getQuery, getIndexAt)).toBeNull();
      expect(resolveSnap('next', 'start', 5, 10, 520, 50, 100, getSize, getQuery, getIndexAt)).toBeNull();
    });

    it('handles "end" mode in resolveSnap', () => {
      const getSize = () => 100;
      const getQuery = (i: number) => i * 100;
      const getIndexAt = (o: number) => Math.floor(o / 100);

      // dir 'start' -> effectiveMode 'end'
      expect(resolveSnap('end', 'start', 5, 10, 520, 500, 100, getSize, getQuery, getIndexAt)).toEqual({
        index: 9,
        align: 'end',
      });
    });

    it('returns current scrollPos in calculateAxisAlignment if item is already visible', () => {
      const result = calculateScrollTarget({
        rowIndex: 2,
        colIndex: null,
        options: 'auto',
        direction: 'vertical',
        viewportWidth: 500,
        viewportHeight: 500,
        totalWidth: 1000,
        totalHeight: 1000,
        gap: 0,
        columnGap: 0,
        fixedSize: 100,
        fixedWidth: 100,
        relativeScrollX: 0,
        relativeScrollY: 150, // item 2 is at 200-300. In viewport 150-650.
        getItemSizeY: () => 100,
        getItemSizeX: () => 100,
        getItemQueryY: (i) => i * 100,
        getItemQueryX: (i) => i * 100,
        getColumnSize: () => 100,
        getColumnQuery: (i) => i * 100,
        scaleX: 1,
        scaleY: 1,
        hostOffsetX: 0,
        hostOffsetY: 0,
      });
      expect(result.targetY).toBe(150);
    });
  });

  describe('calculateScale', () => {
    it('returns 1 for window container', () => {
      expect(calculateScale(true, 50000000, 500)).toBe(1);
    });

    it('returns 1 for small total size', () => {
      expect(calculateScale(false, 1000, 500)).toBe(1);
    });

    it('returns 1 when viewport is larger or equal to BROWSER_MAX_SIZE (fallback branch)', () => {
      // line 440: displayRange = displaySize - viewportSize
      // if viewportSize >= BROWSER_MAX_SIZE, then displayRange <= 0
      expect(calculateScale(false, BROWSER_MAX_SIZE + 1000, BROWSER_MAX_SIZE + 500)).toBe(1);
      expect(calculateScale(false, BROWSER_MAX_SIZE + 1000, BROWSER_MAX_SIZE)).toBe(1);
    });

    it('calculates correct scaling factor for large lists', () => {
      const totalSize = 20000000;
      const viewportSize = 500;
      const scale = calculateScale(false, totalSize, viewportSize);
      expect(scale).toBeGreaterThan(1);
      // realRange = 20,000,000 - 500 = 19,999,500
      // displaySize = BROWSER_MAX_SIZE = 10,000,000
      // displayRange = 10,000,000 - 500 = 9,999,500
      expect(scale).toBe(19999500 / 9999500);
    });
  });
});
