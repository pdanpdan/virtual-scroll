import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,I as i,T as a,U as o,_ as s,g as c,j as l,o as u,t as d,v as f,w as p,z as m}from"../chunks/chunk-Cj2DfQl-.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as h,r as g,t as _}from"../chunks/chunk-COV_n11Q.js";/* empty css                      *//* empty css                      */import{t as v}from"../chunks/chunk-C9urrB3B.js";var y=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const itemSize = ref(100);
const bufferBefore = ref(20);
const bufferAfter = ref(20);

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
  <ExampleContainer height="350px" :code="rawCode">
    <template #title>
      <span class="text-accent font-bold uppercase opacity-60 pe-2 align-baseline">Horizontal Fixed</span>
    </template>

    <template #description>
      Optimized for {{ itemCount.toLocaleString() }} items where every item has the same width ({{ itemSize }}px). Row height is filled automatically. Default buffers are set to {{ bufferBefore }} for smoother horizontal panning.
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
      Horizontal scrolling with uniform item widths
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="horizontal" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="itemSize"
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
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="w-full h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center">
          <span class="badge badge-neutral mb-4">#{{ index }}</span>
          <span class="font-medium">{{ item.text }}</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,b={class:`flex flex-wrap gap-2 md:gap-4 items-start`},x={class:`w-full h-full flex flex-col items-center justify-center py-6 border-r border-base-200 hover:bg-base-300 transition-colors whitespace-normal text-center`},S={class:`badge badge-neutral mb-4`},C={class:`font-medium`},w=a({__name:`+Page`,setup(e){let a=m(1e3),u=m(100),d=m(20),w=m(20),T=c(()=>Array.from({length:a.value},(e,t)=>({id:t,text:`Fixed Item ${t}`}))),E=m(),D=m(null),O=r(`debugMode`,m(!1));function k(e){D.value=e}function A(e,t,n){E.value?.scrollToIndex(e,t,n)}function j(e,t){E.value?.scrollToOffset(e,t)}return(e,r)=>(l(),f(h,{height:`350px`,code:t(y)},{title:i(()=>[...r[5]||=[s(`span`,{class:`text-accent font-bold uppercase opacity-60 pe-2 align-baseline`},`Horizontal Fixed`,-1)]]),description:i(()=>[n(` Optimized for `+o(a.value.toLocaleString())+` items where every item has the same width (`+o(u.value)+`px). Row height is filled automatically. Default buffers are set to `+o(d.value)+` for smoother horizontal panning. `,1)]),icon:i(()=>[...r[6]||=[s(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-accent text-accent-content shadow-lg`},[s(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`,class:`-rotate-90 origin-center`})],-1)]]),subtitle:i(()=>[...r[7]||=[n(` Horizontal scrolling with uniform item widths `,-1)]]),controls:i(()=>[s(`div`,b,[p(_,{"scroll-details":D.value,direction:`horizontal`},null,8,[`scroll-details`]),p(v,{"item-count":a.value,"onUpdate:itemCount":r[0]||=e=>a.value=e,"item-size":u.value,"onUpdate:itemSize":r[1]||=e=>u.value=e,"buffer-before":d.value,"onUpdate:bufferBefore":r[2]||=e=>d.value=e,"buffer-after":w.value,"onUpdate:bufferAfter":r[3]||=e=>w.value=e,direction:`horizontal`,onScrollToIndex:A,onScrollToOffset:j,onRefresh:r[4]||=e=>E.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:i(()=>[p(t(g),{ref_key:`virtualScrollRef`,ref:E,debug:t(O),class:`bg-base-100`,direction:`horizontal`,items:T.value,"item-size":u.value,"buffer-before":d.value,"buffer-after":w.value,onScroll:k},{item:i(({item:e,index:t})=>[s(`div`,x,[s(`span`,S,`#`+o(t),1),s(`span`,C,o(e.text),1)])]),_:1},8,[`debug`,`items`,`item-size`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),T=e({default:()=>E},1),E=w;const D={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:u}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/horizontal-fixed/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:T}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:d}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/horizontal-fixed/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Horizontal Fixed | Virtual Scroll`}}};export{D as configValuesSerialized};