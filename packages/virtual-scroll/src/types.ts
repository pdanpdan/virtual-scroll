/** Default fallback size for items (VU). */
export const DEFAULT_ITEM_SIZE = 40;
/** Default fallback width for columns (VU). */
export const DEFAULT_COLUMN_WIDTH = 100;
/** Default number of items to render outside the viewport. */
export const DEFAULT_BUFFER = 5;

/** Represents a point in 2D space. */
export interface Point {
  /** X coordinate. */
  x: number;
  /** Y coordinate. */
  y: number;
}

/** Represents dimensions in 2D space. */
export interface Size {
  /** Width dimension. */
  width: number;
  /** Height dimension. */
  height: number;
}

/** Initial empty state for scroll details. */
export const EMPTY_SCROLL_DETAILS: ScrollDetails<unknown> = {
  items: [],
  currentIndex: 0,
  currentColIndex: 0,
  currentEndIndex: 0,
  currentEndColIndex: 0,
  scrollOffset: { x: 0, y: 0 },
  displayScrollOffset: { x: 0, y: 0 },
  viewportSize: { width: 0, height: 0 },
  displayViewportSize: { width: 0, height: 0 },
  totalSize: { width: 0, height: 0 },
  isScrolling: false,
  isProgrammaticScroll: false,
  range: { start: 0, end: 0 },
  columnRange: { start: 0, end: 0, padStart: 0, padEnd: 0 },
};

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

  /**
   * If true, only calculates the target position without performing the actual scroll.
   * Useful for extensions that need to validate if a snap is necessary.
   * @default false
   */
  dryRun?: boolean;
}

/** Result of the `scrollToIndex` method. */
export interface ScrollToIndexResult {
  /** Target relative horizontal position in virtual units (VU). */
  targetX: number;
  /** Target relative vertical position in virtual units (VU). */
  targetY: number;
  /** Target display horizontal position (DU). */
  displayTargetX: number;
  /** Target display vertical position (DU). */
  displayTargetY: number;
}

/** Represents an item currently rendered in the virtual scroll area. */
export interface RenderedItem<T = unknown> {
  /** The original data item from the provided source array. */
  item: T;
  /** The 0-based index of the item in the original array. */
  index: number;
  /** The calculated pixel offset relative to the items wrapper in display pixels (DU). */
  offset: Point;
  /** The current measured or estimated size of the item in virtual units (VU). */
  size: Size;
  /** The original horizontal pixel offset before any sticky adjustments in VU. */
  originalX: number;
  /** The original vertical pixel offset before any sticky adjustments in VU. */
  originalY: number;
  /** Whether this item is configured to be sticky via the `stickyIndices` property. */
  isSticky?: boolean;
  /** Whether this item is currently in a stuck state at the viewport edge. */
  isStickyActive?: boolean;
  /** Whether this item is currently in a stuck state at the horizontal viewport edge. */
  isStickyActiveX?: boolean;
  /** Whether this item is currently in a stuck state at the vertical viewport edge. */
  isStickyActiveY?: boolean;
  /** The relative translation applied to the item for the sticky pushing effect in DU. */
  stickyOffset: Point;
}

/** Information about the currently visible range of columns and their paddings. */
export interface ColumnRange {
  /** Inclusive start index. */
  start: number;
  /** Exclusive end index. */
  end: number;
  /** Pixel padding to maintain at the start of the row in VU. */
  padStart: number;
  /** Pixel padding to maintain at the end of the row in VU. */
  padEnd: number;
}

/** Comprehensive state of the virtual scroll system. */
export interface ScrollDetails<T = unknown> {
  /** List of items currently rendered in the DOM buffer. */
  items: RenderedItem<T>[];
  /** Index of the first item visible below any sticky header in the viewport. */
  currentIndex: number;
  /** Index of the first column visible after any sticky column in the viewport (grid mode). */
  currentColIndex: number;
  /** Index of the last item visible above any sticky footer in the viewport. */
  currentEndIndex: number;
  /** Index of the last column visible before any sticky end column in the viewport (grid mode). */
  currentEndColIndex: number;
  /** Current relative pixel scroll position from the content start in VU. */
  scrollOffset: Point;
  /** Current display pixel scroll position (before scaling) in DU. */
  displayScrollOffset: Point;
  /** Current dimensions of the visible viewport area in VU. */
  viewportSize: Size;
  /** Current dimensions of the visible viewport area in display pixels (DU). */
  displayViewportSize: Size;
  /** Total calculated or estimated size of all items and gaps in VU. */
  totalSize: Size;
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
  columnRange: ColumnRange;
}

