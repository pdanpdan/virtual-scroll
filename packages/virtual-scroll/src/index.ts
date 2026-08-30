/**
 * @pdanpdan/virtual-scroll
 *
 * A high-performance, flexible virtual scrolling library for Vue 3.
 * Supports massive lists and grids with coordinate scaling to bypass browser scroll limits.
 */

export { default as VirtualScroll } from './components/VirtualScroll.vue';
export { default as VirtualScrollbar } from './components/VirtualScrollbar.vue';
export * from './composables/useVirtualScroll';
export * from './composables/useVirtualScrollbar';
export * from './composables/useVirtualScrollSizes';
export * from './types';
export * from './utils/fenwick-tree';
export * from './utils/scroll';
export * from './utils/virtual-scroll-logic';
export * from './extensions/all';
