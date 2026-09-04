<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

interface DraggableItem {
  id: number;
  label: string;
  color: string;
}

const items = ref<DraggableItem[]>(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    label: `${ String.fromCharCode(65 + i % 26) } Item ${ i }`,
    color: `hsl(${ (i * 137.5) % 360 }, 70%, 60%)`,
  })),
);

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const draggedIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);
const virtualScrollbar = ref(true);

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
} = useExampleScroll();

let scrollInterval: ReturnType<typeof setInterval> | null = null;

function stopAutoScroll() {
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function startAutoScroll(direction: 'up' | 'down') {
  if (scrollInterval !== null) {
    return;
  }
  scrollInterval = setInterval(() => {
    if (!virtualScrollRef.value) {
      return;
    }
    const { scrollOffset } = virtualScrollRef.value.scrollDetails;
    const delta = direction === 'up' ? -10 : 10;
    virtualScrollRef.value.scrollToOffset(null, scrollOffset.y + delta, { behavior: 'auto' });
  }, 16);
}

/**
 * Handles the start of a drag operation.
 *
 * @param index - The index of the item being dragged.
 * @param event - The native drag event.
 */
function handleDragStart(index: number, event: DragEvent) {
  draggedIndex.value = index;

  if (event.dataTransfer) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const clientX = (event as unknown as TouchEvent).touches ? (event as unknown as TouchEvent).touches[ 0 ].clientX : event.clientX;
    const clientY = (event as unknown as TouchEvent).touches ? (event as unknown as TouchEvent).touches[ 0 ].clientY : event.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (event.dataTransfer.setDragImage) {
      event.dataTransfer.setDragImage(target, x, y);
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());
  }
}

/**
 * Handles an item being dragged over another item.
 *
 * @param index - The index of the item being dragged over.
 */
function handleDragOver(index: number, event: DragEvent) {
  dropTargetIndex.value = index;

  // Auto-scroll logic
  const container = (event.currentTarget as HTMLElement).closest('.virtual-scroll-container');
  if (container) {
    const rect = container.getBoundingClientRect();
    const threshold = 60;
    if (event.clientY < rect.top + threshold) {
      startAutoScroll('up');
    } else if (event.clientY > rect.bottom - threshold) {
      startAutoScroll('down');
    } else {
      stopAutoScroll();
    }
  }
}

/**
 * Handles the drop event to reorder the list.
 */
function handleDrop() {
  stopAutoScroll();
  if (draggedIndex.value !== null && dropTargetIndex.value !== null) {
    const list = [ ...items.value ];
    const [ draggedItem ] = list.splice(draggedIndex.value, 1);
    list.splice(dropTargetIndex.value, 0, draggedItem);
    items.value = list;
  }
  draggedIndex.value = null;
  dropTargetIndex.value = null;
}

/**
 * Handles the drag end event to clean up.
 */
