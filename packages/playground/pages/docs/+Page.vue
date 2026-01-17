<script setup lang="ts">
import { normalizeHref } from '#/navigate';

const logoUrl = normalizeHref('logo.svg');
</script>

<template>
  <div class="max-w-4xl mx-auto py-10 px-6">
    <header class="mb-12 border-b border-base-300 pb-8 flex items-center gap-8">
      <img :src="logoUrl" class="w-20 h-20" alt="Logo" />
      <div>
        <h1 class="text-4xl font-extrabold mb-4">API Reference</h1>
        <p class="text-xl opacity-70">
          Complete documentation for <code>@pdanpdan/virtual-scroll</code>.
        </p>
      </div>
    </header>

    <div class="space-y-16">
      <section id="introduction">
        <h2 class="text-3xl font-bold mb-6 flex items-center gap-2">
          Introduction
        </h2>
        <div class="prose prose-lg max-w-none">
          <p>
            <code class="p-0!">@pdanpdan/virtual-scroll</code> is a high-performance Vue 3 virtual scroll library designed to handle massive lists with ease.
            It supports vertical, horizontal, and bidirectional (grid) scrolling, dynamic item sizes using <code class="p-0!">ResizeObserver</code>,
            and integration with the browser's native window scroll.
          </p>
        </div>
      </section>

      <section id="usage-modes">
        <h2 class="text-3xl font-bold mb-6">Usage Modes</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
            <div class="card-body">
              <h3 class="card-title text-xl text-primary">Compiled Component</h3>
              <p class="text-sm opacity-80 mb-4">The recommended way for most projects. Uses pre-compiled JS for faster builds.</p>
              <div class="mockup-code bg-base-300 text-xs mb-4">
                <pre><code>import { VirtualScroll } from '@pdanpdan/virtual-scroll';</code></pre>
                <pre><code>import '@pdanpdan/virtual-scroll/style.css';</code></pre>
              </div>
              <ul class="list-disc pl-5 text-sm space-y-1 opacity-70">
                <li>Compatible with all modern bundlers.</li>
                <li><strong>Note:</strong> Manual CSS import is required.</li>
                <li>Scoped CSS is preserved via data-attributes.</li>
              </ul>
            </div>
          </div>

          <div class="card bg-base-200 border border-base-300 shadow-sm overflow-hidden">
            <div class="card-body">
              <h3 class="card-title text-xl text-secondary">Original Vue SFC</h3>
              <p class="text-sm opacity-80 mb-4">Import the raw source for custom compilation and optimization.</p>
              <div class="mockup-code bg-base-300 text-xs mb-4">
                <pre><code>import VS from '@pdanpdan/virtual-scroll/VirtualScroll.vue';</code></pre>
              </div>
              <ul class="list-disc pl-5 text-sm space-y-1 opacity-70">
                <li>Enables better tree-shaking in your build.</li>
                <li>Styles are handled automatically by your Vue loader.</li>
                <li>Better source-map debugging in some IDEs.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="virtual-scroll">
        <h2 class="text-3xl font-bold mb-6">VirtualScroll Component</h2>
        <p class="mb-8 opacity-80 text-lg">The main component provided by the library.</p>

        <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-200">Props</h3>

        <h4 class="text-xl font-bold mb-4 opacity-60 uppercase tracking-wider">Core Configuration</h4>
        <div class="overflow-x-auto mb-10">
          <table class="table table-md table-zebra w-full border border-base-300 rounded-box overflow-hidden">
            <thead class="bg-base-200">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="text-primary font-bold">items</code></td>
                <td><code>T[]</code></td>
                <td><span class="badge badge-error badge-sm">required</span></td>
                <td>The array of items to render.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">itemSize</code></td>
                <td><code>number | ((item: T, index: number) => number) | null</code></td>
                <td><code>50</code></td>
                <td>
                  Fixed size (number) or function returning size.
                  Values <code>0</code>, <code>null</code>, or <code>undefined</code> enable <strong>dynamic size detection</strong> via <code>ResizeObserver</code>.
                </td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">direction</code></td>
                <td><code>'vertical' | 'horizontal' | 'both'</code></td>
                <td><code>'vertical'</code></td>
                <td>The scroll direction. <code>'both'</code> enables bidirectional grid mode.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">gap</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Spacings between items (vertical direction).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="text-xl font-bold mb-4 opacity-60 uppercase tracking-wider">Grid Configuration <span class="text-xs normal-case opacity-50">(direction="both")</span></h4>
        <div class="overflow-x-auto mb-10">
          <table class="table table-md table-zebra w-full border border-base-300 rounded-box overflow-hidden">
            <thead class="bg-base-200">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="text-primary font-bold">columnCount</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Number of columns for grid mode.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">columnWidth</code></td>
                <td><code>number | number[] | ((index: number) => number) | null</code></td>
                <td><code>150</code></td>
                <td>
                  Width for columns in grid mode. Supports fixed width, alternating widths array, or a function.
                  Set to <code>0</code> for auto-detection.
                </td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">columnGap</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Spacings between columns (horizontal/grid).</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="text-xl font-bold mb-4 opacity-60 uppercase tracking-wider">Feature-Specific Props</h4>
        <div class="overflow-x-auto mb-10">
          <table class="table table-md table-zebra w-full border border-base-300 rounded-box overflow-hidden">
            <thead class="bg-base-200">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="text-primary font-bold">stickyIndices</code></td>
                <td><code>number[]</code></td>
                <td><code>[]</code></td>
                <td>Indices of items that should remain sticky at the top/start. Supports <strong>iOS-style pushing effect</strong> where headers push each other out.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">stickyHeader</code> / <code class="text-primary font-bold">stickyFooter</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>If true, automatically measures header/footer size and uses it as scroll padding.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">loading</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Whether items are currently being loaded. Prevents multiple <code>load</code> events and displays the <code>#loading</code> slot.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">loadDistance</code></td>
                <td><code>number</code></td>
                <td><code>200</code></td>
                <td>Distance from the end of the scrollable area to trigger the <code>load</code> event.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">restoreScrollOnPrepend</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Whether to automatically restore scroll position when items are prepended to the list.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="text-xl font-bold mb-4 opacity-60 uppercase tracking-wider">Advanced Configuration</h4>
        <div class="overflow-x-auto mb-10">
          <table class="table table-md table-zebra w-full border border-base-300 rounded-box overflow-hidden">
            <thead class="bg-base-200">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="text-primary font-bold">container</code></td>
                <td><code>HTMLElement | Window | null</code></td>
                <td><code>undefined</code></td>
                <td>
                  The scrollable container. Defaults to the component's root element.
                  Pass <code>window</code> for body scrolling.
                </td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">scrollPaddingStart</code> / <code class="text-primary font-bold">scrollPaddingEnd</code></td>
                <td><code>number | { x?, y? }</code></td>
                <td><code>0</code></td>
                <td>Padding to account for in <code>scrollToIndex</code> (e.g. for sticky headers/footers).</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">containerTag</code> / <code class="text-primary font-bold">wrapperTag</code> / <code class="text-primary font-bold">itemTag</code></td>
                <td><code>string</code></td>
                <td><code>'div'</code></td>
                <td>HTML tags for different parts of the component. Use <code>table</code>, <code>tbody</code>, <code>tr</code> for tables.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">bufferBefore</code> / <code class="text-primary font-bold">bufferAfter</code></td>
                <td><code>number</code></td>
                <td><code>5</code></td>
                <td>Number of items to render outside the visible viewport.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">ssrRange</code></td>
                <td><code>{ start: number, end: number, colStart?: number, colEnd?: number }</code></td>
                <td><code>undefined</code></td>
                <td>
                  Enables <strong>Server-Side Rendering</strong> support. Pre-renders the specified range in-flow.
                  On the client, the component expands the container size and automatically scrolls to this range on mount before hydrating into absolute positioning.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 class="text-xl font-bold mb-4 opacity-60 uppercase tracking-wider">Development</h4>
        <div class="overflow-x-auto mb-10">
          <table class="table table-md table-zebra w-full border border-base-300 rounded-box overflow-hidden">
            <thead class="bg-base-200">
              <tr>
                <th class="w-1/4">Prop</th>
                <th class="w-1/4">Type</th>
                <th class="w-1/6">Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="text-primary font-bold">defaultItemSize</code></td>
                <td><code>number</code></td>
                <td><code>50</code></td>
                <td>Default size for items before they are measured. Helps with scroll accuracy for dynamic items.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">defaultColumnWidth</code></td>
                <td><code>number</code></td>
                <td><code>150</code></td>
                <td>Default width for columns before they are measured. Helps with scroll accuracy for dynamic columns.</td>
              </tr>
              <tr>
                <td><code class="text-primary font-bold">debug</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Enables debug visualization showing item indices and offsets.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-200">Slots</h3>
        <div class="space-y-6 mb-10">
          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-3">#item</h4>
            <p class="mb-4 opacity-80">The main slot for rendering individual items.</p>
            <table class="table table-sm w-full">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>item</code></td>
                  <td><code>T</code></td>
                  <td>The data item from the <code>items</code> array.</td>
                </tr>
                <tr>
                  <td><code>index</code></td>
                  <td><code>number</code></td>
                  <td>The original index of the item.</td>
                </tr>
                <tr>
                  <td><code>columnRange</code></td>
                  <td><code>{ start, end, padStart, padEnd }</code></td>
                  <td>Current visible column range for grid mode.</td>
                </tr>
                <tr>
                  <td><code>getColumnWidth</code></td>
                  <td><code>(index: number) => number</code></td>
                  <td>Helper to get the width of a specific column.</td>
                </tr>
                <tr>
                  <td><code>isSticky</code></td>
                  <td><code>boolean</code></td>
                  <td>True if the item is configured to be sticky.</td>
                </tr>
                <tr>
                  <td><code>isStickyActive</code></td>
                  <td><code>boolean</code></td>
                  <td>True if the item is currently stuck at the threshold.</td>
                </tr>
                <tr>
                  <td><code>stickyOffset</code></td>
                  <td><code>{ x, y }</code></td>
                  <td>The calculated offset for the pushing effect.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="card bg-base-200 shadow-sm p-4 border border-base-300">
              <h4 class="font-bold mb-2">#header</h4>
              <p class="text-sm opacity-80">Content rendered above the list. Can be made sticky via CSS or <code>stickyHeader</code> prop.</p>
            </div>
            <div class="card bg-base-200 shadow-sm p-4 border border-base-300">
              <h4 class="font-bold mb-2">#footer</h4>
              <p class="text-sm opacity-80">Content rendered below the list.</p>
            </div>
            <div class="card bg-base-200 shadow-sm p-4 border border-base-300">
              <h4 class="font-bold mb-2">#loading</h4>
              <p class="text-sm opacity-80">Content rendered when <code>loading</code> prop is true. Appended after the last item.</p>
            </div>
          </div>
        </div>

        <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-200">CSS Classes</h3>
        <div class="prose prose-md max-w-none mb-10">
          <p>The component provides several CSS classes for easy styling and overrides:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><code>.virtual-scroll-container</code>: The root container element.</li>
            <li><code>.virtual-scroll-wrapper</code>: The element wrapping all items.</li>
            <li><code>.virtual-scroll-item</code>: Individual item elements.</li>
            <li><code>.virtual-scroll-header</code> / <code>.virtual-scroll-footer</code>: Header and footer elements.</li>
            <li><code>.virtual-scroll-loading</code>: Loading slot container.</li>
            <li><code>.virtual-scroll--sticky</code>: Applied to header, footer, or items when they are in a sticky state.</li>
            <li><code>.virtual-scroll--hydrated</code>: Applied to the container once it has mounted and initialized on the client.</li>
            <li><code>.virtual-scroll--window</code>: Applied when scrolling via the browser window/body.</li>
            <li><code>.virtual-scroll--table</code>: Applied when <code>containerTag="table"</code> is used.</li>
            <li><code>.virtual-scroll--debug</code>: Applied when <code>debug</code> mode is active.</li>
          </ul>
        </div>

        <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-200">Events</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-3 text-primary">scroll</h4>
            <p class="mb-4 opacity-80">Emitted when the container is scrolled.</p>
            <p class="text-sm mb-2 font-bold">Payload (<code>ScrollDetails&lt;T&gt;</code>):</p>
            <ul class="list-disc pl-6 text-sm space-y-1 opacity-80">
              <li><code>currentIndex</code>: Index of the first visible row.</li>
              <li><code>currentColIndex</code>: Index of the first visible column.</li>
              <li><code>scrollOffset</code>: <code>{ x, y }</code> current scroll position.</li>
              <li><code>viewportSize</code>: <code>{ width, height }</code> size of the container.</li>
              <li><code>totalSize</code>: <code>{ width, height }</code> total scrollable size.</li>
              <li><code>isScrolling</code>: Boolean indicating if scrolling is in progress.</li>
              <li><code>isProgrammaticScroll</code>: True if scroll was triggered by <code>scrollToIndex</code> or <code>scrollToOffset</code>.</li>
              <li><code>range</code>: <code>{ start, end }</code> indices of currently rendered rows.</li>
              <li><code>columnRange</code>: <code>{ start, end, padStart, padEnd }</code> indices and padding for rendered columns.</li>
              <li><code>items</code>: Array of currently rendered items with their offsets and sizes.</li>
            </ul>
          </div>
          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-3 text-primary">load</h4>
            <p class="mb-4 opacity-80">Emitted when scrolling near the end of the content.</p>
            <p class="text-sm mb-2 font-bold">Payload (<code>direction</code>):</p>
            <p class="text-sm opacity-80">Either <code>'vertical'</code> or <code>'horizontal'</code> depending on which dimension triggered the load.</p>
          </div>
          <div class="card bg-base-200 shadow-sm p-6 border border-base-300 md:col-span-2">
            <h4 class="font-bold text-lg mb-3 text-primary">visibleRangeChange</h4>
            <p class="mb-4 opacity-80">Emitted whenever the rendered items range or column range changes (due to scrolling or resize).</p>
            <p class="text-sm mb-2 font-bold">Payload (<code>range</code>):</p>
            <p class="text-sm opacity-80"><code>{ start: number, end: number, colStart: number, colEnd: number }</code></p>
          </div>
        </div>

        <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-200">Keyboard Navigation</h3>
        <div class="prose prose-md max-w-none mb-10">
          <p>When the component container has focus, it supports the following navigation shortcuts:</p>
          <ul class="list-disc pl-6 space-y-2">
            <li><code>Home</code> / <code>End</code>: Scroll to the beginning or end of the list.</li>
            <li><code>ArrowUp</code> / <code>ArrowDown</code>: Scroll up or down by 40px.</li>
            <li><code>ArrowLeft</code> / <code>ArrowRight</code>: Scroll left or right by 40px.</li>
            <li><code>PageUp</code> / <code>PageDown</code>: Scroll up or down (or left/right depending on direction) by one viewport height/width.</li>
          </ul>
        </div>

        <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-200">Exposed Methods</h3>

        <div class="space-y-6 mb-10">
          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">scrollToIndex(row, col, options?)</h4>

            <div class="text-sm opacity-80 space-y-2">
              <p>Scrolls the container to bring a specific item into view.</p>

              <ul class="list-disc pl-6">
                <li><code>row</code>: Row index (or <code>null</code> to ignore).</li>

                <li><code>col</code>: Column index (or <code>null</code> to ignore).</li>

                <li>
                  <code>options</code>: Can be an alignment string, a <code>ScrollAlignmentOptions</code> object, or a <code>ScrollToIndexOptions</code> object.

                  <ul class="list-circle pl-6 mt-1 space-y-1">
                    <li>If it's a string (<code>'start' | 'center' | 'end' | 'auto'</code>), it sets the alignment for both X and Y axes. Default behavior is <code>'smooth'</code>.</li>

                    <li>If it's a <code>ScrollAlignmentOptions</code> object (<code>{ x?: ScrollAlignment, y?: ScrollAlignment }</code>), it sets independent alignment for each axis.</li>

                    <li>
                      If it's a <code>ScrollToIndexOptions</code> object:

                      <ul class="list-square pl-6 mt-1">
                        <li><code>align</code> (default: <code>'auto'</code>): Can be a string or a <code>ScrollAlignmentOptions</code> object.</li>

                        <li><code>behavior</code> (default: <code>'smooth'</code>): <code>'auto'</code> or <code>'smooth'</code>.</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">scrollToOffset(x, y, options?)</h4>

            <div class="text-sm opacity-80">
              <p>Scrolls to a specific pixel offset. Pass <code>null</code> to keep current position on an axis.</p>

              <ul class="list-disc pl-6 mt-2">
                <li><code>x</code>: Horizontal offset in pixels.</li>

                <li><code>y</code>: Vertical offset in pixels.</li>

                <li><code>options</code>: <code>{ behavior?: 'auto' | 'smooth' }</code> (default behavior is <code>'auto'</code>).</li>
              </ul>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">refresh()</h4>

            <div class="text-sm opacity-80">
              <p>Resets all dynamic measurements and re-initializes sizes from props. Useful if the items' content changed significantly.</p>
            </div>
          </div>
        </div>
      </section>

      <div class="divider" />

      <section id="use-virtual-scroll">
        <h2 class="text-3xl font-bold mb-6">useVirtualScroll Composable</h2>
        <p class="mb-6 opacity-80 text-lg">
          The core logic for custom implementations. It handles all calculations and state management for virtualization.
        </p>

        <div class="mockup-code bg-base-300 text-sm shadow-xl mb-10">
          <pre data-prefix="1"><code>import { useVirtualScroll } from '@pdanpdan/virtual-scroll'</code></pre>
          <pre data-prefix="2"><code /></pre>
          <pre data-prefix="3"><code>// props must be a Vue Ref</code></pre>
          <pre data-prefix="4"><code>const { renderedItems, scrollToIndex } = useVirtualScroll(props)</code></pre>
        </div>

        <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-200">Return Value</h3>
        <div class="overflow-x-auto mb-10">
          <table class="table table-md table-zebra w-full border border-base-300">
            <thead class="bg-base-200">
              <tr>
                <th class="w-1/4">Member</th>
                <th class="w-1/4">Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code class="text-secondary font-bold">renderedItems</code></td>
                <td><code>Ref&lt;RenderedItem[]&gt;</code></td>
                <td>List of items to be rendered with their calculated offsets and sizes.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">scrollDetails</code></td>
                <td><code>Ref&lt;ScrollDetails&gt;</code></td>
                <td>Comprehensive state of the current scroll (offset, viewport, total size, etc).</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">totalWidth</code> / <code class="text-secondary font-bold">totalHeight</code></td>
                <td><code>Ref&lt;number&gt;</code></td>
                <td>The total calculated dimensions of the scrollable area.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">columnRange</code></td>
                <td><code>Ref&lt;object&gt;</code></td>
                <td>The range of visible columns for grid mode.</td>
              </tr>
              <tr>
                <td><code class="text-secondary font-bold">isHydrated</code></td>
                <td><code>Ref&lt;boolean&gt;</code></td>
                <td>True if the component has finished its first client-side mount.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="text-2xl font-semibold mb-4 pb-2 border-b border-base-200">Functions</h3>
        <div class="space-y-6">
          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">scrollToIndex(row, col, options?)</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Programmatically scrolls to a specific row and/or column.</p>
              <ul class="list-disc pl-6">
                <li><code>row</code>: <code>number | null | undefined</code> - Row index.</li>
                <li><code>col</code>: <code>number | null | undefined</code> - Column index.</li>
                <li><code>options</code>: <code>ScrollAlignment | ScrollAlignmentOptions | ScrollToIndexOptions</code>. Default behavior is <code>'smooth'</code>.</li>
              </ul>
              <p><strong>Returns:</strong> <code>void</code></p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">scrollToOffset(x, y, options?)</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Programmatically scrolls to a specific pixel offset.</p>
              <ul class="list-disc pl-6">
                <li><code>x</code>: <code>number | null | undefined</code> - Horizontal offset.</li>
                <li><code>y</code>: <code>number | null | undefined</code> - Vertical offset.</li>
                <li><code>options</code>: <code>{ behavior?: 'auto' | 'smooth' }</code>. Defaults to <code>{ behavior: 'auto' }</code>.</li>
              </ul>
              <p><strong>Returns:</strong> <code>void</code></p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">updateItemSize(index, width, height, element?)</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Updates the stored size of an item. Should be called when an item is measured (e.g., via <code>ResizeObserver</code>).</p>
              <ul class="list-disc pl-6">
                <li><code>index</code>: <code>number</code> - The item index.</li>
                <li><code>width</code>: <code>number</code> - Measured width in pixels.</li>
                <li><code>height</code>: <code>number</code> - Measured height in pixels.</li>
                <li><code>element</code>: <code>HTMLElement</code> (optional) - The element that was measured. Used in grid mode to auto-detect column widths from children.</li>
              </ul>
              <p><strong>Returns:</strong> <code>void</code></p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">updateHostOffset()</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Recalculates the position of the host element relative to the scroll container. Useful if the container or host moves without a scroll event.</p>
              <p><strong>Returns:</strong> <code>void</code></p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">getColumnWidth(index)</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Helper to get the width of a specific column based on the current <code>columnWidth</code> prop configuration.</p>
              <ul class="list-disc pl-6">
                <li><code>index</code>: <code>number</code> - The column index.</li>
              </ul>
              <p><strong>Returns:</strong> <code>number</code> - The width in pixels.</p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">refresh()</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Resets all dynamic measurements and re-initializes from props.</p>
              <p><strong>Returns:</strong> <code>void</code></p>
            </div>
          </div>
        </div>
      </section>

      <div class="divider" />

      <section id="utilities">
        <h2 class="text-3xl font-bold mb-6">Utilities</h2>
        <p class="mb-6 opacity-80 text-lg">
          Helper functions exported by the library.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">isElement(container)</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Type guard to check if a container is an <code>HTMLElement</code>.</p>
              <p><strong>Returns:</strong> <code>container is HTMLElement</code></p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">isScrollableElement(target)</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Type guard to check if an event target is a scrollable <code>HTMLElement</code>.</p>
              <p><strong>Returns:</strong> <code>target is HTMLElement</code></p>
            </div>
          </div>

          <div class="card bg-base-200 shadow-sm p-6 border border-base-300">
            <h4 class="font-bold text-lg mb-2">isScrollToIndexOptions(options)</h4>
            <div class="text-sm opacity-80 space-y-2">
              <p>Type guard to check if an object matches the <code>ScrollToIndexOptions</code> interface.</p>
              <p><strong>Returns:</strong> <code>options is ScrollToIndexOptions</code></p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
