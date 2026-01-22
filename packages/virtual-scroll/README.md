# @pdanpdan/virtual-scroll

A high-performance, flexible virtual scrolling component for Vue 3.

## Features

- **High Performance**: Optimized for large lists using Fenwick Tree (_O(log n)_) for offset calculations.
- **Dynamic & Fixed Sizes**: Supports both uniform item sizes and variable sizes via `ResizeObserver`.
- **Multi-Directional**: Works in `vertical`, `horizontal`, or `both` (grid) directions.
- **Container Flexibility**: Can use a custom element or the browser `window`/`body` as the scroll container.
- **SSR Support**: Built-in support for pre-rendering specific ranges for Server-Side Rendering.
- **Feature Rich**: Supports infinite scroll, loading states, sticky sections, headers, footers, buffers, and programmatic scrolling.
- **Scroll Restoration**: Automatically maintains scroll position when items are prepended to the list.

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

**Why use this?**
-   Fastest build times (no need to compile the component logic).
-   Maximum compatibility with different build tools.
-   Scoped CSS works perfectly as it is extracted into `style.css` with unique data attributes.

### 2. Original Vue SFC

If you want to compile the component yourself using your own Vue compiler configuration, you can import the raw `.vue` file.

```vue
<script setup>
import VirtualScroll from '@pdanpdan/virtual-scroll/VirtualScroll.vue';
// No need to import CSS; it's handled by your Vue loader/plugin
</script>
```

**Why use this?**
-   Allows for better tree-shaking and optimization by your own bundler.
-   Enables deep integration with your project's CSS-in-JS or specialized styling solutions.
-   Easier debugging of the component source in some IDEs.

### 3. CDN Usage

You can use the library directly from a CDN like unpkg or jsdelivr.

```html
<!-- Import Vue 3 first -->
<script src="https://unpkg.com/vue@3"></script>

<!-- Import VirtualScroll CSS -->
<link rel="stylesheet" href="https://unpkg.com/@pdanpdan/virtual-scroll/dist/virtual-scroll.css">

<!-- Import VirtualScroll JavaScript -->
<script src="https://unpkg.com/@pdanpdan/virtual-scroll"></script>

<div id="app">
  <div style="height: 400px; overflow: auto;">
    <virtual-scroll :items="items" :item-size="50">
      <template #item="{ item, index }">
        <div style="height: 50px;">{{ index }}: {{ item.label }}</div>
      </template>
    </virtual-scroll>
  </div>
</div>

<script>
  const { createApp, ref } = Vue;
  const { VirtualScroll } = window.VirtualScroll;

  createApp({
    setup() {
      const items = ref(Array.from({ length: 1000 }, (_, i) => ({ label: `Item ${i}` })));
      return { items };
    }
  })
  .component('VirtualScroll', VirtualScroll)
  .mount('#app');
</script>
```

## Basic Usage

```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

import '@pdanpdan/virtual-scroll/style.css';

const items = Array.from({ length: 10000 }, (_, i) => ({ id: i, label: `Item ${ i }` }));
</script>

<template>
  <div class="my-container">
    <VirtualScroll :items="items" :item-size="50">
      <template #item="{ item, index }">
        <div class="my-item">
          {{ index }}: {{ item.label }}
        </div>
      </template>
    </VirtualScroll>
  </div>
</template>

<style>
.my-container {
  height: 500px;
  overflow: auto;
}
.my-item {
  height: 50px;
}
</style>
```

## Sizing Guide

The component offers flexible ways to define item and column sizes. Understanding how these options interact is key to achieving smooth scrolling and correct layout.

### Sizing Options

| Option Type | `itemSize` / `columnWidth` | Performance | Description |
|-------------|----------------------------|-------------|-------------|
| **Fixed** | `number` (e.g., `50`) | **Best** | Every item has the exact same size. Calculations are *O(1)*. |
| **Array** | `number[]` (cols only) | **Great** | Each column has a fixed size from the array (cycles if shorter). |
| **Function** | `(item, index) => number` | **Good** | Size is known but varies per item. No `ResizeObserver` overhead unless it differs from measured size. |
| **Dynamic** | `0`, `null`, or `undefined` | **Fair** | Sizes are measured automatically via `ResizeObserver` after rendering. |

### How Sizing Works

1.  **Initial Estimate**:
    -   If a **fixed size** or **function** is provided, it's used as the initial size.
    -   If **dynamic** is used, the component uses `defaultItemSize` (default: `40`) or `defaultColumnWidth` (default: `100`) as the initial estimate.
