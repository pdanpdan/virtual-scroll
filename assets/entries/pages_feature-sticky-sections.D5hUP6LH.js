import{d as x,l as k,w as n,u as o,m as T,p as u,o as s,b as m,c as f,n as P,t as a,j as r,a as l,v as h,i as z,f as b,g as C,h as D}from"../chunks/chunk-BzgwLqVJ.js";import{V}from"../chunks/chunk-Dk5GrEJI.js";import{_ as E,a as A}from"../chunks/chunk-XCFXGF1G.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const j=`<script setup lang="ts">
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
`,U={key:1,class:"example-vertical-item example-vertical-item--fixed"},v=20,d=10,_=x({__name:"+Page",setup(M){const p=h(()=>{const t=[];for(let e=0;e<v;e++){t.push({type:"header",label:`Section ${String.fromCharCode(65+e)}`});for(let i=0;i<d;i++)t.push({type:"item",label:`Item ${e}-${i}`})}return t}),S=h(()=>{const t=[];for(let e=0;e<p.value.length;e+=d+1)t.push(e);return t}),c=u(null),y=T("debugMode",u(!1));function g(t){c.value=t}return(t,e)=>(s(),k(E,{code:o(j)},{title:n(()=>[...e[0]||(e[0]=[l("span",{class:"example-title example-title--group-3"},"Sticky Sections",-1)])]),description:n(()=>[e[1]||(e[1]=r(" Demonstrates iOS-style sticky headers using the ",-1)),e[2]||(e[2]=l("strong",null,"stickyIndices",-1)),r(" prop for "+a(v)+" sections with "+a(d)+" items each. When a new header scrolls up, it 'pushes' the previous sticky header out of the view. ")]),icon:n(()=>[...e[3]||(e[3]=[l("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-3"},[l("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"})],-1)])]),subtitle:n(()=>[...e[4]||(e[4]=[r(" Section headers with pushing effect ",-1)])]),controls:n(()=>[m(A,{"scroll-details":c.value,direction:"vertical"},null,8,["scroll-details"])]),default:n(()=>[m(o(V),{debug:o(y),class:"example-container",items:p.value,"item-size":50,"sticky-indices":S.value,onScroll:g},{item:n(({item:i,isStickyActive:w})=>[i.type==="header"?(s(),f("div",{key:0,class:P(["example-sticky-header example-sticky-header--start h-full transition-shadow",{"shadow-md z-1":w}])},a(i.label),3)):(s(),f("div",U,a(i.label),1))]),_:1},8,["debug","items","sticky-indices"])]),_:1},8,["code"]))}}),B=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"})),G={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:D}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:C}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:b}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-sticky-sections/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:B}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:z}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-sticky-sections/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Sticky Sections | Virtual Scroll"}}};export{G as configValuesSerialized};
