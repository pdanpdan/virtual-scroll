<script setup lang="ts">
import type { MasonryScrollDetails, VirtualScrollMasonryInstance } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScrollMasonry } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { createSeededRandom } from '#/lib/random';

import { html as highlightedCode } from './+Page.vue?highlight';

interface GalleryItem {
  id: number;
  /** Natural aspect ratio width/height — the canonical height oracle is width / aspect. */
  aspect: number;
  hue: number;
}

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

/** Remote deterministic images: same seed always yields the same picture. */
const PHOTO = 'https://picsum.photos/seed/vs-masonry-gallery-';

function makeItems(count: number): GalleryItem[] {
  const random = createSeededRandom(4321);
  return Array.from({ length: count }, (_, id) => ({
    id,
    aspect: 0.66 + random() * 0.95,
    hue: (id * 137.5) % 360,
  }));
}

const items = ref<GalleryItem[]>(makeItems(600));
const count = ref(600);
const targetWidth = ref(260);
const prefetchEnabled = ref(true);

function itemHeight(item: GalleryItem | undefined, _index: number, width: number): number {
  // Canonical oracle: reserve the exact aspect-ratio space of the picture.
  return Math.max(64, Math.round(width / (item?.aspect ?? 1)));
}

/** Image URL at a given pixel width; used for both the visible card and prefetch. */
function imageUrl(item: GalleryItem, width: number): string {
  return `${ PHOTO }${ item.id }/${ Math.round(width) }/${ Math.max(40, Math.round(width / item.aspect)) }`;
}

const masonryRef = ref<VirtualScrollMasonryInstance<GalleryItem> | null>(null);

const stats = ref({ columns: 0, columnWidth: 0, totalHeight: 0, exact: false });
const scrollDetails = ref<MasonryScrollDetails<GalleryItem> | null>(null);

// Per-card state lives model-side in plain sets; bumping a counter re-renders.
const loadedIds = ref<number[]>([]);
const failedIds = ref<number[]>([]);
const prefetchedIds = ref<number[]>([]);
const stateTick = ref(0);

function handleScroll(details: MasonryScrollDetails<GalleryItem>) {
  scrollDetails.value = details;
  const instance = masonryRef.value;
  if (instance) {
    stats.value = {
      columns: details.columnRange.end,
      columnWidth: instance.columnWidth,
      totalHeight: details.totalSize.height,
      exact: instance.totalHeightExact,
    };
  }
  schedulePrefetch();
}

function onImageLoad(item: GalleryItem) {
  if (!loadedIds.value.includes(item.id)) {
    loadedIds.value.push(item.id);
    stateTick.value++;
  }
}

function onImageError(item: GalleryItem) {
  if (!failedIds.value.includes(item.id)) {
    failedIds.value.push(item.id);
    stateTick.value++;
  }
}

// ---------------------------------- bounded low-priority prefetch ----------------------------------

const PREFETCH_BATCH = 6;
const PREFETCH_HORIZON = 12;
let prefetchTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Warms the images just beyond the rendered window at low priority, bounded
 * to a small batch per scroll settle — visible cards always load first.
 */
