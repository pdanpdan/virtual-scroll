import type { Ref } from 'vue';

import { onBeforeUnmount, watch } from 'vue';

/**
 * Announces a changing message to assistive technology.
 *
 * The element is created at runtime rather than rendered by a template: a
 * `div` is not valid inside a `<table>` (or a `<ul>`, `<select>`, …), and the
 * HTML parser moves such a child out of the table, which hydration then reports
 * as a node mismatch. Creating it after mount keeps every container tag valid.
 *
 * @param container - Ref to the element the region is appended to.
 * @param message - Reactive text to announce; empty messages are not announced.
 */
export function useLiveRegion(container: Ref<HTMLElement | null>, message: Ref<string>): void {
  let element: HTMLElement | null = null;

  const ensure = (): HTMLElement | null => {
    element ??= createRegion(container.value);
    return element;
  };

  watch(message, (text) => {
    const region = ensure();
    /* v8 ignore next -- the container always exists once the component is mounted */
    if (region) {
      region.textContent = text;
    }
  });

  onBeforeUnmount(() => {
    element?.remove();
    element = null;
  });
}

/**
 * Creates the visually hidden polite live region, or returns `null` while there
 * is no container to attach it to.
 *
 * @param container - Element the region is appended to.
 */
function createRegion(container: HTMLElement | null): HTMLElement | null {
  // v8 ignore next -- SSR/prerender has no container; the region is client only
  if (!container) {
    return null;
  }

  const region = container.ownerDocument.createElement('div');
  region.className = 'virtual-scroll-live-region';
  region.setAttribute('role', 'status');
  region.setAttribute('aria-live', 'polite');
  region.setAttribute('aria-atomic', 'true');
  region.style.cssText = 'position:absolute;inline-size:1px;block-size:1px;margin:-1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0;';
  container.append(region);
  return region;
}
