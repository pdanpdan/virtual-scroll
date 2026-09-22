<script setup lang="ts" generic="T">
/**
 * Virtual scrolling component for Vue 3: renders only the items near the viewport
 * and switches to coordinate scaling when the content passes the browser's scroll
 * limit. Sticky items, RTL, snapping, infinite loading, prepend restoration and
 * custom scrollbars are wired in as extensions; the `./core` entry builds the same
 * component without them.
 *
 * The engine wiring and the shared accessibility helpers come from
 * {@link useVirtualScrollComponent}; what stays here is this component's markup,
 * its tag props and its ARIA role model.
 */
import type { LoadDetails } from '../extensions/all';
import type {
  ItemSlotProps,
  ScrollbarSlotProps,
  ScrollDetails,
  VirtualScrollComponentProps,
} from '../types';
import type { VNodeChild } from 'vue';

import { computed, toRefs } from 'vue';

import { useVirtualScrollComponent } from '../composables/useVirtualScrollComponent';
import { DEFAULT_BUFFER, DEFAULT_LOAD_DISTANCE } from '../types';
import VirtualScrollbars from './VirtualScrollbars.vue';

export interface Props<T = unknown> extends VirtualScrollComponentProps<T> {}

const props = withDefaults(defineProps<Props<T>>(), {
  direction: 'vertical',
  bufferBefore: DEFAULT_BUFFER,
  bufferAfter: DEFAULT_BUFFER,
  columnCount: 0,
  containerTag: 'div',
  wrapperTag: 'div',
  itemTag: 'div',
  headerTag: 'div',
  footerTag: 'div',
  scrollPaddingStart: 0,
  scrollPaddingEnd: 0,
  stickyHeader: false,
  stickyFooter: false,
  gap: 0,
  columnGap: 0,
  stickyIndices: () => [],
  loadDistance: DEFAULT_LOAD_DISTANCE,
  loading: false,
  restoreScrollOnPrepend: false,
  debug: false,
  virtualScrollbar: false,
});

const emit = defineEmits<{
  (e: 'scroll', details: ScrollDetails<T>): void;
  (e: 'load', direction: 'vertical' | 'horizontal', details: LoadDetails): void;
  (e: 'itemActivate', index: number, item: T | undefined): void;
  (e: 'visibleRangeChange', range: { start: number; end: number; colStart: number; colEnd: number; }): void;
}>();

const slots = defineSlots<{
  /**
   * Content rendered at the top of the scrollable area.
   * Can be made sticky using the `stickyHeader` prop.
   */
  header?: (props: Record<string, never>) => VNodeChild;

  /**
   * Scoped slot for rendering each individual item.
   */
  item?: (props: ItemSlotProps<T>) => VNodeChild;

  /**
   * Content shown at the end of the list when the `loading` prop is true.
   * Also prevents additional 'load' events from triggering while visible.
   */
  loading?: (props: Record<string, never>) => VNodeChild;

  /**
   * Content rendered at the bottom of the scrollable area.
   * Can be made sticky using the `stickyFooter` prop.
   */
  footer?: (props: Record<string, never>) => VNodeChild;

  /**
   * Scoped slot for rendering custom scrollbars.
   * If provided, the default VirtualScrollbar is not rendered.
   */
  scrollbar?: (props: ScrollbarSlotProps) => VNodeChild;
}>();

/**
 * Roles that publish an active descendant. A `grid` is deliberately not one of
 * them: a two-axis list defaults to that role, and flipping its keyboard model
 * is opt-in through `keyboardActivation`.
 */
const ACTIVE_DESCENDANT_ROLES = new Set([ 'listbox', 'menu', 'tree' ]);

/** ARIA role of the component, from the `role` prop or the direction. */
const effectiveRole = computed((): string => {
  if (props.role) {
    return props.role;
  }
  return props.direction === 'both' ? 'grid' : 'list';
});

const isGrid = computed(() => effectiveRole.value === 'grid');

