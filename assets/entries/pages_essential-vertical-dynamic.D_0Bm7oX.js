import{d as A,l as C,w as o,u as p,m as D,p as n,o as P,b as v,q as V,a as i,t as a,s as U,j as S,v as x,i as E,f as R,g as j,h as B}from"../chunks/chunk-BzgwLqVJ.js";import{V as M}from"../chunks/chunk-Dk5GrEJI.js";import{_ as O,a as F}from"../chunks/chunk-XCFXGF1G.js";import{_ as H}from"../chunks/chunk-BhdRxmQ8.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const $=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const itemSize = ref(50);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
  return (_: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`Dynamic Item \${ i } (Height: \${ itemSizeFn.value(null, i) }px)\`,
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
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-1">Vertical Dynamic</span>
    </template>

    <template #description>
      Vertical scrolling with variable item heights for {{ itemCount.toLocaleString() }} items. Automatically measures item sizes using <strong>ResizeObserver</strong>. Even items are {{ itemSize }}px, odd items are {{ itemSize * 2 }}px.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Vertical scrolling with variable item heights
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:sticky-header="stickyHeader"
        v-model:sticky-footer="stickyFooter"
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
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Sticky Header
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="example-vertical-item py-4">
          <span class="example-badge me-8">#{{ index }}</span>
          <div class="font-bold" :style="{ minBlockSize: \`\${ itemSizeFn(null, index) }px\` }">{{ item.text }}</div>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          Sticky Footer
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,I={class:"example-vertical-item py-4"},L={class:"example-badge me-8"},_=A({__name:"+Page",setup(q){const s=n(1e3),r=n(50),m=n(5),c=n(5),u=n(!1),d=n(!1),y=x(()=>{const l=r.value;return(e,t)=>t%2===0?l:l*2}),h=x(()=>Array.from({length:s.value},(l,e)=>({id:e,text:`Dynamic Item ${e} (Height: ${y.value(null,e)}px)`}))),f=n(),g=n(null),k=D("debugMode",n(!1));function T(l){g.value=l}function z(l,e,t){f.value?.scrollToIndex(l,e,t)}function w(l,e){f.value?.scrollToOffset(l,e)}return(l,e)=>(P(),C(O,{code:p($)},{title:o(()=>[...e[7]||(e[7]=[i("span",{class:"example-title example-title--group-1"},"Vertical Dynamic",-1)])]),description:o(()=>[S(" Vertical scrolling with variable item heights for "+a(s.value.toLocaleString())+" items. Automatically measures item sizes using ",1),e[8]||(e[8]=i("strong",null,"ResizeObserver",-1)),S(". Even items are "+a(r.value)+"px, odd items are "+a(r.value*2)+"px. ",1)]),icon:o(()=>[...e[9]||(e[9]=[i("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-1"},[i("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25"})],-1)])]),subtitle:o(()=>[...e[10]||(e[10]=[S(" Vertical scrolling with variable item heights ",-1)])]),controls:o(()=>[v(F,{"scroll-details":g.value,direction:"vertical"},null,8,["scroll-details"]),v(H,{"item-count":s.value,"onUpdate:itemCount":e[0]||(e[0]=t=>s.value=t),"item-size":r.value,"onUpdate:itemSize":e[1]||(e[1]=t=>r.value=t),"buffer-before":m.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>m.value=t),"buffer-after":c.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>c.value=t),"sticky-header":u.value,"onUpdate:stickyHeader":e[4]||(e[4]=t=>u.value=t),"sticky-footer":d.value,"onUpdate:stickyFooter":e[5]||(e[5]=t=>d.value=t),direction:"vertical",onScrollToIndex:z,onScrollToOffset:w,onRefresh:e[6]||(e[6]=t=>f.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])]),default:o(()=>[v(p(M),{ref_key:"virtualScrollRef",ref:f,debug:p(k),class:"example-container",items:h.value,"buffer-before":m.value,"buffer-after":c.value,"sticky-header":u.value,"sticky-footer":d.value,onScroll:T},V({item:o(({item:t,index:b})=>[i("div",I,[i("span",L,"#"+a(b),1),i("div",{class:"font-bold",style:U({minBlockSize:`${y.value(null,b)}px`})},a(t.text),5)])]),_:2},[u.value?{name:"header",fn:o(()=>[e[11]||(e[11]=i("div",{class:"example-sticky-header"}," Sticky Header ",-1))]),key:"0"}:void 0,d.value?{name:"footer",fn:o(()=>[e[12]||(e[12]=i("div",{class:"example-sticky-footer"}," Sticky Footer ",-1))]),key:"1"}:void 0]),1032,["debug","items","buffer-before","buffer-after","sticky-header","sticky-footer"])]),_:1},8,["code"]))}}),N=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"})),ne={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:B}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:j}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:R}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-vertical-dynamic/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:N}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:E}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-vertical-dynamic/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Dynamic | Virtual Scroll"}}};export{ne as configValuesSerialized};
