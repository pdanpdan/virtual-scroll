import type { ExtensionContext } from '../../src/extensions';
/* global ScrollToOptions */
import type { MockItem } from '../test-helper';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useInfiniteLoadingExtension } from '../../src/extensions/infinite-loading';
import { clearMocks, mockItems, setup, setupMocks } from '../test-helper';

interface CtxOverrides {
  direction?: 'vertical' | 'horizontal' | 'both';
  loading?: boolean;
  loadDistance?: number;
  isProgrammaticScroll?: boolean;
  isScrolling?: boolean;
  scrollDirectionX?: 'start' | 'end' | null;
  scrollDirectionY?: 'start' | 'end' | null;
}

function makeCtx(overrides: CtxOverrides = {}) {
  const {
    loading = false,
    direction,
    loadDistance,
    isProgrammaticScroll = false,
    isScrolling = true,
    scrollDirectionX = 'end',
    scrollDirectionY = 'end',
  } = overrides;

  const props = ref({
    loading,
    ...(direction === undefined ? {} : { direction }),
    ...(loadDistance === undefined ? {} : { loadDistance }),
  });
  const scrollDetails = ref({
    totalSize: { width: 10000, height: 10000 },
    scrollOffset: { x: 0, y: 0 },
    viewportSize: { width: 500, height: 500 },
  });
  const isScrollingRef = ref(isScrolling);
  const ctx = {
    props,
    internalState: {
      isProgrammaticScroll: ref(isProgrammaticScroll),
      isScrolling: isScrollingRef,
      scrollDirectionX: ref(scrollDirectionX),
      scrollDirectionY: ref(scrollDirectionY),
    },
    scrollDetails,
  } as unknown as ExtensionContext<unknown>;
  const onLoad = vi.fn();

  return { ctx, isScrolling: isScrollingRef, props, scrollDetails, onLoad };
}

/** Controlled clock backing `performance.now()`. */
let now = 0;
vi.spyOn(performance, 'now').mockImplementation(() => now);

