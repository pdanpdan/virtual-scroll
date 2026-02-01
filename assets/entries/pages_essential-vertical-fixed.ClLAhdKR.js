import{d as w,l as z,w as l,u as c,m as A,p as o,o as C,b as v,q as P,a as n,t as u,j as y,v as D,i as U,f as V,g as E,h as R}from"../chunks/chunk-BDlHe8BJ.js";import{V as j}from"../chunks/chunk-CY8_agoq.js";import{_ as M,a as B}from"../chunks/chunk-C1op8fmR.js";import{_ as F}from"../chunks/chunk-CuJM7iIK.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const O=`<script setup lang="ts">
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
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-1">Vertical Fixed</span>
    </template>

    <template #description>
      Optimized for {{ itemCount.toLocaleString() }} items where every item has the same height. Items are only rendered when they enter the visible viewport. Row height is fixed at {{ itemSize }}px.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Standard vertical scrolling with uniform item heights
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
      :item-size="itemSize"
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
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-8">#{{ index }}</span>
          <span class="font-bold">{{ item.text }}</span>
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
`,I={class:"example-vertical-item example-vertical-item--fixed"},H={class:"example-badge me-8"},_={class:"font-bold"},$=w({__name:"+Page",setup(N){const i=o(1e3),a=o(50),p=o(5),m=o(5),s=o(!1),d=o(!1),h=D(()=>Array.from({length:i.value},(r,e)=>({id:e,text:`Fixed Item ${e}`}))),f=o(),S=o(null),x=A("debugMode",o(!1));function g(r){S.value=r}function b(r,e,t){f.value?.scrollToIndex(r,e,t)}function k(r,e){f.value?.scrollToOffset(r,e)}return(r,e)=>(C(),z(M,{code:c(O)},{title:l(()=>[...e[7]||(e[7]=[n("span",{class:"example-title example-title--group-1"},"Vertical Fixed",-1)])]),description:l(()=>[y(" Optimized for "+u(i.value.toLocaleString())+" items where every item has the same height. Items are only rendered when they enter the visible viewport. Row height is fixed at "+u(a.value)+"px. ",1)]),icon:l(()=>[...e[8]||(e[8]=[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-1"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"})],-1)])]),subtitle:l(()=>[...e[9]||(e[9]=[y(" Standard vertical scrolling with uniform item heights ",-1)])]),controls:l(()=>[v(B,{"scroll-details":S.value,direction:"vertical"},null,8,["scroll-details"]),v(F,{"item-count":i.value,"onUpdate:itemCount":e[0]||(e[0]=t=>i.value=t),"item-size":a.value,"onUpdate:itemSize":e[1]||(e[1]=t=>a.value=t),"buffer-before":p.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>p.value=t),"buffer-after":m.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>m.value=t),"sticky-header":s.value,"onUpdate:stickyHeader":e[4]||(e[4]=t=>s.value=t),"sticky-footer":d.value,"onUpdate:stickyFooter":e[5]||(e[5]=t=>d.value=t),direction:"vertical",onScrollToIndex:b,onScrollToOffset:k,onRefresh:e[6]||(e[6]=t=>f.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])]),default:l(()=>[v(c(j),{ref_key:"virtualScrollRef",ref:f,debug:c(x),class:"example-container",items:h.value,"item-size":a.value,"buffer-before":p.value,"buffer-after":m.value,"sticky-header":s.value,"sticky-footer":d.value,onScroll:g},P({item:l(({item:t,index:T})=>[n("div",I,[n("span",H,"#"+u(T),1),n("span",_,u(t.text),1)])]),_:2},[s.value?{name:"header",fn:l(()=>[e[10]||(e[10]=n("div",{class:"example-sticky-header"}," Sticky Header ",-1))]),key:"0"}:void 0,d.value?{name:"footer",fn:l(()=>[e[11]||(e[11]=n("div",{class:"example-sticky-footer"}," Sticky Footer ",-1))]),key:"1"}:void 0]),1032,["debug","items","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])]),_:1},8,["code"]))}}),L=Object.freeze(Object.defineProperty({__proto__:null,default:$},Symbol.toStringTag,{value:"Module"})),oe={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:R}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:E}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:V}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-vertical-fixed/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:L}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:U}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-vertical-fixed/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Fixed | Virtual Scroll"}}};export{oe as configValuesSerialized};
