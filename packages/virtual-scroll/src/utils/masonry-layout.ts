/**
 * Masonry column layout for virtualization in a single scroll container.
 *
 * Masonry is path-dependent: the column an item lands in depends on the
 * column frontier left by every item before it. Storing that per item is O(n)
 * memory; storing it per *segment* is not. This module keeps the real column
 * frontier at every `segmentSize` boundary as a flat prefix table —
 * `columns` floats per snapshot — and resumes any later run from the nearest
 * stored frontier, so every layout is bit-identical to one greedy pass from
 * item 0.
 *
 * Segment origins tile exactly: interior segments measure to the shallowest
 * column (the next segment absorbs the overhang) and the final segment
 * measures to the deepest column so the last cards stay reachable.
 *
 * Heights come from the caller-provided `getItemHeight(index, columnWidth)`
 * oracle and never from the DOM, so unvisited segments can be priced without
 * mounting anything.
 */

/** Geometry for one placed card, relative to its segment's origin. */
export interface PlacedItem {
  /** Dataset index. */
  index: number;
  /** Zero-based column. */
  column: number;
  /** Pixels from the left of the content box. */
  x: number;
  /** Pixels from the segment origin, not the dataset origin. */
  y: number;
  width: number;
  height: number;
}

/** Resolved column geometry for a given container width. */
export interface ColumnGeometry {
  columns: number;
  columnWidth: number;
}

/** Options for constructing a masonry layout. */
export interface MasonryLayoutOptions {
  /** Number of items in the dataset. */
  totalItems: number;
  /** Number of columns. */
  columns: number;
  /** Width of every column (pixels). */
  columnWidth: number;
  /** Gutter between columns (pixels). */
  gap: number;
  /** Items per segment; the frontier is stored every this many items. */
  segmentSize: number;
  /** Height oracle: canonical heights, keyed by index and column width. */
  getItemHeight: (index: number, columnWidth: number) => number;
}

export class MasonryLayout {
  private static readonly ITEM_CACHE_LIMIT = 3;

  private totalItems: number;
  private columns: number;
  private columnWidth: number;
  private readonly gap: number;
  private readonly segmentSize: number;
  private readonly getItemHeight: (index: number, columnWidth: number) => number;

  /** Real column frontier at each segment boundary: `columns` floats per entry. */
  private frontiers: Float64Array;
  private frontierKnown = -1;
  private chainBase = 0;

  private readonly colH: number[];
  private readonly chainColH: number[];

  private readonly itemCache = new Map<number, PlacedItem[]>();

  constructor(options: MasonryLayoutOptions) {
    this.totalItems = options.totalItems;
    this.columns = options.columns;
    this.columnWidth = options.columnWidth;
    this.gap = options.gap;
    this.segmentSize = Math.max(1, Math.floor(options.segmentSize));
    this.getItemHeight = options.getItemHeight;
    this.frontiers = new Float64Array((this.segmentCount() + 1) * this.columns);
    // eslint-disable-next-line e18e/prefer-array-fill -- Array.from(...).fill(0) is typed unknown[]
    this.colH = Array.from({ length: this.columns }, () => 0);
    // eslint-disable-next-line e18e/prefer-array-fill -- Array.from(...).fill(0) is typed unknown[]
    this.chainColH = Array.from({ length: this.columns }, () => 0);
  }

  get columnCount(): number {
    return this.columns;
  }

  get width(): number {
    return this.columnWidth;
  }

  get gutter(): number {
    return this.gap;
  }

