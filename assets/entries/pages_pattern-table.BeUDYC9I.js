import{d as z,l as A,w as l,u as b,m as C,p as r,o as D,b as g,q as E,a as t,t as o,n as v,j as n,v as P,i as U,f as V,g as R,h as j}from"../chunks/chunk-BDlHe8BJ.js";import{V as M}from"../chunks/chunk-CY8_agoq.js";import{_ as B,a as O}from"../chunks/chunk-C1op8fmR.js";import{_ as H}from"../chunks/chunk-CuJM7iIK.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const I=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const itemSize = ref(0);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(true);
const stickyFooter = ref(false);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  name: \`User \${ i }\`,
  email: \`user\${ i }@example.com\`,
  role: i % 3 === 0 ? 'Admin' : (i % 3 === 1 ? 'Editor' : 'Viewer'),
  status: i % 2 === 0 ? 'Active' : 'Inactive',
  age: 20 + (i * 7) % 60,
  city: \`city\${ 1 + i % 5 }\`,
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
      <span class="example-title example-title--group-2">Table</span>
    </template>

    <template #description>
      Demonstrates usage of custom tags (<strong>table</strong>, <strong>tbody</strong>, <strong>tr</strong>) for semantically correct and accessible tabular data virtualization with {{ itemCount.toLocaleString() }} items. Row height is fixed at {{ itemSize }}px.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5" />
      </svg>
    </template>

    <template #subtitle>
      Standard HTML <strong>&lt;table&gt;</strong> virtualization
    </template>

    <template #controls>
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
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container table table-zebra"
      :items="items"
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      container-tag="table"
      wrapper-tag="tbody"
      item-tag="tr"
      @scroll="onScroll"
    >
      <template #header>
        <tr class="bg-base-200 shadow-sm z-1">
          <th class="w-16 text-end border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">ID</th>
          <th class="w-48 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Name</th>
          <th class="w-72 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Email</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Age</th>
          <th class="w-56 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">City</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Role</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Status</th>
        </tr>
      </template>

      <template #item="{ item, index }">
        <td class="w-16 text-end font-mono text-sm opacity-50">#{{ index }}</td>
        <td class="w-48 font-bold text-sm">{{ item.name }}</td>
        <td class="w-72 text-xs opacity-80">{{ item.email }}</td>
        <td class="w-24 text-center text-sm tabular-nums">{{ item.age }}</td>
        <td class="w-56 text-sm">{{ item.city }}</td>
        <td class="w-24 text-center">
          <span
            class="badge badge-xs md:badge-sm font-semibold"
            :class="{
              'badge-primary': item.role === 'Admin',
              'badge-secondary': item.role === 'Editor',
              'badge-soft': item.role === 'Viewer',
            }"
          >
            {{ item.role }}
          </span>
        </td>
        <td class="w-24 text-center">
          <span
            class="badge badge-xs md:badge-sm font-semibold"
            :class="item.status === 'Active' ? 'badge-success' : 'badge-error'"
          >
            {{ item.status }}
          </span>
        </td>
      </template>

      <template v-if="stickyFooter" #footer>
        <tr class="bg-base-200 shadow-sm z-1">
          <td class="w-full p-4 font-bold text-center border-t border-base-300 text-xs small-caps tracking-widest opacity-60" colspan="7">
            End of {{ itemCount.toLocaleString() }} items
          </td>
        </tr>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,$={class:"w-16 text-end font-mono text-sm opacity-50"},L={class:"w-48 font-bold text-sm"},_={class:"w-72 text-xs opacity-80"},F={class:"w-24 text-center text-sm tabular-nums"},N={class:"w-56 text-sm"},Z={class:"w-24 text-center"},q={class:"w-24 text-center"},G={class:"bg-base-200 shadow-sm z-1"},J={class:"w-full p-4 font-bold text-center border-t border-base-300 text-xs small-caps tracking-widest opacity-60",colspan:"7"},K=z({__name:"+Page",setup(W){const i=r(1e3),d=r(0),u=r(5),p=r(5),f=r(!0),c=r(!1),x=P(()=>Array.from({length:i.value},(s,e)=>({id:e,name:`User ${e}`,email:`user${e}@example.com`,role:e%3===0?"Admin":e%3===1?"Editor":"Viewer",status:e%2===0?"Active":"Inactive",age:20+e*7%60,city:`city${1+e%5}`}))),m=r(),y=r(null),w=C("debugMode",r(!1));function S(s){y.value=s}function h(s,e,a){m.value?.scrollToIndex(s,e,a)}function k(s,e){m.value?.scrollToOffset(s,e)}return(s,e)=>(D(),A(B,{code:b(I)},{title:l(()=>[...e[7]||(e[7]=[t("span",{class:"example-title example-title--group-2"},"Table",-1)])]),description:l(()=>[e[8]||(e[8]=n(" Demonstrates usage of custom tags (",-1)),e[9]||(e[9]=t("strong",null,"table",-1)),e[10]||(e[10]=n(", ",-1)),e[11]||(e[11]=t("strong",null,"tbody",-1)),e[12]||(e[12]=n(", ",-1)),e[13]||(e[13]=t("strong",null,"tr",-1)),n(") for semantically correct and accessible tabular data virtualization with "+o(i.value.toLocaleString())+" items. Row height is fixed at "+o(d.value)+"px. ",1)]),icon:l(()=>[...e[14]||(e[14]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-2"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5"})],-1)])]),subtitle:l(()=>[...e[15]||(e[15]=[n(" Standard HTML ",-1),t("strong",null,"<table>",-1),n(" virtualization ",-1)])]),controls:l(()=>[g(O,{"scroll-details":y.value,direction:"vertical"},null,8,["scroll-details"]),g(H,{"item-count":i.value,"onUpdate:itemCount":e[0]||(e[0]=a=>i.value=a),"item-size":d.value,"onUpdate:itemSize":e[1]||(e[1]=a=>d.value=a),"buffer-before":u.value,"onUpdate:bufferBefore":e[2]||(e[2]=a=>u.value=a),"buffer-after":p.value,"onUpdate:bufferAfter":e[3]||(e[3]=a=>p.value=a),"sticky-header":f.value,"onUpdate:stickyHeader":e[4]||(e[4]=a=>f.value=a),"sticky-footer":c.value,"onUpdate:stickyFooter":e[5]||(e[5]=a=>c.value=a),direction:"vertical",onScrollToIndex:h,onScrollToOffset:k,onRefresh:e[6]||(e[6]=a=>m.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])]),default:l(()=>[g(b(M),{ref_key:"virtualScrollRef",ref:m,debug:b(w),class:"example-container table table-zebra",items:x.value,"item-size":d.value,"buffer-before":u.value,"buffer-after":p.value,"sticky-header":f.value,"sticky-footer":c.value,"container-tag":"table","wrapper-tag":"tbody","item-tag":"tr",onScroll:S},E({header:l(()=>[e[16]||(e[16]=t("tr",{class:"bg-base-200 shadow-sm z-1"},[t("th",{class:"w-16 text-end border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60"},"ID"),t("th",{class:"w-48 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60"},"Name"),t("th",{class:"w-72 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60"},"Email"),t("th",{class:"w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60"},"Age"),t("th",{class:"w-56 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60"},"City"),t("th",{class:"w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60"},"Role"),t("th",{class:"w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60"},"Status")],-1))]),item:l(({item:a,index:T})=>[t("td",$,"#"+o(T),1),t("td",L,o(a.name),1),t("td",_,o(a.email),1),t("td",F,o(a.age),1),t("td",N,o(a.city),1),t("td",Z,[t("span",{class:v(["badge badge-xs md:badge-sm font-semibold",{"badge-primary":a.role==="Admin","badge-secondary":a.role==="Editor","badge-soft":a.role==="Viewer"}])},o(a.role),3)]),t("td",q,[t("span",{class:v(["badge badge-xs md:badge-sm font-semibold",a.status==="Active"?"badge-success":"badge-error"])},o(a.status),3)])]),_:2},[c.value?{name:"footer",fn:l(()=>[t("tr",G,[t("td",J," End of "+o(i.value.toLocaleString())+" items ",1)])]),key:"0"}:void 0]),1032,["debug","items","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])]),_:1},8,["code"]))}}),Q=Object.freeze(Object.defineProperty({__proto__:null,default:K},Symbol.toStringTag,{value:"Module"})),ce={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:j}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:R}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:V}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-table/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:Q}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:U}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-table/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Table | Virtual Scroll"}}};export{ce as configValuesSerialized};
