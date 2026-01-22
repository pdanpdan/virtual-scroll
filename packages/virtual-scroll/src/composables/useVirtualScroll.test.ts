/* global ScrollToOptions */
import type { VirtualScrollProps } from '../types';
import type { Ref } from 'vue';

import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import { useVirtualScroll } from './useVirtualScroll';

// --- Mocks ---

globalThis.ResizeObserver = class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
};

Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 500 });
Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 500 });
Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });

globalThis.window.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
  if (options.left !== undefined) {
    Object.defineProperty(window, 'scrollX', { configurable: true, value: options.left, writable: true });
  }
  if (options.top !== undefined) {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: options.top, writable: true });
  }
  document.dispatchEvent(new Event('scroll'));
});

// Helper to test composable
function setup<T>(propsValue: VirtualScrollProps<T>) {
  const props = ref(propsValue) as Ref<VirtualScrollProps<T>>;
  let result: ReturnType<typeof useVirtualScroll<T>>;

  const TestComponent = defineComponent({
    setup() {
      result = useVirtualScroll(props);
      return () => null;
    },
  });
  const wrapper = mount(TestComponent);
  return { props, result: result!, wrapper };
}

describe('useVirtualScroll', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
  });

  it('calculates total dimensions correctly', async () => {
    const { result } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    expect(result.totalHeight.value).toBe(5000);
    expect(result.totalWidth.value).toBe(500);
  });

  it('provides rendered items for the visible range', async () => {
    const { result } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    // viewport 500, item 50 => 10 items + buffer 5 = 15 items
    expect(result.renderedItems.value.length).toBe(15);
    expect(result.renderedItems.value[ 0 ]!.index).toBe(0);
  });

  it('updates when scroll position changes', async () => {
    const { result } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 500, writable: true });
    document.dispatchEvent(new Event('scroll'));

    await nextTick();
    await nextTick();

    // At 500px, start index is 500/50 = 10. With buffer 5, start is 5.
    expect(result.scrollDetails.value.currentIndex).toBe(10);
    expect(result.renderedItems.value[ 0 ]!.index).toBe(5);
  });

  it('supports programmatic scrolling', async () => {
    const { result } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    result.scrollToIndex(20, 0, { align: 'start', behavior: 'auto' });

    await nextTick();
    await nextTick();

    expect(window.scrollTo).toHaveBeenCalled();
    expect(result.scrollDetails.value.currentIndex).toBe(20);
  });

  it('handles dynamic item sizes', async () => {
    const { result } = setup({
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

    // Now 1*100 + 99*40 = 100 + 3960 = 4060
    expect(result.totalHeight.value).toBe(4060);
  });

  it('restores scroll position when items are prepended', async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const { props, result } = setup({
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
  });

  it('triggers correction when viewport dimensions change', async () => {
    const { result } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    // Scroll to item 50 auto
    result.scrollToIndex(50, null, { align: 'auto', behavior: 'auto' });
    await nextTick();

    const initialScrollY = window.scrollY;
    // item 50 at 2500. viewport 500. item 50 high.
    // targetEnd = 2500 - (500 - 50) = 2050.
    expect(initialScrollY).toBe(2050);

    // Simulate viewport height decreasing
    Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 485 });
    window.dispatchEvent(new Event('resize'));

    await nextTick();
    await nextTick();

    // It should have corrected to: 2500 - (485 - 50) = 2500 - 435 = 2065.
    expect(window.scrollY).toBe(2065);
  });

  it('renders sticky indices correctly using optimized search', async () => {
    // Use an isolated container to avoid window pollution
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
    // Mock scrollTo on container
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        container.scrollLeft = options.left;
      }
      if (options.top !== undefined) {
        container.scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { result } = setup({
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

    // 1. Initial scroll 0. Range [0, 4].
    expect(result.renderedItems.value.map((i) => i.index)).toEqual([ 0, 1, 2, 3 ]);

    // 2. Scroll to 100 (item 2). Range [2, 6].
    container.scrollTop = 100;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    const indices2 = result.renderedItems.value.map((i) => i.index).sort((a, b) => a - b);
    expect(indices2).toEqual([ 0, 2, 3, 4, 5 ]);
    expect(result.renderedItems.value.find((i) => i.index === 0)?.isStickyActive).toBe(true);

    // 3. Scroll to 500 (item 10). Range [10, 14].
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
  });

  it('updates item sizes and compensates scroll position', async () => {
    const { result } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 0,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    // Scroll to item 10 (10 * 40 = 400px)
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 400, writable: true });
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    // Update item 0 (above viewport) from 40 to 100
    result.updateItemSize(0, 100, 100);
    await nextTick();

    // Scroll position should have been adjusted by 60px
    expect(window.scrollY).toBe(460);
  });

  it('supports refresh method', async () => {
    const { result } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    await nextTick();
    result.refresh();
    await nextTick();
    expect(result.totalHeight.value).toBe(5000);
  });

  it('supports getColumnWidth with various types', async () => {
    const { result } = setup({
      columnCount: 10,
      columnWidth: [ 100, 200 ],
      direction: 'both',
      items: mockItems,
    });

    await nextTick();
    expect(result.getColumnWidth(0)).toBe(100);
    expect(result.getColumnWidth(1)).toBe(200);
    expect(result.getColumnWidth(2)).toBe(100);
  });

  it('updates column sizes from row element', async () => {
    const { result } = setup({
      columnCount: 5,
      columnWidth: 0, // dynamic
      direction: 'both',
      items: mockItems,
    });

    await nextTick();

    const rowEl = document.createElement('div');
    const cell0 = document.createElement('div');
    cell0.dataset.colIndex = '0';
    Object.defineProperty(cell0, 'getBoundingClientRect', {
      value: () => ({ width: 150 }),
    });
    rowEl.appendChild(cell0);

    result.updateItemSizes([ {
      blockSize: 100,
      element: rowEl,
      index: 0,
      inlineSize: 0,
    } ]);

    await nextTick();
    expect(result.getColumnWidth(0)).toBe(150);
  });
});
