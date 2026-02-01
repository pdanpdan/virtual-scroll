import{d as S,L as C,l as k,w as o,u as p,m as z,p as v,o as g,b,a as t,J as y,K as A,s as E,c as P,n as V,e as D,t as c,j as w,v as j,i as _,f as N,g as $,h as U}from"../chunks/chunk-BDlHe8BJ.js";import{V as B}from"../chunks/chunk-CY8_agoq.js";import{_ as M,a as I}from"../chunks/chunk-C1op8fmR.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const R=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, reactive, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

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

const scrollDetails = ref<ScrollDetails | null>(null);

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
      @scroll="(details) => scrollDetails = details"
    >
      <template #item="{ item, index }">
        <div
          role="button"
          tabindex="0"
          class="example-vertical-item py-2 outline-none focus-visible:bg-base-300 cursor-pointer"
          :style="{ paddingInlineStart: \`\${ item.level * 24 + 16 }px\` }"
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
`,K={class:"flex flex-wrap gap-4 items-center"},L={class:"text-xs opacity-60 font-mono px-2"},H=["onClick","onKeydown"],O={class:"size-6 flex items-center justify-center me-2"},G={class:"font-bold text-sm"},F={class:"ms-auto text-xs opacity-40 font-mono"},J=S({__name:"+Page",setup(q){const T=z("debugMode",v(!1));function u(l,e,n="node"){return l<=0?[]:Array.from({length:e},(x,a)=>{const d=`${n}-${a}`;return{id:d,label:`Node ${d}`,level:5-l,expanded:!1,children:u(l-1,e,d)}})}const r=C(u(5,5));function m(l,e=[]){for(const n of l)e.push(n),n.expanded&&n.children.length>0&&m(n.children,e);return e}const f=j(()=>m(r)),h=v(null);function s(l){l.expanded=!l.expanded}function i(l,e){for(const n of l)n.expanded=e,n.children.length>0&&i(n.children,e)}return(l,e)=>(g(),k(M,{code:p(R)},{title:o(()=>[...e[3]||(e[3]=[t("span",{class:"example-title example-title--group-4"},"Collapsible Tree",-1)])]),description:o(()=>[...e[4]||(e[4]=[w(" A hierarchical list where items can be expanded or collapsed. Virtualization ensures smooth scrolling even with thousands of nodes. ",-1)])]),icon:o(()=>[...e[5]||(e[5]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-4"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M8 8v10m0-5h6m-6 5h6"}),t("circle",{cx:"8",cy:"8",r:"1.5",fill:"currentColor"}),t("circle",{cx:"14",cy:"13",r:"1.5",fill:"currentColor"}),t("circle",{cx:"14",cy:"18",r:"1.5",fill:"currentColor"})],-1)])]),subtitle:o(()=>[...e[6]||(e[6]=[w(" Virtualized hierarchical list with expandable/collapsible nodes ",-1)])]),controls:o(()=>[b(I,{"scroll-details":h.value},null,8,["scroll-details"])]),"example-controls":o(()=>[t("div",K,[t("button",{class:"btn btn-soft btn-secondary btn-sm",onClick:e[0]||(e[0]=n=>i(r,!0))}," Expand All "),t("button",{class:"btn btn-soft btn-secondary btn-sm",onClick:e[1]||(e[1]=n=>i(r,!1))}," Collapse All "),t("div",L," Visible Nodes: "+c(f.value.length),1)])]),default:o(()=>[b(p(B),{class:"example-container",items:f.value,debug:p(T),onScroll:e[2]||(e[2]=n=>h.value=n)},{item:o(({item:n,index:x})=>[t("div",{role:"button",tabindex:"0",class:"example-vertical-item py-2 outline-none focus-visible:bg-base-300 cursor-pointer",style:E({paddingInlineStart:`${n.level*24+16}px`}),onClick:a=>s(n),onKeydown:[y(a=>s(n),["enter"]),y(A(a=>s(n),["prevent"]),["space"])]},[t("div",O,[n.children.length>0?(g(),P("svg",{key:0,xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"2.5",stroke:"currentColor",class:V(["size-3.5 transition-transform duration-300",n.expanded?"rotate-0":"-rotate-90 rtl:rotate-90"])},[...e[7]||(e[7]=[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"m19.5 8.25-7.5 7.5-7.5-7.5"},null,-1)])],2)):D("v-if",!0)]),t("span",G,c(n.label),1),t("span",F,"#"+c(x),1)],44,H)]),_:1},8,["items","debug"])]),_:1},8,["code"]))}}),W=Object.freeze(Object.defineProperty({__proto__:null,default:J},Symbol.toStringTag,{value:"Module"})),se={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:U}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:$}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:N}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-tree/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:W}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:_}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-tree/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Collapsible Tree | Virtual Scroll"}}};export{se as configValuesSerialized};
