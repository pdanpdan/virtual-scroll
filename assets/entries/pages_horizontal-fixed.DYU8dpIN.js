import{d as w,r as l,h as y,g as T,l as C,w as n,u as c,o as A,q as m,a as r,y as a,e as v,i as D,f as R}from"../chunks/chunk-e4V5FOSP.js";import{E as _,V as j,_ as P}from"../chunks/chunk-MYTeg86T.js";import{_ as k}from"../chunks/chunk-Be-ltuh_.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const B=`<script setup lang="ts">
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
      <span class="text-accent font-bold uppercase opacity-60 pe-2 align-baseline">Horizontal Fixed</span>
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
        class="size-12 p-2 rounded-xl bg-accent text-accent-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" class="-rotate-90 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Horizontal scrolling with uniform item widths
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
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
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="bg-base-100"
      direction="horizontal"
      :items="items"
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="w-full h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center">
          <span class="badge badge-neutral mb-4">#{{ index }}</span>
          <span class="font-medium">{{ item.text }}</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,E={class:"flex flex-wrap gap-2 md:gap-4 items-start"},M={class:"w-full h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center"},U={class:"badge badge-neutral mb-4"},O={class:"font-medium"},V=w({__name:"+Page",setup(H){const i=l(1e3),s=l(100),f=l(20),d=l(20),h=y(()=>Array.from({length:i.value},(o,e)=>({id:e,text:`Fixed Item ${e}`}))),u=l(),p=l(null),b=T("debugMode",l(!1));function S(o){p.value=o}function g(o,e,t){u.value?.scrollToIndex(o,e,t)}function x(o,e){u.value?.scrollToOffset(o,e)}return(o,e)=>(A(),C(_,{height:"350px",code:c(B)},{title:n(()=>[...e[5]||(e[5]=[r("span",{class:"text-accent font-bold uppercase opacity-60 pe-2 align-baseline"},"Horizontal Fixed",-1)])]),description:n(()=>[v(" Optimized for "+a(i.value.toLocaleString())+" items where every item has the same width ("+a(s.value)+"px). Row height is filled automatically. Default buffers are set to "+a(f.value)+" for smoother horizontal panning. ",1)]),icon:n(()=>[...e[6]||(e[6]=[r("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-accent text-accent-content shadow-lg"},[r("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25",class:"-rotate-90 origin-center"})],-1)])]),subtitle:n(()=>[...e[7]||(e[7]=[v(" Horizontal scrolling with uniform item widths ",-1)])]),controls:n(()=>[r("div",E,[m(P,{"scroll-details":p.value,direction:"horizontal"},null,8,["scroll-details"]),m(k,{"item-count":i.value,"onUpdate:itemCount":e[0]||(e[0]=t=>i.value=t),"item-size":s.value,"onUpdate:itemSize":e[1]||(e[1]=t=>s.value=t),"buffer-before":f.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>f.value=t),"buffer-after":d.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>d.value=t),direction:"horizontal",onScrollToIndex:g,onScrollToOffset:x,onRefresh:e[4]||(e[4]=t=>u.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after"])])]),default:n(()=>[m(c(j),{ref_key:"virtualScrollRef",ref:u,debug:c(b),class:"bg-base-100",direction:"horizontal",items:h.value,"item-size":s.value,"buffer-before":f.value,"buffer-after":d.value,onScroll:S},{item:n(({item:t,index:z})=>[r("div",M,[r("span",U,"#"+a(z),1),r("span",O,a(t.text),1)])]),_:1},8,["debug","items","item-size","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),I=Object.freeze(Object.defineProperty({__proto__:null,default:V},Symbol.toStringTag,{value:"Module"})),W={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:R}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/horizontal-fixed/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:I}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:D}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/horizontal-fixed/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Horizontal Fixed | Virtual Scroll"}}};export{W as configValuesSerialized};
