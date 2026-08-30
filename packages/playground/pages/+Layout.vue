<script lang="ts" setup>
import { usePageContext } from 'vike-vue/usePageContext';
import { computed, onMounted, provide, ref, watch } from 'vue';

import AppLink from '#/components/AppLink.vue';
import AppLogo from '#/components/AppLogo.vue';

import { version } from '../../virtual-scroll/package.json';

import '#/assets/style.css';

const pageContext = usePageContext();

const debugMode = ref(false);
provide('debugMode', debugMode);

const rtlMode = ref(false);
provide('rtlMode', rtlMode);

const theme = ref<'light' | 'dark' | null>(null);

function toggleTheme() {
  if (theme.value == null) {
    theme.value = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
  } else {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
  }
}

const drawerOpen = ref(false);
const drawerRef = ref<HTMLElement | null>(null);

watch(() => pageContext.urlPathname, () => {
  setTimeout(() => {
    drawerOpen.value = false;
    scrollToActiveLink();
  }, 60);
}, { immediate: true });

watch(drawerOpen, (open) => {
  if (open) {
    setTimeout(() => {
      scrollToActiveLink();
    }, 60);
  }
});

function scrollToActiveLink() {
  if (drawerRef.value != null) {
    const activeLink = drawerRef.value.querySelector('.drawer-link--active') as HTMLElement;

    if (activeLink) {
      const containerRect = drawerRef.value.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();

      if (linkRect.top >= containerRect.top && linkRect.bottom <= containerRect.bottom) {
        return;
      }

      const relativeTop = linkRect.top - containerRect.top;
      const targetScrollTop = drawerRef.value.scrollTop + relativeTop - (containerRect.height / 2) + (linkRect.height / 2);

      drawerRef.value.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });
    }
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
  { href: '/configurator', label: 'Configurator / Code Generator' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/llms.txt', label: 'LLM Support', props: { rel: 'external', target: '_blank' } },
];

const essentialLinks: Link[] = [
  { href: '/essential-vertical-fixed', label: 'Vertical Fixed' },
  { href: '/essential-vertical-dynamic', label: 'Vertical Dynamic' },
  { href: '/essential-vertical-fixed-body', label: 'Vertical Fixed Body' },
  { href: '/essential-vertical-dynamic-body', label: 'Vertical Dynamic Body' },
  { href: '/essential-horizontal-fixed', label: 'Horizontal Fixed' },
  { href: '/essential-horizontal-dynamic', label: 'Horizontal Dynamic' },
  { href: '/essential-grid-fixed', label: 'Grid Fixed' },
  { href: '/essential-grid-dynamic', label: 'Grid Dynamic' },
];

const featureLinks: Link[] = [
  { href: '/feature-infinite-scroll', label: 'Infinite Scroll' },
  { href: '/feature-scroll-restoration', label: 'Scroll Restoration' },
  { href: '/feature-sticky-sections', label: 'Sticky Sections' },
  { href: '/feature-ssr', label: 'SSR Support', props: { rel: 'external' } },
  { href: '/feature-custom-scrollbar', label: 'Custom Scrollbar' },
  { href: '/feature-independent-scrollbars', label: 'Independent Scrollbars' },
  { href: '/feature-scroll-snap', label: 'Scroll Snap' },
];

const patternLinks: Link[] = [
  { href: '/pattern-chat', label: 'Chat Interface' },
  { href: '/pattern-table', label: 'Table' },
  { href: '/pattern-spreadsheet', label: 'Spreadsheet' },
  { href: '/pattern-tree', label: 'Collapsible Tree' },
  { href: '/pattern-draggable', label: 'Draggable List' },
  { href: '/pattern-gallery', label: 'Photo Gallery' },
  { href: '/pattern-masonry', label: 'Masonry Grid' },
  { href: '/pattern-search', label: 'Search & Highlight' },
  { href: '/pattern-diff', label: 'Side-by-Side Code Diff' },
  { href: '/pattern-blog', label: 'Blog Posts' },
];

const isExamplePage = computed(() => {
  const pathname = pageContext.urlPathname;
  return [ ...essentialLinks, ...featureLinks, ...patternLinks ].some((link) => pathname.includes(link.href));
});

const linkGroups = [
  { title: 'Essentials', links: essentialLinks },
  { title: 'Features', links: featureLinks },
  { title: 'Patterns', links: patternLinks },
];
</script>

