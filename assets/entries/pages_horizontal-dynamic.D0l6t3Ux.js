import{d as T,r as o,h as g,g as C,l as A,w as r,u as m,o as D,q as p,a as l,y as a,B as R,e as d,i as j,f as E}from"../chunks/chunk-e4V5FOSP.js";import{E as P,V as k,_ as U}from"../chunks/chunk-MYTeg86T.js";import{_ as B}from"../chunks/chunk-Be-ltuh_.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const I=`<script setup lang="ts">
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
      <span class="text-accent font-bold uppercase opacity-60 pe-2 align-baseline">Horizontal Dynamic</span>
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
        class="size-12 p-2 rounded-xl bg-accent text-accent-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" class="-rotate-90 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Horizontal scrolling with variable item widths
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
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
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="bg-base-100"
      direction="horizontal"
      :items="items"
      :default-item-size="150"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center">
          <span class="badge badge-neutral mb-4">#{{ index }}</span>
          <span class="font-medium" :style="{ inlineSize: \`\${ itemSizeFn(null, index) }px\` }">
            {{ item.text1 }}<br />
            <span class="text-xs opacity-50">{{ item.text2 }}</span>
          </span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,M={class:"flex flex-wrap gap-2 md:gap-4 items-start"},O={class:"h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center"},_={class:"badge badge-neutral mb-4"},V={class:"text-xs opacity-50"},$=T({__name:"+Page",setup(L){const s=o(1e3),i=o(150),f=o(20),c=o(20),v=g(()=>{const n=i.value;return(e,t)=>t%2===0?n:n*2}),x=g(()=>Array.from({length:s.value},(n,e)=>({id:e,text1:`Dynamic Item ${e}`,text2:`Width: ${v.value(null,e)}px`}))),u=o(),b=o(null),h=C("debugMode",o(!1));function z(n){b.value=n}function y(n,e,t){u.value?.scrollToIndex(n,e,t)}function w(n,e){u.value?.scrollToOffset(n,e)}return(n,e)=>(D(),A(P,{height:"300px",code:m(I)},{title:r(()=>[...e[5]||(e[5]=[l("span",{class:"text-accent font-bold uppercase opacity-60 pe-2 align-baseline"},"Horizontal Dynamic",-1)])]),description:r(()=>[d(" Horizontal scrolling with "+a(s.value.toLocaleString())+" items with different widths measured via ",1),e[6]||(e[6]=l("strong",null,"ResizeObserver",-1)),d(". Even items are "+a(i.value)+"px, odd items are "+a(i.value*2)+"px. Try resizing the container! ",1)]),icon:r(()=>[...e[7]||(e[7]=[l("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-accent text-accent-content shadow-lg"},[l("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25",class:"-rotate-90 origin-center"})],-1)])]),subtitle:r(()=>[...e[8]||(e[8]=[d(" Horizontal scrolling with variable item widths ",-1)])]),controls:r(()=>[l("div",M,[p(U,{"scroll-details":b.value,direction:"horizontal"},null,8,["scroll-details"]),p(B,{"item-count":s.value,"onUpdate:itemCount":e[0]||(e[0]=t=>s.value=t),"item-size":i.value,"onUpdate:itemSize":e[1]||(e[1]=t=>i.value=t),"buffer-before":f.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>f.value=t),"buffer-after":c.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>c.value=t),direction:"horizontal",onScrollToIndex:y,onScrollToOffset:w,onRefresh:e[4]||(e[4]=t=>u.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after"])])]),default:r(()=>[p(m(k),{ref_key:"virtualScrollRef",ref:u,debug:m(h),class:"bg-base-100",direction:"horizontal",items:x.value,"default-item-size":150,"buffer-before":f.value,"buffer-after":c.value,onScroll:z},{item:r(({item:t,index:S})=>[l("div",O,[l("span",_,"#"+a(S),1),l("span",{class:"font-medium",style:R({inlineSize:`${v.value(null,S)}px`})},[d(a(t.text1),1),e[9]||(e[9]=l("br",null,null,-1)),l("span",V,a(t.text2),1)],4)])]),_:1},8,["debug","items","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),H=Object.freeze(Object.defineProperty({__proto__:null,default:$},Symbol.toStringTag,{value:"Module"})),Y={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:E}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/horizontal-dynamic/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:H}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:j}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/horizontal-dynamic/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Horizontal Dynamic | Virtual Scroll"}}};export{Y as configValuesSerialized};
