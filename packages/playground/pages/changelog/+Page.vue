<script setup lang="ts">
import { changelog } from './changelog-data';
</script>

<template>
  <div class="pb-10">
    <div class="card shadow-soft bg-base-300 mb-12">
      <div class="card-body p-4 md:p-8">
        <h1 class="text-primary mb-2">Changelog</h1>
        <p class="text-base md:text-xl opacity-60 font-medium">
          All notable changes to the project.
        </p>
      </div>
    </div>

    <div class="px-4">
      <ul class="timeline timeline-snap-icon max-md:timeline-compact timeline-vertical">
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
              index % 2 === 0 ? 'timeline-start md:text-end' : 'timeline-end',
            ]"
          >
            <div
              class="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2"
              :class="[
                index % 2 === 0 ? 'md:justify-end' : 'md:justify-start',
              ]"
            >
              <h2 class="text-2xl font-bold text-base-content">{{ version.version }}</h2>
              <time class="text-sm font-mono opacity-40 italic font-medium">{{ version.date }}</time>
            </div>

            <div
              class="space-y-6 max-w-3xl inline-block text-start"
              :class="[
                index % 2 === 0 ? 'md:text-end' : 'md:text-start',
              ]"
            >
              <!-- Features -->
              <div v-if="version.features?.length" class="space-y-3">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-primary/70">Features</h3>
                <ul class="space-y-2 text-base-content/80 text-sm md:text-base list-none p-0 m-0">
                  <li
                    v-for="feature in version.features"
                    :key="feature"
                    class="flex gap-2 items-start"
                    :class="[index % 2 === 0 ? 'md:flex-row-reverse' : 'flex-row']"
                  >
                    <span class="text-primary font-bold shrink-0 mt-0.5 select-none leading-tight">✓</span>
                    <span class="leading-relaxed">{{ feature }}</span>
                  </li>
                </ul>
              </div>

              <!-- Bug Fixes -->
              <div v-if="version.fixes?.length" class="space-y-3">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-error/70">Bug Fixes</h3>
                <ul class="space-y-2 text-base-content/80 text-sm md:text-base list-none p-0 m-0">
                  <li
                    v-for="fix in version.fixes"
                    :key="fix"
                    class="flex gap-2 items-start"
                    :class="[index % 2 === 0 ? 'md:flex-row-reverse' : 'flex-row']"
                  >
                    <span class="text-error font-bold shrink-0 mt-0.5 select-none leading-tight">⨯</span>
                    <span class="leading-relaxed">{{ fix }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr v-if="index < changelog.length - 1" class="bg-primary/20" />
        </li>
      </ul>
    </div>
  </div>
</template>
