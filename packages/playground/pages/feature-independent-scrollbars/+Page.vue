<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { EMPTY_SCROLL_DETAILS, VirtualScrollbar } from '@pdanpdan/virtual-scroll';
import { inject, onMounted, onUnmounted, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import { html as highlightedCode } from './+Page.vue?highlight';

const containerRef = ref<HTMLElement | null>(null);
const scrollX = ref(0);
const scrollY = ref(0);
const totalWidth = ref(2000);
const totalHeight = ref(2000);
const viewportWidth = ref(0);
const viewportHeight = ref(0);

const mockScrollDetails = ref<ScrollDetails>({
  ...EMPTY_SCROLL_DETAILS,
  totalSize: { width: 2000, height: 2000 },
});

const rtlMode = inject<Ref<boolean>>('rtlMode', ref(false));

function onScroll(e: Event) {
  const target = e.target as HTMLElement;
  scrollX.value = target.scrollLeft;
  scrollY.value = target.scrollTop;

  mockScrollDetails.value.scrollOffset.x = scrollX.value;
  mockScrollDetails.value.scrollOffset.y = scrollY.value;
}

function scrollToX(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollLeft = offset;
  }
}

function scrollToY(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollTop = offset;
  }
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      viewportWidth.value = entry.contentRect.width;
      viewportHeight.value = entry.contentRect.height;

      mockScrollDetails.value.viewportSize.width = viewportWidth.value;
      mockScrollDetails.value.viewportSize.height = viewportHeight.value;
    }
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
    viewportWidth.value = containerRef.value.clientWidth;
    viewportHeight.value = containerRef.value.clientHeight;

    mockScrollDetails.value.viewportSize.width = viewportWidth.value;
    mockScrollDetails.value.viewportSize.height = viewportHeight.value;
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-6">Independent Scrollbars</span>
    </template>

    <template #description>
      This example shows how to use <code>VirtualScrollbar</code> components independently from <code>VirtualScroll</code>.
      They control a standard <code>div</code> with <code>overflow: auto</code> and hidden scrollbars, providing a custom scroll interface.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-6"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v16.5m16.5-16.5v16.5m-16.5-16.5h16.5m-16.5 16.5h16.5" />
      </svg>
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="mockScrollDetails" direction="both" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Content Width</span>
          <input
            v-model.number="totalWidth"
            type="range"
            min="500"
            max="15000"
            step="100"
            class="range range-xs range-primary w-48"
            aria-label="Content Width"
            @input="mockScrollDetails.totalSize.width = totalWidth"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Content Height</span>
          <input
            v-model.number="totalHeight"
            type="range"
            min="500"
            max="15000"
            step="100"
            class="range range-xs range-secondary w-48"
            aria-label="Content Height"
            @input="mockScrollDetails.totalSize.height = totalHeight"
          />
        </div>
      </div>
    </template>

    <div
      class="example-container flex flex-col overflow-auto"
      style="--vs-scrollbar-has-cross-gap: 1; --vs-scrollbar-cross-gap: 8px"
    >
      <!-- The standard scrollable area (hide scrollbars to use custom scrollbars) -->
      <div ref="containerRef" class="flex-1 overflow-auto scrollbar-hide" @scroll="onScroll">
        <div
          class="relative bg-grid-slate-100/[0.03]"
          :style="{
            width: `${ totalWidth }px`,
            height: `${ totalHeight }px`,
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            color: 'color-mix(in oklab, var(--color-primary) 60%, transparent)',
          }"
        >
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center">
              <div class="text-4xl font-black opacity-10 small-caps tracking-widest italic">Independent Content</div>
              <div class="text-sm opacity-20 mt-2">{{ totalWidth }} &times; {{ totalHeight }} pixels</div>
            </div>
          </div>

          <!-- Some content dots -->
          <div
            v-for="i in Math.ceil(Math.max(totalWidth, totalHeight) / 25)"
            :key="i"
            class="absolute size-6 rounded-full bg-accent text-accent-content flex items-center justify-center text-sm font-bold"
            :style="{
              insetInlineStart: `${ (i * 12345) % totalWidth }px`,
              top: `${ (i * 54321) % totalHeight }px`,
            }"
          >
            {{ i }}
          </div>
        </div>
      </div>

      <!-- Vertical Virtual Scrollbar -->
      <VirtualScrollbar
        axis="vertical"
        :total-size="totalHeight"
        :viewport-size="viewportHeight"
        :position="scrollY"
        :is-rtl="rtlMode"
        aria-label="Independent vertical scroll"
        @scroll-to-offset="scrollToY"
      />

      <!-- Horizontal Virtual Scrollbar -->
      <VirtualScrollbar
        axis="horizontal"
        :total-size="totalWidth"
        :viewport-size="viewportWidth"
        :position="scrollX"
        :is-rtl="rtlMode"
        aria-label="Independent horizontal scroll"
        @scroll-to-offset="scrollToX"
      />
    </div>
    <template #implementation>
      <ImplementationGuide>
        <p>
          <code>VirtualScrollbar</code> is exported on its own, so you can reuse the exact scrollbar UX on content that <code>VirtualScroll</code> does not drive - a plain <code>overflow: auto</code> element, a grid inside a fixed box, a pager around a canvas, anywhere a scrollbar would normally come from the browser. The component never reads your DOM. You hand it three numbers per axis - <code>total-size</code> (content), <code>viewport-size</code> (visible area), <code>position</code> (current scroll) - and it answers with one callback, <code>@scroll-to-offset</code>, whose target you apply to your own scroller. Thumb sizing, track-click jumps, and thumb dragging are all handled internally, so the visible scrollbar is fully interactive with almost no wiring. The tradeoff is that you own the state pipeline <code>VirtualScroll</code> would manage for you: a scroll listener to keep <code>position</code> fresh and a <code>ResizeObserver</code> to keep <code>viewport-size</code> accurate.
        </p>
        <h3>1. Start from a real scroller with its native bar hidden</h3>
        <p>
          Begin with a normal scrollable element - an <code>overflow: auto</code> box whose content is as large as you need on each axis. Because the custom bars are drawn over it, hide the native scrollbar (<code>scrollbar-width: none</code> plus the WebKit rules) so the two affordances do not both show. The library bars are absolutely positioned, so the element you overlay them on (or an ancestor) must establish a positioning context with <code>position: relative</code>. Content here is fully rendered and sized to its model width/height; this pattern is about the scrollbar, not about virtualization.
        </p>
        <h3>2. Keep the bar fed with live numbers</h3>
        <p>
          The bar computes its thumb purely from the three props, so keep each prop in sync with the DOM as the user scrolls and the box resizes:
        </p>
        <ul>
          <li><code>total-size</code> - the scrollable content size on that axis (the natural scroll range + the viewport).</li>
          <li><code>position</code> - the current scroll offset; read <code>scrollTop</code>/<code>scrollLeft</code> in the element's native <code>@scroll</code> event and store into a ref.</li>
          <li><code>viewport-size</code> - the visible size; the bar cannot infer it, so measure <code>clientWidth</code>/<code>clientHeight</code> on mount and again with a <code>ResizeObserver</code> when the box resizes.</li>
          <li><code>is-rtl</code> - set for a right-to-left layout (default <code>false</code>) so the horizontal thumb offset mirrors correctly; <code>aria-label</code> (and an optional <code>container-id</code>) wire up the accessibility attributes.</li>
        </ul>
        <p>
          Because <code>position</code> and <code>viewport-size</code> are ordinary reactive numbers, this also composes with non-DOM sources - e.g. a translated/scaled coordinate space or a model-driven offset - not just a native scroller.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScrollbar } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import { onMounted, onUnmounted, ref } from 'vue';