const containerRole = computed(() => (props.ariaLabel || props.ariaLabelledby) ? 'region' : undefined);
const wrapperRole = computed(() => effectiveRole.value);
const internalItemRole = computed(() => {
  if (isGrid.value) {
    return 'row';
  }

  const role = effectiveRole.value;
  if (role === 'tree') {
    return 'treeitem';
  }
  if (role === 'listbox') {
    return 'option';
  }
  if (role === 'menu') {
    return 'menuitem';
  }
  return 'listitem';
});
const itemRole = computed(() => props.itemRole ?? internalItemRole.value);
const cellRole = computed(() => {
  if (props.role === 'grid' || (!props.role && props.direction === 'both')) {
    return 'gridcell';
  }
  return null;
});

const {
  hostRef,
  wrapperRef,
  headerRef,
  footerRef,
  loadingRef,
  containerId,
  setItemRef,
  isHydrated,
  isRtl,
  isWindowContainer,
  useVirtualScrolling,
  scaleX,
  scaleY,
  componentOffset,
  scrollbarOffset,
  scrollDetails,
  renderedItems,
  columnRange,
  renderedWidth,
  renderedHeight,
  slotColumnRange,
  wrapperStyle,
  loadingStyle,
  getItemStyle,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleKeyDown,
  activeIndex,
  setActiveIndex,
  handleItemActivate,
  activeDescendant,
  showVirtualScrollbars,
  verticalScrollbarProps,
  horizontalScrollbarProps,
  rootAriaProps,
  shouldBindItemAria,
  isDebug,
  scrollToIndex,
  scrollToOffset,
  updateHostOffset,
  updateItemSize,
  updateItemSizes,
  updateDirection,
  getItemOffset,
  getItemSize,
  getRowOffset,
  getColumnOffset,
  getRowHeight,
  getColumnWidth,
  getRowIndexAt,
  getColumnIndexAt,
  refresh,
  stopProgrammaticScroll,
  stopInertia,
} = useVirtualScrollComponent<T>({
  props,
  containerTag: props.containerTag,
  itemRole,
  activationMode: computed(() => {
    const requested = props.keyboardActivation ?? 'auto';
    if (requested !== 'auto') {
      return requested;
    }
    return ACTIVE_DESCENDANT_ROLES.has(effectiveRole.value) ? 'item' : 'viewport';
  }),
  onScroll: (details) => emit('scroll', details),
  onVisibleRangeChange: (range) => emit('visibleRangeChange', range),
  onLoad: (direction, details) => emit('load', direction, details),
  onItemActivate: (index, item) => emit('itemActivate', index, item),
});

/**
 * Whether this is the lean `./core` build, where the optional wiring (keyboard,
 * custom scrollbars, snapping, sticky items, infinite loading and prepend
 * restoration) is compiled out. Replaced by the bundler; `false` in the full
 * build, in tests and in dev.
 */
/* v8 ignore next 2 -- the flag is undefined outside the two builds (vite.config.core.ts) */
const IS_CORE_BUILD
  /* eslint-disable-next-line no-undef -- injected by the bundler (see src/globals.d.ts) */
  = typeof __VS_CORE_BUILD__ === 'boolean' && __VS_CORE_BUILD__;

/** The scrollbar overlay, or `null` in the lean build. */
/* v8 ignore next -- the lean build is asserted by tests/build-output.test.ts */
const ScrollbarOverlay = IS_CORE_BUILD ? null : VirtualScrollbars;

const containerStyle = computed(() => {
  const base: Record<string, string | number | undefined> = {
    ...(props.direction !== 'vertical' ? { whiteSpace: 'nowrap' as const } : {}),
  };

  if (showVirtualScrollbars.value || !isWindowContainer.value) {
    base.overflow = 'auto';
  }

  if (useVirtualScrolling.value) {
    base.touchAction = 'none';
  }

  return base;
});

const wrapperAriaProps = computed(() => {
  const aria: Record<string, string | number | undefined> = {};

  const role = effectiveRole.value;
  const supportsOrientation = role && [ 'grid', 'tree', 'listbox', 'menu', 'tablist' ].includes(role);

  if (supportsOrientation) {
    aria[ 'aria-orientation' ] = props.direction === 'both' ? undefined : props.direction;
  }

  if (isGrid.value) {
    aria[ 'aria-rowcount' ] = props.items.length;
    if (props.columnCount > 0) {
      aria[ 'aria-colcount' ] = props.columnCount;
    }
  }

  return aria;
});

