<script setup lang="ts">
import { DEFAULT_BUFFER, DEFAULT_COLUMN_WIDTH, DEFAULT_ITEM_SIZE } from '@pdanpdan/virtual-scroll';

import AppLogo from '#/components/AppLogo.vue';
import CodeBlock from '#/components/CodeBlock.vue';
</script>

<template>
  <div class="pb-10">
    <div class="card shadow-soft bg-base-300">
      <div class="card-body flex-row items-center p-4 md:p-8 gap-4 md:gap-8">
        <AppLogo class="size-16 md:size-24 drop-shadow-lg" />
        <div>
          <h1 class="text-primary">API Reference</h1>
          <p class="text-base md:text-xl opacity-60 font-medium">
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

      <!-- 4. Core Concepts -->
      <section id="core-concepts">
        <h2 class="docs-section-header">Core Concepts</h2>

        <section id="sizing-guide" class="mb-12">
          <h3 class="text-secondary small-caps tracking-wider mb-4">Sizing Guide</h3>
          <div class="prose prose-sm md:prose-md max-w-none text-base-content/90">
            <p>
              The library offers flexible ways to define item and column sizes. Calculations are optimized based on the type of sizing used.
            </p>
            <div class="docs-table-container mt-4">
              <table class="table table-sm md:table-md table-zebra w-full border border-base-content/5">
                <thead class="bg-base-300">
                  <tr>
                    <th>Type</th>
                    <th><code>itemSize</code> / <code>columnWidth</code></th>
                    <th>Perf</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody class="text-xs md:text-sm">
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

        <section id="alignments">
          <h3 class="text-secondary small-caps tracking-wider mb-4">Scroll Alignments</h3>
          <div class="prose prose-sm md:prose-md max-w-none text-base-content/90 mb-6">
            <p>
              When scrolling to a specific index, you can control the item's final position in the viewport using the <code>align</code> option.
            </p>
          </div>
          <div class="docs-table-container">
            <table class="table table-sm md:table-md table-zebra w-full">
              <thead class="bg-base-300">
                <tr>
                  <th class="w-1/4">Alignment</th>
                  <th>Behavior</th>
                </tr>
              </thead>
              <tbody class="text-xs md:text-sm">
                <tr>
                  <td><code class="text-primary font-bold">'start'</code></td>
                  <td>Aligns the item to the top (vertical) or left (horizontal) of the viewport.</td>
                </tr>
                <tr>
                  <td><code class="text-primary font-bold">'center'</code></td>
                  <td>Aligns the item to the center of the viewport.</td>
                </tr>
                <tr>
                  <td><code class="text-primary font-bold">'end'</code></td>
                  <td>Aligns the item to the bottom (vertical) or right (horizontal) of the viewport.</td>
                </tr>
                <tr>
                  <td><code class="text-primary font-bold">'auto'</code> <span class="badge badge-sm badge-outline opacity-50 ml-2">Default</span></td>
                  <td>
                    <strong>Smart Alignment:</strong> If the item is already fully visible, no scroll occurs.
                    If it's above/left, it scrolls to <code>'start'</code>. If it's below/right, it scrolls to <code>'end'</code>.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card bg-base-300 p-4 mt-4 border-l-4 border-info">
            <p class="text-xs md:text-sm opacity-90 italic">
              <strong>Note:</strong> You can provide a single value for both axes or a <a href="#scroll-alignment-options" class="link link-primary">ScrollAlignmentOptions</a> object for axis-specific alignment.
            </p>
          </div>
        </section>
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
            <ul class="text-xs opacity-80 list-disc pl-5 space-y-1">
              <li><code>item: T</code>: The data item from the source array.</li>
              <li><code>index: number</code>: The original index of the item.</li>
              <li><code>isSticky: boolean</code>: True if the item is configured to be sticky.</li>
              <li><code>isStickyActive: boolean</code>: True if the item is currently stuck at the threshold.</li>
              <li><code>columnRange: object</code>: Visible column range. See <a href="#column-range" class="link">ColumnRange</a>.</li>
              <li><code>getColumnWidth: (idx) => number</code>: Helper to get width of any column.</li>
            </ul>
          </div>
          <div class="space-y-4">
            <div class="card shadow-soft bg-base-300 p-4 border-l-4 border-secondary">
              <h4 class="font-bold text-secondary mb-2">#header / #footer</h4>
              <p class="text-xs md:text-sm opacity-90">Content above/below the list. Can be made sticky.</p>
            </div>
            <div class="card shadow-soft bg-base-300 p-4 border-l-4 border-accent">
              <h4 class="font-bold text-accent mb-2">#loading</h4>
              <p class="text-xs md:text-sm opacity-90">Shown at the end when <code>loading</code> prop is true.</p>
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
                <td><code><a href="#scroll-details">ScrollDetails&lt;T&gt;</a></code></td>
                <td>Emitted on every scroll change.</td>
              </tr>
              <tr>
                <td><code>load</code></td>
                <td><code>'vertical' | 'horizontal'</code></td>
                <td>Triggered near the end of content.</td>
              </tr>
              <tr>
                <td><code>visibleRangeChange</code></td>
                <td><code>{ start, end, ... }</code></td>
                <td>Emitted when the set of rendered items changes.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 id="keyboard-navigation" class="docs-prop-header">Keyboard Navigation</h3>
        <div class="prose prose-sm md:prose-md max-w-none text-base-content/90 mb-10">
          <p>When the component container is focused, it supports the following keys for navigation:</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <kbd class="kbd kbd-sm md:kbd-md">Home</kbd>
              <span class="text-xs md:text-sm opacity-80">Scroll to the very beginning (index 0).</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <kbd class="kbd kbd-sm md:kbd-md">End</kbd>
              <span class="text-xs md:text-sm opacity-80">Scroll to the very end of the list.</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <span class="flex gap-1">
                <kbd class="kbd kbd-sm md:kbd-md">↑</kbd>
                <kbd class="kbd kbd-sm md:kbd-md">↓</kbd>
              </span>
              <span class="text-xs md:text-sm opacity-80">Scroll up/down by {{ DEFAULT_ITEM_SIZE }} pixels.</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <span class="flex gap-1">
                <kbd class="kbd kbd-sm md:kbd-md">←</kbd>
                <kbd class="kbd kbd-sm md:kbd-md">→</kbd>
              </span>
              <span class="text-xs md:text-sm opacity-80">Scroll left/right by {{ DEFAULT_ITEM_SIZE }} pixels.</span>
            </div>
            <div class="flex items-center gap-3 p-3 bg-base-300 rounded-lg border border-base-content/5">
              <kbd class="kbd kbd-sm md:kbd-md">PgUp</kbd> / <kbd class="kbd kbd-sm md:kbd-md">PgDn</kbd>
              <span class="text-xs md:text-sm opacity-80">Scroll by one full viewport height/width.</span>
            </div>
          </div>
        </div>

        <h3 id="css-classes" class="docs-prop-header">CSS Classes</h3>
        <div class="docs-table-container mb-10">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300">
              <tr>
                <th class="w-1/3">Class</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
              <tr>
                <td><code>.virtual-scroll-container</code></td>
                <td>The root container element of the component.</td>
              </tr>
              <tr>
                <td><code>.virtual-scroll-wrapper</code></td>
                <td>The element that wraps all rendered items and provides the total scrollable area.</td>
              </tr>
              <tr>
                <td><code>.virtual-scroll-item</code></td>
                <td>Applied to each individual rendered item.</td>
              </tr>
              <tr>
                <td><code>.virtual-scroll-header</code> / <code>.virtual-scroll-footer</code></td>
                <td>Containers for the header and footer slots.</td>
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
                <td>Applied after the component has finished client-side hydration.</td>
              </tr>
              <tr>
                <td><code>.virtual-scroll--window</code></td>
                <td>Applied when using the window/body as the scroll container.</td>
              </tr>
              <tr>
                <td><code>.virtual-scroll--table</code></td>
                <td>Applied when <code>containerTag="table"</code> is used.</td>
              </tr>
              <tr>
                <td><code>.virtual-scroll--sticky</code></td>
                <td>Applied to items currently stuck at the threshold.</td>
              </tr>
              <tr>
                <td><code>.virtual-scroll--debug</code></td>
                <td>Applied when <code>debug</code> prop is true.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 id="methods" class="docs-prop-header">Exposed Methods</h3>
        <div class="prose prose-sm max-w-none mb-6 opacity-80">
          <p>The component exposes several methods for programmatic control. See the <a href="#composable-methods" class="link link-primary">detailed documentation</a> in the composable section for parameter types and behaviors.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <a href="#method-scrolltoindex" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">scrollToIndex()</code>
            <p class="text-[10px] opacity-60 mt-1">Scroll to a specific item</p>
          </a>
          <a href="#method-scrolltooffset" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">scrollToOffset()</code>
            <p class="text-[10px] opacity-60 mt-1">Scroll to pixel position</p>
          </a>
          <a href="#method-refresh" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">refresh()</code>
            <p class="text-[10px] opacity-60 mt-1">Reset all measurements</p>
          </a>
          <a href="#method-stopprogrammaticscroll" class="card bg-base-300 p-4 hover:bg-base-200 transition-colors border border-base-content/5">
            <code class="text-primary font-bold text-xs">stopProgrammaticScroll()</code>
            <p class="text-[10px] opacity-60 mt-1">Cancel smooth scrolling</p>
          </a>
        </div>
      </section>

      <div class="divider opacity-30" />

      <!-- 6. useVirtualScroll Composable -->
      <section id="use-virtual-scroll">
        <h2 class="docs-section-header">useVirtualScroll Composable</h2>
        <div class="prose prose-sm md:prose-md max-w-none text-base-content/90 mb-8">
          <p>
            The core logic for custom implementations. Handles all calculations and state management for virtualization.
          </p>
        </div>

        <CodeBlock
          class="docs-code-block mb-8"
          lang="ts"
          code="import { useVirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, ref } from 'vue';

