import{d as x,p as r,l as y,w as n,u,m as w,o as P,b as v,a as t,t as m,z as C,A as T,j as c,i as A,f as z,g as k,h as D}from"../chunks/chunk-BDlHe8BJ.js";import{V as I}from"../chunks/chunk-CY8_agoq.js";import{_,a as j}from"../chunks/chunk-C1op8fmR.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const E=`<script setup lang="ts">
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
      <span class="example-title example-title--group-2">Scroll Restoration</span>
    </template>

    <template #description>
      Demonstrates the <strong>restoreScrollOnPrepend</strong> prop. Currently showing {{ items.length.toLocaleString() }} items. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" class="rotate-180 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Maintain scroll position when prepending items
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Restore on Prepend</span>
          <input v-model="restoreScrollOnPrepend" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <button class="btn btn-sm btn-soft btn-primary" @click="prependItems">Prepend 5</button>
        <button class="btn btn-sm btn-soft btn-primary" @click="appendItems">Append 5</button>
        <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear Items</button>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :restore-scroll-on-prepend="restoreScrollOnPrepend"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,V={class:"flex flex-wrap gap-4 items-center"},M={class:"settings-item group"},U={class:"example-vertical-item example-vertical-item--fixed"},$={class:"example-badge me-4"},O={class:"font-medium"},R=x({__name:"+Page",setup(L){const l=r(Array.from({length:50},(s,e)=>({id:`orig-${e}`,label:`Original Item ${e}`}))),i=r(0),p=r(!0),f=r(null),g=w("debugMode",r(!1));function b(){const e=Array.from({length:5},(a,o)=>({id:`prepended-${i.value+o}`,label:`Prepended Item ${i.value+o}`}));l.value=[...e,...l.value],i.value+=5}const d=r(0);function h(){const e=Array.from({length:5},(a,o)=>({id:`appended-${d.value+o}`,label:`Appended Item ${d.value+o}`}));l.value=[...l.value,...e],d.value+=5}function S(s){f.value=s}return(s,e)=>(P(),y(_,{code:u(E)},{title:n(()=>[...e[2]||(e[2]=[t("span",{class:"example-title example-title--group-2"},"Scroll Restoration",-1)])]),description:n(()=>[e[3]||(e[3]=c(" Demonstrates the ",-1)),e[4]||(e[4]=t("strong",null,"restoreScrollOnPrepend",-1)),c(" prop. Currently showing "+m(l.value.length.toLocaleString())+" items. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable. ",1)]),icon:n(()=>[...e[5]||(e[5]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-2"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99",class:"rotate-180 origin-center"})],-1)])]),subtitle:n(()=>[...e[6]||(e[6]=[c(" Maintain scroll position when prepending items ",-1)])]),controls:n(()=>[v(j,{"scroll-details":f.value,direction:"vertical"},null,8,["scroll-details"])]),"example-controls":n(()=>[t("div",V,[t("label",M,[e[7]||(e[7]=t("span",{class:"settings-label pe-4"},"Restore on Prepend",-1)),C(t("input",{"onUpdate:modelValue":e[0]||(e[0]=a=>p.value=a),type:"checkbox",class:"toggle toggle-primary toggle-sm"},null,512),[[T,p.value]])]),t("button",{class:"btn btn-sm btn-soft btn-primary",onClick:b},"Prepend 5"),t("button",{class:"btn btn-sm btn-soft btn-primary",onClick:h},"Append 5"),t("button",{class:"btn btn-sm btn-soft btn-error",onClick:e[1]||(e[1]=a=>l.value=[])},"Clear Items")])]),default:n(()=>[v(u(I),{debug:u(g),class:"example-container",items:l.value,"item-size":60,"restore-scroll-on-prepend":p.value,onScroll:S},{item:n(({item:a,index:o})=>[t("div",U,[t("span",$,"#"+m(o),1),t("span",O,m(a.label),1)])]),_:1},8,["debug","items","restore-scroll-on-prepend"])]),_:1},8,["code"]))}}),B=Object.freeze(Object.defineProperty({__proto__:null,default:R},Symbol.toStringTag,{value:"Module"})),Z={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:D}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:k}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:z}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-scroll-restoration/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:B}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:A}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-scroll-restoration/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Scroll Restoration | Virtual Scroll"}}};export{Z as configValuesSerialized};
