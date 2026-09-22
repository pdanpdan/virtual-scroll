import type { ExtensionContext, VirtualScrollExtension } from './index';

/**
 * Extension for Right-to-Left (RTL) support.
 *
 * Direction detection belongs to the engine, which resolves the container's
 * computed direction and re-reads it on mount, on resize, on scroll and on
 * `dir`/`style` attribute changes. This extension triggers that read once while
 * the extensions initialize, so the first render already reflects the
 * container instead of flipping on the mount refresh.
 */
export function useRtlExtension<T = unknown>(): VirtualScrollExtension<T> {
  return {
    name: 'rtl',
    onInit(ctx: ExtensionContext<T>) {
      ctx.methods.updateDirection();
    },
  };
}
