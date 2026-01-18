/* global ScrollToOptions */
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
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });
    window.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        window.scrollX = options.left;
      }
      if (options.top !== undefined) {
        window.scrollY = options.top;
      }
      window.dispatchEvent(new Event('scroll'));
    });
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  describe('initialization and dimensions', () => {
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

  describe('range calculation', () => {
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
  });

  describe('dynamic sizing', () => {
    it('should handle columnCount fallback in updateItemSizes', async () => {
      const { result, props } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 10,
        columnWidth: undefined,
      });
      await nextTick();

      const cell = document.createElement('div');
      cell.dataset.colIndex = '0';

      // Getter that returns 10 first time (for guard) and null second time (for fallback)
      let count = 0;
      Object.defineProperty(props.value, 'columnCount', {
        get() {
          count++;
          return count === 1 ? 10 : null;
        },
        configurable: true,
      });

      result.updateItemSizes([ { index: 0, inlineSize: 200, blockSize: 50, element: cell } ]);
      await nextTick();
    });

    it('should handle updateItemSizes with direct cell element', async () => {
      const { result } = setup({
        ...defaultProps,
        direction: 'both',
        columnCount: 2,
        columnWidth: undefined,
      });
      await nextTick();

      const cell = document.createElement('div');
      Object.defineProperty(cell, 'offsetWidth', { value: 200 });
      cell.dataset.colIndex = '0';

      result.updateItemSizes([ { index: 0, inlineSize: 200, blockSize: 50, element: cell } ]);
      await nextTick();
      expect(result.getColumnWidth(0)).toBe(200);
    });

    it('should handle updateItemSizes initial measurement even if smaller than estimate', async () => {
      // Horizontal
      const { result: rH } = setup({ ...defaultProps, direction: 'horizontal', itemSize: undefined });
      await nextTick();
      // Estimate is 50. Update with 40.
      rH.updateItemSizes([ { index: 0, inlineSize: 40, blockSize: 40 } ]);
      await nextTick();
      expect(rH.renderedItems.value[ 0 ]?.size.width).toBe(40);

      // Subsequent update with smaller size should be ignored
      rH.updateItemSizes([ { index: 0, inlineSize: 30, blockSize: 30 } ]);
      await nextTick();
      expect(rH.renderedItems.value[ 0 ]?.size.width).toBe(40);

      // Vertical
      const { result: rV } = setup({ ...defaultProps, direction: 'vertical', itemSize: undefined });
      await nextTick();
      rV.updateItemSizes([ { index: 0, inlineSize: 40, blockSize: 40 } ]);
      await nextTick();
      expect(rV.renderedItems.value[ 0 ]?.size.height).toBe(40);

      // Subsequent update with smaller size should be ignored
      rV.updateItemSizes([ { index: 0, inlineSize: 30, blockSize: 30 } ]);
      await nextTick();
      expect(rV.renderedItems.value[ 0 ]?.size.height).toBe(40);
    });

    it('should handle updateItemSize and trigger reactivity', async () => {
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
  });

  describe('scrolling and API', () => {
    it('should handle scrollToIndex with horizontal direction and dynamic item size', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      const { result } = setup({ ...defaultProps, container, direction: 'horizontal', itemSize: undefined });
      await nextTick();

      // index 10. itemSize is 50 by default. totalWidth = 5000.
      result.scrollToIndex(null, 10, { align: 'start', behavior: 'auto' });
      await nextTick();
      expect(result.scrollDetails.value.scrollOffset.x).toBe(500);
    });

    it('should handle scrollToIndex with window fallback when container is missing', async () => {
      const { result } = setup({ ...defaultProps, container: undefined });
      await nextTick();
      result.scrollToIndex(10, 0);
      await nextTick();
      expect(window.scrollTo).toHaveBeenCalled();
    });

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
      // targetY < relativeScrollY + paddingStart (250 < 200 + 100)
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

    it('should handle scrollToOffset with currentX/currentY fallbacks', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollLeft', { value: 50, writable: true });
      Object.defineProperty(container, 'scrollTop', { value: 60, writable: true });

      const { result } = setup({ ...defaultProps, container });
      await nextTick();

      // Pass null to x and y to trigger fallbacks to currentX and currentY
      result.scrollToOffset(null, null);
      await nextTick();

      // scrollOffset.x = targetX - hostOffset.x + (isHorizontal ? paddingStartX : 0)
      // targetX = currentX = 50. hostOffset.x = 0. isHorizontal = false.
      // So scrollOffset.x = 50.
      expect(result.scrollDetails.value.scrollOffset.x).toBe(50);
      expect(result.scrollDetails.value.scrollOffset.y).toBe(60);
    });

    it('should handle scrollToOffset with restricted direction for padding fallback', async () => {
      const container = document.createElement('div');
      container.scrollTo = vi.fn();

      // Horizontal direction: isVertical will be false, so targetY padding fallback will be 0
      const { result } = setup({ ...defaultProps, container, direction: 'horizontal', scrollPaddingStart: 10 });
      await nextTick();

      result.scrollToOffset(100, 100);
      await nextTick();
      // targetY = 100 + hostOffset.y - (isVertical ? paddingStartY : 0)
      // Since isVertical is false, it uses 0. hostOffset.y is 0 here.
      expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({
        top: 100,
      }));

      // Vertical direction: isHorizontal will be false, so targetX padding fallback will be 0
      const { result: r2 } = setup({ ...defaultProps, container, direction: 'vertical', scrollPaddingStart: 10 });
      await nextTick();
      r2.scrollToOffset(100, 100);
      await nextTick();
      expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({
        left: 100,
      }));
    });

    it('should handle scrollToOffset with window fallback when container is missing', async () => {
      const { result } = setup({ ...defaultProps, container: undefined });
      await nextTick();
      result.scrollToOffset(100, 200);
      await nextTick();
      expect(window.scrollTo).toHaveBeenCalled();
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

    it('should stop programmatic scroll', async () => {
      const { result } = setup(defaultProps);
      result.scrollToIndex(10, null, { behavior: 'smooth' });
      expect(result.scrollDetails.value.isProgrammaticScroll).toBe(true);

      result.stopProgrammaticScroll();
      expect(result.scrollDetails.value.isProgrammaticScroll).toBe(false);
    });

    it('should handle scrollToIndex with element container having scrollTo', async () => {
      const container = document.createElement('div');
      container.scrollTo = vi.fn();
      const { result } = setup({ ...defaultProps, container });
      await nextTick();

      result.scrollToIndex(10, 0, { behavior: 'auto' });
      await nextTick();
      expect(container.scrollTo).toHaveBeenCalled();
    });

    it('should handle scrollToIndex fallback when scrollTo is missing', async () => {
      const container = document.createElement('div');
      (container as unknown as { scrollTo: unknown; }).scrollTo = undefined;
      const { result } = setup({ ...defaultProps, container });
      await nextTick();

      // row only
      result.scrollToIndex(10, null, { behavior: 'auto' });
      await nextTick();
      expect(container.scrollTop).toBeGreaterThan(0);

      // col only
      const { result: resH } = setup({ ...defaultProps, container, direction: 'horizontal' });
      await nextTick();
      resH.scrollToIndex(null, 10, { behavior: 'auto' });
      await nextTick();
      expect(container.scrollLeft).toBeGreaterThan(0);
    });

    it('should skip undefined items in renderedItems', async () => {
      const items = Array.from({ length: 10 }) as unknown[];
      items[ 0 ] = { id: 0 };
      // other indices are undefined
      const { result } = setup({ ...defaultProps, items, itemSize: 50 });
      await nextTick();
      // only index 0 should be rendered
      expect(result.renderedItems.value.length).toBe(1);
      expect(result.renderedItems.value[ 0 ]?.index).toBe(0);
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

    it('should cover fallback branches for unknown targets and directions', async () => {
      // 1. Unknown container type (hits 408, 445, 513, 718 else branches)
      const unknownContainer = {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as HTMLElement;

      const { result } = setup({
        ...defaultProps,
        container: unknownContainer,
        hostElement: document.createElement('div'),
      });
      await nextTick();

      result.scrollToIndex(10, 0);
      result.scrollToOffset(100, 100);
      result.updateHostOffset();

      // 2. Invalid direction (hits 958 else branch)
      const { result: r2 } = setup({
        ...defaultProps,
        direction: undefined as unknown as 'vertical',
        stickyIndices: [ 0 ],
      });
      await nextTick();
      window.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(r2.renderedItems.value.find((i) => i.index === 0)).toBeDefined();

      // 3. Unknown target in handleScroll (hits 1100 else branch)
      const container = document.createElement('div');
      setup({ ...defaultProps, container });
      const event = new Event('scroll');
      Object.defineProperty(event, 'target', { value: { } });
      container.dispatchEvent(event);
    });

    it('should cleanup events and observers when container changes', async () => {
      const container = document.createElement('div');
      const removeSpy = vi.spyOn(container, 'removeEventListener');
      const { props } = setup({ ...defaultProps, container });
      await nextTick();

      // Change container to trigger cleanup of old one
      props.value.container = document.createElement('div');
      await nextTick();

      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
    });

    it('should cleanup when unmounted and container is window', async () => {
      const { wrapper } = setup({ ...defaultProps, container: window });
      await nextTick();
      wrapper.unmount();
    });

    it('should cleanup when unmounted', async () => {
      const container = document.createElement('div');
      const removeSpy = vi.spyOn(container, 'removeEventListener');
      const { wrapper } = setup({ ...defaultProps, container });
      await nextTick();

      wrapper.unmount();
      expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
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
      Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1200 });
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

  describe('sticky and pushed items', () => {
    it('should identify sticky items', async () => {
      const { result } = setup({ ...defaultProps, stickyIndices: [ 0, 10 ] });
      await nextTick();

      const items = result.renderedItems.value;
      const item0 = items.find((i) => i.index === 0);
      const item10 = items.find((i) => i.index === 10);
      expect(item0?.isSticky).toBe(true);
      expect(item10?.isSticky).toBe(true);
    });

    it('should make sticky items active when scrolled past', async () => {
      const { result } = setup({ ...defaultProps, stickyIndices: [ 0 ] });
      await nextTick();

      result.scrollToOffset(0, 100);
      await nextTick();

      const item0 = result.renderedItems.value.find((i) => i.index === 0);
      expect(item0?.isStickyActive).toBe(true);
    });

    it('should include current sticky item in rendered items even if range is ahead', async () => {
      const { result } = setup({ ...defaultProps, stickyIndices: [ 0 ], bufferBefore: 0 });
      await nextTick();

      // Scroll to index 20. Range starts at 20.
      result.scrollToIndex(20, 0, { align: 'start', behavior: 'auto' });
      await nextTick();

      expect(result.scrollDetails.value.range.start).toBe(20);
      const item0 = result.renderedItems.value.find((i) => i.index === 0);
      expect(item0).toBeDefined();
      expect(item0?.isStickyActive).toBe(true);
    });

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

    it('should handle dynamic sticky item pushing in vertical mode', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500 });
      Object.defineProperty(container, 'scrollTop', { value: 460, writable: true });

      const { result } = setup({
        ...defaultProps,
        container,
        itemSize: undefined, // dynamic
        stickyIndices: [ 0, 10 ],
      });
      await nextTick();

      // Item 0 is sticky. Item 10 is next sticky.
      // Default size = 50.
      // nextStickyY = itemSizesY.query(10) = 500.
      // distance = 500 - 460 = 40.
      // 40 < 50 (item 0 height), so it should be pushed.
      // stickyOffset.y = -(50 - 40) = -10.
      const stickyItem = result.renderedItems.value.find((i) => i.index === 0);
      expect(stickyItem?.stickyOffset.y).toBe(-10);
    });

    it('should handle dynamic sticky item pushing in horizontal mode', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 500 });
      Object.defineProperty(container, 'scrollLeft', { value: 460, writable: true });

      const { result } = setup({
        ...defaultProps,
        container,
        direction: 'horizontal',
        itemSize: undefined, // dynamic
        stickyIndices: [ 0, 10 ],
      });
      await nextTick();

      // nextStickyX = itemSizesX.query(10) = 500.
      // distance = 500 - 460 = 40.
      // 40 < 50, so stickyOffset.x = -10.
      const stickyItem = result.renderedItems.value.find((i) => i.index === 0);
      expect(stickyItem?.stickyOffset.x).toBe(-10);
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

    it('should restore scroll position with itemSize as function when prepending', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        container.scrollTop = options.top;
      });

      const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const { props } = setup({
        ...defaultProps,
        items,
        container,
        itemSize: (item: { id: number; }) => (item.id < 0 ? 100 : 50),
        restoreScrollOnPrepend: true,
      });
      await nextTick();

      // Prepend 1 item with id -1 (size 100)
      const newItems = [ { id: -1 }, ...items ];
      props.value.items = newItems;
      await nextTick();
      await nextTick();

      // Should have adjusted scroll by 100px. New scrollTop should be 200.
      expect(container.scrollTop).toBe(200);
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
  });

  describe('advanced logic and edge cases', () => {
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

    it('should handle updateHostOffset with window fallback when container is missing', async () => {
      const { result, props } = setup({ ...defaultProps, container: undefined });
      const host = document.createElement('div');
      props.value.hostElement = host;
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

    it('should trigger scroll correction on tree update with string alignment', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500, configurable: true });
      Object.defineProperty(container, 'scrollHeight', { value: 5000, configurable: true });
      const { result } = setup({ ...defaultProps, container, itemSize: undefined });
      // Set a pending scroll with string alignment
      result.scrollToIndex(10, null, 'start');

      // Trigger tree update
      result.updateItemSize(0, 100, 100);
      await nextTick();
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
    it('should handle colBuffer when ssrRange is present and not scrolling', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { value: 500, configurable: true });
      Object.defineProperty(container, 'scrollLeft', { value: 0, writable: true, configurable: true });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        if (options.left !== undefined) {
          Object.defineProperty(container, 'scrollLeft', { value: options.left, writable: true, configurable: true });
        }
      });

      const { result } = setup({
        ...defaultProps,
        container,
        direction: 'both',
        columnCount: 20,
        columnWidth: 100,
        ssrRange: { start: 0, end: 10, colStart: 1, colEnd: 2 }, // SSR values
        initialScrollIndex: 0,
      });

      await nextTick(); // onMounted schedules hydration
      await nextTick(); // hydration tick 1
      await nextTick(); // hydration tick 2 (isHydrating = false)

      expect(result.isHydrated.value).toBe(true);

      // Scroll to col 5 (offset 500)
      result.scrollToIndex(null, 5, { align: 'start', behavior: 'auto' });
      await nextTick();

      vi.runAllTimers(); // Clear isScrolling timeout
      await nextTick();

      // start = findLowerBound(500) = 5.
      // colBuffer should be 0 because ssrRange is present and isScrolling is false.
      expect(result.columnRange.value.start).toBe(5);

      // Now trigger a scroll to make isScrolling true
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      // isScrolling is now true. colBuffer should be 2.
      expect(result.columnRange.value.start).toBe(3);
      vi.useRealTimers();
    });

    it('should handle bufferBefore when ssrRange is present and not scrolling', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { value: 500 });
      Object.defineProperty(container, 'scrollTop', { value: 0, writable: true, configurable: true });
      container.scrollTo = vi.fn().mockImplementation((options) => {
        if (options.top !== undefined) {
          Object.defineProperty(container, 'scrollTop', { value: options.top, writable: true, configurable: true });
        }
      });

      const { result } = setup({
        ...defaultProps,
        container,
        itemSize: 50,
        bufferBefore: 5,
        ssrRange: { start: 0, end: 10 },
        initialScrollIndex: 10,
      });

      await nextTick(); // schedules hydration
      await nextTick(); // hydration tick scrolls to 10
      await nextTick();

      vi.runAllTimers(); // Clear isScrolling timeout
      await nextTick();

      expect(result.isHydrated.value).toBe(true);
      // start = floor(500 / 50) = 10.
      // Since ssrRange is present and isScrolling is false, bufferBefore should be 0.
      expect(result.renderedItems.value[ 0 ]?.index).toBe(10);

      // Now trigger a scroll to make isScrolling true
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      // isScrolling is now true. bufferBefore should be 5.
      expect(result.renderedItems.value[ 0 ]?.index).toBe(5);
      vi.useRealTimers();
    });

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

    it('should handle SSR range with colEnd fallback in columnRange calculation', () => {
      const props = ref({
        items: mockItems,
        columnCount: 10,
        ssrRange: { start: 0, end: 10, colStart: 0, colEnd: 0 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      // colEnd is 0, so it should use columnCount (10)
      expect(result.columnRange.value.end).toBe(10);
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

    it('should handle SSR range with dynamic horizontal offsets in renderedItems', () => {
      const props = ref({
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        direction: 'horizontal',
        itemSize: undefined, // dynamic
        ssrRange: { start: 10, end: 20 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(props);
      // ssrOffsetX = itemSizesX.query(10) = 10 * 50 = 500
      expect(result.renderedItems.value[ 0 ]?.offset.x).toBe(500);
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

    it('should handle SSR range with direction "both" and colEnd falsy', () => {
      const propsValue = ref({
        columnCount: 10,
        columnWidth: 100,
        direction: 'both' as const,
        items: Array.from({ length: 100 }, (_, i) => ({ id: i })),
        ssrRange: { colEnd: 0, colStart: 5, end: 10, start: 0 },
      }) as Ref<VirtualScrollProps<unknown>>;
      const result = useVirtualScroll(propsValue);
      // colEnd is 0, so it should use colCount (10)
      // totalWidth = columnSizes.query(10) - columnSizes.query(5) = 1000 - 500 = 500
      expect(result.totalWidth.value).toBe(500);
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
  });

  describe('helpers', () => {
    it('should cover object padding branches in helpers', () => {
      expect(getPaddingX({ x: 10 }, 'horizontal')).toBe(10);
      expect(getPaddingY({ y: 20 }, 'vertical')).toBe(20);
    });
  });
});
