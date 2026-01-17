import{d as T,r as l,j as A,h as z,g as C,l as E,w as o,u as c,o as V,q as p,a as t,y as i,e as x,i as R,f as B}from"../chunks/chunk-e4V5FOSP.js";import{E as D,V as _,_ as O}from"../chunks/chunk-MYTeg86T.js";import{_ as P}from"../chunks/chunk-Be-ltuh_.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const k=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onMounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const scrollContainer = ref<Window | null>(null);

onMounted(() => {
  scrollContainer.value = window;
});

const itemCount = ref(1000);
const itemSize = ref(90);
const bufferBefore = ref(5);
const bufferAfter = ref(5);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`Body Scroll Fixed Item \${ i }\`,
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
  <ExampleContainer height="auto" :code="rawCode">
    <template #title>
      <span class="text-success font-bold uppercase opacity-60 pe-2 align-baseline">Vertical Fixed Body</span>
    </template>

    <template #description>
      This example uses the main browser window for scrolling {{ itemCount.toLocaleString() }} items instead of a nested container. Item height is fixed at {{ itemSize }}px.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-success text-success-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with uniform item heights
    </template>

    <template #controls>
      <div class="sticky top-0 z-100 flex flex-wrap gap-2 md:gap-4 items-start pointer-events-none">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="itemSize"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
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
      class="bg-base-100 border border-base-300 rounded-box overflow-hidden"
      :items="items"
      :item-size="itemSize"
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #header>
        <div class="bg-neutral text-neutral-content p-12 text-center rounded-t-box">
          <h2 class="text-3xl font-bold mb-2 uppercase">SCROLLABLE HEADER</h2>
          <p class="opacity-80">This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <div>
            <div class="font-bold">Item {{ index }}</div>
            <div class="text-sm opacity-50">{{ item.text }}</div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="bg-neutral text-neutral-content p-12 text-center rounded-b-box">
          <h2 class="text-2xl font-bold uppercase">PAGE FOOTER</h2>
          <p class="opacity-60 text-sm mt-2">End of the {{ itemCount }} fixed items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,j={class:"sticky top-0 z-100 flex flex-wrap gap-2 md:gap-4 items-start pointer-events-none"},U={class:"h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors"},L={class:"badge badge-neutral mr-4"},I={class:"font-bold"},M={class:"text-sm opacity-50"},H={class:"bg-neutral text-neutral-content p-12 text-center rounded-b-box"},F={class:"opacity-60 text-sm mt-2"},N=T({__name:"+Page",setup(G){const m=l(null);A(()=>{m.value=window});const a=l(1e3),s=l(90),u=l(5),f=l(5),h=z(()=>Array.from({length:a.value},(r,e)=>({id:e,text:`Body Scroll Fixed Item ${e}`}))),d=l(),v=l(null),g=C("debugMode",l(!1));function S(r){v.value=r}function w(r,e,n){d.value?.scrollToIndex(r,e,n)}function y(r,e){d.value?.scrollToOffset(r,e)}return(r,e)=>(V(),E(D,{height:"auto",code:c(k)},{title:o(()=>[...e[5]||(e[5]=[t("span",{class:"text-success font-bold uppercase opacity-60 pe-2 align-baseline"},"Vertical Fixed Body",-1)])]),description:o(()=>[x(" This example uses the main browser window for scrolling "+i(a.value.toLocaleString())+" items instead of a nested container. Item height is fixed at "+i(s.value)+"px. ",1)]),icon:o(()=>[...e[6]||(e[6]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-success text-success-content shadow-lg"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"})],-1)])]),subtitle:o(()=>[...e[7]||(e[7]=[x(" Native window scrolling with uniform item heights ",-1)])]),controls:o(()=>[t("div",j,[p(O,{"scroll-details":v.value,direction:"vertical"},null,8,["scroll-details"]),p(P,{"item-count":a.value,"onUpdate:itemCount":e[0]||(e[0]=n=>a.value=n),"item-size":s.value,"onUpdate:itemSize":e[1]||(e[1]=n=>s.value=n),"buffer-before":u.value,"onUpdate:bufferBefore":e[2]||(e[2]=n=>u.value=n),"buffer-after":f.value,"onUpdate:bufferAfter":e[3]||(e[3]=n=>f.value=n),direction:"vertical",onScrollToIndex:w,onScrollToOffset:y,onRefresh:e[4]||(e[4]=n=>d.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after"])])]),default:o(()=>[p(c(_),{ref_key:"virtualScrollRef",ref:d,debug:c(g),class:"bg-base-100 border border-base-300 rounded-box overflow-hidden",items:h.value,"item-size":s.value,container:m.value,"buffer-before":u.value,"buffer-after":f.value,onScroll:S},{header:o(()=>[...e[8]||(e[8]=[t("div",{class:"bg-neutral text-neutral-content p-12 text-center rounded-t-box"},[t("h2",{class:"text-3xl font-bold mb-2 uppercase"},"SCROLLABLE HEADER"),t("p",{class:"opacity-80"},"This header and fixed height items scroll with the page")],-1)])]),item:o(({item:n,index:b})=>[t("div",U,[t("span",L,"#"+i(b),1),t("div",null,[t("div",I,"Item "+i(b),1),t("div",M,i(n.text),1)])])]),footer:o(()=>[t("div",H,[e[9]||(e[9]=t("h2",{class:"text-2xl font-bold uppercase"},"PAGE FOOTER",-1)),t("p",F,"End of the "+i(a.value)+" fixed items list",1)])]),_:1},8,["debug","items","item-size","container","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),$=Object.freeze(Object.defineProperty({__proto__:null,default:N},Symbol.toStringTag,{value:"Module"})),te={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:B}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-fixed-body/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:$}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:R}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-fixed-body/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Fixed Body | Virtual Scroll"}}};export{te as configValuesSerialized};
