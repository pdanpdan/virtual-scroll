<script setup lang="ts">
import AppLink from '#/components/AppLink.vue';
import AppLogo from '#/components/AppLogo.vue';
import ExampleCard from '#/components/ExampleCard.vue';
</script>

<template>
  <div class="app-header-card">
    <div class="app-header-body">
      <AppLogo class="shrink-0 size-24 hidden @4xl:block drop-shadow-lg" />
      <div>
        <h1 class="text-primary">Virtual Scroll</h1>
        <p class="text-base @4xl:text-xl opacity-60 font-medium mt-1">
          A high-performance virtualization library for Vue 3.
        </p>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 @2xl:grid-cols-2 @7xl:grid-cols-4 gap-6 spacing-y-8">
    <div class="card bg-base-300 shadow-strong border-2 border-accent/30 col-span-full group">
      <div class="card-body p-4 @4xl:p-8 relative">
        <figure class="absolute top-0 end-0 p-8 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
          <AppLogo class="size-32" />
        </figure>
        <h2 class="card-title text-accent text-2xl @4xl:text-3xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-8"
          ><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.967 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.967 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
          Documentation
        </h2>
        <p class="text-base @4xl:text-lg opacity-80 max-w-4xl">
          Everything you need to know about integrating <code>@pdanpdan/virtual-scroll</code> into your Vue 3 applications.
          From basic list virtualization to advanced grid and SSR setups.
        </p>
        <div class="card-actions mt-8">
          <AppLink v-slot="{ href }" href="/docs">
            <a
              :href
              class="btn btn-accent btn-md @4xl:btn-lg px-10 shadow-lg shadow-accent/20 font-black small-caps tracking-widest"
            >
              Get Started
            </a>
          </AppLink>
        </div>
      </div>
    </div>
    <div class="card bg-base-300 shadow-strong border-2 border-primary/30 col-span-full group">
      <div class="card-body p-4 @4xl:p-8 relative">
        <figure class="absolute top-0 end-0 p-8 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
          <AppLogo class="size-32" />
        </figure>
        <h2 class="card-title text-primary text-2xl @4xl:text-3xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-8"
          ><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
          Configurator / Code Generator
        </h2>
        <p class="text-base @4xl:text-lg opacity-80 max-w-4xl">
          Select the features you need and generate complete typed Vue code - component, composables, or a CodePen.
        </p>
        <div class="card-actions mt-8">
          <AppLink v-slot="{ href }" href="/configurator">
            <a
              :href
              class="btn btn-primary btn-md @4xl:btn-lg px-10 shadow-lg shadow-primary/20 font-black small-caps tracking-widest"
            >
              Configure Code
            </a>
          </AppLink>
        </div>
      </div>
    </div>

    <div class="card bg-base-300 shadow-strong border-2 border-secondary/30 col-span-full group">
      <div class="card-body p-4 @4xl:p-8 relative">
        <figure class="absolute top-0 end-0 p-8 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
          <AppLogo class="size-32" />
        </figure>
        <h2 class="card-title text-secondary text-2xl @4xl:text-3xl mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-8"
          ><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971Zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 0 1-2.031.352 5.989 5.989 0 0 1-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971Z" /></svg>
          Comparison with Alternatives
        </h2>
        <p class="text-base @4xl:text-lg opacity-80 max-w-4xl">
          How this library stacks up against other Vue 3 virtualization solutions.
        </p>
        <div class="card-actions mt-8">
          <AppLink v-slot="{ href }" href="/compare">
            <a
              :href
              class="btn btn-secondary btn-md @4xl:btn-lg px-10 shadow-lg shadow-secondary/20 font-black small-caps tracking-widest"
            >
              Compare Solutions
            </a>
          </AppLink>
        </div>
      </div>
    </div>

    <div class="divider col-span-full font-black small-caps text-sm tracking-widest opacity-80">
      Essentials
    </div>

    <ExampleCard
      type="Essential"
      title="Vertical Fixed"
      description="Optimized for lists where every item has the same height."
      href="/essential-vertical-fixed"
      group="1"
    />

    <ExampleCard
      type="Essential"
      title="Vertical Dynamic"
      description="Handles variable item heights automatically using ResizeObserver."
      href="/essential-vertical-dynamic"
      group="1"
    />

    <ExampleCard
      type="Essential"
      title="Vertical Fixed Body"
      description="Use the browser window as the primary scroll container."
      href="/essential-vertical-fixed-body"
      group="2"
    />

    <ExampleCard
      type="Essential"
      title="Vertical Dynamic Body"
      description="Native window scrolling with variable item heights."
      href="/essential-vertical-dynamic-body"
      group="2"
    />

    <ExampleCard
      type="Essential"
      title="Horizontal Fixed"
      description="Full support for horizontal-only virtualization with fixed widths."
      href="/essential-horizontal-fixed"
      group="3"
    />

    <ExampleCard
      type="Essential"
      title="Horizontal Dynamic"
      description="Horizontal scrolling with variable, measured item widths."
      href="/essential-horizontal-dynamic"
      group="3"
    />

    <ExampleCard
      type="Essential"
      title="Grid Fixed"
      description="Scroll simultaneously in both X and Y axes with virtualized columns."
      href="/essential-grid-fixed"
      group="4"
    />

    <ExampleCard
      type="Essential"
      title="Grid Dynamic"
      description="Bidirectional scroll with programmatic column widths using a function."
      href="/essential-grid-dynamic"
      group="4"
    />

    <div class="divider col-span-full font-black small-caps text-sm tracking-widest opacity-80">
      Features
    </div>

    <ExampleCard
      type="Feature"
      title="Infinite Scroll"
      description="Automatic pagination and loading states when reaching end of content."
      href="/feature-infinite-scroll"
      group="1"
    />

    <ExampleCard
      type="Feature"
      title="Scroll Restoration"
      description="Maintain scroll position seamlessly when items are prepended."
      href="/feature-scroll-restoration"
      group="2"
    />

    <ExampleCard
      type="Feature"
      title="Sticky Sections"
      description="iOS-style pushing headers for segmented lists and grouped items."
      href="/feature-sticky-sections"
      group="3"
    />

    <ExampleCard
      type="Feature"
      title="SSR Support"
      description="Demonstrates pre-rendering and auto-scrolling to a specific range for SSR."
      href="/feature-ssr"
      group="4"
      rel="external"
    />

    <ExampleCard
      type="Feature"
      title="Custom Scrollbar"
      description="Replace native scrollbars with highly customizable virtual ones."
      href="/feature-custom-scrollbar"
      group="5"
    />

    <ExampleCard
      type="Feature"
      title="Independent Scrollbars"
      description="Use VirtualScrollbar components standalone to control any scrollable element."
      href="/feature-independent-scrollbars"
      group="6"
    />

    <ExampleCard
      type="Feature"
      title="Scroll Snapping"
      description="Automatically align to the nearest item after scrolling stops."
      href="/feature-scroll-snap"
      group="7"
    />

    <div class="divider col-span-full font-black small-caps text-sm tracking-widest opacity-80">
      Patterns & Recipes
    </div>

    <ExampleCard
      type="Pattern"
      title="Chat Interface"
      description="Smooth auto-scrolling, history loading, and dynamic message heights."
      href="/pattern-chat"
      group="1"
    />

    <ExampleCard
      type="Pattern"
      title="Table"
      description="Semantic HTML <table> virtualization for accessible data grids."
      href="/pattern-table"
      group="2"
    />

    <ExampleCard
      type="Pattern"
      title="Spreadsheet"
      description="Excel-like bidirectional grid with sticky row and column headers."
      href="/pattern-spreadsheet"
      group="3"
    />

    <ExampleCard
      type="Pattern"
      title="Collapsible Tree"
      description="Virtualized hierarchical list with expandable/collapsible nodes."
      href="/pattern-tree"
      group="4"
    />

    <ExampleCard
      type="Pattern"
      title="Draggable List"
      description="Reorder virtualized items using native drag and drop."
      href="/pattern-draggable"
      group="5"
    />

    <ExampleCard
      type="Pattern"
      title="Photo Gallery"
      description="Virtualized image grid with loading placeholders."
      href="/pattern-gallery"
      group="6"
    />

    <ExampleCard
      type="Pattern"
      title="Masonry Grid"
      description="Achieve masonry layout by combining multiple columns."
      href="/pattern-masonry"
      group="7"
    />

    <ExampleCard
      type="Pattern"
      title="Search & Highlight"
      description="Implement high-performance search across thousands of virtualized items."
      href="/pattern-search"
      group="1"
    />

    <ExampleCard
      type="Pattern"
      title="Blog Posts"
      description="Blog feed with dynamic heights and on-demand post loading."
      href="/pattern-blog"
      group="2"
    />
    <ExampleCard
      type="Pattern"
      title="Data Browser"
      description="Grouped directory with sticky sections, instant search and jump navigation."
      href="/pattern-data-browser"
      group="3"
    />

    <ExampleCard
      type="Pattern"
      title="Log Viewer"
      description="Filter and search 200,000 lazy generated log lines with virtualization."
      href="/pattern-log-viewer"
      group="4"
    />

    <ExampleCard
      type="Pattern"
      title="Code Viewer"
      description="Browse and search the real C++ source used in the code diff example."
      href="/pattern-code-viewer"
      group="5"
    />
  </div>
</template>
