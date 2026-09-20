<script setup lang="ts">
import type { ScrollbarSlotProps } from '../types';
import type { VNodeChild } from 'vue';

import VirtualScrollbar from './VirtualScrollbar.vue';

/**
 * Scrollbar overlay of {@link VirtualScroll}.
 *
 * Kept in its own component so the whole overlay (the two custom scrollbars and
 * their styles) is only reachable from a build that renders it.
 */
const props = defineProps<{
  /** Slot props of the vertical scrollbar, or `null` when it is not shown. */
  vertical: ScrollbarSlotProps | null;
  /** Slot props of the horizontal scrollbar, or `null` when it is not shown. */
  horizontal: ScrollbarSlotProps | null;
  /** Viewport width in display units (DU). */
  viewportWidth: number;
  /** Viewport height in display units (DU). */
  viewportHeight: number;
  /** Inline offset of the scroll container inside the component (DU). */
  offsetX: number;
  /** Block offset of the scroll container inside the component (DU). */
  offsetY: number;
  /** Whether the list scrolls on both axes. */
  both: boolean;
}>();

const slots = defineSlots<{
  /**
   * Scoped slot for rendering custom scrollbars.
   * If provided, the default VirtualScrollbar is not rendered.
   */
  scrollbar?: (props: ScrollbarSlotProps) => VNodeChild;
}>();
</script>

<template>
  <div
    class="virtual-scroll-scrollbar-container"
    aria-hidden="true"
  >
    <div
      class="virtual-scroll-scrollbar-viewport"
      :style="{
        'inlineSize': `${ props.viewportWidth }px`,
        'blockSize': `${ props.viewportHeight }px`,
        'insetInlineStart': `${ -props.offsetX }px`,
        'insetBlockStart': `${ -props.offsetY }px`,
        '--vsi-scrollbar-has-cross-gap': props.both ? 1 : 0,
      }"
    >
      <slot v-if="slots.scrollbar && props.vertical" name="scrollbar" v-bind="props.vertical" />
      <VirtualScrollbar v-else-if="props.vertical" v-bind="props.vertical.scrollbarProps" />

      <slot v-if="slots.scrollbar && props.horizontal" name="scrollbar" v-bind="props.horizontal" />
      <VirtualScrollbar v-else-if="props.horizontal" v-bind="props.horizontal.scrollbarProps" />
    </div>
  </div>
</template>

<style scoped>
@layer components {
  .virtual-scroll-scrollbar-container {
    position: sticky;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 100%;
    block-size: 0;
    z-index: 30;
    pointer-events: none;
    overflow: visible;
  }

  .virtual-scroll-scrollbar-viewport {
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    pointer-events: none;
  }
}
</style>
