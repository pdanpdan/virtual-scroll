import{d as T,r,h as z,g as C,l as A,w as o,u as m,o as D,q as v,D as R,a as n,y as u,e as y,i as E,f as P}from"../chunks/chunk-e4V5FOSP.js";import{E as M,V as O,_ as U}from"../chunks/chunk-MYTeg86T.js";import{_ as V}from"../chunks/chunk-Be-ltuh_.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const j=`<script setup lang="ts">
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
      <span class="text-primary font-bold uppercase opacity-60 pe-2 align-baseline">Vertical Fixed</span>
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
        class="size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Standard vertical scrolling with uniform item heights
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
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
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="bg-base-100"
      :items="items"
      :item-size="itemSize"
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
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.text }}</span>
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
`,I={class:"flex flex-wrap gap-2 md:gap-4 items-start"},B={class:"h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors"},F={class:"badge badge-neutral mr-4"},H={class:"font-medium"},_=T({__name:"+Page",setup($){const a=r(1e3),i=r(50),c=r(5),p=r(5),s=r(!1),d=r(!1),S=z(()=>Array.from({length:a.value},(l,e)=>({id:e,text:`Fixed Item ${e}`}))),f=r(),b=r(null),g=C("debugMode",r(!1));function h(l){b.value=l}function x(l,e,t){f.value?.scrollToIndex(l,e,t)}function w(l,e){f.value?.scrollToOffset(l,e)}return(l,e)=>(D(),A(M,{code:m(j)},{title:o(()=>[...e[7]||(e[7]=[n("span",{class:"text-primary font-bold uppercase opacity-60 pe-2 align-baseline"},"Vertical Fixed",-1)])]),description:o(()=>[y(" Optimized for "+u(a.value.toLocaleString())+" items where every item has the same height. Items are only rendered when they enter the visible viewport. Row height is fixed at "+u(i.value)+"px. ",1)]),icon:o(()=>[...e[8]||(e[8]=[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25"})],-1)])]),subtitle:o(()=>[...e[9]||(e[9]=[y(" Standard vertical scrolling with uniform item heights ",-1)])]),controls:o(()=>[n("div",I,[v(U,{"scroll-details":b.value,direction:"vertical"},null,8,["scroll-details"]),v(V,{"item-count":a.value,"onUpdate:itemCount":e[0]||(e[0]=t=>a.value=t),"item-size":i.value,"onUpdate:itemSize":e[1]||(e[1]=t=>i.value=t),"buffer-before":c.value,"onUpdate:bufferBefore":e[2]||(e[2]=t=>c.value=t),"buffer-after":p.value,"onUpdate:bufferAfter":e[3]||(e[3]=t=>p.value=t),"sticky-header":s.value,"onUpdate:stickyHeader":e[4]||(e[4]=t=>s.value=t),"sticky-footer":d.value,"onUpdate:stickyFooter":e[5]||(e[5]=t=>d.value=t),direction:"vertical",onScrollToIndex:x,onScrollToOffset:w,onRefresh:e[6]||(e[6]=t=>f.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])])]),default:o(()=>[v(m(O),{ref_key:"virtualScrollRef",ref:f,debug:m(g),class:"bg-base-100",items:S.value,"item-size":i.value,"buffer-before":c.value,"buffer-after":p.value,"sticky-header":s.value,"sticky-footer":d.value,onScroll:h},R({item:o(({item:t,index:k})=>[n("div",B,[n("span",F,"#"+u(k),1),n("span",H,u(t.text),1)])]),_:2},[s.value?{name:"header",fn:o(()=>[e[10]||(e[10]=n("div",{class:"bg-primary text-primary-content p-4 border-b border-primary-focus"}," STICKY HEADER (Measured Padding) ",-1))]),key:"0"}:void 0,d.value?{name:"footer",fn:o(()=>[e[11]||(e[11]=n("div",{class:"bg-secondary text-secondary-content p-4 border-t border-secondary-focus"}," STICKY FOOTER (Measured Padding) ",-1))]),key:"1"}:void 0]),1032,["debug","items","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])]),_:1},8,["code"]))}}),L=Object.freeze(Object.defineProperty({__proto__:null,default:_},Symbol.toStringTag,{value:"Module"})),Z={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:P}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-fixed/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:L}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:E}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-fixed/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Fixed | Virtual Scroll"}}};export{Z as configValuesSerialized};
