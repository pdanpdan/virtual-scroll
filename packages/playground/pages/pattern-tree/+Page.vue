<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, reactive, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

interface TreeNode {
  id: string;
  label: string;
  level: number;
  expanded: boolean;
  children: TreeNode[];
}

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

/**
 * Generates a hierarchical tree structure for the example.
 *
 * @param depth - How many levels deep the tree should go.
 * @param breadth - How many children each node should have.
 * @param prefix - Prefix for the node IDs.
 * @returns A tree of nodes.
 */
function generateTree(depth: number, breadth: number, prefix = 'node'): TreeNode[] {
  if (depth <= 0) {
    return [];
  }
  return Array.from({ length: breadth }, (_, i) => {
    const id = `${ prefix }-${ i }`;
    return {
      id,
      label: `Node ${ id }`,
      level: 5 - depth,
      expanded: false,
      children: generateTree(depth - 1, breadth, id),
    };
  });
}

// Generate a large tree: 5 levels, 5 nodes per level = 5^1 + 5^2 + 5^3 + 5^4 + 5^5 nodes
// Total nodes roughly 3900.
const tree = reactive(generateTree(5, 5));

/**
 * Flattens the tree into a single array containing only visible (expanded) nodes.
 *
 * @param nodes - The nodes to flatten.
 * @param result - Accumulated result array.
 * @returns The flattened array of visible nodes.
 */
function flatten(nodes: TreeNode[], result: TreeNode[] = []): TreeNode[] {
  for (const node of nodes) {
    result.push(node);
    if (node.expanded && node.children.length > 0) {
      flatten(node.children, result);
    }
  }
  return result;
}

const visibleItems = computed(() => flatten(tree));
const virtualScrollbar = ref(true);

const {
  scrollDetails,
  onScroll,
} = useExampleScroll();

/**
 * Toggles the expanded state of a node.
 *
 * @param node - The node to toggle.
 */
function toggle(node: TreeNode) {
  node.expanded = !node.expanded;
}

/**
 * Toggles the expanded state of all nodes in a list recursively.
 *
 * @param nodes - The nodes to update.
 * @param expanded - Whether to expand or collapse.
 */
