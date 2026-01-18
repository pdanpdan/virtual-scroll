import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,H as i,I as a,M as o,T as s,U as c,_ as l,b as u,g as d,h as f,j as p,o as m,t as h,v as g,w as _,x as v,z as y}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as b,r as x,t as S}from"../chunks/chunk-B7wtXgO1.js";/* empty css                      *//* empty css                      */import{t as C}from"../chunks/chunk-v7-rDw7-.js";var w=`<script setup lang="ts">
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

const columnWidths = computed(() => [ Math.ceil(columnWidth.value * 1.5), columnWidth.value ]);

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
      <span class="text-info font-bold uppercase opacity-60 pe-2 align-baseline">Grid Fixed</span>
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
        class="size-12 p-2 rounded-xl bg-info text-info-content shadow-lg"
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
`,T={class:`flex flex-wrap gap-4 items-start`},E=[`data-col-index`],D={class:`text-xs uppercase opacity-40 font-bold mb-1`},O={class:`text-xs uppercase opacity-40 font-bold mb-1`},k={class:`text-xs opacity-40`},A=s({__name:`+Page`,setup(e){let s=y(1e3),m=y(80),h=y(100),A=y(100),j=y(5),M=y(5),N=y(!1),P=y(!1),F=d(()=>[Math.ceil(A.value*1.5),A.value]),I=d(()=>Array.from({length:s.value},(e,t)=>({id:t}))),L=y(),R=y(null),z=r(`debugMode`,y(!1));function B(e){R.value=e}function V(e,t,n){L.value?.scrollToIndex(e,t,n)}function H(e,t){L.value?.scrollToOffset(e,t)}return(e,r)=>(p(),g(b,{code:t(w)},{title:a(()=>[...r[9]||=[l(`span`,{class:`text-info font-bold uppercase opacity-60 pe-2 align-baseline`},`Grid Fixed`,-1)]]),description:a(()=>[n(` Simultaneously virtualizes `+c(s.value.toLocaleString())+` rows and `+c(h.value.toLocaleString())+` columns. Uses fixed `,1),r[10]||=l(`strong`,null,`itemSize`,-1),n(` (`+c(m.value)+`px) and alternating `,1),r[11]||=l(`strong`,null,`columnWidth`,-1),r[12]||=n(` values. Panning in any direction maintains high performance. `,-1)]),icon:a(()=>[...r[13]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-info text-info-content shadow-lg`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`})],-1)]]),subtitle:a(()=>[...r[14]||=[n(` Bidirectional scrolling with uniform dimensions `,-1)]]),controls:a(()=>[l(`div`,T,[_(S,{"scroll-details":R.value,direction:`both`,"column-range":L.value?.columnRange},null,8,[`scroll-details`,`column-range`]),_(C,{"item-count":s.value,"onUpdate:itemCount":r[0]||=e=>s.value=e,"item-size":m.value,"onUpdate:itemSize":r[1]||=e=>m.value=e,"column-count":h.value,"onUpdate:columnCount":r[2]||=e=>h.value=e,"column-width":A.value,"onUpdate:columnWidth":r[3]||=e=>A.value=e,"buffer-before":j.value,"onUpdate:bufferBefore":r[4]||=e=>j.value=e,"buffer-after":M.value,"onUpdate:bufferAfter":r[5]||=e=>M.value=e,"sticky-header":N.value,"onUpdate:stickyHeader":r[6]||=e=>N.value=e,"sticky-footer":P.value,"onUpdate:stickyFooter":r[7]||=e=>P.value=e,direction:`both`,onScrollToIndex:V,onScrollToOffset:H,onRefresh:r[8]||=e=>L.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:a(()=>[_(t(x),{ref_key:`virtualScrollRef`,ref:L,debug:t(z),class:`bg-base-100`,direction:`both`,items:I.value,"item-size":m.value,"column-count":h.value,"column-width":F.value,"buffer-before":j.value,"buffer-after":M.value,"sticky-header":N.value,"sticky-footer":P.value,onScroll:B},v({item:a(({index:e,columnRange:t,getColumnWidth:n})=>[(p(),u(`div`,{key:`r_${e}`,class:`h-full flex items-stretch border-b border-base-200`},[l(`div`,{class:`shrink-0`,style:i({inlineSize:`${t.padStart}px`})},null,4),(p(!0),u(f,null,o(t.end-t.start,r=>(p(),u(`div`,{key:`r_${e}_c_${t.start+r-1}`,"data-col-index":t.start+r-1,class:`flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors`,style:i({inlineSize:`${n(t.start+r-1)}px`})},[l(`div`,D,`Row `+c(e),1),l(`div`,O,`Col `+c(t.start+r-1),1),l(`div`,k,c(n(t.start+r-1))+`px`,1)],12,E))),128)),l(`div`,{class:`shrink-0`,style:i({inlineSize:`${t.padEnd}px`})},null,4)]))]),_:2},[N.value?{name:`header`,fn:a(()=>[r[15]||=l(`div`,{class:`bg-primary text-primary-content p-4 border-b border-primary-focus`},` GRID HEADER (Row 0 is visible below this) `,-1)]),key:`0`}:void 0,P.value?{name:`footer`,fn:a(()=>[r[16]||=l(`div`,{class:`bg-secondary text-secondary-content p-4 border-t border-secondary-focus font-bold text-center`},` GRID FOOTER (End of grid) `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),j=e({default:()=>M},1),M=A;const N={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:m}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-fixed/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:j}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:h}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-fixed/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Grid Fixed | Virtual Scroll`}}};export{N as configValuesSerialized};