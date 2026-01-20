import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{C as t,D as n,G as r,H as i,M as a,O as o,R as s,T as c,U as l,V as u,_ as d,b as f,d as p,g as m,j as h,k as g,o as _,p as v,t as y,v as b,w as x,y as S,z as C}from"../chunks/chunk-aspRjZ9M.js";import"../chunks/chunk-CTpTqTDb.js";import{n as w}from"../chunks/chunk-BjlKgXue.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as T,t as E}from"../chunks/chunk-eRtd9FZy.js";function D(e){let t=e;return function(){return t=t*16807%2147483647,t/2147483647}}var O=`<script setup lang="ts">
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
      <span class="example-title example-title--group-4">Chat Interface</span>
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
        class="example-icon example-icon--group-4"
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

    <div class="h-full border border-base-300 rounded-box overflow-hidden relative flex flex-col shadow-soft">
      <div v-if="isLoading" class="absolute top-2 left-0 right-0 flex justify-center z-10">
        <span class="loading loading-spinner loading-sm text-primary" />
      </div>

      <div
        v-if="hasNewMessages && !isAtBottom"
        class="absolute bottom-20 left-0 right-0 flex justify-center z-10 px-4"
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
`,k={class:`flex flex-wrap gap-2 md:gap-4 items-start w-full`},A={class:`h-full border border-base-300 rounded-box overflow-hidden relative flex flex-col shadow-soft`},j={key:0,class:`absolute top-2 left-0 right-0 flex justify-center z-10`},M={key:1,class:`absolute bottom-20 left-0 right-0 flex justify-center z-10 px-4`},N={class:`chat-footer opacity-60 mt-1`},P={class:`p-3 md:p-4 bg-base-200 border-t border-base-300 flex gap-2`},F=`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,I=c({__name:`+Page`,setup(e){let c=u([]),_=u(),y=u(null),I=n(`debugMode`,u(!1)),L=u(!1),R=u(!0),z=u(!1),B=m(()=>({start:Math.max(0,c.value.length-10),end:c.value.length})),V=m(()=>c.value.length-1),H=D(12345),U=new Date(`2026-01-10T21:12:23Z`).valueOf();function W(){return U+=Math.floor(H()*1e5)+3,new Date(U).toLocaleTimeString(`en-US`,{timeZone:`Europe/Bucharest`})}function G(e,t){let n=t??H()>.5,r=Math.floor(H()*100)+10;return{id:e,text:F.slice(0,r),isMe:n,time:W()}}function K(e,t=!1){let n=[],r=t?(c.value[0]?.id||0)-e:(c.value[c.value.length-1]?.id||0)+1;for(let t=0;t<e;t++){let e=r+t;n.push(G(e))}t?c.value=[...n,...c.value]:c.value=[...c.value,...n]}K(50);let q=null;g(()=>{let e=()=>{X(F.slice(0,Math.floor(H()*100)+10),!1),q=setTimeout(e,5e3+Math.random()*2e4)};q=setTimeout(e,5e3+Math.random()*2e4)}),h(()=>{q!=null&&(clearTimeout(q),q=null)});function J(e){y.value=e,R.value=e.totalSize.height-(e.scrollOffset.y+e.viewportSize.height)<20,R.value&&(z.value=!1),e.scrollOffset.y<100&&!L.value&&!e.isProgrammaticScroll&&c.value.length>0&&c.value.length<500&&(L.value=!0,setTimeout(()=>{K(20,!0),setTimeout(()=>{L.value=!1},50)},500))}let Y=u(``);function X(e,t){let n=(c.value[c.value.length-1]?.id||0)+1;c.value.push({id:n,text:e,isMe:t,time:new Date().toLocaleTimeString(`en-US`,{timeZone:`Europe/Bucharest`})}),R.value?o(()=>{_.value?.scrollToIndex(c.value.length-1,0,{align:`end`,behavior:`smooth`})}):t||(z.value=!0)}function Z(){if(!Y.value.trim())return;let e=Y.value;Y.value=``,X(e,!0);let t=500+Math.random()*2e3;setTimeout(()=>{X(`Response to: "${e.slice(0,20)}..."`,!1)},t)}function Q(){_.value?.scrollToIndex(c.value.length-1,0,{align:`end`,behavior:`smooth`})}return(e,n)=>(a(),b(T,{code:i(O)},{title:s(()=>[...n[1]||=[d(`span`,{class:`example-title example-title--group-4`},`Chat Interface`,-1)]]),description:s(()=>[t(` A chat interface demonstration with `+r(c.value.length.toLocaleString())+` messages. Features `,1),n[2]||=d(`strong`,null,`dynamic item heights`,-1),n[3]||=t(`, `,-1),n[4]||=d(`strong`,null,`initial scroll to bottom`,-1),n[5]||=t(`, `,-1),n[6]||=d(`strong`,null,`scroll restoration`,-1),n[7]||=t(` when loading history (scrolling up), `,-1),n[8]||=d(`strong`,null,`smooth scrolling`,-1),n[9]||=t(` for new messages, and `,-1),n[10]||=d(`strong`,null,`sticky footer`,-1),n[11]||=t(` for the input block. `,-1)]),icon:s(()=>[...n[12]||=[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-4`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.152 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z`})],-1)]]),subtitle:s(()=>[...n[13]||=[t(` Chat with history loading and auto-scroll `,-1)]]),controls:s(()=>[d(`div`,k,[x(E,{"scroll-details":y.value,direction:`vertical`},null,8,[`scroll-details`])])]),default:s(()=>[d(`div`,A,[L.value?(a(),f(`div`,j,[...n[14]||=[d(`span`,{class:`loading loading-spinner loading-sm text-primary`},null,-1)]])):S(`v-if`,!0),z.value&&!R.value?(a(),f(`div`,M,[d(`button`,{class:`btn btn-primary btn-sm md:btn-md shadow-strong shadow-primary/40 gap-2 rounded-full border-2 border-white/10`,onClick:Q},[...n[15]||=[d(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`2.5`,stroke:`currentColor`,class:`size-4 mt-1 animate-bounce`},[d(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5`})],-1),d(`span`,{class:`font-black text-xs small-caps tracking-tight`},`New messages`,-1)]])])):S(`v-if`,!0),x(i(w),{ref_key:`virtualScrollRef`,ref:_,debug:i(I),items:c.value,"restore-scroll-on-prepend":!0,"ssr-range":B.value,"initial-scroll-index":V.value,"initial-scroll-align":`end`,"scroll-padding-start":10,"scroll-padding-end":10,gap:12,"sticky-footer":!0,onScroll:J},{item:s(({item:e})=>[d(`div`,{class:l([`chat px-4`,e.isMe?`chat-end`:`chat-start`])},[d(`div`,{class:l([`chat-bubble text-sm shadow-sm`,e.isMe?`chat-bubble-primary`:``])},r(e.text),3),d(`div`,N,r(e.time),1)],2)]),footer:s(()=>[d(`div`,P,[C(d(`input`,{"onUpdate:modelValue":n[0]||=e=>Y.value=e,type:`text`,placeholder:`Type a message...`,class:`input input-bordered input-sm md:input-md w-full`,"aria-label":`Message`,onKeydown:v(Z,[`enter`])},null,544),[[p,Y.value]]),d(`button`,{class:`btn btn-primary btn-sm md:btn-md px-6`,onClick:Z},`Send`)])]),_:1},8,[`debug`,`items`,`ssr-range`,`initial-scroll-index`])])]),_:1},8,[`code`]))}}),L=e({default:()=>R},1),R=I;const z={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:_}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-chat/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:L}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:y}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-chat/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Chat Interface - Virtual Scroll`}}};export{z as configValuesSerialized};