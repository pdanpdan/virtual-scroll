import type { ScrollAlignment, ScrollDetails, VirtualScrollProps } from '../../src/types';
import type { Mock } from 'vitest';
import type { MaybeRefOrGetter, Ref } from 'vue';

import { describe, expect, it, vi } from 'vitest';
import { reactive, ref } from 'vue';

import { useVirtualScrollKeyboard } from '../../src/composables/useVirtualScrollKeyboard';

describe('useVirtualScrollKeyboard', () => {
  const makeScrollDetails = (overrides: Partial<ScrollDetails<unknown>> = {}): ScrollDetails<unknown> => ({
    scrollOffset: { x: 0, y: 0 },
    viewportSize: { width: 500, height: 500 },
    displayViewportSize: { width: 500, height: 500 },
    displayScrollOffset: { x: 0, y: 0 },
    currentIndex: 0,
    currentEndIndex: 9,
    currentColIndex: 0,
    currentEndColIndex: 9,
    items: [],
    totalSize: { width: 5000, height: 5000 },
    isScrolling: false,
    isProgrammaticScroll: false,
    range: { start: 0, end: 10 },
    columnRange: { start: 0, end: 10, padStart: 0, padEnd: 0 },
    ...overrides,
  });

  const makeProps = (overrides: Partial<VirtualScrollProps<unknown>> = {}): VirtualScrollProps<unknown> => ({
    items: Array.from({ length: 100 }, () => ({})),
    direction: 'vertical',
    ...overrides,
  } as VirtualScrollProps<unknown>);

  const makeKeyboard = (
    scrollDetails: Ref<ScrollDetails<unknown>>,
    props: VirtualScrollProps<unknown>,
    overrides: {
      isRtl?: boolean;
      /** Passed only when given: without it the composable default (`'viewport'`) applies. */
      activationMode?: MaybeRefOrGetter<'item' | 'viewport'>;
      onActivate?: Mock<(index: number) => void>;
      scrollToIndex?: Mock<(rowIndex?: number | null, colIndex?: number | null, options?: { align?: ScrollAlignment | 'auto'; behavior?: 'auto' | 'smooth'; }) => void>;
      scrollToOffset?: Mock<(x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void>;
      getLoadingSlotSize?: () => number;
      stopProgrammaticScroll?: Mock<() => void>;
      getRowHeight?: (i: number) => number;
      getColumnWidth?: (i: number) => number;
      getRowOffset?: (i: number) => number;
      getColumnOffset?: (i: number) => number;
      getItemOffset?: (i: number) => number;
      getItemSize?: (i: number) => number;
      getRowIndexAt?: (o: number) => number;
      getColumnIndexAt?: (o: number) => number;
    } = {},
  ) => useVirtualScrollKeyboard({
    props,
    virtualScrollProps: ref(props),
    scrollDetails,
    isRtl: ref(overrides.isRtl ?? false),
    scrollToIndex: overrides.scrollToIndex ?? (vi.fn() as unknown as Mock<(rowIndex?: number | null, colIndex?: number | null, options?: { align?: ScrollAlignment | 'auto'; behavior?: 'auto' | 'smooth'; }) => void>),
    scrollToOffset: overrides.scrollToOffset ?? (vi.fn() as unknown as Mock<(x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void>),
    stopProgrammaticScroll: overrides.stopProgrammaticScroll ?? (vi.fn() as unknown as Mock<() => void>),
    getRowHeight: overrides.getRowHeight ?? (() => 50),
    getColumnWidth: overrides.getColumnWidth ?? (() => 50),
    getRowOffset: overrides.getRowOffset ?? ((idx) => idx * 50),
    getColumnOffset: overrides.getColumnOffset ?? ((idx) => idx * 50),
    getItemOffset: overrides.getItemOffset ?? ((idx) => idx * 50),
    getItemSize: overrides.getItemSize ?? (() => 50),
    getRowIndexAt: overrides.getRowIndexAt ?? ((o) => Math.floor(o / 50)),
    getColumnIndexAt: overrides.getColumnIndexAt ?? ((o) => Math.floor(o / 50)),
    // The cases above describe the default (`'viewport'`) behaviour: they pass
    // no `activationMode` at all. The roving model is opted into explicitly by
    // the activation-mode cases below.
    ...(overrides.activationMode === undefined ? {} : { activationMode: overrides.activationMode }),
    ...(overrides.onActivate ? { onActivate: overrides.onActivate } : {}),
    ...(overrides.getLoadingSlotSize ? { getLoadingSlotSize: overrides.getLoadingSlotSize } : {}),
  });

  // Browser keydown events are cancelable, so `preventDefault()` is observable.
  const pressKey = (key: string) => new KeyboardEvent('keydown', { key, cancelable: true });

  // ── Home / End ──────────────────────────────────────────────────────────────

  it('home key scrolls to start (smooth, close)', () => {
    const scrollDetails = ref(makeScrollDetails({ scrollOffset: { x: 0, y: 100 } }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('Home'));
    expect(scrollToIndex).toHaveBeenCalledWith(0, 0, { behavior: 'smooth', align: 'start' });
  });

  it('home key scrolls to start (auto, far away)', () => {
    const scrollDetails = ref(makeScrollDetails({ scrollOffset: { x: 0, y: 10000 } }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('Home'));
    expect(scrollToIndex).toHaveBeenCalledWith(0, 0, { behavior: 'auto', align: 'start' });
  });

  it('end key scrolls to the end of the content (vertical)', () => {
    const scrollDetails = ref(makeScrollDetails({ scrollOffset: { x: 0, y: 0 }, totalSize: { width: 5000, height: 5000 } }));
    const scrollToOffset = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToOffset });

    handleKeyDown(pressKey('End'));
    expect(scrollToOffset).toHaveBeenCalledWith(null, 4500, { behavior: 'smooth' });
  });

  it('end key scrolls to the end of the content (horizontal)', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToOffset = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToOffset });

    handleKeyDown(pressKey('End'));
    expect(scrollToOffset).toHaveBeenCalledWith(4500, null, { behavior: 'smooth' });
  });

  it('end key scrolls to the end of the content (both directions)', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToOffset = vi.fn();
    const props = makeProps({ direction: 'both', columnCount: 10 });
    const { handleKeyDown } = makeKeyboard(scrollDetails, props, { scrollToOffset });

    handleKeyDown(pressKey('End'));
    expect(scrollToOffset).toHaveBeenCalledWith(4500, 4500, { behavior: 'smooth' });
  });

  it('end key includes the loading slot height (vertical)', () => {
    const scrollDetails = ref(makeScrollDetails({ scrollOffset: { x: 0, y: 0 }, totalSize: { width: 5000, height: 5000 } }));
    const scrollToOffset = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToOffset, getLoadingSlotSize: () => 56 });

    handleKeyDown(pressKey('End'));
    expect(scrollToOffset).toHaveBeenCalledWith(null, 4556, { behavior: 'smooth', endExtraY: 56 });
  });

  it('end key includes the loading slot height (horizontal)', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToOffset = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToOffset, getLoadingSlotSize: () => 56 });

    handleKeyDown(pressKey('End'));
    expect(scrollToOffset).toHaveBeenCalledWith(4556, null, { behavior: 'smooth', endExtraX: 56 });
  });

  it('end key includes the loading slot height (both directions)', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToOffset = vi.fn();
    const props = makeProps({ direction: 'both', columnCount: 10 });
    const { handleKeyDown } = makeKeyboard(scrollDetails, props, { scrollToOffset, getLoadingSlotSize: () => 56 });

    handleKeyDown(pressKey('End'));
    expect(scrollToOffset).toHaveBeenCalledWith(4500, 4556, { behavior: 'smooth', endExtraY: 56 });
  });

  it('home key scrolls to the start of a horizontal list', () => {
    const scrollDetails = ref(makeScrollDetails({ scrollOffset: { x: 100, y: 0 } }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToIndex });

    handleKeyDown(pressKey('Home'));
    // distance 100 is below 10 viewports (5000), so the move is animated
    expect(scrollToIndex).toHaveBeenCalledWith(0, 0, { behavior: 'smooth', align: 'start' });
  });

  it('end key jumps instantly when the remaining distance is large', () => {
    const scrollDetails = ref(makeScrollDetails({ totalSize: { width: 200000, height: 200000 } }));
    const scrollToOffset = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToOffset });

    handleKeyDown(pressKey('End'));
    // distance (200000 - 500) is above 10 viewports (5000), so the move is instant
    expect(scrollToOffset).toHaveBeenCalledWith(null, 199500, { behavior: 'auto' });
  });

  // ── ArrowUp / ArrowDown ─────────────────────────────────────────────────────

  it('arrow down navigates forward (default, item already at bottom)', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 500 },
      currentEndIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    // getRowOffset(9) = 450, getRowHeight(9) = 50 → itemBottom = 500; viewportBottom = 500; NOT > 501
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), {
      scrollToIndex,
      getRowOffset: (idx) => idx * 50,
      getRowHeight: () => 50,
    });

    handleKeyDown(pressKey('ArrowDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(10, null, { align: 'end' });
  });

  it('arrow down navigates forward (item partially visible)', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 400 },
      currentEndIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    // itemBottom = 9*50+50 = 500, viewportBottom = 400; 500 > 401 → scrolls to currentEndIndex
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), {
      scrollToIndex,
      getRowOffset: (idx) => idx * 50,
      getRowHeight: () => 50,
    });

    handleKeyDown(pressKey('ArrowDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(9, null, { align: 'end' });
  });

  it('arrow down with snapMode=start', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 5, currentEndIndex: 14 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ snap: 'start' }), { scrollToIndex });

    handleKeyDown(pressKey('ArrowDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(6, null, { align: 'start' });
  });

  it('arrow down with snapMode=center', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 500 },
      currentIndex: 5,
      currentEndIndex: 14,
    }));
    const scrollToIndex = vi.fn();
    // center = (0 + 250) / 50 = 5
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ snap: 'center' }), {
      scrollToIndex,
      getRowIndexAt: (o) => Math.floor(o / 50),
    });

    handleKeyDown(pressKey('ArrowDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(6, null, { align: 'center' });
  });

  it('arrow up navigates backward (default, item at top edge)', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 200 },
      currentIndex: 4,
      currentEndIndex: 13,
    }));
    const scrollToIndex = vi.fn();
    // itemPos = 4*50 = 200; viewportTop = 200; NOT < 199 → currentIndex > 0 → scrolls to 3
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), {
      scrollToIndex,
      getRowOffset: (idx) => idx * 50,
    });

    handleKeyDown(pressKey('ArrowUp'));
    expect(scrollToIndex).toHaveBeenCalledWith(3, null, { align: 'start' });
  });

  it('arrow up with snapMode=end', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 5, currentEndIndex: 14 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ snap: 'end' }), { scrollToIndex });

    handleKeyDown(pressKey('ArrowUp'));
    expect(scrollToIndex).toHaveBeenCalledWith(13, null, { align: 'end' });
  });

  it('arrow up with snapMode=center', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 500 },
      currentIndex: 5,
    }));
    const scrollToIndex = vi.fn();
    // center = (0 + 250) / 50 = 5
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ snap: 'center' }), { scrollToIndex });

    handleKeyDown(pressKey('ArrowUp'));
    expect(scrollToIndex).toHaveBeenCalledWith(4, null, { align: 'center' });
  });

  it('arrow up clamps to 0', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 0, currentEndIndex: 9 }));
    const scrollToIndex = vi.fn();
    // itemPos == 0 = viewportTop = 0, not < -1 AND currentIndex = 0, so nothing scrolled
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('ArrowUp'));
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('arrow up re-aligns the first visible item when it is scrolled past the top edge', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 300 },
      currentIndex: 4,
      currentEndIndex: 13,
    }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('ArrowUp'));
    // itemPos (4 * 50 = 200) < viewportTop (300) - 1 → the item is pulled back to the edge
    expect(scrollToIndex).toHaveBeenCalledWith(4, null, { align: 'start' });
  });

  it('arrow down does nothing when the last item is fully visible', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 4500 },
      currentIndex: 90,
      currentEndIndex: 99,
    }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('ArrowDown'));
    // itemBottom (5000) does not overflow the viewport bottom (4500 + 500) and there is no next item
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  // ── ArrowLeft / ArrowRight (horizontal / both) ───────────────────────────────

  it('arrow right navigates forward on horizontal list', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 500 },
      currentColIndex: 0,
      currentEndColIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToIndex });

    handleKeyDown(pressKey('ArrowRight'));
    expect(scrollToIndex).toHaveBeenCalled();
  });

  it('arrow left in RTL acts as logical forward', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 500 },
      currentColIndex: 0,
      currentEndColIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal' }),
      { scrollToIndex, isRtl: true },
    );

    handleKeyDown(pressKey('ArrowLeft'));
    expect(scrollToIndex).toHaveBeenCalled();
  });

  it('arrow left navigates backward with snapMode=end', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 500 },
      currentColIndex: 5,
      currentEndColIndex: 14,
    }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal', snap: 'end' }),
      { scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowLeft'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 13, { align: 'end' });
  });

  it('arrow right with snapMode=start on horizontal', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 0, currentEndColIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal', snap: 'start' }),
      { scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowRight'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 1, { align: 'start' });
  });

  it('arrow right with snapMode=center on horizontal', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 500 },
      currentColIndex: 2,
      currentEndColIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    // center col = (0 + 250) / 50 = 5
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal', snap: 'center' }),
      { scrollToIndex, getColumnIndexAt: (o) => Math.floor(o / 50) },
    );

    handleKeyDown(pressKey('ArrowRight'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 6, { align: 'center' });
  });

  it('arrow right re-aligns the last visible column when it overflows the viewport', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 0, currentEndColIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal' }),
      { scrollToIndex, getItemOffset: (idx) => idx * 100, getItemSize: () => 100 },
    );

    handleKeyDown(pressKey('ArrowRight'));
    // colEndPos (9 * 100 + 100 = 1000) > viewportRight (500) + 1
    expect(scrollToIndex).toHaveBeenCalledWith(null, 9, { align: 'end' });
  });

  it('arrow right does nothing when the last column is fully visible', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 0, currentEndColIndex: 4 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal', columnCount: 5 }),
      { scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowRight'));
    // colEndPos (4 * 50 + 50 = 250) fits in the viewport and columnCount - 1 = 4 is the last column
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('arrow left re-aligns a leading column that is scrolled past the left edge', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 200, y: 0 },
      currentColIndex: 1,
      currentEndColIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal', columnCount: 5 }),
      { scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowLeft'));
    // colStartPos (getColumnOffset(1) = 50) < viewportLeft (200) - 1
    expect(scrollToIndex).toHaveBeenCalledWith(null, 1, { align: 'start' });
  });

  // ── PageUp / PageDown ────────────────────────────────────────────────────────

  it('handles PageDown key (default, vertical)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 0, currentEndIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('PageDown'));
    // getPageTarget returns endIdx + 1 = 10 (no snap)
    expect(scrollToIndex).toHaveBeenCalledWith(10, null, { align: 'start' });
  });

  it('handles PageUp key (default, vertical)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 10, currentEndIndex: 19 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('PageUp'));
    // getPageTarget returns startIdx - 1 = 9
    expect(scrollToIndex).toHaveBeenCalledWith(9, null, { align: 'end' });
  });

  it('handles PageDown key (horizontal)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 0, currentEndColIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToIndex });

    handleKeyDown(pressKey('PageDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 10, { align: 'start' });
  });

  it('handles PageUp key (horizontal)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 10, currentEndColIndex: 19 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToIndex });

    handleKeyDown(pressKey('PageUp'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 9, { align: 'end' });
  });

  it('handles PageDown with snapMode=center', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      viewportSize: { width: 500, height: 500 },
      currentIndex: 0,
      currentEndIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    // centerIdx = 5, pageSize = 9, target = min(99, 5+9) = 14
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ snap: 'center' }),
      { scrollToIndex, getRowIndexAt: (o) => Math.floor(o / 50) },
    );

    handleKeyDown(pressKey('PageDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(14, null, { align: 'center' });
  });

  it('handles PageUp with snapMode=center', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 500 },
      viewportSize: { width: 500, height: 500 },
      currentIndex: 10,
      currentEndIndex: 19,
    }));
    const scrollToIndex = vi.fn();
    // centerIdx = (500 + 250) / 50 = 15, pageSize = 9, target = max(0, 15-9) = 6
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ snap: 'center' }),
      { scrollToIndex, getRowIndexAt: (o) => Math.floor(o / 50) },
    );

    handleKeyDown(pressKey('PageUp'));
    expect(scrollToIndex).toHaveBeenCalledWith(6, null, { align: 'center' });
  });

  it('handles PageDown with snapMode=end', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 0, currentEndIndex: 9 }));
    const scrollToIndex = vi.fn();
    // target = min(99, 9+9) = 18
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ snap: 'end' }), { scrollToIndex });

    handleKeyDown(pressKey('PageDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(18, null, { align: 'end' });
  });

  it('handles PageUp with snapMode=start', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 20, currentEndIndex: 29 }));
    const scrollToIndex = vi.fn();
    // target = max(0, 20-9) = 11
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ snap: 'start' }), { scrollToIndex });

    handleKeyDown(pressKey('PageUp'));
    expect(scrollToIndex).toHaveBeenCalledWith(11, null, { align: 'start' });
  });

  // ── snap === true ────────────────────────────────────────────────────────────

  it('snap=true resolves to auto mode (no explicit snap alignment)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 0, currentEndIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ snap: true }), { scrollToIndex });

    handleKeyDown(pressKey('PageDown'));
    // snapMode is null (auto → null), align fallback = 'start', target = endIdx + 1
    expect(scrollToIndex).toHaveBeenCalledWith(10, null, { align: 'start' });
  });

  // ── ignored keys ─────────────────────────────────────────────────────────────

  it('ignores unrecognised keys', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('Tab'));
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('arrow up does nothing in horizontal-only mode', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToIndex });

    handleKeyDown(pressKey('ArrowUp'));
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('arrow left moves to the previous column when the current one starts at the viewport edge', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 500, y: 0 },
      currentColIndex: 5,
      currentEndColIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal' }),
      { scrollToIndex, getItemOffset: (idx) => idx * 100 },
    );

    handleKeyDown(pressKey('ArrowLeft'));
    // colStartPos (500) is not < viewportLeft (500) - 1, so the previous column is targeted
    expect(scrollToIndex).toHaveBeenCalledWith(null, 4, { align: 'start' });
  });

  it('arrow left does nothing when already at the first column', () => {
    const scrollDetails = ref(makeScrollDetails({
      scrollOffset: { x: 0, y: 0 },
      currentColIndex: 0,
      currentEndColIndex: 9,
    }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal' }),
      { scrollToIndex, getItemOffset: (idx) => idx * 100 },
    );

    handleKeyDown(pressKey('ArrowLeft'));
    // colStartPos (0) is not < viewportLeft (0) - 1 and currentColIndex is 0
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('arrow right with snapMode=center clamps to the last column when columnCount is set', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 3, currentEndColIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal', snap: 'center', columnCount: 5 }),
      { scrollToIndex, getColumnIndexAt: (o) => Math.floor(o / 50) },
    );

    handleKeyDown(pressKey('ArrowRight'));
    // maxIdx = columnCount - 1 = 4
    expect(scrollToIndex).toHaveBeenCalledWith(null, 4, { align: 'center' });
  });

  it('handles PageDown on horizontal lists when columnCount is set', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 0, currentEndColIndex: 3 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal', columnCount: 5 }),
      { scrollToIndex },
    );

    handleKeyDown(pressKey('PageDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 4, { align: 'start' });
  });

  // ── activation mode: item ────────────────────────────────────────────────────

  it('defaults to viewport activation mode', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 4, currentEndIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, liveMessage } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowDown'));

    // Opting in to item mode is what tracks an active item; the default scrolls.
    expect(activeIndex.value).toBe(-1);
    expect(liveMessage.value).toBe('');
    expect(scrollToIndex).toHaveBeenCalledWith(10, null, { align: 'end' });
  });

  it('reads the activation mode from a ref and reacts to a change', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 4, currentEndIndex: 9 }));
    const scrollToIndex = vi.fn();
    const mode = ref<'item' | 'viewport'>('viewport');
    const { activeIndex, handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: mode, scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowDown'));
    expect(activeIndex.value).toBe(-1);
    expect(scrollToIndex).toHaveBeenLastCalledWith(10, null, { align: 'end' });

    mode.value = 'item';
    scrollToIndex.mockClear();
    handleKeyDown(pressKey('ArrowDown'));
    expect(activeIndex.value).toBe(4);
    expect(scrollToIndex).not.toHaveBeenCalled();

    mode.value = 'viewport';
    handleKeyDown(pressKey('ArrowDown'));
    expect(scrollToIndex).toHaveBeenLastCalledWith(10, null, { align: 'end' });
  });

  it('reads the activation mode from a getter', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const mode = ref<'item' | 'viewport'>('item');
    const { activeIndex, handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: () => mode.value, scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowDown'));

    expect(activeIndex.value).toBe(0);
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('moves the active item with the vertical arrows and keeps it visible', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 4 }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowDown'));
    expect(activeIndex.value).toBe(4);
    expect(scrollToIndex).not.toHaveBeenCalled();

    handleKeyDown(pressKey('ArrowDown'));
    expect(activeIndex.value).toBe(5);
    expect(scrollToIndex).toHaveBeenLastCalledWith(5, null, { align: 'auto' });

    handleKeyDown(pressKey('ArrowUp'));
    expect(activeIndex.value).toBe(4);
    expect(scrollToIndex).toHaveBeenLastCalledWith(4, null, { align: 'auto' });
  });

  it('clamps the active item at both ends of the list', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', scrollToIndex },
    );

    setActiveIndex(0);
    handleKeyDown(pressKey('ArrowUp'));
    expect(activeIndex.value).toBe(0);

    setActiveIndex(99);
    handleKeyDown(pressKey('ArrowDown'));
    expect(activeIndex.value).toBe(99);
  });

  it('does nothing on arrows when the list is empty', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ items: [] }),
      { activationMode: 'item', scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowDown'));
    handleKeyDown(pressKey('Home'));
    handleKeyDown(pressKey('PageDown'));

    expect(activeIndex.value).toBe(-1);
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('moves the active item to the first and last item on Home and End', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 30, currentEndIndex: 39 }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', scrollToIndex },
    );

    setActiveIndex(30);

    const home = pressKey('Home');
    handleKeyDown(home);
    expect(activeIndex.value).toBe(0);
    expect(home.defaultPrevented).toBe(true);
    expect(scrollToIndex).toHaveBeenLastCalledWith(0, null, { align: 'auto' });

    handleKeyDown(pressKey('End'));
    expect(activeIndex.value).toBe(99);
    expect(scrollToIndex).toHaveBeenLastCalledWith(99, null, { align: 'auto' });
  });

  it('pages the active item by one viewport', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 20, currentEndIndex: 29 }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', scrollToIndex },
    );

    setActiveIndex(22);

    handleKeyDown(pressKey('PageDown'));
    expect(activeIndex.value).toBe(32);
    expect(scrollToIndex).toHaveBeenLastCalledWith(32, null, { align: 'auto' });

    handleKeyDown(pressKey('PageUp'));
    expect(activeIndex.value).toBe(22);
    expect(scrollToIndex).toHaveBeenLastCalledWith(22, null, { align: 'auto' });
  });

  it('pages from the first visible item when nothing is active yet', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 20, currentEndIndex: 29 }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', scrollToIndex },
    );

    handleKeyDown(pressKey('PageUp'));
    expect(activeIndex.value).toBe(10);
    expect(scrollToIndex).toHaveBeenLastCalledWith(10, null, { align: 'auto' });

    setActiveIndex(99);
    handleKeyDown(pressKey('PageDown'));
    expect(activeIndex.value).toBe(99);
  });

  it('jumps and pages without losing the current column in a multi-column list', () => {
    const scrollDetails = ref(makeScrollDetails({
      currentIndex: 30,
      currentEndIndex: 39,
      currentColIndex: 2,
      currentEndColIndex: 4,
    }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'both', columnCount: 5 }),
      { activationMode: 'item', scrollToIndex },
    );

    setActiveIndex(32);

    handleKeyDown(pressKey('PageDown'));
    expect(activeIndex.value).toBe(42);
    expect(scrollToIndex).toHaveBeenLastCalledWith(42, null, { align: 'auto' });

    handleKeyDown(pressKey('PageUp'));
    expect(activeIndex.value).toBe(32);
    expect(scrollToIndex).toHaveBeenLastCalledWith(32, null, { align: 'auto' });

    // Viewport mode `Home` would scroll to (0, 0); the item model leaves the
    // horizontal axis (the current column) alone.
    handleKeyDown(pressKey('Home'));
    expect(activeIndex.value).toBe(0);
    expect(scrollToIndex).toHaveBeenLastCalledWith(0, null, { align: 'auto' });

    handleKeyDown(pressKey('End'));
    expect(activeIndex.value).toBe(99);
    expect(scrollToIndex).toHaveBeenLastCalledWith(99, null, { align: 'auto' });
  });

  it('keeps panning columns with the horizontal arrows in grid mode', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 0, currentEndColIndex: 0 }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'both', columnCount: 10 }),
      { activationMode: 'item', scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowRight'));

    // A grid item is a row, so the inline arrows keep the viewport behaviour.
    expect(activeIndex.value).toBe(-1);
    expect(scrollToIndex).toHaveBeenCalledWith(null, 1, { align: 'end' });
  });

  it('leaves vertical arrows to the block axis on a horizontal list', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal' }),
      { activationMode: 'item', scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowDown'));
    handleKeyDown(pressKey('ArrowUp'));

    expect(activeIndex.value).toBe(-1);
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('ignores the horizontal arrows on a vertical list', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowRight'));
    handleKeyDown(pressKey('ArrowLeft'));

    expect(activeIndex.value).toBe(-1);
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('ignores unrecognised keys in item mode', () => {
    const scrollDetails = ref(makeScrollDetails());
    const onActivate = vi.fn();
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', onActivate, scrollToIndex },
    );

    setActiveIndex(3);
    handleKeyDown(pressKey('Tab'));

    expect(activeIndex.value).toBe(3);
    expect(onActivate).not.toHaveBeenCalled();
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('moves the active item horizontally and honours RTL', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 4, currentEndColIndex: 8 }));
    const scrollToIndex = vi.fn();
    const props = makeProps({ direction: 'horizontal' });
    const ltr = makeKeyboard(scrollDetails, props, { activationMode: 'item', scrollToIndex });

    ltr.setActiveIndex(4);
    ltr.handleKeyDown(pressKey('ArrowRight'));
    expect(ltr.activeIndex.value).toBe(5);
    expect(scrollToIndex).toHaveBeenLastCalledWith(null, 5, { align: 'auto' });

    ltr.handleKeyDown(pressKey('ArrowLeft'));
    expect(ltr.activeIndex.value).toBe(4);
    expect(scrollToIndex).toHaveBeenLastCalledWith(null, 4, { align: 'auto' });

    const rtlDetails = ref(makeScrollDetails({ currentColIndex: 4, currentEndColIndex: 8 }));
    const rtl = makeKeyboard(rtlDetails, props, { activationMode: 'item', isRtl: true, scrollToIndex });

    rtl.setActiveIndex(4);
    rtl.handleKeyDown(pressKey('ArrowLeft'));
    expect(rtl.activeIndex.value).toBe(5);
    expect(scrollToIndex).toHaveBeenLastCalledWith(null, 5, { align: 'auto' });

    rtl.handleKeyDown(pressKey('ArrowRight'));
    expect(rtl.activeIndex.value).toBe(4);
    expect(scrollToIndex).toHaveBeenLastCalledWith(null, 4, { align: 'auto' });
  });

  it('activates the first visible column on the first horizontal arrow', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 6, currentEndColIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, liveMessage } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal' }),
      { activationMode: 'item', scrollToIndex },
    );

    handleKeyDown(pressKey('ArrowRight'));

    expect(activeIndex.value).toBe(6);
    expect(liveMessage.value).toBe('Item 7 of 100');
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('jumps and pages horizontally', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 10, currentEndColIndex: 19 }));
    const scrollToIndex = vi.fn();
    const { activeIndex, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps({ direction: 'horizontal' }),
      { activationMode: 'item', scrollToIndex },
    );

    setActiveIndex(12);

    handleKeyDown(pressKey('PageDown'));
    expect(activeIndex.value).toBe(22);
    expect(scrollToIndex).toHaveBeenLastCalledWith(null, 22, { align: 'auto' });

    handleKeyDown(pressKey('Home'));
    expect(activeIndex.value).toBe(0);
    expect(scrollToIndex).toHaveBeenLastCalledWith(null, 0, { align: 'auto' });

    handleKeyDown(pressKey('End'));
    expect(activeIndex.value).toBe(99);
    expect(scrollToIndex).toHaveBeenLastCalledWith(null, 99, { align: 'auto' });
  });

  // ── activation: Enter / Space ────────────────────────────────────────────────

  it('activates the active item on Enter and Space', () => {
    const scrollDetails = ref(makeScrollDetails());
    const onActivate = vi.fn();
    const scrollToIndex = vi.fn();
    const { handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', onActivate, scrollToIndex },
    );

    setActiveIndex(7);

    const enter = pressKey('Enter');
    handleKeyDown(enter);
    expect(onActivate).toHaveBeenCalledWith(7);
    expect(enter.defaultPrevented).toBe(true);
    expect(scrollToIndex).not.toHaveBeenCalled();

    handleKeyDown(pressKey(' '));
    expect(onActivate).toHaveBeenCalledTimes(2);
    expect(onActivate).toHaveBeenLastCalledWith(7);
  });

  it('does not activate on Enter or Space without an active item', () => {
    const scrollDetails = ref(makeScrollDetails());
    const onActivate = vi.fn();
    const { handleKeyDown } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', onActivate },
    );

    const enter = pressKey('Enter');
    handleKeyDown(enter);
    handleKeyDown(pressKey(' '));

    expect(onActivate).not.toHaveBeenCalled();
    expect(enter.defaultPrevented).toBe(false);
  });

  it('does not activate on Enter or Space in viewport mode', () => {
    const scrollDetails = ref(makeScrollDetails());
    const onActivate = vi.fn();
    const { activeIndex, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'viewport', onActivate },
    );

    // The active item can still be synced from the outside in viewport mode.
    setActiveIndex(3);
    expect(activeIndex.value).toBe(3);

    handleKeyDown(pressKey('Enter'));
    handleKeyDown(pressKey(' '));

    expect(onActivate).not.toHaveBeenCalled();
  });

  // ── explicit activation ──────────────────────────────────────────────────────

  it('activates an item explicitly, without scrolling it into view', () => {
    const scrollDetails = ref(makeScrollDetails());
    const onActivate = vi.fn();
    const scrollToIndex = vi.fn();
    const { activeIndex, handleItemActivate, liveMessage } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', onActivate, scrollToIndex },
    );

    handleItemActivate(20);

    expect(activeIndex.value).toBe(20);
    expect(liveMessage.value).toBe('Item 21 of 100');
    expect(onActivate).toHaveBeenCalledWith(20);
    expect(scrollToIndex).not.toHaveBeenCalled();

    // The callback always receives the effective (truncated) index.
    handleItemActivate(30.7);
    expect(activeIndex.value).toBe(30);
    expect(onActivate).toHaveBeenLastCalledWith(30);
  });

  it('ignores explicit activations outside the list', () => {
    const scrollDetails = ref(makeScrollDetails());
    const onActivate = vi.fn();
    const { activeIndex, handleItemActivate, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', onActivate },
    );

    setActiveIndex(5);

    handleItemActivate(-1);
    handleItemActivate(100);
    handleItemActivate(Number.NaN);

    expect(activeIndex.value).toBe(5);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('does not activate items in viewport mode', () => {
    const scrollDetails = ref(makeScrollDetails());
    const onActivate = vi.fn();
    const { activeIndex, handleItemActivate } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'viewport', onActivate },
    );

    handleItemActivate(5);

    expect(activeIndex.value).toBe(-1);
    expect(onActivate).not.toHaveBeenCalled();
  });

  it('activates items with no onActivate handler', () => {
    const scrollDetails = ref(makeScrollDetails());
    const { activeIndex, handleItemActivate, handleKeyDown, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item' },
    );

    handleItemActivate(3);
    expect(activeIndex.value).toBe(3);

    setActiveIndex(4);
    handleKeyDown(pressKey('Enter'));
    expect(activeIndex.value).toBe(4);
  });

  // ── setActiveIndex / liveMessage ─────────────────────────────────────────────

  it('sets, truncates, clamps and clears the active item', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { activeIndex, liveMessage, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps(),
      { activationMode: 'item', scrollToIndex },
    );

    expect(activeIndex.value).toBe(-1);
    expect(liveMessage.value).toBe('');

    setActiveIndex(20.9);
    expect(activeIndex.value).toBe(20);
    expect(liveMessage.value).toBe('Item 21 of 100');

    setActiveIndex(1000);
    expect(activeIndex.value).toBe(99);

    setActiveIndex(-3);
    expect(activeIndex.value).toBe(-1);

    setActiveIndex(Number.NaN);
    expect(activeIndex.value).toBe(-1);

    setActiveIndex(7);
    setActiveIndex(null);
    expect(activeIndex.value).toBe(-1);
    expect(liveMessage.value).toBe('');

    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('clears the active item when the list is empty', () => {
    const scrollDetails = ref(makeScrollDetails());
    const { activeIndex, liveMessage, setActiveIndex } = makeKeyboard(
      scrollDetails,
      makeProps({ items: [] }),
      { activationMode: 'item' },
    );

    setActiveIndex(0);

    expect(activeIndex.value).toBe(-1);
    expect(liveMessage.value).toBe('');
  });

  it('clears the live message when the item count drops below the active index', () => {
    const props = reactive(makeProps());
    const scrollDetails = ref(makeScrollDetails());
    const { activeIndex, liveMessage, setActiveIndex } = makeKeyboard(
      scrollDetails,
      props,
      { activationMode: 'item' },
    );

    setActiveIndex(50);
    expect(liveMessage.value).toBe('Item 51 of 100');

    props.items = props.items.slice(0, 10);

    expect(activeIndex.value).toBe(50);
    expect(liveMessage.value).toBe('');
  });
});
