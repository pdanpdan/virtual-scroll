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

const rowCount = ref(1000000);
const columnCount = ref(1000);
const itemSize = ref(50);
const columnWidth = ref(150);
const gap = ref(0);
const columnGap = ref(0);
const scrollbarCrossGap = ref(8);
const virtualScrollbars = ref(true);
const useCustomSlot = ref(false);

const items = computed(() => Array.from({ length: rowCount.value }, (_, i) => ({
  id: i,
  text: `Row ${ i }`,
})));

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-5">Custom Scrollbar</span>
    </template>

    <template #description>
      Demonstrates the virtual scrollbar implementation in a grid layout. The scrollbars are rendered as children of the virtual scroll container and are fully customizable.
      Virtual scrollbars are automatically used for massive content, but can also be forced for smaller lists to maintain consistent cross-browser styling.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    </template>

    <template #controls>
      <ScrollStatus
        :scroll-details="scrollDetails"
        direction="both"
        :column-range="virtualScrollRef?.columnRange"
      />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Force Virtual Scrollbars</span>
          <input v-model="virtualScrollbars" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Show Custom Scrollbars</span>
          <input v-model="useCustomSlot" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Rows</span>
          <select v-model="rowCount" class="select select-bordered select-sm w-24" aria-label="Row count">
            <option :value="10">10</option>
            <option :value="100">100</option>
            <option :value="1000">1,000</option>
            <option :value="10000">10,000</option>
            <option :value="100000">100,000</option>
            <option :value="1000000">1,000,000</option>
          </select>
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Cols</span>
          <select v-model="columnCount" class="select select-bordered select-sm w-24" aria-label="Column count">
            <option :value="10">10</option>
            <option :value="100">100</option>
            <option :value="1000">1,000</option>
            <option :value="10000">10,000</option>
            <option :value="100000">100,000</option>
            <option :value="1000000">1,000,000</option>
          </select>
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Item H</span>
          <input
            v-model.number="itemSize"
            type="number"
            min="10"
            max="200"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Item W</span>
          <input
            v-model.number="columnWidth"
            type="number"
            min="50"
            max="500"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Row Gap</span>
          <input
            v-model.number="gap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Col Gap</span>
          <input
            v-model.number="columnGap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50" title="Scrollbar cross gap">SB Gap</span>
          <input
            v-model.number="scrollbarCrossGap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      direction="both"
      :column-count="columnCount"
      :column-width="columnWidth"
      :gap="gap"
      :column-gap="columnGap"
      :virtual-scrollbar="virtualScrollbars"
      aria-label="Grid with custom scrollbars"
      :style="{
        '--vs-scrollbar-has-cross-gap': 1,
        '--vs-scrollbar-cross-gap': `${ scrollbarCrossGap }px`,
      }"
      @scroll="onScroll"
    >
      <template #item="{ index, columnRange, getColumnWidth, columnGap: slotColumnGap, getCellAriaProps }">
        <div class="example-grid-row">
          <div
            v-for="colIndex in Array.from({ length: columnRange.end - columnRange.start }, (_, i) => columnRange.start + i)"
            :key="colIndex"
            class="example-grid-cell border-e border-b"
            :style="{
              width: `${ getColumnWidth(colIndex) }px`,
              marginInlineStart: colIndex > 0 ? `${ slotColumnGap }px` : 0,
            }"
            v-bind="getCellAriaProps(colIndex)"
          >
            <span class="example-badge">#{{ index }},{{ colIndex }}</span>
          </div>
        </div>
      </template>

      <template v-if="useCustomSlot" #scrollbar="{ trackProps, thumbProps, scrollbarProps: { axis } }">
        <div
          v-if="axis === 'vertical'"
          v-bind="trackProps"
          class="w-4 bg-primary/25 end-0 rounded-e-none rounded-s-xl overflow-clip"
        >
          <div
            v-bind="thumbProps"
            class="bg-primary/60 hover:bg-primary/90 transition-colors rounded-sm"
          />
        </div>
        <div
          v-else-if="axis === 'horizontal'"
          v-bind="trackProps"
          class="h-4 bg-secondary/25 bottom-0 rounded-b-none rounded-t-xl overflow-clip"
        >
          <div
            v-bind="thumbProps"
            class="bg-secondary/60 hover:bg-secondary/90 transition-colors rounded-sm"
          />
        </div>
      </template>
    </VirtualScroll>
    <template #implementation>
      <ImplementationGuide>
        <p>
          A virtualized region still needs a scrollbar, but the browser's native bar is not always ideal: its look is platform-dependent, and for content larger than a browser's ~10M&nbsp;px scroll limit the native bar stops tracking a scaled virtual space correctly. <code>VirtualScroll</code> solves both with a virtual scrollbar - an overlay bar rendered <em>inside</em> the scroll container that it positions and sizes itself. There are three integration levels, from least to most control: let the component draw its built-in themed bar (it appears automatically when coordinate scaling kicks in, or whenever you force it), restyle that bar purely with CSS variables, or replace its chrome with the <code>#scrollbar</code> slot and keep your own markup. Pick the level that matches how custom the look must be. The tradeoff is consistent across all of them: the bar overlays the content, so rows can pass underneath it, and the bar's geometry is always proportional to what is visible rather than native-scrollbar-accurate.
        </p>
        <h3>1. Size the host and enable the virtual bar</h3>
        <p>
          Start from any scrollable setup - a uniform-height vertical list, a horizontal strip, or a <code>direction="both"</code> grid. Virtualization needs a definite viewport, so give the host an explicit or flex-derived height (in a flex/grid parent add <code>min-height: 0</code> so it can shrink). Then set <code>virtual-scrollbar</code> (default <code>false</code>) to <code>true</code> to always draw the themed overlay bar. Forcing it is about consistency <em>and</em> performance: identical styling in every browser regardless of the OS default, plus a bar whose rendering and drag cost stay constant however long the list is, instead of a native bar that has to track a multi-million-pixel scroll area. You do not strictly have to set it for massive content - once any axis exceeds the browser limit the engine engages coordinate scaling and shows the bars automatically, because only a library-drawn bar can drive the scaled space - but forcing is what keeps a modest list visually identical to a huge one. One bar is drawn per active axis (<code>direction="both"</code> yields a vertical and a horizontal bar); the bars are suppressed when the scroll container is the <code>window</code>/<code>body</code>, which scroll natively.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

