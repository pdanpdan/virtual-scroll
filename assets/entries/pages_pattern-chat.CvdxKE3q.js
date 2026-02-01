import{d as Z,x as O,D as N,l as q,w as a,u as x,I as H,p as l,m as $,o as b,a as o,c as k,e as z,b as C,z as F,J as K,C as J,n as A,t as w,j as i,v as B,i as W,f as G,g as Q,h as X}from"../chunks/chunk-BDlHe8BJ.js";import{V as Y}from"../chunks/chunk-CY8_agoq.js";import{_,a as ee}from"../chunks/chunk-C1op8fmR.js";import{c as te}from"../chunks/chunk-CX-OuWtW.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const ne=`<script setup lang="ts">
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
  const wasAtBottom = isAtBottom.value;

  items.value = [
    ...items.value,
    {
      id,
      text,
      isMe,
      time: (new Date()).toLocaleTimeString('en-US', {
        timeZone: 'Europe/Bucharest',
      }),
    },
  ];

  if (wasAtBottom || isMe) {
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
      <span class="example-title example-title--group-1">Chat Interface</span>
    </template>

    <template #description>
      A chat interface demonstration with {{ items.length.toLocaleString() }} messages. Features <strong>dynamic item heights</strong>, <strong>initial scroll to bottom</strong>, <strong>scroll restoration</strong> when loading history (scrolling up), <strong>smooth scrolling</strong> for new messages, and <strong>sticky footer</strong> for the input block.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-1"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.152 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
      </svg>
    </template>

    <template #subtitle>
      Chat with history loading and auto-scroll
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
    </template>

    <div class="example-container flex flex-col overflow-auto">
      <div v-if="isLoading" class="absolute top-2 inset-x-0 flex justify-center z-10">
        <span class="loading loading-spinner loading-sm text-primary" />
      </div>

      <div
        v-if="hasNewMessages && !isAtBottom"
        class="absolute bottom-20 inset-x-0 flex justify-center z-10 px-4"
      >
        <button
          class="btn btn-primary btn-sm md:btn-md shadow-strong shadow-primary/40 gap-2 rounded-full border-2 border-white/10"
          @click="scrollToBottom"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2.5"
            stroke="currentColor"
            class="size-4 mt-1 animate-bounce"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
          </svg>
          <span class="font-black text-xs small-caps tracking-tight">New messages</span>
        </button>
      </div>

      <VirtualScroll
        ref="virtualScrollRef"
        class="flex-1"
        :debug="debugMode"
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
          <div class="chat px-4" :class="item.isMe ? 'chat-end' : 'chat-start'">
            <div class="chat-bubble text-sm shadow-sm" :class="item.isMe ? 'chat-bubble-primary' : ''">
              {{ item.text }}
            </div>
            <div class="chat-footer opacity-60 mt-1">{{ item.time }}</div>
          </div>
        </template>

        <template #footer>
          <div class="p-3 md:p-4 bg-base-200 border-t border-base-300 flex gap-2">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              class="input input-bordered input-sm md:input-md w-full"
              aria-label="Message"
              @keydown.enter="sendMessage"
            />
            <button class="btn btn-primary btn-sm md:btn-md px-6" @click="sendMessage">Send</button>
          </div>
        </template>
      </VirtualScroll>
    </div>
  </ExampleContainer>
</template>
`,oe={class:"example-container flex flex-col overflow-auto"},se={key:0,class:"absolute top-2 inset-x-0 flex justify-center z-10"},ae={key:1,class:"absolute bottom-20 inset-x-0 flex justify-center z-10 px-4"},le={class:"chat-footer opacity-60 mt-1"},ie={class:"p-3 md:p-4 bg-base-200 border-t border-base-300 flex gap-2"},D="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",re=Z({__name:"+Page",setup(ue){const t=l([]),g=l(),M=l(null),R=$("debugMode",l(!1)),m=l(!1),c=l(!0),f=l(!1),E=B(()=>({start:Math.max(0,t.value.length-10),end:t.value.length})),P=B(()=>t.value.length-1),p=te(12345);let y=new Date("2026-01-10T21:12:23Z").valueOf();function U(){return y+=Math.floor(p()*1e5)+3,new Date(y).toLocaleTimeString("en-US",{timeZone:"Europe/Bucharest"})}function j(n,e){const s=e??p()>.5,u=Math.floor(p()*100)+10;return{id:n,text:D.slice(0,u),isMe:s,time:U()}}function S(n,e=!1){const s=[],u=e?(t.value[0]?.id||0)-n:(t.value[t.value.length-1]?.id||0)+1;for(let h=0;h<n;h++){const V=u+h;s.push(j(V))}e?t.value=[...s,...t.value]:t.value=[...t.value,...s]}S(50);let r=null;O(()=>{const n=()=>{v(D.slice(0,Math.floor(p()*100)+10),!1),r=setTimeout(n,5e3+Math.random()*2e4)};r=setTimeout(n,5e3+Math.random()*2e4)}),N(()=>{r!=null&&(clearTimeout(r),r=null)});function I(n){M.value=n;const e=20,s=n.totalSize.height-(n.scrollOffset.y+n.viewportSize.height);c.value=s<e,c.value&&(f.value=!1),n.scrollOffset.y<100&&!m.value&&!n.isProgrammaticScroll&&t.value.length>0&&t.value.length<500&&(m.value=!0,setTimeout(()=>{S(20,!0),setTimeout(()=>{m.value=!1},50)},500))}const d=l("");function v(n,e){const s=(t.value[t.value.length-1]?.id||0)+1,u=c.value;t.value=[...t.value,{id:s,text:n,isMe:e,time:new Date().toLocaleTimeString("en-US",{timeZone:"Europe/Bucharest"})}],u||e?H(()=>{g.value?.scrollToIndex(t.value.length-1,0,{align:"end",behavior:"smooth"})}):e||(f.value=!0)}function T(){if(!d.value.trim())return;const n=d.value;d.value="",v(n,!0);const e=500+Math.random()*2e3;setTimeout(()=>{v(`Response to: "${n.slice(0,20)}..."`,!1)},e)}function L(){g.value?.scrollToIndex(t.value.length-1,0,{align:"end",behavior:"smooth"})}return(n,e)=>(b(),q(_,{code:x(ne)},{title:a(()=>[...e[1]||(e[1]=[o("span",{class:"example-title example-title--group-1"},"Chat Interface",-1)])]),description:a(()=>[i(" A chat interface demonstration with "+w(t.value.length.toLocaleString())+" messages. Features ",1),e[2]||(e[2]=o("strong",null,"dynamic item heights",-1)),e[3]||(e[3]=i(", ",-1)),e[4]||(e[4]=o("strong",null,"initial scroll to bottom",-1)),e[5]||(e[5]=i(", ",-1)),e[6]||(e[6]=o("strong",null,"scroll restoration",-1)),e[7]||(e[7]=i(" when loading history (scrolling up), ",-1)),e[8]||(e[8]=o("strong",null,"smooth scrolling",-1)),e[9]||(e[9]=i(" for new messages, and ",-1)),e[10]||(e[10]=o("strong",null,"sticky footer",-1)),e[11]||(e[11]=i(" for the input block. ",-1))]),icon:a(()=>[...e[12]||(e[12]=[o("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-1"},[o("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.152 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"})],-1)])]),subtitle:a(()=>[...e[13]||(e[13]=[i(" Chat with history loading and auto-scroll ",-1)])]),controls:a(()=>[C(ee,{"scroll-details":M.value},null,8,["scroll-details"])]),default:a(()=>[o("div",oe,[m.value?(b(),k("div",se,[...e[14]||(e[14]=[o("span",{class:"loading loading-spinner loading-sm text-primary"},null,-1)])])):z("v-if",!0),f.value&&!c.value?(b(),k("div",ae,[o("button",{class:"btn btn-primary btn-sm md:btn-md shadow-strong shadow-primary/40 gap-2 rounded-full border-2 border-white/10",onClick:L},[...e[15]||(e[15]=[o("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"2.5",stroke:"currentColor",class:"size-4 mt-1 animate-bounce"},[o("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"})],-1),o("span",{class:"font-black text-xs small-caps tracking-tight"},"New messages",-1)])])])):z("v-if",!0),C(x(Y),{ref_key:"virtualScrollRef",ref:g,class:"flex-1",debug:x(R),items:t.value,"restore-scroll-on-prepend":!0,"ssr-range":E.value,"initial-scroll-index":P.value,"initial-scroll-align":"end","scroll-padding-start":10,"scroll-padding-end":10,gap:12,"sticky-footer":!0,onScroll:I},{item:a(({item:s})=>[o("div",{class:A(["chat px-4",s.isMe?"chat-end":"chat-start"])},[o("div",{class:A(["chat-bubble text-sm shadow-sm",s.isMe?"chat-bubble-primary":""])},w(s.text),3),o("div",le,w(s.time),1)],2)]),footer:a(()=>[o("div",ie,[F(o("input",{"onUpdate:modelValue":e[0]||(e[0]=s=>d.value=s),type:"text",placeholder:"Type a message...",class:"input input-bordered input-sm md:input-md w-full","aria-label":"Message",onKeydown:K(T,["enter"])},null,544),[[J,d.value]]),o("button",{class:"btn btn-primary btn-sm md:btn-md px-6",onClick:T},"Send")])]),_:1},8,["debug","items","ssr-range","initial-scroll-index"])])]),_:1},8,["code"]))}}),de=Object.freeze(Object.defineProperty({__proto__:null,default:re},Symbol.toStringTag,{value:"Module"})),Se={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:X}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:Q}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:G}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-chat/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:de}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:W}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-chat/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Chat Interface | Virtual Scroll"}}};export{Se as configValuesSerialized};
