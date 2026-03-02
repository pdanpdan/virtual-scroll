/* global ScrollToOptions */
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { mockItems, setup, setupMocks } from '../test-helper';

describe('sticky elements', () => {
  setupMocks();

  it('renders sticky indices correctly using optimized search', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        container.scrollLeft = options.left;
      }
      if (options.top !== undefined) {
        container.scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { result, wrapper } = setup({
      container,
      direction: 'vertical',
      itemSize: 50,
      items: Array.from({ length: 20 }, (_, i) => ({ id: i })),
      stickyIndices: [ 0, 10, 19 ],
      bufferBefore: 0,
      bufferAfter: 0,
    });

    await nextTick();
    await nextTick();

    expect(result.renderedItems.value.map((i) => i.index)).toEqual([ 0, 1, 2, 3 ]);

    container.scrollTop = 100;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    const indices2 = result.renderedItems.value.map((i) => i.index).sort((a, b) => a - b);
    expect(indices2).toEqual([ 0, 2, 3, 4, 5 ]);
    expect(result.renderedItems.value.find((i) => i.index === 0)?.isStickyActive).toBe(true);

    container.scrollTop = 500;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    const indices3 = result.renderedItems.value.map((i) => i.index).sort((a, b) => a - b);
    expect(indices3).toContain(0);
    expect(indices3).toContain(10);
    expect(indices3).toContain(11);
    expect(indices3).toContain(12);
    expect(indices3).toContain(13);
    wrapper.unmount();
  });

  it('renders sticky items that are before the visible range', async () => {
    const { result, wrapper } = setup({
      direction: 'vertical',
      itemSize: 100,
      items: Array.from({ length: 50 }, (_, i) => ({ id: i })),
      stickyIndices: [ 0 ],
      bufferBefore: 0,
      bufferAfter: 0,
    });

    await nextTick();
    await nextTick();

    result.scrollToOffset(null, 1000, { behavior: 'auto' });
    await nextTick();
    await nextTick();

    const renderedIndices = result.renderedItems.value.map((i) => i.index);
    expect(renderedIndices).toContain(0);
    expect(result.renderedItems.value.find((i) => i.index === 0)?.isStickyActive).toBe(true);
    wrapper.unmount();
  });

  it('handles horizontal sticky items', async () => {
    const { result, wrapper } = setup({
      direction: 'horizontal',
      itemSize: 100,
      stickyIndices: [ 0 ],
      items: mockItems,
    });

    await nextTick();

    result.scrollToOffset(200, null);
    await nextTick();

    const item0 = result.renderedItems.value.find((i) => i.index === 0);
    expect(item0?.isStickyActive).toBe(true);

    wrapper.unmount();
  });

  it('covers transformRenderedItems when prevStickyIdx < start and not in list', async () => {
    const { result, wrapper } = setup({
      direction: 'vertical',
      itemSize: 100,
      items: Array.from({ length: 50 }, (_, i) => ({ id: i })),
      stickyIndices: [ 5 ],
      bufferBefore: 0,
      bufferAfter: 0,
    });

    await nextTick();
    await nextTick();

    // Scroll to item 10. start=10. prevStickyIdx=5.
    result.scrollToOffset(null, 1000, { behavior: 'auto' });
    await nextTick();
    await nextTick();

    const renderedIndices = result.renderedItems.value.map((i) => i.index);
    expect(renderedIndices).toContain(5);
    expect(result.renderedItems.value.find((i) => i.index === 5)?.isStickyActive).toBe(true);

    wrapper.unmount();
  });

  it('covers the case where a previous sticky item is NOT already in the list', async () => {
    // This is to cover line 31 in sticky.ts
    // We need to trigger transformRenderedItems when prevStickyIdx < start AND alreadyInList is false.
    const { result, wrapper } = setup({
      direction: 'vertical',
      itemSize: 100,
      items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
      stickyIndices: [ 0, 50 ],
      bufferBefore: 0,
      bufferAfter: 0,
    });

    await nextTick();

    // Scroll to item 60. start will be around 60.
    // prevStickyIdx for activeIdx 60 will be 50.
    // 50 is not < start (60). Wait, 50 IS < 60.
    // So if start is 60, and we have sticky index 50, and it's not in the list (because bufferBefore=0).
    result.scrollToOffset(null, 6000, { behavior: 'auto' });
    await nextTick();
    await nextTick();

    expect(result.renderedItems.value.map((i) => i.index)).toContain(50);
    expect(result.renderedItems.value.find((i) => i.index === 50)?.isStickyActive).toBe(true);

    wrapper.unmount();
  });

  describe('sticky footer & header scrollToIndex', () => {
    const stickyMockItems = Array.from({ length: 10 }, (_, i) => ({ id: i }));

    it('scrolls to the last item correctly with sticky footer and hostOffset', async () => {
      const hostRef = document.createElement('div');
      const hostElement = document.createElement('div');
      vi.spyOn(hostRef, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        left: 0,
        bottom: 500,
        right: 500,
        width: 500,
        height: 500,
      } as DOMRect);
      vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        left: 0,
        bottom: 550,
        right: 500,
        width: 500,
        height: 500,
      } as DOMRect);

      const { result, wrapper } = setup({
        container: hostRef,
        hostRef,
        hostElement,
        direction: 'vertical',
        itemSize: 50,
        items: stickyMockItems,
        stickyStart: { y: 50 }, // 50px sticky header
        stickyEnd: { y: 50 }, // 50px sticky footer
      });

      await nextTick();
      await nextTick();
      result.updateHostOffset();

      expect(result.totalHeight.value).toBe(600);

      result.scrollToIndex(9, 0, { align: 'end', behavior: 'auto' });

      await nextTick();
      await nextTick();

      expect(hostRef.scrollTop).toBe(100);
      expect(result.renderedItems.value.map((i) => i.index)).toContain(9);

      wrapper.unmount();
    });

    it('renders the last item when scrolled to the end with sticky footer', async () => {
      const { result, wrapper } = setup({
        container: window,
        direction: 'vertical',
        itemSize: 50,
        items: stickyMockItems,
        stickyEnd: { y: 50 },
      });

      await nextTick();
      await nextTick();

      window.scrollTo({ top: 50 });
      await nextTick();
      await nextTick();

      expect(result.renderedItems.value.map((i) => i.index)).toContain(9);

      wrapper.unmount();
    });
  });
});
