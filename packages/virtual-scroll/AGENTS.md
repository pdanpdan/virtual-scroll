# @pdanpdan/virtual-scroll — Agent Guide

> Written for AI coding agents (Claude Code, Codex, Cursor, Copilot, …) that integrate this package into Vue 3 apps.
> For humans: `README.md`. Full interactive reference: https://pdanpdan.github.io/virtual-scroll/docs/ — compact LLM summary: https://pdanpdan.github.io/virtual-scroll/llms.txt

## What it is

`@pdanpdan/virtual-scroll` is a dependency-free Vue 3 (peer `vue ^3`) virtualization component and composable. It renders only the items near the viewport and supports **unbounded content**: when the total content size would exceed the browser scroll limit (~10M px), it transparently scales coordinates ("virtual units" vs "display units") so lists of millions/billions of px still scroll 1:1 with the wheel. Dynamic item sizes are measured live via `ResizeObserver`. No runtime dependencies, ESM+CJS+UMD, SSR-safe.

## Installation & import modes

```bash
pnpm add @pdanpdan/virtual-scroll
```

1. **Compiled entry (recommended for bundlers)** — CSS must be imported separately:
```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
</script>
```
2. **Raw SFC passthrough** — styles already included, no CSS import:
```js
import VirtualScroll from '@pdanpdan/virtual-scroll/VirtualScroll.vue';
```
3. **CDN (UMD)** — `https://unpkg.com/@pdanpdan/virtual-scroll` after the Vue global, plus `https://unpkg.com/@pdanpdan/virtual-scroll/dist/style.css`.

Exact TypeScript signatures for everything below ship in `dist/index.d.ts` — read it before guessing option shapes.

## Public exports (from the package entry)

**Components**: `VirtualScroll` (named export), `VirtualScrollbar` (standalone scrollbar component).

**Composables**: `useVirtualScroll(propsInput, extensions?)`, `useVirtualScrollSizes(config)`, `useVirtualScrollbar(props)`.

**Extension factories** (2nd arg of `useVirtualScroll`; the component wires all six already):
`useRtlExtension()`, `useSnappingExtension()`, `useStickyExtension()`, `useInfiniteLoadingExtension({ onLoad: (axis) => void })`, `usePrependRestorationExtension()`, `useCoordinateScalingExtension()`.

**Key types**: `VirtualScrollProps`, `VirtualScrollInstance`, `ScrollDetails`, `RenderedItem`, `ItemSlotProps`, `ScrollbarSlotProps`, `SSRRange`, `SnapMode`, `ScrollDirection`, `ScrollAlignment`, `PaddingValue`. All pure geometry/utils are re-exported too.

## Core props (exact names)

- `items: T[]` — required, reactive data source.
- `itemSize`: `number | number[] | ((item, index) => number) | null` (default `40`) — number = fixed; array = repeating circular pattern (`[50, 100]`); function = per-item; `null`/`0`/`undefined` = **dynamic**, measured via `ResizeObserver`.
- `direction`: `'vertical' | 'horizontal' | 'both'` (default `'vertical'`). `'both'` = grid.
- `columnCount` / `columnWidth` — grid columns; `columnWidth` accepts number/array/function/`null` (dynamic) like `itemSize`.
- `gap`, `columnGap` — spacing in virtual units.
- `stickyIndices: number[]` — iOS-style pushing section headers; plus `stickyHeader` / `stickyFooter` booleans for the `header`/`footer` slots.
- `snap`: `boolean | 'auto' | 'start' | 'center' | 'end' | 'next'` (default `false`).
- `container?: HTMLElement | Window` — omit for self-contained scroll; pass the `window` object to virtualize the page scroll.
- `virtualScrollbar: boolean` — force custom scrollbars even under the browser limit.
- `loading: boolean`, `loadDistance: number` (default `200`) — infinite loading; while `loading` is true the `#loading` slot shows and `load` events are suppressed.
- `restoreScrollOnPrepend: boolean` — keeps position when items are prepended (chat history).
- `initialScrollIndex: number`, `initialScrollAlign: 'start' | 'center' | 'end' | 'auto'` — initial jump.
- `ssrRange: { start, end, colStart?, colEnd? }` — pre-render static items server-side for SEO.
- `bufferBefore` / `bufferAfter` (default `5`), `defaultItemSize` (40), `defaultColumnWidth` (100).
- Tag overrides: `containerTag`, `wrapperTag`, `itemTag` (e.g. `'table'`/`'tbody'`/`'tr'`).
- A11y: `role`, `ariaLabel`, `ariaLabelledby`, `itemRole` (auto roles for list/grid/tree/listbox/menu).
- Advanced geometry: `scrollPaddingStart`/`scrollPaddingEnd`, `stickyStart`/`stickyEnd`, `flowPaddingStart`/`flowPaddingEnd`, `debug`, `hostRef`, `hostElement`.

In templates use **kebab-case** (`:item-size`, `sticky-header`, `restore-scroll-on-prepend`); in the composable / `defineProps` types use camelCase.

## Slots

