import{t as e}from"../chunks/chunk-CWRknLO5.js";import{C as t,D as n,G as r,H as i,M as a,N as o,R as s,T as c,V as l,W as u,_ as d,b as f,h as p,o as m,t as h,v as g,w as _,y as v}from"../chunks/chunk-Bbo8JVN3.js";import"../chunks/chunk-IpJMSSJ3.js";/* empty css                      */import{n as y}from"../chunks/chunk-BW4At0r8.js";/* empty css                      *//* empty css                      */import{t as b}from"../chunks/chunk-DYvhkp1A.js";import{t as x}from"../chunks/chunk-nuTSYr7g.js";var S=`<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import { createSeededRandom } from '#/random';

import rawCode from './+Page.vue?raw';

interface MasonryItem {
  id: number;
  height: number;
  color: string;
}

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const COLUMN_COUNT = 3;
const random = createSeededRandom(6789);

const items = Array.from({ length: 300 }, (_, i) => ({
  id: i,
  height: 150 + random() * 250,
  color: \`hsl(\${ (i * 137.5) % 360 }, 60%, 65%)\`,
}));

// Distribute items into columns
const columns = Array.from({ length: COLUMN_COUNT }, () => [] as MasonryItem[]);
const columnHeights = Array.from({ length: COLUMN_COUNT }, () => 0);

for (const item of items) {
  // Find shortest column
  let shortestIndex = 0;
  for (let j = 1; j < COLUMN_COUNT; j++) {
    if (columnHeights[ j ] < columnHeights[ shortestIndex ]) {
      shortestIndex = j;
    }
  }
  columns[ shortestIndex ].push(item);
  columnHeights[ shortestIndex ] += item.height;
}

const containerRef = ref<HTMLElement | null>(null);
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-7">Masonry Grid</span>
    </template>

    <template #description>
      Achieved by placing multiple VirtualScroll components side-by-side, sharing a single scroll container. Each column handles its own virtualization and dynamic heights.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-7"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h8v11H3z M3 16h8v5H3z M13 3h8v6h-8z M13 11h8v10h-8z" />
      </svg>
    </template>

    <template #subtitle>
      Achieve masonry layout by combining multiple columns
    </template>

    <div ref="containerRef" class="size-full overflow-auto bg-base-300">
      <!-- Common wrapper to hold all columns -->
      <div class="flex gap-4 p-4 min-h-full items-start">
        <div
          v-for="(colItems, colIndex) in columns"
          :key="colIndex"
          class="flex-1"
        >
          <VirtualScroll
            class="outline-0"
            style="overflow: visible"
            :container="containerRef || undefined"
            :items="colItems"
            :debug="debugMode"
          >
            <template #item="{ item }">
              <div
                class="mb-4 rounded-box p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm border border-base-content/5"
                :style="{
                  height: \`\${ item.height }px\`,
                  backgroundColor: item.color,
                }"
              >
                <div class="flex justify-between items-start">
                  <span class="bg-base-300/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-base-content/70">
                    Card #{{ item.id }}
                  </span>
                </div>
                <div class="text-white/90 text-xs font-medium">
                  Dynamic Height: {{ Math.round(item.height) }}px
                </div>
              </div>
            </template>
          </VirtualScroll>
        </div>
      </div>
    </div>
  </ExampleContainer>
</template>
`,C={class:`flex gap-4 p-4 min-h-full items-start`},w={class:`flex justify-between items-start`},T={class:`bg-base-300/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-base-content/70`},E={class:`text-white/90 text-xs font-medium`},D=3,O=c({__name:`+Page`,setup(e){let c=n(`debugMode`,l(!1)),m=x(6789),h=Array.from({length:300},(e,t)=>({id:t,height:150+m()*250,color:`hsl(${t*137.5%360}, 60%, 65%)`})),O=Array.from({length:D},()=>[]),k=Array.from({length:D},()=>0);for(let e of h){let t=0;for(let e=1;e<D;e++)k[e]<k[t]&&(t=e);O[t].push(e),k[t]+=e.height}let A=l(null);return(e,n)=>(a(),g(b,{code:i(S)},{title:s(()=>[...n[0]||=[d(`span`,{class:`example-title example-title--group-7`},`Masonry Grid`,-1)]]),description:s(()=>[...n[1]||=[t(` Achieved by placing multiple VirtualScroll components side-by-side, sharing a single scroll container. Each column handles its own virtualization and dynamic heights. `,-1)]]),icon:s(()=>[...n[2]||=[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-7`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 3h8v11H3z M3 16h8v5H3z M13 3h8v6h-8z M13 11h8v10h-8z`})],-1)]]),subtitle:s(()=>[...n[3]||=[t(` Achieve masonry layout by combining multiple columns `,-1)]]),default:s(()=>[d(`div`,{ref_key:`containerRef`,ref:A,class:`size-full overflow-auto bg-base-300`},[v(` Common wrapper to hold all columns `),d(`div`,C,[(a(!0),f(p,null,o(i(O),(e,t)=>(a(),f(`div`,{key:t,class:`flex-1`},[_(i(y),{class:`outline-0`,style:{overflow:`visible`},container:A.value||void 0,items:e,debug:i(c)},{item:s(({item:e})=>[d(`div`,{class:`mb-4 rounded-box p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm border border-base-content/5`,style:u({height:`${e.height}px`,backgroundColor:e.color})},[d(`div`,w,[d(`span`,T,` Card #`+r(e.id),1)]),d(`div`,E,` Dynamic Height: `+r(Math.round(e.height))+`px `,1)],4)]),_:1},8,[`container`,`items`,`debug`])]))),128))])],512)]),_:1},8,[`code`]))}}),k=e({default:()=>A},1),A=O;const j={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:m}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-masonry/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:k}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:h}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-masonry/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Masonry Grid | Virtual Scroll`}}};export{j as configValuesSerialized};