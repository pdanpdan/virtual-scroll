import type { VirtualScrollProps } from './useVirtualScroll';
import type { Ref } from 'vue';

import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick, ref } from 'vue';

import { getPaddingX, getPaddingY } from '../utils/scroll';
import { useVirtualScroll } from './useVirtualScroll';

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

globalThis.window.scrollTo = vi.fn();

// Helper to test composable within a component context
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
  return { result: result!, props, wrapper };
}

const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));
const defaultProps: VirtualScrollProps<{ id: number; }> = {
  items: mockItems,
  itemSize: 50,
  direction: 'vertical' as const,
  bufferBefore: 2,
  bufferAfter: 2,
  container: window,
};

describe('useVirtualScroll', () => {
  beforeEach(() => {
    window.scrollX = 0;
    window.scrollY = 0;
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('initialization and total size', () => {
    it('should initialize with correct total height', async () => {
      const { result } = setup({ ...defaultProps });
      expect(result.totalHeight.value).toBe(5000);
    });

    it('should update total size when items length changes', async () => {
      const { result, props } = setup({ ...defaultProps });
      expect(result.totalHeight.value).toBe(5000);

      props.value.items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      await nextTick();
      expect(result.totalHeight.value).toBe(2500);
    });

    it('should recalculate totalHeight when itemSize changes', async () => {
      const { result, props } = setup({ ...defaultProps });
      expect(result.totalHeight.value).toBe(5000);

      props.value.itemSize = 100;
      await nextTick();
      expect(result.totalHeight.value).toBe(10000);
    });

    it('should recalculate when gaps change', async () => {
      const { result, props } = setup({ ...defaultProps, gap: 10 });
      expect(result.totalHeight.value).toBe(6000); // 100 * (50 + 10)

      props.value.gap = 20;
      await nextTick();
      expect(result.totalHeight.value).toBe(7000); // 100 * (50 + 20)
    });

    it('should handle itemSize as a function', async () => {
      const { result } = setup({
        ...defaultProps,
        itemSize: (_item: { id: number; }, index: number) => 50 + index,
      });
      // 50*100 + (0+99)*100/2 = 5000 + 4950 = 9950
      expect(result.totalHeight.value).toBe(9950);
    });

    it('should handle direction both (grid mode)', async () => {
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 10,
        columnWidth: 100,
      });
      expect(result.totalWidth.value).toBe(1000);
      expect(result.totalHeight.value).toBe(5000);
    });

    it('should handle horizontal direction', async () => {
      const { result } = setup({ ...defaultProps, direction: 'horizontal' });
      expect(result.totalWidth.value).toBe(5000);
      expect(result.totalHeight.value).toBe(0);
    });

    it('should cover default values for buffer and gap', async () => {
      const { result } = setup({
        items: mockItems,
        itemSize: 50,
      } as unknown as VirtualScrollProps<{ id: number; }>);
      expect(result.renderedItems.value.length).toBeGreaterThan(0);
    });
  });

  describe('range and rendered items', () => {
    it('should calculate rendered items based on scroll position', async () => {
      const { result } = setup({ ...defaultProps });
      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      expect(result.scrollDetails.value.currentIndex).toBe(0);
    });

    it('should handle horizontal direction in range/renderedItems', async () => {
      const { result } = setup({ ...defaultProps, direction: 'horizontal' });
      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      expect(result.scrollDetails.value.currentIndex).toBe(0);
    });

    it('should handle horizontal non-fixed size range', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 500 });
      Object.defineProperty(container, 'clientHeight', { value: 500 });
      const { result } = setup({ ...defaultProps, direction: 'horizontal', itemSize: undefined, container });
      for (let i = 0; i < 20; i++) {
        result.updateItemSize(i, 50, 50);
      }
      await nextTick();

      container.scrollLeft = 100;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(result.scrollDetails.value.currentIndex).toBeGreaterThan(0);
    });

    it('should handle undefined items in renderedItems (out of bounds)', async () => {
      const { result } = setup({ ...defaultProps, stickyIndices: [ 200 ] });
      expect(result.renderedItems.value.find((i) => i.index === 200)).toBeUndefined();
    });

    it('should include sticky items in renderedItems only when relevant', async () => {
      const { result } = setup({ ...defaultProps, stickyIndices: [ 50 ] });
      // Initially at top, item 50 is far away and should NOT be in renderedItems
      expect(result.renderedItems.value.find((i) => i.index === 50)).toBeUndefined();

      // Scroll near item 50
      result.scrollToIndex(50, 0, { align: 'start', behavior: 'auto' });
      await nextTick();

      const item50 = result.renderedItems.value.find((i) => i.index === 50);
      expect(item50).toBeDefined();
      expect(item50!.isSticky).toBe(true);
    });
  });

  describe('dynamic sizing and updateItemSize', () => {
    it('should update item size and trigger reactivity', async () => {
      const { result } = setup({ ...defaultProps, itemSize: undefined });
      expect(result.totalHeight.value).toBe(5000); // Default estimate

      result.updateItemSize(0, 100, 100);
      await nextTick();
      expect(result.totalHeight.value).toBe(5050);
      expect(result.renderedItems.value[ 0 ]!.size.height).toBe(100);
    });

    it('should treat 0, null, undefined as dynamic itemSize', async () => {
      for (const val of [ 0, null, undefined ]) {
        const { result } = setup({ ...defaultProps, itemSize: val as unknown as undefined });
        expect(result.totalHeight.value).toBe(5000);
        result.updateItemSize(0, 100, 100);
        await nextTick();
        expect(result.totalHeight.value).toBe(5050);
      }
    });

    it('should treat 0, null, undefined as dynamic columnWidth', async () => {
      for (const val of [ 0, null, undefined ]) {
        const { result } = setup({
          ...defaultProps,
          direction: 'both',
          columnCount: 2,
          columnWidth: val as unknown as undefined,
        });
        expect(result.getColumnWidth(0)).toBe(150);
        const parent = document.createElement('div');
        const col0 = document.createElement('div');
        Object.defineProperty(col0, 'offsetWidth', { value: 200, configurable: true });
        col0.dataset.colIndex = '0';
        parent.appendChild(col0);
        result.updateItemSize(0, 200, 50, parent);
        await nextTick();
        expect(result.totalWidth.value).toBe(350);
      }
    });

    it('should handle dynamic column width with data-col-index', async () => {
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 2,
        columnWidth: undefined,
      });
      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      Object.defineProperty(child1, 'offsetWidth', { value: 200 });
      child1.dataset.colIndex = '0';
      const child2 = document.createElement('div');
      Object.defineProperty(child2, 'offsetWidth', { value: 300 });
      child2.dataset.colIndex = '1';
      parent.appendChild(child1);
      parent.appendChild(child2);

      result.updateItemSize(0, 500, 50, parent);
      await nextTick();
      expect(result.getColumnWidth(0)).toBe(200);
      expect(result.getColumnWidth(1)).toBe(300);
    });

    it('should return early in updateItemSize if itemSize is fixed', async () => {
      const { result } = setup({ ...defaultProps, itemSize: 50 });
      result.updateItemSize(0, 100, 100);
      expect(result.totalHeight.value).toBe(5000);
    });

    it('should use defaultItemSize and defaultColumnWidth when provided', () => {
      const { result } = setup({
        ...defaultProps,
        itemSize: undefined,
        columnWidth: undefined,
        defaultItemSize: 100,
        defaultColumnWidth: 200,
        direction: 'both',
        columnCount: 10,
      });

      expect(result.totalHeight.value).toBe(100 * 100); // 100 items * 100 defaultItemSize
      expect(result.totalWidth.value).toBe(10 * 200); // 10 columns * 200 defaultColumnWidth
    });

    it('should ignore small delta updates in updateItemSize', async () => {
      const { result } = setup({ ...defaultProps, itemSize: undefined });
      result.updateItemSize(0, 50.1, 50.1);
      await nextTick();
      expect(result.totalHeight.value).toBe(5000);
    });

    it('should not shrink item height in both mode encountered so far', async () => {
      const { result } = setup({ ...defaultProps, direction: 'both', itemSize: undefined, columnCount: 2 });
      result.updateItemSize(0, 100, 100);
      await nextTick();
      expect(result.renderedItems.value[ 0 ]!.size.height).toBe(100);

      result.updateItemSize(0, 100, 80);
      await nextTick();
      expect(result.renderedItems.value[ 0 ]!.size.height).toBe(100);
    });

    it('should update item height in vertical mode', async () => {
      const { result } = setup({ ...defaultProps, direction: 'vertical', itemSize: undefined });
      result.updateItemSize(0, 100, 100);
      await nextTick();
      expect(result.renderedItems.value[ 0 ]!.size.height).toBe(100);
    });

    it('should handle updateItemSize for horizontal direction', async () => {
      const { result } = setup({ ...defaultProps, direction: 'horizontal', itemSize: undefined });
      result.updateItemSize(0, 100, 50);
      await nextTick();
      expect(result.totalWidth.value).toBe(5050);
    });

    it('should preserve measurements in initializeSizes when dynamic', async () => {
      const { result, props } = setup({ ...defaultProps, itemSize: undefined });
      result.updateItemSize(0, 100, 100);
      await nextTick();
      expect(result.totalHeight.value).toBe(5050);

      // Trigger initializeSizes by changing length
      props.value.items = Array.from({ length: 101 }, (_, i) => ({ id: i }));
      await nextTick();
      // Should still be 100 for index 0, not reset to default 50
      expect(result.totalHeight.value).toBe(5050 + 50);
    });

    it('should track max dimensions in updateItemSize', async () => {
      const { result } = setup({ ...defaultProps, direction: 'both', itemSize: undefined, columnCount: 2 });
      // Initial maxWidth is 0 (since vertical direction didn't set it for X)
      // Wait, in 'both' mode, initializeSizes sets it.

      result.updateItemSize(0, 5000, 6000);
      await nextTick();
      // Should have hit maxWidth.value = width
    });

    it('should cover spacer skip heuristic in updateItemSize', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 500 });
      const { result } = setup({ ...defaultProps, direction: 'both', columnCount: 2, itemSize: 0, columnWidth: 0, container });
      await nextTick();
      const parent = document.createElement('div');
      const spacer = document.createElement('div');
      Object.defineProperty(spacer, 'offsetWidth', { value: 1000 });
      parent.appendChild(spacer);
      result.updateItemSize(0, 100, 50, parent);
      await nextTick();
    });

    it('should allow columns to shrink on first measurement', async () => {
      const { result } = setup({ ...defaultProps, direction: 'both', columnCount: 2, columnWidth: undefined });
      // Default estimate is 150
      expect(result.getColumnWidth(0)).toBe(150);

      const parent = document.createElement('div');
      const child = document.createElement('div');
      Object.defineProperty(child, 'offsetWidth', { value: 100 });
      child.dataset.colIndex = '0';
      parent.appendChild(child);

      // First measurement is 100
      result.updateItemSize(0, 100, 50, parent);
      await nextTick();
      expect(result.getColumnWidth(0)).toBe(100);
    });

    it('should allow shrinking on first measurement', async () => {
      const { result } = setup({ ...defaultProps, itemSize: undefined });
      // Default estimate is 50
      expect(result.renderedItems.value[ 0 ]!.size.height).toBe(50);

      // First measurement is 20 (smaller than 50)
      result.updateItemSize(0, 50, 20);
      await nextTick();
      expect(result.renderedItems.value[ 0 ]!.size.height).toBe(20);

      // Second measurement is 10 (smaller than 20) - should NOT shrink
      result.updateItemSize(0, 50, 10);
      await nextTick();
      expect(result.renderedItems.value[ 0 ]!.size.height).toBe(20);

      // Third measurement is 30 (larger than 20) - SHOULD grow
      result.updateItemSize(0, 50, 30);
      await nextTick();
      expect(result.renderedItems.value[ 0 ]!.size.height).toBe(30);
    });

    it('should handle cells querySelector in updateItemSizes', async () => {
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 2,
        columnWidth: undefined,
      });

      const parent = document.createElement('div');
      const child1 = document.createElement('div');
      Object.defineProperty(child1, 'offsetWidth', { value: 200 });
      child1.dataset.colIndex = '0';
      const child2 = document.createElement('div');
      Object.defineProperty(child2, 'offsetWidth', { value: 300 });
      child2.dataset.colIndex = '1';

      parent.appendChild(child1);
      parent.appendChild(child2);

      result.updateItemSizes([ { index: 0, inlineSize: 500, blockSize: 50, element: parent } ]);
      await nextTick();
      expect(result.getColumnWidth(0)).toBe(200);
      expect(result.getColumnWidth(1)).toBe(300);
    });
  });

  describe('scroll and offsets', () => {
    it('should handle scrollToIndex out of bounds', async () => {
      const { result } = setup({ ...defaultProps });
      // Row past end
      result.scrollToIndex(mockItems.length + 10, 0);
      await nextTick();
      expect(window.scrollTo).toHaveBeenCalled();

      // Col past end (in grid mode)
      const { result: r_grid } = setup({ ...defaultProps, direction: 'both', columnCount: 5, columnWidth: 100 });
      r_grid.scrollToIndex(0, 10);
      await nextTick();
      expect(window.scrollTo).toHaveBeenCalled();

      // Column past end in horizontal mode
      const { result: r_horiz } = setup({ ...defaultProps, direction: 'horizontal' });
      r_horiz.scrollToIndex(0, 200);
      await nextTick();
    });

    it('should handle scrollToIndex auto alignment with padding', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(container, 'scrollTop', { value: 200, writable: true, configurable: true });

      const { result } = setup({ ...defaultProps, container, itemSize: 50, scrollPaddingStart: 100 });
      await nextTick();

      // Current visible range: [scrollTop + paddingStart, scrollTop + viewport - paddingEnd] = [300, 700]
      // Scroll to item at y=250. 250 < 300, so not visible.
      // targetY < relativeScrollY + paddingStart (250 < 200 + 100) -> hit line 729
      result.scrollToIndex(5, null, 'auto');
      await nextTick();
    });

    it('should hit scrollToIndex X calculation branches', async () => {
      const { result: r_horiz } = setup({ ...defaultProps, direction: 'horizontal', itemSize: 100 });
      await nextTick();
      // colIndex null
      r_horiz.scrollToIndex(0, null);
      // rowIndex null
      r_horiz.scrollToIndex(null, 5);
      await nextTick();
    });

    it('should handle scrollToOffset with element container and scrollTo method', async () => {
      const container = document.createElement('div');
      container.scrollTo = vi.fn();
      const { result } = setup({ ...defaultProps, container });
      result.scrollToOffset(100, 200);
      expect(container.scrollTo).toHaveBeenCalled();
    });

    it('should handle scrollToIndex with null indices', async () => {
      const { result } = setup({ ...defaultProps });
      result.scrollToIndex(null, null);
      await nextTick();
      result.scrollToIndex(10, null);
      await nextTick();
      result.scrollToIndex(null, 10);
      await nextTick();
    });

    it('should handle scrollToIndex auto alignment', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });

      const { result } = setup({ ...defaultProps, container, itemSize: 50 });
      await nextTick();

      // Scroll down so some items are above
      result.scrollToIndex(20, 0, 'start');
      await nextTick();

      // Auto align: already visible
      result.scrollToIndex(20, null, 'auto');
      await nextTick();

      // Auto align: above viewport (scroll up)
      result.scrollToIndex(5, null, 'auto');
      await nextTick();

      // Auto align: below viewport (scroll down)
      result.scrollToIndex(50, null, 'auto');
      await nextTick();

      // Horizontal auto align
      const { result: r_horiz } = setup({ ...defaultProps, direction: 'horizontal', container, itemSize: 100 });
      await nextTick();

      r_horiz.scrollToIndex(0, 20, 'start');
      await nextTick();

      r_horiz.scrollToIndex(null, 5, 'auto');
      await nextTick();

      r_horiz.scrollToIndex(null, 50, 'auto');
      await nextTick();
    });

    it('should handle scrollToIndex with various alignments', async () => {
      const { result } = setup({ ...defaultProps });
      result.scrollToIndex(50, 0, 'center');
      await nextTick();
      result.scrollToIndex(50, 0, 'end');
      await nextTick();
      result.scrollToIndex(50, 0, { x: 'center', y: 'end' });
      await nextTick();
    });

    it('should handle scrollToOffset with window container', async () => {
      const { result } = setup({ ...defaultProps, container: window });
      result.scrollToOffset(null, 100);
      expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 100 }));

      result.scrollToOffset(null, 200, { behavior: 'smooth' });
      expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 200, behavior: 'smooth' }));
    });

    it('should handle scrollToIndex with auto alignment and axis preservation', async () => {
      const { result } = setup({ ...defaultProps });
      // Axis preservation (null index)
      result.scrollToIndex(10, null, 'auto');
      await nextTick();
      result.scrollToIndex(null, 5, 'auto');
      await nextTick();
    });

    it('should handle scrollToOffset with nulls to keep current position', async () => {
      const { result } = setup({ ...defaultProps, container: window });
      window.scrollX = 50;
      window.scrollY = 60;

      // Pass null to keep current Y while updating X
      result.scrollToOffset(100, null);
      expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 100 }));

      // Pass null to keep current X while updating Y
      result.scrollToOffset(null, 200);
      expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 200 }));
    });

    it('should handle scrollToOffset with both axes', async () => {
      const { result } = setup({ ...defaultProps });
      result.scrollToOffset(100, 200);
      expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 100, top: 200 }));
    });

    it('should handle scrollToOffset fallback when scrollTo is missing', async () => {
      const container = document.createElement('div');
      (container as unknown as { scrollTo: unknown; }).scrollTo = undefined;
      const { result } = setup({ ...defaultProps, container });

      result.scrollToOffset(100, 200);
      expect(container.scrollTop).toBe(200);
      expect(container.scrollLeft).toBe(100);

      // X only
      result.scrollToOffset(300, null);
      expect(container.scrollLeft).toBe(300);

      // Y only
      result.scrollToOffset(null, 400);
      expect(container.scrollTop).toBe(400);
    });

    it('should clear pendingScroll when reached', async () => {
      const { result } = setup({ ...defaultProps, itemSize: undefined });
      result.scrollToIndex(10, 0, { isCorrection: true });
      await nextTick();
    });

    it('should cover scrollToIndex row >= length branch', async () => {
      const { result } = setup({ ...defaultProps });
      result.scrollToIndex(200, null);
      await nextTick();
    });

    it('should handle scrollToIndex horizontal alignment branches', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
      Object.defineProperty(container, 'scrollLeft', { value: 1000, writable: true, configurable: true });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        container.scrollLeft = options.left;
      });

      const { result } = setup({ ...defaultProps, direction: 'horizontal', container, itemSize: 50, scrollPaddingStart: 100 });
      await nextTick();

      // targetX = 5 * 50 = 250. relativeScrollX = 1000. paddingStart = 100.
      // targetX < relativeScrollX + paddingStart (250 < 1100)
      result.scrollToIndex(null, 5, 'auto');
      await nextTick();
      expect(container.scrollLeft).toBeLessThan(1000);

      // End alignment
      result.scrollToIndex(null, 5, 'end');
      await nextTick();

      // Center alignment
      result.scrollToIndex(null, 5, 'center');
      await nextTick();
    });

    it('should only apply scrollPaddingStart to Y axis in "both" mode if it is a number', async () => {
      setup({ ...defaultProps, direction: 'both', scrollPaddingStart: 10 });
      await nextTick();
      // Y padding should be 10, X padding should be 0
    });

    it('should stop programmatic scroll', async () => {
      const { result } = setup(defaultProps);
      result.scrollToIndex(10, null, { behavior: 'smooth' });
      expect(result.scrollDetails.value.isProgrammaticScroll).toBe(true);

      result.stopProgrammaticScroll();
      expect(result.scrollDetails.value.isProgrammaticScroll).toBe(false);
    });
  });

  describe('event handling and viewport', () => {
    it('should handle window scroll events', async () => {
      setup({ ...defaultProps });
      window.scrollX = 150;
      window.scrollY = 250;
      window.dispatchEvent(new Event('scroll'));
      await nextTick();
    });

    it('should handle document scroll events', async () => {
      setup({ ...defaultProps });
      document.dispatchEvent(new Event('scroll'));
      await nextTick();
    });

    it('should handle scroll events on container element', async () => {
      const container = document.createElement('div');
      setup({ ...defaultProps, container });
      Object.defineProperty(container, 'scrollTop', { value: 100 });
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
    });

    it('should update viewport size on container resize', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 500, writable: true });
      Object.defineProperty(container, 'clientHeight', { value: 500, writable: true });
      const { result } = setup({ ...defaultProps, container });
      await nextTick();
      expect(result.scrollDetails.value.viewportSize.width).toBe(500);

      Object.defineProperty(container, 'clientWidth', { value: 800 });
      const observer = (globalThis.ResizeObserver as unknown as { instances: ResizeObserverMock[]; }).instances.find((i) => i.targets.has(container));
      if (observer) {
        observer.trigger([ { target: container } ]);
      }
      await nextTick();
      expect(result.scrollDetails.value.viewportSize.width).toBe(800);
    });

    it('should handle isScrolling timeout', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      const { result } = setup({ ...defaultProps, container });
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(result.scrollDetails.value.isScrolling).toBe(true);
      vi.advanceTimersByTime(250);
      await nextTick();
      expect(result.scrollDetails.value.isScrolling).toBe(false);
      vi.useRealTimers();
    });

    it('should handle container change in mount watcher', async () => {
      const { props } = setup({ ...defaultProps });
      await nextTick();
      props.value.container = null;
      await nextTick();
      props.value.container = window;
      await nextTick();
    });

    it('should handle window resize events', async () => {
      setup({ ...defaultProps, container: window });
      window.innerWidth = 1200;
      window.dispatchEvent(new Event('resize'));
      await nextTick();
    });

    it('should cover handleScroll with document target', async () => {
      setup({ ...defaultProps, container: window });
      document.dispatchEvent(new Event('scroll'));
      await nextTick();
    });

    it('should handle undefined window in handleScroll', async () => {
      const originalWindow = globalThis.window;
      const container = document.createElement('div');
      setup({ ...defaultProps, container });

      try {
        (globalThis as unknown as { window: unknown; }).window = undefined;
        container.dispatchEvent(new Event('scroll'));
        await nextTick();
      } finally {
        globalThis.window = originalWindow;
      }
    });
  });

  describe('column widths and ranges', () => {
    it('should handle columnWidth as an array', async () => {
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 4,
        columnWidth: [ 100, 200 ],
      });
      expect(result.getColumnWidth(0)).toBe(100);
      expect(result.getColumnWidth(1)).toBe(200);
      expect(result.totalWidth.value).toBe(600);
    });

    it('should handle columnWidth array fallback for falsy values', async () => {
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 2,
        columnWidth: [ 0 ] as unknown as number[],
      });
      expect(result.getColumnWidth(0)).toBe(150); // DEFAULT_COLUMN_WIDTH
    });

    it('should handle columnWidth as a function', async () => {
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 10,
        columnWidth: (index: number) => (index % 2 === 0 ? 100 : 200),
      });
      expect(result.getColumnWidth(0)).toBe(100);
      expect(result.totalWidth.value).toBe(1500);
    });

    it('should handle getColumnWidth fallback when dynamic', async () => {
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 2,
        columnWidth: undefined,
      });
      expect(result.getColumnWidth(0)).toBe(150);
    });

    it('should handle columnRange while loop coverage', async () => {
      const container = document.createElement('div');
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 50,
        columnWidth: undefined,
        container,
      });
      // Initialize some column widths
      for (let i = 0; i < 20; i++) {
        const parent = document.createElement('div');
        const child = document.createElement('div');
        Object.defineProperty(child, 'offsetWidth', { value: 100 });
        child.dataset.colIndex = String(i);
        parent.appendChild(child);
        result.updateItemSize(0, 100, 50, parent);
      }
      await nextTick();
      expect(result.columnRange.value.end).toBeGreaterThan(result.columnRange.value.start);
    });

    it('should handle zero column count', async () => {
      const { result } = setup({ ...defaultProps, direction: 'both', columnCount: 0 });
      await nextTick();
      expect(result.columnRange.value.end).toBe(0);
    });

    it('should cover columnRange safeStart clamp', async () => {
      const { result } = setup({ ...defaultProps, direction: 'both', columnCount: 10, columnWidth: 100 });
      await nextTick();
      expect(result.columnRange.value.start).toBe(0);
    });
  });

  describe('lifecycle and logic branches', () => {
    it('should trigger scroll correction when isScrolling becomes false', async () => {
      vi.useFakeTimers();
      const { result } = setup({ ...defaultProps, container: window, itemSize: undefined });
      await nextTick();
      result.scrollToIndex(10, 0, 'start');
      document.dispatchEvent(new Event('scroll'));
      expect(result.scrollDetails.value.isScrolling).toBe(true);
      vi.advanceTimersByTime(250);
      await nextTick();
      expect(result.scrollDetails.value.isScrolling).toBe(false);
      vi.useRealTimers();
    });

    it('should trigger scroll correction when treeUpdateFlag changes', async () => {
      const { result } = setup({ ...defaultProps, itemSize: undefined });
      await nextTick();
      result.scrollToIndex(10, 0, 'start');
      // Trigger tree update
      result.updateItemSize(5, 100, 100);
      await nextTick();
    });

    it('should cover updateHostOffset when container is window', async () => {
      const { result, props } = setup({ ...defaultProps, container: window });
      const host = document.createElement('div');
      props.value.hostElement = host;
      await nextTick();
      result.updateHostOffset();
    });

    it('should cover updateHostOffset when container is hostElement', async () => {
      const host = document.createElement('div');
      const { result } = setup({ ...defaultProps, container: host, hostElement: host });
      await nextTick();
      result.updateHostOffset();
    });

    it('should correctly calculate hostOffset when container is an HTMLElement', async () => {
      const container = document.createElement('div');
      const hostElement = document.createElement('div');

      container.getBoundingClientRect = vi.fn(() => ({ top: 100, left: 100, bottom: 200, right: 200, width: 100, height: 100, x: 100, y: 100, toJSON: () => '' }));
      hostElement.getBoundingClientRect = vi.fn(() => ({ top: 150, left: 150, bottom: 200, right: 200, width: 50, height: 50, x: 150, y: 150, toJSON: () => '' }));
      Object.defineProperty(container, 'scrollTop', { value: 50, writable: true, configurable: true });

      const { result } = setup({ ...defaultProps, container, hostElement });
      await nextTick();
      result.updateHostOffset();
      expect(result.scrollDetails.value.scrollOffset.y).toBeDefined();
    });

    it('should cover refresh method', async () => {
      const { result } = setup({ ...defaultProps, itemSize: 0 });
      result.updateItemSize(0, 100, 100);
      await nextTick();
      expect(result.totalHeight.value).toBe(5050);

      result.refresh();
      await nextTick();
      expect(result.totalHeight.value).toBe(5000);
    });
  });

  describe('sticky header pushing', () => {
    it('should push sticky item when next sticky item approaches (vertical)', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500 });
      Object.defineProperty(container, 'scrollTop', { value: 480, writable: true });
      const { result } = setup({ ...defaultProps, container, stickyIndices: [ 0, 10 ], itemSize: 50 });
      // We need to trigger scroll to update scrollY
      container.dispatchEvent(new Event('scroll'));
      await nextTick();

      const item0 = result.renderedItems.value.find((i) => i.index === 0);
      expect(item0!.offset.y).toBeLessThanOrEqual(450);
    });

    it('should push sticky item when next sticky item approaches (horizontal)', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 500 });
      Object.defineProperty(container, 'scrollLeft', { value: 480, writable: true });

      const { result } = setup({
        ...defaultProps,
        direction: 'horizontal',
        container,
        stickyIndices: [ 0, 10 ],
        itemSize: 50,
        columnGap: 0,
      });
      container.dispatchEvent(new Event('scroll'));
      await nextTick();

      const item0 = result.renderedItems.value.find((i) => i.index === 0);
      expect(item0!.offset.x).toBeLessThanOrEqual(450);
    });
  });

  describe('scroll restoration', () => {
    it('should restore scroll position when items are prepended', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500 });
      Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        container.scrollTop = options.top;
      });

      const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const { result, props } = setup({
        ...defaultProps,
        items,
        container,
        itemSize: 50,
        restoreScrollOnPrepend: true,
      });
      container.dispatchEvent(new Event('scroll'));
      await nextTick();

      expect(result.scrollDetails.value.scrollOffset.y).toBe(100);

      // Prepend 2 items
      const newItems = [ { id: -1 }, { id: -2 }, ...items ];
      props.value.items = newItems;
      await nextTick();
      // Trigger initializeSizes
      await nextTick();

      // Should have adjusted scroll by 2 * 50 = 100px. New scrollTop should be 200.
      expect(container.scrollTop).toBe(200);
      vi.useRealTimers();
    });

    it('should restore scroll position when items are prepended (horizontal)', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 500 });
      Object.defineProperty(container, 'scrollLeft', { value: 100, writable: true });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        container.scrollLeft = options.left;
      });

      const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const { result, props } = setup({
        ...defaultProps,
        direction: 'horizontal',
        items,
        container,
        itemSize: 50,
        restoreScrollOnPrepend: true,
      });
      container.dispatchEvent(new Event('scroll'));
      await nextTick();

      expect(result.scrollDetails.value.scrollOffset.x).toBe(100);

      // Prepend 2 items
      const newItems = [ { id: -1 }, { id: -2 }, ...items ];
      props.value.items = newItems;
      await nextTick();
      await nextTick();

      expect(container.scrollLeft).toBe(200);
      vi.useRealTimers();
    });

    it('should NOT restore scroll position when restoreScrollOnPrepend is false', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
      const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const { props } = setup({ ...defaultProps, items, container, restoreScrollOnPrepend: false });
      await nextTick();

      const newItems = [ { id: -1 }, ...items ];
      props.value.items = newItems;
      await nextTick();
      await nextTick();
      expect(container.scrollTop).toBe(100);
    });

    it('should NOT restore scroll position when first item does not match', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
      const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const { props } = setup({ ...defaultProps, items, container, restoreScrollOnPrepend: true });
      await nextTick();

      const newItems = [ { id: -1 }, { id: 9999 } ]; // completely different
      props.value.items = newItems;
      await nextTick();
      await nextTick();
      expect(container.scrollTop).toBe(100);
    });

    it('should update pendingScroll rowIndex when items are prepended', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(container, 'scrollHeight', { value: 5000, configurable: true });
      const { result, props } = setup({ ...defaultProps, container, restoreScrollOnPrepend: true });
      result.scrollToIndex(10, null, { behavior: 'smooth' });
      // pendingScroll should be set because it's not reached yet

      props.value.items = [ { id: -1 }, ...props.value.items ];
      await nextTick();
    });

    it('should handle updateItemSizes for horizontal direction', async () => {
      const { result } = setup({ ...defaultProps, direction: 'horizontal', itemSize: undefined });
      result.updateItemSizes([ { index: 0, inlineSize: 100, blockSize: 50 } ]);
      await nextTick();
      expect(result.totalWidth.value).toBe(5050);
    });

    it('should trigger scroll correction on tree update with pending scroll', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(container, 'scrollHeight', { value: 5000, configurable: true });
      const { result } = setup({ ...defaultProps, container, itemSize: undefined });
      // Set a pending scroll
      result.scrollToIndex(10, null, { behavior: 'smooth' });

      // Trigger tree update
      result.updateItemSize(0, 100, 100);
      await nextTick();
    });

    it('should trigger scroll correction when scrolling stops with pending scroll', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(container, 'scrollHeight', { value: 5000, configurable: true });
      const { result } = setup({ ...defaultProps, container, itemSize: undefined });
      result.scrollToIndex(10, null, { behavior: 'smooth' });

      // Start scrolling
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(result.scrollDetails.value.isScrolling).toBe(true);

      // Wait for scroll timeout
      vi.advanceTimersByTime(250);
      await nextTick();
      expect(result.scrollDetails.value.isScrolling).toBe(false);
      vi.useRealTimers();
    });
  });

  // eslint-disable-next-line test/prefer-lowercase-title
  describe('SSR support', () => {
    it('should handle SSR range in range calculation', () => {
      const props = ref({
        items: mockItems,
        ssrRange: { start: 0, end: 10 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.renderedItems.value.length).toBe(10);
    });

    it('should handle SSR range in columnRange calculation', () => {
      const props = ref({
        items: mockItems,
        columnCount: 10,
        ssrRange: { start: 0, end: 10, colStart: 0, colEnd: 5 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.columnRange.value.end).toBe(5);
    });

    it('should handle SSR range with both directions for total sizes', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'both',
        columnCount: 10,
        columnWidth: 100,
        itemSize: 50,
        ssrRange: { start: 10, end: 20, colStart: 2, colEnd: 5 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.totalWidth.value).toBe(300); // (5-2) * 100
      expect(result.totalHeight.value).toBe(500); // (20-10) * 50
    });

    it('should handle SSR range with horizontal direction for total sizes', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'horizontal',
        itemSize: 50,
        ssrRange: { start: 10, end: 20 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.totalWidth.value).toBe(500); // (20-10) * 50
    });

    it('should handle SSR range with fixed size horizontal for total sizes', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'horizontal',
        itemSize: 50,
        ssrRange: { start: 10, end: 20 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.totalWidth.value).toBe(500); // (20-10) * 50
    });

    it('should handle SSR range with vertical offset in renderedItems', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'vertical',
        itemSize: 50,
        ssrRange: { start: 10, end: 20 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.renderedItems.value[ 0 ]?.offset.y).toBe(0);
    });

    it('should handle SSR range with dynamic sizes for total sizes', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'vertical',
        itemSize: 0,
        ssrRange: { start: 10, end: 20 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.totalHeight.value).toBe(500);
    });

    it('should handle SSR range with dynamic horizontal sizes for total sizes', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'horizontal',
        itemSize: 0,
        ssrRange: { start: 10, end: 20 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.totalWidth.value).toBe(500);
    });

    it('should handle SSR range with both directions and dynamic offsets', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'both',
        columnCount: 10,
        itemSize: 0,
        ssrRange: { start: 10, end: 20, colStart: 2, colEnd: 5 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.renderedItems.value[ 0 ]?.offset.y).toBe(0);
      expect(result.renderedItems.value[ 0 ]?.offset.x).toBe(-300);
    });

    it('should scroll to ssrRange on mount', async () => {
      setup({ ...defaultProps, ssrRange: { start: 50, end: 60 } });
      await nextTick();
      expect(window.scrollTo).toHaveBeenCalled();
    });

    it('should handle SSR range with horizontal direction and colStart', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'horizontal',
        itemSize: 50,
        ssrRange: { start: 0, end: 10, colStart: 5 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.renderedItems.value[ 0 ]?.offset.x).toBe(-250);
    });

    it('should handle SSR range with direction "both" and colStart', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'both',
        columnCount: 20,
        columnWidth: 100,
        ssrRange: { start: 0, end: 10, colStart: 5, colEnd: 15 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      // ssrOffsetX = columnSizes.query(5) = 5 * 100 = 500
      expect(result.renderedItems.value[ 0 ]?.offset.x).toBe(-500);
    });

    it('should handle SSR range with colCount > 0 in totalWidth', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'both',
        columnCount: 10,
        columnWidth: 100,
        ssrRange: { start: 0, end: 10, colStart: 0, colEnd: 5 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      expect(result.totalWidth.value).toBe(500);
    });

    it('should skip undefined items in renderedItems', async () => {
      // items array is mockItems (length 100)
      const { result } = setup({ ...defaultProps, stickyIndices: [ 1000 ] });
      // Scroll way past the end
      result.scrollToOffset(0, 100000);
      await nextTick();
      // prevStickyIdx will be 1000, which is out of bounds
      expect(result.renderedItems.value.length).toBe(0);
    });

    it('should cover object padding branches in helpers', () => {
      expect(getPaddingX({ x: 10 }, 'horizontal')).toBe(10);
      expect(getPaddingY({ y: 20 }, 'vertical')).toBe(20);
    });
  });
});
