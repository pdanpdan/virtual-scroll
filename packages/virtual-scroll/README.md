# @pdanpdan/virtual-scroll

Virtual scrolling for Vue 3: only the rows that are on screen are in the DOM, whether the list holds a hundred items or ten million.

[![NPM Version](https://img.shields.io/npm/v/@pdanpdan/virtual-scroll.svg)](https://www.npmjs.com/package/@pdanpdan/virtual-scroll)
[![License](https://img.shields.io/npm/l/@pdanpdan/virtual-scroll.svg)](../../LICENSE)

**Documentation and live examples: [pdanpdan.github.io/virtual-scroll](https://pdanpdan.github.io/virtual-scroll/)** - that site is the manual: every feature is a running example with the code next to it.

## What it does

Give it an array and a template for one row. It keeps the rows around the viewport in the DOM and positions them itself while the browser scrolls normally, so showing twenty rows out of a million costs about the same as showing twenty rows out of twenty.

Rows can be a vertical list, a horizontal strip, or a grid on both axes, and the scroll container can be the component, an element around it, or the page itself. Row sizes are a single number, a value per row, or left to be measured from the DOM as they change. The rows do not have to exist as objects either: a sparse `new Array(10_000_000)` with content derived from `index` gives ten million rows without allocating ten million items.

The awkward part of virtual scrolling is the end of a long list. Browsers refuse to scroll content past roughly 10 million pixels, so many implementations scale the content up and make it move faster than your finger. Here the list is mapped onto the pixels the browser accepts in a way that a wheel notch or a swipe moves the content exactly as far as you moved the pointer, whatever the size of the list. The visible range, the scrollbar and `scrollToIndex` keep agreeing with each other.

Everything else is opt-in, so a plain list stays a plain list: sticky headers and sections, snapping, infinite loading, prepend restoration, RTL, keyboard navigation, ARIA roles, SSR, virtual scrollbars, TypeScript types, plus dedicated components for [table](https://pdanpdan.github.io/virtual-scroll/essential-flow-table/) and [masonry](https://pdanpdan.github.io/virtual-scroll/essential-masonry/) layouts. No dependencies besides Vue.

## Quick start

```bash
pnpm add @pdanpdan/virtual-scroll
```

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

<style scoped>
.my-container { height: 500px; }
.my-item { height: 50px; }
</style>
```

Ten thousand rows, about twenty of them in the DOM at any moment. Replace `:item-size="50"` with a function to size rows individually, or drop it altogether and rows get measured as they mount - the rest of the code stays as it is.

## Links

- **Configurator / code generator:** [pdanpdan.github.io/virtual-scroll/configurator](https://pdanpdan.github.io/virtual-scroll/configurator/)
- **Comparison with other Vue 3 libraries:** [pdanpdan.github.io/virtual-scroll/compare](https://pdanpdan.github.io/virtual-scroll/compare/)
- **Documentation for LLMs:** [llms.txt](https://pdanpdan.github.io/virtual-scroll/llms.txt) ([in the repository](../playground/public/llms.txt))
- **npm:** [npmjs.com/package/@pdanpdan/virtual-scroll](https://www.npmjs.com/package/@pdanpdan/virtual-scroll)
- **Repository:** [github.com/pdanpdan/virtual-scroll](https://github.com/pdanpdan/virtual-scroll)

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

Import the raw `.vue` file if you want to use your own Vue compiler configuration. All four components are exported this way: `VirtualScroll.vue`, `VirtualScrollTable.vue`, `VirtualScrollMasonry.vue` and `VirtualScrollbar.vue`.

```vue
<script setup>
import VirtualScroll from '@pdanpdan/virtual-scroll/VirtualScroll.vue';
// No need to import CSS separately
</script>
```

### 3. Headless Composable

`useVirtualScroll` returns the window to mount and the scroll state; you render and position the rows, and pass extensions as the second argument. Pass the scroll element as `hostRef` (or `container`), and give it a definite height.

```vue
<script setup>
import { useVirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

const scrollEl = ref(null);
const items = ref(Array.from({ length: 10_000 }, (_, i) => ({ id: i })));
const props = computed(() => ({ items: items.value, itemSize: 50, hostRef: scrollEl.value }));
const { renderedItems, scrollDetails } = useVirtualScroll(props);
</script>

<template>
  <div ref="scrollEl" class="viewport">
    <div :style="{ height: `${ scrollDetails.totalSize.height }px` }">
      <div
        v-for="row in renderedItems"
        :key="row.index"
        :style="{ transform: `translateY(${ row.offset.y }px)` }"
      >
        {{ row.item.id }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.viewport { height: 500px; overflow: auto; }
</style>
```

### 4. CDN Usage

```html
<!-- Import Vue 3 first -->
<script src="https://unpkg.com/vue@3"></script>
<!-- Import VirtualScroll CSS -->
<link rel="stylesheet" href="https://unpkg.com/@pdanpdan/virtual-scroll/dist/virtual-scroll.css">
<!-- Import VirtualScroll JavaScript -->
<script src="https://unpkg.com/@pdanpdan/virtual-scroll"></script>
```

### 5. Lean Build (`./core`)

`@pdanpdan/virtual-scroll/core` publishes the same API with the optional wiring compiled out of the components that have it (`VirtualScroll` and `VirtualScrollTable`), for apps that only need virtualization:

```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll/core';

import '@pdanpdan/virtual-scroll/core/style.css';
</script>
```

*   **Not included:** custom scrollbars (the `virtualScrollbar` prop and the `#scrollbar` slot), keyboard navigation, scroll snapping, sticky items, infinite loading and prepend restoration. `VirtualScrollMasonry` has no such wiring to remove; the flow-mode scrollbar a table always shows for its own horizontal overflow is kept.
*   **Still included:** virtualization, dynamic measurement, RTL detection, coordinate scaling, inertia scrolling, ARIA roles, header/footer slots, the loading slot and SSR.
*   **Accepted but ignored in this build:** `virtualScrollbar`, `snap`, `stickyIndices`, `loadDistance` and `restoreScrollOnPrepend` are kept in the type surface so a component can be swapped between the two entries, but they have no effect. `loading` still drives the `loading` slot and `aria-busy` - only the automatic threshold that emits `load` is gone. Import from the package root when you need any of the rest.

A tree-shaken `<VirtualScroll>` is 17.0 KB gzipped from `./core` and 23.2 KB from the package root; `core/style.css` is smaller than the full stylesheet. Both entries ship the same types.

## Data-less Lists (Index-only Rows)

Rows can be rendered purely from their `index` without storing any per-row data. Pass a sparse array - only its `length` is used - and derive the content from the slot's `index`:

```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

// Sparse placeholder: 10 million rows, zero data objects allocated.
const items = new Array(10_000_000);
</script>

<template>
  <VirtualScroll :items="items" :item-size="40" class="my-container">
    <template #item="{ index }">
      <div class="my-item">Fixed Item {{ index }}</div>
    </template>
  </VirtualScroll>
</template>
```

Notes:

- `items` entries may be `undefined` (holes): every index in the rendered range produces a row, and the `item` slot prop is `undefined` for holes. Don't read `item` fields in the slot for such datasets.
- Only indices in the visible window (plus buffer) are ever accessed from the `items` array.
- Combined with a numeric `itemSize` (arithmetic positioning, no per-row storage), uniform lists scale to 10M+ rows with flat memory - the playground essential examples use this pattern.
- Dynamic (ResizeObserver-measured) sizes work the same way: sizes are measured from the rendered DOM.

## Technical Overview

### Scaled Virtual Scroll

To support massive datasets (billions of pixels) while staying within browser scroll limits, the library uses a dual-unit coordinate system:

*   **VU (Virtual Units)**: The internal coordinate system representing the actual size of your content.
*   **DU (Display Units)**: The browser's physical coordinate system (limited to `BROWSER_MAX_SIZE`).

The library derives a scale factor and maps display scroll positions back onto virtual ones, so wheel and touch scrolling move the content 1:1 while scrollbar interaction positions it proportionally.

### Core Rendering Rule

Items are rendered at their VU size and positioned using `translateY()` (or `translateX()` / `translate()`) based on the current display scroll position and their virtual offset. This prevents "jumping" and maintains sub-pixel precision even at extreme scales.

### Performance

- **Fenwick Tree:** Uses a Fenwick Tree (Binary Indexed Tree) for *O(log N)* prefix sum and point updates, keeping item-offset lookup logarithmic even in dynamic lists with millions of items. Appends resize the tree incrementally - no full rebuild per batch - and re-initialization only revisits the regions that changed.
- **No per-row state for uniform sizes:** A numeric `itemSize` / `columnWidth` is resolved with pure arithmetic (O(1)), so uniform lists allocate nothing per row. Combined with data-less rows (below), memory stays flat even at 10M+ items.
- **ResizeObserver:** Automatically handles dynamic item sizes by measuring them when they change.
- **Style Isolation:** Uses CSS `@layer` for style isolation and `contain: layout` for improved rendering performance.
- **Measured bundle size:** `pnpm size` builds every published entry plus one tree-shaken bundle per import scenario and fails when a feature a scenario does not use survives in its output, or when an entry leaves its gzipped budget (currently `<VirtualScroll>` 23.2 KB, `./core` 17.0 KB, headless `useVirtualScroll` 11.4 KB, `VirtualScrollTable` 24.4 KB, `./core` `VirtualScrollTable` 19.5 KB, `VirtualScrollMasonry` 7.6 KB).

## Key Features

- **Dynamic & Fixed Sizes**: Supports uniform item sizes, variable sizes via function/array, or fully dynamic sizes via `ResizeObserver`.
- **Circular Patterns**: Pass an array to `itemSize` or `columnWidth` to define a repeating size pattern (e.g., `[50, 100]` will repeat for all items).
- **Multi-Directional**: Works in `vertical`, `horizontal`, or `both` (grid) directions.
- **Virtual Scrollbars**: Overlay scrollbars that stay accurate at any scale and share one style across browsers.
- **Extensions Architecture**: Optional extensions (RTL, Snapping, Sticky, Infinite Loading, Prepend Restoration, Coordinate Scaling).
- **Container Flexibility**: Can use a custom element or the browser `window`/`body` as the scroll container.
- **SSR Support**: Built-in support for pre-rendering specific ranges for Server-Side Rendering.
- **Accessibility**: Automatic ARIA role mapping for lists, grids, trees, listboxes, and menus.


## Authoring Content for Virtualized Lists

Rows are recycled: they mount as they enter the viewport and unmount when they leave, so content should behave well under recycling:

- **Keep row state in the model, not the DOM** - selection, expansion, and likes belong in your data/store keyed by item id; anything stored in the element vanishes when the row scrolls away.
- **Make row rendering idempotent** - the `item` slot re-renders on every entry into the window; rendering the same item twice must produce the same result.
- **Reserve space for media** - explicit `width`/`height` or `aspect-ratio` prevents post-mount row growth (which the engine measures and corrects, but which causes jumps).
- **Avoid native `loading="lazy"` on images** - the visible window is already the only mounted content; lazy-loading adds browser heuristics on a changing scroll container and can starve on-screen images. Use eager loading or your own bounded, low-priority prefetch window.
- **Dynamic heights are fine** - late content growth is measured via `ResizeObserver` and the layout self-corrects; stable or reserved sizes scroll smoother (see the playground docs "Authoring Content for Virtualized Lists").


## Extensions

The library uses a modular extension system: the built-in extensions below, or extensions you write against the same contract.

An extension is a plain object implementing `VirtualScrollExtension<T>`: a unique `name` plus the
optional hooks `onInit(ctx)`, `includeIndices(ctx)`, `onScroll(ctx, event)`, `onScrollEnd(ctx)` and
`transformRenderedItems(items, ctx)` (post-processes the rendered window and must return the items to
render). `includeIndices` returns extra item indices that must stay in the rendered window even when
they are outside the visible range (the sticky extension pins the previous sticky item that way); the
engine merges, de-duplicates and sorts them. Every hook receives an `ExtensionContext<T>` with the
reactive `props`, `scrollDetails`, `totalSize`, `range` and `currentIndex`, the engine state refs
(`internalState`, including `isHydrated`) and the engine methods (`scrollToIndex`, `scrollToOffset`,
`updateDirection`, `getRowIndexAt`, `getColumnIndexAt`, `getItemSize`, `getItemBaseSize`,
`getItemOffset`, `getColumnWidth`, `getColumnOffset`, `getItemRawOffset`,
`handleScrollCorrection`). The axis-specific resolvers matter on a grid, where `getItemSize` and
`getItemOffset` describe rows while `getColumnWidth` and `getColumnOffset` describe columns. `name`
is only a label: hooks are called in the order the extensions are passed to `useVirtualScroll`.

### Built-in Extensions

- `useRtlExtension()`: Right-to-Left layout support. Direction detection belongs to the engine (it re-reads it on mount, on resize, on scroll and on `dir`/`style` changes); the extension asks for that read while initializing, so the first render already has the direction.
- `useSnappingExtension()`: Item snapping after scroll stops.
- `useStickyExtension()`: Sticky header/footer and index support. It owns the pinning itself: the previous sticky item stays rendered while it is scrolled past, and `isStickyActive`/`stickyOffset` are computed here. `stickyIndices` without this extension keeps the layout offsets but pins nothing.
- `useInfiniteLoadingExtension({ onLoad, flingVelocity, preload })`: Trigger loading when reaching thresholds. `onLoad(axis, { velocity, direction })` receives the scroll velocity (VU/ms) and travel direction; `flingVelocity` (default `2`) skips the callback while the axis is still flinging, and `preload` (VU, default `0`) extends the threshold only while scrolling towards the end.
- `useSnapshotsExtension({ storage, key, autoSave })`: Save and restore the visible position (`save()`, `restore()`, `clear()`), optionally persisted through `sessionStorage`/`localStorage` or a custom `Storage`.
- `usePrependRestorationExtension()`: Maintain scroll position when items are prepended.
- `useCoordinateScalingExtension()`: Support for massive lists (billions of pixels).

### Extension Usage Example

When using the `VirtualScroll` component, extensions are already integrated. If you use the `useVirtualScroll` composable directly, you can pass them as the second argument:

```ts
import {
  useRtlExtension,
  useSnappingExtension,
  useVirtualScroll,
} from '@pdanpdan/virtual-scroll';

// eslint-disable-next-line unused-imports/no-unused-vars, no-undef
const { renderedItems, scrollDetails } = useVirtualScroll(props, [
  useRtlExtension(),
  useSnappingExtension(),
]);
```

## Composables

The library exposes its internal logic via reactive composables for advanced use cases.

Everything in this document imports from the package root. The engine layer the components are built on -
the pure calculation helpers (`calculate*`), the DOM scroll helpers, the sizing layer
(`useVirtualScrollSizes`) and the parameter bags they take - is published from
`@pdanpdan/virtual-scroll/internal`; that entry also carries the masonry layout engine and its types,
which the root entry never exported. Nothing there is covered by semver: shapes and signatures may
change in any release, including a patch, and the source is the documentation. (`FenwickTree`, the structure the sizing layer builds on,
is exported from the root; its methods are listed in the [API reference](https://pdanpdan.github.io/virtual-scroll/docs/#fenwick-tree).)

### `useVirtualScroll(props, extensions?)`

The core logic for virtualization.

**Parameters:**
- `props`: Reactive object, `Ref` or getter for [VirtualScrollProps](#props).
- `extensions`: Optional array of [VirtualScrollExtension](#extensions) objects.

**Returns:**
The [Exposed Members](#exposed-members) list covers the properties and methods the component puts on its instance; the composable returns those plus `totalWidth` / `totalHeight`, `renderedVirtualWidth` / `renderedVirtualHeight`, `isWindowContainer`, `scrollbarOffset`, `handleScrollCorrection` and `scrollCorrection` - a `Ref<Point>` holding the correction the engine applied to the scroll position when sizes above the window changed, which extensions and drag emulation use to keep their own origin in sync (see [Type Definitions](#type-definitions) for the shapes).

### `useVirtualScrollbar(props)`

Logic for custom virtual scrollbar interactions (dragging, clicking).

**Props:**
- `axis`: `'vertical' | 'horizontal'`
- `totalSize`: Content size (DU).
- `viewportSize`: Viewport size (DU).
- `position`: Current scroll (DU).
- `scrollToOffset`: Callback to update scroll.
- `containerId` (optional): id of the controlled container, exposed as `aria-controls`.
- `isRtl` (optional): Map the thumb for RTL layouts.
- `ariaLabel` (optional): Accessible label for the track.

**Returns:**
- `trackProps` / `thumbProps`: Attributes/listeners to bind on the track and thumb (`role`, ARIA values, styles, pointer handlers).
- `trackStyle` / `thumbStyle`: Calculated reactive styles.
- `positionPercent` / `viewportPercent` (0-1), `thumbSizePercent` / `thumbPositionPercent` (0-100): Raw geometry for custom interfaces.
- `isDragging`: Drag state.

### `useVirtualScrollInertia(config)`

Handles pointer-based scrolling, inertia animation, and mouse wheel events for cases where native scrolling is not available (e.g., massive lists or custom scrollbars).

**Config:**
- `useVirtualScrolling`: Boolean ref.
- `scrollDetails`: Reactive [ScrollDetails](#scrolldetails).
- `scrollToOffset`: Method to update scroll position.
- `stopProgrammaticScroll`: Method to halt animations.

**Returns:**
- `isPointerScrolling`: Boolean ref.
- `handlePointerDown` / `Move` / `Up`: Event handlers for pointer interaction.
- `handleWheel`: Event handler for mouse wheel.
- `stopInertia()`: Method to cancel ongoing momentum.
- `shiftOrigin(deltaX, deltaY)`: Moves the origin a drag measures from, so a measurement correction that shifted the content does not get undone by the next pointer move. No-op when no drag is in progress.

### `useVirtualScrollKeyboard(config)`

Provides keyboard navigation (Arrows, Home, End, PageUp, PageDown) for the virtual scroll container, either by scrolling the viewport or by moving a roving active item.

**Config:**
- `props`: Props of the list being navigated - a plain object, a `Ref` or a getter, so bounds, axis and column count stay live when the configuration is derived.
- `scrollDetails`: Reactive [ScrollDetails](#scrolldetails).
- `scrollToIndex`: Method to scroll to a specific index.
- `scrollToOffset`: Method to scroll to a pixel position. For the `End` key the composable requests extra range beyond the virtual content end (engine `endExtraX` / `endExtraY` options), so an always-rendered loading slot below the items stays reachable.
- `stopProgrammaticScroll`: Method to halt animations.
- `getLoadingSlotSize` (optional): Height of the loading slot. When provided, `End` includes it in the target so the last item plus the slot fit in the viewport.
- `...resolvers`: Various helper functions for index/offset mapping.
- `activationMode` (optional, accepts a ref or getter): `'viewport'` (default) scrolls the viewport only, with no active item; `'item'` moves a roving active item and exposes it through `activeIndex`/`isActive`/`aria-activedescendant`. The component derives it from the container role - see [`keyboardActivation`](#props).
- `onActivate` (optional): Called with the item index when the active item is activated - `Enter`/`Space` on the container, or an explicit `handleItemActivate` call. Never called in `'viewport'` mode.

**Key behavior (`'item'` mode):**
- Arrows: Move the active item by one along the scroll axis (`ArrowLeft`/`ArrowRight` on horizontal lists, honouring RTL; in grid mode the active item is a row, so the inline arrows keep panning columns) and scroll it back into view only when it left the viewport. The first arrow press activates the first visible item without scrolling.
- `PageUp` / `PageDown` / `Home` / `End`: Move the active item one viewport up/down, or to the first/last item, and keep it visible. The other axis is left untouched, so a multi-column list keeps its current column.
- `Enter` / `Space`: Activate the active item through `onActivate`.

**Key behavior (`'viewport'` mode):**
- `Home` / `End`: Scroll to the start / end of the content. `End` scrolls to `totalSize - viewportSize` (plus the loading slot size when `getLoadingSlotSize` is provided); the target is re-clamped when measurements settle, and new content appended by a load is not chased automatically. Because the slot lives in the DOM *after* the virtual wrapper, the requested range also extends the engine's scroll clamp, so the slot stays reachable.
- `PageUp` / `PageDown`: Scroll by one full page. The target is the first visible item minus one (`startIdx - 1`) / the last visible item plus one (`endIdx + 1`), so each press advances exactly one viewport.
- Arrows: Move one item in the scroll direction (one column in grid mode). `Enter`/`Space` do nothing.

**Returns:**
- `handleKeyDown`: Keyboard event handler.
- `activeIndex`: `Ref<number>` with the roving active item index, `-1` when none.
- `liveMessage`: `Ref<string>` with the polite announcement for the active item, e.g. `Item 21 of 100` (empty when nothing is active).
- `handleItemActivate(index)`: Marks an item active and calls `onActivate` (e.g. from a click handler in the item slot). No-op in `'viewport'` mode.

### `useVirtualScrollObservers(config)`

Manages `ResizeObserver` instances for the container, items, and slots (header/footer) to support fully dynamic sizing.

**Config:**
- `hostRef` / `wrapperRef`: Element references.
- `headerRef` / `footerRef`: Slot references.
- `itemRefs`: Map for tracking rendered item elements.
- `updateHostOffset`: Method to recalculate container position.
- `updateItemSizes`: Method to register batch measurements.

**Returns:**
- `setItemRef(el, index)`: Callback ref for individual items.

### `useVirtualScrollMasonry(props)`

The engine behind `VirtualScrollMasonry`: derives the column geometry from the container width, places each card on the shortest column through segment-snapshotted frontier chains, mounts only the window around the scroll position and re-anchors the topmost visible card across relayouts.

**Parameters:**
- `props`: Reactive object, `Ref` or getter for the [masonry props](#virtualscrollmasonry) plus `hostRef` (the scroll container element).

**Returns:**
- `renderedCards`: Cards to mount in the current window.
- `scrollDetails`: Reactive `MasonryScrollDetails` (`currentIndex`/`currentEndIndex`, `range`, `scrollOffset.y`, `viewportSize`, `totalSize`, `isScrolling`, …).
- `columns` / `columnWidth` / `totalHeight` / `totalHeightExact`: reactive column geometry and content height.
- `scrollToIndex(index, options)` / `scrollToOffset(offset, options)` / `refresh()`: programmatic API.
- `internalState` / `applyMeasurements(...)`: consumed by the component wrapper and tagged `@internal` - not part of the supported surface.

## Component Reference: VirtualScroll

### VirtualScrollTable

For tabular data use the dedicated `VirtualScrollTable` component instead: it renders a real `<table>` structure with optional real-table-flow rows (`flowTable`, supporting measured dynamic row heights), sticky header/footer slots, and three column-width strategies - browser auto layout, first-window auto-sizing (`autoSizeColumns`), or explicit `columnWidths`; overflowing tables get a horizontal scrollbar. See the [Flow Table example](https://pdanpdan.github.io/virtual-scroll/essential-flow-table).

The table fixes its own semantic tags (`table` > `tbody` > `tr`, with `thead`/`tfoot` for the slots), so the `containerTag`/`wrapperTag`/`itemTag`/`headerTag`/`footerTag` props do not apply to it - they are typed on `VirtualScroll`, which is the component to use when you need `ul`/`ol` > `li` markup.

### VirtualScrollMasonry

For a real masonry grid inside a **single** scroll container use the dedicated `VirtualScrollMasonry` component: the column count and a fractional column width are derived from the container width, cards are placed greedily on the shortest column through segment-snapshotted column frontiers, and only the window around the scroll position is mounted. Heights come exclusively from the `itemHeight` oracle, so the layout is canonical: far `scrollToIndex` calls land exactly without ever mounting the path, the total is exact once the frontier chain reaches the end (`totalHeightExact`), and reflows re-anchor the topmost visible card in content space. See the [Masonry example](https://pdanpdan.github.io/virtual-scroll/essential-masonry).

```vue
<VirtualScrollMasonry
  ref="masonryRef"
  :items="items"
  :item-height="itemHeight"
  :target-column-width="240"
  :min-columns="2"
  :max-columns="8"
  :gap="16"
  @scroll="onScroll"
>
  <template #item="{ item, index, column, width, height }">
    <div class="card" :style="{ height: '100%', backgroundColor: item.color }">
      #{{ index }} · col {{ column }} · {{ Math.round(height) }}px
    </div>
  </template>
</VirtualScrollMasonry>
```

Masonry-specific props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `itemHeight` | `fn(item, index, columnWidth)` | Required | Canonical height oracle in px. **Must be deterministic**: the same `(index, columnWidth)` must always return the same height, because placements are committed to a frontier chain. Non-finite results fall back to `40`; finite non-positive results clamp to `1`. |
| `measuredHeights` | `boolean` | `false` | Measure mounted cards with a `ResizeObserver` and drive the layout from the measured boxes ("local" determinism). Off: canonical oracle layout, nothing measured. On: cards size to their content (the oracle height becomes the pre-measure minimum) and every measurement batch re-lays-out with the viewport re-anchored. |
| `targetColumnWidth` | `number` | `240` | Desired column width in px; the column count is derived so columns land as close as possible to it. |
| `minColumns` / `maxColumns` | `number` | `1` / `10` | Column count bounds for responsive reflow. |
| `gap` | `number` | `10` | Spacing between cards, both between columns and rows. |
| `segmentSize` | `number` | `500` | Items per stored frontier snapshot (memory vs. chain-step tradeoff). |
| `virtualScrollbar` | `boolean` | `true` | Overlay scrollbar over the native one (native bar is hidden while enabled). |
| `debug` | `boolean` | `false` | Outline card bounds and show a geometry badge per card. |
| `role` / `ariaLabel` / `ariaLabelledby` / `itemRole` | `string` | - | ARIA semantics (wrapper defaults to `list` with `listitem` cards). |

All `VirtualScroll` items/`itemSize`/`direction`/snap/sticky/table props do **not** apply to the masonry component.

- **Item slot props**: `{ item, index, column, x, y, width, height }` (px, relative to the cards wrapper).
- **Events**: `scroll` with `MasonryScrollDetails` (items, `currentIndex`/`currentEndIndex`, `range`, `scrollOffset.y`, `viewportSize`, `totalSize`, `isScrolling`, …).
- **Exposed (via ref)**: `scrollDetails`, `columns`, `columnWidth`, `totalHeight`, `totalHeightExact`, `scrollToIndex(index, { align, behavior })`, `scrollToOffset(offset)`, `refresh()`.

> **Masonry sizing contract**: in the default canonical mode cards must render at exactly the oracle height - reserve media space (`aspect-ratio`, fixed model heights, …) and never rely on DOM measurement. With `measuredHeights` cards size to their content instead and the measured box drives the layout (mounted cards only; unmounted regions fall back to the oracle, and measurements reset when the `items` array is replaced). In-place item edits or oracle changes need a `refresh()` (or a new `items` array) to re-layout; relayouts keep the topmost visible card pinned at its screen offset. Vertical axis only: no RTL/horizontal/both mode and no coordinate scaling - very tall datasets stay below the browser's ~10M px scroll limit.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | Required | Array of items to be virtualized. May contain `undefined` entries (e.g. `new Array(n)` for data-less lists): every index in range renders and `item` is `undefined` for holes; only the visible window is accessed. |
| `itemSize` | `number \| (number \| null \| undefined)[] \| fn \| null` | `undefined` | Fixed size, repeating array pattern (holes and `null` mean "measure this index"), or function. Omit it (or pass `0`/`null`) and rows are **measured** with a `ResizeObserver`, using `defaultItemSize` (`40`) as the pre-measure estimate. |
| `direction` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Scroll direction. |
| `columnCount` | `number` | `0` | Number of columns for grid mode. |
| `columnWidth` | `num \| (num \| null \| undefined)[] \| fn \| null` | `undefined` | Column sizing for grid mode (same forms as `itemSize`). Omit it (or pass `0`/`null`) and columns are measured, using `defaultColumnWidth` (`100`) as the pre-measure estimate. |
| `gap` / `columnGap` | `number` | `0` | Spacing between items/columns. |
| `snap` | `SnapMode` | `false` | Enable scroll snapping. See [SnapMode](#snapmode). |
| `stickyIndices` | `number[]` | `[]` | Indices of items that should remain sticky. When `stickyHeader`/`stickyFooter` are enabled, they stick below/above them. |
| `stickyHeader` / `stickyFooter` | `boolean` | `false` | If true, measures and adds slot size to padding. Sticky `stickyIndices` items align below/above them. |
| `ssrRange` | `object` | - | Range of items to pre-render for SSR. |
| `virtualScrollbar` | `boolean` | `false` | Whether to force virtual scrollbars. |
| `restoreScrollOnPrepend` | `boolean` | `false` | Maintain position when items added to top. |
| `loading` | `boolean` | `false` | While `true`, reveals the `#loading` slot (kept mounted and hidden via CSS while `false`) and suppresses repeated `load` events. |
| `loadDistance` | `number` | `200` | Distance from the end (DU) at which the `load` event triggers. |
| `container` | `HTMLElement \| Window` | `hostRef` | The scrollable container element. |
| `containerTag` | `string` | `'div'` | HTML tag for the root container. |
| `wrapperTag` | `string` | `'div'` | HTML tag for the items wrapper - pair `'ul'`/`'ol'` with `itemTag: 'li'` for semantic lists. |
| `itemTag` | `string` | `'div'` | HTML tag for each virtualized item. For tabular data use `VirtualScrollTable` instead. |
| `headerTag` | `string` | `'div'` | HTML tag for the `header` slot wrapper (e.g. `'header'`). |
| `footerTag` | `string` | `'div'` | HTML tag for the `footer` slot wrapper (e.g. `'footer'`). |
| `scrollPaddingStart` / `End` | `num \| {x, y}` | `0` | Padding for scroll calculations. |
| `bufferBefore` / `bufferAfter` | `number` | `5` | Items to render outside the viewport. |
| `initialScrollIndex` | `number` | `undefined` | Index to jump to on mount. |
| `initialScrollAlign` | `ScrollAlignment \| ScrollAlignmentOptions` | `'start'` | Alignment for initial jump. See [ScrollAlignment](#scrollalignment) or [Options](#scrollalignmentoptions). |
| `defaultItemSize` / `defaultColumnWidth` | `number` | `40 / 100` | Estimate for dynamic items/columns. |
| `debug` | `boolean` | `false` | Enable debug visualization. |
| `role` | `string` | - | ARIA role for the container. Defaults based on direction. |
| `keyboardActivation` | `'auto' \| 'item' \| 'viewport'` | `'auto'` | How the keyboard interacts with the content. `'auto'` uses the roving item model for the roles that publish an active descendant (`listbox`, `menu`, `tree`) and viewport scrolling for everything else, including the default `grid` role of a two-axis list. `'item'` always tracks an active item; `'viewport'` never does. |
| `ariaLabel` / `ariaLabelledby` | `string` | - | Accessibility labels for the container (the container role becomes `region` when either is set). |
| `itemRole` | `string` | - | ARIA role for items. Defaults based on `role`. |

### SnapMode

Controls the automatic alignment after scrolling stops.

- `false` (default): No snapping.
- `true` / `'auto'`: Snapping follows the scroll direction: acts as `'end'` when scrolling towards start, and `'start'` when scrolling towards end.
- `'next'`: Snaps to the next (closest) snap position in the direction of the scroll.
- `'start'`: Aligns the first visible item to the viewport start if at least 50% visible, otherwise aligns the next item.
- `'center'`: Aligns the item that intersects the viewport center to the center.
- `'end'`: Aligns the last visible item to the viewport end if at least 50% visible, otherwise aligns the previous item.

Snapping is disabled if the target item's size is larger than the viewport dimension.

### ScrollAlignment

Controls the item's final position in the viewport during `scrollToIndex`.

- `'start'`: Aligns to top (vertical) or left (horizontal) edge.
- `'center'`: Aligns to viewport center.
- `'end'`: Aligns to bottom (vertical) or right (horizontal) edge.
- `'auto'` (default): No scroll if the item is already fully visible; otherwise aligns to `'start'` or `'end'` to bring it into view.

### ScrollAlignmentOptions

Allows axis-specific alignment in `scrollToIndex`.

- `x`: `ScrollAlignment` for the horizontal axis.
- `y`: `ScrollAlignment` for the vertical axis.

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `scroll` | `ScrollDetails<T>` | Emitted on every scroll-details change once hydrated. See [ScrollDetails](#scrolldetails). |
| `visibleRangeChange` | `{ start, end, colStart, colEnd }` | Emitted when the rendered range changes, and once on hydration. `start`/`colStart` are inclusive and `end`/`colEnd` exclusive, matching [ScrollDetails](#scrolldetails) `range`/`columnRange`. |
| `load` | `'vertical' \| 'horizontal'`, `LoadDetails` | Emitted when the scroll position comes within `loadDistance` (DU) of the end on that axis; suppressed while `loading` is `true` and while the axis is flinging faster than `flingVelocity`. The second argument carries `{ velocity, direction }` (`velocity` in VU/ms, `direction` `'start' \| 'end' \| null`). |
| `itemActivate` | `index: number`, `item: T \| undefined` | Emitted when the active item is activated with `Enter`/`Space`, or from an explicit `handleItemActivate(index)` call (e.g. a click in the item slot). Only emitted in the item activation model. |

`VirtualScrollTable` emits the same events. `VirtualScrollMasonry` emits `scroll` with `MasonryScrollDetails` (single vertical axis).

### Slots

- `item`: Scoped slot for individual items. Provides `item` (may be `undefined` for holes in sparse/index-only datasets - type the array as `(T | undefined)[]` to model that), `index`, `getItemAriaProps`, `getCellAriaProps`, `columnRange`, `getColumnWidth`, `gap`, `columnGap`, `isSticky`, `isStickyActive`, `isStickyActiveX`, `isStickyActiveY`, `isActive`, `offset`.
- `header` / `footer`: Content rendered at the top/bottom of the scrollable area.
- `loading`: Content rendered at the end while loading. The slot is always rendered when provided - it is hidden via the `virtual-scroll-loading--hidden` class (`visibility: hidden`) while `loading` is false - so it reserves its space and `End` can include its size in the scroll target. Only provide the slot while a load is expected: once there is no more data (or loading is disabled), stop passing it (e.g. `v-if="hasMore"` on `<template #loading>`) and the reserved space disappears.
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
- `scrollDetails`: Full reactive state of the virtual scroll system. See [ScrollDetails](#scrolldetails).
- `activeIndex`: Index of the item tracked by keyboard navigation, `-1` when none.
- `setActiveIndex(index)`: Sets (`null` clears) the active item without scrolling, so a click or an external selection can be synced in.
- `columnRange`: Information about the current visible range of columns. See [ColumnRange](#columnrange).
- `wrapperRole` / `cellRole`: The ARIA roles currently applied to the items wrapper and its cells.
- `isHydrated`: `true` when the component is mounted and hydrated.
- `isRtl`: `true` if the container is in Right-to-Left mode.
- `scrollbarPropsVertical` / `scrollbarPropsHorizontal`: Reactive `ScrollbarSlotProps`.
- `scaleX` / `scaleY`: Current coordinate scaling factors (VU/DU).
- `renderedWidth` / `renderedHeight`: Physical dimensions in DOM (clamped, DU).
- `componentOffset`: Absolute offset of the component within its container (DU).

#### Methods
- `setActiveIndex(index)`: Sets the active item without scrolling (`null` clears it), for syncing a click or an external selection.
- `handleItemActivate(index)`: Marks an item active and emits `itemActivate`.
- `scrollToIndex(row, col, options)`: Programmatic scroll to index. An end-anchored scroll (last row or content end) keeps re-clamping while settling measurements move the real end, so the first jump to the end lands flush even on dynamic lists. See [ScrollToIndexOptions](#scrolltoindexoptions).
- `scrollToOffset(x, y, options)`: Programmatic scroll to pixel position. The target is re-clamped when measurements settle (dynamic items), mirroring `scrollToIndex`'s deferred settling. See [ScrollToOffsetOptions](#scrolltooffsetoptions).
- `refresh()`: Resets all measurements and state.
- `stopProgrammaticScroll()`: Halt smooth scroll animations and inertia.
- `updateDirection()`: Manually trigger direction detection.
- `updateHostOffset()`: Recalculate component position.
- `updateItemSize(index, inlineSize, blockSize, el?)`: Register single measurement.
- `updateItemSizes(updates)`: Batch register measurements.
- `getRowHeight(index)`: Returns the calculated height of a row.
- `getColumnWidth(index)`: Returns the calculated width of a column.
- `getRowOffset(index)`: Returns the virtual offset of a row.
- `getColumnOffset(index)`: Returns the virtual offset of a column.
- `getItemOffset(index)`: Returns the virtual offset of an item.
- `getItemSize(index)`: Returns the size of an item along the scroll axis.
- `getRowIndexAt(offset)`: Returns the row index at a virtual offset.
- `getColumnIndexAt(offset)`: Returns the column index at a virtual offset.
- `getCellAriaProps(colIndex)`: Returns ARIA attributes for a grid cell.
- `getItemAriaProps(index)`: Returns ARIA attributes for a row/item.

## Accessibility (ARIA)

The component automatically manages ARIA roles and attributes to ensure screen readers can navigate the virtualized content.

| Role Prop | Default Item Role | Usage Case |
|-----------|-------------------|------------|
| `list` | `listitem` | Standard vertical or horizontal list. |
| `grid` | `row` | Bidirectional grid or table. |
| `tree` | `treeitem` | Hierarchical list. |
| `listbox` | `option` | Selection lists. |
| `menu` | `menuitem` | Navigational menus. |

`aria-rowcount`, `aria-colcount`, `aria-rowindex`, and `aria-colindex` are automatically calculated and applied based on the current scroll state.

With [`keyboardActivation`](#props) set to the item model - `'auto'` selects it for `listbox`, `menu` and `tree` - the container also publishes `aria-activedescendant` pointing at the active item's `id`, and a polite live region announces the active position (`Item 21 of 100`) as it moves. `Enter`/`Space` emit `itemActivate`; a click routed through `handleItemActivate(index)` does the same.

## Type Definitions

### ScrollDetails

| Property | Type | Description |
|----------|------|-------------|
| `items` | `RenderedItem[]` | List of items currently in DOM. |
| `currentIndex` | `number` | Index of the first visible row below any sticky header. |
| `currentEndIndex` | `number` | Index of the last visible row above any sticky footer. |
| `currentColIndex` | `number` | Index of the first visible column after any sticky column. |
| `currentEndColIndex` | `number` | Index of the last visible column before any sticky end column (grid mode). |
| `scrollOffset` | `Point` | Current virtual scroll position (VU). |
| `displayScrollOffset` | `Point` | Current physical scroll position (DU). |
| `viewportSize` | `Size` | Dimensions of visible area (VU). |
| `displayViewportSize` | `Size` | Physical dimensions of visible area (DU). |
| `totalSize` | `Size` | Total size of all items (VU). |
| `isScrolling` | `boolean` | Whether scrolling is active. |
| `isProgrammaticScroll`| `boolean` | Whether scroll was triggered via API. |
| `range` | `{start, end}` | Range of rendered item indices. |
| `columnRange` | `ColumnRange` | Range of rendered columns. |

### ColumnRange

| Property | Type | Description |
|----------|------|-------------|
| `start` | `number` | First rendered column index. |
| `end` | `number` | Last rendered column index (exclusive). |
| `padStart` | `number` | Virtual padding at the start of the row (VU). |
| `padEnd` | `number` | Virtual padding at the end of the row (VU). |

### ScrollToIndexOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `align` | `ScrollAlignment \| ScrollAlignmentOptions` | `'auto'` | Alignment logic. |
| `behavior` | `'auto' \| 'smooth'` | `'smooth'` | Scroll animation. |

### ScrollToOffsetOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `behavior` | `'auto' \| 'smooth'` | `'auto'` | Scroll animation. |
| `endExtraX` | `number` | `0` | Extra scrollable range (VU) after the content end on the X axis, so a block rendered after the items (e.g. an always-rendered loading slot) stays reachable. |
| `endExtraY` | `number` | `0` | Same as `endExtraX` on the Y axis. |

## Sizing Guide

| Option Type | `itemSize` / `columnWidth` | Performance | Description |
|-------------|----------------------------|-------------|-------------|
| **Fixed** | `number` (e.g., `50`) | **Best** | Every item has the exact same size. Calculations are *O(1)*. |
| **Array** | `number[]` | **Great** | Repeating size pattern: entries cycle for items or columns when the array is shorter than the data. |
| **Function** | `(item, index) => number` | **Good** | Size is known but varies per item. |
| **Dynamic** | `0`, `null`, or `undefined` | **Fair** | Sizes are measured automatically via `ResizeObserver`. |

## Virtual Scrollbars

Virtual scrollbars are automatically enabled when content size exceeds browser limits, but can be forced via the `virtualScrollbar` prop.

Virtual scrollbars and coordinate scaling are disabled when the `container` is the browser `window` or `body`; native scrolling is used instead.

### Using the `VirtualScrollbar` Component

You can use the built-in `VirtualScrollbar` independently if needed.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `axis` | `'vertical' \| 'horizontal'` | `'vertical'` | Axis this scrollbar drives. |
| `totalSize` | `number` | Required | Content size (DU). |
| `position` | `number` | Required | Current scroll position (DU). |
| `viewportSize` | `number` | Required | Viewport size (DU). |
| `scrollToOffset` | `(offset: number) => void` | - | Called with the requested offset while dragging or clicking the track. The same value is emitted as `scrollToOffset`, so either channel works. |
| `containerId` | `string` | - | id of the controlled container, exposed as `aria-controls`. |
| `isRtl` | `boolean` | `false` | Map the thumb for RTL layouts. |
| `ariaLabel` | `string` | - | Accessible label for the track. The component renders none by default; `VirtualScroll` passes `"Vertical scroll"` / `"Horizontal scroll"`. |

The component itself exposes nothing through a template ref; use the `useVirtualScrollbar` composable when you need the geometry.

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
| `--vs-scrollbar-size` | `8px` | Width (vertical) or height (horizontal) of the scrollbar. |
| `--vs-scrollbar-radius` | `4px` | Border radius for track and thumb. |
| `--vs-scrollbar-cross-gap` | `var(--vs-scrollbar-size)` | Size of gap where scrollbars meet. |
| `--vs-scrollbar-has-cross-gap` | `0` | If gap should be shown where scrollbars meet. |

## License

MIT
