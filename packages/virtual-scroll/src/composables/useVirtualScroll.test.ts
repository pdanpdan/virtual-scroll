/* global ScrollToOptions, ResizeObserverCallback */
import type { VirtualScrollProps } from '../types';
import type { Ref } from 'vue';

import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import { useVirtualScroll } from './useVirtualScroll';

// --- Mocks ---

interface ResizeObserverMock extends ResizeObserver {
  callback: ResizeObserverCallback;
  targets: Set<Element>;
}

const observers: ResizeObserverMock[] = [];
globalThis.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;
  targets = new Set<Element>();
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    observers.push(this as unknown as ResizeObserverMock);
  }

  observe(el: Element) {
    this.targets.add(el);
  }

  unobserve(el: Element) {
    this.targets.delete(el);
  }

  disconnect() {
    this.targets.clear();
  }
} as unknown as typeof ResizeObserver;

function triggerResize(el: Element, width: number, height: number) {
  const obs = observers.find((o) => o.targets.has(el));
  if (obs) {
    obs.callback([ {
      borderBoxSize: [ { blockSize: height, inlineSize: width } ],
      contentRect: {
        bottom: height,
        height,
        left: 0,
        right: width,
        toJSON: () => '',
        top: 0,
        width,
        x: 0,
        y: 0,
      },
      target: el,
    } as unknown as ResizeObserverEntry ], obs);
  }
}

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

