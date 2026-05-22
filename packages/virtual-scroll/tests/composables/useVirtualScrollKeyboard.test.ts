import type { ScrollAlignment, ScrollDetails, VirtualScrollProps } from '../../src/types';
import type { Mock } from 'vitest';
import type { Ref } from 'vue';

import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

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
      scrollToIndex?: Mock<(rowIndex?: number | null, colIndex?: number | null, options?: { align?: ScrollAlignment | 'auto'; behavior?: 'auto' | 'smooth'; }) => void>;
      stopProgrammaticScroll?: Mock<() => void>;
      getRowHeight?: (i: number) => number;
      getColumnWidth?: (i: number) => number;
      getRowOffset?: (i: number) => number;
      getColumnOffset?: (i: number) => number;
      getItemOffset?: (i: number) => number;
      getItemSize?: (i: number) => number;
      getRowIndexAt?: (o: number) => number;
      getColIndexAt?: (o: number) => number;
    } = {},
  ) => useVirtualScrollKeyboard({
    props,
    virtualScrollProps: ref(props),
    scrollDetails,
    isRtl: ref(overrides.isRtl ?? false),
    scrollToIndex: overrides.scrollToIndex ?? (vi.fn() as unknown as Mock<(rowIndex?: number | null, colIndex?: number | null, options?: { align?: ScrollAlignment | 'auto'; behavior?: 'auto' | 'smooth'; }) => void>),
    stopProgrammaticScroll: overrides.stopProgrammaticScroll ?? (vi.fn() as unknown as Mock<() => void>),
    getRowHeight: overrides.getRowHeight ?? (() => 50),
    getColumnWidth: overrides.getColumnWidth ?? (() => 50),
    getRowOffset: overrides.getRowOffset ?? ((idx) => idx * 50),
    getColumnOffset: overrides.getColumnOffset ?? ((idx) => idx * 50),
    getItemOffset: overrides.getItemOffset ?? ((idx) => idx * 50),
    getItemSize: overrides.getItemSize ?? (() => 50),
    getRowIndexAt: overrides.getRowIndexAt ?? ((o) => Math.floor(o / 50)),
    getColIndexAt: overrides.getColIndexAt ?? ((o) => Math.floor(o / 50)),
  });

  const pressKey = (key: string) => new KeyboardEvent('keydown', { key });

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

  it('end key scrolls to end (vertical)', () => {
    const scrollDetails = ref(makeScrollDetails({ scrollOffset: { x: 0, y: 0 }, totalSize: { width: 5000, height: 5000 } }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('End'));
    expect(scrollToIndex).toHaveBeenCalledWith(99, 0, { behavior: 'smooth', align: 'end' });
  });

  it('end key scrolls to end (horizontal)', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToIndex });

    handleKeyDown(pressKey('End'));
    expect(scrollToIndex).toHaveBeenCalledWith(0, 99, { behavior: 'smooth', align: 'end' });
  });

  it('end key scrolls to end (both directions)', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const props = makeProps({ direction: 'both', columnCount: 10 });
    const { handleKeyDown } = makeKeyboard(scrollDetails, props, { scrollToIndex });

    handleKeyDown(pressKey('End'));
    expect(scrollToIndex).toHaveBeenCalledWith(99, 9, { behavior: 'smooth', align: 'end' });
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
      { scrollToIndex, getColIndexAt: (o) => Math.floor(o / 50) },
    );

    handleKeyDown(pressKey('ArrowRight'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 6, { align: 'center' });
  });

  // ── PageUp / PageDown ────────────────────────────────────────────────────────

  it('handles PageDown key (default, vertical)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 0, currentEndIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('PageDown'));
    // getPageTarget returns endIdx = 9 (no snap)
    expect(scrollToIndex).toHaveBeenCalledWith(9, null, { align: 'start' });
  });

  it('handles PageUp key (default, vertical)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentIndex: 10, currentEndIndex: 19 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps(), { scrollToIndex });

    handleKeyDown(pressKey('PageUp'));
    // getPageTarget returns startIdx = 10
    expect(scrollToIndex).toHaveBeenCalledWith(10, null, { align: 'end' });
  });

  it('handles PageDown key (horizontal)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 0, currentEndColIndex: 9 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToIndex });

    handleKeyDown(pressKey('PageDown'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 9, { align: 'start' });
  });

  it('handles PageUp key (horizontal)', () => {
    const scrollDetails = ref(makeScrollDetails({ currentColIndex: 10, currentEndColIndex: 19 }));
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'horizontal' }), { scrollToIndex });

    handleKeyDown(pressKey('PageUp'));
    expect(scrollToIndex).toHaveBeenCalledWith(null, 10, { align: 'end' });
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
    // snapMode is null (auto → null), align fallback = 'start'
    expect(scrollToIndex).toHaveBeenCalledWith(9, null, { align: 'start' });
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

  it('arrow right does nothing in vertical-only mode', () => {
    const scrollDetails = ref(makeScrollDetails());
    const scrollToIndex = vi.fn();
    const { handleKeyDown } = makeKeyboard(scrollDetails, makeProps({ direction: 'vertical' }), { scrollToIndex });

    handleKeyDown(pressKey('ArrowRight'));
    expect(scrollToIndex).not.toHaveBeenCalled();
  });
});
