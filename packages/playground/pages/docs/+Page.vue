<script setup lang="ts">
import { DEFAULT_BUFFER, DEFAULT_COLUMN_WIDTH, DEFAULT_ITEM_SIZE } from '@pdanpdan/virtual-scroll';

import AppLogo from '#/components/AppLogo.vue';
import CodeBlock from '#/components/CodeBlock.vue';
</script>

<template>
  <div class="pb-10">
    <div class="card shadow-soft bg-base-300">
      <div class="card-body flex-row items-center p-4 md:p-8 gap-4 md:gap-8">
        <AppLogo class="shrink-0 size-24 hidden md:block drop-shadow-lg" />
        <div>
          <h1 class="text-primary">API Reference</h1>
          <p class="text-base md:text-xl opacity-60 font-medium mt-1">
            Complete documentation for <code>@pdanpdan/virtual-scroll</code>.
          </p>
        </div>
      </div>
    </div>

    <div class="space-y-12 md:space-y-16 mt-8">
      <!-- 1. Introduction -->
      <section id="introduction">
        <h2 class="docs-section-header">Introduction</h2>
        <div class="prose prose-sm md:prose-lg max-w-none">
          <p>
            <code>@pdanpdan/virtual-scroll</code> is a high-performance Vue 3 virtual scroll library designed to handle massive lists with ease.
            It supports vertical, horizontal, and bidirectional (grid) scrolling, dynamic item sizes using <code>ResizeObserver</code>,
            and integration with the browser's native window scroll.
          </p>
        </div>
      </section>

      <!-- 1.1 Key Features -->
      <section id="features">
        <h2 class="docs-section-header">Key Features</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div class="card bg-base-300 shadow-sm border border-base-content/5">
            <div class="card-body p-4 flex-row gap-4">
              <div class="text-primary text-2xl font-bold">✓</div>
              <div>
                <h4 class="font-bold text-sm">Bidirectional Scrolling</h4>
                <p class="text-xs opacity-70">Virtualize both rows and columns for massive data grids.</p>
              </div>
            </div>
          </div>
          <div class="card bg-base-300 shadow-sm border border-base-content/5">
            <div class="card-body p-4 flex-row gap-4">
              <div class="text-primary text-2xl font-bold">✓</div>
              <div>
                <h4 class="font-bold text-sm">Dynamic Item Sizes</h4>
                <p class="text-xs opacity-70">Automatic measurement via ResizeObserver for precise scrolling.</p>
              </div>
            </div>
          </div>
          <div class="card bg-base-300 shadow-sm border border-base-content/5">
            <div class="card-body p-4 flex-row gap-4">
              <div class="text-primary text-2xl font-bold">✓</div>
              <div>
                <h4 class="font-bold text-sm">Native Window Scroll</h4>
                <p class="text-xs opacity-70">Use the browser window/body as the scroll container.</p>
              </div>
            </div>
          </div>
          <div class="card bg-base-300 shadow-sm border border-base-content/5">
            <div class="card-body p-4 flex-row gap-4">
              <div class="text-primary text-2xl font-bold">✓</div>
              <div>
                <h4 class="font-bold text-sm">Sticky Headers/Footers</h4>
                <p class="text-xs opacity-70">iOS-style pushing headers for segmented lists and groups.</p>
              </div>
            </div>
          </div>
          <div class="card bg-base-300 shadow-sm border border-base-content/5">
            <div class="card-body p-4 flex-row gap-4">
              <div class="text-primary text-2xl font-bold">✓</div>
              <div>
                <h4 class="font-bold text-sm">Scroll Restoration</h4>
                <p class="text-xs opacity-70">Maintains position when prepending items (perfect for chat).</p>
              </div>
            </div>
          </div>
          <div class="card bg-base-300 shadow-sm border border-base-content/5">
            <div class="card-body p-4 flex-row gap-4">
              <div class="text-primary text-2xl font-bold">✓</div>
              <div>
                <h4 class="font-bold text-sm">SSR & Hydration</h4>
                <p class="text-xs opacity-70">Full support for server-side rendering and client hydration.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Quick Start -->
      <section id="quick-start">
        <h2 class="docs-section-header">Quick Start</h2>
        <div class="prose prose-sm md:prose-md max-w-none mb-4 md:mb-6">
          <p>Install the package using your favorite package manager:</p>
        </div>
        <CodeBlock class="docs-code-block" code="pnpm add @pdanpdan/virtual-scroll" lang="bash" />
        <div class="prose prose-sm md:prose-md max-w-none mb-4 md:mb-6 mt-8">
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <div class="card shadow-soft bg-base-300 border-primary/10 overflow-hidden">
            <div class="card-body p-5">
              <h3 class="card-title text-base md:text-lg text-primary">Compiled Component</h3>
              <p class="text-xs md:text-sm opacity-90 mb-4">Recommended for most projects. Uses pre-compiled JS.</p>
              <CodeBlock
                class="docs-code-block"
                lang="ts"
                code="import { VirtualScroll } from &quot;@pdanpdan/virtual-scroll&quot;;
