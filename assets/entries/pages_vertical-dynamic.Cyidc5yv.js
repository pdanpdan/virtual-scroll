import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{C as t,D as n,G as r,H as i,K as a,N as o,T as s,U as c,_ as l,g as u,o as d,t as f,v as p,w as m,x as h,z as g}from"../chunks/chunk-BlgwXZRf.js";import"../chunks/chunk-CTpTqTDb.js";import{n as _}from"../chunks/chunk-C0NP2mKO.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as v,t as y}from"../chunks/chunk-Ckjm4Aul.js";import{t as b}from"../chunks/chunk-ETTdm7vE.js";var x=`<script setup lang="ts">
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

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
  return (_: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`Dynamic Item \${ i } (Height: \${ itemSizeFn.value(null, i) }px)\`,
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
      <span class="example-title example-title--group-1">Vertical Dynamic</span>
    </template>

    <template #description>
      Vertical scrolling with variable item heights for {{ itemCount.toLocaleString() }} items. Automatically measures item sizes using <strong>ResizeObserver</strong>. Even items are {{ itemSize }}px, odd items are {{ itemSize * 2 }}px.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25" />
      </svg>
    </template>

    <template #subtitle>
      Vertical scrolling with variable item heights
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
        <div class="example-vertical-item py-4">
          <span class="example-badge me-8">#{{ index }}</span>
          <div class="font-bold" :style="{ minBlockSize: \`\${ itemSizeFn(null, index) }px\` }">{{ item.text }}</div>
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
`,S={class:`flex flex-wrap gap-2 md:gap-4 items-start`},C={class:`example-vertical-item py-4`},w={class:`example-badge me-8`},T=s({__name:`+Page`,setup(e){let s=i(1e3),d=i(50),f=i(5),T=i(5),E=i(!1),D=i(!1),O=u(()=>{let e=d.value;return(t,n)=>n%2==0?e:e*2}),k=u(()=>Array.from({length:s.value},(e,t)=>({id:t,text:`Dynamic Item ${t} (Height: ${O.value(null,t)}px)`}))),A=i(),j=i(null),M=n(`debugMode`,i(!1));function N(e){j.value=e}function P(e,t,n){A.value?.scrollToIndex(e,t,n)}function F(e,t){A.value?.scrollToOffset(e,t)}return(e,n)=>(o(),p(v,{code:c(x)},{title:g(()=>[...n[7]||=[l(`span`,{class:`example-title example-title--group-1`},`Vertical Dynamic`,-1)]]),description:g(()=>[t(` Vertical scrolling with variable item heights for `+a(s.value.toLocaleString())+` items. Automatically measures item sizes using `,1),n[8]||=l(`strong`,null,`ResizeObserver`,-1),t(`. Even items are `+a(d.value)+`px, odd items are `+a(d.value*2)+`px. `,1)]),icon:g(()=>[...n[9]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-1`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25`})],-1)]]),subtitle:g(()=>[...n[10]||=[t(` Vertical scrolling with variable item heights `,-1)]]),controls:g(()=>[l(`div`,S,[m(y,{"scroll-details":j.value,direction:`vertical`},null,8,[`scroll-details`]),m(b,{"item-count":s.value,"onUpdate:itemCount":n[0]||=e=>s.value=e,"item-size":d.value,"onUpdate:itemSize":n[1]||=e=>d.value=e,"buffer-before":f.value,"onUpdate:bufferBefore":n[2]||=e=>f.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":n[3]||=e=>T.value=e,"sticky-header":E.value,"onUpdate:stickyHeader":n[4]||=e=>E.value=e,"sticky-footer":D.value,"onUpdate:stickyFooter":n[5]||=e=>D.value=e,direction:`vertical`,onScrollToIndex:P,onScrollToOffset:F,onRefresh:n[6]||=e=>A.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:g(()=>[m(c(_),{ref_key:`virtualScrollRef`,ref:A,debug:c(M),class:`example-container`,items:k.value,"buffer-before":f.value,"buffer-after":T.value,"sticky-header":E.value,"sticky-footer":D.value,onScroll:N},h({item:g(({item:e,index:t})=>[l(`div`,C,[l(`span`,w,`#`+a(t),1),l(`div`,{class:`font-bold`,style:r({minBlockSize:`${O.value(null,t)}px`})},a(e.text),5)])]),_:2},[E.value?{name:`header`,fn:g(()=>[n[11]||=l(`div`,{class:`example-sticky-header`},` Sticky Header `,-1)]),key:`0`}:void 0,D.value?{name:`footer`,fn:g(()=>[n[12]||=l(`div`,{class:`example-sticky-footer`},` Sticky Footer `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-dynamic/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-dynamic/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Dynamic | Virtual Scroll`}}};export{O as configValuesSerialized};