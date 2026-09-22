<script setup lang="ts">
// Static comparison page - no virtual scroll involved.
</script>

<template>
  <div class="app-card p-4 @4xl:p-8 mb-8">
    <h1 class="text-2xl @4xl:text-4xl font-bold text-primary">Virtual Scroll Comparison</h1>
    <p class="text-sm @4xl:text-base opacity-70 mt-2 max-w-4xl">
      <code>@pdanpdan/virtual-scroll</code> vs. other main Vue 3 virtualization libraries.
      Versions, publish dates and bundle sizes were checked on September 20, 2026.
    </p>
  </div>

  <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-10">
    <p>
      Virtual scrolling looks like a solved problem until you need grid mode, window scrolling, or keyboard
      navigation and the library you picked only does one axis with fixed heights. This comparison covers
      Vue 3 packages and what each one ships today.
    </p>
    <p>
      Eight framework libraries made the cut: this one, the veteran <code>vue-virtual-scroller</code>, the headless
      <code>@tanstack/vue-virtual</code>, the small and fast <code>virtua</code>, <code>vueuc</code> (a utility
      collection that happens to include a virtual list), <code>vue-virtual-scroll-list</code>, which is
      here mostly to show what an unmaintained package looks like,
      <code>@ceriousdevtech/vue-cerious-scroll</code>, the component + composable newcomer with measured
      sizes, and <code>vlist</code>, a framework-agnostic core with official adapters and a plugin for
      everything.
    </p>
  </div>

  <h2 class="docs-prop-header text-secondary">The Contenders</h2>

  <div class="docs-table-container">
    <table class="docs-table docs-table--hover">
      <thead>
        <tr>
          <th>Package</th>
          <th>Latest</th>
          <th>Published</th>
          <th>GitHub stars</th>
          <th>Min / gzip</th>
          <th>API style</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold whitespace-nowrap">@pdanpdan/virtual-scroll</td>
          <td><code>2.0.0</code></td>
          <td>2026-09-19</td>
          <td>12</td>
          <td>64.1 / 20.2 kB</td>
          <td>Component + composables + extensions, plus a lean <code>/core</code> entry</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vue-virtual-scroller</td>
          <td><code>3.0.5</code></td>
          <td>2026-08-12</td>
          <td>10,800</td>
          <td>27.1 / 10.0 kB</td>
          <td>Components (Scroller, RecycleScroller, DynamicScroller, TableScroller)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">@tanstack/vue-virtual</td>
          <td><code>3.13.39</code></td>
          <td>2026-09-14</td>
          <td>7,100 (monorepo)</td>
          <td>24.1 / 7.3 kB</td>
          <td>Headless composable (<code>useVirtualizer</code>)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">virtua</td>
          <td><code>0.52.0</code></td>
          <td>2026-09-19</td>
          <td>3,700</td>
          <td>9.5 / 4.6 kB</td>
          <td>Components (VList, VGrid) + handle</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vueuc</td>
          <td><code>0.4.66</code></td>
          <td>2026-08-19</td>
          <td>310</td>
          <td>23.8 / 9.0 kB</td>
          <td>Component (VVirtualList)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vue-virtual-scroll-list</td>
          <td><code>2.3.5</code></td>
          <td>2023-05-29</td>
          <td>4,500</td>
          <td>14.9 / 4.8 kB</td>
          <td>Component</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vlist <span class="opacity-50">(+ vlist-vue)</span></td>
          <td><code>2.8.1</code></td>
          <td>2026-09-15</td>
          <td>17</td>
          <td>101.1 / 34.7 kB</td>
          <td>Plugin core (<code>createVList</code>) + Vue adapter (<code>useVList</code>)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">@ceriousdevtech/vue-cerious-scroll</td>
          <td><code>1.1.5</code></td>
          <td>2026-09-16</td>
          <td>11</td>
          <td>93.2 / 24.5 kB</td>
          <td>Component + composable</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="text-sm opacity-60 mb-12 -mt-6">
    Bundle sizes: the smallest import that renders a list from each package's Vue entry, tree-shaken,
    dependencies bundled and Vue external - installed from npm, bundled with esbuild
    (<code>--minify</code>), gzipped at level 9. For the component libraries that is one component
    (<code>VirtualScroll</code>, <code>RecycleScroller</code>, <code>VList</code>,
    <code>VVirtualList</code>, <code>VirtualList</code>, <code>CeriousScroll</code>); for
    <code>@tanstack/vue-virtual</code> it is <code>useVirtualizer</code> including the
    <code>@tanstack/virtual-core</code> it depends on, and for <code>vlist</code> it is
    <code>vlist-vue</code>'s <code>useVList</code>, which through <code>vlist/config</code> pulls in every one
    of its seventeen plugins - importing the core and plugins by hand instead is 10.2&nbsp;kB gzip for
    the base and 12.2&nbsp;kB with the scrollbar. Ours covers all six built-in extensions; the lean
    <code>/core</code> entry is 15.2&nbsp;kB gzip, and the <code>useVirtualScroll</code> engine alone, for
    writing your own markup, is 10.2&nbsp;kB.
    <code>vue-cerious-scroll</code> bundles its runtime dependency
    (<code>@ceriousdevtech/cerious-scroll</code>) the way a consumer would.
  </p>

  <h2 class="docs-prop-header text-secondary">Feature Matrix</h2>

  <div class="docs-table-container max-sm:max-h-[70svh]">
    <table class="docs-table docs-table--hover table-pin-rows table-pin-cols">
      <thead>
        <tr>
          <th class="w-56 @4xl:w-64">Feature</th>
          <td role="columnheader" class="text-center">@pdanpdan<br />/virtual-scroll</td>
          <td role="columnheader" class="text-center">vue-virtual-<br />scroller</td>
          <td role="columnheader" class="text-center">@tanstack<br />/vue-virtual</td>
          <td role="columnheader" class="text-center">virtua</td>
          <td role="columnheader" class="text-center">vueuc</td>
          <td role="columnheader" class="text-center">vue-virtual-<br />scroll-list</td>
          <td role="columnheader" class="text-center">vlist</td>
          <td role="columnheader" class="text-center">@ceriousdevtech/<br />vue-cerious-scroll</td>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row" class="font-medium">Vertical list</th>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Horizontal list</th>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Two-dimensional grid</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">🟠</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Window (page) scrolling</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Native scroll container (browser wheel/touch physics)</th>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Fixed item sizes</th>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Measured dynamic item sizes</th>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">🟠</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Measured rows without size estimates (no default-size first paint)</th>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">RTL</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Sticky elements / headers</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Keyboard navigation</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Scroll snapping</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Custom / virtual scrollbars</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Infinite loading</th>
          <td class="text-center">✅</td>
          <td class="text-center">🟠</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">🟠</td>
          <td class="text-center">🟠</td>
          <td class="text-center">✅</td>
          <td class="text-center">🟠</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Scroll restoration (prepend)</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Smooth programmatic scroll</th>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">SSR support</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Beyond browser max element height</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Table virtualization</th>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">🟠</td>
          <td class="text-center">🟠</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Masonry layout (one scroll container)</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Real table rows in flow + auto-size columns</th>
          <td class="text-center">✅</td>
          <td class="text-center">🟠</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Index-only lists (no per-row data objects)</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">🟠</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Custom item identity keys (<code>getItemKey</code> / <code>getKey</code>)</th>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Automatic ARIA roles &amp; item indices</th>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">Official siblings for other frameworks (React, Solid, &hellip;)</th>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
        </tr>
        <tr>
          <th scope="row" class="font-medium">TypeScript</th>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
          <td class="text-center">❌</td>
          <td class="text-center">✅</td>
          <td class="text-center">✅</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="text-xs opacity-70 mb-12 -mt-6">
    ✅ built-in &nbsp;•&nbsp; 🟠 partial, limited, or requires custom code &nbsp;•&nbsp; ❌ not supported
  </p>

  <h2 class="docs-prop-header text-secondary">Notes on the Orange Cells</h2>

  <div class="docs-feature-grid mb-12">
    <div class="docs-feature-card">
      <div class="docs-feature-card-body">
        <div class="docs-feature-card-icon">🟠</div>
        <div>
          <div class="docs-feature-card-title text-base">@tanstack/vue-virtual</div>
          <p class="docs-feature-card-description text-sm">
            Headless by design - you own the markup, so everything not listed as ✅ is work you do
            yourself. Grid means composing two virtualizers, RTL is an <code>isRtl</code> flag that its own
            ecosystem describes as partial, and there is no scrollbar or snap logic to borrow. In exchange you
            get the smallest footprint of the serious options and total control.
          </p>
        </div>
      </div>
    </div>
    <div class="docs-feature-card">
      <div class="docs-feature-card-body">
        <div class="docs-feature-card-icon">🟠</div>
        <div>
          <div class="docs-feature-card-title text-base">virtua</div>
          <p class="docs-feature-card-description text-sm">
            The grid is named <code>experimental_VGrid</code>, and its own README still lists sticky
            and keyboard navigation as things it is &ldquo;aiming&rdquo; to support. What is shipped is fast
            and the window-scroll story is good. One codebase for five frameworks, but issues get filed
            against the shared core.
          </p>
        </div>
      </div>
    </div>
    <div class="docs-feature-card">
      <div class="docs-feature-card-body">
        <div class="docs-feature-card-icon">🟠</div>
        <div>
          <div class="docs-feature-card-title text-base">vue-virtual-scroll-list</div>
          <p class="docs-feature-card-description text-sm">
            Sized via an estimate cache (<code>estimate-size</code>), never measured, so scrollbar accuracy is
            approximate. The last release is from May 2023, the README still reads like Vue 2, and there are
            no TypeScript types. Its 4,500 stars are historical.
          </p>
        </div>
      </div>
    </div>
    <div class="docs-feature-card">
      <div class="docs-feature-card-body">
        <div class="docs-feature-card-icon">🟠</div>
        <div>
          <div class="docs-feature-card-title text-base">vue-virtual-scroller</div>
          <p class="docs-feature-card-description text-sm">
            Infinite loading means wiring your own scroll listener. It renders its own scroll container, so
            page scrolling needs a wrapper that reports to it. Solid components, and v3.0 is still actively
            released, but the feature set has stayed roughly the same since the Vue 2 days.
          </p>
        </div>
      </div>
    </div>
    <div class="docs-feature-card">
      <div class="docs-feature-card-body">
        <div class="docs-feature-card-icon">🟠</div>
        <div>
          <div class="docs-feature-card-title text-base">vueuc</div>
          <p class="docs-feature-card-description text-sm">
            VVirtualList powers Naive UI's large lists and it works, but vueuc is an internal utility
            collection - the author's README says: &ldquo;I'm too lazy to write them since I'm the only
            one that uses the library.&rdquo; Adopting it means depending on Naive UI's private parts.
          </p>
        </div>
      </div>
    </div>
    <div class="docs-feature-card">
      <div class="docs-feature-card-body">
        <div class="docs-feature-card-icon">🟠</div>
        <div>
          <div class="docs-feature-card-title text-base">@ceriousdevtech/vue-cerious-scroll</div>
          <p class="docs-feature-card-description text-sm">
            It measures rows and ships masonry and real table layouts, but infinite loading is manual:
            detect the near-end condition in your own handler, append, then call <code>updateTotalElements</code>
            and re-render. It is also the only entry that does not scroll natively: wheel/touch/keyboard
            handling runs on its own hidden-overflow host instead of the browser's scrollport. The ❌s are its
            own roadmap - horizontal virtualization, grids and sticky headers are listed there as future
            work.
          </p>
        </div>
      </div>
    </div>
    <div class="docs-feature-card">
      <div class="docs-feature-card-body">
        <div class="docs-feature-card-icon">🟠</div>
        <div>
          <div class="docs-feature-card-title text-base">vlist</div>
          <p class="docs-feature-card-description text-sm">
            The grid is a single-axis layout - <code>columns</code> and a gap over a vertically
            virtualized list, with no horizontal window, the same shape as <code>virtua</code>'s grid. Snapping
            lives inside the carousel plugin, so a plain list has none. RTL is not implemented: the only RTL
            code in the package throws for horizontal lists in synthetic mode. Prepending data shifts what you
            are looking at - scroll snapshots and the rebuild utility preserve positions across
            navigation and list recreation, not across an insert above the viewport. The table renders div rows
            with resizable columns, not real table rows with content-sized columns. Rows have to exist as an
            array (the examples build <code>Array.from({ length: n })</code>), though the instance exposes
            <code>setGetItemFn</code> for index-driven rows. Its 34.7&nbsp;kB here is the adapter import:
            <code>vlist/config</code> pulls in all seventeen plugins, so the smaller numbers in its docs assume
            importing plugins by hand.
          </p>
        </div>
      </div>
    </div>
  </div>

  <h2 class="docs-prop-header text-secondary">Where Each One Wins</h2>

  <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-10">
    <ul class="space-y-4">
      <li>
        <strong>@pdanpdan/virtual-scroll</strong> - the only option that covers grid, window scrolling,
        RTL, sticky and keyboard navigation on its own, the only one that virtualizes past the browser's
        max element height, and the only Vue library that ships masonry and real table-flow layouts as
        dedicated components (heights from a model or measured from the DOM, single scroll container) on top of a native
        scroll container. Index-only datasets with flat memory, automatic ARIA roles, virtual scrollbars and
        a headless composable + extensions surface round out the picture. It is also one of the larger
        bundles here - 20.2&nbsp;kB gzip for the component, behind only the two APIs that ship their
        whole plugin set, though its lean <code>/core</code> entry drops that to 15.2&nbsp;kB and the engine
        alone is 10.2&nbsp;kB - and at 12 stars it has no community to fall back on.
      </li>
      <li>
        <strong>@ceriousdevtech/vue-cerious-scroll</strong> - the only other Vue entry that ships real
        table rows and masonry layouts (canonical or DOM-measured), with built-in keyboard navigation. It is
        vertical-only - no grid, no horizontal mode, no window scrolling, RTL, sticky, snapping, SSR or
        beyond-browser-max support - and it scrolls on its own hidden-overflow host instead of the
        browser's scrollport. The heaviest per-view code here after <code>vlist</code>
        (24.5&nbsp;kB gzip, its runtime dependency bundled) and at 11 stars it has no community either.
      </li>
      <li>
        <strong>vlist</strong> - the other batteries-included entry, and the closest in scope: a
        framework-agnostic core with official Vue, React, Svelte and Solid adapters, plus plugins for grid,
        masonry, table, tree, groups, selection, search, sortable, snapshots, transition, carousel and async
        data. Its core is the smallest serious one when you import plugins by hand (10.2&nbsp;kB, plus
        1-6&nbsp;kB per plugin), the default
        scrollbar is already an overlay, document scrolling is a plugin, and 1M+ items work through its
        bounded and synthetic scroll modes (the older <code>scale()</code> plugin is now a deprecation stub).
        What it does not have is a second axis, RTL, snapping outside the carousel, real table rows, or
        prepend anchoring - and the adapter path bundles every plugin. As young as this project: first
        release this year, 17 stars.
      </li>
      <li>
        <strong>vue-virtual-scroller</strong> - the safe, boring choice. Ten years of production use,
        active releases, every layout problem already answered on GitHub. You give up window scrolling, RTL and
        anything 2D.
      </li>
      <li>
        <strong>@tanstack/vue-virtual</strong> - when the list is a plain list and you want the smallest
        dependency with the most control. You will write the rest yourself, which is fine for one axis of fixed
        or measured items.
      </li>
      <li>
        <strong>virtua</strong> - the current speed champion with the best cross-framework story. Window
        scrolling and measured sizes work; everything beyond a plain list is still maturing.
      </li>
      <li>
        <strong>vueuc</strong> - only makes sense if you are already on Naive UI.
      </li>
      <li>
        <strong>vue-virtual-scroll-list</strong> - don't start new projects with it.
      </li>
    </ul>
  </div>

  <h2 class="docs-prop-header text-secondary">Bottom Line</h2>

  <div class="docs-feature-card mb-12">
    <div class="docs-feature-card-body">
      <div>
        <p class="docs-feature-card-description text-sm">
          If your list is vertical and your items have known sizes, every current library works - pick by
          bundle size or familiarity. The differences only show up when you need the second axis, the page as
          the scroll container, sticky headers, keyboard support, or lists that outgrow the browser's height
          limit. That is exactly where <code>@pdanpdan/virtual-scroll</code> is positioned, and the trade-off is
          a bigger bundle and a young project. The demos on this site - grid, blog, spreadsheet, tree,
          table flow, masonry - are each a feature the mainstream competitors cannot do without custom
          code. <code>vue-cerious-scroll</code> also ships masonry and real table rows, but stops there
          (vertical only, no native scrollport, no grid, window, RTL or beyond-max support);
          <code>vlist</code> matches the layout plugin list but virtualizes one axis at a time and has no
          RTL.
        </p>
      </div>
    </div>
  </div>

  <p class="text-xs opacity-50">
    Sources: npm registry, GitHub API and project docs, checked on 2026-09-20.
    <a href="https://www.npmjs.com/package/vue-virtual-scroller" target="_blank" rel="noopener" class="link">vue-virtual-scroller</a>
    &nbsp;•&nbsp;
    <a href="https://www.npmjs.com/package/@tanstack/vue-virtual" target="_blank" rel="noopener" class="link">@tanstack/vue-virtual</a>
    &nbsp;•&nbsp;
    <a href="https://www.npmjs.com/package/virtua" target="_blank" rel="noopener" class="link">virtua</a>
    &nbsp;•&nbsp;
    <a href="https://www.npmjs.com/package/vueuc" target="_blank" rel="noopener" class="link">vueuc</a>
    &nbsp;•&nbsp;
    <a href="https://www.npmjs.com/package/vue-virtual-scroll-list" target="_blank" rel="noopener" class="link">vue-virtual-scroll-list</a>
    &nbsp;•&nbsp;
    <a href="https://www.npmjs.com/package/@ceriousdevtech/vue-cerious-scroll" target="_blank" rel="noopener" class="link">@ceriousdevtech/vue-cerious-scroll</a>
    &nbsp;•&nbsp;
    <a href="https://www.npmjs.com/package/vlist" target="_blank" rel="noopener" class="link">vlist</a>
    (<a href="https://vlist.io/docs/adapters#vue" target="_blank" rel="noopener" class="link">Vue adapter</a>)
  </p>
</template>
