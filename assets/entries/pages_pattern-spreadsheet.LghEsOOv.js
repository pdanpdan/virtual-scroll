import{t as e}from"../chunks/chunk-CWRknLO5.js";import{B as t,C as n,D as r,G as i,H as a,M as o,N as s,R as c,T as l,U as u,V as d,W as f,_ as p,b as m,g as h,h as g,o as _,t as v,v as y,w as b,y as x}from"../chunks/chunk-Bbo8JVN3.js";import"../chunks/chunk-IpJMSSJ3.js";/* empty css                      */import{n as S}from"../chunks/chunk-C48dLvpu.js";/* empty css                      *//* empty css                      */import{t as C}from"../chunks/chunk-za9iMR0L.js";import{t as w}from"../chunks/chunk-BL_-ooPU.js";import{t as T}from"../chunks/chunk-qTiVgRrj.js";var E=`<script setup lang="ts">
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
const stickyIndices = [ 0 ];

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
      <span class="example-title example-title--group-3">Spreadsheet</span>
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
        class="example-icon example-icon--group-3"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5" />
      </svg>
    </template>

    <template #subtitle>
      Bidirectional grid with header resizing
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

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      direction="both"
      :items="items"
      :item-size="getRowHeight"
      :column-count="colCount"
      :column-width="getColWidth"
      :default-item-size="defaultRowHeight"
      :default-column-width="defaultColWidth"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-indices="stickyIndices"
      @scroll="onScroll"
    >
      <template #item="{ index, columnRange, isStickyActive }">
        <div
          class="example-spreadsheet-row"
          :class="{ 'example-spreadsheet-row--header': index === 0, 'example-spreadsheet-row--sticky': isStickyActive }"
          :style="{ height: \`\${ getRowHeight(null, index) }px\` }"
        >
          <!-- Row Header (Column 0) - Always rendered and sticky -->
          <div
            class="example-spreadsheet-cell example-spreadsheet-cell--row-header"
            data-col-index="0"
            :style="{
              width: \`\${ getColWidth(0) }px\`,
              height: \`\${ getRowHeight(null, index) }px\`,
            }"
          >
            {{ index === 0 ? '' : index }}
            <div
              v-if="index > 0"
              class="example-spreadsheet-row-resizer"
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
              class="example-spreadsheet-cell"
              :data-col-index="colIdx - 1 + columnRange.start"
              :class="{ 'example-spreadsheet-cell--col-header': index === 0 }"
              :style="{
                width: \`\${ getColWidth(colIdx - 1 + columnRange.start) }px\`,
                height: \`\${ getRowHeight(null, index) }px\`,
              }"
            >
              {{ getCellContent(index, colIdx - 1 + columnRange.start) }}
              <div
                v-if="index === 0"
                class="example-spreadsheet-col-resizer"
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
  </ExampleContainer>
</template>
`,D={class:`flex flex-wrap gap-4 items-start`},O=[`onPointerdown`],k=[`data-col-index`],A=[`onPointerdown`],j=l({__name:`+Page`,setup(e){let l=d(1e3),_=d(1e3),v=d(35),j=d(100),M=d(5),N=d(5),P=[0],F=t({}),I=t({}),L=(e,t)=>F[t]??v.value,R=e=>I[e]??j.value;function z(e){let t=``,n=e;for(;n>=0;)t=String.fromCharCode(65+n%26)+t,n=Math.floor(n/26)-1;return t}let B=h(()=>Array.from({length:l.value},(e,t)=>({id:t,label:`Row ${t+1}`}))),V=d(),H=d(null),U=r(`debugMode`,d(!1));function W(e){H.value=e}function G(e,t,n){V.value?.scrollToIndex(e,t,n)}function K(e,t){V.value?.scrollToOffset(e,t)}function q(e,t){return e===0?z(t-1):t===0?e:`R${e}C${t}`}let J=d(null);function Y(e,t,n){e.preventDefault(),e.stopPropagation();let r=t===`row`?L(null,n):R(n);J.value={type:t,index:n,initialPos:t===`row`?e.clientY:e.clientX,initialSize:r},window.addEventListener(`pointermove`,Z),window.addEventListener(`pointerup`,Q),document.body.style.cursor=t===`row`?`row-resize`:`col-resize`}let X=null;function Z(e){if(!J.value)return;let{type:t,index:n,initialPos:r,initialSize:i}=J.value,a=(t===`row`?e.clientY:e.clientX)-r,o=Math.max(20,i+a);t===`row`?F[n]=o:I[n]=o,X===null&&(X=requestAnimationFrame(()=>{V.value?.refresh(),X=null}))}function Q(){J.value=null,X!==null&&(cancelAnimationFrame(X),X=null),window.removeEventListener(`pointermove`,Z),window.removeEventListener(`pointerup`,Q),document.body.style.cursor=``,V.value?.refresh()}return(e,t)=>(o(),y(C,{code:a(E)},{title:c(()=>[...t[7]||=[p(`span`,{class:`example-title example-title--group-3`},`Spreadsheet`,-1)]]),description:c(()=>[n(` A bidirectional grid demonstrating spreadsheet-like functionality with `+i(l.value.toLocaleString())+` rows and `+i(_.value.toLocaleString())+` columns. Features include `,1),t[8]||=p(`strong`,null,`sticky column headers`,-1),t[9]||=n(` (A, B, C...) and `,-1),t[10]||=p(`strong`,null,`sticky row headers`,-1),t[11]||=n(` (1, 2, 3...). `,-1),t[12]||=p(`strong`,null,`New:`,-1),t[13]||=n(` Drag the edges of headers to resize rows and columns. `,-1)]),icon:c(()=>[...t[14]||=[p(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-3`},[p(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5`})],-1)]]),subtitle:c(()=>[...t[15]||=[n(` Bidirectional grid with header resizing `,-1)]]),controls:c(()=>[p(`div`,D,[b(T,{"scroll-details":H.value,direction:`both`},null,8,[`scroll-details`]),b(w,{"item-count":l.value,"onUpdate:itemCount":t[0]||=e=>l.value=e,"item-size":v.value,"onUpdate:itemSize":t[1]||=e=>v.value=e,"column-count":_.value,"onUpdate:columnCount":t[2]||=e=>_.value=e,"column-width":j.value,"onUpdate:columnWidth":t[3]||=e=>j.value=e,"buffer-before":M.value,"onUpdate:bufferBefore":t[4]||=e=>M.value=e,"buffer-after":N.value,"onUpdate:bufferAfter":t[5]||=e=>N.value=e,direction:`both`,onScrollToIndex:G,onScrollToOffset:K,onRefresh:t[6]||=e=>V.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`])])]),default:c(()=>[b(a(S),{ref_key:`virtualScrollRef`,ref:V,debug:a(U),class:`example-container`,direction:`both`,items:B.value,"item-size":L,"column-count":_.value,"column-width":R,"default-item-size":v.value,"default-column-width":j.value,"buffer-before":M.value,"buffer-after":N.value,"sticky-indices":P,onScroll:W},{item:c(({index:e,columnRange:t,isStickyActive:r})=>[p(`div`,{class:u([`example-spreadsheet-row`,{"example-spreadsheet-row--header":e===0,"example-spreadsheet-row--sticky":r}]),style:f({height:`${L(null,e)}px`})},[x(` Row Header (Column 0) - Always rendered and sticky `),p(`div`,{class:`example-spreadsheet-cell example-spreadsheet-cell--row-header`,"data-col-index":`0`,style:f({width:`${R(0)}px`,height:`${L(null,e)}px`})},[n(i(e===0?``:e)+` `,1),e>0?(o(),m(`div`,{key:0,class:`example-spreadsheet-row-resizer`,onPointerdown:t=>Y(t,`row`,e)},null,40,O)):x(`v-if`,!0)],4),x(` Spacer for virtualized columns (accounting for the manually rendered Column 0) `),p(`div`,{class:`shrink-0`,style:f({width:`${Math.max(0,t.padStart-R(0))}px`})},null,4),x(` Visible Cells (excluding Column 0) `),(o(!0),m(g,null,s(t.end-t.start,r=>(o(),m(g,{key:r+t.start},[r-1+t.start>0?(o(),m(`div`,{key:0,class:u([`example-spreadsheet-cell`,{"example-spreadsheet-cell--col-header":e===0}]),"data-col-index":r-1+t.start,style:f({width:`${R(r-1+t.start)}px`,height:`${L(null,e)}px`})},[n(i(q(e,r-1+t.start))+` `,1),e===0?(o(),m(`div`,{key:0,class:`example-spreadsheet-col-resizer`,onPointerdown:e=>Y(e,`col`,r-1+t.start)},null,40,A)):x(`v-if`,!0)],14,k)):x(`v-if`,!0)],64))),128)),x(` Spacer for end of row `),p(`div`,{class:`shrink-0`,style:f({width:`${t.padEnd}px`})},null,4)],6)]),_:1},8,[`debug`,`items`,`column-count`,`default-item-size`,`default-column-width`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),M=e({default:()=>N},1),N=j;const P={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:_}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-spreadsheet/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:M}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:v}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-spreadsheet/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Spreadsheet Grid | Virtual Scroll`}}};export{P as configValuesSerialized};