function schedulePrefetch() {
  if (!prefetchEnabled.value) {
    return;
  }
  clearTimeout(prefetchTimer);
  prefetchTimer = setTimeout(() => {
    const range = scrollDetails.value?.range;
    const width = stats.value.columnWidth || 260;
    if (!range || !(width > 0)) {
      return;
    }
    const known = new Set([ ...prefetchedIds.value, ...loadedIds.value, ...failedIds.value ]);
    let issued = 0;
    for (let i = range.end; i <= range.end + PREFETCH_HORIZON && issued < PREFETCH_BATCH; i++) {
      const candidate = items.value[ i ];
      if (!candidate || known.has(candidate.id)) {
        continue;
      }
      const image = new Image();
      image.decoding = 'async';
      image.onload = () => {
        if (!prefetchedIds.value.includes(candidate.id)) {
          prefetchedIds.value.push(candidate.id);
          stateTick.value++;
        }
      };
      image.src = imageUrl(candidate, width);
      known.add(candidate.id);
      issued++;
    }
  }, 120);
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-1">Masonry Gallery</span>
    </template>

    <template #description>
      The masonry engine at work on remote imagery: every card reserves its picture's exact
      <code>aspect-ratio</code> space through the canonical height oracle, the DOM window stays bounded while
      scrolling, and only a small low-priority batch beyond the window is prefetched per scroll settle — visible
      images always load first, and per-card state stays model-side.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </template>

    <template #subtitle>
      Aspect-ratio oracle heights with bounded image prefetch
    </template>

    <template #controls>
      <ScrollStatus
        :scroll-details="scrollDetails"
        dom-count-selector=".masonry-gallery-demo"
      />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Photos</span>
          <input
            v-model.number="count"
            type="range"
            min="100"
            max="5000"
            step="100"
            class="range range-primary range-xs"
          />
          <span class="settings-value font-mono font-bold text-primary">{{ count.toLocaleString() }}</span>
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Target column width</span>
          <input
            v-model.number="targetWidth"
            type="range"
            min="140"
            max="480"
            step="10"
            class="range range-primary range-xs"
          />
          <span class="settings-value font-mono font-bold text-primary">{{ targetWidth }}px</span>
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Prefetch next images</span>
          <input v-model="prefetchEnabled" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <div class="hidden xl:flex items-center gap-2 font-mono text-xs">
          <span class="badge badge-secondary">cols {{ stats.columns }}</span>
          <span class="badge badge-neutral badge-outline">{{ Math.round(stats.columnWidth) }}px</span>
          <span class="badge badge-neutral badge-outline">{{ Math.round(stats.totalHeight).toLocaleString() }}px</span>
          <span class="badge badge-info badge-outline">{{ stateTick ? `loaded ${ loadedIds.length }` : 'loading…' }}</span>
          <span v-if="prefetchEnabled" class="badge badge-success badge-outline">prefetched {{ prefetchedIds.length }}</span>
          <span v-if="failedIds.length" class="badge badge-warning badge-outline">{{ failedIds.length }} failed</span>
        </div>
      </div>
    </template>

    <div class="relative flex-1 min-h-0">
      <VirtualScrollMasonry
        ref="masonryRef"
        class="masonry-gallery-demo outline-0"
        :items="items"
        :item-height="itemHeight"
        :target-column-width="targetWidth"
        :min-columns="2"
        :max-columns="7"
        :gap="12"
        :debug="debugMode"
        :aria-label="`Masonry gallery with ${ items.length } photos`"
        @scroll="handleScroll"
      >
        <template #item="{ item, index, width }">
          <div
            v-if="item"
            class="relative size-full overflow-hidden rounded-box bg-base-200"
            :style="{
              backgroundColor: failedIds.includes(item.id)
                ? `hsl(${ item.hue }, 35%, 85%)`
                : undefined,
            }"
            role="img"
            :aria-label="`Photo ${ index }`"
          >
            <!-- Reserved aspect-ratio space is the card itself; the picture
                 covers it exactly once loaded. -->
            <img
              v-show="loadedIds.includes(item.id)"
              :src="imageUrl(item, width)"
              :width="Math.round(width)"
              :height="Math.round(width / item.aspect)"
              alt=""
              decoding="async"
              loading="eager"
              class="absolute inset-0 size-full object-cover"
              @load="onImageLoad(item)"
              @error="onImageError(item)"
            />
            <div class="absolute inset-0 flex items-end justify-between p-2 pointer-events-none">
              <span class="bg-base-300/70 px-1.5 py-0.5 rounded font-mono text-[10px] font-bold text-base-content/80">
                #{{ index }}
              </span>
              <span class="bg-base-300/70 px-1.5 py-0.5 rounded font-mono text-[10px] text-base-content/60">
                {{ item.aspect.toFixed(2) }}
              </span>
            </div>
          </div>
        </template>
      </VirtualScrollMasonry>
    </div>
  </ExampleContainer>
</template>
