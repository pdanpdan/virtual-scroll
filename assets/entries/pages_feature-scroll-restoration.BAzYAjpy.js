import{t as e}from"../chunks/chunk-v_CCr7DM.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,V as c,_ as l,l as u,o as d,t as f,v as p,w as m,z as h}from"../chunks/chunk-CZEdwOsv.js";import"../chunks/chunk-YW3sP-nK.js";import{n as g}from"../chunks/chunk-BoapzTav.js";/* empty css                      *//* empty css                      *//* empty css                      */import{t as _}from"../chunks/chunk-BYGEeXHk.js";import{t as v}from"../chunks/chunk-BdOZaf3L.js";var y=`<script setup lang="ts">
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
      <span class="example-title example-title--group-3">Scroll Restoration</span>
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
        class="example-icon example-icon--group-3"
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

        <div class="flex flex-col items-stretch gap-4 p-5 bg-base-300 rounded-box border border-base-content/5 shadow-md">
          <label class="settings-item group">
            <span class="settings-label">Restore on Prepend</span>
            <input v-model="restoreScrollOnPrepend" type="checkbox" class="toggle toggle-primary toggle-sm" />
          </label>

          <div class="grid grid-cols-2 gap-2 mt-2">
            <button class="btn btn-sm btn-primary" @click="prependItems">Prepend 5</button>
            <button class="btn btn-sm btn-primary" @click="appendItems">Append 5</button>
            <button class="btn btn-sm btn-error btn-soft col-span-2" @click="items = []">Clear Items</button>
          </div>
        </div>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :restore-scroll-on-prepend="restoreScrollOnPrepend"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="example-vertical-item example-vertical-item--fixed">
          <span class="example-badge mr-4">#{{ index }}</span>
          <span class="font-medium">{{ item.label }}</span>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,b={class:`flex flex-wrap gap-2 md:gap-4 items-start`},x={class:`flex flex-col items-stretch gap-4 p-5 bg-base-300 rounded-box border border-base-content/5 shadow-md`},S={class:`settings-item group`},C={class:`grid grid-cols-2 gap-2 mt-2`},w={class:`example-vertical-item example-vertical-item--fixed`},T={class:`example-badge mr-4`},E={class:`font-medium`},D=s({__name:`+Page`,setup(e){let s=c(Array.from({length:50},(e,t)=>({id:`orig-${t}`,label:`Original Item ${t}`}))),d=c(0),f=c(!0),D=c(null),O=n(`debugMode`,c(!1));function k(){s.value=[...Array.from({length:5},(e,t)=>({id:`prepended-${d.value+t}`,label:`Prepended Item ${d.value+t}`})),...s.value],d.value+=5}let A=c(0);function j(){let e=Array.from({length:5},(e,t)=>({id:`appended-${A.value+t}`,label:`Appended Item ${A.value+t}`}));s.value=[...s.value,...e],A.value+=5}function M(e){D.value=e}return(e,n)=>(a(),p(_,{code:i(y)},{title:o(()=>[...n[2]||=[l(`span`,{class:`example-title example-title--group-3`},`Scroll Restoration`,-1)]]),description:o(()=>[n[3]||=t(` Demonstrates the `,-1),n[4]||=l(`strong`,null,`restoreScrollOnPrepend`,-1),t(` prop. Currently showing `+r(s.value.length.toLocaleString())+` items. When items are added to the beginning of the list, the scroll position is adjusted to keep the current view stable. `,1)]),icon:o(()=>[...n[5]||=[l(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-3`},[l(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99`,class:`rotate-180 origin-center`})],-1)]]),subtitle:o(()=>[...n[6]||=[t(` Maintain scroll position when prepending items `,-1)]]),controls:o(()=>[l(`div`,b,[m(v,{"scroll-details":D.value,direction:`vertical`},null,8,[`scroll-details`]),l(`div`,x,[l(`label`,S,[n[7]||=l(`span`,{class:`settings-label`},`Restore on Prepend`,-1),h(l(`input`,{"onUpdate:modelValue":n[0]||=e=>f.value=e,type:`checkbox`,class:`toggle toggle-primary toggle-sm`},null,512),[[u,f.value]])]),l(`div`,C,[l(`button`,{class:`btn btn-sm btn-primary`,onClick:k},`Prepend 5`),l(`button`,{class:`btn btn-sm btn-primary`,onClick:j},`Append 5`),l(`button`,{class:`btn btn-sm btn-error btn-soft col-span-2`,onClick:n[1]||=e=>s.value=[]},`Clear Items`)])])])]),default:o(()=>[m(i(g),{debug:i(O),class:`example-container`,items:s.value,"item-size":60,"restore-scroll-on-prepend":f.value,onScroll:M},{item:o(({item:e,index:t})=>[l(`div`,w,[l(`span`,T,`#`+r(t),1),l(`span`,E,r(e.label),1)])]),_:1},8,[`debug`,`items`,`restore-scroll-on-prepend`])]),_:1},8,[`code`]))}}),O=e({default:()=>k},1),k=D;const A={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:d}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-scroll-restoration/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:O}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:f}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-scroll-restoration/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Scroll Restoration | Virtual Scroll`}}};export{A as configValuesSerialized};