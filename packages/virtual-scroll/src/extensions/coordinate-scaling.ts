import type { ExtensionContext, VirtualScrollExtension } from './index';

import { watchEffect } from 'vue';

import { calculateScale } from '../utils/virtual-scroll-logic';

/**
 * Extension for Coordinate Scaling.
 * Enables support for massive lists by scaling virtual coordinates when they exceed browser limits.
 */
export function useCoordinateScalingExtension<T = unknown>(): VirtualScrollExtension<T> {
  return {
    name: 'coordinate-scaling',
    onInit(ctx: ExtensionContext<T>) {
      watchEffect(() => {
        const container = ctx.props.value.container;
        const totalSize = ctx.totalSize.value;
        const viewportWidth = ctx.internalState.viewportWidth.value;
        const viewportHeight = ctx.internalState.viewportHeight.value;

        const isWindow = (typeof window !== 'undefined' && container === window) || container === undefined;

        if (totalSize && viewportWidth && viewportHeight) {
          ctx.internalState.scaleX.value = calculateScale(isWindow, totalSize.width, viewportWidth);
          ctx.internalState.scaleY.value = calculateScale(isWindow, totalSize.height, viewportHeight);
        }
      });
    },
  };
}
