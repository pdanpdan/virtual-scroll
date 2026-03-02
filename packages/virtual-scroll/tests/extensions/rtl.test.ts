/* global ScrollToOptions */
import { describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';

import { mockItems, setup, setupMocks } from '../test-helper';

describe('rtl support', () => {
  setupMocks();

  it('detects RTL mode and handles scroll position accordingly', async () => {
    const container = document.createElement('div');
    container.setAttribute('dir', 'rtl');
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
      if (options.top !== undefined) {
        container.scrollTop = options.top;
      }
      container.dispatchEvent(new Event('scroll'));
    });
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const dir = el === container ? 'rtl' : 'ltr';
      return {
        direction: dir,
      } as Partial<CSSStyleDeclaration> as CSSStyleDeclaration;
    });

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(true);

    container.scrollLeft = -100;
    container.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(result.scrollDetails.value.scrollOffset.x).toBe(100);

    result.scrollToIndex(null, 2, { align: 'start', behavior: 'auto' });
    expect(container.scrollLeft).toBe(-200);
    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('detects RTL mode change on a parent element', async () => {
    const parent = document.createElement('div');
    const container = document.createElement('div');
    parent.appendChild(container);

    vi.useFakeTimers();

    const spy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => ({
      get direction() {
        let current: HTMLElement | null = el as HTMLElement;
        while (current) {
          if (current.getAttribute('dir') === 'rtl') {
            return 'rtl';
          }
          current = current.parentElement;
        }
        return 'ltr';
      },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(false);

    parent.setAttribute('dir', 'rtl');

    vi.advanceTimersByTime(1000);
    await nextTick();

    expect(result.isRtl.value).toBe(true);

    wrapper.unmount();
    spy.mockRestore();
    vi.useRealTimers();
  });

  it('updates host offset and direction reactively', async () => {
    const container = document.createElement('div');
    const hostRef = document.createElement('div');
    const hostElement = document.createElement('div');

    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });

    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      get direction() { return currentDir; },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      hostRef,
      hostElement,
      items: mockItems,
      itemSize: 50,
    });

    await nextTick();
    await nextTick();

    vi.spyOn(hostRef, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      toJSON: () => {},
    } as DOMRect);
    vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
      left: 15,
      top: 25,
      toJSON: () => {},
    } as DOMRect);
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      toJSON: () => {},
    } as DOMRect);

    result.updateHostOffset();
    await nextTick();

    expect(result.scrollDetails.value.displayScrollOffset.x).toBe(0);

    currentDir = 'rtl';
    result.updateDirection();
    expect(result.isRtl.value).toBe(true);
    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('updates host offset but not scroll logical position when RTL changes in vertical mode', async () => {
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 1000 });

    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 1000,
      top: 0,
      bottom: 500,
      width: 1000,
      height: 500,
    } as DOMRect);

    const hostElement = document.createElement('div');
    vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
      left: 100,
      right: 200,
      top: 0,
      bottom: 50,
      width: 100,
      height: 50,
    } as DOMRect);

    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      get direction() { return currentDir; },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      hostElement,
      direction: 'vertical',
      items: mockItems,
      itemSize: 50,
    });

    await nextTick();
    expect(result.componentOffset.x).toBe(100);

    currentDir = 'rtl';
    result.updateDirection();
    await nextTick();

    expect(result.isRtl.value).toBe(true);
    expect(result.componentOffset.x).toBe(800);

    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('calculates host offset correctly in RTL mode', async () => {
    const container = document.createElement('div');
    container.setAttribute('dir', 'rtl');
    container.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
      if (options.left !== undefined) {
        Object.defineProperty(container, 'scrollLeft', { configurable: true, value: options.left, writable: true });
      }
      container.dispatchEvent(new Event('scroll'));
    });
    const hostElement = document.createElement('div');
    container.appendChild(hostElement);

    Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 1000 });

    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const dir = el === container ? 'rtl' : 'ltr';
      return {
        get direction() { return dir; },
      } as unknown as CSSStyleDeclaration;
    });

    const { result, wrapper } = setup({
      container,
      hostElement,
      items: mockItems,
      itemSize: 50,
      direction: 'horizontal',
    });

    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(true);

    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 1000,
      width: 1000,
      toJSON: () => {},
    } as DOMRect);
    vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      right: 700,
      width: 500,
      toJSON: () => {},
    } as DOMRect);

    Object.defineProperty(container, 'scrollLeft', { configurable: true, value: 0, writable: true });

    result.updateHostOffset();
    await nextTick();

    expect(result.scrollDetails.value.scrollOffset.x).toBe(0);

    Object.defineProperty(container, 'scrollLeft', { configurable: true, value: -400, writable: true });
    container.dispatchEvent(new Event('scroll'));
    vi.spyOn(hostElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 500,
      left: 600,
      right: 1100,
      toJSON: () => {},
      top: 0,
      width: 500,
    } as DOMRect);

    result.updateHostOffset();
    await nextTick();
    await nextTick();

    expect(result.scrollDetails.value.scrollOffset.x).toBe(100);

    result.scrollToIndex(null, 4, { align: 'start', behavior: 'auto' });
    expect(container.scrollLeft).toBe(-500);
    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('calculates rendered item offsets correctly in RTL mode when scrolled', async () => {
    const container = document.createElement('div');
    container.setAttribute('dir', 'rtl');
    Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });

    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      const dir = el === container ? 'rtl' : 'ltr';
      return {
        get direction() { return dir; },
      } as unknown as CSSStyleDeclaration;
    });

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    Object.defineProperty(container, 'scrollLeft', { configurable: true, value: -200, writable: true });
    container.dispatchEvent(new Event('scroll'));
    await nextTick();
    await nextTick();

    expect(result.scrollDetails.value.scrollOffset.x).toBe(200);

    const item2 = result.renderedItems.value.find((i) => i.index === 2);
    expect(item2).toBeDefined();
    expect(item2?.offset.x).toBe(200);
    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('maintains horizontal scroll position when switching between RTL and LTR', async () => {
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

    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      get direction() { return currentDir; },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: mockItems,
    });

    await nextTick();
    await nextTick();

    result.scrollToOffset(200, null, { behavior: 'auto' });
    await nextTick();
    expect(scrollLeft).toBe(200);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(200);

    currentDir = 'rtl';
    result.updateDirection();
    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(true);
    expect(scrollLeft).toBe(-200);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(200);

    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('maintains horizontal scroll position when switching between RTL and LTR with padding', async () => {
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

    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      get direction() { return currentDir; },
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      container,
      direction: 'horizontal',
      itemSize: 100,
      items: Array.from({ length: 10 }, (_, i) => ({ id: i })),
      scrollPaddingStart: 50,
    });

    await nextTick();
    await nextTick();

    result.scrollToOffset(150, null, { behavior: 'auto' });
    await nextTick();
    expect(scrollLeft).toBe(150);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(150);

    currentDir = 'rtl';
    result.updateDirection();
    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(true);
    expect(scrollLeft).toBe(-150);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(150);

    currentDir = 'ltr';
    result.updateDirection();
    await nextTick();
    await nextTick();

    expect(result.isRtl.value).toBe(false);
    expect(scrollLeft).toBe(150);
    expect(result.scrollDetails.value.scrollOffset.x).toBe(150);

    wrapper.unmount();
    styleSpy.mockRestore();
  });

  it('handles updateDirection and cached computedStyle', async () => {
    const { result, wrapper } = setup({
      items: mockItems,
      direction: 'vertical',
    });
    result.updateDirection();
    // Call again to test cached computedStyle
    result.updateDirection();
    expect(result.isRtl.value).toBe(false);
    wrapper.unmount();
  });

  it('falls back to hostRef or window in updateDirection when container is not provided', async () => {
    const hostRef = document.createElement('div');
    hostRef.setAttribute('dir', 'rtl');
    const { result, wrapper } = setup({
      container: null as unknown as Window, // force null container
      items: mockItems,
      itemSize: 50,
      hostRef,
    });
    await nextTick();

    // This should trigger updateDirection and use hostRef
    result.updateDirection();
    // Should detect RTL from hostRef
    expect(result.isRtl.value).toBe(true);
    wrapper.unmount();
  });

  it('skips horizontal logic in watch(isRtl) when direction is vertical', async () => {
    const { result, wrapper } = setup({
      items: mockItems,
      itemSize: 50,
      direction: 'vertical',
    });
    await nextTick();

    const scrollSpy = vi.spyOn(result, 'scrollToOffset');
    const oldOffset = result.componentOffset.y;

    // Trigger isRtl change
    result.isRtl.value = !result.isRtl.value;
    await nextTick();

    // updateHostOffset should be called, but not scrollToOffset (which is used for horizontal sync)
    expect(result.componentOffset.y).toBe(oldOffset);
    expect(scrollSpy).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('triggers updateDirection on handleScroll', async () => {
    const { wrapper } = setup({
      items: mockItems,
      itemSize: 50,
    });
    await nextTick();

    const styleSpy = vi.spyOn(window, 'getComputedStyle');
    // handleScroll listener is attached to document when container is window
    document.dispatchEvent(new Event('scroll'));
    await nextTick();

    expect(styleSpy).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('detects RTL from documentElement when container is window', async () => {
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      if (el === document.documentElement) {
        return { direction: 'rtl' } as unknown as CSSStyleDeclaration;
      }
      return { direction: 'ltr' } as unknown as CSSStyleDeclaration;
    });

    const { result, wrapper } = setup({
      container: window,
      direction: 'horizontal',
      items: mockItems,
    });

    await nextTick();
    result.updateDirection();
    expect(result.isRtl.value).toBe(true);

    styleSpy.mockRestore();
    wrapper.unmount();
  });

  it('triggers updateDirection through overridden method', async () => {
    let currentDir = 'ltr';
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      direction: currentDir,
    } as unknown as CSSStyleDeclaration));

    const { result, wrapper } = setup({
      items: mockItems,
      direction: 'horizontal',
    });

    await nextTick();
    expect(result.isRtl.value).toBe(false);

    currentDir = 'rtl';
    // This should call our overridden updateDirection
    result.updateDirection();
    expect(result.isRtl.value).toBe(true);

    styleSpy.mockRestore();
    wrapper.unmount();
  });
});
