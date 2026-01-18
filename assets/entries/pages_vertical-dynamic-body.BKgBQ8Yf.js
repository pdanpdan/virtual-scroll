import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,H as i,I as a,T as o,U as s,_ as c,g as l,j as u,k as d,o as f,t as p,v as m,w as h,z as g}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as _,r as v,t as y}from"../chunks/chunk-B7wtXgO1.js";/* empty css                      *//* empty css                      */import{t as b}from"../chunks/chunk-v7-rDw7-.js";var x=`<script setup lang="ts">
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
const baseItemSize = ref(50); // Approximate base size
const bufferBefore = ref(5);
const bufferAfter = ref(5);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = baseItemSize.value;
  return (item: unknown, index: number) => index % 2 === 0 ? base : base * 2;
});

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`Body Scroll Dynamic Item \${ i } (Height: \${ itemSizeFn.value(null, i) }px)\`,
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
      <span class="text-success font-bold uppercase opacity-60 pe-2 align-baseline">Vertical Dynamic Body</span>
    </template>

    <template #description>
      This example uses the main browser window for scrolling {{ itemCount.toLocaleString() }} dynamic items. Sizes are automatically detected via <strong>ResizeObserver</strong>.
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
      Native window scrolling with variable item heights
    </template>

    <template #controls>
      <div class="sticky top-0 z-100 flex flex-wrap gap-2 md:gap-4 items-start pointer-events-none">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="baseItemSize"
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
        <div class="flex items-center p-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium" :style="{ blockSize: \`\${ itemSizeFn(null, index) }px\` }">{{ item.text }}</span>
        </div>
      </template>

      <template #footer>
        <div class="bg-neutral text-neutral-content p-12 text-center rounded-b-box">
          <h2 class="text-2xl font-bold uppercase">PAGE FOOTER</h2>
          <p class="opacity-60 text-sm mt-2">End of the {{ itemCount }} dynamic items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,S={class:`sticky top-0 z-100 flex flex-wrap gap-2 md:gap-4 items-start pointer-events-none`},C={class:`flex items-center p-6 border-b border-base-200 hover:bg-base-300 transition-colors`},w={class:`badge badge-neutral mr-4`},T={class:`bg-neutral text-neutral-content p-12 text-center rounded-b-box`},E={class:`opacity-60 text-sm mt-2`},D=o({__name:`+Page`,setup(e){let o=g(null);d(()=>{o.value=window});let f=g(1e3),p=g(50),D=g(5),O=g(5),k=l(()=>{let e=p.value;return(t,n)=>n%2==0?e:e*2}),A=l(()=>Array.from({length:f.value},(e,t)=>({id:t,text:`Body Scroll Dynamic Item ${t} (Height: ${k.value(null,t)}px)`}))),j=g(),M=g(null),N=r(`debugMode`,g(!1));function P(e){M.value=e}function F(e,t,n){j.value?.scrollToIndex(e,t,n)}function I(e,t){j.value?.scrollToOffset(e,t)}return(e,r)=>(u(),m(_,{height:`auto`,code:t(x)},{title:a(()=>[...r[5]||=[c(`span`,{class:`text-success font-bold uppercase opacity-60 pe-2 align-baseline`},`Vertical Dynamic Body`,-1)]]),description:a(()=>[n(` This example uses the main browser window for scrolling `+s(f.value.toLocaleString())+` dynamic items. Sizes are automatically detected via `,1),r[6]||=c(`strong`,null,`ResizeObserver`,-1),r[7]||=n(`. `,-1)]),icon:a(()=>[...r[8]||=[c(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-success text-success-content shadow-lg`},[c(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25`})],-1)]]),subtitle:a(()=>[...r[9]||=[n(` Native window scrolling with variable item heights `,-1)]]),controls:a(()=>[c(`div`,S,[h(y,{"scroll-details":M.value,direction:`vertical`},null,8,[`scroll-details`]),h(b,{"item-count":f.value,"onUpdate:itemCount":r[0]||=e=>f.value=e,"item-size":p.value,"onUpdate:itemSize":r[1]||=e=>p.value=e,"buffer-before":D.value,"onUpdate:bufferBefore":r[2]||=e=>D.value=e,"buffer-after":O.value,"onUpdate:bufferAfter":r[3]||=e=>O.value=e,direction:`vertical`,onScrollToIndex:F,onScrollToOffset:I,onRefresh:r[4]||=e=>j.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:a(()=>[h(t(v),{ref_key:`virtualScrollRef`,ref:j,debug:t(N),class:`bg-base-100 border border-base-300 rounded-box overflow-hidden`,items:A.value,container:o.value,"buffer-before":D.value,"buffer-after":O.value,onScroll:P},{header:a(()=>[...r[10]||=[c(`div`,{class:`bg-neutral text-neutral-content p-12 text-center rounded-t-box`},[c(`h2`,{class:`text-3xl font-bold mb-2 uppercase`},`SCROLLABLE HEADER`),c(`p`,{class:`opacity-80`},`This header and fixed height items scroll with the page`)],-1)]]),item:a(({item:e,index:t})=>[c(`div`,C,[c(`span`,w,`#`+s(t),1),c(`span`,{class:`font-medium`,style:i({blockSize:`${k.value(null,t)}px`})},s(e.text),5)])]),footer:a(()=>[c(`div`,T,[r[11]||=c(`h2`,{class:`text-2xl font-bold uppercase`},`PAGE FOOTER`,-1),c(`p`,E,`End of the `+s(f.value)+` dynamic items list`,1)])]),_:1},8,[`debug`,`items`,`container`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),O=e({default:()=>k},1),k=D;const A={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-dynamic-body/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:O}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:p}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-dynamic-body/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Dynamic Body | Virtual Scroll`}}};export{A as configValuesSerialized};