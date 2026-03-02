import type { ExtensionContext, VirtualScrollExtension } from './index';

import { watch } from 'vue';

import { calculatePrependCount } from '../utils/virtual-scroll-logic';

/**
 * Extension for Prepend Restoration logic.
 * Automatically maintains the current scroll position when items are prepended to the list.
 */
export function usePrependRestorationExtension<T = unknown>(): VirtualScrollExtension<T> {
  let lastItems: T[] = [];

  return {
    name: 'prepend-restoration',
    onInit(ctx: ExtensionContext<T>) {
      // Use a local copy to avoid mutation issues
      lastItems = [ ...ctx.props.value.items ];

      watch(() => ctx.props.value.items, (newItems) => {
        if (!ctx.props.value.restoreScrollOnPrepend) {
          lastItems = [ ...newItems ];
          return;
        }

        const prependCount = calculatePrependCount(lastItems, newItems);

        if (prependCount > 0) {
          const direction = ctx.props.value.direction || 'vertical';
          const gap = (direction === 'horizontal' ? ctx.props.value.columnGap : ctx.props.value.gap) || 0;

          let addedSize = 0;
          for (let i = 0; i < prependCount; i++) {
            addedSize += ctx.methods.getItemBaseSize(newItems[ i ]!, i) + gap;
          }

          if (addedSize > 0) {
            ctx.methods.handleScrollCorrection(
              direction === 'horizontal' ? addedSize : 0,
              direction !== 'horizontal' ? addedSize : 0,
            );
          }
        }

        lastItems = [ ...newItems ];
      }, { deep: false }); // Identity check is enough
    },
  };
}