const scroller = ref&lt;HTMLElement | null>(null);
const contentWidth = ref(8000); // your content size on each axis
const contentHeight = ref(6000);
const scrollX = ref(0); // current native scroll position, fed to the bars
const scrollY = ref(0);
const viewportWidth = ref(0); // measured, because nothing virtualizes here
const viewportHeight = ref(0);

function onScroll(e: Event) {
  const el = e.target as HTMLElement;
  scrollX.value = el.scrollLeft;
  scrollY.value = el.scrollTop;
}

function measure() {
  const el = scroller.value;
  if (!el) {
    return;
  }
  viewportWidth.value = el.clientWidth;
  viewportHeight.value = el.clientHeight;
}

let ro: ResizeObserver | null = null;
onMounted(() => {
  measure();
  ro = new ResizeObserver(measure);
  if (scroller.value) {
    ro.observe(scroller.value);
  }
});
onUnmounted(() => {
  ro?.disconnect();
});

// The one thing a bar asks back: write the target offset to your element.
function scrollToX(v: number) {
  if (scroller.value) {
    scroller.value.scrollLeft = v;
  }
}
function scrollToY(v: number) {
  if (scroller.value) {
    scroller.value.scrollTop = v;
  }
}
&lt;/script>

&lt;template>
  &lt;div class=&quot;stage&quot;>
    &amp;lt;!-- A real, scrollable element whose native bar is hidden; the two
         VirtualScrollbar components below are the visible scrollbars. -->
    &lt;div ref=&quot;scroller&quot; class=&quot;viewport scrollbar-hide&quot; @scroll=&quot;onScroll&quot;>
      &lt;div
        class=&quot;content&quot;
        :style=&quot;{
          width: `${ contentWidth }px`,
          height: `${ contentHeight }px`,
        }&quot;
      />
    &lt;/div>

    &lt;VirtualScrollbar
      axis=&quot;vertical&quot;
      :total-size=&quot;contentHeight&quot;
      :viewport-size=&quot;viewportHeight&quot;
      :position=&quot;scrollY&quot;
      aria-label=&quot;Vertical scroll&quot;
      @scroll-to-offset=&quot;scrollToY&quot;
    />

    &lt;VirtualScrollbar
      axis=&quot;horizontal&quot;
      :total-size=&quot;contentWidth&quot;
      :viewport-size=&quot;viewportWidth&quot;
      :position=&quot;scrollX&quot;
      aria-label=&quot;Horizontal scroll&quot;
      @scroll-to-offset=&quot;scrollToX&quot;
    />
  &lt;/div>
