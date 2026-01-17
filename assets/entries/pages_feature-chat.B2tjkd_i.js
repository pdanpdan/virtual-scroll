import{d as Z,r as a,g as O,h as k,j as N,k as q,l as H,w as l,u as x,m as $,o as b,a as o,c as z,p as C,q as R,e as i,s as F,t as K,v as W,x as B,y as D,i as G,f as J}from"../chunks/chunk-BtXCRXom.js";import{E as Q,V as X,_ as Y}from"../chunks/chunk-BigYq7j-.js";import"../chunks/chunk-DpSqgdCt.js";/* empty css                      *//* empty css                      *//* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */function ee(y){let t=y;return function(){return t=t*16807%2147483647,t/2147483647}}const te=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, nextTick, onMounted, onUnmounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { createSeededRandom } from '#/random';

import rawCode from './+Page.vue?raw';

interface Message {
  id: number;
  text: string;
  isMe: boolean;
  time: string;
}

const items = ref<Message[]>([]);
const virtualScrollRef = ref();
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
const isLoading = ref(false);
const isAtBottom = ref(true);
const hasNewMessages = ref(false);

const ssrRange = computed(() => ({
  start: Math.max(0, items.value.length - 10),
  end: items.value.length,
}));
const initialScrollIndex = computed(() => items.value.length - 1);

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
const random = createSeededRandom(12345);
let timeMock = (new Date('2026-01-10T21:12:23Z')).valueOf();

function getTimeMock() {
  timeMock += Math.floor(random() * 100000) + 3;
  return new Date(timeMock).toLocaleTimeString('en-US', {
    timeZone: 'Europe/Bucharest',
  });
}

function generateMessage(id: number, sentByMe?: boolean): Message {
  const isMe = sentByMe ?? random() > 0.5;
  const length = Math.floor(random() * 100) + 10;
  return {
    id,
    text: LOREM.slice(0, length),
    isMe,
    time: getTimeMock(),
  };
}

function loadMessages(count: number, prepend = false) {
  const newItems = [];
  const startId = prepend ? (items.value[ 0 ]?.id || 0) - count : (items.value[ items.value.length - 1 ]?.id || 0) + 1;

  for (let i = 0; i < count; i++) {
    const id = startId + i;
    newItems.push(generateMessage(id));
  }

  if (prepend) {
    items.value = [ ...newItems, ...items.value ];
  } else {
    items.value = [ ...items.value, ...newItems ];
  }
}

// Initial load
loadMessages(50);

// Auto-generate messages
let generateMessagesTimer: ReturnType<typeof setTimeout> | null = null;
onMounted(() => {
  const fn = () => {
    addMessage(LOREM.slice(0, Math.floor(random() * 100) + 10), false);

    generateMessagesTimer = setTimeout(fn, 5000 + Math.random() * 20000);
  };

  generateMessagesTimer = setTimeout(fn, 5000 + Math.random() * 20000);
});

onUnmounted(() => {
  if (generateMessagesTimer != null) {
    clearTimeout(generateMessagesTimer);
    generateMessagesTimer = null;
  }
});

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;

  const bottomThreshold = 20;
  const remaining = details.totalSize.height - (details.scrollOffset.y + details.viewportSize.height);
  isAtBottom.value = remaining < bottomThreshold;

  if (isAtBottom.value) {
    hasNewMessages.value = false;
  }

  // Infinite scroll upwards (history)
  if (details.scrollOffset.y < 100 && !isLoading.value && !details.isProgrammaticScroll && items.value.length > 0 && items.value.length < 500) {
    isLoading.value = true;
    setTimeout(() => {
      loadMessages(20, true);

      // Wait for VirtualScroll to restores scroll
      // Additional small delay to ensure all measurements and corrections are done
      setTimeout(() => {
        isLoading.value = false;
      }, 50);
    }, 500);
  }
}

const newMessage = ref('');

function addMessage(text: string, isMe: boolean) {
  const id = (items.value[ items.value.length - 1 ]?.id || 0) + 1;
  items.value.push({
    id,
    text,
    isMe,
    time: (new Date()).toLocaleTimeString('en-US', {
      timeZone: 'Europe/Bucharest',
    }),
  });

  if (isAtBottom.value) {
    nextTick(() => {
      virtualScrollRef.value?.scrollToIndex(items.value.length - 1, 0, { align: 'end', behavior: 'smooth' });
    });
  } else if (!isMe) {
    hasNewMessages.value = true;
  }
}

