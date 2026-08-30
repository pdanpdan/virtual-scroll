/* global ScrollToOptions */
import type { SnapMode } from '../../src/types';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { mockItems, setup, setupMocks } from '../test-helper';

describe('snap', () => {
  setupMocks();

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const setupSnapTest = (snapMode: SnapMode, itemSize: number = 50) => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    let scrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (val) => {
        scrollTop = val;
      },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.top !== undefined) {
        scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { result, wrapper, internalState } = setup({
      container,
      direction: 'vertical',
      itemSize,
      items: mockItems,
      snap: snapMode,
    });

    return {
      result,
      wrapper,
      container,
      internalState,
      getScrollTop: () => scrollTop,
      setScrollTop: (val: number) => {
        scrollTop = val;
      },
    };
  };

  it('snaps to the nearest item after scrolling stops (mode="auto")', async () => {
    const { container, setScrollTop } = setupSnapTest(true);

    await nextTick();
    await nextTick();

    // User scrolls down to 75 (towards end) -> acts like 'start'
    // Should snap to index 1 (top 50).
    setScrollTop(75);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 50, behavior: 'smooth', left: 0 }));
  });

  it('snaps to start if snap="start" and visible percent >= 50%', async () => {
    const { container, setScrollTop } = setupSnapTest('start', 100);

    await nextTick();
    await nextTick();

    // Scroll to 40. Item 0 visible amount = 100 - 40 = 60. Percent = 0.6.
    setScrollTop(40);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, behavior: 'smooth', left: 0 }));
  });

  it('snaps to next item if snap="start" and visible percent < 50%', async () => {
    const { container, setScrollTop } = setupSnapTest('start', 100);

    await nextTick();
    await nextTick();

    // Scroll to 60. Item 0 visible amount = 100 - 60 = 40. Percent = 0.4.
    setScrollTop(60);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 100, behavior: 'smooth', left: 0 }));
  });

  it('snaps to end if snap="end" and visible percent >= 50%', async () => {
    const { result, container, setScrollTop } = setupSnapTest('end', 100);

    await nextTick();
    await nextTick();

    // viewport 500. itemSize 100.
    // Scroll to 20. Viewport is 20-520.
    // Item 5 (500-600) visible amount = 20. Percent = 0.2.
    // targetIndex = 4. Align end. top = 0.
    setScrollTop(20);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, behavior: 'smooth', left: 0 }));

    // Manually stop programmatic scroll to clear states
    result.stopProgrammaticScroll();
    vi.mocked(container.scrollTo).mockClear();

    // Scroll to 80. Viewport is 80-580.
    // Item 5 (500-600) visible amount = 80. Percent = 0.8.
    // targetIndex = 5. Align end. top = 100.
    setScrollTop(80);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 100, behavior: 'smooth' }));
  });

  it('snaps to center if snap="center"', async () => {
    const { container, setScrollTop } = setupSnapTest('center', 100);

    await nextTick();
    await nextTick();

    // Viewport 500. Scroll to 20. Viewport is 20-520. Center is 270.
    // Item at 270 is index 2 (200-300).
    // Align index 2 to center. 250 - 250 = 0.
    setScrollTop(20);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, behavior: 'smooth', left: 0 }));
  });

  it('does not snap if item is larger than viewport', async () => {
    const { container, setScrollTop } = setupSnapTest('start', 600); // itemSize 600, viewport 500

    await nextTick();
    await nextTick();

    setScrollTop(100);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  it('does not snap if scroll was programmatic', async () => {
    const { result, container } = setupSnapTest(true);

    await nextTick();
    await nextTick();

    // Programmatic scroll
    result.scrollToIndex(5, null, { align: 'start', behavior: 'smooth' });
    await nextTick();

    // Clear calls
    vi.mocked(container.scrollTo).mockClear();

    // Fast forward past the scroll timeout
    vi.advanceTimersByTime(1100);
    await nextTick();

    // Ensure no snap call happened because it was programmatic
    expect(container.scrollTo).not.toHaveBeenCalled();
  });

  it('handles snap logic in scroll handler', async () => {
    const { result, wrapper } = setup({
      items: mockItems,
      itemSize: 50,
      snap: true,
    });
    await nextTick();

    // Trigger scroll
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(result.scrollDetails.value.isScrolling).toBe(true);

    vi.advanceTimersByTime(1100);
    await nextTick();
    expect(result.scrollDetails.value.isScrolling).toBe(false);

    wrapper.unmount();
  });

  it('does nothing when snap is disabled', async () => {
    const { wrapper, container } = setupSnapTest(false);
    await nextTick();

    // Trigger scroll
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('handles horizontal snapping in "both" direction mode', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
    let scrollLeft = 0;
    Object.defineProperty(container, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (val) => { scrollLeft = val; },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        scrollLeft = options.left;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { wrapper } = setup({
      container,
      direction: 'both',
      itemSize: 50,
      columnCount: 10,
      columnWidth: 100,
      items: mockItems,
      snap: 'start',
    });

    await nextTick();
    await nextTick();

    // 1. Initial scroll to set previous position
    scrollLeft = 50;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    // 2. Scroll to 60 (moving towards end -> direction 'end')
    scrollLeft = 60;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 100, behavior: 'smooth' }));
    wrapper.unmount();
  });

  it('handles horizontal snapping in "horizontal" direction mode', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
    let scrollLeft = 0;
    Object.defineProperty(container, 'scrollLeft', {
      configurable: true,
      get: () => scrollLeft,
      set: (val) => { scrollLeft = val; },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        scrollLeft = options.left;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: mockItems,
      snap: 'start',
    });

    await nextTick();
    await nextTick();

    scrollLeft = 50;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    scrollLeft = 60;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 100, behavior: 'smooth' }));
    wrapper.unmount();
  });

  it('skips the horizontal snap when there are no columns configured', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
    let scrollTop = 0;
    Object.defineProperty(container, 'scrollTop', {
      configurable: true,
      get: () => scrollTop,
      set: (val) => { scrollTop = val; },
    });
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.top !== undefined) {
        scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });

    const { wrapper } = setup({
      container,
      direction: 'both',
      itemSize: 50,
      items: mockItems,
      snap: true,
    });

    await nextTick();
    await nextTick();

    // Scroll down only: no horizontal movement, so the X axis has no snap target
    scrollTop = 60;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    // The vertical axis still snaps to the nearest item start
    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 50, behavior: 'smooth' }));
    wrapper.unmount();
  });

  it('snaps back to current item when distance is under 10% threshold and snap="next"', async () => {
    const { container, setScrollTop } = setupSnapTest('next', 100);

    await nextTick();
    await nextTick();

    // Small scroll: only 1px (1% of item size)
    // Threshold is 10%, it should snap back to index 0
    setScrollTop(1);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, behavior: 'smooth', left: 0 }));
  });

  it('snaps to the next item for a distance over threshold when snap="next"', async () => {
    const { container, setScrollTop } = setupSnapTest('next', 100);

    await nextTick();
    await nextTick();

    // Scroll 15px (15% of item size)
    // Threshold is min(5, 10% of 100) = 5.
    // 15 > 5, so this should snap NEXT to index 1
    setScrollTop(15);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(1100);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 100, behavior: 'smooth', left: 0 }));
  });

  it('snaps to next item for a distance over 5px threshold when snap="next" (size 100)', async () => {
    const { container, setScrollTop } = setupSnapTest('next', 100);
    await nextTick();
    await nextTick();

    // Scroll 6px (scrolled out 6px).
    // Threshold is 5.
    setScrollTop(6);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    vi.advanceTimersByTime(1100);
    await nextTick();
    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 100, behavior: 'smooth' }));
  });

  it('snaps to previous item when scrolling DOWN more than threshold when snap="next"', async () => {
    const { container, setScrollTop } = setupSnapTest('next', 100);
    await nextTick();
    await nextTick();

    // 1. Initially at index 1 (bottom aligned at 600)
    // viewSize=500, items=100.
    // Index 1 bottom is at 200. Viewport bottom at 600 means items are way above.
    // Let's use index 5. top=500, bottom=600.
    setScrollTop(100); // Items 1-5 visible (100-600)
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    vi.advanceTimersByTime(1100);
    await nextTick();
    vi.mocked(container.scrollTo).mockClear();

    // 2. Scroll DOWN (items move down) by 6px -> relScroll = 94
    // viewport is [94, 594]
    // currentEndIdx at 594 is 5. getQuery(5)=500, size=100. bottom=600.
    // scrolledOutBottom = 600 - 594 = 6.
    // Threshold is 5. 6 > 5, so it should snap to PREVIOUS (index 4) at END.
    // getQuery(4)=400, size=100. bottom=500.
    // target scrollTop = 500 - 500 = 0.
    setScrollTop(94);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    vi.advanceTimersByTime(1100);
    await nextTick();
    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0, behavior: 'smooth' }));
  });

  it('snaps BACK to current item when scrolling DOWN less than threshold when snap="next"', async () => {
    const { container, setScrollTop } = setupSnapTest('next', 100);
    await nextTick();
    await nextTick();

    // 1. Initially at index 5 (bottom aligned at 600)
    setScrollTop(100);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    vi.advanceTimersByTime(1100);
    await nextTick();
    vi.mocked(container.scrollTo).mockClear();

    // 2. Scroll DOWN by 4px -> relScroll = 96
    // viewport is [96, 596]
    // currentEndIdx at 596 is 5. bottom=600.
    // scrolledOutBottom = 600 - 596 = 4.
    // Threshold is 5. 4 <= 5, so it should snap BACK to index 5 at END.
    // target scrollTop = 600 - 500 = 100.
    setScrollTop(96);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    vi.advanceTimersByTime(1100);
    await nextTick();
    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 100, behavior: 'smooth' }));
  });

  it('does not update scroll direction during programmatic scroll', async () => {
    const { result, container, setScrollTop, internalState } = setupSnapTest(false);
    await nextTick();

    // 1. Set initial direction
    setScrollTop(10);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(result.scrollDetails.value.scrollOffset.y).toBe(10);
    expect(internalState.scrollDirectionY.value).toBe('end');

    // 2. Start programmatic scroll in opposite direction
    result.scrollToOffset(null, 5, { behavior: 'smooth' });
    await nextTick();
    expect(result.scrollDetails.value.isProgrammaticScroll).toBe(true);

    // 3. Trigger scroll events during programmatic scroll
    setScrollTop(5);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    // Direction should still be 'end' from the last non-programmatic scroll
    expect(internalState.scrollDirectionY.value).toBe('end');

    vi.advanceTimersByTime(1100);
    await nextTick();
    expect(result.scrollDetails.value.isProgrammaticScroll).toBe(false);
  });

  it('calculates scroll direction based on aggregate movement (handles jitter)', async () => {
    const { container, internalState, setScrollTop } = setupSnapTest(false);
    await nextTick();

    // 1. Start scrolling UP (dragging items UP -> relScroll increases)
    // First event: move to 10
    setScrollTop(10);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(internalState.scrollDirectionY.value).toBe('end');

    // Second event: move to 100
    setScrollTop(100);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    expect(internalState.scrollDirectionY.value).toBe('end');

    // Third event: JITTER DOWN (relScroll decreases by 1px to 99)
    setScrollTop(99);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    // Aggregate delta is 99 - 0 = 99 (UP). So direction should stay 'end'.
    expect(internalState.scrollDirectionY.value).toBe('end');

    // 2. Stop scroll
    vi.advanceTimersByTime(1100);
    await nextTick();

    // 3. New interaction: scroll DOWN (dragging items DOWN -> relScroll decreases)
    // Start at 99. Move to 90.
    setScrollTop(90);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    // Aggregate delta for new interaction: 90 - 99 = -9 (DOWN). Direction should be 'start'.
    expect(internalState.scrollDirectionY.value).toBe('start');

    // JITTER UP (relScroll increases by 1px to 91)
    setScrollTop(91);
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    // Aggregate delta: 91 - 99 = -8 (still DOWN). Direction should stay 'start'.
    expect(internalState.scrollDirectionY.value).toBe('start');
  });
});
