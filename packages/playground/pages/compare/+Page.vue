<script setup lang="ts">
// Static comparison page - no virtual scroll involved.

type ContenderKey = 'ours' | 'vvs' | 'tanstack' | 'virtua' | 'vueuc' | 'vvsl' | 'vlist' | 'cerious';

/** Feature-matrix columns: the key the score uses, and the two-line header for the narrow column. */
const CONTENDERS: { key: ContenderKey; head: [ string, string? ]; }[] = [
  { key: 'ours', head: [ '@pdanpdan', '/virtual-scroll' ] },
  { key: 'vvs', head: [ 'vue-virtual-', 'scroller' ] },
  { key: 'tanstack', head: [ '@tanstack', '/vue-virtual' ] },
  { key: 'virtua', head: [ 'virtua' ] },
  { key: 'vueuc', head: [ 'vueuc' ] },
  { key: 'vvsl', head: [ 'vue-virtual-', 'scroll-list' ] },
  { key: 'vlist', head: [ 'vlist' ] },
  { key: 'cerious', head: [ '@ceriousdevtech/', 'vue-cerious-scroll' ] },
];

/** What a support symbol is worth in the feature score. */
const SUPPORT_POINTS: Record<string, number> = { '✅': 1, '🟠': 0.5, '❌': 0 };

interface Feature {
  label: string;
  /** How much of a library the capability is: 3 an engine of its own, 2 a built-in subsystem, 1 table stakes. */
  weight: number;
  /** Trailing detail, rendered in code font. */
  code?: string;
  /** One support symbol per contender, in `CONTENDERS` order. */
  cells: string;
}

/** The feature matrix, the only place a support level is stated. */
const FEATURES: Feature[] = [
  { label: 'Vertical list', weight: 1, cells: '✅✅✅✅✅✅✅✅' },
  { label: 'Horizontal list', weight: 2, cells: '✅✅✅✅❌✅✅❌' },
  { label: 'Two-dimensional grid', weight: 3, cells: '✅❌🟠🟠❌❌🟠❌' },
  { label: 'Window (page) scrolling', weight: 2, cells: '✅❌✅✅❌✅✅❌' },
  { label: 'Native scroll container (browser wheel/touch physics)', weight: 2, cells: '✅✅✅✅✅✅✅❌' },
  { label: 'Fixed item sizes', weight: 1, cells: '✅✅✅✅✅✅✅✅' },
  { label: 'Measured dynamic item sizes', weight: 2, cells: '✅✅✅✅✅🟠✅✅' },
  { label: 'Measured rows without size estimates (no default-size first paint)', weight: 2, cells: '❌❌❌❌❌❌❌✅' },
  { label: 'RTL', weight: 2, cells: '✅❌🟠✅❌❌❌❌' },
  { label: 'Sticky elements / headers', weight: 2, cells: '✅❌❌❌❌❌✅❌' },
  { label: 'Keyboard navigation', weight: 2, cells: '✅❌❌❌❌❌✅✅' },
  { label: 'Scroll snapping', weight: 2, cells: '✅❌🟠❌❌❌🟠❌' },
  { label: 'Custom / virtual scrollbars', weight: 2, cells: '✅❌🟠❌❌❌✅❌' },
  { label: 'Infinite loading', weight: 2, cells: '✅🟠✅✅🟠🟠✅🟠' },
  { label: 'Scroll restoration (prepend)', weight: 2, cells: '✅❌🟠✅❌❌🟠❌' },
  { label: 'Smooth programmatic scroll', weight: 1, cells: '✅✅✅✅✅❌✅❌' },
  { label: 'SSR support', weight: 2, cells: '✅❌✅✅❌❌❌❌' },
  { label: 'Beyond browser max element height', weight: 3, cells: '✅❌❌❌❌❌✅❌' },
  { label: 'Table virtualization', weight: 3, cells: '✅✅🟠🟠❌❌✅✅' },
  { label: 'Masonry layout (one scroll container)', weight: 3, cells: '✅❌❌❌❌❌✅✅' },
  { label: 'Real table rows in flow + auto-size columns', weight: 3, cells: '✅🟠❌❌❌❌❌✅' },
  { label: 'Index-only lists (no per-row data objects)', weight: 2, cells: '✅❌✅❌❌❌🟠✅' },
  { label: 'Custom item identity keys', weight: 1, code: 'getItemKey / getKey', cells: '❌❌✅✅❌❌❌❌' },
  { label: 'Automatic ARIA roles & item indices', weight: 2, cells: '✅❌❌❌❌❌✅❌' },
  { label: 'Official siblings for other frameworks (React, Solid, …)', weight: 1, cells: '❌❌✅✅❌❌✅✅' },
  { label: 'TypeScript', weight: 1, cells: '✅✅✅✅✅❌✅✅' },
];

