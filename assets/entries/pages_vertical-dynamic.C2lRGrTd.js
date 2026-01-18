import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,L as i,M as a,T as o,U as s,V as c,W as l,_ as u,g as d,o as f,t as p,v as m,w as h,x as g}from"../chunks/chunk-CeuQGv84.js";import"../chunks/chunk-CTpTqTDb.js";import"../chunks/chunk-CNwi8UUp.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as _,r as v,t as y}from"../chunks/chunk-BwNxEjWN.js";/* empty css                      */import{t as b}from"../chunks/chunk-D9C0HK2D.js";var x=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const itemCount = ref(1000);
const baseItemSize = ref(50);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(false);
const stickyFooter = ref(false);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
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
      <span class="text-primary font-bold uppercase opacity-90 pe-2 align-baseline">Vertical Dynamic</span>
    </template>

    <template #description>
      Vertical scrolling with variable item heights for {{ itemCount.toLocaleString() }} items. Automatically measures item sizes using <strong>ResizeObserver</strong>. Even items are {{ baseItemSize }}px, odd items are {{ baseItemSize * 2 }}px.
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
          v-model:item-size="baseItemSize"
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
      :default-item-size="75"
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
        <div class="flex items-center p-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium" :style="{ blockSize: \`\${ itemSizeFn(null, index) }px\` }">{{ item.text }}</span>
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
`,S={class:`flex flex-wrap gap-2 md:gap-4 items-start`},C={class:`flex items-center p-6 border-b border-base-200 hover:bg-base-300 transition-colors`},w={class:`badge badge-neutral mr-4`},T=o({__name:`+Page`,setup(e){let o=t(1e3),f=t(50),p=t(5),T=t(5),E=t(!1),D=t(!1),O=d(()=>{let e=f.value;return(t,n)=>n%2==0?e:e*2}),k=d(()=>Array.from({length:o.value},(e,t)=>({id:t,text:`Dynamic Item ${t} (Height: ${O.value(null,t)}px)`}))),A=t(),j=t(null),M=r(`debugMode`,t(!1));function N(e){j.value=e}function P(e,t,n){A.value?.scrollToIndex(e,t,n)}function F(e,t){A.value?.scrollToOffset(e,t)}return(e,t)=>(a(),m(_,{code:c(x)},{title:i(()=>[...t[7]||=[u(`span`,{class:`text-primary font-bold uppercase opacity-90 pe-2 align-baseline`},`Vertical Dynamic`,-1)]]),description:i(()=>[n(` Vertical scrolling with variable item heights for `+l(o.value.toLocaleString())+` items. Automatically measures item sizes using `,1),t[8]||=u(`strong`,null,`ResizeObserver`,-1),n(`. Even items are `+l(f.value)+`px, odd items are `+l(f.value*2)+`px. `,1)]),icon:i(()=>[...t[9]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.45 4.5h14.25M3.45 9h9.75M3.45 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.7 21 21.45 17.25`})],-1)]]),subtitle:i(()=>[...t[10]||=[n(` Vertical scrolling with variable item heights `,-1)]]),controls:i(()=>[u(`div`,S,[h(y,{"scroll-details":j.value,direction:`vertical`},null,8,[`scroll-details`]),h(b,{"item-count":o.value,"onUpdate:itemCount":t[0]||=e=>o.value=e,"item-size":f.value,"onUpdate:itemSize":t[1]||=e=>f.value=e,"buffer-before":p.value,"onUpdate:bufferBefore":t[2]||=e=>p.value=e,"buffer-after":T.value,"onUpdate:bufferAfter":t[3]||=e=>T.value=e,"sticky-header":E.value,"onUpdate:stickyHeader":t[4]||=e=>E.value=e,"sticky-footer":D.value,"onUpdate:stickyFooter":t[5]||=e=>D.value=e,direction:`vertical`,onScrollToIndex:P,onScrollToOffset:F,onRefresh:t[6]||=e=>A.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])])]),default:i(()=>[h(c(v),{ref_key:`virtualScrollRef`,ref:A,debug:c(M),class:`bg-base-100`,items:k.value,"default-item-size":75,"buffer-before":p.value,"buffer-after":T.value,"sticky-header":E.value,"sticky-footer":D.value,onScroll:N},g({item:i(({item:e,index:t})=>[u(`div`,C,[u(`span`,w,`#`+l(t),1),u(`span`,{class:`font-medium`,style:s({blockSize:`${O.value(null,t)}px`})},l(e.text),5)])]),_:2},[E.value?{name:`header`,fn:i(()=>[t[11]||=u(`div`,{class:`bg-primary text-primary-content p-4 border-b border-primary-focus`},` STICKY HEADER (Measured Padding) `,-1)]),key:`0`}:void 0,D.value?{name:`footer`,fn:i(()=>[t[12]||=u(`div`,{class:`bg-secondary text-secondary-content p-4 border-t border-secondary-focus`},` STICKY FOOTER (Measured Padding) `,-1)]),key:`1`}:void 0]),1032,[`debug`,`items`,`buffer-before`,`buffer-after`,`sticky-header`,`sticky-footer`])]),_:1},8,[`code`]))}}),E=e({default:()=>D},1),D=T;const O={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-dynamic/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:E}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:p}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-dynamic/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Dynamic | Virtual Scroll`}}};export{O as configValuesSerialized};