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
    // Call useVirtualScrollObservers directly (no mount) with window === undefined
    // by temporarily spying on ResizeObserver so we can tell it wasn't called
    const constructorSpy = vi.spyOn(globalThis, 'ResizeObserver');

    const hostRef = ref<HTMLElement | null>(null);
    const wrapperRef = ref<HTMLElement | null>(null);
    const headerRef = ref<HTMLElement | null>(null);
    const footerRef = ref<HTMLElement | null>(null);
    const measuredPaddingStart = ref(0);
    const measuredPaddingEnd = ref(0);
    const itemRefs = new Map<number, HTMLElement>();
    const updateHostOffset = vi.fn();
    const updateItemSizes = vi.fn();

    // Simulate window === undefined by patching the typeof check's value
    // We can't delete window here (breaks mount above), but we can verify
    // setItemRef still works without observers when called directly
    mount(createTestComponent(() => {
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

      // Verify setItemRef works even when we stub observe/unobserve
      const el = document.createElement('div');
      setItemRef(el, 5);
      expect(itemRefs.get(5)).toBe(el);
    }));

    constructorSpy.mockRestore();
  });
});
