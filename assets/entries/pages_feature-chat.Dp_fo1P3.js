import{t as e}from"../chunks/chunk-CRr4ilIK.js";import{B as t,C as n,D as r,H as i,L as a,M as o,O as s,R as c,T as l,V as u,W as d,_ as f,b as p,d as m,g as h,j as g,k as _,o as v,p as y,t as b,v as x,w as S,y as C}from"../chunks/chunk-CeuQGv84.js";import"../chunks/chunk-CTpTqTDb.js";import"../chunks/chunk-CNwi8UUp.js";/* empty css                      *//* empty css                      *//* empty css                      */import{n as w,r as T,t as E}from"../chunks/chunk-znpjYd2Q.js";/* empty css                      */function D(e){let t=e;return function(){return t=t*16807%2147483647,t/2147483647}}var O=`<script setup lang="ts">
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
      <span class="text-secondary font-bold uppercase opacity-90 pe-2 align-baseline">Chat Interface</span>
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
            <span class="text-[10px] opacity-85 mt-1 px-1">{{ item.time }}</span>
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
`,k={class:`flex flex-wrap gap-2 md:gap-4 items-start w-full`},A={class:`h-full border border-base-300 rounded-box overflow-hidden relative flex flex-col`},j={key:0,class:`absolute top-2 left-0 right-0 flex justify-center z-10`},M={key:1,class:`absolute bottom-20 left-0 right-0 flex justify-center z-10`},N={class:`text-[10px] opacity-85 mt-1 px-1`},P={class:`p-4 bg-base-300 border-t border-base-300 flex gap-2`},F=`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.`,I=l({__name:`+Page`,setup(e){let l=t([]),v=t(),b=t(null),I=r(`debugMode`,t(!1)),L=t(!1),R=t(!0),z=t(!1),B=h(()=>({start:Math.max(0,l.value.length-10),end:l.value.length})),V=h(()=>l.value.length-1),H=D(12345),U=new Date(`2026-01-10T21:12:23Z`).valueOf();function W(){return U+=Math.floor(H()*1e5)+3,new Date(U).toLocaleTimeString(`en-US`,{timeZone:`Europe/Bucharest`})}function G(e,t){let n=t??H()>.5,r=Math.floor(H()*100)+10;return{id:e,text:F.slice(0,r),isMe:n,time:W()}}function K(e,t=!1){let n=[],r=t?(l.value[0]?.id||0)-e:(l.value[l.value.length-1]?.id||0)+1;for(let t=0;t<e;t++){let e=r+t;n.push(G(e))}t?l.value=[...n,...l.value]:l.value=[...l.value,...n]}K(50);let q=null;_(()=>{let e=()=>{X(F.slice(0,Math.floor(H()*100)+10),!1),q=setTimeout(e,5e3+Math.random()*2e4)};q=setTimeout(e,5e3+Math.random()*2e4)}),g(()=>{q!=null&&(clearTimeout(q),q=null)});function J(e){b.value=e,R.value=e.totalSize.height-(e.scrollOffset.y+e.viewportSize.height)<20,R.value&&(z.value=!1),e.scrollOffset.y<100&&!L.value&&!e.isProgrammaticScroll&&l.value.length>0&&l.value.length<500&&(L.value=!0,setTimeout(()=>{K(20,!0),setTimeout(()=>{L.value=!1},50)},500))}let Y=t(``);function X(e,t){let n=(l.value[l.value.length-1]?.id||0)+1;l.value.push({id:n,text:e,isMe:t,time:new Date().toLocaleTimeString(`en-US`,{timeZone:`Europe/Bucharest`})}),R.value?s(()=>{v.value?.scrollToIndex(l.value.length-1,0,{align:`end`,behavior:`smooth`})}):t||(z.value=!0)}function Z(){if(!Y.value.trim())return;let e=Y.value;Y.value=``,X(e,!0);let t=500+Math.random()*2e3;setTimeout(()=>{X(`Response to: "${e.slice(0,20)}..."`,!1)},t)}function Q(){v.value?.scrollToIndex(l.value.length-1,0,{align:`end`,behavior:`smooth`})}return(e,t)=>(o(),x(w,{code:u(O)},{title:a(()=>[...t[1]||=[f(`span`,{class:`text-secondary font-bold uppercase opacity-90 pe-2 align-baseline`},`Chat Interface`,-1)]]),description:a(()=>[n(` A chat interface demonstration with `+d(l.value.length.toLocaleString())+` messages. Features `,1),t[2]||=f(`strong`,null,`dynamic item heights`,-1),t[3]||=n(`, `,-1),t[4]||=f(`strong`,null,`initial scroll to bottom`,-1),t[5]||=n(`, `,-1),t[6]||=f(`strong`,null,`scroll restoration`,-1),t[7]||=n(` when loading history (scrolling up), `,-1),t[8]||=f(`strong`,null,`smooth scrolling`,-1),t[9]||=n(` for new messages, and `,-1),t[10]||=f(`strong`,null,`sticky footer`,-1),t[11]||=n(` for the input block. `,-1)]),icon:a(()=>[...t[12]||=[f(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-12 p-2 rounded-xl bg-secondary text-secondary-content shadow-lg`},[f(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.152 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z`})],-1)]]),subtitle:a(()=>[...t[13]||=[n(` Chat with history loading and auto-scroll `,-1)]]),controls:a(()=>[f(`div`,k,[S(E,{"scroll-details":b.value,direction:`vertical`},null,8,[`scroll-details`])])]),default:a(()=>[f(`div`,A,[L.value?(o(),p(`div`,j,[...t[14]||=[f(`span`,{class:`loading loading-spinner loading-sm text-primary`},null,-1)]])):C(`v-if`,!0),z.value&&!R.value?(o(),p(`div`,M,[f(`button`,{class:`btn btn-sm btn-primary shadow-lg gap-2`,onClick:Q},[...t[15]||=[f(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`size-4`},[f(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5`})],-1),n(` New messages available `,-1)]])])):C(`v-if`,!0),S(u(T),{ref_key:`virtualScrollRef`,ref:v,debug:u(I),class:`bg-base-200`,items:l.value,"restore-scroll-on-prepend":!0,"ssr-range":B.value,"initial-scroll-index":V.value,"initial-scroll-align":`end`,"scroll-padding-start":10,"scroll-padding-end":10,gap:12,"sticky-footer":!0,onScroll:J},{item:a(({item:e})=>[f(`div`,{class:i([`px-4 flex flex-col`,e.isMe?`items-end`:`items-start`])},[f(`div`,{class:i([`max-w-[80%] p-3 rounded-2xl text-sm`,e.isMe?`bg-secondary text-secondary-content rounded-br-none`:`bg-primary text-primary-content text-tert rounded-bl-none`])},d(e.text),3),f(`span`,N,d(e.time),1)],2)]),footer:a(()=>[f(`div`,P,[c(f(`input`,{"onUpdate:modelValue":t[0]||=e=>Y.value=e,type:`text`,placeholder:`Type a message...`,class:`input input-bordered w-full`,"aria-label":`Message`,onKeydown:y(Z,[`enter`])},null,544),[[m,Y.value]]),f(`button`,{class:`btn btn-primary`,onClick:Z},`Send`)])]),_:1},8,[`debug`,`items`,`ssr-range`,`initial-scroll-index`])])]),_:1},8,[`code`]))}}),L=e({default:()=>R},1),R=I;const z={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:v}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-chat/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:L}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:b}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/feature-chat/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Chat Interface - Virtual Scroll`}}};export{z as configValuesSerialized};