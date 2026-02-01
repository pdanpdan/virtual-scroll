import{d as E,p as d,l as P,w as i,u as v,m as R,o as j,b,a,J as S,K as f,n as M,s as V,t as m,j as T,i as B,f as U,g as O,h as _}from"../chunks/chunk-BzgwLqVJ.js";import{V as Y}from"../chunks/chunk-Dk5GrEJI.js";import{_ as $,a as L}from"../chunks/chunk-XCFXGF1G.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const H=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

interface DraggableItem {
  id: number;
  label: string;
  color: string;
}

const items = ref<DraggableItem[]>(
  Array.from({ length: 1000 }, (_, i) => ({
    id: i,
    label: \`\${ String.fromCharCode(65 + i % 26) } Item \${ i }\`,
    color: \`hsl(\${ (i * 137.5) % 360 }, 70%, 60%)\`,
  })),
);

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const draggedIndex = ref<number | null>(null);
const dropTargetIndex = ref<number | null>(null);
const virtualScrollRef = ref<{
  scrollDetails: ScrollDetails;
  scrollToOffset: (x: number | null, y: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void;
} | null>(null);
const scrollDetails = ref<ScrollDetails | null>(null);

let scrollInterval: ReturnType<typeof setInterval> | null = null;

function stopAutoScroll() {
  if (scrollInterval !== null) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  }
}

function startAutoScroll(direction: 'up' | 'down') {
  if (scrollInterval !== null) {
    return;
  }
  scrollInterval = setInterval(() => {
    if (!virtualScrollRef.value) {
      return;
    }
    const { scrollOffset } = virtualScrollRef.value.scrollDetails;
    const delta = direction === 'up' ? -10 : 10;
    virtualScrollRef.value.scrollToOffset(null, scrollOffset.y + delta, { behavior: 'auto' });
  }, 16);
}

/**
 * Handles the start of a drag operation.
 *
 * @param index - The index of the item being dragged.
 * @param event - The native drag event.
 */
function handleDragStart(index: number, event: DragEvent) {
  draggedIndex.value = index;

  if (event.dataTransfer) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const clientX = (event as unknown as TouchEvent).touches ? (event as unknown as TouchEvent).touches[ 0 ].clientX : event.clientX;
    const clientY = (event as unknown as TouchEvent).touches ? (event as unknown as TouchEvent).touches[ 0 ].clientY : event.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (event.dataTransfer.setDragImage) {
      event.dataTransfer.setDragImage(target, x, y);
    }

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', index.toString());
  }
}

/**
 * Handles an item being dragged over another item.
 *
 * @param index - The index of the item being dragged over.
 */
function handleDragOver(index: number, event: DragEvent) {
  dropTargetIndex.value = index;

  // Auto-scroll logic
  const container = (event.currentTarget as HTMLElement).closest('.virtual-scroll-container');
  if (container) {
    const rect = container.getBoundingClientRect();
    const threshold = 60;
    if (event.clientY < rect.top + threshold) {
      startAutoScroll('up');
    } else if (event.clientY > rect.bottom - threshold) {
      startAutoScroll('down');
    } else {
      stopAutoScroll();
    }
  }
}

/**
 * Handles the drop event to reorder the list.
 */
function handleDrop() {
  stopAutoScroll();
  if (draggedIndex.value !== null && dropTargetIndex.value !== null) {
    const list = [ ...items.value ];
    const [ draggedItem ] = list.splice(draggedIndex.value, 1);
    list.splice(dropTargetIndex.value, 0, draggedItem);
    items.value = list;
  }
  draggedIndex.value = null;
  dropTargetIndex.value = null;
}

/**
 * Handles the drag end event to clean up.
 */
function handleDragEnd() {
  draggedIndex.value = null;
  dropTargetIndex.value = null;
  stopAutoScroll();
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-5">Draggable List</span>
    </template>

    <template #description>
      Reorder items using native drag and drop. Virtualization maintains performance even during complex list mutations.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
    </template>

    <template #subtitle>
      Reorder virtualized items using native drag and drop
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      class="example-container"
      :items="items"
      :debug="debugMode"
      @scroll="(details) => scrollDetails = details"
    >
      <template #item="{ item, index }">
        <div
          role="button"
          tabindex="0"
          class="example-vertical-item py-2 outline-none bg-base-100 focus-visible:bg-base-300"
          :class="{
            'opacity-30': draggedIndex === index,
            'border-t-4 border-t-primary': dropTargetIndex === index && draggedIndex !== index,
          }"
          @dragstart="handleDragStart(index, $event)"
          @dragover.prevent="handleDragOver(index, $event)"
          @drop="handleDrop"
          @dragend="handleDragEnd"
          @keydown.enter.prevent
          @keydown.space.prevent
        >
          <div
            class="size-10 rounded-lg me-4 flex items-center justify-center text-white font-bold shadow-sm"
            :style="{ backgroundColor: item.color }"
          >
            {{ item.label[0] }}
          </div>
          <div>
            <div class="font-bold text-sm">{{ item.label }}</div>
            <div class="text-xs opacity-40 font-mono">ID: {{ item.id }}</div>
          </div>
          <div
            class="ms-auto p-2 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100 touch-pan-y select-none"
            draggable="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="size-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,X=["onDragstart","onDragover"],K={class:"font-bold text-sm"},N={class:"text-xs opacity-40 font-mono"},J=E({__name:"+Page",setup(F){const p=d(Array.from({length:1e3},(t,e)=>({id:e,label:`${String.fromCharCode(65+e%26)} Item ${e}`,color:`hsl(${e*137.5%360}, 70%, 60%)`}))),y=R("debugMode",d(!1)),o=d(null),s=d(null),c=d(null),h=d(null);let u=null;function g(){u!==null&&(clearInterval(u),u=null)}function x(t){u===null&&(u=setInterval(()=>{if(!c.value)return;const{scrollOffset:e}=c.value.scrollDetails,n=t==="up"?-10:10;c.value.scrollToOffset(null,e.y+n,{behavior:"auto"})},16))}function w(t,e){if(o.value=t,e.dataTransfer){const n=e.currentTarget,l=n.getBoundingClientRect(),r=e.touches?e.touches[0].clientX:e.clientX,k=e.touches?e.touches[0].clientY:e.clientY,C=r-l.left,A=k-l.top;e.dataTransfer.setDragImage&&e.dataTransfer.setDragImage(n,C,A),e.dataTransfer.effectAllowed="move",e.dataTransfer.setData("text/plain",t.toString())}}function D(t,e){s.value=t;const n=e.currentTarget.closest(".virtual-scroll-container");if(n){const l=n.getBoundingClientRect(),r=60;e.clientY<l.top+r?x("up"):e.clientY>l.bottom-r?x("down"):g()}}function I(){if(g(),o.value!==null&&s.value!==null){const t=[...p.value],[e]=t.splice(o.value,1);t.splice(s.value,0,e),p.value=t}o.value=null,s.value=null}function z(){o.value=null,s.value=null,g()}return(t,e)=>(j(),P($,{code:v(H)},{title:i(()=>[...e[3]||(e[3]=[a("span",{class:"example-title example-title--group-5"},"Draggable List",-1)])]),description:i(()=>[...e[4]||(e[4]=[T(" Reorder items using native drag and drop. Virtualization maintains performance even during complex list mutations. ",-1)])]),icon:i(()=>[...e[5]||(e[5]=[a("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-5"},[a("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"})],-1)])]),controls:i(()=>[b(L,{"scroll-details":h.value},null,8,["scroll-details"])]),subtitle:i(()=>[...e[6]||(e[6]=[T(" Reorder virtualized items using native drag and drop ",-1)])]),default:i(()=>[b(v(Y),{ref_key:"virtualScrollRef",ref:c,class:"example-container",items:p.value,debug:v(y),onScroll:e[2]||(e[2]=n=>h.value=n)},{item:i(({item:n,index:l})=>[a("div",{role:"button",tabindex:"0",class:M(["example-vertical-item py-2 outline-none bg-base-100 focus-visible:bg-base-300",{"opacity-30":o.value===l,"border-t-4 border-t-primary":s.value===l&&o.value!==l}]),onDragstart:r=>w(l,r),onDragover:f(r=>D(l,r),["prevent"]),onDrop:I,onDragend:z,onKeydown:[e[0]||(e[0]=S(f(()=>{},["prevent"]),["enter"])),e[1]||(e[1]=S(f(()=>{},["prevent"]),["space"]))]},[a("div",{class:"size-10 rounded-lg me-4 flex items-center justify-center text-white font-bold shadow-sm",style:V({backgroundColor:n.color})},m(n.label[0]),5),a("div",null,[a("div",K,m(n.label),1),a("div",N,"ID: "+m(n.id),1)]),e[7]||(e[7]=a("div",{class:"ms-auto p-2 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100 touch-pan-y select-none",draggable:"true"},[a("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"2",stroke:"currentColor",class:"size-6"},[a("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"})])],-1))],42,X)]),_:1},8,["items","debug"])]),_:1},8,["code"]))}}),q=Object.freeze(Object.defineProperty({__proto__:null,default:J},Symbol.toStringTag,{value:"Module"})),ie={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:_}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:O}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:U}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-draggable/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:q}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:B}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-draggable/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Draggable List | Virtual Scroll"}}};export{ie as configValuesSerialized};
