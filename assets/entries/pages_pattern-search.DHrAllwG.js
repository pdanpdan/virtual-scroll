import{d as Q,E as P,x as O,I as A,D as W,l as G,w as c,u as w,p as u,v as f,m as F,o as k,b as D,a as n,n as N,t as x,j as i,z as X,J as Z,C as J,c as U,F as z,i as Y,f as ee,g as te,h as ne}from"../chunks/chunk-BDlHe8BJ.js";import{V as ae}from"../chunks/chunk-CY8_agoq.js";import{_ as re,a as le}from"../chunks/chunk-C1op8fmR.js";/* empty css                      */import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const se=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

// CSS Custom Highlight API support check and types
const hasHighlightSupport = typeof CSS !== 'undefined' && 'highlights' in CSS;

const itemCount = ref(10000);
const searchQuery = ref('Ultimate');
const searchInputRef = ref<HTMLInputElement | null>(null);
const currentMatchIndex = ref(-1);
const virtualScrollRef = ref();
const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
const isMounted = ref(false);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  text: \`This is item #\${ i }. It contains some random content to search for.\${ (i % 10 === 0) ? ' BINGO!' : '' } \${ (i % 100 === 42) ? ' ULTIMATE ANSWER' : '' }\`,
})));

const matches = computed(() => {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    return [];
  }
  const query = searchQuery.value.toLowerCase();
  const results: number[] = [];
  for (let i = 0; i < items.value.length; i++) {
    if (items.value[ i ]!.text.toLowerCase().includes(query)) {
      results.push(i);
    }
  }
  return results;
});

currentMatchIndex.value = matches.value.length > 0 ? 0 : -1;

const ssrRange = computed(() => {
  const matchIdx = matches.value[ 0 ];
  if (matchIdx == null) {
    return { start: 0, end: 20 };
  }
  return {
    start: Math.max(0, matchIdx - 1),
    end: Math.min(items.value.length, matchIdx + 19),
  };
});

const currentMatchNumber = computed(() => {
  if (currentMatchIndex.value === -1 || matches.value.length === 0) {
    return 0;
  }
  return currentMatchIndex.value + 1;
});

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}

function nextMatch() {
  if (matches.value.length === 0) {
    return;
  }
  currentMatchIndex.value = (currentMatchIndex.value + 1) % matches.value.length;
  scrollToMatch();
}

function prevMatch() {
  if (matches.value.length === 0) {
    return;
  }
  currentMatchIndex.value = (currentMatchIndex.value - 1 + matches.value.length) % matches.value.length;
  scrollToMatch();
}

function scrollToMatch() {
  const itemIndex = matches.value[ currentMatchIndex.value ];
  if (itemIndex !== undefined) {
    virtualScrollRef.value?.scrollToIndex(itemIndex, null, { align: 'auto', behavior: 'smooth' });
  }
}

watch(searchQuery, () => {
  currentMatchIndex.value = matches.value.length > 0 ? 0 : -1;
  if (currentMatchIndex.value !== -1) {
    scrollToMatch();
  }
});

/**
 * Update highlights using the CSS Custom Highlight API.
 */
function updateHighlights() {
  if (!hasHighlightSupport) {
    return;
  }

  // Clear previous highlights
  CSS.highlights.clear();

  const query = searchQuery.value.toLowerCase();
  if (!query || query.length < 2) {
    return;
  }

  const container = virtualScrollRef.value?.$el;
  if (!container) {
    return;
  }

  const resultsRanges: Range[] = [];
  const currentRanges: Range[] = [];

  const treeWalker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  let currentNode = treeWalker.nextNode();

  const currentMatchIdx = matches.value[ currentMatchIndex.value ];

  while (currentNode) {
    const text = currentNode.textContent?.toLowerCase() || '';
    let start = text.indexOf(query);

    while (start !== -1) {
      const range = new Range();
      range.setStart(currentNode, start);
      range.setEnd(currentNode, start + query.length);

      const itemEl = (currentNode.parentElement as HTMLElement)?.closest('.virtual-scroll-item') as HTMLElement;
      const itemIndex = itemEl ? Number.parseInt(itemEl.dataset.index || '-1', 10) : -1;

      if (itemIndex === currentMatchIdx) {
        currentRanges.push(range);
      } else {
        resultsRanges.push(range);
      }

      start = text.indexOf(query, start + query.length);
    }
    currentNode = treeWalker.nextNode();
  }

  CSS.highlights.set('search-results', new Highlight(...resultsRanges));
  CSS.highlights.set('search-current', new Highlight(...currentRanges));
}

// Watch for changes that require re-highlighting
watch([
  () => scrollDetails.value?.items,
  searchQuery,
  currentMatchIndex,
], () => {
  if (hasHighlightSupport) {
    nextTick(updateHighlights);
  }
});

/**
 * Highlight fallback for browsers without Custom Highlight API.
 * Uses v-html to insert <mark> tags.
 */
function getHighlightedContent(text: string, query: string) {
  // Always return raw text during SSR or initial hydration to avoid mismatch
  if ((isMounted.value && hasHighlightSupport) || !query || query.length < 2) {
    return text;
  }
  const escapedQuery = query.replace(/[.*+?^\${}()|[\\\\]/g, '\\\\$&');
  const regex = new RegExp(\`(\${ escapedQuery })\`, 'gi');
  return text.replace(regex, '<mark class="search-highlight-fallback">$1</mark>');
}

// Activate search (Ctrl+K)
function handleGlobalKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInputRef.value?.focus();
    searchInputRef.value?.select();
  }
}

onMounted(() => {
  isMounted.value = true;
  window.addEventListener('keydown', handleGlobalKeyDown);
  if (hasHighlightSupport) {
    updateHighlights();
  }

  if (currentMatchIndex.value !== -1) {
    nextTick(() => {
      scrollToMatch();
    });
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown);
});
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-1">Search & Highlight</span>
    </template>

    <template #description>
      Generic way to provide native search in virtualized content using data-layer searching and CSS Custom Highlight API.
      Triggered by (<kbd class="kbd">⌘</kbd>+<kbd class="kbd">K</kbd>).
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
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    </template>

    <template #subtitle>
      High-performance search using CSS Custom Highlight API
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-x-4 gap-y-1 items-center">
        <div class="join bg-base-100 rounded-field border border-base-content/10">
          <label class="input input-ghost join-item grow">
            <div>
              <kbd class="kbd kbd-sm">⌘</kbd> + <kbd class="kbd kbd-sm">K</kbd>
            </div>
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Type to search..."
              @keydown.enter="nextMatch"
            />
            <span class="badge badge-primary badge-sm">
              {{ currentMatchNumber }}/{{ matches.length }}
            </span>
          </label>
          <button
            class="btn btn-soft btn-primary btn-square join-item"
            :disabled="matches.length === 0"
            aria-label="Previous match"
            @click="prevMatch"
          >
            ↑
          </button>
          <button
            class="btn btn-soft btn-primary btn-square join-item"
            :disabled="matches.length === 0"
            aria-label="Next match"
            @click="nextMatch"
          >
            ↓
          </button>
        </div>
        <div class="text-sm opacity-50 italic">
          <template v-if="matches.length > 0">
            Found {{ matches.length }} matches. Use arrows or <kbd class="kbd">Enter</kbd> to navigate.
          </template>
          <template v-else>
            Try searching for <strong>Bingo</strong> or <strong>Ultimate</strong>
          </template>
        </div>
      </div>
    </template>

    <VirtualScroll
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="60"
      :ssr-range="ssrRange"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div
          class="example-vertical-item example-vertical-item--fixed"
          :class="{ 'search-match-active bg-primary/10 ring-inset ring-1 ring-primary/30': index === matches[currentMatchIndex] }"
        >
          <span class="example-badge me-4" :class="{ 'badge-primary': index === matches[currentMatchIndex] }">
            #{{ index }}
          </span>
          <div class="text-sm md:text-base" v-html="getHighlightedContent(item.text, searchQuery)" />
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>

<style>
::highlight(search-results) {
  background-color: var(--color-primary);
  color: var(--color-primary-content);
}

::highlight(search-current) {
  background-color: var(--color-accent);
  color: var(--color-accent-content);
}

/* Fallback styling for older browsers */
.search-highlight-fallback {
  background-color: var(--color-primary);
  color: var(--color-primary-content);
  border-radius: 2px;
}

.search-match-active .search-highlight-fallback {
  background-color: var(--color-accent);
  color: var(--color-accent-content);
}
</style>
`,ie={class:"flex flex-wrap gap-x-4 gap-y-1 items-center"},oe={class:"join bg-base-100 rounded-field border border-base-content/10"},ce={class:"input input-ghost join-item grow"},ue={class:"badge badge-primary badge-sm"},de=["disabled"],he=["disabled"],ge={class:"text-sm opacity-50 italic"},me=["innerHTML"],pe=Q({__name:"+Page",setup(fe){const g=typeof CSS<"u"&&"highlights"in CSS,j=u(1e4),s=u("Ultimate"),b=u(null),r=u(-1),y=u(),S=u(null),L=F("debugMode",u(!1)),T=u(!1),m=f(()=>Array.from({length:j.value},(t,e)=>({id:e,text:`This is item #${e}. It contains some random content to search for.${e%10===0?" BINGO!":""} ${e%100===42?" ULTIMATE ANSWER":""}`}))),a=f(()=>{if(!s.value||s.value.length<2)return[];const t=s.value.toLowerCase(),e=[];for(let l=0;l<m.value.length;l++)m.value[l].text.toLowerCase().includes(t)&&e.push(l);return e});r.value=a.value.length>0?0:-1;const q=f(()=>{const t=a.value[0];return t==null?{start:0,end:20}:{start:Math.max(0,t-1),end:Math.min(m.value.length,t+19)}}),$=f(()=>r.value===-1||a.value.length===0?0:r.value+1);function _(t){S.value=t}function C(){a.value.length!==0&&(r.value=(r.value+1)%a.value.length,p())}function K(){a.value.length!==0&&(r.value=(r.value-1+a.value.length)%a.value.length,p())}function p(){const t=a.value[r.value];t!==void 0&&y.value?.scrollToIndex(t,null,{align:"auto",behavior:"smooth"})}P(s,()=>{r.value=a.value.length>0?0:-1,r.value!==-1&&p()});function M(){if(!g)return;CSS.highlights.clear();const t=s.value.toLowerCase();if(!t||t.length<2)return;const e=y.value?.$el;if(!e)return;const l=[],o=[],E=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);let d=E.nextNode();const B=a.value[r.value];for(;d;){const H=d.textContent?.toLowerCase()||"";let h=H.indexOf(t);for(;h!==-1;){const v=new Range;v.setStart(d,h),v.setEnd(d,h+t.length);const R=d.parentElement?.closest(".virtual-scroll-item");(R?Number.parseInt(R.dataset.index||"-1",10):-1)===B?o.push(v):l.push(v),h=H.indexOf(t,h+t.length)}d=E.nextNode()}CSS.highlights.set("search-results",new Highlight(...l)),CSS.highlights.set("search-current",new Highlight(...o))}P([()=>S.value?.items,s,r],()=>{g&&A(M)});function V(t,e){if(T.value&&g||!e||e.length<2)return t;const l=e.replace(/[.*+?^${}()|[\\]/g,"\\$&"),o=new RegExp(`(${l})`,"gi");return t.replace(o,'<mark class="search-highlight-fallback">$1</mark>')}function I(t){(t.ctrlKey||t.metaKey)&&t.key==="k"&&(t.preventDefault(),b.value?.focus(),b.value?.select())}return O(()=>{T.value=!0,window.addEventListener("keydown",I),g&&M(),r.value!==-1&&A(()=>{p()})}),W(()=>{window.removeEventListener("keydown",I)}),(t,e)=>(k(),G(re,{code:w(se)},{title:c(()=>[...e[1]||(e[1]=[n("span",{class:"example-title example-title--group-1"},"Search & Highlight",-1)])]),description:c(()=>[...e[2]||(e[2]=[i(" Generic way to provide native search in virtualized content using data-layer searching and CSS Custom Highlight API. Triggered by (",-1),n("kbd",{class:"kbd"},"⌘",-1),i("+",-1),n("kbd",{class:"kbd"},"K",-1),i("). ",-1)])]),icon:c(()=>[...e[3]||(e[3]=[n("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-1"},[n("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"})],-1)])]),subtitle:c(()=>[...e[4]||(e[4]=[i(" High-performance search using CSS Custom Highlight API ",-1)])]),controls:c(()=>[D(le,{"scroll-details":S.value,direction:"vertical"},null,8,["scroll-details"])]),"example-controls":c(()=>[n("div",ie,[n("div",oe,[n("label",ce,[e[5]||(e[5]=n("div",null,[n("kbd",{class:"kbd kbd-sm"},"⌘"),i(" + "),n("kbd",{class:"kbd kbd-sm"},"K")],-1)),X(n("input",{ref_key:"searchInputRef",ref:b,"onUpdate:modelValue":e[0]||(e[0]=l=>s.value=l),type:"text",placeholder:"Type to search...",onKeydown:Z(C,["enter"])},null,544),[[J,s.value]]),n("span",ue,x($.value)+"/"+x(a.value.length),1)]),n("button",{class:"btn btn-soft btn-primary btn-square join-item",disabled:a.value.length===0,"aria-label":"Previous match",onClick:K}," ↑ ",8,de),n("button",{class:"btn btn-soft btn-primary btn-square join-item",disabled:a.value.length===0,"aria-label":"Next match",onClick:C}," ↓ ",8,he)]),n("div",ge,[a.value.length>0?(k(),U(z,{key:0},[i(" Found "+x(a.value.length)+" matches. Use arrows or ",1),e[6]||(e[6]=n("kbd",{class:"kbd"},"Enter",-1)),e[7]||(e[7]=i(" to navigate. ",-1))],64)):(k(),U(z,{key:1},[e[8]||(e[8]=i(" Try searching for ",-1)),e[9]||(e[9]=n("strong",null,"Bingo",-1)),e[10]||(e[10]=i(" or ",-1)),e[11]||(e[11]=n("strong",null,"Ultimate",-1))],64))])])]),default:c(()=>[D(w(ae),{ref_key:"virtualScrollRef",ref:y,debug:w(L),class:"example-container",items:m.value,"item-size":60,"ssr-range":q.value,onScroll:_},{item:c(({item:l,index:o})=>[n("div",{class:N(["example-vertical-item example-vertical-item--fixed",{"search-match-active bg-primary/10 ring-inset ring-1 ring-primary/30":o===a.value[r.value]}])},[n("span",{class:N(["example-badge me-4",{"badge-primary":o===a.value[r.value]}])}," #"+x(o),3),n("div",{class:"text-sm md:text-base",innerHTML:V(l.text,s.value)},null,8,me)],2)]),_:1},8,["debug","items","ssr-range"])]),_:1},8,["code"]))}}),ve=Object.freeze(Object.defineProperty({__proto__:null,default:pe},Symbol.toStringTag,{value:"Module"})),Pe={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ne}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:te}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ee}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-search/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ve}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:Y}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-search/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Search & Highlight | Virtual Scroll"}}};export{Pe as configValuesSerialized};
