# @pdanpdan/virtual-scroll

A high-performance, flexible virtual scrolling component for Vue 3.

## What is it?

`@pdanpdan/virtual-scroll` is a Vue 3 library designed to handle massive datasets with ease. Whether you have thousands or billions of items, it ensures smooth scrolling and minimal memory usage by only rendering what's visible on the screen.

### The Problem it Solves

1.  **Performance with Large Lists:** Rendering thousands of DOM elements simultaneously can slow down the browser, lead to high memory consumption, and cause "janky" scrolling.
2.  **Browser Scroll Limits:** Most browsers have a maximum limit for the height/width of a scrollable element (typically around 10 to 30 million pixels). If your content exceeds this, it simply stops working or becomes buggy.

### Our Solution

- **Virtualization:** We only render the items currently in the viewport (plus a small buffer), keeping the DOM light and the UI responsive.
- **Coordinate Scaling:** To bypass browser scroll limits, we use a dual-coordinate system. We can virtually scroll through billions of pixels by scaling internal "Virtual Units" to "Display Units" within the browser's supported range.
- **1:1 Movement:** Unlike many other scaled virtual scroll implementations, we ensure that 1 pixel of movement on the wheel or touch results in exactly 1 pixel of movement in the viewport, maintaining a natural feel regardless of the scale.

## Installation

```bash
pnpm add @pdanpdan/virtual-scroll
```

## Usage Modes

The package provides several ways to integrate the component into your project.

### 1. Compiled Component (Recommended)

Standard way for most modern bundlers (Vite, Webpack). You must manually import the CSS file.

```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

import '@pdanpdan/virtual-scroll/style.css';
</script>
```

### 2. Original Vue SFC

Import the raw `.vue` file if you want to use your own Vue compiler configuration.

