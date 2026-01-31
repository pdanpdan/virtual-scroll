import type { ItemSlotProps, ScrollbarSlotProps, ScrollDetails, VirtualScrollInstance } from '../types';
import type { VueWrapper } from '@vue/test-utils';
import type { DefineComponent } from 'vue';

/* global ScrollToOptions, ResizeObserverCallback */
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick, ref } from 'vue';

import { displayToVirtual, virtualToDisplay } from '../utils/virtual-scroll-logic';
import VirtualScroll from './VirtualScroll.vue';

// --- Mocks ---

Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 500 });

HTMLElement.prototype.scrollTo = function (this: HTMLElement, options?: number | ScrollToOptions, y?: number) {
  if (typeof options === 'object') {
    if (options.top !== undefined) {
      this.scrollTop = options.top;
    }
    if (options.left !== undefined) {
      this.scrollLeft = options.left;
    }
  } else if (typeof options === 'number' && typeof y === 'number') {
    this.scrollLeft = options;
    this.scrollTop = y;
  }
  this.dispatchEvent(new Event('scroll'));
};

HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

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

function triggerResize(el: Element, width: number, height: number, useBorderBox = true) {
  const obs = observers.find((o) => o.targets.has(el));
  if (obs) {
    obs.callback([ {
      ...(useBorderBox ? { borderBoxSize: [ { blockSize: height, inlineSize: width } ] } : {}),
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

// Mock window.scrollTo
globalThis.window.scrollTo = vi.fn().mockImplementation((options) => {
  if (options.left !== undefined) {
    Object.defineProperty(window, 'scrollX', { configurable: true, value: options.left, writable: true });
  }
  if (options.top !== undefined) {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: options.top, writable: true });
  }
  document.dispatchEvent(new Event('scroll'));
});

// --- Tests ---

interface MockItem {
  id: number;
  label: string;
}

describe('virtualScroll', () => {
  const mockItems: MockItem[] = Array.from({ length: 100 }, (_, i) => ({ id: i, label: `Item ${ i }` }));

  beforeEach(() => {
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
    vi.useFakeTimers({ toFake: [ 'requestAnimationFrame' ] });
  });

  afterEach(() => {
    observers.length = 0;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('basic rendering', () => {
    it('renders the visible items', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems,
        },
        slots: {
          item: (props: ItemSlotProps) => {
            const { index, item } = props as ItemSlotProps<MockItem>;
            return h('div', { class: 'item' }, `${ index }: ${ item.label }`);
          },
        },
      });

      await nextTick();

      const items = wrapper.findAll('.item');
      expect(items.length).toBe(15);
      expect(items[ 0 ]?.text()).toBe('0: Item 0');
      expect(items[ 14 ]?.text()).toBe('14: Item 14');
    });

    it('updates when items change', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems.slice(0, 5),
        },
      });
      await nextTick();
      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(5);

      await wrapper.setProps({ items: mockItems.slice(0, 10) });
      await nextTick();
      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(10);
    });

    it('supports horizontal direction', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          direction: 'horizontal',
          itemSize: 100,
          items: mockItems,
        },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      expect(container.classes()).toContain('virtual-scroll--horizontal');
      expect((wrapper.find('.virtual-scroll-wrapper').element as HTMLElement).style.inlineSize).toBe('10000px');

      // 500px / 100px = 5 visible
      // + 5 bufferAfter = 10 total
      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(10);
    });

    it('supports grid mode (both directions)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          columnCount: 5,
          columnWidth: 100,
          direction: 'both',
          itemSize: 50,
          items: mockItems,
        },
      });
      await nextTick();
      const style = (wrapper.find('.virtual-scroll-wrapper').element as HTMLElement).style;
      expect(style.blockSize).toBe('5000px');
      expect(style.inlineSize).toBe('500px');

      // 500px / 50px = 10 visible rows
      // + 5 bufferAfter = 15 total rows
      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(15);
    });
  });

  describe('scrolling', () => {
    it('scrolls and updates visible items', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems,
        },
        slots: {
          item: (props: ItemSlotProps) => {
            const { item } = props as ItemSlotProps<MockItem>;
            return h('div', { class: 'item' }, item.label);
          },
        },
      });
      await nextTick();

      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;

      Object.defineProperty(el, 'scrollTop', { value: 1000, writable: true });
      await container.trigger('scroll');
      await nextTick();
      await nextTick();

      expect(wrapper.text()).toContain('Item 20');
      expect(wrapper.text()).toContain('Item 15');

      const items = wrapper.findAll('.item');
      // 500px viewport / 50px item = 10 visible items
      // bufferBefore = 5, bufferAfter = 5
      // Total rendered should be around 20
      expect(items.length).toBeGreaterThanOrEqual(15);
      expect(items.length).toBeLessThanOrEqual(25);
    });

    it('emits load event when reaching end', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems.slice(0, 20),
          loadDistance: 100,
        },
      });
      await nextTick();
      await nextTick();

      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;

      expect(wrapper.emitted('load')).toBeUndefined();

      Object.defineProperty(el, 'scrollTop', { value: 450, writable: true });
      await container.trigger('scroll');
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('load')).toBeDefined();
    });

    it('handles wheel when virtual scrollbars are inactive', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          virtualScrollbar: false,
        },
      });
      await nextTick();
      await wrapper.find('.virtual-scroll-container').trigger('wheel', { deltaY: 100 });
      // should just stop programmatic scroll
    });

    it('should not enter a loop when scrolling to end with dynamic items', async () => {
      const items = Array.from({ length: 200 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScroll, {
        props: {
          items,
          itemSize: 0, // dynamic
          defaultItemSize: 40,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;

      // Press End
      await wrapper.trigger('keydown', { key: 'End' });

      // Wait for multiple ticks to let the correction logic work
      for (let i = 0; i < 5; i++) {
        await nextTick();
      }

      // Simulate items being measured differently than estimated
      const rendered = wrapper.findAll('.virtual-scroll-item');
      for (const item of rendered) {
        const idx = Number(item.attributes('data-index'));
        if (idx >= 90) {
          triggerResize(item.element, 500, 50); // 50 instead of 40
        }
      }

      // Wait for corrections
      for (let i = 0; i < 5; i++) {
        await nextTick();
      }

      const details = vs.scrollDetails;
      // Should be at the end
      expect(details.scrollOffset.y).toBeGreaterThanOrEqual(details.totalSize.height - details.viewportSize.height - 1);

      const scrollToIndexSpy = vi.spyOn(vs, 'scrollToIndex');

      await nextTick();
      await nextTick();

      // Should not be calling scrollToIndex anymore
      expect(scrollToIndexSpy).not.toHaveBeenCalled();
    });
  });

  describe('keyboard navigation', () => {
    it('responds to Home and End keys in vertical mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      // item 99 at 4950. end align -> 4950 - (500 - 50) = 4500.
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(4500);

      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
    });

    it('responds to Arrows in vertical mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(50);

      await container.trigger('keydown', { key: 'ArrowUp' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
    });

    it('responds correctly to arrows in RTL mode', async () => {
      const container = document.createElement('div');
      container.setAttribute('dir', 'rtl');
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        if (options.left !== undefined) {
          Object.defineProperty(container, 'scrollLeft', { configurable: true, value: options.left, writable: true });
        }
        container.dispatchEvent(new Event('scroll'));
      });

      // Mock getComputedStyle for direction
      const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === container) {
          return { direction: 'rtl' } as CSSStyleDeclaration;
        }
        return { direction: 'ltr' } as CSSStyleDeclaration;
      });

      const wrapper = mount(VirtualScroll, {
        props: {
          container,
          direction: 'horizontal',
          itemSize: 100,
          items: mockItems,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.updateDirection();
      await nextTick();
      expect(vs.isRtl).toBe(true);

      const vsContainer = wrapper.find('.virtual-scroll-container');

      // Initial scroll 0
      // ArrowLeft in RTL -> move logical END -> logical offset 100
      await vsContainer.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(100, 0);

      // ArrowRight in RTL -> move logical START -> logical offset 0
      await vsContainer.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(0, 0);

      styleSpy.mockRestore();
    });

    it('aligns partially visible items correctly with arrows in RTL mode', async () => {
      const container = document.createElement('div');
      container.setAttribute('dir', 'rtl');
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        if (options.left !== undefined) {
          Object.defineProperty(container, 'scrollLeft', { configurable: true, value: options.left, writable: true });
        }
        container.dispatchEvent(new Event('scroll'));
      });

      const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === container) {
          return { direction: 'rtl' } as CSSStyleDeclaration;
        }
        return { direction: 'ltr' } as CSSStyleDeclaration;
      });

      const wrapper = mount(VirtualScroll, {
        props: {
          container,
          direction: 'horizontal',
          itemSize: 100,
          items: mockItems,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.updateDirection();
      await nextTick();

      // Scroll so item 0 is partially visible at START (Right in RTL)
      // Logical offset 50 -> item 0 starts at 0, viewport starts at 50.
      vs.scrollToOffset(50, null);
      await nextTick();
      await nextTick();

      const vsContainer = wrapper.find('.virtual-scroll-container');

      // ArrowRight in RTL -> move logical START
      await vsContainer.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(0, 0); // Aligns item 0 to start

      // Scroll so item 4 is partially visible at END (Left in RTL)
      await wrapper.setProps({ itemSize: 150 });
      await nextTick();
      await nextTick();

      // Viewport 0-500. Item 3 ends at 600. Item 3 is partially visible at end.
      expect(vs.scrollDetails.currentEndIndex).toBe(3);

      // ArrowLeft in RTL -> move logical END
      await vsContainer.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();
      // item 3 ends at 600. targetEnd = 600 - 500 = 100.
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(100, 0);

      styleSpy.mockRestore();
    });

    it('scrolls to next item with ArrowLeft when current item is already at the left edge (RTL)', async () => {
      const container = document.createElement('div');
      container.setAttribute('dir', 'rtl');
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        if (options.left !== undefined) {
          Object.defineProperty(container, 'scrollLeft', { configurable: true, value: options.left, writable: true });
        }
        container.dispatchEvent(new Event('scroll'));
      });

      const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === container) {
          return { direction: 'rtl' } as CSSStyleDeclaration;
        }
        return { direction: 'ltr' } as CSSStyleDeclaration;
      });

      const wrapper = mount(VirtualScroll, {
        props: {
          container,
          direction: 'horizontal',
          itemSize: 100,
          items: mockItems,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.updateDirection();
      await nextTick();

      // Align item 4 to end (Left in RTL).
      vs.scrollToIndex(null, 4, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndColIndex).toBe(4);
      expect(vs.scrollDetails.scrollOffset.x).toBe(0);

      const containerEl = wrapper.find('.virtual-scroll-container');
      await containerEl.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();

      // Should scroll so item 5 ends at 500. targetEnd = 100.
      expect(vs.scrollDetails.scrollOffset.x).toBe(100);
      styleSpy.mockRestore();
    });

    it('scrolls to previous item with ArrowUp when current item is already at the top', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // Precisely align item 2 to top (100px)
      vs.scrollToIndex(2, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(100);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowUp' });
      await nextTick();
      await nextTick();

      // Should scroll to item 1 (50px)
      expect(vs.scrollDetails.scrollOffset.y).toBe(50);
    });

    it('scrolls to next item with ArrowRight when current item is already at the right edge (LTR)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // Precisely align item 4 to end (400 to 500 in 500 wide viewport -> offset 0)
      // Actually, viewport 500. Item 4 ends at 500. Offset 0.
      vs.scrollToIndex(4, null, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndIndex).toBe(4);
      expect(vs.scrollDetails.scrollOffset.x).toBe(0);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();

      // Should scroll so item 5 ends at 500. targetEnd = 600 - 500 = 100.
      expect(vs.scrollDetails.scrollOffset.x).toBe(100);
    });

    it('scrolls to next item with ArrowDown when current item is already at the bottom edge', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // Precisely align item 9 to bottom (10 * 50 = 500. Viewport 500. Offset 0)
      // item 9 ends at 500. viewport ends at 500.
      vs.scrollToIndex(9, null, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndIndex).toBe(9);
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await nextTick();

      // Should scroll to item 10 (50px)
      expect(vs.scrollDetails.scrollOffset.y).toBe(50);
    });

    it('does not scroll with ArrowDown when already at the very last item', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // Scroll to the very end (total 5000, viewport 500 -> max offset 4500)
      vs.scrollToOffset(null, 4500, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndIndex).toBe(99);
      expect(vs.scrollDetails.scrollOffset.y).toBe(4500);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await nextTick();

      // Should remain at 4500
      expect(vs.scrollDetails.scrollOffset.y).toBe(4500);
    });

    it('does not scroll with ArrowRight when already at the very last item (horizontal LTR)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // Scroll to the very end (total 10000, viewport 500 -> max offset 9500)
      vs.scrollToOffset(9500, null, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndColIndex).toBe(99);
      expect(vs.scrollDetails.scrollOffset.x).toBe(9500);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();

      // Should remain at 9500
      expect(vs.scrollDetails.scrollOffset.x).toBe(9500);
    });

    it('does not scroll with ArrowLeft when already at the very last item (horizontal RTL)', async () => {
      // Mock getComputedStyle to return RTL
      const styleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        direction: 'rtl',
      } as CSSStyleDeclaration);

      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // Scroll to the logical end (which is Left in RTL)
      vs.scrollToOffset(9500, null, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndColIndex).toBe(99);
      expect(vs.scrollDetails.scrollOffset.x).toBe(9500);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();

      // Should remain at 9500
      expect(vs.scrollDetails.scrollOffset.x).toBe(9500);
      styleSpy.mockRestore();
    });

    it('responds to PageUp and PageDown in vertical mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'PageDown' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(500);

      await container.trigger('keydown', { key: 'PageUp' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
    });

    it('responds to Home and End keys in horizontal mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      // last item 99 at 9900. end align -> 9900 - (500 - 100) = 9500.
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(9500);

      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
    });

    it('responds to Arrows in horizontal mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(100);

      await container.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
    });

    it('responds to PageUp and PageDown in horizontal mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'PageDown' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(500);

      await container.trigger('keydown', { key: 'PageUp' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
    });

    it('disables smooth scroll for large distances (Home/End)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Item ${ i }` })),
          container: window,
        },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      // Mock window.scrollTo to check behavior
      const scrollToSpy = vi.spyOn(window, 'scrollTo');

      await container.trigger('keydown', { key: 'End' });
      await nextTick();

      // Distance is ~50000px, viewport is 500px. 50000 > 10 * 500.
      expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({
        behavior: 'auto',
      }));

      scrollToSpy.mockClear();
      await container.trigger('keydown', { key: 'Home' });
      await nextTick();

      expect(scrollToSpy).toHaveBeenCalledWith(expect.objectContaining({
        behavior: 'auto',
      }));
    });

    it('responds to Home and End keys in grid mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          columnCount: 10,
          columnWidth: 100,
          direction: 'both',
          itemSize: 50,
          items: mockItems,
        },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      // last row 99 at 4950. end align -> 4500.
      // last col 9 at 900. end align -> 900 - (500 - 100) = 500.
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(4500);
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(500);

      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
    });

    it('responds to all Arrows in grid mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          columnCount: 10,
          columnWidth: 100,
          direction: 'both',
          itemSize: 50,
          items: mockItems,
        },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'ArrowDown' });
      await container.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(50);
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(100);

      await container.trigger('keydown', { key: 'ArrowUp' });
      await container.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
    });

    it('aligns items precisely with Arrow keys', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 100,
          items: mockItems,
        },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      // Scroll to 50px (item 0 partially cut off)
      const vs = wrapper.vm as {
        scrollDetails: ScrollDetails<MockItem>;
        scrollToOffset: (x: number | null, y: number | null, options: unknown) => void;
      };
      vs.scrollToOffset(null, 50, { behavior: 'auto' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(50);

      // ArrowUp should align item 0 to start (0px)
      await container.trigger('keydown', { key: 'ArrowUp' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);

      // ArrowDown should align first beyond item to end
      // Viewport 500. Items 0..4 are fully visible. Item 5 is first beyond.
      // Aligning item 5 to end -> (5+1)*100 - 500 = 100.
      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(100);

      // ArrowDown again should align item 6 to end -> 700 - 500 = 200.
      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(200);
    });

    it('ignores vertical arrows in horizontal mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          direction: 'horizontal',
        },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      const scrollToIndexSpy = vi.spyOn(vs, 'scrollToIndex');

      await wrapper.find('.virtual-scroll-container').trigger('keydown', { key: 'ArrowUp' });
      await wrapper.find('.virtual-scroll-container').trigger('keydown', { key: 'ArrowDown' });

      expect(scrollToIndexSpy).not.toHaveBeenCalled();
    });

    it('ignores horizontal arrows in vertical mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          direction: 'vertical',
        },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      const scrollToIndexSpy = vi.spyOn(vs, 'scrollToIndex');

      await wrapper.find('.virtual-scroll-container').trigger('keydown', { key: 'ArrowLeft' });
      await wrapper.find('.virtual-scroll-container').trigger('keydown', { key: 'ArrowRight' });

      expect(scrollToIndexSpy).not.toHaveBeenCalled();
    });
  });

  describe('dynamic sizing', () => {
    it('adjusts total size when items are measured', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 0,
          items: mockItems.slice(0, 10),
        },
      });
      await nextTick();

      expect((wrapper.find('.virtual-scroll-wrapper').element as HTMLElement).style.blockSize).toBe('400px');

      const firstItem = wrapper.find('.virtual-scroll-item[data-index="0"]').element;
      triggerResize(firstItem, 100, 100);
      await nextTick();
      await nextTick();

      expect((wrapper.find('.virtual-scroll-wrapper').element as HTMLElement).style.blockSize).toBe('460px');
    });

    it('does not allow columns to become 0 width due to 0-size measurements', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          bufferAfter: 0,
          bufferBefore: 0,
          columnCount: 10,
          defaultColumnWidth: 100,
          direction: 'both',
          itemSize: 50,
          items: mockItems,
        },
        slots: {
          item: ({ columnRange, index }: ItemSlotProps) => h('div', {
            'data-index': index,
          }, [
            ...Array.from({ length: columnRange.end - columnRange.start }, (_, i) => h('div', {
              class: 'cell',
              'data-col-index': columnRange.start + i,
            })),
          ]),
        },
      });

      await nextTick();

      const initialWidth = (wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.totalSize.width;
      expect(initialWidth).toBeGreaterThan(0);

      // Find a cell from the first row
      const row0 = wrapper.find('.virtual-scroll-item[data-index="0"]').element;
      const cell0 = row0.querySelector('.cell') as HTMLElement;
      expect(cell0).not.toBeNull();

      // Simulate 0-size measurement (e.g. from removal or being hidden)
      triggerResize(cell0, 0, 0);

      await nextTick();
      await nextTick();

      // totalWidth should NOT have decreased if we ignore 0 measurements
      const currentWidth = (wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.totalSize.width;
      expect(currentWidth).toBe(initialWidth);
    });

    it('should not shift horizontally when scrolling vertically even if measurements vary slightly', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          bufferAfter: 0,
          bufferBefore: 0,
          columnCount: 10,
          defaultColumnWidth: 100,
          direction: 'both',
          itemSize: 50,
          items: mockItems,
        },
        slots: {
          item: ({ columnRange, index }: ItemSlotProps) => h('div', {
            'data-index': index,
          }, [
            ...Array.from({ length: columnRange.end - columnRange.start }, (_, i) => h('div', {
              class: 'cell',
              'data-col-index': columnRange.start + i,
            })),
          ]),
        },
      });

      await nextTick();

      // Initial scroll
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);

      // Measure some columns of row 0
      const row0 = wrapper.find('.virtual-scroll-item[data-index="0"]').element;
      const cells0 = Array.from(row0.querySelectorAll('.cell'));

      // Measure row 0 and its cells
      triggerResize(row0, 1000, 50);
      for (const cell of cells0) {
        triggerResize(cell, 110, 50);
      }

      await nextTick();
      await nextTick();

      // Scroll down to row 20
      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      Object.defineProperty(el, 'scrollTop', { configurable: true, value: 1000, writable: true });
      await container.trigger('scroll');

      await nextTick();
      await nextTick();

      // Now row 20 is at the top. Measure its cells with slightly different width.
      const row20 = wrapper.find('.virtual-scroll-item[data-index="20"]').element;
      const cells20 = Array.from(row20.querySelectorAll('.cell'));

      for (const cell of cells20) {
        triggerResize(cell, 110.1, 50);
      }

      await nextTick();
      await nextTick();

      // ScrollOffset.x should STILL BE 0. It should not have shifted because of d = 0.1
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
    });

    it('correctly aligns item 50:50 auto after measurements in dynamic grid', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          bufferAfter: 5,
          bufferBefore: 5,
          columnCount: 100,
          defaultColumnWidth: 120,
          defaultItemSize: 120,
          direction: 'both',
          items: mockItems,
        },
        slots: {
          item: ({ columnRange, index }: ItemSlotProps) => h('div', {
            'data-index': index,
          }, [
            ...Array.from({ length: columnRange.end - columnRange.start }, (_, i) => h('div', {
              class: 'cell',
              'data-col-index': columnRange.start + i,
            })),
          ]),
        },
      });

      await nextTick();

      // Jump to 50:50 auto
      (wrapper.vm as { scrollToIndex: (r: number, c: number, a: string) => void; }).scrollToIndex(50, 50, 'auto');
      await nextTick();
      await nextTick();

      // Initial scroll position (estimates)
      // itemX = 50 * 120 = 6000. itemWidth = 120. viewport = 500.
      // targetEnd = 6000 + 120 - 500 = 5620.
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(5620);

      // Row 50 should be rendered. Row 45 should be the first rendered row.
      const row45El = wrapper.find('.virtual-scroll-item[data-index="45"]').element;
      const cells45 = Array.from(row45El.querySelectorAll('.cell'));

      // Simulate measurements for all rendered cells in row 45 as 150px
      for (const cell of cells45) {
        triggerResize(cell, 150, 120);
      }

      await nextTick();
      await nextTick();
      await nextTick();

      // Correction should have triggered.
      // At x=5620, rendered columns are 44..52 (inclusive).
      // If columns 44..52 are all 150px:
      // New itemX for col 50: 44 * 120 + 6 * 150 = 5280 + 900 = 6180.
      // itemWidth = 150. viewport = 500.
      // targetEnd = 6180 + 150 - 500 = 5830.

      // wait for async correction cycle
      await new Promise((resolve) => setTimeout(resolve, 300));
      await nextTick();

      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(5830);

      // Check if it's fully visible
      const offset = (wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x;
      const viewportWidth = (wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.viewportSize.width;
      const itemX = 6180;
      const itemWidth = 150;

      expect(itemX).toBeGreaterThanOrEqual(offset);
      expect(itemX + itemWidth).toBeLessThanOrEqual(offset + viewportWidth);
    });

    it('handles fallback measurement when borderBoxSize is missing', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 0, // dynamic
        },
      });

      await nextTick();
      const item = wrapper.find('.virtual-scroll-item');

      // Force offsetWidth/Height for fallback
      Object.defineProperty(item.element, 'offsetWidth', { value: 500, configurable: true });
      Object.defineProperty(item.element, 'offsetHeight', { value: 60, configurable: true });

      triggerResize(item.element, 500, 60, false); // No borderBoxSize

      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      expect(vs.getRowHeight(0)).toBe(60);
    });
  });

  describe('sticky items', () => {
    it('applies sticky styles to marked items', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems,
          stickyIndices: [ 0 ],
        },
      });
      await nextTick();

      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;

      Object.defineProperty(el, 'scrollTop', { value: 100, writable: true });
      await container.trigger('scroll');
      await nextTick();
      await nextTick();

      const item0 = wrapper.find('.virtual-scroll-item[data-index="0"]');
      expect(item0.classes()).toContain('virtual-scroll--sticky');
      expect((item0.element as HTMLElement).style.insetBlockStart).toBe('0px');
    });
  });

  describe('ssr and initial state', () => {
    it('renders SSR range if provided', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems,
          ssrRange: { end: 20, start: 10 },
        },
        slots: {
          item: (props: ItemSlotProps) => {
            const { item } = props as ItemSlotProps<MockItem>;
            return h('div', item.label);
          },
        },
      });
      const items = wrapper.findAll('.virtual-scroll-item');
      expect(items.length).toBe(10);
      expect(items[ 0 ]?.attributes('data-index')).toBe('10');
      expect(wrapper.text()).toContain('Item 10');
    });

    it('hydrates and scrolls to initial index', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          initialScrollIndex: 50,
          itemSize: 50,
          items: mockItems,
        },
        slots: {
          item: (props: ItemSlotProps) => {
            const { item } = props as ItemSlotProps<MockItem>;
            return h('div', item.label);
          },
        },
      });
      await nextTick(); // onMounted
      await nextTick(); // hydration + scrollToIndex
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.text()).toContain('Item 50');
    });

    it('does not gather multiple sticky items at the top', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems,
          stickyIndices: [ 0, 1, 2 ],
        },
        slots: {
          item: (props: ItemSlotProps) => {
            const { index, item } = props as ItemSlotProps<MockItem>;
            return h('div', { class: 'item' }, `${ index }: ${ item.label }`);
          },
        },
      });

      await nextTick();
      await nextTick();

      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;

      // Scroll past item 2 (originalY = 100). relativeScrollY = 150.
      Object.defineProperty(el, 'scrollTop', { configurable: true, value: 150, writable: true });
      await container.trigger('scroll');
      await nextTick();
      await nextTick();

      // Only item 2 should be active sticky.
      // Item 0 and 1 should have isStickyActive = false.
      const item0 = wrapper.find('.virtual-scroll-item[data-index="0"]');
      const item1 = wrapper.find('.virtual-scroll-item[data-index="1"]');
      const item2 = wrapper.find('.virtual-scroll-item[data-index="2"]');

      expect(item2.classes()).toContain('virtual-scroll--sticky');
      expect(item1.classes()).not.toContain('virtual-scroll--sticky');
      expect(item0.classes()).not.toContain('virtual-scroll--sticky');
    });
  });

  describe('slots and options', () => {
    it('renders header and footer', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems.slice(0, 1) },
        slots: {
          footer: () => h('div', 'FOOTER'),
          header: () => h('div', 'HEADER'),
        },
      });
      expect(wrapper.text()).toContain('HEADER');
      expect(wrapper.text()).toContain('FOOTER');
    });

    it('shows loading indicator', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: [], loading: true },
        slots: {
          loading: () => h('div', 'LOADING...'),
        },
      });
      expect(wrapper.text()).toContain('LOADING...');
    });

    it('uses correct HTML tags', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          containerTag: 'table',
          itemTag: 'tr',
          items: [],
          wrapperTag: 'tbody',
        },
      });
      expect(wrapper.element.tagName).toBe('TABLE');
      expect(wrapper.find('tbody').exists()).toBe(true);
    });

    it('triggers refresh and updates items', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems.slice(0, 10),
        },
      });
      await nextTick();

      const vs = wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; refresh: () => void; };
      vs.refresh();
      await nextTick();
      // Should not crash
      expect(vs.scrollDetails.items.length).toBeGreaterThan(0);
      expect(vs.scrollDetails.items.length).toBeLessThan(50);
    });

    it('handles sticky header and footer measurements', async () => {
      mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          stickyFooter: true,
          stickyHeader: true,
        },
        slots: {
          footer: () => h('div', { class: 'footer', style: 'height: 30px' }, 'FOOTER'),
          header: () => h('div', { class: 'header', style: 'height: 40px' }, 'HEADER'),
        },
      });
      await nextTick();
    });

    it('works with window as container', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          container: window,
          itemSize: 50,
          items: mockItems,
        },
      });
      await nextTick();
      expect(wrapper.classes()).toContain('virtual-scroll--window');
    });

    it('forces virtual scrollbars when virtualScrollbar prop is true', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: [ { id: 1 } ],
          itemSize: 50,
          virtualScrollbar: true,
        },
      });
      await nextTick();
      expect(wrapper.find('.virtual-scroll-scrollbar-container').exists()).toBe(true);
    });

    it('accounts for sticky header and footer in scroll padding', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 50,
          stickyHeader: true,
        },
        slots: {
          header: () => h('div', { class: 'header', style: 'height: 40px' }, 'HEADER'),
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; };
      // We can't easily trigger ResizeObserver in tests for child slots,
      // but we can check if the logic is prepared to handle it.
      expect(vs.scrollDetails.totalSize.height).toBeGreaterThan(0);
    });

    it('resets measured padding when header/footer is removed', async () => {
      const TestComponent = {
        components: { VirtualScroll },
        props: [ 'showHeader', 'showFooter' ],
        template: `
          <VirtualScroll :itemSize="50" :items="items">
            <template v-if="showHeader" #header>
              <div class="header" style="height: 100px">HEADER</div>
            </template>
            <template v-if="showFooter" #footer>
              <div class="footer" style="height: 100px">FOOTER</div>
            </template>
          </VirtualScroll>
        `,
        data() {
          return { items: Array.from({ length: 10 }, (_, i) => ({ id: i })) };
        },
      };

      const wrapper = mount(TestComponent, {
        props: {
          showHeader: true,
          showFooter: true,
        },
      });

      await nextTick();

      const vs = wrapper.findComponent(VirtualScroll as unknown as DefineComponent).vm as unknown as VirtualScrollInstance<MockItem>;

      // Simulate header/footer measurement
      const headerEl = wrapper.find('.virtual-scroll-header').element as HTMLElement;
      const footerEl = wrapper.find('.virtual-scroll-footer').element as HTMLElement;

      Object.defineProperty(headerEl, 'offsetHeight', { configurable: true, value: 100 });
      Object.defineProperty(footerEl, 'offsetHeight', { configurable: true, value: 100 });

      triggerResize(headerEl, 500, 100);
      triggerResize(footerEl, 500, 100);

      await nextTick();
      await nextTick();

      // itemsHeight (500) + header (100) + footer (100) = 700
      expect(vs.scrollDetails.totalSize.height).toBe(700);

      // Remove header
      await wrapper.setProps({ showHeader: false });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.totalSize.height).toBe(600);

      // Remove footer
      await wrapper.setProps({ showFooter: false });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.totalSize.height).toBe(500);
    });
  });

  describe('scaling and overlap', () => {
    it('items should not overlap when scaling is active', async () => {
      const itemSize = 250;
      // Total height = 100,000 * 250 = 25,000,000 (> 10,000,000)
      const rowCount = 100000;
      const massiveItems = Array.from({ length: rowCount }, (_, i) => ({ id: i, label: `Item ${ i }` }));

      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize,
          items: massiveItems,
        },
        slots: {
          item: ({ index }: { index: number; }) => h('div', { class: 'item' }, `Item ${ index }`),
        },
      });

      await nextTick();
      await nextTick();

      const items = wrapper.findAll('.virtual-scroll-item');
      expect(items.length).toBeGreaterThan(1);
      expect(items.length).toBeLessThan(50);

      const item0 = items[ 0 ]!.element as HTMLElement;
      const item1 = items[ 1 ]!.element as HTMLElement;

      const style0 = item0.style.transform;
      const style1 = item1.style.transform;

      // Extract Y from translate(Xpx, Ypx)
      const getY = (style: string) => {
        const match = style.match(/translate\([^,]+, ([^)]+)px\)/);
        return match ? Number.parseFloat(match[ 1 ]!) : 0;
      };

      const y0 = getY(style0);
      const y1 = getY(style1);

      const diff = Math.abs(y1 - y0);

      // With 1:1 rendering, items should be exactly itemSize apart in DU
      expect(diff).toBeCloseTo(itemSize, 0);
    });

    it('emulates touch scroll when scaling is active', async () => {
      const itemSize = 250;
      // Total height = 100,000 * 250 = 25,000,000 (> 10,000,000)
      const rowCount = 100000;
      const massiveItems = Array.from({ length: rowCount }, (_, i) => ({ id: i }));

      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize,
          items: massiveItems,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      expect(vs.scaleY).toBeGreaterThan(1);

      const container = wrapper.find('.virtual-scroll-container');
      const containerEl = container.element as HTMLElement;

      // Initial scroll is 0
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);

      // Trigger pointerdown
      containerEl.dispatchEvent(new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 500,
        pointerId: 1,
        pointerType: 'touch',
        button: 0,
        bubbles: true,
      }));

      // Trigger pointermove (drag up 100px)
      containerEl.dispatchEvent(new PointerEvent('pointermove', {
        clientX: 0,
        clientY: 400,
        pointerId: 1,
        pointerType: 'touch',
        bubbles: true,
      }));

      await vi.advanceTimersToNextFrame();
      // Should have scrolled by 100px (1:1 logical feel)
      expect(vs.scrollDetails.scrollOffset.y).toBeCloseTo(100, 0);

      // Trigger pointerup
      containerEl.dispatchEvent(new PointerEvent('pointerup', {
        bubbles: true,
        pointerId: 1,
        pointerType: 'touch',
      }));
    });

    it('ignores pointer events when scaling is inactive', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      expect(vs.scaleY).toBe(1);

      const container = wrapper.find('.virtual-scroll-container');
      const containerEl = container.element as HTMLElement;

      const pointerDownEvent = new PointerEvent('pointerdown', { button: 0, bubbles: true, clientY: 500 });
      containerEl.dispatchEvent(pointerDownEvent);
      // isDragging should be false (private, but we can check if pointermove does anything)

      const scrollOffsetBefore = vs.scrollDetails.scrollOffset.y;
      containerEl.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientY: 400 }));
      expect(vs.scrollDetails.scrollOffset.y).toBe(scrollOffsetBefore);
    });

    it('ignores non-primary mouse button pointerdown', async () => {
      const massiveItems = Array.from({ length: 40001 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 250, items: massiveItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      expect(vs.scaleY).toBeGreaterThan(1);

      const container = wrapper.find('.virtual-scroll-container');
      const containerEl = container.element as HTMLElement;

      const pointerDownEvent = new PointerEvent('pointerdown', { button: 1, bubbles: true, clientY: 500, pointerType: 'mouse' });
      containerEl.dispatchEvent(pointerDownEvent);

      const scrollOffsetBefore = vs.scrollDetails.scrollOffset.y;
      containerEl.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientY: 400 }));
      expect(vs.scrollDetails.scrollOffset.y).toBe(scrollOffsetBefore);
    });

    it('ignores pointermove and pointerup when not dragging', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      const containerEl = container.element as HTMLElement;

      const pointerMoveEvent = new PointerEvent('pointermove', { bubbles: true, clientY: 400 });
      containerEl.dispatchEvent(pointerMoveEvent);
      // No crash, nothing happens

      const pointerUpEvent = new PointerEvent('pointerup', { bubbles: true });
      containerEl.dispatchEvent(pointerUpEvent);
      // No crash
    });
  });

  describe('virtualScrollbar', () => {
    it('scrolls horizontally with SHIFT + MouseWheel when scaling is active', async () => {
      const massiveColCount = 200000; // 200,000 * 100 = 20,000,000 > BROWSER_MAX_SIZE (10,000,000)
      const massiveItems = Array.from({ length: 10 }, (_, i) => ({ id: i })); // enough items
      const wrapper = mount(VirtualScroll, {
        props: {
          columnCount: massiveColCount,
          columnWidth: 100,
          direction: 'both',
          itemSize: 50,
          items: massiveItems,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      expect(vs.scaleX).toBeGreaterThan(1);

      // Initial scroll is 0,0
      expect(vs.scrollDetails.scrollOffset.x).toBe(0);
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);

      // Trigger wheel with shiftKey
      const wheelEvent = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaX: 0,
        deltaY: 100,
        shiftKey: true,
      });
      wrapper.find('.virtual-scroll-container').element.dispatchEvent(wheelEvent);

      await nextTick();

      // Should have scrolled horizontally (deltaY becomes deltaX because of shiftKey)
      // and it should be 1:1 logically
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(100, 0);
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);
    });

    it('updates thumb size when total size changes', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: Array.from({ length: 20 }, (_, i) => ({ id: i })), // 20 * 50 = 1000. viewport 500. ratio 0.5.
          virtualScrollbar: true,
        },
      });

      await nextTick();
      await nextTick();

      const verticalThumb = wrapper.find('.virtual-scroll-scrollbar-container .virtual-scrollbar-thumb--vertical');
      expect(verticalThumb.exists()).toBe(true);

      // viewport 500, total 1000 => 50%
      expect((verticalThumb.element as HTMLElement).style.blockSize).toBe('50%');

      // Increase items
      await wrapper.setProps({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })), // 100 * 50 = 5000. viewport 500. ratio 0.1.
      });

      await nextTick();
      await nextTick();
      await nextTick();

      // ratio 0.1 => 10%
      expect((verticalThumb.element as HTMLElement).style.blockSize).toBe('10%');

      // Increase items even more to hit minimum
      await wrapper.setProps({
        items: Array.from({ length: 1000 }, (_, i) => ({ id: i })), // 1000 * 50 = 50000. viewport 500. ratio 0.01.
      });

      await nextTick();
      await nextTick();
      await nextTick();

      // minThumbSize 20, viewport 500 => 4%
      expect((verticalThumb.element as HTMLElement).style.blockSize).toBe('4%');
    });

    it('scrolls when clicking on vertical scrollbar track', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: Array.from({ length: 100 }, (_, i) => ({ id: i })), // 5000px total
          virtualScrollbar: true,
        },
      });

      await nextTick();
      await nextTick();

      const track = wrapper.find('.virtual-scrollbar-track--vertical');
      expect(track.exists()).toBe(true);

      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        left: 490,
        width: 10,
        height: 500,
        bottom: 500,
        right: 500,
      } as DOMRect);

      // Click at 250px (middle of track)
      await track.trigger('mousedown', {
        clientY: 250,
      });

      await nextTick();

      // Total 5000, viewport 500. middle click -> scroll to middle.
      // Virtual scrollable range = 4500. middle = 2250.
      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      expect(vs.scrollDetails.scrollOffset.y).toBeCloseTo(2250, 0);
    });

    it('scrolls to absolute end when clicking near the end of the vertical track', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems, virtualScrollbar: true },
      });
      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      const track = wrapper.find('.virtual-scrollbar-track--vertical');

      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 500,
        height: 500,
        left: 490,
        right: 500,
        top: 0,
        width: 10,
        x: 490,
        y: 0,
      } as DOMRect);

      // Click at the bottom
      await track.trigger('mousedown', { clientY: 500 });
      await nextTick();

      // Total range 5000 VU. Viewport 500. Max scrollable 4500.
      expect(vs.scrollDetails.scrollOffset.y).toBe(4500);
    });

    it('scrolls to absolute end when clicking near the end of the horizontal track', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 50, items: mockItems, virtualScrollbar: true },
      });
      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      const track = wrapper.find('.virtual-scrollbar-track--horizontal');

      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 500,
        height: 10,
        left: 0,
        right: 500,
        top: 490,
        width: 500,
        x: 0,
        y: 490,
      } as DOMRect);

      // Click at the right edge
      await track.trigger('mousedown', { clientX: 500 });
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.x).toBe(4500);
    });

    it('scrolls when clicking on horizontal scrollbar track', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          direction: 'horizontal',
          itemSize: 100,
          items: Array.from({ length: 100 }, (_, i) => ({ id: i })), // 10000px total
          virtualScrollbar: true,
        },
      });

      await nextTick();
      await nextTick();

      const track = wrapper.find('.virtual-scrollbar-track--horizontal');
      expect(track.exists()).toBe(true);

      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        top: 490,
        left: 0,
        width: 500,
        height: 10,
        bottom: 500,
        right: 500,
      } as DOMRect);

      // Click at 250px (middle of track)
      await track.trigger('mousedown', {
        clientX: 250,
      });

      await nextTick();

      // Total 10000, viewport 500. middle click -> scroll to middle.
      // Virtual scrollable range = 9500. middle = 4750.
      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(4750, 0);
    });

    it('calls internal scrollToOffset with Infinity when scrollbar reaches the end', async () => {
      let capturedCallback: ((offset: number) => void) | undefined;
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems, virtualScrollbar: true },
        slots: {
          scrollbar: (slotProps: ScrollbarSlotProps) => {
            if (slotProps.scrollbarProps.axis === 'vertical') {
              capturedCallback = slotProps.scrollbarProps.scrollToOffset;
            }
            return h('div', { class: 'captured-scrollbar' });
          },
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // Trigger ResizeObserver for viewport
      triggerResize(wrapper.element as HTMLElement, 500, 500);
      await nextTick();
      await nextTick();

      expect(vs.isHydrated).toBe(true);
      expect(wrapper.find('.captured-scrollbar').exists()).toBe(true);
      expect(typeof capturedCallback).toBe('function');

      // Max scrollable range = 5000 - 500 = 4500.
      capturedCallback!(4500);
      await nextTick();
      await nextTick();

      // Should be at the end
      expect(vs.scrollDetails.scrollOffset.y).toBe(4500);
    });

    it('does not show horizontal scrollbar if items fit', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          direction: 'horizontal',
          itemSize: 100,
          items: Array.from({ length: 2 }, (_, i) => ({ id: i })), // 200px total < 500px viewport
          virtualScrollbar: true,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      expect(vs.scrollbarPropsHorizontal).toBeNull();
    });
  });

  describe('lifecycle and props', () => {
    it('unmounts cleanly', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
        },
      });
      await nextTick();
      wrapper.unmount();
      // No errors should be thrown
    });

    it('handles hostRef change', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          containerTag: 'div',
        },
      });
      await nextTick();
      await wrapper.setProps({ containerTag: 'section' });
      await nextTick();
      // Should have unobserved old and observed new
    });
  });

  describe('large scale rendering boundaries', () => {
    const rowHeight = 200;
    const rowCount = 100000; // 20,000,000px
    const massiveItems = Array.from({ length: rowCount }, (_, i) => ({ id: i }));
    const viewportHeight = 500;

    const variants = [
      { name: 'plain', props: {} },
      { name: 'sticky header', props: { stickyHeader: true }, hasHeader: true },
      { name: 'sticky footer', props: { stickyFooter: true }, hasFooter: true },
      { name: 'both sticky', props: { stickyHeader: true, stickyFooter: true }, hasHeader: true, hasFooter: true },
      { name: 'plain with gap', props: {} },
      { name: 'sticky header with gap', props: { stickyHeader: true, gap: 50 }, hasHeader: true },
      { name: 'sticky footer with gap', props: { stickyFooter: true, gap: 50 }, hasFooter: true },
      { name: 'both sticky with gap', props: { stickyHeader: true, stickyFooter: true, gap: 50 }, hasHeader: true, hasFooter: true },
    ];

    for (const variant of variants) {
      describe(variant.name, () => {
        it('renders last items when scrolled to end manually', async () => {
          const wrapper = mount(VirtualScroll, {
            props: {
              items: massiveItems,
              itemSize: rowHeight,
              ...variant.props,
            },
            slots: {
              ...(variant.hasHeader ? { header: '<div style="height: 50px">Header</div>' } : {}),
              ...(variant.hasFooter ? { footer: '<div style="height: 50px">Footer</div>' } : {}),
            },
          });

          await nextTick();
          await nextTick();

          const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
          const container = wrapper.find('.virtual-scroll-container');

          // Scroll to physical end
          const totalRUHeight = vs.scrollDetails.totalSize.height;
          const maxRUOffset = totalRUHeight - vs.scrollDetails.viewportSize.height;
          const maxScroll = virtualToDisplay(maxRUOffset, vs.componentOffset.y, vs.scaleY);
          Object.defineProperty(container.element, 'scrollTop', { configurable: true, value: maxScroll });
          await container.trigger('scroll');

          await nextTick();
          await nextTick();

          const renderedIndices = vs.scrollDetails.items.map((i) => i.index);
          expect(renderedIndices).toContain(rowCount - 1);
          expect(renderedIndices).toContain(rowCount - 2);

          const lastItem = vs.scrollDetails.items.find((i) => i.index === rowCount - 1)!;
          // In RU, the last item's bottom should align with viewport bottom
          expect(lastItem.originalY + lastItem.size.height).toBeCloseTo(vs.scrollDetails.scrollOffset.y + viewportHeight, 0);
          expect(vs.scrollDetails.scrollOffset.y + viewportHeight).toBeCloseTo(totalRUHeight, 0);

          wrapper.unmount();
        });

        it('renders last items when END key is pressed', async () => {
          const wrapper = mount(VirtualScroll, {
            props: {
              items: massiveItems,
              itemSize: rowHeight,
              ...variant.props,
            },
            slots: {
              ...(variant.hasHeader ? { header: '<div style="height: 50px">Header</div>' } : {}),
              ...(variant.hasFooter ? { footer: '<div style="height: 50px">Footer</div>' } : {}),
            },
          });

          await nextTick();
          await nextTick();

          const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
          const container = wrapper.find('.virtual-scroll-container');

          await container.trigger('keydown', { key: 'End' });

          await nextTick();
          await nextTick();

          const renderedIndices = vs.scrollDetails.items.map((i) => i.index);
          expect(renderedIndices).toContain(rowCount - 1);

          const lastItem = vs.scrollDetails.items.find((i) => i.index === rowCount - 1)!;
          expect(lastItem.originalY + lastItem.size.height).toBeCloseTo(vs.scrollDetails.scrollOffset.y + viewportHeight, 0);

          wrapper.unmount();
        });

        it('renders first items when HOME key is pressed after being at end', async () => {
          const wrapper = mount(VirtualScroll, {
            props: {
              items: massiveItems,
              itemSize: rowHeight,
              ...variant.props,
            },
            slots: {
              ...(variant.hasHeader ? { header: '<div style="height: 50px">Header</div>' } : {}),
              ...(variant.hasFooter ? { footer: '<div style="height: 50px">Footer</div>' } : {}),
            },
          });

          await nextTick();
          await nextTick();

          const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
          const container = wrapper.find('.virtual-scroll-container');

          // First go to end
          vs.scrollToIndex(rowCount - 1, null, { align: 'end', behavior: 'auto' });
          await nextTick();
          await nextTick();

          // Then press Home
          await container.trigger('keydown', { key: 'Home' });
          await nextTick();
          await nextTick();

          const renderedIndices = vs.scrollDetails.items.map((i) => i.index);
          expect(renderedIndices).toContain(0);
          expect(renderedIndices).toContain(1);
          expect(vs.scrollDetails.scrollOffset.y).toBe(0);

          wrapper.unmount();
        });

        it('renders correct items when scrollbar is at boundaries', async () => {
          const wrapper = mount(VirtualScroll, {
            props: {
              items: massiveItems,
              itemSize: rowHeight,
              virtualScrollbar: true,
              ...variant.props,
            },
            slots: {
              ...(variant.hasHeader ? { header: '<div style="height: 50px">Header</div>' } : {}),
              ...(variant.hasFooter ? { footer: '<div style="height: 50px">Footer</div>' } : {}),
            },
          });

          await nextTick();
          await nextTick();

          const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;

          // Simulate scrollbar at end
          // For virtual scrollbars, they use displayScrollOffset
          const maxDisplayOffset = vs.renderedHeight - vs.scrollDetails.displayViewportSize.height;
          vs.scrollToOffset(null, displayToVirtual(maxDisplayOffset, vs.componentOffset.y, vs.scaleY));

          await nextTick();
          await nextTick();

          expect(vs.scrollDetails.items.map((i) => i.index)).toContain(rowCount - 1);

          // Scrollbar at start
          vs.scrollToOffset(null, 0);
          await nextTick();
          await nextTick();

          expect(vs.scrollDetails.items.map((i) => i.index)).toContain(0);
          expect(vs.scrollDetails.scrollOffset.y).toBe(0);

          wrapper.unmount();
        });
      });
    }
  });

  describe('sticky header and arrow navigation', () => {
    it('scrolls only one item with ArrowDown when sticky header is visible', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          bufferAfter: 0,
          bufferBefore: 0,
          itemSize: 50,
          items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
          stickyHeader: true,
        },
        slots: {
          header: () => h('div', { class: 'header' }, 'Header'),
        },
      });
      await nextTick();

      const header = wrapper.find('.virtual-scroll-header');
      // Mock header height to 100px
      Object.defineProperty(header.element, 'offsetHeight', { configurable: true, value: 100 });
      // Trigger ResizeObserver callback
      triggerResize(header.element, 500, 100);

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      const container = wrapper.find('.virtual-scroll-container');

      // Viewport 500. Sticky Header 100.
      // Items start at 100 VU.
      // Item 7 ends at 100 + 8 * 50 = 500 VU.
      // So currentEndIndex should be 7.

      expect(vs.scrollDetails.currentEndIndex).toBe(7);

      // Scroll so that some items are under the header
      // internalScrollY = 200 means relativeScrollY = 100 (item 0, 1 hidden under header)
      vs.scrollToOffset(null, 200);
      await nextTick();
      await nextTick();

      // Viewport 200-700. Header at 200-300. Usable 300-700.
      // Items start at 100.
      // Item 0: 100-150. Item 1: 150-200. Item 2: 200-250. Item 3: 250-300.
      // Item 4: 300-350 (first item below header).
      // currentIndex should be 4.
      expect(vs.scrollDetails.currentIndex).toBe(4);

      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await nextTick();

      // currentEndIndex was item 11 (200 + 500 - 1 = 699 VU -> 11).
      // Item 11 is at 650-700 VU.
      // ArrowDown should scroll so item 12 is at the bottom.
      // Item 12 ends at 750 VU.
      // internalScrollY = 750 - 500 = 250.
      expect(vs.scrollDetails.scrollOffset.y).toBe(250);
    });
  });

  describe('items length change', () => {
    it('clamps scroll position when items count decreases (with scaling)', async () => {
      // Use large itemSize to trigger scaling with fewer items
      // BROWSER_MAX_SIZE = 10,000,000. 11,000 items * 1000 = 11,000,000.
      const items = ref(Array.from({ length: 11000 }, (_, i) => ({ id: i })));
      const wrapper = mount({
        components: { VirtualScroll },
        setup() {
          return { items };
        },
        template: '<VirtualScroll :items="items" :item-size="1000" style="height: 500px" />',
      });
      await nextTick();
      await nextTick();
      const vs = wrapper.findComponent(VirtualScroll as unknown as VueWrapper).vm as VirtualScrollInstance<{ id: number; }>;

      // Scale should be around 1.1.
      expect(vs.scaleY).toBeGreaterThan(1);

      // Scroll to index 10,500 (10,500,000 VU)
      vs.scrollToIndex(10500, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(10500000);

      // Reduce items to 1,000. Total height = 1,000,000. Max scroll = 1,000,000 - 500 = 999,500.
      items.value = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
      await nextTick();
      await nextTick();

      // It should be clamped to the new max
      expect(vs.scrollDetails.scrollOffset.y).toBeLessThanOrEqual(1000000 - 500);
    });

    it('syncs display scroll position when total height changes (with scaling)', async () => {
      // Use large itemSize to trigger scaling
      const items = ref(Array.from({ length: 30000 }, (_, i) => ({ id: i }))); // 30M VU
      const wrapper = mount({
        components: { VirtualScroll },
        setup() {
          return { items };
        },
        template: '<VirtualScroll :items="items" :item-size="1000" style="height: 500px" />',
      });
      await nextTick();
      await nextTick();
      const vs = wrapper.findComponent(VirtualScroll as unknown as VueWrapper).vm as unknown as VirtualScrollInstance<{ id: number; }>;

      // Scroll to 10,000,000 VU
      vs.scrollToOffset(null, 10000000);
      await nextTick();
      await nextTick();

      const initialDisplayScroll = (wrapper.find('.virtual-scroll-container').element as HTMLElement).scrollTop;

      // Increase items. Total height = 40,000,000 VU.
      // scaleY will increase.
      // To maintain internalScrollY = 10,000,000, scrollTop must decrease.
      items.value = Array.from({ length: 40000 }, (_, i) => ({ id: i }));
      await nextTick();
      await nextTick();

      const newDisplayScroll = (wrapper.find('.virtual-scroll-container').element as HTMLElement).scrollTop;
      expect(newDisplayScroll).not.toBe(initialDisplayScroll);
      expect(vs.scrollDetails.scrollOffset.y).toBeCloseTo(10000000, 0);
    });

    it('updates pending scroll index when items are prepended in a dynamic list', async () => {
      const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: i })));
      const wrapper = mount({
        components: { VirtualScroll },
        setup() {
          return { items };
        },
        template: '<VirtualScroll :items="items" :item-size="50" restore-scroll-on-prepend style="height: 200px" />',
      });

      await nextTick();
      await nextTick();
      await nextTick();

      const vs = wrapper.findComponent(VirtualScroll as unknown as VueWrapper).vm as unknown as VirtualScrollInstance<{ id: number; }>;

      // Ensure it's hydrated
      expect(vs.isHydrated).toBe(true);

      // Set a pending scroll
      vs.scrollToIndex(10, null, { behavior: 'smooth', align: 'start' });
      await nextTick();
      await nextTick();

      // Prepend 2 items (100px)
      items.value = [ { id: -2 }, { id: -1 }, ...items.value ];

      // Wait for cycles
      for (let i = 0; i < 15; i++) {
        await nextTick();
      }

      expect(vs.scrollDetails.scrollOffset.y).toBeCloseTo(600, 0);
    });

    it('recycles items and maintains a small rendered item count', async () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScroll, {
        props: {
          items,
          itemSize: 50,
        },
      });

      await nextTick();
      await nextTick();

      // Viewport 500px, Item 50px -> 10 visible.
      // Default buffers: 5 before, 5 after.
      // At start: 10 visible + 5 after = 15 items.
      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(15);

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;

      // Scroll to middle
      vs.scrollToOffset(null, 5000, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      // In middle: 5 before + 10 visible + 5 after = 20 items.
      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(20);

      // Scroll to end (Total 50000px, max offset 49500px)
      vs.scrollToOffset(null, 49500, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      // At end: 5 before + 10 visible = 15 items.
      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(15);
    });
  });

  describe('pointer events and inertia', () => {
    it('handles pointer-based scrolling when scaling is active', async () => {
      const largeItems = Array.from({ length: 1000000 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: largeItems, // 50M pixels total height
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<unknown>;
      // BROWSER_MAX_SIZE is 10M. totalHeight is 50M.
      // scaleY should be (50M - 500) / (10M - 500) approx 5.
      expect(vs.scaleY).toBeGreaterThan(1);

      const container = wrapper.find('.virtual-scroll-container');

      // pointerdown
      container.element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 100, button: 0, pointerId: 1, bubbles: true }));

      // pointermove
      container.element.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, clientY: 50, pointerId: 1, bubbles: true }));
      await nextTick();
      vi.runAllTimers(); // process requestAnimationFrame
      await nextTick();

      // Dragged 50px up.
      expect(vs.scrollDetails.scrollOffset.y).toBe(50);

      // pointerup
      container.element.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 50, pointerId: 1, bubbles: true }));
      await nextTick();
    });
  });
});
