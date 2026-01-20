<script setup lang="ts">
import { computed } from 'vue';

import { navigateWithTransition } from '#/navigate';

import AppLink from './AppLink.vue';

const props = defineProps<{
  type: string;
  title: string;
  description: string;
  href: string;
  group?: '1' | '2' | '3' | '4' | '5' | '6' | '7';
  rel?: string;
}>();

const cardClass = computed(() => {
  switch (props.group) {
    case '1': return 'example-card--group-1';
    case '2': return 'example-card--group-2';
    case '3': return 'example-card--group-3';
    case '4': return 'example-card--group-4';
    case '5': return 'example-card--group-5';
    case '6': return 'example-card--group-6';
    case '7': return 'example-card--group-7';
    default: return '';
  }
});

const titleTypeClass = computed(() => {
  switch (props.group) {
    case '1': return 'example-card-title-type--group-1';
    case '2': return 'example-card-title-type--group-2';
    case '3': return 'example-card-title-type--group-3';
    case '4': return 'example-card-title-type--group-4';
    case '5': return 'example-card-title-type--group-5';
    case '6': return 'example-card-title-type--group-6';
    case '7': return 'example-card-title-type--group-7';
    default: return '';
  }
});

const buttonClass = computed(() => {
  switch (props.group) {
    case '1': return 'btn-primary';
    case '2': return 'btn-secondary';
    case '3': return 'btn-accent';
    case '4': return 'btn-info';
    case '5': return 'btn-warning';
    case '6': return 'btn-success';
    case '7': return 'btn-error';
    default: return '';
  }
});
</script>

<template>
  <div class="card example-card" :class="cardClass">
    <div class="card-body p-5">
      <div class="example-card-title-type" :class="titleTypeClass">{{ type }}</div>
      <h3 class="card-title mt-0 text-base md:text-lg">{{ title }}</h3>
      <p class="text-sm opacity-90">{{ description }}</p>
      <div class="card-actions justify-end mt-2">
        <AppLink v-slot="{ href: appHref }" :href="href">
          <a
            :href="appHref"
            class="btn btn-soft"
            :class="buttonClass"
            :rel="rel"
            data-vike="false"
            @click.prevent="navigateWithTransition(appHref, 'forward')"
          >
            View Example
          </a>
        </AppLink>
      </div>
    </div>
  </div>
</template>
