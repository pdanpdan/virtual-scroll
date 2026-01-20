import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,V as c,W as l,_ as u,g as d,k as f,o as p,t as m,v as h,w as g}from"../chunks/chunk-aspRjZ9M.js";import"../chunks/chunk-CTpTqTDb.js";import{n as _}from"../chunks/chunk-BjlKgXue.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as v,t as y}from"../chunks/chunk-eRtd9FZy.js";import{t as b}from"../chunks/chunk-CGQCTXPG.js";var x=`<script setup lang="ts">
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
const itemSize = ref(50); // Approximate base size
const bufferBefore = ref(5);
const bufferAfter = ref(5);

// Use a deterministic function for item size
// Pattern: base, base*2, base, base*2, ...
const itemSizeFn = computed(() => {
  const base = itemSize.value;
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
      <span class="example-title example-title--group-2">Vertical Dynamic Body</span>
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
        class="example-icon example-icon--group-2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with variable item heights
    </template>

    <template #controls>
      <div class="sticky top-0 z-100 flex flex-wrap gap-4 items-start pointer-events-none py-4 -mx-4 px-4 backdrop-blur-sm bg-base-100/30">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" class="shadow-strong" />

        <ScrollControls
          v-model:item-count="itemCount"
          v-model:item-size="itemSize"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          direction="vertical"
          class="shadow-strong"
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
      :items="items"
      :container="scrollContainer"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      @scroll="onScroll"
    >
      <template #header>
        <div class="example-body-header">
          <h2>Scrollable Header</h2>
          <p>This header and fixed height items scroll with the page</p>
        </div>
      </template>

      <template #item="{ item, index }">
        <div class="example-vertical-item py-4">
          <span class="example-badge me-8">#{{ index }}</span>
          <div class="font-bold" :style="{ minBlockSize: \`\${ itemSizeFn(null, index) }px\` }">{{ item.text }}</div>
        </div>
      </template>

      <template #footer>
        <div class="example-body-footer">
          <h2>Page Footer</h2>
          <p>End of the {{ itemCount.toLocaleString() }} dynamic items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,S={class:`sticky top-0 z-100 flex flex-wrap gap-4 items-start pointer-events-none py-4 -mx-4 px-4 backdrop-blur-sm bg-base-100/30`},C={class:`example-vertical-item py-4`},w={class:`example-badge me-8`},T={class:`example-body-footer`},E=s({__name:`+Page`,setup(e){let s=c(null);f(()=>{s.value=window});let p=c(1e3),m=c(50),E=c(5),D=c(5),O=d(()=>{let e=m.value;return(t,n)=>n%2==0?e:e*2}),k=d(()=>Array.from({length:p.value},(e,t)=>({id:t,text:`Body Scroll Dynamic Item ${t} (Height: ${O.value(null,t)}px)`}))),A=c(),j=c(null),M=n(`debugMode`,c(!1));function N(e){j.value=e}function P(e,t,n){A.value?.scrollToIndex(e,t,n)}function F(e,t){A.value?.scrollToOffset(e,t)}return(e,n)=>(a(),h(v,{height:`auto`,code:i(x)},{title:o(()=>[...n[5]||=[u(`span`,{class:`example-title example-title--group-2`},`Vertical Dynamic Body`,-1)]]),description:o(()=>[t(` This example uses the main browser window for scrolling `+r(p.value.toLocaleString())+` dynamic items. Sizes are automatically detected via `,1),n[6]||=u(`strong`,null,`ResizeObserver`,-1),n[7]||=t(`. `,-1)]),icon:o(()=>[...n[8]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-2`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25`})],-1)]]),subtitle:o(()=>[...n[9]||=[t(` Native window scrolling with variable item heights `,-1)]]),controls:o(()=>[u(`div`,S,[g(y,{"scroll-details":j.value,direction:`vertical`,class:`shadow-strong`},null,8,[`scroll-details`]),g(b,{"item-count":p.value,"onUpdate:itemCount":n[0]||=e=>p.value=e,"item-size":m.value,"onUpdate:itemSize":n[1]||=e=>m.value=e,"buffer-before":E.value,"onUpdate:bufferBefore":n[2]||=e=>E.value=e,"buffer-after":D.value,"onUpdate:bufferAfter":n[3]||=e=>D.value=e,direction:`vertical`,class:`shadow-strong`,onScrollToIndex:P,onScrollToOffset:F,onRefresh:n[4]||=e=>A.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:o(()=>[g(i(_),{ref_key:`virtualScrollRef`,ref:A,debug:i(M),class:`example-container`,items:k.value,container:s.value,"buffer-before":E.value,"buffer-after":D.value,onScroll:N},{header:o(()=>[...n[10]||=[u(`div`,{class:`example-body-header`},[u(`h2`,null,`Scrollable Header`),u(`p`,null,`This header and fixed height items scroll with the page`)],-1)]]),item:o(({item:e,index:t})=>[u(`div`,C,[u(`span`,w,`#`+r(t),1),u(`div`,{class:`font-bold`,style:l({minBlockSize:`${O.value(null,t)}px`})},r(e.text),5)])]),footer:o(()=>[u(`div`,T,[n[11]||=u(`h2`,null,`Page Footer`,-1),u(`p`,null,`End of the `+r(p.value.toLocaleString())+` dynamic items list`,1)])]),_:1},8,[`debug`,`items`,`container`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),D=e({default:()=>O},1),O=E;const k={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:p}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-dynamic-body/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:D}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:m}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/vertical-dynamic-body/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Dynamic Body | Virtual Scroll`}}};export{k as configValuesSerialized};