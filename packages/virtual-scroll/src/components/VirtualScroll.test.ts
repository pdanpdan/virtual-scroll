import type { ItemSlotProps, ScrollDetails } from '../types';

/* global ScrollToOptions, ResizeObserverCallback */
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';

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
    vi.clearAllMocks();
    observers.length = 0;
    Object.defineProperty(window, 'scrollX', { configurable: true, value: 0, writable: true });
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0, writable: true });
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
  });

  describe('basic Rendering', () => {
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
    });
  });

  describe('interactions', () => {
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

    describe('keyboard Navigation', () => {
      it('responds to Home and End keys in vertical mode', async () => {
        const wrapper = mount(VirtualScroll, {
          props: { itemSize: 50, items: mockItems },
        });
        await nextTick();
        const container = wrapper.find('.virtual-scroll-container');

        await container.trigger('keydown', { key: 'End' });
        await nextTick();
        // item 99 at 4950. end align -> 4950 - (500 - 50) = 4500.
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(4500);

        await container.trigger('keydown', { key: 'Home' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
      });

      it('responds to Arrows in vertical mode', async () => {
        const wrapper = mount(VirtualScroll, {
          props: { itemSize: 50, items: mockItems },
        });
        await nextTick();
        const container = wrapper.find('.virtual-scroll-container');

        await container.trigger('keydown', { key: 'ArrowDown' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(40); // DEFAULT_ITEM_SIZE

        await container.trigger('keydown', { key: 'ArrowUp' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
      });

      it('responds to PageUp and PageDown in vertical mode', async () => {
        const wrapper = mount(VirtualScroll, {
          props: { itemSize: 50, items: mockItems },
        });
        await nextTick();
        const container = wrapper.find('.virtual-scroll-container');

        await container.trigger('keydown', { key: 'PageDown' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(500);

        await container.trigger('keydown', { key: 'PageUp' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
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
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(9500);

        await container.trigger('keydown', { key: 'Home' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
      });

      it('responds to Arrows in horizontal mode', async () => {
        const wrapper = mount(VirtualScroll, {
          props: { direction: 'horizontal', itemSize: 100, items: mockItems },
        });
        await nextTick();
        const container = wrapper.find('.virtual-scroll-container');

        await container.trigger('keydown', { key: 'ArrowRight' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(40);

        await container.trigger('keydown', { key: 'ArrowLeft' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
      });

      it('responds to PageUp and PageDown in horizontal mode', async () => {
        const wrapper = mount(VirtualScroll, {
          props: { direction: 'horizontal', itemSize: 100, items: mockItems },
        });
        await nextTick();
        const container = wrapper.find('.virtual-scroll-container');

        await container.trigger('keydown', { key: 'PageDown' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(500);

        await container.trigger('keydown', { key: 'PageUp' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
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
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(4500);
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(500);

        await container.trigger('keydown', { key: 'Home' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
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
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(40);
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(40);

        await container.trigger('keydown', { key: 'ArrowUp' });
        await container.trigger('keydown', { key: 'ArrowLeft' });
        await nextTick();
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.y).toBe(0);
        expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
      });
    });
  });

  describe('dynamic Sizing', () => {
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

      const initialWidth = (wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.totalSize.width;
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
      const currentWidth = (wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.totalSize.width;
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
      expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);

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
      expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(0);
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
      (wrapper.vm as unknown as { scrollToIndex: (r: number, c: number, a: string) => void; }).scrollToIndex(50, 50, 'auto');
      await nextTick();
      await nextTick();

      // Initial scroll position (estimates)
      // itemX = 50 * 120 = 6000. itemWidth = 120. viewport = 500.
      // targetEnd = 6000 + 120 - 500 = 5620.
      expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(5620);

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

      expect((wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x).toBe(5830);

      // Check if it's fully visible
      const offset = (wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.scrollOffset.x;
      const viewportWidth = (wrapper.vm as unknown as { scrollDetails: ScrollDetails<MockItem>; }).scrollDetails.viewportSize.width;
      const itemX = 6180;
      const itemWidth = 150;

      expect(itemX).toBeGreaterThanOrEqual(offset);
      expect(itemX + itemWidth).toBeLessThanOrEqual(offset + viewportWidth);
    });
  });

  describe('sticky Items', () => {
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

  describe('ssr and Initial State', () => {
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

  describe('slots and Options', () => {
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
  });
});
