import{d as R,x as E,D as H,l as P,w as c,u,p as a,m as O,o as y,a as t,e as f,s as b,t as x,c as W,F as _,r as I,b as w,z,C as T,j as v,i as j,f as U,g as M,h as A}from"../chunks/chunk-BDlHe8BJ.js";import{_ as $,b as k,a as L}from"../chunks/chunk-C1op8fmR.js";/* empty css                      *//* empty css                      */import{_ as B}from"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const X=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScrollbar } from '@pdanpdan/virtual-scroll';
import { inject, onMounted, onUnmounted, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const containerRef = ref<HTMLElement | null>(null);
const scrollX = ref(0);
const scrollY = ref(0);
const totalWidth = ref(2000);
const totalHeight = ref(2000);
const viewportWidth = ref(0);
const viewportHeight = ref(0);

const mockScrollDetails = ref<ScrollDetails>({
  items: [],
  currentIndex: 0,
  currentColIndex: 0,
  currentEndIndex: 0,
  currentEndColIndex: 0,
  scrollOffset: { x: 0, y: 0 },
  displayScrollOffset: { x: 0, y: 0 },
  viewportSize: { width: 0, height: 0 },
  displayViewportSize: { width: 0, height: 0 },
  totalSize: { width: 2000, height: 2000 },
  isScrolling: false,
  isProgrammaticScroll: false,
  range: { start: 0, end: 0 },
  columnRange: { start: 0, end: 0, padStart: 0, padEnd: 0 },
});

const rtlMode = inject<Ref<boolean>>('rtlMode', ref(false));

function onScroll(e: Event) {
  const target = e.target as HTMLElement;
  scrollX.value = target.scrollLeft;
  scrollY.value = target.scrollTop;

  mockScrollDetails.value.scrollOffset.x = scrollX.value;
  mockScrollDetails.value.scrollOffset.y = scrollY.value;
}

function scrollToX(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollLeft = offset;
  }
}

