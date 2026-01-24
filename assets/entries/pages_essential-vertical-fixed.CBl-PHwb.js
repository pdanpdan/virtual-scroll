import{t as e}from"../chunks/chunk-BYR07lV1.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,V as c,_ as l,g as u,o as d,t as f,v as p,w as m,x as h}from"../chunks/chunk-DQ_YCHvG.js";import"../chunks/chunk-DxZ6SkEg.js";/* empty css                      */import{n as g}from"../chunks/chunk-UeDLoRz3.js";/* empty css                      *//* empty css                      */import{t as _}from"../chunks/chunk-CFHiRfoq.js";import{t as v}from"../chunks/chunk-Be2vN0EQ.js";import{t as y}from"../chunks/chunk-2Cb9wrQN.js";var b=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const itemSize = ref(50);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`Fixed Item \${ i }\`,
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
      <span class="example-title example-title--group-1">Vertical Fixed</span>
    </template>

    <template #description>
      Optimized for {{ itemCount.toLocaleString() }} items where every item has the same height. Items are only rendered when they enter the visible viewport. Row height is fixed at {{ itemSize }}px.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Standard vertical scrolling with uniform item heights
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
      class="example-container"
      :items="items"
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="example-sticky-header">
          Sticky Header
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-8">#{{ index }}</span>
          <span class="font-bold">{{ item.text }}</span>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="example-sticky-footer">
          Sticky Footer
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`flex flex-wrap gap-2 md:gap-4 items-start`},S={class:`example-vertical-item example-vertical-item--fixed`},C={class:`example-badge me-8`},w={class:`font-bold`},T=s({__name:`+Page`,setup(e){let s=c(1e3),d=c(50),f=c(5),T=c(5),E=c(!1),D=c(!1),O=u(()=>Array.from({length:s.value},(e,t)=>({id:t,text:`Fixed Item ${t}`}))),k=c(),A=c(null),j=n(`debugMode`,c(!1));function M(e){A.value=e}function N(e,t,n){k.value?.scrollToIndex(e,t,n)}function P(e,t){k.value?.scrollToOffset(e,t)}return(e,n)=>(a(),p(_,{code:i(b)},{title:o(()=>[...n[7]||=[l(`span`,{class:`example-title example-title--group-1`},`Vertical Fixed`,-1)]]),description:o(()=>[t(` Optimized for `+r(s.value.toLocaleString())+` items where every item has the same height. Items are only rendered when they enter the visible viewport. Row height is fixed at `+r(d.value)+`px. `,1)]),icon:o(()=>[...n[8]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-1`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`})],-1)]]),subtitle:o(()=>[...n[9]||=[t(` Standard vertical scrolling with uniform item heights `,-1)]]),controls:o(()=>[l(`div`,x,[m(y,{"scroll-details":A.value,direction:`vertical`},null,8,[`scroll-details`]),m(v,{"item-count":s.value,"onUpdate:itemCount":n[0]||=e=>s.value=e,"item-size":d.value,"onUpdate:itemSize":n[1]||=e=>d.value=e,"buffer-before":f.value,"onUpdate:bufferBefore":n[2]||=e=>f.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":n[3]||=e=>T.value=e,"sticky-header":E.value,"onUpdate:stickyHeader":n[4]||=e=>E.value=e,"sticky-footer":D.value,"onUpdate:stickyFooter":n[5]||=e=>D.value=e,direction:`vertical`,onScrollToIndex:N,onScrollToOffset:P,onRefresh:n[6]||=e=>k.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:o(()=>[m(i(g),{ref_key:`virtualScrollRef`,ref:k,debug:i(j),class:`example-container`,items:O.value,"item-size":d.value,"buffer-before":f.value,"buffer-after":T.value,"sticky-header":E.value,"sticky-footer":D.value,onScroll:M},h({item:o(({item:e,index:t})=>[l(`div`,S,[l(`span`,C,`#`+r(t),1),l(`span`,w,r(e.text),1)])]),_:2},[E.value?{name:`header`,fn:o(()=>[n[10]||=l(`div`,{class:`example-sticky-header`},` Sticky Header `,-1)]),key:`0`}:void 0,D.value?{name:`footer`,fn:o(()=>[n[11]||=l(`div`,{class:`example-sticky-footer`},` Sticky Footer `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-vertical-fixed/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-vertical-fixed/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Fixed | Virtual Scroll`}}};export{O as configValuesSerialized};