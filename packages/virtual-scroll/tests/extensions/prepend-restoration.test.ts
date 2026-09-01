import type { ScrollDirection } from '../../src/types';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { clearMocks, mockItems, scrollState, setup, setupMocks } from '../test-helper';

describe('dynamic sizing & prepending', () => {
  setupMocks();

  beforeEach(() => {
    clearMocks();
  });

  it('handles dynamic item sizes', async () => {
    const { result, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 0, // dynamic
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    // Initial estimate 100 * 40 = 4000
    expect(result.totalHeight.value).toBe(4000);

    result.updateItemSize(0, 100, 100);
    await nextTick();

    // Now 1*100 + 99*40 = 4060
    expect(result.totalHeight.value).toBe(4060);
    wrapper.unmount();
  });

  it('updates item sizes and compensates scroll position', async () => {
    const { result, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 0,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    // Scroll to item 10 (10 * 40 = 400px)
    scrollState.y = 400;
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    // Update item 0 (above viewport) from 40 to 100
    result.updateItemSize(0, 100, 100);
    await nextTick();

    // Scroll position should have been adjusted by 60px
    expect(window.scrollY).toBe(460);
    wrapper.unmount();
  });

  it('supports batched updateItemSizes', async () => {
    const { result, wrapper } = setup({
      itemSize: 0,
      items: mockItems,
    });
    await nextTick();
    result.updateItemSizes([
      { index: 0, inlineSize: 100, blockSize: 100 },
      { index: 1, inlineSize: 100, blockSize: 100 },
    ]);
    await nextTick();
    expect(result.getRowHeight(0)).toBe(100);
    expect(result.getRowHeight(1)).toBe(100);
    wrapper.unmount();
  });

  it('restores scroll position when items are prepended', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const { props, result, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items,
      restoreScrollOnPrepend: true,
    });

    await nextTick();
    await nextTick();

    // Scroll to index 5 (250px)
    result.scrollToOffset(0, 250, { behavior: 'auto' });
    await nextTick();
    await nextTick();

    expect(window.scrollY).toBe(250);

    // Prepend 2 items (100px)
    props.value.items = [ { id: -1 }, { id: -2 }, ...items ];

    await nextTick();
    await nextTick();
    await nextTick();

    // Scroll should be adjusted to 350
    expect(window.scrollY).toBe(350);
    wrapper.unmount();
  });

  it('restores horizontal scroll position when items are prepended', async () => {
    const initialItems = Array.from({ length: 10 }, (_, i) => ({ id: i + 5 }));
    const { result, props, wrapper } = setup({
      direction: 'horizontal',
      itemSize: 100,
      items: initialItems,
      restoreScrollOnPrepend: true,
      columnGap: 10,
    });

    await nextTick();
    result.scrollToOffset(200, null);
    await nextTick();

    // Prepend 5 items. 5 * 100 + 5 * 10 = 550px added.
    const newItems = [
      ...Array.from({ length: 5 }, (_, i) => ({ id: i })),
      ...initialItems,
    ];
    props.value.items = newItems;

    await nextTick();
    await nextTick();

    // Should have added 550px to scroll position
    expect(result.scrollDetails.value.scrollOffset.x).toBe(750);
    wrapper.unmount();
  });

  it('handles horizontal dynamic item sizes', async () => {
    const { result, wrapper } = setup({
      direction: 'horizontal',
      itemSize: 0, // dynamic
      defaultItemSize: 100,
      items: mockItems,
    });

    await nextTick();

    // Initially estimated
    expect(result.getItemSize(0)).toBe(100);

    // Update size
    result.updateItemSize(0, 150, 500);
    await nextTick();
    expect(result.getItemSize(0)).toBe(150);
    expect(result.scrollDetails.value.totalSize.width).toBe(150 + 99 * 100);

    wrapper.unmount();
  });

  it('does not restore scroll if restoreScrollOnPrepend is false', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const { props, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items,
      restoreScrollOnPrepend: false,
    });

    await nextTick();
    scrollState.y = 250;
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    props.value.items = [ { id: -1 }, ...items ];
    await nextTick();
    await nextTick();

    expect(window.scrollY).toBe(250);
    wrapper.unmount();
  });

  it('correctly handles scroll correction when items are prepended', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i + 10 }));
    const { props, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items,
      restoreScrollOnPrepend: true,
    });

    await nextTick();
    scrollState.y = 500; // Scroll to middle
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    // Prepend 1 item (50px)
    props.value.items = [ { id: 1 }, ...items ];
    await nextTick();
    await nextTick();
    await nextTick();

    // Scroll should be 500 + 50 = 550
    expect(window.scrollY).toBe(550);
    wrapper.unmount();
  });

  it('handles the case where no items are prepended', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const { props, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items,
      restoreScrollOnPrepend: true,
    });

    await nextTick();
    scrollState.y = 250;
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    // Add item at the end
    props.value.items = [ ...items, { id: 100 } ];
    await nextTick();
    await nextTick();

    expect(window.scrollY).toBe(250);
    wrapper.unmount();
  });

  it('handles null container gracefully', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const { props, wrapper } = setup({
      container: null as unknown as Window,
      direction: 'vertical',
      itemSize: 50,
      items,
      restoreScrollOnPrepend: true,
    });

    await nextTick();

    // Prepend item: with no container, the scroll correction falls back to the window
    // and compensates the added 50px
    props.value.items = [ { id: -1 }, ...items ];
    await nextTick();
    await nextTick();
    await nextTick();

    expect(window.scrollY).toBe(50);
    wrapper.unmount();
  });

  it('handles undefined direction fallback', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i + 10 }));
    const { props, wrapper } = setup({
      container: window,
      direction: undefined as unknown as ScrollDirection, // force undefined
      itemSize: 50,
      items,
      restoreScrollOnPrepend: true,
    });

    await nextTick();
    scrollState.y = 500;
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    // Prepend 1 item
    props.value.items = [ { id: 1 }, ...items ];
    await nextTick();
    await nextTick();
    await nextTick();

    // Should default to vertical and scroll to 550
    expect(window.scrollY).toBe(550);
    wrapper.unmount();
  });

  it('handles addedSize = 0 correctly', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i + 10 }));
    const { props, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: (item: { id: number; }) => (item.id === 1 ? 0 : 50),
      items,
      restoreScrollOnPrepend: true,
      gap: 0,
    });

    await nextTick();
    scrollState.y = 500;
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    const scrollToSpy = vi.spyOn(window, 'scrollTo');
    scrollToSpy.mockClear();

    // Prepend an item with a zero base size: the computed added size stays 0,
    // so no scroll correction must happen
    props.value.items = [ { id: 1 }, ...items ];
    await nextTick();
    await nextTick();
    await nextTick();

    expect(scrollToSpy).not.toHaveBeenCalled();
    scrollToSpy.mockRestore();
    wrapper.unmount();
  });
});
