<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, reactive, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
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
  </ExampleContainer>
</template>
