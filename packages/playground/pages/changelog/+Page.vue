<script setup lang="ts">
import AppLogo from '#/components/AppLogo.vue';
import { changelog } from '#/pages/changelog/changelog-data';

type GroupKey = 'breaking' | 'features' | 'fixes' | 'performance';

const GROUPS: { key: GroupKey; label: string; glyph: string; headingClass: string; glyphClass: string; }[] = [
  { key: 'breaking', label: 'Breaking Changes', glyph: '!', headingClass: 'text-warning/70', glyphClass: 'text-warning' },
  { key: 'features', label: 'Features', glyph: '✓', headingClass: 'text-primary/70', glyphClass: 'text-primary' },
  { key: 'fixes', label: 'Bug Fixes', glyph: '⨯', headingClass: 'text-error/70', glyphClass: 'text-error' },
  { key: 'performance', label: 'Performance', glyph: '↗', headingClass: 'text-success/70', glyphClass: 'text-success' },
];
</script>

<template>
  <div class="app-header-card">
    <div class="app-header-body">
      <AppLogo class="shrink-0 size-24 hidden @4xl:block drop-shadow-lg" />
      <div>
        <h1 class="text-primary">Changelog</h1>
        <p class="text-base @4xl:text-xl opacity-60 font-medium mt-1">
          All notable changes to the project.
        </p>
      </div>
    </div>
  </div>

  <ul class="timeline timeline-snap-icon @max-4xl:timeline-compact timeline-vertical">
    <li v-for="(version, index) in changelog" :key="version.version">
      <hr v-if="index > 0" class="bg-primary/20" />
      <div class="timeline-middle">
        <div
          class="rounded-full p-px shadow-sm"
          :class="[
            index === 0
              ? 'bg-primary/80 text-primary-content'
              : 'bg-primary/40 text-primary-content',
          ]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="size-6"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>
      <div
        class="mb-10 w-full px-2"
        :class="[
          index % 2 === 0 ? 'timeline-start @4xl:text-end' : 'timeline-end',
        ]"
      >
        <div
          class="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2"
          :class="[
            index % 2 === 0 ? '@4xl:justify-end' : '@4xl:justify-start',
          ]"
        >
          <h2 class="text-2xl font-bold text-base-content">{{ version.version }}</h2>
          <time class="text-sm font-mono opacity-40 italic font-medium">{{ version.date }}</time>
        </div>

        <div
          class="space-y-6 max-w-3xl inline-block text-start"
          :class="[
            index % 2 === 0 ? '@4xl:text-end' : '@4xl:text-start',
          ]"
        >
          <template v-for="group in GROUPS" :key="group.key">
            <div v-if="version[group.key]?.length" class="space-y-3">
              <h3
                class="text-[10px] font-black uppercase tracking-widest"
                :class="group.headingClass"
              >
                {{ group.label }}
              </h3>
              <ul class="space-y-2 text-base-content/80 text-sm @4xl:text-base list-none p-0 m-0">
                <li
                  v-for="(item, itemIndex) in version[group.key]"
                  :key="itemIndex"
                  class="flex gap-2 items-start"
                  :class="[index % 2 === 0 ? '@4xl:flex-row-reverse' : 'flex-row']"
                >
                  <span
                    class="font-bold shrink-0 mt-0.5 select-none leading-tight"
                    :class="group.glyphClass"
                  >{{ group.glyph }}</span>
                  <span class="leading-relaxed" v-html="item" />
                </li>
              </ul>
            </div>
          </template>
        </div>
      </div>
      <hr v-if="index < changelog.length - 1" class="bg-primary/20" />
    </li>
  </ul>
</template>
