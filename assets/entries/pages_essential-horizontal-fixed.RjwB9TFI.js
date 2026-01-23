import{t as e}from"../chunks/chunk-v_CCr7DM.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,V as c,_ as l,g as u,o as d,t as f,v as p,w as m}from"../chunks/chunk-XKBqd3ij.js";import"../chunks/chunk-YW3sP-nK.js";import{n as h}from"../chunks/chunk-Dr456LUk.js";/* empty css                      *//* empty css                      *//* empty css                      */import{t as g}from"../chunks/chunk-Dmso7Mqj.js";import{t as _}from"../chunks/chunk-aY2R9Y7u.js";import{t as v}from"../chunks/chunk-CYaHQnmk.js";var y=`<script setup lang="ts">
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
      <span class="example-title example-title--group-3">Horizontal Fixed</span>
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
        class="example-icon example-icon--group-3"
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
      class="example-container"
      direction="horizontal"
      :items="items"
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-horizontal-item example-horizontal-item--fixed">
          <span class="example-badge mb-4">#{{ index }}</span>
          <div class="font-bold text-sm">{{ item.text }}</div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,b={class:`flex flex-wrap gap-2 md:gap-4 items-start`},x={class:`example-horizontal-item example-horizontal-item--fixed`},S={class:`example-badge mb-4`},C={class:`font-bold text-sm`},w=s({__name:`+Page`,setup(e){let s=c(1e3),d=c(100),f=c(20),w=c(20),T=u(()=>Array.from({length:s.value},(e,t)=>({id:t,text:`Fixed Item ${t}`}))),E=c(),D=c(null),O=n(`debugMode`,c(!1));function k(e){D.value=e}function A(e,t,n){E.value?.scrollToIndex(e,t,n)}function j(e,t){E.value?.scrollToOffset(e,t)}return(e,n)=>(a(),p(g,{height:`350px`,code:i(y)},{title:o(()=>[...n[5]||=[l(`span`,{class:`example-title example-title--group-3`},`Horizontal Fixed`,-1)]]),description:o(()=>[t(` Optimized for `+r(s.value.toLocaleString())+` items where every item has the same width (`+r(d.value)+`px). Row height is filled automatically. Default buffers are set to `+r(f.value)+` for smoother horizontal panning. `,1)]),icon:o(()=>[...n[6]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-3`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`,class:`-rotate-90 origin-center`})],-1)]]),subtitle:o(()=>[...n[7]||=[t(` Horizontal scrolling with uniform item widths `,-1)]]),controls:o(()=>[l(`div`,b,[m(v,{"scroll-details":D.value,direction:`horizontal`},null,8,[`scroll-details`]),m(_,{"item-count":s.value,"onUpdate:itemCount":n[0]||=e=>s.value=e,"item-size":d.value,"onUpdate:itemSize":n[1]||=e=>d.value=e,"buffer-before":f.value,"onUpdate:bufferBefore":n[2]||=e=>f.value=e,"buffer-after":w.value,"onUpdate:bufferAfter":n[3]||=e=>w.value=e,direction:`horizontal`,onScrollToIndex:A,onScrollToOffset:j,onRefresh:n[4]||=e=>E.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:o(()=>[m(i(h),{ref_key:`virtualScrollRef`,ref:E,debug:i(O),class:`example-container`,direction:`horizontal`,items:T.value,"item-size":d.value,"buffer-before":f.value,"buffer-after":w.value,onScroll:k},{item:o(({item:e,index:t})=>[l(`div`,x,[l(`span`,S,`#`+r(t),1),l(`div`,C,r(e.text),1)])]),_:1},8,[`debug`,`items`,`item-size`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),T=e({default:()=>E},1),E=w;const D={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-horizontal-fixed/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:T}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-horizontal-fixed/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Horizontal Fixed | Virtual Scroll`}}};export{D as configValuesSerialized};