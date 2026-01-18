import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,L as i,M as a,R as o,T as s,V as c,W as l,_ as u,l as d,o as f,t as p,v as m,w as h}from"../chunks/chunk-CeuQGv84.js";import"../chunks/chunk-CTpTqTDb.js";import"../chunks/chunk-CNwi8UUp.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as g,r as _,t as v}from"../chunks/chunk-znpjYd2Q.js";/* empty css                      */var y=`<script setup lang="ts">
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
      <span class="text-warning font-bold uppercase opacity-90 pe-2 align-baseline">Scroll Restoration</span>
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
`,b={class:`flex flex-wrap gap-2 md:gap-4 items-start`},x={class:`flex flex-col items-stretch gap-4 p-4 bg-base-300 rounded-box border border-base-300`},S={class:`flex items-center gap-2 cursor-pointer`},C={class:`h-full flex items-center px-6 border-b border-base-200 hover:bg-base-300 transition-colors`},w={class:`badge badge-neutral mr-4`},T={class:`font-medium`},E=s({__name:`+Page`,setup(e){let s=t(Array.from({length:50},(e,t)=>({id:`orig-${t}`,label:`Original Item ${t}`}))),f=t(0),p=t(!0),E=t(null),D=r(`debugMode`,t(!1));function O(){s.value=[...Array.from({length:5},(e,t)=>({id:`prepended-${f.value+t}`,label:`Prepended Item ${f.value+t}`})),...s.value],f.value+=5}let k=t(0);function A(){let e=Array.from({length:5},(e,t)=>({id:`appended-${k.value+t}`,label:`Appended Item ${k.value+t}`}));s.value=[...s.value,...e],k.value+=5}function j(e){E.value=e}return(e,t)=>(a(),m(g,{code:c(y)},{title:i(()=>[...t[2]||=[u(`span`,{class:`text-warning font-bold uppercase opacity-90 pe-2 align-baseline`},`Scroll Restoration`,-1)]]),description:i(()=>[t[3]||=n(` Demonstrates the `,-1),t[4]||=u(`strong`,null,`restoreScrollOnPrepend`,-1),n(` prop. Currently showing `+l(s.value.length.toLocaleString())+` items. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable. `,1)]),icon:i(()=>[...t[5]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-warning text-warning-content shadow-lg`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99`,class:`rotate-180 origin-center`})],-1)]]),subtitle:i(()=>[...t[6]||=[n(` Maintain scroll position when prepending items `,-1)]]),controls:i(()=>[u(`div`,b,[h(v,{"scroll-details":E.value,direction:`vertical`},null,8,[`scroll-details`]),u(`div`,x,[u(`label`,S,[t[7]||=u(`span`,{class:`text-sm font-medium`},`Restore Scroll on Prepend`,-1),o(u(`input`,{"onUpdate:modelValue":t[0]||=e=>p.value=e,type:`checkbox`,class:`toggle toggle-primary toggle-sm`},null,512),[[d,p.value]])]),u(`button`,{class:`btn btn-sm btn-soft btn-primary`,onClick:O},`Prepend 5 Items`),u(`button`,{class:`btn btn-sm btn-soft btn-primary`,onClick:A},`Append 5 Items`),u(`button`,{class:`btn btn-sm btn-soft btn-error`,onClick:t[1]||=e=>s.value=[]},`Clear`)])])]),default:i(()=>[h(c(_),{debug:c(D),class:`bg-base-100`,items:s.value,"item-size":60,"restore-scroll-on-prepend":p.value,onScroll:j},{item:i(({item:e,index:t})=>[u(`div`,C,[u(`span`,w,`#`+l(t),1),u(`span`,T,l(e.label),1)])]),_:1},8,[`debug`,`items`,`restore-scroll-on-prepend`])]),_:1},8,[`code`]))}}),D=e({default:()=>O},1),O=E;const k={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-scroll-restoration/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:D}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:p}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-scroll-restoration/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Scroll Restoration - Virtual Scroll`}}};export{k as configValuesSerialized};