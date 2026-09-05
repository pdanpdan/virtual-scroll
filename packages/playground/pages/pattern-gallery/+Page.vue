<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

interface Photo {
  id: number;
  thumb: string;
  author: string;
}

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const itemCount = ref(2000);
const columns = ref(5);
const virtualScrollbar = ref(true);

const photos = computed(() => Array.from(
  { length: Math.ceil(itemCount.value / columns.value) },
  (_, rowIdx) => Array.from({ length: columns.value }, (_, colIdx) => {
    const id = rowIdx * columns.value + colIdx;

    return {
      id,
      thumb: `https://loremflickr.com/400/400?lock=${ id + 1 }`,
      author: `Photographer ${ id }`,
    } as Photo;
  }),
));

const {
  scrollDetails,
  onScroll,
} = useExampleScroll();
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-7">Photo Gallery</span>
    </template>

    <template #description>
      A high-performance grid gallery displaying {{ itemCount.toLocaleString() }} photos. Placeholders show while images load as their rows enter the viewport.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-7"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </template>

    <template #subtitle>
      Virtualized image grid with loading placeholders
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Virtual Scrollbars</span>
          <input v-model="virtualScrollbar" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <div class="flex flex-col gap-1">
          <span class="flex justify-between items-center">
            <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Grid Columns</span>
            <span class="badge badge-sm badge-primary font-mono">{{ columns }}</span>
          </span>
          <input
            v-model.number="columns"
            type="range"
            min="1"
            max="8"
            step="1"
            class="range range-xs range-primary w-48"
            aria-label="Grid Columns"
          />
        </div>
      </div>
    </template>

    <VirtualScroll
      class="example-container p-4"
      :items="photos"
      :gap="16"
      :debug="debugMode"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Photo gallery"
      @scroll="onScroll"
    >
      <template #item="{ index: rowIndex, item: rowItems }">
        <div
          :key="`r_${ rowIndex }`"
          class="grid gap-4 w-full"
          :style="{ gridTemplateColumns: `repeat(${ columns }, 1fr)` }"
        >
          <div
            v-for="(photo, colIndex) in rowItems"
            :key="`r_${ rowIndex }_c_${ colIndex }`"
            class="rounded-box overflow-hidden relative outline-none border border-base-content/5 focus-visible:ring-2 focus-visible:ring-primary transition-transform active:scale-95 group aspect-square bg-base-200"
          >
            <img
              :src="photo.thumb"
              :alt="`Photo by ${ photo.author }`"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 @4xl:p-4">
              <span class="text-white text-xs @4xl:text-sm font-medium truncate">{{ photo.author }}</span>
            </div>
          </div>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          Virtualizing an image grid runs into one obstacle: a photo's rendered height is unknown until it loads and differs
          from image to image. The clean way around it is structural rather than measured - decide up front what the engine
          treats as an <em>item</em>, and give every item a geometry that does not depend on the network. In practice that means
          making one virtualization item a whole grid <em>row</em> of photos (so only a single vertical axis scrolls and a row
          mounts atomically), and forcing each cell to a fixed <code>aspect-ratio</code> box that an <code>object-fit: cover</code>
          image crops to fill. Row height then equals cell width and is identical for every row, so nothing shifts when an image
          lands. With that in place you choose the sizing model: rows can be measured automatically with
          <code>ResizeObserver</code>, or - when the container width is known - sized arithmetically with a numeric
          <code>item-size</code>.
        </p>

        <h3>1. Decide your virtualization unit: a row, not a photo</h3>
        <p>
          The scroll range counts <em>items</em>. If each photo were its own item, a wide grid would need two scroll axes and a
          row could end up half-mounted. The simpler, common approach is to group one row's photos into a single item and
          virtualize over <code>ceil(photoCount / columns)</code> row items; each mounted item paints all its cells with CSS
          grid. Choose this when your grid has a fixed column count and uniform rows. If you truly need images flowing across
          both axes independently, the library offers a bidirectional <code>direction=&quot;both&quot;</code> grid with
          <code>column-count</code>/<code>column-width</code>, or the dedicated <code>VirtualScrollMasonry</code> component for a
          real unequal-height masonry layout - reserve hand-rolled cell math for cases neither covers.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { computed } from 'vue';
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

