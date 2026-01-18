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
    <div v-if="$slots.title || $slots.description" class="prose max-w-none">
      <div class="card card-side bg-base-300 shadow-sm border border-base-300">
        <figure v-if="$slots.icon" class="shrink-0 flex items-start justify-center pt-5.5 ps-4">
          <slot name="icon" />
        </figure>
        <div class="card-body p-4">
          <div class="flex items-center justify-between">
            <h1 v-if="$slots.title" class="text-lg m-0">
              <slot name="title" />
              <slot name="subtitle" />
            </h1>
            <button
              v-if="!isIndex"
              class="btn btn-xs btn-ghost gap-1 opacity-90 hover:opacity-100"
              @click="navigateWithTransition('/', 'back')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-3"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
              </svg>
              <span class="max-sm:hidden">Back to Welcome</span>
            </button>
          </div>
          <div v-if="$slots.description" class="opacity-85 m-0">
            <slot name="description" />
          </div>
        </div>
      </div>
    </div>

    <slot name="controls" />

    <div class="flex flex-col border border-base-300 rounded-box overflow-hidden bg-base-300 resize" :style="containerStyle">
      <div class="flex items-center justify-between px-4 py-2 bg-base-200/50">
        <div class="tabs tabs-boxed bg-transparent p-0">
          <button
            class="tab tab-sm"
            :class="{ 'tab-active': activeTab === 'preview' }"
            @click="activeTab = 'preview'"
          >
            Preview
          </button>
          <button
            class="tab tab-sm"
            :class="{ 'tab-active': activeTab === 'code' }"
            @click="activeTab = 'code'"
          >
            Code
          </button>
        </div>

        <button
          v-if="activeTab === 'code' && code"
          class="btn btn-ghost btn-xs gap-2"
          @click="copyCode"
        >
          <svg
            v-if="!copied"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-2.013.447-2.725 1.212L4.435 7.763a2.25 2.25 0 0 0-.593 1.51V18a2.25 2.25 0 0 0 2.25 2.25h11.25A2.25 2.25 0 0 0 19.5 18v-4.5m-3-10.5 3 3m-3-3h-1.5a2.25 2.25 0 0 0-2.25 2.25v1.5m3-3 3 3m-9-3h2.25A2.25 2.25 0 0 1 15 11.25V18" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4 text-success"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
      </div>

      <div v-show="activeTab === 'preview'" class="flex-1 mx-4 mb-4 overflow-auto rounded-box">
        <slot />
      </div>

      <CodeBlock
        v-if="code"
        v-show="activeTab === 'code'"
        class="flex-1 mx-4 rounded-box"
        lang="vue"
        :code="code"
        line-numbers
      />
    </div>
  </div>
</template>
