import type { ExtensionContext, VirtualScrollExtension } from './index';

import { ref } from 'vue';

import { isElement } from '../utils/scroll';

/**
 * Extension for Right-to-Left (RTL) support.
 * It transforms item offsets for horizontal and grid scrolling when the container is in RTL mode.
 */
export function useRtlExtension<T = unknown>(): VirtualScrollExtension<T> {
  const isRtl = ref(false);

  return {
    name: 'rtl',
    onInit(ctx: ExtensionContext<T>) {
      const updateDirection = () => {
        if (typeof window === 'undefined') {
          return;
        }
        const container = ctx.props.value.container || ctx.props.value.hostRef || window;
        const el = isElement(container) ? container : document.documentElement;

        const computedStyle = window.getComputedStyle(el);

        const newRtl = computedStyle.direction === 'rtl';
        if (isRtl.value !== newRtl) {
          isRtl.value = newRtl;
          ctx.internalState.isRtl.value = newRtl;
        }
      };

      const originalUpdateDirection = ctx.methods.updateDirection;
      ctx.methods.updateDirection = () => {
        updateDirection();
        originalUpdateDirection();
      };

      updateDirection();
    },
  };
}
