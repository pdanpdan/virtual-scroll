<script setup lang="ts">
import type { MasonryScrollDetails, VirtualScrollMasonryInstance } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScrollMasonry } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { createSeededRandom } from '#/lib/random';

import { html as highlightedCode } from './+Page.vue?highlight';

interface GalleryItem {
  id: number;
  /** Natural aspect ratio width/height - the canonical height oracle is width / aspect. */
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
 * to a small batch per scroll settle - visible cards always load first.
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
      scrolling, and only a small low-priority batch beyond the window is prefetched per scroll settle - visible
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

    <template #implementation>
      <ImplementationGuide>
        <p>
          A masonry gallery streams a long feed of remote images through one scroll container. The masonry engine
          derives the column count from the container width, greedy-places each card on the shortest column, and
          mounts only the window around the scroll position - so the DOM stays bounded no matter how long the feed.
          The key decision for images is the <strong>canonical height oracle</strong>: every height is a pure function
          of the item and the resolved column width, which makes the layout exact without ever measuring the DOM. When
          the card is a picture whose aspect ratio is known, the oracle reserves precisely the space the image will
          occupy, so the load - which is deferred until the card is actually in the window - cannot shift the layout.
        </p>

        <h3>1. Choose the layout mode, then feed geometry props</h3>
        <p>
          <code>&lt;VirtualScrollMasonry&gt;</code> renders its own scrollable host (vertical axis only) and needs a
          definite height, exactly like <code>&lt;VirtualScroll&gt;</code>. The column layout is responsive by
          construction: the engine picks the largest column count whose <code>target-column-width</code> + gap cadence fits the container width - resolved columns come out at least the target width - clamped by <code>min-columns</code> / <code>max-columns</code>, with
          <code>gap</code> between cards. Two layout modes exist: the default canonical mode (heights from the oracle,
          nothing measured) for cards whose size is knowable ahead of time - images with an aspect ratio, fixed-size
          media - and <code>measured-heights</code> for cards that must size to their own content (wrapping text,
          user-generated posts), where mounted cards are measured with a <code>ResizeObserver</code> and the oracle
          height only serves as the pre-measure minimum.
        </p>

        <h3>2. Give heights through a deterministic oracle</h3>
        <p>
          In canonical mode the item slot must render at exactly the height the oracle returns. The oracle is a
          function <code>(item, index, columnWidth) → px</code>, and it <strong>must</strong> be deterministic: the same <code>(index, columnWidth)</code> always yields the same height, so far <code>scrollToIndex</code> jumps land exactly without ever mounting the path. A
          gallery maps onto this directly: store the asset's natural aspect ratio in the model and return
          <code>width / aspect</code>, the exact box the image needs. Fetch URLs that are deterministic
          (same seed + size → same picture) so a recycled card re-shows from the browser cache instead of flickering.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// The model stores only what layout needs to know. Each photo knows its
// natural aspect ratio (width / height); a deterministic id hash supplies the
// pseudo-random variety so the same seed always yields the same layout.
interface GalleryItem {
  id: number;
  aspect: number; // width / height, from the real asset
}

function makeItems(count: number): GalleryItem[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    aspect: 0.66 + ((((id * 2654435761) >>> 0) % 1000) / 1000) * 0.95,
  }));
}

const items = ref&lt;GalleryItem[]>(makeItems(600));

// Instance ref: bound via ref=&quot;masonryRef&quot;; exposes the resolved columnWidth
// (and scrollToIndex/scrollDetails) for the prefetch step below.
const masonryRef = ref&lt;VirtualScrollMasonryInstance&lt;GalleryItem> | null>(null);

// Canonical height oracle: a pure (item, columnWidth) -> height function.
// The engine resolves the column width, asks this oracle for every height,
// and lays out from the oracle - it never mounts the path to
// measure it. It MUST be deterministic: the same (index, width) always
// returns the same height, or placements would be inconsistent.
function itemHeight(item: GalleryItem | undefined, _index: number, width: number): number {
  // The picture fills its column, so its reserved height is width / aspect.
  // Exact reservation means loading the image never changes the layout.
  return Math.max(64, Math.round(width / (item?.aspect ?? 1)));
}

