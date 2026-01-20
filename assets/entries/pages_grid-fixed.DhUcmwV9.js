import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{C as t,D as n,G as r,H as i,K as a,N as o,P as s,T as c,U as l,_ as u,b as d,g as f,h as p,o as m,t as h,v as g,w as _,x as v,z as y}from"../chunks/chunk-BlgwXZRf.js";import"../chunks/chunk-CTpTqTDb.js";import{n as b}from"../chunks/chunk-C0NP2mKO.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as x,t as S}from"../chunks/chunk-Ckjm4Aul.js";import{t as C}from"../chunks/chunk-ETTdm7vE.js";var w=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const itemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

const columnWidths = computed(() => [ columnWidth.value, Math.ceil(columnWidth.value * 1.5) ]);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
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
      <span class="example-title example-title--group-4">Grid Fixed</span>
    </template>

    <template #description>
      Simultaneously virtualizes {{ itemCount.toLocaleString() }} rows and {{ columnCount.toLocaleString() }} columns. Uses fixed <strong>itemSize</strong> ({{ itemSize }}px) and alternating <strong>columnWidth</strong> values. Panning in any direction maintains high performance.
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
      Bidirectional scrolling with uniform dimensions
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
`,T={class:`flex flex-wrap gap-4 items-start`},E=[`data-col-index`],D={class:`example-badge mb-2`},O={class:`opacity-40 tabular-nums`},k=c({__name:`+Page`,setup(e){let c=i(1e3),m=i(80),h=i(100),k=i(100),A=i(5),j=i(5),M=i(!1),N=i(!1),P=f(()=>[k.value,Math.ceil(k.value*1.5)]),F=f(()=>Array.from({length:c.value},(e,t)=>({id:t}))),I=i(),L=i(null),R=n(`debugMode`,i(!1));function z(e){L.value=e}function B(e,t,n){I.value?.scrollToIndex(e,t,n)}function V(e,t){I.value?.scrollToOffset(e,t)}return(e,n)=>(o(),g(x,{code:l(w)},{title:y(()=>[...n[9]||=[u(`span`,{class:`example-title example-title--group-4`},`Grid Fixed`,-1)]]),description:y(()=>[t(` Simultaneously virtualizes `+a(c.value.toLocaleString())+` rows and `+a(h.value.toLocaleString())+` columns. Uses fixed `,1),n[10]||=u(`strong`,null,`itemSize`,-1),t(` (`+a(m.value)+`px) and alternating `,1),n[11]||=u(`strong`,null,`columnWidth`,-1),n[12]||=t(` values. Panning in any direction maintains high performance. `,-1)]),icon:y(()=>[...n[13]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-4`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`})],-1)]]),subtitle:y(()=>[...n[14]||=[t(` Bidirectional scrolling with uniform dimensions `,-1)]]),controls:y(()=>[u(`div`,T,[_(S,{"scroll-details":L.value,direction:`both`,"column-range":I.value?.columnRange},null,8,[`scroll-details`,`column-range`]),_(C,{"item-count":c.value,"onUpdate:itemCount":n[0]||=e=>c.value=e,"item-size":m.value,"onUpdate:itemSize":n[1]||=e=>m.value=e,"column-count":h.value,"onUpdate:columnCount":n[2]||=e=>h.value=e,"column-width":k.value,"onUpdate:columnWidth":n[3]||=e=>k.value=e,"buffer-before":A.value,"onUpdate:bufferBefore":n[4]||=e=>A.value=e,"buffer-after":j.value,"onUpdate:bufferAfter":n[5]||=e=>j.value=e,"sticky-header":M.value,"onUpdate:stickyHeader":n[6]||=e=>M.value=e,"sticky-footer":N.value,"onUpdate:stickyFooter":n[7]||=e=>N.value=e,direction:`both`,onScrollToIndex:B,onScrollToOffset:V,onRefresh:n[8]||=e=>I.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:y(()=>[_(l(b),{ref_key:`virtualScrollRef`,ref:I,debug:l(R),class:`example-container`,direction:`both`,items:F.value,"item-size":m.value,"column-count":h.value,"column-width":P.value,"buffer-before":A.value,"buffer-after":j.value,"sticky-header":M.value,"sticky-footer":N.value,onScroll:z},v({item:y(({index:e,columnRange:t,getColumnWidth:n})=>[(o(),d(`div`,{key:`r_${e}`,class:`example-grid-row`},[u(`div`,{class:`shrink-0`,style:r({inlineSize:`${t.padStart}px`})},null,4),(o(!0),d(p,null,s(t.end-t.start,i=>(o(),d(`div`,{key:`r_${e}_c_${t.start+i-1}`,"data-col-index":t.start+i-1,class:`example-grid-cell`,style:r({inlineSize:`${n(t.start+i-1)}px`})},[u(`div`,D,`R`+a(e)+` × C`+a(t.start+i-1),1),u(`div`,O,a(n(t.start+i-1))+`px`,1)],12,E))),128)),u(`div`,{class:`shrink-0`,style:r({inlineSize:`${t.padEnd}px`})},null,4)]))]),_:2},[M.value?{name:`header`,fn:y(()=>[n[15]||=u(`div`,{class:`example-sticky-header`},` Grid Header `,-1)]),key:`0`}:void 0,N.value?{name:`footer`,fn:y(()=>[n[16]||=u(`div`,{class:`example-sticky-footer`},` End of Grid `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),A=e({default:()=>j},1),j=k;const M={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:m}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-fixed/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:A}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:h}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-fixed/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Grid Fixed | Virtual Scroll`}}};export{M as configValuesSerialized};