import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { useInfiniteLoadingExtension } from '../../src/extensions/infinite-loading';
import { clearMocks, mockItems, scrollState, setup, setupMocks } from '../test-helper';

describe('infinite loading', () => {
  setupMocks();

  beforeEach(() => {
    clearMocks();
  });

  it('triggers onLoad when reaching the end in vertical mode', async () => {
    const onLoad = vi.fn();
    const { wrapper } = setup({
      direction: 'vertical',
      itemSize: 50,
      items: mockItems, // 100 * 50 = 5000px
      loadDistance: 200,
    }, [
      useInfiniteLoadingExtension({ onLoad }),
    ]);

    await nextTick();
    await nextTick();

    // Scroll near the end. Viewport 500. Total 5000.
    // Offset 4301 -> remaining 5000 - (4301 + 500) = 199.
    scrollState.y = 4301;
    document.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('vertical');
    wrapper.unmount();
  });

  it('triggers onLoad when reaching the end in horizontal mode', async () => {
    const onLoad = vi.fn();
    const { wrapper } = setup({
      direction: 'horizontal',
      itemSize: 100,
      items: mockItems, // 100 * 100 = 10000px
      loadDistance: 200,
    }, [
      useInfiniteLoadingExtension({ onLoad }),
    ]);

    await nextTick();
    await nextTick();

    // Scroll near the end. Viewport 500. Total 10000.
    // Offset 9301 -> remaining 10000 - (9301 + 500) = 199.
    scrollState.x = 9301;
    document.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('horizontal');
    wrapper.unmount();
  });

  it('triggers onLoad for both directions in "both" mode', async () => {
    const onLoad = vi.fn();
    const { wrapper } = setup({
      direction: 'both',
      itemSize: 50,
      columnCount: 10,
      columnWidth: 100,
      items: Array.from({ length: 10 }, (_, i) => ({ id: i })), // 10 rows. 10 * 50 = 500.
      loadDistance: 50,
    }, [
      useInfiniteLoadingExtension({ onLoad }),
    ]);

    await nextTick();
    await nextTick();
    await nextTick();

    // Total height 500. Viewport 500. Offset 0. remaining 0.
    // It should trigger vertical onLoad.
    expect(onLoad).toHaveBeenCalledWith('vertical');

    // Total width 1000. Viewport 500.
    scrollState.x = 460; // remaining 1000 - (460 + 500) = 40.
    document.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    expect(onLoad).toHaveBeenCalledWith('horizontal');

    wrapper.unmount();
  });

  it('does not trigger onLoad if already loading', async () => {
    const onLoad = vi.fn();
    const { wrapper } = setup({
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
      loading: true,
    }, [
      useInfiniteLoadingExtension({ onLoad }),
    ]);

    await nextTick();
    await nextTick();
    scrollState.y = 4500;
    document.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    expect(onLoad).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('does not trigger if total size is 0', async () => {
    const onLoad = vi.fn();
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 0, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 0, configurable: true });

    const { wrapper } = setup({
      container,
      items: [],
      direction: 'both', // Both width and height will be 0 if usableWidth/Height are 0
    }, [
      useInfiniteLoadingExtension({ onLoad }),
    ]);

    await nextTick();
    await nextTick();

    expect(onLoad).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
