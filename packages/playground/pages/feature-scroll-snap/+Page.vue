<script setup lang="ts">
import type { SnapMode } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const itemCount = ref(100);
const itemSize = ref(300); // Large items to make snapping obvious
const snap = ref<SnapMode>('next');
const virtualScrollbar = ref(true);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  label: `Page ${ i + 1 }`,
  color: `hsl(${ (i * 45) % 360 }, 70%, 80%)`,
})));

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
  handleScrollToIndex,
  handleScrollToOffset,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const isItemTooLarge = computed(() => {
  if (!scrollDetails.value) {
    return false;
  }
  return itemSize.value > scrollDetails.value.viewportSize.height;
});
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-7">Scroll Snapping</span>
    </template>

    <template #description>
      Demonstrates the built-in <strong>snap</strong> feature. When scrolling stops, the view automatically smooth-scrolls to align with the nearest item. Useful for carousels, page-by-page navigation, or pickers.
      <br />
      <strong>Note:</strong> Snapping is disabled if the item is larger than the viewport.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
      </svg>
    </template>

    <template #subtitle>
      Auto-alignment after scroll
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:virtual-scrollbar="virtualScrollbar"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
      />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Snap Mode</span>
          <select v-model="snap" class="select select-bordered select-sm w-32" aria-label="Snap mode">
            <option :value="false">None</option>
            <option value="auto">Auto (true)</option>
            <option value="next">Next</option>
            <option value="start">Start</option>
            <option value="center">Center</option>
            <option value="end">End</option>
          </select>
        </label>

        <div v-if="isItemTooLarge && snap !== false" class="badge badge-soft badge-warning gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-4 h-4 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          Item larger than viewport: Snapping disabled
        </div>

        <div class="flex flex-col gap-1 ms-auto">
          <span class="flex justify-between items-center">
            <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Item Height</span>
            <span class="badge badge-sm badge-primary font-mono">{{ itemSize }}px</span>
          </span>
          <input
            v-model.number="itemSize"
            type="range"
            min="100"
            max="1500"
            step="10"
            class="range range-xs range-primary w-48"
            aria-label="Item size"
          />
        </div>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      :snap="snap"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Snapping list"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div
          class="example-vertical-item h-full flex flex-col items-center justify-center text-center p-8 transition-transform duration-500"
          :style="{
            backgroundColor: item.color,
            color: '#333',
          }"
        >
          <div class="text-6xl font-black opacity-20 mb-4">
            {{ index + 1 }}
          </div>
          <div class="text-2xl font-bold">
            {{ item.label }}
          </div>
          <div class="mt-4 opacity-60">
            Scroll, then release to snap
          </div>
        </div>
      </template>
    </VirtualScroll>
    <template #implementation>
      <ImplementationGuide>
        <p>
          Snapping makes a list settle on item boundaries instead of wherever the user happens to stop - the behaviour behind paged lists, carousels, and step pickers. With <code>VirtualScroll</code> it is a single prop: set <code>snap</code> to one of the <code>SnapMode</code> values and, once scrolling stops, the engine aligns the view to an item by issuing an animated (smooth) <code>scrollToIndex</code> toward a target it derives from each row's size and offset. Because the alignment runs only after the scroll ends, fast flings keep their natural momentum and then ease onto the nearest boundary rather than being interrupted mid-gesture. Two constraints shape how you use it: an item that is larger than the viewport disables snapping for that axis (to avoid jarring long jumps), and snapping is skipped for programmatic scrolls so your own navigation never fights it.
        </p>
        <h3>1. Enable snap on a list whose items are “pages”</h3>
        <p>
          Start from any uniform or dynamic list and give the rows a size that suits one logical step - often one row roughly fills the viewport so each snap lands on a single page or item. Bind <code>snap</code> to a <code>SnapMode</code>; you can pass a fixed value or a reactive ref if the mode should change at runtime (for example a settings control). The simplest useful configuration snaps each row to the viewport start, but which mode fits depends on the content, so start with <code>'next'</code> for paged stepping and read on for the other alignments.
        </p>
        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          Besides consistent cross-browser styling it is a performance improvement: the overlay bar is driven by the
          engine's own scroll math, so its rendering cost stays flat no matter how long the list grows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import type { SnapMode } from '@pdanpdan/virtual-scroll';
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import { ref } from 'vue';

