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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 200,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 100,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
      });
      expect(result.start).toBe(20);
      expect(result.end).toBe(30);
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
      });
      expect(result.targetY).toBe(4500);
    });

    it('calculates target for vertical auto alignment (already visible)', () => {
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
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 1000, // item 20 is at 1000
        rowIndex: 20,
        totalHeight: 5000,
        totalWidth: 0,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      // Should stay at current scroll position
      expect(result.targetY).toBe(1000);
    });

    it('calculates target for vertical auto alignment (partially visible at top)', () => {
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
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 1020, // item 20 at 1000
        rowIndex: 20,
        totalHeight: 5000,
        totalWidth: 0,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      expect(result.targetY).toBe(1000);
    });

    it('calculates target for vertical auto alignment (partially visible at bottom)', () => {
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
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 530, // item 20 at 1000. viewport ends at 1030. item ends at 1050.
        rowIndex: 20,
        totalHeight: 5000,
        totalWidth: 0,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      // item 20 ends at 1050. targetY = 1050 - 500 = 550.
      expect(result.targetY).toBe(550);
    });

    it('calculates target for vertical auto alignment (larger than viewport, covering it)', () => {
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
        relativeScrollY: 200, // item 0 starts at 0, ends at 1000. Viewport is 200 to 700.
        rowIndex: 0,
        totalHeight: 10000,
        totalWidth: 0,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      // Should stay at 200
      expect(result.targetY).toBe(200);
    });

    it('calculates target for vertical auto alignment (larger than viewport, below)', () => {
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
        rowIndex: 2, // starts at 2000.
        totalHeight: 10000,
        totalWidth: 0,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      // targetStart = 2000. targetEnd = 2000 - (500 - 1000) = 2500.
      // Minimal movement from 0 is targetStart = 2000.
      expect(result.targetY).toBe(2000);
    });

    it('calculates target for horizontal auto alignment (larger than viewport, covering it)', () => {
      const result = calculateScrollTarget({
        colIndex: 0,
        columnCount: 10,
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 1000,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 1000,
        getItemQueryY: () => 0,
        getItemSizeX: () => 1000,
        getItemSizeY: () => 0,
        itemsLength: 10,
        options: 'auto',
        relativeScrollX: 200, // item 0 starts at 0, ends at 1000. Viewport is 200 to 700.
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 10000,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      // Should stay at 200
      expect(result.targetX).toBe(200);
    });

    it('calculates target for horizontal auto alignment (larger than viewport, move to nearest edge)', () => {
      const result = calculateScrollTarget({
        colIndex: 2,
        columnCount: 10,
        columnGap: 0,
        direction: 'horizontal',
        fixedSize: 1000,
        fixedWidth: null,
        gap: 0,
        getColumnQuery: () => 0,
        getColumnSize: () => 0,
        getItemQueryX: (idx) => idx * 1000,
        getItemQueryY: () => 0,
        getItemSizeX: () => 1000,
        getItemSizeY: () => 0,
        itemsLength: 10,
        options: 'auto',
        relativeScrollX: 0,
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 10000,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      // item 2 starts at 2000. targetStart = 2000. targetEnd = 2000 - (500 - 1000) = 2500.
      // Nearest to 0 is 2000.
      expect(result.targetX).toBe(2000);
    });

    it('calculates target for horizontal auto alignment (already visible)', () => {
      const result = calculateScrollTarget({
        colIndex: 20,
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
        options: 'auto',
        relativeScrollX: 1000, // item 20 is at 1000
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5000,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      expect(result.targetX).toBe(1000);
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
        viewportHeight: 500,
        viewportWidth: 500,
      });
      expect(result.targetX).toBe(5500);
    });

    it('calculates target for horizontal auto alignment (not visible, move to start)', () => {
      const result = calculateScrollTarget({
        colIndex: 20,
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
        options: 'auto',
        relativeScrollX: 1100, // item 20 is at 1000
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5000,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      expect(result.targetX).toBe(1000);
    });

    it('calculates target for horizontal auto alignment (not visible, move to end)', () => {
      const result = calculateScrollTarget({
        colIndex: 20,
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
        options: 'auto',
        relativeScrollX: 400, // item 20 is at 1000, viewport ends at 900.
        relativeScrollY: 0,
        rowIndex: null,
        totalHeight: 0,
        totalWidth: 5000,
        viewportHeight: 500,
        viewportWidth: 500,
      });
      // item 20 ends at 1050. targetEnd = 1050 - 500 = 550.
      expect(result.targetX).toBe(550);
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
        viewportHeight: 500,
        viewportWidth: 500,
      });
      // rowIndex 20 -> y=1000. end align -> 1000 - (500 - 50) = 550.
      // colIndex 10 -> x=1000. center align -> 1000 - (500 - 100) / 2 = 1000 - 200 = 800.
      expect(result.targetY).toBe(550);
      expect(result.targetX).toBe(800);
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
        viewportWidth: 200,
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
        viewportWidth: 200,
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
        viewportWidth: 0,
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
        viewportWidth: 200,
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
        viewportWidth: 200,
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
        viewportWidth: 200,
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
        viewportWidth: 500,
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
        viewportWidth: 500,
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
        viewportWidth: 500,
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
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        viewportHeight: 500,
        viewportWidth: 500,
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
        scrollPaddingStart: 10,
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
        scrollPaddingStart: { x: 10, y: 10 },
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
        scrollPaddingStart: { x: 10, y: 10 },
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
        scrollPaddingStart: 10,
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
        scrollPaddingStart: { x: 10, y: 20 },
      });
      expect(result.insetBlockStart).toBe('20px');
      expect(result.insetInlineStart).toBe('10px');
      expect(result.transform).toBe('translate(-10px, -20px)');
    });
  });
});