/** Helper to get ARIA attributes for an item. */
export type GetItemAriaProps = (index: number) => Record<string, string | number | undefined>;

/**
 * Configuration for Server-Side Rendering.
 * Defines which items are rendered statically on the server.
 */
export interface SSRRange {
  /** First row index (for list or grid). */
  start: number;
  /** Exclusive last row index (for list or grid). */
  end: number;
  /** First column index (for grid mode). */
  colStart?: number;
  /** Exclusive last column index (for grid mode). */
  colEnd?: number;
}

/** Pixel padding configuration in display pixels (DU). */
export type PaddingValue = number | { x?: number; y?: number; };

/**
 * Snap mode for automatic alignment after scrolling stops.
 * - `false`: No snapping.
 * - `true`: Same as 'auto'.
 * - 'start': Aligns the first visible item to the viewport start if at least 50% visible, otherwise aligns the next item.
 * - 'center': Aligns the item that intersects the viewport center to the center.
 * - 'end': Aligns the last visible item to the viewport end if at least 50% visible, otherwise aligns the previous item.
 * - 'next': Snaps to the next (closest) snap position in the direction of the scroll.
 * - 'auto': Intelligent snapping based on scroll direction. Acts as 'end' when scrolling towards start, and 'start' when scrolling towards end.
 */
export type SnapMode = boolean | 'start' | 'center' | 'end' | 'next' | 'auto';

/** Base configuration properties shared between the component and the composable. */
export interface VirtualScrollBaseProps<T = unknown> {
  /** Array of data items to virtualize. */
  items: T[];

  /**
   * Fixed size of each item in virtual units (VU) or a function that returns the size of an item.
   * Pass `0`, `null` or `undefined` for automatic dynamic size detection via `ResizeObserver`.
   */
  itemSize?: number | (number | null | undefined)[] | ((item: T, index: number) => number) | null | undefined;

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
   * If not provided, virtualization usually happens relative to the `hostRef`.
   */
  container?: HTMLElement | Window | null | undefined;

  /**
   * Configuration for Server-Side Rendering.
   * Defines which items are rendered statically on the server.
   */
  ssrRange?: SSRRange | undefined;

  /**
   * Number of columns for bidirectional grid scrolling.
   */
  columnCount?: number | undefined;

  /**
   * Fixed width of columns in VU, an array of widths, or a function returning widths.
   * Pass `0`, `null` or `undefined` for dynamic column detection.
   */
  columnWidth?: number | (number | null | undefined)[] | ((index: number) => number) | null | undefined;

  /**
   * Pixel padding at the start of the scroll container in display pixels (DU).
   */
  scrollPaddingStart?: PaddingValue | undefined;

  /**
   * Pixel padding at the end of the scroll container in DU.
   */
  scrollPaddingEnd?: PaddingValue | undefined;

  /**
   * Gap between items in virtual units (VU).
   * Applied vertically in list/grid mode, horizontally in horizontal list mode.
   */
  gap?: number | undefined;

  /**
   * Gap between columns in virtual units (VU).
   * Applied in horizontal and bidirectional grid modes.
   */
  columnGap?: number | undefined;

  /**
   * List of indices that should stick to the viewport edge.
   */
  stickyIndices?: number[] | undefined;

  /**
   * Threshold distance from the end in display pixels (DU) to emit the 'load' event.
   * @default 200
   */
  loadDistance?: number | undefined;

  /**
   * Whether data is currently loading.
   * While true, the loading slot is shown and `load` events are suppressed.
   */
  loading?: boolean | undefined;

  /**
   * Whether to automatically maintain scroll position when items are prepended to the array.
   * Useful for "load more" chat interfaces.
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
   * Default fallback size for items before they are measured in VU.
   */
  defaultItemSize?: number | undefined;

  /**
   * Default fallback width for columns before they are measured in VU.
   */
  defaultColumnWidth?: number | undefined;

