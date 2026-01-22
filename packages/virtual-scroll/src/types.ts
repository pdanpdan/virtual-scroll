/**
 * The direction of the virtual scroll.
 * - 'vertical': Single-column vertical scrolling.
 * - 'horizontal': Single-row horizontal scrolling.
 * - 'both': Bidirectional grid-based scrolling.
 */
export type ScrollDirection = 'vertical' | 'horizontal' | 'both';

/**
 * Alignment of an item within the viewport after a scroll operation.
 * - 'start': Aligns item to the top or left edge.
 * - 'center': Aligns item to the center of the viewport.
 * - 'end': Aligns item to the bottom or right edge.
 * - 'auto': Smart alignment. If visible, stays. If not, aligns to nearest edge.
 */
export type ScrollAlignment = 'start' | 'center' | 'end' | 'auto';

/** Options for scroll alignment in a single axis or both axes. */
export interface ScrollAlignmentOptions {
  /** Alignment on the X (horizontal) axis. */
  x?: ScrollAlignment;
  /** Alignment on the Y (vertical) axis. */
  y?: ScrollAlignment;
}

/** Options for the `scrollToIndex` method. */
export interface ScrollToIndexOptions {
  /**
   * Where to align the item in the viewport.
   * Can be a single value for both axes or an object for individual control.
   * @default 'auto'
   */
  align?: ScrollAlignment | ScrollAlignmentOptions;

  /**
   * Scroll behavior.
   * - 'auto': Instant jump.
   * - 'smooth': Animated transition.
   * @default 'smooth'
   */
  behavior?: 'auto' | 'smooth';

  /**
   * Internal flag for recursive correction calls.
   * Users should generally not set this.
   * @internal
   */
  isCorrection?: boolean;
}

/** Represents an item currently rendered in the virtual scroll area. */
export interface RenderedItem<T = unknown> {
  /** The original data item from the provided source array. */
  item: T;
  /** The 0-based index of the item in the original array. */
  index: number;
  /** The calculated pixel offset relative to the items wrapper. */
  offset: {
    /** Horizontal offset (left). */
    x: number;
    /** Vertical offset (top). */
    y: number;
  };
  /** The current measured or estimated size of the item. */
  size: {
    /** Pixel width. */
    width: number;
    /** Pixel height. */
    height: number;
  };
  /** The original horizontal pixel offset before any sticky adjustments. */
  originalX: number;
  /** The original vertical pixel offset before any sticky adjustments. */
  originalY: number;
  /** Whether this item is configured to be sticky via the `stickyIndices` property. */
  isSticky?: boolean;
  /** Whether this item is currently in a stuck state at the viewport edge. */
  isStickyActive?: boolean;
  /** The relative translation applied to the item for the sticky pushing effect. */
  stickyOffset: {
    /** Horizontal translation. */
    x: number;
    /** Vertical translation. */
    y: number;
  };
}

/** Comprehensive state of the virtual scroll system. */
export interface ScrollDetails<T = unknown> {
  /** List of items currently rendered in the DOM buffer. */
  items: RenderedItem<T>[];
  /** Index of the first item partially or fully visible in the viewport. */
  currentIndex: number;
  /** Index of the first column partially or fully visible (grid mode). */
  currentColIndex: number;
  /** Current relative pixel scroll position from the content start. */
  scrollOffset: {
    /** Horizontal position (X). */
    x: number;
    /** Vertical position (Y). */
    y: number;
  };
  /** Current dimensions of the visible viewport area. */
  viewportSize: {
    /** Pixel width. */
    width: number;
    /** Pixel height. */
    height: number;
  };
  /** Total calculated or estimated size of all items and gaps. */
  totalSize: {
    /** Total pixel width. */
    width: number;
    /** Total pixel height. */
    height: number;
  };
  /** Whether the container is currently being scrolled by the user or an animation. */
  isScrolling: boolean;
  /** Whether the current scroll operation was initiated programmatically. */
  isProgrammaticScroll: boolean;
  /** The range of item indices currently being rendered. */
  range: {
    /** Inclusive start index. */
    start: number;
    /** Exclusive end index. */
    end: number;
  };
  /** The range of column indices and associated paddings currently being rendered. */
  columnRange: {
    /** Inclusive start index. */
    start: number;
    /** Exclusive end index. */
    end: number;
    /** Pixel padding to maintain at the start of the row. */
    padStart: number;
    /** Pixel padding to maintain at the end of the row. */
    padEnd: number;
  };
}

