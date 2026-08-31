import type { ExtensionContext } from '../../src/extensions';

import { describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useInfiniteLoadingExtension } from '../../src/extensions/infinite-loading';

function makeCtx(overrides: Partial<{
  direction: 'vertical' | 'horizontal' | 'both';
  loading: boolean;
  loadDistance: number;
  isProgrammaticScroll: boolean;
}> = {}) {
  const {
    direction = 'vertical',
    loading = false,
    loadDistance = 200,
    isProgrammaticScroll = false,
  } = overrides;
  const scrollDetails = ref({
    totalSize: { width: 10000, height: 10000 },
    scrollOffset: { x: 0, y: 0 },
    viewportSize: { width: 500, height: 500 },
  });
  const onLoad = vi.fn();
  const ctx = {
    props: ref({ direction, loading, loadDistance }),
    internalState: { isProgrammaticScroll: ref(isProgrammaticScroll) },
    scrollDetails,
  } as unknown as ExtensionContext<unknown>;
  return { ctx, scrollDetails, onLoad };
}

describe('useInfiniteLoadingExtension', () => {
  it('fires onLoad for the vertical axis when the remaining distance is within the threshold', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx();
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = {
      ...scrollDetails.value,
      scrollOffset: { x: 0, y: 9300 }, // remaining: 10000 - 9300 - 500 = 200
    };
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical');
  });

  it('does not fire while the remaining distance is above the threshold', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx();
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = {
      ...scrollDetails.value,
      scrollOffset: { x: 0, y: 9000 }, // remaining: 500 > 200
    };
    await nextTick();

    expect(onLoad).not.toHaveBeenCalled();
  });

  it('fires onLoad for the horizontal axis in horizontal mode', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'horizontal' });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = {
      ...scrollDetails.value,
      scrollOffset: { x: 9300, y: 0 },
    };
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('horizontal');
  });

  it('fires for both axes in both mode when both thresholds are reached', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ direction: 'both' });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = {
      ...scrollDetails.value,
      scrollOffset: { x: 9300, y: 9300 },
    };
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical');
    expect(onLoad).toHaveBeenCalledWith('horizontal');
  });

  it('is suppressed while loading is active', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ loading: true });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = {
      ...scrollDetails.value,
      scrollOffset: { x: 0, y: 9300 },
    };
    await nextTick();

    expect(onLoad).not.toHaveBeenCalled();
  });

  it('fires even while a programmatic scroll is running (scrollbar drag, End key)', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx({ isProgrammaticScroll: true });
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = {
      ...scrollDetails.value,
      scrollOffset: { x: 0, y: 9300 },
    };
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical');
  });

  it('does not fire when the total size is zero', async () => {
    const { ctx, scrollDetails, onLoad } = makeCtx();
    useInfiniteLoadingExtension({ onLoad }).onInit!(ctx);

    scrollDetails.value = {
      ...scrollDetails.value,
      totalSize: { width: 0, height: 0 },
      scrollOffset: { x: 0, y: 0 },
    };
    await nextTick();

    expect(onLoad).not.toHaveBeenCalled();
  });
});
