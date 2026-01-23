import{t as e}from"../chunks/chunk-CWRknLO5.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,V as c,W as l,_ as u,g as d,o as f,t as p,v as m,w as h}from"../chunks/chunk-Bbo8JVN3.js";import"../chunks/chunk-IpJMSSJ3.js";/* empty css                      */import{n as g}from"../chunks/chunk-BW4At0r8.js";/* empty css                      *//* empty css                      */import{t as _}from"../chunks/chunk-DYvhkp1A.js";import{t as v}from"../chunks/chunk-BL_-ooPU.js";import{t as y}from"../chunks/chunk-qTiVgRrj.js";var b=`<script setup lang="ts">
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
`,x={class:`flex flex-wrap gap-2 md:gap-4 items-start`},S={class:`example-horizontal-item px-4`},C={class:`example-badge mb-4`},w={class:`text-xs small-caps tracking-widest opacity-50`},T=s({__name:`+Page`,setup(e){let s=c(1e3),f=c(150),p=c(20),T=c(20),E=d(()=>{let e=f.value;return(t,n)=>n%2==0?e:e*2}),D=d(()=>Array.from({length:s.value},(e,t)=>({id:t,text1:`Dynamic Item ${t}`,text2:`Width: ${E.value(null,t)}px`}))),O=c(),k=c(null),A=n(`debugMode`,c(!1));function j(e){k.value=e}function M(e,t,n){O.value?.scrollToIndex(e,t,n)}function N(e,t){O.value?.scrollToOffset(e,t)}return(e,n)=>(a(),m(_,{height:`300px`,code:i(b)},{title:o(()=>[...n[5]||=[u(`span`,{class:`example-title example-title--group-3`},`Horizontal Dynamic`,-1)]]),description:o(()=>[t(` Horizontal scrolling with `+r(s.value.toLocaleString())+` items with different widths measured via `,1),n[6]||=u(`strong`,null,`ResizeObserver`,-1),t(`. Even items are `+r(f.value)+`px, odd items are `+r(f.value*2)+`px. Try resizing the container! `,1)]),icon:o(()=>[...n[7]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-3`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`,class:`-rotate-90 origin-center`})],-1)]]),subtitle:o(()=>[...n[8]||=[t(` Horizontal scrolling with variable item widths `,-1)]]),controls:o(()=>[u(`div`,x,[h(y,{"scroll-details":k.value,direction:`horizontal`},null,8,[`scroll-details`]),h(v,{"item-count":s.value,"onUpdate:itemCount":n[0]||=e=>s.value=e,"item-size":f.value,"onUpdate:itemSize":n[1]||=e=>f.value=e,"buffer-before":p.value,"onUpdate:bufferBefore":n[2]||=e=>p.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":n[3]||=e=>T.value=e,direction:`horizontal`,onScrollToIndex:M,onScrollToOffset:N,onRefresh:n[4]||=e=>O.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:o(()=>[h(i(g),{ref_key:`virtualScrollRef`,ref:O,debug:i(A),class:`example-container`,direction:`horizontal`,items:D.value,"default-item-size":150,"buffer-before":p.value,"buffer-after":T.value,onScroll:j},{item:o(({item:e,index:t})=>[u(`div`,S,[u(`span`,C,`#`+r(t),1),u(`div`,{class:`font-bold text-sm mb-1`,style:l({inlineSize:`${E.value(null,t)}px`})},r(e.text1),5),u(`div`,w,r(e.text2),1)])]),_:1},8,[`debug`,`items`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-horizontal-dynamic/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:p}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-horizontal-dynamic/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Horizontal Dynamic | Virtual Scroll`}}};export{O as configValuesSerialized};