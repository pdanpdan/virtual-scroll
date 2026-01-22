/* global ScrollToOptions */
import type { VirtualScrollProps } from '../types';
import type { Ref } from 'vue';

import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import { useVirtualScroll } from './useVirtualScroll';

// --- Mocks ---

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
});
