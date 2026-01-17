import{d as w,r as a,g as x,l as y,w as o,u,o as C,q as b,a as t,y as f,s as P,z as k,e as c,i as z,f as _}from"../chunks/chunk-LBZudith.js";import{E as A,V as I,_ as T}from"../chunks/chunk-Cu3thdAr.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const D=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: \`orig-\${ i }\`, label: \`Original Item \${ i }\` })));
const prependCount = ref(0);
const restoreScrollOnPrepend = ref(true);
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function prependItems() {
  const count = 5;
  const newItems = Array.from({ length: count }, (_, i) => ({
    id: \`prepended-\${ prependCount.value + i }\`,
    label: \`Prepended Item \${ prependCount.value + i }\`,
  }));

  items.value = [ ...newItems, ...items.value ];
  prependCount.value += count;
}

const appendCount = ref(0);
function appendItems() {
  const count = 5;
  const newItems = Array.from({ length: count }, (_, i) => ({
    id: \`appended-\${ appendCount.value + i }\`,
    label: \`Appended Item \${ appendCount.value + i }\`,
  }));

  items.value = [ ...items.value, ...newItems ];
  appendCount.value += count;
}

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="text-warning font-bold uppercase opacity-60 pe-2 align-baseline">Scroll Restoration</span>
    </template>

    <template #description>
      Demonstrates the <strong>restoreScrollOnPrepend</strong> prop. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-warning text-warning-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" class="rotate-180 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Maintain scroll position when prepending items
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <div class="flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300">
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-sm font-medium">Restore Scroll on Prepend</span>
            <input v-model="restoreScrollOnPrepend" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>

          <button class="btn btn-sm btn-soft btn-primary" @click="prependItems">Prepend 5 Items</button>
          <button class="btn btn-sm btn-soft btn-primary" @click="appendItems">Append 5 Items</button>
          <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear</button>
        </div>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="bg-base-100"
      :items="items"
      :item-size="60"
      :restore-scroll-on-prepend="restoreScrollOnPrepend"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,j={class:"flex flex-wrap gap-2 md:gap-4 items-start"},M={class:"flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300"},E={class:"flex items-center gap-2 cursor-pointer"},$={class:"h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors"},V={class:"badge badge-neutral mr-4"},R={class:"font-medium"},O=w({__name:"+Page",setup(B){const l=a(Array.from({length:50},(s,e)=>({id:`orig-${e}`,label:`Original Item ${e}`}))),i=a(0),p=a(!0),m=a(null),v=x("debugMode",a(!1));function g(){const e=Array.from({length:5},(r,n)=>({id:`prepended-${i.value+n}`,label:`Prepended Item ${i.value+n}`}));l.value=[...e,...l.value],i.value+=5}const d=a(0);function h(){const e=Array.from({length:5},(r,n)=>({id:`appended-${d.value+n}`,label:`Appended Item ${d.value+n}`}));l.value=[...l.value,...e],d.value+=5}function S(s){m.value=s}return(s,e)=>(C(),y(A,{code:u(D)},{title:o(()=>[...e[2]||(e[2]=[t("span",{class:"text-warning font-bold uppercase opacity-60 pe-2 align-baseline"},"Scroll Restoration",-1)])]),description:o(()=>[...e[3]||(e[3]=[c(" Demonstrates the ",-1),t("strong",null,"restoreScrollOnPrepend",-1),c(" prop. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable. ",-1)])]),icon:o(()=>[...e[4]||(e[4]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-warning text-warning-content shadow-lg"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",class:"rotate-180 origin-center"})],-1)])]),subtitle:o(()=>[...e[5]||(e[5]=[c(" Maintain scroll position when prepending items ",-1)])]),controls:o(()=>[t("div",j,[b(T,{"scroll-details":m.value,direction:"vertical"},null,8,["scroll-details"]),t("div",M,[t("label",E,[e[6]||(e[6]=t("span",{class:"text-sm font-medium"},"Restore Scroll on Prepend",-1)),P(t("input",{"onUpdate:modelValue":e[0]||(e[0]=r=>p.value=r),type:"checkbox",class:"toggle toggle-primary toggle-sm"},null,512),[[k,p.value]])]),t("button",{class:"btn btn-sm btn-soft btn-primary",onClick:g},"Prepend 5 Items"),t("button",{class:"btn btn-sm btn-soft btn-primary",onClick:h},"Append 5 Items"),t("button",{class:"btn btn-sm btn-soft btn-error",onClick:e[1]||(e[1]=r=>l.value=[])},"Clear")])])]),default:o(()=>[b(u(I),{debug:u(v),class:"bg-base-100",items:l.value,"item-size":60,"restore-scroll-on-prepend":p.value,onScroll:S},{item:o(({item:r,index:n})=>[t("div",$,[t("span",V,"#"+f(n),1),t("span",R,f(r.label),1)])]),_:1},8,["debug","items","restore-scroll-on-prepend"])]),_:1},8,["code"]))}}),U=Object.freeze(Object.defineProperty({__proto__:null,default:O},Symbol.toStringTag,{value:"Module"})),K={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:_}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-scroll-restoration/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:U}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:z}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-scroll-restoration/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Scroll Restoration - Virtual Scroll"}}};export{K as configValuesSerialized};