/** The rows with the symbols split, so the matrix can pick a column. */
const MATRIX = FEATURES.map((feature) => ({ ...feature, cells: [ ...feature.cells ] }));

/** What each weight means, for the matrix tooltips and the legend. */
const WEIGHT_SCALE: Record<number, string> = {
  1: 'table stakes',
  2: 'a built-in subsystem',
  3: 'an engine of its own',
};

/** The most a contender can score: every feature at full weight. */
const MAX_SCORE = FEATURES.reduce((total, feature) => total + feature.weight, 0);

/** A contender's score: each feature counted at its weight, half for a partial one. */
const SCORES = CONTENDERS.map((contender, column) =>
  MATRIX.reduce((score, feature) => score + feature.weight * (SUPPORT_POINTS[ feature.cells[ column ] ?? '' ] ?? 0), 0));

const columnOf = (key: ContenderKey) => CONTENDERS.findIndex((contender) => contender.key === key);
const scoreFor = (key: ContenderKey) => SCORES[ columnOf(key) ] ?? 0;
const percent = (score: number) => `${ Math.round((score / MAX_SCORE) * 100) }%`;
const percentFor = (key: ContenderKey) => percent(scoreFor(key));

/** This package's points per feature, by label, so the entry gaps below can be priced. */
const OUR_POINTS = new Map<string, number>(
  MATRIX.map((feature) => [ feature.label, feature.weight * (SUPPORT_POINTS[ feature.cells[ columnOf('ours') ] ?? '' ] ?? 0) ] as const),
);

/** What the lean `./core` component compiles out (the README's lean build section). */
const CORE_GAPS: string[] = [
  'Sticky elements / headers',
  'Keyboard navigation',
  'Scroll snapping',
  'Custom / virtual scrollbars',
  'Infinite loading',
  'Scroll restoration (prepend)',
];

/** What only the components provide, so no amount of headless wiring reaches it. */
const COMPONENT_GAPS: string[] = [
  'Table virtualization',
  'Masonry layout (one scroll container)',
  'Real table rows in flow + auto-size columns',
  'Automatic ARIA roles & item indices',
];

/** On top of those, what the headless engine leaves to the exported composables and components. */
const HEADLESS_GAPS: string[] = [
  ...CORE_GAPS,
  'Measured dynamic item sizes',
  'Beyond browser max element height',
  ...COMPONENT_GAPS,
];

/** The usual headless setup: the engine plus the observer, keyboard and scrollbar composables. */
const HEADLESS_WIRED_GAPS: string[] = [
  ...CORE_GAPS.filter((label) => label !== 'Keyboard navigation' && label !== 'Custom / virtual scrollbars'),
  'Beyond browser max element height',
  ...COMPONENT_GAPS,
];

/** A row's score: the package's own, less the features that entry does not ship. */
function entryScore(gaps: string[]) {
  return gaps.reduce((score, label) => {
    const points = OUR_POINTS.get(label);
    if (points === undefined) {
      throw new Error(`Unknown feature in an entry gap list: ${ label }`);
    }
    return score - points;
  }, scoreFor('ours'));
}

