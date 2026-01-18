import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,I as i,L as a,T as o,U as s,_ as c,j as l,l as u,o as d,t as f,v as p,w as m,z as h}from"../chunks/chunk-CDbjmS3T.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{n as g,r as _,t as v}from"../chunks/chunk-B7wtXgO1.js";/* empty css                      *//* empty css                      */var y=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const items = ref(Array.from({ length: 50 }, (_, i) => ({ id: \`orig-\${ i }\`, label: \`Original Item \${ i }\` })));
const prependCount = ref(0);
const restoreScrollOnPrepend = ref(true);
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function prependItems() {
  const count = 5;
  const newItems = Array.from({ length: count }, (_, i) => ({
    id: \`prepended-\${ prependCount.value + i }\`,
    label: \`Prepended Item \${ prependCount.value + i }\`,
  }));

  items.value = [ ...newItems, ...items.value ];
  prependCount.value += count;
}

const appendCount = ref(0);
function appendItems() {
  const count = 5;
  const newItems = Array.from({ length: count }, (_, i) => ({
    id: \`appended-\${ appendCount.value + i }\`,
    label: \`Appended Item \${ appendCount.value + i }\`,
  }));

  items.value = [ ...items.value, ...newItems ];
  appendCount.value += count;
}

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="text-warning font-bold uppercase opacity-60 pe-2 align-baseline">Scroll Restoration</span>
    </template>

    <template #description>
      Demonstrates the <strong>restoreScrollOnPrepend</strong> prop. Currently showing {{ items.length.toLocaleString() }} items. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-warning text-warning-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" class="rotate-180 origin-center" />
      </svg>
    </template>

    <template #subtitle>
      Maintain scroll position when prepending items
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <div class="flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300">
          <label class="flex items-center gap-2 cursor-pointer">
            <span class="text-sm font-medium">Restore Scroll on Prepend</span>
            <input v-model="restoreScrollOnPrepend" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>

          <button class="btn btn-sm btn-soft btn-primary" @click="prependItems">Prepend 5 Items</button>
          <button class="btn btn-sm btn-soft btn-primary" @click="appendItems">Append 5 Items</button>
          <button class="btn btn-sm btn-soft btn-error" @click="items = []">Clear</button>
        </div>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="bg-base-100"
      :items="items"
      :item-size="60"
      :restore-scroll-on-prepend="restoreScrollOnPrepend"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors">
          <span class="badge badge-neutral mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,b={class:`flex flex-wrap gap-2 md:gap-4 items-start`},x={class:`flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300`},S={class:`flex items-center gap-2 cursor-pointer`},C={class:`h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors`},w={class:`badge badge-neutral mr-4`},T={class:`font-medium`},E=o({__name:`+Page`,setup(e){let o=h(Array.from({length:50},(e,t)=>({id:`orig-${t}`,label:`Original Item ${t}`}))),d=h(0),f=h(!0),E=h(null),D=r(`debugMode`,h(!1));function O(){o.value=[...Array.from({length:5},(e,t)=>({id:`prepended-${d.value+t}`,label:`Prepended Item ${d.value+t}`})),...o.value],d.value+=5}let k=h(0);function A(){let e=Array.from({length:5},(e,t)=>({id:`appended-${k.value+t}`,label:`Appended Item ${k.value+t}`}));o.value=[...o.value,...e],k.value+=5}function j(e){E.value=e}return(e,r)=>(l(),p(g,{code:t(y)},{title:i(()=>[...r[2]||=[c(`span`,{class:`text-warning font-bold uppercase opacity-60 pe-2 align-baseline`},`Scroll Restoration`,-1)]]),description:i(()=>[r[3]||=n(` Demonstrates the `,-1),r[4]||=c(`strong`,null,`restoreScrollOnPrepend`,-1),n(` prop. Currently showing `+s(o.value.length.toLocaleString())+` items. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable. `,1)]),icon:i(()=>[...r[5]||=[c(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-warning text-warning-content shadow-lg`},[c(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99`,class:`rotate-180 origin-center`})],-1)]]),subtitle:i(()=>[...r[6]||=[n(` Maintain scroll position when prepending items `,-1)]]),controls:i(()=>[c(`div`,b,[m(v,{"scroll-details":E.value,direction:`vertical`},null,8,[`scroll-details`]),c(`div`,x,[c(`label`,S,[r[7]||=c(`span`,{class:`text-sm font-medium`},`Restore Scroll on Prepend`,-1),a(c(`input`,{"onUpdate:modelValue":r[0]||=e=>f.value=e,type:`checkbox`,class:`toggle toggle-primary toggle-sm`},null,512),[[u,f.value]])]),c(`button`,{class:`btn btn-sm btn-soft btn-primary`,onClick:O},`Prepend 5 Items`),c(`button`,{class:`btn btn-sm btn-soft btn-primary`,onClick:A},`Append 5 Items`),c(`button`,{class:`btn btn-sm btn-soft btn-error`,onClick:r[1]||=e=>o.value=[]},`Clear`)])])]),default:i(()=>[m(t(_),{debug:t(D),class:`bg-base-100`,items:o.value,"item-size":60,"restore-scroll-on-prepend":f.value,onScroll:j},{item:i(({item:e,index:t})=>[c(`div`,C,[c(`span`,w,`#`+s(t),1),c(`span`,T,s(e.label),1)])]),_:1},8,[`debug`,`items`,`restore-scroll-on-prepend`])]),_:1},8,[`code`]))}}),D=e({default:()=>O},1),O=E;const k={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-scroll-restoration/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:D}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-scroll-restoration/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Scroll Restoration - Virtual Scroll`}}};export{k as configValuesSerialized};