&lt;/template>

&lt;style scoped>
.stage {
  position: relative; /* the absolutely positioned bars anchor to this box */
  width: 600px;
  height: 400px;
}
.viewport {
  width: 100%;
  height: 100%;
  overflow: auto;
}
/* Hide the native bar so it does not double with the custom ones. */
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
/* A light grid so scrolling is visible against an empty surface. */
.content {
  background-image:
    linear-gradient(#0001 1px, transparent 1px),
    linear-gradient(90deg, #0001 1px, transparent 1px);
  background-size: 40px 40px;
}
&lt;/style>"
        />
        <h3>3. Apply the offset the bar asks for</h3>
        <p>
          The entire contract in the other direction is <code>@scroll-to-offset</code>: when the user drags the thumb or clicks the track, the component resolves the pointer travel (or click position) against the totals you supplied and emits the resulting pixel target. All you do is write it back onto your scroller - <code>scrollTop = v</code> for a vertical bar, <code>scrollLeft = v</code> for horizontal. Setting the native property moves the content, which fires <code>@scroll</code>, which updates <code>position</code>, which moves the thumb - a closed loop that needs no math on your side. Mount one component per axis and give each its own <code>axis</code>, totals, viewport, and position.
        </p>
        <h3>4. Handle the corner when both axes are active</h3>
        <p>
          With a vertical bar on the right edge and a horizontal bar on the bottom edge of the same box, the two tracks meet at the corner. Leave a notch so they do not overlap: set <code>--vs-scrollbar-has-cross-gap: 1</code> and give <code>--vs-scrollbar-cross-gap</code> a pixel value on the container that holds the bars. Each track then shortens by that gap before the corner.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="css"
          code="/* Both bars overlay the same box, so where they meet (bottom-right corner)
   leave a notch: has-cross-gap = 1 shrinks each bar by cross-gap so they do
   not overlap. Set both on the container that holds the bars. */
.stage {
  --vs-scrollbar-has-cross-gap: 1;
  --vs-scrollbar-cross-gap: 8px;
}"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
