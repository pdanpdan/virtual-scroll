import type { MasonryScrollDetails, VirtualScrollMasonryInstance } from '../../src/types';
import type { VueWrapper } from '@vue/test-utils';
import type { Component } from 'vue';

import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { h, nextTick } from 'vue';

import VirtualScrollMasonry from '../../src/components/VirtualScrollMasonry.vue';
import { clearMocks, observers, setupMocks, triggerResize } from '../test-helper';

/** Deterministic canonical oracle (mirrors the composable tests). */
function oracle(i: number, width: number): number {
  const x = Math.imul(i + 1, 2654435761) >>> 0;
  return 40 + (x % 7) * 20 + (width % 50);
}

function makeItems(count: number): number[] {
  return Array.from({ length: count }, (_, i) => i);
}

/** Parse the per-card inline transform into x/y. */
function parseTranslate(el: Element): { x: number; y: number; } {
  const transform = el.getAttribute('style') ?? '';
  const match = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(transform);
  return match ? { x: Number(match[ 1 ]), y: Number(match[ 2 ]) } : { x: 0, y: 0 };
}

/** Brute-force greedy reference for the measured-mode assertions. */
function greedyReference(
  count: number,
  columns: number,
  columnWidth: number,
  gap: number,
  heightOf: (index: number) => number,
): { y: number[]; total: number; } {
  const tops = new Float64Array(columns);
  const y = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    let best = 0;
    for (let c = 1; c < columns; c++) {
      if (tops[ c ]! < tops[ best ]!) {
        best = c;
      }
    }
    y[ i ] = tops[ best ]!;
    tops[ best ] = tops[ best ]! + heightOf(i) + gap;
  }
  return { y: Array.from(y), total: Math.max(...Array.from(tops)) };
}

/** Loose component type: masonry props carry functions, so skip per-prop inference. */
const MasonryAny = VirtualScrollMasonry as unknown as Component;

function mountMasonry(overrides: Record<string, unknown> = {}) {
  const wrapper = mount(MasonryAny, {
    props: {
      items: makeItems(1000),
      itemHeight: (_item: unknown | undefined, index: number, width: number) => oracle(index, width),
      ...overrides,
    },
    slots: {
      item: (scope: Record<string, unknown>) => h('div', { class: 'card-label' }, `#${ String(scope.index) }`),
    },
  });
  const vm = wrapper.vm as unknown as VirtualScrollMasonryInstance<number>;
  return { wrapper, vm };
}

function scrollTo(wrapper: VueWrapper, y: number) {
  const el = wrapper.find('.virtual-scroll-container').element as HTMLElement;
  el.scrollTop = y;
  el.dispatchEvent(new Event('scroll'));
}

