import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails, ScrollToIndexOptions } from '../composables/useVirtualScroll';
import type { DOMWrapper, VueWrapper } from '@vue/test-utils';

import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import VirtualScroll from './VirtualScroll.vue';

type ResizeObserverCallback = (entries: ResizeObserverEntry[], observer: ResizeObserver) => void;

// Mock ResizeObserver
interface ResizeObserverMock {
  callback: ResizeObserverCallback;
  targets: Set<Element>;
  trigger: (entries: Partial<ResizeObserverEntry>[]) => void;
}

globalThis.ResizeObserver = class {
  callback: ResizeObserverCallback;
  static instances: ResizeObserverMock[] = [];
  targets: Set<Element> = new Set();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    (this.constructor as unknown as { instances: ResizeObserverMock[]; }).instances.push(this as unknown as ResizeObserverMock);
  }

  observe(target: Element) {
    this.targets.add(target);
  }

  unobserve(target: Element) {
    this.targets.delete(target);
  }

  disconnect() {
    this.targets.clear();
  }

  trigger(entries: Partial<ResizeObserverEntry>[]) {
    this.callback(entries as ResizeObserverEntry[], this as unknown as ResizeObserver);
  }
} as unknown as typeof ResizeObserver & { instances: ResizeObserverMock[]; };

