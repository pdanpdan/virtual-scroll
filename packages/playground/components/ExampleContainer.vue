<script setup lang="ts">
import { usePageContext } from 'vike-vue/usePageContext';
import { computed, inject, ref } from 'vue';

import { matchHref } from '#/lib/url';

import AppLink from './AppLink.vue';
import CodeBlock from './CodeBlock.vue';
import ViewSource from './ViewSource.vue';

const props = withDefaults(defineProps<{
  height?: string;
  minHeight?: string;
  minWidth?: string;
  code?: string;
}>(), {
  height: 'min(80svh, 900px)',
  minHeight: 'min(10svh, 50px)',
  minWidth: 'min(10vw, 50px)',
});

const rtlMode = inject('rtlMode', ref(false));

const activeTab = ref<'preview' | 'code'>('preview');
const copied = ref(false);

const containerStyle = {
  blockSize: props.height,
  minBlockSize: props.minHeight,
  minInlineSize: props.minWidth,
};

async function copyCode() {
  if (!props.code) {
    return;
  }
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

/**
 * Expand the (collapsible) implementation guide and scroll it into view below
 * the sticky header. The guide is rendered above the example, so it starts
 * closed to keep the demo readable; this is the header button that reveals it.
 */
function goToGuide() {
  const el = document.getElementById('implementation-guide') as HTMLDetailsElement;
  if (!el || el.tagName !== 'DETAILS') {
    return;
  }
  el.open = true;
  // Wait a frame so the expansion reflows before we compute the scroll target.
  requestAnimationFrame(() => {
    const rect = el.getBoundingClientRect();
    const scrollPadding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    window.scrollTo({
      top: window.scrollY + rect.top - scrollPadding,
      behavior: 'smooth',
    });
  });
}

const pageContext = usePageContext();
const isIndex = computed(() => matchHref('/', pageContext.urlPathname) || matchHref('/index', pageContext.urlPathname));
</script>

<template>
  <div class="space-y-4 @4xl:space-y-8">
    <div v-if="$slots.title || $slots.description" class="app-card">
      <div class="card-body relative p-4 @4xl:p-8" :class="isIndex ? undefined : 'pb-2 @4xl:pb-2'">
        <figure v-if="$slots.icon" class="hidden @4xl:block absolute top-6 end-6 pointer-events-none">
          <slot name="icon" />
        </figure>
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h1 v-if="$slots.title" class="text-xl @4xl:text-2xl m-0 font-extrabold tracking-tight">
              <slot name="title" />
            </h1>
            <div v-if="$slots.subtitle" class="text-xs @4xl:text-sm font-bold small-caps tracking-widest opacity-40 mt-1">
              <slot name="subtitle" />
            </div>
          </div>
        </div>
        <div v-if="$slots.description" class="opacity-70 m-0 mt-4 text-sm @4xl:text-base leading-relaxed max-w-3xl">
          <slot name="description" />
        </div>

        <div v-if="!isIndex" class="card-actions justify-between items-center my-2">
          <AppLink v-slot="{ href }" href="/">
            <a :href class="btn btn-sm btn-soft gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="size-3"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              <span class="small-caps font-bold tracking-widest hidden @4xl:inline">Back to Home</span>
            </a>
          </AppLink>

          <div class="flex flex-wrap items-center justify-end gap-2">
            <button
              v-if="$slots.implementation"
              type="button"
              class="btn btn-sm btn-soft gap-1.5"
              aria-controls="implementation-guide"
              @click="goToGuide"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="size-3"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
              <span class="small-caps font-bold tracking-widest">How To</span>
            </button>

            <ViewSource class="btn btn-sm btn-soft gap-1.5" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="$slots.implementation">
      <slot name="implementation" />
    </div>

    <div class="card flex flex-col bg-base-300 shadow-soft overflow-auto resize" :style="containerStyle">
      <div class="flex items-center justify-between gap-2 m-2">
        <div class="join">
          <button
            class="join-item btn btn-soft btn-primary btn-sm min-w-32"
            :class="{ 'btn-active': activeTab === 'preview' }"
            @click="activeTab = 'preview'"
          >
            Preview
          </button>
          <button
            class="join-item btn btn-soft btn-primary btn-sm min-w-32"
            :class="{ 'btn-active': activeTab === 'code' }"
            @click="activeTab = 'code'"
          >
            Code
          </button>
        </div>

        <div class="flex-1" />

        <button
          v-if="activeTab === 'code' && code"
          class="btn btn-ghost btn-sm gap-2"
          @click="copyCode"
        >
          <svg
            v-if="!copied"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-3.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-2.013.447-2.725 1.212L4.435 7.763a2.25 2.25 0 0 0-.593 1.51V18a2.25 2.25 0 0 0 2.25 2.25h11.25A2.25 2.25 0 0 0 19.5 18v-4.5m-3-10.5 3 3m-3-3h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5m3-3 3 3m-9-3h2.25A2.25 2.25 0 0 1 15 11.25V18" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="size-3.5 text-success"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          <span class="font-bold text-xs small-caps tracking-wider">{{ copied ? 'Copied!' : 'Copy' }}</span>
        </button>
      </div>

      <div
        v-show="activeTab === 'preview'"
        class="flex-1 min-h-0 mx-2 mb-2 rounded-[inherit] overflow-auto flex flex-col"
        :dir="rtlMode ? 'rtl' : 'ltr'"
      >
        <div v-if="$slots['example-controls']" class="p-2 @4xl:px-4 bg-base-200" dir="ltr">
          <slot name="example-controls" />
        </div>
        <slot />
      </div>

      <CodeBlock
        v-if="code"
        v-show="activeTab === 'code'"
        class="flex-1 mx-2 mb-2 rounded-[inherit]"
        lang="vue"
        :code="code"
        line-numbers
      />
    </div>
  </div>

  <div v-if="$slots.controls" id="virtual-scroll-controls" class="sheet z-50 [--sheet-handle-size:32px]" popover="manual">
    <div class="sheet-content sheet-content-end h-fit top-1 translate-y-0 overflow-visible">
      <button
        class="sheet-handle appearance-none after:hidden h-36 w-8 top-19 translate-y-0"
        popovertarget="virtual-scroll-controls"
        popovertargetaction="toggle"
      >
        <div class="bg-accent text-accent-content small-caps text-lg tracking-wider rounded-l-box flex flex-col flex-nowrap items-center justify-center">
          <svg
            class="sheet-handle-icon sheet-handle-icon--right"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
          </svg>
          <div class="me-2 [writing-mode:vertical-lr] rotate-180">Controls</div>
        </div>
      </button>

      <div class="flex max-lg:flex-col flex-wrap gap-1 items-stretch pe-1">
        <slot name="controls" />
      </div>
    </div>
  </div>
</template>
