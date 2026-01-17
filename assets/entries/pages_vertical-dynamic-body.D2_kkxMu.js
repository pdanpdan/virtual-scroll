import{d as T,r,j as C,h as g,g as E,l as D,w as o,u as f,o as V,q as p,a as n,y as s,B as R,e as m,i as B,f as k}from"../chunks/chunk-e4V5FOSP.js";import{E as O,V as P,_ as j}from"../chunks/chunk-MYTeg86T.js";import{_ as U}from"../chunks/chunk-Be-ltuh_.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const L=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onMounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const scrollContainer = ref<Window | null>(null);

onMounted(() => {
  scrollContainer.value = window;
});

const itemCount = ref(1000);
const baseItemSize = ref(50); // Approximate base size
const bufferBefore = ref(5);
const bufferAfter = ref(5);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`Body Scroll Dynamic Item \${ i } (Height: \${ itemSizeFn.value(null, i) }px)\`,
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
  <ExampleContainer height="auto" :code="rawCode">
    <template #title>
      <span class="text-success font-bold uppercase opacity-60 pe-2 align-baseline">Vertical Dynamic Body</span>
    </template>

    <template #description>
      This example uses the main browser window for scrolling {{ itemCount.toLocaleString() }} dynamic items. Sizes are automatically detected via <strong>ResizeObserver</strong>.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-success text-success-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with variable item heights
    </template>

    <template #controls>
      <div class="sticky top-0 z-100 flex flex-wrap gap-2 md:gap-4 items-start pointer-events-none">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="baseItemSize"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          direction="vertical"
          @scroll-to-index="handleScrollToIndex"
          @scroll-to-offset="handleScrollToOffset"
          @refresh="virtualScrollRef?.refresh()"
        />
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="bg-base-100 border border-base-300 rounded-box overflow-hidden"
      :items="items"
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #header>
        <div class="bg-neutral text-neutral-content p-12 text-center rounded-t-box">
          <h2 class="text-3xl font-bold mb-2 uppercase">SCROLLABLE HEADER</h2>
          <p class="opacity-80">This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="flex items-center p-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium" :style="{ blockSize: \`\${ itemSizeFn(null, index) }px\` }">{{ item.text }}</span>
        </div>
      </template>

      <template #footer>
        <div class="bg-neutral text-neutral-content p-12 text-center rounded-b-box">
          <h2 class="text-2xl font-bold uppercase">PAGE FOOTER</h2>
          <p class="opacity-60 text-sm mt-2">End of the {{ itemCount }} dynamic items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,I={class:"sticky top-0 z-100 flex flex-wrap gap-2 md:gap-4 items-start pointer-events-none"},H={class:"flex items-center p-6 border-b border-base-200 hover:bg-base-300 transition-colors"},M={class:"badge badge-neutral mr-4"},_={class:"bg-neutral text-neutral-content p-12 text-center rounded-b-box"},$={class:"opacity-60 text-sm mt-2"},F=T({__name:"+Page",setup(G){const b=r(null);C(()=>{b.value=window});const a=r(1e3),d=r(50),u=r(5),c=r(5),v=g(()=>{const l=d.value;return(e,t)=>t%2===0?l:l*2}),h=g(()=>Array.from({length:a.value},(l,e)=>({id:e,text:`Body Scroll Dynamic Item ${e} (Height: ${v.value(null,e)}px)`}))),i=r(),S=r(null),y=E("debugMode",r(!1));function w(l){S.value=l}function z(l,e,t){i.value?.scrollToIndex(l,e,t)}function A(l,e){i.value?.scrollToOffset(l,e)}return(l,e)=>(V(),D(O,{height:"auto",code:f(L)},{title:o(()=>[...e[5]||(e[5]=[n("span",{class:"text-success font-bold uppercase opacity-60 pe-2 align-baseline"},"Vertical Dynamic Body",-1)])]),description:o(()=>[m(" This example uses the main browser window for scrolling "+s(a.value.toLocaleString())+" dynamic items. Sizes are automatically detected via ",1),e[6]||(e[6]=n("strong",null,"ResizeObserver",-1)),e[7]||(e[7]=m(". ",-1))]),icon:o(()=>[...e[8]||(e[8]=[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-success text-success-content shadow-lg"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"})],-1)])]),subtitle:o(()=>[...e[9]||(e[9]=[m(" Native window scrolling with variable item heights ",-1)])]),controls:o(()=>[n("div",I,[p(j,{"scroll-details":S.value,direction:"vertical"},null,8,["scroll-details"]),p(U,{"item-count":a.value,"onUpdate:itemCount":e[0]||(e[0]=t=>a.value=t),"item-size":d.value,"onUpdate:itemSize":e[1]||(e[1]=t=>d.value=t),"buffer-before":u.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>u.value=t),"buffer-after":c.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>c.value=t),direction:"vertical",onScrollToIndex:z,onScrollToOffset:A,onRefresh:e[4]||(e[4]=t=>i.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after"])])]),default:o(()=>[p(f(P),{ref_key:"virtualScrollRef",ref:i,debug:f(y),class:"bg-base-100 border border-base-300 rounded-box overflow-hidden",items:h.value,container:b.value,"buffer-before":u.value,"buffer-after":c.value,onScroll:w},{header:o(()=>[...e[10]||(e[10]=[n("div",{class:"bg-neutral text-neutral-content p-12 text-center rounded-t-box"},[n("h2",{class:"text-3xl font-bold mb-2 uppercase"},"SCROLLABLE HEADER"),n("p",{class:"opacity-80"},"This header and fixed height items scroll with the page")],-1)])]),item:o(({item:t,index:x})=>[n("div",H,[n("span",M,"#"+s(x),1),n("span",{class:"font-medium",style:R({blockSize:`${v.value(null,x)}px`})},s(t.text),5)])]),footer:o(()=>[n("div",_,[e[11]||(e[11]=n("h2",{class:"text-2xl font-bold uppercase"},"PAGE FOOTER",-1)),n("p",$,"End of the "+s(a.value)+" dynamic items list",1)])]),_:1},8,["debug","items","container","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),N=Object.freeze(Object.defineProperty({__proto__:null,default:F},Symbol.toStringTag,{value:"Module"})),te={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:k}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-dynamic-body/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:N}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:B}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-dynamic-body/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Dynamic Body | Virtual Scroll"}}};export{te as configValuesSerialized};
