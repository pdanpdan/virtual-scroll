<script setup lang="ts">
import type { Post } from './post-feed';

import { computed, onUnmounted, shallowRef, watch } from 'vue';

import { loadPost } from './post-feed';

const props = withDefaults(defineProps<{
  /** Row id - the only data the component receives. */
  id: number;
  latencyMin?: number;
  latencyMax?: number;
  /** Bumped by the page when the shared cache is cleared, refetching visible rows. */
  version?: number;
}>(), {
  latencyMin: 120,
  latencyMax: 800,
  version: 0,
});

const post = shallowRef<Post | null>(null);
let alive = true;

watch(
  () => [ props.id, props.latencyMin, props.latencyMax, props.version ] as const,
  async () => {
    // SSR renders skeletons only: the simulated fetch must never run (or be
    // scheduled) on the server, or the shared feed stats would make the
    // server-rendered status line depend on previous requests.
    if (typeof window === 'undefined') {
      return;
    }
    post.value = null;
    const result = await loadPost(props.id, props.latencyMin, props.latencyMax);
    if (alive) {
      post.value = result;
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  alive = false;
});

const avatarStyle = computed(() => {
  const hue = post.value?.hue ?? 0;
  return { backgroundColor: `hsl(${ hue } 60% 45%)` };
});

const timeLabel = computed(() => {
  const minutes = post.value?.minutesAgo ?? 1;
  if (minutes < 60) {
    return `${ minutes }m ago`;
  }
  return `${ Math.floor(minutes / 60) }h ago`;
});
</script>

<template>
  <div class="px-4 py-3 min-h-16">
    <div v-if="post" class="flex gap-3">
      <div
        class="size-9 shrink-0 rounded-full grid place-items-center text-white text-xs font-bold"
        :style="avatarStyle"
      >
        {{ post.initials }}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline gap-2 text-xs">
          <span class="font-bold">{{ post.author }}</span>
          <span class="opacity-40">{{ timeLabel }}</span>
        </div>
        <p class="font-semibold text-sm mt-0.5 leading-snug">{{ post.title }}</p>
        <p class="text-xs leading-relaxed opacity-70 mt-1">{{ post.excerpt }}</p>
      </div>
    </div>

    <div v-else class="flex gap-3 animate-pulse" role="status" aria-label="Loading post">
      <div class="size-9 shrink-0 rounded-full bg-base-content/10" />
      <div class="flex-1 space-y-2 py-0.5">
        <div class="h-3 w-32 rounded bg-base-content/10" />
        <div class="h-3 w-3/4 rounded bg-base-content/10" />
        <div class="h-3 w-2/3 rounded bg-base-content/10" />
      </div>
    </div>
  </div>
</template>