2.  **Measurement**:
    -   When an item is rendered, its actual size is measured using `ResizeObserver`.
    -   If the measured size differs from the estimate (by more than 0.5px), the internal Fenwick Tree is updated.
3.  **Refinement**:
    -   All subsequent item positions are automatically adjusted based on the new measurement.
    -   The total scrollable area (`totalWidth`/`totalHeight`) is updated to reflect the real content size.

### Fallback Logic

-   **Unset Props**: If `itemSize` or `columnWidth` are not provided, they default to `40` and `100` respectively (fixed).
-   **Dynamic Fallback**: When using dynamic sizing, `defaultItemSize` and `defaultColumnWidth` act as the source of truth for items that haven't been rendered yet.
-   **Function/Array Fallback**: If a function or array returns an invalid value, it falls back to the respective `default...` prop.

### Recommendations for Smooth Scrolling

1.  **Accurate Estimates**: When using dynamic sizing, set `defaultItemSize` as close as possible to the *average* height of your items. This minimizes scrollbar "jumping".
2.  **Avoid 0 sizes**: Ensure your items have a minimum height/width (e.g., via CSS `min-height`). Items with 0 size might not be detected correctly by the virtualizer.
3.  **Box Sizing**: Use `box-sizing: border-box` on your items to ensure padding and borders are included in the measured size.
4.  **Manual Refresh**: If you change external state that affects a sizing function's output without changing the function reference itself, call `virtualScrollRef.refresh()` to force a full re-calculation.

## Component Reference

The `VirtualScroll` component provides a declarative interface for virtualizing lists and grids. It automatically manages the rendering lifecycle of items, measures dynamic sizes, and handles complex scroll behaviors like stickiness and restoration.

### Props

#### Core Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | Required | Array of items to be virtualized. |
| `itemSize` | `number \| ((item: T, index: number) => number) \| null` | `40` | Fixed size or function. Pass `0`/`null` for dynamic. |
| `direction` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Scroll direction. |
| `gap` | `number` | `0` | Spacing between items. |