function setAllExpanded(nodes: TreeNode[], expanded: boolean) {
  for (const node of nodes) {
    node.expanded = expanded;
    if (node.children.length > 0) {
      setAllExpanded(node.children, expanded);
    }
  }
}
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-5">Collapsible Tree</span>
    </template>

    <template #description>
      A hierarchical list where items can be expanded or collapsed. Virtualization ensures smooth scrolling even with thousands of nodes.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 8v10m0-5h6m-6 5h6" />
        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
        <circle cx="14" cy="13" r="1.5" fill="currentColor" />
        <circle cx="14" cy="18" r="1.5" fill="currentColor" />
      </svg>
    </template>

    <template #subtitle>
      Virtualized hierarchical list with expandable/collapsible nodes
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

        <button
          class="btn btn-soft btn-secondary btn-sm"
          @click="setAllExpanded(tree, true)"
        >
          Expand All
        </button>
        <button
          class="btn btn-soft btn-secondary btn-sm"
          @click="setAllExpanded(tree, false)"
        >
          Collapse All
        </button>
        <div class="text-xs opacity-60 font-mono px-2">
          Visible Nodes: {{ visibleItems.length }}
        </div>
      </div>
    </template>

    <VirtualScroll
      class="example-container"
      :items="visibleItems"
      :debug="debugMode"
      :virtual-scrollbar="virtualScrollbar"
      role="tree"
      item-role="none"
      aria-label="Collapsible directory tree"
      @scroll="onScroll"
    >
      <template #item="{ item, index, getItemAriaProps }">
        <div
          role="treeitem"
          v-bind="getItemAriaProps(index)"
          tabindex="0"
          aria-selected="false"
          :aria-level="item.level + 1"
          :aria-expanded="item.children.length > 0 ? item.expanded : undefined"
          class="example-vertical-item py-2 outline-none focus-visible:bg-base-300 cursor-pointer"
          :style="{ paddingInlineStart: `${ item.level * 24 + 16 }px` }"
          @click="toggle(item)"
          @keydown.enter="toggle(item)"
          @keydown.space.prevent="toggle(item)"
        >
          <div class="size-6 flex items-center justify-center me-2">
            <svg
              v-if="item.children.length > 0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="size-3.5 transition-transform duration-300"
              :class="item.expanded ? 'rotate-0' : '-rotate-90 rtl:rotate-90'"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <span class="font-bold text-sm">{{ item.label }}</span>
          <span class="ms-auto text-xs opacity-40 font-mono">#{{ index }}</span>
        </div>
      </template>
    </VirtualScroll>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A tree is recursive, but a virtual scroller is linear: it positions a flat array of rows by integer index and mounts only the window around the scroll offset. The bridge is a flattening step - keep the real hierarchy in your data, then derive the array of <em>visible</em> rows (each node followed by its descendants while it is expanded) and pass that to <code>:items</code>. Expanding or collapsing then mutates the model and re-runs the flatten; nothing in the DOM tree needs rebuilding, so the cost scales with the visible nodes, not with layout of the whole tree. Each recompute yields a new array instance, which the engine picks up automatically - no <code>refresh()</code> call and nothing to reset.
        </p>

        <h3>1. Flatten the visible subset of a real tree</h3>
        <p>
          Keep expand state in the model, never in the DOM: rows recycle - they unmount when they leave the window and remount on return, so a flag stored on an element is lost. A boolean on each node (or a <code>Set</code> of expanded ids in a store) survives recycling. The flatten walk pushes a node and, when it is expanded, recurses into its children - a pre-order traversal that stops at collapsed branches. Entries are the node objects themselves, so the <code>#item</code> slot receives the node and <code>toggle()</code> can mutate the reactive source directly.
        </p>

        <p>
          The examples also draw the built-in virtual scrollbar (boolean <code>virtual-scrollbar</code>) on the list.
          Besides consistent cross-browser styling it is a performance improvement: the overlay bar is driven by the
          engine's own scroll math, so its rendering cost stays flat no matter how long the list grows.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="ts"
          line-numbers
          code="// Keep the real hierarchy in your data (API response, file walk, store, ...)
// and derive the flat list of *visible* rows from it.
export interface TreeNode {
  id: string;
  label: string;
  level: number;      // depth, root = 0: drives indentation and aria-level
  expanded: boolean;  // UI state lives in the model, never in the DOM
  children: TreeNode[];
}

// Depth-first flatten that stops at collapsed nodes. The result is the array
// VirtualScroll renders: expanding/collapsing only re-runs this walk, whose
// cost scales with the visible nodes, not with layout of the whole tree.
export function flattenVisible(nodes: TreeNode[], out: TreeNode[] = []): TreeNode[] {
  for (const node of nodes) {
    out.push(node);
    if (node.expanded &amp;&amp; node.children.length > 0) {
      flattenVisible(node.children, out);
    }
  }
  return out;
}

// Tiny generator for the example - replace with your data source.
export function createTree(depth: number, breadth: number, prefix = 'node', level = 0): TreeNode[] {
  return Array.from({ length: breadth }, (_, i) => {
    const id = `${ prefix }-${ i }`;
    return {
      id,
      label: `Node ${ id }`,
      level,
      expanded: false,
      children: depth > 1 ? createTree(depth - 1, breadth, id, level + 1) : [],
    };
  });
}"
        />

        <h3>2. Virtualize the flattened array with content-sized rows</h3>
        <p>
          Bind the <code>visibleItems</code> <code>computed</code> to <code>:items</code> and let rows size themselves: with no <code>item-size</code>, the engine measures every mounted row with a <code>ResizeObserver</code>, so a row can be exactly as tall as its label, twisty, and padding need. Rows that have not mounted yet are budgeted at <code>default-item-size</code> (default <code>40</code>) and settle to their measured height the frame they mount. If every row of your tree genuinely has one fixed height, pass it as a numeric <code>item-size</code> instead and all positions become pure arithmetic - the smoothest option, but wrapped or taller content then overflows its row box.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, reactive } from 'vue';

