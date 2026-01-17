import{d as X,r,A as L,h as Y,g as q,l as G,w as u,u as A,o as c,a as l,q as P,B as h,x as I,p as a,c as g,e as f,y as S,F as U,C as Z,i as J,f as K}from"../chunks/chunk-e4V5FOSP.js";import{E as Q,V as ee,_ as ne,a as te}from"../chunks/chunk-MYTeg86T.js";import{_ as oe}from"../chunks/chunk-Be-ltuh_.js";/* empty css                      */import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const le=`<script setup lang="ts">
import type { ScrollAlignment, ScrollAlignmentOptions, ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, reactive, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const rowCount = ref(1000);
const colCount = ref(1000);
const defaultRowHeight = ref(35);
const defaultColWidth = ref(100);
const bufferBefore = ref(5);
const bufferAfter = ref(5);

const manualRowHeights = reactive<Record<number, number>>({});
const manualColWidths = reactive<Record<number, number>>({});

const getRowHeight = (_item: unknown, index: number) => manualRowHeights[ index ] ?? defaultRowHeight.value;
const getColWidth = (index: number) => manualColWidths[ index ] ?? defaultColWidth.value;

// Generate column labels (A, B, C, ..., AA, AB, ...)
function getColumnLabel(index: number): string {
  let label = '';
  let i = index;
  while (i >= 0) {
    label = String.fromCharCode(65 + (i % 26)) + label;
    i = Math.floor(i / 26) - 1;
  }
  return label;
}

const items = computed(() => Array.from({ length: rowCount.value }, (_, i) => ({
  id: i,
  label: \`Row \${ i + 1 }\`,
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

function getCellContent(row: number, col: number) {
  if (row === 0) {
    return getColumnLabel(col - 1);
  }
  if (col === 0) {
    return row;
  }
  return \`R\${ row }C\${ col }\`;
}

// Resizing logic
const resizing = ref<{
  type: 'row' | 'col';
  index: number;
  initialPos: number;
  initialSize: number;
} | null>(null);

function startResizing(e: PointerEvent, type: 'row' | 'col', index: number) {
  e.preventDefault();
  e.stopPropagation();

  const initialSize = type === 'row' ? getRowHeight(null, index) : getColWidth(index);
  const initialPos = type === 'row' ? e.clientY : e.clientX;

  resizing.value = { type, index, initialPos, initialSize };

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', stopResizing);
  document.body.style.cursor = type === 'row' ? 'row-resize' : 'col-resize';
}

let rafId: number | null = null;

function handlePointerMove(e: PointerEvent) {
  if (!resizing.value) {
    return;
  }

  const { type, index, initialPos, initialSize } = resizing.value;
  const currentPos = type === 'row' ? e.clientY : e.clientX;
  const delta = currentPos - initialPos;
  const newSize = Math.max(20, initialSize + delta);

  if (type === 'row') {
    manualRowHeights[ index ] = newSize;
  } else {
    manualColWidths[ index ] = newSize;
  }

  if (rafId === null) {
    rafId = requestAnimationFrame(() => {
      virtualScrollRef.value?.refresh();
      rafId = null;
    });
  }
}

function stopResizing() {
  resizing.value = null;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointerup', stopResizing);
  document.body.style.cursor = '';
  virtualScrollRef.value?.refresh();
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="text-secondary font-bold uppercase opacity-60 pe-2 align-baseline">Spreadsheet</span>
    </template>

    <template #description>
      A bidirectional grid demonstrating spreadsheet-like functionality with {{ rowCount.toLocaleString() }} rows and {{ colCount.toLocaleString() }} columns.
      Features include <strong>sticky column headers</strong> (A, B, C...) and <strong>sticky row headers</strong> (1, 2, 3...).
      <strong>New:</strong> Drag the edges of headers to resize rows and columns.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5" />
      </svg>
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="both" />

        <ScrollControls
          v-model:item-count="rowCount"
          v-model:item-size="defaultRowHeight"
          v-model:column-count="colCount"
          v-model:column-width="defaultColWidth"
          v-model:buffer-before="bufferBefore"
          v-model:buffer-after="bufferAfter"
          direction="both"
          @scroll-to-index="handleScrollToIndex"
          @scroll-to-offset="handleScrollToOffset"
          @refresh="virtualScrollRef?.refresh()"
        />
      </div>
    </template>

    <div class="spreadsheet-wrapper border border-base-300 rounded-box overflow-hidden bg-base-200">
      <VirtualScroll
        ref="virtualScrollRef"
        :items="items"
        :item-size="getRowHeight"
        direction="both"
        :column-count="colCount"
        :column-width="getColWidth"
        :buffer-before="bufferBefore"
        :buffer-after="bufferAfter"
        :debug="debugMode"
        :sticky-indices="[0]"
        class="spreadsheet-grid"
        @scroll="onScroll"
      >
        <template #item="{ index, columnRange, isStickyActive }">
          <div
            class="spreadsheet-row flex-nowrap"
            :class="{ 'is-header-row': index === 0, 'is-sticky': isStickyActive }"
            :style="{ height: \`\${ getRowHeight(null, index) }px\` }"
          >
            <!-- Row Header (Column 0) - Always rendered and sticky -->
            <div
              class="spreadsheet-cell row-header shrink-0"
              :style="{
                width: \`\${ getColWidth(0) }px\`,
                height: \`\${ getRowHeight(null, index) }px\`,
              }"
            >
              {{ index === 0 ? '' : index }}
              <div
                v-if="index > 0"
                class="row-resizer"
                @pointerdown="startResizing($event, 'row', index)"
              />
            </div>

            <!-- Spacer for virtualized columns (accounting for the manually rendered Column 0) -->
            <div
              class="shrink-0"
              :style="{
                width: \`\${ Math.max(0, columnRange.padStart - getColWidth(0)) }px\`,
              }"
            />

            <!-- Visible Cells (excluding Column 0) -->
            <template v-for="colIdx in (columnRange.end - columnRange.start)" :key="colIdx + columnRange.start">
              <div
                v-if="(colIdx - 1 + columnRange.start) > 0"
                class="spreadsheet-cell shrink-0"
                :class="{ 'col-header': index === 0 }"
                :style="{
                  width: \`\${ getColWidth(colIdx - 1 + columnRange.start) }px\`,
                  height: \`\${ getRowHeight(null, index) }px\`,
                }"
              >
                {{ getCellContent(index, colIdx - 1 + columnRange.start) }}
                <div
                  v-if="index === 0"
                  class="col-resizer"
                  @pointerdown="startResizing($event, 'col', colIdx - 1 + columnRange.start)"
                />
              </div>
            </template>

            <!-- Spacer for end of row -->
            <div
              class="shrink-0"
              :style="{
                width: \`\${ columnRange.padEnd }px\`,
              }"
            />
          </div>
        </template>
      </VirtualScroll>
    </div>
  </ExampleContainer>
</template>

<style scoped>
@reference "../../assets/style.css";

.spreadsheet-wrapper {
  height: 100%;
}

.spreadsheet-grid {
  @apply bg-base-100;
}

.spreadsheet-row {
  @apply flex whitespace-nowrap bg-base-100 transition-colors;

  &.is-header-row {
    z-index: 30;
  }

  &.is-sticky {
    z-index: 20;
  }

  &:hover {
    @apply bg-base-200/50;
  }
}

.spreadsheet-cell {
  @apply relative inline-flex items-center justify-center border-r border-b border-base-300 text-sm px-2 box-border bg-inherit;
}

.row-header {
  @apply sticky left-0 z-10 font-bold bg-base-300 border-r-2 border-base-300 text-base-content/60;

  .is-header-row & {
    @apply z-40 bg-base-300 text-neutral-content;
  }
}

.col-header {
  @apply font-bold bg-base-300 border-b-2 border-base-300 text-base-content/60;
}

.col-resizer {
  @apply absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-50;
}

.row-resizer {
  @apply absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/50 transition-colors z-50;
}
</style>
`,re={class:"flex flex-wrap gap-4 items-start"},ie={class:"spreadsheet-wrapper border border-base-300 rounded-box overflow-hidden bg-base-200"},ae=["onPointerdown"],se=["onPointerdown"],de=X({__name:"+Page",setup(fe){const w=r(1e3),b=r(1e3),x=r(35),z=r(100),C=r(5),R=r(5),T=L({}),E=L({}),p=(t,e)=>T[e]??x.value,m=t=>E[t]??z.value;function V(t){let e="",n=t;for(;n>=0;)e=String.fromCharCode(65+n%26)+e,n=Math.floor(n/26)-1;return e}const W=Y(()=>Array.from({length:w.value},(t,e)=>({id:e,label:`Row ${e+1}`}))),s=r(),$=r(null),j=q("debugMode",r(!1));function O(t){$.value=t}function _(t,e,n){s.value?.scrollToIndex(t,e,n)}function F(t,e){s.value?.scrollToOffset(t,e)}function N(t,e){return t===0?V(e-1):e===0?t:`R${t}C${e}`}const y=r(null);function D(t,e,n){t.preventDefault(),t.stopPropagation();const o=e==="row"?p(null,n):m(n),v=e==="row"?t.clientY:t.clientX;y.value={type:e,index:n,initialPos:v,initialSize:o},window.addEventListener("pointermove",M),window.addEventListener("pointerup",H),document.body.style.cursor=e==="row"?"row-resize":"col-resize"}let d=null;function M(t){if(!y.value)return;const{type:e,index:n,initialPos:o,initialSize:v}=y.value,k=(e==="row"?t.clientY:t.clientX)-o,B=Math.max(20,v+k);e==="row"?T[n]=B:E[n]=B,d===null&&(d=requestAnimationFrame(()=>{s.value?.refresh(),d=null}))}function H(){y.value=null,d!==null&&(cancelAnimationFrame(d),d=null),window.removeEventListener("pointermove",M),window.removeEventListener("pointerup",H),document.body.style.cursor="",s.value?.refresh()}return(t,e)=>(c(),G(Q,{code:A(le)},{title:u(()=>[...e[7]||(e[7]=[l("span",{class:"text-secondary font-bold uppercase opacity-60 pe-2 align-baseline"},"Spreadsheet",-1)])]),description:u(()=>[f(" A bidirectional grid demonstrating spreadsheet-like functionality with "+S(w.value.toLocaleString())+" rows and "+S(b.value.toLocaleString())+" columns. Features include ",1),e[8]||(e[8]=l("strong",null,"sticky column headers",-1)),e[9]||(e[9]=f(" (A, B, C...) and ",-1)),e[10]||(e[10]=l("strong",null,"sticky row headers",-1)),e[11]||(e[11]=f(" (1, 2, 3...). ",-1)),e[12]||(e[12]=l("strong",null,"New:",-1)),e[13]||(e[13]=f(" Drag the edges of headers to resize rows and columns. ",-1))]),icon:u(()=>[...e[14]||(e[14]=[l("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg"},[l("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5"})],-1)])]),controls:u(()=>[l("div",re,[P(ne,{"scroll-details":$.value,direction:"both"},null,8,["scroll-details"]),P(oe,{"item-count":w.value,"onUpdate:itemCount":e[0]||(e[0]=n=>w.value=n),"item-size":x.value,"onUpdate:itemSize":e[1]||(e[1]=n=>x.value=n),"column-count":b.value,"onUpdate:columnCount":e[2]||(e[2]=n=>b.value=n),"column-width":z.value,"onUpdate:columnWidth":e[3]||(e[3]=n=>z.value=n),"buffer-before":C.value,"onUpdate:bufferBefore":e[4]||(e[4]=n=>C.value=n),"buffer-after":R.value,"onUpdate:bufferAfter":e[5]||(e[5]=n=>R.value=n),direction:"both",onScrollToIndex:_,onScrollToOffset:F,onRefresh:e[6]||(e[6]=n=>s.value?.refresh())},null,8,["item-count","item-size","column-count","column-width","buffer-before","buffer-after"])])]),default:u(()=>[l("div",ie,[P(A(ee),{ref_key:"virtualScrollRef",ref:s,items:W.value,"item-size":p,direction:"both","column-count":b.value,"column-width":m,"buffer-before":C.value,"buffer-after":R.value,debug:A(j),"sticky-indices":[0],class:"spreadsheet-grid",onScroll:O},{item:u(({index:n,columnRange:o,isStickyActive:v})=>[l("div",{class:I(["spreadsheet-row flex-nowrap",{"is-header-row":n===0,"is-sticky":v}]),style:h({height:`${p(null,n)}px`})},[a(" Row Header (Column 0) - Always rendered and sticky "),l("div",{class:"spreadsheet-cell row-header shrink-0",style:h({width:`${m(0)}px`,height:`${p(null,n)}px`})},[f(S(n===0?"":n)+" ",1),n>0?(c(),g("div",{key:0,class:"row-resizer",onPointerdown:i=>D(i,"row",n)},null,40,ae)):a("v-if",!0)],4),a(" Spacer for virtualized columns (accounting for the manually rendered Column 0) "),l("div",{class:"shrink-0",style:h({width:`${Math.max(0,o.padStart-m(0))}px`})},null,4),a(" Visible Cells (excluding Column 0) "),(c(!0),g(U,null,Z(o.end-o.start,i=>(c(),g(U,{key:i+o.start},[i-1+o.start>0?(c(),g("div",{key:0,class:I(["spreadsheet-cell shrink-0",{"col-header":n===0}]),style:h({width:`${m(i-1+o.start)}px`,height:`${p(null,n)}px`})},[f(S(N(n,i-1+o.start))+" ",1),n===0?(c(),g("div",{key:0,class:"col-resizer",onPointerdown:k=>D(k,"col",i-1+o.start)},null,40,se)):a("v-if",!0)],6)):a("v-if",!0)],64))),128)),a(" Spacer for end of row "),l("div",{class:"shrink-0",style:h({width:`${o.padEnd}px`})},null,4)],6)]),_:1},8,["items","column-count","buffer-before","buffer-after","debug"])])]),_:1},8,["code"]))}}),ue=te(de,[["__scopeId","data-v-75da5f10"]]),ce=Object.freeze(Object.defineProperty({__proto__:null,default:ue},Symbol.toStringTag,{value:"Module"})),ze={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:K}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-spreadsheet/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ce}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:J}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-spreadsheet/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Spreadsheet Grid"}}};export{ze as configValuesSerialized};
