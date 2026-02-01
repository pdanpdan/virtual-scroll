import{d as A,x as C,l as V,w as o,u as m,p as a,m as P,o as D,b as p,a as l,t as s,s as B,j as c,v as h,i as U,f as E,g as k,h as R}from"../chunks/chunk-BDlHe8BJ.js";import{V as j}from"../chunks/chunk-CY8_agoq.js";import{_ as O,a as H}from"../chunks/chunk-C1op8fmR.js";import{_ as M}from"../chunks/chunk-CuJM7iIK.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const $=`<script setup lang="ts">
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
const itemSize = ref(50); // Approximate base size
const bufferBefore = ref(5);
const bufferAfter = ref(5);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
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
      <span class="example-title example-title--group-2">Vertical Dynamic Body</span>
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
        class="example-icon example-icon--group-2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with variable item heights
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        direction="vertical"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #header>
        <div class="example-body-header">
          <h2>Scrollable Header</h2>
          <p>This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="example-vertical-item py-4">
          <span class="example-badge me-8">#{{ index }}</span>
          <div class="font-bold" :style="{ minBlockSize: \`\${ itemSizeFn(null, index) }px\` }">{{ item.text }}</div>
        </div>
      </template>

      <template #footer>
        <div class="example-body-footer">
          <h2>Page Footer</h2>
          <p>End of the {{ itemCount.toLocaleString() }} dynamic items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,L={class:"example-vertical-item py-4"},I={class:"example-badge me-8"},_={class:"example-body-footer"},F=A({__name:"+Page",setup(W){const v=a(null);C(()=>{v.value=window});const i=a(1e3),d=a(50),u=a(5),f=a(5),S=h(()=>{const n=d.value;return(e,t)=>t%2===0?n:n*2}),x=h(()=>Array.from({length:i.value},(n,e)=>({id:e,text:`Body Scroll Dynamic Item ${e} (Height: ${S.value(null,e)}px)`}))),r=a(),b=a(null),y=P("debugMode",a(!1));function w(n){b.value=n}function T(n,e,t){r.value?.scrollToIndex(n,e,t)}function z(n,e){r.value?.scrollToOffset(n,e)}return(n,e)=>(D(),V(O,{height:"auto",code:m($)},{title:o(()=>[...e[5]||(e[5]=[l("span",{class:"example-title example-title--group-2"},"Vertical Dynamic Body",-1)])]),description:o(()=>[c(" This example uses the main browser window for scrolling "+s(i.value.toLocaleString())+" dynamic items. Sizes are automatically detected via ",1),e[6]||(e[6]=l("strong",null,"ResizeObserver",-1)),e[7]||(e[7]=c(". ",-1))]),icon:o(()=>[...e[8]||(e[8]=[l("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-2"},[l("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"})],-1)])]),subtitle:o(()=>[...e[9]||(e[9]=[c(" Native window scrolling with variable item heights ",-1)])]),controls:o(()=>[p(H,{"scroll-details":b.value,direction:"vertical"},null,8,["scroll-details"]),p(M,{"item-count":i.value,"onUpdate:itemCount":e[0]||(e[0]=t=>i.value=t),"item-size":d.value,"onUpdate:itemSize":e[1]||(e[1]=t=>d.value=t),"buffer-before":u.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>u.value=t),"buffer-after":f.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>f.value=t),direction:"vertical",onScrollToIndex:T,onScrollToOffset:z,onRefresh:e[4]||(e[4]=t=>r.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after"])]),default:o(()=>[p(m(j),{ref_key:"virtualScrollRef",ref:r,debug:m(y),class:"example-container",items:x.value,container:v.value,"buffer-before":u.value,"buffer-after":f.value,onScroll:w},{header:o(()=>[...e[10]||(e[10]=[l("div",{class:"example-body-header"},[l("h2",null,"Scrollable Header"),l("p",null,"This header and fixed height items scroll with the page")],-1)])]),item:o(({item:t,index:g})=>[l("div",L,[l("span",I,"#"+s(g),1),l("div",{class:"font-bold",style:B({minBlockSize:`${S.value(null,g)}px`})},s(t.text),5)])]),footer:o(()=>[l("div",_,[e[11]||(e[11]=l("h2",null,"Page Footer",-1)),l("p",null,"End of the "+s(i.value.toLocaleString())+" dynamic items list",1)])]),_:1},8,["debug","items","container","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),N=Object.freeze(Object.defineProperty({__proto__:null,default:F},Symbol.toStringTag,{value:"Module"})),oe={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:R}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:k}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:E}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-vertical-dynamic-body/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:N}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:U}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-vertical-dynamic-body/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Dynamic Body | Virtual Scroll"}}};export{oe as configValuesSerialized};
