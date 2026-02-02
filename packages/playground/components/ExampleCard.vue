<script setup lang="ts">
import { computed } from 'vue';

import AppLink from './AppLink.vue';

const props = defineProps<{
  type: string;
  title: string;
  description: string;
  href: string;
  group?: '1' | '2' | '3' | '4' | '5' | '6' | '7';
  rel?: string;
}>();

const cardClass = computed(() => props.group ? `example-card--group-${ props.group }` : '');

const titleTypeClass = computed(() => props.group ? `example-card-title-type--group-${ props.group }` : '');

const map: Record<string, string> = {
  1: 'btn-primary',
  2: 'btn-secondary',
  3: 'btn-accent',
  4: 'btn-info',
  5: 'btn-warning',
  6: 'btn-success',
  7: 'btn-error',
};

const buttonClass = computed(() => map[ props.group || '' ] || '');
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
            :data-vike="rel === 'external' ? 'false' : undefined"
          >
            View Example
          </a>
        </AppLink>
      </div>
    </div>
  </div>
</template>
