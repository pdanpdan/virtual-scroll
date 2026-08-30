<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import type { ConfiguratorState } from '#/lib/configurator/state';

import FeatureToggle from '#/components/configurator/FeatureToggle.vue';
import FieldSet from '#/components/configurator/FieldSet.vue';
import LiveCode from '#/components/configurator/LiveCode.vue';
import {
  generateCodePenForState,
  generateCodePenTypeScript,
  generateSfc,
  generateStandaloneHtml,
} from '#/lib/configurator/generate';
import {
  alignOptions,
  defaultState,
  getDerived,
  roleOptions,
  snapOptions,
} from '#/lib/configurator/state';

const state = reactive<ConfiguratorState>(structuredClone(defaultState));

const derived = computed(() => getDerived(state));

// Options above modify options below: window scrolling only supports native scrollbars.
watch(() => state.containerMode, (mode) => {
  if (mode === 'window') {
    state.scrollbarStyle = 'auto';
  }
});

function reset() {
  Object.assign(state, structuredClone(defaultState));
}

// ---------------------------------------------------------------------------
// generated output
// ---------------------------------------------------------------------------

const activeTab = ref<'component' | 'composable' | 'codepen'>('component');

const componentCode = computed(() => generateSfc(state, 'component'));
const composableCode = computed(() => generateSfc(state, 'composable'));
const codepenHtml = computed(() => generateStandaloneHtml(state));

const activeCode = computed(() => {
  if (activeTab.value === 'composable') {
    return composableCode.value;
  }
  if (activeTab.value === 'codepen') {
    return codepenHtml.value;
  }
  return componentCode.value;
});

const activeLang = computed(() => (activeTab.value === 'codepen' ? 'html' : 'vue'));

const activeFileName = computed(() => (activeTab.value === 'codepen' ? 'virtual-scroll-demo.html' : 'virtual-scroll-demo.vue'));

/** Language used when pushing the pen to CodePen (CodePen 2.0 preprocessors). */
const penLanguage = ref<'js' | 'ts'>('ts');

const enabledFeatures = computed(() => {
  const count = [
    state.rtl,
    state.snap,
    state.stickyHeader,
    state.stickyFooter,
    state.stickySections,
    state.infiniteScroll,
    state.restoreOnPrepend,
    state.initialScroll,
    state.scrollPadding,
    state.ssrRange,
    state.scrollbarStyle !== 'auto',
  ].filter(Boolean).length;
  return count;
});

const copied = ref(false);

