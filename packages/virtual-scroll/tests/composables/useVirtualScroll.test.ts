import type { MockItem } from '../test-helper';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { clearMocks, mockItems, setup, setupMocks, triggerResize } from '../test-helper';

describe('useVirtualScroll', () => {
  setupMocks();

  beforeEach(() => {
    clearMocks();
  });

  describe('core rendering & dimensions', () => {
    it('initializes with correct dimensions and rendered items', async () => {
      const { result, wrapper } = setup({
        direction: 'vertical',
        itemSize: 50,
        items: mockItems,
      });

      await nextTick();
      await nextTick();

      expect(result.totalHeight.value).toBe(5000);
      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      expect(result.renderedItems.value[ 0 ]?.index).toBe(0);
      wrapper.unmount();
    });

    it('calculates total width in horizontal mode', async () => {
      const { result, wrapper } = setup({
        direction: 'horizontal',
        itemSize: 100,
        items: mockItems,
      });

      await nextTick();
      expect(result.totalWidth.value).toBe(10000);
      wrapper.unmount();
    });

    it('updates dimensions when viewport resizes', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });

      const { result, wrapper } = setup({
        container,
        direction: 'vertical',
        itemSize: 50,
        items: mockItems,
      });

      await nextTick();

      // Mock resize
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 800 });
      triggerResize(container, 500, 800);
      await nextTick();

      expect(result.scrollDetails.value.viewportSize.height).toBe(800);
      wrapper.unmount();
    });

    it('uses explicit width and height if provided in props', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 600 });
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 400 });

      const { result, wrapper } = setup({
        container,
        direction: 'vertical',
        itemSize: 50,
        items: mockItems,
      });

      await nextTick();
      await nextTick();

      expect(result.scrollDetails.value.viewportSize.width).toBe(600);
      expect(result.scrollDetails.value.viewportSize.height).toBe(400);
      wrapper.unmount();
    });

    it('handles "both" direction (grid)', async () => {
      const { result, wrapper } = setup({
        direction: 'both',
        itemSize: 50,
        columnCount: 5,
        columnWidth: 100,
        items: mockItems,
      });

      await nextTick();
      await nextTick();

      // 100 items (rows) * 50 = 5000
      expect(result.totalHeight.value).toBe(5000);
      expect(result.totalWidth.value).toBe(500);
      wrapper.unmount();
    });
  });

  describe('scroll management', () => {
    it('updates scroll position on scroll event', async () => {
      const container = document.createElement('div');
      const { result, wrapper } = setup({
        container,
        direction: 'vertical',
        itemSize: 50,
        items: mockItems,
      });

      await nextTick();

      container.scrollTop = 500;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();

      expect(result.scrollDetails.value.scrollOffset.y).toBe(500);
      wrapper.unmount();
    });

    it('scrolls to specific offset', async () => {
      const container = document.createElement('div');
      container.scrollTo = vi.fn();
      const { wrapper, result } = setup({
        container,
        direction: 'vertical',
        itemSize: 50,
        items: mockItems,
      });

      await nextTick();
      result.scrollToOffset(0, 1000);
      expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 1000 }));
      wrapper.unmount();
    });

    it('starts a timer for smooth scroll in scrollToOffset', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      container.scrollTo = vi.fn();
      const { result, wrapper } = setup({
        container,
        items: mockItems,
      });
      await nextTick();

      result.scrollToOffset(0, 100, { behavior: 'smooth' });
      expect(result.scrollDetails.value.isProgrammaticScroll).toBe(true);

      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(result.scrollDetails.value.isProgrammaticScroll).toBe(false);
      vi.useRealTimers();
      wrapper.unmount();
    });

    it('correctly clamps scroll position when viewport height increases', async () => {
      const container = document.createElement('div');
      // Initially zero height
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 0 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });

      // Mock footer height (measuredPaddingEnd)
      const footerHeight = 60;

      const { result, wrapper, internalState } = setup({
        container,
        direction: 'vertical',
        itemSize: 50,
        items: mockItems, // 100 items * 50 = 5000px total height
        initialScrollIndex: 99,
        initialScrollAlign: 'end',
        // We need to mock stickyEnd for the sticky footer
        stickyEnd: { x: 0, y: footerHeight },
      });

      await nextTick();
      await nextTick();

      // Manually mark items as measured
      const updates = [];
      for (let i = 0; i < 100; i++) {
        updates.push({ index: i, inlineSize: 500, blockSize: 50 });
      }
      result.updateItemSizes(updates);

      await nextTick();

      // Verify initially it's at the bottom (clamped to totalHeight because viewportHeight is 0)
      expect(internalState.viewportHeight.value).toBe(0);
      expect(internalState.internalScrollY.value).toBeGreaterThan(4500);

      // Now resize to normal height
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      triggerResize(container, 500, 500);

      await nextTick();
      await nextTick();

      expect(internalState.viewportHeight.value).toBe(500);

      // The internalScrollY MUST be clamped now
      const maxPossibleScroll = result.scrollDetails.value.totalSize.height - 500;
      expect(internalState.internalScrollY.value).toBeLessThanOrEqual(maxPossibleScroll);

      wrapper.unmount();
    });
  });

  describe('additional coverage', () => {
    it('covers getRowHeight horizontal branch and getColumnOffset fallback', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });

      const { result, wrapper } = setup({
        container,
        items: mockItems,
        direction: 'horizontal',
        itemSize: 100,
      });
      await nextTick();
      await nextTick();

      expect(result.getRowHeight(0)).toBe(500);
      expect(result.getColumnOffset(1)).toBe(100);
      wrapper.unmount();
    });

    it('covers attachEvents window cleanup function', async () => {
      const removeSpy = vi.spyOn(window, 'removeEventListener');
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');

      const { wrapper } = setup({
        items: mockItems,
        container: window,
      });

      await nextTick();
      wrapper.unmount();

      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      expect(clearIntervalSpy).toHaveBeenCalled();

      removeSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    it('covers scrollValueX in handleScroll when isRtl is true', async () => {
      const container = document.createElement('div');
      const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
        if (el === container) {
          return { direction: 'rtl' } as unknown as CSSStyleDeclaration;
        }
        return { direction: 'ltr' } as unknown as CSSStyleDeclaration;
      });

      Object.defineProperty(container, 'scrollLeft', { configurable: true, value: -500, writable: true });
      const { result, wrapper } = setup({
        container,
        items: mockItems,
        direction: 'horizontal',
        itemSize: 100,
      });
      await nextTick();

      result.updateDirection();
      expect(result.isRtl.value).toBe(true);

      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();

      expect(result.scrollDetails.value.scrollOffset.x).toBe(500);
      styleSpy.mockRestore();
      wrapper.unmount();
    });

    it('covers skipping undefined items in renderedItems', async () => {
      const items = [ { id: 1 }, { id: 2 } ];
      const { result, wrapper, props } = setup({
        items,
        itemSize: 50,
      });
      await nextTick();

      // Mock items having an undefined entry
      const sparseItems = [];
      sparseItems[ 0 ] = { id: 1 };
      // index 1 is undefined
      sparseItems[ 2 ] = { id: 3 };
      props.value.items = sparseItems as MockItem[];
      await nextTick();

      // Should only have 2 rendered items
      expect(result.renderedItems.value.length).toBe(2);
      expect(result.renderedItems.value.map((i) => i.index)).toEqual([ 0, 2 ]);
      wrapper.unmount();
    });

    it('covers isRtl watch change', async () => {
      const hostElement = document.createElement('div');
      vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
        left: 100,
        right: 200,
        top: 0,
        bottom: 0,
        width: 100,
        height: 0,
      } as DOMRect);

      const { result, wrapper } = setup({
        items: mockItems,
        itemSize: 50,
        direction: 'vertical',
        container: window,
        hostElement,
      });
      await nextTick();
      await nextTick();

      const initialX = result.componentOffset.x;

      // Force RTL change
      result.isRtl.value = true;
      await nextTick();
      await nextTick();

      // componentOffset.x should have changed because of RTL logic in calculateOffset
      expect(result.componentOffset.x).not.toBe(initialX);

      wrapper.unmount();
    });
  });
});
