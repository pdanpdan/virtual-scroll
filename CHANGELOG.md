# Changelog

# [2.2.0](https://github.com/pdanpdan/virtual-scroll/compare/v2.1.1...v2.2.0) (2026-09-22)

### Features

* **playground:** measure the comparison page instead of transcribing it ([45c2a33](https://github.com/pdanpdan/virtual-scroll/commit/45c2a33345fb36690a91938e933e75f7d9c109eb))

### Performance Improvements

* **virtual-scroll:** cut the keyboard handler's size and per-key allocations ([138dfba](https://github.com/pdanpdan/virtual-scroll/commit/138dfba92fd20215f4763cb855f664ce307ff44b))
* **virtual-scroll:** keep the scrollbar overlay out of the table entries ([c12d0a7](https://github.com/pdanpdan/virtual-scroll/commit/c12d0a7a611af3e9506d9d05f63e006d32e66766))

## [2.1.1](https://github.com/pdanpdan/virtual-scroll/compare/v2.1.0...v2.1.1) (2026-09-22)

### Bug Fixes

* **playground:** cancel the drag events the draggable list leaves to the browser ([e16e0c8](https://github.com/pdanpdan/virtual-scroll/commit/e16e0c81f1bc5f127a198bbee0616e5b0cb59e5b))
* **virtual-scroll:** hide the masonry native scrollbar outright ([cf673c1](https://github.com/pdanpdan/virtual-scroll/commit/cf673c15ef409eeb297491c7022c8230a13eb7b0))
* **virtual-scroll:** repair the snapping axis, the container tag and the lean entry ([8c70380](https://github.com/pdanpdan/virtual-scroll/commit/8c703801f80c17b537863a5f20894f9e816e72a2))

### Performance Improvements

* **playground:** count the scroll-status DOM nodes on range changes, not every scroll frame ([3a50602](https://github.com/pdanpdan/virtual-scroll/commit/3a50602ace5f56543aedc5a6d199455d668ed6af))

# [2.1.0](https://github.com/pdanpdan/virtual-scroll/compare/v2.0.0...v2.1.0) (2026-09-20)

### Bug Fixes

* **playground:** drop the generated buttons that cannot do anything ([2a32684](https://github.com/pdanpdan/virtual-scroll/commit/2a3268429c3a074ac51859a72b425f129ae0fb1f))
* **playground:** generate the changelog data before type-checking ([ccce5da](https://github.com/pdanpdan/virtual-scroll/commit/ccce5da00f67f8a34a336c80a77c1357f91fe712))
* **playground:** let the generated pens call the controls they show ([c7255cc](https://github.com/pdanpdan/virtual-scroll/commit/c7255cc70e4db2ed59f8811b5909430ff2dba413))
* **playground:** pin the generated pens to the library's current version ([cb47962](https://github.com/pdanpdan/virtual-scroll/commit/cb47962d170e614695d4b0c089983587d87ad09d))
* **playground:** route changelog entries into the right groups ([41669d8](https://github.com/pdanpdan/virtual-scroll/commit/41669d8946a5c9b709296d10f73557088a84296b))
* **playground:** size the generated table columns from their content ([f4d3618](https://github.com/pdanpdan/virtual-scroll/commit/f4d36185b9d6e0bcde1bbddf69b4790724b63d20))
* **virtual-scroll:** keep measurement corrections in the container's scroll space ([7de0dfc](https://github.com/pdanpdan/virtual-scroll/commit/7de0dfcbe319184bb3a41048663e057789f3322d))
* **virtual-scroll:** re-measure auto-sized flow columns once item rows render ([d30ac17](https://github.com/pdanpdan/virtual-scroll/commit/d30ac173ead5203337219f998840ceb12448abc4))

### Features

* **playground:** generate the configurator options it advertises ([d74733b](https://github.com/pdanpdan/virtual-scroll/commit/d74733b24d373902011ddd0df944afc8cee20e52))

# [2.0.0](https://github.com/pdanpdan/virtual-scroll/compare/v1.0.0...v2.0.0) (2026-09-19)

* refactor(virtual-scroll)!: move sticky pinning into useStickyExtension ([b3b1217](https://github.com/pdanpdan/virtual-scroll/commit/b3b1217b71453a1d7ee4b0be0e4fb2084bcf2353))

### Bug Fixes

* **playground:** insert a dragged row where the marker is ([93a0ba2](https://github.com/pdanpdan/virtual-scroll/commit/93a0ba288b3b8088b5d1305b029a2b9e18651241))
* **playground:** keep highlighted code from becoming markup ([999d000](https://github.com/pdanpdan/virtual-scroll/commit/999d00010d878ab61e95ff187da4c7269719e330)), closes [#x3C](https://github.com/pdanpdan/virtual-scroll/issues/x3C) [#x3C](https://github.com/pdanpdan/virtual-scroll/issues/x3C)
* **playground:** stop shadowing the built-in Record type ([8bf0bb8](https://github.com/pdanpdan/virtual-scroll/commit/8bf0bb83ed875a629104ed7c4766c90d49a6ed7f))
* **playground:** tile the layout switcher's grid cells ([5c35446](https://github.com/pdanpdan/virtual-scroll/commit/5c354465494007ec1328cb0b242eec0267d183ae))
* **virtual-scroll:** create the live region outside the template ([d209307](https://github.com/pdanpdan/virtual-scroll/commit/d2093074ade8df8601902f438081b4b40c13a159))
* **virtual-scroll:** keep measured content under the pointer during a drag ([3856039](https://github.com/pdanpdan/virtual-scroll/commit/3856039df399a2f6d9030c6a100dcbe96db7bd07))
* **virtual-scroll:** type the exposed active-item members on the instance ([07f6aa6](https://github.com/pdanpdan/virtual-scroll/commit/07f6aa67c8a7afe6b4f4da127753defda3faaf12))

### Features

* **playground:** add a layout switcher example ([5325d37](https://github.com/pdanpdan/virtual-scroll/commit/5325d37ec149ea57cf8878e118e322225f96992d))
* **playground:** generate the active item, load payload and snapshots ([225a4b8](https://github.com/pdanpdan/virtual-scroll/commit/225a4b8737e9bf8ebc12f481e8aa083cb98fa110))
* **virtual-scroll:** accept reactive props in the keyboard composable ([42198c3](https://github.com/pdanpdan/virtual-scroll/commit/42198c32c98b4066c629961c14fbf55c0b556fa1))
* **virtual-scroll:** add the lean ./core entry ([a2036e2](https://github.com/pdanpdan/virtual-scroll/commit/a2036e285a7a70e8cfd954719b722cb5efa966b2))
* **virtual-scroll:** load in the scroll direction and add scroll snapshots ([57b53b3](https://github.com/pdanpdan/virtual-scroll/commit/57b53b3b2c2c2fcf0e7f16419ecf556750a5f38e))
* **virtual-scroll:** track an active item for keyboard navigation ([9a08d0a](https://github.com/pdanpdan/virtual-scroll/commit/9a08d0a0d00b503bf8c44e6e2b0fe9c8a499ec3d))

### BREAKING CHANGES

* sticky pinning now requires `useStickyExtension()`. A
  `useVirtualScroll` consumer that sets `stickyIndices` without the extension keeps
  the layout offsets but no longer keeps the previous sticky item rendered or marks
  items active. `VirtualScroll`, `VirtualScrollTable` and the masonry component
  already wire the extension, so their behaviour is unchanged.

# [1.0.0](https://github.com/pdanpdan/virtual-scroll/compare/v0.13.2...v1.0.0) (2026-09-12)

* refactor(virtual-scroll)!: rename getColIndexAt to getColumnIndexAt ([f16ec72](https://github.com/pdanpdan/virtual-scroll/commit/f16ec72bf0a72a405eac5204f3a85d4ab2af05ab))
* build(virtual-scroll)!: publish the internal entry and the 1.0 metadata ([d91add3](https://github.com/pdanpdan/virtual-scroll/commit/d91add38151bbebc3eedc2ae6ce322dc934e9dc7))
* refactor(virtual-scroll)!: curate the package entry and add the ./internal subpath ([a39fe3a](https://github.com/pdanpdan/virtual-scroll/commit/a39fe3a7708fddcbfa0b4ec82562218f61cc9c33))
* feat(virtual-scroll)!: declare the engine return type and accept reactive props ([cda484f](https://github.com/pdanpdan/virtual-scroll/commit/cda484fa00a901b8b7b72fb43b50e77b6eab0520))
* fix(virtual-scroll)!: align the table's public types with its runtime API ([284c52b](https://github.com/pdanpdan/virtual-scroll/commit/284c52bcd0588427957df7f3bf3276450ec9e66a))

### Bug Fixes

* **playground:** generate the UMD examples during the build ([f10a081](https://github.com/pdanpdan/virtual-scroll/commit/f10a0813ee2d943605d209b9702073058b49f7fa))
* **virtual-scroll:** render valid ARIA roles and scrollbar labels ([0ed0321](https://github.com/pdanpdan/virtual-scroll/commit/0ed0321a6311b4f688613185b8277e7b6c20bade))
* **VirtualScrollMasonry:** resolve the instance id during setup ([b4a70d5](https://github.com/pdanpdan/virtual-scroll/commit/b4a70d50a09fe6a0cacb9bd66697644dfdf9192d))

### Features

* **virtual-scroll:** add ScrollToOffsetOptions for programmatic scrolls ([3504b39](https://github.com/pdanpdan/virtual-scroll/commit/3504b39de676fe149d7d2d273f93b593ef355081))
* **virtual-scroll:** describe the full exposed instance in VirtualScrollInstance ([1287ece](https://github.com/pdanpdan/virtual-scroll/commit/1287ece64aa0543032b51b5b3bfa8c7c4c132dd2))

### BREAKING CHANGES

* `getColIndexAt` is renamed to `getColumnIndexAt` on the engine return,
  `VirtualScrollInstance`, `ExtensionContext.methods` and the keyboard composable
  options.
* `useVirtualScroll` no longer returns `__internalState`. Read the engine refs from
  `ExtensionContext.internalState` in an extension, or type the result as
  `UseVirtualScrollReturn<T>` and use the documented members.
* `VirtualScrollTableComponentProps` no longer declares `containerTag`, `wrapperTag`,
  `itemTag`, `headerTag` or `footerTag` (they never had an effect on the table - use
  `VirtualScroll` when you need custom tags), and `VirtualScrollTableInstance` no
  longer declares `headerTag`/`footerTag`.
* the root entry no longer re-exports the engine internals:

  - the `calculate*` layer (`calculateRange`, `calculateTotalSize`, ...) plus
    `SnapResult`, `displayToVirtual`, `virtualToDisplay`, `isItemVisible`,
    `findPrevStickyIndex` and `resolveSnap`;
  - the DOM scroll helpers (`isWindow`, `isBody`, `isWindowLike`, `isElement`,
    `isScrollableElement`, `scrollTo`, `isScrollToIndexOptions`, `getPaddingX`,
    `getPaddingY`);
  - the sizing layer (`useVirtualScrollSizes`, `UseVirtualScrollSizesProps`);
  - the parameter bags (`RangeParams`, `ColumnRangeParams`, `StickyParams`,
    `ItemPositionParams`, `ItemStyleParams`, `ScrollTargetParams`, `ScrollTargetResult`,
    `TotalSizeParams`).

  Import them from `@pdanpdan/virtual-scroll/internal`, which carries no compatibility
  guarantee. `FenwickTree`, `BROWSER_MAX_SIZE`, the components, the composables, the
  extension contract and the types stay on the root entry.
* Vue `^3.5.0` is now required (`useId` provides the generated container ids);
  installing with 3.0-3.4 fails the peer check.

## [0.13.2](https://github.com/pdanpdan/virtual-scroll/compare/v0.13.1...v0.13.2) (2026-09-10)

### Bug Fixes

* **playground:** install the Playwright browser before e2e runs ([7c5f7c1](https://github.com/pdanpdan/virtual-scroll/commit/7c5f7c19466585d7057b85fbbd51675d6a8fadab))
* **VirtualScrollMasonry:** re-apply re-layout scroll writes the browser clamps ([53fe5ad](https://github.com/pdanpdan/virtual-scroll/commit/53fe5ad907a99c86c010f9f4c8358d81fe17a44b))

## [0.13.1](https://github.com/pdanpdan/virtual-scroll/compare/v0.13.0...v0.13.1) (2026-09-04)

### Bug Fixes

* **VirtualScroll:** autodetect changes in starting scroll position of first item in the list ([e14dd4c](https://github.com/pdanpdan/virtual-scroll/commit/e14dd4c52e86a4385d9ce3e1ae3957c3e0bbb286))

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
