<script setup lang="ts">
// Static comparison page - no virtual scroll involved.
import { CONTENDERS_MEASURED_ON, OURS_RELEASED, OURS_VERSION, SIZES } from '#/lib/compare-sizes';

type ContenderKey = 'ours' | 'vvs' | 'tanstack' | 'virtua' | 'vueuc' | 'vvsl' | 'vlist' | 'cerious';

/** Feature-matrix columns: the key the score uses, and the two-line header for the narrow column. */
const CONTENDERS: { key: ContenderKey; head: [ string, string? ]; }[] = [
  {
    key: 'ours',
    head: [ '@pdanpdan', '/virtual-scroll' ],
  },
  {
    key: 'vvs',
    head: [ 'vue-virtual-', 'scroller' ],
  },
  {
    key: 'tanstack',
    head: [ '@tanstack', '/vue-virtual' ],
  },
  {
    key: 'virtua',
    head: [ 'virtua' ],
  },
  {
    key: 'vueuc',
    head: [ 'vueuc' ],
  },
  {
    key: 'vvsl',
    head: [ 'vue-virtual-', 'scroll-list' ],
  },
  {
    key: 'vlist',
    head: [ 'vlist' ],
  },
  {
    key: 'cerious',
    head: [ '@ceriousdevtech/', 'vue-cerious-scroll' ],
  },
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
  { label: 'Two-dimensional grid', weight: 3, cells: '✅❌🟠✅❌❌🟠❌' },
  { label: 'Window (page) scrolling', weight: 2, cells: '✅❌✅✅❌✅✅❌' },
  { label: 'Native scroll container (browser wheel/touch physics)', weight: 2, cells: '✅✅✅✅✅✅✅❌' },
  { label: 'Fixed item sizes', weight: 1, cells: '✅✅✅✅✅✅✅✅' },
  { label: 'Measured dynamic item sizes', weight: 2, cells: '✅✅✅✅✅🟠✅✅' },
  { label: 'Measured rows without size estimates (no default-size first paint)', weight: 2, cells: '❌❌❌❌❌❌❌✅' },
  { label: 'RTL', weight: 2, cells: '✅❌🟠✅❌❌🟠❌' },
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
  { label: 'Masonry layout (one scroll container)', weight: 3, cells: '✅❌❌✅❌❌✅✅' },
  { label: 'Real table rows in flow + auto-size columns', weight: 3, cells: '✅🟠❌❌❌❌❌✅' },
  { label: 'Index-only lists (no per-row data objects)', weight: 2, cells: '✅❌✅❌❌❌❌✅' },
  {
    label: 'Custom item identity keys',
    weight: 1,
    code: 'getItemKey / getKey',
    cells: '❌❌✅✅❌❌❌❌',
  },
  { label: 'Automatic ARIA roles & item indices', weight: 2, cells: '✅❌❌❌❌❌✅❌' },
  { label: 'Official siblings for other frameworks (React, Solid, …)', weight: 1, cells: '❌❌✅✅❌❌✅✅' },
  { label: 'TypeScript', weight: 1, cells: '✅✅✅✅✅❌✅✅' },
];

/** The rows with the symbols split, so the matrix can pick a column. */
const MATRIX = FEATURES.map((feature) => ({
  ...feature,
  cells: [ ...feature.cells ],
}));

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

/** A size in kB, always with one decimal. */
const kB = (value: number) => value.toFixed(1);

/** A size as the table prints it. */
const sizeCell = (size: { min: number; gz: number; }) => `${ kB(size.min) } / ${ kB(size.gz) } kB`;

/** Points, or points bought by a size gap, per kB gzip. */
const perKb = (points: number, kb: number) => (points / kb).toFixed(1);
</script>

