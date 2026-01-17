import type { ScrollDirection, ScrollToIndexOptions } from '../composables/useVirtualScroll';

/**
 * Checks if the container has a bounding client rect method.
 *
 * @param container - The container element or window to check.
 * @returns True if the container is an HTMLElement with getBoundingClientRect.
 */
export function isElement(container: HTMLElement | Window | null | undefined): container is HTMLElement {
  return !!container && 'getBoundingClientRect' in container;
}

/**
 * Checks if the target is an element with scroll properties.
 *
 * @param target - The event target to check.
 * @returns True if the target is an HTMLElement with scroll properties.
 */
export function isScrollableElement(target: EventTarget | null): target is HTMLElement {
  return !!target && 'scrollLeft' in target;
}

/**
 * Helper to determine if an options argument is the full ScrollToIndexOptions object.
 *
 * @param options - The options object to check.
 * @returns True if the options object contains scroll-to-index specific properties.
 */
export function isScrollToIndexOptions(options: unknown): options is ScrollToIndexOptions {
  return typeof options === 'object' && options !== null && ('align' in options || 'behavior' in options || 'isCorrection' in options);
}

/**
 * Extracts the horizontal padding from a padding value or object.
 *
 * @param p - The padding value (number or object with x/y).
 * @param direction - The current scroll direction.
 * @returns The horizontal padding in pixels.
 */
export function getPaddingX(p: number | { x?: number; y?: number; } | undefined, direction?: ScrollDirection) {
  if (typeof p === 'object' && p !== null) {
    return p.x || 0;
  }
  return direction === 'horizontal' ? (p || 0) : 0;
}

/**
 * Extracts the vertical padding from a padding value or object.
 *
 * @param p - The padding value (number or object with x/y).
 * @param direction - The current scroll direction.
 * @returns The vertical padding in pixels.
 */
export function getPaddingY(p: number | { x?: number; y?: number; } | undefined, direction?: ScrollDirection) {
  if (typeof p === 'object' && p !== null) {
    return p.y || 0;
  }
  return (direction === 'vertical' || direction === 'both') ? (p || 0) : 0;
}