  /** Number of segments the dataset divides into. */
  segmentCount(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.segmentSize));
  }

  /** First item index of a segment. */
  segmentStart(segment: number): number {
    return Math.min(segment * this.segmentSize, this.totalItems);
  }

  /** Whether a segment's frontier is actually written, not merely below the mark. */
  hasFrontier(segment: number): boolean {
    return segment >= this.chainBase && segment <= this.frontierKnown;
  }

  /** Deepest segment of the current contiguous range; -1 when empty. */
  get frontierReach(): number {
    return this.frontierKnown;
  }

  /** First segment of the current contiguous range. */
  get frontierBase(): number {
    return this.chainBase;
  }

  /**
   * Resolve columns and column width for a container width. The column width
   * is deliberately fractional so the gutters divide the width exactly.
   */
  static geometryFor(
    width: number,
    gap: number,
    targetColumnWidth: number,
    minColumns: number,
    maxColumns: number,
  ): ColumnGeometry {
    const columns = Math.max(minColumns, Math.min(maxColumns, Math.floor((width + gap) / (targetColumnWidth + gap))));
    return {
      columns,
      columnWidth: Math.max(1, (width - gap * (columns - 1)) / columns),
    };
  }

  /** Absolute y of a segment's top, from the start of the dataset. */
  segmentOrigin(segment: number): number {
    if (segment <= 0) {
      return 0;
    }
    const clamped = Math.min(segment, this.segmentCount());
    this.ensureFrontier(clamped);
    const off = clamped * this.columns;
    const atEnd = clamped >= this.segmentCount();
    let value = this.frontiers[ off ]!;
    for (let c = 1; c < this.columns; c++) {
      const other = this.frontiers[ off + c ]!;
      if (atEnd ? other > value : other < value) {
        value = other;
      }
    }
    return value;
  }

  /** Segment containing an absolute pixel position, plus the offset into it. */
  segmentAtY(y: number): { segment: number; offset: number; } {
    if (!(y > 0)) {
      return { segment: 0, offset: 0 };
    }
    let lo = 0;
    let hi = this.segmentCount() - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.segmentOrigin(mid) <= y) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    return { segment: lo, offset: Math.max(0, y - this.segmentOrigin(lo)) };
  }

  /**
   * Total content height. Exact once the chain reaches the end; otherwise an
   * extrapolation from the known prefix so the scrollbar has a total.
   */
  totalHeight(): { height: number; exact: boolean; } {
    const segments = this.segmentCount();
    if (this.frontierKnown >= segments) {
      return { height: this.segmentOrigin(segments), exact: true };
    }
    if (this.frontierKnown <= 0) {
      return { height: this.segmentOrigin(1) * segments, exact: false };
    }
    const known = this.frontierKnown;
    return { height: (this.segmentOrigin(known) / known) * segments, exact: false };
  }

  /** Cards in a segment, positioned relative to that segment's origin. */
  getSegment(segment: number): PlacedItem[] {
    const hit = this.itemCache.get(segment);
    if (hit) {
      return hit;
    }
    const items: PlacedItem[] = [];
    this.layoutSegment(segment, items);
    this.itemCache.set(segment, items);
    if (this.itemCache.size > MasonryLayout.ITEM_CACHE_LIMIT) {
      const oldest = this.itemCache.keys().next().value as number;
      this.itemCache.delete(oldest);
    }
    return items;
  }

  /** Absolute y of a single card, for re-anchoring across a relayout. */
  locateItem(index: number): { segment: number; y: number; } | null {
    if (!Number.isFinite(index) || index < 0 || index >= this.totalItems) {
      return null;
    }
    const segment = Math.min(Math.floor(index / this.segmentSize), this.segmentCount() - 1);
    for (const item of this.getSegment(segment)) {
      if (item.index === index) {
        return { segment, y: this.segmentOrigin(segment) + item.y };
      }
    }
    // v8 ignore next -- a segment always contains every index in its range
    return null;
  }

  /** Change column geometry and discard everything derived from it. */
  resize(columns: number, columnWidth: number): boolean {
    if (!Number.isFinite(columns) || columns < 1 || !Number.isFinite(columnWidth) || columnWidth <= 0) {
      return false;
    }
    if (columns === this.columns && columnWidth === this.columnWidth) {
      return false;
    }
    this.columns = columns;
    this.columnWidth = columnWidth;
    this.colH.length = columns;
    this.colH.fill(0);
    this.chainColH.length = columns;
    this.chainColH.fill(0);
    this.invalidate();
    return true;
  }

  /** Drop every cached frontier and segment. */
  invalidate(): void {
    this.frontiers = new Float64Array((this.segmentCount() + 1) * this.columns);
    this.frontierKnown = -1;
    this.chainBase = 0;
    this.itemCache.clear();
  }

  /**
   * Declare a segment to be a fresh origin with level columns. Used when the
   * camera lands somewhere the chain never reached: chaining there costs one
   * height per card crossed, so anchoring starts level at the landing
   * segment instead. No-op when the segment's frontier is already known.
   */
  anchorFlushAt(segment: number): boolean {
    if (segment < 0 || this.hasFrontier(segment)) {
      return false;
    }
    const off = segment * this.columns;
    for (let c = 0; c < this.columns; c++) {
      this.frontiers[ off + c ] = 0;
    }
    this.chainBase = segment;
    this.frontierKnown = segment;
    this.itemCache.clear();
    return true;
  }

  /**
   * Advance the frontier chain toward `targetSegment` within a wall-clock
   * budget. Progress is durable: every completed segment is written, so
   * abandoned slices resume rather than restart. Returns true once the chain
   * has reached the target.
   */
  chainAhead(targetSegment: number, budgetMs: number): boolean {
    const target = Math.max(0, Math.min(targetSegment, this.segmentCount()));
    if (this.hasFrontier(target)) {
      return true;
    }
    if (target < this.chainBase) {
      return false;
    }
    const colH = this.chainColH;
    this.seedChain(colH);
    const deadline = this.now() + budgetMs;
    let segment = Math.max(this.chainBase, this.frontierKnown);
    while (segment < target) {
      const start = segment * this.segmentSize;
      const end = Math.min(start + this.segmentSize, this.totalItems);
      for (let i = start; i < end; i++) {
        let column = 0;
        for (let c = 1; c < this.columns; c++) {
          if (colH[ c ]! < colH[ column ]!) {
            column = c;
          }
        }
        colH[ column ] = colH[ column ]! + Math.max(1, this.getItemHeight(i, this.columnWidth)) + this.gap;
      }
      this.storeFrontier(segment + 1, colH);
      segment++;
      if (this.now() >= deadline) {
        break;
      }
    }
    return this.frontierKnown >= target;
  }

  /** How far the chain has been built, for progress reporting. */
  get chainProgress(): { known: number; total: number; } {
    return { known: this.frontierKnown, total: this.segmentCount() };
  }

  private now(): number {
    // v8 ignore next -- every supported runtime provides performance.now
    return typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
  }

  /** Load the deepest known frontier into `colH`, seeding segment 0 if needed. */
  private seedChain(colH: number[]): void {
    if (this.frontierKnown < 0) {
      for (let c = 0; c < this.columns; c++) {
        colH[ c ] = 0;
      }
      this.chainBase = 0;
      this.storeFrontier(0, colH);
      return;
    }
    const off = this.frontierKnown * this.columns;
    for (let c = 0; c < this.columns; c++) {
      colH[ c ] = this.frontiers[ off + c ]!;
    }
  }

  /**
   * Guarantee that `target` has a frontier to read: chain forward when ahead
   * of the base, otherwise re-anchor the target as a fresh origin. Reading an
   * unwritten slot would hand back undefined and NaN everywhere downstream.
   */
  private ensureFrontier(target: number): void {
    if (this.hasFrontier(target)) {
      return;
    }
    if (target >= this.chainBase) {
      this.chainAhead(target, Number.POSITIVE_INFINITY);
      // v8 ignore next -- an unbudgeted chain always reaches its target
      if (this.hasFrontier(target)) {
        return;
      }
    }
    this.anchorFlushAt(target);
  }

  private storeFrontier(segment: number, colH: number[]): void {
    const off = segment * this.columns;
    for (let c = 0; c < this.columns; c++) {
      this.frontiers[ off + c ] = colH[ c ]!;
    }
    if (segment > this.frontierKnown) {
      this.frontierKnown = segment;
    }
  }

  /** Place one segment's cards, continuing from the previous run's real frontier. */
  private layoutSegment(segment: number, out: PlacedItem[]): void {
    this.ensureFrontier(segment);
    const colH = this.colH;
    const off = segment * this.columns;
    let originY = Number.POSITIVE_INFINITY;
    for (let c = 0; c < this.columns; c++) {
      colH[ c ] = this.frontiers[ off + c ]!;
      if (colH[ c ]! < originY) {
        originY = colH[ c ]!;
      }
    }
    const start = segment * this.segmentSize;
    const end = Math.min(start + this.segmentSize, this.totalItems);
    for (let i = start; i < end; i++) {
      let column = 0;
      for (let c = 1; c < this.columns; c++) {
        if (colH[ c ]! < colH[ column ]!) {
          column = c;
        }
      }
      const height = Math.max(1, this.getItemHeight(i, this.columnWidth));
      out.push({
        index: i,
        column,
        x: column * (this.columnWidth + this.gap),
        y: colH[ column ]! - originY,
        width: this.columnWidth,
        height,
      });
      colH[ column ] = colH[ column ]! + height + this.gap;
    }
    this.storeFrontier(segment + 1, colH);
  }
}
