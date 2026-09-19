/**
 * Build-time flag replaced by the bundler.
 *
 * `true` while building the lean `./core` entry, `false` for the full entry. It
 * is undefined outside a build (dev server, tests), which the `typeof` guard in
 * `VirtualScroll.vue` reads as `false`.
 */

declare const __VS_CORE_BUILD__: boolean;