#### Grid Configuration (only for direction="both")
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columnCount` | `number` | `0` | Number of columns for grid mode. |
| `columnWidth` | `num \| num[] \| fn \| null` | `100` | Width for columns in grid mode. |
| `columnGap` | `number` | `0` | Spacing between columns. |

#### Features & Behavior
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stickyIndices` | `number[]` | `[]` | Indices of items that should remain sticky. |
| `stickyHeader` / `stickyFooter` | `boolean` | `false` | If true, measures and adds slot size to padding. |
| `ssrRange` | `object` | `undefined` | Items to pre-render on server. See [SSR Support](#ssr-support). |
| `loading` | `boolean` | `false` | Shows loading state and prevents duplicate events. |
| `loadDistance` | `number` | `200` | Distance from end to trigger `load` event. |
| `restoreScrollOnPrepend` | `boolean` | `false` | Maintain position when items added to top. |
| `initialScrollIndex` | `number` | `undefined` | Index to jump to on mount. |
| `initialScrollAlign` | `ScrollAlignment \| object` | `'start'` | Alignment for initial jump. |

#### Advanced & Performance
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `container` | `HTMLElement \| Window` | `host element` | The scrollable container element. |
| `scrollPaddingStart` / `End` | `num \| {x, y}` | `0` | Padding for scroll calculations. |
| `containerTag` / `wrapperTag` / `itemTag` | `string` | `'div'` | HTML tags for component parts. |
| `bufferBefore` / `bufferAfter` | `number` | `5` | Items to render outside the viewport. |
| `defaultItemSize` | `number` | `40` | Initial estimate for dynamic items. |
| `defaultColumnWidth` | `number` | `100` | Initial estimate for dynamic columns. |
| `debug` | `boolean` | `false` | Enables debug visualization. |

## Slots

-   `item`: Scoped slot for individual items.
    -   `item: T`: The source data item.
    -   `index: number`: The original 0-based index of the item.
    -   `columnRange: ColumnRange`: Visible column range and paddings.
    -   `getColumnWidth: (index: number) => number`: Helper to get width of any column.
    -   `isSticky: boolean`: True if the item is configured to be sticky.
    -   `isStickyActive: boolean`: True if the item is currently stuck at the threshold.
-   `header`: Content rendered at the top of the scrollable area.
-   `footer`: Content rendered at the bottom of the scrollable area.
-   `loading`: Content shown at the end when `loading` prop is true.

## Events

-   `scroll`: Emitted on every scroll change. Payload: `ScrollDetails<T>`.
-   `load`: Triggered near the end of content. Payload: `'vertical' | 'horizontal'`.
-   `visibleRangeChange`: Emitted when rendered indices change. Payload: `{ start, end, colStart, colEnd }`.

## Keyboard Navigation

When the container is focused (it has `tabindex="0"`), it supports:
-   `Home`: Scroll to the very beginning (Index 0,0).
-   `End`: Scroll to the very last row and column.
-   `ArrowUp` / `ArrowDown`: Scroll up/down by 40px (or `DEFAULT_ITEM_SIZE`).
-   `ArrowLeft` / `ArrowRight`: Scroll left/right by 40px (or `DEFAULT_ITEM_SIZE`).
-   `PageUp` / `PageDown`: Scroll by one full viewport height/width.

### CSS Classes

- `.virtual-scroll-container`: Root container.
- `.virtual-scroll--vertical`, `.virtual-scroll--horizontal`, `.virtual-scroll--both`: Direction modifier.
- `.virtual-scroll-wrapper`: Items wrapper.
- `.virtual-scroll-item`: Individual item.
- `.virtual-scroll-header` / `.virtual-scroll-footer`: Header/Footer slots.
- `.virtual-scroll-loading`: Loading slot container.
- `.virtual-scroll--sticky`: Applied to sticky elements.
- `.virtual-scroll--hydrated`: Applied when client-side mount is complete.
- `.virtual-scroll--window`: Applied when using window/body scroll.
- `.virtual-scroll--table`: Applied when `containerTag="table"` is used.
- `.virtual-scroll--debug`: Applied when debug mode is enabled.

### Exposed Members

Access these via a template `ref` on the `VirtualScroll` component:

-   `scrollDetails`: Full reactive state of the virtual scroll system.
-   `columnRange`: Information about the current visible range of columns.
-   `getColumnWidth(index: number)`: Helper to get the calculated width of a specific column.
-   `scrollToIndex(rowIndex, colIndex, options)`: Programmatic scroll to a specific row and/or column (default `align: 'auto'`, `behavior: 'auto'`).
-   `scrollToOffset(x, y, options)`: Programmatic scroll to a specific pixel position (default `behavior: 'auto'`).
-   `refresh()`: Resets all dynamic measurements and re-initializes state.
-   `stopProgrammaticScroll()`: Immediately halts any active smooth scroll animation.

## Composable API

For advanced use cases, you can use the underlying logic via the `useVirtualScroll` composable.

### Example

```typescript
/* eslint-disable unused-imports/no-unused-vars */
import { useVirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

const items = ref([ { id: 1 }, { id: 2 } ]);
const containerRef = ref<HTMLElement | null>(null);

const props = computed(() => ({
  items: items.value,
  itemSize: 50,
  container: containerRef.value,
  direction: 'vertical' as const,
}));

const { renderedItems, scrollDetails, totalHeight } = useVirtualScroll(props);
```

### Return Value

Returns a set of reactive references and methods for managing the virtual scroll state:

| Member | Type | Description |
|--------|------|-------------|
| `renderedItems` | `Ref<RenderedItem<T>[]>` | List of items to render in the buffer. |
| `scrollDetails` | `Ref<ScrollDetails<T>>` | Full reactive state of the virtualizer. |
| `totalWidth` / `totalHeight` | `Ref<number>` | Calculated total content dimensions. |
| `columnRange` | `Ref<ColumnRange>` | Visible column indices and paddings. |
| `isHydrated` | `Ref<boolean>` | True after mount and hydration. |
| `scrollToIndex` | `Function` | Programmatic scroll to row/column index. |
| `scrollToOffset` | `Function` | Programmatic scroll to pixel offset. |
| `stopProgrammaticScroll` | `Function` | Cancel any active smooth scroll animation. |
| `updateItemSize` | `Function` | Register a new manual item measurement. |
| `updateItemSizes` | `Function` | Register multiple manual item measurements. |
| `updateHostOffset` | `Function` | Recalculate host element position. |
| `getColumnWidth` | `Function` | Helper to get a column's width. |
| `refresh` | `Function` | Resets all measurements and state. |

## API Reference

### Types

#### ScrollDetails&lt;T&gt;
| Property | Type | Description |
|----------|------|-------------|
| `items` | `RenderedItem<T>[]` | Rendered items in the buffer. |
| `currentIndex` | `number` | First visible row index. |
| `currentColIndex` | `number` | First visible column index. |
| `scrollOffset` | `{ x: number, y: number }` | Current pixel scroll position. |
| `viewportSize` | `{ width: number, height: number }` | Dimensions of the visible area. |
| `totalSize` | `{ width: number, height: number }` | Estimated total dimensions. |
| `isScrolling` | `boolean` | Active scrolling state. |
| `isProgrammaticScroll` | `boolean` | True if triggered by method. |
| `range` | `{ start: number, end: number }` | Visible row range. |
| `columnRange` | `ColumnRange` | Visible column range (grid). |

#### RenderedItem&lt;T&gt;
| Property | Type | Description |
|----------|------|-------------|
| `item` | `T` | The source data item. |
| `index` | `number` | Position in original array. |
| `offset` | `{ x: number, y: number }` | Position relative to wrapper. |
| `size` | `{ width, height }` | Current dimensions. |
| `originalX` / `originalY` | `number` | Offsets before sticky adjustments. |
| `isSticky` | `boolean` |configured as sticky. |
| `isStickyActive` | `boolean` | Currently stuck. |
| `stickyOffset` | `{ x, y }` | Translation for pushing effect. |

#### ColumnRange
| Property | Type | Description |
|----------|------|-------------|
| `start` | `number` | First rendered column index. |
| `end` | `number` | Last rendered column index (exclusive). |
| `padStart` | `number` | Pixel space before first column. |
| `padEnd` | `number` | Pixel space after last column. |

#### ScrollToIndexOptions
| Property | Type | Description |
|----------|------|-------------|
| `align` | `ScrollAlignment \| ScrollAlignmentOptions` | How to position the item (default: `'auto'`). |
| `behavior` | `'auto' \| 'smooth'` | Scroll animation behavior (default: `'auto'`). |

#### ScrollAlignmentOptions
| Property | Type | Description |
|----------|------|-------------|
| `x` | `ScrollAlignment` | Alignment on the horizontal axis. |
| `y` | `ScrollAlignment` | Alignment on the vertical axis. |

#### ScrollAlignment
Values: `'start' | 'center' | 'end' | 'auto'`

- `start`: Align to top/left edge.
- `center`: Align to viewport center.
- `end`: Align to bottom/right edge.
- `auto`: **Smart Alignment**. Only scrolls if item is not fully visible.

### Methods

#### `scrollToIndex(rowIndex, colIndex, options)`
Ensures a specific item is visible within the viewport. Corrects position if item sizes are dynamic.

#### `scrollToOffset(x, y, options)`
Scrolls the container to an absolute pixel position.

#### `stopProgrammaticScroll()`
Immediately halts any active smooth scroll animation.

#### `updateItemSize(index, width, height, element?)`
Manually registers a new measurement for a single item.

#### `updateItemSizes(updates)`
Batched version of `updateItemSize`.

#### `updateHostOffset()`
Forces a recalculation of the host element's position relative to the scroll container.

#### `getColumnWidth(index)`
Returns the currently calculated width for a specific column index.

#### `refresh()`
Invalidates all cached measurements and triggers a full re-initialization.

## Utility Functions

The library exports several utility functions and classes:

- `isElement(val: any): val is HTMLElement`: Checks if value is an `HTMLElement` (excludes `window`).
- `isScrollableElement(val: any): val is HTMLElement | Window`: Checks if value has scroll properties.
- `isScrollToIndexOptions(val: any): val is ScrollToIndexOptions`: Type guard for scroll options.
- `getPaddingX / getPaddingY`: Internal helpers for extraction of padding from props.
- `FenwickTree`: The underlying data structure for efficient size and offset management.
- `DEFAULT_ITEM_SIZE / DEFAULT_COLUMN_WIDTH / DEFAULT_BUFFER`: The default values used by the library.

## SSR Support

The component is designed to be SSR-friendly. You can pre-render a specific range of items on the server using the `ssrRange` prop.

```vue
<VirtualScroll
  :items="items"
  :ssr-range="{ start: 100, end: 120, colStart: 50, colEnd: 70 }"
>
  <!-- ... -->
</VirtualScroll>
```

When `ssrRange` is provided:
1.  **Server-Side**: Only the specified range of items is rendered. Items are rendered in-flow (relative positioning) with their offsets adjusted so the specified range appears at the top-left of the container.
2.  **Client-Side Hydration**:
    -   The component initially renders the SSR content to match the server-generated HTML.
    -   On mount, it expands the container size and automatically scrolls to exactly match the pre-rendered range using `align: 'start'`.
    -   It then seamlessly transitions to virtual mode (absolute positioning) while maintaining the scroll position.

## License

MIT
