import type { RenderedItem } from '../types';

import { describe, expect, it } from 'vitest';

import {
  calculateColumnRange,
  calculateItemPosition,
  calculateItemStyle,
  calculateRange,
  calculateScrollTarget,
  calculateStickyItem,
  calculateTotalSize,
} from './virtual-scroll-logic';

describe('virtual-scroll-logic', () => {
  describe('calculateTotalSize', () => {
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
      expect(result.height).toBe(5990);
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
      expect(result.height).toBe(445);
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
      // columnCount=1 * (100 + 10) - 10 = 100.
      // itemsLength=1 * (50 + 10) - 10 = 50.
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
      // queryX(1) = 60. gap = 10. total = 60 - 10 = 50.
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
      // queryY(1) = 60. gap = 10. total = 60 - 10 = 50.
      expect(result.height).toBe(50);
    });

    it('calculates total height for single small item (vertical, dynamic size, itemsLength 1)', () => {
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

    it('calculates total width for single small item (horizontal, dynamic size, itemsLength 1)', () => {
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

    it('calculates total height for single item (both, dynamic size, queryY)', () => {
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

  describe('calculateRange', () => {
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
      // item 0: 0-50, gap 50-60
      // item 1: 60-110, gap 110-120
      // item 2: 120-170, gap 170-180
      // scroll 120 -> item 2.
      // viewport 100 -> ends at 220. item 3: 180-230.
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
      // Setup:
      // Item 0: 0-100
      // Item 1: 100-200
      // Viewport: 0-150.
      // Target end = 150.
      // findLowerBoundX(150) -> returns 1 because queryX(1)=100 <= 150, queryX(2)=200 > 150.
      // queryX(1) = 100 < 150.
      // So end should increment to 2.
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

  describe('calculateScrollTarget', () => {
    it('calculates target for horizontal end alignment', () => {
      const result = calculateScrollTarget({
        colIndex: 10,
        columnCount: 100,
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
        itemsLength: 100,
        options: 'end',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5000,
        usableHeight: 500,
        usableWidth: 500,
      });
      // item 10 at 500. ends at 550. viewport 500 -> targetX = 550 - 500 = 50.
      expect(result.targetX).toBe(50);
    });

    it('calculates target for grid column start alignment', () => {
      const result = calculateScrollTarget({
        colIndex: 10,
        columnCount: 50,
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
        itemsLength: 100,
        options: { align: { x: 'start' } },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5500,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetX).toBe(1100);
    });

    it('calculates target for vertical start alignment with partial align in options object', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 100,
        options: { align: { y: 'start' } }, // x is missing
        relativeScrollX: 50,
        relativeScrollY: 0,
        rowIndex: 10,
        totalHeight: 5000,
        totalWidth: 5000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetY).toBe(500);
      expect(result.targetX).toBe(50); // auto, already visible
    });

    it('calculates target for horizontal start alignment with partial options object', () => {
      const result = calculateScrollTarget({
        colIndex: 10,
        columnCount: 100,
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
        itemsLength: 100,
        options: { align: { x: 'start' } }, // y is missing, should default to 'auto'
        relativeScrollX: 0,
        relativeScrollY: 50,
        rowIndex: 10,
        totalHeight: 5000,
        totalWidth: 5000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetX).toBe(500);
      expect(result.targetY).toBe(50); // auto, already visible
    });

    it('calculates target for horizontal start alignment with options object', () => {
      const result = calculateScrollTarget({
        colIndex: 10,
        columnCount: 100,
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
        itemsLength: 100,
        options: { align: { x: 'start' } },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetX).toBe(500);
    });

    it('calculates target for vertical start alignment with dynamic size', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 100,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 10,
        totalHeight: 6000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetY).toBe(600);
      expect(result.itemHeight).toBe(50);
    });

    it('calculates target for horizontal start alignment with dynamic size', () => {
      const result = calculateScrollTarget({
        colIndex: 10,
        columnCount: 100,
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
        itemsLength: 100,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 6000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetX).toBe(600);
      expect(result.itemWidth).toBe(50);
    });

    it('calculates target for vertical center alignment', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 100,
        options: 'center',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 20,
        totalHeight: 5000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetY).toBe(775);
    });

    it('calculates target when rowIndex is past itemsLength', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 100,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 200,
        totalHeight: 5000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetY).toBe(4500);
    });

    it('calculates target for grid bidirectional alignment', () => {
      const result = calculateScrollTarget({
        colIndex: 10,
        columnCount: 50,
        columnGap: 0,
        direction: 'both',
        fixedSize: 50,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: (idx) => idx * 100,
        getColumnSize: (_idx) => 100,
        getItemQueryX: () => 0,
        getItemQueryY: (idx) => idx * 50,
        getItemSizeX: () => 0,
        getItemSizeY: () => 50,
        itemsLength: 100,
        options: { x: 'center', y: 'end' },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 20,
        totalHeight: 5000,
        totalWidth: 5000,
        usableHeight: 500,
        usableWidth: 500,
      });
      // rowIndex 20 -> y=1000. end align -> 1000 - (500 - 50) = 550.
      // colIndex 10 -> x=1000. center align -> 1000 - (500 - 100) / 2 = 1000 - 200 = 800.
      expect(result.targetY).toBe(550);
      expect(result.targetX).toBe(800);
    });

    it('calculates target accounting for active sticky item (vertical start alignment)', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 200,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 150,
        totalHeight: 10000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ], // Item 100 is sticky
      });
      // Item 150 is at 150 * 50 = 7500.
      // Sticky item 100 is active. Height = 50.
      // Target should be 7500 - 50 = 7450.
      expect(result.targetY).toBe(7450);
    });

    it('calculates target accounting for active sticky item (horizontal start alignment)', () => {
      const result = calculateScrollTarget({
        colIndex: 150,
        columnCount: 200,
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
        itemsLength: 200,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 10000,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ], // Item 100 is sticky
      });
      // Item 150 is at 150 * 50 = 7500.
      // Sticky item 100 is active. Width = 50.
      // Target should be 7500 - 50 = 7450.
      expect(result.targetX).toBe(7450);
    });

    it('calculates target for vertical start alignment (sticky indices present but none active)', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 200,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 50, // Target 50 (2500)
        totalHeight: 10000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ], // Sticky 100 is AFTER target 50
      });
      // Should align to 2500 without adjustment
      expect(result.targetY).toBe(2500);
    });

    it('calculates target accounting for active sticky item (vertical start alignment, dynamic size)', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 200,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 150, // Target 150 (7500)
        totalHeight: 10000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ], // Sticky 100 is active. Height 50.
      });
      // Target 7500 - 50 = 7450.
      expect(result.targetY).toBe(7450);
    });

    it('calculates target accounting for active sticky item (vertical auto alignment, scrolling up)', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 200,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 8000, // Currently at item 160 (8000)
        rowIndex: 120, // Target item 120 (6000)
        totalHeight: 10000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ], // Item 100 is sticky
      });
      // Target 120 is at 6000.
      // It is above viewport (8000). So it aligns to start.
      // Sticky item 100 is active (index < 120). Height = 50.
      // Target should be 6000 - 50 = 5950.
      expect(result.targetY).toBe(5950);
    });

    it('calculates target accounting for active sticky item (grid start alignment, fixed width)', () => {
      const result = calculateScrollTarget({
        colIndex: 150,
        columnCount: 200,
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
        itemsLength: 200,
        options: { x: 'start' },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 10000,
        totalWidth: 20000,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ], // Item 100 is sticky
      });
      // Target col 150 is at 150 * 100 = 15000.
      // Sticky item 100 is active. Width = 100.
      // Target should be 15000 - 100 = 14900.
      expect(result.targetX).toBe(14900);
    });

    it('calculates target accounting for active sticky item (horizontal start alignment, dynamic size)', () => {
      const result = calculateScrollTarget({
        colIndex: 150,
        columnCount: 200,
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
        itemsLength: 200,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 10000,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ],
      });
      // Target 150 at 7500. Sticky 100 at 5000, width 50.
      // Target = 7500 - 50 = 7450.
      expect(result.targetX).toBe(7450);
    });

    it('calculates target accounting for active sticky item (grid start alignment, dynamic width)', () => {
      const result = calculateScrollTarget({
        colIndex: 150,
        columnCount: 200,
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
        itemsLength: 200,
        options: { x: 'start' },
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 10000,
        totalWidth: 20000,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ],
      });
      expect(result.targetX).toBe(14900);
    });

    it('calculates target accounting for active sticky item (vertical auto alignment, dynamic size)', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 200,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 8000,
        rowIndex: 120,
        totalHeight: 10000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ],
      });
      expect(result.targetY).toBe(5950);
    });

    it('calculates target for vertical auto alignment (item taller than viewport)', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 10,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: 5, // Starts at 5000
        totalHeight: 10000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      // Item 5 starts at 5000, ends 6000.
      // Viewport 0-500.
      // Item > Viewport.
      // 5000 > 0 + 0.5 && 6000 >= 500 - 0.5. (Visible check for large items)
      // Actually, if it's not visible, auto align.
      // targetStart = 5000. targetEnd = 5000 - (500 - 1000) = 5500.
      // Nearest to 0 is 5000.
      expect(result.targetY).toBe(5000);
    });

    it('calculates target for vertical auto alignment (sticky indices present but none active)', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 200,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 8000,
        rowIndex: 50, // Target 50 (2500).
        totalHeight: 10000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ], // Sticky 100 is AFTER target 50.
      });
      // Should align to 2500 normally without sticky adjustment.
      expect(result.targetY).toBe(2500);
    });

    it('calculates target for horizontal start alignment (sticky indices present but none active)', () => {
      const result = calculateScrollTarget({
        colIndex: 50,
        columnCount: 200,
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
        itemsLength: 200,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 10000,
        usableHeight: 500,
        usableWidth: 500,
        stickyIndices: [ 100 ], // Sticky 100 is AFTER target 50.
      });
      // Target 50 at 2500. No sticky adjustment.
      expect(result.targetX).toBe(2500);
    });

    it('calculates target for vertical auto alignment (large item already visible)', () => {
      const result = calculateScrollTarget({
        colIndex: null,
        columnCount: 0,
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
        itemsLength: 10,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 200, // Item 0 (0-1000) covers viewport (200-700).
        rowIndex: 0,
        totalHeight: 10000,
        totalWidth: 0,
        usableHeight: 500,
        usableWidth: 500,
      });
      // Should stay at 200.
      expect(result.targetY).toBe(200);
    });

    it('detects visibility correctly when under a sticky item (auto alignment)', () => {
      const getItemQueryY = (index: number) => index * 100;
      const getItemSizeY = () => 100;

      const params = {
        colIndex: null,
        columnCount: 100,
        columnGap: 0,
        direction: 'vertical' as const,
        fixedSize: 100,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: (idx: number) => idx * 100,
        getColumnSize: () => 100,
        getItemQueryX: (idx: number) => idx * 100,
        getItemQueryY,
        getItemSizeX: () => 100,
        getItemSizeY,
        itemsLength: 1000,
        options: 'auto' as const,
        relativeScrollX: 0,
        relativeScrollY: 14950, // Row 150 is at 15000. It's at 50px from top.
        rowIndex: 150,
        stickyIndices: [ 100 ], // Sticky item at row 100 (10000), height 100.
        totalHeight: 120000,
        totalWidth: 10000,
        usableHeight: 800,
        usableWidth: 1000,
      };

      const result = calculateScrollTarget(params);

      // Row 150 starts at 15000. Viewport position = 15000 - 14950 = 50.
      // Sticky row 100 is at 0..100 in viewport.
      // Row 150 is hidden under sticky row 100.
      // Expected: detects it's covered and scrolls to 15000 - 100 = 14900.
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
        colIndex: 50,
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

      // itemY(150) = 18000.
      // activeStickyIdx = 100. stickyHeight = 80.
      // targetY = 18000 - 80 = 17920.
      expect(result.targetY).toBe(17920);
    });

    it('aligns to end when scrolling forward (vertical)', () => {
      const params = {
        rowIndex: 150,
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
      // itemY(150) = 15000. viewportHeight = 800. itemHeight = 100.
      // targetEnd = 15000 - (800 - 100) = 14300.
      // current relativeScrollY = 0.
      // minimal movement would pick 14300 anyway.
      expect(result.targetY).toBe(14300);
      expect(result.effectiveAlignY).toBe('end');
    });

    it('aligns to start when scrolling backward (vertical)', () => {
      const params = {
        rowIndex: 10,
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
        relativeScrollY: 15000, // We are at row 150
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      // itemY(10) = 1000.
      // relativeScrollY = 15000.
      // minimal movement picks 1000.
      expect(result.targetY).toBe(1000);
      expect(result.effectiveAlignY).toBe('start');
    });

    it('stays put if already visible (vertical)', () => {
      const params = {
        rowIndex: 150,
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
        relativeScrollY: 14500, // item 150 is at 15000. Viewport is 14500 to 15300.
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      expect(result.targetY).toBe(14500);
      expect(result.effectiveAlignY).toBe('auto');
    });

    it('aligns to start if partially visible at top (backward scroll effect)', () => {
      const params = {
        rowIndex: 150,
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
        relativeScrollY: 15050, // item 150 starts at 15000. Viewport is 15050 to 15850. Item is partially visible at top.
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      // targetY should be 15000 (start alignment)
      expect(result.targetY).toBe(15000);
      expect(result.effectiveAlignY).toBe('start');
    });

    it('aligns to end if partially visible at bottom (forward scroll effect)', () => {
      const params = {
        rowIndex: 150,
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
        relativeScrollY: 14250, // item 150 is at 15000. Viewport ends at 15050. Item is partially visible at bottom.
        getItemSizeY: () => 100,
        getItemSizeX: () => 1000,
        getItemQueryY: (idx: number) => idx * 100,
        getItemQueryX: () => 0,
        getColumnSize: () => 0,
        getColumnQuery: () => 0,
        stickyIndices: [],
      };

      const result = calculateScrollTarget(params);
      // targetY should be 15000 - (800 - 100) = 14300 (end alignment)
      expect(result.targetY).toBe(14300);
      expect(result.effectiveAlignY).toBe('end');
    });

    it('aligns large item correctly when scrolling forward (minimal movement)', () => {
      const params = {
        rowIndex: 150,
        colIndex: null,
        options: 'auto' as const,
        itemsLength: 1000,
        columnCount: 0,
        direction: 'vertical' as const,
        usableWidth: 1000,
        usableHeight: 500,
        totalWidth: 1000,
        totalHeight: 1000000, // Large enough
        gap: 0,
        columnGap: 0,
        fixedSize: 1000, // Large item
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
      // itemY(150) = 150000. relativeScrollY = 0.
      // targetStart = 150000.
      // targetEnd = 150000 - (500 - 1000) = 150500.
      // Minimal movement picks 150000.
      expect(result.targetY).toBe(150000);
      expect(result.effectiveAlignY).toBe('start');
    });

    it('aligns large item correctly when scrolling backward (minimal movement)', () => {
      const params = {
        rowIndex: 10,
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
        fixedSize: 1000, // Large item
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
      // itemY(10) = 10000. relativeScrollY = 100000.
      // targetStart = 10000.
      // targetEnd = 10000 - (500 - 1000) = 10500.
      // Minimal movement picks 10500.
      expect(result.targetY).toBe(10500);
      expect(result.effectiveAlignY).toBe('end');
    });

    it('aligns large item correctly on X axis (minimal movement)', () => {
      const params = {
        rowIndex: null,
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
        fixedSize: 1000, // In horizontal mode, fixedSize is the width
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
      // itemX(150) = 150000. relativeScrollX = 0.
      // targetStart = 150000.
      // targetEnd = 150000 - (500 - 1000) = 150500.
      // Minimal movement picks 150000.
      expect(result.targetX).toBe(150000);
      expect(result.effectiveAlignX).toBe('start');
    });

    it('aligns large item correctly on X axis scrolling backward (minimal movement)', () => {
      const params = {
        rowIndex: null,
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
      // itemX(10) = 10000. relativeScrollX = 100000.
      // targetStart = 10000.
      // targetEnd = 10000 - (500 - 1000) = 10500.
      // Minimal movement picks 10500.
      expect(result.targetX).toBe(10500);
      expect(result.effectiveAlignX).toBe('end');
    });

    it('calculates target when colIndex is past columnCount', () => {
      const result = calculateScrollTarget({
        colIndex: 200,
        columnCount: 100,
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
        itemsLength: 100,
        options: 'start',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 6000,
        usableHeight: 500,
        usableWidth: 500,
      });
      expect(result.targetX).toBe(5500);
    });

    it('aligns to start when scrolling backward on X axis (horizontal)', () => {
      const params = {
        rowIndex: null,
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
        relativeScrollX: 15000, // item 10 is at 1000
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

    it('aligns to end when scrolling forward on X axis (horizontal)', () => {
      const params = {
        rowIndex: null,
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
      // itemX(150) = 15000. viewportWidth = 1000. itemWidth = 100.
      // targetEnd = 15000 - (1000 - 100) = 14100.
      expect(result.targetX).toBe(14100);
      expect(result.effectiveAlignX).toBe('end');
    });

    it('stays put if colIndex already visible (horizontal)', () => {
      const params = {
        rowIndex: null,
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
        relativeScrollX: 14500, // item 150 is at 15000. Viewport is 14500 to 15500.
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
      expect(result.targetX).toBe(14500);
      expect(result.effectiveAlignX).toBe('auto');
    });
  });

  describe('calculateColumnRange', () => {
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
      expect(result.padEnd).toBe(100 * 110 - 10 - 440);
    });

    it('calculates column range with fixed width where safeEnd is 0', () => {
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
      // safeEnd will be 0 if viewportWidth is 0 and colBuffer is 0
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
      // item 0: 0-100, gap 100-110
      // item 1: 110-210, gap 210-220
      // item 2: 220-320, gap 320-330
      // scroll 220 -> start 2.
      // viewport 200 -> ends 420. item 3: 330-430.
      expect(result.start).toBe(2);
      expect(result.end).toBe(4);
      expect(result.padStart).toBe(220);
      expect(result.padEnd).toBe(100 * 110 - 10 - 440);
    });

    it('returns empty range when columnCount is 0', () => {
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

      // item 0: 0-100, gap 100-110, ... item 9: 990-1090.
      // relativeScrollX 1000 -> start 9.
      // viewportWidth 500 -> end 10.
      expect(result.start).toBe(9);
      expect(result.end).toBe(10);
      expect(result.padStart).toBe(9 * 110);
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
      expect(result.padStart).toBe(9 * 110);
      expect(result.padEnd).toBe(0);
    });
  });

  describe('calculateItemPosition', () => {
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

  describe('calculateStickyItem', () => {
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
        relativeScrollY: 480, // item 10 starts at 500
        stickyIndices: [ 0, 10 ],
        width: 500,
      });
      expect(result.isStickyActive).toBe(true);
      expect(result.stickyOffset.y).toBe(-30);
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
        relativeScrollY: 10, // vertical is active
        stickyIndices: [ 0 ],
        width: 100,
      });
      expect(result.isStickyActive).toBe(true);
      expect(result.stickyOffset.y).toBe(0);
      expect(result.stickyOffset.x).toBe(0); // should not have checked horizontal
    });

    it('calculates sticky active state for both directions (horizontal first)', () => {
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
        relativeScrollY: 0,
        stickyIndices: [ 0 ],
        width: 100,
      });
      expect(result.isStickyActive).toBe(true);
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
        relativeScrollX: 60, // item 1 starts at 60
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
        relativeScrollX: 110, // item 1 starts at 110
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
        relativeScrollX: 600, // item 10 starts at 500
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
        relativeScrollX: 600, // item 10 starts at 500
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
      const scrollY = 75; // items are 50px high. So item 1 should be active.

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

  describe('calculateItemStyle', () => {
    it('calculates style for table container', () => {
      const result = calculateItemStyle({
        containerTag: 'table',
        direction: 'vertical',
        isHydrated: true,
        item: {
          index: 10,
          isStickyActive: false,
          offset: { x: 0, y: 600 },
          size: { height: 50, width: 500 },
          stickyOffset: { x: 0, y: 0 },
        } as unknown as RenderedItem<unknown>,
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
        item: {
          index: 10,
          isStickyActive: false,
          offset: { x: 0, y: 600 },
          size: { height: 50, width: 500 },
          stickyOffset: { x: 0, y: 0 },
        } as unknown as RenderedItem<unknown>,
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
        item: {
          index: 10,
          isStickyActive: false,
          offset: { x: 600, y: 0 },
          size: { height: 500, width: 50 },
          stickyOffset: { x: 0, y: 0 },
        } as unknown as RenderedItem<unknown>,
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
        item: {
          index: 10,
          isStickyActive: true,
          offset: { x: 0, y: 600 },
          size: { height: 50, width: 500 },
          stickyOffset: { x: 0, y: -10 },
        } as unknown as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 10,
        paddingStartY: 10,
      });
      expect(result.insetBlockStart).toBe('10px');
      expect(result.insetInlineStart).toBeUndefined();
    });

    it('calculates style for sticky item (grid both directions)', () => {
      const result = calculateItemStyle({
        containerTag: 'div',
        direction: 'both',
        isHydrated: true,
        item: {
          index: 10,
          isStickyActive: true,
          offset: { x: 600, y: 600 },
          size: { height: 50, width: 50 },
          stickyOffset: { x: -10, y: -10 },
        } as unknown as RenderedItem<unknown>,
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
        item: {
          index: 10,
          isStickyActive: true,
          offset: { x: 600, y: 600 },
          size: { height: 50, width: 50 },
          stickyOffset: { x: -10, y: -10 },
        } as unknown as RenderedItem<unknown>,
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
        item: {
          index: 10,
          isStickyActive: false,
          offset: { x: 0, y: 600 },
          size: { height: 50, width: 500 },
          stickyOffset: { x: 0, y: 0 },
        } as unknown as RenderedItem<unknown>,
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
        item: {
          index: 10,
          isStickyActive: true,
          offset: { x: 600, y: 0 },
          size: { height: 500, width: 50 },
          stickyOffset: { x: -10, y: 0 },
        } as unknown as RenderedItem<unknown>,
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
        item: {
          index: 10,
          isStickyActive: true,
          offset: { x: 600, y: 600 },
          size: { height: 50, width: 50 },
          stickyOffset: { x: -10, y: -20 },
        } as unknown as RenderedItem<unknown>,
        itemSize: 50,
        paddingStartX: 10,
        paddingStartY: 20,
      });
      expect(result.insetBlockStart).toBe('20px');
      expect(result.insetInlineStart).toBe('10px');
      expect(result.transform).toBe('translate(-10px, -20px)');
    });
  });
});
