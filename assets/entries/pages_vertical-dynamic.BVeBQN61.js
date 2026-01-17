import{d as C,r as l,h as x,g as A,l as D,w as o,u as p,o as E,q as v,D as R,a as r,y as i,B as P,e as b,i as V,f as I}from"../chunks/chunk-e4V5FOSP.js";import{E as M,V as O,_ as U}from"../chunks/chunk-MYTeg86T.js";import{_ as j}from"../chunks/chunk-Be-ltuh_.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const B=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const baseItemSize = ref(50);
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
      <span class="text-primary font-bold uppercase opacity-60 pe-2 align-baseline">Vertical Dynamic</span>
    </template>

    <template #description>
      Vertical scrolling with variable item heights for {{ itemCount.toLocaleString() }} items. Automatically measures item sizes using <strong>ResizeObserver</strong>. Even items are {{ baseItemSize }}px, odd items are {{ baseItemSize * 2 }}px.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Vertical scrolling with variable item heights
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="baseItemSize"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          v-model:sticky-header="stickyHeader"
          v-model:sticky-footer="stickyFooter"
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
      class="bg-base-100"
      :items="items"
      :default-item-size="75"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="bg-primary text-primary-content p-4 border-b border-primary-focus">
          STICKY HEADER (Measured Padding)
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="flex items-center p-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium" :style="{ blockSize: \`\${ itemSizeFn(null, index) }px\` }">{{ item.text }}</span>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="bg-secondary text-secondary-content p-4 border-t border-secondary-focus">
          STICKY FOOTER (Measured Padding)
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,F={class:"flex flex-wrap gap-2 md:gap-4 items-start"},H={class:"flex items-center p-6 border-b border-base-200 hover:bg-base-300 transition-colors"},$={class:"badge badge-neutral mr-4"},L=C({__name:"+Page",setup(K){const s=l(1e3),a=l(50),c=l(5),m=l(5),d=l(!1),u=l(!1),y=x(()=>{const n=a.value;return(e,t)=>t%2===0?n:n*2}),h=x(()=>Array.from({length:s.value},(n,e)=>({id:e,text:`Dynamic Item ${e} (Height: ${y.value(null,e)}px)`}))),f=l(),S=l(null),z=A("debugMode",l(!1));function k(n){S.value=n}function T(n,e,t){f.value?.scrollToIndex(n,e,t)}function w(n,e){f.value?.scrollToOffset(n,e)}return(n,e)=>(E(),D(M,{code:p(B)},{title:o(()=>[...e[7]||(e[7]=[r("span",{class:"text-primary font-bold uppercase opacity-60 pe-2 align-baseline"},"Vertical Dynamic",-1)])]),description:o(()=>[b(" Vertical scrolling with variable item heights for "+i(s.value.toLocaleString())+" items. Automatically measures item sizes using ",1),e[8]||(e[8]=r("strong",null,"ResizeObserver",-1)),b(". Even items are "+i(a.value)+"px, odd items are "+i(a.value*2)+"px. ",1)]),icon:o(()=>[...e[9]||(e[9]=[r("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg"},[r("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25"})],-1)])]),subtitle:o(()=>[...e[10]||(e[10]=[b(" Vertical scrolling with variable item heights ",-1)])]),controls:o(()=>[r("div",F,[v(U,{"scroll-details":S.value,direction:"vertical"},null,8,["scroll-details"]),v(j,{"item-count":s.value,"onUpdate:itemCount":e[0]||(e[0]=t=>s.value=t),"item-size":a.value,"onUpdate:itemSize":e[1]||(e[1]=t=>a.value=t),"buffer-before":c.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>c.value=t),"buffer-after":m.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>m.value=t),"sticky-header":d.value,"onUpdate:stickyHeader":e[4]||(e[4]=t=>d.value=t),"sticky-footer":u.value,"onUpdate:stickyFooter":e[5]||(e[5]=t=>u.value=t),direction:"vertical",onScrollToIndex:T,onScrollToOffset:w,onRefresh:e[6]||(e[6]=t=>f.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])])]),default:o(()=>[v(p(O),{ref_key:"virtualScrollRef",ref:f,debug:p(z),class:"bg-base-100",items:h.value,"default-item-size":75,"buffer-before":c.value,"buffer-after":m.value,"sticky-header":d.value,"sticky-footer":u.value,onScroll:k},R({item:o(({item:t,index:g})=>[r("div",H,[r("span",$,"#"+i(g),1),r("span",{class:"font-medium",style:P({blockSize:`${y.value(null,g)}px`})},i(t.text),5)])]),_:2},[d.value?{name:"header",fn:o(()=>[e[11]||(e[11]=r("div",{class:"bg-primary text-primary-content p-4 border-b border-primary-focus"}," STICKY HEADER (Measured Padding) ",-1))]),key:"0"}:void 0,u.value?{name:"footer",fn:o(()=>[e[12]||(e[12]=r("div",{class:"bg-secondary text-secondary-content p-4 border-t border-secondary-focus"}," STICKY FOOTER (Measured Padding) ",-1))]),key:"1"}:void 0]),1032,["debug","items","buffer-before","buffer-after","sticky-header","sticky-footer"])]),_:1},8,["code"]))}}),_=Object.freeze(Object.defineProperty({__proto__:null,default:L},Symbol.toStringTag,{value:"Module"})),ee={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:I}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-dynamic/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:_}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:V}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-dynamic/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Dynamic | Virtual Scroll"}}};export{ee as configValuesSerialized};