function handleDragEnd() {
  draggedIndex.value = null;
  dropTargetIndex.value = null;
  stopAutoScroll();
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-6">Draggable List</span>
    </template>

    <template #description>
      Reorder items using native drag and drop. Virtualization maintains performance even during complex list mutations.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
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
      </div>
    </template>

    <template #subtitle>
      Reorder virtualized items using native drag and drop
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      class="example-container"
      :items="items"
      :debug="debugMode"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="Reorderable list"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div
          role="button"
          tabindex="0"
          class="example-vertical-item py-2 outline-none bg-base-100 focus-visible:bg-base-300"
          :class="{
            'opacity-30': draggedIndex === index,
            'border-t-4 border-t-primary': dropTargetIndex === index && draggedIndex !== index,
          }"
          @dragstart="handleDragStart(index, $event)"
          @dragover.prevent="handleDragOver(index, $event)"
          @drop="handleDrop"
          @dragend="handleDragEnd"
          @keydown.enter.prevent
          @keydown.space.prevent
        >
          <div
            class="size-10 rounded-lg me-4 flex items-center justify-center text-white font-bold shadow-sm"
            :style="{ backgroundColor: item.color }"
          >
            {{ item.label[0] }}
          </div>
          <div>
            <div class="font-bold text-sm">{{ item.label }}</div>
            <div class="text-xs opacity-40 font-mono">ID: {{ item.id }}</div>
          </div>
          <div
            class="ms-auto p-2 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100 touch-pan-y select-none"
            draggable="true"
            :aria-label="`Drag handle for ${ item.label }`"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
        </div>
      </template>
    </VirtualScroll>
    <template #implementation>
      <ImplementationGuide>
        <p>
          Reordering a list whose rows are virtualized means only a handful of rows are ever in the DOM, so a drag can neither
          start from nor drop onto an element that is not currently mounted. The reliable approach is to keep the whole
          operation in <em>data</em>, not in the DOM: each mounted row reports its own <code>index</code> from the slot, that
          index is the drop target whenever the pointer is over the row, auto-scrolling mounts the rows in between, and the
          reorder itself is a single array splice performed on <code>drop</code>. Because rows recycle as you scroll, the two
          pieces of state that matter — which row is being dragged and which row is the current target — are plain refs that
          survive every unmount, and the virtualization engine re-ranges around the mutated array for you.
        </p>

        <h3>1. Make a row (or its handle) a drag source and record the origin</h3>
        <p>
          Native HTML5 drag and drop needs an element with the <code>draggable</code> attribute. Put it on the whole row, or —
          to avoid hijacking text selection and inner images — on a dedicated handle inside the row. Either way, attach the drag
          handlers to the mounted row: <code>dragstart</code>/<code>dragover</code>/<code>drop</code>/<code>dragend</code>
          bubble from the handle to the row's listeners. On <code>dragstart</code>, capture the slot <code>index</code> into a
          <code>draggedIndex</code> ref, set <code>effectAllowed = 'move'</code>, store the index on the
          <code>dataTransfer</code>, and optionally anchor the drag image at the cursor so the row does not visually jump.
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
import { ref } from 'vue';
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import '@pdanpdan/virtual-scroll/style.css';

const virtualScrollRef = ref&lt;InstanceType&lt;typeof VirtualScroll> | null>(null);
const list = ref(Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `Item ${i}` })));

// The drag is tracked in data (indices), never in the DOM: rows mount and
// unmount as you scroll, but these two refs survive every recycle.
const draggedIndex = ref&lt;number | null>(null);
const dropTargetIndex = ref&lt;number | null>(null);

function onDragStart(index: number, e: DragEvent) {
  draggedIndex.value = index;
  e.dataTransfer!.effectAllowed = 'move';
  e.dataTransfer!.setData('text/plain', String(index));
  const el = e.currentTarget as HTMLElement;
  if (e.dataTransfer!.setDragImage) {
    e.dataTransfer!.setDragImage(el, e.offsetX, e.offsetY); // cursor stays put
  }
}

function onDragOver(index: number, e: DragEvent) {
  e.preventDefault(); // required or the drop is rejected
  dropTargetIndex.value = index; // the row under the cursor becomes the target
  edgeAutoScroll(e);
}

function onDrop() {
  stopAutoScroll();
  if (draggedIndex.value !== null &amp;&amp; dropTargetIndex.value !== null) {
    const next = [ ...list.value ];
    const [ moved ] = next.splice(draggedIndex.value, 1);
    next.splice(dropTargetIndex.value, 0, moved);
    list.value = next; // fresh array identity -> reactive re-range by engine
  }
  draggedIndex.value = dropTargetIndex.value = null;
}