<template>
  <div class="app-card p-4 @4xl:p-8 mb-8">
    <h1 class="text-2xl @4xl:text-4xl font-bold text-primary">Virtual Scroll Comparison</h1>
    <p class="text-sm @4xl:text-base opacity-70 mt-2 max-w-4xl">
      <code>@pdanpdan/virtual-scroll</code> and seven other Vue 3 virtualization libraries.
      Versions, publish dates, star counts and bundle sizes were checked on
      {{ CONTENDERS_MEASURED_ON }}. This package's row is measured from its build on every docs build.
    </p>
  </div>

  <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-10">
    <p>
      This page compares the Vue 3 packages that virtualize lists and grids: which features each one
      includes, what an entry costs in bytes, and how the APIs differ. The feature matrix is the only
      place where a support level is stated.
    </p>
    <p>
      The table covers this package, <code>vue-virtual-scroller</code>, <code>@tanstack/vue-virtual</code>,
      <code>virtua</code>, <code>vueuc</code>, <code>vue-virtual-scroll-list</code>,
      <code>@ceriousdevtech/vue-cerious-scroll</code> and <code>vlist</code>.
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
          <td class="whitespace-nowrap"><code>{{ OURS_VERSION }}</code></td>
          <td class="whitespace-nowrap">{{ OURS_RELEASED }}</td>
          <td class="whitespace-nowrap">13</td>
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.oursFull) }}</td>
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
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.oursCore) }}</td>
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
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.oursComposable) }}</td>
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
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.oursHeadlessWired) }}</td>
          <td class="whitespace-nowrap">
            {{ ENTRY_SCORES.headlessWired }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percent(ENTRY_SCORES.headlessWired) }})</span>
          </td>
          <td>Engine + the measurement, keyboard and scrollbar composables</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vue-virtual-scroller</td>
          <td class="whitespace-nowrap"><code>3.0.5</code></td>
          <td class="whitespace-nowrap">2026-08-12</td>
          <td class="whitespace-nowrap">10,795</td>
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.vvs) }}</td>
          <td class="whitespace-nowrap">{{ scoreFor('vvs') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('vvs') }})</span></td>
          <td>Components (Scroller, RecycleScroller, DynamicScroller, TableScroller)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">@tanstack/vue-virtual</td>
          <td class="whitespace-nowrap"><code>3.13.50</code></td>
          <td class="whitespace-nowrap">2026-10-29</td>
          <td class="whitespace-nowrap">7,177 <span class="opacity-60 block">(monorepo)</span></td>
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.tanstack) }}</td>
          <td class="whitespace-nowrap">{{ scoreFor('tanstack') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('tanstack') }})</span></td>
          <td>Headless composable (<code>useVirtualizer</code>)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">virtua</td>
          <td class="whitespace-nowrap"><code>0.54.0</code></td>
          <td class="whitespace-nowrap">2026-10-27</td>
          <td class="whitespace-nowrap">3,755</td>
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.virtua) }}</td>
          <td class="whitespace-nowrap">{{ scoreFor('virtua') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('virtua') }})</span></td>
          <td>Components (VList, VGrid, VMasonry) + handle</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vueuc</td>
          <td class="whitespace-nowrap"><code>0.4.66</code></td>
          <td class="whitespace-nowrap">2026-08-19</td>
          <td class="whitespace-nowrap">309</td>
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.vueuc) }}</td>
          <td class="whitespace-nowrap">{{ scoreFor('vueuc') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('vueuc') }})</span></td>
          <td>Component (VVirtualList)</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vue-virtual-scroll-list</td>
          <td class="whitespace-nowrap"><code>2.3.5</code></td>
          <td class="whitespace-nowrap">2023-05-29</td>
          <td class="whitespace-nowrap">4,495</td>
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.vvsl) }}</td>
          <td class="whitespace-nowrap">{{ scoreFor('vvsl') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('vvsl') }})</span></td>
          <td>Component</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">vlist <span class="opacity-50">(+ <code>vlist/vue</code>)</span></td>
          <td class="whitespace-nowrap"><code>3.3.0</code></td>
          <td class="whitespace-nowrap">2026-10-20</td>
          <td class="whitespace-nowrap">18</td>
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.vlistAdapter) }}</td>
          <td class="whitespace-nowrap">{{ scoreFor('vlist') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('vlist') }})</span></td>
          <td>Vanilla core (<code>createVList</code>) + framework entries (<code>vlist/vue</code>), plugins passed per feature</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">↳ <code>vlist/config</code> route</td>
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap" />
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.vlistConfig) }}</td>
          <td class="whitespace-nowrap" />
          <td>The declarative config the deprecated adapters use; it statically imports every plugin</td>
        </tr>
        <tr>
          <td class="font-bold whitespace-nowrap">@ceriousdevtech/vue-cerious-scroll</td>
          <td class="whitespace-nowrap"><code>1.2.0</code></td>
          <td class="whitespace-nowrap">2026-09-21</td>
          <td class="whitespace-nowrap">20</td>
          <td class="whitespace-nowrap">{{ sizeCell(SIZES.cerious) }}</td>
          <td class="whitespace-nowrap">{{ scoreFor('cerious') }} / {{ MAX_SCORE }} <span class="opacity-60">({{ percentFor('cerious') }})</span></td>
          <td>Component + composable</td>
        </tr>
      </tbody>
    </table>
  </div>

  <p class="text-sm opacity-60 mb-12 -mt-6">
    Bundle sizes: each library's entry for rendering a list, tree-shaken,
    dependencies bundled and Vue external - installed from npm at the version listed above and bundled with
    <code>esbuild --bundle --splitting --minify --format=esm --external:vue</code>, gzipped at level 9 and
    reported in kB (1000 bytes). The gzip figure covers the JavaScript and the stylesheet concatenated, so a
    row is what a page using that entry downloads; a dependency's lazy <code>import()</code> is a separate
    chunk and is not counted until the feature that needs it is used. Each number includes the stylesheet
    that entry needs: ours,
    <code>vue-virtual-scroller</code> and <code>vlist</code> (<code>vlist/styles</code>) ship theirs as a
    separate import, while <code>vueuc</code> and <code>vue-cerious-scroll</code> inject
    theirs from JavaScript. For the component libraries that is one component
    (<code>RecycleScroller</code>, <code>VList</code>, <code>VVirtualList</code>, <code>VirtualList</code>,
    <code>CeriousScroll</code>); for
    <code>@tanstack/vue-virtual</code> it is <code>useVirtualizer</code> including the
    <code>@tanstack/virtual-core</code> it depends on, and for <code>vlist</code> it is
    <code>vlist/vue</code>'s <code>useVList</code> over the core, with plugins imported per feature: the
    bare core with its stylesheet is {{ kB(SIZES.vlistBase.gz) }}&nbsp;kB gzip,
    {{ kB(SIZES.vlistBaseScrollbar.gz) }}&nbsp;kB once the scrollbar plugin is added. The declarative
    <code>vlist/config</code> layer the deprecated adapters use statically imports every plugin, so it gets
    its own row at {{ kB(SIZES.vlistConfig.gz) }}&nbsp;kB. <code>virtua</code> is measured from its
    <code>virtua/vue</code> entry, since the package root
    is the React build. Ours is listed entry by entry - the package root with all six built-in extensions,
    the lean
    <code>/core</code> component, the headless <code>useVirtualScroll</code> composable, and that
    composable with the observer, keyboard and scrollbar ones - and each row's
    score counts only the features that entry ships, and it is measured from this package's built
    entry files on every docs build. Every other row is the published version listed, in the snapshot
    from {{ CONTENDERS_MEASURED_ON }}.
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

  <h2 class="docs-prop-header text-secondary">Notes on the Partial Marks</h2>

  <div class="docs-feature-grid mb-12">
    <div class="docs-feature-card">
      <div class="docs-feature-card-body">
        <div class="docs-feature-card-icon">🟠</div>
        <div>
          <div class="docs-feature-card-title text-base">@tanstack/vue-virtual</div>
          <p class="docs-feature-card-description text-sm">
            Headless: it provides the virtualizer and the application writes the markup, so every row
            not listed as ✅ is code you add. A two-axis grid is composed from two virtualizers, RTL is an
            <code>isRtl</code> flag, and scrollbars and snapping are not included. The entry is among the
            smallest here.
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
            <code>VGrid</code> virtualizes both axes and <code>VMasonry</code> covers masonry; its README
            lists sticky headers and keyboard navigation as planned. Window scrolling and measured sizes are
            supported. One codebase serves five frameworks.
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
            Sizes come from an estimate cache (<code>estimate-size</code>) instead of measurement, so
            scrollbar accuracy is approximate. The last release dates from May 2023, the README targets
            Vue 2, and the package ships no TypeScript types.
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
            Infinite loading requires your own scroll listener. The component renders its own scroll
            container, so page scrolling needs a wrapper. Version 3.0 is maintained; the feature set is
            close to the Vue 2 version.
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
            <code>VVirtualList</code> is the list used by Naive UI. The author describes vueuc as a personal
            utility collection, so adopting it means depending on Naive UI's internal packages.
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
            It measures rows and includes masonry and real table layouts. Infinite loading is manual:
            detect the end, append, call <code>updateTotalElements</code> and re-render. It does not use the
            browser scrollport for input: wheel, touch and keyboard are handled on a hidden-overflow host.
            Horizontal lists, grids and sticky headers are listed as future work in its roadmap.
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
            The grid is a single-axis layout: <code>columns</code> and a gap over a vertical list. Snapping
            is part of the carousel plugin. RTL covers vertical lists and tables; horizontal lists throw at
            creation. Prepending holds the visible rows in place only in <code>reverse</code> mode. The table
            renders div rows with resizable columns, and rows must exist as an array. The entry is
            <code>vlist/vue</code> over the core with plugins imported per feature;
            <code>vlist/config</code>, used by the deprecated adapters, imports every plugin and has its own
            row.
          </p>
        </div>
      </div>
    </div>
  </div>

  <h2 class="docs-prop-header text-secondary">When to Choose Each One</h2>

  <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-10">
    <ul class="space-y-4">
      <li>
        <strong>@pdanpdan/virtual-scroll</strong> - the only entry here that combines a two-dimensional
        grid, window scrolling, RTL, sticky headers and keyboard navigation in one component, and the only
        one with a dedicated real-table-flow component. It also ships masonry, and with <code>vlist</code>
        it is one of two entries that virtualize past the browser's maximum element height. Index-only
        rows, ARIA roles, virtual scrollbars and a headless composable with extensions are included. The
        bundle is larger than the single-purpose libraries: {{ kB(SIZES.oursFull.gz) }}&nbsp;kB gzip for
        the package root and {{ kB(SIZES.oursCore.gz) }}&nbsp;kB for the lean <code>/core</code> component.
        The headless engine is {{ kB(SIZES.oursComposable.gz) }}&nbsp;kB,
        {{ kB(SIZES.oursHeadlessWired.gz) }}&nbsp;kB with the observer, keyboard and scrollbar composables,
        and {{ kB(SIZES.oursWired.gz) }}&nbsp;kB with every exported extension. Per kB gzip the
        single-purpose libraries lead (<code>virtua</code>
        {{ perKb(scoreFor('virtua'), SIZES.virtua.gz) }}, <code>@tanstack/vue-virtual</code>
        {{ perKb(scoreFor('tanstack'), SIZES.tanstack.gz) }}). The project is young and has a small
        community.
      </li>
      <li>
        <strong>@ceriousdevtech/vue-cerious-scroll</strong> - the only other entry with real table rows; it
        also includes masonry and keyboard navigation. It is vertical only: no grid, horizontal mode,
        window scrolling, RTL, sticky, snapping, SSR or beyond-max support, and input is handled on a
        hidden-overflow host rather than the browser scrollport. At
        {{ kB(SIZES.cerious.gz) }}&nbsp;kB gzip it is the largest default entry here.
      </li>
      <li>
        <strong>vlist</strong> - a framework-agnostic core with Vue, React, Svelte and Solid entries and
        plugins for grid, masonry, table, tree, groups, selection, search, sortable, snapshots, transition,
        carousel and async data. With plugins imported per feature the core is
        {{ kB(SIZES.vlistBase.gz) }}&nbsp;kB gzip, {{ kB(SIZES.vlistBaseScrollbar.gz) }}&nbsp;kB with the
        scrollbar plugin; document scrolling is a plugin, the custom scrollbar is an overlay, and
        <code>scroll.mode</code> hands a list to a synthetic driver when it passes the browser's size
        limit. It has no two-dimensional grid, no horizontal RTL, no snapping outside the carousel, no
        real table rows and no forward-list prepend anchoring. First released this year.
      </li>
      <li>
        <strong>vue-virtual-scroller</strong> - a conventional component API with a long release history.
        Window scrolling, RTL and two-dimensional layouts are not included.
      </li>
      <li>
        <strong>@tanstack/vue-virtual</strong> - a plain list with full control of the markup, in the
        smallest bundle here. Grid, scrollbar and snapping code is yours to write.
      </li>
      <li>
        <strong>virtua</strong> - small bundles, window scrolling, measured sizes, a two-dimensional grid
        and masonry. Sticky headers and keyboard navigation are planned, not shipped.
      </li>
      <li>
        <strong>vueuc</strong> - <code>VVirtualList</code> is the list used by Naive UI; it is a reasonable
        choice inside that ecosystem.
      </li>
      <li>
        <strong>vue-virtual-scroll-list</strong> - last released in May 2023; sizes are estimates rather
        than measurements.
      </li>
    </ul>
  </div>

  <h2 class="docs-prop-header text-secondary">Bottom Line</h2>

  <div class="docs-feature-card mb-12">
    <div class="docs-feature-card-body">
      <div>
        <p class="docs-feature-card-description text-sm">
          Any of these libraries handles a vertical list with known row sizes. The differences appear with
          a second axis, the page as the scroll container, sticky headers, keyboard support, or lists larger
          than the browser's height limit. The feature matrix shows which entry covers each case, and the
          size columns show what it costs.
        </p>
      </div>
    </div>
  </div>

  <p class="text-xs opacity-50">
    Sources: npm registry, GitHub API and project docs, checked on {{ CONTENDERS_MEASURED_ON }}.
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
