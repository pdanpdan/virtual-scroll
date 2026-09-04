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

    it('measures host offsets from the container padding box (border excluded)', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      container.style.borderLeft = '3px solid red';
      container.style.borderTop = '2px solid red';
      const hostElement = document.createElement('div');
      vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
        left: 8, // container 0 + border 3 + content offset 5
        right: 108,
        top: 7, // container 0 + border 2 + content offset 5
        bottom: 0,
        width: 100,
        height: 0,
      } as DOMRect);

      const { result, wrapper } = setup({
        items: mockItems,
        itemSize: 50,
        direction: 'vertical',
        container,
        hostElement,
      });
      await nextTick();
      await nextTick();

      // The scrollport origin is the padding box: rendered borders must not leak
      // into the content offset used by scroll target math.
      expect(result.componentOffset.x).toBe(5);
      expect(result.componentOffset.y).toBe(5);
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

    it('measures RTL host offsets from the right padding edge (border excluded)', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      container.style.borderRight = '3px solid red';
      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        right: 200,
        top: 0,
        bottom: 0,
        width: 200,
        height: 0,
      } as DOMRect);
      const hostElement = document.createElement('div');
      vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
        left: 0,
        right: 192, // container right 200 - border 3 - content offset 5
        top: 0,
        bottom: 0,
        width: 100,
        height: 0,
      } as DOMRect);

      const { result, wrapper } = setup({
        items: mockItems,
        itemSize: 50,
        direction: 'vertical',
        container,
        hostElement,
      });
      await nextTick();
      await nextTick();

      // Force RTL so calculateOffset uses the right-edge padding-box math.
      result.isRtl.value = true;
      await nextTick();
      await nextTick();

      expect(result.componentOffset.x).toBe(5);
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

    it('re-maps window scroll when content before the list resizes (no scroll/resize event)', async () => {
      const hostElement = document.createElement('div');
      // Position of the list inside the document. Growing it simulates a
      // collapsible header (or any sibling) above the list changing height
      // without resizing the host element or firing a window resize/scroll.
      let hostDocTop = 0;
      vi.spyOn(hostElement, 'getBoundingClientRect').mockImplementation(() => ({
        // viewport-relative: rect.top + window.scrollY === host doc offset
        top: hostDocTop - scrollState.y,
        bottom: 0,
        left: 0,
        right: 0,
        width: 100,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect);

      const { wrapper, internalState } = setup({
        container: window,
        hostElement,
        itemSize: 50,
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      // Scroll the window 1000px "into" the list (host at the document top).
      scrollState.y = 1000;
      document.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(internalState.internalScrollY.value).toBe(1000);

      // The space before the first list element grows by 400px. No scroll and
      // no resize fire — only the list's position in the document changes, so
      // the same viewport spot now maps 400px earlier into the list.
      hostDocTop = 400;
      scrollState.y = 1400; // absolute page offset: user stays at the same spot
      document.dispatchEvent(new Event('scroll'));
      await nextTick();

      // The mapping must use the refreshed host offset: 1400 - 400 = 1000px.
      expect(internalState.internalScrollY.value).toBe(1000);
      wrapper.unmount();
    });

    it('re-maps an external element container scroll when content before the list resizes', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
      Object.defineProperty(container, 'scrollTop', { configurable: true, value: 0, writable: true });

      const hostElement = document.createElement('div');
      // The list's offset inside the external scroller. Grow it to simulate a
      // collapsible header (or any sibling) above the list inside the same
      // scroll container changing height without resizing the host element.
      let hostContentTop = 0;
      const rectMock = () => ({
        // viewport-relative: rect.top === hostContentTop - container.scrollTop
        top: hostContentTop - container.scrollTop,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
      vi.spyOn(hostElement, 'getBoundingClientRect').mockImplementation(rectMock);
      vi.spyOn(container, 'getBoundingClientRect').mockImplementation(() => ({
        top: 0,
        bottom: 500,
        left: 0,
        right: 500,
        width: 500,
        height: 500,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect);

      const { wrapper, internalState } = setup({
        container,
        hostElement,
        itemSize: 50,
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      // Scroll 1000px into the list (host at the container's content top).
      container.scrollTop = 1000;
      container.dispatchEvent(new Event('scroll'));
      await nextTick();
      expect(internalState.internalScrollY.value).toBe(1000);

      // Space before the first list element grows by 400px — no scroll fires,
      // the host keeps its own size, only its offset inside the container moves.
      hostContentTop = 400;
      container.scrollTop = 1400; // user stays at the same content spot
      container.dispatchEvent(new Event('scroll'));
      await nextTick();

      // Mapping uses the refreshed host offset: 1400 - 400 = 1000px of list.
      expect(internalState.internalScrollY.value).toBe(1000);
      wrapper.unmount();
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

  describe('regression invariants', () => {
    const manyItems: MockItem[] = Array.from({ length: 5000 }, (_, i) => ({ id: i }));
    const container = () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(el, 'clientWidth', { configurable: true, value: 500 });
      return el;
    };

    it('keeps geometry finite and bounded across pathological scroll landings', async () => {
      const el = container();
      const { result, wrapper } = setup({
        container: el,
        items: manyItems,
        itemSize: 50,
        bufferBefore: 5,
        bufferAfter: 5,
      });
      await nextTick();
      await nextTick();

      // Wild landings: top, middle, fractions, way past the end, near-end.
      const landings = [ 0, 5, 0.5, 249950, 249949, 123456.789, 250000, 250001, 99999, 7, 249999 ];
      for (const top of landings) {
        el.scrollTop = top;
        el.dispatchEvent(new Event('scroll'));
        await nextTick();
        await nextTick();

        const items = result.renderedItems.value;
        expect(items.length).toBeLessThanOrEqual(30);
        expect(items.length).toBeGreaterThan(0);
        for (const item of items) {
          expect(Number.isFinite(item.offset.x)).toBe(true);
          expect(Number.isFinite(item.offset.y)).toBe(true);
          expect(item.offset.y).toBeGreaterThanOrEqual(0);
          expect(item.index).toBeGreaterThanOrEqual(0);
          expect(item.index).toBeLessThan(manyItems.length);
        }
        const details = result.scrollDetails.value;
        expect(Number.isFinite(details.scrollOffset.y)).toBe(true);
        expect(Number.isFinite(details.totalSize.height)).toBe(true);
        expect(details.range.start).toBeLessThanOrEqual(details.range.end);
        expect(details.range.start).toBeGreaterThanOrEqual(0);
      }
      wrapper.unmount();
    });

    it('stays bounded and finite across many alternating far programmatic jumps', async () => {
      const el = container();
      const { result, wrapper } = setup({
        container: el,
        items: manyItems,
        itemSize: 50,
      });
      await nextTick();
      await nextTick();

      // Alternating extremes: first row, last row, middle, last, second, ...
      const targets = [ 0, 4999, 2500, 4999, 1, 4998, 2501, 4999, 0 ];
      for (let round = 0; round < 4; round++) {
        for (const target of targets) {
          result.scrollToIndex(target, null, { behavior: 'auto' });
          await nextTick();
          await nextTick();

          const items = result.renderedItems.value;
          expect(items.length).toBeLessThanOrEqual(30);
          const details = result.scrollDetails.value;
          for (const item of items) {
            expect(Number.isFinite(item.offset.x)).toBe(true);
            expect(Number.isFinite(item.offset.y)).toBe(true);
            expect(item.offset.y).toBeGreaterThanOrEqual(0);
          }
          expect(Number.isFinite(details.totalSize.height)).toBe(true);
          expect(details.totalSize.height).toBe(5000 * 50);
        }
      }
      wrapper.unmount();
    });

    it('read-only size queries do not mutate layout state', async () => {
      const el = container();
      const { result, wrapper } = setup({
        container: el,
        items: manyItems,
        itemSize: 50,
      });
      await nextTick();
      await nextTick();

      const totalBefore = result.scrollDetails.value.totalSize.height;
      const rangeBefore = { ...result.scrollDetails.value.range };

      // 5000 reads spanning the whole dataset must be side-effect free.
      for (let i = 0; i < manyItems.length; i++) {
        expect(result.getRowHeight(i)).toBe(50);
        expect(result.getItemOffset(i)).toBe(i * 50);
        result.getRowIndexAt(i * 50);
        result.getItemSize(i);
      }

      await nextTick();
      expect(result.scrollDetails.value.totalSize.height).toBe(totalBefore);
      expect(result.scrollDetails.value.range).toEqual(rangeBefore);
      expect(result.renderedItems.value.length).toBeGreaterThan(0);

      // The dataset still scrolls correctly after the read storm (the last row
      // clamps flush against the viewport bottom at the content end).
      result.scrollToIndex(4999, null, { align: 'start', behavior: 'auto' });
      await nextTick();
      await nextTick();
      const rendered = result.renderedItems.value;
      expect(rendered[ rendered.length - 1 ]!.index).toBe(4999);
      expect(result.scrollDetails.value.currentEndIndex).toBe(4999);
      wrapper.unmount();
    });
  });

  describe('end-anchored scroll re-clamping', () => {
    const waitForProgrammaticEnd = () => new Promise((resolve) => setTimeout(resolve, 180));
    const containerEl = () => {
      const el = document.createElement('div');
      Object.defineProperty(el, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(el, 'clientWidth', { configurable: true, value: 500 });
      return el;
    };
    const dynamicItems: MockItem[] = Array.from({ length: 200 }, (_, i) => ({ id: i }));

    const measure = (result: ReturnType<typeof setup>[ 'result' ], indices: number[], size: number) => {
      result.updateItemSizes(indices.map((index) => ({ index, inlineSize: size, blockSize: size })));
    };

    it('re-clamps to the real bottom when tail measurements settle after a jump to the end', async () => {
      const el = containerEl();
      const { result, wrapper, internalState } = setup({
        container: el,
        items: dynamicItems,
        itemSize: 0,
        defaultItemSize: 40,
      });
      await nextTick();
      await nextTick();

      // Jump to the last row, end-aligned: bottom is estimated at 200*40 - 500.
      result.scrollToIndex(199, null, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollY.value).toBe(7500);

      await waitForProgrammaticEnd();

      // The browser applied the jump: a real scroll event clears the pending
      // programmatic target, leaving only the end intent.
      el.scrollTop = 7500;
      el.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();
      await waitForProgrammaticEnd();

      // The tail rows settle 20px taller than their estimates -> real max 7600.
      // No pending scroll remains, so the end-anchored re-clamp moves the
      // viewport to the freshly measured bottom.
      measure(result, [ 195, 196, 197, 198, 199 ], 60);
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollY.value).toBeCloseTo(7600, 6);
      await waitForProgrammaticEnd();

      // The end intent stays active while the user rests at the bottom: the
      // viewport glues to the growing end instead of drifting short.
      measure(result, [ 199 ], 100);
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollY.value).toBeCloseTo(7640, 6);

      // Scrolling away cancels the glue: later growth must not drag the viewport.
      el.scrollTop = 5000;
      el.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();
      await waitForProgrammaticEnd();
      measure(result, [ 198 ], 120);
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollY.value).toBe(5000);
      wrapper.unmount();
    });

    it('tracks the end intent on the horizontal axis too', async () => {
      const el = containerEl();
      const { result, wrapper, internalState } = setup({
        container: el,
        direction: 'horizontal',
        items: dynamicItems,
        itemSize: 0,
        defaultItemSize: 50,
      });
      await nextTick();
      await nextTick();

      result.scrollToIndex(null, 199, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollX.value).toBe(9500); // 200*50 - 500

      await waitForProgrammaticEnd();

      // The browser applied the jump: a scroll event clears the pending target.
      el.scrollLeft = 9500;
      el.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();
      await waitForProgrammaticEnd();

      // Tail widths settle 10px wider -> real max 9550; the end intent re-clamps.
      measure(result, [ 195, 196, 197, 198, 199 ], 60);
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollX.value).toBeCloseTo(9550, 6);

      // Scrolling away cancels the horizontal end intent as well.
      el.scrollLeft = 1000;
      el.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollX.value).toBe(1000);
      wrapper.unmount();
    });

    it('cancels the end re-clamp when the user scrolls away before settling', async () => {
      const el = containerEl();
      const { result, wrapper, internalState } = setup({
        container: el,
        items: dynamicItems,
        itemSize: 0,
        defaultItemSize: 40,
      });
      await nextTick();
      await nextTick();

      result.scrollToIndex(199, null, { align: 'end', behavior: 'auto' });
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollY.value).toBe(7500);

      await waitForProgrammaticEnd();

      // User scrolls back up before any tail measurement arrives.
      el.scrollTop = 3000;
      el.dispatchEvent(new Event('scroll'));
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollY.value).toBe(3000);

      // Tail growth afterwards must not drag the viewport back to the end.
      measure(result, [ 195, 196, 197, 198, 199 ], 60);
      await nextTick();
      await nextTick();
      expect(internalState.internalScrollY.value).toBe(3000);
      wrapper.unmount();
    });

    it('keeps the topmost content stable when the grid column count changes', async () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
      Object.defineProperty(container, 'clientWidth', { configurable: true, value: 900 });
      const { result, props, wrapper } = setup({
        container,
        direction: 'both',
        itemSize: 40,
        columnWidth: 90,
        columnCount: 8,
        items: mockItems,
      });
      await nextTick();
      await nextTick();

      result.scrollToOffset(null, 1200, { behavior: 'auto' });
      await nextTick();
      await nextTick();
      const before = result.scrollDetails.value;
      expect(before.scrollOffset.y).toBeCloseTo(1200, 4);
      const topRowBefore = before.currentIndex;

      // Grid rows and their offsets are pure functions of the row index, so a
      // column-count change re-lays the horizontal extent only: the topmost
      // content stays anchored at the same pixel offsets (no wrap re-flow).
      props.value.columnCount = 4;
      await nextTick();
      await nextTick();
      await nextTick();

      const after = result.scrollDetails.value;
      expect(Number.isFinite(after.totalSize.width)).toBe(true);
      expect(after.currentIndex).toBe(topRowBefore);
      expect(after.scrollOffset.y).toBeCloseTo(before.scrollOffset.y, 4);
      expect(after.scrollOffset.x).toBe(before.scrollOffset.x);
      wrapper.unmount();
    });
  });
});