describe('virtualScrollMasonry', () => {
  setupMocks();

  beforeEach(() => {
    clearMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders only the viewport window of cards with canonical geometry', async () => {
    const { wrapper } = mountMasonry();
    await nextTick();
    await nextTick();

    const items = wrapper.findAll('.virtual-scroll-item');
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThan(60);

    const first = items[ 0 ]!;
    expect(first.attributes('data-index')).toBe('0');
    const style = first.attributes('style') ?? '';
    expect(style).toContain(`width: 245px`);
    expect(style).toContain(`height: ${ oracle(0, 245) }px`);
    expect(style).toContain('translate(0px, 0px)');
    expect(first.text()).toContain('#0');
    wrapper.unmount();
  });

  it('measures mounted cards with ResizeObserver when measuredHeights is enabled', async () => {
    const { wrapper, vm } = mountMasonry({
      items: makeItems(500),
      itemHeight: () => 100,
      measuredHeights: true,
    });
    await nextTick();
    await nextTick();
    const cardOf = (i: number) => wrapper.find(`[data-index="${ i }"]`);
    const first = cardOf(0);
    // Measured mode: no forced height, only a minimum seeded from the oracle.
    const firstStyle = first.attributes('style') ?? '';
    expect(firstStyle).toContain('min-height: 100px');
    expect(firstStyle).not.toMatch(/(?:^|; )height: /);
    // A per-card ResizeObserver is attached.
    expect(observers.some((o) => o.targets.has(first.element))).toBe(true);
    // The measured box (400 px) overrides the oracle (100 px) for the layout:
    // greedy placement is recomputed, so follow the brute-force reference.
    triggerResize(first.element, 245, 400);
    await nextTick();
    await nextTick();
    const ref = greedyReference(500, 2, 245, 10, (i) => (i === 0 ? 400 : 100));
    expect(vm.totalHeight).toBeCloseTo(ref.total, 4);
    expect(parseTranslate(cardOf(4).element).y).toBeCloseTo(ref.y[ 4 ]!, 4);
    expect(parseTranslate(cardOf(2).element).y).toBeCloseTo(ref.y[ 2 ]!, 4);
    expect(cardOf(0).attributes('style')).toContain('min-height: 400px');
    wrapper.unmount();
  });
  it('falls back to offsetHeight when borderBoxSize is missing', async () => {
    const { wrapper, vm } = mountMasonry({
      items: makeItems(300),
      itemHeight: () => 100,
      measuredHeights: true,
    });
    await nextTick();
    await nextTick();
    const first = wrapper.find('[data-index="0"]');
    Object.defineProperty(first.element, 'offsetHeight', { configurable: true, value: 600 });
    const measureObserver = observers.find((o) => o.targets.has(first.element))!;
    expect(measureObserver).toBeDefined();
    measureObserver.callback([ {
      target: first.element,
      contentRect: { height: 5, width: 245 },
      borderBoxSize: [],
    } as unknown as ResizeObserverEntry ], measureObserver as unknown as ResizeObserver);
    await nextTick();
    await nextTick();

    const ref = greedyReference(300, 2, 245, 10, (i) => (i === 0 ? 600 : 100));
    expect(vm.totalHeight).toBeCloseTo(ref.total, 4);
    expect(parseTranslate(wrapper.find('[data-index="4"]').element).y).toBeCloseTo(ref.y[ 4 ]!, 4);
    wrapper.unmount();
  });
  it('skips malformed measurement entries without reflowing', async () => {
    const { wrapper, vm } = mountMasonry({
      items: makeItems(200),
      itemHeight: () => 100,
      measuredHeights: true,
    });
    await nextTick();
    await nextTick();
    const first = wrapper.find('[data-index="0"]');
    const measureObserver = observers.find((o) => o.targets.has(first.element))!;
    const totalBefore = vm.totalHeight;
    // A target without a dataset index.
    const bare = document.createElement('div');
    measureObserver.observe(bare);
    measureObserver.callback([ {
      target: bare,
      contentRect: { height: 300, width: 245 },
      borderBoxSize: [ { blockSize: 300, inlineSize: 245 } ],
    } as unknown as ResizeObserverEntry ], measureObserver as unknown as ResizeObserver);
    await nextTick();
    expect(vm.totalHeight).toBe(totalBefore);
    // A measured card whose box is not a finite number.
    Object.defineProperty(first.element, 'offsetHeight', { configurable: true, value: Number.NaN });
    measureObserver.callback([ {
      target: first.element,
      contentRect: { height: Number.NaN, width: 245 },
      borderBoxSize: [],
    } as unknown as ResizeObserverEntry ], measureObserver as unknown as ResizeObserver);
    await nextTick();
    expect(vm.totalHeight).toBe(totalBefore);
    wrapper.unmount();
  });
  it('attaches no per-card observers in canonical mode', async () => {
    const { wrapper } = mountMasonry({
      items: makeItems(200),
      itemHeight: () => 100,
    });
    await nextTick();
    await nextTick();
    const cardEl = wrapper.find('.virtual-scroll-item').element;
    expect(observers.some((o) => o.targets.has(cardEl))).toBe(false);
    expect(wrapper.find('.virtual-scroll-item').attributes('style')).toContain('height: 100px');
    wrapper.unmount();
  });
  it('honors every explicit geometry prop', async () => {
    const { wrapper, vm } = mountMasonry({
      items: makeItems(300),
      itemHeight: (_item: unknown | undefined, index: number, width: number) => oracle(index, width),
      targetColumnWidth: 260,
      minColumns: 2,
      maxColumns: 4,
      gap: 12,
      segmentSize: 50,
      virtualScrollbar: false,
      debug: false,
      role: 'listbox',
      itemRole: 'option',
    });
    await nextTick();
    await nextTick();

    // 500px wide, target 260 + gap 12 -> floor(512 / 272) = 1 col, clamped to 2.
    expect(vm.columns).toBe(2);
    expect(vm.columnWidth).toBeCloseTo(244, 4);
    expect(wrapper.find('.virtual-scroll-wrapper').attributes('role')).toBe('listbox');
    expect(wrapper.find('.virtual-scroll-item').attributes('role')).toBe('option');
    expect(wrapper.find('.virtual-scrollbar-track').exists()).toBe(false);
    wrapper.unmount();
  });

  it('re-renders the window on scroll with bounded DOM and correct positions', async () => {
    const { wrapper } = mountMasonry({
      items: makeItems(20000),
    });
    await nextTick();
    await nextTick();

    scrollTo(wrapper, 300_000);
    await nextTick();
    await nextTick();

    const items = wrapper.findAll('.virtual-scroll-item');
    expect(items.length).toBeLessThan(300);
    expect(items.length).toBeGreaterThan(0);
    const indexes = items.map((item) => Number(item.attributes('data-index')));
    expect(indexes.every((i) => i >= 0 && i < 20000)).toBe(true);
    expect(Math.min(...indexes)).toBeGreaterThan(1000);
    // Cards are placed below the scroll line and above its bottom edge.
    for (const item of items) {
      const pos = parseTranslate(item.element);
      expect(pos.y).toBeLessThan(300_500);
      expect(pos.y + oracle(Number(item.attributes('data-index')), 242.5)).toBeGreaterThan(300_000);
    }
    wrapper.unmount();
  });

  it('renders nothing when the dataset is empty and recovers when items arrive', async () => {
    const wrapper = mount(MasonryAny, {
      props: {
        items: [],
        itemHeight: (_item: unknown | undefined, index: number, width: number) => oracle(index, width),
      },
      slots: {
        item: (scope: Record<string, unknown>) => h('div', `#${ String(scope.index) }`),
      },
    });
    await nextTick();
    await nextTick();
    expect(wrapper.findAll('.virtual-scroll-item')).toHaveLength(0);
    expect(wrapper.find('.virtual-scroll-wrapper').attributes('style')).toContain('block-size: 0px');

    await wrapper.setProps({ items: makeItems(200) });
    await nextTick();
    await nextTick();
    const items = wrapper.findAll('.virtual-scroll-item');
    expect(items.length).toBeGreaterThan(0);
    wrapper.unmount();
  });

  it('pins the topmost visible card at its screen offset across a reflow', async () => {
    const { wrapper, vm } = mountMasonry({
      items: makeItems(5000),
    });
    await nextTick();
    await nextTick();

    const container = wrapper.find('.virtual-scroll-container').element as HTMLElement;
    const line = 3000;
    scrollTo(wrapper, line);
    await nextTick();
    await nextTick();

    // Find the straddling card in the DOM (max-y straddler, like the composable).
    const straddler = wrapper.findAll('.virtual-scroll-item')
      .map((item) => ({ el: item.element, index: Number(item.attributes('data-index')), y: parseTranslate(item.element).y }))
      .filter((card) => card.y <= line)
      .sort((a, b) => b.y - a.y)[ 0 ];
    expect(straddler).toBeDefined();
    const delta = line - straddler!.y;

    // Narrow the container: 2 columns become 1 at 490px+, heights change too.
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 300 });
    triggerResize(container, 300, 500);
    await nextTick();
    await nextTick();

    const after = wrapper.findAll('.virtual-scroll-item')
      .map((item) => ({ index: Number(item.attributes('data-index')), y: parseTranslate(item.element).y }))
      .find((card) => card.index === straddler!.index);
    expect(after).toBeDefined();
    // Same card, same screen delta: the container scroll snapped to the anchor.
    expect(container.scrollTop).toBeCloseTo(after!.y + delta, 4);
    // The card straddles the viewport top again.
    const pos = parseTranslate(wrapper.find(`[data-index="${ straddler!.index }"]`).element);
    expect(pos.y <= container.scrollTop && pos.y + oracle(straddler!.index, 300) > container.scrollTop).toBe(true);
    expect(vm.columns).toBe(1);
    expect(vm.columnWidth).toBe(300);
    wrapper.unmount();
  });

  it('exposes instance state and programmatic scroll controls', async () => {
    const { wrapper, vm } = mountMasonry();
    await nextTick();
    await nextTick();

    expect(vm.columns).toBe(2);
    expect(vm.columnWidth).toBe(245);
    expect(vm.totalHeight).toBeGreaterThan(0);
    expect(vm.scrollDetails.totalSize.height).toBe(vm.totalHeight);
    // 1000 items at the default 500-item segments: the two segments covering
    // the viewport window are chained, so the total is already exact.
    expect(vm.totalHeightExact).toBe(true);

    const before = vm.scrollDetails.currentIndex;
    vm.scrollToIndex(500, { align: 'start', behavior: 'auto' });
    await nextTick();
    await nextTick();
    expect(vm.scrollDetails.currentIndex).not.toBe(before);
    expect(wrapper.find('[data-index="500"]').exists()).toBe(true);

    // Smooth programmatic scrolls go through the native scrollTo API.
    vm.scrollToIndex(100, { align: 'center' });
    expect(vi.mocked(HTMLElement.prototype.scrollTo).mock.calls.at(-1)?.[ 0 ]).toEqual(expect.objectContaining({ behavior: 'smooth' }));

    vm.scrollToOffset(Number.POSITIVE_INFINITY);
    await nextTick();
    await nextTick();
    const container = wrapper.find('.virtual-scroll-container').element as HTMLElement;
    expect(Math.abs(container.scrollTop - Math.max(0, vm.totalHeight - 500))).toBeLessThanOrEqual(1);
    wrapper.unmount();
  });

  it('drives the container from overlay scrollbar track clicks', async () => {
    const { wrapper, vm } = mountMasonry({
      items: makeItems(2000),
    });
    await nextTick();
    await nextTick();

    const container = wrapper.find('.virtual-scroll-container').element as HTMLElement;
    const track = wrapper.find('.virtual-scrollbar-track');
    expect(track.exists()).toBe(true);
    const rect = {
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 8,
      bottom: 500,
      width: 8,
      height: 500,
      toJSON: () => ({}),
    } as DOMRect;
    vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue(rect);

    // Click in the middle of the track: jump roughly to the middle.
    await track.trigger('mousedown', { clientY: 250 });
    await nextTick();
    const range = vm.totalHeight - 500;
    expect(container.scrollTop).toBeGreaterThan(range * 0.4);
    expect(container.scrollTop).toBeLessThan(range * 0.6);

    // Click near the bottom edge: snap to the very end.
    await track.trigger('mousedown', { clientY: 498 });
    await nextTick();
    expect(container.scrollTop).toBeCloseTo(range, 0);
    wrapper.unmount();
  });

  it('shows the overlay scrollbar only when the content overflows', async () => {
    const { wrapper, vm } = mountMasonry({
      items: makeItems(100),
    });
    await nextTick();
    await nextTick();

    // 100 cards ~ 3800px over a 500px viewport: overlay scrollbar present.
    expect(wrapper.find('.virtual-scrollbar-track').exists()).toBe(true);
    expect(wrapper.find('.virtual-scroll-container').classes()).toContain('virtual-scroll--hide-scrollbar');
    const wrapperStyle = wrapper.find('.virtual-scroll-wrapper').attributes('style') ?? '';
    expect(Number.parseFloat(/(?:height|block-size): ([-\d.]+)px/.exec(wrapperStyle)?.[ 1 ] ?? '0')).toBeCloseTo(vm.totalHeight, 4);
    wrapper.unmount();
  });

  it('hides the overlay scrollbar when it fits or when disabled', async () => {
    const { wrapper } = mountMasonry({
      items: makeItems(100),
      itemHeight: () => 20,
    });
    await nextTick();
    await nextTick();
    // 100 * 20px = 2000px content over 500px viewport still overflows with
    // 5 columns... keep 10 items so the content fits entirely.
    wrapper.unmount();

    const fitting = mount(VirtualScrollMasonry, {
      props: {
        items: makeItems(10),
        itemHeight: () => 20,
      },
    });
    await nextTick();
    await nextTick();
    expect(fitting.find('.virtual-scrollbar-track').exists()).toBe(false);
    fitting.unmount();

    const disabled = mount(VirtualScrollMasonry, {
      props: {
        items: makeItems(1000),
        itemHeight: (_item: unknown | undefined, index: number, width: number) => oracle(index, width),
        virtualScrollbar: false,
      },
    });
    await nextTick();
    await nextTick();
    expect(disabled.find('.virtual-scrollbar-track').exists()).toBe(false);
    expect(disabled.find('.virtual-scroll-container').classes()).not.toContain('virtual-scroll--hide-scrollbar');
    disabled.unmount();
  });

  it('emits scroll details with current, range and total fields', async () => {
    const { wrapper } = mountMasonry();
    await nextTick();
    await nextTick();

    const emitted = wrapper.emitted<[ MasonryScrollDetails<number> ]>('scroll');
    expect(emitted).toBeTruthy();
    const details = emitted?.at(-1)?.[ 0 ];
    expect(details).toBeDefined();
    expect(details!.totalSize.height).toBeGreaterThan(0);
    expect(details!.range.start).toBeLessThan(details!.range.end);
    expect(details!.viewportSize.height).toBe(500);
    wrapper.unmount();
  });

  it('applies semantic roles and ARIA attributes', async () => {
    const { wrapper } = mountMasonry({
      ariaLabel: 'Masonry grid',
    });
    await nextTick();
    await nextTick();

    const container = wrapper.find('.virtual-scroll-container');
    expect(container.attributes('role')).toBe('region');
    expect(container.attributes('aria-label')).toBe('Masonry grid');
    expect(container.attributes('tabindex')).toBe('0');
    expect(wrapper.find('.virtual-scroll-wrapper').attributes('role')).toBe('list');
    expect(wrapper.find('.virtual-scroll-item').attributes('role')).toBe('listitem');
    wrapper.unmount();

    const none = mount(VirtualScrollMasonry, {
      props: {
        items: makeItems(100),
        itemHeight: (_item: unknown | undefined, index: number, width: number) => oracle(index, width),
        itemRole: 'none',
      },
    });
    await nextTick();
    await nextTick();
    expect(none.find('.virtual-scroll-item').attributes('role')).toBe('none');
    none.unmount();
  });

  it('maps tree, menu, grid and listbox wrapper roles to their child roles', async () => {
    for (const [ role, childRole ] of [ [ 'tree', 'treeitem' ], [ 'menu', 'menuitem' ], [ 'grid', 'row' ], [ 'listbox', 'option' ] ] as const) {
      const wrapper = mount(MasonryAny, {
        props: {
          items: makeItems(60),
          itemHeight: (_item: unknown | undefined, index: number, width: number) => oracle(index, width),
          role,
        },
      });
      await nextTick();
      await nextTick();
      expect(wrapper.find('.virtual-scroll-wrapper').attributes('role')).toBe(role);
      expect(wrapper.find('.virtual-scroll-item').attributes('role')).toBe(childRole);
      wrapper.unmount();
    }
  });

  it('renders debug overlays when debug is enabled', async () => {
    const { wrapper } = mountMasonry({
      debug: true,
    });
    await nextTick();
    await nextTick();
    expect(wrapper.find('.virtual-scroll-debug-info').exists()).toBe(true);
    expect(wrapper.find('.virtual-scroll-debug-info').text()).toContain('#0');
    wrapper.unmount();
  });
});
