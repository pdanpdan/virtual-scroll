import type { UseVirtualScrollReturn } from '../../src/composables/useVirtualScroll';
import type { VirtualScrollExtension } from '../../src/extensions';
import type { ScrollDirection, VirtualScrollProps } from '../../src/types';
import type { MockItem } from '../test-helper';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { useCoordinateScalingExtension } from '../../src/extensions/coordinate-scaling';
import { useInfiniteLoadingExtension } from '../../src/extensions/infinite-loading';
import { usePrependRestorationExtension } from '../../src/extensions/prepend-restoration';
import { useRtlExtension } from '../../src/extensions/rtl';
import { useSnappingExtension } from '../../src/extensions/snapping';
import { useStickyExtension } from '../../src/extensions/sticky';
import { BROWSER_MAX_SIZE } from '../../src/utils/scroll';
import { clearMocks, mockItems, setup, setupMocks } from '../test-helper';

/**
 * Every configuration below is asserted against the same invariants, derived
 * from the public API and the documented VU/DU model rather than from the
 * engine's internal state. Each row of the matrix is therefore an end-to-end
 * check of the layout maths with those props in place.
 */

/** The six extensions `VirtualScroll.vue` wires, in the component's order. */
function builtInExtensions<T>(): VirtualScrollExtension<T>[] {
  return [
    useRtlExtension<T>(),
    useSnappingExtension<T>(),
    useStickyExtension<T>(),
    useInfiniteLoadingExtension<T>({ onLoad: () => {} }),
    usePrependRestorationExtension<T>(),
    useCoordinateScalingExtension<T>(),
  ];
}

interface InvariantOptions {
  /** Number of rows in the dataset. */
  count: number;
  /** Direction under test; selects the main scroll axis. */
  direction: ScrollDirection;
  /** Columns per row, for grid configurations only. */
  columns?: number;
}

/**
 * Asserts the invariants that hold for every prop combination: a window of
 * strictly ascending rows inside the dataset, non-overlapping geometry on the
 * main axis, a coherent visible range, and a DOM size kept inside the
 * coordinate limit.
 */
function expectWindowInvariants(
  result: UseVirtualScrollReturn<MockItem>,
  options: InvariantOptions,
  label: string,
) {
  const { count, direction } = options;
  const axis = direction === 'horizontal' ? 'x' : 'y' as const;
  const items = result.renderedItems.value;
  const details = result.scrollDetails.value;

  expect(items.length, `${ label }: renders a window`).toBeGreaterThan(0);

  items.forEach((item, position) => {
    const at = `${ label }: index ${ item.index }`;
    expect(Number.isInteger(item.index), `${ at }: integer`).toBe(true);
    expect(item.index, `${ at }: inside the dataset`).toBeGreaterThanOrEqual(0);
    expect(item.index, `${ at }: inside the dataset`).toBeLessThan(count);
    expect(Number.isFinite(item.offset.x), `${ at }: finite x`).toBe(true);
    expect(Number.isFinite(item.offset.y), `${ at }: finite y`).toBe(true);
    expect(item.size.width, `${ at }: width`).toBeGreaterThanOrEqual(0);
    expect(item.size.height, `${ at }: height`).toBeGreaterThanOrEqual(0);

    if (position === 0) {
      return;
    }
    const previous = items[ position - 1 ]!;
    expect(item.index, `${ label }: rows ascend`).toBeGreaterThan(previous.index);
    // Rows are laid out as prefix sums, so their offsets never go backwards.
    expect(item.offset[ axis ], `${ label }: ${ axis } offsets do not overlap`)
      .toBeGreaterThanOrEqual(previous.offset[ axis ]);
  });

  // The visible range covers the item at the top of the viewport and stays in
  // bounds. In horizontal mode the items run along x and are reported as
  // columns; in grid mode the window indexes rows. A leading inset puts the
  // viewport top before the first row, which the engine reports as -1 while
  // still rendering from the first row.
  const visibleIndex = direction === 'horizontal' ? details.currentColIndex : details.currentIndex;
  expect(details.range.start, `${ label }: range start`).toBeGreaterThanOrEqual(0);
  expect(details.range.end, `${ label }: range end`).toBeLessThanOrEqual(count);
  if (visibleIndex === -1) {
    expect(details.range.start, `${ label }: leading inset keeps the window at the first row`).toBe(0);
  } else {
    expect(details.range.start, `${ label }: range starts at or before the visible item`)
      .toBeLessThanOrEqual(visibleIndex);
    expect(visibleIndex, `${ label }: range ends after the visible item`)
      .toBeLessThan(details.range.end);
    expect(items.some((item) => item.index === visibleIndex), `${ label }: visible item is rendered`)
      .toBe(true);
  }

  // On a grid the column window covers the leading visible column the same way.
  if (options.columns !== undefined) {
    const columns = result.columnRange.value;
    expect(columns.start, `${ label }: column range start`).toBeGreaterThanOrEqual(0);
    expect(columns.end, `${ label }: column range end`).toBeLessThanOrEqual(options.columns);
    expect(columns.start, `${ label }: column window covers the visible column`)
      .toBeLessThanOrEqual(details.currentColIndex);
    expect(details.currentColIndex, `${ label }: column window covers the visible column`)
      .toBeLessThan(columns.end);
  }

  // Content size is finite, and the DOM boxes never exceed the browser limit.
  expect(Number.isFinite(details.totalSize.width), `${ label }: finite total width`).toBe(true);
  expect(Number.isFinite(details.totalSize.height), `${ label }: finite total height`).toBe(true);
  expect(details.totalSize[ direction === 'horizontal' ? 'width' : 'height' ], `${ label }: content extent`)
    .toBeGreaterThan(0);
  expect(result.renderedWidth.value, `${ label }: rendered width inside the limit`)
    .toBeLessThanOrEqual(BROWSER_MAX_SIZE);
  expect(result.renderedHeight.value, `${ label }: rendered height inside the limit`)
    .toBeLessThanOrEqual(BROWSER_MAX_SIZE);
}

