import{d as k,r as n,h as A,g as C,l as E,w as o,u as p,o as V,q as g,A as D,a as t,y as l,x as y,e as s,i as R,f as U}from"../chunks/chunk-BtXCRXom.js";import{E as B,V as O,_ as P}from"../chunks/chunk-BigYq7j-.js";import{_ as j}from"../chunks/chunk-BCHXlBb1.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const M=`<script setup lang="ts">
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
      <span class="text-warning font-bold uppercase opacity-60 pe-2 align-baseline">Vertical Fixed Table</span>
    </template>

    <template #description>
      Demonstrates usage of custom tags (<strong>table</strong>, <strong>tbody</strong>, <strong>tr</strong>) for semantically correct and accessible tabular data virtualization. Row height is fixed at {{ itemSize }}px.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125h-7.5c-.621 0-1.125-.504-1.125-1.125m0 1.125v-1.5c0-.621.504-1.125 1.125-1.125m0 1.125h7.5m-15 0h7.5m-7.5 0v-1.5c0-.621.504-1.125 1.125-1.125m0 1.125h7.5" />
      </svg>
    </template>

    <template #subtitle>
      Standard HTML <strong>&lt;table&gt;</strong> virtualization
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
      class="table table-zebra bg-base-100"
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
        <tr class="bg-base-200">
          <th class="w-16 text-right border-b border-base-300">ID</th>
          <th class="w-48 border-b border-base-300">Name</th>
          <th class="w-72 border-b border-base-300">Email</th>
          <th class="w-24 text-center border-b border-base-300">Age</th>
          <th class="w-56 border-b border-base-300">City</th>
          <th class="w-24 text-center border-b border-base-300">Role</th>
          <th class="w-24 text-center border-b border-base-300">Status</th>
        </tr>
      </template>

      <template #item="{ item, index }">
        <td class="w-16 text-right font-mono text-xs opacity-50">#{{ index }}</td>
        <td class="w-48 font-bold">{{ item.name }}</td>
        <td class="w-72 text-sm">{{ item.email }}</td>
        <td class="w-24 text-center">{{ item.age }}</td>
        <td class="w-56">{{ item.city }}</td>
        <td class="w-24 text-center">
          <span
            class="badge badge-sm"
            :class="{
              'badge-primary': item.role === 'Admin',
              'badge-secondary': item.role === 'Editor',
              'badge-ghost': item.role === 'Viewer',
            }"
          >
            {{ item.role }}
          </span>
        </td>
        <td class="w-24 text-center">
          <span
            class="badge badge-sm"
            :class="item.status === 'Active' ? 'badge-success' : 'badge-error'"
          >
            {{ item.status }}
          </span>
        </td>
      </template>

      <template v-if="stickyFooter" #footer>
        <tr class="bg-base-200">
          <td class="w-full p-4 font-bold text-center border-t border-base-300" colspan="7">
            TABLE FOOTER (End of {{ itemCount }} items)
          </td>
        </tr>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,F={class:"flex flex-wrap gap-2 md:gap-4 items-start"},_={class:"w-16 text-right font-mono text-xs opacity-50"},I={class:"w-48 font-bold"},$={class:"w-72 text-sm"},H={class:"w-24 text-center"},L={class:"w-56"},N={class:"w-24 text-center"},q={class:"w-24 text-center"},G={class:"bg-base-200"},J={class:"w-full p-4 font-bold text-center border-t border-base-300",colspan:"7"},K=k({__name:"+Page",setup(W){const i=n(1e3),d=n(0),f=n(5),m=n(5),b=n(!0),c=n(!1),w=A(()=>Array.from({length:i.value},(a,e)=>({id:e,name:`User ${e}`,email:`user${e}@example.com`,role:e%3===0?"Admin":e%3===1?"Editor":"Viewer",status:e%2===0?"Active":"Inactive",age:20+e*7%60,city:`city${1+e%5}`}))),u=n(),v=n(null),x=C("debugMode",n(!1));function S(a){v.value=a}function h(a,e,r){u.value?.scrollToIndex(a,e,r)}function T(a,e){u.value?.scrollToOffset(a,e)}return(a,e)=>(V(),E(B,{code:p(M)},{title:o(()=>[...e[7]||(e[7]=[t("span",{class:"text-warning font-bold uppercase opacity-60 pe-2 align-baseline"},"Vertical Fixed Table",-1)])]),description:o(()=>[e[8]||(e[8]=s(" Demonstrates usage of custom tags (",-1)),e[9]||(e[9]=t("strong",null,"table",-1)),e[10]||(e[10]=s(", ",-1)),e[11]||(e[11]=t("strong",null,"tbody",-1)),e[12]||(e[12]=s(", ",-1)),e[13]||(e[13]=t("strong",null,"tr",-1)),s(") for semantically correct and accessible tabular data virtualization. Row height is fixed at "+l(d.value)+"px. ",1)]),icon:o(()=>[...e[14]||(e[14]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-warning text-warning-content shadow-lg"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125h-7.5c-.621 0-1.125-.504-1.125-1.125m0 1.125v-1.5c0-.621.504-1.125 1.125-1.125m0 1.125h7.5m-15 0h7.5m-7.5 0v-1.5c0-.621.504-1.125 1.125-1.125m0 1.125h7.5"})],-1)])]),subtitle:o(()=>[...e[15]||(e[15]=[s(" Standard HTML ",-1),t("strong",null,"<table>",-1),s(" virtualization ",-1)])]),controls:o(()=>[t("div",F,[g(P,{"scroll-details":v.value,direction:"vertical"},null,8,["scroll-details"]),g(j,{"item-count":i.value,"onUpdate:itemCount":e[0]||(e[0]=r=>i.value=r),"item-size":d.value,"onUpdate:itemSize":e[1]||(e[1]=r=>d.value=r),"buffer-before":f.value,"onUpdate:bufferBefore":e[2]||(e[2]=r=>f.value=r),"buffer-after":m.value,"onUpdate:bufferAfter":e[3]||(e[3]=r=>m.value=r),"sticky-header":b.value,"onUpdate:stickyHeader":e[4]||(e[4]=r=>b.value=r),"sticky-footer":c.value,"onUpdate:stickyFooter":e[5]||(e[5]=r=>c.value=r),direction:"vertical",onScrollToIndex:h,onScrollToOffset:T,onRefresh:e[6]||(e[6]=r=>u.value?.refresh())},null,8,["item-count","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])])]),default:o(()=>[g(p(O),{ref_key:"virtualScrollRef",ref:u,debug:p(x),class:"table table-zebra bg-base-100",items:w.value,"item-size":d.value,"buffer-before":f.value,"buffer-after":m.value,"sticky-header":b.value,"sticky-footer":c.value,"container-tag":"table","wrapper-tag":"tbody","item-tag":"tr",onScroll:S},D({header:o(()=>[e[16]||(e[16]=t("tr",{class:"bg-base-200"},[t("th",{class:"w-16 text-right border-b border-base-300"},"ID"),t("th",{class:"w-48 border-b border-base-300"},"Name"),t("th",{class:"w-72 border-b border-base-300"},"Email"),t("th",{class:"w-24 text-center border-b border-base-300"},"Age"),t("th",{class:"w-56 border-b border-base-300"},"City"),t("th",{class:"w-24 text-center border-b border-base-300"},"Role"),t("th",{class:"w-24 text-center border-b border-base-300"},"Status")],-1))]),item:o(({item:r,index:z})=>[t("td",_,"#"+l(z),1),t("td",I,l(r.name),1),t("td",$,l(r.email),1),t("td",H,l(r.age),1),t("td",L,l(r.city),1),t("td",N,[t("span",{class:y(["badge badge-sm",{"badge-primary":r.role==="Admin","badge-secondary":r.role==="Editor","badge-ghost":r.role==="Viewer"}])},l(r.role),3)]),t("td",q,[t("span",{class:y(["badge badge-sm",r.status==="Active"?"badge-success":"badge-error"])},l(r.status),3)])]),_:2},[c.value?{name:"footer",fn:o(()=>[t("tr",G,[t("td",J," TABLE FOOTER (End of "+l(i.value)+" items) ",1)])]),key:"0"}:void 0]),1032,["debug","items","item-size","buffer-before","buffer-after","sticky-header","sticky-footer"])]),_:1},8,["code"]))}}),Q=Object.freeze(Object.defineProperty({__proto__:null,default:K},Symbol.toStringTag,{value:"Module"})),ae={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:U}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-fixed-table/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:Q}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:R}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/vertical-fixed-table/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Vertical Fixed Table | Virtual Scroll"}}};export{ae as configValuesSerialized};
