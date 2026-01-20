<script setup lang="ts">
import AppLink from '#/components/AppLink.vue';
import AppLogo from '#/components/AppLogo.vue';
import ExampleCard from '#/components/ExampleCard.vue';
import { navigateWithTransition } from '#/navigate';
</script>

<template>
  <div>
    <div class="card shadow-soft bg-base-300">
      <div class="card-body flex-row items-center p-4 md:p-8 gap-4 md:gap-8">
        <AppLogo class="size-16 md:size-24 drop-shadow-lg" />
        <div>
          <h1 class="text-primary">Virtual Scroll</h1>
          <p class="text-base md:text-xl opacity-60 font-medium">
            A high-performance virtualization library for Vue 3.
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mt-8">
      <div class="card bg-base-300 shadow-strong border-2 border-accent/30 md:col-span-2 2xl:col-span-2 overflow-hidden group">
        <div class="card-body p-8 md:p-10 relative">
          <div class="absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
            <AppLogo class="size-32" />
          </div>
          <h2 class="card-title text-accent text-2xl md:text-3xl mb-4">
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
          <p class="text-base md:text-lg opacity-80 max-w-xl">
            Everything you need to know about integrating <code>@pdanpdan/virtual-scroll</code> into your Vue 3 applications.
            From basic list virtualization to advanced grid and SSR setups.
          </p>
          <div class="card-actions justify-start mt-8">
            <AppLink v-slot="{ href }" href="/docs">
              <a
                :href
                class="btn btn-accent btn-md md:btn-lg px-10 shadow-lg shadow-accent/20 font-black small-caps tracking-widest"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                Get Started
              </a>
            </AppLink>
          </div>
        </div>
      </div>
    </div>

    <div class="divider my-8 font-bold small-caps text-xs tracking-widest opacity-50">
      Examples
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mt-8">
      <!-- Vertical -->
      <ExampleCard
        type="Vertical"
        title="Vertical Fixed"
        description="Optimized for lists where every item has the same height."
        href="/vertical-fixed"
        group="1"
      />

      <ExampleCard
        type="Vertical"
        title="Vertical Dynamic"
        description="Handles variable item heights automatically using ResizeObserver."
        href="/vertical-dynamic"
        group="1"
      />

      <ExampleCard
        type="Vertical"
        title="Vertical Fixed Body"
        description="Use the browser window as the primary scroll container."
        href="/vertical-fixed-body"
        group="2"
      />

      <ExampleCard
        type="Vertical"
        title="Vertical Dynamic Body"
        description="Native window scrolling with variable item heights."
        href="/vertical-dynamic-body"
        group="2"
      />

      <!-- Horizontal -->
      <ExampleCard
        type="Horizontal"
        title="Horizontal Fixed"
        description="Full support for horizontal-only virtualization with fixed widths."
        href="/horizontal-fixed"
        group="3"
      />

      <ExampleCard
        type="Horizontal"
        title="Horizontal Dynamic"
        description="Horizontal scrolling with variable, measured item widths."
        href="/horizontal-dynamic"
        group="3"
      />

      <!-- Bidirectional -->
      <ExampleCard
        type="Grid"
        title="Grid Fixed"
        description="Scroll simultaneously in both X and Y axes with virtualized columns."
        href="/grid-fixed"
        group="4"
      />

      <ExampleCard
        type="Grid"
        title="Grid Dynamic"
        description="Bidirectional scroll with programmatic column widths using a function."
        href="/grid-dynamic"
        group="4"
      />

      <ExampleCard
        type="Grid"
        title="Grid SSR Support"
        description="Demonstrates pre-rendering and auto-scrolling to a specific range for SSR."
        href="/grid-ssr"
        group="4"
        rel="external"
      />

      <ExampleCard
        type="Table"
        title="Vertical Fixed Table"
        description="Semantic HTML <table> virtualization for accessible data grids."
        href="/vertical-fixed-table"
        group="5"
      />
    </div>

    <div class="divider my-8 font-bold small-caps text-xs tracking-widest opacity-50">
      Features
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mt-8">
      <ExampleCard
        type="Feature"
        title="Infinite Scroll"
        description="Automatic pagination and loading states when reaching end of content."
        href="/feature-infinite-scroll"
        group="1"
      />

      <ExampleCard
        type="Feature"
        title="Sticky Sections"
        description="iOS-style pushing headers for segmented lists and grouped items."
        href="/feature-sticky-sections"
        group="2"
      />

      <ExampleCard
        type="Feature"
        title="Scroll Restoration"
        description="Maintain scroll position seamlessly when items are prepended."
        href="/feature-scroll-restoration"
        group="3"
      />

      <ExampleCard
        type="Feature"
        title="Chat Interface"
        description="Smooth auto-scrolling, history loading, and dynamic message heights."
        href="/feature-chat"
        group="4"
      />

      <ExampleCard
        type="Feature"
        title="Spreadsheet"
        description="Excel-like bidirectional grid with sticky row and column headers."
        href="/feature-spreadsheet"
        group="5"
      />
    </div>
  </div>
</template>
