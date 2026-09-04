<script setup lang="ts">
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

const sectionCount = ref(20);
const itemsPerSection = ref(10);
const itemSize = ref(50);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);
const virtualScrollbar = ref(true);

const items = computed(() => {
  const result = [];
  for (let s = 0; s < sectionCount.value; s++) {
    // Header item
    result.push({ type: 'header', label: `Section ${ String.fromCharCode(65 + s) }` });
    // Data items
    for (let i = 0; i < itemsPerSection.value; i++) {
      result.push({ type: 'item', label: `Item ${ s }-${ i }` });
    }
  }
  return result;
});

const stickyIndices = computed(() => {
  const indices = [];
  for (let i = 0; i < items.value.length; i += (itemsPerSection.value + 1)) {
    indices.push(i);
  }
  return indices;
});

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
  handleScrollToIndex,
  handleScrollToOffset,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-3">Sticky Sections</span>
    </template>

    <template #description>
      Demonstrates iOS-style sticky headers using the <strong>stickyIndices</strong> prop for {{ sectionCount }} sections with {{ itemsPerSection }} items each. When a new header scrolls up, it 'pushes' the previous sticky header out of the view.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
      </svg>
    </template>

    <template #subtitle>
      Section headers with pushing effect
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

      <ScrollControls
        v-model:section-count="sectionCount"
        v-model:items-per-section="itemsPerSection"
        v-model:item-size="itemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:sticky-header="stickyHeader"
        v-model:sticky-footer="stickyFooter"
        v-model:virtual-scrollbar="virtualScrollbar"
        direction="vertical"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-indices="stickyIndices"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Sticky sections list"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Sticky Header
        </div>
      </template>

      <template #item="{ item, isStickyActive }">
        <div
          v-if="item.type === 'header'"
          class="example-sticky-header example-sticky-header--start h-full transition-shadow"
          :class="{ 'shadow-md z-1': isStickyActive }"
        >
          {{ item.label }}
        </div>
        <div v-else class="example-vertical-item example-vertical-item--fixed">
          {{ item.label }}
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          Sticky Footer
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          To build an iOS-contacts-style list whose section headers stick to the top of the scroll container and are pushed out
          by the next section's header, you mark the header rows with the <code>stickyIndices</code> prop — an array of item
          indices that should remain sticky. Each marked row scrolls normally until its natural position would pass the
          container's leading edge, then sticks there while later rows scroll beneath it, and releases when the following sticky
          row arrives at that edge; that hand-off is what produces the "push". Because the marked rows are ordinary content, you
          render them through the <code>#item</code> slot and emphasize the pinned state with the <code>isStickyActive</code>
          flag that slot provides.
        </p>

        <h3>1. Flatten the sections into one array and derive header indices</h3>
        <p>
          Virtualization addresses a single flat index range, so collapse each section into a header row followed by its body
          rows. With <code>itemsPerSection</code> body rows per section, every section occupies <code>itemsPerSection + 1</code>
          rows, and section <code>s</code>'s header sits at flat index <code>s × (itemsPerSection + 1)</code>. Mark those header
          indices in <code>stickyIndices</code>. The natural data shape is a flat array of real objects carrying a type
          discriminator (<code>'header' | 'item'</code>) plus per-row payload, so the <code>#item</code> slot can render either
          row kind straight from <code>item</code>.
        </p>

        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          Besides consistent cross-browser styling it is a performance improvement: the overlay bar is driven by the
          engine's own scroll math, so its rendering cost stays flat no matter how long the list grows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';
import { computed, ref } from 'vue';

const sections = ref(20);
const itemsPerSection = ref(10); // body rows per section, after its header
const itemSize = ref(50);

// Each section occupies (itemsPerSection + 1) rows: one header row followed by
// its body rows. Flatten everything into one list, tagging each row's kind.
const items = computed(() => {
  const flat: { type: 'header' | 'item'; label: string }[] = [];
  for (let s = 0; s &lt; sections.value; s++) {
    flat.push({ type: 'header', label: `Section ${ String.fromCharCode(65 + s) }` });
    for (let i = 0; i &lt; itemsPerSection.value; i++) {
      flat.push({ type: 'item', label: `Item ${ s }-${ i }` });
    }
  }
  return flat;
});

