<script lang="ts" setup>
import { onMounted, provide, ref, watch } from 'vue';

import AppLink from '#/components/AppLink.vue';
import { navigateWithTransition } from '#/navigate';

import '#/assets/style.css';

const debugMode = ref(false);
provide('debugMode', debugMode);

const theme = ref<'light' | 'dark' | null>(null);

function toggleTheme() {
  if (theme.value == null) {
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
  } else {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('vs-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') {
    theme.value = savedTheme;
  } else {
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
});

watch(theme, (newTheme) => {
  if (typeof document !== 'undefined' && newTheme != null) {
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('vs-theme', newTheme);
  }
}, { immediate: true });

interface Link {
  href: string;
  label: string;
  props?: Record<string, unknown>;
}

const navLinks: Link[] = [
  { href: '/', label: 'Welcome' },
  { href: '/docs', label: 'Documentation' },
];

const exampleLinks: Link[] = [
  { href: '/vertical-fixed', label: 'Vertical Fixed' },
  { href: '/vertical-dynamic', label: 'Vertical Dynamic' },
  { href: '/vertical-fixed-body', label: 'Vertical Fixed Body' },
  { href: '/vertical-dynamic-body', label: 'Vertical Dynamic Body' },
  { href: '/horizontal-fixed', label: 'Horizontal Fixed' },
  { href: '/horizontal-dynamic', label: 'Horizontal Dynamic' },
  { href: '/grid-fixed', label: 'Grid Fixed' },
  { href: '/grid-dynamic', label: 'Grid Dynamic' },
  { href: '/grid-ssr', label: 'Grid SSR', props: { rel: 'external' } },
  { href: '/vertical-fixed-table', label: 'Vertical Fixed Table' },
];

const featureLinks: Link[] = [
  { href: '/feature-infinite-scroll', label: 'Infinite Scroll' },
  { href: '/feature-sticky-sections', label: 'Sticky Sections' },
  { href: '/feature-scroll-restoration', label: 'Scroll Restoration' },
  { href: '/feature-chat', label: 'Chat Interface' },
  { href: '/feature-spreadsheet', label: 'Spreadsheet' },
];
</script>

<template>
  <div class="drawer lg:drawer-open">
    <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar sticky top-0 z-1 bg-base-300 w-full lg:hidden">
        <div class="flex-none">
          <label for="my-drawer-2" class="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </label>
        </div>
        <div class="flex-1 px-2 mx-2 font-bold">
          Virtual Scroll
        </div>
        <div class="flex-none">
          <a
            href="https://github.com/pdanpdan/virtual-scroll"
            class="btn btn-ghost btn-circle"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub Repository"
          >
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </div>
      </div>

      <!-- Page content here -->
      <main class="p-2 md:p-4 max-w-full">
        <slot />
      </main>
    </div>

    <div class="drawer-side min-h-dvh border-r border-base-300">
      <label for="my-drawer-2" aria-label="close sidebar" class="drawer-overlay" />
      <ul class="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
        <!-- Sidebar content here -->
        <li class="menu-title text-lg font-bold mb-4 flex flex-row items-center justify-between">
          <span>Virtual Scroll</span>
          <a
            href="https://github.com/pdanpdan/virtual-scroll"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-sm btn-circle"
            aria-label="GitHub Repository"
          >
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </li>

        <li v-for="link in navLinks" :key="link.href">
          <AppLink v-slot="{ href, active }" :href="link.href">
            <a
              :href
              :class="{ 'menu-active': active }"
              v-bind="link.props"
              data-vike="false"
              @click.prevent="navigateWithTransition(href, link.href === '/' ? 'back' : 'forward')"
            >
              {{ link.label }}
            </a>
          </AppLink>
        </li>

        <div class="divider">
          Examples
        </div>

        <li v-for="link in exampleLinks" :key="link.href">
          <AppLink v-slot="{ href, active }" :href="link.href">
            <a
              :href
              :class="{ 'menu-active': active }"
              v-bind="link.props"
              data-vike="false"
              @click.prevent="navigateWithTransition(href, 'forward')"
            >
              {{ link.label }}
            </a>
          </AppLink>
        </li>

        <div class="divider">
          Features
        </div>

        <li v-for="link in featureLinks" :key="link.href">
          <AppLink v-slot="{ href, active }" :href="link.href">
            <a
              :href
              :class="{ 'menu-active': active }"
              v-bind="link.props"
              data-vike="false"
              @click.prevent="navigateWithTransition(href, 'forward')"
            >
              {{ link.label }}
            </a>
          </AppLink>
        </li>

        <div class="divider">
          Settings
        </div>

        <li>
          <label class="flex items-center justify-between p-2">
            <span class="text-sm font-medium">Theme</span>

            <div class="swap swap-rotate me-1">
              <input type="checkbox" class="theme-controller" :checked="theme === 'dark'" @change="toggleTheme" />

              <svg class="swap-off h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
              </svg>

              <svg class="swap-on h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
              </svg>
            </div>
          </label>
        </li>

        <li>
          <label class="flex items-center justify-between p-2 cursor-pointer">
            <span class="text-sm font-medium">Debug Mode</span>
            <input v-model="debugMode" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>
        </li>
      </ul>
    </div>
  </div>
</template>

<style>
html, body {
  block-size: 100%;
  margin: 0;
}
</style>
