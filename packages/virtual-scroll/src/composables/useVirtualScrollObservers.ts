import type { Ref } from 'vue';

import { getCurrentInstance, onMounted, onUnmounted, watch } from 'vue';

export interface UseVirtualScrollObserversOptions {
  hostRef: Ref<HTMLElement | null>;
  wrapperRef: Ref<HTMLElement | null>;
  headerRef: Ref<HTMLElement | null>;
  footerRef: Ref<HTMLElement | null>;
  measuredPaddingStart: Ref<number>;
  measuredPaddingEnd: Ref<number>;
  itemRefs: Map<number, HTMLElement>;
  direction: 'vertical' | 'horizontal' | 'both';
  updateHostOffset: () => void;
  updateItemSizes: (updates: { index: number; inlineSize: number; blockSize: number; element?: HTMLElement; }[]) => void;
}

export function useVirtualScrollObservers({
  hostRef,
  wrapperRef,
  headerRef,
  footerRef,
  measuredPaddingStart,
  measuredPaddingEnd,
  itemRefs,
  direction,
  updateHostOffset,
  updateItemSizes,
}: UseVirtualScrollObserversOptions) {
  const hostResizeObserver = typeof window === 'undefined'
    ? null
    : new ResizeObserver(updateHostOffset);

  const itemResizeObserver = typeof window === 'undefined'
    ? null
    : new ResizeObserver((entries) => {
      const updates: { index: number; inlineSize: number; blockSize: number; element?: HTMLElement; }[] = [];

      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const index = Number(target.dataset.index);
        const colIndex = target.dataset.colIndex;

        let inlineSize = entry.contentRect.width;
        let blockSize = entry.contentRect.height;

        if (entry.borderBoxSize && entry.borderBoxSize.length > 0) {
          inlineSize = entry.borderBoxSize[ 0 ]!.inlineSize;
          blockSize = entry.borderBoxSize[ 0 ]!.blockSize;
        } else {
          // Fallback for older browsers or if borderBoxSize is missing
          inlineSize = target.offsetWidth;
          blockSize = target.offsetHeight;
        }

        if (colIndex !== undefined) {
          // It's a cell measurement. row index is not strictly needed for column width.
          // We use -1 as a placeholder for row index if it's a cell measurement.
          updates.push({ index: -1, inlineSize, blockSize, element: target });
        } else if (!Number.isNaN(index)) {
          updates.push({ index, inlineSize, blockSize, element: target });
        }
      }

      if (updates.length > 0) {
        updateItemSizes(updates);
      }
    });

  const extraResizeObserver = typeof window === 'undefined'
    ? null
    : new ResizeObserver(() => {
      measuredPaddingStart.value = headerRef.value?.offsetHeight || 0;
      measuredPaddingEnd.value = footerRef.value?.offsetHeight || 0;
      updateHostOffset();
    });

  const watchExtraRef = (refEl: Ref<HTMLElement | null>, measuredValue: Ref<number>) => {
    watch(refEl, (newEl, oldEl) => {
      if (oldEl) {
        extraResizeObserver?.unobserve(oldEl);
      }
      if (newEl) {
        extraResizeObserver?.observe(newEl);
      } else {
        measuredValue.value = 0;
      }
    }, { immediate: true });
  };

  watchExtraRef(headerRef, measuredPaddingStart);
  watchExtraRef(footerRef, measuredPaddingEnd);

  /**
   * Helper to manage ResizeObserver for an item and its optional cells.
   */
  const observeItem = (el: HTMLElement, isObserve: boolean) => {
    const method = isObserve ? 'observe' : 'unobserve';
    itemResizeObserver?.[ method ](el);
    if (direction === 'both' && el.children.length > 0) {
      el.querySelectorAll('[data-col-index]').forEach((c) => itemResizeObserver?.[ method ](c));
    }
  };

  /**
   * Callback ref to track and measure item elements.
   */
  const setItemRef = (el: unknown, index: number) => {
    if (el) {
      const htmlEl = el as HTMLElement;
      itemRefs.set(index, htmlEl);
      observeItem(htmlEl, true);
    } else {
      const oldEl = itemRefs.get(index);
      if (oldEl) {
        observeItem(oldEl, false);
        itemRefs.delete(index);
      }
    }
  };

  if (getCurrentInstance()) {
    onMounted(() => {
      if (hostRef.value) {
        hostResizeObserver?.observe(hostRef.value);
      }

      // Re-observe items that were set before observer was ready
      for (const el of itemRefs.values()) {
        observeItem(el, true);
      }
    });

    onUnmounted(() => {
      hostResizeObserver?.disconnect();
      itemResizeObserver?.disconnect();
      extraResizeObserver?.disconnect();
    });
  }

  watch([ hostRef, wrapperRef ], ([ newHost ], [ oldHost ]) => {
    if (oldHost) {
      hostResizeObserver?.unobserve(oldHost);
    }
    if (newHost) {
      hostResizeObserver?.observe(newHost);
    }
  });

  return {
    setItemRef,
  };
}
