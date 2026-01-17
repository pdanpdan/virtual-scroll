import{d as $,r as l,h as f,g as j,l as F,w as i,u as g,o as m,q as h,A as M,c as k,B as p,x as P,a as o,F as O,C as _,y as w,e as z,i as W,f as Z}from"../chunks/chunk-BtXCRXom.js";import{E as G,V as L,_ as q}from"../chunks/chunk-BigYq7j-.js";import{_ as N}from"../chunks/chunk-BCHXlBb1.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const J=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const baseItemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
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
      <span class="text-info font-bold uppercase opacity-60 pe-2 align-baseline">Grid Dynamic</span>
    </template>

    <template #description>
      Simultaneously virtualizes rows and columns. Uses <strong>querySelectorAll('[data-col-index]')</strong> to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically.
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
      Bidirectional scrolling with automatic measurement
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
          v-model:item-size="baseItemSize"
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
        <div class="bg-primary text-primary-content p-4 border-b border-primary-focus">
          GRID HEADER (Row 0 is visible below this)
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth, isSticky }">
        <div
          :key="\`r_\${ index }\`"
          class="h-full flex items-stretch border-b border-base-200"
          :class="isSticky ? 'bg-base-200' : ''"
          :style="{
            blockSize: \`\${ itemSizeFn(null, index) }px\`,
          }"
        >
          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padStart }px\` }" />

          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="\`r_\${ index }_c_\${ columnRange.start + c - 1 }\`"
            :data-col-index="columnRange.start + c - 1"
            class="flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors"
            :style="{ inlineSize: \`\${ columnWidthFn(columnRange.start + c - 1) }px\` }"
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
`,K={class:"flex flex-wrap gap-4 items-start"},Q=["data-col-index"],X={class:"text-xs uppercase opacity-40 font-bold mb-1"},Y={class:"text-xs uppercase opacity-40 font-bold mb-1"},ee={class:"text-xs opacity-40"},te=$({__name:"+Page",setup(oe){const u=l(1e3),v=l(80),b=l(100),y=l(100),S=l(5),x=l(5),d=l(!1),c=l(!1),C=f(()=>{const n=v.value;return(e,t)=>t%2===0?n:n*2}),T=f(()=>{const n=y.value;return e=>e===0?n*3:e%2===0?n:Math.ceil(n*1.5)}),R=f(()=>Array.from({length:u.value},(n,e)=>({id:e}))),D=f(()=>{const n=[];for(let e=100;e<u.value;e+=100)n.push(e);return n}),a=l(),A=l(null),E=j("debugMode",l(!1));function U(n){A.value=n}function V(n,e,t){a.value?.scrollToIndex(n,e,t)}function B(n,e){a.value?.scrollToOffset(n,e)}return(n,e)=>(m(),F(G,{code:g(J)},{title:i(()=>[...e[9]||(e[9]=[o("span",{class:"text-info font-bold uppercase opacity-60 pe-2 align-baseline"},"Grid Dynamic",-1)])]),description:i(()=>[...e[10]||(e[10]=[z(" Simultaneously virtualizes rows and columns. Uses ",-1),o("strong",null,"querySelectorAll('[data-col-index]')",-1),z(" to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically. ",-1)])]),icon:i(()=>[...e[11]||(e[11]=[o("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-info text-info-content shadow-lg"},[o("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"})],-1)])]),subtitle:i(()=>[...e[12]||(e[12]=[z(" Bidirectional scrolling with automatic measurement ",-1)])]),controls:i(()=>[o("div",K,[h(q,{"scroll-details":A.value,direction:"both","column-range":a.value?.columnRange},null,8,["scroll-details","column-range"]),h(N,{"item-count":u.value,"onUpdate:itemCount":e[0]||(e[0]=t=>u.value=t),"item-size":v.value,"onUpdate:itemSize":e[1]||(e[1]=t=>v.value=t),"column-count":b.value,"onUpdate:columnCount":e[2]||(e[2]=t=>b.value=t),"column-width":y.value,"onUpdate:columnWidth":e[3]||(e[3]=t=>y.value=t),"buffer-before":S.value,"onUpdate:bufferBefore":e[4]||(e[4]=t=>S.value=t),"buffer-after":x.value,"onUpdate:bufferAfter":e[5]||(e[5]=t=>x.value=t),"sticky-header":d.value,"onUpdate:stickyHeader":e[6]||(e[6]=t=>d.value=t),"sticky-footer":c.value,"onUpdate:stickyFooter":e[7]||(e[7]=t=>c.value=t),direction:"both",onScrollToIndex:V,onScrollToOffset:B,onRefresh:e[8]||(e[8]=t=>a.value?.refresh())},null,8,["item-count","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer"])])]),default:i(()=>[h(g(L),{ref_key:"virtualScrollRef",ref:a,debug:g(E),class:"bg-base-100",direction:"both",items:R.value,"column-count":b.value,"default-item-size":120,"default-column-width":120,"buffer-before":S.value,"buffer-after":x.value,"sticky-header":d.value,"sticky-footer":c.value,"sticky-indices":D.value,onScroll:U},M({item:i(({index:t,columnRange:r,getColumnWidth:H,isSticky:I})=>[(m(),k("div",{key:`r_${t}`,class:P(["h-full flex items-stretch border-b border-base-200",I?"bg-base-200":""]),style:p({blockSize:`${C.value(null,t)}px`})},[o("div",{class:"shrink-0",style:p({inlineSize:`${r.padStart}px`})},null,4),(m(!0),k(O,null,_(r.end-r.start,s=>(m(),k("div",{key:`r_${t}_c_${r.start+s-1}`,"data-col-index":r.start+s-1,class:"flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors",style:p({inlineSize:`${T.value(r.start+s-1)}px`})},[o("div",X,"Row "+w(t),1),o("div",Y,"Col "+w(r.start+s-1),1),o("div",ee,w(H(r.start+s-1))+"px",1)],12,Q))),128)),o("div",{class:"shrink-0",style:p({inlineSize:`${r.padEnd}px`})},null,4)],6))]),_:2},[d.value?{name:"header",fn:i(()=>[e[13]||(e[13]=o("div",{class:"bg-primary text-primary-content p-4 border-b border-primary-focus"}," GRID HEADER (Row 0 is visible below this) ",-1))]),key:"0"}:void 0,c.value?{name:"footer",fn:i(()=>[e[14]||(e[14]=o("div",{class:"bg-secondary text-secondary-content p-4 border-t border-secondary-focus font-bold text-center"}," GRID FOOTER (End of grid) ",-1))]),key:"1"}:void 0]),1032,["debug","items","column-count","buffer-before","buffer-after","sticky-header","sticky-footer","sticky-indices"])]),_:1},8,["code"]))}}),ne=Object.freeze(Object.defineProperty({__proto__:null,default:te},Symbol.toStringTag,{value:"Module"})),me={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:Z}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/grid-dynamic/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ne}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:W}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/grid-dynamic/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Grid Dynamic | Virtual Scroll"}}};export{me as configValuesSerialized};
