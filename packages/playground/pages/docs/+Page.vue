<script setup lang="ts">
import { DEFAULT_BUFFER, DEFAULT_COLUMN_WIDTH, DEFAULT_ITEM_SIZE } from '@pdanpdan/virtual-scroll';

import AppLogo from '#/components/AppLogo.vue';
import CodeBlock from '#/components/CodeBlock.vue';
</script>

<template>
  <div class="app-header-card">
    <div class="app-header-body">
      <AppLogo class="shrink-0 size-24 hidden @4xl:block drop-shadow-lg" />
      <div>
        <h1 class="text-primary">API Reference</h1>
        <p class="text-base @4xl:text-xl opacity-60 font-medium mt-1">
          Complete documentation for <code>@pdanpdan/virtual-scroll</code>.
        </p>
      </div>
    </div>
  </div>

  <div class="space-y-8">
    <!-- 1. Introduction -->
    <section id="introduction">
      <h2 class="docs-section-header">Introduction</h2>
      <div class="prose prose-sm @4xl:prose-lg max-w-none">
        <p>
          <code>@pdanpdan/virtual-scroll</code> is a high-performance Vue 3 virtual scroll library designed to handle massive lists with ease.
          It supports vertical, horizontal, and bidirectional (grid) scrolling, dynamic item sizes using <code>ResizeObserver</code>,
          and full support for Right-to-Left (RTL) layouts.
        </p>
      </div>
    </section>

    <!-- 1.1 Key Features -->
    <section id="features">
      <h2 class="docs-section-header">Key Features</h2>
      <div class="docs-feature-grid">
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Bidirectional Scrolling</h4>
              <p class="docs-feature-card-description">Virtualize both rows and columns for massive data grids.</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Dynamic Item Sizes</h4>
              <p class="docs-feature-card-description">Automatic measurement via ResizeObserver for precise scrolling.</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">RTL Support</h4>
              <p class="docs-feature-card-description">Automatic direction detection and correct coordinate mapping for RTL layouts.</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Native Window Scroll</h4>
              <p class="docs-feature-card-description">Use the browser window/body as the scroll container.</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Sticky Headers/Footers</h4>
              <p class="docs-feature-card-description">iOS-style pushing headers for segmented lists and groups.</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Scroll Restoration</h4>
              <p class="docs-feature-card-description">Maintains position when prepending items (perfect for chat).</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">SSR & Hydration</h4>
              <p class="docs-feature-card-description">Full support for server-side rendering and client hydration.</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Massive List Support</h4>
              <p class="docs-feature-card-description">Handles 10M+ items via automatic coordinate scaling (except for window/body containers).</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Virtual Scrollbars</h4>
              <p class="docs-feature-card-description">Fully customizable virtual scrollbars that replace native ones.</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Scroll Snapping</h4>
              <p class="docs-feature-card-description">Auto-align items to viewport edges or center (start, center, end, auto).</p>
            </div>
          </div>
        </div>
        <div class="docs-feature-card">
          <div class="docs-feature-card-body">
            <div class="docs-feature-card-icon">✓</div>
            <div>
              <h4 class="docs-feature-card-title">Circular Sizing Patterns</h4>
              <p class="docs-feature-card-description">Pass arrays to define repeating size patterns for items or columns.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Quick Start -->
    <section id="quick-start">
      <h2 class="docs-section-header">Quick Start</h2>
      <div class="prose prose-sm @4xl:prose-md max-w-none">
        <p>Install the package using your favorite package manager:</p>
      </div>
      <CodeBlock class="docs-code-block" code="pnpm add @pdanpdan/virtual-scroll" lang="bash" />
      <div class="prose prose-sm @4xl:prose-md max-w-none mt-4 @4xl:mt-6">
        <p>Basic usage in a Vue component:</p>
      </div>
      <CodeBlock
        class="docs-code-block"
        lang="vue"
        line-numbers
        code="<script setup>
import { VirtualScroll } from &quot;@pdanpdan/virtual-scroll&quot;;
import &quot;@pdanpdan/virtual-scroll/style.css&quot;;

