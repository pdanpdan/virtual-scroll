import{d as B,l as M,w as l,u as x,m as j,p as o,o as p,b as h,q as F,c as k,n as $,F as O,r as W,s as I,a as r,t as d,j as w,v,i as L,f as Z,g as G,h as _}from"../chunks/chunk-BDlHe8BJ.js";import{V as q}from"../chunks/chunk-CY8_agoq.js";import{_ as N,a as J}from"../chunks/chunk-C1op8fmR.js";import{_ as K}from"../chunks/chunk-CuJM7iIK.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const Q=`<script setup lang="ts">
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

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

// Use a deterministic function for column width: first column 300px, others alternate 100/150
const columnWidthFn = computed(() => {
  const base = columnWidth.value;
  return (index: number) => {
    if (index === 0) {
      return base * 3;
    }
    return index % 2 === 0 ? base : Math.ceil(base * 1.5);
  };
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
})));

const stickyIndices = computed(() => {
  const indices: number[] = [];
  for (let i = 100; i < itemCount.value; i += 100) {
    indices.push(i);
  }
  return indices;
});

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
      <span class="example-title example-title--group-4">Grid Dynamic</span>
    </template>

    <template #description>
      Simultaneously virtualizes {{ itemCount.toLocaleString() }} rows and {{ columnCount.toLocaleString() }} columns. Uses <strong>querySelectorAll('[data-col-index]')</strong> to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically.
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
      Bidirectional scrolling with automatic measurement
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
      :column-count="columnCount"
      :default-item-size="120"
      :default-column-width="120"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :sticky-indices="stickyIndices"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Grid Header
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth, isStickyActive }">
        <div
          :key="\`r_\${ index }\`"
          class="example-grid-row"
          :class="{ 'example-grid-row--sticky': isStickyActive }"
        >
          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="\`r_\${ index }_c_\${ columnRange.start + c - 1 }\`"
            :data-col-index="columnRange.start + c - 1"
            class="example-grid-cell"
            :style=" {
              inlineSize: \`\${ columnWidthFn(columnRange.start + c - 1) }px\`,
              blockSize: \`\${ itemSizeFn(null, index) }px\`,
            } "
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
`,X=["data-col-index"],Y={class:"example-badge mb-2"},ee={class:"opacity-40 tabular-nums"},te=B({__name:"+Page",setup(oe){const a=o(1e3),y=o(80),c=o(100),S=o(100),g=o(5),b=o(5),m=o(!1),f=o(!1),z=v(()=>{const n=y.value;return(e,t)=>t%2===0?n:n*2}),A=v(()=>{const n=S.value;return e=>e===0?n*3:e%2===0?n:Math.ceil(n*1.5)}),C=v(()=>Array.from({length:a.value},(n,e)=>({id:e}))),U=v(()=>{const n=[];for(let e=100;e<a.value;e+=100)n.push(e);return n}),s=o(),T=o(null),P=j("debugMode",o(!1));function D(n){T.value=n}function V(n,e,t){s.value?.scrollToIndex(n,e,t)}function R(n,e){s.value?.scrollToOffset(n,e)}return(n,e)=>(p(),M(N,{code:x(Q)},{title:l(()=>[...e[9]||(e[9]=[r("span",{class:"example-title example-title--group-4"},"Grid Dynamic",-1)])]),description:l(()=>[w(" Simultaneously virtualizes "+d(a.value.toLocaleString())+" rows and "+d(c.value.toLocaleString())+" columns. Uses ",1),e[10]||(e[10]=r("strong",null,"querySelectorAll('[data-col-index]')",-1)),e[11]||(e[11]=w(" to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically. ",-1))]),icon:l(()=>[...e[12]||(e[12]=[r("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-4"},[r("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"})],-1)])]),subtitle:l(()=>[...e[13]||(e[13]=[w(" Bidirectional scrolling with automatic measurement ",-1)])]),controls:l(()=>[h(J,{"scroll-details":T.value,direction:"both","column-range":s.value?.columnRange},null,8,["scroll-details","column-range"]),h(K,{"item-count":a.value,"onUpdate:itemCount":e[0]||(e[0]=t=>a.value=t),"item-size":y.value,"onUpdate:itemSize":e[1]||(e[1]=t=>y.value=t),"column-count":c.value,"onUpdate:columnCount":e[2]||(e[2]=t=>c.value=t),"column-width":S.value,"onUpdate:columnWidth":e[3]||(e[3]=t=>S.value=t),"buffer-before":g.value,"onUpdate:bufferBefore":e[4]||(e[4]=t=>g.value=t),"buffer-after":b.value,"onUpdate:bufferAfter":e[5]||(e[5]=t=>b.value=t),"sticky-header":m.value,"onUpdate:stickyHeader":e[6]||(e[6]=t=>m.value=t),"sticky-footer":f.value,"onUpdate:stickyFooter":e[7]||(e[7]=t=>f.value=t),direction:"both",onScrollToIndex:V,onScrollToOffset:R,onRefresh:e[8]||(e[8]=t=>s.value?.refresh())},null,8,["item-count","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer"])]),default:l(()=>[h(x(q),{ref_key:"virtualScrollRef",ref:s,debug:x(P),class:"example-container",direction:"both",items:C.value,"column-count":c.value,"default-item-size":120,"default-column-width":120,"buffer-before":g.value,"buffer-after":b.value,"sticky-header":m.value,"sticky-footer":f.value,"sticky-indices":U.value,onScroll:D},F({item:l(({index:t,columnRange:i,getColumnWidth:E,isStickyActive:H})=>[(p(),k("div",{key:`r_${t}`,class:$(["example-grid-row",{"example-grid-row--sticky":H}])},[(p(!0),k(O,null,W(i.end-i.start,u=>(p(),k("div",{key:`r_${t}_c_${i.start+u-1}`,"data-col-index":i.start+u-1,class:"example-grid-cell",style:I({inlineSize:`${A.value(i.start+u-1)}px`,blockSize:`${z.value(null,t)}px`})},[r("div",Y,"R"+d(t)+" × C"+d(i.start+u-1),1),r("div",ee,d(E(i.start+u-1))+"px",1)],12,X))),128))],2))]),_:2},[m.value?{name:"header",fn:l(()=>[e[14]||(e[14]=r("div",{class:"example-sticky-header"}," Grid Header ",-1))]),key:"0"}:void 0,f.value?{name:"footer",fn:l(()=>[e[15]||(e[15]=r("div",{class:"example-sticky-footer"}," End of Grid ",-1))]),key:"1"}:void 0]),1032,["debug","items","column-count","buffer-before","buffer-after","sticky-header","sticky-footer","sticky-indices"])]),_:1},8,["code"]))}}),ne=Object.freeze(Object.defineProperty({__proto__:null,default:te},Symbol.toStringTag,{value:"Module"})),ye={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:_}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:G}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:Z}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-grid-dynamic/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ne}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:L}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-grid-dynamic/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Grid Dynamic | Virtual Scroll"}}};export{ye as configValuesSerialized};