const columns = 5;
const photoCount = 2000;

// One ITEM per grid ROW: virtualization ranges over rows, not photos, so the
// DOM stays tiny even though each mounted row paints `columns` &amp;lt;img> cells.
const rows = computed(() => {
  const rowCount = Math.ceil(photoCount / columns);
  return Array.from({ length: rowCount }, (_, r) =>
    Array.from({ length: columns }, (_, c) => ({
      id: r * columns + c,
      thumb: `https://picsum.photos/seed/${r * columns + c}/400`,
      author: `Photographer ${r * columns + c}`,
    })),
  );
});
&lt;/script>"
        />

        <h3>2. Give every cell a box that is independent of the network</h3>
        <p>
          The engine positions rows from their block size; if that size changed when an image arrived, the rows below would
          jump. So reserve a fixed, ratio-locked box per cell <em>before</em> the image loads: <code>aspect-ratio: 1</code> (any
          ratio works) with <code>overflow: hidden</code> and a neutral background that doubles as the loading placeholder, then
          fill it with <code>width/height: 100%</code> and <code>object-fit: cover</code> so any source aspect ratio is cropped to
          the box. Because every grid column is an equal <code>1fr</code>, all cells in a row share one width and every row is
          exactly as tall as a cell - the block size is uniform across the grid and no photo can shift its neighbours, whether it
          is loading, loaded, or scrolled back in from the browser's image cache. Inter-row spacing belongs to the library's
          <code>:gap</code> prop (part of its scroll math, default <code>0</code>); the column gap inside a row is ordinary CSS
          (<code>column-gap</code>) on the grid.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="css"
          line-numbers
          code=".gallery {
  height: 100%;
} /* needs a definite viewport in a flex/grid parent */
.grid-row {
  display: grid; /* columns are set inline: repeat(N, 1fr) */
  column-gap: 1rem; /* horizontal spacing is plain CSS */
}
.cell {
  aspect-ratio: 1; /* square box reserved per cell - no layout shift */
  border-radius: 0.5rem;
  overflow: hidden;
  background: #ececec; /* loading placeholder behind the image */
}
.cell img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover; /* crops any source ratio to fill the square */
}"
        />

        <h3>3. Size the rows: measured, or arithmetic</h3>
        <p>
          With every row the same height you have two valid sizing routes. Leave <code>item-size</code> unset (or set it to
          <code>0</code>/<code>null</code>) and each mounted row is measured with <code>ResizeObserver</code> - robust when the
          container is responsive or the column count can change at runtime, because a re-measured row re-flows only its local
          range. Alternatively, if the container width is known and stable, derive the row height yourself (cell width = grid
          width ÷ columns, which equals row height for <code>aspect-ratio: 1</code>) and pass it as a numeric
          <code>item-size</code> for <em>O(1)</em> arithmetic sizing - with the caveat that you must keep that number in sync
          (recompute on resize or column changes). The <code>#item</code> slot receives the row array; bind the grid's columns
          inline and iterate the row's photos into cells.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;template>
  &lt;VirtualScroll
    class=&quot;gallery&quot;
    :items=&quot;rows&quot;
    :gap=&quot;16&quot;
    aria-label=&quot;Photo gallery&quot;
  >
    &lt;template #item=&quot;{ item: row }&quot;>
      &lt;div class=&quot;grid-row&quot; :style=&quot;{ gridTemplateColumns: `repeat(${columns}, 1fr)` }&quot;>
        &lt;figure v-for=&quot;photo in row&quot; :key=&quot;photo.id&quot; class=&quot;cell&quot;>
          &lt;img :src=&quot;photo.thumb&quot; :alt=&quot;photo.author&quot; />
        &lt;/figure>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
