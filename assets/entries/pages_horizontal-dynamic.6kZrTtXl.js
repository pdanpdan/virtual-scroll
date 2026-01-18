import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,L as i,M as a,T as o,U as s,V as c,W as l,_ as u,g as d,o as f,t as p,v as m,w as h}from"../chunks/chunk-CeuQGv84.js";import"../chunks/chunk-CTpTqTDb.js";import"../chunks/chunk-CNwi8UUp.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as g,r as _,t as v}from"../chunks/chunk-BwNxEjWN.js";/* empty css                      */import{t as y}from"../chunks/chunk-D9C0HK2D.js";var b=`<script setup lang="ts">
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
      <span class="text-accent font-bold uppercase opacity-90 pe-2 align-baseline">Horizontal Dynamic</span>
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
            <span class="text-xs opacity-90">{{ item.text2 }}</span>
          </span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`flex flex-wrap gap-2 md:gap-4 items-start`},S={class:`h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center`},C={class:`badge badge-neutral mb-4`},w={class:`text-xs opacity-90`},T=o({__name:`+Page`,setup(e){let o=t(1e3),f=t(150),p=t(20),T=t(20),E=d(()=>{let e=f.value;return(t,n)=>n%2==0?e:e*2}),D=d(()=>Array.from({length:o.value},(e,t)=>({id:t,text1:`Dynamic Item ${t}`,text2:`Width: ${E.value(null,t)}px`}))),O=t(),k=t(null),A=r(`debugMode`,t(!1));function j(e){k.value=e}function M(e,t,n){O.value?.scrollToIndex(e,t,n)}function N(e,t){O.value?.scrollToOffset(e,t)}return(e,t)=>(a(),m(g,{height:`300px`,code:c(b)},{title:i(()=>[...t[5]||=[u(`span`,{class:`text-accent font-bold uppercase opacity-90 pe-2 align-baseline`},`Horizontal Dynamic`,-1)]]),description:i(()=>[n(` Horizontal scrolling with `+l(o.value.toLocaleString())+` items with different widths measured via `,1),t[6]||=u(`strong`,null,`ResizeObserver`,-1),n(`. Even items are `+l(f.value)+`px, odd items are `+l(f.value*2)+`px. Try resizing the container! `,1)]),icon:i(()=>[...t[7]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-accent text-accent-content shadow-lg`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`,class:`-rotate-90 origin-center`})],-1)]]),subtitle:i(()=>[...t[8]||=[n(` Horizontal scrolling with variable item widths `,-1)]]),controls:i(()=>[u(`div`,x,[h(v,{"scroll-details":k.value,direction:`horizontal`},null,8,[`scroll-details`]),h(y,{"item-count":o.value,"onUpdate:itemCount":t[0]||=e=>o.value=e,"item-size":f.value,"onUpdate:itemSize":t[1]||=e=>f.value=e,"buffer-before":p.value,"onUpdate:bufferBefore":t[2]||=e=>p.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":t[3]||=e=>T.value=e,direction:`horizontal`,onScrollToIndex:M,onScrollToOffset:N,onRefresh:t[4]||=e=>O.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:i(()=>[h(c(_),{ref_key:`virtualScrollRef`,ref:O,debug:c(A),class:`bg-base-100`,direction:`horizontal`,items:D.value,"default-item-size":150,"buffer-before":p.value,"buffer-after":T.value,onScroll:j},{item:i(({item:e,index:r})=>[u(`div`,S,[u(`span`,C,`#`+l(r),1),u(`span`,{class:`font-medium`,style:s({inlineSize:`${E.value(null,r)}px`})},[n(l(e.text1),1),t[9]||=u(`br`,null,null,-1),u(`span`,w,l(e.text2),1)],4)])]),_:1},8,[`debug`,`items`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/horizontal-dynamic/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:p}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/horizontal-dynamic/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Horizontal Dynamic | Virtual Scroll`}}};export{O as configValuesSerialized};