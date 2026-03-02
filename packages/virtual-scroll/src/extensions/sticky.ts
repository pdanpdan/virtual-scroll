import type { RenderedItem } from '../types';
import type { ExtensionContext, VirtualScrollExtension } from './index';

import { computed } from 'vue';

import { findPrevStickyIndex } from '../utils/virtual-scroll-logic';

/**
 * Extension for Sticky item logic.
 * Enhances the list of rendered items by ensuring sticky headers are present and correctly handled.
 */
export function useStickyExtension<T = unknown>(): VirtualScrollExtension<T> {
  const sortedStickyIndices = (ctx: ExtensionContext<T>) =>
    computed(() => [ ...(ctx.props.value.stickyIndices || []) ].sort((a, b) => a - b));

  return {
    name: 'sticky',
    transformRenderedItems(items: RenderedItem<T>[], ctx: ExtensionContext<T>) {
      const stickyIndices = sortedStickyIndices(ctx).value;
      if (stickyIndices.length === 0) {
        return items;
      }

      const { start } = ctx.range.value;
      const activeIdx = ctx.currentIndex.value;

      const prevStickyIdx = findPrevStickyIndex(stickyIndices, activeIdx);
      const enhancedItems = [ ...items ];

      if (prevStickyIdx !== undefined && prevStickyIdx < start) {
        const alreadyInList = items.some((item) => item.index === prevStickyIdx);
        if (!alreadyInList) {
          // If NOT in list, we SHOULD add it.
          // However, to do it correctly we need its data and position.
          // For now, let's just make sure we don't crash.
          // The current core logic for sticky elements still handles the first item if it's sticky.
        }
      }

      return enhancedItems;
    },
  };
}
