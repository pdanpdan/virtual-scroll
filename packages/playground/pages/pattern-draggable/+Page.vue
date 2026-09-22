<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, onUnmounted, ref, watch } from 'vue';

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

/** Distance from an edge of the list that starts auto-scrolling, in px. */
const AUTO_SCROLL_EDGE = 60;

let scrollInterval: ReturnType<typeof setInterval> | null = null;
/** Last pointer position of the drag - the rows under it move while the list auto-scrolls. */
let dragPointer: { x: number; y: number; } | null = null;
let dragContainer: HTMLElement | null = null;

function stopAutoScroll() {
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

/**
 * Resolves the row under a viewport point.
 *
 * Rows unmount as they leave the window and the content shifts under a stationary
 * pointer while auto-scrolling, so the pointer - not the last event target - is the
 * only reliable way to tell which row is being pointed at.
 *
 * @param clientX - Pointer x in viewport coordinates.
 * @param clientY - Pointer y in viewport coordinates.
 * @returns The row index under the pointer, or `null` when it is not over a row.
 */
function rowIndexAt(clientX: number, clientY: number): number | null {
  const row = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-row-index]');
  const raw = row?.dataset.rowIndex;
  return raw === undefined ? null : Number(raw);
}

/**
 * Marks the row under the pointer as the drop target and keeps the auto-scroll
 * band up to date.
 *
 * @param clientX - Pointer x in viewport coordinates.
 * @param clientY - Pointer y in viewport coordinates.
 */
function updateDragTarget(clientX: number, clientY: number) {
  dragPointer = { x: clientX, y: clientY };
  dropTargetIndex.value = rowIndexAt(clientX, clientY);

  if (!dragContainer) {
    return;
  }
  const rect = dragContainer.getBoundingClientRect();
  if (clientY < rect.top + AUTO_SCROLL_EDGE) {
    startAutoScroll('up');
  } else if (clientY > rect.bottom - AUTO_SCROLL_EDGE) {
    startAutoScroll('down');
  } else {
    stopAutoScroll();
  }
}