function getItemAriaProps(index: number) {
  const aria: Record<string, string | number | undefined> = {};

  if (isGrid.value) {
    aria[ 'aria-rowindex' ] = index + 1;
  } else {
    aria[ 'aria-setsize' ] = props.items.length;
    aria[ 'aria-posinset' ] = index + 1;
  }

  const role = itemRole.value;
  // v8 ignore next -- itemRole falls back to internalItemRole, which is never null
  if (role !== null) {
    aria.role = (role === 'none' || role === 'presentation')
      ? internalItemRole.value
      : role;
  }

  return aria;
}

function getCellAriaProps(colIndex: number) {
  const role = cellRole.value;
  if (!role) {
    return {};
  }

  const aria: Record<string, string | number | undefined> = {
    role,
  };

  // v8 ignore next -- a truthy cellRole implies grid or table mode, so isGrid is always true here
  if (isGrid.value) {
    aria[ 'aria-colindex' ] = colIndex + 1;
  }

  return aria;
}

defineExpose({
  ...toRefs(props),

  /**
   * Detailed information about the current scroll state.
   * @see ScrollDetails
   * @see useVirtualScroll
   */
  scrollDetails,

  /**
   * Information about the current visible range of columns.
   * @see ColumnRange
   * @see useVirtualScroll
   */
  columnRange,

  /**
   * Index of the item tracked by keyboard navigation, `-1` when no item is active.
   * @see useVirtualScrollKeyboard
   */
  activeIndex,

  /**
   * Sets the active item index without scrolling. Pass `null` to clear it.
   * @param index - The item index, or `null`.
   */
  setActiveIndex,

  /**
   * Marks an item active and emits `itemActivate` - wire it to your click handler.
   * @param index - The item index.
   */
  handleItemActivate,

  /**
   * Helper to get the width of a specific column.
   * @param index - The column index.
   * @see useVirtualScroll
   */
  getColumnWidth,

  /**
   * Helper to get the height of a specific row.
   * @param index - The row index.
   * @see useVirtualScroll
   */
  getRowHeight,

  /**
   * Helper to get ARIA attributes for a cell.
   * @param colIndex - The column index.
   */
  getCellAriaProps,

  /**
   * Helper to get ARIA attributes for an item.
   * @param index - The item index.
   */
  getItemAriaProps,

  /**
   * Helper to get the virtual offset of a specific row.
   * @param index - The row index.
   * @see useVirtualScroll
   */
  getRowOffset,

  /**
   * Helper to get the virtual offset of a specific column.
   * @param index - The column index.
   * @see useVirtualScroll
   */
  getColumnOffset,

  /**
   * Helper to get the virtual offset of a specific item.
   * @param index - The item index.
   * @see useVirtualScroll
   */
  getItemOffset,

  /**
   * Helper to get the size of a specific item along the scroll axis.
   * @param index - The item index.
   * @see useVirtualScroll
   */
  getItemSize,

  /**
   * The ARIA role of the items wrapper.
   */
  wrapperRole,

  /**
   * The ARIA role of each cell in grid mode.
   */
  cellRole,

  /**
   * Helper to get the row (or item) index at a specific vertical (or horizontal in horizontal mode) virtual offset (VU).
   * @param offset - The virtual pixel offset.
   * @see useVirtualScroll
   */
  getRowIndexAt,

  /**
   * Helper to get the column index at a specific horizontal virtual offset (VU).
   * @param offset - The virtual pixel offset.
   * @see useVirtualScroll
   */
  getColumnIndexAt,

  /**
   * Programmatically scroll to a specific row and/or column.
   *
   * @param rowIndex - The row index to scroll to. Pass null to only scroll horizontally. Optional.
   * @param colIndex - The column index to scroll to. Pass null to only scroll vertically. Optional.
   * @param options - Alignment and behavior options. Defaults to { align: 'auto', behavior: 'auto' }.
   * @see ScrollAlignment
   * @see ScrollToIndexOptions
   * @see useVirtualScroll
   */
  scrollToIndex,

  /**
   * Programmatically scroll to a specific pixel offset.
   *
   * @param x - The pixel offset to scroll to on the X axis. Pass null to keep current position.
   * @param y - The pixel offset to scroll to on the Y axis. Pass null to keep current position.
   * @param options - Scroll options (behavior). Defaults to { behavior: 'auto' }.
   * @see useVirtualScroll
   */
  scrollToOffset,

  /**
   * Resets all dynamic measurements and re-initializes from props.
   * @see useVirtualScroll
   */
  refresh,

  /**
   * Immediately stops any currently active smooth scroll animation and clears pending corrections.
   * @see useVirtualScroll
   */
  stopProgrammaticScroll: () => {
    stopProgrammaticScroll();
    stopInertia();
  },

  /**
   * Detects the current direction (LTR/RTL) of the scroll container.
   */
  updateDirection,

  /**
   * Updates the physical offset of the component relative to its scroll container.
   * Useful after layout changes (e.g., parent resize, DOM mutations).
   * @see useVirtualScroll
   */
  updateHostOffset,

  /**
   * Updates the size of a single item in the measurement tree.
   * @param index - The item index.
   * @param inlineSize - Measured inline size of the element (width for horizontal, width in both modes).
   * @param blockSize - Measured block size of the element (height for vertical, height in both modes).
   * @param element - Optional DOM element used for column measurement in grid mode.
   * @see useVirtualScroll
   */
  updateItemSize,

  /**
   * Batch-updates sizes for multiple items.
   * @param updates - Array of size measurements.
   * @see useVirtualScroll
   */
  updateItemSizes,

  /**
   * Whether the scroll container is in Right-to-Left (RTL) mode.
   */
  isRtl,

  /**
   * Whether the component has finished its first client-side mount and hydration.
   */
  isHydrated,

  /**
   * Coordinate scaling factor for X axis.
   */
  scaleX,

  /**
   * Coordinate scaling factor for Y axis.
   */
  scaleY,

  /**
   * Physical width of the content in the DOM (clamped to browser limits).
   */
  renderedWidth,

  /**
   * Physical height of the content in the DOM (clamped to browser limits).
   */
  renderedHeight,

  /**
   * Absolute offset of the component within its container.
   */
  componentOffset,

  /**
   * Properties for the vertical scrollbar.
   * Useful when building custom scrollbar interfaces.
   */
  scrollbarPropsVertical: verticalScrollbarProps,

  /**
   * Properties for the horizontal scrollbar.
   * Useful when building custom scrollbar interfaces.
   */
  scrollbarPropsHorizontal: horizontalScrollbarProps,
});
</script>