import '@pdanpdan/virtual-scroll/style.css';

import { createTree, flattenVisible, type TreeNode } from './tree';

const tree = reactive(createTree(4, 4)); // four levels, four children each
const visibleItems = computed(() => flattenVisible(tree));

function toggle(node: TreeNode) {
  node.expanded = !node.expanded;
}
&lt;/script>

&lt;template>
  &amp;lt;!-- item-role=&quot;none&quot;: the wrapper row is not the treeitem - the interactive
       row inside the slot is (it carries focus and the toggle handler). -->
  &lt;VirtualScroll
    virtual-scrollbar
    class=&quot;tree&quot;
    :items=&quot;visibleItems&quot;
    role=&quot;tree&quot;
    item-role=&quot;none&quot;
    aria-label=&quot;Collapsible tree&quot;
  >
    &amp;lt;!-- No item-size: rows are measured from rendered content, so each row is
         exactly as tall as its label needs. -->
    &lt;template #item=&quot;{ item, index, getItemAriaProps }&quot;>
      &lt;div
        role=&quot;treeitem&quot;
        v-bind=&quot;getItemAriaProps(index)&quot;
        tabindex=&quot;0&quot;
        :aria-level=&quot;item.level + 1&quot;
        :aria-expanded=&quot;item.children.length > 0 ? item.expanded : undefined&quot;
        class=&quot;tree-row&quot;
        :style=&quot;{ paddingInlineStart: `${ item.level * 20 + 12 }px` }&quot;
        @click=&quot;toggle(item)&quot;
        @keydown.enter=&quot;toggle(item)&quot;
        @keydown.space.prevent=&quot;toggle(item)&quot;
      >
        &lt;span class=&quot;twisty&quot; aria-hidden=&quot;true&quot;>{{ item.children.length > 0 ? (item.expanded ? '▾' : '▸') : '' }}&lt;/span>
        &lt;span>{{ item.label }}&lt;/span>
      &lt;/div>
    &lt;/template>
  &lt;/VirtualScroll>
&lt;/template>

&lt;style scoped>
.tree {
  height: 480px;
}
.tree-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding-block: 0.35rem;
}
.twisty {
  width: 1rem;
}
&lt;/style>"
        />

        <h3>3. What expand and collapse do to the scroll math</h3>
        <p>
          Toggling a node inserts or removes its whole subtree between two neighbors, so every later index shifts. The engine watches the identity and length of <code>:items</code>: sizes are re-initialized per index - indices measured earlier keep their measurements, indices never mounted use the estimate - and the browser keeps its pixel scroll offset, which the engine re-reads after the DOM updates. The visible result matches a non-virtualized tree: content below the toggled node reflows, and collapsing rows above the viewport or shrinking the total below the current offset clamps to the new end. The engine does not re-anchor the viewport to the toggled node - after a toggle, look up the node's index in the new flattened array and call <code>scrollToIndex()</code> if you want to follow it.
        </p>
        <p>
          Uniform rows make all of this invisible, because estimates equal measurements. With variable heights, a freshly mounted row may settle by a frame; reserving space for late-loading content keeps scrolling stable. Row rendering must stay idempotent and read only the model, since rows are recycled, and expand-all/collapse-all is the same recursion over the model with <code>expanded</code> set to a constant.
        </p>

        <h3>4. Keep the tree semantics for assistive technology</h3>
        <p>
          Pass <code>role="tree"</code> and the component maps item roles to <code>treeitem</code>. When the row content - not the wrapper - is the interactive element (it carries focus and the click handler), set <code>item-role="none"</code> and make the row root the <code>treeitem</code> yourself, binding <code>getItemAriaProps(index)</code> from the slot props for <code>aria-setsize</code> and <code>aria-posinset</code>. Add a 1-based <code>aria-level</code>, and <code>aria-expanded</code> only on nodes that have children. Make the row focusable (<code>tabindex="0"</code>) and toggle on <code>Enter</code> and <code>Space</code> so the tree works without a pointer. The twisty is decorative: mark it <code>aria-hidden</code> and swap or rotate its glyph according to <code>expanded</code>.
        </p>
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
