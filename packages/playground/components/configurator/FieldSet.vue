<script setup lang="ts">
withDefaults(defineProps<{
  title: string;
  description?: string;
  badge?: string;
}>(), {
  description: '',
  badge: '',
});
</script>

<template>
  <section class="card bg-base-200/80 border border-base-content/10 shadow-sm">
    <div class="card-body p-4 gap-3">
      <div class="flex items-center gap-2">
        <h2 class="font-black small-caps tracking-widest text-sm opacity-90">{{ title }}</h2>
        <div class="grow" />
        <span v-if="badge" class="badge badge-soft badge-primary badge-sm">{{ badge }}</span>
      </div>
      <p v-if="description" class="text-xs opacity-60 leading-relaxed">{{ description }}</p>
      <div class="divider my-0 opacity-60" />
      <slot />
    </div>
  </section>
</template>
