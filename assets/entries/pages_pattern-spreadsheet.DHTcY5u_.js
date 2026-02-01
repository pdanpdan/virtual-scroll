import{d as Z,l as _,w as a,u as P,m as L,p as r,o as c,b as T,a as i,s as A,n as U,e as m,j as s,t as y,c as v,F as V,r as J,L as I,v as K,i as Q,f as ee,g as ne,h as te}from"../chunks/chunk-BzgwLqVJ.js";import{V as le}from"../chunks/chunk-Dk5GrEJI.js";import{_ as oe,a as re}from"../chunks/chunk-XCFXGF1G.js";import{_ as ie}from"../chunks/chunk-BhdRxmQ8.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const ae=`<script setup lang="ts">
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
const rtlMode = inject<Ref<boolean>>('rtlMode', ref(false));

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
  const delta = (type === 'col' && rtlMode.value) ? initialPos - currentPos : currentPos - initialPos;
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
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,se=["onPointerdown"],de=["data-col-index"],ue=["onPointerdown"],ce=Z({__name:"+Page",setup(pe){const h=r(1e3),g=r(1e3),w=r(35),S=r(100),C=r(5),z=r(5),j=[0],k=I({}),E=I({}),f=(t,e)=>k[e]??w.value,x=t=>E[t]??S.value;function W(t){let e="",n=t;for(;n>=0;)e=String.fromCharCode(65+n%26)+e,n=Math.floor(n/26)-1;return e}const O=K(()=>Array.from({length:h.value},(t,e)=>({id:e,label:`Row ${e+1}`}))),d=r(),M=r(null),F=L("debugMode",r(!1)),N=L("rtlMode",r(!1));function X(t){M.value=t}function Y(t,e,n){d.value?.scrollToIndex(t,e,n)}function q(t,e){d.value?.scrollToOffset(t,e)}function G(t,e){return t===0?W(e-1):e===0?t:`R${t}C${e}`}const b=r(null);function D(t,e,n){t.preventDefault(),t.stopPropagation();const l=e==="row"?f(null,n):x(n),p=e==="row"?t.clientY:t.clientX;b.value={type:e,index:n,initialPos:p,initialSize:l},window.addEventListener("pointermove",$),window.addEventListener("pointerup",H),document.body.style.cursor=e==="row"?"row-resize":"col-resize"}let u=null;function $(t){if(!b.value)return;const{type:e,index:n,initialPos:l,initialSize:p}=b.value,o=e==="row"?t.clientY:t.clientX,R=e==="col"&&N.value?l-o:o-l,B=Math.max(20,p+R);e==="row"?k[n]=B:E[n]=B,u===null&&(u=requestAnimationFrame(()=>{d.value?.refresh(),u=null}))}function H(){b.value=null,u!==null&&(cancelAnimationFrame(u),u=null),window.removeEventListener("pointermove",$),window.removeEventListener("pointerup",H),document.body.style.cursor="",d.value?.refresh()}return(t,e)=>(c(),_(oe,{code:P(ae)},{title:a(()=>[...e[7]||(e[7]=[i("span",{class:"example-title example-title--group-3"},"Spreadsheet",-1)])]),description:a(()=>[s(" A bidirectional grid demonstrating spreadsheet-like functionality with "+y(h.value.toLocaleString())+" rows and "+y(g.value.toLocaleString())+" columns. Features include ",1),e[8]||(e[8]=i("strong",null,"sticky column headers",-1)),e[9]||(e[9]=s(" (A, B, C...) and ",-1)),e[10]||(e[10]=i("strong",null,"sticky row headers",-1)),e[11]||(e[11]=s(" (1, 2, 3...). ",-1)),e[12]||(e[12]=i("strong",null,"New:",-1)),e[13]||(e[13]=s(" Drag the edges of headers to resize rows and columns. ",-1))]),icon:a(()=>[...e[14]||(e[14]=[i("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-3"},[i("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5"})],-1)])]),subtitle:a(()=>[...e[15]||(e[15]=[s(" Bidirectional grid with header resizing ",-1)])]),controls:a(()=>[T(re,{"scroll-details":M.value,direction:"both"},null,8,["scroll-details"]),T(ie,{"item-count":h.value,"onUpdate:itemCount":e[0]||(e[0]=n=>h.value=n),"item-size":w.value,"onUpdate:itemSize":e[1]||(e[1]=n=>w.value=n),"column-count":g.value,"onUpdate:columnCount":e[2]||(e[2]=n=>g.value=n),"column-width":S.value,"onUpdate:columnWidth":e[3]||(e[3]=n=>S.value=n),"buffer-before":C.value,"onUpdate:bufferBefore":e[4]||(e[4]=n=>C.value=n),"buffer-after":z.value,"onUpdate:bufferAfter":e[5]||(e[5]=n=>z.value=n),direction:"both",onScrollToIndex:Y,onScrollToOffset:q,onRefresh:e[6]||(e[6]=n=>d.value?.refresh())},null,8,["item-count","item-size","column-count","column-width","buffer-before","buffer-after"])]),default:a(()=>[T(P(le),{ref_key:"virtualScrollRef",ref:d,debug:P(F),class:"example-container",direction:"both",items:O.value,"item-size":f,"column-count":g.value,"column-width":x,"default-item-size":w.value,"default-column-width":S.value,"buffer-before":C.value,"buffer-after":z.value,"sticky-indices":j,onScroll:X},{item:a(({index:n,columnRange:l,isStickyActive:p})=>[i("div",{class:U(["example-spreadsheet-row",{"example-spreadsheet-row--header":n===0,"example-spreadsheet-row--sticky":p}]),style:A({height:`${f(null,n)}px`})},[m(" Row Header (Column 0) - Always rendered and sticky "),i("div",{class:"example-spreadsheet-cell example-spreadsheet-cell--row-header","data-col-index":"0",style:A({width:`${x(0)}px`,height:`${f(null,n)}px`})},[s(y(n===0?"":n)+" ",1),n>0?(c(),v("div",{key:0,class:"example-spreadsheet-row-resizer",onPointerdown:o=>D(o,"row",n)},null,40,se)):m("v-if",!0)],4),m(" Visible Cells (excluding Column 0) "),(c(!0),v(V,null,J(l.end-l.start,o=>(c(),v(V,{key:o+l.start},[o-1+l.start>0?(c(),v("div",{key:0,class:U(["example-spreadsheet-cell",{"example-spreadsheet-cell--col-header":n===0}]),"data-col-index":o-1+l.start,style:A({width:`${x(o-1+l.start)}px`,height:`${f(null,n)}px`})},[s(y(G(n,o-1+l.start))+" ",1),n===0?(c(),v("div",{key:0,class:"example-spreadsheet-col-resizer",onPointerdown:R=>D(R,"col",o-1+l.start)},null,40,ue)):m("v-if",!0)],14,de)):m("v-if",!0)],64))),128))],6)]),_:1},8,["debug","items","column-count","default-item-size","default-column-width","buffer-before","buffer-after"])]),_:1},8,["code"]))}}),fe=Object.freeze(Object.defineProperty({__proto__:null,default:ce},Symbol.toStringTag,{value:"Module"})),Pe={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:te}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ne}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ee}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-spreadsheet/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:fe}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:Q}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-spreadsheet/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Spreadsheet Grid | Virtual Scroll"}}};export{Pe as configValuesSerialized};
