import{t as e}from"../chunks/chunk-v_CCr7DM.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,V as c,_ as l,g as u,k as d,o as f,t as p,v as m,w as h}from"../chunks/chunk-CZEdwOsv.js";import"../chunks/chunk-YW3sP-nK.js";import{n as g}from"../chunks/chunk-BoapzTav.js";/* empty css                      *//* empty css                      *//* empty css                      */import{t as _}from"../chunks/chunk-BYGEeXHk.js";import{t as v}from"../chunks/chunk-AZfZD1yh.js";import{t as y}from"../chunks/chunk-BdOZaf3L.js";var b=`<script setup lang="ts">
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
      <span class="example-title example-title--group-2">Vertical Fixed Body</span>
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
        class="example-icon example-icon--group-2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25" />
      </svg>
    </template>

    <template #subtitle>
      Native window scrolling with uniform item heights
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
      :item-size="itemSize"
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
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge me-8">#{{ index }}</span>
          <div>
            <div class="font-bold">Item {{ index }}</div>
            <div class="text-xs opacity-60">{{ item.text }}</div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="example-body-footer">
          <h2>Page Footer</h2>
          <p>End of the {{ itemCount.toLocaleString() }} fixed items list</p>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,x={class:`sticky top-0 z-100 flex flex-wrap gap-4 items-start pointer-events-none py-4 -mx-4 px-4 backdrop-blur-sm bg-base-100/30`},S={class:`example-vertical-item example-vertical-item--fixed`},C={class:`example-badge me-8`},w={class:`font-bold`},T={class:`text-xs opacity-60`},E={class:`example-body-footer`},D=s({__name:`+Page`,setup(e){let s=c(null);d(()=>{s.value=window});let f=c(1e3),p=c(90),D=c(5),O=c(5),k=u(()=>Array.from({length:f.value},(e,t)=>({id:t,text:`Body Scroll Fixed Item ${t}`}))),A=c(),j=c(null),M=n(`debugMode`,c(!1));function N(e){j.value=e}function P(e,t,n){A.value?.scrollToIndex(e,t,n)}function F(e,t){A.value?.scrollToOffset(e,t)}return(e,n)=>(a(),m(_,{height:`auto`,code:i(b)},{title:o(()=>[...n[5]||=[l(`span`,{class:`example-title example-title--group-2`},`Vertical Fixed Body`,-1)]]),description:o(()=>[t(` This example uses the main browser window for scrolling `+r(f.value.toLocaleString())+` items instead of a nested container. Item height is fixed at `+r(p.value)+`px. `,1)]),icon:o(()=>[...n[6]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-2`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25`})],-1)]]),subtitle:o(()=>[...n[7]||=[t(` Native window scrolling with uniform item heights `,-1)]]),controls:o(()=>[l(`div`,x,[h(y,{"scroll-details":j.value,direction:`vertical`,class:`shadow-strong`},null,8,[`scroll-details`]),h(v,{"item-count":f.value,"onUpdate:itemCount":n[0]||=e=>f.value=e,"item-size":p.value,"onUpdate:itemSize":n[1]||=e=>p.value=e,"buffer-before":D.value,"onUpdate:bufferBefore":n[2]||=e=>D.value=e,"buffer-after":O.value,"onUpdate:bufferAfter":n[3]||=e=>O.value=e,direction:`vertical`,class:`shadow-strong`,onScrollToIndex:P,onScrollToOffset:F,onRefresh:n[4]||=e=>A.value?.refresh()},null,8,[`item-count`,`item-size`,`buffer-before`,`buffer-after`])])]),default:o(()=>[h(i(g),{ref_key:`virtualScrollRef`,ref:A,debug:i(M),class:`example-container`,items:k.value,"item-size":p.value,container:s.value,"buffer-before":D.value,"buffer-after":O.value,onScroll:N},{header:o(()=>[...n[8]||=[l(`div`,{class:`example-body-header`},[l(`h2`,null,`Scrollable Header`),l(`p`,null,`This header and fixed height items scroll with the page`)],-1)]]),item:o(({item:e,index:t})=>[l(`div`,S,[l(`span`,C,`#`+r(t),1),l(`div`,null,[l(`div`,w,`Item `+r(t),1),l(`div`,T,r(e.text),1)])])]),footer:o(()=>[l(`div`,E,[n[9]||=l(`h2`,null,`Page Footer`,-1),l(`p`,null,`End of the `+r(f.value.toLocaleString())+` fixed items list`,1)])]),_:1},8,[`debug`,`items`,`item-size`,`container`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),O=e({default:()=>k},1),k=D;const A={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-vertical-fixed-body/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:O}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:p}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/essential-vertical-fixed-body/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Vertical Fixed Body | Virtual Scroll`}}};export{A as configValuesSerialized};