<template>
  <component
    :is="containerTag"
    :id="containerId"
    ref="hostRef"
    class="virtual-scroll-container"
    :class="[
      `virtual-scroll--${ direction }`,
      {
        'virtual-scroll--hydrated': isHydrated,
        'virtual-scroll--window': isWindowContainer,
        'virtual-scroll--hide-scrollbar': showVirtualScrollbars,
      },
    ]"
    :style="containerStyle"
    tabindex="0"
    :role="containerRole"
    v-bind="rootAriaProps"
    @keydown="handleKeyDown?.($event)"
    @pointerdown="handlePointerDown"
    @pointermove="handlePointerMove"
    @pointerup="handlePointerUp"
    @pointercancel="handlePointerUp"
  >
    <component
      :is="ScrollbarOverlay"
      v-if="ScrollbarOverlay && showVirtualScrollbars"
      :vertical="verticalScrollbarProps"
      :horizontal="horizontalScrollbarProps"
      :viewport-width="scrollDetails.displayViewportSize.width"
      :viewport-height="scrollDetails.displayViewportSize.height"
      :offset-x="scrollbarOffset.x"
      :offset-y="scrollbarOffset.y"
      :both="direction === 'both'"
    >
      <template v-if="slots.scrollbar" #scrollbar="slotProps">
        <slot name="scrollbar" v-bind="slotProps" />
      </template>
    </component>

    <component
      :is="headerTag"
      v-if="slots.header"
      ref="headerRef"
      class="virtual-scroll-header"
      :class="{ 'virtual-scroll--sticky': stickyHeader }"
    >
      <slot name="header" />
    </component>

    <component
      :is="wrapperTag"
      ref="wrapperRef"
      class="virtual-scroll-wrapper"
      :style="wrapperStyle"
      :role="wrapperRole"
      :aria-activedescendant="activeDescendant"
      v-bind="wrapperAriaProps"
    >
      <component
        :is="itemTag"
        v-for="renderedItem in renderedItems"
        :id="`${ containerId }-item-${ renderedItem.index }`"
        :key="renderedItem.index"
        :ref="(el: unknown) => setItemRef(el, renderedItem.index)"
        :data-index="renderedItem.index"
        class="virtual-scroll-item"
        :class="{
          'virtual-scroll--sticky': renderedItem.isStickyActive,
          'virtual-scroll--active': renderedItem.index === activeIndex,
          'virtual-scroll--debug': isDebug,
        }"
        :style="getItemStyle(renderedItem)"
        v-bind="shouldBindItemAria ? getItemAriaProps(renderedItem.index) : { role: 'none' }"
      >
        <slot
          name="item"
          :item="renderedItem.item"
          :index="renderedItem.index"
          :get-item-aria-props="getItemAriaProps"
          :column-range="slotColumnRange"
          :get-column-width="getColumnWidth"
          :get-cell-aria-props="getCellAriaProps"
          :gap="props.gap"
          :column-gap="props.columnGap"
          :is-sticky="renderedItem.isSticky"
          :is-sticky-active="renderedItem.isStickyActive"
          :is-sticky-active-x="renderedItem.isStickyActiveX"
          :is-sticky-active-y="renderedItem.isStickyActiveY"
          :is-active="renderedItem.index === activeIndex"
          :offset="renderedItem.offset"
        />

        <div v-if="isDebug" class="virtual-scroll-debug-info">
          #{{ renderedItem.index }} ({{ Math.round(renderedItem.offset.x) }}, {{ Math.round(renderedItem.offset.y) }})
        </div>
      </component>
    </component>

    <div
      v-if="slots.loading"
      ref="loadingRef"
      class="virtual-scroll-loading"
      :class="{ 'virtual-scroll-loading--hidden': !loading }"
      :style="loadingStyle"
      aria-live="polite"
      aria-atomic="true"
    >
      <slot name="loading" />
    </div>

    <component
      :is="footerTag"
      v-if="slots.footer"
      ref="footerRef"
      class="virtual-scroll-footer"
      :class="{ 'virtual-scroll--sticky': stickyFooter }"
    >
      <slot name="footer" />
    </component>
  </component>
