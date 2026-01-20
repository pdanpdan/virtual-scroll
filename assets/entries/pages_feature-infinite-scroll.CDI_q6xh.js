import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,V as c,_ as l,l as u,o as d,t as f,v as p,w as m,z as h}from"../chunks/chunk-aspRjZ9M.js";import"../chunks/chunk-CTpTqTDb.js";import{n as g}from"../chunks/chunk-BjlKgXue.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as _,t as v}from"../chunks/chunk-eRtd9FZy.js";var y=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: i, label: \`Initial Item \${ i }\` })));
const loading = ref(false);
const autoLoad = ref(true);
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

async function loadMore() {
  if (loading.value) {
    return;
  }

  loading.value = true;
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const start = items.value.length;
  const newItems = Array.from({ length: 20 }, (_, i) => ({
    id: start + i,
    label: \`Loaded Item \${ start + i }\`,
  }));

  items.value = [ ...items.value, ...newItems ];
  loading.value = false;
}

async function onLoad(direction: 'vertical' | 'horizontal') {
  if (autoLoad.value && direction === 'vertical') {
    await loadMore();
  }
}

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-1">Infinite Scroll</span>
    </template>

    <template #description>
      Demonstrates the <strong>load</strong> event and <strong>loading</strong> prop/slot. Currently showing {{ items.length.toLocaleString() }} items. When you reach the end of the list, more items are automatically fetched and appended.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    </template>

    <template #subtitle>
      Automatic pagination with loading indicators
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <div class="flex flex-col items-stretch gap-4 p-5 bg-base-300 rounded-box border border-base-content/5 shadow-md">
          <label class="settings-item group">
            <span class="settings-label">Auto-loading</span>
            <input v-model="autoLoad" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>

          <div class="grid grid-cols-2 gap-2 mt-2">
            <button class="btn btn-sm btn-primary" :disabled="loading" @click="loadMore">Load More</button>
            <button class="btn btn-sm btn-error btn-soft" @click="items = []">Clear</button>
          </div>
        </div>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :loading="loading"
      :load-distance="300"
      @load="onLoad"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>

      <template #loading>
        <div class="p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300">
          <span class="loading loading-spinner loading-md text-primary" />
          <span class="text-xs font-bold small-caps tracking-widest opacity-70">Fetching more items...</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,b={class:`flex flex-wrap gap-2 md:gap-4 items-start`},x={class:`flex flex-col items-stretch gap-4 p-5 bg-base-300 rounded-box border border-base-content/5 shadow-md`},S={class:`settings-item group`},C={class:`grid grid-cols-2 gap-2 mt-2`},w=[`disabled`],T={class:`example-vertical-item example-vertical-item--fixed`},E={class:`example-badge mr-4`},D={class:`font-medium`},O=s({__name:`+Page`,setup(e){let s=c(Array.from({length:50},(e,t)=>({id:t,label:`Initial Item ${t}`}))),d=c(!1),f=c(!0),O=c(null),k=n(`debugMode`,c(!1));async function A(){if(d.value)return;d.value=!0,await new Promise(e=>setTimeout(e,1500));let e=s.value.length,t=Array.from({length:20},(t,n)=>({id:e+n,label:`Loaded Item ${e+n}`}));s.value=[...s.value,...t],d.value=!1}async function j(e){f.value&&e===`vertical`&&await A()}function M(e){O.value=e}return(e,n)=>(a(),p(_,{code:i(y)},{title:o(()=>[...n[2]||=[l(`span`,{class:`example-title example-title--group-1`},`Infinite Scroll`,-1)]]),description:o(()=>[n[3]||=t(` Demonstrates the `,-1),n[4]||=l(`strong`,null,`load`,-1),n[5]||=t(` event and `,-1),n[6]||=l(`strong`,null,`loading`,-1),t(` prop/slot. Currently showing `+r(s.value.length.toLocaleString())+` items. When you reach the end of the list, more items are automatically fetched and appended. `,1)]),icon:o(()=>[...n[7]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-1`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99`})],-1)]]),subtitle:o(()=>[...n[8]||=[t(` Automatic pagination with loading indicators `,-1)]]),controls:o(()=>[l(`div`,b,[m(v,{"scroll-details":O.value,direction:`vertical`},null,8,[`scroll-details`]),l(`div`,x,[l(`label`,S,[n[9]||=l(`span`,{class:`settings-label`},`Auto-loading`,-1),h(l(`input`,{"onUpdate:modelValue":n[0]||=e=>f.value=e,type:`checkbox`,class:`toggle toggle-primary toggle-sm`},null,512),[[u,f.value]])]),l(`div`,C,[l(`button`,{class:`btn btn-sm btn-primary`,disabled:d.value,onClick:A},`Load More`,8,w),l(`button`,{class:`btn btn-sm btn-error btn-soft`,onClick:n[1]||=e=>s.value=[]},`Clear`)])])])]),default:o(()=>[m(i(g),{debug:i(k),class:`example-container`,items:s.value,"item-size":60,loading:d.value,"load-distance":300,onLoad:j,onScroll:M},{item:o(({item:e,index:t})=>[l(`div`,T,[l(`span`,E,`#`+r(t),1),l(`span`,D,r(e.label),1)])]),loading:o(()=>[...n[10]||=[l(`div`,{class:`p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300`},[l(`span`,{class:`loading loading-spinner loading-md text-primary`}),l(`span`,{class:`text-xs font-bold small-caps tracking-widest opacity-70`},`Fetching more items...`)],-1)]]),_:1},8,[`debug`,`items`,`loading`])]),_:1},8,[`code`]))}}),k=e({default:()=>A},1),A=O;const j={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-infinite-scroll/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:k}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-infinite-scroll/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Infinite Scroll - Virtual Scroll`}}};export{j as configValuesSerialized};