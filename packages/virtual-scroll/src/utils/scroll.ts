import type { ScrollDirection, ScrollToIndexOptions } from '../types';

/**
 * Checks if the container is the window object.
 *
 * @param container - The container element or window to check.
 * @returns `true` if the container is the global window object.
 */
export function isWindow(container: HTMLElement | Window | null | undefined): container is Window {
  return container === null || (typeof window !== 'undefined' && container === window);
}

/**
 * Checks if the container is the document body element.
 *
 * @param container - The container element or window to check.
 * @returns `true` if the container is the `<body>` element.
 */
export function isBody(container: HTMLElement | Window | null | undefined): container is HTMLElement {
  return !!container && typeof container === 'object' && 'tagName' in container && container.tagName === 'BODY';
}

/**
 * Checks if the container is window-like (global window or document body).
 *
 * @param container - The container element or window to check.
 * @returns `true` if the container is window or body.
 */
export function isWindowLike(container: HTMLElement | Window | null | undefined): boolean {
  return isWindow(container) || isBody(container);
}

/**
 * Checks if the container is a valid HTML Element with bounding rect support.
 *
 * @param container - The container to check.
 * @returns `true` if the container is an `HTMLElement`.
 */
export function isElement(container: HTMLElement | Window | null | undefined): container is HTMLElement {
  return !!container && 'getBoundingClientRect' in container;
}

/**
 * Checks if the target is an element that supports scrolling.
 *
 * @param target - The event target to check.
 * @returns `true` if the target is an `HTMLElement` with scroll properties.
 */
export function isScrollableElement(target: EventTarget | null): target is HTMLElement {
  return !!target && 'scrollLeft' in target;
}

/**
 * Helper to determine if an options argument is a full `ScrollToIndexOptions` object.
 *
 * @param options - The options object to check.
 * @returns `true` if the options object contains scroll-to-index specific properties.
 */
export function isScrollToIndexOptions(options: unknown): options is ScrollToIndexOptions {
  return typeof options === 'object' && options !== null && ('align' in options || 'behavior' in options || 'isCorrection' in options);
}

/**
 * Extracts the horizontal padding from a padding configuration.
 *
 * @param p - The padding value (number or object with x/y).
 * @param direction - The current scroll direction.
 * @returns The horizontal padding in pixels.
 */
export function getPaddingX(p: number | { x?: number; y?: number; } | undefined, direction?: ScrollDirection) {
  if (typeof p === 'object' && p !== null) {
    return p.x || 0;
  }
  return (direction === 'horizontal' || direction === 'both') ? (p || 0) : 0;
}

/**
 * Extracts the vertical padding from a padding configuration.
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
