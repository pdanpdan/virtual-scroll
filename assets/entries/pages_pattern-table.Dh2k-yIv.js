import{t as e}from"../chunks/chunk-v_CCr7DM.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,U as c,V as l,_ as u,g as d,o as f,t as p,v as m,w as h,x as g}from"../chunks/chunk-CZEdwOsv.js";import"../chunks/chunk-YW3sP-nK.js";import{n as _}from"../chunks/chunk-BoapzTav.js";/* empty css                      *//* empty css                      *//* empty css                      */import{t as v}from"../chunks/chunk-BYGEeXHk.js";import{t as y}from"../chunks/chunk-AZfZD1yh.js";import{t as b}from"../chunks/chunk-BdOZaf3L.js";var x=`<script setup lang="ts">
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
          <th class="w-16 text-right border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">ID</th>
          <th class="w-48 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Name</th>
          <th class="w-72 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Email</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Age</th>
          <th class="w-56 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">City</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Role</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Status</th>
        </tr>
      </template>

      <template #item="{ item, index }">
        <td class="w-16 text-right font-mono text-sm opacity-50">#{{ index }}</td>
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
`,S={class:`flex flex-wrap gap-2 md:gap-4 items-start`},C={class:`w-16 text-right font-mono text-sm opacity-50`},w={class:`w-48 font-bold text-sm`},T={class:`w-72 text-xs opacity-80`},E={class:`w-24 text-center text-sm tabular-nums`},D={class:`w-56 text-sm`},O={class:`w-24 text-center`},k={class:`w-24 text-center`},A={class:`bg-base-200 shadow-sm z-1`},j={class:`w-full p-4 font-bold text-center border-t border-base-300 text-xs small-caps tracking-widest opacity-60`,colspan:`7`},M=s({__name:`+Page`,setup(e){let s=l(1e3),f=l(0),p=l(5),M=l(5),N=l(!0),P=l(!1),F=d(()=>Array.from({length:s.value},(e,t)=>({id:t,name:`User ${t}`,email:`user${t}@example.com`,role:t%3==0?`Admin`:t%3==1?`Editor`:`Viewer`,status:t%2==0?`Active`:`Inactive`,age:20+t*7%60,city:`city${1+t%5}`}))),I=l(),L=l(null),R=n(`debugMode`,l(!1));function z(e){L.value=e}function B(e,t,n){I.value?.scrollToIndex(e,t,n)}function V(e,t){I.value?.scrollToOffset(e,t)}return(e,n)=>(a(),m(v,{code:i(x)},{title:o(()=>[...n[7]||=[u(`span`,{class:`example-title example-title--group-2`},`Table`,-1)]]),description:o(()=>[n[8]||=t(` Demonstrates usage of custom tags (`,-1),n[9]||=u(`strong`,null,`table`,-1),n[10]||=t(`, `,-1),n[11]||=u(`strong`,null,`tbody`,-1),n[12]||=t(`, `,-1),n[13]||=u(`strong`,null,`tr`,-1),t(`) for semantically correct and accessible tabular data virtualization with `+r(s.value.toLocaleString())+` items. Row height is fixed at `+r(f.value)+`px. `,1)]),icon:o(()=>[...n[14]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-2`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5`})],-1)]]),subtitle:o(()=>[...n[15]||=[t(` Standard HTML `,-1),u(`strong`,null,`<table>`,-1),t(` virtualization `,-1)]]),controls:o(()=>[u(`div`,S,[h(b,{"scroll-details":L.value,direction:`vertical`},null,8,[`scroll-details`]),h(y,{"item-count":s.value,"onUpdate:itemCount":n[0]||=e=>s.value=e,"item-size":f.value,"onUpdate:itemSize":n[1]||=e=>f.value=e,"buffer-before":p.value,"onUpdate:bufferBefore":n[2]||=e=>p.value=e,"buffer-after":M.value,"onUpdate:bufferAfter":n[3]||=e=>M.value=e,"sticky-header":N.value,"onUpdate:stickyHeader":n[4]||=e=>N.value=e,"sticky-footer":P.value,"onUpdate:stickyFooter":n[5]||=e=>P.value=e,direction:`vertical`,onScrollToIndex:B,onScrollToOffset:V,onRefresh:n[6]||=e=>I.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:o(()=>[h(i(_),{ref_key:`virtualScrollRef`,ref:I,debug:i(R),class:`example-container table table-zebra`,items:F.value,"item-size":f.value,"buffer-before":p.value,"buffer-after":M.value,"sticky-header":N.value,"sticky-footer":P.value,"container-tag":`table`,"wrapper-tag":`tbody`,"item-tag":`tr`,onScroll:z},g({header:o(()=>[n[16]||=u(`tr`,{class:`bg-base-200 shadow-sm z-1`},[u(`th`,{class:`w-16 text-right border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60`},`ID`),u(`th`,{class:`w-48 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60`},`Name`),u(`th`,{class:`w-72 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60`},`Email`),u(`th`,{class:`w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60`},`Age`),u(`th`,{class:`w-56 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60`},`City`),u(`th`,{class:`w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60`},`Role`),u(`th`,{class:`w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60`},`Status`)],-1)]),item:o(({item:e,index:t})=>[u(`td`,C,`#`+r(t),1),u(`td`,w,r(e.name),1),u(`td`,T,r(e.email),1),u(`td`,E,r(e.age),1),u(`td`,D,r(e.city),1),u(`td`,O,[u(`span`,{class:c([`badge badge-xs md:badge-sm font-semibold`,{"badge-primary":e.role===`Admin`,"badge-secondary":e.role===`Editor`,"badge-soft":e.role===`Viewer`}])},r(e.role),3)]),u(`td`,k,[u(`span`,{class:c([`badge badge-xs md:badge-sm font-semibold`,e.status===`Active`?`badge-success`:`badge-error`])},r(e.status),3)])]),_:2},[P.value?{name:`footer`,fn:o(()=>[u(`tr`,A,[u(`td`,j,` End of `+r(s.value.toLocaleString())+` items `,1)])]),key:`0`}:void 0]),1032,[`debug`,`items`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),N=e({default:()=>P},1),P=M;const F={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-table/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:N}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:p}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-table/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Table | Virtual Scroll`}}};export{F as configValuesSerialized};