import &quot;@pdanpdan/virtual-scroll/style.css&quot;;"
              />
              <ul class="list-disc pl-5 text-xs md:text-sm space-y-1 opacity-80">
                <li>Compatible with all modern bundlers.</li>
                <li><strong>Note:</strong> Manual CSS import is required.</li>
              </ul>
            </div>
          </div>

          <div class="card shadow-soft bg-base-300 border-secondary/10 overflow-hidden">
            <div class="card-body p-5">
              <h3 class="card-title text-base md:text-lg text-secondary">Original Vue SFC</h3>
              <p class="text-xs md:text-sm opacity-90 mb-4">Import raw source for custom compilation.</p>
              <CodeBlock
                class="docs-code-block"
                lang="ts"
                code="import VS from &quot;@pdanpdan/virtual-scroll/VirtualScroll.vue&quot;;"
              />
              <ul class="list-disc pl-5 text-xs md:text-sm space-y-1 opacity-80">
                <li>Enables better tree-shaking in your build.</li>
                <li>Styles handled by your Vue loader.</li>
              </ul>
            </div>
          </div>

          <div class="card shadow-soft bg-base-300 border-accent/10 overflow-hidden">
            <div class="card-body p-5">
              <h3 class="card-title text-base md:text-lg text-accent">CDN Usage</h3>
              <p class="text-xs md:text-sm opacity-90 mb-4">Use directly in browser without build step.</p>
              <CodeBlock
                class="docs-code-block"
                lang="html"
                code="&lt;script src=&quot;https://unpkg.com/vue@3&quot;&gt;&lt;/script&gt;