interface MockItem {
  id: number;
}

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
  const mockItems: MockItem[] = Array.from({ length: 100 }, (_, i) => ({ id: i }));

  beforeEach(() => {
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
    Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 500 });
    Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 500 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calculates total dimensions correctly', async () => {
    const { result, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    expect(result.totalHeight.value).toBe(5000);
    expect(result.totalWidth.value).toBe(500);
    wrapper.unmount();
  });

  it('provides rendered items for the visible range', async () => {
    const { result, wrapper } = setup({
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
    wrapper.unmount();
  });

  it('updates when scroll position changes', async () => {
    const { result, wrapper } = setup({
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
    wrapper.unmount();
  });

  it('supports programmatic scrolling', async () => {
    const { result, wrapper } = setup({
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
    wrapper.unmount();
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

    // Now 1*100 + 99*40 = 100 + 3960 = 4060
    expect(result.totalHeight.value).toBe(4060);
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

  it('triggers correction when viewport dimensions change', async () => {
    const { result, wrapper } = setup({
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
    wrapper.unmount();
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
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 400, writable: true });
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    // Update item 0 (above viewport) from 40 to 100
    result.updateItemSize(0, 100, 100);
    await nextTick();

    // Scroll position should have been adjusted by 60px
    expect(window.scrollY).toBe(460);
    wrapper.unmount();
  });

  it('supports refresh method', async () => {
    const { result, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    await nextTick();
    result.refresh();
    await nextTick();
    expect(result.totalHeight.value).toBe(5000);
    wrapper.unmount();
  });

  it('supports getColumnWidth with various types', async () => {
    const { result, wrapper } = setup({
      columnCount: 10,
      columnWidth: [ 100, 200 ],
      direction: 'both',
      items: mockItems,
    });

    await nextTick();
    expect(result.getColumnWidth(0)).toBe(100);
    expect(result.getColumnWidth(1)).toBe(200);
    expect(result.getColumnWidth(2)).toBe(100);
    wrapper.unmount();
  });

  it('updates column sizes from row element', async () => {
    const { result, wrapper } = setup({
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
    wrapper.unmount();
  });

  it('provides getRowHeight and getColumnWidth helpers', async () => {
    const items: MockItem[] = [ { id: 1 }, { id: 2 } ];
    const { result, wrapper } = setup({
      direction: 'both',
      itemSize: (item: MockItem) => (item.id === 1 ? 60 : 40),
      columnWidth: [ 100, 200 ],
      items,
      gap: 10,
      columnGap: 20,
    });

    await nextTick();

    // getRowHeight returns item size WITHOUT gap
    expect(result.getRowHeight(0)).toBe(60);
    expect(result.getRowHeight(1)).toBe(40);

    // getColumnWidth returns col width WITHOUT gap
    expect(result.getColumnWidth(0)).toBe(100);
    expect(result.getColumnWidth(1)).toBe(200);
    expect(result.getColumnWidth(2)).toBe(100); // cyclic for arrays
    wrapper.unmount();

    // Dynamic sizes
    const { result: result2, wrapper: wrapper2 } = setup({
      direction: 'vertical',
      itemSize: 0,
      items: [ { id: 1 } ],
      defaultItemSize: 45,
    });

    await nextTick();
    expect(result2.getRowHeight(0)).toBe(45); // default before measurement

    result2.updateItemSize(0, 100, 100);
    await nextTick();
    expect(result2.getRowHeight(0)).toBe(100);
    wrapper2.unmount();
  });

  it('detects RTL mode and handles scroll position accordingly', async () => {
    const container = document.createElement('div');
    container.setAttribute('dir', 'rtl');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
    let scrollLeft = 0;
    Object.defineProperty(container, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (val) => { scrollLeft = val; },
    });
    // Mock scrollTo on container
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        scrollLeft = options.left;
      }
      if (options.top !== undefined) {
        container.scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });
    // Mock getComputedStyle for direction
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const dir = el === container ? 'rtl' : 'ltr';
      return {
        get direction() { return dir; },
      } as unknown as CSSStyleDeclaration;
    });

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(true);

    // Simulate RTL scroll (-100px)
    container.scrollLeft = -100;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    // relativeScrollX should be absolute distance from start
    expect(result.scrollDetails.value.scrollOffset.x).toBe(100);

    // scrollToIndex in RTL
    result.scrollToIndex(null, 2, { align: 'start', behavior: 'auto' });
    // item 2 at 200px. In RTL negative type, this means scrollLeft = -200
    expect(container.scrollLeft).toBe(-200);
    wrapper.unmount();
    styleSpy.mockRestore();
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

    // Scroll to item 10 (1000px)
    result.scrollToOffset(null, 1000, { behavior: 'auto' });
    await nextTick();
    await nextTick();

    // Range should be [10, 15] approx. But item 0 is sticky and should be rendered.
    const renderedIndices = result.renderedItems.value.map((i) => i.index);
    expect(renderedIndices).toContain(0);
    expect(result.renderedItems.value.find((i) => i.index === 0)?.isStickyActive).toBe(true);
    wrapper.unmount();
  });

  it('skips invalid items in renderedItems', async () => {
    const { result, props, wrapper } = setup({
      direction: 'vertical',
      itemSize: 50,
      items: [ { id: 1 }, { id: 2 } ],
    });

    await nextTick();
    await nextTick();

    // Manually force an out-of-bounds range or inconsistent state
    // By reducing items array without updating range immediately (simulated)
    props.value.items = [ { id: 1 } ];
    // renderedItems will filter out index 1 if it's still in range.end
    expect(result.renderedItems.value.length).toBe(1);
    wrapper.unmount();
  });

  it('ignores out of bounds updates in updateItemSize', async () => {
    const { result, wrapper } = setup({
      itemSize: 0,
      items: mockItems,
    });
    await nextTick();
    const initialHeight = result.scrollDetails.value.totalSize.height;
    result.updateItemSize(1000, 100, 100); // Out of bounds
    await nextTick();
    expect(result.scrollDetails.value.totalSize.height).toBe(initialHeight);
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

  it('provides getItemSize helper with various direction and type branches', async () => {
    const { result, wrapper } = setup({
      direction: 'horizontal',
      itemSize: 50,
      items: mockItems,
      columnGap: 10,
    });
    await nextTick();
    expect(result.getItemSize(0)).toBe(50);

    await wrapper.unmount();

    const { result: res2, wrapper: w2 } = setup({
      direction: 'vertical',
      itemSize: (item: MockItem) => (item.id === 0 ? 100 : 40),
      items: mockItems,
    });
    await nextTick();
    expect(res2.getItemSize(0)).toBe(100);
    expect(res2.getItemSize(1)).toBe(40);
    w2.unmount();
  });

  it('getItemSize returns correct size based on direction and measurements', async () => {
    const { result, wrapper } = setup({
      direction: 'horizontal',
      itemSize: 0,
      items: mockItems,
      columnGap: 10,
    });
    await nextTick();
    result.updateItemSize(0, 100, 100);
    await nextTick();
    // In horizontal, getItemSize uses itemSizesX - columnGap
    // 100 + 10 (targetWidth) - 10 = 100
    expect(result.getItemSize(0)).toBe(100);
    wrapper.unmount();

    const { result: res2, wrapper: w2 } = setup({
      direction: 'vertical',
      itemSize: 0,
      items: mockItems,
      gap: 10,
    });
    await nextTick();
    res2.updateItemSize(0, 100, 100);
    await nextTick();
    // In vertical, fallback uses itemSizesY - gap
    // 100 + 10 (targetHeight) - 10 = 100
    expect(res2.getItemSize(0)).toBe(100);
    w2.unmount();
  });

  it('handles smooth scroll and waits for it to finish before correcting', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    container.scrollTo = vi.fn();

    const { result, wrapper } = setup({
      container,
      direction: 'vertical',
      itemSize: 0,
      items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
    });

    await nextTick();
    await nextTick();

    // Start a smooth scroll
    result.scrollToIndex(50, null, { behavior: 'smooth' });
    // Simulate scroll event to set isScrolling = true
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    // Simulate measurement update while scrolling
    // Correction should NOT trigger while isScrolling is true
    result.updateItemSize(0, 100, 100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledTimes(1);

    // End scroll by waiting for timeout (default 250ms)
    // wait for timeout
    await new Promise((resolve) => setTimeout(resolve, 300));
    await nextTick();

    // Now correction should trigger because isScrolling is false and we have pendingScroll
    expect(container.scrollTo).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  it('updates host offset and direction reactively', async () => {
    const container = document.createElement('div');
    const hostRef = document.createElement('div');
    const hostElement = document.createElement('div');

    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });

    // Test direction update
    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      get direction() { return currentDir; },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      hostRef,
      hostElement,
      items: mockItems,
      itemSize: 50,
    });

    await nextTick();
    await nextTick();

    // Mock offsets
    vi.spyOn(hostRef, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      toJSON: () => {},
    } as DOMRect);
    vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
      left: 15,
      top: 25,
      toJSON: () => {},
    } as DOMRect);
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      toJSON: () => {},
    } as DOMRect);

    result.updateHostOffset();
    await nextTick();

    expect(result.scrollDetails.value.displayScrollOffset.x).toBe(0);

    currentDir = 'rtl';
    result.updateDirection();
    expect(result.isRtl.value).toBe(true);
    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('updates host offset but not scroll logical position when RTL changes in vertical mode', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 1000 });

    // Mock container getBoundingClientRect: left=0, right=1000
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 1000,
      top: 0,
      bottom: 500,
      width: 1000,
      height: 500,
    } as DOMRect);

    const hostElement = document.createElement('div');
    // Mock hostElement rect: left=100, right=200
    vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 200,
      top: 0,
      bottom: 50,
      width: 100,
      height: 50,
    } as DOMRect);

    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      get direction() { return currentDir; },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      hostElement,
      direction: 'vertical',
      items: mockItems,
      itemSize: 50,
    });

    await nextTick();
    // LTR: hostOffset.x = rect.left - containerRect.left + container.scrollLeft = 100 - 0 + 0 = 100
    expect(result.componentOffset.x).toBe(100);

    currentDir = 'rtl';
    result.updateDirection();
    await nextTick();

    expect(result.isRtl.value).toBe(true);
    // RTL: hostOffset.x = containerRect.right - rect.right - container.scrollLeft = 1000 - 200 - 0 = 800
    expect(result.componentOffset.x).toBe(800);

    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('calculates hostRefOffset correctly', async () => {
    const container = document.createElement('div');
    const hostRef = document.createElement('div');
    // Mock rect: left=100, top=100
    vi.spyOn(hostRef, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      top: 100,
      width: 100,
      height: 50,
    } as DOMRect);

    const { result, wrapper } = setup({
      container,
      hostRef,
      items: mockItems,
      itemSize: 50,
    });

    await nextTick();
    result.updateHostOffset();

    // displayScrollOffset.y = scrollY - hostRefOffset.y
    // Since scrollY is 0, if hostRefOffset.y is 100, displayScrollOffset.y should be 0 (clamped).
    expect(result.scrollDetails.value.displayScrollOffset.y).toBe(0);
    wrapper.unmount();
  });

  it('syncs display scroll when items count changes in a scaled list', async () => {
    const props = ref<VirtualScrollProps<MockItem>>({
      itemSize: 1000,
      items: Array.from({ length: 30000 }, (_, i) => ({ id: i })), // 30M VU
    });
    const result = useVirtualScroll(props);

    // Scrolled to 10M VU
    result.scrollToOffset(null, 10000000);
    await nextTick();
    await nextTick();

    // Change items length
    props.value.items = Array.from({ length: 40000 }, (_, i) => ({ id: i }));
    await nextTick();
    await nextTick();

    // Should still be at 10M VU
    expect(result.scrollDetails.value.scrollOffset.y).toBeCloseTo(10000000, 0);
  });

  it('calculates host offset correctly in RTL mode', async () => {
    const container = document.createElement('div');
    container.setAttribute('dir', 'rtl');
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        Object.defineProperty(container, 'scrollLeft', { configurable: true, value: options.left, writable: true });
      }
      container.dispatchEvent(new Event('scroll'));
    });
    const hostElement = document.createElement('div');
    container.appendChild(hostElement);

    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 1000 });

    // Mock getComputedStyle for direction
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const dir = el === container ? 'rtl' : 'ltr';
      return {
        get direction() { return dir; },
      } as unknown as CSSStyleDeclaration;
    });

    const { result, wrapper } = setup({
      container,
      hostElement,
      items: mockItems,
      itemSize: 50,
      direction: 'horizontal',
    });

    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(true);

    // Mock elements at start: container [0, 1000], host [200, 700] (host starts 300px from right)
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 1000,
      width: 1000,
      toJSON: () => {},
    } as DOMRect);
    vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      right: 700,
      width: 500,
      toJSON: () => {},
    } as DOMRect);

    Object.defineProperty(container, 'scrollLeft', { configurable: true, value: 0, writable: true });

    result.updateHostOffset();
    await nextTick();

    expect(result.scrollDetails.value.scrollOffset.x).toBe(0);

    Object.defineProperty(container, 'scrollLeft', { configurable: true, value: -400, writable: true });
    container.dispatchEvent(new Event('scroll'));
    vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 500,
      left: 600,
      right: 1100,
      toJSON: () => {},
      top: 0,
      width: 500,
    } as DOMRect);

    result.updateHostOffset();
    await nextTick();
    await nextTick();

    expect(result.scrollDetails.value.scrollOffset.x).toBe(100);

    result.scrollToIndex(null, 4, { align: 'start', behavior: 'auto' });
    expect(container.scrollLeft).toBe(-500);
    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('calculates rendered item offsets correctly in RTL mode when scrolled', async () => {
    const container = document.createElement('div');
    container.setAttribute('dir', 'rtl');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });

    // Mock getComputedStyle for direction
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const dir = el === container ? 'rtl' : 'ltr';
      return {
        get direction() { return dir; },
      } as unknown as CSSStyleDeclaration;
    });

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    // Scroll left by 200px. In RTL Chrome/Firefox, scrollLeft = -200.
    Object.defineProperty(container, 'scrollLeft', { configurable: true, value: -200, writable: true });
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    // Logical scroll position relativeScrollX should be 200.
    expect(result.scrollDetails.value.scrollOffset.x).toBe(200);

    // Item 2 is at logical 200.
    // displayRelativeX = Math.abs(-200) + 0 - 0 = 200.
    // offsetX = 200 + (200 - 200) = 200.
    const item2 = result.renderedItems.value.find((i) => i.index === 2);
    expect(item2).toBeDefined();
    expect(item2?.offset.x).toBe(200);
    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('cleans up observers on unmount', async () => {
    const disconnectSpy = vi.fn();
    const oldMutationObserver = globalThis.MutationObserver;
    globalThis.MutationObserver = (class MutationObserver {
      observe = vi.fn();
      disconnect = disconnectSpy;
    } as unknown) as typeof MutationObserver;

    const { wrapper } = setup({
      container: document.createElement('div'),
      items: mockItems,
    });

    await nextTick();
    wrapper.unmount();
    expect(disconnectSpy).toHaveBeenCalled();
    globalThis.MutationObserver = oldMutationObserver;
  });

  it('performs scroll correction when item sizes change during/after scrollToIndex', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    let scrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (val) => { scrollTop = val; },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.top !== undefined) {
        scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { result, wrapper } = setup({
      container,
      direction: 'vertical',
      itemSize: 0, // dynamic
      items: mockItems, // 100 items, estimate 40px
      defaultItemSize: 40,
    });

    await nextTick();
    await nextTick();

    // Scroll to item 50, alignment 'start'
    // Initial estimate: 50 * 40 = 2000px
    result.scrollToIndex(50, null, { align: 'start', behavior: 'auto' });
    await nextTick();
    await nextTick();

    expect(scrollTop).toBe(2000);

    // Now simulate item 10 changing size from 40 to 100.
    // This should shift item 50 down by 60px.
    // New target should be 2060.
    result.updateItemSize(10, 100, 100);
    await nextTick();
    await nextTick();

    expect(scrollTop).toBe(2060);
    wrapper.unmount();
  });

  it('performs scroll correction for "end" alignment when item sizes change', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    let scrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (val) => { scrollTop = val; },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.top !== undefined) {
        scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { result, wrapper } = setup({
      container,
      direction: 'vertical',
      itemSize: 0,
      items: mockItems,
      defaultItemSize: 40,
    });

    await nextTick();
    await nextTick();

    // Scroll to item 50, alignment 'end'
    // Initial estimate: item 50 is at 2000-2040. end means 2040 - 500 = 1540.
    result.scrollToIndex(50, null, { align: 'end', behavior: 'auto' });
    await nextTick();
    await nextTick();

    expect(scrollTop).toBe(1540);

    // Update item 50 size from 40 to 100.
    // Now item 50 is at 2000-2100. end means 2100 - 500 = 1600.
    result.updateItemSize(50, 100, 100);
    await nextTick();
    await nextTick();

    expect(scrollTop).toBe(1600);
    wrapper.unmount();
  });

  it('correctly scrolls to the end of a dynamic list with corrections', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    let scrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (val) => { scrollTop = val; },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.top !== undefined) {
        scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { result, wrapper } = setup({
      container,
      direction: 'vertical',
      itemSize: 0,
      items: mockItems, // 100 items
      defaultItemSize: 40,
    });

    await nextTick();
    await nextTick();

    result.scrollToIndex(99, null, { align: 'end', behavior: 'auto' });
    await nextTick();
    await nextTick();
    expect(scrollTop).toBe(3500);

    const updates = Array.from({ length: 90 }, (_, i) => ({ index: i, inlineSize: 100, blockSize: 50 }));
    result.updateItemSizes(updates);
    await nextTick();
    await nextTick();

    expect(scrollTop).toBe(4400);
    wrapper.unmount();
  });

  it('clears pendingScroll when scrollToOffset is called', async () => {
    const { result, wrapper } = setup({
      container: window,
      direction: 'vertical',
      itemSize: 50,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    // Set a pending scroll
    result.scrollToIndex(50, null, { align: 'start', behavior: 'smooth' });
    await nextTick();

    // Call scrollToOffset
    result.scrollToOffset(null, 100);
    await nextTick();

    // Wait for scroll timeout (250ms)
    await new Promise((resolve) => setTimeout(resolve, 300));
    await nextTick();

    // The index 50 should NOT be corrected back because pendingScroll was cleared
    expect(window.scrollY).toBe(100);
    wrapper.unmount();
  });

  it('detects RTL mode change on a parent element', async () => {
    const parent = document.createElement('div');
    const container = document.createElement('div');
    parent.appendChild(container);

    vi.useFakeTimers();

    // Mock getComputedStyle to reflect parent's direction
    const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => ({
      get direction() {
        let current: HTMLElement | null = el as HTMLElement;
        while (current) {
          if (current.getAttribute('dir') === 'rtl') {
            return 'rtl';
          }
          current = current.parentElement;
        }
        return 'ltr';
      },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(false);

    // Change parent direction
    parent.setAttribute('dir', 'rtl');

    // Advance timers
    vi.advanceTimersByTime(1000);
    await nextTick();

    expect(result.isRtl.value).toBe(true);

    wrapper.unmount();
    spy.mockRestore();
    vi.useRealTimers();
  });

  it('maintains horizontal scroll position when switching between RTL and LTR', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
    let scrollLeft = 0;
    Object.defineProperty(container, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (val) => { scrollLeft = val; },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        scrollLeft = options.left;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      get direction() { return currentDir; },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    // Scroll to 200px
    result.scrollToOffset(200, null, { behavior: 'auto' });
    await nextTick();
    expect(scrollLeft).toBe(200);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(200);

    // Switch to RTL
    currentDir = 'rtl';
    result.updateDirection();
    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(true);
    // Logical offset should still be 200.
    // In RTL with no padding, logical 200 means abs(scrollLeft) = 200.
    expect(scrollLeft).toBe(-200);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(200);

    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('maintains horizontal scroll position when switching between RTL and LTR with padding', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
    let scrollLeft = 0;
    Object.defineProperty(container, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (val) => { scrollLeft = val; },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        scrollLeft = options.left;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      get direction() { return currentDir; },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: Array.from({ length: 10 }, (_, i) => ({ id: i })),
      scrollPaddingStart: 50,
    });

    await nextTick();
    await nextTick();

    result.scrollToOffset(150, null, { behavior: 'auto' });
    await nextTick();
    expect(scrollLeft).toBe(150);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(150);

    // Switch to RTL
    currentDir = 'rtl';
    result.updateDirection();
    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(true);
    expect(scrollLeft).toBe(-150);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(150);

    // Switch back to LTR
    currentDir = 'ltr';
    result.updateDirection();
    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(false);
    expect(scrollLeft).toBe(150);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(150);

    wrapper.unmount();
    styleSpy.mockRestore();
  });

  describe('sticky footer and header scrollToIndex', () => {
    const stickyMockItems = Array.from({ length: 10 }, (_, i) => ({ id: i }));

    it('scrolls to the last item correctly with sticky footer and hostOffset', async () => {
      const hostRef = document.createElement('div');
      const hostElement = document.createElement('div');
      // Mock getBoundingClientRect
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

      // Scroll to last item (index 9) with align 'end'
      result.scrollToIndex(9, 0, { align: 'end', behavior: 'auto' });

      await nextTick();
      await nextTick();

      expect(hostRef.scrollTop).toBe(100);

      // Verify last item is rendered
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

  describe('coordinate scaling and bounds', () => {
    it('rendered item offsets do not grow excessively under scaling', async () => {
      const itemCount = 100000;
      const itemSize = 50;
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

      // Scroll to item 100 (virtual 5000)
      result.scrollToIndex(100, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();

      const scaleY = result.scaleY.value;
      const expectedDisplayScroll = 5000 / scaleY;
      expect(window.scrollY).toBeCloseTo(expectedDisplayScroll, 0);

      const item100 = result.renderedItems.value.find((i) => i.index === 100);
      expect(item100).toBeDefined();

      // item100.offset.y should be (100 * 50) / scaleY = 5000 / scaleY
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

      // Total virtual height = 1000 * 50 = 50,000
      // Total display height = 50,000 + header (50) + footer (50) = 50,100
      // Max scrollTop = 50,100 - 500 = 49,600

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

      // Position of last item in container = lastItem.offset.y + headerHeight
      // relative to viewport bottom = (offset.y + headerHeight + itemSize) - (scrollY + viewportHeight)
      // Should be -footerHeight (covered by sticky footer)
      const itemBottomDisplay = lastItem!.offset.y + headerHeight + itemSize;
      expect(itemBottomDisplay - (window.scrollY + viewportHeight)).toBe(-footerHeight);

      wrapper.unmount();
    });
  });

  describe('horizontal edge cases', () => {
    it('triggers correction when container dimensions change', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500, writable: true });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500, writable: true });

      const { result, wrapper } = setup({
        container,
        itemSize: 50,
        items: mockItems,
      });

      await nextTick();
      await nextTick();

      // Change dimensions
      Object.defineProperty(container, 'clientHeight', { value: 800 });
      Object.defineProperty(container, 'clientWidth', { value: 800 });
      triggerResize(container, 800, 800);

      await nextTick();
      await nextTick();

      expect(result.scrollDetails.value.displayViewportSize.height).toBe(800);
      wrapper.unmount();
    });

    it('restores horizontal scroll position when items are prepended', async () => {
      const initialItems = Array.from({ length: 10 }, (_, i) => ({ id: i + 5 }));
      const { result, props, wrapper } = setup({
        direction: 'horizontal',
        itemSize: 100,
        items: initialItems,
        restoreScrollOnPrepend: true,
      });

      await nextTick();
      result.scrollToOffset(200, null);
      await nextTick();

      // Prepend 5 items
      const newItems = [
        ...Array.from({ length: 5 }, (_, i) => ({ id: i })),
        ...initialItems,
      ];
      props.value.items = newItems;

      await nextTick();
      await nextTick();

      // Should have added 5 * 100 = 500px to scroll position
      expect(result.scrollDetails.value.scrollOffset.x).toBe(700);
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

    it('handles horizontal sticky items', async () => {
      const { result, wrapper } = setup({
        direction: 'horizontal',
        itemSize: 100,
        stickyIndices: [ 0 ],
        items: mockItems,
      });

      await nextTick();

      // Scroll past item 0
      result.scrollToOffset(200, null);
      await nextTick();

      const item0 = result.renderedItems.value.find((i) => i.index === 0);
      expect(item0?.isStickyActive).toBe(true);

      wrapper.unmount();
    });
  });
});