function onDragEnd() {
  stopAutoScroll();
  draggedIndex.value = dropTargetIndex.value = null;
}
&lt;/script>"
        />

        <h3>2. Make the drop target an index, not a DOM element</h3>
        <p>
          An unmounted row can never receive <code>dragover</code>, so the only rows you can drop onto are the ones currently in
          the window — and their identity can change under your cursor as the list scrolls. Because every mounted row already
          knows its position from the slot, the simplest correct target is that <code>index</code>: on <code>dragover.prevent</code>
          (the <code>.prevent</code> is required or the browser rejects the drop) set <code>dropTargetIndex</code> to the row's
          index. There is no offset arithmetic because the library hands each row its own index. An alternative when you want a
          whole-list drop zone is to compute the target from the pointer instead: the instance exposes
          <code>getRowIndexAt(offset)</code>/<code>scrollToOffset</code> helpers — useful with pointer events, but unnecessary
          when each row can report its index directly.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;template>
  &lt;VirtualScroll
    virtual-scrollbar
    ref=&quot;virtualScrollRef&quot;
    class=&quot;vs&quot;
    :items=&quot;list&quot;
    aria-label=&quot;Reorderable list&quot;
  >
    &lt;template #item=&quot;{ item, index }&quot;>
      &lt;div
        class=&quot;row&quot;
        :class=&quot;{
          'is-dragging': draggedIndex === index,
          'is-target': dropTargetIndex === index &amp;&amp; draggedIndex !== index,
        }&quot;
        @dragstart=&quot;onDragStart(index, $event)&quot;
        @dragover.prevent=&quot;onDragOver(index, $event)&quot;
        @drop=&quot;onDrop&quot;
        @dragend=&quot;onDragEnd&quot;
      >
        &amp;lt;!-- Only the handle is draggable; the row's handlers fire via bubbling.
             Keep selectable text/images out of the drag surface. -->
        &lt;span class=&quot;handle&quot; draggable=&quot;true&quot; aria-hidden=&quot;true&quot;>⠿&lt;/span>
        &lt;strong>{{ item.label }}&lt;/strong>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>"
        />

        <h3>3. Auto-scroll to reach targets outside the window</h3>
        <p>
          Dragging to a row far below (or above) the viewport cannot work by waiting for the pointer to cross it — the target is
          not mounted. Drive the scroll yourself while the pointer sits in an edge zone of the container: repeatedly call the
          instance's programmatic scroll (reading the current offset from <code>scrollDetails.scrollOffset</code> and nudging it
          with <code>scrollToOffset</code>), which mounts the intermediate rows under the cursor until the desired index appears.
          Virtualization means you never manipulate a wrapper's <code>scrollTop</code> — always go through the exposed scroll
          methods so the engine keeps its internal state consistent.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// Auto-scroll while the pointer rests in the top/bottom edge zone. Unmounted
// rows can't be drop targets, so we scroll (which mounts more rows) until the
// wanted index comes under the cursor. `virtualScrollRef` is the component ref.
let raf = 0;

function edgeAutoScroll(e: DragEvent) {
  const host = (e.currentTarget as HTMLElement).closest('.virtual-scroll-container');
  const rect = host?.getBoundingClientRect();
  if (!rect) return;
  const zone = 60;
  const delta = e.clientY &lt; rect.top + zone ? -12 : e.clientY > rect.bottom - zone ? 12 : 0;
  cancelAnimationFrame(raf);
  if (delta === 0) return;
  raf = requestAnimationFrame(() => {
    const vs = virtualScrollRef.value;
    if (!vs) return;
    const y = vs.scrollDetails.scrollOffset.y; // current virtual offset
    vs.scrollToOffset(null, y + delta, { behavior: 'auto' }); // nudge the axis
  });
}

function stopAutoScroll() {
  cancelAnimationFrame(raf);
  raf = 0;
}"
        />

        <h3>4. Commit one splice on drop, then clean up</h3>
        <p>
          Reorder only on <code>drop</code>, never live while hovering: if you mutated the array on every <code>dragover</code>,
          the indices you are comparing would drift mid-drag. On drop, remove the item at <code>draggedIndex</code> and insert it
          at <code>dropTargetIndex</code>, assigning a fresh array so the change is reactive; the engine re-ranges around the
          current scroll and re-measures, so the visual position is preserved. Because a <code>drop</code> can be cancelled (Esc,
          leaving the window), also reset both refs and stop any auto-scroll in <code>dragend</code>. Add lightweight feedback
          from the same state: dim the carried row (<code>draggedIndex</code>) and show an insertion marker on the target row
          (<code>dropTargetIndex</code>). If your rows are all the same height, sizing them arithmetically with a numeric
          <code>item-size</code> makes offsets deterministic and the offset-based drop-zone alternative exact — but drag reorder
          itself is agnostic to measured vs. fixed rows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="css"
          code=".row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid rgb(0 0 0 / 0.08);
}
.handle {
  cursor: grab;
  touch-action: pan-y;
  user-select: none;
}
.row.is-dragging {
  opacity: 0.3;
} /* the row being carried */
.row.is-target {
  border-top: 3px solid oklch(55% 0.2 260);
} /* drop marker */"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