// Section s's header lives at flat index s * (itemsPerSection + 1). Those are
// the indices to make sticky: for itemsPerSection = 10 they are 0, 11, 22, …
const stickyIndices = computed(() => {
  const idx: number[] = [];
  for (let i = 0; i &lt; items.value.length; i += itemsPerSection.value + 1) {
    idx.push(i);
  }
  return idx;
});
&lt;/script>"
        />

        <h3>2. Pass sticky-indices and render the marked rows distinctly</h3>
        <p>
          Bind <code>:sticky-indices="stickyIndices"</code> together with <code>:item-size</code>. A sticky row is a regular row
          in the list flow — a header is one full <code>item-size</code>-tall row — so keep the slot root filling that row
          height. In the <code>#item</code> slot branch on <code>item.type</code> to render a header versus a body row. The slot
          exposes <code>isSticky</code> (this index is configured sticky) and <code>isStickyActive</code> (the row is currently
          pinned at the edge); use the latter to raise and shade the pinned header. Give the header an opaque background and a
          higher stacking context: while it is pinned, the following section's rows scroll beneath it, and the next header slides
          over it to push it out.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;list&quot;
    :items=&quot;items&quot;
    :item-size=&quot;itemSize&quot;
    :sticky-indices=&quot;stickyIndices&quot;
  >
    &amp;lt;!-- isStickyActive is true only while the row is pinned at the edge. Give
         the section header an opaque background so the rows scrolling beneath
         it are covered; when the NEXT header reaches the line it slides over
         and pushes the previous one out (the &quot;iOS pushing&quot; effect). -->
    &lt;template #item=&quot;{ item, index, isStickyActive }&quot;>
      &lt;div
        v-if=&quot;item.type === 'header'&quot;
        class=&quot;section-header&quot;
        :class=&quot;{ active: isStickyActive }&quot;
      >
        {{ item.label }} &lt;span class=&quot;idx&quot;>#{{ index }}&lt;/span>
      &lt;/div>
      &lt;div v-else class=&quot;row&quot;>{{ item.label }}&lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.list {
  height: 480px; /* definite viewport: sticky rows pin within THIS container */
}
.row,
.section-header {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  height: 100%; /* fill the 50px item wrapper */
  padding-inline: 1rem;
  border-bottom: 1px solid rgb(0 0 0 / 0.1);
}
.section-header {
  justify-content: space-between;
  background: #fff;
  z-index: 1;
}
.section-header.active {
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.15);
}
.idx {
  color: #888;
  font-size: 0.8em;
}
&lt;/style>"
        />

        <h3>3. Mark every section's leading row — headers are ordinary content</h3>
        <p>
          <code>stickyIndices</code> accepts any indices, not only section headers: every marked row becomes sticky, and once at
          the edge it is only released when the next marked row arrives to push it. So give <em>every</em> section one marked
          leading row (its header) and leave the body rows unmarked — otherwise a header you forgot to mark scrolls away, or a
          marked row in the middle of a section sticks at the edge mid-section. Two practical points follow from marked rows being
          in-flow content:
        </p>
        <ul>
          <li>
            Render them at the declared <code>item-size</code> with <code>height: 100%</code> and
            <code>box-sizing: border-box</code>, so the pinned row matches the geometry the engine uses for the scroll range.
          </li>
          <li>
            Give the pinned row an opaque background and a raised stacking context so the content sliding beneath stays
            hidden; otherwise the rows you are scrolling "past" remain visible through the header.
          </li>
        </ul>
        <p>
          Uniform-height sections make the header indices a simple arithmetic stride, as above. If sections vary in height you can
          still use this feature: keep <code>item-size</code> as a function or switch to dynamic measurement, and mark each
          section's leading index the same way — only the index derivation changes, not the sticking behavior.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