// Pick one: false (off), true / 'auto', 'start', 'center', 'end', 'next'.
const snap = ref&lt;SnapMode>('next');
const pages = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  label: `Page ${ i + 1 }`,
  color: `hsl(${ (i * 47) % 360 } 70% 80%)`,
}));
&lt;/script>

&lt;template>
  &amp;lt;!-- Page-sized rows (300px) in a 480px viewport: each fling settles with one
       full page in view. buffer-* counts rows, so keep the overscan small. -->
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;pages&quot;
    :items=&quot;pages&quot;
    :item-size=&quot;300&quot;
    :snap=&quot;snap&quot;
    :buffer-before=&quot;1&quot;
    :buffer-after=&quot;1&quot;
    aria-label=&quot;Paged list&quot;
  >
    &lt;template #item=&quot;{ item, index }&quot;>
      &lt;div class=&quot;page&quot; :style=&quot;{ backgroundColor: item.color }&quot;>
        &lt;strong>Page {{ index + 1 }}&lt;/strong>
        &lt;span>{{ item.label }} - release to snap&lt;/span>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.pages {
  height: 480px;
}
.page {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #333;
}
&lt;/style>"
        />
        <h3>2. Choose the alignment that matches the content</h3>
        <p>
          The <code>SnapMode</code> union is <code>false | true | 'auto' | 'start' | 'center' | 'end' | 'next'</code>, and <code>true</code> is an alias for <code>'auto'</code>. They differ in which item they target and where they put it:
        </p>
        <ul>
          <li><code>'start'</code> - aligns the first visible item to the viewport's start, snapping to the next item when the current one is less than ~50% visible; suits top-anchored reading lists.</li>
          <li><code>'end'</code> - mirrors <code>'start'</code> at the viewport end (last visible item ≥ ~50% else the previous one); suits bottom-anchored feeds or chat.</li>
          <li><code>'center'</code> - brings the item that crosses the viewport center to the center; suits carousels and galleries where you want neighbours peeking at the edges.</li>
          <li><code>'next'</code> - snaps to the nearest snap position in the direction of travel, so repeated scrolls advance one item; a good default for paged stepping.</li>
          <li><code>'auto'</code> - direction-aware: behaves like <code>'end'</code> while scrolling back toward the start and like <code>'start'</code> while scrolling toward the end, so large free-scroll content still lands aligned.</li>
        </ul>
        <p>
          Because <code>snap</code> is just a prop, switching between these (or to <code>false</code>) at runtime reconfigures the behaviour with no other change.
        </p>
        <h3>3. Keep items smaller than the viewport</h3>
        <p>
          Snapping is meaningful only when the viewport can hold the item, so the engine silently declines to snap an axis while the target item is taller (or wider) than the viewport; it deliberately avoids dragging a viewport-sized jump. If your item size is not a hard constant - a responsive row, a user-controlled slider - mirror that rule in the UI: compare the item size against the measured viewport from the last <code>@scroll</code> event (the emitted <code>ScrollDetails</code> exposes <code>viewportSize</code>) and show a hint that snapping is inactive. This mirrors what the engine itself decides, so the UI never promises a snap the engine will not perform.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="import { computed, ref } from 'vue';
import type { ScrollDetails, SnapMode } from '@pdanpdan/virtual-scroll';

const itemSize = ref(300);
const snap = ref&lt;SnapMode>('next');
const details = ref&lt;ScrollDetails | null>(null);

// The engine quietly skips snapping while the target item is taller than the
// viewport. Mirror that rule in the UI (e.g. a warning badge) by comparing the
// item size with the viewport height from the last @scroll event.
const itemTooLarge = computed(
  () => details.value !== null &amp;&amp; itemSize.value > details.value.viewportSize.height,
);"
        />
        <h3>4. Know when it fires and how the motion feels</h3>
        <p>
          The snap extension listens for scroll <em>end</em>, not every pixel, and it ignores programmatic scrolling (the engine's own <code>scrollToIndex</code>/<code>scrollToOffset</code> and any calls from your code): only user-driven scrolls trigger a realignment. Wheel and touch motion is not throttled or snapped mid-flight - you scroll naturally, and once you release, the corrective movement is a smooth animation onto the resolved boundary, so the last few dozen pixels ease rather than jump. Set <code>snap</code> to <code>false</code> (the default) to restore free behaviour, or switch modes live to compare alignments.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