&lt;link rel=&quot;stylesheet&quot; href=&quot;https://unpkg.com/@pdanpdan/virtual-scroll/dist/virtual-scroll.css&quot;&gt;
&lt;script src=&quot;https://unpkg.com/@pdanpdan/virtual-scroll&quot;&gt;&lt;/script&gt;"
              />
              <ul class="list-disc pl-5 text-xs md:text-sm space-y-1 opacity-80 mt-2">
                <li>No installation required.</li>
                <li>Available via <code>window.VirtualScroll</code>.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div class="divider opacity-30" />

      <!-- 4. Sizing Guide -->
      <section id="sizing-guide">
        <h2 class="docs-section-header">Sizing Guide</h2>
        <div class="prose prose-sm md:prose-md max-w-none text-base-content/90 mb-12">
          <p>
            The library offers flexible ways to define item and column sizes. Calculations are optimized based on the type of sizing used.
          </p>
          <div class="docs-table-container mt-4">
            <table class="table table-sm md:table-md table-zebra w-full border border-base-content/5">
              <thead class="bg-base-300 text-base-content">
                <tr>
                  <th>Type</th>
                  <th><code>itemSize</code> / <code>columnWidth</code></th>
                  <th>Perf</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody class="text-xs md:text-sm text-base-content/80">
                <tr>
                  <td><strong>Fixed</strong></td>
                  <td><code>number</code></td>
                  <td><span class="badge badge-success badge-soft badge-xs">Best</span></td>
                  <td>Uniform size for all items. Calculations are <em>O(1)</em>.</td>
                </tr>
                <tr>
                  <td><strong>Array</strong></td>
                  <td><code>number[]</code> (cols only)</td>
                  <td><span class="badge badge-info badge-soft badge-xs">Great</span></td>
                  <td>Fixed sizes from array (cycles if shorter). <em>O(log n)</em>.</td>
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
        <div class="prose prose-sm md:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            The <code>VirtualScroll</code> component is the primary way to use this library. It provides a declarative Vue interface
            for virtualizing large lists and grids, handling all rendering, recycling, and scroll logic automatically.
            It is designed to be flexible, supporting uniform or dynamic item sizes, sticky headers, infinite scroll,
            and custom HTML structures via the <code>containerTag</code>, <code>wrapperTag</code>, and <code>itemTag</code> props.
          </p>
        </div>

        <h3 id="props" class="docs-prop-header">Props</h3>

        <h4 class="docs-prop-subheader">Core Configuration</h4>
        <div class="docs-table-container mb-8">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
              <tr>
                <td><code class="text-primary font-bold">items</code></td>
                <td><code>T[]</code></td>
                <td>-</td>
                <td>The array of items to render. Required.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">itemSize</code></td>
                <td><code>number | fn | null</code></td>
                <td><code>{{ DEFAULT_ITEM_SIZE }}</code></td>
                <td>Fixed size or function. See <a href="#sizing-guide" class="link">Sizing Guide</a>.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">direction</code></td>
                <td><code>'vertical' | 'horizontal' | 'both'</code></td>
                <td><code>'vertical'</code></td>
                <td>The scroll direction.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">gap</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Spacings between items (vertical or horizontal).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="docs-prop-subheader">Grid Configuration <span class="text-xs normal-case opacity-60">(only for direction="both")</span></h4>
        <div class="docs-table-container mb-8">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
              <tr>
                <td><code class="text-primary font-bold">columnCount</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Number of columns for grid mode.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">columnWidth</code></td>
                <td><code>num | arr | fn | null</code></td>
                <td><code>{{ DEFAULT_COLUMN_WIDTH }}</code></td>
                <td>Width for columns in grid mode.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">columnGap</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Spacings between columns.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="docs-prop-subheader">Features & Behavior</h4>
        <div class="docs-table-container mb-8">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
              <tr>
                <td><code class="text-primary font-bold">stickyIndices</code></td>
                <td><code>number[]</code></td>
                <td><code>[]</code></td>
                <td>Indices of items that should remain sticky.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">stickyHeader</code> / <code class="text-primary font-bold">stickyFooter</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>If true, header/footer size is measured and added to padding.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">ssrRange</code></td>
                <td><code>{start, end, ...}</code></td>
                <td>-</td>
                <td>Range of items to pre-render. See <a href="#ssr-support" class="link">SSR Support</a>.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">loading</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Shows <code>#loading</code> slot and prevents multiple <code>load</code> events.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">loadDistance</code></td>
                <td><code>number</code></td>
                <td><code>200</code></td>
                <td>Distance from end to trigger <code>load</code> event.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">restoreScrollOnPrepend</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Maintain scroll position when items are added to the top.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">initialScrollIndex</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Index to jump to on mount.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">initialScrollAlign</code></td>
                <td><code>ScrollAlignment | ...</code></td>
                <td><code>'start'</code></td>
                <td>Alignment for initial index. See <a href="#alignments" class="link">Alignments</a>.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="docs-prop-subheader">Advanced & Performance</h4>
        <div class="docs-table-container mb-8">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
              <tr>
                <td><code class="text-primary font-bold">container</code></td>
                <td><code>El | Window | null</code></td>
                <td><code>undefined</code></td>
                <td>The scrollable container. Defaults to component root.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">scrollPaddingStart</code> / <code class="text-primary font-bold">End</code></td>
                <td><code>num | {x, y}</code></td>
                <td><code>0</code></td>
                <td>Additional padding for scroll offsets.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">containerTag</code> / <code class="text-primary font-bold">wrapperTag</code> / <code class="text-primary font-bold">itemTag</code></td>
                <td><code>string</code></td>
                <td><code>'div'</code></td>
                <td>HTML tags for different parts of the component.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">bufferBefore</code> / <code class="text-primary font-bold">bufferAfter</code></td>
                <td><code>number</code></td>
                <td><code>{{ DEFAULT_BUFFER }}</code></td>
                <td>Number of items to render outside the viewport.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">defaultItemSize</code></td>
                <td><code>number</code></td>
                <td><code>{{ DEFAULT_ITEM_SIZE }}</code></td>
                <td>Estimated size for items before measurement.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">defaultColumnWidth</code></td>
                <td><code>number</code></td>
                <td><code>{{ DEFAULT_COLUMN_WIDTH }}</code></td>
                <td>Estimated width for columns before measurement.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">debug</code></td>
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

        <h3 id="slots" class="docs-prop-header">Slots</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div class="card shadow-soft bg-base-300 p-4 border-l-4 border-primary">
            <h4 class="font-bold text-primary mb-2">#item</h4>
            <p class="text-xs md:text-sm opacity-90 mb-2">Scoped slot for individual items.</p>
            <ul class="text-xs opacity-80 list-disc pl-5 space-y-1 text-base-content/80">
              <li><code>item: T</code>: The data item from the source array.</li>
              <li><code>index: number</code>: The original 0-based index of the item.</li>
              <li><code>isSticky: boolean</code>: <code>true</code> if the item is configured to be sticky via <code>stickyIndices</code>.</li>
              <li><code>isStickyActive: boolean</code>: <code>true</code> if the item is currently stuck at the threshold.</li>
              <li><code>columnRange: <a href="#column-range" class="link">ColumnRange</a></code>: Precise indices and paddings for visible columns.</li>
              <li><code>getColumnWidth: (index: number) => number</code>: Helper to get the calculated width of any column.</li>
            </ul>
          </div>
          <div class="space-y-4">
            <div class="card shadow-soft bg-base-300 p-4 border-l-4 border-secondary">
              <h4 class="font-bold text-secondary mb-2">#header / #footer</h4>
              <p class="text-xs md:text-sm opacity-90">Content rendered above/below the virtualized items. Can be made sticky using the <code>stickyHeader</code> / <code>stickyFooter</code> props.</p>
            </div>
            <div class="card shadow-soft bg-base-300 p-4 border-l-4 border-accent">
              <h4 class="font-bold text-accent mb-2">#loading</h4>
              <p class="text-xs md:text-sm opacity-90">Shown at the end of the scrollable area when <code>loading</code> prop is true. Prevents redundant <code>load</code> events.</p>
            </div>
          </div>
        </div>

        <h3 id="events" class="docs-prop-header">Events</h3>
        <div class="docs-table-container mb-10">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300">
              <tr>
                <th>Event</th>
                <th>Payload</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
              <tr>
                <td><code>scroll</code></td>
                <td><code><a href="#scroll-details" class="link">ScrollDetails&lt;T&gt;</a></code></td>
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
        <div class="prose prose-sm md:prose-md max-w-none text-base-content/90 mb-10">
          <p>The container is keyboard-accessible when focused (<code>tabindex="0"</code>). It supports standard navigation keys:</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mt-4">
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <kbd class="kbd kbd-sm md:kbd-md">Home</kbd>
              <span class="text-xs md:text-sm opacity-80">Scroll to the very beginning (Index 0,0).</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <kbd class="kbd kbd-sm md:kbd-md">End</kbd>
              <span class="text-xs md:text-sm opacity-80">Scroll to the very last row and column.</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <span class="flex gap-1">
                <kbd class="kbd kbd-sm md:kbd-md">↑</kbd>
                <kbd class="kbd kbd-sm md:kbd-md">↓</kbd>
              </span>
              <span class="text-xs md:text-sm opacity-80">Scroll vertically by {{ DEFAULT_ITEM_SIZE }}px.</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <span class="flex gap-1">
                <kbd class="kbd kbd-sm md:kbd-md">←</kbd>
                <kbd class="kbd kbd-sm md:kbd-md">→</kbd>
              </span>
              <span class="text-xs md:text-sm opacity-80">Scroll horizontally by {{ DEFAULT_ITEM_SIZE }}px.</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <kbd class="kbd kbd-sm md:kbd-md">PgUp</kbd> / <kbd class="kbd kbd-sm md:kbd-md">PgDn</kbd>
              <span class="text-xs md:text-sm opacity-80">Scroll by one full viewport height/width.</span>
            </div>
          </div>
        </div>

        <h3 id="css-classes" class="docs-prop-header">CSS Classes</h3>
        <div class="docs-table-container mb-10 text-base-content/80">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr>
                <th class="w-1/3">Class</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <a href="#scroll-details" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-secondary font-bold text-xs">scrollDetails</code>
            <p class="text-[10px] opacity-60 mt-1">Full reactive state of the virtualizer.</p>
          </a>
          <a href="#column-range" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-secondary font-bold text-xs">columnRange</code>
            <p class="text-[10px] opacity-60 mt-1">Visible column indices and paddings.</p>
          </a>
          <a href="#method-getcolumnwidth" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">getColumnWidth()</code>
            <p class="text-[10px] opacity-60 mt-1">Get calculated width of a column.</p>
          </a>
          <a href="#method-scrolltoindex" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">scrollToIndex()</code>
            <p class="text-[10px] opacity-60 mt-1">Scroll to a specific row/column.</p>
          </a>
          <a href="#method-scrolltooffset" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">scrollToOffset()</code>
            <p class="text-[10px] opacity-60 mt-1">Scroll to precise pixel position.</p>
          </a>
          <a href="#method-refresh" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">refresh()</code>
            <p class="text-[10px] opacity-60 mt-1">Reset all dynamic measurements.</p>
          </a>
          <a href="#method-stopprogrammaticscroll" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">stopProgrammaticScroll()</code>
            <p class="text-[10px] opacity-60 mt-1">Halt smooth scroll animations.</p>
          </a>
        </div>
      </section>

      <div class="divider opacity-30" />

      <!-- 6. useVirtualScroll Composable -->
      <section id="use-virtual-scroll">
        <h2 class="docs-section-header">useVirtualScroll Composable</h2>
        <div class="prose prose-sm md:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            The <code>useVirtualScroll</code> composable provides the core virtualization logic. It's recommended for advanced use cases or when building custom wrappers.
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

        <h3 id="composable-parameters" class="docs-prop-header">Parameters</h3>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>Accepts a single <code>Ref</code> to a <a href="#virtual-scroll-props" class="link link-primary font-semibold">VirtualScrollProps</a> object.</p>
        </div>

        <h3 id="composable-state" class="docs-prop-header">Return Value</h3>
        <div class="prose prose-sm max-w-none mb-6 text-base-content/80">
          <p>
            Returns a set of reactive references and methods for managing the virtual scroll state:
          </p>
        </div>
        <div class="docs-table-container mb-12 text-base-content/80 text-xs md:text-sm">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300 text-base-content">
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><a href="#rendered-item" class="link font-bold text-secondary">renderedItems</a></td>
                <td><code>Ref&lt;RenderedItem&lt;T&gt;[]&gt;</code></td>
                <td>List of items to render in the current buffer.</td>
              </tr>
              <tr>
                <td><a href="#scroll-details" class="link font-bold text-secondary">scrollDetails</a></td>
                <td><code>Ref&lt;ScrollDetails&lt;T&gt;&gt;</code></td>
                <td>Full reactive state of the virtual scroll system.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">totalWidth</code> / <code class="text-secondary font-bold">totalHeight</code></td>
                <td><code>Ref&lt;number&gt;</code></td>
                <td>Calculated dimensions of the entire list/grid.</td>
              </tr>
              <tr>
                <td><a href="#column-range" class="link font-bold text-secondary">columnRange</a></td>
                <td><code>Ref&lt;ColumnRange&gt;</code></td>
                <td>Visible columns and their associated paddings.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">isHydrated</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td><code>true</code> when the component is mounted and hydrated.</td>
              </tr>
              <tr>
                <td><a href="#method-scrolltoindex" class="link font-bold text-primary">scrollToIndex</a></td>
                <td><code>Function</code></td>
                <td>Programmatic scroll to a specific index.</td>
              </tr>
              <tr>
                <td><a href="#method-scrolltooffset" class="link font-bold text-primary">scrollToOffset</a></td>
                <td><code>Function</code></td>
                <td>Programmatic scroll to a pixel offset.</td>
              </tr>
              <tr>
                <td><a href="#method-stopprogrammaticscroll" class="link font-bold text-primary">stopProgrammaticScroll</a></td>
                <td><code>Function</code></td>
                <td>Cancel any active smooth scroll animation.</td>
              </tr>
              <tr>
                <td><a href="#method-updateitemsize" class="link font-bold text-primary">updateItemSize</a></td>
                <td><code>Function</code></td>
                <td>Register a manual item measurement.</td>
              </tr>
              <tr>
                <td><a href="#method-updateitemsizes" class="link font-bold text-primary">updateItemSizes</a></td>
                <td><code>Function</code></td>
                <td>Register multiple manual item measurements.</td>
              </tr>
              <tr>
                <td><a href="#method-updatehostoffset" class="link font-bold text-primary">updateHostOffset</a></td>
                <td><code>Function</code></td>
                <td>Force update the container's relative position.</td>
              </tr>
              <tr>
                <td><a href="#method-getcolumnwidth" class="link font-bold text-primary">getColumnWidth</a></td>
                <td><code>Function</code></td>
                <td>Helper to get a column's width.</td>
              </tr>
              <tr>
                <td><a href="#method-refresh" class="link font-bold text-primary">refresh</a></td>
                <td><code>Function</code></td>
                <td>Resets all measurements and state.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="divider opacity-30" />

      <!-- 7. API Reference -->
      <section id="api-reference">
        <h2 class="docs-section-header">API Reference</h2>

        <h3 class="docs-section-header text-2xl mt-16">Types</h3>

        <!-- ScrollDetails -->
        <section id="scroll-details" class="mb-12">
          <h4 class="docs-prop-subheader">ScrollDetails&lt;T&gt;</h4>
          <div class="docs-table-container text-base-content/80">
            <table class="table table-sm md:table-md table-zebra w-full">
              <thead class="bg-base-300 text-base-content">
                <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
              </thead>
              <tbody class="text-xs md:text-sm">
                <tr><td><code>items</code></td><td><code><a href="#rendered-item" class="link">RenderedItem&lt;T&gt;</a>[]</code></td><td>Rendered items in the buffer.</td></tr>
                <tr><td><code>currentIndex</code></td><td><code>number</code></td><td>First visible row index.</td></tr>
                <tr><td><code>currentColIndex</code></td><td><code>number</code></td><td>First visible column index.</td></tr>
                <tr><td><code>scrollOffset</code></td><td><code>{ x, y }</code></td><td>Relative pixel scroll position.</td></tr>
                <tr><td><code>viewportSize</code></td><td><code>{ width, height }</code></td><td>Dimensions of the visible viewport.</td></tr>
                <tr><td><code>totalSize</code></td><td><code>{ width, height }</code></td><td>Estimated total content dimensions.</td></tr>
                <tr><td><code>isScrolling</code></td><td><code>boolean</code></td><td>Active scrolling state.</td></tr>
                <tr><td><code>isProgrammaticScroll</code></td><td><code>boolean</code></td><td>True if triggered by <code>scrollToIndex/Offset</code>.</td></tr>
                <tr><td><code>range</code></td><td><code>{ start, end }</code></td><td>Visible row range (inclusive start, exclusive end).</td></tr>
                <tr><td><code>columnRange</code></td><td><code><a href="#column-range" class="link">ColumnRange</a></code></td><td>Visible column range (grid).</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- RenderedItem -->
        <section id="rendered-item" class="mb-12">
          <h4 class="docs-prop-subheader">RenderedItem&lt;T&gt;</h4>
          <div class="docs-table-container text-base-content/80">
            <table class="table table-sm md:table-md table-zebra w-full">
              <thead class="bg-base-300 text-base-content">
                <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
              </thead>
              <tbody class="text-xs md:text-sm">
                <tr><td><code>item</code></td><td><code>T</code></td><td>The source data item.</td></tr>
                <tr><td><code>index</code></td><td><code>number</code></td><td>Item's position in the array.</td></tr>
                <tr><td><code>offset</code></td><td><code>{ x, y }</code></td><td>Absolute pixel position within the wrapper.</td></tr>
                <tr><td><code>size</code></td><td><code>{ width, height }</code></td><td>Current dimensions (measured or estimated).</td></tr>
                <tr><td><code>originalX</code> / <code>originalY</code></td><td><code>number</code></td><td>Offets before any sticky adjustments.</td></tr>
                <tr><td><code>isSticky</code></td><td><code>boolean</code></td><td>Is configured as sticky.</td></tr>
                <tr><td><code>isStickyActive</code></td><td><code>boolean</code></td><td>Currently stuck to the edge.</td></tr>
                <tr><td><code>stickyOffset</code></td><td><code>{ x, y }</code></td><td>Translation applied for sticky pushing effect.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ColumnRange -->
        <section id="column-range" class="mb-12">
          <h4 class="docs-prop-subheader">ColumnRange</h4>
          <div class="docs-table-container text-base-content/80">
            <table class="table table-sm md:table-md table-zebra w-full">
              <thead class="bg-base-300 text-base-content">
                <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
              </thead>
              <tbody class="text-xs md:text-sm">
                <tr><td><code>start</code></td><td><code>number</code></td><td>Index of first rendered column.</td></tr>
                <tr><td><code>end</code></td><td><code>number</code></td><td>Index of last rendered column (exclusive).</td></tr>
                <tr><td><code>padStart</code></td><td><code>number</code></td><td>Pixel space to maintain before columns.</td></tr>
                <tr><td><code>padEnd</code></td><td><code>number</code></td><td>Pixel space to maintain after columns.</td></tr>
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
            <table class="table table-xs md:table-sm table-zebra w-full min-w-150">
              <thead class="bg-base-300 text-base-content">
                <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
              </thead>
              <tbody class="text-xs opacity-90">
                <tr><td><code>items</code></td><td><code>T[]</code></td><td>Data source. Required.</td></tr>
                <tr><td><code>itemSize</code></td><td><code>num | fn | null</code></td><td>Sizing logic. Default: {{ DEFAULT_ITEM_SIZE }}px.</td></tr>
                <tr><td><code>direction</code></td><td><code>ScrollDirection</code></td><td><code>'vertical' | 'horizontal' | 'both'</code>.</td></tr>
                <tr><td><code>bufferBefore</code> / <code>bufferAfter</code></td><td><code>number</code></td><td>Items outside viewport. Default: {{ DEFAULT_BUFFER }}.</td></tr>
                <tr><td><code>container</code></td><td><code>HTMLElement | Window</code></td><td>Scroll container. Defaults to component root.</td></tr>
                <tr><td><code>hostElement</code></td><td><code>HTMLElement</code></td><td>Reference for offset calculation.</td></tr>
                <tr><td><code>ssrRange</code></td><td><code><a href="#ssr-support" class="link">SSRRange</a></code></td><td>Pre-rendered range for SSR.</td></tr>
                <tr><td><code>columnCount</code></td><td><code>number</code></td><td>Total columns for grid mode.</td></tr>
                <tr><td><code>columnWidth</code></td><td><code>num | arr | fn | null</code></td><td>Column sizing. Default: {{ DEFAULT_COLUMN_WIDTH }}px.</td></tr>
                <tr><td><code>scrollPaddingStart</code> / <code>End</code></td><td><code>num | {x, y}</code></td><td>Pixel offsets for scroll limits.</td></tr>
                <tr><td><code>gap</code> / <code>columnGap</code></td><td><code>number</code></td><td>Pixel space between items/cols.</td></tr>
                <tr><td><code>restoreScrollOnPrepend</code></td><td><code>boolean</code></td><td>Maintain chat scroll position.</td></tr>
                <tr><td><code>initialScrollIndex</code></td><td><code>number</code></td><td>Mount-time jump index.</td></tr>
                <tr><td><code>initialScrollAlign</code></td><td><code><a href="#alignments" class="link">ScrollAlignment</a> | ...</code></td><td>Alignment for initial jump.</td></tr>
                <tr><td><code>defaultItemSize</code></td><td><code>number</code></td><td>Estimate for dynamic items.</td></tr>
                <tr><td><code>defaultColumnWidth</code></td><td><code>number</code></td><td>Estimate for dynamic columns.</td></tr>
                <tr><td><code>debug</code></td><td><code>boolean</code></td><td>Enable visualization.</td></tr>
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
          <CodeBlock
            class="docs-code-block font-mono text-xs mb-4"
            lang="ts"
            code="{
  align?: ScrollAlignment | ScrollAlignmentOptions; // default: 'auto'
  behavior?: 'auto' | 'smooth'; // default: 'auto'
}"
          />
        </section>

        <!-- ScrollAlignmentOptions -->
        <section id="scroll-alignment-options" class="mb-12">
          <h4 class="docs-prop-subheader">ScrollAlignmentOptions</h4>
          <div class="prose prose-sm max-w-none mb-4 text-base-content/80">
            <p>Allows axis-specific alignment in <code>scrollToIndex</code>.</p>
          </div>
          <CodeBlock class="docs-code-block font-mono text-xs mb-4" lang="ts" code="{ x?: ScrollAlignment; y?: ScrollAlignment; }" />
        </section>

        <!-- ScrollAlignment -->
        <section id="alignments" class="mb-12">
          <h4 class="docs-prop-subheader">ScrollAlignment</h4>
          <div class="prose prose-sm max-w-none mb-4 text-base-content/80">
            <p>Controls the item's final position in the viewport during <code>scrollToIndex</code>.</p>
          </div>
          <CodeBlock class="docs-code-block font-mono text-xs mb-4" lang="ts" code="'start' | 'center' | 'end' | 'auto'" />
          <div class="docs-table-container text-base-content/80">
            <table class="table table-sm md:table-md table-zebra w-full">
              <thead class="bg-base-300 text-base-content">
                <tr>
                  <th class="w-1/4">Alignment</th>
                  <th>Behavior</th>
                </tr>
              </thead>
              <tbody class="text-xs md:text-sm">
                <tr>
                  <td><code class="text-primary font-bold">'start'</code></td>
                  <td>Aligns to top (vertical) or left (horizontal) edge.</td>
                </tr>
                <tr>
                  <td><code class="text-primary font-bold">'center'</code></td>
                  <td>Aligns to viewport center.</td>
                </tr>
                <tr>
                  <td><code class="text-primary font-bold">'end'</code></td>
                  <td>Aligns to bottom (vertical) or right (horizontal) edge.</td>
                </tr>
                <tr>
                  <td><code class="text-primary font-bold">'auto'</code> <span class="badge badge-sm badge-outline opacity-50 ml-1">Default</span></td>
                  <td><strong>Smart:</strong> If the item is already fully visible, no scroll occurs. Otherwise, aligns to 'start' or 'end' to bring it into view.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <h3 class="docs-section-header text-2xl mt-24">Methods</h3>

        <div class="space-y-8 mb-10">
          <!-- Method: scrollToIndex -->
          <div id="method-scrolltoindex" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> scrollToIndex()
            </h4>
            <CodeBlock
              class="docs-code-block mb-4 font-mono text-xs"
              lang="ts"
              code="scrollToIndex(
  rowIndex: number | null,
  colIndex: number | null,
  options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions
): void"
            />
            <div class="prose prose-sm max-w-none opacity-90 space-y-4">
              <p>Ensures a specific item is visible within the viewport. If the item's size is dynamic and not yet measured, the scroll position will be automatically corrected after rendering.</p>
              <div class="overflow-x-auto">
                <table class="table table-xs w-full bg-base-200">
                  <thead class="text-base-content"><tr><th>Parameter</th><th>Type</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr><td><code>rowIndex</code></td><td><code>number | null</code></td><td>Target row. <code>null</code> to keep current Y.</td></tr>
                    <tr><td><code>colIndex</code></td><td><code>number | null</code></td><td>Target column. <code>null</code> to keep current X.</td></tr>
                    <tr><td><code>options</code></td><td><code><a href="#scroll-to-index-options" class="link">Options</a></code></td><td>Alignment and behavior settings.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Method: scrollToOffset -->
          <div id="method-scrolltooffset" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> scrollToOffset()
            </h4>
            <CodeBlock
              class="docs-code-block mb-4 font-mono text-xs"
              lang="ts"
              code="scrollToOffset(
  x: number | null,
  y: number | null,
  options?: { behavior?: 'auto' | 'smooth' } // behavior default: 'auto'
): void"
            />
            <div class="prose prose-sm max-w-none opacity-90">
              <p>Scrolls the container to an absolute pixel position. Clamped between <code>0</code> and the calculated total size.</p>
            </div>
          </div>

          <!-- Method: refresh -->
          <div id="method-refresh" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> refresh()
            </h4>
            <div class="prose prose-sm max-w-none opacity-90">
              <p>Invalidates all cached measurements and triggers a full re-initialization. Use this if your item source data changes in a way that affects sizes without changing the <code>items</code> array reference.</p>
            </div>
          </div>

          <!-- Method: updateItemSize -->
          <div id="method-updateitemsize" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> updateItemSize()
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
          <div id="method-updateitemsizes" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> updateItemSizes()
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
          <div id="method-updatehostoffset" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> updateHostOffset()
            </h4>
            <div class="prose prose-sm max-w-none opacity-90">
              <p>Forces a recalculation of the host element's position relative to the scroll container. Call this if the layout changes in a way that shifts the component without triggering a resize event.</p>
            </div>
          </div>

          <!-- Method: getColumnWidth -->
          <div id="method-getcolumnwidth" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> getColumnWidth()
            </h4>
            <CodeBlock class="docs-code-block mb-4 font-mono text-xs" lang="ts" code="getColumnWidth(index: number): number" />
            <div class="prose prose-sm max-w-none opacity-90">
              <p>Returns the currently calculated width for a specific column index, taking measurements and gaps into account.</p>
            </div>
          </div>

          <!-- Method: stopProgrammaticScroll -->
          <div id="method-stopprogrammaticscroll" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> stopProgrammaticScroll()
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card shadow-soft bg-base-300 p-4 md:p-6 border-l-2 border-accent">
            <h4 class="font-bold text-accent mb-2 flex items-center gap-2">
              isElement(val)
              <span class="badge badge-accent badge-outline badge-xs">Type Guard</span>
            </h4>
            <p class="text-xs md:text-sm opacity-80">Checks if a value is a standard <code>HTMLElement</code> (explicitly excluding the global <code>window</code> object).</p>
          </div>
          <div class="card shadow-soft bg-base-300 p-4 md:p-6 border-l-2 border-accent">
            <h4 class="font-bold text-accent mb-2 flex items-center gap-2">
              isScrollableElement(val)
              <span class="badge badge-accent badge-outline badge-xs">Type Guard</span>
            </h4>
            <p class="text-xs md:text-sm opacity-80">Checks if a value is an <code>HTMLElement</code> or <code>Window</code> that exposes native scroll properties like <code>scrollLeft</code>.</p>
          </div>
          <div class="card shadow-soft bg-base-300 p-4 md:p-6 border-l-2 border-accent">
            <h4 class="font-bold text-accent mb-2">getPaddingX / getPaddingY</h4>
            <p class="text-xs md:text-sm opacity-80">Extracts effective pixel padding from <code>scrollPadding</code> props, taking the current <code>direction</code> into account.</p>
          </div>
          <div class="card shadow-soft bg-base-300 p-4 md:p-6 border-l-2 border-accent">
            <h4 class="font-bold text-accent mb-2">FenwickTree</h4>
            <p class="text-xs md:text-sm opacity-80">Highly optimized data structure for <em>O(log n)</em> prefix sum calculations and point updates. Used internally for all position tracking.</p>
          </div>
        </div>
      </section>

      <!-- 9. SSR Support -->
      <section id="ssr-support">
        <h2 class="docs-section-header">SSR & Hydration</h2>
        <div class="prose prose-sm md:prose-md max-w-none text-base-content/90">
          <p>The library supports Server-Side Rendering via the <code>ssrRange</code> prop. When provided, the specified items are rendered "in-flow" on the server.</p>
          <div class="card bg-base-300 p-6 mt-6 border-l-4 border-warning">
            <h4 class="font-bold mb-2">Hydration Logic</h4>
            <ol class="list-decimal pl-5 space-y-2 opacity-90">
              <li><strong>Server</strong>: Renders a static block of items at <code>ssrRange</code>.</li>
              <li><strong>Client (Pre-mount)</strong>: Renders the same items to match server HTML.</li>
              <li><strong>Client (Mounted)</strong>: Calculates total dimensions, scrolls to exactly match the pre-rendered range, and then transitions to absolute positioning for virtualization.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
