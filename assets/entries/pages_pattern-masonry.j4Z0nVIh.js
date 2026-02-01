import{d as H,l as L,w as i,u as f,m as N,p,o as b,a as l,e as B,c as k,F as Y,r as K,b as A,s as $,t as D,j as z,I as F,L as G,i as X,f as q,g as J,h as Q}from"../chunks/chunk-BDlHe8BJ.js";import{V as W}from"../chunks/chunk-CY8_agoq.js";import{_ as Z,a as ee}from"../chunks/chunk-C1op8fmR.js";import{c as ne}from"../chunks/chunk-CX-OuWtW.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const te=`<script setup lang="ts">
import type { ScrollDetails, VirtualScrollInstance } from '@pdanpdan/virtual-scroll';
import type { ComponentPublicInstance, Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, nextTick, reactive, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
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
const scrollDetails = ref<ScrollDetails | null>(null);

const columnRefs = ref<VirtualScrollInstance<MasonryItem>[]>([]);
const itemRefs = reactive(new Map<number, HTMLElement>());

/**
 * Handles keyboard navigation for masonry items.
 *
 * @param event - Keyboard event
 * @param colIndex - Current column index
 * @param itemIndex - Current item index in the column
 * @param item - Current masonry item
 */
function handleKeyDown(event: KeyboardEvent, colIndex: number, itemIndex: number, item: MasonryItem) {
  const colVs = columnRefs.value[ colIndex ];
  if (!colVs) {
    return;
  }

  const offset = colVs.getRowOffset(itemIndex);
  const midY = offset + item.height / 2;

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      if (itemIndex > 0) {
        const nextIdx = itemIndex - 1;
        colVs.scrollToIndex(nextIdx, null, { align: 'center' });
        setTimeout(() => {
          const el = itemRefs.get(columns[ colIndex ][ nextIdx ].id);
          el?.focus({ preventScroll: true });
        });
      }
      break;
    case 'ArrowDown':
      event.preventDefault();
      if (itemIndex < columns[ colIndex ].length - 1) {
        const nextIdx = itemIndex + 1;
        colVs.scrollToIndex(nextIdx, null, { align: 'center' });
        setTimeout(() => {
          const el = itemRefs.get(columns[ colIndex ][ nextIdx ].id);
          el?.focus({ preventScroll: true });
        });
      }
      break;
    case 'ArrowLeft':
    case 'ArrowRight': {
      event.preventDefault();
      const isRight = event.key === 'ArrowRight';
      const nextColIdx = isRight ? colIndex + 1 : colIndex - 1;

      if (nextColIdx >= 0 && nextColIdx < COLUMN_COUNT) {
        const nextColVs = columnRefs.value[ nextColIdx ];
        const nextColItems = columns[ nextColIdx ];

        // Find item in next column that best matches vertical position
        let bestIdx = 0;
        let minDiff = Number.MAX_VALUE;

        for (let i = 0; i < nextColItems.length; i++) {
          const itemOffset = nextColVs.getRowOffset(i);
          const itemHeight = nextColItems[ i ].height;
          const itemMidY = itemOffset + itemHeight / 2;
          const diff = Math.abs(itemMidY - midY);

          if (diff < minDiff) {
            minDiff = diff;
            bestIdx = i;
          } else if (itemMidY > midY + 500) {
            // Optimization: stop searching if we are way past
            break;
          }
        }

        nextColVs.scrollToIndex(bestIdx, null, { align: 'auto' });
        nextTick(() => {
          const el = itemRefs.get(nextColItems[ bestIdx ].id);
          el?.focus();
        });
      }
      break;
    }
  }
}

/**
 * Sets the reference for a masonry item element.
 *
 * @param el - Item element
 * @param id - Item ID
 */