async function copyCode() {
  await navigator.clipboard.writeText(activeCode.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

function saveCode() {
  const blob = new Blob([ activeCode.value ], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = activeFileName.value;
  link.click();
  URL.revokeObjectURL(url);
}

function openInCodePen() {
  const payload = penLanguage.value === 'ts'
    ? generateCodePenTypeScript(state)
    : generateCodePenForState(state);
  const form = document.createElement('form');
  form.method = 'POST';
  // CodePen 2.0 prefill endpoint (falls back to the classic editor URL).
  form.action = 'https://codepen.io/cpe/pen/define';
  form.target = '_blank';

  const data = document.createElement('input');
  data.type = 'hidden';
  data.name = 'data';
  data.value = JSON.stringify({
    title: payload.title,
    description: 'Generated with the Virtual Scroll Configurator',
    html: payload.html,
    css: payload.css,
    js: payload.js,
    js_pre_processor: payload.jsPreProcessor,
    js_external: payload.jsExternal.join(';'),
    css_external: payload.cssExternal.join(';'),
  });

  form.appendChild(data);
  document.body.appendChild(form);
  form.submit();
  form.remove();
}
</script>

<template>
  <div class="app-header-card">
    <div class="app-header-body">
      <div>
        <h1 class="text-primary">Configurator / Code Generator</h1>
        <p class="text-base @4xl:text-xl opacity-60 font-medium mt-1">
          Select the features you need and generate complete typed Vue code - component, composables, or a CodePen.
        </p>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] gap-6 items-start -mb-49">
    <!-- ============================= Form ============================= -->
    <div class="space-y-4">
      <FieldSet title="Basics" description="The shape of the scrollable content.">
        <div class="flex flex-wrap gap-3">
          <label class="floating-label p-0 grow basis-36">
            <span class="text-xs font-bold small-caps text-base-content/50">Direction</span>
            <select
              v-model="state.direction"
              class="select select-bordered select-sm w-full"
            >
              <option value="vertical">Vertical</option>
              <option value="horizontal">Horizontal</option>
              <option value="both">Both (grid)</option>
            </select>
          </label>

          <label class="floating-label p-0 grow basis-28">
            <span class="text-xs font-bold small-caps text-base-content/50">Items</span>
            <input
              v-model.number="state.itemCount"
              type="number"
              min="1"
              max="10000000"
              placeholder=" "
              class="input input-bordered input-sm w-full font-mono"
            />
          </label>

          <label class="floating-label p-0 grow basis-36">
            <span class="text-xs font-bold small-caps text-base-content/50">ARIA role</span>
            <select v-model="state.ariaRole" class="select select-bordered select-sm w-full">
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">
                {{ role.label }} — {{ role.description }}
              </option>
            </select>
          </label>
        </div>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">ARIA label</span>
          <input
            v-model="state.ariaLabel"
            type="text"
            placeholder=" "
            class="input input-bordered input-sm w-full"
          />
        </label>

        <div class="flex flex-wrap gap-x-8 gap-y-2 items-center pt-1">
          <label class="flex gap-2 items-center cursor-pointer select-none">
            <input v-model="state.rtl" type="checkbox" class="checkbox checkbox-sm checkbox-primary" />
            <span class="text-xs font-semibold opacity-70">Right-to-left (RTL)</span>
          </label>

          <label class="flex gap-2 items-center cursor-pointer select-none">
            <input
              v-model="state.containerMode"
              type="radio"
              name="container-mode"
              value="element"
              class="radio radio-sm radio-primary"
            />
            <span class="text-xs font-semibold opacity-70">Own container</span>
          </label>

          <label class="flex gap-2 items-center cursor-pointer select-none">
            <input
              v-model="state.containerMode"
              type="radio"
              name="container-mode"
              value="window"
              class="radio radio-sm radio-primary"
            />
            <span class="text-xs font-semibold opacity-70">Window / body</span>
          </label>
        </div>
        <p v-if="state.containerMode === 'window'" class="text-[11px] opacity-60">
          The page itself scrolls. Virtual scrollbars and coordinate scaling are disabled for window containers (so the content is limited to the supported browser content max size).
        </p>
      </FieldSet>

      <FieldSet
        title="Data"
        description="What should the items contain?"
        :badge="state.dataSource === 'lorem' ? 'lorem-api.com' : 'local'"
      >
        <div class="flex flex-wrap gap-x-6 gap-y-2 items-center">
          <label class="flex gap-2 items-center cursor-pointer select-none">
            <input
              v-model="state.dataSource"
              type="radio"
              name="data-source"
              value="lorem"
              class="radio radio-sm radio-primary"
            />
            <span class="text-xs font-semibold opacity-70">Lorem API (fetched)</span>
          </label>

          <label class="flex gap-2 items-center cursor-pointer select-none">
            <input
              v-model="state.dataSource"
              type="radio"
              name="data-source"
              value="local"
              class="radio radio-sm radio-primary"
            />
            <span class="text-xs font-semibold opacity-70">Generated locally</span>
          </label>
        </div>

        <div v-if="state.dataSource === 'lorem'" class="flex flex-wrap gap-3 items-center">
          <label class="floating-label p-0 basis-40">
            <span class="text-xs font-bold small-caps text-base-content/50">Sentences / item</span>
            <input
              v-model.number="state.loremSentences"
              type="number"
              min="1"
              max="5"
              placeholder=" "
              class="input input-bordered input-sm w-full font-mono"
            />
          </label>
          <p class="text-[11px] opacity-60 basis-full xl:basis-56">
            Items are filled from <code class="font-mono">https://lorem-api.com/api/lorem</code> in a single request; sentences are reused when more than 500 paragraphs are needed.
          </p>
        </div>
      </FieldSet>

      <FieldSet title="Sizing" description="How item and column sizes are known.">
        <div class="flex flex-wrap gap-3 items-start">
          <label class="floating-label p-0 grow basis-32">
            <span class="text-xs font-bold small-caps text-base-content/50">Item size mode</span>
            <select
              v-model="state.itemSizeMode"
              class="select select-bordered select-sm w-full"
            >
              <option value="fixed">Fixed</option>
              <option value="pattern">Pattern (array)</option>
              <option value="function">Function</option>
              <option value="dynamic">Dynamic (measured)</option>
            </select>
          </label>

          <template v-if="state.itemSizeMode === 'fixed'">
            <label class="floating-label p-0 grow basis-24">
              <span class="text-xs font-bold small-caps text-base-content/50">Size (px)</span>
              <input
                v-model.number="state.itemSizeBase"
                type="number"
                min="8"
                placeholder=" "
                class="input input-bordered input-sm w-full font-mono"
              />
            </label>
          </template>

          <template v-else-if="state.itemSizeMode === 'pattern'">
            <label class="floating-label p-0 grow basis-24">
              <span class="text-xs font-bold small-caps text-base-content/50">Base (px)</span>
              <input
                v-model.number="state.itemSizeBase"
                type="number"
                min="8"
                placeholder=" "
                class="input input-bordered input-sm w-full font-mono"
              />
            </label>
            <label class="floating-label p-0 grow basis-24">
              <span class="text-xs font-bold small-caps text-base-content/50">Alternate (px)</span>
              <input
                v-model.number="state.itemSizeAlt"
                type="number"
                min="8"
                placeholder=" "
                class="input input-bordered input-sm w-full font-mono"
              />
            </label>
          </template>

          <template v-else-if="state.itemSizeMode === 'function'">
            <label class="floating-label p-0 grow basis-24">
              <span class="text-xs font-bold small-caps text-base-content/50">Min (px)</span>
              <input
                v-model.number="state.itemSizeMin"
                type="number"
                min="8"
                placeholder=" "
                class="input input-bordered input-sm w-full font-mono"
              />
            </label>
            <label class="floating-label p-0 grow basis-24">
              <span class="text-xs font-bold small-caps text-base-content/50">Max (px)</span>
              <input
                v-model.number="state.itemSizeMax"
                type="number"
                min="8"
                placeholder=" "
                class="input input-bordered input-sm w-full font-mono"
              />
            </label>
          </template>

          <template v-else>
            <label class="floating-label p-0 grow basis-24">
              <span class="text-xs font-bold small-caps text-base-content/50">Default (px)</span>
              <input
                v-model.number="state.defaultItemSize"
                type="number"
                min="8"
                placeholder=" "
                class="input input-bordered input-sm w-full font-mono"
              />
            </label>
          </template>

          <label class="floating-label p-0 grow basis-20">
            <span class="text-xs font-bold small-caps text-base-content/50">Gap (px)</span>
            <input
              v-model.number="state.gap"
              type="number"
              min="0"
              max="100"
              placeholder=" "
              class="input input-bordered input-sm w-full font-mono"
            />
          </label>

          <label class="floating-label p-0 grow basis-24">
            <span class="text-xs font-bold small-caps text-base-content/50">Buffer before</span>
            <input
              v-model.number="state.bufferBefore"
              type="number"
              min="0"
              max="100"
              placeholder=" "
              class="input input-bordered input-sm w-full font-mono"
            />
          </label>

          <label class="floating-label p-0 grow basis-24">
            <span class="text-xs font-bold small-caps text-base-content/50">Buffer after</span>
            <input
              v-model.number="state.bufferAfter"
              type="number"
              min="0"
              max="100"
              placeholder=" "
              class="input input-bordered input-sm w-full font-mono"
            />
          </label>
        </div>

        <template v-if="state.direction === 'both'">
          <div class="divider my-1 opacity-60 text-[10px] font-bold small-caps tracking-widest">
            Grid columns
          </div>

          <div class="flex flex-wrap gap-3 items-start">
            <label class="floating-label p-0 grow basis-24">
              <span class="text-xs font-bold small-caps text-base-content/50">Column count</span>
              <input
                v-model.number="state.columnCount"
                type="number"
                min="1"
                max="10000"
                placeholder=" "
                class="input input-bordered input-sm w-full font-mono"
              />
            </label>

            <label class="floating-label p-0 grow basis-32">
              <span class="text-xs font-bold small-caps text-base-content/50">Column width mode</span>
              <select v-model="state.columnWidthMode" class="select select-bordered select-sm w-full">
                <option value="fixed">Fixed</option>
                <option value="pattern">Pattern (array)</option>
                <option value="function">Function</option>
                <option value="dynamic">Dynamic (measured)</option>
              </select>
            </label>

            <template v-if="state.columnWidthMode === 'fixed'">
              <label class="floating-label p-0 grow basis-24">
                <span class="text-xs font-bold small-caps text-base-content/50">Width (px)</span>
                <input
                  v-model.number="state.columnWidthBase"
                  type="number"
                  min="8"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
            </template>

            <template v-else-if="state.columnWidthMode === 'pattern'">
              <label class="floating-label p-0 grow basis-24">
                <span class="text-xs font-bold small-caps text-base-content/50">Base (px)</span>
                <input
                  v-model.number="state.columnWidthBase"
                  type="number"
                  min="8"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
              <label class="floating-label p-0 grow basis-24">
                <span class="text-xs font-bold small-caps text-base-content/50">Alternate (px)</span>
                <input
                  v-model.number="state.columnWidthAlt"
                  type="number"
                  min="8"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
            </template>

            <template v-else-if="state.columnWidthMode === 'function'">
              <label class="floating-label p-0 grow basis-24">
                <span class="text-xs font-bold small-caps text-base-content/50">Min (px)</span>
                <input
                  v-model.number="state.columnWidthMin"
                  type="number"
                  min="8"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
              <label class="floating-label p-0 grow basis-24">
                <span class="text-xs font-bold small-caps text-base-content/50">Max (px)</span>
                <input
                  v-model.number="state.columnWidthMax"
                  type="number"
                  min="8"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
            </template>

            <template v-else>
              <label class="floating-label p-0 grow basis-24">
                <span class="text-xs font-bold small-caps text-base-content/50">Default (px)</span>
                <input
                  v-model.number="state.defaultColumnWidth"
                  type="number"
                  min="8"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
            </template>

            <label class="floating-label p-0 grow basis-20">
              <span class="text-xs font-bold small-caps text-base-content/50">Col gap (px)</span>
              <input
                v-model.number="state.columnGap"
                type="number"
                min="0"
                max="100"
                placeholder=" "
                class="input input-bordered input-sm w-full font-mono"
              />
            </label>
          </div>
        </template>
      </FieldSet>

      <FieldSet
        title="Features"
        :description="derived.isIndependent
          ? 'Independent scrollbars replace the VirtualScroll component, so virtualization features do not apply.'
          : 'Each feature generates its own code; details appear when the feature is used.'"
        :badge="`${ enabledFeatures } used`"
      >
        <div class="space-y-3">
          <div v-if="state.containerMode !== 'window'" class="space-y-1">
            <span class="text-xs font-bold small-caps tracking-widest text-base-content/50">Scrollbars</span>
            <div class="flex flex-wrap gap-3 items-center">
              <label class="flex gap-2 items-center cursor-pointer select-none">
                <input
                  v-model="state.scrollbarStyle"
                  type="radio"
                  name="scrollbar-style"
                  value="auto"
                  class="radio radio-sm radio-primary"
                />
                <span class="text-xs font-semibold opacity-70">Native</span>
              </label>
              <label class="flex gap-2 items-center cursor-pointer select-none">
                <input
                  v-model="state.scrollbarStyle"
                  type="radio"
                  name="scrollbar-style"
                  value="virtual"
                  class="radio radio-sm radio-primary"
                />
                <span class="text-xs font-semibold opacity-70">Virtual (forced)</span>
              </label>
              <label class="flex gap-2 items-center cursor-pointer select-none">
                <input
                  v-model="state.scrollbarStyle"
                  type="radio"
                  name="scrollbar-style"
                  value="custom"
                  class="radio radio-sm radio-primary"
                />
                <span class="text-xs font-semibold opacity-70">Custom slot</span>
              </label>
              <label class="flex gap-2 items-center cursor-pointer select-none">
                <input
                  v-model="state.scrollbarStyle"
                  type="radio"
                  name="scrollbar-style"
                  value="independent"
                  class="radio radio-sm radio-primary"
                />
                <span class="text-xs font-semibold opacity-70">Independent pair</span>
              </label>
            </div>
          </div>

          <div v-if="derived.isIndependent" role="alert" class="alert alert-info alert-soft py-2 text-xs">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-4 shrink-0"
            ><path stroke-linecap="round" stroke-linejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
            <span>
              Generates two standalone <code>VirtualScrollbar</code> components over a native scroll container.
              Uses items × columns from the Basics/Sizing sections.
            </span>
          </div>

          <div v-if="state.containerMode !== 'window' && !derived.isIndependent" class="divider my-1 opacity-60" />

          <template v-if="!derived.isIndependent">
            <FeatureToggle
              v-model="state.snap"
              label="Scroll snapping"
              description="Automatically align to items after scrolling stops."
            />
            <div v-if="state.snap" class="ps-7">
              <label class="floating-label p-0">
                <span class="text-xs font-bold small-caps text-base-content/50">Snap mode</span>
                <select v-model="state.snapMode" class="select select-bordered select-sm w-full">
                  <option v-for="option in snapOptions" :key="option.value" :value="option.value">
                    {{ option.label }} — {{ option.description }}
                  </option>
                </select>
              </label>
            </div>

            <FeatureToggle
              v-model="state.stickyHeader"
              label="Sticky header"
              description="A header slot pinned to the top of the viewport."
            />

            <FeatureToggle
              v-model="state.stickyFooter"
              label="Sticky footer"
              description="A footer slot pinned to the bottom of the viewport."
            />

            <FeatureToggle
              v-model="state.stickySections"
              label="Sticky sections"
              description="iOS-style section headers using stickyIndices."
            />
            <div v-if="state.stickySections" class="ps-7">
              <label class="floating-label p-0">
                <span class="text-xs font-bold small-caps text-base-content/50">Items per section</span>
                <input
                  v-model.number="state.itemsPerSection"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
            </div>

            <FeatureToggle
              v-model="state.infiniteScroll"
              label="Infinite loading"
              description="Fetch more items when the end is near (load event + loading slot)."
            />
            <div v-if="state.infiniteScroll" class="ps-7 flex flex-wrap gap-3">
              <label class="floating-label p-0 grow basis-28">
                <span class="text-xs font-bold small-caps text-base-content/50">Load distance (px)</span>
                <input
                  v-model.number="state.loadDistance"
                  type="number"
                  min="0"
                  max="10000"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
              <label class="floating-label p-0 grow basis-28">
                <span class="text-xs font-bold small-caps text-base-content/50">Chunk size</span>
                <input
                  v-model.number="state.loadChunk"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
            </div>

            <FeatureToggle
              v-model="state.restoreOnPrepend"
              label="Prepend restoration"
              description="Keep scroll position when items are inserted at the top."
            />

            <FeatureToggle
              v-model="state.initialScroll"
              label="Initial scroll position"
              description="Jump to an item on mount."
            />
            <div v-if="state.initialScroll" class="ps-7 flex flex-wrap gap-3">
              <label class="floating-label p-0 grow basis-28">
                <span class="text-xs font-bold small-caps text-base-content/50">Index</span>
                <input
                  v-model.number="state.initialScrollIndex"
                  type="number"
                  min="0"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
              <label class="floating-label p-0 grow basis-28">
                <span class="text-xs font-bold small-caps text-base-content/50">Alignment</span>
                <select v-model="state.initialScrollAlign" class="select select-bordered select-sm w-full">
                  <option v-for="option in alignOptions" :key="option.value" :value="option.value">
                    {{ option.label }} — {{ option.description }}
                  </option>
                </select>
              </label>
            </div>

            <FeatureToggle
              v-model="state.scrollPadding"
              label="Scroll padding"
              description="Reserve space at the start/end of the scrollable area."
            />
            <div v-if="state.scrollPadding" class="ps-7 flex flex-wrap gap-3">
              <label class="floating-label p-0 grow basis-28">
                <span class="text-xs font-bold small-caps text-base-content/50">Start (px)</span>
                <input
                  v-model.number="state.scrollPaddingStart"
                  type="number"
                  min="0"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
              <label class="floating-label p-0 grow basis-28">
                <span class="text-xs font-bold small-caps text-base-content/50">End (px)</span>
                <input
                  v-model.number="state.scrollPaddingEnd"
                  type="number"
                  min="0"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
            </div>

            <FeatureToggle
              v-model="state.ssrRange"
              label="SSR pre-render range"
              description="Emit an ssrRange so the server renders the first rows."
            />
            <div v-if="state.ssrRange" class="ps-7 flex flex-wrap gap-3">
              <label class="floating-label p-0 grow basis-28">
                <span class="text-xs font-bold small-caps text-base-content/50">Start row</span>
                <input
                  v-model.number="state.ssrStart"
                  type="number"
                  min="0"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
              <label class="floating-label p-0 grow basis-28">
                <span class="text-xs font-bold small-caps text-base-content/50">End row</span>
                <input
                  v-model.number="state.ssrEnd"
                  type="number"
                  min="0"
                  placeholder=" "
                  class="input input-bordered input-sm w-full font-mono"
                />
              </label>
            </div>
          </template>
        </div>
      </FieldSet>

      <div class="flex justify-end">
        <button type="button" class="btn btn-ghost btn-sm" @click="reset">Reset form</button>
      </div>
    </div>

    <!-- ============================= Output ============================= -->
    <div class="xl:sticky xl:top-4 min-w-0">
      <div class="card bg-base-200/80 border border-base-content/10 shadow-sm">
        <div class="card-body p-4 gap-3 max-h-[95svh] xl:flex xl:flex-col xl:flex-nowrap xl:overflow-hidden">
          <div class="flex flex-wrap items-center gap-2">
            <div role="tablist" class="tabs tabs-box tabs-sm">
              <button
                v-for="tab in (['component', 'composable', 'codepen'] as const)"
                :key="tab"
                type="button"
                role="tab"
                class="tab"
                :class="{ 'tab-active': activeTab === tab }"
                @click="activeTab = tab"
              >
                {{ tab === 'component' ? 'Component' : tab === 'composable' ? 'Composable' : 'CodePen (HTML)' }}
              </button>
            </div>

            <div class="grow" />

            <button type="button" class="btn btn-sm btn-soft btn-primary" @click="copyCode">
              <svg
                v-if="!copied"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
              ><path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
              ><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              {{ copied ? 'Copied' : 'Copy' }}
            </button>

            <button type="button" class="btn btn-sm btn-soft btn-secondary" @click="saveCode">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
              ><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              Save {{ activeTab === 'codepen' ? '.html' : '.vue' }}
            </button>

            <button
              v-if="activeTab === 'codepen'"
              type="button"
              class="btn btn-sm btn-soft btn-info"
              @click="openInCodePen"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4"
              ><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
              Open in CodePen
            </button>
          </div>

          <div v-if="activeTab === 'codepen'" class="flex flex-wrap items-center gap-3">
            <label class="floating-label p-0 grow basis-52">
              <span class="text-xs font-bold small-caps text-base-content/50">Pen language</span>
              <select v-model="penLanguage" class="select select-bordered select-sm w-full">
                <option value="ts">TypeScript</option>
                <option value="js">Plain JavaScript</option>
              </select>
            </label>
            <p class="text-[11px] opacity-60 basis-full xl:basis-auto">
              <span v-if="penLanguage === 'ts'">
                Pushes the pen in TypeScript with the <code class="font-mono">typescript</code> preprocessor.
              </span>
              <span v-else>
                Pushes the pen as plain JavaScript (no preprocessor).
              </span>
              The displayed HTML file stays plain JavaScript and always works standalone.
            </p>
          </div>

          <p class="text-[11px] opacity-60 leading-relaxed">
            <span v-if="activeTab === 'component'">
              Single-file component using <code class="font-mono">VirtualScroll</code> — imports, typed data and configuration, template and styles included.
            </span>
            <span v-else-if="activeTab === 'composable'">
              Single-file component using <code class="font-mono">useVirtualScroll</code> with one extension per enabled feature and manual rendering.
            </span>
            <span v-else>
              Self-contained HTML page (UMD builds, no bundler). Open it as a file or push it to CodePen.
            </span>
          </p>

          <div class="rounded-box border border-base-content/10 bg-base-100 flex-1 flex flex-col flex-nowrap overflow-hidden">
            <LiveCode :source="activeCode" :lang="activeLang" class="flex-1" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
