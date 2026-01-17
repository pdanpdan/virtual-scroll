<script setup lang="ts">
import AppLink from '#/components/AppLink.vue';
import { navigateWithTransition, normalizeHref } from '#/navigate';

const logoUrl = normalizeHref('logo.svg');
</script>

<template>
  <div class="prose max-w-none">
    <div class="card bg-base-200 shadow-sm border border-base-300">
      <div class="card-body p-6 flex-row items-center gap-6">
        <img :src="logoUrl" class="w-16 h-16" alt="Logo" />
        <div>
          <h1 class="card-title m-0 text-3xl">Virtual Scroll Playground</h1>
          <p class="opacity-70 m-0">A high-performance virtualization library for Vue 3.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mt-8">
      <div class="card bg-base-300 shadow-md border-2 border-primary/20">
        <div class="card-body">
          <h2 class="card-title text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="w-6 h-6"
            ><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.967 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.967 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
            Documentation
          </h2>
          <p>Comprehensive guide on how to use the VirtualScroll component and the underlying composable API.</p>
          <div class="card-actions justify-end">
            <AppLink v-slot="{ href }" href="/docs">
              <a
                :href
                class="btn btn-primary"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                Read Documentation
              </a>
            </AppLink>
          </div>
        </div>
      </div>
    </div>

    <div class="divider my-8">
      Examples
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mt-8">
      <!-- Vertical -->
      <div class="card bg-base-300 shadow-md border-t-4 border-primary">
        <div class="card-body">
          <h2 class="card-title text-primary font-bold uppercase text-xs opacity-60">Vertical</h2>
          <h3 class="card-title mt-0">Vertical Fixed</h3>
          <p class="text-sm opacity-80">Optimized for lists where every item has the same height.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/vertical-fixed">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-primary">
        <div class="card-body">
          <h2 class="card-title text-primary font-bold uppercase text-xs opacity-60">Vertical</h2>
          <h3 class="card-title mt-0">Vertical Dynamic</h3>
          <p class="text-sm opacity-80">Handles variable item heights automatically using ResizeObserver.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/vertical-dynamic">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-success">
        <div class="card-body">
          <h2 class="card-title text-success font-bold uppercase text-xs opacity-60">Vertical</h2>
          <h3 class="card-title mt-0">Vertical Fixed Body</h3>
          <p class="text-sm opacity-80">Use the browser window as the primary scroll container.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/vertical-fixed-body">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-success">
        <div class="card-body">
          <h2 class="card-title text-success font-bold uppercase text-xs opacity-60">Vertical</h2>
          <h3 class="card-title mt-0">Vertical Dynamic Body</h3>
          <p class="text-sm opacity-80">Native window scrolling with variable item heights.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/vertical-dynamic-body">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <!-- Horizontal -->
      <div class="card bg-base-300 shadow-md border-t-4 border-accent">
        <div class="card-body">
          <h2 class="card-title text-accent font-bold uppercase text-xs opacity-60">Horizontal</h2>
          <h3 class="card-title mt-0">Horizontal Fixed</h3>
          <p class="text-sm opacity-80">Full support for horizontal-only virtualization with fixed widths.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/horizontal-fixed">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-accent">
        <div class="card-body">
          <h2 class="card-title text-accent font-bold uppercase text-xs opacity-60">Horizontal</h2>
          <h3 class="card-title mt-0">Horizontal Dynamic</h3>
          <p class="text-sm opacity-80">Horizontal scrolling with variable, measured item widths.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/horizontal-dynamic">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <!-- Bidirectional -->
      <div class="card bg-base-300 shadow-md border-t-4 border-info">
        <div class="card-body">
          <h2 class="card-title text-info font-bold uppercase text-xs opacity-60">Grid</h2>
          <h3 class="card-title mt-0">Grid Fixed</h3>
          <p class="text-sm opacity-80">Scroll simultaneously in both X and Y axes with virtualized columns.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/grid-fixed">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-info">
        <div class="card-body">
          <h2 class="card-title text-info font-bold uppercase text-xs opacity-60">Grid</h2>
          <h3 class="card-title mt-0">Grid Dynamic</h3>
          <p class="text-sm opacity-80">Bidirectional scroll with programmatic column widths using a function.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/grid-dynamic">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-info">
        <div class="card-body">
          <h2 class="card-title text-info font-bold uppercase text-xs opacity-60">Grid</h2>
          <h3 class="card-title mt-0">Grid SSR Support</h3>
          <p class="text-sm opacity-80">Demonstrates pre-rendering and auto-scrolling to a specific range for SSR.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/grid-ssr">
              <a
                :href
                rel="external"
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-warning">
        <div class="card-body">
          <h2 class="card-title text-warning font-bold uppercase text-xs opacity-60">Vertical</h2>
          <h3 class="card-title mt-0">Vertical Fixed Table</h3>
          <p class="text-sm opacity-80">Custom tags (table, tbody, tr) for accessible tabular data.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/vertical-fixed-table">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>
    </div>

    <div class="divider my-8">
      Features
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-6 mt-8">
      <div class="card bg-base-300 shadow-md border-t-4 border-primary">
        <div class="card-body">
          <h2 class="card-title text-primary font-bold uppercase text-xs opacity-60">Feature</h2>
          <h3 class="card-title mt-0">Infinite Scroll</h3>
          <p class="text-sm opacity-80">Automatic pagination and loading states when reaching end of content.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/feature-infinite-scroll">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-secondary">
        <div class="card-body">
          <h2 class="card-title text-secondary font-bold uppercase text-xs opacity-60">Feature</h2>
          <h3 class="card-title mt-0">Sticky Sections</h3>
          <p class="text-sm opacity-80">iOS-style pushing of headers for segmented lists.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/feature-sticky-sections">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-warning">
        <div class="card-body">
          <h2 class="card-title text-warning font-bold uppercase text-xs opacity-60">Feature</h2>
          <h3 class="card-title mt-0">Scroll Restoration</h3>
          <p class="text-sm opacity-80">Maintain scroll position seamlessly when items are prepended.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/feature-scroll-restoration">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>

      <div class="card bg-base-300 shadow-md border-t-4 border-error">
        <div class="card-body">
          <h2 class="card-title text-error font-bold uppercase text-xs opacity-60">Feature</h2>
          <h3 class="card-title mt-0">Chat Interface</h3>
          <p class="text-sm opacity-80">A full-featured chat UI with smooth auto-scrolling and history loading.</p>
          <div class="card-actions justify-end mt-2">
            <AppLink v-slot="{ href }" href="/feature-chat">
              <a
                :href
                class="btn btn-soft"
                data-vike="false"
                @click.prevent="navigateWithTransition(href, 'forward')"
              >
                View Example
              </a>
            </AppLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
