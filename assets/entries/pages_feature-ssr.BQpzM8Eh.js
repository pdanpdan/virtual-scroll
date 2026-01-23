import{t as e}from"../chunks/chunk-CWRknLO5.js";import{C as t,D as n,G as r,H as i,M as a,N as o,R as s,T as c,V as l,W as u,_ as d,b as f,g as p,h as m,o as h,s as g,t as _,v,w as y,x as b}from"../chunks/chunk-DX5cysfz.js";import"../chunks/chunk-IpJMSSJ3.js";/* empty css                      */import{n as x}from"../chunks/chunk-BqjC6YKI.js";/* empty css                      *//* empty css                      */import{t as S}from"../chunks/chunk-CSSwdVS7.js";import{t as C}from"../chunks/chunk-Cy906vPh.js";import{t as w}from"../chunks/chunk-DQJ--WP8.js";var T=`<script setup lang="ts">
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
      <span class="example-title example-title--group-4">SSR Support</span>
    </template>

    <template #description>
      Demonstrates the <strong>ssrRange</strong> prop. The grid is configured to start pre-rendered at <strong>Row {{ ssrRange.start }}, Column {{ ssrRange.colStart }}</strong>. On the client, it automatically scrolls to match this range on mount.<br /><br />
      <div class="alert alert-info alert-soft">
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
`,E={class:`flex flex-wrap gap-4 items-start`},D=[`data-col-index`],O={class:`example-badge mb-2`},k={class:`opacity-40 tabular-nums`},A=c({__name:`+Page`,setup(e){let c=g(),h=l(c.itemCount),_=l(80),A=l(100),j=l(120),M=l(5),N=l(5),P=l(!1),F=l(!1),I=p(()=>[Math.ceil(j.value*1.5),j.value]),{items:L,ssrRange:R}=c,z=l(),B=l(null),V=n(`debugMode`,l(!1));function H(e){B.value=e}function U(e,t,n){z.value?.scrollToIndex(e,t,n)}function W(e,t){z.value?.scrollToOffset(e,t)}return(e,n)=>(a(),v(S,{code:i(T)},{title:s(()=>[...n[9]||=[d(`span`,{class:`example-title example-title--group-4`},`SSR Support`,-1)]]),description:s(()=>[n[10]||=t(` Demonstrates the `,-1),n[11]||=d(`strong`,null,`ssrRange`,-1),n[12]||=t(` prop. The grid is configured to start pre-rendered at `,-1),d(`strong`,null,`Row `+r(i(R).start)+`, Column `+r(i(R).colStart),1),n[13]||=t(`. On the client, it automatically scrolls to match this range on mount.`,-1),n[14]||=d(`br`,null,null,-1),n[15]||=d(`br`,null,null,-1),n[16]||=d(`div`,{class:`alert alert-info alert-soft`},[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,class:`stroke-current shrink-0 size-5`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`2`,d:`M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z`})]),d(`span`,{class:`text-xs md:text-sm font-medium`},`In a real SSR environment, the content for this range would be present in the initial HTML.`)],-1)]),icon:s(()=>[...n[17]||=[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-4`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`})],-1)]]),subtitle:s(()=>[...n[18]||=[t(` Pre-rendering and auto-scrolling for Server-Side Rendering `,-1)]]),controls:s(()=>[d(`div`,E,[y(w,{"scroll-details":B.value,direction:`both`,"column-range":z.value?.columnRange},null,8,[`scroll-details`,`column-range`]),y(C,{"item-count":h.value,"onUpdate:itemCount":n[0]||=e=>h.value=e,"item-size":_.value,"onUpdate:itemSize":n[1]||=e=>_.value=e,"column-count":A.value,"onUpdate:columnCount":n[2]||=e=>A.value=e,"column-width":j.value,"onUpdate:columnWidth":n[3]||=e=>j.value=e,"buffer-before":M.value,"onUpdate:bufferBefore":n[4]||=e=>M.value=e,"buffer-after":N.value,"onUpdate:bufferAfter":n[5]||=e=>N.value=e,"sticky-header":P.value,"onUpdate:stickyHeader":n[6]||=e=>P.value=e,"sticky-footer":F.value,"onUpdate:stickyFooter":n[7]||=e=>F.value=e,direction:`both`,onScrollToIndex:U,onScrollToOffset:W,onRefresh:n[8]||=e=>z.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:s(()=>[y(i(x),{ref_key:`virtualScrollRef`,ref:z,debug:i(V),class:`example-container`,direction:`both`,items:i(L),"item-size":_.value,"column-count":A.value,"column-width":I.value,"buffer-before":M.value,"buffer-after":N.value,"sticky-header":P.value,"sticky-footer":F.value,"ssr-range":i(R),onScroll:H},b({item:s(({index:e,columnRange:t,getColumnWidth:n})=>[(a(),f(`div`,{key:`r_${e}`,class:`example-grid-row`},[d(`div`,{class:`shrink-0`,style:u({inlineSize:`${t.padStart}px`})},null,4),(a(!0),f(m,null,o(t.end-t.start,i=>(a(),f(`div`,{key:`r_${e}_c_${t.start+i-1}`,"data-col-index":t.start+i-1,class:`example-grid-cell`,style:u({inlineSize:`${n(t.start+i-1)}px`})},[d(`div`,O,`R`+r(e)+` × C`+r(t.start+i-1),1),d(`div`,k,r(n(t.start+i-1))+`px`,1)],12,D))),128)),d(`div`,{class:`shrink-0`,style:u({inlineSize:`${t.padEnd}px`})},null,4)]))]),_:2},[P.value?{name:`header`,fn:s(()=>[n[19]||=d(`div`,{class:`example-sticky-header`},` Grid Header `,-1)]),key:`0`}:void 0,F.value?{name:`footer`,fn:s(()=>[n[20]||=d(`div`,{class:`example-sticky-footer`},` End of Grid `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`,`ssr-range`])]),_:1},8,[`code`]))}}),j=e({default:()=>M},1),M=A;const N={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:{server:!0}}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:h}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-ssr/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:j}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:_}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-ssr/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`SSR Support | Virtual Scroll`}}};export{N as configValuesSerialized};