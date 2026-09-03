/* global ScrollToOptions */
import type { VirtualScrollProps } from '../../src/types';
import type { MockItem } from '../test-helper';

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useVirtualScroll } from '../../src/composables/useVirtualScroll';
import { useCoordinateScalingExtension } from '../../src/extensions/coordinate-scaling';
import { usePrependRestorationExtension } from '../../src/extensions/prepend-restoration';
import { useSnappingExtension } from '../../src/extensions/snapping';
import { useStickyExtension } from '../../src/extensions/sticky';
import { clearMocks, mockItems, scrollState, setup, setupMocks, triggerResize } from '../test-helper';

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

    it('re-syncs the internal scroll from the DOM when size props change without a scroll event', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      const { props, result, wrapper, internalState } = setup({
        container,
        direction: 'vertical',
        itemSize: 0,
        items: mockItems,
        defaultItemSize: 40,
        gap: 0,
      });

      await nextTick();

      container.scrollTop = 2000;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();

      expect(internalState.internalScrollY.value).toBe(2000);

      // The browser clamps the scroll offset after the content shrinks, but in
      // this scenario no scroll event reaches the handler: the rendered range
      // must still follow the actual DOM position after the gap change.
      container.scrollTop = 400;
      props.value = { ...props.value, gap: 8 };
      await nextTick();
      await nextTick();

      expect(internalState.internalScrollY.value).toBe(400);
      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      expect(result.renderedItems.value[ 0 ]?.index).toBeLessThanOrEqual(400 / 48);
      wrapper.unmount();
    });

    it('clamps the internal scroll when the item count shrinks without a pending scroll', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      const items = Array.from({ length: 3000 }, (_, i) => ({ id: i }));
      const { props, wrapper, internalState } = setup({
        container,
        direction: 'vertical',
        itemSize: 50,
        items,
      });
      await nextTick();

      container.scrollTop = 145000;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(internalState.internalScrollY.value).toBe(145000);

      props.value = { ...props.value, items: items.slice(0, 1000) };
      await nextTick();
      await nextTick();

      expect(internalState.internalScrollY.value).toBeLessThanOrEqual(1000 * 50 - 500);
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

    it('keeps the loading-slot allowance when re-clamping an offset scroll', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      container.scrollTo = vi.fn();
      const { result, wrapper } = setup({
        container,
        direction: 'horizontal',
        items: mockItems,
      });
      await nextTick();

      // 100 items * 40 - 500 viewport = 3500; the allowance extends the clamp
      // to 3556. The mock never moves, so the settle check must re-issue the
      // scroll as a correction carrying endExtraX.
      result.scrollToOffset(3556, null, { behavior: 'smooth', endExtraX: 56 });
      vi.advanceTimersByTime(1000);
      await nextTick();

      expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 3556 }));
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

    it('should correct scroll position after items are measured when using initialScrollIndex', async () => {
      const items = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const { result, internalState, wrapper } = setup({
        direction: 'vertical',
        items,
        defaultItemSize: 50, // estimated
        initialScrollIndex: 49,
        initialScrollAlign: 'end',
      });

      // 1. Initial mount and first nextTick where scrollToIndex is called
      await nextTick();

      // Total height based on defaults: 50 * 50 = 2500
      // Viewport is 500
      // Target scroll: 2500 - 500 = 2000
      expect(internalState.internalScrollY.value).toBe(2000);

      // 2. Measure items - they are actually 80px each
      const updates = items.map((_, i) => ({
        index: i,
        inlineSize: 500,
        blockSize: 80,
      }));

      result.updateItemSizes(updates);

      // Wait for nextTicks for hydration to finish and watchers to trigger
      await nextTick();
      await nextTick();
      await nextTick();

      // Total height now: 50 * 80 = 4000
      // Target scroll should be: 4000 - 500 = 3500
      expect(result.totalHeight.value).toBe(4000);
      expect(internalState.internalScrollY.value).toBe(3500);

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

      const { wrapper } = setup({
        items: mockItems,
        container: window,
      });

      await nextTick();
      wrapper.unmount();

      expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));

      removeSpy.mockRestore();
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

    it('renders every index when items contain holes (undefined entries)', async () => {
      const items = [ { id: 1 }, { id: 2 } ];
      const { result, wrapper, props } = setup({
        items,
        itemSize: 50,
      });
      await nextTick();

      // Sparse datasets (e.g. `new Array(n)`) render by index; holes yield `undefined` items
      const sparseItems = [];
      sparseItems[ 0 ] = { id: 1 };
      // index 1 is undefined
      sparseItems[ 2 ] = { id: 3 };
      props.value.items = sparseItems as MockItem[];
      await nextTick();

      // Every index in the visible range renders, holes included
      expect(result.renderedItems.value.length).toBe(3);
      expect(result.renderedItems.value.map((i) => i.index)).toEqual([ 0, 1, 2 ]);
      expect(result.renderedItems.value[ 0 ]!.item).toEqual({ id: 1 });
      expect(result.renderedItems.value[ 1 ]!.item).toBeUndefined();
      expect(result.renderedItems.value[ 2 ]!.item).toEqual({ id: 3 });
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

    it('re-syncs the horizontal scroll position when RTL is enabled', async () => {
      const container = document.createElement('div');
      container.scrollTo = vi.fn();
      const { result, wrapper } = setup({
        container,
        direction: 'horizontal',
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      (container.scrollTo as ReturnType<typeof vi.fn>).mockClear();

      // Force RTL change: the non-vertical branch must re-scroll to keep the
      // logical position stable.
      result.isRtl.value = true;
      await nextTick();
      await nextTick();

      expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'auto' }));
      wrapper.unmount();
    });

    it('does not rebase offset-based smooth pendings', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      container.scrollTo = vi.fn();
      const { result, wrapper } = setup({
        container,
        direction: 'horizontal',
        items: mockItems,
      });
      await nextTick();

      result.scrollToOffset(3000, null, { behavior: 'smooth', endExtraX: 100 });
      await nextTick();

      // While the smooth scroll is still flagged as programmatic, a measurement
      // change runs checkPendingScroll: the offset-based branch must skip the
      // index rebase and not issue any additional scroll.
      result.updateItemSizes([ { index: 0, inlineSize: 80, blockSize: 50 } ]);
      await nextTick();
      await nextTick();

      expect(container.scrollTo).toHaveBeenCalledTimes(1);
      vi.useRealTimers();
      wrapper.unmount();
    });

    it('falls back to the window when the container is null on RTL change', async () => {
      const { result, wrapper } = setup({
        container: null,
        direction: 'horizontal',
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      // updateScrollbarOffset takes the `container || window` fallback and
      // resets the scrollbar padding instead of reading an element.
      result.isRtl.value = true;
      await nextTick();
      await nextTick();

      // horizontal list: the width is the items total, the height the viewport
      expect(result.scrollDetails.value.totalSize.width).toBe(4000);
      wrapper.unmount();
    });

    it('re-syncs the display scroll when RTL changes on an element container', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      const hostElement = document.createElement('div');
      const hostRef = document.createElement('div');
      vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
        left: 50,
        right: 150,
        top: 0,
        bottom: 0,
        width: 100,
        height: 0,
      } as DOMRect);
      vi.spyOn(hostRef, 'getBoundingClientRect').mockReturnValue({
        left: 50,
        right: 150,
        top: 0,
        bottom: 0,
        width: 100,
        height: 0,
      } as DOMRect);

      const { result, wrapper } = setup({
        items: mockItems,
        itemSize: 100,
        direction: 'horizontal',
        container,
        hostElement,
        hostRef,
      });
      await nextTick();
      await nextTick();

      // RTL flips: the watch re-maps the horizontal scroll position from the old direction.
      // With the element container at origin and the host at right: 150, the rtl offset is
      // containerRect.right (0) - rect.right (150) - scrollLeft (0) = -150, so the re-map
      // scrolls to 150 (and the direction detection then re-applies the ltr state).
      result.isRtl.value = true;
      await nextTick();
      await nextTick();

      expect(result.scrollDetails.value.scrollOffset.x).toBe(150);
      wrapper.unmount();
    });

    it('detects an rtl container without any extensions', async () => {
      const container = document.createElement('div');
      container.setAttribute('dir', 'rtl');
      const { result, wrapper } = setup({
        items: mockItems,
        itemSize: 50,
        container,
      }, []);
      await nextTick();
      await nextTick();

      // The core direction detection runs without the rtl extension
      expect(result.isRtl.value).toBe(true);
      wrapper.unmount();
    });

    it('runs the SSR guards when window is undefined', async () => {
      vi.stubGlobal('window', undefined);
      try {
        const props = ref<VirtualScrollProps<MockItem>>({ itemSize: 50, items: mockItems });
        const result = useVirtualScroll(props);
        await nextTick();

        // The immediate container watch attaches events; all SSR guards return early
        result.updateDirection();
        result.updateHostOffset();

        // A size-affecting prop change schedules the post-render scroll re-sync;
        // it must return early on the server instead of touching the DOM.
        props.value = { ...props.value, items: mockItems.slice(0, 10) };
        await nextTick();
        await nextTick();

        expect(result.renderedItems.value.length).toBeGreaterThan(0);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('re-syncs the window scroll position in RTL mode after a props change', async () => {
      document.documentElement.setAttribute('dir', 'rtl');
      try {
        const { props, wrapper, internalState } = setup({
          container: window,
          direction: 'horizontal',
          itemSize: 50,
          items: mockItems,
        });
        await nextTick();
        await nextTick();

        scrollState.x = 250;
        document.dispatchEvent(new Event('scroll'));
        await nextTick();
        expect(internalState.internalScrollX.value).toBe(250);

        // The post-render re-sync reads the window scroll again (RTL: absolute value)
        props.value = { ...props.value, items: mockItems.slice(0, 20) };
        await nextTick();
        await nextTick();

        expect(internalState.internalScrollX.value).toBe(250);
        wrapper.unmount();
      } finally {
        document.documentElement.removeAttribute('dir');
      }
    });

    it('works without a component instance (no lifecycle hooks)', () => {
      const props = ref<VirtualScrollProps<MockItem>>({ itemSize: 50, items: mockItems });
      const result = useVirtualScroll(props);
      expect(result.renderedItems.value.length).toBeGreaterThan(0);
    });

    it('falls back to a zero offset for a non-element container', async () => {
      const hostElement = document.createElement('div');
      Object.defineProperty(document, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(document, 'clientWidth', { configurable: true, value: 500 });
      const { result, wrapper } = setup({
        container: document as unknown as Window,
        hostElement,
        itemSize: 50,
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      // document is neither window nor an element: the offset calculation falls back to 0
      expect(result.componentOffset.x).toBe(0);
      wrapper.unmount();
    });

    it('queries dynamic sizes in the offset helpers for every direction', () => {
      const vertical = setup({ itemSize: 0, defaultItemSize: 40, items: mockItems });
      expect(vertical.result.getItemOffset(5)).toBe(200);
      expect(vertical.result.getRowOffset(5)).toBe(200);
      vertical.wrapper.unmount();

      const horizontal = setup({ direction: 'horizontal', itemSize: 0, defaultItemSize: 40, items: mockItems });
      expect(horizontal.result.getItemOffset(5)).toBe(200);
      expect(horizontal.result.getColumnOffset(5)).toBe(200);
      horizontal.wrapper.unmount();

      const both = setup({
        direction: 'both',
        columnCount: 5,
        columnWidth: 0,
        defaultColumnWidth: 100,
        itemSize: 50,
        items: mockItems,
      });
      expect(both.result.getColumnOffset(2)).toBe(200);
      both.wrapper.unmount();
    });

    it('tracks horizontal scroll direction on element scrolls', async () => {
      vi.useFakeTimers();
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      let scrollLeft = 0;
      Object.defineProperty(container, 'scrollLeft', {
        configurable: true,
        get: () => scrollLeft,
        set: (val: number) => {
          scrollLeft = val;
        },
      });

      const { result, internalState, wrapper } = setup({
        container,
        direction: 'horizontal',
        itemSize: 100,
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      // The first scroll reports direction relative to the initial position (0)
      scrollLeft = 300;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(internalState.scrollDirectionX.value).toBe('end');

      // After the scroll-end timer resets the baseline, scrolling left reports 'start'
      vi.advanceTimersByTime(200);
      await nextTick();
      scrollLeft = 100;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(internalState.scrollDirectionX.value).toBe('start');

      // Scrolling right again reports 'end'
      vi.advanceTimersByTime(200);
      await nextTick();
      scrollLeft = 200;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(internalState.scrollDirectionX.value).toBe('end');

      expect(result.scrollDetails.value.scrollOffset.x).toBe(200);
      wrapper.unmount();
      vi.useRealTimers();
    });

    it('re-scrolls with a correction when a pending scroll uses string alignment', async () => {
      const { result, internalState, wrapper } = setup({
        itemSize: 0,
        defaultItemSize: 40,
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      result.scrollToIndex(10, null, 'start');
      await nextTick();
      await nextTick();
      await nextTick();
      await nextTick();

      expect(internalState.internalScrollY.value).toBeCloseTo(400, 0);
      wrapper.unmount();
    });

    it('scrolls to a column target with dynamic item sizes (horizontal)', async () => {
      vi.useFakeTimers();
      const { result, internalState, wrapper } = setup({
        direction: 'horizontal',
        itemSize: 0,
        defaultItemSize: 100,
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      result.scrollToIndex(null, 5, 'start');
      await nextTick();
      // Let the smooth programmatic scroll timer fire so the pending target
      // is recomputed against the measured sizes.
      vi.advanceTimersByTime(1000);
      await nextTick();
      await nextTick();

      expect(internalState.internalScrollX.value).toBeCloseTo(500, 0);
      vi.useRealTimers();
      wrapper.unmount();
    });

    it('re-bases a running smooth scroll when the target item measures taller', async () => {
      vi.useFakeTimers();
      const { result, wrapper } = setup({
        itemSize: 0,
        defaultItemSize: 40,
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      const scrollTo = vi.mocked(window.scrollTo);
      scrollTo.mockClear();

      // Smoothly scroll to the last item while it is still estimated at 40px.
      result.scrollToIndex(99, null, { align: 'end', behavior: 'smooth' });
      await nextTick();
      await nextTick();

      const firstCall = scrollTo.mock.calls.at(-1)?.[ 0 ] as ScrollToOptions;
      expect(firstCall.behavior).toBe('smooth');
      expect(firstCall.top).toBeCloseTo(100 * 40 - 500, 0);

      // The target item measures 80px: the running smooth scroll must be
      // re-based immediately instead of waiting for the programmatic timeout.
      result.updateItemSizes([ { index: 99, inlineSize: 100, blockSize: 80 } ]);
      await nextTick();
      await nextTick();
      await nextTick();

      expect(scrollTo.mock.calls.length).toBeGreaterThan(1);
      const lastCall = scrollTo.mock.calls.at(-1)?.[ 0 ] as ScrollToOptions;
      expect(lastCall.behavior).toBe('smooth');
      expect(lastCall.top).toBeCloseTo(99 * 40 + 80 - 500, 0);
      vi.useRealTimers();
      wrapper.unmount();
    });
  });

  describe('extension combinations', () => {
    it('works with no extensions', async () => {
      const { result, wrapper } = setup({ items: mockItems, itemSize: 50 }, []);
      await nextTick();
      await nextTick();

      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      expect(result.scrollDetails.value.totalSize.height).toBe(5000);
      wrapper.unmount();
    });

    it('works with only snapping extension', async () => {
      const { result, wrapper } = setup({ items: mockItems, itemSize: 50 }, [
        useSnappingExtension(),
      ]);
      await nextTick();
      await nextTick();

      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      wrapper.unmount();
    });

    it('works with only sticky + coordinate-scaling extensions', async () => {
      const { result, wrapper } = setup({ items: mockItems, itemSize: 50 }, [
        useStickyExtension(),
        useCoordinateScalingExtension(),
      ]);
      await nextTick();
      await nextTick();

      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      wrapper.unmount();
    });

    it('works with only prepend-restoration extension', async () => {
      const { result, wrapper } = setup({ items: mockItems, itemSize: 50, restoreScrollOnPrepend: true }, [
        usePrependRestorationExtension(),
      ]);
      await nextTick();
      await nextTick();

      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      wrapper.unmount();
    });

    it('works with snapping + sticky only (no RTL, no infinite loading)', async () => {
      const { result, wrapper } = setup({ items: mockItems, itemSize: 50, stickyIndices: [ 0 ] }, [
        useSnappingExtension(),
        useStickyExtension(),
      ]);
      await nextTick();
      await nextTick();

      expect(result.renderedItems.value.length).toBeGreaterThan(0);
      wrapper.unmount();
    });
  });
});
