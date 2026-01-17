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

## Props

### Core Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | Required | Array of items to be virtualized. |
| `itemSize` | `number \| ((item: T, index: number) => number) \| null` | `50` | Fixed size of each item or a function that returns the size. Pass `0`, `null` or `undefined` for dynamic size detection. |
| `direction` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Direction of the scroll. |
| `gap` | `number` | `0` | Gap between items in pixels (vertical). |

### Grid Configuration (direction="both")
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columnCount` | `number` | `0` | Number of columns for bidirectional (grid) scroll. |
| `columnWidth` | `number \| number[] \| ((index: number) => number) \| null` | `150` | Fixed width of columns or an array/function for column widths. Pass `0`, `null` or `undefined` for dynamic width. |
| `columnGap` | `number` | `0` | Gap between columns in pixels. |

### Feature-Specific Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `stickyIndices` | `number[]` | `[]` | Indices of items that should stick to the top/start. Supports iOS-style pushing effect. |
| `stickyHeader` | `boolean` | `false` | Whether the header slot content is sticky. If true, header size is measured and added to `scrollPaddingStart`. |
| `stickyFooter` | `boolean` | `false` | Whether the footer slot content is sticky. If true, footer size is measured and added to `scrollPaddingEnd`. |
| `loading` | `boolean` | `false` | Whether items are currently being loaded. Prevents multiple `load` events and displays the `#loading` slot. |
| `loadDistance` | `number` | `200` | Distance from the end of the scrollable area to trigger `load` event. |
| `restoreScrollOnPrepend` | `boolean` | `false` | Whether to automatically restore scroll position when items are prepended to the list. |

### Advanced Configuration
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `container` | `HTMLElement \| Window \| null` | `host element` | The scrollable container element or window. |
| `scrollPaddingStart` | `number \| { x?: number; y?: number; }` | `0` | Padding at the start of the scroll container. |
| `scrollPaddingEnd` | `number \| { x?: number; y?: number; }` | `0` | Padding at the end of the scroll container. |
| `containerTag` | `string` | `'div'` | The HTML tag to use for the root container. |
| `wrapperTag` | `string` | `'div'` | The HTML tag to use for the items wrapper. |
| `itemTag` | `string` | `'div'` | The HTML tag to use for each item. |
| `bufferBefore` | `number` | `5` | Number of items to render before the visible viewport. |
| `bufferAfter` | `number` | `5` | Number of items to render after the visible viewport. |
| `ssrRange` | `{ start: number; end: number; colStart?: number; colEnd?: number; }` | `undefined` | Range of items to render for SSR. |
| `initialScrollIndex` | `number` | `undefined` | Initial scroll index to jump to on mount. |
| `initialScrollAlign` | `ScrollAlignment \| ScrollAlignmentOptions` | `'start'` | Alignment for the initial scroll index. |

