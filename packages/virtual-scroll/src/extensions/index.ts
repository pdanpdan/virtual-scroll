import type { RenderedItem, ScrollAlignment, ScrollAlignmentOptions, ScrollDetails, ScrollToIndexOptions, ScrollToIndexResult, Size, VirtualScrollProps } from '../types';
import type { Ref } from 'vue';

/**
 * Hook context provided to extensions.
 */
export interface ExtensionContext<T = unknown> {
  /** Reactive reference to the component props. */
  props: Ref<VirtualScrollProps<T>>;
  /** Reactive reference to the current scroll details. */
  scrollDetails: Ref<ScrollDetails<T>>;
  /** Total calculated or estimated size of the scrollable area (DU). */
  totalSize: Ref<Size>;
  /** Reactive reference to the current rendered item range. */
  range: Ref<{ start: number; end: number; }>;
  /** Reactive reference to the first visible item index. */
  currentIndex: Ref<number>;
  /** Reactive references to internal component state variables. */
  internalState: {
    /** Horizontal display scroll position (DU). */
    scrollX: Ref<number>;
    /** Vertical display scroll position (DU). */
    scrollY: Ref<number>;
    /** Horizontal virtual scroll position (VU). */
    internalScrollX: Ref<number>;
    /** Vertical virtual scroll position (VU). */
    internalScrollY: Ref<number>;
    /** Right-to-Left text direction state. */
    isRtl: Ref<boolean>;
    /** Scrolling activity state. */
    isScrolling: Ref<boolean>;
    /** Programmatic scroll activity state. */
    isProgrammaticScroll: Ref<boolean>;
    /** Viewport width (DU). */
    viewportWidth: Ref<number>;
    /** Viewport height (DU). */
    viewportHeight: Ref<number>;
    /** Coordinate scale factor for X axis. */
    scaleX: Ref<number>;
    /** Coordinate scale factor for Y axis. */
    scaleY: Ref<number>;
    /** Horizontal scroll direction. */
    scrollDirectionX: Ref<'start' | 'end' | null>;
    /** Vertical scroll direction. */
    scrollDirectionY: Ref<'start' | 'end' | null>;
    /** Relative horizontal virtual scroll position (VU). */
    relativeScrollX: Ref<number>;
    /** Relative vertical virtual scroll position (VU). */
    relativeScrollY: Ref<number>;
  };
  /** Direct access to core component methods. */
  methods: {
    /** Scroll to a specific row and/or column. */
    scrollToIndex: (rowIndex?: number | null, colIndex?: number | null, options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions) => ScrollToIndexResult;
    /** Scroll to a specific virtual pixel offset. */
    scrollToOffset: (x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void;
    /** Detect and update text direction. */
    updateDirection: () => void;
    /** Get row index at virtual offset. */
    getRowIndexAt: (offset: number) => number;
    /** Get column index at virtual offset. */
    getColIndexAt: (offset: number) => number;
    /** Get actual size of item (measured or estimated). */
    getItemSize: (index: number) => number;
    /** Get base configuration size of item. */
    getItemBaseSize: (item: T, index: number) => number;
    /** Get virtual offset of item. */
    getItemOffset: (index: number) => number;
    /** Adjust scroll position for measurement changes. */
    handleScrollCorrection: (addedX: number, addedY: number) => void;
  };
}

/**
 * Base interface for Virtual Scroll extensions.
 */
export interface VirtualScrollExtension<T = unknown> {
  /** Unique name of the extension. */
  name: string;
  /** Called when the component is initialized. */
  onInit?: (ctx: ExtensionContext<T>) => void;
  /** Called on every scroll event. */
  onScroll?: (ctx: ExtensionContext<T>, event: Event) => void;
  /** Called when scrolling activity stops. */
  onScrollEnd?: (ctx: ExtensionContext<T>) => void;
  /** Post-processor for the list of rendered items. */
  transformRenderedItems?: (items: RenderedItem<T>[], ctx: ExtensionContext<T>) => RenderedItem<T>[];
}
