import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,L as i,M as a,T as o,V as s,W as c,_ as l,g as u,o as d,t as f,v as p,w as m,x as h}from"../chunks/chunk-CeuQGv84.js";import"../chunks/chunk-CTpTqTDb.js";import"../chunks/chunk-CNwi8UUp.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as g,r as _,t as v}from"../chunks/chunk-BwNxEjWN.js";/* empty css                      */import{t as y}from"../chunks/chunk-D9C0HK2D.js";var b=`<script setup lang="ts">
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
      <span class="text-primary font-bold uppercase opacity-90 pe-2 align-baseline">Vertical Fixed</span>
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
`,x={class:`flex flex-wrap gap-2 md:gap-4 items-start`},S={class:`h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors`},C={class:`badge badge-neutral mr-4`},w={class:`font-medium`},T=o({__name:`+Page`,setup(e){let o=t(1e3),d=t(50),f=t(5),T=t(5),E=t(!1),D=t(!1),O=u(()=>Array.from({length:o.value},(e,t)=>({id:t,text:`Fixed Item ${t}`}))),k=t(),A=t(null),j=r(`debugMode`,t(!1));function M(e){A.value=e}function N(e,t,n){k.value?.scrollToIndex(e,t,n)}function P(e,t){k.value?.scrollToOffset(e,t)}return(e,t)=>(a(),p(g,{code:s(b)},{title:i(()=>[...t[7]||=[l(`span`,{class:`text-primary font-bold uppercase opacity-90 pe-2 align-baseline`},`Vertical Fixed`,-1)]]),description:i(()=>[n(` Optimized for `+c(o.value.toLocaleString())+` items where every item has the same height. Items are only rendered when they enter the visible viewport. Row height is fixed at `+c(d.value)+`px. `,1)]),icon:i(()=>[...t[8]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25`})],-1)]]),subtitle:i(()=>[...t[9]||=[n(` Standard vertical scrolling with uniform item heights `,-1)]]),controls:i(()=>[l(`div`,x,[m(v,{"scroll-details":A.value,direction:`vertical`},null,8,[`scroll-details`]),m(y,{"item-count":o.value,"onUpdate:itemCount":t[0]||=e=>o.value=e,"item-size":d.value,"onUpdate:itemSize":t[1]||=e=>d.value=e,"buffer-before":f.value,"onUpdate:bufferBefore":t[2]||=e=>f.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":t[3]||=e=>T.value=e,"sticky-header":E.value,"onUpdate:stickyHeader":t[4]||=e=>E.value=e,"sticky-footer":D.value,"onUpdate:stickyFooter":t[5]||=e=>D.value=e,direction:`vertical`,onScrollToIndex:N,onScrollToOffset:P,onRefresh:t[6]||=e=>k.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:i(()=>[m(s(_),{ref_key:`virtualScrollRef`,ref:k,debug:s(j),class:`bg-base-100`,items:O.value,"item-size":d.value,"buffer-before":f.value,"buffer-after":T.value,"sticky-header":E.value,"sticky-footer":D.value,onScroll:M},h({item:i(({item:e,index:t})=>[l(`div`,S,[l(`span`,C,`#`+c(t),1),l(`span`,w,c(e.text),1)])]),_:2},[E.value?{name:`header`,fn:i(()=>[t[10]||=l(`div`,{class:`bg-primary text-primary-content p-4 border-b border-primary-focus`},` STICKY HEADER (Measured Padding) `,-1)]),key:`0`}:void 0,D.value?{name:`footer`,fn:i(()=>[t[11]||=l(`div`,{class:`bg-secondary text-secondary-content p-4 border-t border-secondary-focus`},` STICKY FOOTER (Measured Padding) `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-fixed/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-fixed/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Fixed | Virtual Scroll`}}};export{O as configValuesSerialized};