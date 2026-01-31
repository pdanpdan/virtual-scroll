# @pdanpdan/virtual-scroll

A high-performance, flexible virtual scrolling component for Vue 3.

## Scaled Virtual Scroll

To support massive datasets (billions of pixels) while staying within browser scroll limits, the library uses a dual-unit coordinate system:

*   **VU (Virtual Units)**: The internal coordinate system representing the actual size of your content.
*   **DU (Display Units)**: The browser's physical coordinate system (limited to `BROWSER_MAX_SIZE`).

The library automatically calculates a scaling factor and applies a specialized formula to ensure **1:1 movement** in the viewport during wheel and touch scrolling, while maintaining proportional positioning during scrollbar interaction.

### Core Rendering Rule
Items are rendered at their VU size and positioned using `translateY()` based on the current display scroll position and their virtual offset. This prevents "jumping" and maintains sub-pixel precision even at extreme scales.
- **Virtual Scrollbars**: Fully customizable virtual scrollbars that replace native ones, perfect for consistent cross-browser styling.
- **Dynamic & Fixed Sizes**: Supports both uniform item sizes and variable sizes via `ResizeObserver`.
- **Multi-Directional**: Works in `vertical`, `horizontal`, or `both` (grid) directions.
- **Container Flexibility**: Can use a custom element or the browser `window`/`body` as the scroll container.
- **SSR Support**: Built-in support for pre-rendering specific ranges for Server-Side Rendering.
- **Feature Rich**: Supports infinite scroll, loading states, sticky sections, headers, footers, buffers, and programmatic scrolling.
- **Scroll Restoration**: Automatically maintains scroll position when items are prepended to the list.
- **RTL Support**: Full support for Right-to-Left (RTL) layouts with automatic detection.

## Installation

```bash
pnpm add @pdanpdan/virtual-scroll
```

## Usage Modes

The package provides two ways to use the component, depending on your build setup and requirements.

### 1. Compiled Component (Recommended)

This is the standard way to use the library. It uses the pre-compiled JavaScript version, which is compatible with most modern bundlers.

**Important:** You must manually import the CSS file for styles to work.

```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

import '@pdanpdan/virtual-scroll/style.css';
</script>
```

### 2. Original Vue SFC

If you want to compile the component yourself using your own Vue compiler configuration, you can import the raw `.vue` file.

```vue
<script setup>
import VirtualScroll from '@pdanpdan/virtual-scroll/VirtualScroll.vue';
// No need to import CSS; it's handled by your Vue loader/plugin
</script>
```

### 3. CDN Usage

```html
<!-- Import Vue 3 first -->
<script src="https://unpkg.com/vue@3"></script>
<!-- Import VirtualScroll CSS -->
<link rel="stylesheet" href="https://unpkg.com/@pdanpdan/virtual-scroll/dist/style.css">
<!-- Import VirtualScroll JavaScript -->
<script src="https://unpkg.com/@pdanpdan/virtual-scroll"></script>
```

## Basic Usage

```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

import '@pdanpdan/virtual-scroll/style.css';

const items = Array.from({ length: 10000 }, (_, i) => ({ id: i, label: `Item ${ i }` }));
</script>

<template>
  <VirtualScroll :items="items" :item-size="50" class="my-container">
    <template #item="{ item, index }">
      <div class="my-item">{{ index }}: {{ item.label }}</div>
    </template>
  </VirtualScroll>
</template>

<style>
.my-container { height: 500px; }
.my-item { height: 50px; }
</style>
```

## Sizing Guide

| Option Type | `itemSize` / `columnWidth` | Performance | Description |
|-------------|----------------------------|-------------|-------------|
| **Fixed** | `number` (e.g., `50`) | **Best** | Every item has the exact same size. Calculations are *O(1)*. |
| **Array** | `number[]` (cols only) | **Great** | Each column has a fixed size from the array (cycles if shorter). |
| **Function** | `(item, index) => number` | **Good** | Size is known but varies per item. |
| **Dynamic** | `0`, `null`, or `undefined` | **Fair** | Sizes are measured automatically via `ResizeObserver`. |

