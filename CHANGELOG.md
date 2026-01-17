# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-17

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
