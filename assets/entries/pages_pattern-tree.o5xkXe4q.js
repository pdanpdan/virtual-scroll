import{t as e}from"../chunks/chunk-v_CCr7DM.js";import{B as t,C as n,G as r,H as i,M as a,R as o,T as s,W as c,_ as l,b as u,g as d,m as f,o as p,p as m,t as h,v as g,w as _}from"../chunks/chunk-CZEdwOsv.js";import"../chunks/chunk-YW3sP-nK.js";import{n as v}from"../chunks/chunk-BoapzTav.js";/* empty css                      *//* empty css                      *//* empty css                      */import{t as y}from"../chunks/chunk-BYGEeXHk.js";var b=`<script setup lang="ts">
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, reactive } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';

import rawCode from './+Page.vue?raw';

interface TreeNode {
  id: string;
  label: string;
  level: number;
  expanded: boolean;
  children: TreeNode[];
}

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
    const id = \`\${ prefix }-\${ i }\`;
    return {
      id,
      label: \`Node \${ id }\`,
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

/**
 * Toggles the expanded state of a node.
 *
 * @param node - The node to toggle.
 */
function toggle(node: TreeNode) {
  node.expanded = !node.expanded;
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-4">Collapsible Tree</span>
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
        class="example-icon example-icon--group-4"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.967 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.967 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    </template>

    <template #subtitle>
      Virtualized hierarchical list with expandable/collapsible nodes
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-4 items-center">
        <button
          class="btn btn-soft btn-secondary btn-sm"
          @click="visibleItems.forEach(n => n.expanded = true)"
        >
          Expand All
        </button>
        <button
          class="btn btn-soft btn-secondary btn-sm"
          @click="tree.forEach(n => n.expanded = false)"
        >
          Collapse All
        </button>
        <div class="text-xs opacity-60 font-mono">
          Visible Nodes: {{ visibleItems.length }}
        </div>
      </div>
    </template>

    <VirtualScroll
      class="example-container"
      :items="visibleItems"
    >
      <template #item="{ item, index }">
        <div
          role="button"
          tabindex="0"
          class="example-vertical-item py-2 outline-none focus-visible:bg-base-300 cursor-pointer"
          :style="{ paddingLeft: \`\${ item.level * 24 + 16 }px\` }"
          @click="toggle(item)"
          @keydown.enter="toggle(item)"
          @keydown.space.prevent="toggle(item)"
        >
          <div class="size-6 flex items-center justify-center mr-2">
            <svg
              v-if="item.children.length > 0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="size-4"
            >
              <path v-if="item.expanded" stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <div v-else class="size-1 rounded-full bg-base-content/30" />
          </div>

          <span class="font-medium text-sm">{{ item.label }}</span>
          <span class="ml-auto text-xs opacity-40 font-mono">#{{ index }}</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`flex flex-wrap gap-4 items-center`},S={class:`text-xs opacity-60 font-mono`},C=[`onClick`,`onKeydown`],w={class:`size-6 flex items-center justify-center mr-2`},T={key:0,xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`2.5`,stroke:`currentColor`,class:`size-4`},E={key:0,"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`m19.5 8.25-7.5 7.5-7.5-7.5`},D={key:1,"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`m8.25 4.5 7.5 7.5-7.5 7.5`},O={key:1,class:`size-1 rounded-full bg-base-content/30`},k={class:`font-medium text-sm`},A={class:`ml-auto text-xs opacity-40 font-mono`},j=s({__name:`+Page`,setup(e){function s(e,t,n=`node`){return e<=0?[]:Array.from({length:t},(r,i)=>{let a=`${n}-${i}`;return{id:a,label:`Node ${a}`,level:5-e,expanded:!1,children:s(e-1,t,a)}})}let p=t(s(5,5));function h(e,t=[]){for(let n of e)t.push(n),n.expanded&&n.children.length>0&&h(n.children,t);return t}let j=d(()=>h(p));function M(e){e.expanded=!e.expanded}return(e,t)=>(a(),g(y,{code:i(b)},{title:o(()=>[...t[2]||=[l(`span`,{class:`example-title example-title--group-4`},`Collapsible Tree`,-1)]]),description:o(()=>[...t[3]||=[n(` A hierarchical list where items can be expanded or collapsed. Virtualization ensures smooth scrolling even with thousands of nodes. `,-1)]]),icon:o(()=>[...t[4]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-4`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.967 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.967 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25`})],-1)]]),subtitle:o(()=>[...t[5]||=[n(` Virtualized hierarchical list with expandable/collapsible nodes `,-1)]]),controls:o(()=>[l(`div`,x,[l(`button`,{class:`btn btn-soft btn-secondary btn-sm`,onClick:t[0]||=e=>j.value.forEach(e=>e.expanded=!0)},` Expand All `),l(`button`,{class:`btn btn-soft btn-secondary btn-sm`,onClick:t[1]||=e=>p.forEach(e=>e.expanded=!1)},` Collapse All `),l(`div`,S,` Visible Nodes: `+r(j.value.length),1)])]),default:o(()=>[_(i(v),{class:`example-container`,items:j.value},{item:o(({item:e,index:t})=>[l(`div`,{role:`button`,tabindex:`0`,class:`example-vertical-item py-2 outline-none focus-visible:bg-base-300 cursor-pointer`,style:c({paddingLeft:`${e.level*24+16}px`}),onClick:t=>M(e),onKeydown:[m(t=>M(e),[`enter`]),m(f(t=>M(e),[`prevent`]),[`space`])]},[l(`div`,w,[e.children.length>0?(a(),u(`svg`,T,[e.expanded?(a(),u(`path`,E)):(a(),u(`path`,D))])):(a(),u(`div`,O))]),l(`span`,k,r(e.label),1),l(`span`,A,`#`+r(t),1)],44,C)]),_:1},8,[`items`])]),_:1},8,[`code`]))}}),M=e({default:()=>N},1),N=j;const P={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:p}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-tree/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:M}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:h}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-tree/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Collapsible Tree | Virtual Scroll`}}};export{P as configValuesSerialized};