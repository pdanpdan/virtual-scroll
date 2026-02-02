import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';

import { ref } from 'vue';

/**
 * Common scroll handling logic for playground examples.
 * Reduces duplication of scroll-related state and handlers.
 */
export function useExampleScroll() {
  const virtualScrollRef = ref();
  const scrollDetails = ref<ScrollDetails | null>(null);

  /** Callback for the 'scroll' event. */
  function onScroll(details: ScrollDetails) {
    scrollDetails.value = details;
  }

  /** Handler for 'scrollToIndex' events from controls. */
  function handleScrollToIndex(row: number | null, col: number | null, align: ScrollAlignment | ScrollAlignmentOptions) {
    virtualScrollRef.value?.scrollToIndex(row, col, align);
  }

  /** Handler for 'scrollToOffset' events from controls. */
  function handleScrollToOffset(x: number | null, y: number | null) {
    virtualScrollRef.value?.scrollToOffset(x, y);
  }

  return {
    /** Ref to be bound to the VirtualScroll component. */
    virtualScrollRef,
    /** Reactive scroll state. */
    scrollDetails,
    /** Scroll event listener. */
    onScroll,
    /** Index scroll handler. */
    handleScrollToIndex,
    /** Offset scroll handler. */
    handleScrollToOffset,
  };
}
