import{d as T,x as A,l as z,w as o,u as p,p as n,m as C,o as V,b as m,a as t,t as a,j as x,v as P,i as D,f as B,g as E,h as U}from"../chunks/chunk-BzgwLqVJ.js";import{V as j}from"../chunks/chunk-Dk5GrEJI.js";import{_,a as R}from"../chunks/chunk-XCFXGF1G.js";import{_ as k}from"../chunks/chunk-BhdRxmQ8.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const I=`<script setup lang="ts">
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
      <span class="example-title example-title--group-2">Vertical Fixed Body</span>
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
        class="example-icon example-icon--group-2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with uniform item heights
    </template>

    <template #controls>
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
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #header>
        <div class="example-body-header">
          <h2>Scrollable Header</h2>
          <p>This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-8">#{{ index }}</span>
          <div>
            <div class="font-bold">Item {{ index }}</div>
            <div class="text-xs opacity-60">{{ item.text }}</div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="example-body-footer">
          <h2>Page Footer</h2>
          <p>End of the {{ itemCount.toLocaleString() }} fixed items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,M={class:"example-vertical-item example-vertical-item--fixed"},O={class:"example-badge me-8"},H={class:"font-bold"},L={class:"text-xs opacity-60"},F={class:"example-body-footer"},$=T({__name:"+Page",setup(W){const c=n(null);A(()=>{c.value=window});const r=n(1e3),s=n(90),u=n(5),f=n(5),h=P(()=>Array.from({length:r.value},(i,e)=>({id:e,text:`Body Scroll Fixed Item ${e}`}))),d=n(),v=n(null),g=C("debugMode",n(!1));function b(i){v.value=i}function w(i,e,l){d.value?.scrollToIndex(i,e,l)}function y(i,e){d.value?.scrollToOffset(i,e)}return(i,e)=>(V(),z(_,{height:"auto",code:p(I)},{title:o(()=>[...e[5]||(e[5]=[t("span",{class:"example-title example-title--group-2"},"Vertical Fixed Body",-1)])]),description:o(()=>[x(" This example uses the main browser window for scrolling "+a(r.value.toLocaleString())+" items instead of a nested container. Item height is fixed at "+a(s.value)+"px. ",1)]),icon:o(()=>[...e[6]||(e[6]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-2"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"})],-1)])]),subtitle:o(()=>[...e[7]||(e[7]=[x(" Native window scrolling with uniform item heights ",-1)])]),controls:o(()=>[m(R,{"scroll-details":v.value,direction:"vertical"},null,8,["scroll-details"]),m(k,{"item-count":r.value,"onUpdate:itemCount":e[0]||(e[0]=l=>r.value=l),"item-size":s.value,"onUpdate:itemSize":e[1]||(e[1]=l=>s.value=l),"buffer-before":u.value,"onUpdate:bufferBefore":e[2]||(e[2]=l=>u.value=l),"buffer-after":f.value,"onUpdate:bufferAfter":e[3]||(e[3]=l=>f.value=l),direction:"vertical",onScrollToIndex:w,onScrollToOffset:y,onRefresh:e[4]||(e[4]=l=>d.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after"])]),default:o(()=>[m(p(j),{ref_key:"virtualScrollRef",ref:d,debug:p(g),class:"example-container",items:h.value,"item-size":s.value,container:c.value,"buffer-before":u.value,"buffer-after":f.value,onScroll:b},{header:o(()=>[...e[8]||(e[8]=[t("div",{class:"example-body-header"},[t("h2",null,"Scrollable Header"),t("p",null,"This header and fixed height items scroll with the page")],-1)])]),item:o(({item:l,index:S})=>[t("div",M,[t("span",O,"#"+a(S),1),t("div",null,[t("div",H,"Item "+a(S),1),t("div",L,a(l.text),1)])])]),footer:o(()=>[t("div",F,[e[9]||(e[9]=t("h2",null,"Page Footer",-1)),t("p",null,"End of the "+a(r.value.toLocaleString())+" fixed items list",1)])]),_:1},8,["debug","items","item-size","container","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),N=Object.freeze(Object.defineProperty({__proto__:null,default:$},Symbol.toStringTag,{value:"Module"})),ne={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:U}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:E}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:B}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-vertical-fixed-body/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:N}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:D}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/essential-vertical-fixed-body/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Fixed Body | Virtual Scroll"}}};export{ne as configValuesSerialized};