  /**
   * Enable debug visualization of buffers and indices.
   */
  debug?: boolean | undefined;

  /**
   * ARIA role for the scroll container.
   * Defaults to 'list' for vertical/horizontal and 'grid' for both.
   */
  role?: string | undefined;

  /**
   * ARIA label for the scroll container.
   */
  ariaLabel?: string | undefined;

  /**
   * ID of the element that labels the scroll container.
   */
  ariaLabelledby?: string | undefined;

  /**
   * ARIA role for each rendered item.
   * Defaults to 'listitem' for list roles and 'row' for grid roles.
   * Set to 'none' or 'presentation' to disable automatic role assignment on the wrapper.
   */
  itemRole?: string | undefined;

  /**
   * Whether to snap to items after scrolling stops.
   * Options: false, true, 'auto', 'next', 'start', 'center', 'end'.
   * @default false
   */
  snap?: SnapMode | undefined;
}

/** Configuration properties for the `useVirtualScroll` composable. */
export interface VirtualScrollProps<T = unknown> extends VirtualScrollBaseProps<T> {
  /**
   * The host element that directly wraps the absolute-positioned items.
   * Used for calculating relative offsets in display pixels (DU).
   */
  hostElement?: HTMLElement | null | undefined;

  /**
   * The root element of the VirtualScroll component.
   * Used for calculating relative offsets in display pixels (DU).
   */
  hostRef?: HTMLElement | null | undefined;

  /**
   * Size of sticky elements at the start of the viewport (top or left) in DU.
   * Used to adjust the visible range and item positioning without increasing content size.
   */
  stickyStart?: PaddingValue | undefined;

  /**
   * Size of sticky elements at the end of the viewport (bottom or right) in DU.
   * Used to adjust the visible range without increasing content size.
   */
  stickyEnd?: PaddingValue | undefined;

  /**
   * Extra padding (display pixels - DU) at the start of the flow (e.g. non-sticky header).
   */
  flowPaddingStart?: PaddingValue | undefined;

  /**
   * Extra padding (DU) at the end of the flow (e.g. non-sticky footer).
   */
  flowPaddingEnd?: PaddingValue | undefined;
}

/** Help provide axis specific information to the scrollbar. */
export type ScrollAxis = 'vertical' | 'horizontal';

/** Properties for the `VirtualScrollbar` component. */
export interface VirtualScrollbarProps {
  /**
   * The axis for this scrollbar.
   * - 'vertical': Vertical scrollbar.
   * - 'horizontal': Horizontal scrollbar.
   * @default 'vertical'
   */
  axis?: ScrollAxis;

  /**
   * Total size of the scrollable content in pixels.
   */
  totalSize: number;

  /**
   * Current scroll position in pixels.
   */
  position: number;

  /**
   * Viewport size in pixels.
   */
  viewportSize: number;

  /**
   * Function to scroll to a specific pixel offset on this axis.
   * @param offset - The pixel offset to scroll to.
   */
  scrollToOffset?: (offset: number) => void;

  /**
   * The ID of the container element this scrollbar controls.
   */
  containerId?: string;

  /**
   * Whether the scrollbar is in Right-to-Left (RTL) mode.
   * @default false
   */
  isRtl?: boolean;

  /**
   * Accessible label for the scrollbar.
   */
  ariaLabel?: string;
}

/** Properties passed to the 'scrollbar' scoped slot. */
export interface ScrollbarSlotProps {
  /** The axis for this scrollbar. */
  axis: ScrollAxis;
  /** Current scroll position as a percentage (0 to 1). */
  positionPercent: number;
  /** Viewport size as a percentage of total size (0 to 1). */
  viewportPercent: number;
  /** Calculated thumb size as a percentage of the track size (0 to 100). */
  thumbSizePercent: number;
  /** Calculated thumb position as a percentage of the track size (0 to 100). */
  thumbPositionPercent: number;

  /**
   * Attributes and event listeners to be bound to the scrollbar track element.
   * Use `v-bind="trackProps"` on your track element.
   */
  trackProps: Record<string, unknown>;

  /**
   * Attributes and event listeners to be bound to the scrollbar thumb element.
   * Use `v-bind="thumbProps"` on your thumb element.
   */
  thumbProps: Record<string, unknown>;