/** Configuration properties for the `useVirtualScroll` composable. */
export interface VirtualScrollProps<T = unknown> {
  /**
   * Array of data items to virtualize.
   */
  items: T[];

  /**
   * Fixed size of each item (in pixels) or a function that returns the size of an item.
   * Pass `0`, `null` or `undefined` for automatic dynamic size detection via `ResizeObserver`.
   */
  itemSize?: number | ((item: T, index: number) => number) | undefined;

  /**
   * Direction of the virtual scroll.
   * @default 'vertical'
   */
  direction?: ScrollDirection | undefined;

  /**
   * Number of items to render before the visible viewport.
   * @default 5
   */
  bufferBefore?: number | undefined;

  /**
   * Number of items to render after the visible viewport.
   * @default 5
   */
  bufferAfter?: number | undefined;

  /**
   * The scrollable element or window object.
   * If not provided, virtualization usually happens relative to the `hostElement`.
   */
  container?: HTMLElement | Window | null | undefined;

  /**
   * The host element that directly wraps the absolute-positioned items.
   * Used for calculating relative offsets.
   */
  hostElement?: HTMLElement | null | undefined;

  /**
   * Configuration for Server-Side Rendering.
   * Defines which items are rendered statically on the server.
   */
  ssrRange?: {
    /** First row index. */
    start: number;
    /** Exclusive last row index. */
    end: number;
    /** First column index (grid mode). */
    colStart?: number;
    /** Exclusive last column index (grid mode). */
    colEnd?: number;
  } | undefined;

  /**
   * Number of columns for bidirectional grid scrolling.
   */
  columnCount?: number | undefined;

  /**
   * Fixed width of columns (in pixels), an array of widths, or a function returning widths.
   * Pass `0`, `null` or `undefined` for dynamic column detection.
   */
  columnWidth?: number | number[] | ((index: number) => number) | undefined;

  /**
   * Pixel padding at the start of the scroll container.
   */
  scrollPaddingStart?: number | { x?: number; y?: number; } | undefined;

  /**
   * Pixel padding at the end of the scroll container.
   */
  scrollPaddingEnd?: number | { x?: number; y?: number; } | undefined;

  /**
   * Gap between items in pixels.
   * Applied vertically in list/grid mode, horizontally in horizontal list mode.
   */
  gap?: number | undefined;

  /**
   * Gap between columns in pixels.
   * Applied in horizontal and bidirectional grid modes.
   */
  columnGap?: number | undefined;

  /**
   * List of indices that should stick to the viewport edge.
   */
  stickyIndices?: number[] | undefined;

  /**
   * Threshold distance from the end (in pixels) to emit the 'load' event.
   * @default 200
   */
  loadDistance?: number | undefined;

  /**
   * Whether data is currently loading.
   */
  loading?: boolean | undefined;

  /**
   * Whether to automatically restore and lock scroll position when items are prepended to the array.
   */
  restoreScrollOnPrepend?: boolean | undefined;

  /**
   * Initial row index to jump to on mount.
   */
  initialScrollIndex?: number | undefined;

  /**
   * Initial scroll alignment logic.
   * @default 'start'
   */
  initialScrollAlign?: ScrollAlignment | ScrollAlignmentOptions | undefined;

  /**
   * Default fallback size for items before they are measured.
   */
  defaultItemSize?: number | undefined;

  /**
   * Default fallback width for columns before they are measured.
   */
  defaultColumnWidth?: number | undefined;

  /**
   * Enable debug visualization of buffers and indices.
   */
  debug?: boolean | undefined;
}

