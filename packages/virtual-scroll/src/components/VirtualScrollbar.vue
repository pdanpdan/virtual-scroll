<script setup lang="ts">
/**
 * A cross-browser consistent virtual scrollbar component.
 * Can be used independently or as part of the VirtualScroll component.
 * Supports both vertical and horizontal axes and RTL layouts.
 */
import type { VirtualScrollbarProps } from '../types';

import { useVirtualScrollbar } from '../composables/useVirtualScrollbar';

export interface Props extends VirtualScrollbarProps {}

const props = withDefaults(defineProps<Props>(), {
  axis: 'vertical',
  isRtl: false,
});

const emit = defineEmits<{
  (e: 'scrollToOffset', offset: number): void;
}>();

const { trackProps, thumbProps } = useVirtualScrollbar({
  axis: () => props.axis,
  totalSize: () => props.totalSize,
  position: () => props.position,
  viewportSize: () => props.viewportSize,
  containerId: () => props.containerId,
  isRtl: () => props.isRtl,
  scrollToOffset: (offset: number) => {
    props.scrollToOffset?.(offset);
    emit('scrollToOffset', offset);
  },
});
</script>

<template>
  <div v-bind="trackProps">
    <div v-bind="thumbProps" />
  </div>
</template>

<style>
@layer components {
  .virtual-scrollbar-track {
    --vsi-scrollbar-bg: var(--vs-scrollbar-bg, rgba(230, 230, 230, 0.9));
    --vsi-scrollbar-thumb-bg: var(--vs-scrollbar-thumb-bg, rgba(0, 0, 0, 0.3));
    --vsi-scrollbar-thumb-hover-bg: var(--vs-scrollbar-thumb-hover-bg, rgba(0, 0, 0, 0.6));

    --vsi-scrollbar-bg: var(--vs-scrollbar-bg, light-dark(rgba(230, 230, 230, 0.9), rgba(30, 30, 30, 0.9)));
    --vsi-scrollbar-thumb-bg: var(--vs-scrollbar-thumb-bg, light-dark(rgba(0, 0, 0, 0.3), rgba(255, 255, 255, 0.3)));
    --vsi-scrollbar-thumb-hover-bg: var(--vs-scrollbar-thumb-hover-bg, light-dark(rgba(0, 0, 0, 0.6), rgba(255, 255, 255, 0.6)));

    --vsi-scrollbar-radius: var(--vs-scrollbar-radius, 4px);
    --vsi-scrollbar-size: var(--vs-scrollbar-size, 8px);

    position: absolute;
    contain: layout;
    background-color: var(--vsi-scrollbar-bg);
    border-radius: var(--vsi-scrollbar-radius);
    z-index: 30;
    transition: opacity 0.2s;
    user-select: none;
    -webkit-user-select: none;
    pointer-events: auto;

    &.virtual-scrollbar-track--vertical {
      inline-size: var(--vsi-scrollbar-size);
      inset-block-start: 2px;
      inset-inline-end: 2px;
    }

    &.virtual-scrollbar-track--horizontal {
      block-size: var(--vsi-scrollbar-size);
      inset-inline-start: 2px;
      inset-block-end: 2px;
    }
  }

  .virtual-scrollbar-thumb {
    position: absolute;
    background-color: var(--vsi-scrollbar-thumb-bg);
    border-radius: var(--vsi-scrollbar-radius);
    touch-action: none;
    pointer-events: auto;
    cursor: pointer;

    &:hover,
    &:active,
    &.virtual-scrollbar-thumb--active {
      background-color: var(--vsi-scrollbar-thumb-hover-bg);
    }

    &.virtual-scrollbar-thumb--vertical {
      inline-size: 100%;
    }

    &.virtual-scrollbar-thumb--horizontal {
      block-size: 100%;
    }
  }
}
</style>
