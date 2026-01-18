import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,I as i,T as a,U as o,_ as s,g as c,j as l,k as u,o as d,t as f,v as p,w as m,z as h}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as g,r as _,t as v}from"../chunks/chunk-QhD4z3cW.js";/* empty css                      *//* empty css                      */import{t as y}from"../chunks/chunk-v7-rDw7-.js";var b=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, onMounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const scrollContainer = ref<Window | null>(null);

onMounted(() => {
  scrollContainer.value = window;
});

const itemCount = ref(1000);
const itemSize = ref(90);
const bufferBefore = ref(5);
const bufferAfter = ref(5);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`Body Scroll Fixed Item \${ i }\`,
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
  <ExampleContainer height="auto" :code="rawCode">
    <template #title>
      <span class="text-success font-bold uppercase opacity-60 pe-2 align-baseline">Vertical Fixed Body</span>
    </template>

    <template #description>
      This example uses the main browser window for scrolling {{ itemCount.toLocaleString() }} items instead of a nested container. Item height is fixed at {{ itemSize }}px.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-success text-success-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with uniform item heights
    </template>

    <template #controls>
      <div class="sticky top-0 z-100 flex flex-wrap gap-2 md:gap-4 items-start pointer-events-none">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="itemSize"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
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
      class="bg-base-100 border border-base-300 rounded-box overflow-hidden"
      :items="items"
      :item-size="itemSize"
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #header>
        <div class="bg-neutral text-neutral-content p-12 text-center rounded-t-box">
          <h2 class="text-3xl font-bold mb-2 uppercase">SCROLLABLE HEADER</h2>
          <p class="opacity-80">This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <div>
            <div class="font-bold">Item {{ index }}</div>
            <div class="text-sm opacity-50">{{ item.text }}</div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="bg-neutral text-neutral-content p-12 text-center rounded-b-box">
          <h2 class="text-2xl font-bold uppercase">PAGE FOOTER</h2>
          <p class="opacity-60 text-sm mt-2">End of the {{ itemCount }} fixed items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`sticky top-0 z-100 flex flex-wrap gap-2 md:gap-4 items-start pointer-events-none`},S={class:`h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors`},C={class:`badge badge-neutral mr-4`},w={class:`font-bold`},T={class:`text-sm opacity-50`},E={class:`bg-neutral text-neutral-content p-12 text-center rounded-b-box`},D={class:`opacity-60 text-sm mt-2`},O=a({__name:`+Page`,setup(e){let a=h(null);u(()=>{a.value=window});let d=h(1e3),f=h(90),O=h(5),k=h(5),A=c(()=>Array.from({length:d.value},(e,t)=>({id:t,text:`Body Scroll Fixed Item ${t}`}))),j=h(),M=h(null),N=r(`debugMode`,h(!1));function P(e){M.value=e}function F(e,t,n){j.value?.scrollToIndex(e,t,n)}function I(e,t){j.value?.scrollToOffset(e,t)}return(e,r)=>(l(),p(g,{height:`auto`,code:t(b)},{title:i(()=>[...r[5]||=[s(`span`,{class:`text-success font-bold uppercase opacity-60 pe-2 align-baseline`},`Vertical Fixed Body`,-1)]]),description:i(()=>[n(` This example uses the main browser window for scrolling `+o(d.value.toLocaleString())+` items instead of a nested container. Item height is fixed at `+o(f.value)+`px. `,1)]),icon:i(()=>[...r[6]||=[s(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-success text-success-content shadow-lg`},[s(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25`})],-1)]]),subtitle:i(()=>[...r[7]||=[n(` Native window scrolling with uniform item heights `,-1)]]),controls:i(()=>[s(`div`,x,[m(v,{"scroll-details":M.value,direction:`vertical`},null,8,[`scroll-details`]),m(y,{"item-count":d.value,"onUpdate:itemCount":r[0]||=e=>d.value=e,"item-size":f.value,"onUpdate:itemSize":r[1]||=e=>f.value=e,"buffer-before":O.value,"onUpdate:bufferBefore":r[2]||=e=>O.value=e,"buffer-after":k.value,"onUpdate:bufferAfter":r[3]||=e=>k.value=e,direction:`vertical`,onScrollToIndex:F,onScrollToOffset:I,onRefresh:r[4]||=e=>j.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:i(()=>[m(t(_),{ref_key:`virtualScrollRef`,ref:j,debug:t(N),class:`bg-base-100 border border-base-300 rounded-box overflow-hidden`,items:A.value,"item-size":f.value,container:a.value,"buffer-before":O.value,"buffer-after":k.value,onScroll:P},{header:i(()=>[...r[8]||=[s(`div`,{class:`bg-neutral text-neutral-content p-12 text-center rounded-t-box`},[s(`h2`,{class:`text-3xl font-bold mb-2 uppercase`},`SCROLLABLE HEADER`),s(`p`,{class:`opacity-80`},`This header and fixed height items scroll with the page`)],-1)]]),item:i(({item:e,index:t})=>[s(`div`,S,[s(`span`,C,`#`+o(t),1),s(`div`,null,[s(`div`,w,`Item `+o(t),1),s(`div`,T,o(e.text),1)])])]),footer:i(()=>[s(`div`,E,[r[9]||=s(`h2`,{class:`text-2xl font-bold uppercase`},`PAGE FOOTER`,-1),s(`p`,D,`End of the `+o(d.value)+` fixed items list`,1)])]),_:1},8,[`debug`,`items`,`item-size`,`container`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),k=e({default:()=>A},1),A=O;const j={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-fixed-body/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:k}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-fixed-body/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Fixed Body | Virtual Scroll`}}};export{j as configValuesSerialized};