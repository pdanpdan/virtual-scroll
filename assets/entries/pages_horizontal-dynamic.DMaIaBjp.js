import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{C as t,D as n,G as r,H as i,K as a,N as o,T as s,U as c,_ as l,g as u,o as d,t as f,v as p,w as m,z as h}from"../chunks/chunk-BlgwXZRf.js";import"../chunks/chunk-CTpTqTDb.js";import{n as g}from"../chunks/chunk-C0NP2mKO.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as _,t as v}from"../chunks/chunk-Ckjm4Aul.js";import{t as y}from"../chunks/chunk-ETTdm7vE.js";var b=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const baseItemSize = ref(150);
const bufferBefore = ref(20);
const bufferAfter = ref(20);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text1: \`Dynamic Item \${ i }\`,
  text2: \`Width: \${ itemSizeFn.value(null, i) }px\`,
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
  <ExampleContainer height="300px" :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-3">Horizontal Dynamic</span>
    </template>

    <template #description>
      Horizontal scrolling with {{ itemCount.toLocaleString() }} items with different widths measured via <strong>ResizeObserver</strong>. Even items are {{ baseItemSize }}px, odd items are {{ baseItemSize * 2 }}px. Try resizing the container!
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" class="-rotate-90 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Horizontal scrolling with variable item widths
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="horizontal" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="baseItemSize"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          direction="horizontal"
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
      direction="horizontal"
      :items="items"
      :default-item-size="150"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-horizontal-item px-4">
          <span class="example-badge mb-4">#{{ index }}</span>
          <div class="font-bold text-sm mb-1" :style="{ inlineSize: \`\${ itemSizeFn(null, index) }px\` }">
            {{ item.text1 }}
          </div>
          <div class="text-xs small-caps tracking-widest opacity-50">{{ item.text2 }}</div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`flex flex-wrap gap-2 md:gap-4 items-start`},S={class:`example-horizontal-item px-4`},C={class:`example-badge mb-4`},w={class:`text-xs small-caps tracking-widest opacity-50`},T=s({__name:`+Page`,setup(e){let s=i(1e3),d=i(150),f=i(20),T=i(20),E=u(()=>{let e=d.value;return(t,n)=>n%2==0?e:e*2}),D=u(()=>Array.from({length:s.value},(e,t)=>({id:t,text1:`Dynamic Item ${t}`,text2:`Width: ${E.value(null,t)}px`}))),O=i(),k=i(null),A=n(`debugMode`,i(!1));function j(e){k.value=e}function M(e,t,n){O.value?.scrollToIndex(e,t,n)}function N(e,t){O.value?.scrollToOffset(e,t)}return(e,n)=>(o(),p(_,{height:`300px`,code:c(b)},{title:h(()=>[...n[5]||=[l(`span`,{class:`example-title example-title--group-3`},`Horizontal Dynamic`,-1)]]),description:h(()=>[t(` Horizontal scrolling with `+a(s.value.toLocaleString())+` items with different widths measured via `,1),n[6]||=l(`strong`,null,`ResizeObserver`,-1),t(`. Even items are `+a(d.value)+`px, odd items are `+a(d.value*2)+`px. Try resizing the container! `,1)]),icon:h(()=>[...n[7]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-3`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`,class:`-rotate-90 origin-center`})],-1)]]),subtitle:h(()=>[...n[8]||=[t(` Horizontal scrolling with variable item widths `,-1)]]),controls:h(()=>[l(`div`,x,[m(v,{"scroll-details":k.value,direction:`horizontal`},null,8,[`scroll-details`]),m(y,{"item-count":s.value,"onUpdate:itemCount":n[0]||=e=>s.value=e,"item-size":d.value,"onUpdate:itemSize":n[1]||=e=>d.value=e,"buffer-before":f.value,"onUpdate:bufferBefore":n[2]||=e=>f.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":n[3]||=e=>T.value=e,direction:`horizontal`,onScrollToIndex:M,onScrollToOffset:N,onRefresh:n[4]||=e=>O.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:h(()=>[m(c(g),{ref_key:`virtualScrollRef`,ref:O,debug:c(A),class:`example-container`,direction:`horizontal`,items:D.value,"default-item-size":150,"buffer-before":f.value,"buffer-after":T.value,onScroll:j},{item:h(({item:e,index:t})=>[l(`div`,S,[l(`span`,C,`#`+a(t),1),l(`div`,{class:`font-bold text-sm mb-1`,style:r({inlineSize:`${E.value(null,t)}px`})},a(e.text1),5),l(`div`,w,a(e.text2),1)])]),_:1},8,[`debug`,`items`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/horizontal-dynamic/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/horizontal-dynamic/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Horizontal Dynamic | Virtual Scroll`}}};export{O as configValuesSerialized};