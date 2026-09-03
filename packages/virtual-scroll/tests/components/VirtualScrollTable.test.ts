/* global ScrollToOptions, ResizeObserverCallback */
import type { ScrollbarSlotProps, VirtualScrollInstance, VirtualScrollTableInstance } from '../../src/types';

import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';

import VirtualScrollTable from '../../src/components/VirtualScrollTable.vue';

// --- Mocks ---

Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { configurable: true, value: 500 });
Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, value: 500 });

HTMLElement.prototype.scrollTo = function (this: HTMLElement, options?: number | ScrollToOptions, y?: number) {
  if (typeof options === 'object') {
    if (options.top !== undefined) {
      Object.defineProperty(this, 'scrollTop', { configurable: true, value: options.top, writable: true });
    }
    if (options.left !== undefined) {
      Object.defineProperty(this, 'scrollLeft', { configurable: true, value: options.left, writable: true });
    }
  } else if (typeof options === 'number' && typeof y === 'number') {
    Object.defineProperty(this, 'scrollLeft', { configurable: true, value: options, writable: true });
    Object.defineProperty(this, 'scrollTop', { configurable: true, value: y, writable: true });
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

HTMLElement.prototype.scrollTo = vi.fn().mockImplementation(function (this: HTMLElement, options: ScrollToOptions) {
  if (options.left !== undefined) {
    this.scrollLeft = options.left;
  }
  if (options.top !== undefined) {
    this.scrollTop = options.top;
  }
  this.dispatchEvent(new Event('scroll'));
});

// --- Tests ---

interface MockItem {
  id: number;
  label: string;
}

describe('virtualScrollTable', () => {
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

  describe('table virtualization', () => {
    it('renders table rows in real flow with spacer rows when flowTable is enabled', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          items,
          itemSize: 50,
        },
        slots: {
          item: '<td class="cell">{{ index }}</td>',
        },
      });
      await nextTick();
      await nextTick();

      const el = wrapper.element as HTMLElement;
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 800, configurable: true });
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.refresh();
      await nextTick();
      await nextTick();

      expect(wrapper.find('table').classes()).toContain('virtual-scroll--flow');
      const rows = wrapper.findAll('.virtual-scroll-item');
      expect(rows.length).toBeGreaterThan(0);
      for (const row of rows) {
        expect(row.attributes('style') ?? '').not.toContain('transform');
      }

      // Scroll to the middle: the leading spacer starts at the first rendered
      // (buffered) row above the viewport, and spacer + rows + spacer always
      // add up to the full content height.
      vs.scrollToOffset(null, 2500, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      const spacers = wrapper.findAll('.virtual-scroll-spacer--flow');
      expect(spacers.length).toBe(2);
      const tdHeight = (spacer: typeof spacers[ number ]) => {
        const style = spacer.find('td')!.attributes('style') ?? '';
        const match = /block-size:\s*([\d.]+)px/.exec(style);
        return match ? Number.parseFloat(match[ 1 ]!) : 0;
      };
      const top = tdHeight(spacers[ 0 ]!);
      const bottom = tdHeight(spacers[ 1 ]!);
      expect(top).toBeLessThan(2500); // 2500 - bufferBefore * 50
      const visibleHeights = wrapper.findAll('.virtual-scroll-item').length * 50;
      expect(top + bottom + visibleHeights).toBeCloseTo(5000, 0);
      wrapper.unmount();

      // Empty datasets render no flow spacers.
      const empty = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          items: [],
          itemSize: 50,
        },
      });
      await nextTick();
      await nextTick();
      expect(empty.findAll('.virtual-scroll-spacer--flow').length).toBe(0);
      empty.unmount();
    });

    it('keeps flow geometry exact with a measured sticky header slot', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          stickyHeader: true,
          items,
          itemSize: 50,
        },
        slots: {
          header: '<tr><th>H</th></tr>',
          item: '<td class="cell">{{ index }}</td>',
        },
      });
      await nextTick();
      await nextTick();

      const el = wrapper.element as HTMLElement;
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 800, configurable: true });
      const header = wrapper.find('thead');
      Object.defineProperty(header.element, 'offsetHeight', { configurable: true, value: 100 });
      triggerResize(header.element, 800, 100);
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.refresh();
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.find('table').classes()).toContain('virtual-scroll--flow');

      vs.scrollToOffset(null, 2500, { behavior: 'auto' });
      await nextTick();
      await nextTick();

      const spacers = wrapper.findAll('.virtual-scroll-spacer--flow');
      expect(spacers.length).toBe(2);
      const tdHeight = (spacer: typeof spacers[ number ]) => {
        const style = spacer.find('td')!.attributes('style') ?? '';
        const match = /block-size:\s*([\d.]+)px/.exec(style);
        return match ? Number.parseFloat(match[ 1 ]!) : 0;
      };
        // Header extent is normalized out: tbody content (spacers + rows)
        // still equals the plain item content height of 100 * 50.
      const top = tdHeight(spacers[ 0 ]!);
      const bottom = tdHeight(spacers[ 1 ]!);
      const rowHeights = wrapper.findAll('.virtual-scroll-item').length * 50;
      expect(top + bottom + rowHeights).toBeCloseTo(5000, 0);
      wrapper.unmount();
    });

    it('normalizes a measured footer slot in flow geometry', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          stickyFooter: true,
          items,
          itemSize: 50,
        },
        slots: {
          footer: '<tr><td>F</td></tr>',
          item: '<td class="cell">{{ index }}</td>',
        },
      });
      await nextTick();
      await nextTick();
      const el = wrapper.element as HTMLElement;
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 800, configurable: true });
      const footer = wrapper.find('tfoot');
      Object.defineProperty(footer.element, 'offsetHeight', { configurable: true, value: 30 });
      triggerResize(footer.element, 800, 30);
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.refresh();
      await nextTick();
      await nextTick();
      await nextTick();
      expect(wrapper.find('table').classes()).toContain('virtual-scroll--flow');

      vs.scrollToOffset(null, 2500, { behavior: 'auto' });
      await nextTick();
      await nextTick();
      const spacers = wrapper.findAll('.virtual-scroll-spacer--flow');
      expect(spacers.length).toBe(2);
      const tdHeight = (spacer: typeof spacers[ number ]) => {
        const style = spacer.find('td')!.attributes('style') ?? '';
        const match = /block-size:\s*([\d.]+)px/.exec(style);
        return match ? Number.parseFloat(match[ 1 ]!) : 0;
      };
      const sum = tdHeight(spacers[ 0 ]!) + tdHeight(spacers[ 1 ]!) + wrapper.findAll('.virtual-scroll-item').length * 50;
      expect(sum).toBeCloseTo(5000, 0);
      wrapper.unmount();
    });

    it('falls back to absolute table mode for unsupported flow configurations', async () => {
      const baseItems = Array.from({ length: 20 }, (_, i) => ({ id: i }));
      const variants: Array<Record<string, unknown>> = [
        { gap: 10 },
        { columnCount: 3 },
        { direction: 'horizontal' },
        { stickyIndices: [ 0 ] },
        { scrollPaddingStart: 20 },
      ];
      for (const extra of variants) {
        const wrapper = mount(VirtualScrollTable, {
          props: {
            flowTable: true,
            items: baseItems,
            itemSize: 50,
            ...extra,
          },
          slots: { item: '<td>{{ index }}</td>' },
        });
        await nextTick();
        expect(wrapper.find('table').classes()).not.toContain('virtual-scroll--flow');
        wrapper.unmount();
      }
    });

    it('renders flow rows inside an external scroll container', async () => {
      const external = document.createElement('div');
      Object.defineProperty(external, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(external, 'clientWidth', { configurable: true, value: 800 });
      document.body.appendChild(external);
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          container: external,
          flowTable: true,
          items,
          itemSize: 50,
        },
        slots: { item: '<td>{{ index }}</td>' },
      });
      await nextTick();
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.refresh();
      await nextTick();
      await nextTick();
      expect(wrapper.find('table').classes()).toContain('virtual-scroll--flow');

      external.scrollTop = 2500;
      external.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();

      const spacers = wrapper.findAll('.virtual-scroll-spacer--flow');
      expect(spacers.length).toBe(2);
      const sum = wrapper.findAll('.virtual-scroll-item').length * 50
        + spacers.reduce((acc, spacer) => {
          const style = spacer.find('td')!.attributes('style') ?? '';
          const match = /block-size:\s*([\d.]+)px/.exec(style);
          return acc + (match ? Number.parseFloat(match[ 1 ]!) : 0);
        }, 0);
      expect(sum).toBeCloseTo(5000, 0);
      wrapper.unmount();
      external.remove();
    });

    it('pins auto-sized columns from the first flow window', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          autoSizeColumns: true,
          items,
          itemSize: 50,
        },
        slots: {
          header: '<tr><th>H1</th><th>H2</th><th>H3</th></tr>',
          item: '<td class="c1">{{ index }}</td><td class="c2">x</td><td class="c3">y</td>',
        },
      });
      await nextTick();
      await nextTick();
      const el = wrapper.element as HTMLElement;
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 800, configurable: true });
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.refresh();
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.find('table').classes()).toContain('virtual-scroll--flow-fixed');
      const cols = wrapper.findAll('colgroup col');
      expect(cols.length).toBe(3);
      wrapper.unmount();
    });

    it('keeps auto layout when flow rows expose inconsistent cell counts', async () => {
      const items = Array.from({ length: 5 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          autoSizeColumns: true,
          items,
          itemSize: 50,
        },
        slots: {
          header: '<tr><th>H1</th></tr>',
          item: '<td>{{ index }}</td><td>x</td>',
        },
      });
      await nextTick();
      await nextTick();
      const el = wrapper.element as HTMLElement;
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 800, configurable: true });
      const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
      vs.refresh();
      await nextTick();
      await nextTick();
      await nextTick();

      expect(wrapper.find('table').classes()).not.toContain('virtual-scroll--flow-fixed');
      expect(wrapper.findAll('colgroup col').length).toBe(0);
      wrapper.unmount();
    });

    it('does not auto-size flow columns without rendered rows', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          autoSizeColumns: true,
          items: [],
          itemSize: 50,
        },
      });
      await nextTick();
      await nextTick();
      expect(wrapper.find('table').classes()).not.toContain('virtual-scroll--flow-fixed');
      expect(wrapper.findAll('colgroup col').length).toBe(0);
      wrapper.unmount();
    });

    it('correctly virtualizes when using table tags and constrained height', async () => {
      const items = Array.from({ length: 1000 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items,
          itemSize: 40,
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

    it('renders spacer and table tags correctly in grid mode', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: mockItems,
          direction: 'both',
          columnCount: 5,
          showHeader: true,
          showFooter: true,
        },
        slots: {
          header: () => h('tr', [ h('th', 'Header') ]),
          footer: () => h('tr', [ h('td', 'Footer') ]),
        },
      });

      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(vs.isTable).toBe(true);
      expect(vs.itemTag).toBe('tr');

      expect(wrapper.find('thead').exists()).toBe(true);
      expect(wrapper.find('tfoot').exists()).toBe(true);
      expect(wrapper.find('.virtual-scroll-spacer').exists()).toBe(true);
      expect(wrapper.find('.virtual-scroll-spacer').element.tagName).toBe('TR');

      wrapper.unmount();
    });

    it('covers sticky header and footer tags in table mode', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: mockItems,
          stickyHeader: true,
          stickyFooter: true,
          showHeader: true,
          showFooter: true,
        },
        slots: {
          header: () => h('tr', [ h('th', 'H') ]),
          footer: () => h('tr', [ h('td', 'F') ]),
        },
      });
      await nextTick();

      expect(wrapper.find('thead').classes()).toContain('virtual-scroll--sticky');
      expect(wrapper.find('tfoot').classes()).toContain('virtual-scroll--sticky');
      wrapper.unmount();
    });

    it('covers spacerStyle in horizontal mode', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: mockItems,
          direction: 'horizontal',
        },
      });
      await nextTick();
      const spacer = wrapper.find('.virtual-scroll-spacer');
      expect((spacer.element as HTMLElement).style.blockSize).toBe('1px');
      wrapper.unmount();
    });

    it('covers spacerStyle in vertical mode', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: mockItems,
          direction: 'vertical',
        },
      });
      await nextTick();
      const spacer = wrapper.find('.virtual-scroll-spacer');
      if (spacer.exists()) {
        expect((spacer.element as HTMLElement).style.inlineSize).toBe('1px');
      }
      wrapper.unmount();
    });
  });
  it('handles table container tag correctly', async () => {
    const wrapper = mount(VirtualScrollTable, {
      props: {
        items: mockItems,
        direction: 'vertical',
      },
    });
    await nextTick();
    const container = wrapper.find('.virtual-scroll-container');
    expect(container.element.tagName).toBe('TABLE');
    expect(container.attributes('role')).toBeUndefined();
    expect(container.classes()).toContain('virtual-scroll--table');

    const vs = wrapper.vm as unknown as VirtualScrollInstance<MockItem>;
    expect(vs.wrapperRole).toBeNull();
    expect(vs.cellRole).toBe('cell');
  });
  it('uses correct html tags', () => {
    const wrapper = mount(VirtualScrollTable, {
      props: {
        items: [],
      },
    });
    expect(wrapper.element.tagName).toBe('TABLE');
    expect(wrapper.find('tbody').exists()).toBe(true);
  });

  describe('table breadth coverage', () => {
    it('scrolls through vertical and horizontal virtual scrollbar tracks', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          itemSize: 50,
          items,
          virtualScrollbar: true,
        },
      });
      await nextTick();
      await nextTick();

      const track = wrapper.find('.virtual-scrollbar-track--vertical');
      expect(track.exists()).toBe(true);
      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 500,
        height: 500,
        left: 490,
        right: 500,
        top: 0,
        width: 10,
      } as DOMRect);

      await track.trigger('mousedown', { clientY: 250 });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(vs.scrollDetails.scrollOffset.y).toBeCloseTo(2250, 0);

      await track.trigger('mousedown', { clientY: 500 });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBeCloseTo(4500, 0);
      wrapper.unmount();

      // horizontal direction renders the horizontal track and drives X offsets
      const hItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const hw = mount(VirtualScrollTable, {
        props: {
          direction: 'horizontal',
          items: hItems,
          itemSize: 50,
          virtualScrollbar: true,
        },
        slots: {
          loading: () => h('div', { class: 'loading' }, 'LOAD'),
          item: () => h('tr', [ h('td', 'x') ]),
        },
      });
      await nextTick();
      await nextTick();

      const htrack = hw.find('.virtual-scrollbar-track--horizontal');
      expect(htrack.exists()).toBe(true);
      vi.spyOn(htrack.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 10,
        height: 10,
        left: 0,
        right: 500,
        top: 0,
        width: 500,
      } as DOMRect);
      await htrack.trigger('mousedown', { clientX: 250 });
      await nextTick();
      const hvs = hw.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(hvs.scrollDetails.scrollOffset.x).toBeCloseTo(2250, 0);
      hw.unmount();
    });

    it('hides scrollbars when the content fits the viewport', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: Array.from({ length: 5 }, (_, i) => ({ id: i })),
          itemSize: 50,
          virtualScrollbar: true,
        },
      });
      await nextTick();
      await nextTick();
      expect(wrapper.find('.virtual-scrollbar-track--vertical').exists()).toBe(false);
      wrapper.unmount();
    });

    it('reattaches container listeners when flow mode swaps the root element', async () => {
      const observeSpy = vi.spyOn(ResizeObserver.prototype, 'observe');
      const unobserveSpy = vi.spyOn(ResizeObserver.prototype, 'unobserve');

      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: mockItems,
          itemSize: 50,
          flowTable: true,
        },
        slots: { item: () => h('tr', [ h('td', 'x') ]) },
      });
      await nextTick();
      await nextTick();
      const firstHost = wrapper.find('.virtual-scroll-container').element;

      await wrapper.setProps({ flowTable: false });
      await nextTick();
      await nextTick();

      expect(unobserveSpy).toHaveBeenCalledWith(firstHost);
      expect(observeSpy).toHaveBeenCalled();

      observeSpy.mockRestore();
      unobserveSpy.mockRestore();
      wrapper.unmount();
    });

    it('handles coordinate scaling and touch scrolling', async () => {
      const massiveItems = Array.from({ length: 11000 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          itemSize: 1000,
          items: massiveItems,
          virtualScrollbar: true,
        },
      });
      await nextTick();
      await nextTick();

      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(vs.scaleY).toBeGreaterThan(1);
      const containerEl = wrapper.find('.virtual-scroll-container').element as HTMLElement;
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
      expect(vs.scrollDetails.scrollOffset.y).toBeGreaterThan(0);
      containerEl.dispatchEvent(new PointerEvent('pointerup', {
        bubbles: true,
        pointerId: 1,
        pointerType: 'touch',
      }));
      wrapper.unmount();
    });

    it('lays out a both-axis grid table with gaps before hydration', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: Array.from({ length: 20 }, (_, i) => ({ id: i })),
          direction: 'both',
          itemSize: 50,
          columnCount: 4,
          columnWidth: 120,
          columnGap: 6,
          gap: 4,
          virtualScrollbar: true,
        },
        slots: { item: () => h('tr', [ h('td', 'x') ]) },
      });
      const wrapperStyle = wrapper.find('.virtual-scroll-wrapper').attributes('style') ?? '';
      expect(wrapperStyle).toContain('row-gap');
      expect(wrapperStyle).toContain('column-gap');
      await nextTick();
      await nextTick();
      const viewport = wrapper.find('.virtual-scroll-scrollbar-viewport');
      const viewportStyle = viewport.attributes('style') ?? '';
      expect(viewportStyle).toContain('--vsi-scrollbar-has-cross-gap: 1');

      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(vs.getCellAriaProps(2).role).toBe('gridcell');
      wrapper.unmount();
    });

    it('stops programmatic smooth scrolling', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: { items: mockItems, itemSize: 50 },
      });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      vs.scrollToIndex(50, null, { behavior: 'smooth' });
      await nextTick();
      const before = vs.scrollDetails.scrollOffset.y;
      vs.stopProgrammaticScroll();
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBe(before);
      wrapper.unmount();
    });
  });

  describe('scrollbar slot and keyboard breadth', () => {
    it('scrolls via custom scrollbar slot track props (vertical and horizontal)', async () => {
      const slot = (slotProps: ScrollbarSlotProps) => h('div', {
        ...(slotProps.trackProps as Record<string, unknown>),
        class: [ ...(slotProps.trackProps.class as string[]), 'custom-track' ],
      });

      const wrapper = mount(VirtualScrollTable, {
        props: { items: mockItems, itemSize: 50, virtualScrollbar: true },
        slots: { scrollbar: slot },
      });
      await nextTick();
      await nextTick();
      const track = wrapper.find('.custom-track');
      expect(track.exists()).toBe(true);
      await track.trigger('mousedown', { clientY: 50 });
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(vs.scrollDetails.scrollOffset.y).toBeGreaterThan(0);
      wrapper.unmount();

      const hw = mount(VirtualScrollTable, {
        props: { direction: 'horizontal', items: mockItems, itemSize: 50, virtualScrollbar: true },
        slots: { scrollbar: slot },
      });
      await nextTick();
      await nextTick();
      const htrack = hw.find('.custom-track');
      expect(htrack.exists()).toBe(true);
      await htrack.trigger('mousedown', { clientX: 50 });
      await nextTick();
      const hvs = hw.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(hvs.scrollDetails.scrollOffset.x).toBeGreaterThan(0);
      hw.unmount();
    });

    it('includes the loading slot height when keyboard-scrolling to the end', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: { items: mockItems, itemSize: 50 },
        slots: {
          loading: () => h('div', { class: 'loading-slot', style: 'height: 30px' }, 'LOAD'),
          item: () => h('tr', [ h('td', 'x') ]),
        },
      });
      await nextTick();
      await nextTick();
      await wrapper.find('.virtual-scroll-container').trigger('keydown', { key: 'End' });
      await nextTick();
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(vs.scrollDetails.scrollOffset.y).toBeGreaterThan(4400);
      wrapper.unmount();
    });
  });

  describe('final branch coverage', () => {
    it('batches explicit size updates and measures the loading slot on End', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: { items: mockItems.slice(0, 20) },
        slots: { item: () => h('tr', [ h('td', 'x') ]) },
      });
      await nextTick();
      await nextTick();
      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      vs.updateItemSizes([
        { index: 0, inlineSize: 100, blockSize: 60 },
        { index: 1, inlineSize: 100, blockSize: 40 },
      ]);
      vs.updateItemSizes([]);
      await nextTick();
      expect(vs.getItemSize(0)).toBe(60);

      // End without a loading slot exercises the null branch
      await wrapper.find('.virtual-scroll-container').trigger('keydown', { key: 'End' });
      await nextTick();
      expect(vs.scrollDetails.scrollOffset.y).toBeGreaterThan(0);
      wrapper.unmount();

      // refresh with no rendered items takes the empty-updates path
      const empty = mount(VirtualScrollTable, {
        props: { items: [], itemSize: 50 },
      });
      await nextTick();
      (empty.vm as unknown as VirtualScrollTableInstance<MockItem>).refresh();
      await nextTick();
      empty.unmount();
    });

    it('toggles scaling on the same host to re-register the wheel listener', async () => {
      const addSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');
      const wrapper = mount(VirtualScrollTable, {
        props: { items: Array.from({ length: 20 }, (_, i) => ({ id: i })), itemSize: 50 },
        slots: { item: () => h('tr', [ h('td', 'x') ]) },
      });
      await nextTick();
      addSpy.mockClear();
      await wrapper.setProps({ items: Array.from({ length: 11000 }, (_, i) => ({ id: i })), itemSize: 1000 });
      await nextTick();
      await nextTick();
      const calls = addSpy.mock.calls.filter(([ type ]) => type === 'wheel');
      expect(calls.length).toBeGreaterThanOrEqual(1);
      addSpy.mockRestore();
      wrapper.unmount();
    });

    it('exposes loading and row-role ARIA states', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          loading: true,
          itemRole: 'none',
          debug: true,
        },
        slots: { item: () => h('tr', [ h('td', 'x') ]) },
      });
      await nextTick();
      await nextTick();
      const root = wrapper.find('.virtual-scroll-container');
      expect(root.attributes('aria-busy')).toBe('true');
      const row = wrapper.find('.virtual-scroll-item');
      expect(row.attributes('role')).toBe('none');
      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      expect(vs.getItemAriaProps(0).role).toBe('row');
      expect(wrapper.find('.virtual-scroll-debug-info').exists()).toBe(true);
      wrapper.unmount();

      const flow = mount(VirtualScrollTable, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          flowTable: true,
          debug: true,
        },
        slots: { item: () => h('tr', [ h('td', 'x') ]) },
      });
      await nextTick();
      await nextTick();
      expect(flow.find('.virtual-scroll-debug-info').exists()).toBe(true);
      flow.unmount();
    });

    it('toggles the loading indicator class in flow mode', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          flowTable: true,
        },
        slots: {
          loading: () => h('div', { class: 'loading-slot' }, 'LOAD'),
          item: () => h('tr', [ h('td', 'x') ]),
        },
      });
      await nextTick();
      await nextTick();
      const loading = wrapper.find('.virtual-scroll-loading');
      expect(loading.classes()).toContain('virtual-scroll-loading--hidden');
      await wrapper.setProps({ loading: true });
      await nextTick();
      expect(loading.classes()).not.toContain('virtual-scroll-loading--hidden');
      wrapper.unmount();
    });

    it('hides the loading indicator class while idle', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: { items: mockItems.slice(0, 5), itemSize: 50 },
        slots: {
          loading: () => h('div', { class: 'loading-slot' }, 'LOAD'),
          item: () => h('tr', [ h('td', 'x') ]),
        },
      });
      await nextTick();
      await nextTick();
      expect(wrapper.find('.virtual-scroll-loading').classes()).toContain('virtual-scroll-loading--hidden');
      wrapper.unmount();
    });
  });

  describe('flow width modes and horizontal overflow', () => {
    it('pins explicit colgroup widths and switches back to auto sizing', async () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          autoSizeColumns: true,
          columnWidths: [ 100, 200, 300 ],
          items,
          itemSize: 50,
        },
        slots: {
          header: '<tr><th>H1</th><th>H2</th><th>H3</th></tr>',
          item: '<td class="c1">{{ index }}</td><td class="c2">x</td><td class="c3">y</td>',
        },
      });
      await nextTick();
      await nextTick();
      await nextTick();

      const table = wrapper.find('.virtual-scroll-flow-table');
      expect(table.classes()).toContain('virtual-scroll--flow-fixed');
      const cols = wrapper.findAll('colgroup col');
      expect(cols.map((col) => col.attributes('style'))).toEqual([
        'width: 100px;',
        'width: 200px;',
        'width: 300px;',
      ]);

      // clearing columnWidths (empty array) returns to measured auto sizing
      await wrapper.setProps({ columnWidths: [] });
      await nextTick();
      await nextTick();
      await nextTick();
      expect(wrapper.findAll('colgroup col').length).toBe(3);

      // and disabling auto sizing removes the pinning entirely
      await wrapper.setProps({ autoSizeColumns: false });
      await nextTick();
      await nextTick();
      expect(wrapper.find('colgroup').exists()).toBe(false);
      wrapper.unmount();
    });

    it('supports measured dynamic row heights in flow', async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          items,
          itemSize: 0,
        },
        slots: {
          item: '<tr><td>{{ index }}</td></tr>',
        },
      });
      await nextTick();
      await nextTick();
      const el = wrapper.element as HTMLElement;
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 800, configurable: true });
      const vs = wrapper.vm as unknown as VirtualScrollTableInstance<MockItem>;
      vs.refresh();
      await nextTick();
      await nextTick();

      expect(wrapper.find('.virtual-scroll-flow-table').classes()).toContain('virtual-scroll--flow');
      const heights = [ 40, 80, 40, 80, 40, 120, 40, 80, 40, 60 ];
      vs.updateItemSizes(heights.map((blockSize, index) => ({ index, inlineSize: 100, blockSize })));
      await nextTick();
      await nextTick();
      expect(vs.scrollDetails.totalSize.height).toBe(heights.reduce((a, b) => a + b, 0));
      expect(vs.getItemOffset(3)).toBe(40 + 80 + 40);
      wrapper.unmount();
    });

    it('renders a horizontal scrollbar when the flow table overflows', async () => {
      const items = Array.from({ length: 20 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          items,
          itemSize: 50,
          virtualScrollbar: true,
        },
        slots: { item: '<tr><td>{{ index }}</td></tr>' },
      });
      const tableEl = wrapper.find('.virtual-scroll-flow-table').element as HTMLElement;
      Object.defineProperty(tableEl, 'scrollWidth', { configurable: true, value: 1200 });
      Object.defineProperty(tableEl, 'clientWidth', { configurable: true, value: 500 });
      await nextTick();
      await nextTick();

      const htrack = wrapper.find('.virtual-scrollbar-track--horizontal');
      expect(htrack.exists()).toBe(true);

      // a ResizeObserver cycle re-reads the live table/container sizes
      triggerResize(tableEl, 1200, 500);

      // scrolling the container moves the flow horizontal scrollbar position
      const container = wrapper.find('.virtual-scroll-container').element as HTMLElement;
      Object.defineProperty(container, 'scrollLeft', { configurable: true, value: 300, writable: true });
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(container.scrollLeft).toBe(300);

      // clicking the track scrolls the container through the flow callback
      vi.spyOn(htrack.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 10,
        height: 10,
        left: 0,
        right: 500,
        top: 0,
        width: 500,
      } as DOMRect);
      await htrack.trigger('mousedown', { clientX: 250 });
      await nextTick();
      expect(container.scrollLeft).toBeGreaterThan(0);
      wrapper.unmount();

      // absolute-row tables overflow horizontally too
      const legacy = mount(VirtualScrollTable, {
        props: {
          items: Array.from({ length: 20 }, (_, i) => ({ id: i })),
          itemSize: 50,
          virtualScrollbar: true,
        },
        slots: { item: '<tr><td>{{ index }}</td></tr>' },
      });
      const legacyHost = legacy.find('.virtual-scroll-container').element as HTMLElement;
      Object.defineProperty(legacyHost, 'scrollWidth', { configurable: true, value: 1200 });
      Object.defineProperty(legacyHost, 'clientWidth', { configurable: true, value: 500 });
      await nextTick();
      await nextTick();
      expect(legacy.find('.virtual-scrollbar-track--horizontal').exists()).toBe(true);
      legacy.unmount();

      // switching away from vertical disconnects the overflow watcher
      const hw = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          items: Array.from({ length: 20 }, (_, i) => ({ id: i })),
          itemSize: 50,
          virtualScrollbar: true,
        },
        slots: { item: '<tr><td>{{ index }}</td></tr>' },
      });
      const hwTable = hw.find('.virtual-scroll-flow-table').element as HTMLElement;
      Object.defineProperty(hwTable, 'scrollWidth', { configurable: true, value: 1200 });
      await nextTick();
      await nextTick();
      expect(hw.find('.virtual-scrollbar-track--horizontal').exists()).toBe(true);
      await hw.setProps({ direction: 'horizontal' });
      await nextTick();
      await nextTick();
      expect(hw.find('.virtual-scroll-flow-table').exists()).toBe(false);
      hw.unmount();

      // fits: no horizontal bar
      const small = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          items: Array.from({ length: 5 }, (_, i) => ({ id: i })),
          itemSize: 50,
          virtualScrollbar: true,
        },
        slots: { item: '<tr><td>{{ index }}</td></tr>' },
      });
      await nextTick();
      await nextTick();
      expect(small.find('.virtual-scrollbar-track--horizontal').exists()).toBe(false);
      small.unmount();
    });
  });

  describe('flow snap verification', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('snaps to the item offset when scrolling stops in absolute row mode', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          items: mockItems,
          itemSize: 50,
          snap: true,
        },
        slots: { item: '<tr><td>{{ index }}</td></tr>' },
      });
      await nextTick();
      await nextTick();

      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      el.scrollTo = vi.fn().mockImplementation((opts: ScrollToOptions) => {
        if (opts.top !== undefined) {
          el.scrollTop = opts.top;
        }
      });

      Object.defineProperty(el, 'scrollTop', { value: 75, writable: true });
      await container.trigger('scroll');
      await nextTick();
      vi.advanceTimersByTime(300);
      await nextTick();

      expect(el.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 50, behavior: 'smooth', left: 0 }));
      wrapper.unmount();
    });

    it('snaps to the item offset when scrolling stops in flow mode', async () => {
      const wrapper = mount(VirtualScrollTable, {
        props: {
          flowTable: true,
          items: mockItems,
          itemSize: 50,
          snap: true,
        },
        slots: { item: '<tr><td>{{ index }}</td></tr>' },
      });
      await nextTick();
      await nextTick();

      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      el.scrollTo = vi.fn().mockImplementation((opts: ScrollToOptions) => {
        if (opts.top !== undefined) {
          el.scrollTop = opts.top;
        }
      });

      Object.defineProperty(el, 'scrollTop', { value: 75, writable: true });
      await container.trigger('scroll');
      await nextTick();
      await vi.advanceTimersToNextFrame();
      vi.advanceTimersByTime(1100);
      await vi.advanceTimersToNextFrame();
      await nextTick();
      await nextTick();

      expect(el.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 50, behavior: 'smooth', left: 0 }));
      wrapper.unmount();
    });
  });
});