## Component Reference: VirtualScroll

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | Required | Array of items to be virtualized. |
| `itemSize` | `number \| fn \| null` | `40` | Fixed size or function. Pass `0`/`null` for dynamic. |
| `direction` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Scroll direction. |
| `columnCount` | `number` | `0` | Number of columns for grid mode. |
| `columnWidth` | `num \| num[] \| fn \| null` | `100` | Width for columns in grid mode. |
| `gap` / `columnGap` | `number` | `0` | Spacing between items/columns. |
| `stickyIndices` | `number[]` | `[]` | Indices of items that should remain sticky. |
| `stickyHeader` / `stickyFooter` | `boolean` | `false` | If true, measures and adds slot size to padding. |
| `virtualScrollbar` | `boolean` | `false` | Whether to force virtual scrollbars. |
| `restoreScrollOnPrepend` | `boolean` | `false` | Maintain position when items added to top. |
| `container` | `HTMLElement \| Window` | `hostRef` | The scrollable container element. |
| `scrollPaddingStart` / `End` | `num \| {x, y}` | `0` | Padding for scroll calculations. |
| `bufferBefore` / `bufferAfter` | `number` | `5` | Items to render outside the viewport. |
| `initialScrollIndex` | `number` | `undefined` | Index to jump to on mount. |
| `initialScrollAlign` | `ScrollAlignment \| object` | `'start'` | Alignment for initial jump. See [ScrollAlignment](#scrollalignment). |
| `defaultItemSize` / `defaultColumnWidth` | `number` | `40 / 100` | Estimate for dynamic items/columns. |

### Slots

- `item`: Scoped slot for individual items. Provides `item`, `index`, `columnRange`, `getColumnWidth`, `gap`, `columnGap`, `isSticky`, `isStickyActive`.
- `header` / `footer`: Content rendered at the top/bottom of the scrollable area.
- `loading`: Content shown at the end when `loading` prop is true.
- `scrollbar`: Scoped slot for custom scrollbar.
    - `positionPercent`: current position (0-1).
    - `viewportPercent`: viewport percentage (0-1).
    - `trackProps`: attributes/listeners for track. Bind with `v-bind="trackProps"`. See [ScrollbarSlotProps](#scrollbarslotprops).
    - `thumbProps`: attributes/listeners for thumb. Bind with `v-bind="thumbProps"`. See [ScrollbarSlotProps](#scrollbarslotprops).
    - `scrollbarProps`: grouped props for `VirtualScrollbar` component.
        - `axis`: `'vertical' | 'horizontal'`
        - `totalSize`: virtual content size in pixels.
        - `position`: current virtual scroll offset.
        - `viewportSize`: virtual visible area size.
        - `scrollToOffset`: `(offset: number) => void`
        - `containerId`: unique ID of the container.
        - `isRtl`: `boolean` (current RTL state).

### Exposed Members

The following properties and methods are available on the `VirtualScroll` component instance (via template `ref`).

#### Properties
- **All Props**: All properties defined in [Props](#props) are available on the instance.
- [`scrollDetails`](#scrolldetails): Full reactive state of the virtual scroll system.
- [`columnRange`](#columnrange): Information about the current visible range of columns.
- `isHydrated`: `true` when the component is mounted and hydrated.
- `isRtl`: `true` if the container is in Right-to-Left mode.
- [`scrollbarPropsVertical`](#scrollbarslotprops) / [`scrollbarPropsHorizontal`](#scrollbarslotprops): Reactive [ScrollbarSlotProps](#scrollbarslotprops).
- `scaleX` / `scaleY`: Current coordinate scaling factors (VU/DU).
- `renderedWidth` / `renderedHeight`: Physical dimensions in DOM (clamped, DU).
- `componentOffset`: Absolute offset of the component within its container (DU).

#### Methods
- `scrollToIndex(row, col, options)`: Programmatic scroll to index.
- `scrollToOffset(x, y, options)`: Programmatic scroll to pixel position.
- `refresh()`: Resets all measurements and state.
- `stopProgrammaticScroll()`: Halt smooth scroll animations.
- `updateDirection()`: Manually trigger direction detection.
- `getRowHeight(index)`: Returns the calculated height of a row.
- `getColumnWidth(index)`: Returns the calculated width of a column.
- `getRowOffset(index)`: Returns the virtual offset of a row.
- `getColumnOffset(index)`: Returns the virtual offset of a column.
- `getItemOffset(index)`: Returns the virtual offset of an item.
- `getItemSize(index)`: Returns the size of an item along the scroll axis.

## Virtual Scrollbars

Virtual scrollbars are automatically enabled when content size exceeds browser limits, but can be forced via the `virtualScrollbar` prop.

**Note:** Virtual scrollbars and coordinate scaling are automatically disabled when the `container` is the browser `window` or `body`. In these cases, native scrolling behavior is used.

### Using the `VirtualScrollbar` Component

You can use the built-in `VirtualScrollbar` independently if needed.

```vue
<script setup>
import { VirtualScrollbar } from '@pdanpdan/virtual-scroll';
import { ref } from 'vue';

const scrollX = ref(0);
const scrollY = ref(0);
</script>

<template>
  <div class="my-container relative overflow-hidden">
    <VirtualScrollbar
      axis="vertical"
      :total-size="10000"
      :viewport-size="500"
      :position="scrollY"
      @scroll-to-offset="val => scrollY = val"
    />
    <VirtualScrollbar
      axis="horizontal"
      :total-size="10000"
      :viewport-size="800"
      :position="scrollX"
      @scroll-to-offset="val => scrollX = val"
    />
  </div>
</template>
```

### Using the `scrollbar` Slot

The `scrollbar` slot provides everything needed to build a fully custom interface using `v-bind`. It is called once for each active axis.

```vue
<template>
  <VirtualScroll :items="items" direction="both" virtual-scrollbar>
    <template #scrollbar="{ trackProps, thumbProps, axis }">
      <!-- Handle axes separately -->
      <div v-if="axis === 'vertical'" v-bind="trackProps" class="custom-v-track">
        <div v-bind="thumbProps" class="custom-v-thumb" />
      </div>
      <div v-else v-bind="trackProps" class="custom-h-track">
        <div v-bind="thumbProps" class="custom-h-thumb" />
      </div>
    </template>
  </VirtualScroll>
</template>
```

### CSS Variables for Default Scrollbar

| Variable | Default (Light/Dark) | Description |
|----------|-----------------|-------------|
| `--vs-scrollbar-bg` | `rgba(230,230,230,0.9) / rgba(30,30,30,0.9)` | Track background color. |
| `--vs-scrollbar-thumb-bg` | `rgba(0,0,0,0.3) / rgba(255,255,255,0.3)` | Thumb background color. |
| `--vs-scrollbar-thumb-hover-bg` | `rgba(0,0,0,0.6) / rgba(255,255,255,0.6)` | Thumb background on hover/active. |
| `--vs-scrollbar-size` | `8px` | Width/height of the scrollbar. |
| `--vs-scrollbar-radius` | `4px` | Border radius for track and thumb. |
| `--vs-scrollbar-cross-gap` | `var(--vs-scrollbar-size)` | Size of gap to use where scrollbars meet. |
| `--vs-scrollbar-has-cross-gap` | `0` | If gap should be shown where scrollbars meet. |

## Composables

### `useVirtualScroll`

Provides the core logic for virtualization.

```ts
/* eslint-disable unused-imports/no-unused-vars, no-undef */
const { renderedItems, scrollDetails, scrollToIndex } = useVirtualScroll(props);
```

### `useVirtualScrollbar`

Provides the logic for scrollbar interactions.

```ts
/* eslint-disable unused-imports/no-unused-vars, no-undef */
const { trackProps, thumbProps } = useVirtualScrollbar(props);
```

## Utility Functions

- **Type Guards**:
    - `isElement(val: any): val is HTMLElement`: Checks if value is a standard `HTMLElement` (excludes `window`).
    - `isWindow(val: any): val is Window`: Checks for the global `window` object.
    - `isBody(val: any): val is HTMLElement`: Checks for the `document.body` element.
    - `isWindowLike(val: any): boolean`: Returns `true` if the value is `window` or `body`.
    - `isScrollableElement(val: any): val is HTMLElement | Window`: Checks if value has scroll properties.
    - `isScrollToIndexOptions(val: any): val is ScrollToIndexOptions`: Type guard for scroll options.
- `getPaddingX(p: number | object, dir: string): number`: Internal helper for padding.
- `getPaddingY(p: number | object, dir: string): number`: Internal helper for padding.
- **Coordinate Mapping**:
    - `displayToVirtual(displayPos, hostOffset, scale): number`: Display pixels to virtual pixels.
    - `virtualToDisplay(virtualPos, hostOffset, scale): number`: Virtual pixels to display pixels.
- `isItemVisible(itemPos, itemSize, scrollPos, viewSize, stickyOffset?): boolean`: Check item visibility.
- `FenwickTree`: Highly efficient data structure for size and offset management.
- **Default Constants**:
    - `BROWSER_MAX_SIZE`: 10,000,000 (coordinate scaling threshold).
    - `DEFAULT_ITEM_SIZE`: 40px (default row height).
    - `DEFAULT_COLUMN_WIDTH`: 100px (default column width).
    - `DEFAULT_BUFFER`: 5 items (default buffer before/after).

## API Reference

### Types

#### `ScrollDirection`
Values: `'vertical' | 'horizontal' | 'both'`

#### `ScrollAxis`
Values: `'vertical' | 'horizontal'`

#### `ScrollAlignment`
Values: `'start' | 'center' | 'end' | 'auto'`

#### `ScrollToIndexOptions`
- `align`: `ScrollAlignment | ScrollAlignmentOptions`
- `behavior`: `'auto' | 'smooth'`

#### `ScrollAlignmentOptions`
- `x`: `ScrollAlignment`
- `y`: `ScrollAlignment`

#### `ScrollbarSlotProps`
- `positionPercent`: current position as a percentage (0 to 1).
- `viewportPercent`: viewport as a percentage of total size (0 to 1).
- `trackProps`: attributes/listeners for track. Bind with `v-bind="trackProps"`.
- `thumbProps`: attributes/listeners for thumb. Bind with `v-bind="thumbProps"`.
- `scrollbarProps`: grouped props for `VirtualScrollbar` component.
    - `axis`: `'vertical' | 'horizontal'`
    - `totalSize`: virtual content size in pixels.
    - `position`: current virtual scroll offset.
    - `viewportSize`: virtual visible area size.
    - `scrollToOffset`: `(offset: number) => void`
    - `containerId`: unique ID of the container.
    - `isRtl`: `boolean`

#### `ScrollDetails`
- `items`: `RenderedItem<T>[]`
- `currentIndex`: number (first visible row index below header)
- `currentColIndex`: number (first visible column index after sticky)
- `currentEndIndex`: number
- `currentEndColIndex`: number
- `scrollOffset`: `{ x, y }` (VU)
- `displayScrollOffset`: `{ x, y }` (DU)
- `viewportSize`: `{ width, height }` (VU)
- `displayViewportSize`: `{ width, height }` (DU)
- `totalSize`: `{ width, height }` (VU)
- `isScrolling`: boolean
- `isProgrammaticScroll`: boolean
- `range`: `{ start, end }`
- `columnRange`: `ColumnRange`

#### `ColumnRange`
- `start`: number
- `end`: number
- `padStart`: number (VU)
- `padEnd`: number (VU)

#### `RenderedItem`
- `item`: `T`
- `index`: number
- `offset`: `{ x, y }` (DU)
- `size`: `{ width, height }` (VU)
- `originalX` / `originalY`: number (VU)
- `isSticky`: boolean
- `isStickyActive`: boolean
- `stickyOffset`: `{ x, y }` (DU)

### Methods

The following methods are exposed by the `VirtualScroll` component and the `useVirtualScroll` composable:

- `scrollToIndex(rowIndex, colIndex, options)`: Ensures a specific item is visible.
- `scrollToOffset(x, y, options)`: Scrolls to an absolute pixel position.
- `refresh()`: Resets all dynamic measurements and state.
- `getRowHeight(index)` / `getColumnWidth(index)`: Returns calculated sizes.
- `updateItemSize` / `updateItemSizes`: Manually registers new measurements.
- `updateHostOffset()`: Recalculates the component's relative position.
- `updateDirection()`: Manually triggers RTL/LTR detection.
- `stopProgrammaticScroll()`: Halts any active smooth scroll animation.

For detailed type definitions and utility functions, see the [Full API Reference](https://pdandev.github.io/virtual-scroll/docs).

## License

MIT
