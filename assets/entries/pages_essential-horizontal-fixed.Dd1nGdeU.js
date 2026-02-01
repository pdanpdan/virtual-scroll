import{d as T,l as w,w as l,u as m,m as y,p as n,o as A,b as p,a as r,t as i,j as v,v as C,i as P,f as D,g as U,h as E}from"../chunks/chunk-BDlHe8BJ.js";import{V as R}from"../chunks/chunk-CY8_agoq.js";import{_ as j,a as V}from"../chunks/chunk-C1op8fmR.js";import{_}from"../chunks/chunk-CuJM7iIK.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const B=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const itemSize = ref(100);
const bufferBefore = ref(20);
const bufferAfter = ref(20);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`Fixed Item \${ i }\`,
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
  <ExampleContainer height="350px" :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-3">Horizontal Fixed</span>
    </template>

    <template #description>
      Optimized for {{ itemCount.toLocaleString() }} items where every item has the same width ({{ itemSize }}px). Row height is filled automatically. Default buffers are set to {{ bufferBefore }} for smoother horizontal panning.
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
      Horizontal scrolling with uniform item widths
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="horizontal" />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
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
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-horizontal-item example-horizontal-item--fixed">
          <span class="example-badge mb-4">#{{ index }}</span>
          <div class="font-bold text-sm">{{ item.text }}</div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,M={class:"example-horizontal-item example-horizontal-item--fixed"},k={class:"example-badge mb-4"},O={class:"font-bold text-sm"},I=T({__name:"+Page",setup($){const a=n(1e3),s=n(100),f=n(20),d=n(20),h=C(()=>Array.from({length:a.value},(o,e)=>({id:e,text:`Fixed Item ${e}`}))),u=n(),c=n(null),S=y("debugMode",n(!1));function x(o){c.value=o}function g(o,e,t){u.value?.scrollToIndex(o,e,t)}function b(o,e){u.value?.scrollToOffset(o,e)}return(o,e)=>(A(),w(j,{height:"350px",code:m(B)},{title:l(()=>[...e[5]||(e[5]=[r("span",{class:"example-title example-title--group-3"},"Horizontal Fixed",-1)])]),description:l(()=>[v(" Optimized for "+i(a.value.toLocaleString())+" items where every item has the same width ("+i(s.value)+"px). Row height is filled automatically. Default buffers are set to "+i(f.value)+" for smoother horizontal panning. ",1)]),icon:l(()=>[...e[6]||(e[6]=[r("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-3"},[r("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25",class:"-rotate-90 origin-center"})],-1)])]),subtitle:l(()=>[...e[7]||(e[7]=[v(" Horizontal scrolling with uniform item widths ",-1)])]),controls:l(()=>[p(V,{"scroll-details":c.value,direction:"horizontal"},null,8,["scroll-details"]),p(_,{"item-count":a.value,"onUpdate:itemCount":e[0]||(e[0]=t=>a.value=t),"item-size":s.value,"onUpdate:itemSize":e[1]||(e[1]=t=>s.value=t),"buffer-before":f.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>f.value=t),"buffer-after":d.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>d.value=t),direction:"horizontal",onScrollToIndex:g,onScrollToOffset:b,onRefresh:e[4]||(e[4]=t=>u.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after"])]),default:l(()=>[p(m(R),{ref_key:"virtualScrollRef",ref:u,debug:m(S),class:"example-container",direction:"horizontal",items:h.value,"item-size":s.value,"buffer-before":f.value,"buffer-after":d.value,onScroll:x},{item:l(({item:t,index:z})=>[r("div",M,[r("span",k,"#"+i(z),1),r("div",O,i(t.text),1)])]),_:1},8,["debug","items","item-size","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),H=Object.freeze(Object.defineProperty({__proto__:null,default:I},Symbol.toStringTag,{value:"Module"})),ee={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:E}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:U}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:D}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-horizontal-fixed/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:H}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:P}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-horizontal-fixed/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Horizontal Fixed | Virtual Scroll"}}};export{ee as configValuesSerialized};