  /**
   * Grouped props for the `VirtualScrollbar` component.
   * Useful for passing directly to `<VirtualScrollbar v-bind="scrollbarProps" />`.
   */
  scrollbarProps: VirtualScrollbarProps;

  /** Whether the thumb is currently being dragged. */
  isDragging: boolean;
}

/** Properties passed to the 'item' scoped slot. */
export interface ItemSlotProps<T = unknown> {
  /** The original data item being rendered. */
  item: T;
  /** The 0-based index of the item. */
  index: number;
  /** Helper to get ARIA attributes for the item. */
  getItemAriaProps: GetItemAriaProps;
  /** Information about the currently visible range of columns. */
  columnRange: ColumnRange;
  /** Helper to get the current calculated width of any column index. */
  getColumnWidth: (index: number) => number;
  /** Helper to get ARIA attributes for a cell. */
  getCellAriaProps: (colIndex: number) => Record<string, string | number | undefined>;
  /** Vertical gap between items. */
  gap: number;
  /** Horizontal gap between columns. */
  columnGap: number;
  /** Whether this item index is configured as sticky. */
  isSticky?: boolean | undefined;
  /** Whether this item is currently in a sticky state at the edge. */
  isStickyActive?: boolean | undefined;
  /** Whether this item is currently in a sticky state at the horizontal edge. */
  isStickyActiveX?: boolean | undefined;
  /** Whether this item is currently in a sticky state at the vertical edge. */
  isStickyActiveY?: boolean | undefined;
  /** The calculated pixel offset relative to the items wrapper in display pixels (DU). */
  offset: {
    /** Horizontal offset (left) in DU. */
    x: number;
    /** Vertical offset (top) in DU. */
    y: number;
  };
}

/** Configuration properties for the `VirtualScroll` component. */
export interface VirtualScrollComponentProps<T = unknown> extends VirtualScrollBaseProps<T> {
  /** The HTML tag to use for the root container. */
  containerTag?: string;
  /** The HTML tag to use for the items wrapper. */
  wrapperTag?: string;
  /** The HTML tag to use for each item. */
  itemTag?: string;
  /** Whether the content in the 'header' slot is sticky. */
  /**
   * If true, measures the header slot size and adds it to the scroll padding.
   * Can be combined with CSS for sticky headers.
   */
  stickyHeader?: boolean;
  /**
   * If true, measures the footer slot size and adds it to the scroll padding.
   * Can be combined with CSS for sticky footers.
   */
  stickyFooter?: boolean;
  /**
   * Whether to use virtual scrollbars.
   * Automatically enabled when content size exceeds browser limits.
   */
  virtualScrollbar?: boolean;
}