function sendMessage() {
  if (!newMessage.value.trim()) {
    return;
  }

  const text = newMessage.value;
  newMessage.value = '';
  addMessage(text, true);

  // Response with random delay
  const delay = 500 + Math.random() * 2000;
  setTimeout(() => {
    addMessage(\`Response to: "\${ text.slice(0, 20) }..."\`, false);
  }, delay);
}

function scrollToBottom() {
  virtualScrollRef.value?.scrollToIndex(items.value.length - 1, 0, { align: 'end', behavior: 'smooth' });
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="text-secondary font-bold uppercase opacity-60 pe-2 align-baseline">Chat Interface</span>
    </template>

    <template #description>
      A chat interface demonstration. Features <strong>dynamic item heights</strong>, <strong>initial scroll to bottom</strong>, <strong>scroll restoration</strong> when loading history (scrolling up), <strong>smooth scrolling</strong> for new messages, and <strong>sticky footer</strong> for the input block.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.152 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Chat with history loading and auto-scroll
    </template>

    <template #controls>
      <div class="flex flex-wrap gap-2 md:gap-4 items-start w-full">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
      </div>
    </template>

    <div class="h-full border border-base-300 rounded-box overflow-hidden relative flex flex-col">
      <div v-if="isLoading" class="absolute top-2 left-0 right-0 flex justify-center z-10">
        <span class="loading loading-spinner loading-sm text-primary" />
      </div>

      <div
        v-if="hasNewMessages && !isAtBottom"
        class="absolute bottom-20 left-0 right-0 flex justify-center z-10"
      >
        <button
          class="btn btn-sm btn-primary shadow-lg gap-2"
          @click="scrollToBottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-4"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
          </svg>
          New messages available
        </button>
      </div>

      <VirtualScroll
        ref="virtualScrollRef"
        :debug="debugMode"
        class="bg-base-200"
        :items="items"
        :restore-scroll-on-prepend="true"
        :ssr-range="ssrRange"
        :initial-scroll-index="initialScrollIndex"
        initial-scroll-align="end"
        :scroll-padding-start="10"
        :scroll-padding-end="10"
        :gap="12"
        :sticky-footer="true"
        @scroll="onScroll"
      >
        <template #item="{ item }">
          <div class="px-4 flex flex-col" :class="item.isMe ? 'items-end' : 'items-start'">
            <div
              class="max-w-[80%] p-3 rounded-2xl text-sm"
              :class="item.isMe ? 'bg-secondary text-secondary-content rounded-br-none' : 'bg-primary text-primary-content text-tert rounded-bl-none'"
            >
              {{ item.text }}
            </div>
            <span class="text-[10px] opacity-50 mt-1 px-1">{{ item.time }}</span>
          </div>
        </template>

        <template #footer>
          <div class="p-4 bg-base-300 border-t border-base-300 flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              class="input input-bordered w-full"
              aria-label="Message"
              @keydown.enter="sendMessage"
            />
            <button class="btn btn-primary" @click="sendMessage">Send</button>
          </div>
        </template>
      </VirtualScroll>
    </div>
  </ExampleContainer>
</template>
`,ne={class:"flex flex-wrap gap-2 md:gap-4 items-start w-full"},oe={class:"h-full border border-base-300 rounded-box overflow-hidden relative flex flex-col"},se={key:0,class:"absolute top-2 left-0 right-0 flex justify-center z-10"},ae={key:1,class:"absolute bottom-20 left-0 right-0 flex justify-center z-10"},le={class:"text-[10px] opacity-50 mt-1 px-1"},ie={class:"p-4 bg-base-300 border-t border-base-300 flex gap-2"},A="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",re=Z({__name:"+Page",setup(y){const t=a([]),p=a(),w=a(null),E=O("debugMode",a(!1)),u=a(!1),c=a(!0),g=a(!1),j=k(()=>({start:Math.max(0,t.value.length-10),end:t.value.length})),I=k(()=>t.value.length-1),m=ee(12345);let M=new Date("2026-01-10T21:12:23Z").valueOf();function U(){return M+=Math.floor(m()*1e5)+3,new Date(M).toLocaleTimeString("en-US",{timeZone:"Europe/Bucharest"})}function L(n,e){const s=e??m()>.5,v=Math.floor(m()*100)+10;return{id:n,text:A.slice(0,v),isMe:s,time:U()}}function S(n,e=!1){const s=[],v=e?(t.value[0]?.id||0)-n:(t.value[t.value.length-1]?.id||0)+1;for(let h=0;h<n;h++){const V=v+h;s.push(L(V))}e?t.value=[...s,...t.value]:t.value=[...t.value,...s]}S(50);let r=null;N(()=>{const n=()=>{f(A.slice(0,Math.floor(m()*100)+10),!1),r=setTimeout(n,5e3+Math.random()*2e4)};r=setTimeout(n,5e3+Math.random()*2e4)}),q(()=>{r!=null&&(clearTimeout(r),r=null)});function _(n){w.value=n;const e=20,s=n.totalSize.height-(n.scrollOffset.y+n.viewportSize.height);c.value=s<e,c.value&&(g.value=!1),n.scrollOffset.y<100&&!u.value&&!n.isProgrammaticScroll&&t.value.length>0&&t.value.length<500&&(u.value=!0,setTimeout(()=>{S(20,!0),setTimeout(()=>{u.value=!1},50)},500))}const d=a("");function f(n,e){const s=(t.value[t.value.length-1]?.id||0)+1;t.value.push({id:s,text:n,isMe:e,time:new Date().toLocaleTimeString("en-US",{timeZone:"Europe/Bucharest"})}),c.value?$(()=>{p.value?.scrollToIndex(t.value.length-1,0,{align:"end",behavior:"smooth"})}):e||(g.value=!0)}function T(){if(!d.value.trim())return;const n=d.value;d.value="",f(n,!0);const e=500+Math.random()*2e3;setTimeout(()=>{f(`Response to: "${n.slice(0,20)}..."`,!1)},e)}function P(){p.value?.scrollToIndex(t.value.length-1,0,{align:"end",behavior:"smooth"})}return(n,e)=>(b(),H(Q,{code:x(te)},{title:l(()=>[...e[1]||(e[1]=[o("span",{class:"text-secondary font-bold uppercase opacity-60 pe-2 align-baseline"},"Chat Interface",-1)])]),description:l(()=>[...e[2]||(e[2]=[i(" A chat interface demonstration. Features ",-1),o("strong",null,"dynamic item heights",-1),i(", ",-1),o("strong",null,"initial scroll to bottom",-1),i(", ",-1),o("strong",null,"scroll restoration",-1),i(" when loading history (scrolling up), ",-1),o("strong",null,"smooth scrolling",-1),i(" for new messages, and ",-1),o("strong",null,"sticky footer",-1),i(" for the input block. ",-1)])]),icon:l(()=>[...e[3]||(e[3]=[o("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg"},[o("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.152 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"})],-1)])]),subtitle:l(()=>[...e[4]||(e[4]=[i(" Chat with history loading and auto-scroll ",-1)])]),controls:l(()=>[o("div",ne,[R(Y,{"scroll-details":w.value,direction:"vertical"},null,8,["scroll-details"])])]),default:l(()=>[o("div",oe,[u.value?(b(),z("div",se,[...e[5]||(e[5]=[o("span",{class:"loading loading-spinner loading-sm text-primary"},null,-1)])])):C("v-if",!0),g.value&&!c.value?(b(),z("div",ae,[o("button",{class:"btn btn-sm btn-primary shadow-lg gap-2",onClick:P},[...e[6]||(e[6]=[o("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"size-4"},[o("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"})],-1),i(" New messages available ",-1)])])])):C("v-if",!0),R(x(X),{ref_key:"virtualScrollRef",ref:p,debug:x(E),class:"bg-base-200",items:t.value,"restore-scroll-on-prepend":!0,"ssr-range":j.value,"initial-scroll-index":I.value,"initial-scroll-align":"end","scroll-padding-start":10,"scroll-padding-end":10,gap:12,"sticky-footer":!0,onScroll:_},{item:l(({item:s})=>[o("div",{class:B(["px-4 flex flex-col",s.isMe?"items-end":"items-start"])},[o("div",{class:B(["max-w-[80%] p-3 rounded-2xl text-sm",s.isMe?"bg-secondary text-secondary-content rounded-br-none":"bg-primary text-primary-content text-tert rounded-bl-none"])},D(s.text),3),o("span",le,D(s.time),1)],2)]),footer:l(()=>[o("div",ie,[F(o("input",{"onUpdate:modelValue":e[0]||(e[0]=s=>d.value=s),type:"text",placeholder:"Type a message...",class:"input input-bordered w-full","aria-label":"Message",onKeydown:K(T,["enter"])},null,544),[[W,d.value]]),o("button",{class:"btn btn-primary",onClick:T},"Send")])]),_:1},8,["debug","items","ssr-range","initial-scroll-index"])])]),_:1},8,["code"]))}}),de=Object.freeze(Object.defineProperty({__proto__:null,default:re},Symbol.toStringTag,{value:"Module"})),xe={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/__internal/integration/onRenderClient",fileExportPathToShowToUser:[]},valueSerialized:{type:"pointer-import",value:J}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-chat/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:de}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:G}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-chat/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Chat Interface - Virtual Scroll"}}};export{xe as configValuesSerialized};