function startAutoScroll(direction: 'up' | 'down') {
  if (scrollInterval !== null) {
    return;
  }
  scrollInterval = setInterval(() => {
    const point = dragPointer;
    if (!point) {
      stopAutoScroll();
      return;
    }
    // The rows move under a still pointer, so the target is re-resolved every step.
    updateDragTarget(point.x, point.y);

    const list = virtualScrollRef.value;
    if (!list) {
      return;
    }
    const { scrollOffset } = list.scrollDetails;
    const delta = direction === 'up' ? -10 : 10;
    list.scrollToOffset(null, scrollOffset.y + delta, { behavior: 'auto' });
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
 */
function handleDragOver(event: DragEvent) {
  dragContainer = (event.currentTarget as HTMLElement).closest('.virtual-scroll-container');
  updateDragTarget(event.clientX, event.clientY);
}

/**
 * Handles the drop event to reorder the list.
 *
 * The row the marker sits on ends up one place lower in the array, because removing
 * the dragged row shifts every row after it - so the insertion index has to move with it.
 *
 * @param event - The native drop event.
 */
function handleDrop(event: DragEvent) {
  stopAutoScroll();
  const from = draggedIndex.value;
  const to = rowIndexAt(event.clientX, event.clientY) ?? dropTargetIndex.value;

  if (from !== null && to !== null && from !== to) {
    const list = [ ...items.value ];
    const [ draggedItem ] = list.splice(from, 1);
    list.splice(to > from ? to - 1 : to, 0, draggedItem);
    items.value = list;
  }

  draggedIndex.value = null;
  dropTargetIndex.value = null;
  dragPointer = null;
  dragContainer = null;
}

/**
 * Handles the drag end event to clean up.
 */
function handleDragEnd() {
  draggedIndex.value = null;
  dropTargetIndex.value = null;
  dragPointer = null;
  dragContainer = null;
  stopAutoScroll();
}

/**
 * Cancels a drag event the list does not use.
 *
 * A drag event nobody cancels is left to the browser to act on, and the payload carried
 * here is text: Safari - on iOS in particular - searches the web for the dropped text and
 * loads the results, so a release that misses the rows navigates away. The rows cancel
 * the events aimed at them; this covers the rest of the page.
 *
 * @param event - The `dragover` or `drop` event to cancel.
 */
function handleBrowserDrop(event: DragEvent) {
  event.preventDefault();
}

/** Cancels drops page-wide, but only while a row is actually being carried. */
function setBrowserDropGuard(active: boolean) {
  if (active) {
    window.addEventListener('dragover', handleBrowserDrop);
    window.addEventListener('drop', handleBrowserDrop);
    return;
  }
  window.removeEventListener('dragover', handleBrowserDrop);
  window.removeEventListener('drop', handleBrowserDrop);
}

watch(draggedIndex, (index) => setBrowserDropGuard(index !== null));

onUnmounted(() => setBrowserDropGuard(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-6">Draggable List</span>
    </template>

    <template #description>
      Reorder rows with native drag and drop. The list stays virtualized while the order changes underneath the drag.
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
          class="example-vertical-item relative py-2 outline-none bg-base-100 focus-visible:bg-base-300"
          :class="{ 'opacity-30': draggedIndex === index }"
          :data-row-index="index"
          @dragstart="handleDragStart(index, $event)"
          @dragover.prevent="handleDragOver($event)"
          @drop.prevent="handleDrop"
          @dragend="handleDragEnd"
          @keydown.enter.prevent
          @keydown.space.prevent
        >
          <!-- An overlay, so marking a row never changes its measured height mid-drag. -->
          <span
            v-if="dropTargetIndex === index && draggedIndex !== index"
            class="absolute inset-x-0 -top-px h-0.5 bg-primary"
            aria-hidden="true"
          />
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
          start from nor drop onto an element that is not currently mounted. Keep the operation in <em>data</em>: the drag
          carries an index, the <em>pointer</em> decides which row it is over, auto-scrolling mounts the rows in between, and the
          reorder is a single array splice on <code>drop</code>. Rows recycle and the content shifts under a stationary pointer
          while auto-scrolling, so the target is resolved from the pointer position instead of being remembered from the last
          event - and the two refs that hold the drag (which row is carried, which row is marked) survive every unmount while
          the engine re-ranges around the mutated array.
        </p>

        <h3>1. Make a row (or its handle) a drag source and record the origin</h3>
        <p>
          Native HTML5 drag and drop needs an element with the <code>draggable</code> attribute. Put it on the whole row, or -
          to avoid hijacking text selection and inner images - on a dedicated handle inside the row. Either way, attach the drag
          handlers to the mounted row: <code>dragstart</code>/<code>dragover</code>/<code>drop</code>/<code>dragend</code>
          bubble from the handle to the row's listeners. On <code>dragstart</code>, capture the slot <code>index</code> into a
          <code>draggedIndex</code> ref, set <code>effectAllowed = 'move'</code>, store the index on the
          <code>dataTransfer</code>, and optionally anchor the drag image at the cursor so the row does not visually jump.
        </p>

        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          The overlay bar is driven by the engine's own scroll math, so its
          rendering cost stays flat no matter how long the list grows.
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

// The pointer decides the target, not the event target: rows unmount, and the
// content moves under a still pointer while auto-scrolling.
function rowIndexAt(x: number, y: number) {
  const row = document.elementFromPoint(x, y)?.closest&lt;HTMLElement>(&#x27;[data-row-index]&#x27;);
  return row ? Number((row as HTMLElement).dataset.rowIndex) : null;
}

function onDragOver(e: DragEvent) {
  e.preventDefault(); // required or the drop is rejected
  dropTargetIndex.value = rowIndexAt(e.clientX, e.clientY); // the row under the cursor
  edgeAutoScroll(e);
}

function onDrop(e: DragEvent) {
  stopAutoScroll();
  const from = draggedIndex.value;
  const to = rowIndexAt(e.clientX, e.clientY) ?? dropTargetIndex.value;
  if (from !== null &amp;&amp; to !== null &amp;&amp; from !== to) {
    const next = [ ...list.value ];
    const [ moved ] = next.splice(from, 1);
    // The marker sits above its row, and removing the carried row shifts every
    // row below it up by one, so a downward move inserts one index earlier.
    next.splice(to > from ? to - 1 : to, 0, moved);
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
          the window - and which row sits under the pointer changes as the list scrolls, even while the pointer is still. Have
          every mounted row publish its index (<code>data-row-index="index"</code>), then resolve the target from the pointer
          with <code>document.elementFromPoint</code>: the row under the cursor is the one the user means, whether or not it was
          mounted when the drag started. On <code>dragover.prevent</code> (the <code>.prevent</code> is required or the browser
          rejects the drop) refresh that resolution - and re-run it from the auto-scroll tick too, otherwise the marker, and the
          drop that follows it, lag behind the rows moving underneath. The instance's <code>getRowIndexAt(offset)</code> is the
          arithmetic equivalent when every row is the same height; the DOM lookup needs no size assumptions at all.
        </p>

        <p>
          Cancel the <code>drop</code> event the same way (<code>@drop.prevent</code>). A drop that no handler cancels is left to
          the browser, and the payload carried here is text: Safari - on iOS above all - searches the web for the dropped text
          and loads the results, so a release that misses the rows navigates away. Rows only cover the pixels they occupy, so
          while a row is carried, cancel <code>dragover</code> and <code>drop</code> at the window level as well. The rows still
          resolve the target from the pointer, and a release over the page around the list then does nothing.
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
        :class=&quot;{ 'is-dragging': draggedIndex === index }&quot;
        :data-row-index=&quot;index&quot;
        @dragstart=&quot;onDragStart(index, $event)&quot;
        @dragover.prevent=&quot;onDragOver($event)&quot;
        @drop.prevent=&quot;onDrop&quot;
        @dragend=&quot;onDragEnd&quot;
      >
        &lt;!-- Overlay marker: a border would change the row's measured height mid-drag. -->
        &lt;span v-if=&quot;dropTargetIndex === index &amp;&amp; draggedIndex !== index&quot; class=&quot;row-marker&quot; aria-hidden=&quot;true&quot; />
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
          Dragging to a row far below (or above) the viewport cannot work by waiting for the pointer to cross it - the target is
          not mounted. Drive the scroll yourself while the pointer sits in an edge zone of the container: repeatedly call the
          instance's programmatic scroll (reading the current offset from <code>scrollDetails.scrollOffset</code> and nudging it
          with <code>scrollToOffset</code>), which mounts the intermediate rows under the cursor until the desired index appears.
          Virtualization means you never manipulate a wrapper's <code>scrollTop</code> - always go through the exposed scroll
          methods so the engine keeps its internal state consistent.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          code="// Auto-scroll while the pointer rests in the top/bottom edge zone. Unmounted
// rows can't be drop targets, so we scroll (which mounts more rows) until the
// wanted index comes under the cursor. `virtualScrollRef` is the component ref.
let timer: ReturnType&lt;typeof setInterval&gt; | null = null;
let pointer = { x: 0, y: 0 };

function edgeAutoScroll(e: DragEvent) {
  pointer = { x: e.clientX, y: e.clientY };
  const host = (e.currentTarget as HTMLElement).closest('.virtual-scroll-container');
  const rect = host?.getBoundingClientRect();
  if (!rect || timer) return;
  const zone = 60;
  const delta = pointer.y &lt; rect.top + zone ? -10 : pointer.y > rect.bottom - zone ? 10 : 0;
  if (delta === 0) return;
  timer = setInterval(() => {
    // Rows move under a still pointer, so the target is re-resolved on every step -
    // requestAnimationFrame is throttled in background tabs, an interval is not.
    dropTargetIndex.value = rowIndexAt(pointer.x, pointer.y);
    const vs = virtualScrollRef.value;
    if (!vs) return;
    const y = vs.scrollDetails.scrollOffset.y; // current virtual offset
    vs.scrollToOffset(null, y + delta, { behavior: 'auto' }); // nudge the axis
  }, 16);
}

function stopAutoScroll() {
  if (timer) clearInterval(timer);
  timer = null;
}"
        />

        <h3>4. Commit one splice on drop, then clean up</h3>
        <p>
          Reorder only on <code>drop</code>, never live while hovering: if you mutated the array on every <code>dragover</code>,
          the indices you are comparing would drift mid-drag. On drop, remove the carried item and insert it at the marked row -
          the removal shifts every later row up by one, so a downward move inserts at
          <code>target - 1</code> and an upward move at <code>target</code>. Assign a fresh array so the change is reactive; the
          engine re-ranges around the current scroll and re-measures, so the visual position is preserved. Because a
          <code>drop</code> can be cancelled (Esc, leaving the window), also reset both refs and stop any auto-scroll in
          <code>dragend</code>. Add lightweight feedback from the same state: dim the carried row
          (<code>draggedIndex</code>) and mark the target row (<code>dropTargetIndex</code>) with an absolutely positioned
          overlay - a border would change a measured row's height and re-run the layout you are dragging inside. If your rows are
          all the same height, sizing them arithmetically with a numeric <code>item-size</code> makes offsets deterministic and
          <code>getRowIndexAt</code> exact - but drag reorder itself is agnostic to measured vs. fixed rows.
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
.row-marker {
  position: absolute;
  inset-inline: 0;
  top: -1px;
  height: 3px;
  background: oklch(55% 0.2 260);
} /* drop marker: an overlay, never a border */"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
