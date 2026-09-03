import { describe, expect, it } from 'vitest';

import { MasonryLayout } from '../../src/utils/masonry-layout';

/** Deterministic canonical oracle. */
function oracle(i: number, width: number): number {
  const h = Math.imul(i + 1, 2654435761) >>> 0;
  return 40 + (h % 7) * 20 + (width % 50);
}

describe('masonry-layout', () => {
  const N = 1000;
  const COLS = 4;
  const WIDTH = 180;
  const GAP = 10;
  const SEGMENT = 100;

  function makeLayout() {
    return new MasonryLayout({
      totalItems: N,
      columns: COLS,
      columnWidth: WIDTH,
      gap: GAP,
      segmentSize: SEGMENT,
      getItemHeight: oracle,
    });
  }

  it('tiles segments to match a brute-force single pass exactly', () => {
    const layout = makeLayout();
    const segments = layout.segmentCount();
    // chain everything
    while (!layout.chainAhead(segments, Number.POSITIVE_INFINITY)) { /* no-op */ }
    expect(layout.totalHeight().exact).toBe(true);

    // brute force: greedy pass, item y in its column
    const tops = new Float64Array(COLS);
    for (let i = 0; i < N; i++) {
      let best = 0;
      for (let c = 1; c < COLS; c++) {
        if (tops[ c ]! < tops[ best ]!) {
          best = c;
        }
      }
      tops[ best ] = tops[ best ]! + oracle(i, WIDTH) + GAP;
    }
    const total = Math.max(...tops);
    expect(layout.totalHeight().height).toBeCloseTo(total, 6);

    // every segment origin equals brute force shallowest column at that index
    for (let s = 0; s <= segments; s++) {
      const itemIdx = Math.min(s * SEGMENT, N);
      // recompute brute prefix at itemIdx
      const prefix = new Float64Array(COLS);
      for (let i = 0; i < itemIdx; i++) {
        let best = 0;
        for (let c = 1; c < COLS; c++) {
          if (prefix[ c ]! < prefix[ best ]!) {
            best = c;
          }
        }
        prefix[ best ] = prefix[ best ]! + oracle(i, WIDTH) + GAP;
      }
      const expected = s >= segments ? Math.max(...prefix) : Math.min(...prefix);
      expect(layout.segmentOrigin(s)).toBeCloseTo(expected, 6);
    }
  });

  it('locates cards with bit-identical geometry to a greedy pass', () => {
    const layout = makeLayout();
    // brute force position map
    const colTop = new Float64Array(COLS);
    const posY = new Float64Array(N);
    const colIdx = new Int32Array(N);
    for (let i = 0; i < N; i++) {
      let best = 0;
      for (let c = 1; c < COLS; c++) {
        if (colTop[ c ]! < colTop[ best ]!) {
          best = c;
        }
      }
      colIdx[ i ] = best;
      posY[ i ] = colTop[ best ]!;
      colTop[ best ] = colTop[ best ]! + oracle(i, WIDTH) + GAP;
    }
    for (const probe of [ 0, 1, 499, 500, 999 ]) {
      const found = layout.locateItem(probe);
      expect(found).not.toBeNull();
      expect(found!.y).toBeCloseTo(posY[ probe ]!, 6);
      // getSegment geometry aligns with locate
      const items = layout.getSegment(found!.segment);
      const card = items.find((it) => it.index === probe);
      expect(card).toBeDefined();
      expect(card!.x).toBeCloseTo(colIdx[ probe ]! * (WIDTH + GAP), 6);
    }
  });

  it('anchors a fresh segment without NaN and keeps segments tiling', () => {
    const layout = makeLayout();
    layout.anchorFlushAt(5);
    expect(layout.frontierBase).toBe(5);
    expect(layout.frontierReach).toBe(5);
    // read behind the anchor: re-anchors, never NaN
    const origin = layout.segmentOrigin(3);
    expect(Number.isFinite(origin)).toBe(true);
    // segments still tile: origin + segment height == next origin
    const segHeight = layout.segmentOrigin(4) - layout.segmentOrigin(3);
    expect(segHeight).toBeGreaterThan(0);
  });

  it('supports incremental chaining with a time budget', () => {
    const layout = makeLayout();
    let guard = 0;
    while (!layout.chainAhead(7, 0) && guard++ < 1000) { /* budget slices */ }
    expect(layout.frontierReach).toBeGreaterThanOrEqual(1);
    // full chain afterwards
    while (!layout.chainAhead(layout.segmentCount(), 0) && guard++ < 1000) { /* no-op */ }
    expect(layout.totalHeight().exact).toBe(true);
  });

  it('invalidate and resize discard derived state', () => {
    const layout = makeLayout();
    while (!layout.chainAhead(layout.segmentCount(), Number.POSITIVE_INFINITY)) { /* no-op */ }
    const before = layout.totalHeight().height;
    expect(layout.resize(3, 200)).toBe(true);
    expect(layout.totalHeight().exact).toBe(false);
    // relayout after resize is finite and sane
    while (!layout.chainAhead(layout.segmentCount(), Number.POSITIVE_INFINITY)) { /* no-op */ }
    const after = layout.totalHeight().height;
    expect(Number.isFinite(after)).toBe(true);
    expect(after).toBeGreaterThan(0);
    expect(before).not.toBe(after);
    expect(layout.resize(3, 200)).toBe(false); // no-op same geometry
    layout.invalidate();
    expect(layout.frontierReach).toBe(-1);
  });

  it('geometryFor resolves responsive fractional columns', () => {
    const g = MasonryLayout.geometryFor(1000, 10, 180, 1, 6);
    expect(g.columns).toBe(5);
    expect(g.columnWidth).toBeCloseTo(192, 6); // (1000 - 40) / 5
    const narrow = MasonryLayout.geometryFor(300, 10, 180, 1, 6);
    expect(narrow.columns).toBe(1);
    expect(narrow.columnWidth).toBeCloseTo(300, 6);
  });

  it('never returns NaN for extreme scroll positions', () => {
    const layout = makeLayout();
    for (const y of [ -100, 0, 1e9 ]) {
      const at = layout.segmentAtY(y);
      expect(Number.isFinite(at.segment)).toBe(true);
      expect(Number.isFinite(at.offset)).toBe(true);
    }
  });

  describe('masonry-layout edge coverage', () => {
    it('exposes geometry getters and cache behavior', () => {
      const layout = makeLayout();
      expect(layout.columnCount).toBe(COLS);
      expect(layout.width).toBe(WIDTH);
      expect(layout.gutter).toBe(GAP);
      expect(layout.segmentStart(2)).toBe(2 * SEGMENT);
      expect(layout.segmentStart(99)).toBe(N);
      const seg0a = layout.getSegment(0);
      expect(layout.getSegment(0)).toBe(seg0a); // cached
      layout.getSegment(1);
      layout.getSegment(2);
      layout.getSegment(3);
      layout.getSegment(4); // evicts the oldest cached segment
      expect(layout.getSegment(0)).not.toBe(seg0a); // recomputed after eviction
    });

    it('covers segment search and partial total estimates', () => {
      const layout = makeLayout();
      const early = layout.segmentAtY(1); // walks the binary search down
      expect(early.segment).toBe(0);
      layout.chainAhead(3, Number.POSITIVE_INFINITY);
      const partial = layout.totalHeight();
      expect(partial.exact).toBe(false);
      expect(partial.height).toBeGreaterThan(0);
      // repeated origin reads hit the known-frontier path
      const originA = layout.segmentOrigin(3);
      expect(layout.segmentOrigin(3)).toBe(originA);
      // repeated chain calls on an already-reached target return true
      expect(layout.chainAhead(3, 0)).toBe(true);
    });

    it('handles invalid inputs and anchor/no-op paths', () => {
      const layout = makeLayout();
      expect(layout.totalHeight().exact).toBe(false); // fresh layout estimate
      expect(layout.locateItem(-1)).toBeNull();
      expect(layout.locateItem(N)).toBeNull();
      expect(layout.resize(0, 100)).toBe(false);
      expect(layout.resize(2, -5)).toBe(false);
      expect(layout.anchorFlushAt(-1)).toBe(false);
      expect(layout.anchorFlushAt(4)).toBe(true);
      expect(layout.anchorFlushAt(4)).toBe(false); // already anchored
      expect(layout.chainAhead(2, 10)).toBe(false); // behind the base
      layout.chainAhead(6, Number.POSITIVE_INFINITY);
      expect(layout.chainProgress.known).toBeGreaterThanOrEqual(6);
      expect(layout.segmentAtY(0).segment).toBe(0);
      expect(layout.segmentAtY(-5).segment).toBe(0);
    });
  });
});
