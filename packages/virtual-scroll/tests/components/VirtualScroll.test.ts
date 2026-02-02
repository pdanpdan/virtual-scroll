import type { ItemSlotProps, ScrollbarSlotProps, ScrollDetails, VirtualScrollInstance } from '../../src/types';
import type { VueWrapper } from '@vue/test-utils';
import type { DefineComponent } from 'vue';

/* global ScrollToOptions, ResizeObserverCallback */
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick, ref } from 'vue';

import VirtualScroll from '../../src/components/VirtualScroll.vue';
import { displayToVirtual, virtualToDisplay } from '../../src/utils/virtual-scroll-logic';

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
  this.dispatchEvent(new (this.ownerDocument?.defaultView?.Event || Event)('scroll'));
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

  describe('core rendering & lifecycle', () => {
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

    it('unmounts cleanly', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
        },
      });
      await nextTick();
      wrapper.unmount();
      // no errors should be thrown
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
      // should have unobserved old and observed new
    });

    it('stops active smooth scroll via stopProgrammaticScroll', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      vs.scrollToIndex(50, null, { behavior: 'smooth' });
      await nextTick();

      const posBefore = vs.scrollDetails.scrollOffset.y;
      vs.stopProgrammaticScroll();
      await nextTick();

      // Should not have moved significantly or at all from where it was stopped
      expect(vs.scrollDetails.scrollOffset.y).toBe(posBefore);
    });
  });

  describe('scrolling interaction', () => {
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
    it('responds to home and end keys in vertical mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(4500);

      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
    });

    it('responds to arrows in vertical mode', async () => {
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

    it('responds correctly to arrows in rtl mode', async () => {
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
      expect(vs.isRtl).toBe(true);

      const vsContainer = wrapper.find('.virtual-scroll-container');

      await vsContainer.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(100, 0);

      await vsContainer.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(0, 0);

      styleSpy.mockRestore();
    });

    it('aligns partially visible items correctly with arrows in rtl mode', async () => {
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

      vs.scrollToOffset(50, null);
      await nextTick();
      await nextTick();

      const vsContainer = wrapper.find('.virtual-scroll-container');

      await vsContainer.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(0, 0);

      await wrapper.setProps({ itemSize: 150 });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndIndex).toBe(3);

      await vsContainer.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(100, 0);

      styleSpy.mockRestore();
    });

    it('scrolls to next item with arrowleft when current item is already at the left edge (rtl)', async () => {
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

      vs.scrollToIndex(null, 4, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndColIndex).toBe(4);
      expect(vs.scrollDetails.scrollOffset.x).toBe(0);

      const containerEl = wrapper.find('.virtual-scroll-container');
      await containerEl.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.x).toBe(100);
      styleSpy.mockRestore();
    });

    it('scrolls to previous item with arrowup when current item is already at the top', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      vs.scrollToIndex(2, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(100);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowUp' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(50);
    });

    it('scrolls to next item with arrowright when current item is already at the right edge (ltr)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      vs.scrollToIndex(4, null, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndIndex).toBe(4);
      expect(vs.scrollDetails.scrollOffset.x).toBe(0);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.x).toBe(100);
    });

    it('scrolls to next item with arrowdown when current item is already at the bottom edge', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      vs.scrollToIndex(9, null, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndIndex).toBe(9);
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(50);
    });

    it('does not scroll with arrowdown when already at the very last item', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      vs.scrollToOffset(null, 4500, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndIndex).toBe(99);
      expect(vs.scrollDetails.scrollOffset.y).toBe(4500);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(4500);
    });

    it('does not scroll with arrowright when already at the very last item (horizontal ltr)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      vs.scrollToOffset(9500, null, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndColIndex).toBe(99);
      expect(vs.scrollDetails.scrollOffset.x).toBe(9500);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.x).toBe(9500);
    });

    it('does not scroll with arrowleft when already at the very last item (horizontal rtl)', async () => {
      const styleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        direction: 'rtl',
      } as CSSStyleDeclaration);

      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      vs.scrollToOffset(9500, null, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndColIndex).toBe(99);
      expect(vs.scrollDetails.scrollOffset.x).toBe(9500);

      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.x).toBe(9500);
      styleSpy.mockRestore();
    });

    it('responds to pageup and pagedown in vertical mode', async () => {
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

    it('responds to home and end keys in horizontal mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(9500);

      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
    });

    it('responds to arrows in horizontal mode', async () => {
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

    it('responds to pageup and pagedown in horizontal mode', async () => {
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

    it('disables smooth scroll for large distances (home/end)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Item ${ i }` })),
          container: window,
        },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      const scrollToSpy = vi.spyOn(window, 'scrollTo');

      await container.trigger('keydown', { key: 'End' });
      await nextTick();

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

    it('responds to home and end keys in grid mode', async () => {
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
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(4500);
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(500);

      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
    });

    it('responds to all arrows in grid mode', async () => {
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

    it('aligns items precisely with arrow keys', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 100,
          items: mockItems,
        },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');

      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.scrollToOffset(null, 50, { behavior: 'auto' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(50);

      await container.trigger('keydown', { key: 'ArrowUp' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);

      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(100);

      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(200);
    });

    it('aligns partially visible items at the bottom with arrow down', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // viewport 500. item 9 ends at 500.
      // scroll to 25. item 9 now ends at 525 (partially cut off).
      vs.scrollToOffset(null, 25);
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentEndIndex).toBe(10); // item 10 is at 500-550

      // item 10 is partially visible at bottom. ArrowDown should align it to end.
      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await nextTick();

      // item 10 ends at 550. viewport 500. targetEnd = 550 - 500 = 50.
      expect(vs.scrollDetails.scrollOffset.y).toBe(50);
    });

    it('aligns partially visible columns with arrowleft and arrowright in ltr', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { direction: 'horizontal', itemSize: 100, items: mockItems },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;

      // Viewport 500. Scroll to 50.
      // Item 0 (0-100) is partially visible at start.
      // Item 5 (500-600) is partially visible at end.
      vs.scrollToOffset(50, null);
      await nextTick();
      await nextTick();

      const container = wrapper.find('.virtual-scroll-container');

      // 1. ArrowLeft should align item 0 to start
      await container.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBe(0);

      // Reset
      vs.scrollToOffset(50, null);
      await nextTick();
      await nextTick();

      // 2. ArrowRight should align item 5 to end
      await container.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();
      // item 5 ends at 600. viewport 500. targetEnd = 600 - 500 = 100.
      expect(vs.scrollDetails.scrollOffset.x).toBe(100);
    });

    it('aligns partially visible columns with arrowleft and arrowright in rtl', async () => {
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

      // Viewport 500. Logical scroll 50.
      // Item 0 (0-100) is partially visible at logical START (Right edge).
      // Item 5 (500-600) is partially visible at logical END (Left edge).
      vs.scrollToOffset(50, null);
      await nextTick();
      await nextTick();

      const vsContainer = wrapper.find('.virtual-scroll-container');

      // 1. ArrowRight in RTL should align item 0 to logical START
      await vsContainer.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.x).toBe(0);

      // Reset
      vs.scrollToOffset(50, null);
      await nextTick();
      await nextTick();

      // 2. ArrowLeft in RTL should align item 5 to logical END
      await vsContainer.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      await nextTick();
      // item 5 ends at 600. viewport 500. targetEnd = 600 - 500 = 100.
      expect(vs.scrollDetails.scrollOffset.x).toBe(100);

      styleSpy.mockRestore();
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

  describe('dynamic sizing & measurements', () => {
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

      const row0 = wrapper.find('.virtual-scroll-item[data-index="0"]').element;
      const cell0 = row0.querySelector('.cell') as HTMLElement;
      expect(cell0).not.toBeNull();

      triggerResize(cell0, 0, 0);

      await nextTick();
      await nextTick();

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

      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);

      const row0 = wrapper.find('.virtual-scroll-item[data-index="0"]').element;
      const cells0 = Array.from(row0.querySelectorAll('.cell'));

      triggerResize(row0, 1000, 50);
      for (const cell of cells0) {
        triggerResize(cell, 110, 50);
      }

      await nextTick();
      await nextTick();

      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      Object.defineProperty(el, 'scrollTop', { configurable: true, value: 1000, writable: true });
      await container.trigger('scroll');

      await nextTick();
      await nextTick();

      const row20 = wrapper.find('.virtual-scroll-item[data-index="20"]').element;
      const cells20 = Array.from(row20.querySelectorAll('.cell'));

      for (const cell of cells20) {
        triggerResize(cell, 110.1, 50);
      }

      await nextTick();
      await nextTick();

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

      (wrapper.vm as { scrollToIndex: (r: number, c: number, a: string) => void; }).scrollToIndex(50, 50, 'auto');
      await nextTick();
      await nextTick();

      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(5620);

      const row45El = wrapper.find('.virtual-scroll-item[data-index="45"]').element;
      const cells45 = Array.from(row45El.querySelectorAll('.cell'));

      for (const cell of cells45) {
        triggerResize(cell, 150, 120);
      }

      await nextTick();
      await nextTick();
      await nextTick();

      await new Promise((resolve) => setTimeout(resolve, 300));
      await nextTick();

      expect((wrapper.vm as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(5830);
    });

    it('handles fallback measurement when borderboxsize is missing', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 0, // dynamic
        },
      });

      await nextTick();
      const item = wrapper.find('.virtual-scroll-item');

      Object.defineProperty(item.element, 'offsetWidth', { value: 500, configurable: true });
      Object.defineProperty(item.element, 'offsetHeight', { value: 60, configurable: true });

      triggerResize(item.element, 500, 60, false);

      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      expect(vs.getRowHeight(0)).toBe(60);
    });
  });

  describe('sticky elements', () => {
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

      Object.defineProperty(el, 'scrollTop', { configurable: true, value: 150, writable: true });
      await container.trigger('scroll');
      await nextTick();
      await nextTick();

      const item0 = wrapper.find('.virtual-scroll-item[data-index="0"]');
      const item1 = wrapper.find('.virtual-scroll-item[data-index="1"]');
      const item2 = wrapper.find('.virtual-scroll-item[data-index="2"]');

      expect(item2.classes()).toContain('virtual-scroll--sticky');
      expect(item1.classes()).not.toContain('virtual-scroll--sticky');
      expect(item0.classes()).not.toContain('virtual-scroll--sticky');
    });

    it('scrolls only one item with arrowdown when sticky header is visible', async () => {
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
      Object.defineProperty(header.element, 'offsetHeight', { configurable: true, value: 100 });
      triggerResize(header.element, 500, 100);

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      const container = wrapper.find('.virtual-scroll-container');

      expect(vs.scrollDetails.currentEndIndex).toBe(7);

      vs.scrollToOffset(null, 200);
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.currentIndex).toBe(4);

      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(250);
    });
  });

  describe('scaling & massive lists', () => {
    it('items should not overlap when scaling is active', async () => {
      const itemSize = 1000;
      const rowCount = 11000;
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

      const getY = (style: string) => {
        const match = style.match(/translate\([^,]+, ([^)]+)px\)/);
        return match ? Number.parseFloat(match[ 1 ]!) : 0;
      };

      const y0 = getY(style0);
      const y1 = getY(style1);

      const diff = Math.abs(y1 - y0);
      expect(diff).toBeCloseTo(itemSize, 0);
    });

    it('emulates touch scroll when scaling is active', async () => {
      const itemSize = 1000;
      const rowCount = 11000;
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

      expect(vs.scrollDetails.scrollOffset.y).toBe(0);

      containerEl.dispatchEvent(new PointerEvent('pointerdown', {
        clientX: 0,
        clientY: 500,
        pointerId: 1,
        pointerType: 'touch',
        button: 0,
        bubbles: true,
      }));

      containerEl.dispatchEvent(new PointerEvent('pointermove', {
        clientX: 0,
        clientY: 400,
        pointerId: 1,
        pointerType: 'touch',
        bubbles: true,
      }));

      await vi.advanceTimersToNextFrame();
      expect(vs.scrollDetails.scrollOffset.y).toBeCloseTo(100, 0);

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

      const pointerUpEvent = new PointerEvent('pointerup', { bubbles: true });
      containerEl.dispatchEvent(pointerUpEvent);
    });

    it('handles pointer-based scrolling when scaling is active', async () => {
      const items = Array.from({ length: 11000 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 1000, // 11M VU
          items,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<unknown>;
      expect(vs.scaleY).toBeGreaterThan(1);

      const container = wrapper.find('.virtual-scroll-container');

      container.element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 100, button: 0, pointerId: 1, bubbles: true }));
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

    it('implements inertia scrolling with friction and cancellation', async () => {
      const items = Array.from({ length: 11000 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 1000,
          items,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<unknown>;
      const container = wrapper.find('.virtual-scroll-container');

      // 1. Start inertia by swiping quickly
      container.element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 400, button: 0, pointerId: 1, bubbles: true }));
      container.element.dispatchEvent(new PointerEvent('pointermove', { clientX: 0, clientY: 300, pointerId: 1, bubbles: true }));
      await nextTick();

      // Swipe fast
      container.element.dispatchEvent(new PointerEvent('pointerup', { clientX: 0, clientY: 200, pointerId: 1, bubbles: true }));
      await nextTick();

      // 2. Verify it continues to scroll
      vi.advanceTimersByTime(16); // step 1
      await nextTick();
      const pos1 = vs.scrollDetails.scrollOffset.y;
      expect(pos1).toBeGreaterThan(200);

      vi.advanceTimersByTime(16); // step 2
      await nextTick();
      const pos2 = vs.scrollDetails.scrollOffset.y;
      expect(pos2).toBeGreaterThan(pos1);

      // 3. Stop inertia via stopProgrammaticScroll
      vs.stopProgrammaticScroll();
      vi.advanceTimersByTime(16);
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(pos2);
    });

    it('prevents cross-axis drift during inertia', async () => {
      const items = Array.from({ length: 11000 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 1000,
          columnCount: 11000,
          columnWidth: 1000,
          direction: 'both',
          items,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<unknown>;
      const container = wrapper.find('.virtual-scroll-container');

      // Swipe horizontally with very small vertical component
      container.element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 400, clientY: 100, button: 0, pointerId: 1, bubbles: true }));
      container.element.dispatchEvent(new PointerEvent('pointermove', { clientX: 300, clientY: 98, pointerId: 1, bubbles: true }));
      await nextTick();
      vi.runAllTimers();
      await nextTick();

      container.element.dispatchEvent(new PointerEvent('pointerup', { clientX: 200, clientY: 98, pointerId: 1, bubbles: true }));
      await nextTick();

      // Velocity Y should have been zeroed because X velocity is much higher
      vi.advanceTimersByTime(16);
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.x).toBeGreaterThan(200);
      expect(vs.scrollDetails.scrollOffset.y).toBe(2); // Initial deltaY was 2 (100 -> 98). No more movement.
    });

    describe('large scale rendering boundaries', () => {
      const rowHeight = 1000;
      const rowCount = 11000; // 11,000,000px
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
            expect(lastItem.originalY + lastItem.size.height).toBeCloseTo(vs.scrollDetails.scrollOffset.y + viewportHeight, 0);
            expect(vs.scrollDetails.scrollOffset.y + viewportHeight).toBeCloseTo(totalRUHeight, 0);

            wrapper.unmount();
          });

          it('renders last items when end key is pressed', async () => {
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

          it('renders first items when home key is pressed after being at end', async () => {
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

            vs.scrollToIndex(rowCount - 1, null, { align: 'end', behavior: 'auto' });
            await nextTick();
            await nextTick();

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

            const maxDisplayOffset = vs.renderedHeight - vs.scrollDetails.displayViewportSize.height;
            vs.scrollToOffset(null, displayToVirtual(maxDisplayOffset, vs.componentOffset.y, vs.scaleY));

            await nextTick();
            await nextTick();

            expect(vs.scrollDetails.items.map((i) => i.index)).toContain(rowCount - 1);

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
  });

  describe('virtual scrollbars', () => {
    it('scrolls horizontally with shift + mousewheel when scaling is active', async () => {
      const massiveColCount = 200000;
      const massiveItems = Array.from({ length: 10 }, (_, i) => ({ id: i }));
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

      expect(vs.scrollDetails.scrollOffset.x).toBe(0);
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);

      const wheelEvent = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaX: 0,
        deltaY: 100,
        shiftKey: true,
      });
      wrapper.find('.virtual-scroll-container').element.dispatchEvent(wheelEvent);

      await nextTick();

      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(100, 0);
      expect(vs.scrollDetails.scrollOffset.y).toBe(0);
    });

    it('updates thumb size when total size changes', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: Array.from({ length: 20 }, (_, i) => ({ id: i })),
          virtualScrollbar: true,
        },
      });

      await nextTick();
      await nextTick();

      const verticalThumb = wrapper.find('.virtual-scroll-scrollbar-container .virtual-scrollbar-thumb--vertical');
      expect(verticalThumb.exists()).toBe(true);
      expect((verticalThumb.element as HTMLElement).style.blockSize).toBe('50%');

      await wrapper.setProps({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
      });

      await nextTick();
      await nextTick();
      await nextTick();

      expect((verticalThumb.element as HTMLElement).style.blockSize).toBe('10%');

      await wrapper.setProps({
        items: Array.from({ length: 1000 }, (_, i) => ({ id: i })),
      });

      await nextTick();
      await nextTick();
      await nextTick();

      expect((verticalThumb.element as HTMLElement).style.blockSize).toBe('6.4%');
    });

    it('scrolls when clicking on vertical scrollbar track', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
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

      await track.trigger('mousedown', {
        clientY: 250,
      });

      await nextTick();

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

      await track.trigger('mousedown', { clientY: 500 });
      await nextTick();

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

      await track.trigger('mousedown', { clientX: 500 });
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.x).toBe(4500);
    });

    it('scrolls when clicking on horizontal scrollbar track', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          direction: 'horizontal',
          itemSize: 100,
          items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
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

      await track.trigger('mousedown', {
        clientX: 250,
      });

      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      expect(vs.scrollDetails.scrollOffset.x).toBeCloseTo(4750, 0);
    });

    it('calls internal scrolltooffset with infinity when scrollbar reaches the end', async () => {
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

      triggerResize(wrapper.element as HTMLElement, 500, 500);
      await nextTick();
      await nextTick();

      expect(vs.isHydrated).toBe(true);
      expect(wrapper.find('.captured-scrollbar').exists()).toBe(true);
      expect(typeof capturedCallback).toBe('function');

      capturedCallback!(4500);
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(4500);
    });

    it('does not show horizontal scrollbar if items fit', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          direction: 'horizontal',
          itemSize: 100,
          items: Array.from({ length: 2 }, (_, i) => ({ id: i })),
          virtualScrollbar: true,
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;
      expect(vs.scrollbarPropsHorizontal).toBeNull();
    });

    it('forces virtual scrollbars when virtualscrollbar prop is true', async () => {
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
  });

  describe('ssr & hydration', () => {
    it('renders ssr range if provided', async () => {
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
      await nextTick();
      await nextTick();
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.text()).toContain('Item 50');
    });

    it('renders gaps correctly during initial mount/ssr', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          direction: 'both',
          items: mockItems.slice(0, 10),
          itemSize: 50,
          columnCount: 5,
          columnWidth: 100,
          gap: 10,
          columnGap: 20,
        },
      });

      // Check styles immediately after mount (before hydration)
      const vsWrapper = wrapper.find('.virtual-scroll-wrapper');
      const vsWrapperStyle = (vsWrapper.element as HTMLElement).style;
      expect(vsWrapperStyle.rowGap).toBe('10px');
      expect(vsWrapperStyle.columnGap).toBe('20px');

      const vsItem = wrapper.find('.virtual-scroll-item');
      const vsItemStyle = (vsItem.element as HTMLElement).style;
      expect(vsItemStyle.columnGap).toBe('20px');
    });
  });

  describe('slots & custom content', () => {
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

    it('uses correct html tags', () => {
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

      const headerEl = wrapper.find('.virtual-scroll-header').element as HTMLElement;
      const footerEl = wrapper.find('.virtual-scroll-footer').element as HTMLElement;

      Object.defineProperty(headerEl, 'offsetHeight', { configurable: true, value: 100 });
      Object.defineProperty(footerEl, 'offsetHeight', { configurable: true, value: 100 });

      triggerResize(headerEl, 500, 100);
      triggerResize(footerEl, 500, 100);

      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.totalSize.height).toBe(700);

      await wrapper.setProps({ showHeader: false });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.totalSize.height).toBe(600);

      await wrapper.setProps({ showFooter: false });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.totalSize.height).toBe(500);
    });
  });

  describe('dynamic list changes', () => {
    it('clamps scroll position when items count decreases (with scaling)', async () => {
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

      expect(vs.scaleY).toBeGreaterThan(1);

      vs.scrollToIndex(10500, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBe(10500000);

      items.value = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
      await nextTick();
      await nextTick();

      expect(vs.scrollDetails.scrollOffset.y).toBeLessThanOrEqual(1000000 - 500);
    });

    it('syncs display scroll position when total height changes (with scaling)', async () => {
      const items = ref(Array.from({ length: 30000 }, (_, i) => ({ id: i })));
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

      vs.scrollToOffset(null, 10000000);
      await nextTick();
      await nextTick();

      const initialDisplayScroll = (wrapper.find('.virtual-scroll-container').element as HTMLElement).scrollTop;

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

      expect(vs.isHydrated).toBe(true);

      vs.scrollToIndex(10, null, { behavior: 'smooth', align: 'start' });
      await nextTick();
      await nextTick();

      items.value = [ { id: -2 }, { id: -1 }, ...items.value ];

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

      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(15);

      const vs = wrapper.vm as unknown as VirtualScrollInstance<{ id: number; }>;

      vs.scrollToOffset(null, 5000, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(20);

      vs.scrollToOffset(null, 49500, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      expect(wrapper.findAll('.virtual-scroll-item').length).toBe(15);
    });

    describe('table virtualization', () => {
      it('correctly virtualizes when using table tags and constrained height', async () => {
        const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
        const wrapper = mount(VirtualScroll, {
          props: {
            items,
            itemSize: 40,
            containerTag: 'table',
            wrapperTag: 'tbody',
            itemTag: 'tr',
            style: { height: '400px', display: 'block' },
          },
          slots: {
            item: '<td class="item">{{ index }}</td>',
          },
        });

        await nextTick();
        // Since it's mounted in JSDOM, we need to mock clientHeight/clientWidth if they are 0
        const el = wrapper.element as HTMLElement;
        Object.defineProperty(el, 'clientHeight', { value: 400, configurable: true });
        Object.defineProperty(el, 'clientWidth', { value: 800, configurable: true });

        // Trigger resize observation
        const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
        vs.refresh();
        await nextTick();
        await nextTick();

        // 400px height / 40px itemSize = 10 items + buffer
        const renderedCount = wrapper.findAll('tr.virtual-scroll-item').length;
        expect(renderedCount).toBeLessThan(30);
        expect(renderedCount).toBeGreaterThan(10);
      });
    });
  });
});
