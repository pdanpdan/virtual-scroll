import type { MasonryRenderedItem, MasonryScrollDetails, ScrollAlignment, ScrollAlignmentOptions, ScrollToIndexOptions, ScrollToIndexResult, VirtualScrollMasonryProps } from '../types';
import type { ComputedRef, Ref } from 'vue';

import { computed, ref, shallowRef, toValue, watch } from 'vue';

import { DEFAULT_ITEM_SIZE, DEFAULT_MASONRY_GAP, DEFAULT_MASONRY_MAX_COLUMNS, DEFAULT_MASONRY_SEGMENT_SIZE, DEFAULT_MASONRY_TARGET_COLUMN_WIDTH } from '../types';
import { MasonryLayout } from '../utils/masonry-layout';

/** Time after the last native scroll event to consider scrolling ended. */
const SCROLL_END_DELAY = 150;

/** Duration of a programmatic smooth scroll before pending intents are dropped. */
const PROGRAMMATIC_SMOOTH_DELAY = 1000;

/** Tolerance in px below which a re-clamped scroll target is not re-applied. */
const CLAMP_TOLERANCE = 2;

/** Tolerance in px below which a measured card height is treated as unchanged. */
const MEASUREMENT_EPSILON = 0.5;

/** Align/behavior/dryRun normalization shared by the public and internal paths. */
function resolveScrollOptions(options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions): ResolvedScrollOptions {
  const base: ResolvedScrollOptions = { align: 'auto', behavior: 'smooth', dryRun: false };
  if (options === undefined) {
    return base;
  }
  if (typeof options === 'string') {
    return { ...base, align: options };
  }
  const opts = options as ScrollAlignmentOptions & ScrollToIndexOptions;
  const requested = opts.align;
  const behavior = opts.behavior ?? 'smooth';
  const dryRun = opts.dryRun ?? false;
  if (typeof requested === 'string') {
    return { align: requested, behavior, dryRun };
  }
  if (requested) {
    return { align: typeof requested.y === 'string' ? requested.y : 'auto', behavior, dryRun };
  }
  return { align: opts.y ?? 'auto', behavior, dryRun };
}

/** An anchored content position captured before a layout mutation. */
type MasonryAnchor
  = | { kind: 'card'; index: number; delta: number; }
    | { kind: 'end'; gap: number; };

/** A programmatic scroll intent that survives layout mutations. */
type MasonryPending
  = | { kind: 'offset'; offset: number; endIntent: boolean; }
    | { kind: 'index'; index: number; align: ScrollAlignment; };

/** Normalized scroll options for `scrollToIndex`. */
interface ResolvedScrollOptions {
  align: ScrollAlignment;
  behavior: 'auto' | 'smooth';
  dryRun: boolean;
}

/** Internal reactive state shared with the consuming component. */
export interface UseVirtualScrollMasonryInternalState {
  /** Current display scroll position (px). */
  scrollY: Ref<number>;
  /** Current viewport width (px). */
  viewportWidth: Ref<number>;
  /** Current viewport height (px). */
  viewportHeight: Ref<number>;
  /** Whether the container is currently scrolling. */
  isScrolling: Ref<boolean>;
  /** Whether the current scroll was initiated programmatically. */
  isProgrammaticScroll: Ref<boolean>;
}

