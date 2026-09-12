/**
 * Engine internals of `@pdanpdan/virtual-scroll`.
 *
 * The pure calculation layer, the DOM scroll helpers, the masonry layout engine,
 * the sizing layer behind `useVirtualScroll` and the parameter bags those
 * functions take. They are published so that tests, extensions and advanced
 * integrations can reach them, but they are **not** part of the documented API
 * and carry no compatibility guarantee: shapes and signatures may change in any
 * release, including a patch.
 *
 * Import from the package root for everything covered by the docs.
 */
export { useVirtualScrollSizes } from './composables/useVirtualScrollSizes';
export type { UseVirtualScrollSizesProps } from './composables/useVirtualScrollSizes';
export * from './utils/fenwick-tree';
export * from './utils/masonry-layout';
export * from './utils/scroll';
export * from './utils/virtual-scroll-logic';
export type {
  ColumnRangeParams,
  ItemPositionParams,
  ItemStyleParams,
  RangeParams,
  ScrollTargetParams,
  ScrollTargetResult,
  StickyParams,
  TotalSizeParams,
} from './types';
