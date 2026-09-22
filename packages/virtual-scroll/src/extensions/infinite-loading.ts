import type { ScrollAxis, ScrollDetails } from '../types';
import type { ExtensionContext, VirtualScrollExtension } from './index';

import { watch } from 'vue';

import { DEFAULT_LOAD_DISTANCE } from '../types';

/**
 * Details about the scroll gesture that reached the load threshold.
 */
export interface LoadDetails {
  /** Scroll velocity on the axis in virtual units (VU) per millisecond; `0` when it cannot be measured. */
  velocity: number;
  /** Direction of the scroll on the axis, or `null` when no direction has been observed yet. */
  direction: 'start' | 'end' | null;
}

/** Options for {@link useInfiniteLoadingExtension}. */
export interface InfiniteLoadingExtensionOptions {
  /**
   * Callback triggered when the scroll position reaches the load threshold.
   * @param axis - The axis that reached the threshold.
   * @param details - Velocity and direction of the scroll gesture that reached it.
   */
  onLoad: (axis: ScrollAxis, details: LoadDetails) => void;
  /**
   * Velocity (VU/ms) above which loading is not requested while the axis is still moving.
   * A fast fling crosses the threshold without the user having a chance to read the
   * content, so the callback is skipped until the axis slows down (the threshold is
   * re-evaluated on the next scroll event, not latched by the fling).
   * @default 2
   */
  flingVelocity?: number;
  /**
   * Extra distance (VU) added to `loadDistance` when the scroll direction points at the
   * checked end, so content can be prefetched ahead of the travel direction only.
   * @default 0
   */
  preload?: number;
}

/** Maximum age (ms) of a scroll sample before the measured velocity is considered unknown. */
const MAX_SAMPLE_AGE = 100;

/**
 * Extension for Infinite Loading logic.
 * Triggers an `onLoad` callback when the user scrolls near the end of the content.
 *
 * The callback is suppressed while `loading` is `true` and while the axis moves faster
 * than `flingVelocity`, and it fires at most once per approach to the threshold: the
 * per-axis latch only clears once the edge distance grows past the threshold again.
 *
 * @param options - Extension options.
 * @param options.onLoad - Callback triggered when more data should be loaded.
 * @param options.flingVelocity - Velocity above which the callback is skipped while flinging.
 * @param options.preload - Extra threshold distance applied in the direction of travel.
 */
export function useInfiniteLoadingExtension<T = unknown>(options: InfiniteLoadingExtensionOptions): VirtualScrollExtension<T> {
  const flingVelocity = options.flingVelocity ?? 2;
  const preload = options.preload ?? 0;

  return {
    name: 'infinite-loading',
    onInit(ctx: ExtensionContext<T>) {
      /** Last scroll sample used to measure velocity, or `null` before the first one. */
      let sample: { x: number; y: number; time: number; } | null = null;
      /** Per-axis latch preventing a second load request without an intervening scroll. */
      const latched: Record<ScrollAxis, boolean> = { horizontal: false, vertical: false };

      const checkAxis = (
        axis: ScrollAxis,
        remaining: number,
        velocity: number,
        scrollDirection: 'start' | 'end' | null,
        loadDistance: number,
      ) => {
        // Prefetch only in the direction of travel: the threshold grows only when the
        // scroll moves towards the checked end.
        const threshold = loadDistance + (scrollDirection === 'end' ? preload : 0);

        if (remaining > threshold) {
          latched[ axis ] = false;
          return;
        }

        // A fling does not latch, so the request is made as soon as it slows down.
        if (latched[ axis ] || velocity > flingVelocity) {
          return;
        }

        latched[ axis ] = true;
        options.onLoad(axis, { velocity, direction: scrollDirection });
      };

      watch(ctx.scrollDetails, (details: ScrollDetails<T>) => {
        // Defensive: the ref only holds the details once the engine built them.
        if (!details) {
          return;
        }

        const x = details.scrollOffset.x;
        const y = details.scrollOffset.y;
        let velocityX = 0;
        let velocityY = 0;

        if (ctx.internalState.isScrolling.value) {
          const now = performance.now();

          if (sample) {
            const elapsed = now - sample.time;
            // Stale samples (a pause between scrolls) carry no usable velocity.
            if (elapsed > 0 && elapsed <= MAX_SAMPLE_AGE) {
              velocityX = Math.abs(x - sample.x) / elapsed;
              velocityY = Math.abs(y - sample.y) / elapsed;
            }
          }
          sample = { x, y, time: now };
        } else {
          // Layout changes emit new details too: measuring across them would turn the
          // next scroll into a bogus fling, so a gesture always starts unmeasured.
          sample = null;
        }

        // Fire as soon as the threshold is detected - including while a
        // programmatic scroll (scrollbar drag, PageDown/End) is still running:
        // deferring until the scroll settles delays the loading indicator and,
        // when a drag ends without further scroll events, can skip it entirely.
        if (ctx.props.value.loading || !details.totalSize || (details.totalSize.width === 0 && details.totalSize.height === 0)) {
          return;
        }

        const direction = ctx.props.value.direction || 'vertical';
        const loadDistance = ctx.props.value.loadDistance ?? DEFAULT_LOAD_DISTANCE;

        if (direction !== 'horizontal') {
          checkAxis(
            'vertical',
            details.totalSize.height - (y + details.viewportSize.height),
            velocityY,
            ctx.internalState.scrollDirectionY.value,
            loadDistance,
          );
        }
        if (direction !== 'vertical') {
          checkAxis(
            'horizontal',
            details.totalSize.width - (x + details.viewportSize.width),
            velocityX,
            ctx.internalState.scrollDirectionX.value,
            loadDistance,
          );
        }
      });
    },
  };
}
