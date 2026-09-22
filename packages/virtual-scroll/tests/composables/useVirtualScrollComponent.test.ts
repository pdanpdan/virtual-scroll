import type { VirtualScrollComponentSharedProps } from '../../src/composables/useVirtualScrollComponent';
import type { RenderedItem } from '../../src/types';
import type { MockItem } from '../test-helper';

import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, toValue } from 'vue';

import { useVirtualScrollComponent } from '../../src/composables/useVirtualScrollComponent';
import { clearMocks, mockItems, setupMocks } from '../test-helper';

interface HarnessOptions {
  props?: Partial<VirtualScrollComponentSharedProps<MockItem>>;
  itemRole?: string;
  activationMode?: 'item' | 'viewport';
}

/**
 * Mounts a bare component around the composable, the way the two components use
 * it: the DOM refs are bound in the render function, every item goes through
 * `getItemStyle`, and the values under test are published as attributes, so the
 * assertions read what a consumer sees rather than internal refs.
 */
function mountWiring(options: HarnessOptions = {}) {
  const props = ref<VirtualScrollComponentSharedProps<MockItem>>({
    items: mockItems,
    itemSize: 50,
    ...options.props,
  });
  const events = {
    scroll: 0,
    range: 0,
    load: 0,
    activated: [] as number[],
  };
  /** Styles of the very first render, which happens before hydration. */
  let preHydrationStyle: Record<string, string | number | undefined> | undefined;

  const TestComponent = defineComponent({
    setup() {
      let firstRender = true;
      const wiring = useVirtualScrollComponent<MockItem>({
        props: props.value,
        containerTag: 'div',
        ...(options.itemRole === undefined ? {} : { itemRole: options.itemRole }),
        ...(options.activationMode === undefined ? {} : { activationMode: options.activationMode }),
        onScroll: () => { events.scroll++; },
        onVisibleRangeChange: () => { events.range++; },
        onLoad: () => { events.load++; },
        onItemActivate: (index) => { events.activated.push(index); },
      });

      const itemStyle = (item: RenderedItem<MockItem>) => {
        const style = wiring.getItemStyle(item);
        preHydrationStyle ??= style;
        return style;
      };

      return () => {
        const items = toValue(wiring.renderedItems);
        const vertical = toValue(wiring.verticalScrollbarProps);
        const horizontal = toValue(wiring.horizontalScrollbarProps);
        const slotRange = toValue(wiring.slotColumnRange);
        const details = toValue(wiring.scrollDetails);
        const rootAria = toValue(wiring.rootAriaProps);
        const omitTransform = items[ 0 ] ? wiring.getItemStyle(items[ 0 ], true).transform : 'missing';
        const style = firstRender && items[ 0 ] ? itemStyle(items[ 0 ]) : undefined;
        firstRender = false;

        return h('div', {
          ref: wiring.hostRef,
          class: 'harness-container',
          // Tracked like the components' `--hydrated` class, so the first
          // post-hydration render re-runs the item styles.
          'data-hydrated': String(toValue(wiring.isHydrated)),
          'data-bind-aria': String(toValue(wiring.shouldBindItemAria)),
          'data-container-role': String(toValue(wiring.containerRole) ?? 'none'),
          'data-label': String(rootAria[ 'aria-label' ] ?? 'none'),
          'data-busy': String(rootAria[ 'aria-busy' ] ?? 'none'),
          'data-show-scrollbars': String(toValue(wiring.showVirtualScrollbars)),
          'data-vertical-bar': String(vertical?.axis ?? 'none'),
          'data-horizontal-bar': String(horizontal?.axis ?? 'none'),
          'data-bar-total': String(vertical?.scrollbarProps.totalSize ?? 0),
          'data-slot-pad': `${ slotRange.padStart }:${ slotRange.padEnd }`,
          'data-scroll-y': String(Math.round(details.displayScrollOffset.y)),
          'data-debug': String(toValue(wiring.isDebug) ?? false),
          'data-active-index': String(toValue(wiring.activeIndex)),
          'data-hydration-style': JSON.stringify(style ?? null),
          'data-omit-transform': String(omitTransform),
          onKeydown: wiring.handleKeyDown,
          onPointerdown: wiring.handlePointerDown,
        }, [
          h('div', {
            ref: wiring.wrapperRef,
            class: 'harness-wrapper',
            style: toValue(wiring.wrapperStyle),
          }, items.map((item) => h('div', {
            'data-index': item.index,
            ref: (el: unknown) => wiring.setItemRef(el, item.index),
            style: firstRender ? itemStyle(item) : wiring.getItemStyle(item),
            onClick: () => wiring.handleItemActivate(item.index),
          }))),
          // The loading slot always renders in the real components; a consumer
          // drives the scrollbar through this callback.
          h('button', {
            class: 'to-offset',
            onClick: () => wiring.handleScrollbarScrollToOffset('vertical', 500),
          }, 'scroll'),
        ]);
      };
    },
  });

  const wrapper = mount(TestComponent);
  return { props, wrapper, events, hydrationStyle: () => preHydrationStyle };
}

