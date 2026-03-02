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

    const { result, wrapper } = setup({
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

    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
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
    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
    await nextTick();
    expect(result.scrollDetails.value.isScrolling).toBe(false);

    wrapper.unmount();
  });

  it('covers the case where snap is false (line 53-66 in snapping.ts)', async () => {
    const { wrapper, container } = setupSnapTest(false);
    await nextTick();

    // Trigger scroll
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
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

    vi.advanceTimersByTime(600);
    await nextTick();

    expect(container.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ left: 100, behavior: 'smooth' }));
    wrapper.unmount();
  });
});
