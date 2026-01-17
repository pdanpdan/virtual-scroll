import{d as w,h as u,r as m,g as x,l as k,w as s,u as l,o as a,q as f,c as h,x as C,y as o,a as i,e as r,i as z,f as T}from"../chunks/chunk-e4V5FOSP.js";import{E as D,V as P,_ as V}from"../chunks/chunk-MYTeg86T.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const E=`<script setup lang="ts">
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
      <span class="text-secondary font-bold uppercase opacity-60 pe-2 align-baseline">Sticky Sections</span>
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
        class="size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg"
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
      class="bg-base-100"
      :items="items"
      :item-size="50"
      :sticky-indices="stickyIndices"
      @scroll="onScroll"
    >
      <template #item="{ item, isStickyActive }">
        <div
          v-if="item.type === 'header'"
          class="h-full flex items-center px-6 bg-base-300 border-b border-base-300 font-bold uppercase tracking-wider text-primary"
          :class="{ 'shadow-md': isStickyActive }"
        >
          {{ item.label }}
        </div>
        <div v-else class="h-full flex items-center px-8 border-b border-base-200 hover:bg-base-300 transition-colors">
          {{ item.label }}
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,j={class:"flex flex-wrap gap-2 md:gap-4 items-start"},A={key:1,class:"h-full flex items-center px-8 border-b border-base-200 hover:bg-base-300 transition-colors"},v=20,d=10,_=w({__name:"+Page",setup(B){const c=u(()=>{const t=[];for(let e=0;e<v;e++){t.push({type:"header",label:`Section ${String.fromCharCode(65+e)}`});for(let n=0;n<d;n++)t.push({type:"item",label:`Item ${e}-${n}`})}return t}),y=u(()=>{const t=[];for(let e=0;e<c.value.length;e+=d+1)t.push(e);return t}),p=m(null),S=x("debugMode",m(!1));function g(t){p.value=t}return(t,e)=>(a(),k(D,{code:l(E)},{title:s(()=>[...e[0]||(e[0]=[i("span",{class:"text-secondary font-bold uppercase opacity-60 pe-2 align-baseline"},"Sticky Sections",-1)])]),description:s(()=>[e[1]||(e[1]=r(" Demonstrates iOS-style sticky headers using the ",-1)),e[2]||(e[2]=i("strong",null,"stickyIndices",-1)),r(" prop for "+o(v)+" sections with "+o(d)+" items each. When a new header scrolls up, it 'pushes' the previous sticky header out of the view. ")]),icon:s(()=>[...e[3]||(e[3]=[i("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg"},[i("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"})],-1)])]),subtitle:s(()=>[...e[4]||(e[4]=[r(" Section headers with pushing effect ",-1)])]),controls:s(()=>[i("div",j,[f(V,{"scroll-details":p.value,direction:"vertical"},null,8,["scroll-details"])])]),default:s(()=>[f(l(P),{debug:l(S),class:"bg-base-100",items:c.value,"item-size":50,"sticky-indices":y.value,onScroll:g},{item:s(({item:n,isStickyActive:b})=>[n.type==="header"?(a(),h("div",{key:0,class:C(["h-full flex items-center px-6 bg-base-300 border-b border-base-300 font-bold uppercase tracking-wider text-primary",{"shadow-md":b}])},o(n.label),3)):(a(),h("div",A,o(n.label),1))]),_:1},8,["debug","items","sticky-indices"])]),_:1},8,["code"]))}}),U=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"})),W={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:T}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-sticky-sections/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:U}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:z}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-sticky-sections/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Sticky Sections - Virtual Scroll"}}};export{W as configValuesSerialized};