function scrollToY(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollTop = offset;
  }
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      viewportWidth.value = entry.contentRect.width;
      viewportHeight.value = entry.contentRect.height;

      mockScrollDetails.value.viewportSize.width = viewportWidth.value;
      mockScrollDetails.value.viewportSize.height = viewportHeight.value;
    }
  });

  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
    viewportWidth.value = containerRef.value.clientWidth;
    viewportHeight.value = containerRef.value.clientHeight;

    mockScrollDetails.value.viewportSize.width = viewportWidth.value;
    mockScrollDetails.value.viewportSize.height = viewportHeight.value;
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-5">Independent Scrollbars</span>
    </template>

    <template #description>
      This example shows how to use <code>VirtualScrollbar</code> components independently from <code>VirtualScroll</code>.
      They control a standard <code>div</code> with <code>overflow: auto</code> and hidden scrollbars, providing a custom scroll interface.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75v16.5m16.5-16.5v16.5m-16.5-16.5h16.5m-16.5 16.5h16.5" />
      </svg>
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="mockScrollDetails" direction="both" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Content Width</span>
          <input
            v-model.number="totalWidth"
            type="range"
            min="500"
            max="5000"
            step="100"
            class="range range-xs range-primary w-48"
            aria-label="Content Width"
            @input="mockScrollDetails.totalSize.width = totalWidth"
          />
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Content Height</span>
          <input
            v-model.number="totalHeight"
            type="range"
            min="500"
            max="5000"
            step="100"
            class="range range-xs range-secondary w-48"
            aria-label="Content Height"
            @input="mockScrollDetails.totalSize.height = totalHeight"
          />
        </div>
      </div>
    </template>

    <div
      class="example-container flex flex-col overflow-auto"
      style="--vs-scrollbar-has-cross-gap: 1; --vs-scrollbar-cross-gap: 8px"
    >
      <!-- The standard scrollable area (hide scrollbars to use custom scrollbars) -->
      <div ref="containerRef" class="flex-1 overflow-auto scrollbar-hide" @scroll="onScroll">
        <div
          class="relative bg-grid-slate-100/[0.03]"
          :style="{
            width: \`\${ totalWidth }px\`,
            height: \`\${ totalHeight }px\`,
            backgroundSize: '40px 40px',
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            color: 'oklch(var(--bc) / 0.05)',
          }"
        >
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="text-center">
              <div class="text-4xl font-black opacity-10 small-caps tracking-widest italic">Independent Content</div>
              <div class="text-sm opacity-20 mt-2">{{ totalWidth }} &times; {{ totalHeight }} pixels</div>
            </div>
          </div>

          <!-- Some content dots -->
          <div
            v-for="i in 20"
            :key="i"
            class="absolute size-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold"
            :style="{
              insetInlineStart: \`\${ (i * 12345) % totalWidth }px\`,
              top: \`\${ (i * 54321) % totalHeight }px\`,
            }"
          >
            {{ i }}
          </div>
        </div>
      </div>

      <!-- Vertical Virtual Scrollbar -->
      <VirtualScrollbar
        axis="vertical"
        :total-size="totalHeight"
        :viewport-size="viewportHeight"
        :position="scrollY"
        :is-rtl="rtlMode"
        @scroll-to-offset="scrollToY"
      />

      <!-- Horizontal Virtual Scrollbar -->
      <VirtualScrollbar
        axis="horizontal"
        :total-size="totalWidth"
        :viewport-size="viewportWidth"
        :position="scrollX"
        :is-rtl="rtlMode"
        @scroll-to-offset="scrollToX"
      />
    </div>
  </ExampleContainer>
</template>

<style scoped>
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
`,Y={class:"flex flex-wrap gap-4 items-center"},N={class:"flex flex-col gap-1"},F={class:"flex flex-col gap-1"},q={class:"example-container flex flex-col overflow-auto",style:{"--vs-scrollbar-has-cross-gap":"1","--vs-scrollbar-cross-gap":"8px"}},G={class:"absolute inset-0 flex items-center justify-center pointer-events-none"},J={class:"text-center"},K={class:"text-sm opacity-20 mt-2"},Q=R({__name:"+Page",setup(te){const l=a(null),m=a(0),h=a(0),i=a(2e3),s=a(2e3),d=a(0),p=a(0),o=a({items:[],currentIndex:0,currentColIndex:0,currentEndIndex:0,currentEndColIndex:0,scrollOffset:{x:0,y:0},displayScrollOffset:{x:0,y:0},viewportSize:{width:0,height:0},displayViewportSize:{width:0,height:0},totalSize:{width:2e3,height:2e3},isScrolling:!1,isProgrammaticScroll:!1,range:{start:0,end:0},columnRange:{start:0,end:0,padStart:0,padEnd:0}}),S=O("rtlMode",a(!1));function C(r){const e=r.target;m.value=e.scrollLeft,h.value=e.scrollTop,o.value.scrollOffset.x=m.value,o.value.scrollOffset.y=h.value}function D(r){l.value&&(l.value.scrollLeft=r)}function V(r){l.value&&(l.value.scrollTop=r)}let g=null;return E(()=>{g=new ResizeObserver(r=>{for(const e of r)d.value=e.contentRect.width,p.value=e.contentRect.height,o.value.viewportSize.width=d.value,o.value.viewportSize.height=p.value}),l.value&&(g.observe(l.value),d.value=l.value.clientWidth,p.value=l.value.clientHeight,o.value.viewportSize.width=d.value,o.value.viewportSize.height=p.value)}),H(()=>{g?.disconnect()}),(r,e)=>(y(),P($,{code:u(X)},{title:c(()=>[...e[4]||(e[4]=[t("span",{class:"example-title example-title--group-5"},"Independent Scrollbars",-1)])]),description:c(()=>[...e[5]||(e[5]=[v(" This example shows how to use ",-1),t("code",null,"VirtualScrollbar",-1),v(" components independently from ",-1),t("code",null,"VirtualScroll",-1),v(". They control a standard ",-1),t("code",null,"div",-1),v(" with ",-1),t("code",null,"overflow: auto",-1),v(" and hidden scrollbars, providing a custom scroll interface. ",-1)])]),icon:c(()=>[...e[6]||(e[6]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-5"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M3.75 3.75v16.5m16.5-16.5v16.5m-16.5-16.5h16.5m-16.5 16.5h16.5"})],-1)])]),controls:c(()=>[w(L,{"scroll-details":o.value,direction:"both"},null,8,["scroll-details"])]),"example-controls":c(()=>[t("div",Y,[t("div",N,[e[7]||(e[7]=t("span",{class:"text-xs font-bold opacity-50 small-caps tracking-wider"},"Content Width",-1)),z(t("input",{"onUpdate:modelValue":e[0]||(e[0]=n=>i.value=n),type:"range",min:"500",max:"5000",step:"100",class:"range range-xs range-primary w-48","aria-label":"Content Width",onInput:e[1]||(e[1]=n=>o.value.totalSize.width=i.value)},null,544),[[T,i.value,void 0,{number:!0}]])]),t("div",F,[e[8]||(e[8]=t("span",{class:"text-xs font-bold opacity-50 small-caps tracking-wider"},"Content Height",-1)),z(t("input",{"onUpdate:modelValue":e[2]||(e[2]=n=>s.value=n),type:"range",min:"500",max:"5000",step:"100",class:"range range-xs range-secondary w-48","aria-label":"Content Height",onInput:e[3]||(e[3]=n=>o.value.totalSize.height=s.value)},null,544),[[T,s.value,void 0,{number:!0}]])])])]),default:c(()=>[t("div",q,[f(" The standard scrollable area (hide scrollbars to use custom scrollbars) "),t("div",{ref_key:"containerRef",ref:l,class:"flex-1 overflow-auto scrollbar-hide",onScroll:C},[t("div",{class:"relative bg-grid-slate-100/[0.03]",style:b({width:`${i.value}px`,height:`${s.value}px`,backgroundSize:"40px 40px",backgroundImage:"linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",color:"oklch(var(--bc) / 0.05)"})},[t("div",G,[t("div",J,[e[9]||(e[9]=t("div",{class:"text-4xl font-black opacity-10 small-caps tracking-widest italic"},"Independent Content",-1)),t("div",K,x(i.value)+" × "+x(s.value)+" pixels",1)])]),f(" Some content dots "),(y(),W(_,null,I(20,n=>t("div",{key:n,class:"absolute size-4 rounded-full bg-primary/20 flex items-center justify-center text-[8px] font-bold",style:b({insetInlineStart:`${n*12345%i.value}px`,top:`${n*54321%s.value}px`})},x(n),5)),64))],4)],544),f(" Vertical Virtual Scrollbar "),w(u(k),{axis:"vertical","total-size":s.value,"viewport-size":p.value,position:h.value,"is-rtl":u(S),onScrollToOffset:V},null,8,["total-size","viewport-size","position","is-rtl"]),f(" Horizontal Virtual Scrollbar "),w(u(k),{axis:"horizontal","total-size":i.value,"viewport-size":d.value,position:m.value,"is-rtl":u(S),onScrollToOffset:D},null,8,["total-size","viewport-size","position","is-rtl"])])]),_:1},8,["code"]))}}),Z=B(Q,[["__scopeId","data-v-9281e2c4"]]),ee=Object.freeze(Object.defineProperty({__proto__:null,default:Z},Symbol.toStringTag,{value:"Module"})),pe={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:A}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:M}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:U}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-independent-scrollbars/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:ee}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:j}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-independent-scrollbars/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Independent Scrollbars | Virtual Scroll"}}};export{pe as configValuesSerialized};