describe('useInfiniteLoadingExtension', () => {
  beforeEach(() => {
    now = 0;
  });

  it('fires at the threshold with the axis, travel direction and measured velocity', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'vertical', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9268 } };
    await nextTick();

    now += 16;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9300 } }; // remaining: 200
    await nextTick();

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 32 / 16, direction: 'end' });
  });

  it('does not fire while the remaining distance is above the threshold', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'vertical', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9299 } }; // remaining: 201
    await nextTick();

    expect(onLoad).not.toHaveBeenCalled();
  });

  it('defaults to the vertical axis and a 200 VU load distance', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx();
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9300 } }; // remaining: 200
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 0, direction: 'end' });
  });

  it('fires for the horizontal axis with its own direction and velocity', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({
      direction: 'horizontal',
      loadDistance: 200,
      scrollDirectionX: 'start',
    });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 9268, y: 0 } };
    await nextTick();

    now += 16;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 9300, y: 0 } }; // remaining: 200
    await nextTick();

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith('horizontal', { velocity: 32 / 16, direction: 'start' });
  });

  it('fires for both axes in both mode when both thresholds are reached', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'both', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 9300, y: 9300 } };
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 0, direction: 'end' });
    expect(onLoad).toHaveBeenCalledWith('horizontal', { velocity: 0, direction: 'end' });
  });

  it('is suppressed while loading is active and fires once it ends', async () => {
    const { ctx, props, scrollDetails, onLoad } = makeCtx({ direction: 'vertical', loading: true, loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9300 } };
    await nextTick();
    expect(onLoad).not.toHaveBeenCalled();

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9400 } };
    await nextTick();
    expect(onLoad).not.toHaveBeenCalled();

    props.value.loading = false;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9401 } };
    await nextTick();
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 0, direction: 'end' });
  });

  it('fires while a programmatic scroll is running (a drag ended without further scroll events)', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({
      direction: 'vertical',
      isProgrammaticScroll: true,
      loadDistance: 200,
    });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9300 } };
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 0, direction: 'end' });
  });

  it('does not fire when the total size is zero', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'vertical', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = {
      ...scrollDetails.value,
      totalSize: { width: 0, height: 0 },
      scrollOffset: { x: 0, y: 0 },
    };
    await nextTick();

    expect(onLoad).not.toHaveBeenCalled();
  });

  it('ignores a missing scroll details ref', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx();
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = null as unknown as typeof scrollDetails.value;
    await nextTick();

    expect(onLoad).not.toHaveBeenCalled();
  });

  it('skips the request during a fast fling and fires once the axis slows down', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'vertical', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9000 } }; // remaining: 500
    await nextTick();

    now += 16;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9300 } }; // 18.75 VU/ms
    await nextTick();
    expect(onLoad).not.toHaveBeenCalled();

    now += 16;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9305 } }; // 0.3125 VU/ms
    await nextTick();

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 5 / 16, direction: 'end' });
  });

  it('treats a stale sample as no velocity instead of a fling', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'vertical', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad, flingVelocity: 1 }).onInit!(ctx);

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 8900 } };
    await nextTick();

    // 400 VU over 200 ms would measure 2 VU/ms, above the 1 VU/ms fling threshold:
    // the samples are stale, so the velocity is unknown (0) and the request is made.
    now += 200;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9300 } };
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 0, direction: 'end' });
  });

  it('does not measure velocity across a layout change outside a scroll gesture', async () => {
    const { ctx, isScrolling, scrollDetails, onLoad } = makeCtx({ direction: 'vertical', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    // Measurement/append updates emit new details while the list is idle.
    isScrolling.value = false;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9268 } };
    await nextTick();

    // Measuring against that stale position would report 93 VU/ms (a fling) here.
    isScrolling.value = true;
    now += 100;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9300 } }; // remaining: 200
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 0, direction: 'end' });
  });

  it('extends the threshold with preload only in the direction of travel', async () => {
    const towardsEnd = makeCtx({ direction: 'vertical', loadDistance: 200, scrollDirectionY: 'end' });
    useInfiniteLoadingExtension({ onLoad: towardsEnd.onLoad, preload: 100 }).onInit!(towardsEnd.ctx);

    towardsEnd.scrollDetails.value = { ...towardsEnd.scrollDetails.value, scrollOffset: { x: 0, y: 9250 } }; // remaining: 250
    await nextTick();
    expect(towardsEnd.onLoad).toHaveBeenCalledWith('vertical', { velocity: 0, direction: 'end' });

    const awayFromEnd = makeCtx({ direction: 'vertical', loadDistance: 200, scrollDirectionY: 'start' });
    useInfiniteLoadingExtension({ onLoad: awayFromEnd.onLoad, preload: 100 }).onInit!(awayFromEnd.ctx);

    awayFromEnd.scrollDetails.value = { ...awayFromEnd.scrollDetails.value, scrollOffset: { x: 0, y: 9250 } };
    await nextTick();
    expect(awayFromEnd.onLoad).not.toHaveBeenCalled();
  });

  it('requests a load once per approach until the threshold is left behind', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'vertical', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    const scrollTo = async (y: number) => {
      now += 200;
      scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y } };
      await nextTick();
    };

    await scrollTo(9300); // remaining: 200
    expect(onLoad).toHaveBeenCalledTimes(1);

    await scrollTo(9400); // remaining: 100, already latched
    expect(onLoad).toHaveBeenCalledTimes(1);

    await scrollTo(9000); // remaining: 500, latch cleared
    await scrollTo(9300);
    expect(onLoad).toHaveBeenCalledTimes(2);
  });

  it('latches each axis independently', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'both', loadDistance: 200 });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    const countAxis = (axis: string) => onLoad.mock.calls.filter(([ called ]) => called === axis).length;

    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 0, y: 9300 } }; // vertical only
    await nextTick();
    expect(countAxis('vertical')).toBe(1);
    expect(countAxis('horizontal')).toBe(0);

    now += 200;
    scrollDetails.value = { ...scrollDetails.value, scrollOffset: { x: 9300, y: 9300 } }; // horizontal only
    await nextTick();
    expect(countAxis('vertical')).toBe(1);
    expect(countAxis('horizontal')).toBe(1);
  });
});

describe('useInfiniteLoadingExtension (engine)', () => {
  setupMocks();

  beforeEach(() => {
    clearMocks();
    now = 0;
  });

  it('requests a load once per approach while the list is scrolled', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    let scrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (value: number) => {
        scrollTop = value;
      },
    });
    const scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.top !== undefined) {
        scrollTop = options.top;
      }
    });
    container.scrollTo = scrollTo;

    const onLoad = vi.fn();
    const extension = useInfiniteLoadingExtension<MockItem>({ onLoad });
    const { wrapper } = setup({
      container,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    }, [ extension ]);
    await nextTick();
    await nextTick();

    // 100 items x 50 VU = 5000 VU of content in a 500 VU viewport: the 200 VU
    // threshold is reached at scrollTop 4300.
    const scrollToTop = async (top: number) => {
      now += 200;
      scrollTop = top;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();
    };

    await scrollToTop(4300);
    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad).toHaveBeenCalledWith('vertical', { velocity: 0, direction: 'end' });

    await scrollToTop(4400);
    expect(onLoad).toHaveBeenCalledTimes(1);

    await scrollToTop(4000);
    await scrollToTop(4300);
    expect(onLoad).toHaveBeenCalledTimes(2);

    wrapper.unmount();
  });
});