<template>
  <div class="drawer lg:drawer-open">
    <input id="app-drawer-main" v-model="drawerOpen" type="checkbox" class="drawer-toggle" />
    <div class="drawer-content flex flex-col">
      <!-- Navbar -->
      <div class="navbar sticky top-0 z-1 bg-base-300 shadow-sm lg:hidden mb-4">
        <div class="flex-none">
          <label for="app-drawer-main" class="btn btn-ghost btn-square drawer-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </label>
        </div>
        <div class="flex items-center px-4 gap-3 me-auto">
          <div class="transition-transform hover:scale-105 drop-shadow-md">
            <AppLogo class="shrink-0 size-12" />
          </div>
          <div class="flex flex-col gap-0">
            <span class="text-xl font-black tracking-wide small-caps italic text-primary leading-none">Virtual Scroll</span>
            <span class="text-xs font-mono opacity-40 uppercase tracking-tighter leading-none mt-1">v{{ version }}</span>
          </div>
        </div>
        <div class="flex-none">
          <a
            href="https://github.com/pdanpdan/virtual-scroll"
            class="btn btn-ghost btn-square"
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
      <main class="p-2 md:p-4 xl:p-8 mb-48 @container">
        <slot />
      </main>
    </div>

    <div ref="drawerRef" class="drawer-side drawer-side-container z-50">
      <label for="app-drawer-main" aria-label="close sidebar" class="drawer-overlay" />
      <ul class="menu p-0 pb-6 w-76 min-h-full bg-base-300 text-base-content gap-0.5">
        <!-- Sidebar content here -->
        <li class="menu-title drawer-header max-lg:py-2 sticky top-0 bg-inherit z-1">
          <div class="flex items-center gap-3">
            <div class="transition-transform hover:scale-105 drop-shadow-md">
              <AppLogo class="shrink-0 size-12" />
            </div>
            <div class="flex flex-col gap-0">
              <span class="text-xl font-black tracking-wide small-caps italic text-primary leading-none">Virtual Scroll</span>
              <span class="text-xs font-mono opacity-40 uppercase tracking-tighter leading-none mt-1">v{{ version }}</span>
            </div>
          </div>
          <a
            href="https://github.com/pdanpdan/virtual-scroll"

            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-ghost btn-md btn-circle opacity-60 hover:opacity-100 transition-opacity"
            aria-label="GitHub Repository"
          >
            <svg class="size-6 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
          </a>
        </li>

        <li v-for="link in navLinks" :key="link.href" class="px-2">
          <AppLink v-slot="{ href, active }" :href="link.href">
            <a
              :href
              class="drawer-link"
              :class="{ 'drawer-link--active': active }"
              v-bind="link.props"
              :data-vike="link.props?.rel === 'external' ? 'false' : undefined"
            >
              {{ link.label }}
            </a>
          </AppLink>
        </li>

        <li v-for="group in linkGroups" :key="group.title" class="px-2">
          <div class="menu-title divider drawer-menu-title">{{ group.title }}</div>
          <ul class="ms-0 ps-0 flex flex-col gap-0.5 before:hidden">
            <li v-for="link in group.links" :key="link.href">
              <AppLink v-slot="{ href, active }" :href="link.href">
                <a
                  :href
                  class="drawer-link"
                  :class="{ 'drawer-link--active': active }"
                  v-bind="link.props"
                  :data-vike="link.props?.rel === 'external' ? 'false' : undefined"
                >
                  {{ link.label }}
                </a>
              </AppLink>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>

  <div id="app-settings" class="sheet z-50 [--sheet-handle-size:32px]" popover="manual">
    <div class="sheet-content sheet-content-bottom w-fit left-1/2 -translate-x-1/2 overflow-visible">
      <button
        class="sheet-handle appearance-none after:hidden h-8 w-36"
        popovertarget="app-settings"
        popovertargetaction="toggle"
      >
        <div class="bg-accent text-accent-content small-caps text-lg tracking-wider rounded-t-box flex flex-nowrap items-center justify-center">
          <div class="ms-2">Settings</div>
          <svg
            class="sheet-handle-icon sheet-handle-icon--bottom"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
          </svg>
        </div>
      </button>

      <div
        class="flex items-center gap-2 p-2 mb-1 min-w-64 bg-base-300 rounded-box shadow-soft text-sm"
        :class="isExamplePage ? 'max-md:flex-col max-md:items-stretch max-md:gap-1' : 'flex-col items-stretch gap-1'"
      >
        <label class="settings-item group p-2 min-w-32">
          <span class="settings-label me-2">Theme</span>
          <div class="swap swap-rotate me-2">
            <input type="checkbox" class="theme-controller" :checked="theme === 'dark'" @change="toggleTheme" />
            <svg class="swap-off size-6 fill-primary transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg class="swap-on size-6 fill-primary transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </div>
        </label>

        <label v-if="isExamplePage" class="settings-item group p-2 min-w-32">
          <span class="settings-label me-2">RTL Mode</span>
          <input v-model="rtlMode" type="checkbox" class="toggle toggle-primary" />
        </label>

        <label v-if="isExamplePage" class="settings-item group p-2 min-w-32">
          <span class="settings-label me-2">Debug Mode</span>
          <input v-model="debugMode" type="checkbox" class="toggle toggle-primary" />
        </label>
      </div>
    </div>
  </div>
</template>
