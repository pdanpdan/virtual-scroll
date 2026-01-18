import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,L as i,M as a,R as o,T as s,V as c,W as l,_ as u,l as d,o as f,t as p,v as m,w as h}from"../chunks/chunk-CeuQGv84.js";import"../chunks/chunk-CTpTqTDb.js";import"../chunks/chunk-CNwi8UUp.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as g,r as _,t as v}from"../chunks/chunk-znpjYd2Q.js";/* empty css                      */var y=`<script setup lang="ts">
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
      <span class="text-primary font-bold uppercase opacity-90 pe-2 align-baseline">Infinite Scroll</span>
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
        class="size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg"
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

        <div class="flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300">
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-sm font-medium">Auto-loading (Infinite)</span>
            <input v-model="autoLoad" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>

          <button class="btn btn-sm btn-soft btn-primary" :disabled="loading" @click="loadMore">Manual Load More</button>
          <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear Items</button>
        </div>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="bg-base-100"
      :items="items"
      :item-size="60"
      :loading="loading"
      :load-distance="300"
      @load="onLoad"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>

      <template #loading>
        <div class="p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300">
          <span class="loading loading-spinner loading-lg text-primary" />
          <span class="text-sm font-bold uppercase tracking-widest opacity-90">Fetching more items...</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,b={class:`flex flex-wrap gap-2 md:gap-4 items-start`},x={class:`flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300`},S={class:`flex items-center gap-2 cursor-pointer`},C=[`disabled`],w={class:`h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors`},T={class:`badge badge-neutral mr-4`},E={class:`font-medium`},D=s({__name:`+Page`,setup(e){let s=t(Array.from({length:50},(e,t)=>({id:t,label:`Initial Item ${t}`}))),f=t(!1),p=t(!0),D=t(null),O=r(`debugMode`,t(!1));async function k(){if(f.value)return;f.value=!0,await new Promise(e=>setTimeout(e,1500));let e=s.value.length,t=Array.from({length:20},(t,n)=>({id:e+n,label:`Loaded Item ${e+n}`}));s.value=[...s.value,...t],f.value=!1}async function A(e){p.value&&e===`vertical`&&await k()}function j(e){D.value=e}return(e,t)=>(a(),m(g,{code:c(y)},{title:i(()=>[...t[2]||=[u(`span`,{class:`text-primary font-bold uppercase opacity-90 pe-2 align-baseline`},`Infinite Scroll`,-1)]]),description:i(()=>[t[3]||=n(` Demonstrates the `,-1),t[4]||=u(`strong`,null,`load`,-1),t[5]||=n(` event and `,-1),t[6]||=u(`strong`,null,`loading`,-1),n(` prop/slot. Currently showing `+l(s.value.length.toLocaleString())+` items. When you reach the end of the list, more items are automatically fetched and appended. `,1)]),icon:i(()=>[...t[7]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-primary text-primary-content shadow-lg`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99`})],-1)]]),subtitle:i(()=>[...t[8]||=[n(` Automatic pagination with loading indicators `,-1)]]),controls:i(()=>[u(`div`,b,[h(v,{"scroll-details":D.value,direction:`vertical`},null,8,[`scroll-details`]),u(`div`,x,[u(`label`,S,[t[9]||=u(`span`,{class:`text-sm font-medium`},`Auto-loading (Infinite)`,-1),o(u(`input`,{"onUpdate:modelValue":t[0]||=e=>p.value=e,type:`checkbox`,class:`toggle toggle-primary toggle-sm`},null,512),[[d,p.value]])]),u(`button`,{class:`btn btn-sm btn-soft btn-primary`,disabled:f.value,onClick:k},`Manual Load More`,8,C),u(`button`,{class:`btn btn-sm btn-soft btn-error`,onClick:t[1]||=e=>s.value=[]},`Clear Items`)])])]),default:i(()=>[h(c(_),{debug:c(O),class:`bg-base-100`,items:s.value,"item-size":60,loading:f.value,"load-distance":300,onLoad:A,onScroll:j},{item:i(({item:e,index:t})=>[u(`div`,w,[u(`span`,T,`#`+l(t),1),u(`span`,E,l(e.label),1)])]),loading:i(()=>[...t[10]||=[u(`div`,{class:`p-8 flex flex-col items-center justify-center gap-4 bg-base-200 border-t border-base-300`},[u(`span`,{class:`loading loading-spinner loading-lg text-primary`}),u(`span`,{class:`text-sm font-bold uppercase tracking-widest opacity-90`},`Fetching more items...`)],-1)]]),_:1},8,[`debug`,`items`,`loading`])]),_:1},8,[`code`]))}}),O=e({default:()=>k},1),k=D;const A={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-infinite-scroll/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:O}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:p}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-infinite-scroll/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Infinite Scroll - Virtual Scroll`}}};export{A as configValuesSerialized};