/** Return value of the `useVirtualScrollMasonry` composable. */
export interface UseVirtualScrollMasonryReturn<T = unknown> {
  /** Cards to render: the viewport window plus one segment of overscan per side. */
  renderedCards: ComputedRef<MasonryRenderedItem<T>[]>;
  /** Detailed information about the current scroll state. */
  scrollDetails: ComputedRef<MasonryScrollDetails<T>>;
  /** Currently resolved number of columns (0 until the container is measured). */
  columns: ComputedRef<number>;
  /** Currently resolved column width in px (0 until the container is measured). */
  columnWidth: ComputedRef<number>;
  /** Total content height in px (estimated until the layout chain reaches the end). */
  totalHeight: ComputedRef<number>;
  /** Whether `totalHeight` is exact, i.e. the layout chain reached the last item. */
  totalHeightExact: ComputedRef<boolean>;
  /** Programmatically scroll to a card index with an optional alignment. */
  scrollToIndex: (index?: number | null, options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions) => ScrollToIndexResult;
  /** Programmatically scroll to a pixel offset; use ±Infinity for the very end/start. */
  scrollToOffset: (offset?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void;
  /** Drop every cached layout frontier and re-layout from the current anchor. */
  refresh: () => void;
  /**
   * Feed ResizeObserver measurements into the layout (`measuredHeights` mode).
   * @internal
   */
  applyMeasurements: (entries: Array<{ index: number; height: number; }>) => void;
  /** Internal reactive state (consumed by the component wrapper). */
  internalState: UseVirtualScrollMasonryInternalState;
}

/**
 * Masonry virtualization driver for a single native scroll container.
 *
 * The composable owns one {@link MasonryLayout} frontier chain and renders
 * only the cards intersecting the current viewport (plus one segment of
 * overscan on each side), so the DOM stays bounded no matter how far the user
 * jumps. Column geometry is derived reactively from the container width
 * (`targetColumnWidth` / `minColumns` / `maxColumns` / `gap`), and every
 * relayout re-anchors the content: the card pinned at the top of the viewport
 * keeps its screen offset instead of the scroll position jumping.
 *
 * By default heights come exclusively from the `itemHeight` oracle — nothing
 * is measured in the DOM — so unvisited regions are priced without mounting
 * anything and far `scrollToIndex` calls land on the exact canonical
 * position. Cards must therefore size themselves to the oracle height
 * (reserve media space with `aspect-ratio` etc.), and the oracle must be a
 * pure function of `(index, columnWidth)`. With `measuredHeights` enabled,
 * mounted cards are measured instead and the oracle only seeds the
 * pre-measure estimate ("local" determinism: reproducible per measurement
 * history). When the dataset is replaced, in-place item edits happen, or
 * heights change, call `refresh()` to re-layout from the current anchor.
 *
 * @param propsInput - Reactive configuration (see {@link VirtualScrollMasonryProps}).
 * @returns Masonry state and controls (see {@link UseVirtualScrollMasonryReturn}).
 */
export function useVirtualScrollMasonry<T>(
  propsInput: Ref<VirtualScrollMasonryProps<T>> | (() => VirtualScrollMasonryProps<T>),
): UseVirtualScrollMasonryReturn<T> {
  const props = computed(() => toValue(propsInput));

  // ---------------------------------- state ----------------------------------

  /** Display scroll position (px; masonry has a single scroll axis and scale 1). */
  const scrollY = ref(0);
  const viewportWidth = ref(0);
  const viewportHeight = ref(0);
  const isScrolling = ref(false);
  const isProgrammaticScroll = ref(false);

  /** Dirty tick: bumped after every layout mutation and chain progress. */
  const layoutTick = ref(0);

  /** The frontier layout; recreated when the dataset or geometry shape changes. */
  const layout = shallowRef<MasonryLayout | null>(null);

  const resolvedGap = computed(() => Math.max(0, props.value.gap ?? DEFAULT_MASONRY_GAP));
  const resolvedSegmentSize = computed(() => Math.max(1, Math.floor(props.value.segmentSize ?? DEFAULT_MASONRY_SEGMENT_SIZE)));

  /** Measured card heights (px) overriding the oracle — `measuredHeights` mode. */
  const measuredHeights = new Map<number, number>();

  let scrollEndTimer: ReturnType<typeof setTimeout> | undefined;
  let programmaticTimer: ReturnType<typeof setTimeout> | undefined;
  let pending: MasonryPending | null = null;
  let resizeObserver: ResizeObserver | null = null;

  // ---------------------------------- helpers ----------------------------------

  /** Oracle height for an index at a width, with the finite-positive fallback. */
  function resolveOracleHeight(index: number, width: number): number {
    const raw = props.value.itemHeight(props.value.items[ index ], index, width);
    return Math.max(1, Number.isFinite(raw) ? raw : DEFAULT_ITEM_SIZE);
  }

  /** Height used by the layout: the measured override when present, else the oracle. */
  function resolveLayoutHeight(index: number, width: number): number {
    return measuredHeights.get(index) ?? resolveOracleHeight(index, width);
  }

  /** Absolute content height of a layout (no reactivity, no chain guarantee). */
  function maxScrollHeight(l: MasonryLayout): number {
    return Math.max(0, Math.max(0, l.totalHeight().height) - viewportHeight.value);
  }

  /**
   * Reactivity-free card pass: every card whose box intersects the vertical
   * window `[top, top + height]`, reading whole segments around the window
   * plus one segment of overscan per side (so cards hanging across a segment
   * boundary are always mounted).
   */
  function collectCards(top: number, height: number, items: T[]): MasonryRenderedItem<T>[] {
    const l = layout.value;
    if (!l || items.length === 0 || !(height > 0)) {
      return [];
    }
    const segCount = l.segmentCount();
    const bottom = top + height;
    let lo = l.segmentAtY(Math.max(0, top)).segment;
    let hi = l.segmentAtY(bottom).segment;
    lo = Math.max(0, lo - 1);
    hi = Math.min(segCount - 1, hi + 1);

    const out: MasonryRenderedItem<T>[] = [];
    for (let s = lo; s <= hi; s++) {
      const origin = l.segmentOrigin(s);
      for (const card of l.getSegment(s)) {
        const y = origin + card.y;
        if (y < bottom && y + card.height > top) {
          out.push({
            item: items[ card.index ],
            index: card.index,
            column: card.column,
            x: card.x,
            y,
            width: card.width,
            height: card.height,
          });
        }
      }
    }
    return out;
  }

  /** Write a clamped scroll position to the container and the reactive state. */
  function applyScrollPosition(l: MasonryLayout, y: number): void {
    const clamped = Math.max(0, Math.min(y, maxScrollHeight(l)));
    scrollY.value = clamped;
    const el = props.value.hostRef;
    if (el && Math.abs(el.scrollTop - clamped) > 0.5) {
      el.scrollTop = clamped;
    }
  }

  /** Re-anchor the scroll position after a layout mutation. */
  function restoreScroll(anchor: MasonryAnchor | null): void {
    const l = layout.value;
    if (!l) {
      scrollY.value = 0;
      return;
    }
    let y: number | null = null;
    if (anchor) {
      if (anchor.kind === 'end') {
        y = maxScrollHeight(l) - anchor.gap;
      } else {
        const pos = l.locateItem(anchor.index);
        if (pos) {
          y = pos.y + anchor.delta;
        }
      }
    }
    if (y === null) {
      y = Math.min(scrollY.value, maxScrollHeight(l));
    }
    applyScrollPosition(l, y);
  }

  /** Perform a programmatic scroll with the given native behavior. */
  function performScroll(y: number, behavior: 'auto' | 'smooth'): void {
    const el = props.value.hostRef;
    if (!el) {
      return;
    }
    isScrolling.value = true;
    isProgrammaticScroll.value = true;
    clearTimeout(scrollEndTimer);
    clearTimeout(programmaticTimer);
    programmaticTimer = setTimeout(() => {
      isProgrammaticScroll.value = false;
      pending = null;
      scheduleScrollEnd();
    }, behavior === 'smooth' ? PROGRAMMATIC_SMOOTH_DELAY : SCROLL_END_DELAY);
    // behavior 'auto' fires a scroll event right away; 'smooth' streams events
    // while animating — both keep scrollY in sync through handleScroll.
    el.scrollTo({ top: Math.max(0, y), behavior });
  }

  function scheduleScrollEnd(): void {
    clearTimeout(scrollEndTimer);
    scrollEndTimer = setTimeout(() => {
      isScrolling.value = false;
    }, SCROLL_END_DELAY);
  }

  // ---------------------------------- geometry ----------------------------------

  /** Reactive column geometry derived from the measured container width. */
  const geometry = computed(() => {
    const p = props.value;
    if (!(viewportWidth.value > 0) || p.items.length === 0) {
      return { columns: 0, columnWidth: 0 };
    }
    const minColumns = Math.max(1, p.minColumns ?? 1);
    return MasonryLayout.geometryFor(
      viewportWidth.value,
      resolvedGap.value,
      Math.max(1, p.targetColumnWidth ?? DEFAULT_MASONRY_TARGET_COLUMN_WIDTH),
      minColumns,
      Math.max(minColumns, p.maxColumns ?? DEFAULT_MASONRY_MAX_COLUMNS),
    );
  });

  const columns = computed(() => geometry.value.columns);
  const columnWidth = computed(() => geometry.value.columnWidth);

  // ---------------------------------- layout sync ----------------------------------

  let currentItems: T[] | null = null;
  let currentCount = Number.NaN;
  let currentGap = Number.NaN;
  let currentSegmentSize = Number.NaN;

  /**
   * Reconcile the layout instance with the current dataset and geometry:
   * recreate when the dataset or the layout shape changed, otherwise resize
   * the column geometry in place. Every mutation re-anchors the scroll
   * position (content space) and re-applies any pending programmatic intent.
   */
  function syncLayout(force = false): void {
    const p = props.value;
    const count = p.items.length;
    const g = geometry.value;
    const anchor = captureAnchor();
    const l = layout.value;
    let changed = false;

    if (count === 0) {
      if (l) {
        layout.value = null;
        changed = true;
      }
    } else if (g.columns > 0) {
      const recreate = force || !l || currentItems !== p.items || currentCount !== count || currentGap !== resolvedGap.value || currentSegmentSize !== resolvedSegmentSize.value;
      if (recreate) {
        // A different items array is a different dataset: stale measurements
        // of the old indices must not leak into the new layout.
        if (currentItems !== p.items) {
          measuredHeights.clear();
        }
        layout.value = new MasonryLayout({
          totalItems: count,
          columns: g.columns,
          columnWidth: g.columnWidth,
          gap: resolvedGap.value,
          segmentSize: resolvedSegmentSize.value,
          getItemHeight: (index: number, width: number) => resolveLayoutHeight(index, width),
        });
        changed = true;
      } else if (l.resize(g.columns, g.columnWidth)) {
        changed = true;
      }
    }

    currentItems = p.items;
    currentCount = count;
    currentGap = resolvedGap.value;
    currentSegmentSize = resolvedSegmentSize.value;

    if (changed) {
      restoreScroll(anchor);
      settlePendingScroll();
      layoutTick.value++;
    }
  }

  // ---------------------------------- chain progress ----------------------------------

  let lastReach = Number.NaN;
  let lastBase = Number.NaN;

  /** Detect frontier-chain progress and invalidate everything derived from it. */
  function noteChainProgress(): void {
    const l = layout.value;
    const reach = l ? l.frontierReach : -1;
    const base = l ? l.frontierBase : 0;
    if (reach !== lastReach || base !== lastBase) {
      lastReach = reach;
      lastBase = base;
      layoutTick.value++;
    }
  }

  // ---------------------------------- computeds ----------------------------------

  /** Cards in the DOM window: the viewport plus one segment of overscan per side. */
  const renderedCards = computed<MasonryRenderedItem<T>[]>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    layoutTick.value;
    return collectCards(scrollY.value, viewportHeight.value, props.value.items);
  });

  watch(renderedCards, () => {
    noteChainProgress();
  });

  /**
   * Capture the content position anchored at the current viewport top in
   * content space: the straddling card plus its screen delta, the card right
   * below the line, or the docked-at-bottom gap.
   */
  function captureAnchor(): MasonryAnchor | null {
    const l = layout.value;
    if (!l || props.value.items.length === 0) {
      return null;
    }
    const line = scrollY.value;
    const cards = renderedCards.value;
    if (cards.length === 0) {
      return { kind: 'end', gap: Math.max(0, maxScrollHeight(l) - line) };
    }
    let straddle: MasonryRenderedItem<T> | null = null;
    let below: MasonryRenderedItem<T> | null = null;
    for (const card of cards) {
      if (card.y <= line) {
        if (card.y + card.height > line && (!straddle || card.y > straddle.y)) {
          straddle = card;
        }
      } else if (!below || card.y < below.y) {
        below = card;
      }
    }
    if (straddle) {
      return { kind: 'card', index: straddle.index, delta: line - straddle.y };
    }
    // v8 ignore start -- the rendered window always contains a straddling card
    // or a card starting below the line, so the end fallback is unreachable
    if (below) {
      return { kind: 'card', index: below.index, delta: line - below.y };
    }
    return { kind: 'end', gap: Math.max(0, maxScrollHeight(l) - line) };
    // v8 ignore stop
  }

  const totalMetrics = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    layoutTick.value;
    const l = layout.value;
    if (!l) {
      return { height: 0, exact: true };
    }
    const t = l.totalHeight();
    return { height: Math.max(0, t.height), exact: t.exact };
  });

  const totalHeight = computed(() => totalMetrics.value.height);
  const totalHeightExact = computed(() => totalMetrics.value.exact);

  const scrollDetails = computed<MasonryScrollDetails<T>>(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    layoutTick.value;
    const cards = renderedCards.value;
    const top = scrollY.value;
    const vw = viewportWidth.value;
    const vh = viewportHeight.value;
    // Every rendered card intersects the viewport window by construction, so
    // the visible span is simply the first and last rendered index.
    const currentIndex = cards.length > 0 ? cards[ 0 ]!.index : 0;
    const currentEndIndex = cards.length > 0 ? cards[ cards.length - 1 ]!.index : 0;
    return {
      items: cards,
      currentIndex,
      currentColIndex: 0,
      currentEndIndex,
      currentEndColIndex: 0,
      scrollOffset: { x: 0, y: top },
      displayScrollOffset: { x: 0, y: top },
      viewportSize: { width: vw, height: vh },
      displayViewportSize: { width: vw, height: vh },
      totalSize: { width: vw, height: totalMetrics.value.height },
      isScrolling: isScrolling.value,
      isProgrammaticScroll: isProgrammaticScroll.value,
      range: cards.length > 0 ? { start: cards[ 0 ]!.index, end: cards[ cards.length - 1 ]!.index + 1 } : { start: 0, end: 0 },
      columnRange: { start: 0, end: Math.max(0, columns.value), padStart: 0, padEnd: 0 },
    };
  });

  // ---------------------------------- scroll handling ----------------------------------

  function handleScroll(): void {
    const el = props.value.hostRef;
    if (!el) {
      return;
    }
    let top = el.scrollTop;
    // Clamp against the rendered content height (estimate or exact): native
    // scrollports clamp on their own, but estimate-shrink windows (and test
    // hosts) can report positions past the current content end.
    const max = totalHeight.value - viewportHeight.value;
    if (top > max) {
      top = max;
      el.scrollTop = max;
    }
    scrollY.value = top;
    isScrolling.value = true;
    scheduleScrollEnd();
  }

  // ---------------------------------- viewport tracking ----------------------------------

  function updateViewport(el: HTMLElement): void {
    viewportWidth.value = el.clientWidth;
    viewportHeight.value = el.clientHeight;
  }

  function attachHost(el: HTMLElement): void {
    el.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver = new ResizeObserver(() => {
      updateViewport(el);
    });
    resizeObserver.observe(el);
    updateViewport(el);
  }

  function detachHost(el: HTMLElement): void {
    el.removeEventListener('scroll', handleScroll);
    resizeObserver?.disconnect();
    resizeObserver = null;
    clearTimeout(scrollEndTimer);
    clearTimeout(programmaticTimer);
  }

  watch(
    () => props.value.hostRef,
    (el, prevEl, onCleanup) => {
      if (prevEl && prevEl !== el) {
        detachHost(prevEl);
      }
      if (el) {
        attachHost(el);
      }
      onCleanup(() => {
        if (el) {
          detachHost(el);
        }
      });
    },
    { immediate: true },
  );

  // ---------------------------------- programmatic scroll ----------------------------------

  /**
   * Resolve the clamped scroll target for a card index without performing the
   * scroll. Returns null for out-of-range indices and for 'auto' alignment
   * when the card is already fully visible.
   */
  function resolveIndexTarget(index: number | null | undefined, options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions): { target: number; resolved: ResolvedScrollOptions; } | null {
    const l = layout.value;
    const items = props.value.items;
    if (!l || index === null || index === undefined || !Number.isFinite(index) || index < 0 || index >= items.length) {
      return null;
    }
    const resolved = resolveScrollOptions(options);
    const seg = Math.min(Math.floor(index / resolvedSegmentSize.value), l.segmentCount() - 1);
    const placed = l.getSegment(seg).find((card) => card.index === index);
    // v8 ignore next -- every segment of the chain contains all its indices
    if (!placed) {
      return null;
    }
    const cardY = l.segmentOrigin(seg) + placed.y;
    const vh = viewportHeight.value;
    let target: number;
    if (resolved.align === 'auto') {
      const top = scrollY.value;
      if (cardY >= top && cardY + placed.height <= top + vh) {
        return null;
      }
      target = cardY < top
        ? Math.max(0, cardY - Math.max(0, vh - placed.height))
        : cardY;
    } else {
      const edge = resolved.align === 'center'
        ? (vh - placed.height) / 2
        : resolved.align === 'end' ? vh - placed.height : 0;
      target = cardY - Math.max(0, edge);
    }
    return { target: Math.max(0, Math.min(target, maxScrollHeight(l))), resolved };
  }

  function scrollToIndex(index?: number | null, options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions): ScrollToIndexResult {
    const current = scrollY.value;
    const result: ScrollToIndexResult = {
      targetX: 0,
      targetY: current,
      displayTargetX: 0,
      displayTargetY: current,
    };
    const resolved = resolveIndexTarget(index, options);
    if (!resolved) {
      return result;
    }
    result.targetY = resolved.target;
    result.displayTargetY = resolved.target;
    if (!resolved.resolved.dryRun) {
      pending = { kind: 'index', index: index!, align: resolved.resolved.align };
      performScroll(resolved.target, resolved.resolved.behavior);
    }
    return result;
  }

  function scrollToOffset(offset?: number | null, options?: { behavior?: 'auto' | 'smooth'; }): void {
    if (offset === null || offset === undefined) {
      return;
    }
    const l = layout.value;
    if (!l) {
      return;
    }
    const max = maxScrollHeight(l);
    const endIntent = !Number.isFinite(offset) && offset > 0;
    const target = Math.max(0, Math.min(Number.isFinite(offset) ? offset : (offset > 0 ? max : 0), max));
    pending = { kind: 'offset', offset: target, endIntent };
    performScroll(target, options?.behavior ?? 'auto');
  }

  /** After a layout mutation, re-apply a pending programmatic intent. */
  function settlePendingScroll(): void {
    if (!pending || !layout.value) {
      return;
    }
    const intent = pending;
    let target: number | null = null;
    if (intent.kind === 'index') {
      const resolved = resolveIndexTarget(intent.index, { align: intent.align, behavior: 'auto' });
      target = resolved?.target ?? null;
    } else {
      // End intents follow the (possibly growing) content; plain offsets clamp.
      target = intent.endIntent
        ? maxScrollHeight(layout.value)
        : Math.min(intent.offset, maxScrollHeight(layout.value));
    }
    if (target !== null && Math.abs(target - scrollY.value) > CLAMP_TOLERANCE) {
      applyScrollPosition(layout.value, target);
    }
  }

  function refresh(): void {
    const l = layout.value;
    if (!l) {
      return;
    }
    const anchor = captureAnchor();
    l.invalidate();
    restoreScroll(anchor);
    settlePendingScroll();
    layoutTick.value++;
    noteChainProgress();
  }

  /**
   * Feed ResizeObserver measurements into the layout (`measuredHeights` mode).
   * Heights equal to the current oracle within the epsilon are ignored, so a
   * first mount of estimate-sized cards does not re-flow; every accepted
   * change invalidates the frontier chain and re-anchors the topmost visible
   * card at its screen offset.
   */
  function applyMeasurements(entries: Array<{ index: number; height: number; }>): void {
    const l = layout.value;
    // Measurements come from mounted cards, so no layout means nothing to feed.
    if (!l) {
      return;
    }
    let changed = false;
    for (const entry of entries) {
      if (!Number.isInteger(entry.index) || entry.index < 0 || !Number.isFinite(entry.height)) {
        continue;
      }
      const next = Math.max(1, entry.height);
      const current = measuredHeights.get(entry.index);
      if (current !== undefined) {
        if (Math.abs(current - next) > MEASUREMENT_EPSILON) {
          measuredHeights.set(entry.index, next);
          changed = true;
        }
        continue;
      }
      // First sighting: only commit when the box actually differs from the
      // oracle estimate at the current column width.
      if (Math.abs(next - resolveOracleHeight(entry.index, l.width)) > MEASUREMENT_EPSILON) {
        measuredHeights.set(entry.index, next);
        changed = true;
      }
    }
    if (!changed) {
      return;
    }
    const anchor = captureAnchor();
    l.invalidate();
    restoreScroll(anchor);
    settlePendingScroll();
    layoutTick.value++;
    noteChainProgress();
  }

  // Disabling measuredHeights drops every stored override: the layout falls
  // back to the pure oracle and re-anchors (re-enabling measures fresh).
  watch(() => props.value.measuredHeights === true, (enabled) => {
    if (enabled || measuredHeights.size === 0) {
      return;
    }
    measuredHeights.clear();
    refresh();
  });

  // Watch geometry/dataset changes: resize the frontier chain in place
  // (re-anchoring the content) or recreate the layout when its shape changed.
  watch(
    () => [ geometry.value, props.value.items, resolvedGap.value, resolvedSegmentSize.value ],
    () => {
      syncLayout();
    },
    { immediate: true },
  );

  // Keep the scroll position valid when chain progress changes the total
  // estimate (the wrapper may shrink below the current scroll position).
  watch(layoutTick, () => {
    const l = layout.value;
    if (!l) {
      return;
    }
    const max = maxScrollHeight(l);
    if (pending) {
      // End intents and oversized plain offsets re-clamp to the settled end.
      if (pending.kind === 'offset' && (pending.endIntent || pending.offset > max + CLAMP_TOLERANCE)) {
        applyScrollPosition(l, max);
      }
      return;
    }
    if (scrollY.value > max) {
      applyScrollPosition(l, max);
    }
  });

  return {
    renderedCards,
    scrollDetails,
    columns,
    columnWidth,
    totalHeight,
    totalHeightExact,
    scrollToIndex,
    scrollToOffset,
    refresh,
    applyMeasurements,
    internalState: {
      scrollY,
      viewportWidth,
      viewportHeight,
      isScrolling,
      isProgrammaticScroll,
    },
  };
}
