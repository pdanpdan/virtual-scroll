import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,I as i,T as a,U as o,V as s,_ as c,g as l,j as u,o as d,t as f,v as p,w as m,x as h,z as g}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as _,r as v,t as y}from"../chunks/chunk-B7wtXgO1.js";/* empty css                      *//* empty css                      */import{t as b}from"../chunks/chunk-v7-rDw7-.js";var x=`<script setup lang="ts">
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
      Demonstrates usage of custom tags (<strong>table</strong>, <strong>tbody</strong>, <strong>tr</strong>) for semantically correct and accessible tabular data virtualization with {{ itemCount.toLocaleString() }} items. Row height is fixed at {{ itemSize }}px.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5" />
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
`,S={class:`flex flex-wrap gap-2 md:gap-4 items-start`},C={class:`w-16 text-right font-mono text-xs opacity-50`},w={class:`w-48 font-bold`},T={class:`w-72 text-sm`},E={class:`w-24 text-center`},D={class:`w-56`},O={class:`w-24 text-center`},k={class:`w-24 text-center`},A={class:`bg-base-200`},j={class:`w-full p-4 font-bold text-center border-t border-base-300`,colspan:`7`},M=a({__name:`+Page`,setup(e){let a=g(1e3),d=g(0),f=g(5),M=g(5),N=g(!0),P=g(!1),F=l(()=>Array.from({length:a.value},(e,t)=>({id:t,name:`User ${t}`,email:`user${t}@example.com`,role:t%3==0?`Admin`:t%3==1?`Editor`:`Viewer`,status:t%2==0?`Active`:`Inactive`,age:20+t*7%60,city:`city${1+t%5}`}))),I=g(),L=g(null),R=r(`debugMode`,g(!1));function z(e){L.value=e}function B(e,t,n){I.value?.scrollToIndex(e,t,n)}function V(e,t){I.value?.scrollToOffset(e,t)}return(e,r)=>(u(),p(_,{code:t(x)},{title:i(()=>[...r[7]||=[c(`span`,{class:`text-warning font-bold uppercase opacity-60 pe-2 align-baseline`},`Vertical Fixed Table`,-1)]]),description:i(()=>[r[8]||=n(` Demonstrates usage of custom tags (`,-1),r[9]||=c(`strong`,null,`table`,-1),r[10]||=n(`, `,-1),r[11]||=c(`strong`,null,`tbody`,-1),r[12]||=n(`, `,-1),r[13]||=c(`strong`,null,`tr`,-1),n(`) for semantically correct and accessible tabular data virtualization with `+o(a.value.toLocaleString())+` items. Row height is fixed at `+o(d.value)+`px. `,1)]),icon:i(()=>[...r[14]||=[c(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-warning text-warning-content shadow-lg`},[c(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5`})],-1)]]),subtitle:i(()=>[...r[15]||=[n(` Standard HTML `,-1),c(`strong`,null,`<table>`,-1),n(` virtualization `,-1)]]),controls:i(()=>[c(`div`,S,[m(y,{"scroll-details":L.value,direction:`vertical`},null,8,[`scroll-details`]),m(b,{"item-count":a.value,"onUpdate:itemCount":r[0]||=e=>a.value=e,"item-size":d.value,"onUpdate:itemSize":r[1]||=e=>d.value=e,"buffer-before":f.value,"onUpdate:bufferBefore":r[2]||=e=>f.value=e,"buffer-after":M.value,"onUpdate:bufferAfter":r[3]||=e=>M.value=e,"sticky-header":N.value,"onUpdate:stickyHeader":r[4]||=e=>N.value=e,"sticky-footer":P.value,"onUpdate:stickyFooter":r[5]||=e=>P.value=e,direction:`vertical`,onScrollToIndex:B,onScrollToOffset:V,onRefresh:r[6]||=e=>I.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:i(()=>[m(t(v),{ref_key:`virtualScrollRef`,ref:I,debug:t(R),class:`table table-zebra bg-base-100`,items:F.value,"item-size":d.value,"buffer-before":f.value,"buffer-after":M.value,"sticky-header":N.value,"sticky-footer":P.value,"container-tag":`table`,"wrapper-tag":`tbody`,"item-tag":`tr`,onScroll:z},h({header:i(()=>[r[16]||=c(`tr`,{class:`bg-base-200`},[c(`th`,{class:`w-16 text-right border-b border-base-300`},`ID`),c(`th`,{class:`w-48 border-b border-base-300`},`Name`),c(`th`,{class:`w-72 border-b border-base-300`},`Email`),c(`th`,{class:`w-24 text-center border-b border-base-300`},`Age`),c(`th`,{class:`w-56 border-b border-base-300`},`City`),c(`th`,{class:`w-24 text-center border-b border-base-300`},`Role`),c(`th`,{class:`w-24 text-center border-b border-base-300`},`Status`)],-1)]),item:i(({item:e,index:t})=>[c(`td`,C,`#`+o(t),1),c(`td`,w,o(e.name),1),c(`td`,T,o(e.email),1),c(`td`,E,o(e.age),1),c(`td`,D,o(e.city),1),c(`td`,O,[c(`span`,{class:s([`badge badge-sm`,{"badge-primary":e.role===`Admin`,"badge-secondary":e.role===`Editor`,"badge-ghost":e.role===`Viewer`}])},o(e.role),3)]),c(`td`,k,[c(`span`,{class:s([`badge badge-sm`,e.status===`Active`?`badge-success`:`badge-error`])},o(e.status),3)])]),_:2},[P.value?{name:`footer`,fn:i(()=>[c(`tr`,A,[c(`td`,j,` TABLE FOOTER (End of `+o(a.value)+` items) `,1)])]),key:`0`}:void 0]),1032,[`debug`,`items`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),N=e({default:()=>P},1),P=M;const F={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-fixed-table/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:N}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-fixed-table/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Fixed Table | Virtual Scroll`}}};export{F as configValuesSerialized};