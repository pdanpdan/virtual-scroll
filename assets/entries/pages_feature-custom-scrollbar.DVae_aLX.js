import{d as j,l as B,w as a,u as C,m as M,p as n,o as i,b as z,s as P,q as $,a as l,c as d,F as I,r as L,t as V,y as m,e as W,z as o,A as k,B as D,C as p,j as F,v as N,i as H,f as O,g as q,h as _}from"../chunks/chunk-BDlHe8BJ.js";import{V as J}from"../chunks/chunk-CY8_agoq.js";import{_ as K,a as Q}from"../chunks/chunk-C1op8fmR.js";import"../chunks/chunk-Dyt2pcpr.js";/* empty css                      */import"../chunks/chunk-DQ-vRhDx.js";/* empty css                      *//* empty css                      */import"../chunks/chunk-DFre3zYq.js";import"../chunks/chunk-DR3HwT-S.js";/* empty css                      */const X=`<script setup lang="ts">
import type { ScrollDetails } from '@pdanpdan/virtual-scroll';
import type { Ref } from 'vue';

import { VirtualScroll } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import ExampleContainer from '#/components/ExampleContainer.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';

import rawCode from './+Page.vue?raw';

const rowCount = ref(1000000);
const columnCount = ref(1000);
const itemSize = ref(50);
const columnWidth = ref(150);
const gap = ref(0);
const columnGap = ref(0);
const scrollbarCrossGap = ref(8);
const virtualScrollbars = ref(false);
const useCustomSlot = ref(false);

const items = computed(() => Array.from({ length: rowCount.value }, (_, i) => ({
  id: i,
  text: \`Row \${ i }\`,
})));

const scrollDetails = ref<ScrollDetails | null>(null);
const debugMode = inject<Ref<boolean>>('debugMode', ref(false));

function onScroll(details: ScrollDetails) {
  scrollDetails.value = details;
}
<\/script>

<template>
  <ExampleContainer :code="rawCode">
    <template #title>
      <span class="example-title example-title--group-5">Custom Scrollbar</span>
    </template>

    <template #description>
      Demonstrates the virtual scrollbar implementation in a grid layout. The scrollbars are rendered as children of the virtual scroll container and are fully customizable.
      Virtual scrollbars are automatically used for massive content, but can also be forced for smaller lists to maintain consistent cross-browser styling.
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
        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
      </svg>
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="both" />
    </template>

    <template #example-controls>
      <div class="flex flex-wrap gap-4 items-center">
        <label class="settings-item group">
          <span class="settings-label pe-4">Force Virtual Scrollbars</span>
          <input v-model="virtualScrollbars" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="settings-item group">
          <span class="settings-label pe-4">Show Custom Scrollbars</span>
          <input v-model="useCustomSlot" type="checkbox" class="toggle toggle-primary toggle-sm" />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Rows</span>
          <select v-model="rowCount" class="select select-bordered select-sm w-24" aria-label="Row count">
            <option :value="10">10</option>
            <option :value="100">100</option>
            <option :value="1000">1,000</option>
            <option :value="10000">10,000</option>
            <option :value="100000">100,000</option>
            <option :value="1000000">1,000,000</option>
          </select>
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Cols</span>
          <select v-model="columnCount" class="select select-bordered select-sm w-24" aria-label="Column count">
            <option :value="10">10</option>
            <option :value="100">100</option>
            <option :value="1000">1,000</option>
            <option :value="10000">10,000</option>
            <option :value="100000">100,000</option>
            <option :value="1000000">1,000,000</option>
          </select>
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Item H</span>
          <input
            v-model.number="itemSize"
            type="number"
            min="10"
            max="200"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Item W</span>
          <input
            v-model.number="columnWidth"
            type="number"
            min="50"
            max="500"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Row Gap</span>
          <input
            v-model.number="gap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50">Col Gap</span>
          <input
            v-model.number="columnGap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>

        <label class="floating-label p-0">
          <span class="text-xs font-bold small-caps text-base-content/50" title="Scrollbar cross gap">SB Gap</span>
          <input
            v-model.number="scrollbarCrossGap"
            type="number"
            min="0"
            max="50"
            class="input input-bordered input-sm w-20"
          />
        </label>
      </div>
    </template>

    <VirtualScroll
      :debug="debugMode"
      class="example-container"
      :items="items"
      :item-size="itemSize"
      direction="both"
      :column-count="columnCount"
      :column-width="columnWidth"
      :gap="gap"
      :column-gap="columnGap"
      :virtual-scrollbar="virtualScrollbars"
      :style="{
        '--vs-scrollbar-has-cross-gap': 1,
        '--vs-scrollbar-cross-gap': \`\${ scrollbarCrossGap }px\`,
      }"
      @scroll="onScroll"
    >
      <template #item="{ index, columnRange, getColumnWidth, columnGap: slotColumnGap }">
        <div class="example-grid-row">
          <div
            v-for="colIndex in Array.from({ length: columnRange.end - columnRange.start }, (_, i) => columnRange.start + i)"
            :key="colIndex"
            class="example-grid-cell border-e border-b"
            :style="{
              width: \`\${ getColumnWidth(colIndex) }px\`,
              marginInlineStart: colIndex > 0 ? \`\${ slotColumnGap }px\` : 0,
            }"
          >
            <span class="example-badge">#{{ index }},{{ colIndex }}</span>
          </div>
        </div>
      </template>

      <template v-if="useCustomSlot" #scrollbar="{ trackProps, thumbProps, scrollbarProps: { axis } }">
        <div
          v-if="axis === 'vertical'"
          v-bind="trackProps"
          class="w-4 bg-primary/25 end-0 rounded-e-none rounded-s-xl overflow-clip"
        >
          <div
            v-bind="thumbProps"
            class="bg-primary/60 hover:bg-primary/90 transition-colors rounded-sm"
          />
        </div>
        <div
          v-else-if="axis === 'horizontal'"
          v-bind="trackProps"
          class="h-4 bg-secondary/25 bottom-0 rounded-b-none rounded-t-xl overflow-clip"
        >
          <div
            v-bind="thumbProps"
            class="bg-secondary/60 hover:bg-secondary/90 transition-colors rounded-sm"
          />
        </div>
      </template>
    </VirtualScroll>
  </ExampleContainer>
</template>
`,Y={class:"flex flex-wrap gap-4 items-center"},Z={class:"settings-item group"},ee={class:"settings-item group"},le={class:"floating-label p-0"},te={class:"floating-label p-0"},ne={class:"floating-label p-0"},oe={class:"floating-label p-0"},ae={class:"floating-label p-0"},se={class:"floating-label p-0"},re={class:"floating-label p-0"},ie={class:"example-grid-row"},pe={class:"example-badge"},ue=j({__name:"+Page",setup(me){const c=n(1e6),b=n(1e3),v=n(50),g=n(150),f=n(0),x=n(0),y=n(8),S=n(!1),w=n(!1),U=N(()=>Array.from({length:c.value},(h,e)=>({id:e,text:`Row ${e}`}))),T=n(null),A=M("debugMode",n(!1));function G(h){T.value=h}return(h,e)=>(i(),B(K,{code:C(X)},{title:a(()=>[...e[9]||(e[9]=[l("span",{class:"example-title example-title--group-5"},"Custom Scrollbar",-1)])]),description:a(()=>[...e[10]||(e[10]=[F(" Demonstrates the virtual scrollbar implementation in a grid layout. The scrollbars are rendered as children of the virtual scroll container and are fully customizable. Virtual scrollbars are automatically used for massive content, but can also be forced for smaller lists to maintain consistent cross-browser styling. ",-1)])]),icon:a(()=>[...e[11]||(e[11]=[l("svg",{xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24","stroke-width":"1.5",stroke:"currentColor",class:"example-icon example-icon--group-5"},[l("path",{"stroke-linecap":"round","stroke-linejoin":"round",d:"M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"})],-1)])]),controls:a(()=>[z(Q,{"scroll-details":T.value,direction:"both"},null,8,["scroll-details"])]),"example-controls":a(()=>[l("div",Y,[l("label",Z,[e[12]||(e[12]=l("span",{class:"settings-label pe-4"},"Force Virtual Scrollbars",-1)),o(l("input",{"onUpdate:modelValue":e[0]||(e[0]=t=>S.value=t),type:"checkbox",class:"toggle toggle-primary toggle-sm"},null,512),[[k,S.value]])]),l("label",ee,[e[13]||(e[13]=l("span",{class:"settings-label pe-4"},"Show Custom Scrollbars",-1)),o(l("input",{"onUpdate:modelValue":e[1]||(e[1]=t=>w.value=t),type:"checkbox",class:"toggle toggle-primary toggle-sm"},null,512),[[k,w.value]])]),l("label",le,[e[15]||(e[15]=l("span",{class:"text-xs font-bold small-caps text-base-content/50"},"Rows",-1)),o(l("select",{"onUpdate:modelValue":e[2]||(e[2]=t=>c.value=t),class:"select select-bordered select-sm w-24","aria-label":"Row count"},[...e[14]||(e[14]=[l("option",{value:10},"10",-1),l("option",{value:100},"100",-1),l("option",{value:1e3},"1,000",-1),l("option",{value:1e4},"10,000",-1),l("option",{value:1e5},"100,000",-1),l("option",{value:1e6},"1,000,000",-1)])],512),[[D,c.value]])]),l("label",te,[e[17]||(e[17]=l("span",{class:"text-xs font-bold small-caps text-base-content/50"},"Cols",-1)),o(l("select",{"onUpdate:modelValue":e[3]||(e[3]=t=>b.value=t),class:"select select-bordered select-sm w-24","aria-label":"Column count"},[...e[16]||(e[16]=[l("option",{value:10},"10",-1),l("option",{value:100},"100",-1),l("option",{value:1e3},"1,000",-1),l("option",{value:1e4},"10,000",-1),l("option",{value:1e5},"100,000",-1),l("option",{value:1e6},"1,000,000",-1)])],512),[[D,b.value]])]),l("label",ne,[e[18]||(e[18]=l("span",{class:"text-xs font-bold small-caps text-base-content/50"},"Item H",-1)),o(l("input",{"onUpdate:modelValue":e[4]||(e[4]=t=>v.value=t),type:"number",min:"10",max:"200",class:"input input-bordered input-sm w-20"},null,512),[[p,v.value,void 0,{number:!0}]])]),l("label",oe,[e[19]||(e[19]=l("span",{class:"text-xs font-bold small-caps text-base-content/50"},"Item W",-1)),o(l("input",{"onUpdate:modelValue":e[5]||(e[5]=t=>g.value=t),type:"number",min:"50",max:"500",class:"input input-bordered input-sm w-20"},null,512),[[p,g.value,void 0,{number:!0}]])]),l("label",ae,[e[20]||(e[20]=l("span",{class:"text-xs font-bold small-caps text-base-content/50"},"Row Gap",-1)),o(l("input",{"onUpdate:modelValue":e[6]||(e[6]=t=>f.value=t),type:"number",min:"0",max:"50",class:"input input-bordered input-sm w-20"},null,512),[[p,f.value,void 0,{number:!0}]])]),l("label",se,[e[21]||(e[21]=l("span",{class:"text-xs font-bold small-caps text-base-content/50"},"Col Gap",-1)),o(l("input",{"onUpdate:modelValue":e[7]||(e[7]=t=>x.value=t),type:"number",min:"0",max:"50",class:"input input-bordered input-sm w-20"},null,512),[[p,x.value,void 0,{number:!0}]])]),l("label",re,[e[22]||(e[22]=l("span",{class:"text-xs font-bold small-caps text-base-content/50",title:"Scrollbar cross gap"},"SB Gap",-1)),o(l("input",{"onUpdate:modelValue":e[8]||(e[8]=t=>y.value=t),type:"number",min:"0",max:"50",class:"input input-bordered input-sm w-20"},null,512),[[p,y.value,void 0,{number:!0}]])])])]),default:a(()=>[z(C(J),{debug:C(A),class:"example-container",items:U.value,"item-size":v.value,direction:"both","column-count":b.value,"column-width":g.value,gap:f.value,"column-gap":x.value,"virtual-scrollbar":S.value,style:P({"--vs-scrollbar-has-cross-gap":1,"--vs-scrollbar-cross-gap":`${y.value}px`}),onScroll:G},$({item:a(({index:t,columnRange:s,getColumnWidth:u,columnGap:E})=>[l("div",ie,[(i(!0),d(I,null,L(Array.from({length:s.end-s.start},(r,R)=>s.start+R),r=>(i(),d("div",{key:r,class:"example-grid-cell border-e border-b",style:P({width:`${u(r)}px`,marginInlineStart:r>0?`${E}px`:0})},[l("span",pe,"#"+V(t)+","+V(r),1)],4))),128))])]),_:2},[w.value?{name:"scrollbar",fn:a(({trackProps:t,thumbProps:s,scrollbarProps:{axis:u}})=>[u==="vertical"?(i(),d("div",m({key:0},t,{class:"w-4 bg-primary/25 end-0 rounded-e-none rounded-s-xl overflow-clip"}),[l("div",m(s,{class:"bg-primary/60 hover:bg-primary/90 transition-colors rounded-sm"}),null,16)],16)):u==="horizontal"?(i(),d("div",m({key:1},t,{class:"h-4 bg-secondary/25 bottom-0 rounded-b-none rounded-t-xl overflow-clip"}),[l("div",m(s,{class:"bg-secondary/60 hover:bg-secondary/90 transition-colors rounded-sm"}),null,16)],16)):W("v-if",!0)]),key:"0"}:void 0]),1032,["debug","items","item-size","column-count","column-width","gap","column-gap","virtual-scrollbar","style"])]),_:1},8,["code"]))}}),de=Object.freeze(Object.defineProperty({__proto__:null,default:ue},Symbol.toStringTag,{value:"Module"})),Te={hasServerOnlyHook:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!1}},isClientRuntimeLoaded:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:!0}},onBeforeRenderEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},dataEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},guardEnv:{type:"computed",definedAtData:null,valueSerialized:{type:"js-serialized",value:null}},onRenderClient:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onRenderClient.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:_}},onPageTransitionStart:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionStart.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:q}},onPageTransitionEnd:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/+onPageTransitionEnd.ts",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:O}},Page:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-custom-scrollbar/+Page.vue",fileExportPathToShowToUser:[]},valueSerialized:{type:"plus-file",exportValues:de}},hydrationCanBeAborted:{type:"standard",definedAtData:{filePathToShowToUser:"vike-vue/config",fileExportPathToShowToUser:["default","hydrationCanBeAborted"]},valueSerialized:{type:"js-serialized",value:!0}},Layout:{type:"cumulative",definedAtData:[{filePathToShowToUser:"/pages/+Layout.vue",fileExportPathToShowToUser:[]}],valueSerialized:[{type:"plus-file",exportValues:H}]},title:{type:"standard",definedAtData:{filePathToShowToUser:"/pages/feature-custom-scrollbar/+config.ts",fileExportPathToShowToUser:["default","title"]},valueSerialized:{type:"js-serialized",value:"Custom Scrollbar | Virtual Scroll"}}};export{Te as configValuesSerialized};