const items = ref([...]);
const props = computed(() => ({ items: items.value, itemSize: 50 }));

const { renderedItems, scrollDetails, totalHeight, scrollToIndex } = useVirtualScroll(props);"
        />

        <h3 id="composable-parameters" class="docs-prop-header">Parameters</h3>
        <div class="prose prose-sm max-w-none mb-6">
          <p>The composable accepts a single <code>Ref</code> to a <a href="#virtual-scroll-props" class="link link-primary">VirtualScrollProps</a> object.</p>
        </div>

        <h3 id="composable-state" class="docs-prop-header">Return Value: State</h3>
        <div class="docs-table-container mb-10">
          <table class="table table-sm md:table-md table-zebra w-full">
            <thead class="bg-base-300">
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody class="text-xs md:text-sm">
              <tr>
                <td><code class="text-secondary font-bold">renderedItems</code></td>
                <td><code>Ref&lt;<a href="#rendered-item">RenderedItem</a>[]&gt;</code></td>
                <td>List of items to be rendered in the DOM.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">scrollDetails</code></td>
                <td><code>Ref&lt;<a href="#scroll-details">ScrollDetails</a>&gt;</code></td>
                <td>Comprehensive reactive state of the virtualizer.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">totalWidth</code> / <code class="text-secondary font-bold">totalHeight</code></td>
                <td><code>Ref&lt;number&gt;</code></td>
                <td>The total calculated content dimensions.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">columnRange</code></td>
                <td><code>Ref&lt;object&gt;</code></td>
                <td>Visible column indices and paddings (for grid).</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">isHydrated</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td>True after first client-side mount.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 id="composable-methods" class="docs-prop-header">Return Value: Methods</h3>
        <div class="space-y-8 mb-10">
          <!-- Method: scrollToIndex -->
          <div id="method-scrolltoindex" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> scrollToIndex()
            </h4>
            <CodeBlock class="docs-code-block mb-4" lang="ts" code="scrollToIndex(rowIndex: number | null, colIndex: number | null, options?: ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions): void" />
            <div class="prose prose-sm max-w-none opacity-90 space-y-4">
              <p>Scrolls the container to bring a specific item into view. If only one index is provided, the other axis remains unchanged.</p>
              <div class="overflow-x-auto">
                <table class="table table-xs w-full bg-base-200">
                  <thead><tr><th>Parameter</th><th>Description</th></tr></thead>
                  <tbody>
                    <tr><td><code>rowIndex</code></td><td>Target row index. <code>null</code> to ignore.</td></tr>
                    <tr><td><code>colIndex</code></td><td>Target column index. <code>null</code> to ignore.</td></tr>
                    <tr><td><code>options</code></td><td>Detailed options. See <a href="#scroll-to-index-options" class="link">ScrollToIndexOptions</a> and <a href="#alignments" class="link">Alignments</a>.</td></tr>
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
            <CodeBlock class="docs-code-block mb-4" lang="ts" code="scrollToOffset(x: number | null, y: number | null, options?: { behavior?: 'auto' | 'smooth' }): void" />
            <div class="prose prose-sm max-w-none opacity-90">
              <p>Scrolls to an absolute pixel position relative to the content start. Clamps to valid scroll range.</p>
            </div>
          </div>

          <!-- Method: refresh -->
          <div id="method-refresh" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> refresh()
            </h4>
            <div class="prose prose-sm max-w-none opacity-90">
              <p>Resets the internal Fenwick tree and all dynamic measurements. Use this if item sizes have changed but the <code>items</code> array reference stayed the same.</p>
            </div>
          </div>

          <!-- Method: updateItemSize -->
          <div id="method-updateitemsize" class="card shadow-soft bg-base-300 p-6 border-t-2 border-primary">
            <h4 class="font-bold text-lg text-primary flex items-center gap-2 mb-4">
              <span class="badge badge-primary">Method</span> updateItemSize()
            </h4>
            <CodeBlock class="docs-code-block mb-4" lang="ts" code="updateItemSize(index: number, width: number, height: number, element?: HTMLElement): void" />
            <div class="prose prose-sm max-w-none opacity-90">
              <p>Manually updates the measured size of a single item. Usually called via <code>ResizeObserver</code>.</p>
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

      <!-- 7. API Reference (Types) -->
      <section id="api-reference">
        <h2 class="docs-section-header">API Reference: Types</h2>

        <!-- ScrollDetails -->
        <section id="scroll-details" class="mb-12">
          <h3 class="docs-prop-subheader">ScrollDetails&lt;T&gt;</h3>
          <div class="docs-table-container">
            <table class="table table-sm md:table-md table-zebra w-full">
              <thead class="bg-base-300">
                <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
              </thead>
              <tbody class="text-xs md:text-sm">
                <tr><td><code>items</code></td><td><code><a href="#rendered-item">RenderedItem</a>[]</code></td><td>Items in the current buffer.</td></tr>
                <tr><td><code>currentIndex</code></td><td><code>number</code></td><td>First visible row index.</td></tr>
                <tr><td><code>currentColIndex</code></td><td><code>number</code></td><td>First visible column index.</td></tr>
                <tr><td><code>scrollOffset</code></td><td><code>{ x, y }</code></td><td>Current scroll position.</td></tr>
                <tr><td><code>viewportSize</code></td><td><code>{ width, height }</code></td><td>Visible area dimensions.</td></tr>
                <tr><td><code>totalSize</code></td><td><code>{ width, height }</code></td><td>Total calculated dimensions.</td></tr>
                <tr><td><code>isScrolling</code></td><td><code>boolean</code></td><td>True if active scroll is occurring.</td></tr>
                <tr><td><code>isProgrammaticScroll</code></td><td><code>boolean</code></td><td>True if scroll was triggered by method.</td></tr>
                <tr><td><code>range</code></td><td><code>{ start, end }</code></td><td>Rendered item range.</td></tr>
                <tr><td><code>columnRange</code></td><td><code>{ start, end, ... }</code></td><td>Rendered column range (grid).</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- RenderedItem -->
        <section id="rendered-item" class="mb-12">
          <h3 class="docs-prop-subheader">RenderedItem&lt;T&gt;</h3>
          <div class="docs-table-container">
            <table class="table table-sm md:table-md table-zebra w-full">
              <thead class="bg-base-300">
                <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
              </thead>
              <tbody class="text-xs md:text-sm">
                <tr><td><code>item</code></td><td><code>T</code></td><td>The original data item.</td></tr>
                <tr><td><code>index</code></td><td><code>number</code></td><td>Original index in items array.</td></tr>
                <tr><td><code>offset</code></td><td><code>{ x, y }</code></td><td>Render position relative to wrapper (includes sticky/SSR adjustments).</td></tr>
                <tr><td><code>size</code></td><td><code>{ width, height }</code></td><td>Measured or estimated dimensions.</td></tr>
                <tr><td><code>originalX</code> / <code>originalY</code></td><td><code>number</code></td><td>The raw offsets before any sticky adjustments.</td></tr>
                <tr><td><code>isSticky</code></td><td><code>boolean</code></td><td>True if configured as sticky.</td></tr>
                <tr><td><code>isStickyActive</code></td><td><code>boolean</code></td><td>True if currently stuck.</td></tr>
                <tr><td><code>stickyOffset</code></td><td><code>{ x, y }</code></td><td>Offset applied for pushing effect.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- ColumnRange -->
        <section id="column-range" class="mb-12">
          <h3 class="docs-prop-subheader">ColumnRange</h3>
          <div class="docs-table-container">
            <table class="table table-sm md:table-md table-zebra w-full">
              <thead class="bg-base-300">
                <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
              </thead>
              <tbody class="text-xs md:text-sm">
                <tr><td><code>start</code></td><td><code>number</code></td><td>Index of the first rendered column.</td></tr>
                <tr><td><code>end</code></td><td><code>number</code></td><td>Index of the last rendered column.</td></tr>
                <tr><td><code>padStart</code></td><td><code>number</code></td><td>Pixel offset from the left to the first rendered column.</td></tr>
                <tr><td><code>padEnd</code></td><td><code>number</code></td><td>Pixel space remaining after the last rendered column.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- VirtualScrollProps -->
        <section id="virtual-scroll-props" class="mb-12">
          <h3 class="docs-prop-subheader">VirtualScrollProps</h3>
          <div class="prose prose-sm max-w-none mb-4 opacity-80 italic">
            <p>Describes the configuration object passed to <code>useVirtualScroll</code> or as props to <code>VirtualScroll</code> component.</p>
          </div>
          <div class="docs-table-container overflow-x-auto">
            <table class="table table-xs md:table-sm table-zebra w-full min-w-[600px]">
              <thead class="bg-base-300">
                <tr><th class="w-1/4">Property</th><th class="w-1/4">Type</th><th>Description</th></tr>
              </thead>
              <tbody class="text-xs opacity-90">
                <tr><td><code>items</code></td><td><code>T[]</code></td><td>Required. The data source.</td></tr>
                <tr><td><code>itemSize</code></td><td><code>num | fn</code></td><td>Fixed size or size function.</td></tr>
                <tr><td><code>direction</code></td><td><code>ScrollDirection</code></td><td><code>'vertical' | 'horizontal' | 'both'</code>.</td></tr>
                <tr><td><code>bufferBefore</code> / <code>bufferAfter</code></td><td><code>number</code></td><td>Buffer count (Default: {{ DEFAULT_BUFFER }}).</td></tr>
                <tr><td><code>container</code></td><td><code>HTMLElement | Window</code></td><td>Scrollable element. Defaults to component root.</td></tr>
                <tr><td><code>hostElement</code></td><td><code>HTMLElement</code></td><td>The element containing the items (for offset calculation).</td></tr>
                <tr><td><code>ssrRange</code></td><td><code>{ start, end, ... }</code></td><td>Items to pre-render on server.</td></tr>
                <tr><td><code>columnCount</code></td><td><code>number</code></td><td>Total columns for grid mode.</td></tr>
                <tr><td><code>columnWidth</code></td><td><code>num | arr | fn</code></td><td>Sizing for columns.</td></tr>
                <tr><td><code>scrollPaddingStart</code> / <code>End</code></td><td><code>num | {x, y}</code></td><td>Offsets for scroll calculations.</td></tr>
                <tr><td><code>gap</code> / <code>columnGap</code></td><td><code>number</code></td><td>Spacings between items.</td></tr>
                <tr><td><code>restoreScrollOnPrepend</code></td><td><code>boolean</code></td><td>Maintain position when items added at start.</td></tr>
                <tr><td><code>initialScrollIndex</code></td><td><code>number</code></td><td>Jump to index on mount.</td></tr>
                <tr><td><code>initialScrollAlign</code></td><td><code>ScrollAlignment | ...</code></td><td>Alignment for initial jump.</td></tr>
                <tr><td><code>defaultItemSize</code></td><td><code>number</code></td><td>Estimate (Default: {{ DEFAULT_ITEM_SIZE }}).</td></tr>
                <tr><td><code>defaultColumnWidth</code></td><td><code>number</code></td><td>Estimate (Default: {{ DEFAULT_COLUMN_WIDTH }}).</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Options Objects -->
        <section id="options-objects" class="mb-12">
          <h3 class="docs-prop-subheader">Options & Configuration Objects</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div id="scroll-alignment-options" class="card bg-base-300 p-4 border border-base-content/5">
              <h4 class="font-bold text-primary mb-2">ScrollAlignmentOptions</h4>
              <p class="text-[10px] opacity-70 mb-3">Allows axis-specific alignment in <code>scrollToIndex</code>.</p>
              <CodeBlock class="docs-code-block" lang="ts" code="{ x?: ScrollAlignment; y?: ScrollAlignment; }" />
            </div>
            <div id="scroll-to-index-options" class="card bg-base-300 p-4 border border-base-content/5">
              <h4 class="font-bold text-primary mb-2">ScrollToIndexOptions</h4>
              <p class="text-[10px] opacity-70 mb-3">Full configuration for index-based scrolling.</p>
              <CodeBlock
                class="docs-code-block"
                lang="ts"
                code="{
  align?: ScrollAlignment | ScrollAlignmentOptions;
  behavior?: 'auto' | 'smooth';
}"
              />
            </div>
          </div>
        </section>
      </section>

      <div class="divider opacity-30" />

      <!-- 8. Utility Functions -->
      <section id="utility-functions">
        <h2 class="docs-section-header">Utility Functions</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card shadow-soft bg-base-300 p-4 md:p-6 border-l-2 border-accent">
            <h4 class="font-bold text-accent mb-2">isElement(val)</h4>
            <p class="text-xs md:text-sm opacity-80">Checks if a value is an <code>HTMLElement</code> (excludes <code>window</code>).</p>
          </div>
          <div class="card shadow-soft bg-base-300 p-4 md:p-6 border-l-2 border-accent">
            <h4 class="font-bold text-accent mb-2">isScrollableElement(val)</h4>
            <p class="text-xs md:text-sm opacity-80">Checks if a value is an <code>HTMLElement</code> or <code>window</code> with scroll properties.</p>
          </div>
          <div class="card shadow-soft bg-base-300 p-4 md:p-6 border-l-2 border-accent">
            <h4 class="font-bold text-accent mb-2">getPaddingX / getPaddingY</h4>
            <p class="text-xs md:text-sm opacity-80">Extracts padding values from <code>scrollPadding</code> props, accounting for scroll direction.</p>
          </div>
          <div class="card shadow-soft bg-base-300 p-4 md:p-6 border-l-2 border-accent">
            <h4 class="font-bold text-accent mb-2">FenwickTree</h4>
            <p class="text-xs md:text-sm opacity-80">The optimized data structure used for <em>O(log n)</em> prefix sum calculations and updates.</p>
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
