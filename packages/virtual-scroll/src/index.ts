/**
 * @pdanpdan/virtual-scroll
 *
 * A high-performance, flexible virtual scrolling library for Vue 3.
 * Supports massive lists and grids with coordinate scaling to bypass browser scroll limits.
 *
 * This entry is the supported surface: the components, the composables, the
 * extension contract and the types that appear in their signatures. The pure
 * calculation layer, the DOM scroll helpers, the masonry layout engine, the
 * sizing layer behind `useVirtualScroll` and the internal parameter bags are
 * published from `@pdanpdan/virtual-scroll/internal` without any compatibility
 * guarantee.
 */

/* ---------------------------------- Components ---------------------------------- */

export { default as VirtualScroll } from './components/VirtualScroll.vue';
export { default as VirtualScrollMasonry } from './components/VirtualScrollMasonry.vue';
export { default as VirtualScrollTable } from './components/VirtualScrollTable.vue';
export { default as VirtualScrollbar } from './components/VirtualScrollbar.vue';

/* ---------------------------------- Composables --------------------------------- */

export { useVirtualScroll } from './composables/useVirtualScroll';
export { useVirtualScrollbar } from './composables/useVirtualScrollbar';
export { useVirtualScrollInertia } from './composables/useVirtualScrollInertia';
export { useVirtualScrollKeyboard } from './composables/useVirtualScrollKeyboard';
export { useVirtualScrollMasonry } from './composables/useVirtualScrollMasonry';
export { useVirtualScrollObservers } from './composables/useVirtualScrollObservers';

export type { UseVirtualScrollReturn } from './composables/useVirtualScroll';
export type { UseVirtualScrollbarProps } from './composables/useVirtualScrollbar';
export type { UseVirtualScrollInertiaOptions } from './composables/useVirtualScrollInertia';
export type { UseVirtualScrollKeyboardOptions } from './composables/useVirtualScrollKeyboard';
export type { UseVirtualScrollMasonryInternalState, UseVirtualScrollMasonryReturn } from './composables/useVirtualScrollMasonry';
export type { UseVirtualScrollObserversOptions } from './composables/useVirtualScrollObservers';

/* ---------------------------------- Extensions ---------------------------------- */

export {
  useCoordinateScalingExtension,
  useInfiniteLoadingExtension,
  usePrependRestorationExtension,
  useRtlExtension,
  useSnappingExtension,
  useSnapshotsExtension,
  useStickyExtension,
} from './extensions/all';
export type { InfiniteLoadingExtensionOptions, LoadDetails, ScrollSnapshot, SnapshotsExtension, SnapshotsExtensionOptions } from './extensions/all';
export type { ExtensionContext, VirtualScrollExtension } from './extensions/index';

/* ------------------------------- Types & constants ------------------------------ */

export { BROWSER_MAX_SIZE } from './utils/scroll';
export { FenwickTree } from './utils/fenwick-tree';
export {
  DEFAULT_BUFFER,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ITEM_SIZE,
  DEFAULT_MASONRY_GAP,
  DEFAULT_MASONRY_MAX_COLUMNS,
  DEFAULT_MASONRY_MIN_COLUMNS,
  DEFAULT_MASONRY_SEGMENT_SIZE,
  DEFAULT_MASONRY_TARGET_COLUMN_WIDTH,
  EMPTY_SCROLL_DETAILS,
} from './types';
export type {
  ColumnRange,
  GetItemAriaProps,
  ItemSlotProps,
  MasonryItemSlotProps,
  MasonryRenderedItem,
  MasonryScrollDetails,
  PaddingValue,
  Point,
  RenderedItem,
  ScrollAlignment,
  ScrollAlignmentOptions,
  ScrollAxis,
  ScrollbarSlotProps,
  ScrollDetails,
  ScrollDirection,
  ScrollToIndexOptions,
  ScrollToIndexResult,
  ScrollToOffsetOptions,
  Size,
  SnapMode,
  SSRRange,
  VirtualScrollbarProps,
  VirtualScrollBaseProps,
  VirtualScrollComponentProps,
  VirtualScrollInstance,
  VirtualScrollMasonryComponentProps,
  VirtualScrollMasonryInstance,
  VirtualScrollMasonryProps,
  VirtualScrollProps,
  VirtualScrollTableComponentProps,
  VirtualScrollTableInstance,
} from './types';
