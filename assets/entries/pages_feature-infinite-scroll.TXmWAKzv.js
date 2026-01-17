import{d as h,r as s,g as x,l as w,w as a,u,o as S,q as f,a as t,y as g,s as z,z as T,e as d,i as C,f as k}from"../chunks/chunk-BtXCRXom.js";import{E as A,V as D,_ as M}from"../chunks/chunk-BigYq7j-.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const _=`<script setup lang="ts">
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
      <span class="text-primary font-bold uppercase opacity-60 pe-2 align-baseline">Infinite Scroll</span>
    </template>

    <template #description>
      Demonstrates the <strong>load</strong> event and <strong>loading</strong> prop/slot. When you reach the end of the list, more items are automatically fetched and appended.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </template>

    <template #subtitle>
      Automatic pagination with loading indicators
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <div class="flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300">
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-sm font-medium">Auto-loading (Infinite)</span>
            <input v-model="autoLoad" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>

          <button class="btn btn-sm btn-soft btn-primary" :disabled="loading" @click="loadMore">Manual Load More</button>
          <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear Items</button>
        </div>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="bg-base-100"
      :items="items"
      :item-size="60"
      :loading="loading"
      :load-distance="300"
      @load="onLoad"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>

      <template #loading>
        <div class="p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300">
          <span class="loading loading-spinner loading-lg text-primary" />
          <span class="text-sm font-bold uppercase tracking-widest opacity-60">Fetching more items...</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,P={class:"flex flex-wrap gap-2 md:gap-4 items-start"},I={class:"flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300"},j={class:"flex items-center gap-2 cursor-pointer"},E=["disabled"],L={class:"h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors"},V={class:"badge badge-neutral mr-4"},U={class:"font-medium"},B=h({__name:"+Page",setup($){const o=s(Array.from({length:50},(n,e)=>({id:e,label:`Initial Item ${e}`}))),i=s(!1),p=s(!0),c=s(null),b=x("debugMode",s(!1));async function m(){if(i.value)return;i.value=!0,await new Promise(l=>setTimeout(l,1500));const n=o.value.length,e=Array.from({length:20},(l,r)=>({id:n+r,label:`Loaded Item ${n+r}`}));o.value=[...o.value,...e],i.value=!1}async function v(n){p.value&&n==="vertical"&&await m()}function y(n){c.value=n}return(n,e)=>(S(),w(A,{code:u(_)},{title:a(()=>[...e[2]||(e[2]=[t("span",{class:"text-primary font-bold uppercase opacity-60 pe-2 align-baseline"},"Infinite Scroll",-1)])]),description:a(()=>[...e[3]||(e[3]=[d(" Demonstrates the ",-1),t("strong",null,"load",-1),d(" event and ",-1),t("strong",null,"loading",-1),d(" prop/slot. When you reach the end of the list, more items are automatically fetched and appended. ",-1)])]),icon:a(()=>[...e[4]||(e[4]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"})],-1)])]),subtitle:a(()=>[...e[5]||(e[5]=[d(" Automatic pagination with loading indicators ",-1)])]),controls:a(()=>[t("div",P,[f(M,{"scroll-details":c.value,direction:"vertical"},null,8,["scroll-details"]),t("div",I,[t("label",j,[e[6]||(e[6]=t("span",{class:"text-sm font-medium"},"Auto-loading (Infinite)",-1)),z(t("input",{"onUpdate:modelValue":e[0]||(e[0]=l=>p.value=l),type:"checkbox",class:"toggle toggle-primary toggle-sm"},null,512),[[T,p.value]])]),t("button",{class:"btn btn-sm btn-soft btn-primary",disabled:i.value,onClick:m},"Manual Load More",8,E),t("button",{class:"btn btn-sm btn-soft btn-error",onClick:e[1]||(e[1]=l=>o.value=[])},"Clear Items")])])]),default:a(()=>[f(u(D),{debug:u(b),class:"bg-base-100",items:o.value,"item-size":60,loading:i.value,"load-distance":300,onLoad:v,onScroll:y},{item:a(({item:l,index:r})=>[t("div",L,[t("span",V,"#"+g(r),1),t("span",U,g(l.label),1)])]),loading:a(()=>[...e[7]||(e[7]=[t("div",{class:"p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300"},[t("span",{class:"loading loading-spinner loading-lg text-primary"}),t("span",{class:"text-sm font-bold uppercase tracking-widest opacity-60"},"Fetching more items...")],-1)])]),_:1},8,["debug","items","loading"])]),_:1},8,["code"]))}}),R=Object.freeze(Object.defineProperty({__proto__:null,default:B},Symbol.toStringTag,{value:"Module"})),K={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:k}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-infinite-scroll/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:R}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:C}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-infinite-scroll/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Infinite Scroll - Virtual Scroll"}}};export{K as configValuesSerialized};
