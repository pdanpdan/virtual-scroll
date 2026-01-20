<script setup lang="ts">
import { usePageContext } from 'vike-vue/usePageContext';
import { computed, ref } from 'vue';

import { matchHref, navigateWithTransition } from '#/navigate';

import CodeBlock from './CodeBlock.vue';

const props = withDefaults(defineProps<{
  height?: string;
  minHeight?: string;
  minWidth?: string;
  code?: string;
}>(), {
  height: 'min(50dvh, 600px)',
  minHeight: 'min(10dvh, 50px)',
  minWidth: 'min(10vw, 50px)',
});

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

const pageContext = usePageContext();
const isIndex = computed(() => matchHref('/', pageContext.urlPathname) || matchHref('/index', pageContext.urlPathname));
</script>

<template>
  <div class="space-y-2 md:space-y-4">
    <div v-if="$slots.title || $slots.description" class="prose max-w-none mb-6">
      <div class="card card-side bg-base-300 shadow-soft overflow-hidden">
        <figure v-if="$slots.icon" class="shrink-0 items-start justify-center pt-7 ps-5 hidden sm:flex">
          <slot name="icon" />
        </figure>
        <div class="card-body p-5 md:p-6">
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h1 v-if="$slots.title" class="text-xl md:text-2xl m-0 font-extrabold tracking-tight">
                <slot name="title" />
              </h1>
              <div v-if="$slots.subtitle" class="text-xs md:text-sm font-bold small-caps tracking-widest opacity-40 mt-1">
                <slot name="subtitle" />
              </div>
            </div>
            <button
              v-if="!isIndex"
              class="btn btn-sm btn-soft gap-1.5"
              @click="navigateWithTransition('/', 'back')"
            >
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
              <span class="hidden md:inline">Back to Welcome</span>
            </button>
          </div>
          <div v-if="$slots.description" class="opacity-70 m-0 mt-4 text-sm md:text-base leading-relaxed max-w-3xl">
            <slot name="description" />
          </div>
        </div>
      </div>
    </div>

    <slot name="controls" />

    <div class="flex flex-col bg-base-300 border border-base-content/10 rounded-box shadow-soft overflow-hidden resize" :style="containerStyle">
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
        class="flex-1 mx-2 mb-2 overflow-auto rounded-[inherit] bg-base-100 border border-base-content/5 shadow-inner"
      >
        <slot />
      </div>

      <CodeBlock
        v-if="code"
        v-show="activeTab === 'code'"
        class="flex-1 mx-2 mb-2 rounded-[inherit] shadow-inner border border-base-content/10"
        lang="vue"
        :code="code"
        line-numbers
      />
    </div>
  </div>
</template>
