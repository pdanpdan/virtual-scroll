import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,H as i,I as a,T as o,U as s,_ as c,g as l,j as u,o as d,t as f,v as p,w as m,z as h}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as g,r as _,t as v}from"../chunks/chunk-QhD4z3cW.js";/* empty css                      *//* empty css                      */import{t as y}from"../chunks/chunk-v7-rDw7-.js";var b=`<script setup lang="ts">
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
      <span class="text-accent font-bold uppercase opacity-60 pe-2 align-baseline">Horizontal Dynamic</span>
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
        class="size-12 p-2 rounded-xl bg-accent text-accent-content shadow-lg"
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
      class="bg-base-100"
      direction="horizontal"
      :items="items"
      :default-item-size="150"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center">
          <span class="badge badge-neutral mb-4">#{{ index }}</span>
          <span class="font-medium" :style="{ inlineSize: \`\${ itemSizeFn(null, index) }px\` }">
            {{ item.text1 }}<br />
            <span class="text-xs opacity-50">{{ item.text2 }}</span>
          </span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`flex flex-wrap gap-2 md:gap-4 items-start`},S={class:`h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center`},C={class:`badge badge-neutral mb-4`},w={class:`text-xs opacity-50`},T=o({__name:`+Page`,setup(e){let o=h(1e3),d=h(150),f=h(20),T=h(20),E=l(()=>{let e=d.value;return(t,n)=>n%2==0?e:e*2}),D=l(()=>Array.from({length:o.value},(e,t)=>({id:t,text1:`Dynamic Item ${t}`,text2:`Width: ${E.value(null,t)}px`}))),O=h(),k=h(null),A=r(`debugMode`,h(!1));function j(e){k.value=e}function M(e,t,n){O.value?.scrollToIndex(e,t,n)}function N(e,t){O.value?.scrollToOffset(e,t)}return(e,r)=>(u(),p(g,{height:`300px`,code:t(b)},{title:a(()=>[...r[5]||=[c(`span`,{class:`text-accent font-bold uppercase opacity-60 pe-2 align-baseline`},`Horizontal Dynamic`,-1)]]),description:a(()=>[n(` Horizontal scrolling with `+s(o.value.toLocaleString())+` items with different widths measured via `,1),r[6]||=c(`strong`,null,`ResizeObserver`,-1),n(`. Even items are `+s(d.value)+`px, odd items are `+s(d.value*2)+`px. Try resizing the container! `,1)]),icon:a(()=>[...r[7]||=[c(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-accent text-accent-content shadow-lg`},[c(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`,class:`-rotate-90 origin-center`})],-1)]]),subtitle:a(()=>[...r[8]||=[n(` Horizontal scrolling with variable item widths `,-1)]]),controls:a(()=>[c(`div`,x,[m(v,{"scroll-details":k.value,direction:`horizontal`},null,8,[`scroll-details`]),m(y,{"item-count":o.value,"onUpdate:itemCount":r[0]||=e=>o.value=e,"item-size":d.value,"onUpdate:itemSize":r[1]||=e=>d.value=e,"buffer-before":f.value,"onUpdate:bufferBefore":r[2]||=e=>f.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":r[3]||=e=>T.value=e,direction:`horizontal`,onScrollToIndex:M,onScrollToOffset:N,onRefresh:r[4]||=e=>O.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:a(()=>[m(t(_),{ref_key:`virtualScrollRef`,ref:O,debug:t(A),class:`bg-base-100`,direction:`horizontal`,items:D.value,"default-item-size":150,"buffer-before":f.value,"buffer-after":T.value,onScroll:j},{item:a(({item:e,index:t})=>[c(`div`,S,[c(`span`,C,`#`+s(t),1),c(`span`,{class:`font-medium`,style:i({inlineSize:`${E.value(null,t)}px`})},[n(s(e.text1),1),r[9]||=c(`br`,null,null,-1),c(`span`,w,s(e.text2),1)],4)])]),_:1},8,[`debug`,`items`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/horizontal-dynamic/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/horizontal-dynamic/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Horizontal Dynamic | Virtual Scroll`}}};export{O as configValuesSerialized};