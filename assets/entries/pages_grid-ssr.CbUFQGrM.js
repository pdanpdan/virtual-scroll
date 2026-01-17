import{d as j,r as o,E as U,h as B,g as O,l as P,w as l,u as a,o as m,q as x,D as $,c as w,a as n,B as k,F as I,C as W,y as u,e as v,i as F,f as Z}from"../chunks/chunk-e4V5FOSP.js";import{E as G,V as L,_ as N}from"../chunks/chunk-MYTeg86T.js";import{_ as q}from"../chunks/chunk-Be-ltuh_.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const J=`<script setup lang="ts">
import type { Data } from './+data';
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { useData } from 'vike-vue/useData';
import { computed, inject, ref } from 'vue';

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
      <span class="text-info font-bold uppercase opacity-60 pe-2 align-baseline">Grid SSR Support</span>
    </template>

    <template #description>
      Demonstrates the <strong>ssrRange</strong> prop. The grid is configured to start pre-rendered at <strong>Row {{ ssrRange.start }}, Column {{ ssrRange.colStart }}</strong>. On the client, it automatically scrolls to match this range on mount.<br /><br />
      <div class="alert alert-soft alert-info shadow-sm py-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6"
        ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>In a real SSR environment, the content for this range would be present in the initial HTML.</span>
      </div>
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-info text-info-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Pre-rendering and auto-scrolling for Server-Side Rendering
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-4 items-start">
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
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="bg-base-100"
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
        <div class="bg-primary text-primary-content p-4 border-b border-primary-focus">
          GRID HEADER (Row 0 is visible below this)
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth }">
        <div
          :key="\`r_\${ index }\`"
          class="h-full flex items-stretch border-b border-base-200"
        >
          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padStart }px\` }" />

          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="\`r_\${ index }_c_\${ columnRange.start + c - 1 }\`"
            :data-col-index="columnRange.start + c - 1"
            class="flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors"
            :style="{ inlineSize: \`\${ getColumnWidth(columnRange.start + c - 1) }px\` }"
          >
            <div class="text-xs uppercase opacity-40 font-bold mb-1">Row {{ index }}</div>
            <div class="text-xs uppercase opacity-40 font-bold mb-1">Col {{ columnRange.start + c - 1 }}</div>
            <div class="text-xs opacity-40">{{ getColumnWidth(columnRange.start + c - 1) }}px</div>
          </div>

          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padEnd }px\` }" />
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="bg-secondary text-secondary-content p-4 border-t border-secondary-focus font-bold text-center">
          GRID FOOTER (End of grid)
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,K={class:"flex flex-wrap gap-4 items-start"},Q=["data-col-index"],X={class:"text-xs uppercase opacity-40 font-bold mb-1"},Y={class:"text-xs uppercase opacity-40 font-bold mb-1"},_={class:"text-xs opacity-40"},ee=j({__name:"+Page",setup(ne){const R=U(),z=o(R.itemCount),b=o(80),g=o(100),c=o(120),S=o(5),y=o(5),f=o(!1),p=o(!1),A=B(()=>[Math.ceil(c.value*1.5),c.value]),{items:D,ssrRange:h}=R,i=o(),T=o(null),E=O("debugMode",o(!1));function M(s){T.value=s}function V(s,e,t){i.value?.scrollToIndex(s,e,t)}function H(s,e){i.value?.scrollToOffset(s,e)}return(s,e)=>(m(),P(G,{code:a(J)},{title:l(()=>[...e[9]||(e[9]=[n("span",{class:"text-info font-bold uppercase opacity-60 pe-2 align-baseline"},"Grid SSR Support",-1)])]),description:l(()=>[e[10]||(e[10]=v(" Demonstrates the ",-1)),e[11]||(e[11]=n("strong",null,"ssrRange",-1)),e[12]||(e[12]=v(" prop. The grid is configured to start pre-rendered at ",-1)),n("strong",null,"Row "+u(a(h).start)+", Column "+u(a(h).colStart),1),e[13]||(e[13]=v(". On the client, it automatically scrolls to match this range on mount.",-1)),e[14]||(e[14]=n("br",null,null,-1)),e[15]||(e[15]=n("br",null,null,-1)),e[16]||(e[16]=n("div",{class:"alert alert-soft alert-info shadow-sm py-2"},[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",class:"stroke-current shrink-0 w-6 h-6"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round","stroke-width":"2",d:"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"})]),n("span",null,"In a real SSR environment, the content for this range would be present in the initial HTML.")],-1))]),icon:l(()=>[...e[17]||(e[17]=[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-info text-info-content shadow-lg"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"})],-1)])]),subtitle:l(()=>[...e[18]||(e[18]=[v(" Pre-rendering and auto-scrolling for Server-Side Rendering ",-1)])]),controls:l(()=>[n("div",K,[x(N,{"scroll-details":T.value,direction:"both","column-range":i.value?.columnRange},null,8,["scroll-details","column-range"]),x(q,{"item-count":z.value,"onUpdate:itemCount":e[0]||(e[0]=t=>z.value=t),"item-size":b.value,"onUpdate:itemSize":e[1]||(e[1]=t=>b.value=t),"column-count":g.value,"onUpdate:columnCount":e[2]||(e[2]=t=>g.value=t),"column-width":c.value,"onUpdate:columnWidth":e[3]||(e[3]=t=>c.value=t),"buffer-before":S.value,"onUpdate:bufferBefore":e[4]||(e[4]=t=>S.value=t),"buffer-after":y.value,"onUpdate:bufferAfter":e[5]||(e[5]=t=>y.value=t),"sticky-header":f.value,"onUpdate:stickyHeader":e[6]||(e[6]=t=>f.value=t),"sticky-footer":p.value,"onUpdate:stickyFooter":e[7]||(e[7]=t=>p.value=t),direction:"both",onScrollToIndex:V,onScrollToOffset:H,onRefresh:e[8]||(e[8]=t=>i.value?.refresh())},null,8,["item-count","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer"])])]),default:l(()=>[x(a(L),{ref_key:"virtualScrollRef",ref:i,debug:a(E),class:"bg-base-100",direction:"both",items:a(D),"item-size":b.value,"column-count":g.value,"column-width":A.value,"buffer-before":S.value,"buffer-after":y.value,"sticky-header":f.value,"sticky-footer":p.value,"ssr-range":a(h),onScroll:M},$({item:l(({index:t,columnRange:r,getColumnWidth:C})=>[(m(),w("div",{key:`r_${t}`,class:"h-full flex items-stretch border-b border-base-200"},[n("div",{class:"shrink-0",style:k({inlineSize:`${r.padStart}px`})},null,4),(m(!0),w(I,null,W(r.end-r.start,d=>(m(),w("div",{key:`r_${t}_c_${r.start+d-1}`,"data-col-index":r.start+d-1,class:"flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors",style:k({inlineSize:`${C(r.start+d-1)}px`})},[n("div",X,"Row "+u(t),1),n("div",Y,"Col "+u(r.start+d-1),1),n("div",_,u(C(r.start+d-1))+"px",1)],12,Q))),128)),n("div",{class:"shrink-0",style:k({inlineSize:`${r.padEnd}px`})},null,4)]))]),_:2},[f.value?{name:"header",fn:l(()=>[e[19]||(e[19]=n("div",{class:"bg-primary text-primary-content p-4 border-b border-primary-focus"}," GRID HEADER (Row 0 is visible below this) ",-1))]),key:"0"}:void 0,p.value?{name:"footer",fn:l(()=>[e[20]||(e[20]=n("div",{class:"bg-secondary text-secondary-content p-4 border-t border-secondary-focus font-bold text-center"}," GRID FOOTER (End of grid) ",-1))]),key:"1"}:void 0]),1032,["debug","items","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer","ssr-range"])]),_:1},8,["code"]))}}),te=Object.freeze(Object.defineProperty({__proto__:null,default:ee},Symbol.toStringTag,{value:"Module"})),fe={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:{server:!0}}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:Z}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/grid-ssr/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:te}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:F}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/grid-ssr/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Grid SSR | Virtual Scroll"}}};export{fe as configValuesSerialized};
