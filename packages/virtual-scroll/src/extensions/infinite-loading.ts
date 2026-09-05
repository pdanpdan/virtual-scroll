import type { ExtensionContext, VirtualScrollExtension } from './index';

import { watch } from 'vue';

/**
 * Extension for Infinite Loading logic.
 * Triggers an `onLoad` callback when the user scrolls near the end of the content.
 *
 * @param options - Extension options.
 * @param options.onLoad - Callback triggered when more data should be loaded.
 */
export function useInfiniteLoadingExtension<T = unknown>(options: {
  /**
   * Callback triggered when the scroll position reaches the `loadDistance` threshold.
   * @param axis - The axis that reached the threshold.
   */
  onLoad: (axis: 'vertical' | 'horizontal') => void;
}): VirtualScrollExtension<T> {
  return {
    name: 'infinite-loading',
    onInit(ctx: ExtensionContext<T>) {
      watch(ctx.scrollDetails, (details) => {
        // Fire as soon as the threshold is detected - including while a
        // programmatic scroll (scrollbar drag, PageDown/End) is still running:
        // deferring until the scroll settles delays the loading indicator and,
        // when a drag ends without further scroll events, can skip it entirely.
        if (ctx.props.value.loading || !details || !details.totalSize || (details.totalSize.width === 0 && details.totalSize.height === 0)) {
          return;
        }

        const direction = ctx.props.value.direction || 'vertical';
        const loadDistance = ctx.props.value.loadDistance ?? 200;

        // vertical or both
        if (direction !== 'horizontal') {
          const remaining = details.totalSize.height - (details.scrollOffset.y + details.viewportSize.height);
          if (remaining <= loadDistance) {
            options.onLoad('vertical');
          }
        }
        // horizontal or both
        if (direction !== 'vertical') {
          const remaining = details.totalSize.width - (details.scrollOffset.x + details.viewportSize.width);
          if (remaining <= loadDistance) {
            options.onLoad('horizontal');
          }
        }
      });
    },
  };
}
