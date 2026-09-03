# Changelog

# [0.13.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.12.0...v0.13.0) (2026-09-03)

### Bug Fixes

* **playground:** accept masonry scroll details in ScrollStatus ([c6c02e5](https://github.com/pdanpdan/virtual-scroll/commit/c6c02e5af3715f7fd99c9509252db59ae3aebacb))
* **playground:** drop native lazy loading from virtualized images ([a929c4c](https://github.com/pdanpdan/virtual-scroll/commit/a929c4cd5bb83533fb9e7f8e57354bfee1d5cad9))
* **virtual-scroll:** anchor scroll targets at the container padding box ([03945c6](https://github.com/pdanpdan/virtual-scroll/commit/03945c6cccd840ef6b059b579697a5806b600e96))
* **virtual-scroll:** opt out of browser scroll anchoring ([7168285](https://github.com/pdanpdan/virtual-scroll/commit/71682859e72363c688a8dca2aecb8c79cd205926))

### Features

* **playground:** add async content pattern example ([e86221d](https://github.com/pdanpdan/virtual-scroll/commit/e86221d534cadac0225d1d64d68b74221e760b33))
* **playground:** add code viewer pattern example ([3686333](https://github.com/pdanpdan/virtual-scroll/commit/3686333d5924f4f1c7d5c1252474a2f6e8e1ef37))
* **playground:** add live streaming pattern example ([13bd896](https://github.com/pdanpdan/virtual-scroll/commit/13bd89661e7541475e9272b77e359c3de2840720))
* **playground:** add log viewer pattern example ([791ffbd](https://github.com/pdanpdan/virtual-scroll/commit/791ffbdc5e1a197fea80189bffc782214aa376c8))
* **playground:** cerious-scroll comparison section and masonry rows ([a7c3463](https://github.com/pdanpdan/virtual-scroll/commit/a7c34632cc59c02427a9776f030f9ad73ecb1ccf))
* **playground:** flow table essential example and regrouped examples ([94f43d2](https://github.com/pdanpdan/virtual-scroll/commit/94f43d28266be2e6c2afe0626b615f46d20a560a))
* **playground:** masonry essential example with measured-heights showcase ([5c9b158](https://github.com/pdanpdan/virtual-scroll/commit/5c9b158898ac93cb0a5f9b441eef459bfc607d00))
* **playground:** masonry example cards on the home page ([a923b27](https://github.com/pdanpdan/virtual-scroll/commit/a923b27dc3fe2e06f4576e42acc82ef869755031))
* **playground:** masonry gallery pattern with bounded image prefetch ([fffd94d](https://github.com/pdanpdan/virtual-scroll/commit/fffd94d3cecc80cadd9edfab75fea8f9f7426117))
* **playground:** masonry renderer in the configurator generator ([7b14689](https://github.com/pdanpdan/virtual-scroll/commit/7b14689129d96b2284adef09e31313b829cd519c))
* **playground:** show live DOM item count in example status ([ed03ff2](https://github.com/pdanpdan/virtual-scroll/commit/ed03ff2ed2e49e7e9bfdb2c70fe4c3d3f967e083))
* **playground:** table renderer in the configurator ([8733c70](https://github.com/pdanpdan/virtual-scroll/commit/8733c705ab162931fb78c72fd6898fac1e799bfe))
* **virtual-scroll:** dedicated VirtualScrollTable and semantic tag props ([ea5b4a2](https://github.com/pdanpdan/virtual-scroll/commit/ea5b4a2f9c3ed34752433d76eee0f77ab14c7d05))
* **virtual-scroll:** masonry column layout module ([66d61ff](https://github.com/pdanpdan/virtual-scroll/commit/66d61ff3fe59147bcd52e2ddc632398d0bd1e743))
* **virtual-scroll:** masonry virtualization in one scroll container ([c8eedf7](https://github.com/pdanpdan/virtual-scroll/commit/c8eedf7e63fd5786e3dae806dfb3089adac2e80f))
* **virtual-scroll:** re-clamp end-anchored scrolls as measurements settle ([a60d79c](https://github.com/pdanpdan/virtual-scroll/commit/a60d79c843042f441c4eaf7c5e470e08153146ed))
* **virtual-scroll:** support sparse index-only items arrays ([a323cbe](https://github.com/pdanpdan/virtual-scroll/commit/a323cbed1d42759a9bc3f2218198ba510c1893e7))

### Performance Improvements

* **virtual-scroll:** drop per-row storage and re-walks for uniform axes ([fdcdb0f](https://github.com/pdanpdan/virtual-scroll/commit/fdcdb0feb225c41e83743148116320a555f4a394))
* **virtual-scroll:** grow Fenwick tree incrementally on resize ([039fa01](https://github.com/pdanpdan/virtual-scroll/commit/039fa01048fa921335198897b03351f071836d7a))

# [0.12.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.11.6...v0.12.0) (2026-09-02)

### Features

* add AGENTS.md for users and update llms.txt ([92d7252](https://github.com/pdanpdan/virtual-scroll/commit/92d725233237485fbb2c2545358f4e1bb6a4f463))

## [0.11.6](https://github.com/pdanpdan/virtual-scroll/compare/v0.11.5...v0.11.6) (2026-09-01)

### Bug Fixes

* guard against reading window on SSR ([c82c762](https://github.com/pdanpdan/virtual-scroll/commit/c82c7629c0f672f5db5a69589b7fe882de75d637))

## [0.11.5](https://github.com/pdanpdan/virtual-scroll/compare/v0.11.4...v0.11.5) (2026-09-01)

### Bug Fixes

* jump to header with sticky headers ([c65ad15](https://github.com/pdanpdan/virtual-scroll/commit/c65ad15c57efe05a78fdbe3ac5b37ef62b53a86b))
* re-sync internal scroll when size changes without scroll event ([f074f5b](https://github.com/pdanpdan/virtual-scroll/commit/f074f5be97bda696060e6fa009039d8791e6e923))
* recalculate item sizes when gap changes in dynamic mode ([0e185d3](https://github.com/pdanpdan/virtual-scroll/commit/0e185d31e5d7db3ac22b75118d81e07e5bc32ccd))

## [0.11.4](https://github.com/pdanpdan/virtual-scroll/compare/v0.11.3...v0.11.4) (2026-08-31)

### Bug Fixes

* account for container padding when positioning virtual scrollbars ([88201e1](https://github.com/pdanpdan/virtual-scroll/commit/88201e18431bc3053cd929893d8d521a569e71f0))
* scroll positioning to bottom while content is still showing ([900797f](https://github.com/pdanpdan/virtual-scroll/commit/900797f9fe10fbbac7e9c5475793c6b3ea1a6da4))
* show the loading slot as soon as loading is trigerred in infinite scroll ([a932f01](https://github.com/pdanpdan/virtual-scroll/commit/a932f01c06c8f6c430a987d0bd5871e32b46d701))

## [0.11.3](https://github.com/pdanpdan/virtual-scroll/compare/v0.11.2...v0.11.3) (2026-08-30)

### Bug Fixes

* do not clamp scroll before the loading slot when scrolling to end ([ceabc86](https://github.com/pdanpdan/virtual-scroll/commit/ceabc86b5f9ee3526896e78356acb8fd47b6ef71))
* keep sticky section headers below the sticky header if it exists ([d5da8bb](https://github.com/pdanpdan/virtual-scroll/commit/d5da8bb4a0ca67170b09df81ef3b47caea4d4f9c))
* scroll while loading new content and pg_up/down scroll for large items ([04f20e2](https://github.com/pdanpdan/virtual-scroll/commit/04f20e2338b22b89ecef61f4a145db4f025b1041))

## [0.11.2](https://github.com/pdanpdan/virtual-scroll/compare/v0.11.1...v0.11.2) (2026-08-30)

### Bug Fixes

* **build:** adapt to changes in vite config to fix location of generated d.ts file ([6a7a85b](https://github.com/pdanpdan/virtual-scroll/commit/6a7a85b1bc7f3fb44fbaa2044aed7fa25effa9ea)), closes [#2](https://github.com/pdanpdan/virtual-scroll/issues/2)

## [0.11.1](https://github.com/pdanpdan/virtual-scroll/compare/v0.11.0...v0.11.1) (2026-07-20)


### Bug Fixes

* dead CSS, doc corrections, expose missing methods ([c921ce8](https://github.com/pdanpdan/virtual-scroll/commit/c921ce83a67aeb27452c77e12db4aad73e302768))

# [0.11.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.10.3...v0.11.0) (2026-05-22)


### Features

* extract scroll inertia, kbd interactions, and observers in composables ([6b68f89](https://github.com/pdanpdan/virtual-scroll/commit/6b68f8923ea4d1bdffc065eecf1b37347f967649))
* **playground:** add side-by-side diff example ([a0d18b0](https://github.com/pdanpdan/virtual-scroll/commit/a0d18b079c84d81f941c1bdd16b549e72a6855fa))

## [0.10.3](https://github.com/pdanpdan/virtual-scroll/compare/v0.10.2...v0.10.3) (2026-03-14)


### Bug Fixes

* initial scroll to bottom ([6f0106f](https://github.com/pdanpdan/virtual-scroll/commit/6f0106f39b00930d0c072ed96f2406ada797bfbf))

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
