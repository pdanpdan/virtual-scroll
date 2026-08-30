/* global ResizeObserverCallback */

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, ref } from 'vue';

import { useVirtualScrollObservers } from '../../src/composables/useVirtualScrollObservers';

globalThis.ResizeObserver = class {
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

describe('useVirtualScrollObservers', () => {
  const createTestComponent = (setupFn: () => void) => defineComponent({
    setup() {
      setupFn();
      return () => null;
    },
  });

  it('sets and removes item refs correctly', () => {
    const hostRef = ref<HTMLElement | null>(null);
    const wrapperRef = ref<HTMLElement | null>(null);
    const headerRef = ref<HTMLElement | null>(null);
    const footerRef = ref<HTMLElement | null>(null);
    const measuredPaddingStart = ref(0);
    const measuredPaddingEnd = ref(0);
    const itemRefs = new Map<number, HTMLElement>();
    const updateHostOffset = vi.fn();
    const updateItemSizes = vi.fn();

    let setItemRefFn: (el: unknown, index: number) => void = () => {};

    const wrapper = mount(createTestComponent(() => {
      const { setItemRef } = useVirtualScrollObservers({
        hostRef,
        wrapperRef,
        headerRef,
        footerRef,
        measuredPaddingStart,
        measuredPaddingEnd,
        itemRefs,
        direction: 'vertical',
        updateHostOffset,
        updateItemSizes,
      });
      setItemRefFn = setItemRef;
    }));

    const el = document.createElement('div');
    setItemRefFn(el, 0);
    expect(itemRefs.get(0)).toBe(el);

    // Remove existing ref
    setItemRefFn(null, 0);
    expect(itemRefs.has(0)).toBe(false);

    // Remove non-existing ref (coverage)
    setItemRefFn(null, 1);
    expect(itemRefs.has(1)).toBe(false);

    wrapper.unmount();
  });

  it('handles ResizeObserver callbacks with and without borderBoxSize', () => {
    const hostRef = ref<HTMLElement | null>(null);
    const wrapperRef = ref<HTMLElement | null>(null);
    const headerRef = ref<HTMLElement | null>(null);
    const footerRef = ref<HTMLElement | null>(null);
    const measuredPaddingStart = ref(0);
    const measuredPaddingEnd = ref(0);
    const itemRefs = new Map<number, HTMLElement>();
    const updateHostOffset = vi.fn();
    const updateItemSizes = vi.fn();

    const resizeCallbacks: ResizeObserverCallback[] = [];
    vi.spyOn(globalThis, 'ResizeObserver').mockImplementation(function (cb: ResizeObserverCallback) {
      resizeCallbacks.push(cb);
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as ResizeObserver;
    } as unknown as typeof ResizeObserver);

    mount(createTestComponent(() => {
      useVirtualScrollObservers({
        hostRef,
        wrapperRef,
        headerRef,
        footerRef,
        measuredPaddingStart,
        measuredPaddingEnd,
        itemRefs,
        direction: 'both',
        updateHostOffset,
        updateItemSizes,
      });
    }));

    // Trigger itemResizeObserver callback
    const target1 = document.createElement('div');
    target1.dataset.index = '0';
    // JSDOM doesn't implement layout; use defineProperty on the prototype chain
    Object.defineProperty(target1, 'offsetWidth', { configurable: true, get: () => 100 });
    Object.defineProperty(target1, 'offsetHeight', { configurable: true, get: () => 50 });

    const target2 = document.createElement('div');
    target2.dataset.index = '0';
    target2.dataset.colIndex = '1';

    // resizeCallbacks[0] = hostResizeObserver, [1] = itemResizeObserver, [2] = extraResizeObserver
    const itemResizeCallback = resizeCallbacks[ 1 ];

    if (itemResizeCallback) {
      // With borderBoxSize empty → falls back to offsetWidth/offsetHeight
      itemResizeCallback([ {
        target: target1,
        contentRect: { width: 90, height: 40 } as DOMRectReadOnly,
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      } ], {} as ResizeObserver);

      expect(updateItemSizes).toHaveBeenCalledWith([ { index: 0, inlineSize: 100, blockSize: 50, element: target1 } ]);

      updateItemSizes.mockClear();

      // With borderBoxSize present and colIndex set → uses borderBoxSize values
      itemResizeCallback([ {
        target: target2,
        contentRect: { width: 90, height: 40 } as DOMRectReadOnly,
        borderBoxSize: [ { inlineSize: 120, blockSize: 60 } ],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      } ], {} as ResizeObserver);

      expect(updateItemSizes).toHaveBeenCalledWith([ { index: -1, inlineSize: 120, blockSize: 60, element: target2 } ]);

      updateItemSizes.mockClear();

      // Entry with NaN index and no colIndex → should be ignored
      const targetInvalid = document.createElement('div');
      // No dataset.index set → Number(undefined) = NaN
      itemResizeCallback([ {
        target: targetInvalid,
        contentRect: { width: 10, height: 10 } as DOMRectReadOnly,
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      } ], {} as ResizeObserver);

      expect(updateItemSizes).not.toHaveBeenCalled();
    }
  });

  it('skips ResizeObserver construction when window is undefined', () => {
    const constructorSpy = vi.spyOn(globalThis, 'ResizeObserver');
    constructorSpy.mockClear();

    const hostRef = ref<HTMLElement | null>(null);
    const wrapperRef = ref<HTMLElement | null>(null);
    const headerRef = ref<HTMLElement | null>(null);
    const footerRef = ref<HTMLElement | null>(null);
    const measuredPaddingStart = ref(0);
    const measuredPaddingEnd = ref(0);
    const itemRefs = new Map<number, HTMLElement>();
    const updateHostOffset = vi.fn();
    const updateItemSizes = vi.fn();

    vi.stubGlobal('window', undefined);
    try {
      // Called directly (no component mount): without a window no observers
      // are constructed, but item refs still work
      const { setItemRef } = useVirtualScrollObservers({
        hostRef,
        wrapperRef,
        headerRef,
        footerRef,
        measuredPaddingStart,
        measuredPaddingEnd,
        itemRefs,
        direction: 'vertical',
        updateHostOffset,
        updateItemSizes,
      });

      expect(constructorSpy).not.toHaveBeenCalled();
      const el = document.createElement('div');
      setItemRef(el, 5);
      expect(itemRefs.get(5)).toBe(el);
    } finally {
      vi.unstubAllGlobals();
    }

    constructorSpy.mockRestore();
  });
  it('measures header and footer padding via the extra resize observer', () => {
    const hostRef = ref<HTMLElement | null>(null);
    const wrapperRef = ref<HTMLElement | null>(null);
    const headerRef = ref<HTMLElement | null>(null);
    const footerRef = ref<HTMLElement | null>(null);
    const measuredPaddingStart = ref(0);
    const measuredPaddingEnd = ref(0);
    const itemRefs = new Map<number, HTMLElement>();
    const updateHostOffset = vi.fn();
    const updateItemSizes = vi.fn();

    const resizeCallbacks: ResizeObserverCallback[] = [];
    vi.spyOn(globalThis, 'ResizeObserver').mockImplementation(function (cb: ResizeObserverCallback) {
      resizeCallbacks.push(cb);
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      } as unknown as ResizeObserver;
    } as unknown as typeof ResizeObserver);

    mount(createTestComponent(() => {
      useVirtualScrollObservers({
        hostRef,
        wrapperRef,
        headerRef,
        footerRef,
        measuredPaddingStart,
        measuredPaddingEnd,
        itemRefs,
        direction: 'vertical',
        updateHostOffset,
        updateItemSizes,
      });
    }));

    const header = document.createElement('div');
    Object.defineProperty(header, 'offsetHeight', { configurable: true, get: () => 50 });
    const footer = document.createElement('div');
    Object.defineProperty(footer, 'offsetHeight', { configurable: true, get: () => 30 });

    headerRef.value = header;
    footerRef.value = footer;

    // resizeCallbacks[2] is the extra observer (header/footer padding)
    resizeCallbacks[ 2 ]?.([], {} as ResizeObserver);

    expect(measuredPaddingStart.value).toBe(50);
    expect(measuredPaddingEnd.value).toBe(30);
    expect(updateHostOffset).toHaveBeenCalled();

    // Unmeasured (zero-height) header/footer fall back to 0 padding
    const flatHeader = document.createElement('div');
    const flatFooter = document.createElement('div');
    headerRef.value = flatHeader;
    footerRef.value = flatFooter;
    resizeCallbacks[ 2 ]?.([], {} as ResizeObserver);

    expect(measuredPaddingStart.value).toBe(0);
    expect(measuredPaddingEnd.value).toBe(0);

    vi.restoreAllMocks();
  });
});
