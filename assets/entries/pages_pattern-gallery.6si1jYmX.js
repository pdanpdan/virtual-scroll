import{d as b,l as w,w as o,u as p,m as S,p as r,o as s,b as f,c as d,s as T,F as z,r as _,a as t,t as u,z as P,C,j as g,v as A,i as k,f as D,g as V,h as j}from"../chunks/chunk-BzgwLqVJ.js";import{V as $}from"../chunks/chunk-Dk5GrEJI.js";import{_ as E,a as U}from"../chunks/chunk-XCFXGF1G.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-3RaXgKUL.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-wsRhs7bF.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const I=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

interface Photo {
  id: number;
  thumb: string;
  full: string;
  author: string;
}

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

const itemCount = ref(2000);
const columns = ref(5);

const photos = computed(() => Array.from(
  { length: Math.ceil(itemCount.value / columns.value) },
  (_, rowIdx) => Array.from({ length: columns.value }, (_, colIdx) => {
    const id = rowIdx * columns.value + colIdx;

    return {
      id,
      thumb: \`https://picsum.photos/seed/\${ id + 1 }/400/400\`,
      full: \`https://picsum.photos/seed/\${ id + 1 }/1200/800\`,
      author: \`Photographer \${ id }\`,
    } as Photo;
  }),
));

const scrollDetails = ref<ScrollDetails | null>(null);
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-6">Photo Gallery</span>
    </template>

    <template #description>
      A high-performance grid gallery displaying {{ itemCount.toLocaleString() }} photos. Features lazy-loading placeholders and a lightbox.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-6"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    </template>

    <template #subtitle>
      Lazy-loaded image grid with row-based virtualization
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <div class="flex flex-col gap-1">
          <span class="flex justify-between items-center">
            <span class="text-xs font-bold opacity-50 small-caps tracking-wider">Grid Columns</span>
            <span class="badge badge-sm badge-primary font-mono">{{ columns }}</span>
          </span>
          <input
            v-model.number="columns"
            type="range"
            min="1"
            max="8"
            step="1"
            class="range range-xs range-primary w-48"
            aria-label="Grid Columns"
          />
        </div>
      </div>
    </template>

    <VirtualScroll
      class="example-container p-4"
      :items="photos"
      :gap="16"
      :debug="debugMode"
      @scroll="(details) => scrollDetails = details"
    >
      <template #item="{ index: rowIndex, item: rowItems }">
        <div
          :key="\`r_\${ rowIndex }\`"
          class="grid gap-4 w-full"
          :style="{ gridTemplateColumns: \`repeat(\${ columns }, 1fr)\` }"
        >
          <div
            v-for="(photo, colIndex) in rowItems"
            :key="\`r_\${ rowIndex }_c_\${ colIndex }\`"
            class="rounded-box overflow-hidden relative outline-none border border-base-content/5 focus-visible:ring-2 focus-visible:ring-primary transition-transform active:scale-95 group aspect-square bg-base-200"
          >
            <img
              :src="photo.thumb"
              :alt="\`Photo by \${ photo.author }\`"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 md:p-4">
              <span class="text-white text-xs md:text-sm font-medium truncate">{{ photo.author }}</span>
            </div>
          </div>
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,B={class:"flex flex-wrap gap-4 items-center"},M={class:"flex flex-col gap-1"},L={class:"flex justify-between items-center"},G={class:"badge badge-sm badge-primary font-mono"},R=["src","alt"],Z={class:"absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 md:p-4"},F={class:"text-white text-xs md:text-sm font-medium truncate"},H=b({__name:"+Page",setup(O){const h=S("debugMode",r(!1)),m=r(2e3),n=r(5),v=A(()=>Array.from({length:Math.ceil(m.value/n.value)},(y,e)=>Array.from({length:n.value},(l,i)=>{const a=e*n.value+i;return{id:a,thumb:`https://picsum.photos/seed/${a+1}/400/400`,full:`https://picsum.photos/seed/${a+1}/1200/800`,author:`Photographer ${a}`}}))),c=r(null);return(y,e)=>(s(),w(E,{code:p(I)},{title:o(()=>[...e[2]||(e[2]=[t("span",{class:"example-title example-title--group-6"},"Photo Gallery",-1)])]),description:o(()=>[g(" A high-performance grid gallery displaying "+u(m.value.toLocaleString())+" photos. Features lazy-loading placeholders and a lightbox. ",1)]),icon:o(()=>[...e[3]||(e[3]=[t("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-6"},[t("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"})],-1)])]),subtitle:o(()=>[...e[4]||(e[4]=[g(" Lazy-loaded image grid with row-based virtualization ",-1)])]),controls:o(()=>[f(U,{"scroll-details":c.value},null,8,["scroll-details"])]),"example-controls":o(()=>[t("div",B,[t("div",M,[t("span",L,[e[5]||(e[5]=t("span",{class:"text-xs font-bold opacity-50 small-caps tracking-wider"},"Grid Columns",-1)),t("span",G,u(n.value),1)]),P(t("input",{"onUpdate:modelValue":e[0]||(e[0]=l=>n.value=l),type:"range",min:"1",max:"8",step:"1",class:"range range-xs range-primary w-48","aria-label":"Grid Columns"},null,512),[[C,n.value,void 0,{number:!0}]])])])]),default:o(()=>[f(p($),{class:"example-container p-4",items:v.value,gap:16,debug:p(h),onScroll:e[1]||(e[1]=l=>c.value=l)},{item:o(({index:l,item:i})=>[(s(),d("div",{key:`r_${l}`,class:"grid gap-4 w-full",style:T({gridTemplateColumns:`repeat(${n.value}, 1fr)`})},[(s(!0),d(z,null,_(i,(a,x)=>(s(),d("div",{key:`r_${l}_c_${x}`,class:"rounded-box overflow-hidden relative outline-none border border-base-content/5 focus-visible:ring-2 focus-visible:ring-primary transition-transform active:scale-95 group aspect-square bg-base-200"},[t("img",{src:a.thumb,alt:`Photo by ${a.author}`,class:"size-full object-cover transition-transform duration-500 group-hover:scale-110",loading:"lazy"},null,8,R),t("div",Z,[t("span",F,u(a.author),1)])]))),128))],4))]),_:1},8,["items","debug"])]),_:1},8,["code"]))}}),N=Object.freeze(Object.defineProperty({__proto__:null,default:H},Symbol.toStringTag,{value:"Module"})),ne={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:j}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:V}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:D}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-gallery/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:N}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:k}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/pattern-gallery/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Photo Gallery | Virtual Scroll"}}};export{ne as configValuesSerialized};
