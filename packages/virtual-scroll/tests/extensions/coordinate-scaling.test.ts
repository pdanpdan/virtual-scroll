import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';

import { mockItems, setup, setupMocks } from '../test-helper';

describe('scaling & large lists', () => {
  setupMocks();

  it('syncs display scroll when items count changes in a scaled list', async () => {
    const { props, result, wrapper } = setup({
      itemSize: 1000,
      items: Array.from({ length: 30000 }, (_, i) => ({ id: i })), // 30M VU
    });

    result.scrollToOffset(null, 10000000);
    await nextTick();
    await nextTick();

    props.value.items = Array.from({ length: 40000 }, (_, i) => ({ id: i }));
    await nextTick();
    await nextTick();

    expect(result.scrollDetails.value.scrollOffset.y).toBeCloseTo(10000000, 0);
    wrapper.unmount();
  });

  describe('coordinate scaling & bounds', () => {
    it('rendered item offsets do not grow excessively under scaling', async () => {
      const itemCount = 11000;
      const itemSize = 1000;
      const viewportHeight = 500;
      const items = Array.from({ length: itemCount }, (_, i) => ({ id: i }));

      const { result, wrapper } = setup({
        container: window,
        direction: 'vertical',
        itemSize,
        items,
      });

      await nextTick();
      await nextTick();

      // Viewport 500
      Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: viewportHeight });
      window.dispatchEvent(new Event('resize'));
      await nextTick();

      // Scroll to item 100 (virtual 100000)
      result.scrollToIndex(100, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();

      const scaleY = result.scaleY.value;
      const expectedDisplayScroll = 100000 / scaleY;
      expect(window.scrollY).toBeCloseTo(expectedDisplayScroll, 0);

      const item100 = result.renderedItems.value.find((i) => i.index === 100);
      expect(item100).toBeDefined();

      // item100.offset.y should be (100 * 1000) / scaleY = 100000 / scaleY
      expect(item100?.offset.y).toBeCloseTo(expectedDisplayScroll, 0);

      wrapper.unmount();
    });

    it('does not allow scrolling below the last item when sticky elements are present', async () => {
      const itemCount = 1000;
      const itemSize = 50;
      const headerHeight = 50;
      const footerHeight = 50;
      const viewportHeight = 500;
      const items = Array.from({ length: itemCount }, (_, i) => ({ id: i }));

      const { result, wrapper } = setup({
        container: window,
        direction: 'vertical',
        itemSize,
        items,
        stickyStart: { y: headerHeight },
        stickyEnd: { y: footerHeight },
      });

      await nextTick();
      await nextTick();

      expect(result.totalHeight.value).toBe(50100);

      result.scrollToIndex(999, null, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(window.scrollY).toBe(49600);

      const lastItem = result.renderedItems.value.find((i) => i.index === 999);
      expect(lastItem).toBeDefined();

      const itemBottomDisplay = lastItem!.offset.y + headerHeight + itemSize;
      expect(itemBottomDisplay - (window.scrollY + viewportHeight)).toBe(-footerHeight);

      wrapper.unmount();
    });

    it('syncs display scroll when items change and coordinate scaling is active', async () => {
      const { result, wrapper, props } = setup({
        items: Array.from({ length: 100000 }, (_, i) => ({ id: i, name: `Item ${ i }` })),
        itemSize: 1000, // 100,000,000px total -> will trigger scaling
        direction: 'vertical',
      });
      await nextTick();

      // Move to some position where scale != 1
      result.scrollToOffset(null, 50000000);
      await nextTick();

      const oldScrollY = result.scrollDetails.value.scrollOffset.y;

      // Change items length
      props.value.items = Array.from({ length: 110000 }, (_, i) => ({ id: i, name: `Item ${ i }` }));
      await nextTick();

      // Should have called scrollToOffset to sync
      expect(result.scrollDetails.value.scrollOffset.y).toBe(oldScrollY);
      wrapper.unmount();
    });
  });

  it('handles scale and direction watchers', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { value: 500 });
    Object.defineProperty(container, 'clientWidth', { value: 500 });

    const { props, result, wrapper } = setup({
      items: mockItems,
      itemSize: 1000000, // force scale
      direction: 'vertical',
      container,
    });
    await nextTick();
    const initialScale = result.scaleY.value;
    expect(initialScale).toBeGreaterThan(1);

    props.value.direction = 'horizontal';
    await nextTick();

    expect(result.isRtl.value).toBe(false);
    wrapper.unmount();
  });
});
