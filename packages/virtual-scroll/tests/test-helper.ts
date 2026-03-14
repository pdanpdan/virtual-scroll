import type { VirtualScrollExtension } from '../src/extensions';
import type { ScrollDirection, VirtualScrollProps } from '../src/types';
import type { Ref } from 'vue';
/* global ScrollToOptions, ResizeObserverCallback */

import { mount } from '@vue/test-utils';
import { vi } from 'vitest';
import {
  defineComponent,
  ref,
} from 'vue';

import { useVirtualScroll } from '../src/composables/useVirtualScroll';
import {
  useCoordinateScalingExtension,
  useInfiniteLoadingExtension,
  usePrependRestorationExtension,
  useRtlExtension,
  useSnappingExtension,
  useStickyExtension,
} from '../src/extensions/all';

// --- Mocks ---

interface ResizeObserverMock extends ResizeObserver {
  callback: ResizeObserverCallback;
  targets: Set<Element>;
}

export const observers: ResizeObserverMock[] = [];
globalThis.ResizeObserver = class ResizeObserver {
  callback: ResizeObserverCallback;
  targets = new Set<Element>();
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    observers.push(this as unknown as ResizeObserverMock);
  }

  observe(el: Element) {
    this.targets.add(el);
  }

  unobserve(el: Element) {
    this.targets.delete(el);
  }

  disconnect() {
    this.targets.clear();
  }
} as unknown as typeof ResizeObserver;

export function triggerResize(el: Element, width: number, height: number) {
  const obs = observers.find((o) => o.targets.has(el));
  if (obs) {
    obs.callback([ {
      borderBoxSize: [ { blockSize: height, inlineSize: width } ],
      contentRect: {
        bottom: height,
        height,
        left: 0,
        right: width,
        toJSON: () => '',
        top: 0,
        width,
        x: 0,
        y: 0,
      },
      target: el,
    } as unknown as ResizeObserverEntry ], obs);
  }
}

export const scrollState = { x: 0, y: 0 };

export function clearMocks() {
  scrollState.x = 0;
  scrollState.y = 0;
  vi.mocked(window.scrollTo)?.mockClear();
}

export function setupMocks() {
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, value: 500 });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 });
  Object.defineProperty(document.documentElement, 'clientHeight', { configurable: true, value: 500 });
  Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: 500 });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: 500 });
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: 500 });

  vi.spyOn(window, 'scrollX', 'get').mockImplementation(() => scrollState.x);
  vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollState.y);
  vi.spyOn(window, 'pageXOffset', 'get').mockImplementation(() => scrollState.x);
  vi.spyOn(window, 'pageYOffset', 'get').mockImplementation(() => scrollState.y);

  globalThis.window.scrollTo = vi.fn().mockImplementation((options: ScrollToOptions) => {
    if (options.left !== undefined) {
      scrollState.x = options.left;
    }
    if (options.top !== undefined) {
      scrollState.y = options.top;
    }
    document.dispatchEvent(new Event('scroll'));
  });

  HTMLElement.prototype.scrollTo = vi.fn().mockImplementation(function (this: HTMLElement, options: ScrollToOptions) {
    if (options.left !== undefined) {
      this.scrollLeft = options.left;
    }
    if (options.top !== undefined) {
      this.scrollTop = options.top;
    }
    this.dispatchEvent(new Event('scroll'));
  });
}

export interface MockItem {
  id: number;
}

export const mockItems = Array.from({ length: 100 }, (_, i) => ({ id: i }));

/** @internal */
export interface InternalState {
  scrollDirectionX: { value: 'start' | 'end' | null; };
  scrollDirectionY: { value: 'start' | 'end' | null; };
  internalScrollX: { value: number; };
  internalScrollY: { value: number; };
  isScrolling: { value: boolean; };
  isProgrammaticScroll: { value: boolean; };
  viewportWidth: { value: number; };
  viewportHeight: { value: number; };
  scaleX: { value: number; };
  scaleY: { value: number; };
  relativeScrollX: { value: number; };
  relativeScrollY: { value: number; };
  direction: { value: ScrollDirection; };
}

// Helper to test composable
export function setup<T>(propsValue: VirtualScrollProps<T>, customExtensions?: VirtualScrollExtension<T>[]) {
  let result: ReturnType<typeof useVirtualScroll<T>>;
  let internalState: InternalState;

  const extensions = customExtensions || [
    useRtlExtension<T>(),
    useSnappingExtension<T>(),
    useStickyExtension<T>(),
    useInfiniteLoadingExtension<T>({
      onLoad: () => {}, // Mock load emit
    }),
    usePrependRestorationExtension<T>(),
    useCoordinateScalingExtension<T>(),
  ] as VirtualScrollExtension<T>[];

  const propsRef = ref(propsValue) as Ref<VirtualScrollProps<T>>;

  const TestComponent = defineComponent({
    setup(_, { expose }) {
      const vs = useVirtualScroll(propsRef, extensions);
      result = vs;
      // @ts-expect-error - accessing internal state for testing
      internalState = vs.__internalState;
      expose({ vs });
      return () => null;
    },
  });
  const wrapper = mount(TestComponent);
  return { props: propsRef, result: result!, wrapper, internalState: internalState! };
}