/** Properties passed to the 'item' scoped slot. */
export interface ItemSlotProps<T = unknown> {
  /** The original data item being rendered. */
  item: T;
  /** The 0-based index of the item. */
  index: number;
  /** Information about the currently visible range of columns. */
  columnRange: {
    /** First rendered column. */
    start: number;
    /** Last rendered column (exclusive). */
    end: number;
    /** Pixel space before first column. */
    padStart: number;
    /** Pixel space after last column. */
    padEnd: number;
  };
  /** Helper to get the current calculated width of any column index. */
  getColumnWidth: (index: number) => number;
  /** Whether this item index is configured as sticky. */
  isSticky?: boolean | undefined;
  /** Whether this item is currently in a sticky state at the edge. */
  isStickyActive?: boolean | undefined;
}

/** Parameters for calculating the scroll target position. */
export interface ScrollTargetParams {
  /** Row index to target. */
  rowIndex: number | null | undefined;
  /** Column index to target. */
  colIndex: number | null | undefined;
  /** Scroll options. */
  options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions | undefined;
  /** Total items count. */
  itemsLength: number;
  /** Total columns count. */
  columnCount: number;
  /** Current scroll direction. */
  direction: ScrollDirection;
  /** Usable viewport width (excluding padding). */
  usableWidth: number;
  /** Usable viewport height (excluding padding). */
  usableHeight: number;
  /** Current total estimated width. */
  totalWidth: number;
  /** Current total estimated height. */
  totalHeight: number;
  /** Item gap. */
  gap: number;
  /** Column gap. */
  columnGap: number;
  /** Fixed item size. */
  fixedSize: number | null;
  /** Fixed column width. */
  fixedWidth: number | null;
  /** Current relative X scroll. */
  relativeScrollX: number;
  /** Current relative Y scroll. */
  relativeScrollY: number;
  /** Resolver for item height. */
  getItemSizeY: (index: number) => number;
  /** Resolver for item width. */
  getItemSizeX: (index: number) => number;
  /** Prefix sum resolver for item height. */
  getItemQueryY: (index: number) => number;
  /** Prefix sum resolver for item width. */
  getItemQueryX: (index: number) => number;
  /** Resolver for column size. */
  getColumnSize: (index: number) => number;
  /** Prefix sum resolver for column width. */
  getColumnQuery: (index: number) => number;
  /** List of sticky indices. */
  stickyIndices?: number[] | undefined;
}

/** Calculated scroll target result. */
export interface ScrollTargetResult {
  /** Target relative horizontal position. */
  targetX: number;
  /** Target relative vertical position. */
  targetY: number;
  /** Resolved width of the target item. */
  itemWidth: number;
  /** Resolved height of the target item. */
  itemHeight: number;
  /** Effective alignment used for X axis. */
  effectiveAlignX: ScrollAlignment;
  /** Effective alignment used for Y axis. */
  effectiveAlignY: ScrollAlignment;
}

/** Parameters for calculating the visible range of items. */
export interface RangeParams {
  /** Scroll direction. */
  direction: ScrollDirection;
  /** Relative horizontal scroll position. */
  relativeScrollX: number;
  /** Relative vertical scroll position. */
  relativeScrollY: number;
  /** Usable viewport width. */
  usableWidth: number;
  /** Usable viewport height. */
  usableHeight: number;
  /** Total item count. */
  itemsLength: number;
  /** Buffer items before. */
  bufferBefore: number;
  /** Buffer items after. */
  bufferAfter: number;
  /** Item gap. */
  gap: number;
  /** Column gap. */
  columnGap: number;
  /** Fixed item size. */
  fixedSize: number | null;
  /** Binary search for row index. */
  findLowerBoundY: (offset: number) => number;
  /** Binary search for row index (horizontal). */
  findLowerBoundX: (offset: number) => number;
  /** Prefix sum for row height. */
  queryY: (index: number) => number;
  /** Prefix sum for row width. */
  queryX: (index: number) => number;
}