/** Exposed methods and properties of the `VirtualScroll` component instance. */
export interface VirtualScrollInstance<T = unknown> extends VirtualScrollComponentProps<T> {
  /** Detailed information about the current scroll state. */
  scrollDetails: ScrollDetails<T>;
  /** Information about the current visible range of columns. */
  columnRange: ScrollDetails<T>[ 'columnRange' ];
  /** Helper to get the width of a specific column. */
  getColumnWidth: (index: number) => number;
  /** Helper to get the height of a specific row. */
  getRowHeight: (index: number) => number;
  /** Helper to get ARIA attributes for a cell. */
  getCellAriaProps: (colIndex: number) => Record<string, string | number | undefined>;
  /** Helper to get ARIA attributes for an item. */
  getItemAriaProps: (index: number) => Record<string, string | number | undefined>;
  /** The ARIA role of the items wrapper. */
  wrapperRole: string | null;
  /** The ARIA role of each cell. */
  cellRole: string | null;
  /** Helper to get the virtual offset of a specific row. */
  getRowOffset: (index: number) => number;
  /** Helper to get the virtual offset of a specific column. */
  getColumnOffset: (index: number) => number;
  /** Helper to get the virtual offset of a specific item. */
  getItemOffset: (index: number) => number;
  /** Helper to get the size of a specific item along the scroll axis. */
  getItemSize: (index: number) => number;
  /** Whether the component is in table mode. */
  isTable: boolean;
  /** The tag used for rendering items. */
  itemTag: string;
  /** Programmatically scroll to a specific row and/or column. */
  scrollToIndex: (rowIndex?: number | null, colIndex?: number | null, options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions) => ScrollToIndexResult;
  /** Programmatically scroll to a specific pixel offset. */
  scrollToOffset: (x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void;
  /** Resets all dynamic measurements and re-initializes from props. */
  refresh: () => void;
  /** Immediately stops any currently active smooth scroll animation and clears pending corrections. */
  stopProgrammaticScroll: () => void;
  /** Detects the current direction (LTR/RTL) of the scroll container. */
  updateDirection: () => void;
  /** Whether the scroll container is in Right-to-Left (RTL) mode. */
  isRtl: boolean;
  /** Whether the component has finished its first client - side mount and hydration. */
  isHydrated: boolean;
  /** Coordinate scaling factor for X axis. */
  scaleX: number;
  /** Coordinate scaling factor for Y axis. */
  scaleY: number;
  /** Physical width of the content in the DOM (clamped to browser limits). */
  renderedWidth: number;
  /** Physical height of the content in the DOM (clamped to browser limits). */
  renderedHeight: number;
  /** Absolute offset of the component within its container. */
  componentOffset: Point;
  /** Properties for the vertical scrollbar. */
  scrollbarPropsVertical: ScrollbarSlotProps | null;
  /** Properties for the horizontal scrollbar. */
  scrollbarPropsHorizontal: ScrollbarSlotProps | null;
}

/** Parameters for calculating the scroll target position. */
export interface ScrollTargetParams {
  /** Row index to target. */
  rowIndex: number | null | undefined;
  /** Column index to target. */
  colIndex: number | null | undefined;
  /** Scroll options. */
  options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions | undefined;
  /** Current scroll direction. */
  direction: ScrollDirection;
  /** Current viewport width. */
  viewportWidth: number;
  /** Current viewport height. */
  viewportHeight: number;
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
  /** Coordinate scaling factor for X axis. */
  scaleX: number;
  /** Coordinate scaling factor for Y axis. */
  scaleY: number;
  /** Host offset on X axis in display pixels. */
  hostOffsetX: number;
  /** Host offset on Y axis in display pixels. */
  hostOffsetY: number;
  /** List of sticky indices. */
  stickyIndices?: number[] | undefined;
  /** Sticky start offset on X axis. */
  stickyStartX?: number | undefined;
  /** Sticky start offset on Y axis. */
  stickyStartY?: number | undefined;
  /** Sticky end offset on X axis. */
  stickyEndX?: number | undefined;
  /** Sticky end offset on Y axis. */
  stickyEndY?: number | undefined;
  /** Flow padding start on X axis. */
  flowPaddingStartX?: number | undefined;
  /** Flow padding start on Y axis. */
  flowPaddingStartY?: number | undefined;
  /** Scroll padding start on X axis. */
  paddingStartX?: number | undefined;
  /** Scroll padding start on Y axis. */
  paddingStartY?: number | undefined;
  /** Scroll padding end on X axis. */
  paddingEndX?: number | undefined;
  /** Scroll padding end on Y axis. */
  paddingEndY?: number | undefined;
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
  /** Column count (for grid mode). */
  columnCount?: number;
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
  /** Sticky elements size at the start (top/left) in DU: sticky items stick below them. */
  stickyStartX?: number;
  /** Sticky elements size at the start (top/left) in DU: sticky items stick below them. */
  stickyStartY?: number;
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
  /** Current column range (for grid mode). */
  columnRange?: ColumnRange | undefined;
}

/** Parameters for calculating an item's style object. */
export interface ItemStyleParams<T = unknown> {
  /** The rendered item state. */
  item: RenderedItem<T>;
  /** Scroll direction. */
  direction: ScrollDirection;
  /** Configured item size logic. */
  itemSize: number | (number | null | undefined)[] | ((item: T, index: number) => number) | null | undefined;
  /** Parent container tag. */
  containerTag: string;
  /** Padding start on X axis. */
  paddingStartX: number;
  /** Padding start on Y axis. */
  paddingStartY: number;
  /** Hydration state. */
  isHydrated: boolean;
  /** Whether the container is in Right-to-Left (RTL) mode. */
  isRtl: boolean;
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
