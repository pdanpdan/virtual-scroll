import type { UseVirtualScrollMasonryReturn } from '../../src/composables/useVirtualScrollMasonry';
import type { VirtualScrollMasonryProps as MasonryProps, MasonryRenderedItem } from '../../src/types';
import type { Ref } from 'vue';

import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import { useVirtualScrollMasonry } from '../../src/composables/useVirtualScrollMasonry';
import { clearMocks, setupMocks, triggerResize } from '../test-helper';

/** Deterministic canonical oracle (heights depend on the resolved column width). */
function oracle(i: number, width: number): number {
  const h = Math.imul(i + 1, 2654435761) >>> 0;
  return 40 + (h % 7) * 20 + (width % 50);
}

/** Brute-force greedy reference: position of every card and the total height. */
function greedyReference(
  count: number,
  columns: number,
  columnWidth: number,
  gap: number,
  heightFn: (i: number, width: number) => number = oracle,
): { y: number[]; column: number[]; total: number; } {
  const tops = new Float64Array(columns);
  const y = new Float64Array(count);
  const column = new Int32Array(count);
  for (let i = 0; i < count; i++) {
    let best = 0;
    for (let c = 1; c < columns; c++) {
      if (tops[ c ]! < tops[ best ]!) {
        best = c;
      }
    }
    column[ i ] = best;
    y[ i ] = tops[ best ]!;
    tops[ best ] = tops[ best ]! + heightFn(i, columnWidth) + gap;
  }
  return { y: Array.from(y), column: Array.from(column), total: Math.max(...Array.from(tops)) };
}

/** Filter of brute-force positions matching the rendered window predicate. */
function expectedWindow(
  ref: ReturnType<typeof greedyReference>,
  count: number,
  top: number,
  bottom: number,
  heightFn: (i: number, width: number) => number = oracle,
  width = 242.5,
): number[] {
  const indices: number[] = [];
  for (let i = 0; i < count; i++) {
    if (ref.y[ i ]! < bottom && ref.y[ i ]! + heightFn(i, width) > top) {
      indices.push(i);
    }
  }
  return indices;
}

/** Replicate the composable anchor selection: the straddler closest below the line. */
function pickAnchor(cards: MasonryRenderedItem<number>[], line: number): { index: number; delta: number; } {
  const straddle = cards
    .filter((card) => card.y <= line && card.y + card.height > line)
    .sort((a, b) => b.y - a.y)[ 0 ];
  if (straddle) {
    return { index: straddle.index, delta: line - straddle.y };
  }
  const below = cards
    .filter((card) => card.y > line)
    .sort((a, b) => a.y - b.y)[ 0 ];
  return below ? { index: below.index, delta: line - below.y } : { index: -1, delta: 0 };
}

/** Harness: mount a stub component that calls the composable with the given props. */
function mountMasonry<T>(propsValue: MasonryProps<T>) {
  // Deep ref so tests can mutate nested prop fields reactively; the unwrap
  // typing of the generic props shape is bridged by the cast.
  const props = ref(propsValue) as unknown as Ref<MasonryProps<T>>;
  const wrapper = mount(defineComponent({
    setup() {
      const result = useVirtualScrollMasonry<T>(props);
      return { result };
    },
    template: '<div />',
  }));
  const vm = wrapper.vm as unknown as { result: UseVirtualScrollMasonryReturn<T>; };
  return { props, result: vm.result, wrapper };
}

/** Create a detached host with the given viewport size. */
function makeHost(width = 1000, height = 500): HTMLElement {
  const host = document.createElement('div');
  Object.defineProperty(host, 'clientWidth', { configurable: true, value: width });
  Object.defineProperty(host, 'clientHeight', { configurable: true, value: height });
  return host;
}

function makeProps(overrides: Partial<MasonryProps<number>> = {}): MasonryProps<number> {
  return {
    items: Array.from({ length: 1000 }, (_, i) => i),
    itemHeight: (_, index, width) => oracle(index, width),
    targetColumnWidth: 240,
    minColumns: 1,
    maxColumns: 10,
    gap: 10,
    segmentSize: 100,
    hostRef: makeHost(),
    ...overrides,
  };
}

function scrollHost(host: HTMLElement, y: number) {
  host.scrollTop = y;
  host.dispatchEvent(new Event('scroll'));
}

