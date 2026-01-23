import{t as e}from"../chunks/chunk-CWRknLO5.js";import{C as t,D as n,G as r,H as i,M as a,N as o,R as s,T as c,V as l,W as u,_ as d,b as f,g as p,h as m,o as h,t as g,v as _,w as v,x as y}from"../chunks/chunk-Bbo8JVN3.js";import"../chunks/chunk-IpJMSSJ3.js";/* empty css                      */import{n as b}from"../chunks/chunk-C48dLvpu.js";/* empty css                      *//* empty css                      */import{t as x}from"../chunks/chunk-za9iMR0L.js";import{t as S}from"../chunks/chunk-BL_-ooPU.js";import{t as C}from"../chunks/chunk-qTiVgRrj.js";var w=`<script setup lang="ts">
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
`,T={class:`flex flex-wrap gap-4 items-start`},E=[`data-col-index`],D={class:`example-badge mb-2`},O={class:`opacity-40 tabular-nums`},k=c({__name:`+Page`,setup(e){let c=l(1e3),h=l(80),g=l(100),k=l(100),A=l(5),j=l(5),M=l(!1),N=l(!1),P=p(()=>[k.value,Math.ceil(k.value*1.5)]),F=p(()=>Array.from({length:c.value},(e,t)=>({id:t}))),I=l(),L=l(null),R=n(`debugMode`,l(!1));function z(e){L.value=e}function B(e,t,n){I.value?.scrollToIndex(e,t,n)}function V(e,t){I.value?.scrollToOffset(e,t)}return(e,n)=>(a(),_(x,{code:i(w)},{title:s(()=>[...n[9]||=[d(`span`,{class:`example-title example-title--group-4`},`Grid Fixed`,-1)]]),description:s(()=>[t(` Simultaneously virtualizes `+r(c.value.toLocaleString())+` rows and `+r(g.value.toLocaleString())+` columns. Uses fixed `,1),n[10]||=d(`strong`,null,`itemSize`,-1),t(` (`+r(h.value)+`px) and alternating `,1),n[11]||=d(`strong`,null,`columnWidth`,-1),n[12]||=t(` values. Panning in any direction maintains high performance. `,-1)]),icon:s(()=>[...n[13]||=[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-4`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`})],-1)]]),subtitle:s(()=>[...n[14]||=[t(` Bidirectional scrolling with uniform dimensions `,-1)]]),controls:s(()=>[d(`div`,T,[v(C,{"scroll-details":L.value,direction:`both`,"column-range":I.value?.columnRange},null,8,[`scroll-details`,`column-range`]),v(S,{"item-count":c.value,"onUpdate:itemCount":n[0]||=e=>c.value=e,"item-size":h.value,"onUpdate:itemSize":n[1]||=e=>h.value=e,"column-count":g.value,"onUpdate:columnCount":n[2]||=e=>g.value=e,"column-width":k.value,"onUpdate:columnWidth":n[3]||=e=>k.value=e,"buffer-before":A.value,"onUpdate:bufferBefore":n[4]||=e=>A.value=e,"buffer-after":j.value,"onUpdate:bufferAfter":n[5]||=e=>j.value=e,"sticky-header":M.value,"onUpdate:stickyHeader":n[6]||=e=>M.value=e,"sticky-footer":N.value,"onUpdate:stickyFooter":n[7]||=e=>N.value=e,direction:`both`,onScrollToIndex:B,onScrollToOffset:V,onRefresh:n[8]||=e=>I.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:s(()=>[v(i(b),{ref_key:`virtualScrollRef`,ref:I,debug:i(R),class:`example-container`,direction:`both`,items:F.value,"item-size":h.value,"column-count":g.value,"column-width":P.value,"buffer-before":A.value,"buffer-after":j.value,"sticky-header":M.value,"sticky-footer":N.value,onScroll:z},y({item:s(({index:e,columnRange:t,getColumnWidth:n})=>[(a(),f(`div`,{key:`r_${e}`,class:`example-grid-row`},[d(`div`,{class:`shrink-0`,style:u({inlineSize:`${t.padStart}px`})},null,4),(a(!0),f(m,null,o(t.end-t.start,i=>(a(),f(`div`,{key:`r_${e}_c_${t.start+i-1}`,"data-col-index":t.start+i-1,class:`example-grid-cell`,style:u({inlineSize:`${n(t.start+i-1)}px`})},[d(`div`,D,`R`+r(e)+` × C`+r(t.start+i-1),1),d(`div`,O,r(n(t.start+i-1))+`px`,1)],12,E))),128)),d(`div`,{class:`shrink-0`,style:u({inlineSize:`${t.padEnd}px`})},null,4)]))]),_:2},[M.value?{name:`header`,fn:s(()=>[n[15]||=d(`div`,{class:`example-sticky-header`},` Grid Header `,-1)]),key:`0`}:void 0,N.value?{name:`footer`,fn:s(()=>[n[16]||=d(`div`,{class:`example-sticky-footer`},` End of Grid `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),A=e({default:()=>j},1),j=k;const M={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:h}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-grid-fixed/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:A}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:g}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-grid-fixed/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Grid Fixed | Virtual Scroll`}}};export{M as configValuesSerialized};