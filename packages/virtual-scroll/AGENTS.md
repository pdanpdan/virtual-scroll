# @pdanpdan/virtual-scroll - Agent Guide

> Written for AI coding agents (Claude Code, Codex, Cursor, Copilot, …) that integrate this package into Vue 3 apps.
> For humans: `README.md`. Full interactive reference: https://pdanpdan.github.io/virtual-scroll/docs/ - compact LLM summary: https://pdanpdan.github.io/virtual-scroll/llms.txt

## What it is

`@pdanpdan/virtual-scroll` is a dependency-free Vue 3 (peer `vue ^3.5`) virtualization component and composable. It renders only the items near the viewport and supports **unbounded content**: when the total content size would exceed the browser scroll limit (~10M px), it transparently scales coordinates ("virtual units" vs "display units") so lists of millions/billions of px still scroll 1:1 with the wheel. Dynamic item sizes are measured live via `ResizeObserver`. No runtime dependencies, ESM+CJS+UMD, SSR-safe.

## Installation & import modes

```bash
pnpm add @pdanpdan/virtual-scroll
```

1. **Compiled entry (recommended for bundlers)** - CSS must be imported separately:
```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

import '@pdanpdan/virtual-scroll/style.css';
</script>
```
2. **Raw SFC passthrough** - styles already included, no CSS import:
```js
import VirtualScroll from '@pdanpdan/virtual-scroll/VirtualScroll.vue';
```
3. **CDN (UMD)** - `https://unpkg.com/@pdanpdan/virtual-scroll` after the Vue global, plus `https://unpkg.com/@pdanpdan/virtual-scroll/dist/virtual-scroll.css`.
4. **Lean entry** - `import { VirtualScroll } from '@pdanpdan/virtual-scroll/core'` with `@pdanpdan/virtual-scroll/core/style.css`: the same API built without the optional wiring (no keyboard navigation, custom scrollbars, snapping, sticky items, infinite loading or prepend restoration; ~5 KB gzipped smaller for a tree-shaken `<VirtualScroll>`). In that build `virtualScrollbar`, `snap`, `stickyIndices`, `loadDistance` and `restoreScrollOnPrepend` are accepted for API compatibility but do nothing (`loading` still drives the loading slot and `aria-busy`; only the automatic `load` trigger is gone) - never mix the entry with code that relies on them, and keep the composable path if you need granular control.

Exact TypeScript signatures for everything below ship in `dist/index.d.ts` - read it before guessing option shapes.

## Public exports (from the package entry)

**Components**: `VirtualScroll`, `VirtualScrollTable`, `VirtualScrollMasonry`, `VirtualScrollbar` (all also available as raw `.vue` passthroughs).

**Composables**: `useVirtualScroll(propsInput, extensions?)`, `useVirtualScrollbar(props)`, `useVirtualScrollInertia(config)`, `useVirtualScrollKeyboard(config)`, `useVirtualScrollMasonry(propsInput)`, `useVirtualScrollObservers(config)`.

**Extension factories** (2nd arg of `useVirtualScroll`; the component wires all six already):
`useRtlExtension()`, `useSnappingExtension()`, `useStickyExtension()`, `useInfiniteLoadingExtension({ onLoad: (axis, details) => void })`, `useSnapshotsExtension({ storage?, key?, autoSave? })`, `usePrependRestorationExtension()`, `useCoordinateScalingExtension()`.

`useStickyExtension()` owns sticky *behaviour*: it pins the nearest sticky item above the window (through the `includeIndices` hook) and computes `isStickyActive`/`stickyOffset`. `stickyIndices` without the extension keeps the layout offsets but does not pin anything. Extension authors get three additions for this kind of work: `includeIndices?(ctx)` (merge indices into the rendered window), `ctx.methods.getItemRawOffset(axis, index)` (raw virtual offset, correct for fixed and measured sizes) and `ctx.internalState.isHydrated`.

**Key types**: `VirtualScrollProps`, `VirtualScrollInstance`, `VirtualScrollTableInstance`, `VirtualScrollMasonryInstance`, `UseVirtualScrollReturn`, `ScrollDetails`, `RenderedItem`, `ItemSlotProps`, `ScrollbarSlotProps`, `SSRRange`, `SnapMode`, `ScrollDirection`, `ScrollAlignment`, `ScrollToIndexOptions`, `ScrollToOffsetOptions`, `PaddingValue`, plus the `DEFAULT_*` constants and `EMPTY_SCROLL_DETAILS`.