// Deterministic remote source: same seed and size always return the same
// picture, so a recycled row renders from the browser cache.
const imageUrl = (item: GalleryItem, width: number) =>
  `https://picsum.photos/seed/vs-${item.id}/${Math.round(width)}/${Math.round(width / item.aspect)}`;"
        />

        <h3>3. Render cards that reserve the image box</h3>
        <p>
          The engine sizes each card's box (column width × oracle height) before your slot runs, so the slot root must
          fill it one-to-one (<code>width/height: 100%</code>). Put the picture inside as an absolutely positioned,
          <code>object-fit: cover</code> image with explicit <code>width</code>/<code>height</code> attributes matching
          the oracle, and keep it hidden until its bytes arrive. Load state belongs model-side - recycled rows unmount
          and remount, so per-card flags stored in the DOM would be lost; push ids into reactive arrays from
          <code>@load</code>/<code>@error</code> and derive visibility from them. Never use native
          <code>loading="lazy"</code>: the window is already the only mounted content, and browser lazy-load heuristics
          fight the changing scroll container.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;template>
  &amp;lt;!-- The component derives the column count from its own width (columns land
       as close as possible to target-column-width, clamped by min/max),
       greedy-places each card on the shortest column, and mounts only the
       window around the scroll position. One scroll container, vertical only. -->
  &lt;VirtualScrollMasonry
    ref=&quot;masonryRef&quot;
    class=&quot;gallery&quot;
    :items=&quot;items&quot;
    :item-height=&quot;itemHeight&quot;
    :target-column-width=&quot;260&quot;
    :min-columns=&quot;2&quot;
    :max-columns=&quot;7&quot;
    :gap=&quot;12&quot;
    aria-label=&quot;Gallery&quot;
  >
    &lt;template #item=&quot;{ item, index, width }&quot;>
      &amp;lt;!-- The engine sized this box (column width x oracle height): the card
           fills it 1:1, so the reserved aspect space IS the layout. -->
      &lt;div class=&quot;card&quot;>
        &amp;lt;!-- v-show (not v-if) keeps the element mounted and hidden until the
             bytes arrive; the box never changes size, so there is no reflow.
             The explicit width/height attributes match the oracle exactly. -->
        &lt;img
          v-show=&quot;loadedIds.includes(item.id)&quot;
          :src=&quot;imageUrl(item, width)&quot;
          :width=&quot;Math.round(width)&quot;
          :height=&quot;Math.round(width / item.aspect)&quot;
          alt=&quot;&quot;
          decoding=&quot;async&quot;
          loading=&quot;eager&quot;
          @load=&quot;onImageLoad(item)&quot;
          @error=&quot;onImageError(item)&quot;
        />
        &lt;span class=&quot;badge&quot;>#{{ index }}&lt;/span>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScrollMasonry>
&lt;/template>
&nbsp;
&lt;style scoped>
.gallery {
  height: 480px;
} /* the scroll viewport needs a definite height */
.card {
  position: relative;
  width: 100%;
  height: 100%; /* fill the oracle-sized box exactly */
  overflow: hidden;
  border-radius: 8px;
  background: color-mix(in oklab, currentColor 15%, transparent);
}
.card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.badge {
  position: absolute;
  inset-block-end: 4px;
  inset-inline-end: 4px;
}
&lt;/style>"
        />

        <h3>4. Prefetch the next images after a scroll settle</h3>
        <p>
          Visible cards load eagerly at mount, so revealed cards are already filled. To make the <em>next</em>
          screen ready too, warm a small batch of images beyond the rendered window - but only after the scroll
          settles, and only up to a bounded count, or a fast fling fires dozens of request batches. The
          <code>@scroll</code> event hands you a <code>MasonryScrollDetails</code> payload whose <code>range</code>
          tells you the rendered window; the instance (<code>ref</code>) exposes the current <code>columnWidth</code>.
          Request the prefetch at that same width so the browser cache serves the future card. Prefetching is optional:
          without it, images load when their cards enter the window.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// Bounded, low-priority prefetch. Visible cards are already loading eagerly
// (they are the only mounted content), so this only warms the images beyond
// the rendered window - and only after the scroll settles, so a fast
// fling does not fire dozens of batches.
const PREFETCH_BATCH = 6; // max requests per settle
const PREFETCH_HORIZON = 12; // how far past the window to look
let prefetchTimer: ReturnType&lt;typeof setTimeout> | undefined;

function handleScroll(details: MasonryScrollDetails&lt;GalleryItem>) {
  scrollDetails.value = details; // re-scheduled on every emission
  schedulePrefetch();
}

function schedulePrefetch() {
  clearTimeout(prefetchTimer);
  prefetchTimer = setTimeout(() => {
    const range = scrollDetails.value?.range; // rendered window (start/end)
    const width = masonryRef.value?.columnWidth ?? 0; // current column width
    if (!range || !(width > 0)) {
      return;
    }
    const known = new Set([ ...prefetchedIds.value, ...loadedIds.value, ...failedIds.value ]);
    let issued = 0;
    for (let i = range.end; i &lt;= range.end + PREFETCH_HORIZON &amp;&amp; issued &lt; PREFETCH_BATCH; i++) {
      const candidate = items.value[i];
      if (!candidate || known.has(candidate.id)) {
        continue;
      }
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        if (!prefetchedIds.value.includes(candidate.id)) {
          prefetchedIds.value.push(candidate.id);
        }
      };
      img.src = imageUrl(candidate, width); // same width as the card will use
      known.add(candidate.id);
      issued++;
    }
  }, 120);
}"
        />
        <p>
          One scale caveat: the masonry component is vertical-only and does not apply coordinate scaling, so the total
          content height must stay below the browser's ~10M px scroll limit. For image galleries that is rarely a
          constraint - thousands of aspect-reserved cards fit in that budget - but beyond it, a scaled
          <code>VirtualScroll</code> layout is the tool.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