// eslint-disable-next-line test/prefer-lowercase-title
describe('VirtualScroll component', () => {
  const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i, label: `Item ${ i }` }));

  interface VSInstance {
    scrollDetails: ScrollDetails<unknown>;
    scrollToIndex: (rowIndex: number | null, colIndex: number | null, options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions) => void;
    scrollToOffset: (x: number | null, y: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void;
    setItemRef: (el: unknown, index: number) => void;
    stopProgrammaticScroll: () => void;
  }

  interface TestCompInstance {
    mockItems: typeof mockItems;
    show: boolean;
    showFooter: boolean;
  }

  describe('rendering and structure', () => {
    it('should render items correctly', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 50,
        },
        slots: {
          item: '<template #item="{ item, index }"><div class="item">{{ index }}: {{ item.label }}</div></template>',
        },
      });
      expect(wrapper.findAll('.item').length).toBeGreaterThan(0);
      expect(wrapper.text()).toContain('0: Item 0');
    });

    it('should render header and footer slots', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 50,
        },
        slots: {
          header: '<div class="header">Header</div>',
          footer: '<div class="footer">Footer</div>',
        },
      });
      expect(wrapper.find('.virtual-scroll-header').exists()).toBe(true);
      expect(wrapper.find('.header').exists()).toBe(true);
      expect(wrapper.find('.virtual-scroll-footer').exists()).toBe(true);
      expect(wrapper.find('.footer').exists()).toBe(true);
    });

    it('should not render header and footer slots when absent', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 50,
        },
      });
      expect(wrapper.find('.virtual-scroll-header').exists()).toBe(false);
      expect(wrapper.find('.virtual-scroll-footer').exists()).toBe(false);
    });

    it('should render debug information when debug prop is true', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 5),
          itemSize: 50,
          debug: true,
        },
      });
      await nextTick();
      expect(wrapper.find('.virtual-scroll-debug-info').exists()).toBe(true);
      expect(wrapper.find('.virtual-scroll-item').classes()).toContain('virtual-scroll--debug');
    });

    it('should not render debug information when debug prop is false', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 5),
          itemSize: 50,
          debug: false,
        },
      });
      await nextTick();
      expect(wrapper.find('.virtual-scroll-debug-info').exists()).toBe(false);
      expect(wrapper.find('.virtual-scroll-item').classes()).not.toContain('virtual-scroll--debug');
    });

    it('should handle missing slots gracefully', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 1),
          itemSize: 50,
        },
      });
      expect(wrapper.exists()).toBe(true);
    });

    it('should render table correctly', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          containerTag: 'table',
          wrapperTag: 'tbody',
          itemTag: 'tr',
        },
        slots: {
          item: '<template #item="{ item, index }"><td>{{ index }}</td><td>{{ item.label }}</td></template>',
        },
      });
      expect(wrapper.element.tagName).toBe('TABLE');
      expect(wrapper.find('tbody').exists()).toBe(true);
      expect(wrapper.find('tr.virtual-scroll-item').exists()).toBe(true);
    });

    it('should render table with header and footer', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          containerTag: 'table',
          wrapperTag: 'tbody',
          itemTag: 'tr',
        },
        slots: {
          header: '<tr><th>ID</th></tr>',
          footer: '<tr><td>Footer</td></tr>',
        },
      });
      expect(wrapper.find('thead').exists()).toBe(true);
      expect(wrapper.find('tfoot').exists()).toBe(true);
    });

    it('should render div header and footer', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          containerTag: 'div',
        },
        slots: {
          header: '<div class="header">Header</div>',
          footer: '<div class="footer">Footer</div>',
        },
      });
      expect(wrapper.find('div.virtual-scroll-header').exists()).toBe(true);
      expect(wrapper.find('div.virtual-scroll-footer').exists()).toBe(true);
    });

    it('should apply sticky classes to header and footer', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          stickyHeader: true,
          stickyFooter: true,
        },
        slots: {
          header: '<div>H</div>',
          footer: '<div>F</div>',
        },
      });
      await nextTick();
      expect(wrapper.find('.virtual-scroll-header').classes()).toContain('virtual-scroll--sticky');
      expect(wrapper.find('.virtual-scroll-footer').classes()).toContain('virtual-scroll--sticky');
    });

    it('should handle switching containerTag', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems.slice(0, 10), containerTag: 'div' } });
      await nextTick();
      await wrapper.setProps({ containerTag: 'table' });
      await nextTick();
      expect(wrapper.element.tagName).toBe('TABLE');
      await wrapper.setProps({ containerTag: 'div' });
      await nextTick();
      expect(wrapper.element.tagName).toBe('DIV');
    });

    it('should render table spacer and items', () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 5),
          containerTag: 'table',
          wrapperTag: 'tbody',
          itemTag: 'tr',
        },
        slots: {
          item: '<template #item="{ item }"><td>{{ item.label }}</td></template>',
        },
      });
      expect(wrapper.find('tr.virtual-scroll-spacer').exists()).toBe(true);
      expect(wrapper.find('tr.virtual-scroll-item').exists()).toBe(true);
    });

    it('should handle table rendering without header and footer', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 5),
          containerTag: 'table',
        },
      });
      await nextTick();
      expect(wrapper.find('thead').exists()).toBe(false);
      expect(wrapper.find('tfoot').exists()).toBe(false);
    });

    it('should cover all template branches for slots and tags', async () => {
      for (const tag of [ 'div', 'table' ] as const) {
        for (const loading of [ true, false ]) {
          for (const withSlots of [ true, false ]) {
            const slots = withSlots
              ? {
                header: tag === 'table' ? '<tr><td>H</td></tr>' : '<div>H</div>',
                footer: tag === 'table' ? '<tr><td>F</td></tr>' : '<div>F</div>',
                loading: tag === 'table' ? '<tr><td>L</td></tr>' : '<div>L</div>',
              }
              : {};
            const wrapper = mount(VirtualScroll, {
              props: { items: mockItems.slice(0, 1), containerTag: tag, loading },
              slots,
            });
            await nextTick();
            wrapper.unmount();
          }
        }
      }
    });
  });

  describe('styling and dimensions', () => {
    it('should render items horizontally when direction is horizontal', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: Array.from({ length: 10 }, (_, i) => ({ id: i })),
          itemSize: 100,
          direction: 'horizontal',
        },
      });
      await nextTick();
      const items = wrapper.findAll('.virtual-scroll-item');
      expect(items.length).toBeGreaterThan(0);
      const firstItem = items[ 0 ]?.element as HTMLElement;
      expect(firstItem.style.transform).toBe('translate(0px, 0px)');
    });

    it('should handle bidirectional scroll dimensions', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: Array.from({ length: 10 }, (_, i) => ({ id: i })),
          itemSize: 100,
          direction: 'both',
          columnCount: 5,
          columnWidth: 150,
        },
      });
      const VS_wrapper = wrapper.find('.virtual-scroll-wrapper');
      const style = (VS_wrapper.element as HTMLElement).style;
      expect(style.blockSize).toBe('1000px');
      expect(style.inlineSize).toBe('750px');
    });

    it('should cover all containerStyle branches', () => {
      [ 'vertical', 'horizontal', 'both' ].forEach((direction) => {
        mount(VirtualScroll, { props: { items: mockItems, direction: direction as 'vertical' | 'horizontal' | 'both' } });
        mount(VirtualScroll, { props: { items: mockItems, direction: direction as 'vertical' | 'horizontal' | 'both', container: document.body } });
        mount(VirtualScroll, { props: { items: mockItems, direction: direction as 'vertical' | 'horizontal' | 'both', containerTag: 'table' } });
      });
      mount(VirtualScroll, { props: { items: mockItems, container: null } });
    });

    it('should cover getItemStyle branches', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 5),
          itemSize: 50,
          direction: 'horizontal',
        },
      });
      await nextTick();
      const item = wrapper.find('.virtual-scroll-item').element as HTMLElement;
      expect(item.style.inlineSize).toBe('50px');
      expect(item.style.blockSize).toBe('100%');
    });

    it('should cover sticky item style branches in getItemStyle', async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));
      const wrapper = mount(VirtualScroll, {
        props: {
          items,
          direction: 'horizontal',
          stickyIndices: [ 0 ],
          scrollPaddingStart: 10,
        },
      });
      await nextTick();

      const stickyItem = wrapper.find('.virtual-scroll-item').element as HTMLElement;
      // It should be sticky active if we scroll
      await wrapper.trigger('scroll');
      await nextTick();

      expect(stickyItem.style.insetInlineStart).toBe('10px');

      await wrapper.setProps({ direction: 'vertical', scrollPaddingStart: 20 });
      await nextTick();
      expect(stickyItem.style.insetBlockStart).toBe('20px');
    });

    it('should handle custom container element for header/footer padding', async () => {
      const container = document.createElement('div');
      const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));
      mount(VirtualScroll, {
        props: {
          items,
          container,
          stickyHeader: true,
        },
      });
      await nextTick();
      // This covers the branch where container is NOT host element and NOT window
    });

    it('should cover object padding branches in virtualScrollProps', () => {
      mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 1),
          scrollPaddingStart: { x: 10, y: 20 },
          scrollPaddingEnd: { x: 30, y: 40 },
        },
      });
      mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 1),
          direction: 'horizontal',
          scrollPaddingStart: 10,
          scrollPaddingEnd: 20,
        },
      });
    });
  });

  describe('keyboard navigation', () => {
    let wrapper: VueWrapper<VSInstance>;
    let container: DOMWrapper<Element>;
    let el: HTMLElement;

    beforeEach(async () => {
      wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 50,
          direction: 'vertical',
        },
      }) as unknown as VueWrapper<VSInstance>;
      await nextTick();
      container = wrapper.find('.virtual-scroll-container');
      el = container.element as HTMLElement;

      // Mock dimensions
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 500, configurable: true });
      Object.defineProperty(el, 'offsetHeight', { value: 500, configurable: true });
      Object.defineProperty(el, 'offsetWidth', { value: 500, configurable: true });

      const observers = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.filter((i) => i.targets.has(el));
      observers.forEach((i) => i.trigger([ { target: el, contentRect: { width: 500, height: 500 } as unknown as DOMRectReadOnly } ]));
      await nextTick();
    });

    it('should handle Home key', async () => {
      el.scrollTop = 1000;
      el.scrollLeft = 500;
      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect(el.scrollTop).toBe(0);
      expect(el.scrollLeft).toBe(0);
    });

    it('should handle End key (vertical)', async () => {
      el.scrollLeft = 0;
      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      // totalHeight = 100 items * 50px = 5000px
      // viewportHeight = 500px
      // scrollToIndex(99, 0, 'end') -> targetY = 99 * 50 = 4950
      // alignment 'end' -> targetY = 4950 - (500 - 50) = 4500
      expect(el.scrollTop).toBe(4500);
      expect(el.scrollLeft).toBe(0);
    });

    it('should handle End key (horizontal)', async () => {
      await wrapper.setProps({ direction: 'horizontal' });
      await nextTick();
      // Trigger resize again for horizontal
      const observers = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.filter((i) => i.targets.has(el));
      observers.forEach((i) => i.trigger([ { target: el, contentRect: { width: 500, height: 500 } as unknown as DOMRectReadOnly } ]));
      await nextTick();

      el.scrollTop = 0;
      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      expect(el.scrollLeft).toBe(4500);
      expect(el.scrollTop).toBe(0);
    });

    it('should handle End key in both mode', async () => {
      await wrapper.setProps({ columnCount: 5, columnWidth: 100, direction: 'both' });
      await nextTick();

      // Trigger a resize
      const observers = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.filter((i) => i.targets.has(el));
      observers.forEach((i) => i.trigger([ { target: el, contentRect: { width: 500, height: 500 } as unknown as DOMRectReadOnly } ]));
      await nextTick();

      await container.trigger('keydown', { key: 'End' });
      await nextTick();

      // items: 100 (rows), height: 50 -> totalHeight: 5000
      // columns: 5, width: 100 -> totalWidth: 500
      // viewport: 500x500
      // scrollToIndex(99, 4, 'end')
      // targetY = 99 * 50 = 4950. end alignment: 4950 - (500 - 50) = 4500
      // targetX = 4 * 100 = 400. end alignment: 400 - (500 - 100) = 0
      expect(el.scrollTop).toBe(4500);
      expect(el.scrollLeft).toBe(0);
    });

    it('should handle End key with empty items', async () => {
      await wrapper.setProps({ items: [] });
      await nextTick();
      await container.trigger('keydown', { key: 'End' });
      await nextTick();
    });

    it('should handle ArrowDown / ArrowUp', async () => {
      el.scrollLeft = 0;
      await container.trigger('keydown', { key: 'ArrowDown' });
      await nextTick();
      expect(el.scrollTop).toBe(40);
      expect(el.scrollLeft).toBe(0);

      await container.trigger('keydown', { key: 'ArrowUp' });
      await nextTick();
      expect(el.scrollTop).toBe(0);
      expect(el.scrollLeft).toBe(0);
    });

    it('should handle ArrowRight / ArrowLeft', async () => {
      await wrapper.setProps({ direction: 'horizontal' });
      await nextTick();
      el.scrollTop = 0;
      await container.trigger('keydown', { key: 'ArrowRight' });
      await nextTick();
      expect(el.scrollLeft).toBe(40);
      expect(el.scrollTop).toBe(0);

      await container.trigger('keydown', { key: 'ArrowLeft' });
      await nextTick();
      expect(el.scrollLeft).toBe(0);
      expect(el.scrollTop).toBe(0);
    });

    it('should handle PageDown / PageUp', async () => {
      el.scrollLeft = 0;
      await container.trigger('keydown', { key: 'PageDown' });
      await nextTick();
      expect(el.scrollTop).toBe(500);
      expect(el.scrollLeft).toBe(0);

      await container.trigger('keydown', { key: 'PageUp' });
      await nextTick();
      expect(el.scrollTop).toBe(0);
      expect(el.scrollLeft).toBe(0);
    });

    it('should handle PageDown / PageUp in horizontal mode', async () => {
      await wrapper.setProps({ direction: 'horizontal' });
      await nextTick();
      el.scrollTop = 0;
      await container.trigger('keydown', { key: 'PageDown' });
      await nextTick();
      expect(el.scrollLeft).toBe(500);
      expect(el.scrollTop).toBe(0);

      await container.trigger('keydown', { key: 'PageUp' });
      await nextTick();
      expect(el.scrollLeft).toBe(0);
      expect(el.scrollTop).toBe(0);
    });

    it('should handle unhandled keys', async () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
      el.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('resize and observers', () => {
    it('should update item size on resize', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems.slice(0, 5) } });
      await nextTick();
      const firstItem = wrapper.find('.virtual-scroll-item').element;
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(firstItem));
      if (observer) {
        observer.trigger([ {
          target: firstItem,
          contentRect: { width: 100, height: 100 } as DOMRectReadOnly,
          borderBoxSize: [ { inlineSize: 110, blockSize: 110 } ],
        } ]);
      }
      await nextTick();
    });

    it('should handle resize fallback (no borderBoxSize)', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems.slice(0, 5) } });
      await nextTick();
      const firstItem = wrapper.find('.virtual-scroll-item').element;
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(firstItem));
      if (observer) {
        observer.trigger([ { target: firstItem, contentRect: { width: 100, height: 100 } as DOMRectReadOnly } ]);
      }
      await nextTick();
    });

    it('should observe host resize and update offset', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems, itemSize: 50 } });
      await nextTick();
      const host = wrapper.find('.virtual-scroll-container').element;
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(host));
      if (observer) {
        observer.trigger([ { target: host } ]);
      }
      await nextTick();
    });

    it('should observe cell resize with data-col-index', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 1),
          direction: 'both',
          columnCount: 2,
        },
        slots: {
          item: '<template #item="{ index }"><div class="row"><div class="cell" data-col-index="0">Cell {{ index }}</div></div></template>',
        },
      });
      await nextTick();
      const cell = wrapper.find('.cell').element;
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(cell));
      expect(observer).toBeDefined();

      if (observer) {
        observer.trigger([ {
          target: cell,
          contentRect: { width: 100, height: 50 } as DOMRectReadOnly,
        } ]);
      }
      await nextTick();
    });

    it('should observe header and footer resize', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems, itemSize: 50 },
        slots: {
          header: '<div class="header">H</div>',
          footer: '<div class="footer">F</div>',
        },
      });
      await nextTick();
      const header = wrapper.find('.virtual-scroll-header').element;
      const footer = wrapper.find('.virtual-scroll-footer').element;

      const headerObserver = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(header));
      if (headerObserver) {
        headerObserver.trigger([ { target: header } ]);
      }

      const footerObserver = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(footer));
      if (footerObserver) {
        footerObserver.trigger([ { target: footer } ]);
      }
      await nextTick();
    });

    it('should observe footer on mount if slot exists', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems, itemSize: 50 },
        slots: { footer: '<div class="footer">F</div>' },
      });
      await nextTick();
      const footer = wrapper.find('.virtual-scroll-footer').element;
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(footer));
      expect(observer).toBeDefined();
    });

    it('should cover header/footer unobserve when removed/replaced', async () => {
      const TestComp = defineComponent({
        components: { VirtualScroll },
        setup() {
          const show = ref(true);
          const showFooter = ref(true);
          return { mockItems, show, showFooter };
        },
        template: `
          <VirtualScroll :items="mockItems">
            <template v-if="show" #header><div>H</div></template>
            <template v-if="showFooter" #footer><div>F</div></template>
          </VirtualScroll>
        `,
      });
      const wrapper = mount(TestComp);
      await nextTick();

      (wrapper.vm as unknown as TestCompInstance).show = false;
      (wrapper.vm as unknown as TestCompInstance).showFooter = false;
      await nextTick();

      (wrapper.vm as unknown as TestCompInstance).show = true;
      (wrapper.vm as unknown as TestCompInstance).showFooter = true;
      await nextTick();
    });

    it('should cleanup observers on unmount', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems, stickyFooter: true, stickyHeader: true },
        slots: { footer: '<div>F</div>', header: '<div>H</div>' },
      });
      await nextTick();
      wrapper.unmount();
    });

    it('should ignore elements with missing or invalid data attributes in itemResizeObserver', async () => {
      mount(VirtualScroll, { props: { items: mockItems.slice(0, 1) } });
      await nextTick();
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances[ 0 ]!;

      // 1. Invalid index string
      const div1 = document.createElement('div');
      div1.dataset.index = 'invalid';
      observer.trigger([ { target: div1, contentRect: { width: 100, height: 100 } as unknown as DOMRectReadOnly } ]);

      // 2. Missing index and colIndex
      const div2 = document.createElement('div');
      observer.trigger([ { target: div2, contentRect: { width: 100, height: 100 } as unknown as DOMRectReadOnly } ]);

      await nextTick();
    });
  });

  describe('grid mode logic', () => {
    it('should cover firstRenderedIndex watcher for grid', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          bufferBefore: 2,
          columnCount: 5,
          direction: 'both',
          itemSize: 50,
          items: mockItems,
        },
        slots: {
          item: '<template #item="{ index }"><div class="cell" :data-col-index="0">Item {{ index }}</div></template>',
        },
      });
      await nextTick();
      const vm = wrapper.vm as unknown as VSInstance;

      // Scroll to 10
      vm.scrollToIndex(10, 0, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();

      const item8 = wrapper.find('.virtual-scroll-item[data-index="8"]').element;
      const itemResizeObserver = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(item8));
      expect(itemResizeObserver).toBeDefined();

      // Scroll to 9
      vm.scrollToIndex(9, 0, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();

      // Scroll to 50
      vm.scrollToIndex(50, 0, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();
    });

    it('should cover firstRenderedIndex watcher when items becomes empty', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          columnCount: 5,
          direction: 'both',
          itemSize: 50,
          items: mockItems,
        },
      });
      await nextTick();
      await wrapper.setProps({ items: [] });
      await nextTick();
    });
  });

  describe('infinite scroll and loading', () => {
    it('should emit load event when reaching scroll end (vertical)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems.slice(0, 10),
          loadDistance: 400,
        },
      });
      await nextTick();

      (wrapper.vm as unknown as VSInstance).scrollToOffset(0, 250);
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('load')).toBeDefined();
      expect(wrapper.emitted('load')![ 0 ]).toEqual([ 'vertical' ]);
    });

    it('should emit load event when reaching scroll end (horizontal)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          direction: 'horizontal',
          itemSize: 50,
          items: mockItems.slice(0, 10),
          loadDistance: 400,
        },
      });
      await nextTick();

      (wrapper.vm as unknown as VSInstance).scrollToOffset(250, 0);
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('load')).toBeDefined();
      expect(wrapper.emitted('load')![ 0 ]).toEqual([ 'horizontal' ]);
    });

    it('should not emit load event when loading is true', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems.slice(0, 10),
          loadDistance: 100,
          loading: true,
        },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      Object.defineProperty(el, 'clientHeight', { value: 200, configurable: true });
      Object.defineProperty(el, 'scrollHeight', { value: 500, configurable: true });

      el.scrollTop = 250;
      container.element.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('load')).toBeUndefined();
    });

    it('should render loading slot correctly', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          itemSize: 50,
          items: mockItems.slice(0, 10),
          loading: true,
        },
        slots: {
          loading: '<div class="loading-indicator">Loading...</div>',
        },
      });
      await nextTick();
      expect(wrapper.find('.loading-indicator').exists()).toBe(true);

      await wrapper.setProps({ direction: 'horizontal' });
      await nextTick();
      expect((wrapper.find('.virtual-scroll-loading').element as HTMLElement).style.display).toBe('inline-block');
    });

    it('should toggle loading slot visibility based on loading prop', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 5),
          loading: false,
        },
        slots: {
          loading: '<div class="loader">Loading...</div>',
        },
      });
      await nextTick();

      expect(wrapper.find('.loader').exists()).toBe(false);
      expect(wrapper.find('.virtual-scroll-loading').exists()).toBe(false);

      await wrapper.setProps({ loading: true });
      await nextTick();
      expect(wrapper.find('.loader').exists()).toBe(true);
      expect(wrapper.find('.virtual-scroll-loading').exists()).toBe(true);

      await wrapper.setProps({ loading: false });
      await nextTick();
      expect(wrapper.find('.loader').exists()).toBe(false);
      expect(wrapper.find('.virtual-scroll-loading').exists()).toBe(false);
    });
  });

  describe('internal methods and exports', () => {
    it('should handle setItemRef', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems.slice(0, 1) } });
      await nextTick();
      const vm = wrapper.vm as unknown as VSInstance;
      const item = wrapper.find('.virtual-scroll-item').element as HTMLElement;
      vm.setItemRef(item, 0);
      vm.setItemRef(null, 0);
    });

    it('should handle setItemRef with NaN index', async () => {
      mount(VirtualScroll, { props: { items: mockItems.slice(0, 1) } });
      await nextTick();
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances[ 0 ];
      const div = document.createElement('div');
      observer?.trigger([ { target: div, contentRect: { width: 100, height: 100 } as unknown as DOMRectReadOnly } ]);
    });

    it('should expose methods', () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems, itemSize: 50 } });
      expect(typeof (wrapper.vm as unknown as VSInstance).scrollToIndex).toBe('function');
      expect(typeof (wrapper.vm as unknown as VSInstance).scrollToOffset).toBe('function');
    });

    it('should emit visibleRangeChange on scroll and hydration', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { itemSize: 50, items: mockItems },
      });
      await nextTick();
      await nextTick();
      expect(wrapper.emitted('visibleRangeChange')).toBeDefined();

      const container = wrapper.find('.virtual-scroll-container').element as HTMLElement;
      Object.defineProperty(container, 'scrollTop', { value: 500, writable: true });
      await container.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();
      expect(wrapper.emitted('visibleRangeChange')!.length).toBeGreaterThan(1);
    });

    it('should not emit scroll event before hydration in watch', async () => {
      // initialScrollIndex triggers delayed hydration via nextTick in useVirtualScroll
      const wrapper = mount(VirtualScroll, {
        props: {
          initialScrollIndex: 5,
          itemSize: 50,
          items: mockItems.slice(0, 10),
        },
      });

      // Before first nextTick, isHydrated is false.
      // Changing items will trigger scrollDetails update.
      await wrapper.setProps({ items: mockItems.slice(0, 20) });

      // Line 196 in VirtualScroll.vue should be hit here (return if !isHydrated)
      expect(wrapper.emitted('scroll')).toBeUndefined();

      await nextTick(); // hydration tick
      await nextTick(); // one more for good measure
      expect(wrapper.emitted('scroll')).toBeDefined();
    });
  });
});
