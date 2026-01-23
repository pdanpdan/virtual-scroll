import{t as e}from"../chunks/chunk-v_CCr7DM.js";import{C as t,D as n,G as r,H as i,M as a,N as o,R as s,T as c,U as l,V as u,W as d,_ as f,b as p,g as m,h,o as g,t as _,v,w as y,x as b}from"../chunks/chunk-XKBqd3ij.js";import"../chunks/chunk-YW3sP-nK.js";import{n as x}from"../chunks/chunk-Dr456LUk.js";/* empty css                      *//* empty css                      *//* empty css                      */import{t as S}from"../chunks/chunk-Dmso7Mqj.js";import{t as C}from"../chunks/chunk-aY2R9Y7u.js";import{t as w}from"../chunks/chunk-CYaHQnmk.js";var T=`<script setup lang="ts">
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

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
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
      <span class="example-title example-title--group-4">Grid Dynamic</span>
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
        class="example-icon example-icon--group-4"
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
        <div class="example-sticky-header">
          Grid Header
        </div>
      </template>

      <template #item="{ index, columnRange, getColumnWidth, isStickyActive }">
        <div
          :key="\`r_\${ index }\`"
          class="example-grid-row"
          :class="{ 'example-grid-row--sticky': isStickyActive }"
        >
          <div class="shrink-0" :style="{ inlineSize: \`\${ columnRange.padStart }px\` }" />

          <div
            v-for="c in (columnRange.end - columnRange.start)"
            :key="\`r_\${ index }_c_\${ columnRange.start + c - 1 }\`"
            :data-col-index="columnRange.start + c - 1"
            class="example-grid-cell"
            :style=" {
              inlineSize: \`\${ columnWidthFn(columnRange.start + c - 1) }px\`,
              blockSize: \`\${ itemSizeFn(null, index) }px\`,
            } "
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
`,E={class:`flex flex-wrap gap-4 items-start`},D=[`data-col-index`],O={class:`example-badge mb-2`},k={class:`opacity-40 tabular-nums`},A=c({__name:`+Page`,setup(e){let c=u(1e3),g=u(80),_=u(100),A=u(100),j=u(5),M=u(5),N=u(!1),P=u(!1),F=m(()=>{let e=g.value;return(t,n)=>n%2==0?e:e*2}),I=m(()=>{let e=A.value;return t=>t===0?e*3:t%2==0?e:Math.ceil(e*1.5)}),L=m(()=>Array.from({length:c.value},(e,t)=>({id:t}))),R=m(()=>{let e=[];for(let t=100;t<c.value;t+=100)e.push(t);return e}),z=u(),B=u(null),V=n(`debugMode`,u(!1));function H(e){B.value=e}function U(e,t,n){z.value?.scrollToIndex(e,t,n)}function W(e,t){z.value?.scrollToOffset(e,t)}return(e,n)=>(a(),v(S,{code:i(T)},{title:s(()=>[...n[9]||=[f(`span`,{class:`example-title example-title--group-4`},`Grid Dynamic`,-1)]]),description:s(()=>[t(` Simultaneously virtualizes `+r(c.value.toLocaleString())+` rows and `+r(_.value.toLocaleString())+` columns. Uses `,1),n[10]||=f(`strong`,null,`querySelectorAll('[data-col-index]')`,-1),n[11]||=t(` to robustly detect column widths from any slot structure. Toggling buffers or resizing will re-measure automatically. `,-1)]),icon:s(()=>[...n[12]||=[f(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-4`},[f(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6.15a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z`})],-1)]]),subtitle:s(()=>[...n[13]||=[t(` Bidirectional scrolling with automatic measurement `,-1)]]),controls:s(()=>[f(`div`,E,[y(w,{"scroll-details":B.value,direction:`both`,"column-range":z.value?.columnRange},null,8,[`scroll-details`,`column-range`]),y(C,{"item-count":c.value,"onUpdate:itemCount":n[0]||=e=>c.value=e,"item-size":g.value,"onUpdate:itemSize":n[1]||=e=>g.value=e,"column-count":_.value,"onUpdate:columnCount":n[2]||=e=>_.value=e,"column-width":A.value,"onUpdate:columnWidth":n[3]||=e=>A.value=e,"buffer-before":j.value,"onUpdate:bufferBefore":n[4]||=e=>j.value=e,"buffer-after":M.value,"onUpdate:bufferAfter":n[5]||=e=>M.value=e,"sticky-header":N.value,"onUpdate:stickyHeader":n[6]||=e=>N.value=e,"sticky-footer":P.value,"onUpdate:stickyFooter":n[7]||=e=>P.value=e,direction:`both`,onScrollToIndex:U,onScrollToOffset:W,onRefresh:n[8]||=e=>z.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:s(()=>[y(i(x),{ref_key:`virtualScrollRef`,ref:z,debug:i(V),class:`example-container`,direction:`both`,items:L.value,"column-count":_.value,"default-item-size":120,"default-column-width":120,"buffer-before":j.value,"buffer-after":M.value,"sticky-header":N.value,"sticky-footer":P.value,"sticky-indices":R.value,onScroll:H},b({item:s(({index:e,columnRange:t,getColumnWidth:n,isStickyActive:i})=>[(a(),p(`div`,{key:`r_${e}`,class:l([`example-grid-row`,{"example-grid-row--sticky":i}])},[f(`div`,{class:`shrink-0`,style:d({inlineSize:`${t.padStart}px`})},null,4),(a(!0),p(h,null,o(t.end-t.start,i=>(a(),p(`div`,{key:`r_${e}_c_${t.start+i-1}`,"data-col-index":t.start+i-1,class:`example-grid-cell`,style:d({inlineSize:`${I.value(t.start+i-1)}px`,blockSize:`${F.value(null,e)}px`})},[f(`div`,O,`R`+r(e)+` × C`+r(t.start+i-1),1),f(`div`,k,r(n(t.start+i-1))+`px`,1)],12,D))),128)),f(`div`,{class:`shrink-0`,style:d({inlineSize:`${t.padEnd}px`})},null,4)],2))]),_:2},[N.value?{name:`header`,fn:s(()=>[n[14]||=f(`div`,{class:`example-sticky-header`},` Grid Header `,-1)]),key:`0`}:void 0,P.value?{name:`footer`,fn:s(()=>[n[15]||=f(`div`,{class:`example-sticky-footer`},` End of Grid `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`column-count`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`,`sticky-indices`])]),_:1},8,[`code`]))}}),j=e({default:()=>M},1),M=A;const N={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:g}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-grid-dynamic/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:j}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:_}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-grid-dynamic/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Grid Dynamic | Virtual Scroll`}}};export{N as configValuesSerialized};