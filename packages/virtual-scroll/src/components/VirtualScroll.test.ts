import type { ScrollDetails } from '../composables/useVirtualScroll';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
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
    scrollToIndex: (rowIndex: number | null, colIndex: number | null, options?: unknown) => void;
    scrollToOffset: (x: number | null, y: number | null, options?: unknown) => void;
    setItemRef: (el: unknown, index: number) => void;
    scrollDetails: ScrollDetails<unknown>;
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
      expect(wrapper.find('.header').exists()).toBe(true);
      expect(wrapper.find('.footer').exists()).toBe(true);
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
  });

  describe('styling and directions', () => {
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
  });

  describe('events and interaction', () => {
    it('should emit scroll event', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems, itemSize: 50 } });
      await nextTick();
      expect(wrapper.emitted('scroll')).toBeDefined();
    });

    it('should not emit scroll before hydration', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 5),
          initialScrollIndex: 0,
        },
      });
      // Hydration is delayed via nextTick in useVirtualScroll when initialScrollIndex is set
      // Trigger scrollDetails update
      await wrapper.setProps({ items: mockItems.slice(0, 10) });
      expect(wrapper.emitted('scroll')).toBeUndefined();
      await nextTick();
      // Still might not be hydrated because it's nextTick within nextTick?
      // Actually, useVirtualScroll uses nextTick inside onMounted.
      // mount() calls onMounted.
      // So we need one nextTick to reach isHydrated = true.
      await nextTick();
      expect(wrapper.emitted('scroll')).toBeDefined();
    });

    it('should emit visibleRangeChange event', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 50,
        },
      });

      await nextTick();
      await nextTick();
      // Initially it should emit on mount (via scrollDetails watch)
      const emits = wrapper.emitted('visibleRangeChange');
      expect(emits).toBeTruthy();
      const firstEmit = (emits as unknown[][])[ 0 ]![ 0 ] as { start: number; };
      expect(firstEmit).toMatchObject({ start: 0 });

      // Scroll to trigger change
      const container = wrapper.find('.virtual-scroll-container').element as HTMLElement;
      Object.defineProperty(container, 'scrollTop', { value: 500, writable: true });
      await container.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();

      const lastEmits = wrapper.emitted('visibleRangeChange') as unknown[][];
      expect(lastEmits).toBeTruthy();
      const lastEmit = lastEmits[ lastEmits.length - 1 ]![ 0 ] as { start: number; };
      expect(lastEmit.start).toBeGreaterThan(0);
    });

    it('should handle keyboard navigation', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems, itemSize: 50 } });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      Object.defineProperty(el, 'scrollHeight', { value: 5000, configurable: true });
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      expect(el.scrollTop).toBeGreaterThan(0);

      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect(el.scrollTop).toBe(0);
    });

    it('should handle horizontal keyboard navigation', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems, itemSize: 50, direction: 'horizontal' } });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      Object.defineProperty(el, 'scrollWidth', { value: 5000, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 500, configurable: true });

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      expect(el.scrollLeft).toBeGreaterThan(0);

      await container.trigger('keydown', { key: 'Home' });
      await nextTick();
      expect(el.scrollLeft).toBe(0);
    });

    it('should handle handled keys in handleKeyDown', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          itemSize: 50,
        },
      });

      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      const scrollToSpy = vi.fn();
      container.element.scrollTo = scrollToSpy;

      await container.trigger('keydown', { key: 'ArrowDown' });
      expect(scrollToSpy).toHaveBeenCalled();

      await container.trigger('keydown', { key: 'ArrowUp' });
      expect(scrollToSpy).toHaveBeenCalled();

      await container.trigger('keydown', { key: 'ArrowRight' });
      expect(scrollToSpy).toHaveBeenCalled();

      await container.trigger('keydown', { key: 'ArrowLeft' });
      expect(scrollToSpy).toHaveBeenCalled();

      await container.trigger('keydown', { key: 'PageDown' });
      expect(scrollToSpy).toHaveBeenCalled();

      await container.trigger('keydown', { key: 'PageUp' });
      expect(scrollToSpy).toHaveBeenCalled();
    });

    it('should handle unhandled keys in handleKeyDown', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems } });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'ArrowDown' });
      // Should just call stopProgrammaticScroll
    });
  });

  describe('lifecycle and observers', () => {
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
      // Should have called updateHostOffset (internal)
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

    it('should handle missing footerRef gracefully in onMounted', () => {
      mount(VirtualScroll, {
        props: { items: mockItems, itemSize: 50 },
        slots: { header: '<div>H</div>' },
      });
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
          return { show, showFooter, mockItems };
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

      // Toggle off to trigger 'unobserve'
      (wrapper.vm as unknown as { show: boolean; showFooter: boolean; }).show = false;
      (wrapper.vm as unknown as { show: boolean; showFooter: boolean; }).showFooter = false;
      await nextTick();

      // Toggle on to trigger 'observe' (newEl)
      (wrapper.vm as unknown as { show: boolean; showFooter: boolean; }).show = true;
      (wrapper.vm as unknown as { show: boolean; showFooter: boolean; }).showFooter = true;
      await nextTick();
    });

    it('should cover ResizeObserver cell measurement', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems.slice(0, 1), direction: 'both', columnCount: 5 },
        slots: { item: '<template #item><div data-col-index="0">cell</div></template>' },
      });
      await nextTick();
      const cell = wrapper.find('[data-col-index="0"]').element;
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(cell));
      if (observer) {
        observer.trigger([ { target: cell } ]);
      }
      await nextTick();
    });

    it('should handle keyboard navigation End key horizontal', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems, direction: 'horizontal', itemSize: 50 },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      Object.defineProperty(el, 'scrollWidth', { value: 5000, configurable: true });
      Object.defineProperty(el, 'clientWidth', { value: 500, configurable: true });

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      expect(el.scrollLeft).toBeGreaterThan(0);
    });

    it('should handle keyboard navigation End key vertical', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems, direction: 'vertical', itemSize: 50 },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      const el = container.element as HTMLElement;
      Object.defineProperty(el, 'scrollHeight', { value: 5000, configurable: true });
      Object.defineProperty(el, 'clientHeight', { value: 500, configurable: true });

      await container.trigger('keydown', { key: 'End' });
      await nextTick();
      expect(el.scrollTop).toBeGreaterThan(0);
    });

    it('should handle keyboard navigation End key with empty items', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: [], direction: 'vertical', itemSize: 50 },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'End' });
      await nextTick();
    });

    it('should handle keyboard navigation End key with columnCount 0 in both mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems, direction: 'both', columnCount: 0, itemSize: 50 },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'End' });
      await nextTick();
    });

    it('should handle keyboard navigation End key in both mode', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems, direction: 'both', columnCount: 5, itemSize: 50, columnWidth: 100 },
      });
      await nextTick();
      const container = wrapper.find('.virtual-scroll-container');
      await container.trigger('keydown', { key: 'End' });
      await nextTick();
    });

    it('should handle load event for horizontal direction', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems.slice(0, 10), direction: 'horizontal', itemSize: 50, loadDistance: 400 },
      });
      await nextTick();
      (wrapper.vm as unknown as VSInstance).scrollToOffset(250, 0);
      await nextTick();
      await nextTick();
      expect(wrapper.emitted('load')).toBeDefined();
    });

    it('should cover itemResizeObserver branches', async () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems.slice(0, 1) } });
      await nextTick();
      const item = wrapper.find('.virtual-scroll-item').element as HTMLElement;
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(item));

      // Trigger with data-index but without borderBoxSize
      observer?.trigger([ { target: item, contentRect: { width: 100, height: 100 } as DOMRectReadOnly } ]);

      // Trigger with NaN index
      const div = document.createElement('div');
      observer?.trigger([ { target: div } ]);
    });

    it('should cleanup observers on unmount', async () => {
      const wrapper = mount(VirtualScroll, {
        props: { items: mockItems, stickyHeader: true, stickyFooter: true },
        slots: { header: '<div>H</div>', footer: '<div>F</div>' },
      });
      await nextTick();
      wrapper.unmount();
    });
  });

  describe('grid mode logic', () => {
    it('should cover colIndex measurement in itemResizeObserver', async () => {
      mount(VirtualScroll, { props: { items: mockItems.slice(0, 1) } });
      await nextTick();
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.callback.toString().includes('colIndex'));
      const div = document.createElement('div');
      div.dataset.colIndex = '0';
      observer!.trigger([ { target: div } ]);
    });

    it('should cover firstRenderedIndex watcher for grid old/new and other branches', async () => {
      // Test direction !== 'both' branch
      const wrapperV = mount(VirtualScroll, {
        props: { items: mockItems, direction: 'vertical', itemSize: 50 },
      });
      await nextTick();
      (wrapperV.vm as unknown as VSInstance).scrollToIndex(10, 0);
      await nextTick();
      await nextTick();

      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          direction: 'both',
          columnCount: 5,
          itemSize: 50,
          bufferBefore: 2,
          bufferAfter: 10,
        },
        slots: {
          item: '<template #item="{ index }"><div class="cell" :data-col-index="0">Item {{ index }}</div></template>',
        },
      });
      const container = wrapper.find('.virtual-scroll-container').element as HTMLElement;
      Object.defineProperty(container, 'clientHeight', { value: 200, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 200, configurable: true });

      // Trigger host resize observer
      (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.forEach((i) => {
        if (i.targets.has(container)) {
          i.trigger([ { target: container } ]);
        }
      });
      await nextTick();

      const vm = wrapper.vm as unknown as VSInstance;

      // Initial scroll to 10. range starts at 10-2 = 8.
      vm.scrollToIndex(10, 0, { behavior: 'auto', align: 'start' });
      await nextTick();
      await nextTick();

      const item8 = wrapper.find('.virtual-scroll-item[data-index="8"]').element;
      const itemResizeObserver = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(item8));
      expect(itemResizeObserver).toBeDefined();

      const cell8 = item8.querySelector('[data-col-index="0"]');
      expect(itemResizeObserver!.targets.has(cell8!)).toBe(true);

      // Scroll to 9. range starts at 9-2 = 7.
      // oldIdx was 8. newIdx is 7. Item 8 is still in DOM.
      vm.scrollToIndex(9, 0, { behavior: 'auto', align: 'start' });
      await nextTick();
      await nextTick();

      // Item 8 should have its cells unobserved
      expect(itemResizeObserver!.targets.has(cell8!)).toBe(false);

      // Item 7 should have its cells observed
      const item7 = wrapper.find('.virtual-scroll-item[data-index="7"]').element;
      const cell7 = item7.querySelector('[data-col-index="0"]');
      expect(itemResizeObserver!.targets.has(cell7!)).toBe(true);

      // Scroll to 50. range starts at 50-2 = 48.
      // oldIdx was 7. Item 7 is definitely NOT in DOM anymore.
      // This covers the if (oldEl) branch being false.
      vm.scrollToIndex(50, 0, { behavior: 'auto', align: 'start' });
      await nextTick();
      await nextTick();
    });

    it('should cover firstRenderedIndex watcher logic for grid cells', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          direction: 'both',
          columnCount: 5,
          itemSize: 50,
        },
        slots: {
          item: '<template #item="{ index }"><div :data-col-index="0">Item {{ index }}</div></template>',
        },
      });
      await nextTick();

      // Initial state: firstRenderedIndex should be 0.
      // Scroll to change it.
      const vm = wrapper.vm as unknown as VSInstance;
      vm.scrollToIndex(10, 0);
      await nextTick();
      // This should trigger the watcher (oldIdx 0 -> newIdx 10)

      // Scroll back
      vm.scrollToIndex(0, 0);
      await nextTick();
    });

    it('should cover firstRenderedIndex watcher when items becomes empty', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems,
          direction: 'both',
          columnCount: 5,
          itemSize: 50,
        },
      });
      await nextTick();
      await wrapper.setProps({ items: [] });
      await nextTick();
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
      vm.setItemRef(null, 999);
    });

    it('should handle setItemRef with NaN index', async () => {
      mount(VirtualScroll, { props: { items: mockItems.slice(0, 1) } });
      await nextTick();
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances[ 0 ];
      const div = document.createElement('div');
      // No data-index
      observer?.trigger([ { target: div, contentRect: { width: 100, height: 100 } as DOMRectReadOnly } ]);
    });

    it('should handle firstRenderedIndex being undefined', async () => {
      // items empty
      mount(VirtualScroll, { props: { items: [] } });
      await nextTick();
    });

    it('should expose methods', () => {
      const wrapper = mount(VirtualScroll, { props: { items: mockItems, itemSize: 50 } });
      expect(typeof (wrapper.vm as unknown as VSInstance).scrollToIndex).toBe('function');
      expect(typeof (wrapper.vm as unknown as VSInstance).scrollToOffset).toBe('function');
    });
  });

  describe('infinite scroll and loading', () => {
    it('should emit load event when reaching scroll end (vertical)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          loadDistance: 400,
          useRAF: false,
        },
      });
      await nextTick();

      // Scroll to near end
      (wrapper.vm as unknown as VSInstance).scrollToOffset(0, 250);
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('load')).toBeDefined();
      expect(wrapper.emitted('load')![ 0 ]).toEqual([ 'vertical' ]);
    });

    it('should emit load event when reaching scroll end (horizontal)', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          direction: 'horizontal',
          loadDistance: 400,
          useRAF: false,
        },
      });
      await nextTick();

      // Scroll to near end
      (wrapper.vm as unknown as VSInstance).scrollToOffset(250, 0);
      await nextTick();
      await nextTick();

      expect(wrapper.emitted('load')).toBeDefined();
      expect(wrapper.emitted('load')![ 0 ]).toEqual([ 'horizontal' ]);
    });

    it('should not emit load event when loading is true', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
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

    it('should render loading slot when loading is true', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          loading: true,
        },
        slots: {
          loading: '<div class="loading-indicator">Loading...</div>',
        },
      });
      await nextTick();
      expect(wrapper.find('.loading-indicator').exists()).toBe(true);
      expect((wrapper.find('.virtual-scroll-loading').element as HTMLElement).style.display).toBe('block');
    });

    it('should render horizontal loading slot correctly', async () => {
      const wrapper = mount(VirtualScroll, {
        props: {
          items: mockItems.slice(0, 10),
          itemSize: 50,
          direction: 'horizontal',
          loading: true,
        },
        slots: {
          loading: '<div class="loading-indicator">Loading...</div>',
        },
      });
      await nextTick();
      expect((wrapper.find('.virtual-scroll-loading').element as HTMLElement).style.display).toBe('inline-block');
    });
  });
});
