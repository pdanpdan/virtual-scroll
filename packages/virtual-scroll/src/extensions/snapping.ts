import type { ScrollAlignment, SnapMode } from '../types';
import type { ExtensionContext, VirtualScrollExtension } from './index';

import { resolveSnap } from '../utils/virtual-scroll-logic';

/**
 * Extension for Snap logic.
 * Automatically snaps to the nearest item or column after scrolling stops based on the `snap` prop.
 */
export function useSnappingExtension<T = unknown>(): VirtualScrollExtension<T> {
  return {
    name: 'snapping',
    onScrollEnd(ctx: ExtensionContext<T>) {
      if (!ctx.props.value.snap || ctx.internalState.isProgrammaticScroll.value) {
        return;
      }

      const snapProp = ctx.props.value.snap;
      const snapMode = snapProp === true ? 'auto' : snapProp as SnapMode;
      const details = ctx.scrollDetails.value;
      const itemsLen = ctx.props.value.items.length;
      const direction = ctx.props.value.direction || 'vertical';

      let targetRow: number | null = details.currentIndex;
      let targetCol: number | null = details.currentColIndex;
      let alignY: ScrollAlignment = 'start';
      let alignX: ScrollAlignment = 'start';
      let shouldSnap = false;

      // Handle Y Axis (Vertical)
      if (direction !== 'horizontal') {
        const res = resolveSnap(
          snapMode,
          ctx.internalState.scrollDirectionY.value,
          details.currentIndex,
          details.currentEndIndex,
          ctx.internalState.relativeScrollY.value,
          ctx.internalState.viewportHeight.value,
          itemsLen,
          (i) => ctx.methods.getItemSize(i),
          (i) => ctx.methods.getItemOffset(i),
          ctx.methods.getRowIndexAt,
        );
        if (res) {
          targetRow = res.index;
          alignY = res.align as ScrollAlignment;
          shouldSnap = true;
        }
      }

      // Handle X Axis (Horizontal)
      if (direction !== 'vertical') {
        const isGrid = direction === 'both';
        const colCount = isGrid ? (ctx.props.value.columnCount || 0) : itemsLen;
        const res = resolveSnap(
          snapMode,
          ctx.internalState.scrollDirectionX.value,
          details.currentColIndex,
          details.currentEndColIndex,
          ctx.internalState.relativeScrollX.value,
          ctx.internalState.viewportWidth.value,
          colCount,
          (i) => ctx.methods.getItemSize(i),
          (i) => ctx.methods.getItemOffset(i),
          ctx.methods.getColIndexAt,
        );
        if (res) {
          targetCol = res.index;
          alignX = res.align as ScrollAlignment;
          shouldSnap = true;
        }
      }

      if (shouldSnap) {
        const { targetX, targetY } = ctx.methods.scrollToIndex(targetRow, targetCol, {
          align: { x: alignX, y: alignY },
          dryRun: true,
        });

        const currentX = ctx.internalState.internalScrollX.value;
        const currentY = ctx.internalState.internalScrollY.value;

        const diffX = (targetCol !== null) ? Math.abs(targetX - currentX) : 0;
        const diffY = (targetRow !== null) ? Math.abs(targetY - currentY) : 0;

        if (diffX > 0.5 || diffY > 0.5) {
          ctx.methods.scrollToIndex(targetRow, targetCol, {
            align: { x: alignX, y: alignY },
            behavior: 'smooth',
          });
        }
      }
    },
  };
}
