/**
 * Utilities for scroll management and element type detection.
 * Provides helper functions for checking Window and Body elements,
 * and a universal scrollTo function.
 */

import type { ScrollDirection, ScrollToIndexOptions } from '../types';

/* global ScrollToOptions */

/**
 * Maximum size (in pixels) for an element that most browsers can handle reliably.
 * Beyond this size, we use scaling for the scrollable area.
 * @default 10000000
 */
export const BROWSER_MAX_SIZE = 10000000;

/**
 * Checks if the container is the window object.
 *
 * @param container - The container element or window to check.
 * @returns `true` if the container is the global window object.
 */
export function isWindow(container: HTMLElement | Window | null | undefined): container is Window {
  return container === null || container === document.documentElement || (typeof window !== 'undefined' && container === window);
}

/**
 * Checks if the container is the document body element.
 *
 * @param container - The container element or window to check.
 * @returns `true` if the container is the `<body>` element.
 */
export function isBody(container: HTMLElement | Window | null | undefined): container is HTMLElement {
  return container != null && typeof container === 'object' && 'tagName' in container && container.tagName === 'BODY';
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
  return container != null && 'getBoundingClientRect' in container;
}

/**
 * Checks if the target is an element that supports scrolling.
 *
 * @param target - The event target to check.
 * @returns `true` if the target is an `HTMLElement` with scroll properties.
 */
export function isScrollableElement(target: EventTarget | null): target is HTMLElement {
  return target != null && 'scrollLeft' in target;
}

/**
 * Universal scroll function that handles both Window and HTMLElements.
 *
 * @param container - The container to scroll.
 * @param options - Scroll options.
 */
export function scrollTo(container: HTMLElement | Window | null | undefined, options: ScrollToOptions) {
  if (isWindow(container)) {
    window.scrollTo(options);
  } else if (container != null && isScrollableElement(container)) {
    if (typeof container.scrollTo === 'function') {
      container.scrollTo(options);
    } else {
      if (options.left !== undefined) {
        container.scrollLeft = options.left;
      }
      if (options.top !== undefined) {
        container.scrollTop = options.top;
      }
    }
  }
}

/**
 * Helper to determine if an options argument is a full `ScrollToIndexOptions` object.
 *
 * @param options - The options object to check.
 * @returns `true` if the options object contains scroll-to-index specific properties.
 */
export function isScrollToIndexOptions(options: unknown): options is ScrollToIndexOptions {
  return typeof options === 'object' && options != null && ('align' in options || 'behavior' in options || 'isCorrection' in options);
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