**Engine internals are NOT on the root entry.** The pure `calculate*` layer, the DOM scroll helpers
(`isWindow`, `scrollTo`, `getPaddingX`, …), `MasonryLayout`, the sizing layer the engine builds on
(`useVirtualScrollSizes` + `UseVirtualScrollSizesProps`) and the parameter bags those functions take
(`RangeParams`, `StickyParams`, …) are importable from `@pdanpdan/virtual-scroll/internal` with no
compatibility guarantee. Do not import them from the root; if you need them, import the subpath
explicitly and expect breaking changes in any release. `FenwickTree` is the exception: the structure
`useVirtualScrollSizes` returns is exported from the root.

## Core props (exact names)

- `items: T[]` - required, reactive data source.
- `itemSize`: `number | number[] | ((item, index) => number) | null` (no default: omitted/`null`/`0` means **dynamic**, measured via `ResizeObserver`, with `defaultItemSize` `40` used only until the first measurement) - number = fixed; array = repeating circular pattern (`[50, 100]`); function = per-item.
- `direction`: `'vertical' | 'horizontal' | 'both'` (default `'vertical'`). `'both'` = grid.
- `columnCount` / `columnWidth` - grid columns; `columnWidth` accepts number/array/function/`null` (dynamic) like `itemSize`.
- `gap`, `columnGap` - spacing in virtual units.
- `stickyIndices: number[]` - iOS-style pushing section headers; plus `stickyHeader` / `stickyFooter` booleans for the `header`/`footer` slots.
- `snap`: `boolean | 'auto' | 'start' | 'center' | 'end' | 'next'` (default `false`).
- `keyboardActivation`: `'auto' | 'item' | 'viewport'` (default `'auto'`). `'auto'` tracks a roving active item (`isActive` slot prop, `aria-activedescendant`, `itemActivate` event, `activeIndex`/`setActiveIndex`/`handleItemActivate` on the instance) for `listbox`/`menu`/`tree` roles and scrolls the viewport for the rest, including `grid`; `'item'`/`'viewport'` force one model.
- `container?: HTMLElement | Window` - omit for self-contained scroll; pass the `window` object to virtualize the page scroll.
- `virtualScrollbar: boolean` - force custom scrollbars even under the browser limit.
- `loading: boolean`, `loadDistance: number` (default `200`) - infinite loading; while `loading` is true the `#loading` slot shows and `load` events are suppressed.
- `restoreScrollOnPrepend: boolean` - keeps position when items are prepended (chat history).
- `initialScrollIndex: number`, `initialScrollAlign: 'start' | 'center' | 'end' | 'auto'` - initial jump.
- `ssrRange: { start, end, colStart?, colEnd? }` - pre-render static items server-side for SEO.
- `bufferBefore` / `bufferAfter` (default `5`), `defaultItemSize` (40), `defaultColumnWidth` (100).
- Tag overrides: `containerTag`, `wrapperTag`, `itemTag` (e.g. `'ul'`/`'li'`) - `VirtualScroll` only; `VirtualScrollTable` fixes `table`/`tbody`/`tr`, `VirtualScrollMasonry` fixes its own markup.
- A11y: `role`, `ariaLabel`, `ariaLabelledby`, `itemRole` (auto roles for list/grid/tree/listbox/menu).
- Advanced geometry: `scrollPaddingStart`/`scrollPaddingEnd`, `debug`. The engine-only fields (`stickyStart`/`stickyEnd`, `flowPaddingStart`/`flowPaddingEnd`, `hostRef`, `hostElement`) are `VirtualScrollProps` members the component computes and forwards - they are not component props, so setting them on the component does nothing.

In templates use **kebab-case** (`:item-size`, `sticky-header`, `restore-scroll-on-prepend`); in the composable / `defineProps` types use camelCase.

## Slots

