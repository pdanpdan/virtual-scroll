import{t as e}from"../chunks/chunk-v_CCr7DM.js";import{C as t,G as n,H as r,M as i,N as a,R as o,T as s,V as c,W as l,_ as u,b as d,h as f,o as p,t as m,v as h,w as g,y as _}from"../chunks/chunk-CZEdwOsv.js";import"../chunks/chunk-YW3sP-nK.js";import{n as v}from"../chunks/chunk-BoapzTav.js";/* empty css                      *//* empty css                      *//* empty css                      */import{t as y}from"../chunks/chunk-BYGEeXHk.js";import{t as b}from"../chunks/chunk-j6C98bc1.js";var x=`<script setup lang="ts">
import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import { createSeededRandom } from '#/random';

import rawCode from './+Page.vue?raw';

interface MasonryItem {
  id: number;
  height: number;
  color: string;
}

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
`,S={class:`flex gap-4 p-4 min-h-full items-start`},C={class:`flex justify-between items-start`},w={class:`bg-base-300/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-base-content/70`},T={class:`text-white/90 text-xs font-medium`},E=3,D=s({__name:`+Page`,setup(e){let s=b(6789),p=Array.from({length:300},(e,t)=>({id:t,height:150+s()*250,color:`hsl(${t*137.5%360}, 60%, 65%)`})),m=Array.from({length:E},()=>[]),D=Array.from({length:E},()=>0);for(let e of p){let t=0;for(let e=1;e<E;e++)D[e]<D[t]&&(t=e);m[t].push(e),D[t]+=e.height}let O=c(null);return(e,s)=>(i(),h(y,{code:r(x)},{title:o(()=>[...s[0]||=[u(`span`,{class:`example-title example-title--group-7`},`Masonry Grid`,-1)]]),description:o(()=>[...s[1]||=[t(` Achieved by placing multiple VirtualScroll components side-by-side, sharing a single scroll container. Each column handles its own virtualization and dynamic heights. `,-1)]]),icon:o(()=>[...s[2]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-7`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3 3h8v11H3z M3 16h8v5H3z M13 3h8v6h-8z M13 11h8v10h-8z`})],-1)]]),subtitle:o(()=>[...s[3]||=[t(` Achieve masonry layout by combining multiple columns `,-1)]]),default:o(()=>[u(`div`,{ref_key:`containerRef`,ref:O,class:`size-full overflow-auto bg-base-300`},[_(` Common wrapper to hold all columns `),u(`div`,S,[(i(!0),d(f,null,a(r(m),(e,t)=>(i(),d(`div`,{key:t,class:`flex-1`},[g(r(v),{class:`outline-0`,style:{overflow:`visible`},container:O.value||void 0,items:e},{item:o(({item:e})=>[u(`div`,{class:`mb-4 rounded-box p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm border border-base-content/5`,style:l({height:`${e.height}px`,backgroundColor:e.color})},[u(`div`,C,[u(`span`,w,` Card #`+n(e.id),1)]),u(`div`,T,` Dynamic Height: `+n(Math.round(e.height))+`px `,1)],4)]),_:1},8,[`container`,`items`])]))),128))])],512)]),_:1},8,[`code`]))}}),O=e({default:()=>k},1),k=D;const A={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:p}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-masonry/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:O}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:m}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-masonry/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Masonry Grid | Virtual Scroll`}}};export{A as configValuesSerialized};