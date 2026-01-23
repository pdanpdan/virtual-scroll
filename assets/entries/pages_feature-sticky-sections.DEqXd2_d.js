import{t as e}from"../chunks/chunk-CWRknLO5.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,U as c,V as l,_ as u,b as d,g as f,o as p,t as m,v as h,w as g}from"../chunks/chunk-Cc38kaa7.js";import"../chunks/chunk-IpJMSSJ3.js";/* empty css                      */import{n as _}from"../chunks/chunk-DFIJgFoB.js";/* empty css                      *//* empty css                      */import{t as v}from"../chunks/chunk-DBIWFlRY.js";import{t as y}from"../chunks/chunk-Bwk5lMd6.js";var b=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const sectionCount = 20;
const itemsPerSection = 10;

const items = computed(() => {
  const result = [];
  for (let s = 0; s < sectionCount; s++) {
    // Header item
    result.push({ type: 'header', label: \`Section \${ String.fromCharCode(65 + s) }\` });
    // Data items
    for (let i = 0; i < itemsPerSection; i++) {
      result.push({ type: 'item', label: \`Item \${ s }-\${ i }\` });
    }
  }
  return result;
});

const stickyIndices = computed(() => {
  const indices = [];
  for (let i = 0; i < items.value.length; i += (itemsPerSection + 1)) {
    indices.push(i);
  }
  return indices;
});

const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-2">Sticky Sections</span>
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
        class="example-icon example-icon--group-2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
      </svg>
    </template>

    <template #subtitle>
      Section headers with pushing effect
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="50"
      :sticky-indices="stickyIndices"
      @scroll="onScroll"
    >
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
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`flex flex-wrap gap-2 md:gap-4 items-start`},S={key:1,class:`example-vertical-item example-vertical-item--fixed`},C=20,w=10,T=s({__name:`+Page`,setup(e){let s=f(()=>{let e=[];for(let t=0;t<C;t++){e.push({type:`header`,label:`Section ${String.fromCharCode(65+t)}`});for(let n=0;n<w;n++)e.push({type:`item`,label:`Item ${t}-${n}`})}return e}),p=f(()=>{let e=[];for(let t=0;t<s.value.length;t+=w+1)e.push(t);return e}),m=l(null),T=n(`debugMode`,l(!1));function E(e){m.value=e}return(e,n)=>(a(),h(v,{code:i(b)},{title:o(()=>[...n[0]||=[u(`span`,{class:`example-title example-title--group-2`},`Sticky Sections`,-1)]]),description:o(()=>[n[1]||=t(` Demonstrates iOS-style sticky headers using the `,-1),n[2]||=u(`strong`,null,`stickyIndices`,-1),t(` prop for `+r(C)+` sections with `+r(w)+` items each. When a new header scrolls up, it 'pushes' the previous sticky header out of the view. `)]),icon:o(()=>[...n[3]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-2`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z`})],-1)]]),subtitle:o(()=>[...n[4]||=[t(` Section headers with pushing effect `,-1)]]),controls:o(()=>[u(`div`,x,[g(y,{"scroll-details":m.value,direction:`vertical`},null,8,[`scroll-details`])])]),default:o(()=>[g(i(_),{debug:i(T),class:`example-container`,items:s.value,"item-size":50,"sticky-indices":p.value,onScroll:E},{item:o(({item:e,isStickyActive:t})=>[e.type===`header`?(a(),d(`div`,{key:0,class:c([`example-sticky-header example-sticky-header--start h-full transition-shadow`,{"shadow-md z-1":t}])},r(e.label),3)):(a(),d(`div`,S,r(e.label),1))]),_:1},8,[`debug`,`items`,`sticky-indices`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:p}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-sticky-sections/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:m}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-sticky-sections/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Sticky Sections | Virtual Scroll`}}};export{O as configValuesSerialized};