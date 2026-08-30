/* global ScrollToOptions */
import type { ExtensionContext } from '../../src/extensions';
import type { RenderedItem } from '../../src/types';

import { describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useStickyExtension } from '../../src/extensions/sticky';
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

  it('keeps the previous sticky item rendered above the visible range', async () => {
    const { result, wrapper } = setup({
      direction: 'vertical',
      itemSize: 100,
      items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
      stickyIndices: [ 5, 50 ],
      bufferBefore: 0,
      bufferAfter: 0,
    });

    await nextTick();
    await nextTick();

    // Scrolling far enough so the previous sticky item is above the rendered range
    result.scrollToOffset(null, 6000, { behavior: 'auto' });
    await nextTick();
    await nextTick();

    const renderedIndices = result.renderedItems.value.map((i) => i.index);
    // The nearest sticky item above the range (50) stays rendered and active
    expect(renderedIndices).toContain(50);
    expect(result.renderedItems.value.find((i) => i.index === 50)?.isStickyActive).toBe(true);

    wrapper.unmount();
  });

  it('passes items through unchanged when the previous sticky item is missing from the list', () => {
    const extension = useStickyExtension<{ id: number; }>();
    const range = ref({ start: 10, end: 20, padStart: 0, padEnd: 0 });
    const currentIndex = ref(25);
    const ctx = {
      props: ref({ stickyIndices: [ 5 ] }),
      range,
      currentIndex,
    } as unknown as ExtensionContext<{ id: number; }>;

    const items: RenderedItem<{ id: number; }>[] = [
      { item: { id: 10 }, index: 10, offset: { x: 0, y: 0 }, size: { width: 100, height: 100 }, originalX: 0, originalY: 0, isSticky: false, isStickyActive: false, isStickyActiveX: false, isStickyActiveY: false, stickyOffset: { x: 0, y: 0 } },
    ];

    // prevStickyIdx (5) < start (10) and the sticky item is NOT in the list:
    // the transform must not crash and must not alter the items.
    const result = extension.transformRenderedItems!(items, ctx);
    expect(result).toEqual(items);
  });

  it('queries dynamic sizes for sticky items', async () => {
    const { result, wrapper } = setup({
      direction: 'vertical',
      itemSize: 0, // dynamic
      defaultItemSize: 100,
      items: Array.from({ length: 50 }, (_, i) => ({ id: i })),
      stickyIndices: [ 0, 10 ],
      bufferBefore: 0,
      bufferAfter: 0,
    });

    await nextTick();
    await nextTick();

    result.scrollToOffset(null, 500, { behavior: 'auto' });
    await nextTick();
    await nextTick();

    const item0 = result.renderedItems.value.find((i) => i.index === 0);
    expect(item0?.isStickyActive).toBe(true);
    wrapper.unmount();
  });

  it('queries dynamic sizes for horizontal sticky items', async () => {
    const { result, wrapper } = setup({
      direction: 'horizontal',
      itemSize: 0, // dynamic
      defaultItemSize: 100,
      items: Array.from({ length: 50 }, (_, i) => ({ id: i })),
      stickyIndices: [ 0, 10 ],
      bufferBefore: 0,
      bufferAfter: 0,
    });

    await nextTick();
    await nextTick();

    result.scrollToOffset(500, null);
    await nextTick();
    await nextTick();

    const item0 = result.renderedItems.value.find((i) => i.index === 0);
    expect(item0?.isStickyActive).toBe(true);
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
