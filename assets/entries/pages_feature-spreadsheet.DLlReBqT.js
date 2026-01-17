import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,H as i,I as a,M as o,R as s,T as c,U as l,V as u,_ as d,b as f,g as p,h as m,j as h,o as g,t as _,v,w as y,y as b,z as x}from"../chunks/chunk-Cj2DfQl-.js";import"../chunks/chunk-CTpTqTDb.js";/* empty css                      *//* empty css                      */import{i as S,n as C,r as w,t as T}from"../chunks/chunk-COV_n11Q.js";/* empty css                      *//* empty css                      */import{t as E}from"../chunks/chunk-C9urrB3B.js";/* empty css                      */var D=`<script setup lang="ts">
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
`,O={class:`flex flex-wrap gap-4 items-start`},k={class:`spreadsheet-wrapper border border-base-300 rounded-box overflow-hidden bg-base-200`},A=[`onPointerdown`],j=[`onPointerdown`],M=c({__name:`+Page`,setup(e){let c=x(1e3),g=x(1e3),_=x(35),S=x(100),M=x(5),N=x(5),P=s({}),F=s({}),I=(e,t)=>P[t]??_.value,L=e=>F[e]??S.value;function R(e){let t=``,n=e;for(;n>=0;)t=String.fromCharCode(65+n%26)+t,n=Math.floor(n/26)-1;return t}let z=p(()=>Array.from({length:c.value},(e,t)=>({id:t,label:`Row ${t+1}`}))),B=x(),V=x(null),H=r(`debugMode`,x(!1));function U(e){V.value=e}function W(e,t,n){B.value?.scrollToIndex(e,t,n)}function G(e,t){B.value?.scrollToOffset(e,t)}function K(e,t){return e===0?R(t-1):t===0?e:`R${e}C${t}`}let q=x(null);function J(e,t,n){e.preventDefault(),e.stopPropagation();let r=t===`row`?I(null,n):L(n);q.value={type:t,index:n,initialPos:t===`row`?e.clientY:e.clientX,initialSize:r},window.addEventListener(`pointermove`,X),window.addEventListener(`pointerup`,Z),document.body.style.cursor=t===`row`?`row-resize`:`col-resize`}let Y=null;function X(e){if(!q.value)return;let{type:t,index:n,initialPos:r,initialSize:i}=q.value,a=(t===`row`?e.clientY:e.clientX)-r,o=Math.max(20,i+a);t===`row`?P[n]=o:F[n]=o,Y===null&&(Y=requestAnimationFrame(()=>{B.value?.refresh(),Y=null}))}function Z(){q.value=null,Y!==null&&(cancelAnimationFrame(Y),Y=null),window.removeEventListener(`pointermove`,X),window.removeEventListener(`pointerup`,Z),document.body.style.cursor=``,B.value?.refresh()}return(e,r)=>(h(),v(C,{code:t(D)},{title:a(()=>[...r[7]||=[d(`span`,{class:`text-secondary font-bold uppercase opacity-60 pe-2 align-baseline`},`Spreadsheet`,-1)]]),description:a(()=>[n(` A bidirectional grid demonstrating spreadsheet-like functionality with `+l(c.value.toLocaleString())+` rows and `+l(g.value.toLocaleString())+` columns. Features include `,1),r[8]||=d(`strong`,null,`sticky column headers`,-1),r[9]||=n(` (A, B, C...) and `,-1),r[10]||=d(`strong`,null,`sticky row headers`,-1),r[11]||=n(` (1, 2, 3...). `,-1),r[12]||=d(`strong`,null,`New:`,-1),r[13]||=n(` Drag the edges of headers to resize rows and columns. `,-1)]),icon:a(()=>[...r[14]||=[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5`})],-1)]]),controls:a(()=>[d(`div`,O,[y(T,{"scroll-details":V.value,direction:`both`},null,8,[`scroll-details`]),y(E,{"item-count":c.value,"onUpdate:itemCount":r[0]||=e=>c.value=e,"item-size":_.value,"onUpdate:itemSize":r[1]||=e=>_.value=e,"column-count":g.value,"onUpdate:columnCount":r[2]||=e=>g.value=e,"column-width":S.value,"onUpdate:columnWidth":r[3]||=e=>S.value=e,"buffer-before":M.value,"onUpdate:bufferBefore":r[4]||=e=>M.value=e,"buffer-after":N.value,"onUpdate:bufferAfter":r[5]||=e=>N.value=e,direction:`both`,onScrollToIndex:W,onScrollToOffset:G,onRefresh:r[6]||=e=>B.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`])])]),default:a(()=>[d(`div`,k,[y(t(w),{ref_key:`virtualScrollRef`,ref:B,items:z.value,"item-size":I,direction:`both`,"column-count":g.value,"column-width":L,"buffer-before":M.value,"buffer-after":N.value,debug:t(H),"sticky-indices":[0],class:`spreadsheet-grid`,onScroll:U},{item:a(({index:e,columnRange:t,isStickyActive:r})=>[d(`div`,{class:u([`spreadsheet-row flex-nowrap`,{"is-header-row":e===0,"is-sticky":r}]),style:i({height:`${I(null,e)}px`})},[b(` Row Header (Column 0) - Always rendered and sticky `),d(`div`,{class:`spreadsheet-cell row-header shrink-0`,style:i({width:`${L(0)}px`,height:`${I(null,e)}px`})},[n(l(e===0?``:e)+` `,1),e>0?(h(),f(`div`,{key:0,class:`row-resizer`,onPointerdown:t=>J(t,`row`,e)},null,40,A)):b(`v-if`,!0)],4),b(` Spacer for virtualized columns (accounting for the manually rendered Column 0) `),d(`div`,{class:`shrink-0`,style:i({width:`${Math.max(0,t.padStart-L(0))}px`})},null,4),b(` Visible Cells (excluding Column 0) `),(h(!0),f(m,null,o(t.end-t.start,r=>(h(),f(m,{key:r+t.start},[r-1+t.start>0?(h(),f(`div`,{key:0,class:u([`spreadsheet-cell shrink-0`,{"col-header":e===0}]),style:i({width:`${L(r-1+t.start)}px`,height:`${I(null,e)}px`})},[n(l(K(e,r-1+t.start))+` `,1),e===0?(h(),f(`div`,{key:0,class:`col-resizer`,onPointerdown:e=>J(e,`col`,r-1+t.start)},null,40,j)):b(`v-if`,!0)],6)):b(`v-if`,!0)],64))),128)),b(` Spacer for end of row `),d(`div`,{class:`shrink-0`,style:i({width:`${t.padEnd}px`})},null,4)],6)]),_:1},8,[`items`,`column-count`,`buffer-before`,`buffer-after`,`debug`])])]),_:1},8,[`code`]))}}),N=e({default:()=>P},1),P=S(M,[[`__scopeId`,`data-v-75da5f10`]]);const F={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:g}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-spreadsheet/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:N}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:_}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-spreadsheet/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Spreadsheet Grid`}}};export{F as configValuesSerialized};