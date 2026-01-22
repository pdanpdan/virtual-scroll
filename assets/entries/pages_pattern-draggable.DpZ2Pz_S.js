import{t as e}from"../chunks/chunk-v_CCr7DM.js";import{C as t,G as n,H as r,M as i,R as a,T as o,U as s,V as c,W as l,_ as u,m as d,o as f,p,t as m,v as h,w as g}from"../chunks/chunk-CZEdwOsv.js";import"../chunks/chunk-YW3sP-nK.js";import{n as _}from"../chunks/chunk-BoapzTav.js";/* empty css                      *//* empty css                      *//* empty css                      */import{t as v}from"../chunks/chunk-BYGEeXHk.js";var y=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { ref } from 'vue';

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
`,b=[`onDragstart`,`onDragover`],x={class:`font-bold text-sm`},S={class:`text-xs opacity-40 font-mono`},C=o({__name:`+Page`,setup(e){let o=c(Array.from({length:1e3},(e,t)=>({id:t,label:`${String.fromCharCode(65+t%26)} Item ${t}`,color:`hsl(${t*137.5%360}, 70%, 60%)`}))),f=c(null),m=c(null),C=c(),w=c(null),T=null;function E(){T!==null&&(clearInterval(T),T=null)}function D(e){T===null&&(T=setInterval(()=>{if(!C.value)return;let{scrollOffset:t}=C.value.scrollDetails,n=e===`up`?-10:10;C.value.scrollToOffset(null,t.y+n,{behavior:`auto`})},16))}function O(e){f.value=e}function k(e,t){m.value=e;let n=t.currentTarget.closest(`.virtual-scroll-container`);if(n){let e=n.getBoundingClientRect();t.clientY<e.top+60?D(`up`):t.clientY>e.bottom-60?D(`down`):E()}}function A(){if(E(),f.value!==null&&m.value!==null){let e=[...o.value],[t]=e.splice(f.value,1);e.splice(m.value,0,t),o.value=e}f.value=null,m.value=null}return(e,c)=>(i(),h(v,{code:r(y)},{title:a(()=>[...c[4]||=[u(`span`,{class:`example-title example-title--group-5`},`Draggable List`,-1)]]),description:a(()=>[...c[5]||=[t(` Reorder items using native drag and drop. Virtualization maintains performance even during complex list mutations. `,-1)]]),icon:a(()=>[...c[6]||=[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-5`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5`})],-1)]]),subtitle:a(()=>[...c[7]||=[t(` Reorder virtualized items using native drag and drop `,-1)]]),default:a(()=>[g(r(_),{ref_key:`virtualScrollRef`,ref:C,class:`example-container`,items:o.value,onScroll:c[3]||=e=>w.value=e},{item:a(({item:e,index:t})=>[u(`div`,{role:`button`,tabindex:`0`,class:s([`example-vertical-item py-2 outline-none focus-visible:bg-base-300`,{"opacity-30 scale-95":f.value===t,"border-t-4 border-t-primary":m.value===t&&f.value!==t}]),draggable:`true`,onDragstart:e=>O(t),onDragover:d(e=>k(t,e),[`prevent`]),onDrop:A,onDragend:c[0]||=e=>{f.value=null,m.value=null,E()},onKeydown:[c[1]||=p(d(()=>{},[`prevent`]),[`enter`]),c[2]||=p(d(()=>{},[`prevent`]),[`space`])]},[u(`div`,{class:`size-10 rounded-lg mr-4 flex items-center justify-center text-white font-bold shadow-sm`,style:l({backgroundColor:e.color})},n(e.label[0]),5),u(`div`,null,[u(`div`,x,n(e.label),1),u(`div`,S,`ID: `+n(e.id),1)]),c[8]||=u(`div`,{class:`ml-auto cursor-grab active:cursor-grabbing opacity-30 hover:opacity-100`},[u(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`2`,stroke:`currentColor`,class:`size-6`},[u(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5`})])],-1)],42,b)]),_:1},8,[`items`])]),_:1},8,[`code`]))}}),w=e({default:()=>T},1),T=C;const E={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:f}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-draggable/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:w}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:m}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-draggable/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Draggable List | Virtual Scroll`}}};export{E as configValuesSerialized};