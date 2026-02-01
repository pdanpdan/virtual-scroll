import{d as D,l as E,w as o,u as x,m as H,p as n,o as S,b,q as B,c as k,F as M,r as j,s as W,a as l,t as i,j as g,v as z,i as $,f as F,g as O,h as L}from"../chunks/chunk-BDlHe8BJ.js";import{V as Z}from"../chunks/chunk-CY8_agoq.js";import{_ as G,a as I}from"../chunks/chunk-C1op8fmR.js";import{_}from"../chunks/chunk-CuJM7iIK.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const N=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const itemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

const columnWidths = computed(() => [ columnWidth.value, Math.ceil(columnWidth.value * 1.5) ]);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
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
      <span class="example-title example-title--group-4">Grid Fixed</span>
    </template>

    <template #description>
      Simultaneously virtualizes {{ itemCount.toLocaleString() }} rows and {{ columnCount.toLocaleString() }} columns. Uses fixed <strong>itemSize</strong> ({{ itemSize }}px) and alternating <strong>columnWidth</strong> values. Panning in any direction maintains high performance.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-4"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Bidirectional scrolling with uniform dimensions
    </template>

    <template #controls>
      <ScrollStatus
        :scroll-details="scrollDetails"
        direction="both"
        :column-range="virtualScrollRef?.columnRange"
      />
      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:column-count="columnCount"
        v-model:column-width="columnWidth"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:sticky-header="stickyHeader"
        v-model:sticky-footer="stickyFooter"
        direction="both"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="both"
      :items="items"
      :item-size="itemSize"
      :column-count="columnCount"
      :column-width="columnWidths"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Grid Header
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth }">
        <div :key="\`r_\${ index }\`" class="example-grid-row">
          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="\`r_\${ index }_c_\${ columnRange.start + c - 1 }\`"
            :data-col-index="columnRange.start + c - 1"
            class="example-grid-cell"
            :style="{ inlineSize: \`\${ getColumnWidth(columnRange.start + c - 1) }px\` }"
          >
            <div class="example-badge mb-2">R{{ index }} &times; C{{ columnRange.start + c - 1 }}</div>
            <div class="opacity-40 tabular-nums">{{ getColumnWidth(columnRange.start + c - 1) }}px</div>
          </div>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          End of Grid
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,q=["data-col-index"],J={class:"example-badge mb-2"},K={class:"opacity-40 tabular-nums"},Q=D({__name:"+Page",setup(Y){const d=n(1e3),f=n(80),m=n(100),c=n(100),y=n(5),h=n(5),p=n(!1),v=n(!1),A=z(()=>[c.value,Math.ceil(c.value*1.5)]),C=z(()=>Array.from({length:d.value},(a,e)=>({id:e}))),s=n(),w=n(null),P=H("debugMode",n(!1));function U(a){w.value=a}function V(a,e,t){s.value?.scrollToIndex(a,e,t)}function R(a,e){s.value?.scrollToOffset(a,e)}return(a,e)=>(S(),E(G,{code:x(N)},{title:o(()=>[...e[9]||(e[9]=[l("span",{class:"example-title example-title--group-4"},"Grid Fixed",-1)])]),description:o(()=>[g(" Simultaneously virtualizes "+i(d.value.toLocaleString())+" rows and "+i(m.value.toLocaleString())+" columns. Uses fixed ",1),e[10]||(e[10]=l("strong",null,"itemSize",-1)),g(" ("+i(f.value)+"px) and alternating ",1),e[11]||(e[11]=l("strong",null,"columnWidth",-1)),e[12]||(e[12]=g(" values. Panning in any direction maintains high performance. ",-1))]),icon:o(()=>[...e[13]||(e[13]=[l("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-4"},[l("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"})],-1)])]),subtitle:o(()=>[...e[14]||(e[14]=[g(" Bidirectional scrolling with uniform dimensions ",-1)])]),controls:o(()=>[b(I,{"scroll-details":w.value,direction:"both","column-range":s.value?.columnRange},null,8,["scroll-details","column-range"]),b(_,{"item-count":d.value,"onUpdate:itemCount":e[0]||(e[0]=t=>d.value=t),"item-size":f.value,"onUpdate:itemSize":e[1]||(e[1]=t=>f.value=t),"column-count":m.value,"onUpdate:columnCount":e[2]||(e[2]=t=>m.value=t),"column-width":c.value,"onUpdate:columnWidth":e[3]||(e[3]=t=>c.value=t),"buffer-before":y.value,"onUpdate:bufferBefore":e[4]||(e[4]=t=>y.value=t),"buffer-after":h.value,"onUpdate:bufferAfter":e[5]||(e[5]=t=>h.value=t),"sticky-header":p.value,"onUpdate:stickyHeader":e[6]||(e[6]=t=>p.value=t),"sticky-footer":v.value,"onUpdate:stickyFooter":e[7]||(e[7]=t=>v.value=t),direction:"both",onScrollToIndex:V,onScrollToOffset:R,onRefresh:e[8]||(e[8]=t=>s.value?.refresh())},null,8,["item-count","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer"])]),default:o(()=>[b(x(Z),{ref_key:"virtualScrollRef",ref:s,debug:x(P),class:"example-container",direction:"both",items:C.value,"item-size":f.value,"column-count":m.value,"column-width":A.value,"buffer-before":y.value,"buffer-after":h.value,"sticky-header":p.value,"sticky-footer":v.value,onScroll:U},B({item:o(({index:t,columnRange:r,getColumnWidth:T})=>[(S(),k("div",{key:`r_${t}`,class:"example-grid-row"},[(S(!0),k(M,null,j(r.end-r.start,u=>(S(),k("div",{key:`r_${t}_c_${r.start+u-1}`,"data-col-index":r.start+u-1,class:"example-grid-cell",style:W({inlineSize:`${T(r.start+u-1)}px`})},[l("div",J,"R"+i(t)+" × C"+i(r.start+u-1),1),l("div",K,i(T(r.start+u-1))+"px",1)],12,q))),128))]))]),_:2},[p.value?{name:"header",fn:o(()=>[e[15]||(e[15]=l("div",{class:"example-sticky-header"}," Grid Header ",-1))]),key:"0"}:void 0,v.value?{name:"footer",fn:o(()=>[e[16]||(e[16]=l("div",{class:"example-sticky-footer"}," End of Grid ",-1))]),key:"1"}:void 0]),1032,["debug","items","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer"])]),_:1},8,["code"]))}}),X=Object.freeze(Object.defineProperty({__proto__:null,default:Q},Symbol.toStringTag,{value:"Module"})),me={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:L}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:O}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:F}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-grid-fixed/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:X}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:$}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-grid-fixed/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Grid Fixed | Virtual Scroll"}}};export{me as configValuesSerialized};
