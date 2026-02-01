import{d as y,p as s,l as h,w as a,u as m,m as S,o as w,b as g,a as t,t as u,z as T,A as P,j as d,i as z,f as A,g as C,h as D}from"../chunks/chunk-BzgwLqVJ.js";import{V as k}from"../chunks/chunk-Dk5GrEJI.js";import{_ as M,a as j}from"../chunks/chunk-XCFXGF1G.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const E=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: i, label: \`Initial Item \${ i }\` })));
const loading = ref(false);
const autoLoad = ref(true);
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

async function loadMore() {
  if (loading.value) {
    return;
  }

  loading.value = true;
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const start = items.value.length;
  const newItems = Array.from({ length: 20 }, (_, i) => ({
    id: start + i,
    label: \`Loaded Item \${ start + i }\`,
  }));

  items.value = [ ...items.value, ...newItems ];
  loading.value = false;
}

async function onLoad(direction: 'vertical' | 'horizontal') {
  if (autoLoad.value && direction === 'vertical') {
    await loadMore();
  }
}

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-1">Infinite Scroll</span>
    </template>

    <template #description>
      Demonstrates the <strong>load</strong> event and <strong>loading</strong> prop/slot. Currently showing {{ items.length.toLocaleString() }} items. When you reach the end of the list, more items are automatically fetched and appended.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </template>

    <template #subtitle>
      Automatic pagination with loading indicators
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Auto-loading</span>
          <input v-model="autoLoad" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <button class="btn btn-sm btn-soft btn-primary" :disabled="loading" @click="loadMore">Load More</button>
        <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear</button>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :loading="loading"
      :load-distance="300"
      @load="onLoad"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>

      <template #loading>
        <div class="p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300">
          <span class="loading loading-spinner loading-md text-primary" />
          <span class="text-xs font-bold small-caps tracking-widest opacity-70">Fetching more items...</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,L={class:"flex flex-wrap gap-4 items-center"},V={class:"settings-item group"},U=["disabled"],I={class:"example-vertical-item example-vertical-item--fixed"},_={class:"example-badge me-4"},B={class:"font-medium"},$=y({__name:"+Page",setup(N){const o=s(Array.from({length:50},(n,e)=>({id:e,label:`Initial Item ${e}`}))),i=s(!1),p=s(!0),c=s(null),v=S("debugMode",s(!1));async function f(){if(i.value)return;i.value=!0,await new Promise(l=>setTimeout(l,1500));const n=o.value.length,e=Array.from({length:20},(l,r)=>({id:n+r,label:`Loaded Item ${n+r}`}));o.value=[...o.value,...e],i.value=!1}async function b(n){p.value&&n==="vertical"&&await f()}function x(n){c.value=n}return(n,e)=>(w(),h(M,{code:m(E)},{title:a(()=>[...e[2]||(e[2]=[t("span",{class:"example-title example-title--group-1"},"Infinite Scroll",-1)])]),description:a(()=>[e[3]||(e[3]=d(" Demonstrates the ",-1)),e[4]||(e[4]=t("strong",null,"load",-1)),e[5]||(e[5]=d(" event and ",-1)),e[6]||(e[6]=t("strong",null,"loading",-1)),d(" prop/slot. Currently showing "+u(o.value.length.toLocaleString())+" items. When you reach the end of the list, more items are automatically fetched and appended. ",1)]),icon:a(()=>[...e[7]||(e[7]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-1"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"})],-1)])]),subtitle:a(()=>[...e[8]||(e[8]=[d(" Automatic pagination with loading indicators ",-1)])]),controls:a(()=>[g(j,{"scroll-details":c.value,direction:"vertical"},null,8,["scroll-details"])]),"example-controls":a(()=>[t("div",L,[t("label",V,[e[9]||(e[9]=t("span",{class:"settings-label pe-4"},"Auto-loading",-1)),T(t("input",{"onUpdate:modelValue":e[0]||(e[0]=l=>p.value=l),type:"checkbox",class:"toggle toggle-primary toggle-sm"},null,512),[[P,p.value]])]),t("button",{class:"btn btn-sm btn-soft btn-primary",disabled:i.value,onClick:f},"Load More",8,U),t("button",{class:"btn btn-sm btn-soft btn-error",onClick:e[1]||(e[1]=l=>o.value=[])},"Clear")])]),default:a(()=>[g(m(k),{debug:m(v),class:"example-container",items:o.value,"item-size":60,loading:i.value,"load-distance":300,onLoad:b,onScroll:x},{item:a(({item:l,index:r})=>[t("div",I,[t("span",_,"#"+u(r),1),t("span",B,u(l.label),1)])]),loading:a(()=>[...e[10]||(e[10]=[t("div",{class:"p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300"},[t("span",{class:"loading loading-spinner loading-md text-primary"}),t("span",{class:"text-xs font-bold small-caps tracking-widest opacity-70"},"Fetching more items...")],-1)])]),_:1},8,["debug","items","loading"])]),_:1},8,["code"]))}}),R=Object.freeze(Object.defineProperty({__proto__:null,default:$},Symbol.toStringTag,{value:"Module"})),Z={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:D}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:C}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:A}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-infinite-scroll/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:R}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:z}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-infinite-scroll/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Infinite Scroll | Virtual Scroll"}}};export{Z as configValuesSerialized};
