<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean;
  label: string;
  description?: string;
  disabled?: boolean;
  hint?: string;
}>(), {
  description: '',
  disabled: false,
  hint: '',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

function toggle() {
  if (props.disabled) {
    return;
  }
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <label
    class="flex items-start gap-3 cursor-pointer select-none rounded-box px-2 py-1 -mx-2 transition-colors"
    :class="[disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-base-content/5']"
  >
    <input
      type="checkbox"
      class="checkbox checkbox-primary checkbox-sm mt-0.5"
      :checked="modelValue"
      :disabled="disabled"
      @change="toggle"
    />
    <span class="flex flex-col gap-0.5">
      <span class="text-sm font-semibold">{{ label }}</span>
      <span v-if="description" class="text-xs opacity-60">{{ description }}</span>
      <span v-if="hint" class="text-[10px] font-bold small-caps tracking-widest text-info opacity-80">{{ hint }}</span>
    </span>
  </label>
</template>
