# Changelog

## [0.10.2](https://github.com/pdanpdan/virtual-scroll/compare/v0.10.1...v0.10.2) (2026-03-14)


### Bug Fixes

* corner case where initial content was not initially rendered if screen was resized ([0364b2c](https://github.com/pdanpdan/virtual-scroll/commit/0364b2c712d0a3ccc9367ee80401140f74e895cb))

## [0.10.1](https://github.com/pdanpdan/virtual-scroll/compare/v0.10.0...v0.10.1) (2026-03-02)


### Bug Fixes

* prevent auto scroll on android when snap is enabled ([63b3b2d](https://github.com/pdanpdan/virtual-scroll/commit/63b3b2d123a740fa4659749247821cf56f33dc8a))

# [0.10.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.9.1...v0.10.0) (2026-03-02)


### Bug Fixes

* resolve typechecking and build issues ([911e573](https://github.com/pdanpdan/virtual-scroll/commit/911e57306a9d9b1baef996b8dd7cb55170d4c811))


### Features

* add a new scroll snap mode 'next' ([aff1b4b](https://github.com/pdanpdan/virtual-scroll/commit/aff1b4bc7bd3cc49918a4789be70ad10b8972d73))
* expose handleScrollCorrection and component properties ([47b2b32](https://github.com/pdanpdan/virtual-scroll/commit/47b2b32c2a08e37d5a547a42c3b7ab6ff56fac5a))
* implement modular extension system ([9f48baa](https://github.com/pdanpdan/virtual-scroll/commit/9f48baa7bb374a18d15f488b6ba20b406cb16a83))
* support array-based circular sizing patterns ([57be4e6](https://github.com/pdanpdan/virtual-scroll/commit/57be4e676666dd06e63e71ee6d5ed9c0da9e6b0f))
* use smooth scrolling for final snap scroll ([f54eb57](https://github.com/pdanpdan/virtual-scroll/commit/f54eb57fd106aac365059fbcca8c101d672d7557))

## [0.9.1](https://github.com/pdanpdan/virtual-scroll/compare/v0.9.0...v0.9.1) (2026-03-01)


### Performance Improvements

* internal optimization for sticky items ([b90b40b](https://github.com/pdanpdan/virtual-scroll/commit/b90b40bbf87e429c4b7f7794aa68e15d403b9da0))

# [0.9.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.8.0...v0.9.0) (2026-02-18)


### Bug Fixes

* **tests:** resolve event target mismatches and stabilize scroll snap timing ([522d003](https://github.com/pdanpdan/virtual-scroll/commit/522d003950b953c84067789fc9a4b77b67fbc7e3))


### Features

* **changelog:** support basic markdown formatting in changelog items ([a144263](https://github.com/pdanpdan/virtual-scroll/commit/a144263172a9902eb0d8c1ec7517475b94387cec))
* **core:** allow optional indices in scrollToIndex and simplify scroll utilities ([08a5ec5](https://github.com/pdanpdan/virtual-scroll/commit/08a5ec5ed101d13d486867849dd5d6ad3ded65ae))
* **navigation:** ensure PageUp/PageDown respect snap mode ([ee5b7fb](https://github.com/pdanpdan/virtual-scroll/commit/ee5b7fb8e2103c470f1497a54e31b66f35103d4d))
* **navigation:** improve PageUp/PageDown behavior by using scrollToIndex with snapping ([34ce83f](https://github.com/pdanpdan/virtual-scroll/commit/34ce83fa3e14cb68eec14c4d8463b01c0a1262b6))
* **playground:** hide dev-only settings when not viewing an example page ([898a610](https://github.com/pdanpdan/virtual-scroll/commit/898a6109d3b5e4038e31f6226188ef2f8d8cce64))

# [0.8.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.7.0...v0.8.0) (2026-02-07)


### Features

* use lightningcss with profile widely-available to compile css ([ed05e47](https://github.com/pdanpdan/virtual-scroll/commit/ed05e4777af04ecb6b98ffdd31c681a1a2b16a86))

# [0.7.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.6.1...v0.7.0) (2026-02-03)


### Bug Fixes

* **docs:** revert optimization for class names (tailwind :) ) ([c10683e](https://github.com/pdanpdan/virtual-scroll/commit/c10683e2aa3695f5d64e9360c7741cc084283347))


### Features

* **playground:** enhance accessibility across all examples ([850aec7](https://github.com/pdanpdan/virtual-scroll/commit/850aec7c746ea37df4c175d84415f296737cc09c))
* **virtual-scroll:** implement comprehensive ARIA support ([fb8d464](https://github.com/pdanpdan/virtual-scroll/commit/fb8d464ed2871dd59fa4b920ee91bfa92d5632bd))

## [0.6.1](https://github.com/pdanpdan/virtual-scroll/compare/v0.6.0...v0.6.1) (2026-02-02)

# [0.6.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.5.0...v0.6.0) (2026-02-02)


### Bug Fixes

* **virtual-scroll:** improve sticky logic and axis-specific active states ([ec4cbfd](https://github.com/pdanpdan/virtual-scroll/commit/ec4cbfdf625ddb16e21463d6ba2da400eb9b5c5f))


### Features

* **virtual-scroll:** add universal scrollTo utility and improve element detection ([89c5124](https://github.com/pdanpdan/virtual-scroll/commit/89c51244fecedf81c5e7de332513c0a8c2ee7888))

# [0.5.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.4.0...v0.5.0) (2026-02-01)


### Bug Fixes

* add defensive guards to watchers and safety checks for calculations ([f5da01f](https://github.com/pdanpdan/virtual-scroll/commit/f5da01f17ba51ad7f9b84c3b6fc7c07f10377638))
* **playground:** improve active link scrolling logic in navigation drawer ([468f837](https://github.com/pdanpdan/virtual-scroll/commit/468f8374148c08ae1bb411b4b3561224a14c21a7))


### Features

* add VirtualScrollbar component and useVirtualScrollbar composable ([ef3c183](https://github.com/pdanpdan/virtual-scroll/commit/ef3c1838b7564bfe2d1d747191ff8e17debed6bb))
* code optimization - reduce duplication ([a064de8](https://github.com/pdanpdan/virtual-scroll/commit/a064de868a4ca2241e9c204790e6b7d98a92080c))
* enhance VirtualScroll component with scrollbars and emulated touch ([0937c06](https://github.com/pdanpdan/virtual-scroll/commit/0937c06150366ce7c10308d6a0b0b66743a055a7))
* implement coordinate scaling and RTL support for massive lists ([12799ab](https://github.com/pdanpdan/virtual-scroll/commit/12799aba4d81563b983f28c4af107e1651db3d80))
* remove duplicate code ([1cb985e](https://github.com/pdanpdan/virtual-scroll/commit/1cb985ea430f85c5ee4775af1354723708fed284))
* **virtual-scrollbar:** reorganize props exported by useVirtualScrollbar composable ([2115f3c](https://github.com/pdanpdan/virtual-scroll/commit/2115f3c65eaf96a7cd77ce0c05c7e1c09cb83454))
* **virtual-scroll:** improve SSR visual accuracy and scaling synchronization ([54117ea](https://github.com/pdanpdan/virtual-scroll/commit/54117eaa41627e41f4901554cbf40f1fa7d69fa8))
* **virtual-scroll:** move styles in components layer ([bd153fd](https://github.com/pdanpdan/virtual-scroll/commit/bd153fd90104d8902c30121b8e524e452ba0aea5))

# [0.4.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.3.0...v0.4.0) (2026-01-23)


### Features

* improve scroll logic and add tests ([a66862f](https://github.com/pdanpdan/virtual-scroll/commit/a66862fcb56ef28b87224d91025adaae20e52025))
* refactor virtual scroll logic and enhance DX ([f6ca3f0](https://github.com/pdanpdan/virtual-scroll/commit/f6ca3f091fbaa654a0db78945d61d3ada97f2b29))

# [0.3.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.2.1...v0.3.0) (2026-01-20)


### Features

* add cjs and umb build artifacts ([fa5c046](https://github.com/pdanpdan/virtual-scroll/commit/fa5c046188dbb1dd8596c4b2c98657c74be5dc34))
* enhances dynamic sizing and refresh logic ([a113c83](https://github.com/pdanpdan/virtual-scroll/commit/a113c833ad4f091e8147df231aa00be580641a8b))
* refactors slot handling using `defineSlots` ([fd47f28](https://github.com/pdanpdan/virtual-scroll/commit/fd47f28b74a9f3d8fc152e078e44f88310ead9f8))

## [0.2.1](https://github.com/pdanpdan/virtual-scroll/compare/v0.2.0...v0.2.1) (2026-01-18)


### Bug Fixes

* keyboard scroll clamping should only apply to virtualized direction ([cb3b1b1](https://github.com/pdanpdan/virtual-scroll/commit/cb3b1b1530bb40424ac36ce154a1913f94ce2a51))
* keyboard scroll wrong calculations ([2137c20](https://github.com/pdanpdan/virtual-scroll/commit/2137c2003857f3c95cfcc55129c6f8114aaef3b3))
* prevent keyboard scroll after end of list ([b97dc10](https://github.com/pdanpdan/virtual-scroll/commit/b97dc100194fbf12d2503bb14d8c5f98eb80273a))

# [0.2.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.1.0...v0.2.0) (2026-01-17)


### Features

* create d.ts files for published package ([f5df730](https://github.com/pdanpdan/virtual-scroll/commit/f5df73005206be2a51d84964e40eb8008db91368))

# 0.1.0 (2026-01-17)


### Features

* complete implementation of core and playground ([57d1415](https://github.com/pdanpdan/virtual-scroll/commit/57d14153466d1f58b7f5918de42ddb5c25a7e1ba))

All notable changes to this project will be documented in this file.

## [0.0.1] - 2026-01-17

- Initial project structure with pnpm monorepo.
- Core `@pdanpdan/virtual-scroll` library:
  - `VirtualScroll` component for Vue 3.
  - `useVirtualScroll` composable for custom implementations.
  - Fenwick Tree utility for efficient size calculations.
  - Support for vertical, horizontal, and grid scrolling.
  - Support for dynamic item sizes via `ResizeObserver`.
  - SSR support with `ssrRange`.
  - Sticky items and push-style headers.
  - Full keyboard navigation support (Arrows, PageUp, PageDown, Home, End).
- Comprehensive unit tests for the core library.
- Playground application for demonstrating library features:
  - Vertical and horizontal scrolling examples.
  - Bidirectional grid scrolling with fixed and dynamic sizes.
  - SSR demonstration for grid scrolling.
  - Documentation page with API reference.
  - Advanced feature demonstrations:
    - Chat interface with history loading and scroll restoration.
    - Infinite scrolling (append/prepend) examples.
    - Sticky sections and headers demonstration.
    - Table-based virtual scrolling.
    - Window/Body scroll integration.