/** Row offsets are prefix sums: the step between two rows is the row size plus the gap. */
function expectOffsetSteps(
  result: UseVirtualScrollReturn<MockItem>,
  count: number,
  gap: number,
  label: string,
) {
  for (let index = 0; index < count - 1; index++) {
    const step = result.getItemOffset(index + 1) - result.getItemOffset(index);
    expect(step, `${ label }: step after row ${ index }`).toBeCloseTo(result.getItemSize(index) + gap, 6);
  }
}

/** Asserts a programmatic scroll left the target row in the render window. */
function expectScrolledTo(
  result: UseVirtualScrollReturn<MockItem>,
  index: number,
  label: string,
) {
  const details = result.scrollDetails.value;
  expect(details.range.start, `${ label }: target row is inside the window`).toBeLessThanOrEqual(index);
  expect(index, `${ label }: target row is inside the window`).toBeLessThan(details.range.end);
  expect(
    result.renderedItems.value.some((item) => item.index === index),
    `${ label }: target row is rendered`,
  ).toBe(true);
}

/** A 500x500 scroll container, so the engine treats it as an element rather than the window. */
function makeContainer(width = 500, height = 500) {
  const el = document.createElement('div');
  Object.defineProperty(el, 'clientWidth', { configurable: true, value: width });
  Object.defineProperty(el, 'clientHeight', { configurable: true, value: height });
  return el;
}

const DIRECTIONS: ScrollDirection[] = [ 'vertical', 'horizontal', 'both' ];
/** 500px viewport over 50px rows. */
const VISIBLE_ROWS = 10;
const SIZINGS = [
  { label: 'fixed size', props: { itemSize: 50 } },
  { label: 'dynamic size', props: { itemSize: 0, defaultItemSize: 40 } },
] as const;

