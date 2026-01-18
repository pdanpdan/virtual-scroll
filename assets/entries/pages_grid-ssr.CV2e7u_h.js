import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,H as i,I as a,M as o,T as s,U as c,_ as l,b as u,g as d,h as f,j as p,o as m,s as h,t as g,v as _,w as v,x as y,z as b}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as x,r as S,t as C}from"../chunks/chunk-B7wtXgO1.js";/* empty css                      *//* empty css                      */import{t as w}from"../chunks/chunk-v7-rDw7-.js";var T=`<script setup lang="ts">
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
      <span class="text-info font-bold uppercase opacity-60 pe-2 align-baseline">Grid SSR Support</span>
    </template>

    <template #description>
      Demonstrates the <strong>ssrRange</strong> prop. The grid is configured to start pre-rendered at <strong>Row {{ ssrRange.start }}, Column {{ ssrRange.colStart }}</strong>. On the client, it automatically scrolls to match this range on mount.<br /><br />
      <div class="alert alert-soft alert-info shadow-sm py-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current shrink-0 w-6 h-6"
        ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>In a real SSR environment, the content for this range would be present in the initial HTML.</span>
      </div>
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-info text-info-content shadow-lg"
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
      class="bg-base-100"
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
        <div class="bg-primary text-primary-content p-4 border-b border-primary-focus">
          GRID HEADER (Row 0 is visible below this)
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth }">
        <div
          :key="\`r_\${ index }\`"
          class="h-full flex items-stretch border-b border-base-200"
        >
          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padStart }px\` }" />

          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="\`r_\${ index }_c_\${ columnRange.start + c - 1 }\`"
            :data-col-index="columnRange.start + c - 1"
            class="flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors"
            :style="{ inlineSize: \`\${ getColumnWidth(columnRange.start + c - 1) }px\` }"
          >
            <div class="text-xs uppercase opacity-40 font-bold mb-1">Row {{ index }}</div>
            <div class="text-xs uppercase opacity-40 font-bold mb-1">Col {{ columnRange.start + c - 1 }}</div>
            <div class="text-xs opacity-40">{{ getColumnWidth(columnRange.start + c - 1) }}px</div>
          </div>

          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padEnd }px\` }" />
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="bg-secondary text-secondary-content p-4 border-t border-secondary-focus font-bold text-center">
          GRID FOOTER (End of grid)
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,E={class:`flex flex-wrap gap-4 items-start`},D=[`data-col-index`],O={class:`text-xs uppercase opacity-40 font-bold mb-1`},k={class:`text-xs uppercase opacity-40 font-bold mb-1`},A={class:`text-xs opacity-40`},j=s({__name:`+Page`,setup(e){let s=h(),m=b(s.itemCount),g=b(80),j=b(100),M=b(120),N=b(5),P=b(5),F=b(!1),I=b(!1),L=d(()=>[Math.ceil(M.value*1.5),M.value]),{items:R,ssrRange:z}=s,B=b(),V=b(null),H=r(`debugMode`,b(!1));function U(e){V.value=e}function W(e,t,n){B.value?.scrollToIndex(e,t,n)}function G(e,t){B.value?.scrollToOffset(e,t)}return(e,r)=>(p(),_(x,{code:t(T)},{title:a(()=>[...r[9]||=[l(`span`,{class:`text-info font-bold uppercase opacity-60 pe-2 align-baseline`},`Grid SSR Support`,-1)]]),description:a(()=>[r[10]||=n(` Demonstrates the `,-1),r[11]||=l(`strong`,null,`ssrRange`,-1),r[12]||=n(` prop. The grid is configured to start pre-rendered at `,-1),l(`strong`,null,`Row `+c(t(z).start)+`, Column `+c(t(z).colStart),1),r[13]||=n(`. On the client, it automatically scrolls to match this range on mount.`,-1),r[14]||=l(`br`,null,null,-1),r[15]||=l(`br`,null,null,-1),r[16]||=l(`div`,{class:`alert alert-soft alert-info shadow-sm py-2`},[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,class:`stroke-current shrink-0 w-6 h-6`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,"stroke-width":`2`,d:`M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z`})]),l(`span`,null,`In a real SSR environment, the content for this range would be present in the initial HTML.`)],-1)]),icon:a(()=>[...r[17]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-info text-info-content shadow-lg`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`})],-1)]]),subtitle:a(()=>[...r[18]||=[n(` Pre-rendering and auto-scrolling for Server-Side Rendering `,-1)]]),controls:a(()=>[l(`div`,E,[v(C,{"scroll-details":V.value,direction:`both`,"column-range":B.value?.columnRange},null,8,[`scroll-details`,`column-range`]),v(w,{"item-count":m.value,"onUpdate:itemCount":r[0]||=e=>m.value=e,"item-size":g.value,"onUpdate:itemSize":r[1]||=e=>g.value=e,"column-count":j.value,"onUpdate:columnCount":r[2]||=e=>j.value=e,"column-width":M.value,"onUpdate:columnWidth":r[3]||=e=>M.value=e,"buffer-before":N.value,"onUpdate:bufferBefore":r[4]||=e=>N.value=e,"buffer-after":P.value,"onUpdate:bufferAfter":r[5]||=e=>P.value=e,"sticky-header":F.value,"onUpdate:stickyHeader":r[6]||=e=>F.value=e,"sticky-footer":I.value,"onUpdate:stickyFooter":r[7]||=e=>I.value=e,direction:`both`,onScrollToIndex:W,onScrollToOffset:G,onRefresh:r[8]||=e=>B.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:a(()=>[v(t(S),{ref_key:`virtualScrollRef`,ref:B,debug:t(H),class:`bg-base-100`,direction:`both`,items:t(R),"item-size":g.value,"column-count":j.value,"column-width":L.value,"buffer-before":N.value,"buffer-after":P.value,"sticky-header":F.value,"sticky-footer":I.value,"ssr-range":t(z),onScroll:U},y({item:a(({index:e,columnRange:t,getColumnWidth:n})=>[(p(),u(`div`,{key:`r_${e}`,class:`h-full flex items-stretch border-b border-base-200`},[l(`div`,{class:`shrink-0`,style:i({inlineSize:`${t.padStart}px`})},null,4),(p(!0),u(f,null,o(t.end-t.start,r=>(p(),u(`div`,{key:`r_${e}_c_${t.start+r-1}`,"data-col-index":t.start+r-1,class:`flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors`,style:i({inlineSize:`${n(t.start+r-1)}px`})},[l(`div`,O,`Row `+c(e),1),l(`div`,k,`Col `+c(t.start+r-1),1),l(`div`,A,c(n(t.start+r-1))+`px`,1)],12,D))),128)),l(`div`,{class:`shrink-0`,style:i({inlineSize:`${t.padEnd}px`})},null,4)]))]),_:2},[F.value?{name:`header`,fn:a(()=>[r[19]||=l(`div`,{class:`bg-primary text-primary-content p-4 border-b border-primary-focus`},` GRID HEADER (Row 0 is visible below this) `,-1)]),key:`0`}:void 0,I.value?{name:`footer`,fn:a(()=>[r[20]||=l(`div`,{class:`bg-secondary text-secondary-content p-4 border-t border-secondary-focus font-bold text-center`},` GRID FOOTER (End of grid) `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`,`ssr-range`])]),_:1},8,[`code`]))}}),M=e({default:()=>N},1),N=j;const P={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:{server:!0}}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:m}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-ssr/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:M}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:g}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-ssr/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Grid SSR | Virtual Scroll`}}};export{P as configValuesSerialized};