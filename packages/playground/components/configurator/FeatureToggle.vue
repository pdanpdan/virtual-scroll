<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean;
  label: string;
  description?: string;
}>(), {
  description: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function toggle() {
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <label
    class="flex items-start gap-3 cursor-pointer select-none rounded-box px-2 py-1 -mx-2 transition-colors hover:bg-base-content/5"
  >
    <input
      type="checkbox"
      class="checkbox checkbox-primary checkbox-sm mt-0.5"
      :checked="modelValue"
      @change="toggle"
    />
    <span class="flex flex-col gap-0.5">
      <span class="text-sm font-semibold">{{ label }}</span>
      <span v-if="description" class="text-xs opacity-60">{{ description }}</span>
    </span>
  </label>
</template>
