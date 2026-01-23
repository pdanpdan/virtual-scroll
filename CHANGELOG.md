# Changelog

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