function setItemRef(el: Element | null | ComponentPublicInstance, id: number) {
  if (el) {
    itemRefs.set(id, el as HTMLElement);
  } else {
    itemRefs.delete(id);
  }
}
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

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
    </template>

    <div ref="containerRef" class="size-full overflow-auto bg-base-100">
      <!-- Common wrapper to hold all columns -->
      <div class="flex gap-4 p-4 min-h-full items-start">
        <div
          v-for="(colItems, colIndex) in columns"
          :key="colIndex"
          class="flex-1"
        >
          <VirtualScroll
            ref="columnRefs"
            class="outline-0"
            style="overflow: visible"
            :container="containerRef || undefined"
            :items="colItems"
            :debug="debugMode"
            @scroll="(details) => colIndex === 0 ? scrollDetails = details : undefined"
          >
            <template #item="{ item, index }">
              <div
                :ref="(el) => setItemRef(el, item.id)"
                role="button"
                tabindex="0"
                class="mb-4 rounded-box p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm border border-base-content/5 outline-none focus-visible:ring-4 focus-visible:ring-primary/50 cursor-pointer"
                :style="{
                  height: \`\${ item.height }px\`,
                  backgroundColor: item.color,
                }"
                @keydown="handleKeyDown($event, colIndex, index, item)"
              >
                <div class="flex justify-between items-start">
                  <span class="bg-base-300/30 px-2 py-0.5 rounded text-xs font-bold small-caps tracking-wider text-base-content/70">
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
`,oe={class:"flex gap-4 p-4 min-h-full items-start"},le=["onKeydown"],ie={class:"flex justify-between items-start"},se={class:"bg-base-300/30 px-2 py-0.5 rounded text-xs font-bold small-caps tracking-wider text-base-content/70"},re={class:"text-white/90 text-xs font-medium"},h=3,ae=H({__name:"+Page",setup(ce){const _=N("debugMode",p(!1)),V=ne(6789),U=Array.from({length:300},(n,e)=>({id:e,height:150+V()*250,color:`hsl(${e*137.5%360}, 60%, 65%)`})),s=Array.from({length:h},()=>[]),x=Array.from({length:h},()=>0);for(const n of U){let e=0;for(let o=1;o<h;o++)x[o]<x[e]&&(e=o);s[e].push(n),x[e]+=n.height}const w=p(null),I=p(null),g=p([]),m=G(new Map);function E(n,e,o,u){const t=g.value[e];if(!t)return;const r=t.getRowOffset(o)+u.height/2;switch(n.key){case"ArrowUp":if(n.preventDefault(),o>0){const a=o-1;t.scrollToIndex(a,null,{align:"center"}),setTimeout(()=>{m.get(s[e][a].id)?.focus({preventScroll:!0})})}break;case"ArrowDown":if(n.preventDefault(),o<s[e].length-1){const a=o+1;t.scrollToIndex(a,null,{align:"center"}),setTimeout(()=>{m.get(s[e][a].id)?.focus({preventScroll:!0})})}break;case"ArrowLeft":case"ArrowRight":{n.preventDefault();const d=n.key==="ArrowRight"?e+1:e-1;if(d>=0&&d<h){const T=g.value[d],v=s[d];let y=0,C=Number.MAX_VALUE;for(let c=0;c<v.length;c++){const P=T.getRowOffset(c),O=v[c].height,M=P+O/2,R=Math.abs(M-r);if(R<C)C=R,y=c;else if(M>r+500)break}T.scrollToIndex(y,null,{align:"auto"}),F(()=>{m.get(v[y].id)?.focus()})}break}}}function j(n,e){n?m.set(e,n):m.delete(e)}return(n,e)=>(b(),L(Z,{code:f(te)},{title:i(()=>[...e[0]||(e[0]=[l("span",{class:"example-title example-title--group-7"},"Masonry Grid",-1)])]),description:i(()=>[...e[1]||(e[1]=[z(" Achieved by placing multiple VirtualScroll components side-by-side, sharing a single scroll container. Each column handles its own virtualization and dynamic heights. ",-1)])]),icon:i(()=>[...e[2]||(e[2]=[l("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-7"},[l("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3 3h8v11H3z M3 16h8v5H3z M13 3h8v6h-8z M13 11h8v10h-8z"})],-1)])]),subtitle:i(()=>[...e[3]||(e[3]=[z(" Achieve masonry layout by combining multiple columns ",-1)])]),controls:i(()=>[A(ee,{"scroll-details":I.value},null,8,["scroll-details"])]),default:i(()=>[l("div",{ref_key:"containerRef",ref:w,class:"size-full overflow-auto bg-base-100"},[B(" Common wrapper to hold all columns "),l("div",oe,[(b(!0),k(Y,null,K(f(s),(o,u)=>(b(),k("div",{key:u,class:"flex-1"},[A(f(W),{ref_for:!0,ref_key:"columnRefs",ref:g,class:"outline-0",style:{overflow:"visible"},container:w.value||void 0,items:o,debug:f(_),onScroll:t=>u===0?I.value=t:void 0},{item:i(({item:t,index:S})=>[l("div",{ref_for:!0,ref:r=>j(r,t.id),role:"button",tabindex:"0",class:"mb-4 rounded-box p-4 flex flex-col justify-between transition-transform hover:scale-[1.02] shadow-sm border border-base-content/5 outline-none focus-visible:ring-4 focus-visible:ring-primary/50 cursor-pointer",style:$({height:`${t.height}px`,backgroundColor:t.color}),onKeydown:r=>E(r,u,S,t)},[l("div",ie,[l("span",se," Card #"+D(t.id),1)]),l("div",re," Dynamic Height: "+D(Math.round(t.height))+"px ",1)],44,le)]),_:2},1032,["container","items","debug","onScroll"])]))),128))])],512)]),_:1},8,["code"]))}}),de=Object.freeze(Object.defineProperty({__proto__:null,default:ae},Symbol.toStringTag,{value:"Module"})),Se={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:Q}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:J}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:q}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-masonry/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:de}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:X}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-masonry/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Masonry Grid | Virtual Scroll"}}};export{Se as configValuesSerialized};