function attrs(wrapper: ReturnType<typeof mountWiring>[ 'wrapper' ]) {
  return wrapper.find('.harness-container').attributes();
}

describe('useVirtualScrollComponent', () => {
  beforeEach(() => {
    setupMocks();
  });

  afterEach(() => {
    clearMocks();
    vi.restoreAllMocks();
  });

  describe('engine wiring', () => {
    it('renders the engine window and reports it through the callbacks', async () => {
      const { wrapper, events } = mountWiring();
      await nextTick();
      await nextTick();

      expect(wrapper.findAll('[data-index]').length).toBeGreaterThan(0);
      expect(events.range).toBeGreaterThan(0);

      const container = wrapper.find('.harness-container').element as HTMLElement;
      container.scrollTop = 400;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();

      expect(events.scroll).toBeGreaterThan(0);
      expect(events.range).toBeGreaterThan(1);
      expect(Number(attrs(wrapper)[ 'data-scroll-y' ])).toBe(400);
    });

    it('treats an omitted direction as a vertical list', async () => {
      // Both the observer wiring and the item styles need a concrete direction.
      const { wrapper, props } = mountWiring();

      expect(props.value.direction).toBeUndefined();
      await nextTick();
      await nextTick();

      expect(attrs(wrapper)[ 'data-hydrated' ]).toBe('true');
      const item = wrapper.find('[data-index]');
      expect(item.exists()).toBe(true);
      expect(item.attributes('style')).toContain('translate');
    });

    it('lays a pre-hydration "both" render out in flow', async () => {
      const { hydrationStyle } = mountWiring({ props: { direction: 'both', columnCount: 3, columnGap: 8 } });
      await nextTick();

      // The first render happens before `isHydrated` flips, so those items are
      // laid out by the browser instead of being positioned absolutely.
      const style = hydrationStyle();
      expect(style).toBeDefined();
      expect(style!.display).toBe('flex');
      expect(style!.columnGap).toBe('8px');
    });

    it('omits the translate when asked, for rows the browser lays out', async () => {
      const { wrapper } = mountWiring();
      await nextTick();
      await nextTick();

      const published = attrs(wrapper)[ 'data-omit-transform' ];
      const rendered = wrapper.find('[data-index]').attributes('style');
      expect(rendered).toContain('translate');
      expect(published === 'undefined' || published === 'missing').toBe(true);
    });

    it('strips the range padding for a two-axis slot', async () => {
      const { wrapper } = mountWiring({ props: { direction: 'both', columnCount: 3, bufferBefore: 5, bufferAfter: 5 } });
      await nextTick();

      expect(attrs(wrapper)[ 'data-slot-pad' ]).toBe('0:0');
    });

    it('loads more when the infinite-loading threshold is crossed', async () => {
      const { wrapper, events } = mountWiring();
      await nextTick();

      const container = wrapper.find('.harness-container').element as HTMLElement;
      container.scrollTop = 100_000;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();

      expect(events.load).toBeGreaterThan(0);
    });

    it('activates an item on request and reports it', async () => {
      const { wrapper, events } = mountWiring({ activationMode: 'item' });
      await nextTick();
      await nextTick();

      await wrapper.find('[data-index]').trigger('click');

      expect(events.activated.length).toBe(1);
    });
  });

  describe('option defaults', () => {
    it('keeps the viewport keyboard model and binds item ARIA without a role', async () => {
      const { wrapper, events } = mountWiring();
      await nextTick();
      await nextTick();

      // No `itemRole` option: items carry their own ARIA attributes.
      expect(attrs(wrapper)[ 'data-bind-aria' ]).toBe('true');

      // No `activationMode` option: the keyboard scrolls the viewport, so no
      // item becomes active.
      await wrapper.find('.harness-container').trigger('keydown', { key: 'ArrowDown' });

      expect(events.activated).toEqual([]);
      expect(attrs(wrapper)[ 'data-active-index' ]).toBe('-1');
    });

    it('moves the active item when the keyboard model asks for it', async () => {
      const { wrapper } = mountWiring({ activationMode: 'item', itemRole: 'row' });
      await nextTick();
      await nextTick();

      await wrapper.find('.harness-container').trigger('keydown', { key: 'ArrowDown' });

      expect(Number(attrs(wrapper)[ 'data-active-index' ])).toBeGreaterThanOrEqual(0);
    });

    it('leaves ARIA off the items when the role is presentational', async () => {
      const { wrapper } = mountWiring({ itemRole: 'none' });
      await nextTick();
      await nextTick();

      expect(attrs(wrapper)[ 'data-bind-aria' ]).toBe('false');
    });
  });

  describe('shared accessibility helpers', () => {
    it('marks a labelled container as a region and reports its busy state', async () => {
      const { wrapper } = mountWiring({ props: { ariaLabel: 'List' } });
      await nextTick();
      await nextTick();

      expect(attrs(wrapper)[ 'data-container-role' ]).toBe('region');
      expect(attrs(wrapper)[ 'data-label' ]).toBe('List');
      expect(attrs(wrapper)[ 'data-busy' ]).toBe('none');
    });

    it('leaves an unlabelled container without a role', async () => {
      const { wrapper } = mountWiring({ props: { loading: true } });
      await nextTick();
      await nextTick();

      expect(attrs(wrapper)[ 'data-container-role' ]).toBe('none');
      expect(attrs(wrapper)[ 'data-busy' ]).toBe('true');
    });

    it('reports the debug flag it was given', async () => {
      const { wrapper } = mountWiring({ props: { debug: true } });
      await nextTick();
      await nextTick();

      expect(attrs(wrapper)[ 'data-debug' ]).toBe('true');
    });
  });

  describe('scrollbar wiring', () => {
    it('publishes slot props for both axes when the content overflows', async () => {
      const { wrapper } = mountWiring({ props: { virtualScrollbar: true, direction: 'both', columnCount: 10 } });
      await nextTick();
      await nextTick();

      expect(attrs(wrapper)[ 'data-show-scrollbars' ]).toBe('true');
      expect(attrs(wrapper)[ 'data-vertical-bar' ]).toBe('vertical');
      expect(attrs(wrapper)[ 'data-horizontal-bar' ]).toBe('horizontal');
      expect(Number(attrs(wrapper)[ 'data-bar-total' ])).toBeGreaterThan(0);
    });

    it('publishes nothing while the content still fits', async () => {
      const { wrapper } = mountWiring({ props: { items: mockItems.slice(0, 2), itemSize: 50, virtualScrollbar: true } });
      await nextTick();
      await nextTick();

      expect(attrs(wrapper)[ 'data-vertical-bar' ]).toBe('none');
      expect(attrs(wrapper)[ 'data-horizontal-bar' ]).toBe('none');
    });

    it('drives the scroll when the scrollbar asks for an offset', async () => {
      const { wrapper } = mountWiring({ props: { virtualScrollbar: true } });
      await nextTick();
      await nextTick();

      await wrapper.find('.to-offset').trigger('click');
      await nextTick();

      expect(Number(attrs(wrapper)[ 'data-scroll-y' ])).toBeCloseTo(500);
    });

    it('keeps the native scrollbar when virtual scrollbars are off', async () => {
      const { wrapper } = mountWiring();
      await nextTick();
      await nextTick();

      expect(attrs(wrapper)[ 'data-show-scrollbars' ]).toBe('false');
    });
  });
});