const rows = Array.from({ length: 50_000 }, (_, i) => `Row ${ i }`);
&lt;/script>

&lt;template>
  &amp;lt;!-- virtual-scrollbar forces the themed overlay bar. Even without the prop the
       bar appears automatically once an axis exceeds the browser ~10M px scroll
       limit, because coordinate scaling then needs a bar it fully controls. -->
  &lt;VirtualScroll
    class=&quot;list&quot;
    :items=&quot;rows&quot;
    virtual-scrollbar
    aria-label=&quot;List with a themed scrollbar&quot;
  >
    &lt;template #item=&quot;{ index }&quot;>
      &lt;div class=&quot;row&quot;>{{ index }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.list {
  height: 480px; /* a definite viewport is required for virtualization */
}
.row {
  height: 100%;
  box-sizing: border-box;
  line-height: 40px;
  padding-inline: 1rem;
}
&lt;/style>"
        />
        <h3>2. Restyle the built-in bar with CSS variables</h3>
        <p>
          The default bar is a single component whose color and metrics come from CSS custom properties, so most reskinning needs no markup at all. Set any of the <code>--vs-scrollbar-*</code> properties on the <code>VirtualScroll</code> host or any ancestor - the bar resolves them through <code>var()</code> with built-in light/dark fallbacks:
        </p>
        <ul>
          <li><code>--vs-scrollbar-size</code> - bar thickness (the vertical bar's width, the horizontal bar's height).</li>
          <li><code>--vs-scrollbar-radius</code> - corner radius of the track and thumb.</li>
          <li><code>--vs-scrollbar-bg</code> - track background.</li>
          <li><code>--vs-scrollbar-thumb-bg</code> - thumb fill.</li>
          <li><code>--vs-scrollbar-thumb-hover-bg</code> - thumb fill while hovered or dragged.</li>
          <li><code>--vs-scrollbar-has-cross-gap</code> (0/1) and <code>--vs-scrollbar-cross-gap</code> - a corner notch for when both axes are active, so the vertical and horizontal bars do not overlap where they meet; set <code>1</code> plus a gap size only in two-axis layouts.</li>
        </ul>
        <p>
          For a single-axis list you normally set only the first five; the cross-gap pair is meaningful only when two bars share a corner in a <code>direction="both"</code> grid. Note the scope of these variables: they theme the default bar; they also reach custom chrome built through the <code>#scrollbar</code> slot (next step), because the bound track/thumb classes resolve them as defaults - the slot's bindings carry geometry and interaction, not colors, so add your own classes where you want to override them.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="css"
          code="/* Set these on the VirtualScroll host (or any ancestor): the themed bar reads
   them through var(--vs-scrollbar-*) and falls back to light/dark defaults. */
.scroll-list {
  --vs-scrollbar-size: 10px; /* thickness: vertical bar width / horizontal height */
  --vs-scrollbar-radius: 5px; /* thumb and track corner radius */
  --vs-scrollbar-bg: #eceff1; /* track background */
  --vs-scrollbar-thumb-bg: #90a4ae; /* thumb fill */
  --vs-scrollbar-thumb-hover-bg: #607d8b; /* thumb while hovered or dragged */
}

/* Only when both axes are active (direction=&quot;both&quot;) and the two bars meet at
   a corner: has-cross-gap = 1 leaves a notch so they do not overlap, and
   cross-gap is that notch's thickness (defaults to --vs-scrollbar-size). */
.two-axis {
  --vs-scrollbar-has-cross-gap: 1;
  --vs-scrollbar-cross-gap: 8px;
}"
        />
        <h3>3. Replace the chrome with the <code>#scrollbar</code> slot</h3>
        <p>
          When the built-in bar's look is not enough - custom shapes, gradients, per-axis colors, animations - provide a <code>#scrollbar</code> slot. It is invoked <em>once per active axis</em>, and only while content actually overflows that axis (there is no call when <code>totalSize &lt;= viewportSize</code>), so you need not detect overflow yourself. Each invocation gives you the axis, the geometry as percentages (<code>positionPercent</code>, <code>viewportPercent</code>, <code>thumbSizePercent</code>, <code>thumbPositionPercent</code>), a reactive <code>isDragging</code>, and two binding bundles:
        </p>
        <ul>
          <li><code>trackProps</code> - <code>v-bind</code> onto the element that is the track.</li>
          <li><code>thumbProps</code> - <code>v-bind</code> onto the element that is the thumb.</li>
          <li><code>scrollbarProps</code> - the same state regrouped so you can forward it straight into <code>&lt;VirtualScrollbar v-bind="scrollbarProps" /&gt;</code> if you would rather use the component form.</li>
        </ul>
        <p>
          Two details are worth calling out. First, providing the slot does not itself turn the bars on: the slot is rendered only while virtual bars are active (<code>showVirtualScrollbars</code> - forced via the <code>virtual-scrollbar</code> prop, or automatic when content passes the browser limit), so pair it with <code>virtual-scrollbar</code> for ordinary content. Second, the slot replaces the default bar's markup, but the bound track/thumb classes still resolve the <code>--vs-scrollbar-*</code> variables as defaults - the bundles carry geometry, ARIA, and interaction but no separate theming API, so add your own colors/shape where you want to differ from those defaults. Binding them is what makes a custom chrome <em>functional</em>, not just decorative: style the slot elements however you like (utility classes or scoped CSS both work), and use <code>isDragging</code> to reflect the drag state in CSS or drive an <code>active</code> class.
        </p>
        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

const rows = Array.from({ length: 5000 }, (_, i) => `Row ${ i }`);
&lt;/script>
&nbsp;
&lt;template>
  &lt;VirtualScroll class=&quot;list&quot; :items=&quot;rows&quot; virtual-scrollbar>
    &amp;lt;!-- Called once per active axis, only while content overflows that axis.
         trackProps / thumbProps carry the geometry (thumb size + position as
         percentages), the ARIA attributes, and the interaction listeners: a
         click on the track jumps, pointer-down on the thumb drags. Binding
         them means your custom chrome is functional, not just decorative. -->
    &lt;template #scrollbar=&quot;{ axis, trackProps, thumbProps, isDragging }&quot;>
      &lt;div
        v-if=&quot;axis === 'vertical'&quot;
        v-bind=&quot;trackProps&quot;
        class=&quot;track&quot;
        :class=&quot;{ dragging: isDragging }&quot;
      >
        &lt;div v-bind=&quot;thumbProps&quot; class=&quot;thumb&quot; />
      &lt;/div>
    &lt;/template>

    &lt;template #item=&quot;{ index }&quot;>
      &lt;div class=&quot;row&quot;>{{ index }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>
&nbsp;
&lt;style scoped>
.list {
  height: 480px;
}
.row {
  height: 100%;
  box-sizing: border-box;
  line-height: 40px;
  padding-inline: 1rem;
}

.track {
  position: absolute;
  inset-block: 2px;
  inset-inline-end: 2px;
  width: 12px;
}
.thumb {
  position: absolute;
  width: 100%;
  border-radius: 6px;
  background: #6366f1;
}
.track.dragging .thumb {
  background: #4f46e5;
}
&lt;/style>"
        />
        <h3>4. Pick the level that fits: built-in, slot, or standalone</h3>
        <p>
          The three approaches cover a spectrum and you can even mix them across axes. Reach for the built-in bar plus CSS variables when the default shape is acceptable and you only need brand colors and thickness; use the <code>#scrollbar</code> slot when the visible chrome must differ while you still want the engine to own geometry, ARIA, and pointer interaction. A third option is available when the scrollbar should control content that <code>VirtualScroll</code> does not drive at all: the <code>VirtualScrollbar</code> component is exported and can be mounted over any scrollable element, fed <code>total-size</code>/<code>viewport-size</code>/<code>position</code> and writing back through <code>@scroll-to-offset</code> (see the Independent Scrollbars example). That pattern is the right fit when you want the scrollbar UX without virtualization.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
