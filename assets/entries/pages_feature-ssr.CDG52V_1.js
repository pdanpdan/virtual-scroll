import{d as E,p as o,E as M,l as V,w as l,u as i,G as B,m as H,o as p,b as w,q as O,c as T,F as $,r as W,s as F,a as n,t as d,j as v,v as I,i as L,f as G,g as Z,h as N}from"../chunks/chunk-BzgwLqVJ.js";import{V as q}from"../chunks/chunk-Dk5GrEJI.js";import{_ as J,a as K}from"../chunks/chunk-XCFXGF1G.js";import{_ as Q}from"../chunks/chunk-BhdRxmQ8.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const X=`<script setup lang="ts">
import type { Data } from './+data';
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { useData } from 'vike-vue/useData';
import { computed, inject, ref, watch } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const data = useData<Data>();

const itemCount = ref(data.itemCount);
const itemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(120);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

const columnWidths = computed(() => [ Math.ceil(columnWidth.value * 1.5), columnWidth.value ]);

// SSR Range: from data (simulates state from a store)
const { items, ssrRange } = data;

watch(itemCount, (count) => {
  items.length = 0;
  for (let i = 0; i < count; i += 1) {
    items[ i ] = {
      id: i,
    };
  }
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
      <span class="example-title example-title--group-4">SSR Support</span>
    </template>

    <template #description>
      Demonstrates the <strong>ssrRange</strong> prop. The grid is configured to start pre-rendered at <strong>Row {{ ssrRange.start }}, Column {{ ssrRange.colStart }}</strong>. On the client, it automatically scrolls to match this range on mount.<br /><br />
      <div class="alert alert-info alert-soft">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 size-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs md:text-sm font-medium">In a real SSR environment, the content for this range would be present in the initial HTML.</span>
      </div>
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.5a2.25 2.25 0 0 0-2.25-2.25Z" />
        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15.75h9m-9-3h9m-9-3h3.75" />
        <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 2.625 3 3L12 15l-3 1 1-3 9.375-10.375Z" />
      </svg>
    </template>

    <template #subtitle>
      Pre-rendering and auto-scrolling for Server-Side Rendering
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
      :ssr-range="ssrRange"
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
`,Y=["data-col-index"],_={class:"example-badge mb-2"},ee={class:"opacity-40 tabular-nums"},te=E({__name:"+Page",setup(oe){const z=B(),g=o(z.itemCount),S=o(80),h=o(100),m=o(120),y=o(5),x=o(5),f=o(!1),c=o(!1),D=I(()=>[Math.ceil(m.value*1.5),m.value]),{items:b,ssrRange:k}=z;M(g,r=>{b.length=0;for(let e=0;e<r;e+=1)b[e]={id:e}});const s=o(),R=o(null),P=H("debugMode",o(!1));function A(r){R.value=r}function U(r,e,t){s.value?.scrollToIndex(r,e,t)}function j(r,e){s.value?.scrollToOffset(r,e)}return(r,e)=>(p(),V(J,{code:i(X)},{title:l(()=>[...e[9]||(e[9]=[n("span",{class:"example-title example-title--group-4"},"SSR Support",-1)])]),description:l(()=>[e[10]||(e[10]=v(" Demonstrates the ",-1)),e[11]||(e[11]=n("strong",null,"ssrRange",-1)),e[12]||(e[12]=v(" prop. The grid is configured to start pre-rendered at ",-1)),n("strong",null,"Row "+d(i(k).start)+", Column "+d(i(k).colStart),1),e[13]||(e[13]=v(". On the client, it automatically scrolls to match this range on mount.",-1)),e[14]||(e[14]=n("br",null,null,-1)),e[15]||(e[15]=n("br",null,null,-1)),e[16]||(e[16]=n("div",{class:"alert alert-info alert-soft"},[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",class:"stroke-current shrink-0 size-5"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})]),n("span",{class:"text-xs md:text-sm font-medium"},"In a real SSR environment, the content for this range would be present in the initial HTML.")],-1))]),icon:l(()=>[...e[17]||(e[17]=[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-4"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M16.5 2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v13.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.5a2.25 2.25 0 0 0-2.25-2.25Z"}),n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M7.5 15.75h9m-9-3h9m-9-3h3.75"}),n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"m18.375 2.625 3 3L12 15l-3 1 1-3 9.375-10.375Z"})],-1)])]),subtitle:l(()=>[...e[18]||(e[18]=[v(" Pre-rendering and auto-scrolling for Server-Side Rendering ",-1)])]),controls:l(()=>[w(K,{"scroll-details":R.value,direction:"both","column-range":s.value?.columnRange},null,8,["scroll-details","column-range"]),w(Q,{"item-count":g.value,"onUpdate:itemCount":e[0]||(e[0]=t=>g.value=t),"item-size":S.value,"onUpdate:itemSize":e[1]||(e[1]=t=>S.value=t),"column-count":h.value,"onUpdate:columnCount":e[2]||(e[2]=t=>h.value=t),"column-width":m.value,"onUpdate:columnWidth":e[3]||(e[3]=t=>m.value=t),"buffer-before":y.value,"onUpdate:bufferBefore":e[4]||(e[4]=t=>y.value=t),"buffer-after":x.value,"onUpdate:bufferAfter":e[5]||(e[5]=t=>x.value=t),"sticky-header":f.value,"onUpdate:stickyHeader":e[6]||(e[6]=t=>f.value=t),"sticky-footer":c.value,"onUpdate:stickyFooter":e[7]||(e[7]=t=>c.value=t),direction:"both",onScrollToIndex:U,onScrollToOffset:j,onRefresh:e[8]||(e[8]=t=>s.value?.refresh())},null,8,["item-count","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer"])]),default:l(()=>[w(i(q),{ref_key:"virtualScrollRef",ref:s,debug:i(P),class:"example-container",direction:"both",items:i(b),"item-size":S.value,"column-count":h.value,"column-width":D.value,"buffer-before":y.value,"buffer-after":x.value,"sticky-header":f.value,"sticky-footer":c.value,"ssr-range":i(k),onScroll:A},O({item:l(({index:t,columnRange:a,getColumnWidth:C})=>[(p(),T("div",{key:`r_${t}`,class:"example-grid-row"},[(p(!0),T($,null,W(a.end-a.start,u=>(p(),T("div",{key:`r_${t}_c_${a.start+u-1}`,"data-col-index":a.start+u-1,class:"example-grid-cell",style:F({inlineSize:`${C(a.start+u-1)}px`})},[n("div",_,"R"+d(t)+" × C"+d(a.start+u-1),1),n("div",ee,d(C(a.start+u-1))+"px",1)],12,Y))),128))]))]),_:2},[f.value?{name:"header",fn:l(()=>[e[19]||(e[19]=n("div",{class:"example-sticky-header"}," Grid Header ",-1))]),key:"0"}:void 0,c.value?{name:"footer",fn:l(()=>[e[20]||(e[20]=n("div",{class:"example-sticky-footer"}," End of Grid ",-1))]),key:"1"}:void 0]),1032,["debug","items","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer","ssr-range"])]),_:1},8,["code"]))}}),ne=Object.freeze(Object.defineProperty({__proto__:null,default:te},Symbol.toStringTag,{value:"Module"})),ge={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:{server:!0}}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:N}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:Z}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:G}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-ssr/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ne}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:L}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-ssr/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"SSR Support | Virtual Scroll"}}};export{ge as configValuesSerialized};