- `#header`, `#footer` - fixed content at flow edges (sticky via props above).
- `#item="{ item, index, offset, gap, columnGap, isSticky, isStickyActive, getItemAriaProps, getCellAriaProps, columnRange, getColumnWidth }"` - the only required slot. Must render a single root element per item.
- `#loading` - shown while `loading` is true.
- `#scrollbar="{ axis, positionPercent, viewportPercent, thumbSizePercent, thumbPositionPercent, trackProps, thumbProps, scrollbarProps, isDragging }"` - when provided it **replaces** the default scrollbar; bind `trackProps`/`thumbProps` to your track/thumb elements (or spread `scrollbarProps` onto `<VirtualScrollbar>`).

## Events

- `@scroll="(details: ScrollDetails)"` - full state (offsets, range, viewport, totalSize…).
- `@load="(axis: 'vertical' | 'horizontal', details: { velocity, direction })"` - infinite-loading trigger; `velocity` is in VU/ms and `direction` is `'start' | 'end' | null` (suppressed while the axis flings faster than `flingVelocity`).
- `@itemActivate="(index: number, item: T | undefined)"` - the active item was activated with `Enter`/`Space` or through the exposed `handleItemActivate(index)`.
- `@visible-range-change="{ start, end, colStart, colEnd }"`.

## Exposed (template ref) methods

`scrollToIndex(rowIndex?, colIndex?, { align?, behavior? })`, `scrollToOffset(x?, y?, { behavior?, endExtraX?, endExtraY? })` (`endExtraX`/`endExtraY` extend the scroll clamp past the content end for a block rendered after the items, e.g. an always-rendered loading slot), `refresh()` (re-measure everything), `updateItemSize(index, inlineSize, blockSize, el?)`, `updateItemSizes(updates)`, `stopProgrammaticScroll()`, `updateDirection()`, `updateHostOffset()`, plus getters: `getRowHeight(i)`, `getColumnWidth(i)`, `getRowOffset(i)`, `getColumnOffset(i)`, `getItemOffset(i)`, `getItemSize(i)`, `getRowIndexAt(offset)`, `getColumnIndexAt(offset)`, `getItemAriaProps(i)`, `getCellAriaProps(colIndex)`.

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
13. **Billions of pixels**: nothing to configure - coordinate scaling engages automatically past the browser limit.

## Decision tree

- All items same height → fixed `itemSize` number. Mixed/content-sized → `itemSize` function or `null`.
- Two axes with columns → `direction="both"` + `columnCount`. Semantic table → pattern 5.
- Page-level scroll → `container` = `window`. Prepend history → `restoreScrollOnPrepend`. Endless feeds → `loading`/`@load`. Headers that push → `stickyIndices`. Alignment after scroll → `snap`. Massive/unbounded content → any mode; scaling is automatic.

## Mistakes agents must avoid

- ❌ Importing without the CSS in bundler mode - layout relies on shipped `virtual-scroll.css`. ✅ `import '@pdanpdan/virtual-scroll/style.css'` (only the raw `VirtualScroll.vue` passthrough skips this).
- ❌ `:item-size` fixed at `40` while items have different real heights → overlap/misalignment. ✅ Match it to real content or use `null` (dynamic).
- ❌ Camel-case props in templates (`:itemSize`) in non-SFC/string templates. ✅ Kebab-case (`:item-size`); camelCase only in TS/composable props.
- ❌ Rendering multiple roots or the item slot content inside the scroll container instead of the `#item` slot. ✅ One root element per `#item` render.
- ❌ Calling `scrollToIndex` before mount or while the component isn't sized. ✅ Call in `onMounted`/after layout (or via `ssrRange`/`initialScrollIndex`).
- ❌ Assuming the native scrollbar is replaced without opting in. ✅ Native bar stays unless scaled content, `virtualScrollbar`, or a `#scrollbar` slot is used.
- ❌ Mutating item sizes externally without telling the library → stale offsets. ✅ Use `refresh()` or `updateItemSizes([{ index, inlineSize, blockSize }])`.
- ❌ Styling `--vs-scrollbar-*` CSS variables and expecting a custom `#scrollbar` slot to honor them. ✅ Those vars style only the default scrollbar; a slot replaces it entirely.
- ❌ Forgetting the scroll container needs a bounded height (fixed list mode) or that sticky/`ssrRange` combos need matching client/server item markup.
