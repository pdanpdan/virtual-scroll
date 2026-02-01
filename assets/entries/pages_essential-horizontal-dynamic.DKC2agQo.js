import{d as w,l as A,w as o,u as m,m as C,p as i,o as D,b as p,a as l,t as a,s as P,j as c,v as b,i as U,f as E,g as k,h as R}from"../chunks/chunk-BzgwLqVJ.js";import{V as j}from"../chunks/chunk-Dk5GrEJI.js";import{_ as V,a as I}from"../chunks/chunk-XCFXGF1G.js";import{_ as M}from"../chunks/chunk-BhdRxmQ8.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const B=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const baseItemSize = ref(150);
const bufferBefore = ref(20);
const bufferAfter = ref(20);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text1: \`Dynamic Item \${ i }\`,
  text2: \`Width: \${ itemSizeFn.value(null, i) }px\`,
})));

const virtualScrollRef = ref();
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}

function handleScrollToIndex(row: number | null, col: number | null, align: ScrollAlignment | ScrollAlignmentOptions) {
  virtualScrollRef.value?.scrollToIndex(row, col, align);
}

function handleScrollToOffset(x: number | null, y: number | null) {
  virtualScrollRef.value?.scrollToOffset(x, y);
}
<\/script>

<template>
  <ExampleContainer height="300px" :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-3">Horizontal Dynamic</span>
    </template>

    <template #description>
      Horizontal scrolling with {{ itemCount.toLocaleString() }} items with different widths measured via <strong>ResizeObserver</strong>. Even items are {{ baseItemSize }}px, odd items are {{ baseItemSize * 2 }}px. Try resizing the container!
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" class="-rotate-90 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Horizontal scrolling with variable item widths
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="horizontal" />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="baseItemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        direction="horizontal"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="horizontal"
      :items="items"
      :default-item-size="150"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-horizontal-item px-4">
          <span class="example-badge mb-4">#{{ index }}</span>
          <div class="font-bold text-sm mb-1" :style="{ inlineSize: \`\${ itemSizeFn(null, index) }px\` }">
            {{ item.text1 }}
          </div>
          <div class="text-xs small-caps tracking-widest opacity-50">{{ item.text2 }}</div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,O={class:"example-horizontal-item px-4"},_={class:"example-badge mb-4"},$={class:"text-xs small-caps tracking-widest opacity-50"},H=w({__name:"+Page",setup(F){const s=i(1e3),r=i(150),d=i(20),f=i(20),v=b(()=>{const n=r.value;return(e,t)=>t%2===0?n:n*2}),h=b(()=>Array.from({length:s.value},(n,e)=>({id:e,text1:`Dynamic Item ${e}`,text2:`Width: ${v.value(null,e)}px`}))),u=i(),S=i(null),g=C("debugMode",i(!1));function z(n){S.value=n}function y(n,e,t){u.value?.scrollToIndex(n,e,t)}function T(n,e){u.value?.scrollToOffset(n,e)}return(n,e)=>(D(),A(V,{height:"300px",code:m(B)},{title:o(()=>[...e[5]||(e[5]=[l("span",{class:"example-title example-title--group-3"},"Horizontal Dynamic",-1)])]),description:o(()=>[c(" Horizontal scrolling with "+a(s.value.toLocaleString())+" items with different widths measured via ",1),e[6]||(e[6]=l("strong",null,"ResizeObserver",-1)),c(". Even items are "+a(r.value)+"px, odd items are "+a(r.value*2)+"px. Try resizing the container! ",1)]),icon:o(()=>[...e[7]||(e[7]=[l("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-3"},[l("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25",class:"-rotate-90 origin-center"})],-1)])]),subtitle:o(()=>[...e[8]||(e[8]=[c(" Horizontal scrolling with variable item widths ",-1)])]),controls:o(()=>[p(I,{"scroll-details":S.value,direction:"horizontal"},null,8,["scroll-details"]),p(M,{"item-count":s.value,"onUpdate:itemCount":e[0]||(e[0]=t=>s.value=t),"item-size":r.value,"onUpdate:itemSize":e[1]||(e[1]=t=>r.value=t),"buffer-before":d.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>d.value=t),"buffer-after":f.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>f.value=t),direction:"horizontal",onScrollToIndex:y,onScrollToOffset:T,onRefresh:e[4]||(e[4]=t=>u.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after"])]),default:o(()=>[p(m(j),{ref_key:"virtualScrollRef",ref:u,debug:m(g),class:"example-container",direction:"horizontal",items:h.value,"default-item-size":150,"buffer-before":d.value,"buffer-after":f.value,onScroll:z},{item:o(({item:t,index:x})=>[l("div",O,[l("span",_,"#"+a(x),1),l("div",{class:"font-bold text-sm mb-1",style:P({inlineSize:`${v.value(null,x)}px`})},a(t.text1),5),l("div",$,a(t.text2),1)])]),_:1},8,["debug","items","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),L=Object.freeze(Object.defineProperty({__proto__:null,default:H},Symbol.toStringTag,{value:"Module"})),ne={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:R}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:k}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:E}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-horizontal-dynamic/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:L}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:U}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-horizontal-dynamic/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Horizontal Dynamic | Virtual Scroll"}}};export{ne as configValuesSerialized};
