import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,I as i,T as a,U as o,_ as s,g as c,j as l,o as u,t as d,v as f,w as p,x as m,z as h}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as g,r as _,t as v}from"../chunks/chunk-QhD4z3cW.js";/* empty css                      *//* empty css                      */import{t as y}from"../chunks/chunk-v7-rDw7-.js";var b=`<script setup lang="ts">
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
      <span class="text-primary font-bold uppercase opacity-60 pe-2 align-baseline">Vertical Fixed</span>
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
        class="size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg"
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
      class="bg-base-100"
      :items="items"
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      @scroll="onScroll"
    >
      <template v-if="stickyHeader" #header>
        <div class="bg-primary text-primary-content p-4 border-b border-primary-focus">
          STICKY HEADER (Measured Padding)
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.text }}</span>
        </div>
      </template>

      <template v-if="stickyFooter" #footer>
        <div class="bg-secondary text-secondary-content p-4 border-t border-secondary-focus">
          STICKY FOOTER (Measured Padding)
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`flex flex-wrap gap-2 md:gap-4 items-start`},S={class:`h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors`},C={class:`badge badge-neutral mr-4`},w={class:`font-medium`},T=a({__name:`+Page`,setup(e){let a=h(1e3),u=h(50),d=h(5),T=h(5),E=h(!1),D=h(!1),O=c(()=>Array.from({length:a.value},(e,t)=>({id:t,text:`Fixed Item ${t}`}))),k=h(),A=h(null),j=r(`debugMode`,h(!1));function M(e){A.value=e}function N(e,t,n){k.value?.scrollToIndex(e,t,n)}function P(e,t){k.value?.scrollToOffset(e,t)}return(e,r)=>(l(),f(g,{code:t(b)},{title:i(()=>[...r[7]||=[s(`span`,{class:`text-primary font-bold uppercase opacity-60 pe-2 align-baseline`},`Vertical Fixed`,-1)]]),description:i(()=>[n(` Optimized for `+o(a.value.toLocaleString())+` items where every item has the same height. Items are only rendered when they enter the visible viewport. Row height is fixed at `+o(u.value)+`px. `,1)]),icon:i(()=>[...r[8]||=[s(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg`},[s(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`})],-1)]]),subtitle:i(()=>[...r[9]||=[n(` Standard vertical scrolling with uniform item heights `,-1)]]),controls:i(()=>[s(`div`,x,[p(v,{"scroll-details":A.value,direction:`vertical`},null,8,[`scroll-details`]),p(y,{"item-count":a.value,"onUpdate:itemCount":r[0]||=e=>a.value=e,"item-size":u.value,"onUpdate:itemSize":r[1]||=e=>u.value=e,"buffer-before":d.value,"onUpdate:bufferBefore":r[2]||=e=>d.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":r[3]||=e=>T.value=e,"sticky-header":E.value,"onUpdate:stickyHeader":r[4]||=e=>E.value=e,"sticky-footer":D.value,"onUpdate:stickyFooter":r[5]||=e=>D.value=e,direction:`vertical`,onScrollToIndex:N,onScrollToOffset:P,onRefresh:r[6]||=e=>k.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:i(()=>[p(t(_),{ref_key:`virtualScrollRef`,ref:k,debug:t(j),class:`bg-base-100`,items:O.value,"item-size":u.value,"buffer-before":d.value,"buffer-after":T.value,"sticky-header":E.value,"sticky-footer":D.value,onScroll:M},m({item:i(({item:e,index:t})=>[s(`div`,S,[s(`span`,C,`#`+o(t),1),s(`span`,w,o(e.text),1)])]),_:2},[E.value?{name:`header`,fn:i(()=>[r[10]||=s(`div`,{class:`bg-primary text-primary-content p-4 border-b border-primary-focus`},` STICKY HEADER (Measured Padding) `,-1)]),key:`0`}:void 0,D.value?{name:`footer`,fn:i(()=>[r[11]||=s(`div`,{class:`bg-secondary text-secondary-content p-4 border-t border-secondary-focus`},` STICKY FOOTER (Measured Padding) `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:u}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-fixed/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:d}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-fixed/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Fixed | Virtual Scroll`}}};export{O as configValuesSerialized};