/** Parameters for calculating the visible range of columns in grid mode. */
export interface ColumnRangeParams {
  /** Column count. */
  columnCount: number;
  /** Relative horizontal scroll position. */
  relativeScrollX: number;
  /** Usable viewport width. */
  usableWidth: number;
  /** Column buffer count. */
  colBuffer: number;
  /** Fixed column width. */
  fixedWidth: number | null;
  /** Column gap. */
  columnGap: number;
  /** Binary search for column index. */
  findLowerBound: (offset: number) => number;
  /** Prefix sum for column width. */
  query: (index: number) => number;
  /** Resolver for total column width. */
  totalColsQuery: () => number;
}

/** Parameters for calculating sticky item offsets. */
export interface StickyParams {
  /** Item index. */
  index: number;
  /** Is sticky configured. */
  isSticky: boolean;
  /** Scroll direction. */
  direction: ScrollDirection;
  /** Relative horizontal scroll. */
  relativeScrollX: number;
  /** Relative vertical scroll. */
  relativeScrollY: number;
  /** Original X offset. */
  originalX: number;
  /** Original Y offset. */
  originalY: number;
  /** Current width. */
  width: number;
  /** Current height. */
  height: number;
  /** All sticky indices. */
  stickyIndices: number[];
  /** Fixed item size. */
  fixedSize: number | null;
  /** Fixed column width. */
  fixedWidth: number | null;
  /** Item gap. */
  gap: number;
  /** Column gap. */
  columnGap: number;
  /** Prefix sum resolver for rows. */
  getItemQueryY: (index: number) => number;
  /** Prefix sum resolver for rows (horizontal). */
  getItemQueryX: (index: number) => number;
}

/** Parameters for calculating an item's position and size. */
export interface ItemPositionParams {
  /** Item index. */
  index: number;
  /** Scroll direction. */
  direction: ScrollDirection;
  /** Fixed item size. */
  fixedSize: number | null;
  /** Item gap. */
  gap: number;
  /** Column gap. */
  columnGap: number;
  /** Usable viewport width. */
  usableWidth: number;
  /** Usable viewport height. */
  usableHeight: number;
  /** Total estimated width. */
  totalWidth: number;
  /** Prefix sum for row height. */
  queryY: (idx: number) => number;
  /** Prefix sum for row width. */
  queryX: (idx: number) => number;
  /** Height resolver. */
  getSizeY: (idx: number) => number;
  /** Width resolver. */
  getSizeX: (idx: number) => number;
}

/** Parameters for calculating an item's style object. */
export interface ItemStyleParams<T = unknown> {
  /** The rendered item state. */
  item: RenderedItem<T>;
  /** Scroll direction. */
  direction: ScrollDirection;
  /** Configured item size logic. */
  itemSize: number | ((item: T, index: number) => number) | null | undefined;
  /** Parent container tag. */
  containerTag: string;
  /** Padding start on X axis. */
  paddingStartX: number;
  /** Padding start on Y axis. */
  paddingStartY: number;
  /** Hydration state. */
  isHydrated: boolean;
}

/** Parameters for calculating the total size of the scrollable area. */
export interface TotalSizeParams {
  /** The scroll direction. */
  direction: ScrollDirection;
  /** The number of items in the list. */
  itemsLength: number;
  /** The number of columns (for grid mode). */
  columnCount: number;
  /** The fixed size of items, if applicable. */
  fixedSize: number | null;
  /** The fixed width of columns, if applicable. */
  fixedWidth: number | null;
  /** The gap between items. */
  gap: number;
  /** The gap between columns. */
  columnGap: number;
  /** Usable viewport width. */
  usableWidth: number;
  /** Usable viewport height. */
  usableHeight: number;
  /** Function to query the prefix sum of item heights. */
  queryY: (index: number) => number;
  /** Function to query the prefix sum of item widths. */
  queryX: (index: number) => number;
  /** Function to query the prefix sum of column widths. */
  queryColumn: (index: number) => number;
}