```vue
<script setup>
import VirtualScroll from '@pdanpdan/virtual-scroll/VirtualScroll.vue';
// No need to import CSS separately
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

## Technical Overview

### Scaled Virtual Scroll

To support massive datasets (billions of pixels) while staying within browser scroll limits, the library uses a dual-unit coordinate system:

*   **VU (Virtual Units)**: The internal coordinate system representing the actual size of your content.
*   **DU (Display Units)**: The browser's physical coordinate system (limited to `BROWSER_MAX_SIZE`).

The library automatically calculates a scaling factor and applies a specialized formula to ensure **1:1 movement** in the viewport during wheel and touch scrolling, while maintaining proportional positioning during scrollbar interaction.

### Core Rendering Rule

Items are rendered at their VU size and positioned using `translateY()` (or `translateX()` / `translate()`) based on the current display scroll position and their virtual offset. This prevents "jumping" and maintains sub-pixel precision even at extreme scales.

### Performance

- **Fenwick Tree:** Uses a Fenwick Tree (Binary Indexed Tree) for *O(log N)* prefix sum and point updates, allowing for extremely fast calculation of item offsets even in dynamic lists with millions of items.
- **ResizeObserver:** Automatically handles dynamic item sizes by measuring them when they change.
- **Style Isolation:** Uses CSS `@layer` for style isolation and `contain: layout` for improved rendering performance.

## Key Features

- **Dynamic & Fixed Sizes**: Supports uniform item sizes, variable sizes via function/array, or fully dynamic sizes via `ResizeObserver`.
- **Multi-Directional**: Works in `vertical`, `horizontal`, or `both` (grid) directions.
- **Virtual Scrollbars**: Optimized virtual scrollbars that handle massive scales and provide consistent cross-browser styling.
- **Container Flexibility**: Can use a custom element or the browser `window`/`body` as the scroll container.
- **SSR Support**: Built-in support for pre-rendering specific ranges for Server-Side Rendering.
- **Sticky Sections**: Support for sticky headers, footers, and indices.
- **Scroll Restoration**: Automatically maintains scroll position when items are prepended to the list.
- **RTL Support**: Full support for Right-to-Left layouts with automatic detection.

## Component Reference: VirtualScroll

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | Required | Array of items to be virtualized. |
| `itemSize` | `number | fn | null` | `40` | Fixed size or function. Pass `0`/`null` for dynamic. |
| `direction` | `'vertical' | 'horizontal' | 'both'` | `'vertical'` | Scroll direction. |
| `columnCount` | `number` | `0` | Number of columns for grid mode. |
| `columnWidth` | `num | num[] | fn | null` | `100` | Width for columns in grid mode. |
| `gap` / `columnGap` | `number` | `0` | Spacing between items/columns. |
| `stickyIndices` | `number[]` | `[]` | Indices of items that should remain sticky. |
| `stickyHeader` / `stickyFooter` | `boolean` | `false` | If true, measures and adds slot size to padding. |
| `ssrRange` | `object` | - | Range of items to pre-render for SSR. |
| `virtualScrollbar` | `boolean` | `false` | Whether to force virtual scrollbars. |
| `restoreScrollOnPrepend` | `boolean` | `false` | Maintain position when items added to top. |
| `container` | `HTMLElement | Window` | `hostRef` | The scrollable container element. |
| `scrollPaddingStart` / `End` | `num | {x, y}` | `0` | Padding for scroll calculations. |
| `bufferBefore` / `bufferAfter` | `number` | `5` | Items to render outside the viewport. |
| `initialScrollIndex` | `number` | `undefined` | Index to jump to on mount. |
| `initialScrollAlign` | `'start' | 'center' | 'end' | 'auto'` | `'start'` | Alignment for initial jump. |
| `defaultItemSize` / `defaultColumnWidth` | `number` | `40 / 100` | Estimate for dynamic items/columns. |
| `debug` | `boolean` | `false` | Enable debug visualization. |

### Slots

- `item`: Scoped slot for individual items. Provides `item`, `index`, `columnRange`, `getColumnWidth`, `gap`, `columnGap`, `isSticky`, `isStickyActive`, `isStickyActiveX`, `isStickyActiveY`, `offset`.
- `header` / `footer`: Content rendered at the top/bottom of the scrollable area.
- `loading`: Content shown at the end when `loading` prop is true.
- `scrollbar`: Scoped slot for custom scrollbar. Called once for each active axis.
    - `axis`: `'vertical' | 'horizontal'`
    - `positionPercent`: current position (0-1).
    - `viewportPercent`: viewport percentage (0-1).
    - `thumbSizePercent`: Calculated thumb size (0-100).
    - `thumbPositionPercent`: Calculated thumb position (0-100).
    - `trackProps`: Attributes/listeners for the track. Bind with `v-bind="trackProps"`.
    - `thumbProps`: Attributes/listeners for the thumb. Bind with `v-bind="thumbProps"`.
    - `scrollbarProps`: Grouped props for the `VirtualScrollbar` component.
    - `isDragging`: Whether the thumb is currently being dragged.

### Exposed Members

The following properties and methods are available on the `VirtualScroll` component instance (via template `ref`).

#### Properties
- **All Props**: All properties defined in [Props](#props) are available on the instance.
- `scrollDetails`: Full reactive state of the virtual scroll system.
- `columnRange`: Information about the current visible range of columns.
- `isHydrated`: `true` when the component is mounted and hydrated.
- `isRtl`: `true` if the container is in Right-to-Left mode.
- `scrollbarPropsVertical` / `scrollbarPropsHorizontal`: Reactive `ScrollbarSlotProps`.
- `scaleX` / `scaleY`: Current coordinate scaling factors (VU/DU).
- `renderedWidth` / `renderedHeight`: Physical dimensions in DOM (clamped, DU).
- `componentOffset`: Absolute offset of the component within its container (DU).

#### Methods
- `scrollToIndex(row, col, options)`: Programmatic scroll to index.
- `scrollToOffset(x, y, options)`: Programmatic scroll to pixel position.
- `refresh()`: Resets all measurements and state.
- `stopProgrammaticScroll()`: Halt smooth scroll animations.
- `updateDirection()`: Manually trigger direction detection.
- `updateHostOffset()`: Recalculate component position.
- `updateItemSize(index, w, h, el?)`: Register single measurement.
- `updateItemSizes(updates)`: Batch register measurements.
- `getRowHeight(index)`: Returns the calculated height of a row.
- `getColumnWidth(index)`: Returns the calculated width of a column.
- `getRowOffset(index)`: Returns the virtual offset of a row.
- `getColumnOffset(index)`: Returns the virtual offset of a column.
- `getItemOffset(index)`: Returns the virtual offset of an item.
- `getItemSize(index)`: Returns the size of an item along the scroll axis.

## Sizing Guide

| Option Type | `itemSize` / `columnWidth` | Performance | Description |
|-------------|----------------------------|-------------|-------------|
| **Fixed** | `number` (e.g., `50`) | **Best** | Every item has the exact same size. Calculations are *O(1)*. |
| **Array** | `number[]` (cols only) | **Great** | Each column has a fixed size from the array (cycles if shorter). |
| **Function** | `(item, index) => number` | **Good** | Size is known but varies per item. |
| **Dynamic** | `0`, `null`, or `undefined` | **Fair** | Sizes are measured automatically via `ResizeObserver`. |

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

## Composables

- `useVirtualScroll(props)`: Core logic for virtualization.
- `useVirtualScrollbar(props)`: Logic for scrollbar interactions.

## License

MIT