describe('useVirtualScrollMasonry', () => {
  setupMocks();

  beforeEach(() => {
    clearMocks();
    vi.mocked(HTMLElement.prototype.scrollTo).mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('column geometry', () => {
    it('derives responsive columns and a fractional column width from the container width', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();

      // floor((1000 + 10) / (240 + 10)) = 4 columns, width (1000 - 3*10) / 4
      expect(result.columns.value).toBe(4);
      expect(result.columnWidth.value).toBeCloseTo(242.5, 6);
      wrapper.unmount();
    });

    it('falls back to prop defaults when geometry props are omitted', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry({
        items: Array.from({ length: 1000 }, (_, i) => i),
        itemHeight: (_, index, width) => oracle(index, width),
        hostRef: host,
      });
      await nextTick();
      await nextTick();
      // Defaults: targetColumnWidth 240, gap 10, min 1, max 10, segment 500.
      expect(result.columns.value).toBe(4);
      expect(result.columnWidth.value).toBeCloseTo(242.5, 6);
      expect(result.totalHeight.value).toBeGreaterThan(0);
      expect(result.renderedCards.value.length).toBeGreaterThan(0);
      wrapper.unmount();
    });

    it('falls back to DEFAULT_ITEM_SIZE when the oracle returns non-finite heights', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 300 }, (_, i) => i),
        itemHeight: (_, index, width) => (index % 7 === 0 ? Number.NaN : oracle(index, width)),
      }));
      await nextTick();
      await nextTick();
      const cards = result.renderedCards.value;
      expect(cards.some((card) => card.height === 40)).toBe(true);
      expect(cards.every((card) => Number.isFinite(card.height) && card.height > 0)).toBe(true);
      expect(Number.isFinite(result.totalHeight.value)).toBe(true);
      wrapper.unmount();
    });

    it('accepts an explicit zero gap', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 200 }, (_, i) => i),
        gap: 0,
      }));
      await nextTick();
      await nextTick();
      expect(result.renderedCards.value.length).toBeGreaterThan(0);
      expect(result.renderedCards.value.every((card) => Number.isFinite(card.y))).toBe(true);
      expect(result.totalHeight.value).toBeGreaterThan(0);
      wrapper.unmount();
    });

    it('clamps to minColumns on narrow containers and maxColumns on wide ones', async () => {
      const host = makeHost(60, 500);
      const { result, props, wrapper } = mountMasonry(makeProps({ hostRef: host, minColumns: 2, maxColumns: 5 }));
      await nextTick();
      await nextTick();
      expect(result.columns.value).toBe(2);

      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 3000 });
      triggerResize(host, 3000, 500);
      await nextTick();
      await nextTick();
      expect(result.columns.value).toBe(5);

      props.value.maxColumns = 3;
      await nextTick();
      expect(result.columns.value).toBe(3);
      wrapper.unmount();
    });

    it('reflows with the viewport anchored when measurements change heights', async () => {
      const host = makeHost(90, 500); // single column of uniform oracle heights
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 200 }, (_, i) => i),
        itemHeight: () => 100,
      }));
      await nextTick();
      await nextTick();

      const line = 1500;
      scrollHost(host, line);
      await nextTick();
      const cardsBefore = result.renderedCards.value;
      const anchor = pickAnchor(cardsBefore, line);
      const yBefore = cardsBefore.find((card) => card.index === anchor.index)?.y ?? 0;

      // Card 2 (above the anchor) grows by 900 px: the anchor keeps its delta.
      result.applyMeasurements([ { index: 2, height: 1000 } ]);
      await nextTick();
      await nextTick();
      const yAfter = result.renderedCards.value.find((card) => card.index === anchor.index)?.y ?? 0;
      expect(yAfter).toBeCloseTo(yBefore + 900, 4);
      expect(result.internalState.scrollY.value).toBeCloseTo(line + 900, 4);
      expect(result.totalHeight.value).toBeCloseTo(200 * 110 + 900, 4);
      wrapper.unmount();
    });

    it('ignores measurements equal to the oracle estimate (no reflow churn)', async () => {
      const host = makeHost(90, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 100 }, (_, i) => i),
        itemHeight: () => 100,
      }));
      await nextTick();
      await nextTick();
      const before = result.renderedCards.value.map((card) => [ card.index, card.y ]);
      const totalBefore = result.totalHeight.value;
      const scrollBefore = result.internalState.scrollY.value;

      result.applyMeasurements([ { index: 3, height: 100 } ]); // == oracle
      await nextTick();
      await nextTick();
      expect(result.renderedCards.value.map((card) => [ card.index, card.y ])).toEqual(before);
      expect(result.totalHeight.value).toBe(totalBefore);
      expect(result.internalState.scrollY.value).toBe(scrollBefore);
      wrapper.unmount();
    });

    it('tracks measurements across updates, disabling and dataset replacement', async () => {
      const host = makeHost(90, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 100 }, (_, i) => i),
        itemHeight: () => 100,
        measuredHeights: true,
      }));
      await nextTick();
      await nextTick();
      const baseTotal = result.totalHeight.value;

      // Measurements override the oracle.
      result.applyMeasurements([ { index: 5, height: 900 } ]);
      await nextTick();
      await nextTick();
      expect(result.totalHeight.value).toBeCloseTo(baseTotal + 800, 4);

      // Re-measurement replaces the stored value; reporting it again is a no-op.
      result.applyMeasurements([ { index: 5, height: 500 } ]);
      await nextTick();
      await nextTick();
      expect(result.totalHeight.value).toBeCloseTo(baseTotal + 400, 4);
      result.applyMeasurements([ { index: 5, height: 500 } ]);
      await nextTick();
      await nextTick();
      expect(result.totalHeight.value).toBeCloseTo(baseTotal + 400, 4);

      // Disabling clears every override and restores the oracle layout.
      props.value.measuredHeights = false;
      await nextTick();
      await nextTick();
      expect(result.totalHeight.value).toBeCloseTo(baseTotal, 4);

      // Re-enabling does not reflow until fresh measurements arrive.
      props.value.measuredHeights = true;
      await nextTick();
      await nextTick();
      expect(result.totalHeight.value).toBeCloseTo(baseTotal, 4);

      // New measurements apply again, then a new dataset drops them all.
      result.applyMeasurements([ { index: 7, height: 900 } ]);
      await nextTick();
      await nextTick();
      expect(result.totalHeight.value).toBeCloseTo(baseTotal + 800, 4);
      props.value.items = Array.from({ length: 100 }, (_, i) => i + 100);
      await nextTick();
      await nextTick();
      expect(result.totalHeight.value).toBeCloseTo(baseTotal, 4);

      // Disabling with an empty measurement map is a safe no-op.
      props.value.measuredHeights = false;
      await nextTick();
      await nextTick();
      expect(result.totalHeight.value).toBeCloseTo(baseTotal, 4);
      wrapper.unmount();
    });

    it('rejects malformed measurement entries and epsilon-sized changes', async () => {
      const host = makeHost(90, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 100 }, (_, i) => i),
        itemHeight: () => 100,
      }));
      await nextTick();
      await nextTick();
      const totalBefore = result.totalHeight.value;

      result.applyMeasurements([
        { index: Number.NaN, height: 500 },
        { index: -1, height: 500 },
        { index: 1.5, height: 500 },
        { index: 2, height: Number.NaN },
      ]);
      await nextTick();
      expect(result.totalHeight.value).toBe(totalBefore);

      result.applyMeasurements([ { index: 2, height: 100.4 } ]); // below epsilon
      await nextTick();
      expect(result.totalHeight.value).toBe(totalBefore);
      wrapper.unmount();
    });

    it('tolerates programmatic calls and refresh before the container is measured', async () => {
      const host = makeHost(0, 0);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      // No layout exists yet: calls resolve to safe no-ops.
      result.scrollToOffset(5000);
      result.scrollToOffset(Number.POSITIVE_INFINITY);
      result.scrollToIndex(10, { align: 'center' });
      result.applyMeasurements([ { index: 2, height: 900 } ]);
      result.refresh();
      await nextTick();
      expect(result.internalState.scrollY.value).toBe(0);

      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 1000 });
      Object.defineProperty(host, 'clientHeight', { configurable: true, value: 500 });
      triggerResize(host, 1000, 500);
      await nextTick();
      await nextTick();
      expect(result.columns.value).toBe(4);
      expect(result.renderedCards.value.length).toBeGreaterThan(0);
      wrapper.unmount();
    });

    it('stays at zero columns until the container is measured', async () => {
      const host = makeHost(0, 0);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();
      expect(result.columns.value).toBe(0);
      expect(result.renderedCards.value).toHaveLength(0);
      wrapper.unmount();
    });
  });

  describe('rendering window', () => {
    it('renders exactly the cards intersecting the viewport window, index-ascending', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();

      const ref = greedyReference(1000, 4, 242.5, 10);
      const expected = expectedWindow(ref, 1000, 0, 500);
      expect(result.renderedCards.value.map((card) => card.index)).toEqual(expected);
      wrapper.unmount();
    });

    it('matches the brute-force window at a deep offset, bit-identically', async () => {
      const host = makeHost(1000, 500);
      const count = 20000;
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: count }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      const ref = greedyReference(count, 4, 242.5, 10);
      const line = 650_000;
      expect(line).toBeLessThan(ref.total);
      scrollHost(host, line);
      await nextTick();
      await nextTick();

      const cards = result.renderedCards.value;
      expect(cards.map((card) => card.index)).toEqual(expectedWindow(ref, count, line, line + 500));
      expect(cards.length).toBeLessThan(300);
      expect(Math.min(...cards.map((card) => card.index))).toBeGreaterThan(15_000);
      wrapper.unmount();
    });

    it('keeps the DOM window bounded while scrolling through the whole dataset', async () => {
      const host = makeHost(1000, 500);
      const heightOf = (index: number) => 80 + (index % 5) * 10;
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 20000 }, (_, i) => i),
        itemHeight: (_, index) => heightOf(index),
      }));
      await nextTick();
      await nextTick();

      let maxCards = 0;
      const ref = greedyReference(20000, 4, 242.5, 10, (index) => heightOf(index));
      for (let y = 0; y < 400_000; y += 2000) {
        scrollHost(host, y);
        await nextTick();
        const cards = result.renderedCards.value;
        maxCards = Math.max(maxCards, cards.length);
        expect(cards.length).toBeLessThan(400);
        expect(cards.length).toBeGreaterThan(0);
        expect(cards.map((card) => card.index)).toEqual(expectedWindow(ref, 20000, y, y + 500, (index) => heightOf(index)));
      }
      expect(maxCards).toBeLessThan(400);
      wrapper.unmount();
    });

    it('supports sparse datasets: holes render with undefined items', async () => {
      const host = makeHost(1000, 500);
      const sparse: number[] = [];
      sparse.length = 1000;
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host, items: sparse }));
      await nextTick();
      await nextTick();
      expect(result.renderedCards.value.length).toBeGreaterThan(0);
      expect(result.renderedCards.value.some((card) => card.item === undefined)).toBe(true);
      wrapper.unmount();
    });
  });

  describe('total height', () => {
    it('estimates the total until the chain reaches the end, then reports it exact', async () => {
      const host = makeHost(1000, 500);
      // The first segment is much taller than the rest: the extrapolated total
      // overshoots, so reaching the estimate end must settle on the true end.
      const heightOf = (index: number) => (index < 10 ? 5000 : 100);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 1000 }, (_, i) => i),
        itemHeight: (_, index) => heightOf(index),
      }));
      await nextTick();
      await nextTick();

      const estimated = result.totalHeight.value;
      expect(estimated).toBeGreaterThan(0);
      expect(result.totalHeightExact.value).toBe(false);

      scrollHost(host, estimated - 500);
      await nextTick();
      await nextTick();
      // Reading the window at the estimate end drives the chain to the true end
      // (the window itself is empty: the estimate lies beyond the real content).
      // eslint-disable-next-line ts/no-unused-expressions
      result.renderedCards.value;
      await nextTick();
      await nextTick();

      const ref = greedyReference(1000, 4, 242.5, 10, (index) => heightOf(index));
      expect(result.totalHeightExact.value).toBe(true);
      expect(result.totalHeight.value).toBeCloseTo(ref.total, 4);
      // The scroll position was clamped to the real bottom instead of hanging
      // beyond the content.
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, ref.total - 500), 4);
      wrapper.unmount();
    });

    it('re-clamps a pending end scroll when the chain settles on a shorter true total', async () => {
      const host = makeHost(1000, 500);
      // The first segment is tall, the rest is short: the initial extrapolation
      // overshoots the true total.
      const heightOf = (index: number) => (index < 100 ? 400 : 40);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 2000 }, (_, i) => i),
        itemHeight: (_, index) => heightOf(index),
      }));
      await nextTick();
      await nextTick();
      const estimated = result.totalHeight.value;
      expect(estimated).toBeGreaterThan(20_000);

      // Jumping to the estimated end completes the chain while the end intent
      // is still pending; the end intent re-clamps to the settled true end.
      result.scrollToOffset(Number.POSITIVE_INFINITY);
      await nextTick();
      await nextTick();

      const ref = greedyReference(2000, 4, 242.5, 10, (index) => heightOf(index));
      expect(result.totalHeightExact.value).toBe(true);
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, ref.total - 500), 4);
      wrapper.unmount();
    });
  });

  describe('programmatic scroll', () => {
    it('scrollToIndex lands a far index on the exact canonical position without NaN', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 10000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      const targetIndex = 9500;
      const resolved = result.scrollToIndex(targetIndex, { align: 'start', behavior: 'auto' });
      const ref = greedyReference(10000, 4, 242.5, 10);
      expect(resolved.targetY).toBeCloseTo(ref.y[ targetIndex ]!, 4);
      expect(result.internalState.scrollY.value).toBeCloseTo(ref.y[ targetIndex ]!, 4);
      expect(Number.isFinite(result.scrollDetails.value.totalSize.height)).toBe(true);
      await nextTick();
      const cards = result.renderedCards.value;
      expect(cards.some((card) => card.index === targetIndex)).toBe(true);
      expect(cards.length).toBeLessThan(300);
      wrapper.unmount();
    });

    it('applies center and end alignment and respects viewport clamping', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 5000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      const ref = greedyReference(5000, 4, 242.5, 10);
      const idx = 100;
      const height = oracle(idx, 242.5);

      const centered = result.scrollToIndex(idx, { align: 'center', behavior: 'auto' });
      expect(centered.targetY).toBeCloseTo(ref.y[ idx ]! - (500 - height) / 2, 4);

      // End alignment puts the card's own bottom flush with the viewport end
      // (the deepest column may sit lower than the target card).
      const last = 4999;
      const ended = result.scrollToIndex(last, { align: 'end', behavior: 'auto' });
      const lastBottom = ref.y[ last ]! + oracle(last, 242.5);
      expect(ended.targetY).toBeCloseTo(Math.max(0, lastBottom - 500), 4);

      const top = result.scrollToIndex(0, { align: 'end', behavior: 'auto' });
      expect(top.targetY).toBe(0);
      wrapper.unmount();
    });

    it('dryRun computes the target without scrolling', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();
      const before = host.scrollTop;
      const resolved = result.scrollToIndex(500, { align: 'start', behavior: 'auto', dryRun: true });
      expect(resolved.targetY).toBeGreaterThan(0);
      expect(host.scrollTop).toBe(before);
      wrapper.unmount();
    });

    it('resolves every alignment/behavior option shape', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 2000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      const ref = greedyReference(2000, 4, 242.5, 10);
      const idx = 600;
      const h = oracle(idx, 242.5);
      const scrollCalls = () => vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.length;

      scrollHost(host, 0);
      await nextTick();

      // Plain string alignment, default smooth behavior.
      const centered = result.scrollToIndex(idx, 'center');
      expect(centered.targetY).toBeCloseTo(ref.y[ idx ]! - (500 - h) / 2, 4);
      expect(scrollCalls()).toBeGreaterThan(0);

      // Nested alignment object plus explicit auto behavior.
      scrollHost(host, 0);
      await nextTick();
      const ended = result.scrollToIndex(idx, { align: { y: 'end' }, behavior: 'auto' });
      expect(ended.targetY).toBeCloseTo(Math.max(0, ref.y[ idx ]! - (500 - h)), 4);

      // Axis options object (x ignored): y falls back to 'auto' -> start for
      // content below the viewport.
      scrollHost(host, 0);
      await nextTick();
      const axisOpts = result.scrollToIndex(idx, { x: 'center' });
      expect(axisOpts.targetY).toBeCloseTo(ref.y[ idx ]!, 4);

      // Behavior-only options.
      scrollHost(host, 0);
      await nextTick();
      const behaviorOnly = result.scrollToIndex(idx, { behavior: 'auto' });
      expect(behaviorOnly.targetY).toBeCloseTo(ref.y[ idx ]!, 4);

      // Nested dry-run: target computed, nothing scrolled.
      const callsBefore = scrollCalls();
      const dry = result.scrollToIndex(idx, { align: { y: 'center' }, dryRun: true });
      expect(dry.targetY).toBeCloseTo(ref.y[ idx ]! - (500 - h) / 2, 4);
      expect(scrollCalls()).toBe(callsBefore);
      wrapper.unmount();
    });

    it('clears programmatic state and pending intents when a smooth scroll settles', async () => {
      vi.useFakeTimers();
      const host = makeHost(1000, 500);
      const { result, props, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 5000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      result.scrollToIndex(3000, { align: 'center' });
      expect(result.internalState.isProgrammaticScroll.value).toBe(true);
      expect(result.internalState.isScrolling.value).toBe(true);

      // Mid-animation state survives the first scroll-end window.
      vi.advanceTimersByTime(300);
      expect(result.internalState.isProgrammaticScroll.value).toBe(true);

      // After the smooth-scroll budget the flags and the intent are cleared.
      vi.advanceTimersByTime(800);
      await nextTick();
      expect(result.internalState.isProgrammaticScroll.value).toBe(false);
      vi.advanceTimersByTime(200);
      expect(result.internalState.isScrolling.value).toBe(false);

      // With no pending intent, a later layout change only clamps the position
      // to the (smaller) content instead of re-targeting an item.
      props.value.items = Array.from({ length: 2000 }, (_, i) => i);
      await nextTick();
      await nextTick();
      const ref = greedyReference(2000, 4, 242.5, 10);
      const max = Math.max(0, ref.total - 500);
      expect(result.internalState.scrollY.value).toBeLessThanOrEqual(max + 0.5);
      expect(result.internalState.scrollY.value).toBeGreaterThan(0);
      wrapper.unmount();
    });

    it('scrollToIndex without options scrolls smoothly; auto alignment above the viewport aligns the end', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 2000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      // No options: default 'auto' alignment with smooth behavior.
      const target = 1200;
      const ref = greedyReference(2000, 4, 242.5, 10);
      const resolved = result.scrollToIndex(target);
      expect(resolved.targetY).toBeCloseTo(ref.y[ target ]!, 4);
      expect(vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.at(-1)?.[ 0 ]).toEqual(expect.objectContaining({ behavior: 'smooth' }));
      await nextTick();

      // Auto alignment of a card above the viewport aligns its end instead.
      scrollHost(host, ref.y[ target ]! + 40_000);
      await nextTick();
      const above = result.scrollToIndex(10, { align: 'auto', behavior: 'auto' });
      const h = oracle(10, 242.5);
      expect(above.targetY).toBeCloseTo(Math.max(0, ref.y[ 10 ]! - (500 - h)), 4);
      wrapper.unmount();
    });

    it('supports nested alignment objects without y and accepts null offsets as no-ops', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 2000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();
      const ref = greedyReference(2000, 4, 242.5, 10);

      // Nested alignment without y falls back to 'auto' (below -> start).
      scrollHost(host, 0);
      await nextTick();
      const nested = result.scrollToIndex(900, { align: { x: 'center' }, behavior: 'auto' });
      expect(nested.targetY).toBeCloseTo(ref.y[ 900 ]!, 4);

      // Null/undefined offsets are accepted no-ops.
      const callsBefore = vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.length;
      result.scrollToOffset(null);
      result.scrollToOffset(undefined);
      expect(vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.length).toBe(callsBefore);
      wrapper.unmount();
    });

    it('leaves the scroll position untouched when geometry options change without changing columns', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();

      scrollHost(host, 2000);
      await nextTick();
      const before = result.internalState.scrollY.value;
      expect(before).toBe(2000);

      // targetColumnWidth 240 -> 200 keeps 4 columns and the same fractional
      // width, so no relayout happens.
      props.value.targetColumnWidth = 200;
      await nextTick();
      await nextTick();
      expect(result.columns.value).toBe(4);
      expect(result.internalState.scrollY.value).toBe(before);
      expect(result.renderedCards.value.length).toBeGreaterThan(0);
      wrapper.unmount();
    });

    it('auto alignment keeps a fully visible card in place and returns the current position', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();
      scrollHost(host, 0);
      await nextTick();
      const resolved = result.scrollToIndex(0, { align: 'auto' });
      expect(resolved.targetY).toBe(0);
      wrapper.unmount();
    });

    it('scrollToOffset clamps negative, overflow and infinite offsets', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();
      const max = result.totalHeight.value - 500;

      result.scrollToOffset(-1000);
      expect(result.internalState.scrollY.value).toBe(0);

      result.scrollToOffset(10 ** 9);
      expect(result.internalState.scrollY.value).toBeCloseTo(max, 4);

      result.scrollToOffset(Number.NEGATIVE_INFINITY);
      expect(result.internalState.scrollY.value).toBe(0);

      result.scrollToOffset(Number.POSITIVE_INFINITY);
      expect(result.internalState.scrollY.value).toBeCloseTo(max, 4);
      wrapper.unmount();
    });

    it('rejects out-of-range scrollToIndex calls without scrolling', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();
      const callsBefore = vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.length;
      expect(result.scrollToIndex(100_000).targetY).toBe(0);
      expect(result.scrollToIndex(-3).targetY).toBe(0);
      expect(result.scrollToIndex(undefined).targetY).toBe(0);
      expect(vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.length).toBe(callsBefore);
      wrapper.unmount();
    });
  });

  describe('anchoring and relayout', () => {
    it('pins the topmost visible card at its screen offset across a column reflow', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 5000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      const line = 3000;
      scrollHost(host, line);
      await nextTick();
      const anchor = pickAnchor(result.renderedCards.value, line);
      expect(anchor.index).toBeGreaterThanOrEqual(0);

      // Narrow the container: 4 columns become 2, every height changes too.
      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 600 });
      triggerResize(host, 600, 500);
      await nextTick();
      await nextTick();

      const ref = greedyReference(5000, 2, 295, 10);
      expect(result.internalState.scrollY.value).toBeCloseTo(ref.y[ anchor.index ]! + anchor.delta, 4);
      const after = result.renderedCards.value;
      const still = after.find((card) => card.index === anchor.index)!;
      expect(still.y).toBeCloseTo(ref.y[ anchor.index ]!, 4);
      // The anchored card still straddles the viewport top at the same delta.
      expect(still.y <= result.internalState.scrollY.value && still.y + still.height > result.internalState.scrollY.value).toBe(true);
      wrapper.unmount();
    });

    it('stays docked at the bottom when the content grows through a reflow', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 1000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      result.scrollToOffset(Number.POSITIVE_INFINITY, { behavior: 'auto' });
      await nextTick();
      expect(result.internalState.scrollY.value).toBeGreaterThan(0);

      // Doubling the dataset grows the content: the viewport stays at the end.
      props.value.items = Array.from({ length: 2000 }, (_, i) => i);
      await nextTick();
      await nextTick();
      // eslint-disable-next-line ts/no-unused-expressions
      result.renderedCards.value;
      await nextTick();
      await nextTick();
      const ref = greedyReference(2000, 4, 242.5, 10);
      expect(result.totalHeightExact.value).toBe(true);
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, ref.total - 500), 4);
      wrapper.unmount();
    });

    it('re-applies a pending index intent after the dataset is replaced', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 5000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      result.scrollToIndex(1500, { align: 'center', behavior: 'auto' });
      await nextTick();

      // Replacing the dataset mid-intent recomputes the target on the new layout.
      props.value.items = Array.from({ length: 3000 }, (_, i) => i);
      await nextTick();
      await nextTick();

      const ref = greedyReference(3000, 4, 242.5, 10);
      const h = oracle(1500, 242.5);
      const expected = Math.max(0, Math.min(ref.y[ 1500 ]! - (500 - h) / 2, ref.total - 500));
      expect(result.internalState.scrollY.value).toBeCloseTo(expected, 4);
      wrapper.unmount();
    });

    it('anchors to the card below when the viewport line sits in a column gap', async () => {
      const host = makeHost(90, 500); // single column: consecutive cards are separated by exactly `gap` px
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 200 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      const refOld = greedyReference(200, 1, 90, 10);
      const idx = 3;
      const line = refOld.y[ idx ]! + oracle(idx, 90) + 5; // inside the gap under card 3
      scrollHost(host, line);
      await nextTick();
      const belowIndex = 4; // the next card in the single column
      expect(refOld.y[ belowIndex ]!).toBeGreaterThan(line);

      // Widen the container (1 -> 2 columns): the card below the line keeps its
      // screen delta (negative: the line stays above its top by the gap remainder).
      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 600 });
      triggerResize(host, 600, 500);
      await nextTick();
      await nextTick();

      const refNew = greedyReference(200, 2, 295, 10);
      const delta = line - refOld.y[ belowIndex ]!;
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, refNew.y[ belowIndex ]! + delta), 4);
      wrapper.unmount();
    });

    it('skips the pending intent when the target index leaves the dataset', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 3000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      result.scrollToIndex(2500, { align: 'center', behavior: 'auto' });
      await nextTick();
      // The pending index no longer exists: the settle resolves to null and the
      // scroll position is only clamped, never yanked or NaN.
      props.value.items = Array.from({ length: 100 }, (_, i) => i);
      await nextTick();
      await nextTick();
      const max = Math.max(0, greedyReference(100, 4, 242.5, 10).total - 500);
      expect(Number.isFinite(result.internalState.scrollY.value)).toBe(true);
      expect(result.internalState.scrollY.value).toBeLessThanOrEqual(max + 0.5);
      wrapper.unmount();
    });

    it('clamps a pending plain offset when the dataset shrinks', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 5000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      // A plain (non-end) offset intent survives a layout change and clamps.
      result.scrollToOffset(120_000, { behavior: 'auto' });
      await nextTick();
      props.value.items = Array.from({ length: 2000 }, (_, i) => i);
      await nextTick();
      await nextTick();
      const ref = greedyReference(2000, 4, 242.5, 10);
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, ref.total - 500), 4);
      wrapper.unmount();
    });

    it('re-layouts after refresh() with the scroll position re-anchored', async () => {
      const host = makeHost(1000, 500);
      const items = Array.from({ length: 2000 }, (_, i) => i);
      const { props, result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items,
        itemHeight: (_, index) => 60 + (index % 10) * 5,
      }));
      await nextTick();
      await nextTick();

      const line = 2500;
      scrollHost(host, line);
      await nextTick();
      const before = result.renderedCards.value.find((card) => card.y <= line && card.y + card.height > line)!;
      expect(before).toBeDefined();

      // In-place content change is invisible to the layout until refresh().
      items[ 0 ] = -1;
      props.value.itemHeight = (_, index) => (index === before.index ? 1000 : 60 + (index % 10) * 5);
      result.refresh();
      await nextTick();
      await nextTick();

      // The same card still anchors the viewport top line with the same screen
      // delta: the refresh kept the exact scroll position.
      expect(result.internalState.scrollY.value).toBeCloseTo(line, 4);
      const after = result.renderedCards.value.find((card) => card.index === before.index)!;
      expect(after).toBeDefined();
      expect(after.y).toBeCloseTo(before.y, 4);
      expect(after.height).toBe(1000);
      wrapper.unmount();
    });

    it('clamps the scroll position when the dataset is replaced by a shorter one', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 5000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      // The first overshoot clamps to the estimated end; the window there
      // completes the chain, and the next overshoot clamps to the exact end.
      scrollHost(host, 200_000);
      await nextTick();
      // eslint-disable-next-line ts/no-unused-expressions
      result.renderedCards.value;
      await nextTick();
      await nextTick();
      const firstRef = greedyReference(5000, 4, 242.5, 10);
      expect(result.internalState.scrollY.value).toBeLessThanOrEqual(Math.max(0, firstRef.total - 500) + 0.5);
      scrollHost(host, 200_000);
      await nextTick();
      await nextTick();
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, firstRef.total - 500), 4);

      props.value.items = Array.from({ length: 100 }, (_, i) => i);
      await nextTick();
      await nextTick();
      const ref = greedyReference(100, 4, 242.5, 10);
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, ref.total - 500), 4);
      wrapper.unmount();
    });

    it('reattaches to a new host element when hostRef changes', async () => {
      const hostA = makeHost(1000, 500);
      const hostB = makeHost(1200, 600);
      const { props, result, wrapper } = mountMasonry(makeProps({ hostRef: hostA }));
      await nextTick();
      await nextTick();
      expect(result.internalState.viewportWidth.value).toBe(1000);

      props.value.hostRef = hostB;
      await nextTick();
      expect(result.internalState.viewportWidth.value).toBe(1200);
      expect(result.internalState.viewportHeight.value).toBe(600);

      // Scrolls on the old host no longer move the state; the new host drives it.
      scrollHost(hostA, 5000);
      await nextTick();
      const afterOld = result.internalState.scrollY.value;
      scrollHost(hostB, 3000);
      await nextTick();
      expect(result.internalState.scrollY.value).toBe(3000);
      expect(afterOld).not.toBe(3000);
      wrapper.unmount();
    });

    it('guards scroll events racing a host detach', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();

      // A native event that lands after hostRef is nulled (before the watcher
      // flush detaches the listener) must not throw or move the state.
      props.value.hostRef = null;
      host.scrollTop = 1234;
      host.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(Number.isFinite(result.internalState.scrollY.value)).toBe(true);
      wrapper.unmount();
    });

    it('re-anchors from the end gap when the docked line has no straddling card', async () => {
      const host = makeHost(90, 500); // single column of uniform cards
      const heightOf = () => 100;
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 200 }, (_, i) => i),
        itemHeight: (_, _index) => heightOf(),
      }));
      await nextTick();
      await nextTick();

      result.scrollToOffset(Number.POSITIVE_INFINITY, { behavior: 'auto' });
      await nextTick();
      const ref = greedyReference(200, 1, 90, 10, () => heightOf());
      expect(result.internalState.scrollY.value).toBeCloseTo(ref.total - 500, 4);

      // Reflow while docked: no card straddles the line (all cards are shorter
      // than the viewport), so the end-gap anchor keeps the viewport docked.
      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 400 });
      triggerResize(host, 400, 500);
      await nextTick();
      await nextTick();
      const ref400 = greedyReference(200, 1, 400, 10, () => heightOf());
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, ref400.total - 500), 4);
      wrapper.unmount();
    });

    it('re-anchors safely when a resize happens while the window is empty', async () => {
      const host = makeHost(1000, 0); // zero-height viewport: nothing renders
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 40 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();
      expect(result.renderedCards.value).toHaveLength(0);

      scrollHost(host, 100_000);
      await nextTick();
      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 600 });
      triggerResize(host, 600, 0);
      await nextTick();
      await nextTick();
      expect(Number.isFinite(result.internalState.scrollY.value)).toBe(true);
      expect(result.internalState.scrollY.value).toBeGreaterThanOrEqual(0);
      wrapper.unmount();
    });

    it('tolerates scrollToIndex and scrollToOffset with no attached host', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();
      expect(result.columns.value).toBe(4);

      props.value.hostRef = null;
      await nextTick();
      // Layout state persists, but no native scroll can be performed.
      result.scrollToIndex(100, { align: 'start' });
      result.scrollToOffset(5000);
      expect(result.internalState.isProgrammaticScroll.value).toBe(false);

      props.value.hostRef = host;
      await nextTick();
      result.scrollToIndex(100, { align: 'start', behavior: 'auto' });
      expect(result.internalState.isProgrammaticScroll.value).toBe(true);
      wrapper.unmount();
    });

    it('docks at the end when a resize happens while scrolled past the content', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 2000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      scrollHost(host, 10 ** 9);
      await nextTick();
      await nextTick();
      // The first overshoot clamps to the estimated end; the window there
      // completes the chain, and the next overshoot clamps to the exact bottom.
      scrollHost(host, 10 ** 9);
      await nextTick();
      await nextTick();
      const oldRef = greedyReference(2000, 4, 242.5, 10);
      expect(result.internalState.scrollY.value).toBeLessThanOrEqual(Math.max(0, oldRef.total - 500) + 0.5);
      // eslint-disable-next-line ts/no-unused-expressions
      result.renderedCards.value;
      await nextTick();
      scrollHost(host, 10 ** 9);
      await nextTick();
      await nextTick();
      expect(result.internalState.scrollY.value).toBeCloseTo(Math.max(0, oldRef.total - 500), 4);

      // A reflow while docked at the end stays at the (estimated) new end and
      // never goes NaN; once the chain settles, scrolling to the end clamps to
      // the exact new content end.
      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 600 });
      triggerResize(host, 600, 500);
      await nextTick();
      await nextTick();
      const ref = greedyReference(2000, 2, 295, 10);
      const max = Math.max(0, ref.total - 500);
      expect(Number.isFinite(result.internalState.scrollY.value)).toBe(true);
      expect(result.internalState.scrollY.value).toBeLessThanOrEqual(max + 0.5);

      scrollHost(host, 10 ** 9);
      await nextTick();
      await nextTick();
      expect(result.internalState.scrollY.value).toBeCloseTo(max, 4);
      wrapper.unmount();
    });

    it('clears everything when the dataset becomes empty', async () => {
      const host = makeHost(1000, 500);
      const { props, result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();
      expect(result.renderedCards.value.length).toBeGreaterThan(0);

      props.value.items = [];
      await nextTick();
      await nextTick();
      expect(result.renderedCards.value).toHaveLength(0);
      expect(result.totalHeight.value).toBe(0);
      expect(result.columns.value).toBe(0);
      expect(result.scrollDetails.value.totalSize.height).toBe(0);
      wrapper.unmount();
    });
  });

  describe('scroll details', () => {
    it('reports current, end and range indices following the scroll position', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({ hostRef: host }));
      await nextTick();
      await nextTick();

      expect(result.scrollDetails.value.currentIndex).toBe(0);
      const details = result.scrollDetails.value;
      expect(details.range.start).toBe(0);
      expect(details.range.end).toBeGreaterThan(details.range.start);
      expect(details.columnRange.end).toBe(4);
      expect(details.displayScrollOffset.y).toBe(0);
      expect(details.viewportSize).toEqual({ width: 1000, height: 500 });
      wrapper.unmount();
    });

    it('never produces NaN geometry after extreme programmatic scrolls', async () => {
      const host = makeHost(1000, 500);
      const { result, wrapper } = mountMasonry(makeProps({
        hostRef: host,
        items: Array.from({ length: 20000 }, (_, i) => i),
      }));
      await nextTick();
      await nextTick();

      for (const y of [ 10_000_000, -10_000_000, 0, 123_456.789, 1 ]) {
        result.scrollToOffset(y);
        await nextTick();
        const d = result.scrollDetails.value;
        expect(Number.isFinite(d.totalSize.height)).toBe(true);
        expect(Number.isFinite(d.scrollOffset.y)).toBe(true);
        expect(d.items.every((card) => [ card.x, card.y, card.width, card.height ].every(Number.isFinite))).toBe(true);
        expect(result.totalHeight.value).toBeGreaterThan(0);
      }
      wrapper.unmount();
    });
  });
});
