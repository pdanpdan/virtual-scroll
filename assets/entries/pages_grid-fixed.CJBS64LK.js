import{d as B,r as o,h as C,g as H,l as P,w as r,u as x,o as b,q as h,D as j,c as k,a as n,B as w,F as M,C as O,y as a,e as y,i as $,f as F}from"../chunks/chunk-e4V5FOSP.js";import{E as W,V as I,_}from"../chunks/chunk-MYTeg86T.js";import{_ as L}from"../chunks/chunk-Be-ltuh_.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const Z=`<script setup lang="ts">
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

const columnWidths = computed(() => [ Math.ceil(columnWidth.value * 1.5), columnWidth.value ]);

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
      <span class="text-info font-bold uppercase opacity-60 pe-2 align-baseline">Grid Fixed</span>
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
        class="size-12 p-2 rounded-xl bg-info text-info-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Bidirectional scrolling with uniform dimensions
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
`,G={class:"flex flex-wrap gap-4 items-start"},N=["data-col-index"],q={class:"text-xs uppercase opacity-40 font-bold mb-1"},J={class:"text-xs uppercase opacity-40 font-bold mb-1"},K={class:"text-xs opacity-40"},Q=B({__name:"+Page",setup(Y){const u=o(1e3),c=o(80),f=o(100),m=o(100),S=o(5),g=o(5),p=o(!1),v=o(!1),T=C(()=>[Math.ceil(m.value*1.5),m.value]),R=C(()=>Array.from({length:u.value},(i,e)=>({id:e}))),s=o(),z=o(null),D=H("debugMode",o(!1));function E(i){z.value=i}function U(i,e,t){s.value?.scrollToIndex(i,e,t)}function V(i,e){s.value?.scrollToOffset(i,e)}return(i,e)=>(b(),P(W,{code:x(Z)},{title:r(()=>[...e[9]||(e[9]=[n("span",{class:"text-info font-bold uppercase opacity-60 pe-2 align-baseline"},"Grid Fixed",-1)])]),description:r(()=>[y(" Simultaneously virtualizes "+a(u.value.toLocaleString())+" rows and "+a(f.value.toLocaleString())+" columns. Uses fixed ",1),e[10]||(e[10]=n("strong",null,"itemSize",-1)),y(" ("+a(c.value)+"px) and alternating ",1),e[11]||(e[11]=n("strong",null,"columnWidth",-1)),e[12]||(e[12]=y(" values. Panning in any direction maintains high performance. ",-1))]),icon:r(()=>[...e[13]||(e[13]=[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-info text-info-content shadow-lg"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"})],-1)])]),subtitle:r(()=>[...e[14]||(e[14]=[y(" Bidirectional scrolling with uniform dimensions ",-1)])]),controls:r(()=>[n("div",G,[h(_,{"scroll-details":z.value,direction:"both","column-range":s.value?.columnRange},null,8,["scroll-details","column-range"]),h(L,{"item-count":u.value,"onUpdate:itemCount":e[0]||(e[0]=t=>u.value=t),"item-size":c.value,"onUpdate:itemSize":e[1]||(e[1]=t=>c.value=t),"column-count":f.value,"onUpdate:columnCount":e[2]||(e[2]=t=>f.value=t),"column-width":m.value,"onUpdate:columnWidth":e[3]||(e[3]=t=>m.value=t),"buffer-before":S.value,"onUpdate:bufferBefore":e[4]||(e[4]=t=>S.value=t),"buffer-after":g.value,"onUpdate:bufferAfter":e[5]||(e[5]=t=>g.value=t),"sticky-header":p.value,"onUpdate:stickyHeader":e[6]||(e[6]=t=>p.value=t),"sticky-footer":v.value,"onUpdate:stickyFooter":e[7]||(e[7]=t=>v.value=t),direction:"both",onScrollToIndex:U,onScrollToOffset:V,onRefresh:e[8]||(e[8]=t=>s.value?.refresh())},null,8,["item-count","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer"])])]),default:r(()=>[h(x(I),{ref_key:"virtualScrollRef",ref:s,debug:x(D),class:"bg-base-100",direction:"both",items:R.value,"item-size":c.value,"column-count":f.value,"column-width":T.value,"buffer-before":S.value,"buffer-after":g.value,"sticky-header":p.value,"sticky-footer":v.value,onScroll:E},j({item:r(({index:t,columnRange:l,getColumnWidth:A})=>[(b(),k("div",{key:`r_${t}`,class:"h-full flex items-stretch border-b border-base-200"},[n("div",{class:"shrink-0",style:w({inlineSize:`${l.padStart}px`})},null,4),(b(!0),k(M,null,O(l.end-l.start,d=>(b(),k("div",{key:`r_${t}_c_${l.start+d-1}`,"data-col-index":l.start+d-1,class:"flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors",style:w({inlineSize:`${A(l.start+d-1)}px`})},[n("div",q,"Row "+a(t),1),n("div",J,"Col "+a(l.start+d-1),1),n("div",K,a(A(l.start+d-1))+"px",1)],12,N))),128)),n("div",{class:"shrink-0",style:w({inlineSize:`${l.padEnd}px`})},null,4)]))]),_:2},[p.value?{name:"header",fn:r(()=>[e[15]||(e[15]=n("div",{class:"bg-primary text-primary-content p-4 border-b border-primary-focus"}," GRID HEADER (Row 0 is visible below this) ",-1))]),key:"0"}:void 0,v.value?{name:"footer",fn:r(()=>[e[16]||(e[16]=n("div",{class:"bg-secondary text-secondary-content p-4 border-t border-secondary-focus font-bold text-center"}," GRID FOOTER (End of grid) ",-1))]),key:"1"}:void 0]),1032,["debug","items","item-size","column-count","column-width","buffer-before","buffer-after","sticky-header","sticky-footer"])]),_:1},8,["code"]))}}),X=Object.freeze(Object.defineProperty({__proto__:null,default:Q},Symbol.toStringTag,{value:"Module"})),de={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:F}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/grid-fixed/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:X}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:$}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/grid-fixed/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Grid Fixed | Virtual Scroll"}}};export{de as configValuesSerialized};
