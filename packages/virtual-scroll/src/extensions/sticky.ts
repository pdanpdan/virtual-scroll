import type { Point, RenderedItem, ScrollDirection } from '../types';
import type { ExtensionContext, VirtualScrollExtension } from './index';
import type { ComputedRef } from 'vue';

import { computed } from 'vue';

import { getPaddingX, getPaddingY } from '../utils/scroll';
import { calculateStickyItem, findPrevStickyIndex } from '../utils/virtual-scroll-logic';

const NO_INDICES: number[] = [];

/**
 * Extension for Sticky item logic.
 *
 * Owns everything that makes `stickyIndices` behave: the pinned entry that keeps
 * rendering once a sticky item has scrolled out of the window, and the
 * `isStickyActive` / `stickyOffset` state that pins it while it is in view.
 *
 * The engine keeps the geometry (the sticky start/end offsets that lay items out
 * below a sticky header and before a sticky footer); this extension turns the
 * `stickyIndices` prop into pinning on top of it.
 */
export function useStickyExtension<T = unknown>(): VirtualScrollExtension<T> {
  /*
    Both computeds are created once — `transformRenderedItems` and
    `includeIndices` run on every rendered-items recomputation, so building them
    there allocated a fresh `ComputedRefImpl` per scroll frame.
  */
  let sortedStickyIndices: ComputedRef<number[]> | null = null;
  let stickyStart: ComputedRef<Point> | null = null;
  /**
   * Entries emitted by the previous call, so unchanged items keep their identity.
   * Replaced (not mutated) per call, which also drops indices that left the window.
   */
  let lastStickyItems = new Map<number, RenderedItem<T>>();

  return {
    name: 'sticky',

    onInit(ctx: ExtensionContext<T>) {
      sortedStickyIndices = computed(() => (ctx.props.value.stickyIndices || []).toSorted((a, b) => a - b));
      stickyStart = computed(() => {
        const direction = ctx.props.value.direction as ScrollDirection | undefined;
        return {
          x: getPaddingX(ctx.props.value.stickyStart, direction),
          y: getPaddingY(ctx.props.value.stickyStart, direction),
        };
      });
    },

    includeIndices(ctx: ExtensionContext<T>) {
      const stickyIndices = sortedStickyIndices!.value;
      if (stickyIndices.length === 0 || !ctx.internalState.isHydrated.value) {
        return NO_INDICES;
      }

      const prevStickyIdx = findPrevStickyIndex(stickyIndices, ctx.currentIndex.value);
      return prevStickyIdx !== undefined && prevStickyIdx < ctx.range.value.start ? [ prevStickyIdx ] : NO_INDICES;
    },

    transformRenderedItems(items: RenderedItem<T>[], ctx: ExtensionContext<T>) {
      const stickyIndices = sortedStickyIndices!.value;
      if (stickyIndices.length === 0) {
        lastStickyItems.clear();
        return items;
      }
      const stickySet = new Set(stickyIndices);
      const direction = (ctx.props.value.direction || 'vertical') as ScrollDirection;
      const { x: stickyStartX, y: stickyStartY } = stickyStart!.value;
      const { relativeScrollX, relativeScrollY } = ctx.internalState;
      const gap = ctx.props.value.gap || 0;
      const columnGap = ctx.props.value.columnGap || 0;
      const rawOffset = ctx.methods.getItemRawOffset;
      const previous = lastStickyItems;
      const next = new Map<number, RenderedItem<T>>();
      lastStickyItems = next;
      let nextPtr = 0;

      return items.map((item) => {
        const isSticky = stickySet.has(item.index);
        while (nextPtr < stickyIndices.length && stickyIndices[ nextPtr ]! <= item.index) {
          nextPtr++;
        }
        const { isStickyActiveX, isStickyActiveY, stickyOffset } = calculateStickyItem({
          index: item.index,
          isSticky,
          direction,
          relativeScrollX: relativeScrollX.value,
          relativeScrollY: relativeScrollY.value,
          originalX: item.originalX,
          originalY: item.originalY,
          width: item.size.width,
          height: item.size.height,
          stickyIndices,
          // Query the size cache instead of relying on a fixed size: the query
          // path is correct for both fixed and measured items.
          fixedSize: null,
          fixedWidth: null,
          gap,
          columnGap,
          getItemQueryY: (idx) => rawOffset('y', idx),
          getItemQueryX: (idx) => rawOffset('x', idx),
          nextStickyIndex: nextPtr < stickyIndices.length ? stickyIndices[ nextPtr ] : undefined,
          stickyStartX,
          stickyStartY,
        });

        const isStickyActive = isStickyActiveX || isStickyActiveY;
        const last = previous.get(item.index);
        if (
          last
          && last.item === item.item
          && last.offset.x === item.offset.x
          && last.offset.y === item.offset.y
          && last.originalX === item.originalX
          && last.originalY === item.originalY
          && last.size.width === item.size.width
          && last.size.height === item.size.height
          && last.isStickyActiveX === isStickyActiveX
          && last.isStickyActiveY === isStickyActiveY
          && last.stickyOffset.x === stickyOffset.x
          && last.stickyOffset.y === stickyOffset.y
        ) {
          next.set(item.index, last);
          return last;
        }

        const rendered: RenderedItem<T> = {
          ...item,
          isSticky,
          isStickyActive,
          isStickyActiveX,
          isStickyActiveY,
          stickyOffset,
        };
        next.set(item.index, rendered);
        return rendered;
      });
    },
  };
}