/** The entries of this package, in the order the table lists them. */
const ENTRY_SCORES = {
  full: scoreFor('ours'),
  core: entryScore(CORE_GAPS),
  composable: entryScore(HEADLESS_GAPS),
  /** The engine with the measurement, keyboard and scrollbar composables a headless build adds. */
  headlessWired: entryScore(HEADLESS_WIRED_GAPS),
  /** The engine with every exported observer, extension and composable wired in by hand. */
  wired: entryScore(COMPONENT_GAPS),
};
</script>

<template>
  <div class="app-card p-4 @4xl:p-8 mb-8">
    <h1 class="text-2xl @4xl:text-4xl font-bold text-primary">Virtual Scroll Comparison</h1>
    <p class="text-sm @4xl:text-base opacity-70 mt-2 max-w-4xl">
      <code>@pdanpdan/virtual-scroll</code> vs. other main Vue 3 virtualization libraries.
      Versions, publish dates and bundle sizes were checked on September 22, 2026.
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
          <th title="✅ 1, 🟠 1/2, ❌ 0 over every feature below">Feature score</th>
          <th>API style</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="font-bold whitespace-nowrap">@pdanpdan/virtual-scroll</td>
          <td class="whitespace-nowrap"><code>2.1.1</code></td>
          <td class="whitespace-nowrap">2026-09-22</td>
          <td class="whitespace-nowrap">12</td>
          <td class="whitespace-nowrap">78.8 / 22.8 kB</td>
          <td class="whitespace-nowrap">
            {{ ENTRY_SCORES.full }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percent(ENTRY_SCORES.full) }})</span>
          </td>
          <td>Component + composables + extensions, plus a lean <code>/core</code> entry</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">↳ <code>/core</code> component</td>
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap">60.0 / 17.3 kB</td>
          <td class="whitespace-nowrap">
            {{ ENTRY_SCORES.core }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percent(ENTRY_SCORES.core) }})</span>
          </td>
          <td />
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">↳ headless composable</td>
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap">32.5 / 10.2 kB</td>
          <td class="whitespace-nowrap">
            {{ ENTRY_SCORES.composable }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percent(ENTRY_SCORES.composable) }})</span>
          </td>
          <td>Engine only - the observers, extensions and keyboard/scrollbar composables are separate imports</td>
        </tr>
        <tr>
          <td class="font-bold">↳ headless + observers, keyboard, scrollbar</td>
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap">41.2 / 13.2 kB</td>
          <td class="whitespace-nowrap">
            {{ ENTRY_SCORES.headlessWired }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percent(ENTRY_SCORES.headlessWired) }})</span>
          </td>
          <td>Engine + the measurement, keyboard and scrollbar composables</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vue-virtual-scroller</td>
          <td class="whitespace-nowrap"><code>3.0.5</code></td>
          <td class="whitespace-nowrap">2026-08-12</td>
          <td class="whitespace-nowrap">10,797</td>
          <td class="whitespace-nowrap">29.3 / 10.7 kB</td>
          <td class="whitespace-nowrap">{{ scoreFor('vvs') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('vvs') }})</span></td>
          <td>Components (Scroller, RecycleScroller, DynamicScroller, TableScroller)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">@tanstack/vue-virtual</td>
          <td class="whitespace-nowrap"><code>3.13.39</code></td>
          <td class="whitespace-nowrap">2026-09-14</td>
          <td class="whitespace-nowrap">7,119 <span class="opacity-60 block">(monorepo)</span></td>
          <td class="whitespace-nowrap">24.7 / 7.5 kB</td>
          <td class="whitespace-nowrap">{{ scoreFor('tanstack') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('tanstack') }})</span></td>
          <td>Headless composable (<code>useVirtualizer</code>)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">virtua</td>
          <td class="whitespace-nowrap"><code>0.52.7</code></td>
          <td class="whitespace-nowrap">2026-09-22</td>
          <td class="whitespace-nowrap">3,748</td>
          <td class="whitespace-nowrap">9.8 / 4.7 kB</td>
          <td class="whitespace-nowrap">{{ scoreFor('virtua') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('virtua') }})</span></td>
          <td>Components (VList, VGrid) + handle</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vueuc</td>
          <td class="whitespace-nowrap"><code>0.4.66</code></td>
          <td class="whitespace-nowrap">2026-08-19</td>
          <td class="whitespace-nowrap">310</td>
          <td class="whitespace-nowrap">24.4 / 9.2 kB</td>
          <td class="whitespace-nowrap">{{ scoreFor('vueuc') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('vueuc') }})</span></td>
          <td>Component (VVirtualList)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vue-virtual-scroll-list</td>
          <td class="whitespace-nowrap"><code>2.3.5</code></td>
          <td class="whitespace-nowrap">2023-05-29</td>
          <td class="whitespace-nowrap">4,505</td>
          <td class="whitespace-nowrap">15.3 / 4.9 kB</td>
          <td class="whitespace-nowrap">{{ scoreFor('vvsl') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('vvsl') }})</span></td>
          <td>Component</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vlist <span class="opacity-50">(+ vlist-vue)</span></td>
          <td class="whitespace-nowrap"><code>2.8.1</code></td>
          <td class="whitespace-nowrap">2026-09-15</td>
          <td class="whitespace-nowrap">17</td>
          <td class="whitespace-nowrap">113.1 / 37.2 kB</td>
          <td class="whitespace-nowrap">{{ scoreFor('vlist') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('vlist') }})</span></td>
          <td>Plugin core (<code>createVList</code>) + Vue adapter (<code>useVList</code>)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">@ceriousdevtech/vue-cerious-scroll</td>
          <td class="whitespace-nowrap"><code>1.2.0</code></td>
          <td class="whitespace-nowrap">2026-09-21</td>
          <td class="whitespace-nowrap">16</td>
          <td class="whitespace-nowrap">101.4 / 27.0 kB</td>
          <td class="whitespace-nowrap">{{ scoreFor('cerious') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('cerious') }})</span></td>
          <td>Component + composable</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="text-sm opacity-60 mb-12 -mt-6">
    Bundle sizes: each library's entry for rendering a list, tree-shaken,
    dependencies bundled and Vue external - installed from npm, bundled with esbuild
    (<code>--minify</code>), minified and gzipped at level 9, reported in kB (1000 bytes). Each number
    includes the stylesheet that entry needs: ours and <code>vue-virtual-scroller</code> ship theirs as a
    separate import, while <code>vueuc</code>, <code>vlist</code> and <code>vue-cerious-scroll</code> inject
    theirs from JavaScript. For the component libraries that is one component
    (<code>RecycleScroller</code>, <code>VList</code>, <code>VVirtualList</code>, <code>VirtualList</code>,
    <code>CeriousScroll</code>); for
    <code>@tanstack/vue-virtual</code> it is <code>useVirtualizer</code> including the
    <code>@tanstack/virtual-core</code> it depends on, and for <code>vlist</code> it is
    <code>vlist-vue</code>'s <code>useVList</code> (2.6.0 over the 2.8.1 core), which through
    <code>vlist/config</code> pulls in every one of its seventeen plugins - building the same list by hand
    from <code>createVList</code> and the plugins is 12.3&nbsp;kB gzip, 14.3&nbsp;kB once the scrollbar plugin
    is added. Ours is listed entry by entry - the package root with all six built-in extensions, the lean
    <code>/core</code> component, the headless <code>useVirtualScroll</code> composable, and that
    composable with the observer, keyboard and scrollbar ones - and each row's
    score counts only the features that entry ships. Every row is the published version listed.
    <code>vue-cerious-scroll</code> bundles its runtime dependency
    (<code>@ceriousdevtech/cerious-scroll</code>) the way a consumer would.
  </p>

  <h2 class="docs-prop-header text-secondary">Feature Matrix</h2>

  <div class="docs-table-container max-sm:max-h-[70svh]">
    <table class="docs-table docs-table--hover table-pin-rows table-pin-cols">
      <thead>
        <tr>
          <th class="w-56 @4xl:w-64">Feature</th>
          <td v-for="contender in CONTENDERS" :key="contender.key" role="columnheader" class="text-center">
            {{ contender.head[0] }}<template v-if="contender.head[1]"><br />{{ contender.head[1] }}</template>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="feature in MATRIX" :key="feature.label">
          <th scope="row" class="font-medium" :title="`${ feature.weight } - ${ WEIGHT_SCALE[ feature.weight ] }`">
            {{ feature.label }}<template v-if="feature.code"> (<code>{{ feature.code }}</code>)</template>
          </th>
          <td v-for="(contender, column) in CONTENDERS" :key="contender.key" class="text-center">
            {{ feature.cells[column] }}
          </td>
        </tr>
      </tbody>
      <tfoot>
        <tr>
          <th scope="row" class="font-medium">
            Feature score <span class="opacity-60">of {{ MAX_SCORE }}</span>
          </th>
          <td v-for="contender in CONTENDERS" :key="contender.key" class="text-center font-medium">
            {{ scoreFor(contender.key) }}
          </td>
        </tr>
      </tfoot>
    </table>
  </div>

  <p class="text-xs opacity-70 mb-12 -mt-6">
    ✅ built-in &nbsp;•&nbsp; 🟠 partial, limited, or requires custom code &nbsp;•&nbsp; ❌ not supported
    <br />
    Feature score weights each feature by how much of a library it is - 3 an engine of its own, 2 a built-in
    subsystem, 1 table stakes - with ✅ counting full weight, 🟠 half and ❌ none, out of {{ MAX_SCORE }}.
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
            <code>setGetItemFn</code> for index-driven rows. Its 37.2&nbsp;kB here is the adapter import:
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
        bundles here - 22.8&nbsp;kB gzip for the package root and 17.3&nbsp;kB for the lean
        <code>/core</code> component, behind only <code>vlist</code> and <code>vue-cerious-scroll</code>.
        The headless engine is 10.2&nbsp;kB at {{ ENTRY_SCORES.composable }} of {{ MAX_SCORE }} points,
        13.2&nbsp;kB at {{ ENTRY_SCORES.headlessWired }} with the observer, keyboard and scrollbar
        composables wired in, and 16.0&nbsp;kB at {{ ENTRY_SCORES.wired }} with every exported extension
        too - 1.9, 1.9 and 2.2 points per kB gzip. Marginal bytes buy the most from the extensions (5.1
        points per kB) and the least from keyboard navigation (1.3), which is why the component entries
        score better per kB than the headless ones. Per kB the small single-purpose libraries still lead
        (<code>virtua</code> 5.3, <code>@tanstack/vue-virtual</code> 3.6) - a ratio nothing with these many
        features can match. At 12 stars it has no community to fall back on.
      </li>
      <li>
        <strong>@ceriousdevtech/vue-cerious-scroll</strong> - the only other Vue entry that ships real
        table rows and masonry layouts (canonical or DOM-measured), with built-in keyboard navigation. It is
        vertical-only - no grid, no horizontal mode, no window scrolling, RTL, sticky, snapping, SSR or
        beyond-browser-max support - and it scrolls on its own hidden-overflow host instead of the
        browser's scrollport. The heaviest per-view code here after <code>vlist</code>
        (27.0&nbsp;kB gzip, its runtime dependency bundled) and at 16 stars it has no community either.
      </li>
      <li>
        <strong>vlist</strong> - the other batteries-included entry, and the closest in scope: a
        framework-agnostic core with official Vue, React, Svelte and Solid adapters, plus plugins for grid,
        masonry, table, tree, groups, selection, search, sortable, snapshots, transition, carousel and async
        data. Its core is the smallest serious one when you import plugins by hand (12.3&nbsp;kB with the
        stylesheet, 14.3&nbsp;kB once the scrollbar plugin is added), the default
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
    Sources: npm registry, GitHub API and project docs, checked on 2026-09-22.
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
