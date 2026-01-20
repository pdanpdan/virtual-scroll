import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{C as t,D as n,G as r,H as i,K as a,N as o,P as s,T as c,U as l,V as u,W as d,_ as f,b as p,g as m,h,o as g,t as _,v,w as y,y as b,z as x}from"../chunks/chunk-BlgwXZRf.js";import"../chunks/chunk-CTpTqTDb.js";import{n as S}from"../chunks/chunk-C0NP2mKO.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as C,t as w}from"../chunks/chunk-Ckjm4Aul.js";import{t as T}from"../chunks/chunk-ETTdm7vE.js";var E=`<script setup lang="ts">
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
      <span class="example-title example-title--group-5">Spreadsheet</span>
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
        class="example-icon example-icon--group-5"
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
`,D={class:`flex flex-wrap gap-4 items-start`},O=[`onPointerdown`],k=[`data-col-index`],A=[`onPointerdown`],j=c({__name:`+Page`,setup(e){let c=i(1e3),g=i(1e3),_=i(35),j=i(100),M=i(5),N=i(5),P=[0],F=u({}),I=u({}),L=(e,t)=>F[t]??_.value,R=e=>I[e]??j.value;function z(e){let t=``,n=e;for(;n>=0;)t=String.fromCharCode(65+n%26)+t,n=Math.floor(n/26)-1;return t}let B=m(()=>Array.from({length:c.value},(e,t)=>({id:t,label:`Row ${t+1}`}))),V=i(),H=i(null),U=n(`debugMode`,i(!1));function W(e){H.value=e}function G(e,t,n){V.value?.scrollToIndex(e,t,n)}function K(e,t){V.value?.scrollToOffset(e,t)}function q(e,t){return e===0?z(t-1):t===0?e:`R${e}C${t}`}let J=i(null);function Y(e,t,n){e.preventDefault(),e.stopPropagation();let r=t===`row`?L(null,n):R(n);J.value={type:t,index:n,initialPos:t===`row`?e.clientY:e.clientX,initialSize:r},window.addEventListener(`pointermove`,Z),window.addEventListener(`pointerup`,Q),document.body.style.cursor=t===`row`?`row-resize`:`col-resize`}let X=null;function Z(e){if(!J.value)return;let{type:t,index:n,initialPos:r,initialSize:i}=J.value,a=(t===`row`?e.clientY:e.clientX)-r,o=Math.max(20,i+a);t===`row`?F[n]=o:I[n]=o,X===null&&(X=requestAnimationFrame(()=>{V.value?.refresh(),X=null}))}function Q(){J.value=null,X!==null&&(cancelAnimationFrame(X),X=null),window.removeEventListener(`pointermove`,Z),window.removeEventListener(`pointerup`,Q),document.body.style.cursor=``,V.value?.refresh()}return(e,n)=>(o(),v(C,{code:l(E)},{title:x(()=>[...n[7]||=[f(`span`,{class:`example-title example-title--group-5`},`Spreadsheet`,-1)]]),description:x(()=>[t(` A bidirectional grid demonstrating spreadsheet-like functionality with `+a(c.value.toLocaleString())+` rows and `+a(g.value.toLocaleString())+` columns. Features include `,1),n[8]||=f(`strong`,null,`sticky column headers`,-1),n[9]||=t(` (A, B, C...) and `,-1),n[10]||=f(`strong`,null,`sticky row headers`,-1),n[11]||=t(` (1, 2, 3...). `,-1),n[12]||=f(`strong`,null,`New:`,-1),n[13]||=t(` Drag the edges of headers to resize rows and columns. `,-1)]),icon:x(()=>[...n[14]||=[f(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-5`},[f(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5`})],-1)]]),subtitle:x(()=>[...n[15]||=[t(` Bidirectional grid with header resizing `,-1)]]),controls:x(()=>[f(`div`,D,[y(w,{"scroll-details":H.value,direction:`both`},null,8,[`scroll-details`]),y(T,{"item-count":c.value,"onUpdate:itemCount":n[0]||=e=>c.value=e,"item-size":_.value,"onUpdate:itemSize":n[1]||=e=>_.value=e,"column-count":g.value,"onUpdate:columnCount":n[2]||=e=>g.value=e,"column-width":j.value,"onUpdate:columnWidth":n[3]||=e=>j.value=e,"buffer-before":M.value,"onUpdate:bufferBefore":n[4]||=e=>M.value=e,"buffer-after":N.value,"onUpdate:bufferAfter":n[5]||=e=>N.value=e,direction:`both`,onScrollToIndex:G,onScrollToOffset:K,onRefresh:n[6]||=e=>V.value?.refresh()},null,8,[`item-count`,`item-size`,`column-count`,`column-width`,`buffer-before`,`buffer-after`])])]),default:x(()=>[y(l(S),{ref_key:`virtualScrollRef`,ref:V,debug:l(U),class:`example-container`,direction:`both`,items:B.value,"item-size":L,"column-count":g.value,"column-width":R,"default-item-size":_.value,"default-column-width":j.value,"buffer-before":M.value,"buffer-after":N.value,"sticky-indices":P,onScroll:W},{item:x(({index:e,columnRange:n,isStickyActive:i})=>[f(`div`,{class:d([`example-spreadsheet-row`,{"example-spreadsheet-row--header":e===0,"example-spreadsheet-row--sticky":i}]),style:r({height:`${L(null,e)}px`})},[b(` Row Header (Column 0) - Always rendered and sticky `),f(`div`,{class:`example-spreadsheet-cell example-spreadsheet-cell--row-header`,"data-col-index":`0`,style:r({width:`${R(0)}px`,height:`${L(null,e)}px`})},[t(a(e===0?``:e)+` `,1),e>0?(o(),p(`div`,{key:0,class:`example-spreadsheet-row-resizer`,onPointerdown:t=>Y(t,`row`,e)},null,40,O)):b(`v-if`,!0)],4),b(` Spacer for virtualized columns (accounting for the manually rendered Column 0) `),f(`div`,{class:`shrink-0`,style:r({width:`${Math.max(0,n.padStart-R(0))}px`})},null,4),b(` Visible Cells (excluding Column 0) `),(o(!0),p(h,null,s(n.end-n.start,i=>(o(),p(h,{key:i+n.start},[i-1+n.start>0?(o(),p(`div`,{key:0,class:d([`example-spreadsheet-cell`,{"example-spreadsheet-cell--col-header":e===0}]),"data-col-index":i-1+n.start,style:r({width:`${R(i-1+n.start)}px`,height:`${L(null,e)}px`})},[t(a(q(e,i-1+n.start))+` `,1),e===0?(o(),p(`div`,{key:0,class:`example-spreadsheet-col-resizer`,onPointerdown:e=>Y(e,`col`,i-1+n.start)},null,40,A)):b(`v-if`,!0)],14,k)):b(`v-if`,!0)],64))),128)),b(` Spacer for end of row `),f(`div`,{class:`shrink-0`,style:r({width:`${n.padEnd}px`})},null,4)],6)]),_:1},8,[`debug`,`items`,`column-count`,`default-item-size`,`default-column-width`,`buffer-before`,`buffer-after`])]),_:1},8,[`code`]))}}),M=e({default:()=>N},1),N=j;const P={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:g}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-spreadsheet/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:M}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:_}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-spreadsheet/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Spreadsheet Grid`}}};export{P as configValuesSerialized};