</template>

<style scoped>
@layer components {
  .virtual-scroll-container {
    position: relative;
    block-size: 100%;
    inline-size: 100%;
    outline-offset: 1px;
    overflow-anchor: none;

    &:not(.virtual-scroll--window) {
      overflow: auto;
      overscroll-behavior: contain;
    }

    &.virtual-scroll--hide-scrollbar {
      scrollbar-width: none;
      -ms-overflow-style: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &.virtual-scroll--horizontal,
    &.virtual-scroll--both {
      white-space: nowrap;
    }
  }

  .virtual-scroll--active {
    outline: 2px solid currentColor;
    outline-offset: -2px;
  }

  .virtual-scroll-wrapper {
    contain: layout;
    position: relative;

    :where(.virtual-scroll--hydrated > & > .virtual-scroll-item) {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
    }
  }

  .virtual-scroll-item {
    display: grid;
    box-sizing: border-box;
    will-change: transform;

    &:where(.virtual-scroll--debug) {
      outline: 1px dashed rgba(255, 0, 0, 0.5);
      background-color: rgba(255, 0, 0, 0.05);

      &:where(:hover) {
        background-color: rgba(255, 0, 0, 0.1);
        z-index: 100;
      }
    }
  }

  .virtual-scroll-debug-info {
    position: absolute;
    inset-block-start: 2px;
    inset-inline-end: 2px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 10px;
    padding: 2px 4px;
    border-radius: 4px;
    pointer-events: none;
    z-index: 100;
    font-family: monospace;
  }

  .virtual-scroll-header,
  .virtual-scroll-footer {
    position: relative;
    z-index: 20;
  }

  .virtual-scroll-loading--hidden {
    visibility: hidden;
  }

  .virtual-scroll--sticky {
    position: sticky;

    &:where(.virtual-scroll-header) {
      inset-block-start: 0;
      inset-inline-start: 0;
      min-inline-size: 100%;
      box-sizing: border-box;
    }

    &:where(.virtual-scroll-footer) {
      inset-block-end: 0;
      inset-inline-start: 0;
      min-inline-size: 100%;
      box-sizing: border-box;
    }

    &:where(.virtual-scroll-item) {
      z-index: 10;
    }
  }
}
</style>
