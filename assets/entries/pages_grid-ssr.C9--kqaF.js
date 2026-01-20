import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{C as t,D as n,G as r,H as i,K as a,N as o,P as s,T as c,U as l,_ as u,b as d,g as f,h as p,o as m,s as h,t as g,v as _,w as v,x as y,z as b}from"../chunks/chunk-BlgwXZRf.js";import"../chunks/chunk-CTpTqTDb.js";import{n as x}from"../chunks/chunk-C0NP2mKO.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as S,t as C}from"../chunks/chunk-Ckjm4Aul.js";import{t as w}from"../chunks/chunk-ETTdm7vE.js";var T=`<script setup lang="ts">
import type { Data } from './+data';
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { useData } from 'vike-vue/useData';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const data = useData<Data>();

const itemCount = ref(data.itemCount);
const itemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(120);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

const columnWidths = computed(() => [ Math.ceil(columnWidth.value * 1.5), columnWidth.value ]);

// SSR Range: from data (simulates state from a store)
const { items, ssrRange } = data;

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
      <span class="example-title example-title--group-4">Grid SSR Support</span>
    </template>

    <template #description>
      Demonstrates the <strong>ssrRange</strong> prop. The grid is configured to start pre-rendered at <strong>Row {{ ssrRange.start }}, Column {{ ssrRange.colStart }}</strong>. On the client, it automatically scrolls to match this range on mount.<br /><br />
      <div class="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 size-5"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs md:text-sm font-medium">In a real SSR environment, the content for this range would be present in the initial HTML.</span>
      </div>
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-4"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Pre-rendering and auto-scrolling for Server-Side Rendering
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-4 items-start">
        <ScrollStatus
          :scroll-details="scrollDetails"
          direction="both"
          :column-range="virtualScrollRef?.columnRange"
        />
        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="itemSize"
          v-model:column-count="columnCount"
          v-model:column-width="columnWidth"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          v-model:sticky-header="stickyHeader"
          v-model:sticky-footer="stickyFooter"
          direction="both"
          @scroll-to-index="handleScrollToIndex"
          @scroll-to-offset="handleScrollToOffset"
          @refresh="virtualScrollRef?.refresh()"
        />
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="both"
      :items="items"
      :item-size="itemSize"
      :column-count="columnCount"
      :column-width="columnWidths"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :ssr-range="ssrRange"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Grid Header
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth }">
        <div :key="\`r_\${ index }\`" class="example-grid-row">
          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padStart }px\` }" />

          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="\`r_\${ index }_c_\${ columnRange.start + c - 1 }\`"
            :data-col-index="columnRange.start + c - 1"
            class="example-grid-cell"
            :style="{ inlineSize: \`\${ getColumnWidth(columnRange.start + c - 1) }px\` }"
          >
            <div class="example-badge mb-2">R{{ index }} &times; C{{ columnRange.start + c - 1 }}</div>
            <div class="opacity-40 tabular-nums">{{ getColumnWidth(columnRange.start + c - 1) }}px</div>
          </div>

          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padEnd }px\` }" />
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          End of Grid
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,E={class:`flex flex-wrap gap-4 items-start`},D=[`data-col-index`],O={class:`example-badge mb-2`},k={class:`opacity-40 tabular-nums`},A=c({__name:`+Page`,setup(e){let c=h(),m=i(c.itemCount),g=i(80),A=i(100),j=i(120),M=i(5),N=i(5),P=i(!1),F=i(!1),I=f(()=>[Math.ceil(j.value*1.5),j.value]),{items:L,ssrRange:R}=c,z=i(),B=i(null),V=n(`debugMode`,i(!1));function H(e){B.value=e}function U(e,t,n){z.value?.scrollToIndex(e,t,n)}function W(e,t){z.value?.scrollToOffset(e,t)}return(e,n)=>(o(),_(S,{code:l(T)},{title:b(()=>[...n[9]||=[u(`span`,{class:`example-title example-title--group-4`},`Grid SSR Support`,-1)]]),description:b(()=>[n[10]||=t(` Demonstrates the `,-1),n[11]||=u(`strong`,null,`ssrRange`,-1),n[12]||=t(` prop. The grid is configured to start pre-rendered at `,-1),u(`strong`,null,`Row `+a(l(R).start)+`, Column `+a(l(R).colStart),1),n[13]||=t(`. On the client, it automatically scrolls to match this range on mount.`,-1),n[14]||=u(`br`,null,null,-1),n[15]||=u(`br`,null,null,-1),n[16]||=u(`div`,{class:`alert alert-info`},[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,class:`stroke-current shrink-0 size-5`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`2`,d:`M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z`})]),u(`span`,{class:`text-xs md:text-sm font-medium`},`In a real SSR environment, the content for this range would be present in the initial HTML.`)],-1)]),icon:b(()=>[...n[17]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-4`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`})],-1)]]),subtitle:b(()=>[...n[18]||=[t(` Pre-rendering and auto-scrolling for Server-Side Rendering `,-1)]]),controls:b(()=>[u(`div`,E,[v(C,{"scroll-details":B.value,direction:`both`,"column-range":z.value?.columnRange},null,8,[`scroll-details`,`column-range`]),v(w,{"item-count":m.value,"onUpdate:itemCount":n[0]||=e=>m.value=e,"item-size":g.value,"onUpdate:itemSize":n[1]||=e=>g.value=e,"column-count":A.value,"onUpdate:columnCount":n[2]||=e=>A.value=e,"column-width":j.value,"onUpdate:columnWidth":n[3]||=e=>j.value=e,"buffer-before":M.value,"onUpdate:bufferBefore":n[4]||=e=>M.value=e,"buffer-after":N.value,"onUpdate:bufferAfter":n[5]||=e=>N.value=e,"sticky-header":P.value,"onUpdate:stickyHeader":n[6]||=e=>P.value=e,"sticky-footer":F.value,"onUpdate:stickyFooter":n[7]||=e=>F.value=e,direction:`both`,onScrollToIndex:U,onScrollToOffset:W,onRefresh:n[8]||=e=>z.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:b(()=>[v(l(x),{ref_key:`virtualScrollRef`,ref:z,debug:l(V),class:`example-container`,direction:`both`,items:l(L),"item-size":g.value,"column-count":A.value,"column-width":I.value,"buffer-before":M.value,"buffer-after":N.value,"sticky-header":P.value,"sticky-footer":F.value,"ssr-range":l(R),onScroll:H},y({item:b(({index:e,columnRange:t,getColumnWidth:n})=>[(o(),d(`div`,{key:`r_${e}`,class:`example-grid-row`},[u(`div`,{class:`shrink-0`,style:r({inlineSize:`${t.padStart}px`})},null,4),(o(!0),d(p,null,s(t.end-t.start,i=>(o(),d(`div`,{key:`r_${e}_c_${t.start+i-1}`,"data-col-index":t.start+i-1,class:`example-grid-cell`,style:r({inlineSize:`${n(t.start+i-1)}px`})},[u(`div`,O,`R`+a(e)+` × C`+a(t.start+i-1),1),u(`div`,k,a(n(t.start+i-1))+`px`,1)],12,D))),128)),u(`div`,{class:`shrink-0`,style:r({inlineSize:`${t.padEnd}px`})},null,4)]))]),_:2},[P.value?{name:`header`,fn:b(()=>[n[19]||=u(`div`,{class:`example-sticky-header`},` Grid Header `,-1)]),key:`0`}:void 0,F.value?{name:`footer`,fn:b(()=>[n[20]||=u(`div`,{class:`example-sticky-footer`},` End of Grid `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`,`ssr-range`])]),_:1},8,[`code`]))}}),j=e({default:()=>M},1),M=A;const N={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:{server:!0}}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:m}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-ssr/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:j}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:g}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-ssr/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Grid SSR | Virtual Scroll`}}};export{N as configValuesSerialized};