describe('useVirtualScroll combinations', () => {
  setupMocks();

  beforeEach(() => {
    clearMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('direction, sizing, directionality and pinned rows', () => {
    // 3 directions x 2 sizing modes x 2 text directions x 2 pin sets.
    for (const direction of DIRECTIONS) {
      for (const sizing of SIZINGS) {
        for (const rtl of [ false, true ]) {
          for (const pins of [ undefined, [ 0, 3 ] ] as const) {
            const label = `${ direction } / ${ sizing.label } / ${ rtl ? 'rtl' : 'ltr' } / ${ pins ? 'pinned' : 'plain' }`;

            it(`renders and scrolls: ${ label }`, async () => {
              const container = makeContainer();
              if (rtl) {
                vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration);
              }

              const props: VirtualScrollProps<MockItem> = {
                container,
                direction,
                items: mockItems,
                bufferBefore: 2,
                bufferAfter: 2,
                ...sizing.props,
                ...(pins ? { stickyIndices: [ ...pins ] } : {}),
                ...(direction === 'both' ? { columnCount: 4, columnWidth: 120 } : {}),
              };
              const { result, wrapper } = setup(props, builtInExtensions<MockItem>());
              await nextTick();
              await nextTick();

              expectWindowInvariants(result, {
                count: mockItems.length,
                direction,
                ...(direction === 'both' ? { columns: 4 } : {}),
              }, label);
              expectOffsetSteps(result, mockItems.length, 0, label);
              expect(result.isRtl.value, `${ label }: text direction`).toBe(rtl);
              expect(result.scaleY.value, `${ label }: nothing to scale`).toBe(1);

              // Scrolling to an interior item keeps it in the window. In
              // horizontal mode the items run along x, so they are addressed
              // by the column argument. With pinned rows the engine reserves
              // the pinned row's space, so the row above the target can sit at
              // the very top.
              const target = 37;
              if (direction === 'horizontal') {
                result.scrollToIndex(null, target, { align: 'start', behavior: 'auto' });
              } else {
                result.scrollToIndex(target, null, { align: 'start', behavior: 'auto' });
              }
              await nextTick();
              await nextTick();

              expectScrolledTo(result, target, label);
              // In horizontal mode the items are the columns, so the visible
              // item is reported as `currentColIndex`.
              const visible = direction === 'horizontal'
                ? result.scrollDetails.value.currentColIndex
                : result.scrollDetails.value.currentIndex;
              if (pins === undefined) {
                expect(visible, `${ label }: target item leads the viewport`).toBe(target);
              } else {
                expect(visible, `${ label }: pinned row reserves the sticky line`).toBe(target - 1);
              }
              expectWindowInvariants(result, {
                count: mockItems.length,
                direction,
                ...(direction === 'both' ? { columns: 4 } : {}),
              }, `${ label } after scrollToIndex`);

              wrapper.unmount();
            });
          }
        }
      }
    }
  });

  describe('extension subsets', () => {
    // All 64 subsets of the six extensions VirtualScroll.vue wires: every
    // combination must keep the window and the geometry coherent.
    for (let mask = 0; mask < 64; mask++) {
      const subset = builtInExtensions<MockItem>().filter((_, index) => (mask & (1 << index)) !== 0);
      const label = subset.length > 0 ? subset.map((extension) => extension.name).join(' + ') : 'no extensions';

      it(`stays coherent with ${ label }`, async () => {
        const { result, wrapper } = setup({
          container: makeContainer(),
          direction: 'both',
          items: mockItems,
          itemSize: 0,
          defaultItemSize: 40,
          columnCount: 5,
          columnWidth: 90,
          stickyIndices: [ 0, 42 ],
          snap: 'start',
          restoreScrollOnPrepend: true,
          gap: 4,
          columnGap: 6,
        }, subset);
        await nextTick();
        await nextTick();

        expectWindowInvariants(result, { count: mockItems.length, direction: 'both', columns: 5 }, label);

        result.scrollToIndex(60, null, { align: 'start', behavior: 'auto' });
        await nextTick();
        await nextTick();
        expectScrolledTo(result, 60, label);
        expectWindowInvariants(result, { count: mockItems.length, direction: 'both', columns: 5 }, `${ label } after scrollToIndex`);

        wrapper.unmount();
      });
    }
  });

  describe('grid columns and spacing', () => {
    const COLUMN_MODES = [
      { label: 'fixed width', props: { columnWidth: 120 } },
      { label: 'dynamic width', props: { columnWidth: 0, defaultColumnWidth: 80 } },
    ] as const;

    for (const columns of [ 1, 4, 7 ]) {
      for (const mode of COLUMN_MODES) {
        for (const spacing of [ { gap: 0, columnGap: 0 }, { gap: 8, columnGap: 12 } ]) {
          const label = `${ columns } columns / ${ mode.label } / gap ${ spacing.gap } / columnGap ${ spacing.columnGap }`;

          it(`lays out a grid: ${ label }`, async () => {
            const { result, wrapper } = setup({
              container: makeContainer(),
              direction: 'both',
              items: mockItems,
              itemSize: 50,
              columnCount: columns,
              ...mode.props,
              ...spacing,
            }, builtInExtensions<MockItem>());
            await nextTick();
            await nextTick();

            expectWindowInvariants(result, { count: mockItems.length, direction: 'both', columns }, label);
            expectOffsetSteps(result, mockItems.length, spacing.gap, label);

            // Rows are 50px plus the row gap, and the grid height is the rows
            // extent without a trailing gap.
            expect(result.totalHeight.value, `${ label }: content height`)
              .toBe(mockItems.length * (50 + spacing.gap) - spacing.gap);

            // Every row of the window carries the same column window.
            const columnRange = result.columnRange.value;
            expect(columnRange.start, `${ label }: column start`).toBeGreaterThanOrEqual(0);
            expect(columnRange.end, `${ label }: column end`).toBeLessThanOrEqual(columns);
            expect(columnRange.end, `${ label }: column window is non-empty`).toBeGreaterThan(columnRange.start);

            wrapper.unmount();
          });
        }
      }
    }

    it('keeps the column window in step with the horizontal scroll offset', async () => {
      const { result, wrapper } = setup({
        container: makeContainer(320, 500),
        direction: 'both',
        items: mockItems,
        itemSize: 50,
        columnCount: 20,
        columnWidth: 100,
      }, builtInExtensions<MockItem>());
      await nextTick();
      await nextTick();

      const first = result.columnRange.value;
      expect(first.start).toBe(0);

      result.scrollToOffset(1500, 0, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      const scrolled = result.columnRange.value;
      // 1500px into 100px columns with a 320px viewport: the window covers
      // columns 15..18 and must have advanced past the initial window.
      expect(scrolled.start).toBeGreaterThan(first.start);
      expect(scrolled.start).toBeLessThanOrEqual(15);
      expect(scrolled.end).toBeGreaterThanOrEqual(18);
      expect(result.scrollDetails.value.currentColIndex).toBe(15);

      wrapper.unmount();
    });
  });

  describe('scroll padding, sticky and flow insets', () => {
    const INSETS = [
      { label: 'no insets', props: {} },
      { label: 'scroll padding', props: { scrollPaddingStart: 24, scrollPaddingEnd: 16 } },
      { label: 'per-axis scroll padding', props: { scrollPaddingStart: { x: 12, y: 30 }, scrollPaddingEnd: { x: 8, y: 20 } } },
      { label: 'sticky insets', props: { stickyStart: 40, stickyEnd: 24 } },
      { label: 'flow insets', props: { flowPaddingStart: 16, flowPaddingEnd: 32 } },
      {
        label: 'every inset at once',
        props: {
          scrollPaddingStart: { x: 10, y: 18 },
          scrollPaddingEnd: { x: 6, y: 14 },
          stickyStart: { x: 20, y: 36 },
          stickyEnd: { x: 4, y: 12 },
          flowPaddingStart: { x: 8, y: 22 },
          flowPaddingEnd: { x: 2, y: 26 },
        },
      },
    ] as const;

    for (const inset of INSETS) {
      for (const direction of DIRECTIONS) {
        const label = `${ inset.label } / ${ direction }`;

        it(`accounts for the insets: ${ label }`, async () => {
          const { result, wrapper } = setup({
            container: makeContainer(),
            direction,
            items: mockItems,
            itemSize: 50,
            gap: 5,
            columnGap: 7,
            ...inset.props,
          }, builtInExtensions<MockItem>());
          await nextTick();
          await nextTick();

          // Scroll padding is part of the scrollable content; flow and sticky
          // insets sit outside the virtualized area. The horizontal axis takes
          // its row spacing from `columnGap`.
          const horizontal = direction === 'horizontal';
          const axis = horizontal ? 'x' : 'y' as const;
          const insetOf = (key: string) => {
            const value: unknown = (inset.props as Record<string, unknown>)[ key ];
            if (typeof value === 'number') {
              return value;
            }
            if (value && typeof value === 'object') {
              return (value as { x?: number; y?: number; })[ axis ] ?? 0;
            }
            return 0;
          };

          const step = 50 + (horizontal ? 7 : 5);
          const content = mockItems.length * step - (horizontal ? 7 : 5);
          const edgeInset = insetOf('scrollPaddingStart') + insetOf('scrollPaddingEnd')
            + insetOf('stickyStart') + insetOf('stickyEnd')
            + insetOf('flowPaddingStart') + insetOf('flowPaddingEnd');
          const mainTotal = horizontal ? result.totalWidth.value : result.totalHeight.value;
          expect(mainTotal, `${ label }: content plus every inset`).toBeCloseTo(content + edgeInset, 6);

          expectWindowInvariants(result, { count: mockItems.length, direction }, label);

          // The first row sits after the flow, sticky and scroll padding.
          expect(result.getItemOffset(0), `${ label }: first row offset`)
            .toBeCloseTo(insetOf('flowPaddingStart') + insetOf('stickyStart') + insetOf('scrollPaddingStart'), 6);
          expect(result.getItemOffset(1) - result.getItemOffset(0), `${ label }: first row step`).toBe(step);

          // The end of the dataset stays reachable whatever the insets are.
          // In horizontal mode the items run along x and take the column argument.
          if (horizontal) {
            result.scrollToIndex(null, mockItems.length - 1, { align: 'end', behavior: 'auto' });
          } else {
            result.scrollToIndex(mockItems.length - 1, null, { align: 'end', behavior: 'auto' });
          }
          await nextTick();
          await nextTick();
          expectScrolledTo(result, mockItems.length - 1, label);
          expect(result.scrollDetails.value.range.end, `${ label }: window reaches the last row`).toBe(mockItems.length);

          wrapper.unmount();
        });
      }
    }
  });

  describe('coordinate scaling', () => {
    const HUGE = 400_000; // 400k rows of 50px -> 20M px, past the browser limit.
    const hugeItems: MockItem[] = Array.from({ length: HUGE }, (_, i) => ({ id: i }));

    it('scales the display coordinates instead of the content', async () => {
      const { result, wrapper } = setup({ container: makeContainer(), items: hugeItems, itemSize: 50 }, builtInExtensions<MockItem>());
      await nextTick();
      await nextTick();

      expect(result.scaleY.value, 'scaling engages past the browser limit').toBeGreaterThan(1);
      expect(result.scaleX.value, 'the vertical axis is the constrained one').toBe(1);
      expect(result.totalHeight.value, 'the virtual extent is unbounded').toBe(HUGE * 50);
      expect(result.renderedHeight.value, 'the DOM box is clamped').toBe(BROWSER_MAX_SIZE);

      expectWindowInvariants(result, { count: HUGE, direction: 'vertical' }, 'scaled vertical');

      // A jump into the scaled tail still resolves to the right virtual row.
      result.scrollToIndex(HUGE - 10, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();
      expectScrolledTo(result, HUGE - 10, 'scaled vertical');
      expect(result.scrollDetails.value.currentIndex, 'scaled vertical: the target leads the viewport').toBe(HUGE - 10);
      expectWindowInvariants(result, { count: HUGE, direction: 'vertical' }, 'scaled vertical after scrollToIndex');

      wrapper.unmount();
    });

    it('scales a wide horizontal axis without clamping the virtual offset', async () => {
      const { result, wrapper } = setup({ container: makeContainer(), direction: 'horizontal', items: hugeItems, itemSize: 50 }, builtInExtensions<MockItem>());
      await nextTick();
      await nextTick();

      expect(result.scaleX.value).toBeGreaterThan(1);
      expect(result.renderedWidth.value).toBe(BROWSER_MAX_SIZE);
      expect(result.totalWidth.value).toBe(HUGE * 50);

      // Interior targets survive the round trip through display coordinates.
      const interior = HUGE / 2;
      result.scrollToIndex(null, interior, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();
      expect(result.scrollDetails.value.currentColIndex).toBe(interior);
      expectScrolledTo(result, interior, 'scaled horizontal');

      // The past-the-limit tail is reachable, and its rows stay inside the
      // clamped display box.
      result.scrollToIndex(null, HUGE - 1, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();
      expectScrolledTo(result, HUGE - 1, 'scaled horizontal tail');
      expect(result.scrollDetails.value.range.end).toBe(HUGE);
      wrapper.unmount();
    });

    it('keeps both axes scaled for a grid past the limit', async () => {
      const rows = 300_000; // 15M px tall.
      const columns = 200_000; // 20M px wide.
      const items: MockItem[] = Array.from({ length: rows }, (_, i) => ({ id: i }));
      const { result, wrapper } = setup({
        container: makeContainer(),
        direction: 'both',
        items,
        itemSize: 50,
        columnCount: columns,
        columnWidth: 100,
      }, builtInExtensions<MockItem>());
      await nextTick();
      await nextTick();

      expect(result.scaleY.value).toBeGreaterThan(1);
      expect(result.scaleX.value).toBeGreaterThan(1);
      expect(result.renderedHeight.value).toBe(BROWSER_MAX_SIZE);
      expect(result.renderedWidth.value).toBe(BROWSER_MAX_SIZE);
      expect(result.totalHeight.value).toBe(rows * 50);
      expect(result.totalWidth.value).toBe(columns * 100);

      // Both axes resolve an interior target independently.
      const row = rows / 2;
      const column = columns / 2;
      result.scrollToIndex(row, column, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();
      expect(result.scrollDetails.value.currentIndex).toBe(row);
      expect(result.scrollDetails.value.currentColIndex).toBe(column);
      expectScrolledTo(result, row, 'scaled grid');
      wrapper.unmount();
    });
  });

  describe('buffer windows', () => {
    for (const bufferBefore of [ 0, 1, 10 ]) {
      for (const bufferAfter of [ 0, 1, 10 ]) {
        it(`renders the buffered window (${ bufferBefore } before, ${ bufferAfter } after)`, async () => {
          const { result, wrapper } = setup({
            container: makeContainer(),
            items: mockItems,
            itemSize: 50,
            bufferBefore,
            bufferAfter,
          }, builtInExtensions<MockItem>());
          await nextTick();
          await nextTick();

          // At the top the before-buffer has nothing to add, so the window is
          // the visible rows plus the after-buffer.
          const top = result.scrollDetails.value;
          expect(top.range.start, 'top: clamped to the first row').toBe(0);
          expect(top.range.end, 'top: visible rows plus the after-buffer').toBe(VISIBLE_ROWS + bufferAfter);
          expect(result.renderedItems.value.length, 'top: rendered window').toBe(VISIBLE_ROWS + bufferAfter);

          result.scrollToOffset(null, 999_999, { behavior: 'auto' });
          await nextTick();
          await nextTick();

          // At the bottom the after-buffer has nothing to add.
          const bottom = result.scrollDetails.value;
          const lastVisible = mockItems.length - VISIBLE_ROWS;
          expect(bottom.range.start, 'bottom: visible rows plus the before-buffer')
            .toBe(Math.max(0, lastVisible - bufferBefore));
          expect(bottom.range.end, 'bottom: clamped to the last row').toBe(mockItems.length);
          expect(result.renderedItems.value.at(-1)!.index, 'bottom: last row is rendered').toBe(mockItems.length - 1);
          wrapper.unmount();
        });
      }
    }
  });

  describe('programmatic scroll round trip', () => {
    for (const direction of DIRECTIONS) {
      it(`reports each index back from its own scroll target (${ direction })`, async () => {
        const { result, wrapper } = setup({
          container: makeContainer(),
          direction,
          items: mockItems,
          itemSize: 50,
          ...(direction === 'both' ? { columnCount: 4, columnWidth: 120 } : {}),
        }, builtInExtensions<MockItem>());
        await nextTick();
        await nextTick();

        // Only rows whose extent plus the viewport still fits in the content
        // can be start-aligned; the tail is exercised by the clamped check.
        const lastAlignable = mockItems.length - VISIBLE_ROWS;
        for (const index of [ 0, 1, 12, 55, lastAlignable ]) {
          if (direction === 'horizontal') {
            result.scrollToIndex(null, index, { align: 'start', behavior: 'auto' });
          } else {
            result.scrollToIndex(index, null, { align: 'start', behavior: 'auto' });
          }
          await nextTick();
          await nextTick();

          // The row the engine reports as current is the row whose virtual
          // extent covers the current scroll offset.
          const offset = result.getItemOffset(index);
          expect(result.getRowIndexAt(offset), `${ direction }: row at its own offset`).toBe(index);
          const visible = direction === 'horizontal'
            ? result.scrollDetails.value.currentColIndex
            : result.scrollDetails.value.currentIndex;
          expect(visible, `${ direction }: row ${ index } leads the viewport`).toBe(index);
          expectScrolledTo(result, index, `${ direction } row ${ index }`);
        }

        // The final row cannot lead the viewport; the window clamps to it.
        const last = mockItems.length - 1;
        if (direction === 'horizontal') {
          result.scrollToIndex(null, last, { align: 'start', behavior: 'auto' });
        } else {
          result.scrollToIndex(last, null, { align: 'start', behavior: 'auto' });
        }
        await nextTick();
        await nextTick();
        expect(result.scrollDetails.value.range.end, `${ direction }: the window reaches the last row`).toBe(mockItems.length);
        expectScrolledTo(result, last, `${ direction } last row`);
        wrapper.unmount();
      });
    }
  });

  describe('snap across axes', () => {
    // The snap unit follows the axis: rows along y, columns along x. On a grid
    // the two differ, so each axis must measure against its own geometry.
    const gridContainer = () => makeContainer(500, 500);

    const scrollAndSettle = async (el: HTMLElement, left: number, top: number) => {
      if (left !== 0) {
        el.scrollLeft = left;
      }
      if (top !== 0) {
        el.scrollTop = top;
      }
      el.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();
      // Past the engine's scroll-end timeout, which is when snapping runs.
      vi.advanceTimersByTime(200);
      await nextTick();
    };

    it('snaps a grid horizontally by column width, not by row height', async () => {
      vi.useFakeTimers();
      const el = gridContainer();
      const scrollTo = vi.spyOn(el, 'scrollTo').mockImplementation(() => {});
      const { wrapper } = setup({
        container: el,
        direction: 'both',
        items: mockItems,
        itemSize: 600, // rows are taller than the 500px viewport
        columnCount: 10,
        columnWidth: 100,
        snap: 'next',
      }, builtInExtensions<MockItem>());
      await nextTick();
      await nextTick();

      await scrollAndSettle(el, 120, 0);

      // Row height (600) exceeds the viewport, which is why the row geometry
      // used to cancel horizontal snapping outright; the column width (100)
      // yields the next column instead.
      expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 200, behavior: 'smooth' }));
      vi.useRealTimers();
      wrapper.unmount();
    });

    it('snaps a grid vertically by row height', async () => {
      vi.useFakeTimers();
      const el = gridContainer();
      const scrollTo = vi.spyOn(el, 'scrollTo').mockImplementation(() => {});
      const { wrapper } = setup({
        container: el,
        direction: 'both',
        items: mockItems,
        itemSize: 300,
        columnCount: 10,
        columnWidth: 100,
        snap: 'next',
      }, builtInExtensions<MockItem>());
      await nextTick();
      await nextTick();

      await scrollAndSettle(el, 0, 320);

      expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 600, behavior: 'smooth' }));
      vi.useRealTimers();
      wrapper.unmount();
    });

    it('snaps a horizontal list by item width', async () => {
      vi.useFakeTimers();
      const el = gridContainer();
      const scrollTo = vi.spyOn(el, 'scrollTo').mockImplementation(() => {});
      const { wrapper } = setup({
        container: el,
        direction: 'horizontal',
        items: mockItems,
        itemSize: 100,
        snap: 'next',
      }, builtInExtensions<MockItem>());
      await nextTick();
      await nextTick();

      await scrollAndSettle(el, 120, 0);

      expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 200, behavior: 'smooth' }));
      vi.useRealTimers();
      wrapper.unmount();
    });
  });

  describe('measurement corrections', () => {
    it('keeps the window coherent while measured rows replace their estimates', async () => {
      const { result, wrapper } = setup({
        container: makeContainer(),
        items: mockItems,
        itemSize: 0,
        defaultItemSize: 40,
        stickyIndices: [ 0 ],
        gap: 6,
      }, builtInExtensions<MockItem>());
      await nextTick();
      await nextTick();

      result.scrollToIndex(50, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();
      const before = result.scrollDetails.value;

      // Rows measured taller than their estimate grow the content below them.
      result.updateItemSizes([ 48, 49, 50 ].map((index) => ({ index, inlineSize: 100, blockSize: 60 })));
      await nextTick();
      await nextTick();

      const after = result.scrollDetails.value;
      expect(after.totalSize.height, 'content grows with the measurements')
        .toBeGreaterThan(before.totalSize.height);
      expect(after.range.start, 'the visible row stays pinned').toBe(before.range.start);
      expect(result.getItemOffset(0), 'rows above the measurement keep their offsets').toBe(0);
      expectOffsetSteps(result, mockItems.length, 6, 'after measurement');
      expectWindowInvariants(result, { count: mockItems.length, direction: 'vertical' }, 'after measurement');
      wrapper.unmount();
    });
  });
});