### Development
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultItemSize` | `number` | `50` | Default size for items before they are measured. |
| `defaultColumnWidth` | `number` | `150` | Default width for columns before they are measured. |
| `debug` | `boolean` | `false` | Enables debug visualization showing item indices and offsets. |

## Slots

- `item`: Scoped slot for individual items.
  - `item`: The data item.
  - `index`: The index of the item.
  - `columnRange`: `{ start, end, padStart, padEnd }` information for grid mode.
  - `getColumnWidth`: `(index: number) => number` helper for grid mode.
  - `isSticky`: Whether the item is configured to be sticky.
  - `isStickyActive`: Whether the item is currently stuck at the threshold.
- `header`: Content prepended to the scrollable area.
- `footer`: Content appended to the scrollable area.
- `loading`: Content shown at the end of the list when `loading` prop is true.

## Events

- `scroll`: Emitted when the container scrolls.
  - `details`: `ScrollDetails<T>` object containing current state.
- `load`: Emitted when scrolling near the end of the content.
  - `direction`: `'vertical'` or `'horizontal'`.
- `visibleRangeChange`: Emitted when the rendered items range or column range changes.
  - `range`: `{ start: number; end: number; colStart: number; colEnd: number; }`

## Keyboard Navigation

When the container is focused, it supports the following keys:
- `Home` / `End`: Scroll to top/bottom or start/end of the list.
- `ArrowUp` / `ArrowDown`: Scroll up/down by 40px.
- `ArrowLeft` / `ArrowRight`: Scroll left/right by 40px.
- `PageUp` / `PageDown`: Scroll up/down (or left/right) by one viewport size.

## Methods (Exposed)

- `scrollToIndex(rowIndex: number | null, colIndex: number | null, options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions)`
  - `rowIndex`: Row index to scroll to.
  - `colIndex`: Column index to scroll to (for horizontal or grid).
  - `options`:
    - `align`: `'start' | 'center' | 'end' | 'auto'` or `{ x, y }` alignments.
    - `behavior`: `'auto' | 'smooth'`.
- `scrollToOffset(x: number | null, y: number | null, options?: { behavior?: 'auto' | 'smooth' })`
  - `x`: Pixel offset on X axis.
  - `y`: Pixel offset on Y axis.
- `refresh()`: Resets all dynamic measurements and re-initializes sizes from current items and props.

## Types

### ScrollDetails&lt;T&gt;
```typescript
/* eslint-disable unused-imports/no-unused-vars */
interface ScrollDetails<T = unknown> {
  items: Array<{
    item: T;
    index: number;
    offset: { x: number; y: number; };
    size: { width: number; height: number; };
    originalX: number;
    originalY: number;
    isSticky?: boolean;
    isStickyActive?: boolean;
    stickyOffset: { x: number; y: number; };
  }>;
  currentIndex: number;
  currentColIndex: number;
  scrollOffset: { x: number; y: number; };
  viewportSize: { width: number; height: number; };
  totalSize: { width: number; height: number; };
  isScrolling: boolean;
  isProgrammaticScroll: boolean;
  range: { start: number; end: number; };
  columnRange: { start: number; end: number; padStart: number; padEnd: number; };
}
```

### RenderedItem&lt;T&gt;
```typescript
/* eslint-disable unused-imports/no-unused-vars */
interface RenderedItem<T = unknown> {
  item: T;
  index: number;
  offset: { x: number; y: number; };
  size: { width: number; height: number; };
  originalX: number;
  originalY: number;
  isSticky?: boolean;
  isStickyActive?: boolean;
  stickyOffset: { x: number; y: number; };
}
```

## CSS Classes

- `.virtual-scroll-container`: Root container.
- `.virtual-scroll-wrapper`: Items wrapper.
- `.virtual-scroll-item`: Individual item.
- `.virtual-scroll-header` / `.virtual-scroll-footer`: Header/Footer slots.
- `.virtual-scroll-loading`: Loading slot container.
- `.virtual-scroll--sticky`: Applied to sticky elements.
- `.virtual-scroll--hydrated`: Applied when client-side mount is complete.
- `.virtual-scroll--window`: Applied when using window/body scroll.
- `.virtual-scroll--table`: Applied when `containerTag="table"` is used.

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

## Composable API

For advanced use cases, you can use the underlying logic via the `useVirtualScroll` composable.

```typescript
import { useVirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

const items = ref([ { id: 1 }, { id: 2 } ]);
const props = computed(() => ({
  items: items.value,
  itemSize: 50,
  direction: 'vertical' as const,
}));

const { renderedItems, scrollDetails } = useVirtualScroll(props);
console.log(renderedItems.value, scrollDetails.value);
```

## Utilities

The library exports several utility functions for scroll-related checks:

- `isElement(container: HTMLElement | Window | null | undefined): container is HTMLElement`: Checks if the container is an `HTMLElement` (and not `Window`).
- `isScrollableElement(target: EventTarget | null): target is HTMLElement`: Checks if the target is an `HTMLElement` with scroll properties.
- `isScrollToIndexOptions(options: unknown): options is ScrollToIndexOptions`: Checks if the options object is a full `ScrollToIndexOptions` object.

## License

MIT
