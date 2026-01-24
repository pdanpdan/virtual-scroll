import{t as e}from"../chunks/chunk-BYR07lV1.js";import{C as t,D as n,G as r,H as i,M as a,R as o,T as s,U as c,V as l,W as u,_ as d,m as f,o as p,p as m,t as h,v as g,w as _}from"../chunks/chunk-DQ_YCHvG.js";import"../chunks/chunk-DxZ6SkEg.js";/* empty css                      */import{n as v}from"../chunks/chunk-UeDLoRz3.js";/* empty css                      *//* empty css                      */import{t as y}from"../chunks/chunk-CFHiRfoq.js";var b=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';

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
const virtualScrollRef = ref();
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
 */
function handleDragStart(index: number) {
  draggedIndex.value = index;
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
          class="example-vertical-item py-2 outline-none focus-visible:bg-base-300"
          :class="{
            'opacity-30 scale-95': draggedIndex === index,
            'border-t-4 border-t-primary': dropTargetIndex === index && draggedIndex !== index,
          }"
          draggable="true"
          @dragstart="handleDragStart(index)"
          @dragover.prevent="handleDragOver(index, $event)"
          @drop="handleDrop"
          @dragend="draggedIndex = null; dropTargetIndex = null; stopAutoScroll()"
          @keydown.enter.prevent
          @keydown.space.prevent
        >
          <div
            class="size-10 rounded-lg mr-4 flex items-center justify-center text-white font-bold shadow-sm"
            :style="{ backgroundColor: item.color }"
          >
            {{ item.label[0] }}
          </div>
          <div>
            <div class="font-bold text-sm">{{ item.label }}</div>
            <div class="text-xs opacity-40 font-mono">ID: {{ item.id }}</div>
          </div>
          <div class="ml-auto cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100">
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
`,x=[`onDragstart`,`onDragover`],S={class:`font-bold text-sm`},C={class:`text-xs opacity-40 font-mono`},w=s({__name:`+Page`,setup(e){let s=l(Array.from({length:1e3},(e,t)=>({id:t,label:`${String.fromCharCode(65+t%26)} Item ${t}`,color:`hsl(${t*137.5%360}, 70%, 60%)`}))),p=n(`debugMode`,l(!1)),h=l(null),w=l(null),T=l(),E=l(null),D=null;function O(){D!==null&&(clearInterval(D),D=null)}function k(e){D===null&&(D=setInterval(()=>{if(!T.value)return;let{scrollOffset:t}=T.value.scrollDetails,n=e===`up`?-10:10;T.value.scrollToOffset(null,t.y+n,{behavior:`auto`})},16))}function A(e){h.value=e}function j(e,t){w.value=e;let n=t.currentTarget.closest(`.virtual-scroll-container`);if(n){let e=n.getBoundingClientRect();t.clientY<e.top+60?k(`up`):t.clientY>e.bottom-60?k(`down`):O()}}function M(){if(O(),h.value!==null&&w.value!==null){let e=[...s.value],[t]=e.splice(h.value,1);e.splice(w.value,0,t),s.value=e}h.value=null,w.value=null}return(e,n)=>(a(),g(y,{code:i(b)},{title:o(()=>[...n[4]||=[d(`span`,{class:`example-title example-title--group-5`},`Draggable List`,-1)]]),description:o(()=>[...n[5]||=[t(` Reorder items using native drag and drop. Virtualization maintains performance even during complex list mutations. `,-1)]]),icon:o(()=>[...n[6]||=[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-5`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5`})],-1)]]),subtitle:o(()=>[...n[7]||=[t(` Reorder virtualized items using native drag and drop `,-1)]]),default:o(()=>[_(i(v),{ref_key:`virtualScrollRef`,ref:T,class:`example-container`,items:s.value,debug:i(p),onScroll:n[3]||=e=>E.value=e},{item:o(({item:e,index:t})=>[d(`div`,{role:`button`,tabindex:`0`,class:c([`example-vertical-item py-2 outline-none focus-visible:bg-base-300`,{"opacity-30 scale-95":h.value===t,"border-t-4 border-t-primary":w.value===t&&h.value!==t}]),draggable:`true`,onDragstart:e=>A(t),onDragover:f(e=>j(t,e),[`prevent`]),onDrop:M,onDragend:n[0]||=e=>{h.value=null,w.value=null,O()},onKeydown:[n[1]||=m(f(()=>{},[`prevent`]),[`enter`]),n[2]||=m(f(()=>{},[`prevent`]),[`space`])]},[d(`div`,{class:`size-10 rounded-lg mr-4 flex items-center justify-center text-white font-bold shadow-sm`,style:u({backgroundColor:e.color})},r(e.label[0]),5),d(`div`,null,[d(`div`,S,r(e.label),1),d(`div`,C,`ID: `+r(e.id),1)]),n[8]||=d(`div`,{class:`ml-auto cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100`},[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`2`,stroke:`currentColor`,class:`size-6`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5`})])],-1)],42,x)]),_:1},8,[`items`,`debug`])]),_:1},8,[`code`]))}}),T=e({default:()=>E},1),E=w;const D={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:p}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-draggable/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:T}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:h}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-draggable/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Draggable List | Virtual Scroll`}}};export{D as configValuesSerialized};