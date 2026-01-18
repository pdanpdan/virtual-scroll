import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,H as i,I as a,M as o,T as s,U as c,V as l,_ as u,b as d,g as f,h as p,j as m,o as h,t as g,v as _,w as v,x as y,z as b}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as x,r as S,t as C}from"../chunks/chunk-B7wtXgO1.js";/* empty css                      *//* empty css                      */import{t as w}from"../chunks/chunk-v7-rDw7-.js";var T=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const baseItemSize = ref(80);
const columnCount = ref(100);
const columnWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

// Use a deterministic function for column width: first column 300px, others alternate 100/150
const columnWidthFn = computed(() => {
  const base = columnWidth.value;
  return (index: number) => {
    if (index === 0) {
      return base * 3;
    }
    return index % 2 === 0 ? base : Math.ceil(base * 1.5);
  };
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
})));

const stickyIndices = computed(() => {
  const indices: number[] = [];
  for (let i = 100; i < itemCount.value; i += 100) {
    indices.push(i);
  }
  return indices;
});

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
      <span class="text-info font-bold uppercase opacity-60 pe-2 align-baseline">Grid Dynamic</span>
    </template>

    <template #description>
      Simultaneously virtualizes {{ itemCount.toLocaleString() }} rows and {{ columnCount.toLocaleString() }} columns. Uses <strong>querySelectorAll('[data-col-index]')</strong> to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically.
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
      Bidirectional scrolling with automatic measurement
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
          v-model:item-size="baseItemSize"
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
      :column-count="columnCount"
      :default-item-size="120"
      :default-column-width="120"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :sticky-indices="stickyIndices"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="bg-primary text-primary-content p-4 border-b border-primary-focus">
          GRID HEADER (Row 0 is visible below this)
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth, isSticky }">
        <div
          :key="\`r_\${ index }\`"
          class="h-full flex items-stretch border-b border-base-200"
          :class="isSticky ? 'bg-base-200' : ''"
          :style="{
            blockSize: \`\${ itemSizeFn(null, index) }px\`,
          }"
        >
          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padStart }px\` }" />

          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="\`r_\${ index }_c_\${ columnRange.start + c - 1 }\`"
            :data-col-index="columnRange.start + c - 1"
            class="flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors"
            :style="{ inlineSize: \`\${ columnWidthFn(columnRange.start + c - 1) }px\` }"
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
`,E={class:`flex flex-wrap gap-4 items-start`},D=[`data-col-index`],O={class:`text-xs uppercase opacity-40 font-bold mb-1`},k={class:`text-xs uppercase opacity-40 font-bold mb-1`},A={class:`text-xs opacity-40`},j=s({__name:`+Page`,setup(e){let s=b(1e3),h=b(80),g=b(100),j=b(100),M=b(5),N=b(5),P=b(!1),F=b(!1),I=f(()=>{let e=h.value;return(t,n)=>n%2==0?e:e*2}),L=f(()=>{let e=j.value;return t=>t===0?e*3:t%2==0?e:Math.ceil(e*1.5)}),R=f(()=>Array.from({length:s.value},(e,t)=>({id:t}))),z=f(()=>{let e=[];for(let t=100;t<s.value;t+=100)e.push(t);return e}),B=b(),V=b(null),H=r(`debugMode`,b(!1));function U(e){V.value=e}function W(e,t,n){B.value?.scrollToIndex(e,t,n)}function G(e,t){B.value?.scrollToOffset(e,t)}return(e,r)=>(m(),_(x,{code:t(T)},{title:a(()=>[...r[9]||=[u(`span`,{class:`text-info font-bold uppercase opacity-60 pe-2 align-baseline`},`Grid Dynamic`,-1)]]),description:a(()=>[n(` Simultaneously virtualizes `+c(s.value.toLocaleString())+` rows and `+c(g.value.toLocaleString())+` columns. Uses `,1),r[10]||=u(`strong`,null,`querySelectorAll('[data-col-index]')`,-1),r[11]||=n(` to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically. `,-1)]),icon:a(()=>[...r[12]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-info text-info-content shadow-lg`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`})],-1)]]),subtitle:a(()=>[...r[13]||=[n(` Bidirectional scrolling with automatic measurement `,-1)]]),controls:a(()=>[u(`div`,E,[v(C,{"scroll-details":V.value,direction:`both`,"column-range":B.value?.columnRange},null,8,[`scroll-details`,`column-range`]),v(w,{"item-count":s.value,"onUpdate:itemCount":r[0]||=e=>s.value=e,"item-size":h.value,"onUpdate:itemSize":r[1]||=e=>h.value=e,"column-count":g.value,"onUpdate:columnCount":r[2]||=e=>g.value=e,"column-width":j.value,"onUpdate:columnWidth":r[3]||=e=>j.value=e,"buffer-before":M.value,"onUpdate:bufferBefore":r[4]||=e=>M.value=e,"buffer-after":N.value,"onUpdate:bufferAfter":r[5]||=e=>N.value=e,"sticky-header":P.value,"onUpdate:stickyHeader":r[6]||=e=>P.value=e,"sticky-footer":F.value,"onUpdate:stickyFooter":r[7]||=e=>F.value=e,direction:`both`,onScrollToIndex:W,onScrollToOffset:G,onRefresh:r[8]||=e=>B.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:a(()=>[v(t(S),{ref_key:`virtualScrollRef`,ref:B,debug:t(H),class:`bg-base-100`,direction:`both`,items:R.value,"column-count":g.value,"default-item-size":120,"default-column-width":120,"buffer-before":M.value,"buffer-after":N.value,"sticky-header":P.value,"sticky-footer":F.value,"sticky-indices":z.value,onScroll:U},y({item:a(({index:e,columnRange:t,getColumnWidth:n,isSticky:r})=>[(m(),d(`div`,{key:`r_${e}`,class:l([`h-full flex items-stretch border-b border-base-200`,r?`bg-base-200`:``]),style:i({blockSize:`${I.value(null,e)}px`})},[u(`div`,{class:`shrink-0`,style:i({inlineSize:`${t.padStart}px`})},null,4),(m(!0),d(p,null,o(t.end-t.start,r=>(m(),d(`div`,{key:`r_${e}_c_${t.start+r-1}`,"data-col-index":t.start+r-1,class:`flex flex-col items-center justify-center border-r border-base-200 shrink-0 hover:bg-base-300 transition-colors`,style:i({inlineSize:`${L.value(t.start+r-1)}px`})},[u(`div`,O,`Row `+c(e),1),u(`div`,k,`Col `+c(t.start+r-1),1),u(`div`,A,c(n(t.start+r-1))+`px`,1)],12,D))),128)),u(`div`,{class:`shrink-0`,style:i({inlineSize:`${t.padEnd}px`})},null,4)],6))]),_:2},[P.value?{name:`header`,fn:a(()=>[r[14]||=u(`div`,{class:`bg-primary text-primary-content p-4 border-b border-primary-focus`},` GRID HEADER (Row 0 is visible below this) `,-1)]),key:`0`}:void 0,F.value?{name:`footer`,fn:a(()=>[r[15]||=u(`div`,{class:`bg-secondary text-secondary-content p-4 border-t border-secondary-focus font-bold text-center`},` GRID FOOTER (End of grid) `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`column-count`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`,`sticky-indices`])]),_:1},8,[`code`]))}}),M=e({default:()=>N},1),N=j;const P={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:h}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-dynamic/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:M}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:g}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/grid-dynamic/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Grid Dynamic | Virtual Scroll`}}};export{P as configValuesSerialized};