const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Item ${i}` }));
</script>

<template>
<VirtualScroll :items=&quot;items&quot; :item-size=&quot;50&quot; class=&quot;h-96&quot;>
  <template #item=&quot;{ item }&quot;>
    <div class=&quot;h-12 flex items-center px-4 border-b border-base-200&quot;>
      {{ item.name }}
    </div>
  </template>
</VirtualScroll>
</template>"
      />
    </section>

    <!-- 3. Usage Modes -->
    <section id="usage-modes">
      <h2 class="docs-section-header">Usage Modes</h2>
      <div class="docs-usage-grid">
        <div class="docs-usage-card docs-usage-card--primary">
          <div class="docs-usage-card-body">
            <h3 class="docs-usage-card-title docs-usage-card-title--primary">Compiled Component</h3>
            <p class="docs-usage-card-description">Recommended for most projects. Uses pre-compiled JS.</p>
            <CodeBlock
              class="docs-code-block"
              lang="ts"
              code="import { VirtualScroll } from &quot;@pdanpdan/virtual-scroll&quot;;
import &quot;@pdanpdan/virtual-scroll/style.css&quot;;"
            />
            <p />
            <ul class="list-disc ps-5 text-xs @4xl:text-sm space-y-1 opacity-80">
              <li>Compatible with all modern bundlers.</li>
              <li><strong>Note:</strong> Manual CSS import is required.</li>
            </ul>
          </div>
        </div>

        <div class="docs-usage-card docs-usage-card--secondary">
          <div class="docs-usage-card-body">
            <h3 class="docs-usage-card-title docs-usage-card-title--secondary">Original Vue SFC</h3>
            <p class="docs-usage-card-description">Import raw source for custom compilation.</p>
            <CodeBlock
              class="docs-code-block"
              lang="ts"
              code="import VS from &quot;@pdanpdan/virtual-scroll/VirtualScroll.vue&quot;;"
            />
            <p />
            <ul class="list-disc ps-5 text-xs @4xl:text-sm space-y-1 opacity-80">
              <li>Enables better tree-shaking in your build.</li>
              <li>Styles handled by your Vue loader.</li>
            </ul>
          </div>
        </div>

        <div class="docs-usage-card docs-usage-card--accent">
          <div class="docs-usage-card-body">
            <h3 class="docs-usage-card-title docs-usage-card-title--accent">CDN Usage</h3>
            <p class="docs-usage-card-description">Use directly in browser without build step.</p>
            <CodeBlock
              class="docs-code-block"
              lang="html"
              code="&lt;script src=&quot;https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js&quot;&gt;&lt;/script&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;https://cdn.jsdelivr.net/npm/@pdanpdan/virtual-scroll/dist/virtual-scroll.css&quot;&gt;
&lt;script src=&quot;https://cdn.jsdelivr.net/npm/@pdanpdan/virtual-scroll/dist/index.js&quot;&gt;&lt;/script&gt;"
            />
            <p />
            <ul class="list-disc ps-5 text-xs @4xl:text-sm space-y-1 opacity-80 mt-2">
              <li>No installation required.</li>
              <li>Available via <code>window.VirtualScroll</code>.</li>
            </ul>
          </div>
        </div>

        <div class="docs-usage-card docs-usage-card--accent">
          <div class="docs-usage-card-body">
            <h3 class="docs-usage-card-title docs-usage-card-title--accent">CDN Stand-alone Examples</h3>
            <p class="docs-usage-card-description text-xs">Full-page HTML examples loading all dependencies from CDN.</p>
            <div class="flex-1 overflow-auto mt-2">
              <ul class="grid grid-cols-1 @3xl:grid-cols-2 gap-x-4 gap-y-1 text-sm @4xl:text-base">
                <li><a href="/virtual-scroll/umd/index.html" target="_blank" data-vike="false" class="link link-primary font-bold">Main Index</a></li>
                <li><a href="/virtual-scroll/umd/essential-vertical-fixed.html" target="_blank" data-vike="false" class="link">Vertical Fixed</a></li>
                <li><a href="/virtual-scroll/umd/essential-vertical-dynamic.html" target="_blank" data-vike="false" class="link">Vertical Dynamic</a></li>
                <li><a href="/virtual-scroll/umd/essential-horizontal-fixed.html" target="_blank" data-vike="false" class="link">Horizontal Fixed</a></li>
                <li><a href="/virtual-scroll/umd/essential-horizontal-dynamic.html" target="_blank" data-vike="false" class="link">Horizontal Dynamic</a></li>
                <li><a href="/virtual-scroll/umd/essential-grid-fixed.html" target="_blank" data-vike="false" class="link">Grid Fixed</a></li>
                <li><a href="/virtual-scroll/umd/essential-grid-dynamic.html" target="_blank" data-vike="false" class="link">Grid Dynamic</a></li>
                <li><a href="/virtual-scroll/umd/feature-custom-scrollbar.html" target="_blank" data-vike="false" class="link">Custom Scrollbar</a></li>
                <li><a href="/virtual-scroll/umd/feature-infinite-scroll.html" target="_blank" data-vike="false" class="link">Infinite Scroll</a></li>
                <li><a href="/virtual-scroll/umd/feature-sticky-sections.html" target="_blank" data-vike="false" class="link">Sticky Sections</a></li>
                <li><a href="/virtual-scroll/umd/pattern-chat.html" target="_blank" data-vike="false" class="link">Chat Interface</a></li>
                <li><a href="/virtual-scroll/umd/pattern-table.html" target="_blank" data-vike="false" class="link">Semantic Table</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3.1 Extensions -->
    <section id="extensions">
      <h2 class="docs-section-header">Extensions</h2>
      <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
        <p>
          The library uses a highly modular architecture powered by extensions. Extensions can tap into the core lifecycle
          to add features like RTL support, snapping, or custom loading logic without bloating the core engine.
        </p>
      </div>

      <div class="grid grid-cols-1 @4xl:grid-cols-2 gap-4 mb-8">
        <div class="card bg-base-200 p-4 border border-base-content/5">
          <h4 class="font-bold text-primary mb-2">Built-in Extensions</h4>
          <ul class="list-disc ps-5 text-sm space-y-1 opacity-80 text-base-content">
            <li><a href="#use-rtl-extension" class="link"><code>useRtlExtension()</code></a>: Automatic RTL support.</li>
            <li><a href="#use-snapping-extension" class="link"><code>useSnappingExtension()</code></a>: Scroll snapping.</li>
            <li><a href="#use-sticky-extension" class="link"><code>useStickyExtension()</code></a>: Sticky elements.</li>
            <li><a href="#use-infinite-loading-extension" class="link"><code>useInfiniteLoadingExtension()</code></a>: Data loading.</li>
            <li><a href="#use-prepend-restoration-extension" class="link"><code>usePrependRestorationExtension()</code></a>: Position maintenance.</li>
            <li><a href="#use-coordinate-scaling-extension" class="link"><code>useCoordinateScalingExtension()</code></a>: Massive lists.</li>
          </ul>
        </div>

        <div class="card bg-base-200 p-4 border border-base-content/5">
          <h4 class="font-bold text-secondary mb-2">Usage with Composable</h4>
          <p class="text-xs opacity-70 mb-4 text-base-content">When using the low-level <code>useVirtualScroll</code> composable:</p>
          <CodeBlock
            class="docs-code-block font-mono text-[10px]"
            lang="ts"
            code="import {
  useVirtualScroll,
  useRtlExtension,
  useSnappingExtension
} from '@pdanpdan/virtual-scroll';

const vs = useVirtualScroll(props, [
  useRtlExtension(),
  useSnappingExtension()
]);"
          />
        </div>
      </div>
    </section>

    <div class="divider opacity-30" />

    <!-- 4. Sizing Guide -->
    <section id="sizing-guide">
      <h2 class="docs-section-header">Sizing Guide</h2>
      <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-12">
        <p>
          The library offers flexible ways to define item and column sizes. Calculations are optimized based on the type of sizing used.
        </p>
        <div class="docs-table-container mt-4">
          <table class="docs-table">
            <thead>
              <tr>
                <th>Type</th>
                <th><code>itemSize</code> / <code>columnWidth</code></th>
                <th>Perf</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fixed</strong></td>
                <td><code>number</code></td>
                <td><span class="badge badge-success badge-soft badge-xs">Best</span></td>
                <td>Uniform size for all items. Calculations are <em>O(1)</em>.</td>
              </tr>
              <tr>
                <td><strong>Array (Circular Pattern)</strong></td>
                <td><code>number[]</code></td>
                <td><span class="badge badge-info badge-soft badge-xs">Great</span></td>
                <td>Repeating size patterns from array (e.g. <code>[50, 100]</code>). <em>O(log n)</em>.</td>
              </tr>
              <tr>
                <td><strong>Function</strong></td>
                <td><code>(item, idx) => number</code></td>
                <td><span class="badge badge-warning badge-soft badge-xs">Good</span></td>
                <td>Known but variable sizes. No <code>ResizeObserver</code> overhead unless measured size differs.</td>
              </tr>
              <tr>
                <td><strong>Dynamic</strong></td>
                <td><code>0</code>, <code>null</code>, <code>undefined</code></td>
                <td><span class="badge badge-neutral badge-soft badge-xs">Fair</span></td>
                <td>Sizes measured via <strong>ResizeObserver</strong> after rendering.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <div class="divider opacity-30" />

    <!-- 5. VirtualScroll Component -->
    <section id="virtual-scroll">
      <h2 class="docs-section-header">VirtualScroll Component</h2>
      <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
        <p>
          The <code>VirtualScroll</code> component is the primary way to use this library. It provides a declarative Vue interface
          for virtualizing large lists and grids, handling all rendering, recycling, and scroll logic automatically.
        </p>
      </div>

      <h3 id="props" class="docs-prop-header text-primary">Props</h3>

      <h4 class="docs-prop-subheader">Core Configuration</h4>
      <div class="docs-table-container mb-8 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th class="w-1/4">Prop</th>
              <th class="w-1/4">Type</th>
              <th class="w-1/6">Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code class="docs-prop-name">items</code></td>
              <td><code>T[]</code></td>
              <td>-</td>
              <td>The array of items to render. Required.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">itemSize</code></td>
              <td><code>num | arr | fn | null</code></td>
              <td><code>{{ DEFAULT_ITEM_SIZE }}</code></td>
              <td>Fixed size, circular array pattern, or function. See <a href="#sizing-guide" class="link">Sizing Guide</a>.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">direction</code></td>
              <td><code>'vertical' | 'horizontal' | 'both'</code></td>
              <td><code>'vertical'</code></td>
              <td>The scroll direction.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">gap</code></td>
              <td><code>number</code></td>
              <td><code>0</code></td>
              <td>Spacings between items (vertical or horizontal).</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 class="docs-prop-subheader">Grid Configuration <span class="text-xs normal-case opacity-60">(only for direction="both")</span></h4>
      <div class="docs-table-container mb-8 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th class="w-1/4">Prop</th>
              <th class="w-1/4">Type</th>
              <th class="w-1/6">Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code class="docs-prop-name">columnCount</code></td>
              <td><code>number</code></td>
              <td><code>0</code></td>
              <td>Number of columns for grid mode.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">columnWidth</code></td>
              <td><code>num | arr | fn | null</code></td>
              <td><code>{{ DEFAULT_COLUMN_WIDTH }}</code></td>
              <td>Width for columns in grid mode (supports fixed, array pattern, or function).</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">columnGap</code></td>
              <td><code>number</code></td>
              <td><code>0</code></td>
              <td>Spacings between columns.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 class="docs-prop-subheader">Features & Behavior</h4>
      <div class="docs-table-container mb-8 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th class="w-1/4">Prop</th>
              <th class="w-1/4">Type</th>
              <th class="w-1/6">Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code class="docs-prop-name">stickyIndices</code></td>
              <td><code>number[]</code></td>
              <td><code>[]</code></td>
              <td>Indices of items that should remain sticky. When <code>stickyHeader</code>/<code>stickyFooter</code> are enabled, they stick below/above them.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">stickyHeader</code> / <code class="docs-prop-name">stickyFooter</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>If true, header/footer size is measured and added to padding. Sticky <code>stickyIndices</code> items align below/above them.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">ssrRange</code></td>
              <td><code>{start, end, ...}</code></td>
              <td>-</td>
              <td>Range of items to pre-render. See <a href="#ssr-support" class="link">SSR Support</a>.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">loading</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Shows <code>#loading</code> slot and prevents multiple <code>load</code> events.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">loadDistance</code></td>
              <td><code>number</code></td>
              <td><code>200</code></td>
              <td>Distance from end to trigger <code>load</code> event.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">snap</code></td>
              <td><code>bool | <a href="#snap-modes" class="link link-primary">SnapMode</a></code></td>
              <td><code>false</code></td>
              <td>Automatically align to nearest item after scroll stops. See <a href="#snap-modes" class="link link-primary font-bold">SnapMode</a>.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">virtualScrollbar</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Whether to force use of virtual scrollbars. Automatically enabled for massive lists. <strong>Note:</strong> Disabled when using <code>window/body</code> as container.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">restoreScrollOnPrepend</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Maintain scroll position when items are added to the top.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">initialScrollIndex</code></td>
              <td><code>number</code></td>
              <td>-</td>
              <td>Index to jump to on mount.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">initialScrollAlign</code></td>
              <td><code><a href="#alignments" class="link link-primary">ScrollAlignment</a> | <a href="#scroll-alignment-options" class="link link-primary">Options</a></code></td>
              <td><code>'start'</code></td>
              <td>Alignment for initial index.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h4 class="docs-prop-subheader">Accessibility</h4>
      <div class="docs-table-container mb-8 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th class="w-1/4">Prop</th>
              <th class="w-1/4">Type</th>
              <th class="w-1/6">Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code class="docs-prop-name">role</code></td>
              <td><code>string</code></td>
              <td><code>'list' | 'grid'</code></td>
              <td>ARIA role for the container. Automatically detected based on direction.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">ariaLabel</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>Accessible label for the scroll container.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">ariaLabelledby</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>ID of the element that labels the scroll container.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">itemRole</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>ARIA role for each item. Set to <code>'none'</code> to manually apply roles using <code>getItemAriaProps</code>.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="accessibility" class="docs-prop-header">Accessibility (ARIA)</h3>
      <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
        <p>The component automatically manages ARIA roles and attributes to ensure screen readers can navigate virtualized content. Common roles like <code>tree</code>, <code>listbox</code>, and <code>menu</code> are also supported.</p>
        <div class="docs-table-container">
          <table class="docs-table">
            <thead><tr><th>Role Prop</th><th>Default Item Role</th><th>Behavior</th></tr></thead>
            <tbody>
              <tr><td><code>list</code> (default)</td><td><code>listitem</code></td><td>Standard 1D list.</td></tr>
              <tr><td><code>grid</code></td><td><code>row</code></td><td>2D data grid or table.</td></tr>
              <tr><td><code>tree</code></td><td><code>treeitem</code></td><td>Hierarchical structure.</td></tr>
              <tr><td><code>listbox</code></td><td><code>option</code></td><td>Selectable list.</td></tr>
              <tr><td><code>menu</code></td><td><code>menuitem</code></td><td>Navigation menu.</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <h4 class="docs-prop-subheader text-primary">ScrollAlignment</h4>
      <div class="prose prose-sm mb-4 text-base-content/70">
        <p>Controls the item's final position in the viewport: <code>'start' | 'center' | 'end' | 'auto'</code>.</p>
      </div>

      <h4 class="docs-prop-subheader">Advanced & Performance</h4>
      <div class="docs-table-container mb-8 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th class="w-1/4">Prop</th>
              <th class="w-1/4">Type</th>
              <th class="w-1/6">Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code class="docs-prop-name">container</code></td>
              <td><code>El | Window | null</code></td>
              <td><code>undefined</code></td>
              <td>The scrollable container. Defaults to component root.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">scrollPaddingStart</code> / <code class="docs-prop-name">End</code></td>
              <td><code>num | {x, y}</code></td>
              <td><code>0</code></td>
              <td>Additional padding for scroll offsets.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">containerTag</code> / <code class="docs-prop-name">wrapperTag</code> / <code class="docs-prop-name">itemTag</code></td>
              <td><code>string</code></td>
              <td><code>'div'</code></td>
              <td>HTML tags for different parts of the component.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">bufferBefore</code> / <code class="docs-prop-name">bufferAfter</code></td>
              <td><code>number</code></td>
              <td><code>{{ DEFAULT_BUFFER }}</code></td>
              <td>Number of items to render outside the viewport.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">defaultItemSize</code></td>
              <td><code>number</code></td>
              <td><code>{{ DEFAULT_ITEM_SIZE }}</code></td>
              <td>Estimated size for items before measurement.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">defaultColumnWidth</code></td>
              <td><code>number</code></td>
              <td><code>{{ DEFAULT_COLUMN_WIDTH }}</code></td>
              <td>Estimated width for columns before measurement.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">debug</code></td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
              <td>Enables debug mode (visible offsets and indices).</td>
            </tr>
          </tbody>
        </table>
        <div class="mt-4 text-xs opacity-60">
          * For a full list of props including advanced configuration, see the <a href="#virtual-scroll-props" class="link link-primary">VirtualScrollProps interface</a>.
        </div>
      </div>

      <h3 id="slots" class="docs-prop-header docs-prop-header--accent">Slots</h3>
      <div class="grid grid-cols-1 @4xl:grid-cols-2 gap-4 mb-10">
        <div class="docs-card docs-card--accent">
          <h4 class="font-bold text-accent mb-2">#item</h4>
          <p class="text-xs @4xl:text-sm opacity-90 mb-2">Scoped slot for individual items.</p>
          <ul class="text-xs opacity-80 list-disc ps-5 space-y-1 text-base-content/80">
            <li><code>item: T</code>: The data item from the source array.</li>
            <li><code>index: number</code>: The original 0-based index of the item.</li>
            <li><code>isSticky: boolean</code>: <code>true</code> if the item is configured to be sticky via <code>stickyIndices</code>.</li>
            <li><code>isStickyActive: boolean</code>: <code>true</code> if the item is currently stuck at the threshold.</li>
            <li><code>isStickyActiveX / Y: boolean</code>: <code>true</code> if the item is stuck at the horizontal/vertical threshold.</li>
            <li><code>offset: { x, y }</code>: Calculated physical position (DU).</li>
            <li><code>columnRange: <a href="#column-range" class="link link-accent">ColumnRange</a></code>: Precise indices and paddings for visible columns.</li>
            <li><code>getColumnWidth: (index: number) => number</code>: Helper to get the calculated width of any column.</li>
            <li><code>getItemAriaProps: (index: number) => object</code>: Helper to get ARIA attributes for an item (e.g. <code>role="listitem"</code>, <code>aria-posinset</code>).</li>
            <li><code>getCellAriaProps: (index: number) => object</code>: Helper to get ARIA attributes for a cell (e.g. <code>role="gridcell"</code>, <code>aria-colindex</code>).</li>
            <li><code>gap: number</code>: Vertical gap between items.</li>
            <li><code>columnGap: number</code>: Horizontal gap between columns.</li>
          </ul>
        </div>
        <div class="docs-card docs-card--accent">
          <h4 class="font-bold text-accent mb-2">#scrollbar</h4>
          <p class="text-xs @4xl:text-sm opacity-90 mb-2">Scoped slot for custom scrollbar implementation.</p>
          <ul class="text-xs opacity-80 list-disc ps-5 space-y-1 text-base-content/80">
            <li><code>axis: 'vertical' | 'horizontal'</code>: The scrollbar axis.</li>
            <li><code>positionPercent: number</code>: Current scroll position (0 to 1).</li>
            <li><code>viewportPercent: number</code>: Viewport as percentage of total size.</li>
            <li><code>thumbSizePercent: number</code>: Calculated thumb size (0 to 100).</li>
            <li><code>thumbPositionPercent: number</code>: Calculated thumb position (0 to 100).</li>
            <li><code>trackProps: object</code>: <a href="#scrollbar-slot-props" class="link link-accent">Attributes and listeners</a> for the track element.</li>
            <li><code>thumbProps: object</code>: <a href="#scrollbar-slot-props" class="link link-accent">Attributes and listeners</a> for the thumb element.</li>
            <li><code>isDragging: boolean</code>: Whether the thumb is currently being dragged.</li>
            <li>
              <code>scrollbarProps: object</code>: Grouped properties for <code>VirtualScrollbar</code>.
              <ul class="list-disc ps-5 mt-1">
                <li><code>axis: 'vertical' | 'horizontal'</code></li>
                <li><code>totalSize: number</code></li>
                <li><code>position: number</code></li>
                <li><code>viewportSize: number</code></li>
                <li><code>scrollToOffset: (offset: number) => void</code></li>
                <li><code>containerId: string</code></li>
                <li><code>isRtl: boolean</code></li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="docs-card docs-card--accent">
          <h4 class="font-bold text-accent mb-2">#header / #footer</h4>
          <p class="text-xs @4xl:text-sm opacity-90">Content rendered above/below the virtualized items. Can be made sticky using the <code>stickyHeader</code> / <code>stickyFooter</code> props.</p>
        </div>
        <div class="docs-card docs-card--accent">
          <h4 class="font-bold text-accent mb-2">#loading</h4>
          <p class="text-xs @4xl:text-sm opacity-90">Always rendered when provided — hidden via the <code>virtual-scroll-loading--hidden</code> class (<code>visibility: hidden</code>) while <code>loading</code> is false — so it reserves its space and the <code>End</code> key can include its size in the scroll target. Prevents redundant <code>load</code> events.</p>
        </div>
      </div>

      <section id="scrollbar-slot-props" class="mb-12">
        <h4 class="docs-prop-subheader text-accent">ScrollbarSlotProps</h4>
        <div class="prose prose-sm max-w-none mb-4 opacity-80 italic text-base-content/70">
          <p>Properties passed to the 'scrollbar' scoped slot and <code>useVirtualScrollbar</code> return value.</p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8"
          lang="vue"
          code="<template>
<VirtualScroll :items=&quot;items&quot; direction=&quot;both&quot; virtual-scrollbar>
  <template #scrollbar=&quot;{ trackProps, thumbProps, axis }&quot;>
    &amp;lt;!-- Vertical Track -->
    <div v-if=&quot;axis === 'vertical'&quot; v-bind=&quot;trackProps&quot; class=&quot;w-2 bg-base-300&quot;>
      <div v-bind=&quot;thumbProps&quot; class=&quot;bg-primary rounded&quot; />
    </div>

    &amp;lt;!-- Horizontal Track -->
    <div v-else v-bind=&quot;trackProps&quot; class=&quot;h-2 bg-base-300&quot;>
      <div v-bind=&quot;thumbProps&quot; class=&quot;bg-secondary rounded&quot; />
    </div>
  </template>
</VirtualScroll>
</template>"
        />

        <div class="docs-table-container text-base-content/80">
          <table class="docs-table">
            <thead>
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>axis</code></td><td><code>'vertical' | 'horizontal'</code></td><td>The scrollbar axis.</td></tr>
              <tr><td><code>totalSize</code></td><td><code>number</code></td><td>Total scrollable content size.</td></tr>
              <tr><td><code>position</code></td><td><code>number</code></td><td>Current scroll offset.</td></tr>
              <tr><td><code>positionPercent</code></td><td><code>number</code></td><td>Scroll position percentage (0-1).</td></tr>
              <tr><td><code>viewportSize</code></td><td><code>number</code></td><td>Visible viewport size.</td></tr>
              <tr><td><code>viewportPercent</code></td><td><code>number</code></td><td>Viewport percentage of total (0-1).</td></tr>
              <tr><td><code>thumbSizePercent</code></td><td><code>number</code></td><td>Calculated thumb size percentage (0-100).</td></tr>
              <tr><td><code>thumbPositionPercent</code></td><td><code>number</code></td><td>Calculated thumb position percentage (0-100).</td></tr>
              <tr><td><code>scrollToOffset</code></td><td><code>Function</code></td><td>Scroll to pixel offset on this axis.</td></tr>
              <tr><td><code>isRtl</code></td><td><code>boolean</code></td><td>Current RTL state.</td></tr>
              <tr><td><code>trackProps</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>Attributes/listeners for the track. Bind with <code>v-bind="trackProps"</code>. Includes <code>class</code> and <code>style</code>.</td></tr>
              <tr><td><code>thumbProps</code></td><td><code>Record&lt;string, unknown&gt;</code></td><td>Attributes/listeners for the thumb. Bind with <code>v-bind="thumbProps"</code>. Includes <code>class</code> and <code>style</code>.</td></tr>
              <tr><td><code>isDragging</code></td><td><code>boolean</code></td><td>Whether the thumb is currently being dragged.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <h3 id="events" class="docs-prop-header">Events</h3>
      <div class="docs-table-container mb-10 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Payload</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>scroll</code></td>
              <td><code><a href="#scroll-details" class="link link-primary">ScrollDetails&lt;T&gt;</a></code></td>
              <td>Emitted on every scroll position change.</td>
            </tr>
            <tr>
              <td><code>load</code></td>
              <td><code>'vertical' | 'horizontal'</code></td>
              <td>Triggered when the user scrolls within <code>loadDistance</code> of the end.</td>
            </tr>
            <tr>
              <td><code>visibleRangeChange</code></td>
              <td><code>{ start, end, colStart, colEnd }</code></td>
              <td>Emitted when the set of rendered indices changes.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="keyboard-navigation" class="docs-prop-header">Keyboard Navigation</h3>
      <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-10">
        <p>The container is keyboard-accessible when focused (<code>tabindex="0"</code>). It supports standard navigation keys:</p>
        <div class="grid grid-cols-1 @4xl:grid-cols-2 @7xl:grid-cols-3 gap-4 not-prose mt-4">
          <div class="docs-kbd-item">
            <kbd class="docs-kbd">Home</kbd>
            <span class="docs-kbd-description">Scroll to the very beginning (Index 0,0).</span>
          </div>
          <div class="docs-kbd-item">
            <kbd class="docs-kbd">End</kbd>
            <span class="docs-kbd-description">Scroll to the very last row and column, including the loading slot size when a <code>#loading</code> slot is present.</span>
          </div>
          <div class="docs-kbd-item">
            <kbd class="docs-kbd">PgUp</kbd> / <kbd class="docs-kbd">PgDn</kbd>
            <span class="docs-kbd-description">Scroll by one full viewport: target is the first visible item minus one / the last visible item plus one.</span>
          </div>
          <div class="docs-kbd-item">
            <span class="flex gap-1">
              <kbd class="docs-kbd">↑</kbd>
              <kbd class="docs-kbd">↓</kbd>
            </span>
            <span class="docs-kbd-description">Scroll vertically by item height (respects <code>snap</code> mode).</span>
          </div>
          <div class="docs-kbd-item">
            <span class="flex gap-1">
              <kbd class="docs-kbd">←</kbd>
              <kbd class="docs-kbd">→</kbd>
            </span>
            <span class="docs-kbd-description">Scroll horizontally by column width (respects <code>snap</code> mode).</span>
          </div>
        </div>
      </div>

      <h3 id="css-classes" class="docs-prop-header">CSS Classes</h3>
      <div class="docs-table-container mb-10 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th class="w-1/3">Class</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>.virtual-scroll-container</code></td>
              <td>The root scrollable container element.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll-wrapper</code></td>
              <td>Wraps rendered items and provides total scrollable dimensions.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll-item</code></td>
              <td>Applied to each individual rendered item. Use for general item styling.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll-header</code> / <code>.virtual-scroll-footer</code></td>
              <td>Containers for header and footer slots.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll-loading</code></td>
              <td>Container for the loading slot.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll-loading--hidden</code></td>
              <td>Applied to the loading slot while <code>loading</code> is false: hides it with <code>visibility: hidden</code> while keeping its space (the slot is always rendered when provided).</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll--vertical</code> / <code>--horizontal</code> / <code>--both</code></td>
              <td>Direction modifiers applied to the root container.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll--hydrated</code></td>
              <td>Applied after client-side mount and hydration is complete.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll--window</code></td>
              <td>Applied when scrolling via the global window object.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll--table</code></td>
              <td>Applied when <code>containerTag="table"</code> is used.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll--sticky</code></td>
              <td>Applied to items that are currently stuck to the viewport edge.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll--debug</code></td>
              <td>Visible when <code>debug</code> prop is active.</td>
            </tr>
            <tr>
              <td><code>.virtual-scroll--hide-scrollbar</code></td>
              <td>Applied when virtual scrollbars are enabled or content is massive.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="css-variables" class="docs-prop-header">CSS Variables</h3>
      <div class="prose prose-sm max-w-none mb-6 opacity-80">
        <p>
          The default <code>VirtualScrollbar</code> can be styled using the following CSS variables:
        </p>
      </div>
      <div class="docs-table-container mb-10 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th class="w-1/3">Variable</th>
              <th>Default (Light/Dark)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>--vs-scrollbar-bg</code></td><td><code>rgba(230,230,230,0.9) / rgba(30,30,30,0.9)</code></td><td>Track background color.</td></tr>
            <tr><td><code>--vs-scrollbar-thumb-bg</code></td><td><code>rgba(0,0,0,0.3) / rgba(255,255,255,0.3)</code></td><td>Thumb background color.</td></tr>
            <tr><td><code>--vs-scrollbar-thumb-hover-bg</code></td><td><code>rgba(0,0,0,0.6) / rgba(255,255,255,0.6)</code></td><td>Thumb background on hover/active.</td></tr>
            <tr><td><code>--vs-scrollbar-size</code></td><td><code>8px</code></td><td>Width (vertical) or height (horizontal) of the scrollbar.</td></tr>
            <tr><td><code>--vs-scrollbar-radius</code></td><td><code>4px</code></td><td>Border radius for track and thumb.</td></tr>
            <tr><td><code>--vs-scrollbar-cross-gap</code></td><td><code>var(--vs-scrollbar-size)</code></td><td>Size of gap to use where scrollbars meet.</td></tr>
            <tr><td><code>--vs-scrollbar-has-cross-gap</code></td><td><code>0</code></td><td>If gap should be shown where scrollbars meet.</td></tr>
          </tbody>
        </table>
      </div>

      <h3 id="methods" class="docs-prop-header">Exposed Members</h3>
      <div class="prose prose-sm max-w-none mb-6 opacity-80">
        <p>
          The <code>VirtualScroll</code> component exposes several reactive properties and methods from the underlying logic.
          You can access these via a template <code>ref</code>.
        </p>
      </div>

      <h4 class="docs-prop-subheader docs-prop-subheader--primary">Properties</h4>
      <div class="docs-link-grid mb-8">
        <a href="#props" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">All Props</code>
          <p class="docs-link-description">All component props are available on the instance.</p>
        </a>
        <a href="#scroll-details" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">scrollDetails</code>
          <p class="docs-link-description">Full reactive state of the virtualizer.</p>
        </a>
        <a href="#column-range" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">columnRange</code>
          <p class="docs-link-description">Visible column indices and paddings.</p>
        </a>
        <a href="#is-hydrated" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">isHydrated</code>
          <p class="docs-link-description">Mounted and ready for virtualization.</p>
        </a>
        <a href="#is-rtl" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">isRtl</code>
          <p class="docs-link-description">Right-to-Left mode active.</p>
        </a>
        <a href="#scrollbar-slot-props" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">scrollbarPropsVertical</code>
          <p class="docs-link-description">Reactive vertical scrollbar properties.</p>
        </a>
        <a href="#scrollbar-slot-props" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">scrollbarPropsHorizontal</code>
          <p class="docs-link-description">Reactive horizontal scrollbar properties.</p>
        </a>
        <a href="#scale-factors" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">scaleX / scaleY</code>
          <p class="docs-link-description">Current coordinate scaling factors.</p>
        </a>
        <a href="#component-offset" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">componentOffset</code>
          <p class="docs-link-description">Absolute offset of the component within its container.</p>
        </a>
        <a href="#rendered-dimensions" class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">renderedWidth / renderedHeight</code>
          <p class="docs-link-description">Physical dimensions in DOM (clamped).</p>
        </a>
        <div class="docs-link-card">
          <code class="docs-link-title docs-link-title--primary">wrapperRole / cellRole</code>
          <p class="docs-link-description">The ARIA roles currently applied to the wrapper and its cells.</p>
        </div>
      </div>

      <h4 class="docs-prop-subheader docs-prop-subheader--secondary">Methods</h4>
      <div class="docs-link-grid mb-10">
        <a href="#method-scrolltoindex" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">scrollToIndex()</code>
          <p class="docs-link-description">Scroll to a specific row/column.</p>
        </a>
        <a href="#method-scrolltooffset" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">scrollToOffset()</code>
          <p class="docs-link-description">Scroll to precise pixel position.</p>
        </a>
        <a href="#method-stopprogrammaticscroll" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">stopProgrammaticScroll()</code>
          <p class="docs-link-description">Halt smooth scroll animations.</p>
        </a>
        <a href="#method-getcolumnwidth" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getColumnWidth()</code>
          <p class="docs-link-description">Get calculated width of a column.</p>
        </a>
        <a href="#method-getrowheight" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getRowHeight()</code>
          <p class="docs-link-description">Get calculated height of a row.</p>
        </a>
        <a href="#method-getrowoffset" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getRowOffset()</code>
          <p class="docs-link-description">Get virtual offset of a row.</p>
        </a>
        <a href="#method-getcolumnoffset" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getColumnOffset()</code>
          <p class="docs-link-description">Get virtual offset of a column.</p>
        </a>
        <a href="#method-getitemoffset" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getItemOffset()</code>
          <p class="docs-link-description">Get virtual offset of an item.</p>
        </a>
        <a href="#method-getitemsize" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getItemSize()</code>
          <p class="docs-link-description">Get item size along scroll axis.</p>
        </a>
        <a href="#method-getrowindexat" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getRowIndexAt()</code>
          <p class="docs-link-description">Get row index at virtual offset.</p>
        </a>
        <a href="#method-getcolindexat" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getColIndexAt()</code>
          <p class="docs-link-description">Get column index at virtual offset.</p>
        </a>
        <a href="#method-getitemariaprops" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getItemAriaProps()</code>
          <p class="docs-link-description">Get ARIA attributes for an item.</p>
        </a>
        <a href="#method-getcellariaprops" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">getCellAriaProps()</code>
          <p class="docs-link-description">Get ARIA attributes for a cell.</p>
        </a>
        <a href="#method-refresh" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">refresh()</code>
          <p class="docs-link-description">Reset all dynamic measurements.</p>
        </a>
        <a href="#method-updatedirection" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">updateDirection()</code>
          <p class="docs-link-description">Trigger RTL/LTR detection.</p>
        </a>
        <a href="#method-updatehostoffset" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">updateHostOffset()</code>
          <p class="docs-link-description">Recalculate container position.</p>
        </a>
        <a href="#method-updateitemsize" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">updateItemSize()</code>
          <p class="docs-link-description">Manually register measurement.</p>
        </a>
        <a href="#method-updateitemsizes" class="docs-link-card">
          <code class="docs-prop-name--secondary text-xs">updateItemSizes()</code>
          <p class="docs-link-description">Batch register measurements.</p>
        </a>
      </div>
    </section>

    <div class="divider opacity-30" />

    <!-- 5.1 VirtualScrollbar Component -->
    <section id="virtual-scrollbar">
      <h2 class="docs-section-header">VirtualScrollbar Component</h2>
      <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90">
        <p>
          The <code>VirtualScrollbar</code> component provides a cross-browser consistent scrollbar that can be used independently or within the <code>VirtualScroll</code> component.
          Check out the <a href="/feature-independent-scrollbars" class="link link-primary font-bold">Independent Scrollbars example</a> to see it in action without virtualization.
        </p>
      </div>

      <CodeBlock
        class="docs-code-block mb-8"
        lang="vue"
        line-numbers
        code="<script setup>
import { VirtualScrollbar } from &quot;@pdanpdan/virtual-scroll&quot;;
import { ref } from &quot;vue&quot;;

const scrollX = ref(0);
const scrollY = ref(0);
</script>

<template>
<div class=&quot;relative overflow-hidden h-96&quot;>
  &amp;lt;!-- Vertical Scrollbar -->
  <VirtualScrollbar
    axis=&quot;vertical&quot;
    :total-size=&quot;10000&quot;
    :viewport-size=&quot;400&quot;
    :position=&quot;scrollY&quot;
    @scroll-to-offset=&quot;val => scrollY = val&quot;
  />

  &amp;lt;!-- Horizontal Scrollbar -->
  <VirtualScrollbar
    axis=&quot;horizontal&quot;
    :total-size=&quot;10000&quot;
    :viewport-size=&quot;800&quot;
    :position=&quot;scrollX&quot;
    @scroll-to-offset=&quot;val => scrollX = val&quot;
  />
</div>
</template>"
      />

      <h3 id="scrollbar-props" class="docs-prop-header text-primary">Props</h3>
      <div class="docs-table-container mb-8 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th class="w-1/4">Prop</th>
              <th class="w-1/4">Type</th>
              <th class="w-1/6">Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code class="docs-prop-name">axis</code></td>
              <td><code>'vertical' | 'horizontal'</code></td>
              <td>-</td>
              <td>The axis of the scrollbar. Required.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">totalSize</code></td>
              <td><code>number</code></td>
              <td>-</td>
              <td>Total size of the scrollable content in pixels. Required.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">viewportSize</code></td>
              <td><code>number</code></td>
              <td>-</td>
              <td>Size of the visible viewport in pixels. Required.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">position</code></td>
              <td><code>number</code></td>
              <td>-</td>
              <td>Current scroll position in pixels. Required.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">containerId</code></td>
              <td><code>string</code></td>
              <td><code>undefined</code></td>
              <td>ID of the container element for accessibility.</td>
            </tr>
            <tr>
              <td><code class="docs-prop-name">ariaLabel</code></td>
              <td><code>string</code></td>
              <td>-</td>
              <td>Accessible label for the scrollbar.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 id="scrollbar-events" class="docs-prop-header text-secondary">Events</h3>
      <div class="docs-table-container mb-10 text-base-content/80">
        <table class="docs-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Payload</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>scroll-to-offset</code></td>
              <td><code>number</code></td>
              <td>Emitted when the user interacts with the scrollbar to change position.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <div class="divider opacity-30" />

    <!-- 6. Composables -->
    <section id="composables">
      <h2 class="docs-section-header">Composables</h2>

      <!-- useVirtualScroll -->
      <section id="use-virtual-scroll" class="mb-16">
        <h3 class="docs-prop-header text-secondary">useVirtualScroll</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Provides the core virtualization logic. Recommended for advanced use cases or when building custom wrappers.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useVirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

const items = ref([...]);
const props = computed(() => ({
items: items.value,
itemSize: 50,
direction: 'vertical'
}));

const {
renderedItems,
scrollDetails,
totalHeight,
scrollToIndex
} = useVirtualScroll(props);"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>Accepts a <code>MaybeRefOrGetter</code> to a <code><a href="#virtual-scroll-props" class="link link-primary font-semibold">VirtualScrollProps</a></code> object.</p>
        </div>

        <h4 class="docs-prop-subheader">Return Value</h4>
        <div class="docs-table-container mb-12 text-base-content/80 text-xs @4xl:text-sm">
          <table class="docs-table">
            <thead>
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="#rendered-item" class="link font-bold text-primary">renderedItems</a></td>
                <td><code>Ref&lt;RenderedItem&lt;T&gt;[]&gt;</code></td>
                <td>List of items to render in the current buffer.</td>
              </tr>
              <tr>
                <td><a href="#scroll-details" class="link font-bold text-primary">scrollDetails</a></td>
                <td><code>Ref&lt;ScrollDetails&lt;T&gt;&gt;</code></td>
                <td>Full reactive state of the virtual scroll system.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">totalWidth</code> / <code class="docs-prop-name">totalHeight</code></td>
                <td><code>Ref&lt;number&gt;</code></td>
                <td>Calculated dimensions of the entire list/grid (VU).</td>
              </tr>
              <tr id="rendered-dimensions">
                <td><code class="docs-prop-name">renderedWidth</code> / <code class="docs-prop-name">renderedHeight</code></td>
                <td><code>Ref&lt;number&gt;</code></td>
                <td>Total dimensions to be rendered in the DOM (clamped to browser limits, DU).</td>
              </tr>
              <tr>
                <td><a href="#column-range" class="link font-bold text-primary">columnRange</a></td>
                <td><code>Ref&lt;ColumnRange&gt;</code></td>
                <td>Visible columns and their associated paddings.</td>
              </tr>
              <tr id="is-hydrated">
                <td><code class="docs-prop-name">isHydrated</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td><code>true</code> when the component is mounted and hydrated.</td>
              </tr>
              <tr id="is-rtl">
                <td><code class="docs-prop-name">isRtl</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td><code>true</code> if the scroll container is in Right-to-Left mode.</td>
              </tr>
              <tr>
                <td><a href="#method-scrolltoindex" class="link font-bold text-secondary">scrollToIndex</a></td>
                <td><code>Function</code></td>
                <td>Programmatic scroll to a specific index.</td>
              </tr>
              <tr>
                <td><a href="#method-scrolltooffset" class="link font-bold text-secondary">scrollToOffset</a></td>
                <td><code>Function</code></td>
                <td>Programmatic scroll to a pixel offset.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">stopProgrammaticScroll</code></td>
                <td><code>Function</code></td>
                <td>Cancel any active smooth scroll animation.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">handleScrollCorrection</code></td>
                <td><code>Function</code></td>
                <td>Adjust scroll position to compensate for measurement changes.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">updateItemSize</code></td>
                <td><code>Function</code></td>
                <td>Register a manual item measurement.</td>
              </tr>
              <tr>
                <td><a href="#method-updateitemsizes" class="link font-bold text-secondary">updateItemSizes</a></td>
                <td><code>Function</code></td>
                <td>Register multiple manual item measurements.</td>
              </tr>
              <tr>
                <td><a href="#method-updatehostoffset" class="link font-bold text-secondary">updateHostOffset</a></td>
                <td><code>Function</code></td>
                <td>Force update the container's relative position.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">updateDirection</code></td>
                <td><code>Function</code></td>
                <td>Manually trigger direction (LTR/RTL) detection.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">getItemAriaProps</code></td>
                <td><code>Function</code></td>
                <td>Helper to get ARIA attributes for an item.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">getCellAriaProps</code></td>
                <td><code>Function</code></td>
                <td>Helper to get ARIA attributes for a cell.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">getColumnWidth</code></td>
                <td><code>Function</code></td>
                <td>Helper to get a column's width.</td>
              </tr>
              <tr>
                <td><a href="#method-getrowheight" class="link font-bold text-secondary">getRowHeight</a></td>
                <td><code>Function</code></td>
                <td>Helper to get a row's height.</td>
              </tr>
              <tr>
                <td><a href="#method-getrowoffset" class="link font-bold text-secondary">getRowOffset</a></td>
                <td><code>Function</code></td>
                <td>Helper to get a row's virtual offset (VU).</td>
              </tr>
              <tr>
                <td><a href="#method-getcolumnoffset" class="link font-bold text-secondary">getColumnOffset</a></td>
                <td><code>Function</code></td>
                <td>Helper to get a column's virtual offset (VU).</td>
              </tr>
              <tr>
                <td><a href="#method-getitemoffset" class="link font-bold text-secondary">getItemOffset</a></td>
                <td><code>Function</code></td>
                <td>Helper to get an item's virtual offset (VU).</td>
              </tr>
              <tr>
                <td><a href="#method-getitemsize" class="link font-bold text-secondary">getItemSize</a></td>
                <td><code>Function</code></td>
                <td>Helper to get an item's size along scroll axis (VU).</td>
              </tr>
              <tr>
                <td><a href="#method-refresh" class="link font-bold text-secondary">refresh</a></td>
                <td><code>Function</code></td>
                <td>Resets all measurements and state.</td>
              </tr>
              <tr id="scale-factors">
                <td><code class="docs-prop-name">scaleX</code> / <code class="docs-prop-name">scaleY</code></td>
                <td><code>Ref&lt;number&gt;</code></td>
                <td>Current coordinate scaling factors (VU / DU).</td>
              </tr>
              <tr id="component-offset">
                <td><code class="docs-prop-name">componentOffset</code></td>
                <td><code>{ x: Ref&lt;number&gt;, y: Ref&lt;number&gt; }</code></td>
                <td>Absolute offset of the component in its container (DU).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- useVirtualScrollSizes -->
      <section id="use-virtual-scroll-sizes" class="mb-16">
        <h3 class="docs-prop-header text-secondary">useVirtualScrollSizes</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Manages the underlying sizing logic using Fenwick Trees. This composable handles prefix sum calculations, size updates, and scroll correction adjustments.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useVirtualScrollSizes } from '@pdanpdan/virtual-scroll';
import { computed } from 'vue';

const {
  itemSizesY,
  updateItemSizes,
  getSizeAt
} = useVirtualScrollSizes({
  props: computed(() => ({ items: [], itemSize: 50 })),
  isDynamicItemSize: computed(() => false),
  isDynamicColumnWidth: computed(() => false),
  defaultSize: computed(() => 50),
  fixedItemSize: computed(() => 50),
  direction: computed(() => 'vertical')
});"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>Accepts a <code>MaybeRefOrGetter</code> to a <code><a href="#use-virtual-scroll-sizes-props" class="link link-primary font-semibold">UseVirtualScrollSizesProps</a></code> object.</p>
        </div>

        <h4 class="docs-prop-subheader">Return Value</h4>
        <div class="docs-table-container mb-12 text-base-content/80 text-xs @4xl:text-sm">
          <table class="docs-table">
            <thead>
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="docs-prop-name">itemSizesX / Y</code></td>
                <td><code><a href="#fenwick-tree" class="link link-primary">FenwickTree</a></code></td>
                <td>Prefix sum trees for item sizes.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">columnSizes</code></td>
                <td><code><a href="#fenwick-tree" class="link link-primary">FenwickTree</a></code></td>
                <td>Prefix sum tree for column widths.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">measuredItemsX / Y</code></td>
                <td><code>Ref&lt;Uint8Array&gt;</code></td>
                <td>Bitmask of measured items.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">measuredColumns</code></td>
                <td><code>Ref&lt;Uint8Array&gt;</code></td>
                <td>Bitmask of measured columns.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">treeUpdateFlag</code></td>
                <td><code>Ref&lt;number&gt;</code></td>
                <td>Reactive flag that increments when trees update.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">sizesInitialized</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td>True after initial sizes are calculated.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">getItemBaseSize</code></td>
                <td><code>Function</code></td>
                <td>Helper to get item size from props.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">getSizeAt</code></td>
                <td><code>Function</code></td>
                <td>Helper to get current size at index.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">initializeSizes</code></td>
                <td><code>Function</code></td>
                <td>Setup trees from component props.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">updateItemSizes</code></td>
                <td><code>Function</code></td>
                <td>Batch register measurements and trigger corrections.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">refresh</code></td>
                <td><code>Function</code></td>
                <td>Reset all measurements and state.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- useVirtualScrollbar -->
      <section id="use-virtual-scrollbar">
        <h3 class="docs-prop-header text-secondary">useVirtualScrollbar</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Provides the logic for virtual scrollbar interactions. It handles track clicks, thumb dragging, and coordinate mapping (including RTL).
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useVirtualScrollbar } from '@pdanpdan/virtual-scroll';

const {
trackProps,
thumbProps,
thumbSizePercent,
thumbPositionPercent
} = useVirtualScrollbar({
axis: 'vertical',
totalSize: 10000,
viewportSize: 500,
position: scrollPos,
scrollToOffset: (val) => { scrollPos = val; }
});"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>Accepts a <code>MaybeRefOrGetter</code> to a <code><a href="#use-virtual-scrollbar-props" class="link link-primary font-semibold">UseVirtualScrollbarProps</a></code> object.</p>
        </div>

        <h4 class="docs-prop-subheader">Return Value</h4>
        <div class="docs-table-container mb-12 text-base-content/80 text-xs @4xl:text-sm">
          <table class="docs-table">
            <thead>
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="docs-prop-name">trackProps</code></td>
                <td><code>ComputedRef&lt;<a href="#scrollbar-slot-props" class="link link-primary">object</a>&gt;</code></td>
                <td><a href="#scrollbar-slot-props" class="link link-primary">Attributes and listeners</a> for the track element. Includes <code>class</code> and <code>style</code>.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">thumbProps</code></td>
                <td><code>ComputedRef&lt;<a href="#scrollbar-slot-props" class="link link-primary">object</a>&gt;</code></td>
                <td><a href="#scrollbar-slot-props" class="link link-primary">Attributes and listeners</a> for the thumb element. Includes <code>class</code> and <code>style</code>.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">viewportPercent</code></td>
                <td><code>ComputedRef&lt;number&gt;</code></td>
                <td>Viewport size as percentage of total size (0-1).</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">positionPercent</code></td>
                <td><code>ComputedRef&lt;number&gt;</code></td>
                <td>Scroll position as percentage of scrollable range (0-1).</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">thumbSizePercent</code></td>
                <td><code>ComputedRef&lt;number&gt;</code></td>
                <td>Calculated thumb size (percentage of track, 0-100).</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">thumbPositionPercent</code></td>
                <td><code>ComputedRef&lt;number&gt;</code></td>
                <td>Calculated thumb position (percentage of track, 0-100).</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">isDragging</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td>Whether the thumb is currently being dragged.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- useVirtualScrollInertia -->
      <section id="use-virtual-scroll-inertia" class="mb-16">
        <h3 class="docs-prop-header text-secondary">useVirtualScrollInertia</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Handles pointer-based scrolling, inertia animation, and mouse wheel events for cases where native scrolling is not available (e.g., massive lists or custom scrollbars).
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useVirtualScrollInertia } from '@pdanpdan/virtual-scroll';

const {
  isPointerScrolling,
  handlePointerDown,
  handlePointerMove,
  handlePointerUp,
  handleWheel
} = useVirtualScrollInertia({
  useVirtualScrolling: ref(true),
  scrollDetails,
  scrollToOffset: (x, y) => { /* ... */ },
  stopProgrammaticScroll: () => { /* ... */ }
});"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>Accepts an <code>UseVirtualScrollInertiaOptions</code> object.</p>
        </div>

        <h4 class="docs-prop-subheader">Return Value</h4>
        <div class="docs-table-container mb-12 text-base-content/80 text-xs @4xl:text-sm">
          <table class="docs-table">
            <thead>
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="docs-prop-name">isPointerScrolling</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td>True when user is actively dragging the content.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">handlePointerDown/Move/Up</code></td>
                <td><code>Function</code></td>
                <td>Pointer event handlers to be bound to the scroll container.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">handleWheel</code></td>
                <td><code>Function</code></td>
                <td>Wheel event handler to be bound to the scroll container.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">stopInertia</code></td>
                <td><code>Function</code></td>
                <td>Immediately stops any active momentum animation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- useVirtualScrollKeyboard -->
      <section id="use-virtual-scroll-keyboard" class="mb-16">
        <h3 class="docs-prop-header text-secondary">useVirtualScrollKeyboard</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Provides keyboard navigation support for the virtual scroll container, allowing users to navigate using Arrows, Home, End, PageUp, and PageDown keys.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useVirtualScrollKeyboard } from '@pdanpdan/virtual-scroll';

const { handleKeyDown } = useVirtualScrollKeyboard({
  props,
  scrollDetails,
  scrollToIndex: (row, col, opt) => { /* ... */ },
  scrollToOffset: (x, y, opt) => { /* ... */ },
  stopProgrammaticScroll: () => { /* ... */ },
  getLoadingSlotSize: () => loadingEl?.offsetHeight ?? 0, // optional
  // ... resolvers
});"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>Accepts an <code>UseVirtualScrollKeyboardOptions</code> object.</p>
          <ul class="list-disc ps-5 space-y-1">
            <li><code>scrollToOffset</code>: Scrolls to a pixel position. Used by the <code>End</code> key.</li>
            <li><code>getLoadingSlotSize</code> (optional): Height of the loading slot. When provided, <code>End</code> includes it in the target so the last item plus the slot fit in the viewport.</li>
          </ul>
        </div>

        <h4 class="docs-prop-subheader">Return Value</h4>
        <div class="docs-table-container mb-12 text-base-content/80 text-xs @4xl:text-sm">
          <table class="docs-table">
            <thead>
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="docs-prop-name">handleKeyDown</code></td>
                <td><code>Function</code></td>
                <td>Keyboard event handler to be bound to the focusable scroll container.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- useVirtualScrollObservers -->
      <section id="use-virtual-scroll-observers">
        <h3 class="docs-prop-header text-secondary">useVirtualScrollObservers</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Manages <code>ResizeObserver</code> instances to support fully dynamic item and container sizes.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useVirtualScrollObservers } from '@pdanpdan/virtual-scroll';

const { setItemRef } = useVirtualScrollObservers({
  hostRef,
  wrapperRef,
  headerRef,
  footerRef,
  itemRefs,
  updateHostOffset: () => { /* ... */ },
  updateItemSizes: (updates) => { /* ... */ },
  // ...
});"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>Accepts an <code>UseVirtualScrollObserversOptions</code> object.</p>
        </div>

        <h4 class="docs-prop-subheader">Return Value</h4>
        <div class="docs-table-container mb-12 text-base-content/80 text-xs @4xl:text-sm">
          <table class="docs-table">
            <thead>
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="docs-prop-name">setItemRef</code></td>
                <td><code>Function</code></td>
                <td>Callback ref to be used on rendered items to track and measure them.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <div class="divider opacity-30" />

    <!-- 6.1 Extension Reference -->
    <section id="extension-reference">
      <h2 class="docs-section-header">Extension Reference</h2>

      <!-- useRtlExtension -->
      <section id="use-rtl-extension" class="mb-16">
        <h3 class="docs-prop-header text-secondary">useRtlExtension</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Automatically detects the text direction (LTR or RTL) of the scroll container and adjusts the coordinate system accordingly. It ensures that horizontal scroll offsets and item positioning are correct in RTL mode.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useRtlExtension } from '@pdanpdan/virtual-scroll';"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>This extension does not accept any parameters.</p>
        </div>

        <h4 class="docs-prop-subheader">Behavior</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <ul class="list-disc ps-5 space-y-1">
            <li>Injects detection logic into the <code>updateDirection</code> core method.</li>
            <li>Detects direction from the container element, or falls back to the document root.</li>
            <li>Automatically flips horizontal item offsets in RTL mode.</li>
          </ul>
        </div>
      </section>

      <!-- useSnappingExtension -->
      <section id="use-snapping-extension" class="mb-16">
        <h3 class="docs-prop-header text-secondary">useSnappingExtension</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Adds scroll snapping behavior to the virtualizer. When user scrolling stops, the extension automatically aligns the viewport to the nearest item based on the <code>snap</code> prop configuration.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useSnappingExtension } from '@pdanpdan/virtual-scroll';"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>This extension does not accept any parameters.</p>
        </div>

        <h4 class="docs-prop-subheader">Behavior</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <ul class="list-disc ps-5 space-y-1">
            <li>Hooks into <code>onScrollEnd</code> lifecycle event.</li>
            <li>Calculates the best snap target using <code>resolveSnap</code> utility.</li>
            <li>Uses <code>scrollToIndex</code> with <code>behavior: 'smooth'</code> to perform the snap.</li>
            <li>Automatically ignores items larger than the viewport to prevent infinite jumping.</li>
          </ul>
        </div>
      </section>

      <!-- useStickyExtension -->
      <section id="use-sticky-extension" class="mb-16">
        <h3 class="docs-prop-header text-secondary">useStickyExtension</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Implements sticky item logic for rows and columns. It ensures that items specified in <code>stickyIndices</code> are always visible when their group is within the viewport range.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useStickyExtension } from '@pdanpdan/virtual-scroll';"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>This extension does not accept any parameters.</p>
        </div>

        <h4 class="docs-prop-subheader">Behavior</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <ul class="list-disc ps-5 space-y-1">
            <li>Hooks into <code>transformRenderedItems</code> to inject sticky items into the render list even if they are outside the normal virtual range.</li>
            <li>Calculates <code>stickyOffset</code> for each item to create the "pushing" effect when the next sticky header arrives.</li>
            <li>Sticky items stick below any sticky header (and above any sticky footer): activation and the pushing effect are measured from the sticky start/end offsets (<code>stickyStartX</code>/<code>stickyStartY</code> on <a href="#sticky-params" class="link link-primary">StickyParams</a>).</li>
            <li>Supports both horizontal and vertical stickiness.</li>
          </ul>
        </div>
      </section>

      <!-- useInfiniteLoadingExtension -->
      <section id="use-infinite-loading-extension" class="mb-16">
        <h3 class="docs-prop-header text-secondary">useInfiniteLoadingExtension</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Simple extension to facilitate infinite scrolling. It monitors the scroll position and triggers a callback when the user reaches a specific distance from the end of the content.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useInfiniteLoadingExtension } from '@pdanpdan/virtual-scroll';

const ext = useInfiniteLoadingExtension({
  onLoad: (axis) => {
    console.log(`Load more items on ${axis} axis`);
  }
});"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="docs-table-container mb-8 text-base-content/80 text-xs @4xl:text-sm">
          <table class="docs-table">
            <thead>
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><code>onLoad</code></td>
                <td><code>(axis) => void</code></td>
                <td>Callback triggered when thresholds are met. Receives <code>'vertical' | 'horizontal'</code>.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="docs-prop-subheader">Behavior</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <ul class="list-disc ps-5 space-y-1">
            <li>Watches <code>scrollDetails</code> reactively.</li>
            <li>Respects the <code>loadDistance</code> and <code>loading</code> props from the component.</li>
            <li>Prevents duplicate triggers while <code>loading</code> is true.</li>
            <li>Only fires after a programmatic scroll (PageDown/End) has finished, so content is not appended while the scroll target is still being computed.</li>
          </ul>
        </div>
      </section>

      <!-- usePrependRestorationExtension -->
      <section id="use-prepend-restoration-extension" class="mb-16">
        <h3 class="docs-prop-header text-secondary">usePrependRestorationExtension</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Essential for chat-like interfaces. When items are prepended to the beginning of the <code>items</code> array, this extension calculates the added size and applies a scroll correction to maintain the user's perceived position.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { usePrependRestorationExtension } from '@pdanpdan/virtual-scroll';"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>This extension does not accept any parameters.</p>
        </div>

        <h4 class="docs-prop-subheader">Behavior</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <ul class="list-disc ps-5 space-y-1">
            <li>Compares new items with previous items to detect prepended count.</li>
            <li>Calculates the height (or width) of prepended items.</li>
            <li>Uses <code>handleScrollCorrection</code> to silently adjust the scroll position before the next frame.</li>
          </ul>
        </div>
      </section>

      <!-- useCoordinateScalingExtension -->
      <section id="use-coordinate-scaling-extension">
        <h3 class="docs-prop-header text-secondary">useCoordinateScalingExtension</h3>
        <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            Enables support for virtually unlimited content sizes. Since browsers have a hard limit on the physical height/width of elements (usually around 10M to 30M pixels), this extension scales the display coordinates so the virtual list can represent billions of pixels.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8 font-mono"
          lang="ts"
          code="import { useCoordinateScalingExtension } from '@pdanpdan/virtual-scroll';"
        />

        <h4 class="docs-prop-subheader">Parameters</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>This extension does not accept any parameters.</p>
        </div>

        <h4 class="docs-prop-subheader">Behavior</h4>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <ul class="list-disc ps-5 space-y-1">
            <li>Calculates <code>scaleX</code> and <code>scaleY</code> factors when total size exceeds browser limits.</li>
            <li>Transparently maps physical scroll events to virtual positions.</li>
            <li>Automatically disabled when using <code>window</code> as the container (as the browser handles body scrolling differently).</li>
          </ul>
        </div>
      </section>
    </section>

    <div class="divider opacity-30" />

    <!-- 7. API Reference -->
    <section id="api-reference">
      <h2 class="docs-section-header">API Reference</h2>

      <h3 class="docs-section-header text-2xl mt-16">Types</h3>

      <div class="grid grid-cols-1 @4xl:grid-cols-2 gap-4 mb-12 text-base-content/80">
        <div id="scroll-direction" class="card bg-base-300 p-4 border border-base-content/5">
          <h4 class="docs-prop-subheader text-primary mb-2">ScrollDirection</h4>
          <CodeBlock class="docs-code-block font-mono text-xs" lang="ts" code="'vertical' | 'horizontal' | 'both'" />
          <p class="text-[10px] opacity-60 mt-2 italic">Defines the virtualization axes for the VirtualScroll component.</p>
        </div>
        <div id="scroll-axis" class="card bg-base-300 p-4 border border-base-content/5">
          <h4 class="docs-prop-subheader text-primary mb-2">ScrollAxis</h4>
          <CodeBlock class="docs-code-block font-mono text-xs" lang="ts" code="'vertical' | 'horizontal'" />
          <p class="text-[10px] opacity-60 mt-2 italic">Used specifically for individual scrollbar instances.</p>
        </div>
        <div id="snap-mode" class="card bg-base-300 p-4 border border-base-content/5">
          <h4 class="docs-prop-subheader text-primary mb-2">SnapMode</h4>
          <CodeBlock class="docs-code-block font-mono text-xs" lang="ts" code="boolean | 'start' | 'center' | 'end' | 'next' | 'auto'" />
          <p class="text-[10px] opacity-60 mt-2 italic">Controls automatic alignment after scrolling stops.</p>
        </div>
      </div>

      <!-- ScrollDetails -->
      <section id="scroll-details" class="mb-12">
        <h4 class="docs-prop-subheader">ScrollDetails&lt;T&gt;</h4>
        <div class="docs-table-container text-base-content/80">
          <table class="table table-sm @4xl:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs @4xl:text-sm">
              <tr><td><code>items</code></td><td><code><a href="#rendered-item" class="link link-primary">RenderedItem&lt;T&gt;</a>[]</code></td><td>Rendered items in the buffer.</td></tr>
              <tr><td><code>currentIndex</code></td><td><code>number</code></td><td>First visible row index below any sticky header.</td></tr>
              <tr><td><code>currentColIndex</code></td><td><code>number</code></td><td>First visible column index after any sticky column.</td></tr>
              <tr><td><code>scrollOffset</code></td><td><code>{ x, y }</code></td><td>Current relative scroll position in virtual units (VU).</td></tr>
              <tr><td><code>displayScrollOffset</code></td><td><code>{ x, y }</code></td><td>Current physical scroll position in display pixels (DU).</td></tr>
              <tr><td><code>viewportSize</code></td><td><code>{ width, height }</code></td><td>Dimensions of the visible viewport in virtual units (VU).</td></tr>
              <tr><td><code>displayViewportSize</code></td><td><code>{ width, height }</code></td><td>Physical dimensions of the visible viewport in display pixels (DU).</td></tr>
              <tr><td><code>totalSize</code></td><td><code>{ width, height }</code></td><td>Estimated total content dimensions (VU).</td></tr>
              <tr><td><code>isScrolling</code></td><td><code>boolean</code></td><td>Active scrolling state.</td></tr>
              <tr><td><code>isProgrammaticScroll</code></td><td><code>boolean</code></td><td>True if triggered by <code>scrollToIndex/Offset</code>.</td></tr>
              <tr><td><code>range</code></td><td><code>{ start, end }</code></td><td>Visible row range (inclusive start, exclusive end).</td></tr>
              <tr><td><code>columnRange</code></td><td><code><a href="#column-range" class="link link-primary">ColumnRange</a></code></td><td>Visible column range (grid).</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- RenderedItem -->
      <section id="rendered-item" class="mb-12">
        <h4 class="docs-prop-subheader">RenderedItem&lt;T&gt;</h4>
        <div class="docs-table-container text-base-content/80">
          <table class="table table-sm @4xl:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs @4xl:text-sm">
              <tr><td><code>item</code></td><td><code>T</code></td><td>The source data item.</td></tr>
              <tr><td><code>index</code></td><td><code>number</code></td><td>Item's position in the array.</td></tr>
              <tr><td><code>offset</code></td><td><code>{ x, y }</code></td><td>Absolute pixel position within the wrapper (DU).</td></tr>
              <tr><td><code>size</code></td><td><code>{ width, height }</code></td><td>Current dimensions (VU).</td></tr>
              <tr><td><code>originalX</code> / <code>originalY</code></td><td><code>number</code></td><td>Offsets before any sticky adjustments (VU).</td></tr>
              <tr><td><code>isSticky</code></td><td><code>boolean</code></td><td>Is configured as sticky.</td></tr>
              <tr><td><code>isStickyActive</code></td><td><code>boolean</code></td><td>Currently stuck to the edge.</td></tr>
              <tr><td><code>stickyOffset</code></td><td><code>{ x, y }</code></td><td>Translation applied for sticky pushing effect (DU).</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ColumnRange -->
      <section id="column-range" class="mb-12">
        <h4 class="docs-prop-subheader">ColumnRange</h4>
        <div class="docs-table-container text-base-content/80">
          <table class="table table-sm @4xl:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs @4xl:text-sm">
              <tr><td><code>start</code></td><td><code>number</code></td><td>Index of first rendered column.</td></tr>
              <tr><td><code>end</code></td><td><code>number</code></td><td>Index of last rendered column (exclusive).</td></tr>
              <tr><td><code>padStart</code></td><td><code>number</code></td><td>Pixel space to maintain before columns (VU).</td></tr>
              <tr><td><code>padEnd</code></td><td><code>number</code></td><td>Pixel space to maintain after columns (VU).</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- VirtualScrollProps -->
      <section id="virtual-scroll-props" class="mb-12">
        <h4 class="docs-prop-subheader">VirtualScrollProps&lt;T&gt;</h4>
        <div class="prose prose-sm max-w-none mb-4 opacity-80 italic text-base-content/70">
          <p>Full property configuration shared between the component and composable.</p>
        </div>
        <div class="docs-table-container overflow-x-auto text-base-content/80">
          <table class="table table-xs @4xl:table-sm table-zebra w-full min-w-150">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs opacity-90">
              <tr><td><code>items</code></td><td><code>T[]</code></td><td>Data source. Required.</td></tr>
              <tr><td><code>itemSize</code></td><td><code>num | fn | null</code></td><td>Sizing logic. Default: {{ DEFAULT_ITEM_SIZE }}px.</td></tr>
              <tr><td><code>direction</code></td><td><code><a href="#scroll-direction" class="link link-primary">ScrollDirection</a></code></td><td><code>'vertical' | 'horizontal' | 'both'</code>.</td></tr>
              <tr><td><code>bufferBefore</code> / <code>bufferAfter</code></td><td><code>number</code></td><td>Items outside viewport. Default: {{ DEFAULT_BUFFER }}.</td></tr>
              <tr><td><code>container</code></td><td><code>HTMLElement | Window</code></td><td>Scroll container. Defaults to component root.</td></tr>
              <tr><td><code>hostElement</code></td><td><code>HTMLElement</code></td><td>Reference for offset calculation (DU).</td></tr>
              <tr><td><code>ssrRange</code></td><td><code><a href="#ssr-support" class="link link-primary">SSRRange</a></code></td><td>Pre-rendered range for SSR.</td></tr>
              <tr><td><code>columnCount</code></td><td><code>number</code></td><td>Total columns for grid mode.</td></tr>
              <tr><td><code>columnWidth</code></td><td><code>num | arr | fn | null</code></td><td>Column sizing. Default: {{ DEFAULT_COLUMN_WIDTH }}px.</td></tr>
              <tr><td><code>scrollPaddingStart</code> / <code>End</code></td><td><code>num | {x, y}</code></td><td>Pixel offsets for scroll limits.</td></tr>
              <tr><td><code>gap</code> / <code>columnGap</code></td><td><code>number</code></td><td>Pixel space between items/cols.</td></tr>
              <tr><td><code>restoreScrollOnPrepend</code></td><td><code>boolean</code></td><td>Maintain chat scroll position.</td></tr>
              <tr><td><code>snap</code></td><td><code><a href="#snap-mode" class="link link-primary">SnapMode</a></code></td><td>Auto-alignment after scroll stop.</td></tr>
              <tr><td><code>initialScrollIndex</code></td><td><code>number</code></td><td>Mount-time jump index.</td></tr>
              <tr><td><code>initialScrollAlign</code></td><td><code><a href="#alignments" class="link link-primary">ScrollAlignment</a> | <a href="#scroll-alignment-options" class="link link-primary">Options</a></code></td><td>Alignment for initial jump.</td></tr>
              <tr><td><code>defaultItemSize</code></td><td><code>number</code></td><td>Estimate for dynamic items.</td></tr>
              <tr><td><code>defaultColumnWidth</code></td><td><code>number</code></td><td>Estimate for dynamic columns.</td></tr>
              <tr><td><code>debug</code></td><td><code>boolean</code></td><td>Enable visualization.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- StickyParams -->
      <section id="sticky-params" class="mb-12">
        <h4 class="docs-prop-subheader">StickyParams</h4>
        <div class="prose prose-sm max-w-none mb-4 opacity-80 italic text-base-content/70">
          <p>Parameters for calculating sticky item offsets. Used by <code>calculateStickyItem</code> and the <code>useStickyExtension</code> core.</p>
        </div>
        <div class="docs-table-container overflow-x-auto text-base-content/80">
          <table class="table table-xs @4xl:table-sm table-zebra w-full min-w-150">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs opacity-90">
              <tr><td><code>index</code></td><td><code>number</code></td><td>Item index.</td></tr>
              <tr><td><code>isSticky</code></td><td><code>boolean</code></td><td>Whether the item is configured as sticky.</td></tr>
              <tr><td><code>direction</code></td><td><code><a href="#scroll-direction" class="link link-primary">ScrollDirection</a></code></td><td>Scroll direction.</td></tr>
              <tr><td><code>relativeScrollX</code> / <code>relativeScrollY</code></td><td><code>number</code></td><td>Virtual scroll position (VU).</td></tr>
              <tr><td><code>originalX</code> / <code>originalY</code></td><td><code>number</code></td><td>Virtual original position of the item (VU).</td></tr>
              <tr><td><code>width</code> / <code>height</code></td><td><code>number</code></td><td>Virtual item size (VU).</td></tr>
              <tr><td><code>stickyIndices</code></td><td><code>number[]</code></td><td>All configured sticky indices.</td></tr>
              <tr><td><code>fixedSize</code> / <code>fixedWidth</code></td><td><code>number | null</code></td><td>Fixed item size / column width (VU), <code>null</code> for dynamic.</td></tr>
              <tr><td><code>gap</code> / <code>columnGap</code></td><td><code>number</code></td><td>Item / column gap (VU).</td></tr>
              <tr><td><code>getItemQueryY</code> / <code>getItemQueryX</code></td><td><code>(index: number) => number</code></td><td>Prefix sum resolvers for offsets (VU).</td></tr>
              <tr><td><code>stickyStartX</code> / <code>stickyStartY</code></td><td><code>number</code></td><td>Size of sticky start elements (left/top) in DU. Sticky items stick below them; activation and the pushing effect are measured from this offset. Optional, defaults to <code>0</code>.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- UseVirtualScrollbarProps -->
      <section id="use-virtual-scrollbar-props" class="mb-12">
        <h4 class="docs-prop-subheader">UseVirtualScrollbarProps</h4>
        <div class="docs-table-container overflow-x-auto text-base-content/80">
          <table class="table table-xs @4xl:table-sm table-zebra w-full min-w-150">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs opacity-90">
              <tr><td><code>axis</code></td><td><code><a href="#scroll-axis" class="link link-primary">ScrollAxis</a></code></td><td>Axis of the scrollbar.</td></tr>
              <tr><td><code>totalSize</code></td><td><code>number</code></td><td>Total size of content in pixels.</td></tr>
              <tr><td><code>position</code></td><td><code>number</code></td><td>Current scroll position in pixels.</td></tr>
              <tr><td><code>viewportSize</code></td><td><code>number</code></td><td>Visible area size in pixels.</td></tr>
              <tr><td><code>scrollToOffset</code></td><td><code>(offset: number) => void</code></td><td>Callback to update position.</td></tr>
              <tr><td><code>containerId</code></td><td><code>string</code></td><td>ID for accessibility.</td></tr>
              <tr><td><code>isRtl</code></td><td><code>boolean</code></td><td>Enable RTL mapping.</td></tr>
              <tr><td><code>ariaLabel</code></td><td><code>string</code></td><td>Accessible label for the scrollbar.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ScrollToIndexOptions -->
      <section id="scroll-to-index-options" class="mb-12">
        <h4 class="docs-prop-subheader">ScrollToIndexOptions</h4>
        <div class="prose prose-sm max-w-none mb-4 text-base-content/80">
          <p>Full configuration for index-based scrolling.</p>
        </div>
        <div class="docs-table-container text-base-content/80">
          <table class="table table-sm @4xl:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs @4xl:text-sm">
              <tr><td><code>align</code></td><td><code><a href="#alignments" class="link link-primary">ScrollAlignment</a> | <a href="#scroll-alignment-options" class="link link-primary">Options</a></code></td><td>Where to align the item (default: <code>'auto'</code>).</td></tr>
              <tr><td><code>behavior</code></td><td><code>'auto' | 'smooth'</code></td><td>Scroll behavior (default: <code>'smooth'</code>).</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ScrollAlignmentOptions -->
      <section id="scroll-alignment-options" class="mb-12">
        <h4 class="docs-prop-subheader">ScrollAlignmentOptions</h4>
        <div class="prose prose-sm max-w-none mb-4 text-base-content/80">
          <p>Allows axis-specific alignment in <code>scrollToIndex</code>.</p>
        </div>
        <div class="docs-table-container text-base-content/80">
          <table class="table table-sm @4xl:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs @4xl:text-sm">
              <tr><td><code>x</code></td><td><code><a href="#alignments" class="link link-primary">ScrollAlignment</a></code></td><td>Alignment on the horizontal axis.</td></tr>
              <tr><td><code>y</code></td><td><code><a href="#alignments" class="link link-primary">ScrollAlignment</a></code></td><td>Alignment on the vertical axis.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- ScrollAlignment -->
      <section id="alignments" class="mb-12">
        <h4 class="docs-prop-subheader">ScrollAlignment</h4>
        <div class="prose prose-sm max-w-none mb-4 text-base-content/80">
          <p>Controls the item's final position in the viewport during <code>scrollToIndex</code>.</p>
        </div>
        <div class="docs-table-container text-base-content/80">
          <table class="table table-sm @4xl:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr>
                <th class="w-1/4">Value</th>
                <th>Behavior</th>
              </tr>
            </thead>
            <tbody class="text-xs @4xl:text-sm">
              <tr>
                <td><code class="docs-prop-name">'start'</code></td>
                <td>Aligns to top (vertical) or left (horizontal) edge.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">'center'</code></td>
                <td>Aligns to viewport center.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">'end'</code></td>
                <td>Aligns to bottom (vertical) or right (horizontal) edge.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">'auto'</code> <span class="badge badge-sm badge-outline opacity-50 ms-1">Default</span></td>
                <td><strong>Smart:</strong> If the item is already fully visible, no scroll occurs. Otherwise, aligns to 'start' or 'end' to bring it into view.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SnapMode -->
      <section id="snap-modes" class="mb-12">
        <h4 class="docs-prop-subheader">SnapMode</h4>
        <div class="prose prose-sm max-w-none mb-4 text-base-content/80">
          <p>Defines how items align when user scrolling stops. <strong>Note:</strong> Snapping is disabled for items larger than the viewport.</p>
        </div>
        <div class="docs-table-container text-base-content/80">
          <table class="table table-sm @4xl:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr>
                <th class="w-1/4">Value</th>
                <th>Behavior</th>
              </tr>
            </thead>
            <tbody class="text-xs @4xl:text-sm">
              <tr>
                <td><code class="docs-prop-name">false</code></td>
                <td>No snapping (default).</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">true</code> / <code class="docs-prop-name">'auto'</code></td>
                <td><strong>Smart Directional:</strong> If scrolling towards start, acts as <code>'end'</code>. If scrolling towards end, acts as <code>'start'</code>.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">'next'</code></td>
                <td>Snaps to the next (closest) snap position in the direction of the scroll.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">'start'</code></td>
                <td>Snaps the first visible item to the top/left edge if >= 50% is visible, otherwise snaps the next item.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">'center'</code></td>
                <td>Snaps the item intersecting the viewport center to be exactly centered.</td>
              </tr>
              <tr>
                <td><code class="docs-prop-name">'end'</code></td>
                <td>Snaps the last visible item to the bottom/right edge if >= 50% is visible, otherwise snaps the previous item.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- UseVirtualScrollSizesProps -->
      <section id="use-virtual-scroll-sizes-props" class="mb-12">
        <h4 class="docs-prop-subheader">UseVirtualScrollSizesProps</h4>
        <div class="docs-table-container overflow-x-auto text-base-content/80">
          <table class="table table-xs @4xl:table-sm table-zebra w-full min-w-150">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs opacity-90">
              <tr><td><code>props</code></td><td><code><a href="#virtual-scroll-props" class="link link-primary">VirtualScrollProps</a></code></td><td>Virtual scroll configuration.</td></tr>
              <tr><td><code>isDynamicItemSize</code></td><td><code>boolean</code></td><td>Whether items have dynamic heights/widths.</td></tr>
              <tr><td><code>isDynamicColumnWidth</code></td><td><code>boolean</code></td><td>Whether columns have dynamic widths.</td></tr>
              <tr><td><code>defaultSize</code></td><td><code>number</code></td><td>Fallback size for items before they are measured.</td></tr>
              <tr><td><code>fixedItemSize</code></td><td><code>number | null</code></td><td>Fixed item size if applicable.</td></tr>
              <tr><td><code>direction</code></td><td><code><a href="#scroll-direction" class="link link-primary">ScrollDirection</a></code></td><td>The scroll direction.</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- FenwickTree -->
      <section id="fenwick-tree" class="mb-12">
        <h4 class="docs-prop-subheader">FenwickTree</h4>
        <div class="prose prose-sm max-w-none mb-4 text-base-content/80">
          <p>A highly optimized data structure for <em>O(log n)</em> prefix sum calculations and point updates.</p>
        </div>
        <div class="docs-table-container text-base-content/80">
          <table class="table table-sm @4xl:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr><th class="w-1/4">Method</th><th class="w-1/4">Signature</th><th>Description</th></tr>
            </thead>
            <tbody class="text-xs @4xl:text-sm">
              <tr><td><code>update</code></td><td><code>(index, delta) => void</code></td><td>Update value at index and propagate changes.</td></tr>
              <tr><td><code>query</code></td><td><code>(index) => number</code></td><td>Get prefix sum up to index (exclusive).</td></tr>
              <tr><td><code>get</code></td><td><code>(index) => number</code></td><td>Get individual value at index.</td></tr>
              <tr><td><code>findLowerBound</code></td><td><code>(value) => number</code></td><td>Find largest index where prefix sum &lt;= value.</td></tr>
              <tr><td><code>rebuild</code></td><td><code>() => void</code></td><td>Rebuild tree from current values in <em>O(n)</em>.</td></tr>
              <tr><td><code>resize</code></td><td><code>(size) => void</code></td><td>Resize tree while preserving values.</td></tr>
              <tr><td><code>shift</code></td><td><code>(offset) => void</code></td><td>Shift values by offset (useful for prepending).</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <h3 class="docs-section-header text-2xl mt-24 text-secondary">Methods</h3>

      <div class="space-y-8 mb-10">
        <!-- Method: scrollToIndex -->
        <div id="method-scrolltoindex" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> scrollToIndex()
          </h4>
          <CodeBlock
            class="docs-code-block mb-4 font-mono text-xs"
            lang="ts"
            code="scrollToIndex(
rowIndex?: number | null,
colIndex?: number | null,
options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions
): void"
          />
          <div class="prose prose-sm max-w-none opacity-90 space-y-4">
            <p>Ensures a specific item is visible within the viewport. If the item's size is dynamic and not yet measured, the scroll position will be automatically corrected after rendering.</p>
            <div class="overflow-x-auto">
              <table class="table table-xs w-full bg-base-200">
                <thead class="text-base-content"><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
                <tbody>
                  <tr><td><code>rowIndex</code></td><td><code>number | null</code></td><td>Target row. <code>null</code> to keep current Y. Optional.</td></tr>
                  <tr><td><code>colIndex</code></td><td><code>number | null</code></td><td>Target column. <code>null</code> to keep current X. Optional.</td></tr>
                  <tr><td><code>options</code></td><td><code><a href="#scroll-to-index-options" class="link link-secondary">Options</a></code></td><td>Alignment and behavior settings.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Method: scrollToOffset -->
        <div id="method-scrolltooffset" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> scrollToOffset()
          </h4>
          <CodeBlock
            class="docs-code-block mb-4 font-mono text-xs"
            lang="ts"
            code="scrollToOffset(
x?: number | null,
y?: number | null,
options?: { behavior?: 'auto' | 'smooth' } // behavior default: 'auto'
): void"
          />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Scrolls the container to an absolute pixel position. Clamped between <code>0</code> and the calculated total size.</p>
          </div>
        </div>

        <!-- Method: refresh -->
        <div id="method-refresh" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> refresh()
          </h4>
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Invalidates all cached measurements and triggers a full re-initialization. Use this if your item source data changes in a way that affects sizes without changing the <code>items</code> array reference.</p>
          </div>
        </div>

        <!-- Method: updateItemSize -->
        <div id="method-updateitemsize" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> updateItemSize()
          </h4>
          <CodeBlock
            class="docs-code-block mb-4 font-mono text-xs"
            lang="ts"
            code="updateItemSize(
index: number,
width: number,
height: number,
element?: HTMLElement
): void"
          />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Manually registers a new measurement for a single item. The <code>element</code> parameter allows the virtualizer to detect columns from any internal structure using <code>data-col-index</code> attributes.</p>
          </div>
        </div>

        <!-- Method: updateItemSizes -->
        <div id="method-updateitemsizes" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> updateItemSizes()
          </h4>
          <CodeBlock
            class="docs-code-block mb-4 font-mono text-xs"
            lang="ts"
            code="updateItemSizes(updates: Array<{ index: number; inlineSize: number; blockSize: number; element?: HTMLElement }>): void"
          />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Batched version of <code>updateItemSize</code>. More efficient when many items are measured simultaneously.</p>
          </div>
        </div>

        <!-- Method: updateHostOffset -->
        <div id="method-updatehostoffset" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> updateHostOffset()
          </h4>
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Forces a recalculation of the host element's position relative to the scroll container. Call this if the layout changes in a way that shifts the component without triggering a resize event.</p>
          </div>
        </div>

        <!-- Method: updateDirection -->
        <div id="method-updatedirection" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> updateDirection()
          </h4>
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Manually triggers the detection of the scroll direction (LTR or RTL). The component also performs this automatically on mount and whenever the <code>container</code> prop changes.</p>
          </div>
        </div>

        <!-- Method: getColumnWidth -->
        <div id="method-getcolumnwidth" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getColumnWidth()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getColumnWidth(index: number): number" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the currently calculated width for a specific column index, taking measurements and gaps into account.</p>
          </div>
        </div>

        <!-- Method: getRowHeight -->
        <div id="method-getrowheight" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getRowHeight()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getRowHeight(index: number): number" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the currently calculated height for a specific row index, taking measurements and gaps into account.</p>
          </div>
        </div>

        <!-- Method: getRowOffset -->
        <div id="method-getrowoffset" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getRowOffset()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getRowOffset(index: number): number" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the virtual vertical offset (top) of a row in virtual units (VU).</p>
          </div>
        </div>

        <!-- Method: getColumnOffset -->
        <div id="method-getcolumnoffset" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getColumnOffset()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getColumnOffset(index: number): number" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the virtual horizontal offset (left) of a column in virtual units (VU).</p>
          </div>
        </div>

        <!-- Method: getItemOffset -->
        <div id="method-getitemoffset" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getItemOffset()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getItemOffset(index: number): number" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the virtual offset of an item along the scroll axis in virtual units (VU).</p>
          </div>
        </div>

        <!-- Method: getItemSize -->
        <div id="method-getitemsize" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getItemSize()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getItemSize(index: number): number" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the size of an item along the scroll axis in virtual units (VU).</p>
          </div>
        </div>

        <!-- Method: getRowIndexAt -->
        <div id="method-getrowindexat" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getRowIndexAt()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getRowIndexAt(offset: number): number" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the row (or item) index at a specific vertical (or horizontal in horizontal mode) virtual offset (VU).</p>
          </div>
        </div>

        <!-- Method: getColIndexAt -->
        <div id="method-getcolindexat" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getColIndexAt()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getColIndexAt(offset: number): number" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the column index at a specific horizontal virtual offset (VU).</p>
          </div>
        </div>

        <!-- Method: getItemAriaProps -->
        <div id="method-getitemariaprops" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getItemAriaProps()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getItemAriaProps(index: number): Record<string, string | number | undefined>" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the ARIA attributes for an item at the given index. Includes <code>role</code>, <code>aria-setsize</code>, and <code>aria-posinset</code> (or <code>aria-rowindex</code> for grids).</p>
          </div>
        </div>

        <!-- Method: getCellAriaProps -->
        <div id="method-getcellariaprops" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> getCellAriaProps()
          </h4>
          <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getCellAriaProps(colIndex: number): Record<string, string | number | undefined>" />
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Returns the ARIA attributes for a cell at the given column index. Only relevant for <code>direction="both"</code> or <code>role="grid"</code>. Includes <code>role="gridcell"</code> and <code>aria-colindex</code>.</p>
          </div>
        </div>

        <!-- Method: stopProgrammaticScroll -->
        <div id="method-stopprogrammaticscroll" class="docs-method-card docs-method-card--secondary">
          <h4 class="docs-method-title docs-method-title--secondary">
            <span class="badge badge-secondary">Method</span> stopProgrammaticScroll()
          </h4>
          <div class="prose prose-sm max-w-none opacity-90">
            <p>Immediately halts any active smooth scroll animation and clears pending scroll requests.</p>
          </div>
        </div>
      </div>
    </section>

    <div class="divider opacity-30" />

    <!-- 8. Utility Functions -->
    <section id="utility-functions">
      <h2 class="docs-section-header">Utility Functions</h2>
      <div class="grid grid-cols-1 @4xl:grid-cols-2 gap-6">
        <div class="docs-card docs-card--accent-thin text-base-content/80">
          <h4 class="font-bold text-accent mb-2 flex items-center gap-2">
            Type Guards
          </h4>
          <div class="space-y-1 text-xs @4xl:text-sm opacity-80">
            <p><code>isElement(val?)</code>: Checks if a value is a standard <code>HTMLElement</code> (explicitly excluding <code>window</code>). Optional.</p>
            <p><code>isWindow(val?)</code>: Checks for global <code>window</code> object. Optional.</p>
            <p><code>isBody(val?)</code>: Checks for <code>document.body</code>. Optional.</p>
            <p><code>isWindowLike(val?)</code>: Matches <code>window</code> or <code>body</code>. Optional.</p>
            <p><code>isScrollableElement(val?)</code>: Checks if a value is an <code>HTMLElement</code> or <code>Window</code> that exposes native scroll properties like <code>scrollLeft</code>. Optional.</p>
            <p><code>isScrollToIndexOptions(val)</code>: Type guard for <code>ScrollToIndexOptions</code> object.</p>
          </div>
        </div>
        <div class="docs-card docs-card--accent-thin text-base-content/80">
          <h4 class="font-bold text-accent mb-2">getPaddingX / getPaddingY</h4>
          <p class="text-[10px] opacity-60 mb-2"><code>(p: number | object, dir: string): number</code></p>
          <p class="text-xs @4xl:text-sm opacity-80">Extracts effective pixel padding from <code>scrollPadding</code> props, taking the current <code>direction</code> into account.</p>
        </div>
        <div class="docs-card docs-card--accent-thin text-base-content/80">
          <h4 class="font-bold text-accent mb-2">Coordinate Mapping</h4>
          <div class="space-y-1 text-xs @4xl:text-sm opacity-80 mb-2">
            <p><code>displayToVirtual(displayPos, hostOffset, scale)</code>: Maps display pixels (DU) to virtual content position (VU).</p>
            <p><code>virtualToDisplay(virtualPos, hostOffset, scale)</code>: Maps virtual content position (VU) to display pixels (DU).</p>
          </div>
          <h4 class="font-bold text-accent mb-2">isItemVisible</h4>
          <p class="text-[10px] opacity-60 mb-2"><code>(pos, size, scroll, view, sticky?): boolean</code></p>
          <p class="text-xs @4xl:text-sm opacity-80">Highly accurate visibility check (VU) used for auto-alignment and rendering ranges.</p>
        </div>
        <div class="docs-card docs-card--accent-thin text-base-content/80">
          <h4 class="font-bold text-accent mb-2">FenwickTree</h4>
          <p class="text-[10px] opacity-60 mb-2"><code>class FenwickTree(size: number)</code></p>
          <p class="text-xs @4xl:text-sm opacity-80">Highly optimized data structure for <em>O(log n)</em> prefix sum calculations and point updates. Used internally for all position tracking.</p>
        </div>
        <div class="docs-card docs-card--accent-thin text-base-content/80">
          <h4 class="font-bold text-accent mb-2">Default Values & Constants</h4>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs @4xl:text-sm">
              <code class="text-primary">DEFAULT_ITEM_SIZE</code>
              <code class="opacity-60">{{ DEFAULT_ITEM_SIZE }}px</code>
            </div>
            <div class="flex items-center justify-between text-xs @4xl:text-sm">
              <code class="text-primary">DEFAULT_COLUMN_WIDTH</code>
              <code class="opacity-60">{{ DEFAULT_COLUMN_WIDTH }}px</code>
            </div>
            <div class="flex items-center justify-between text-xs @4xl:text-sm">
              <code class="text-primary">DEFAULT_BUFFER</code>
              <code class="opacity-60">{{ DEFAULT_BUFFER }} items</code>
            </div>
            <div class="flex items-center justify-between text-xs @4xl:text-sm">
              <code class="text-primary">BROWSER_MAX_SIZE</code>
              <code class="opacity-60">10,000,000px</code>
            </div>
          </div>
          <p class="text-[10px] opacity-60 mt-4 italic">
            Values applied when props are omitted or dynamic estimates are needed. <code>BROWSER_MAX_SIZE</code> defines the scaling threshold.
          </p>
        </div>
      </div>
    </section>

    <!-- 9. SSR Support -->
    <section id="ssr-support">
      <h2 class="docs-section-header">SSR & Hydration</h2>
      <div class="prose prose-sm @4xl:prose-md max-w-none text-base-content/90">
        <p>The library supports Server-Side Rendering via the <code>ssrRange</code> prop. When provided, the specified items are rendered "in-flow" on the server.</p>
        <div class="docs-alert docs-alert--warning mt-6">
          <h4 class="font-bold mb-2">Hydration Logic</h4>
          <ol class="list-decimal ps-5 space-y-2 opacity-90">
            <li><strong>Server</strong>: Renders a static block of items at <code>ssrRange</code>.</li>
            <li><strong>Client (Pre-mount)</strong>: Renders the same items to match server HTML.</li>
            <li><strong>Client (Mounted)</strong>: Calculates total dimensions, scrolls to exactly match the pre-rendered range, and then transitions to absolute positioning for virtualization.</li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>