- `#header`, `#footer` — fixed content at flow edges (sticky via props above).
- `#item="{ item, index, offset, gap, columnGap, isSticky, isStickyActive, getItemAriaProps, getCellAriaProps, columnRange, getColumnWidth }"` — the only required slot. Must render a single root element per item.
- `#loading` — shown while `loading` is true.
- `#scrollbar="{ axis, positionPercent, viewportPercent, thumbSizePercent, thumbPositionPercent, trackProps, thumbProps, scrollbarProps, isDragging }"` — when provided it **replaces** the default scrollbar; bind `trackProps`/`thumbProps` to your track/thumb elements (or spread `scrollbarProps` onto `<VirtualScrollbar>`).

## Events

- `@scroll="(details: ScrollDetails)"` — full state (offsets, range, viewport, totalSize…).
- `@load="(axis: 'vertical' | 'horizontal')"` — infinite-loading trigger.
- `@visible-range-change="{ start, end, colStart, colEnd }"`.

## Exposed (template ref) methods

`scrollToIndex(rowIndex?, colIndex?, { align?, behavior? })`, `scrollToOffset(x?, y?, { behavior? })`, `refresh()` (re-measure everything), `updateItemSizes(updates)`, `stopProgrammaticScroll()`, `updateDirection()`, plus getters: `getRowHeight(i)`, `getColumnWidth(i)`, `getRowOffset(i)`, `getColumnOffset(i)`, `getItemOffset(i)`, `getItemSize(i)`, `getRowIndexAt(offset)`, `getColIndexAt(offset)`, `getItemAriaProps(i)`, `getCellAriaProps(colIndex)`.

## Numbered patterns

1. **Fixed-height list**: `:items` + `:item-size="50"`; container CSS needs an explicit height.
2. **Dynamic-height list** (chat, feeds): `:item-size="null"`; items must size themselves from content, `gap` supported.
3. **Circular sizes**: `:item-size="[50, 100]"`, or a function for fully custom per-item sizes.
4. **Grid**: `direction="both"`, `column-count` (and `column-width` or dynamic columns); rows follow `itemSize`.
5. **Semantic `<table>`**: `container-tag="table" wrapper-tag="tbody" item-tag="tr"` + `sticky-header`; render `<td>` cells in `#item`.
6. **Window/body scrolling**: `:container="window"` (or the element that scrolls); no fixed-height wrapper needed.
7. **Chat history**: `restore-scroll-on-prepend` + `initial-scroll-index` / `initial-scroll-align="end"`.
8. **Infinite loading**: `:loading` + `@load` + `#loading` slot (component) or `useInfiniteLoadingExtension({ onLoad })` (composable).
9. **Sticky sections**: `:sticky-indices="[0, 20, 40]"`, or `sticky-header`/`sticky-footer` slots.
10. **Snap carousels**: `snap="'start' | 'center' | 'end' | 'next' | 'auto'"`.
11. **Custom scrollbars**: `virtual-scrollbar` + `#scrollbar` slot, or `<VirtualScrollbar>` with the slot's `scrollbarProps`.
12. **SSR**: pass `ssr-range` to pre-render items; identical client render hydrates and takes over scrolling on mount.
13. **Billions of pixels**: nothing to configure — coordinate scaling engages automatically past the browser limit.

## Decision tree

- All items same height → fixed `itemSize` number. Mixed/content-sized → `itemSize` function or `null`.
- Two axes with columns → `direction="both"` + `columnCount`. Semantic table → pattern 5.
- Page-level scroll → `container` = `window`. Prepend history → `restoreScrollOnPrepend`. Endless feeds → `loading`/`@load`. Headers that push → `stickyIndices`. Alignment after scroll → `snap`. Massive/unbounded content → any mode; scaling is automatic.

## Mistakes agents must avoid

- ❌ Importing without the CSS in bundler mode — layout relies on shipped `virtual-scroll.css`. ✅ `import '@pdanpdan/virtual-scroll/style.css'` (only the raw `VirtualScroll.vue` passthrough skips this).
- ❌ `:item-size` fixed at `40` while items have different real heights → overlap/misalignment. ✅ Match it to real content or use `null` (dynamic).
- ❌ Camel-case props in templates (`:itemSize`) in non-SFC/string templates. ✅ Kebab-case (`:item-size`); camelCase only in TS/composable props.
- ❌ Rendering multiple roots or the item slot content inside the scroll container instead of the `#item` slot. ✅ One root element per `#item` render.
- ❌ Calling `scrollToIndex` before mount or while the component isn't sized. ✅ Call in `onMounted`/after layout (or via `ssrRange`/`initialScrollIndex`).
- ❌ Assuming the native scrollbar is replaced without opting in. ✅ Native bar stays unless scaled content, `virtualScrollbar`, or a `#scrollbar` slot is used.
- ❌ Mutating item sizes externally without telling the library → stale offsets. ✅ Use `refresh()` or `updateItemSizes([{ index, inlineSize, blockSize }])`.
- ❌ Styling `--vs-scrollbar-*` CSS variables and expecting a custom `#scrollbar` slot to honor them. ✅ Those vars style only the default scrollbar; a slot replaces it entirely.
- ❌ Forgetting the scroll container needs a bounded height (fixed list mode) or that sticky/`ssrRange` combos need matching client/server item markup.
