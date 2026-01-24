import{t as e}from"../chunks/chunk-BYR07lV1.js";import{C as t,D as n,G as r,H as i,L as a,M as o,O as s,R as c,T as l,U as u,V as d,_ as f,b as p,d as m,g as h,h as g,j as _,k as v,o as y,p as b,t as x,v as S,w as C,z as w}from"../chunks/chunk-DQ_YCHvG.js";import"../chunks/chunk-DxZ6SkEg.js";/* empty css                      */import{n as T}from"../chunks/chunk-UeDLoRz3.js";/* empty css                      *//* empty css                      */import{t as E}from"../chunks/chunk-CFHiRfoq.js";import{t as D}from"../chunks/chunk-2Cb9wrQN.js";/* empty css                      */var O=`<script setup lang="ts">
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

// Redirect native search (Ctrl+F)
function handleGlobalKeyDown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
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
      Demonstrates intercepting native browser search (<kbd class="kbd">Ctrl</kbd>+<kbd class="kbd">F</kbd>) and redirecting it to the virtual scroll logic.
      Highlights are rendered with <strong>CSS Custom Highlight API</strong>.
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
      <div class="flex flex-wrap gap-2 md:gap-4 items-start">
        <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

        <div class="bg-base-300 p-2 rounded-box border border-base-content/5 shadow-sm min-w-64">
          <label for="search-input" class="block text-sm text-base-content/80 m-1">
            Find in list (<kbd class="kbd">Ctrl</kbd>+<kbd class="kbd">F</kbd>)
          </label>
          <div class="join bg-base-100 rounded-field border border-base-content/10">
            <input
              id="search-input"
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              placeholder="Type to search..."
              class="input input-ghost join-item flex-1"
              @keydown.enter="nextMatch"
            />
            <div class="join-item bg-base-200 flex items-center px-3 border-x border-base-content/5 opacity-70 text-xs font-mono tabular-nums pt-1">
              {{ currentMatchNumber }}/{{ matches.length }}
            </div>
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
          <div class="text-sm opacity-50 italic m-1">
            <template v-if="matches.length > 0">
              Found {{ matches.length }} matches. Use arrows or <kbd class="kbd">Enter</kbd> to navigate.
            </template>
            <template v-else>
              Try searching for <strong>Bingo</strong> or <strong>Ultimate</strong>
            </template>
          </div>
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
          class="example-vertical-item example-vertical-item--fixed transition-colors duration-300"
          :class="{ 'search-match-active bg-primary/10 ring-inset ring-1 ring-primary/30': index === matches[currentMatchIndex] }"
        >
          <span class="example-badge mr-4" :class="{ 'badge-primary': index === matches[currentMatchIndex] }">
            #{{ index }}
          </span>
          <div
            class="text-sm md:text-base truncate"
            v-html="getHighlightedContent(item.text, searchQuery)"
          />
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
`,k={class:`flex flex-wrap gap-2 md:gap-4 items-start`},A={class:`bg-base-300 p-2 rounded-box border border-base-content/5 shadow-sm min-w-64`},j={class:`join bg-base-100 rounded-field border border-base-content/10`},M={class:`join-item bg-base-200 flex items-center px-3 border-x border-base-content/5 opacity-70 text-xs font-mono tabular-nums pt-1`},N=[`disabled`],P=[`disabled`],F={class:`text-sm opacity-50 italic m-1`},I=[`innerHTML`],L=l({__name:`+Page`,setup(e){let l=typeof CSS<`u`&&`highlights`in CSS,y=d(1e4),x=d(`Ultimate`),L=d(null),R=d(-1),z=d(),B=d(null),V=n(`debugMode`,d(!1)),H=d(!1),U=h(()=>Array.from({length:y.value},(e,t)=>({id:t,text:`This is item #${t}. It contains some random content to search for.${t%10==0?` BINGO!`:``} ${t%100==42?` ULTIMATE ANSWER`:``}`}))),W=h(()=>{if(!x.value||x.value.length<2)return[];let e=x.value.toLowerCase(),t=[];for(let n=0;n<U.value.length;n++)U.value[n].text.toLowerCase().includes(e)&&t.push(n);return t});R.value=W.value.length>0?0:-1;let G=h(()=>{let e=W.value[0];return e==null?{start:0,end:20}:{start:Math.max(0,e-1),end:Math.min(U.value.length,e+19)}}),K=h(()=>R.value===-1||W.value.length===0?0:R.value+1);function q(e){B.value=e}function J(){W.value.length!==0&&(R.value=(R.value+1)%W.value.length,X())}function Y(){W.value.length!==0&&(R.value=(R.value-1+W.value.length)%W.value.length,X())}function X(){let e=W.value[R.value];e!==void 0&&z.value?.scrollToIndex(e,null,{align:`auto`,behavior:`smooth`})}a(x,()=>{R.value=W.value.length>0?0:-1,R.value!==-1&&X()});function Z(){if(!l)return;CSS.highlights.clear();let e=x.value.toLowerCase();if(!e||e.length<2)return;let t=z.value?.$el;if(!t)return;let n=[],r=[],i=document.createTreeWalker(t,NodeFilter.SHOW_TEXT),a=i.nextNode(),o=W.value[R.value];for(;a;){let t=a.textContent?.toLowerCase()||``,s=t.indexOf(e);for(;s!==-1;){let i=new Range;i.setStart(a,s),i.setEnd(a,s+e.length);let c=a.parentElement?.closest(`.virtual-scroll-item`);(c?Number.parseInt(c.dataset.index||`-1`,10):-1)===o?r.push(i):n.push(i),s=t.indexOf(e,s+e.length)}a=i.nextNode()}CSS.highlights.set(`search-results`,new Highlight(...n)),CSS.highlights.set(`search-current`,new Highlight(...r))}a([()=>B.value?.items,x,R],()=>{l&&s(Z)});function Q(e,t){if(H.value&&l||!t||t.length<2)return e;let n=t.replace(/[.*+?^${}()|[\\]/g,`\\$&`),r=RegExp(`(${n})`,`gi`);return e.replace(r,`<mark class="search-highlight-fallback">$1</mark>`)}function $(e){(e.ctrlKey||e.metaKey)&&e.key===`f`&&(e.preventDefault(),L.value?.focus(),L.value?.select())}return v(()=>{H.value=!0,window.addEventListener(`keydown`,$),l&&Z(),R.value!==-1&&s(()=>{X()})}),_(()=>{window.removeEventListener(`keydown`,$)}),(e,n)=>(o(),S(E,{code:i(O)},{title:c(()=>[...n[1]||=[f(`span`,{class:`example-title example-title--group-1`},`Search & Highlight`,-1)]]),description:c(()=>[...n[2]||=[t(` Demonstrates intercepting native browser search (`,-1),f(`kbd`,{class:`kbd`},`Ctrl`,-1),t(`+`,-1),f(`kbd`,{class:`kbd`},`F`,-1),t(`) and redirecting it to the virtual scroll logic. Highlights are rendered with `,-1),f(`strong`,null,`CSS Custom Highlight API`,-1),t(`. `,-1)]]),icon:c(()=>[...n[3]||=[f(`svg`,{xmlns:`http://www.w3.org/2000/svg`,fill:`none`,viewBox:`0 0 24 24`,"stroke-width":`1.5`,stroke:`currentColor`,class:`example-icon example-icon--group-1`},[f(`path`,{"stroke-linecap":`round`,"stroke-linejoin":`round`,d:`m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z`})],-1)]]),subtitle:c(()=>[...n[4]||=[t(` High-performance search using CSS Custom Highlight API `,-1)]]),controls:c(()=>[f(`div`,k,[C(D,{"scroll-details":B.value,direction:`vertical`},null,8,[`scroll-details`]),f(`div`,A,[n[11]||=f(`label`,{for:`search-input`,class:`block text-sm text-base-content/80 m-1`},[t(` Find in list (`),f(`kbd`,{class:`kbd`},`Ctrl`),t(`+`),f(`kbd`,{class:`kbd`},`F`),t(`) `)],-1),f(`div`,j,[w(f(`input`,{id:`search-input`,ref_key:`searchInputRef`,ref:L,"onUpdate:modelValue":n[0]||=e=>x.value=e,type:`text`,placeholder:`Type to search...`,class:`input input-ghost join-item flex-1`,onKeydown:b(J,[`enter`])},null,544),[[m,x.value]]),f(`div`,M,r(K.value)+`/`+r(W.value.length),1),f(`button`,{class:`btn btn-soft btn-primary btn-square join-item`,disabled:W.value.length===0,"aria-label":`Previous match`,onClick:Y},` ↑ `,8,N),f(`button`,{class:`btn btn-soft btn-primary btn-square join-item`,disabled:W.value.length===0,"aria-label":`Next match`,onClick:J},` ↓ `,8,P)]),f(`div`,F,[W.value.length>0?(o(),p(g,{key:0},[t(` Found `+r(W.value.length)+` matches. Use arrows or `,1),n[5]||=f(`kbd`,{class:`kbd`},`Enter`,-1),n[6]||=t(` to navigate. `,-1)],64)):(o(),p(g,{key:1},[n[7]||=t(` Try searching for `,-1),n[8]||=f(`strong`,null,`Bingo`,-1),n[9]||=t(` or `,-1),n[10]||=f(`strong`,null,`Ultimate`,-1)],64))])])])]),default:c(()=>[C(i(T),{ref_key:`virtualScrollRef`,ref:z,debug:i(V),class:`example-container`,items:U.value,"item-size":60,"ssr-range":G.value,onScroll:q},{item:c(({item:e,index:t})=>[f(`div`,{class:u([`example-vertical-item example-vertical-item--fixed transition-colors duration-300`,{"search-match-active bg-primary/10 ring-inset ring-1 ring-primary/30":t===W.value[R.value]}])},[f(`span`,{class:u([`example-badge mr-4`,{"badge-primary":t===W.value[R.value]}])},` #`+r(t),3),f(`div`,{class:`text-sm md:text-base truncate`,innerHTML:Q(e.text,x.value)},null,8,I)],2)]),_:1},8,[`debug`,`items`,`ssr-range`])]),_:1},8,[`code`]))}}),R=e({default:()=>z},1),z=L;const B={hasServerOnlyHook:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!1}},isClientRuntimeLoaded:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:!0}},onBeforeRenderEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},dataEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},guardEnv:{type:`computed`,definedAtData:null,valueSerialized:{type:`js-serialized`,value:null}},onRenderClient:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/__internal/integration/onRenderClient`,fileExportPathToShowToUser:[]},valueSerialized:{type:`pointer-import`,value:y}},Page:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-search/+Page.vue`,fileExportPathToShowToUser:[]},valueSerialized:{type:`plus-file`,exportValues:R}},hydrationCanBeAborted:{type:`standard`,definedAtData:{filePathToShowToUser:`vike-vue/config`,fileExportPathToShowToUser:[`default`,`hydrationCanBeAborted`]},valueSerialized:{type:`js-serialized`,value:!0}},Layout:{type:`cumulative`,definedAtData:[{filePathToShowToUser:`/pages/+Layout.vue`,fileExportPathToShowToUser:[]}],valueSerialized:[{type:`plus-file`,exportValues:x}]},title:{type:`standard`,definedAtData:{filePathToShowToUser:`/pages/pattern-search/+config.ts`,fileExportPathToShowToUser:[`default`,`title`]},valueSerialized:{type:`js-serialized`,value:`Search & Highlight | Virtual Scroll`}}};export{B as configValuesSerialized};