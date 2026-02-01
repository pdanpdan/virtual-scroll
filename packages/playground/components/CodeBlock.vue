<script setup lang="ts">
interface Props {
  code?: string;
  lang?: string;
  lineNumbers?: boolean;
}

withDefaults(defineProps<Props>(), {
  code: '',
  lang: 'vue',
  lineNumbers: false,
});
</script>

<template>
  <div
    class="code-block text-sm overflow-auto"
    :class="{ 'has-line-numbers': lineNumbers, 'is-bash': lang === 'bash' }"
    data-theme="dark"
  >
    <div class="shiki-container" v-html="code" />
  </div>
</template>

<style scoped>
.code-block {
  :deep(pre.shiki) {
    margin: 0;
    padding: 0.75rem 0;
    background-color: transparent !important;
    display: block;
    min-inline-size: max-content;
    line-height: 1.4;

    code {
      display: block;
      counter-reset: line;
      padding: 0;
    }

    .line {
      display: flex;
      padding: 0 1rem;

      & + .line {
        margin-block-start: -1.3em
      }
    }
  }

  &.is-bash :deep(pre.shiki) .line::before {
    content: "$";
    width: 1rem;
    flex-shrink: 0;
    margin-inline-end: 0.5rem;
    opacity: 0.5;
    text-align: end;
    user-select: none;
  }

  &.has-line-numbers :deep(pre.shiki) .line::before {
    counter-increment: line;
    content: counter(line);
    width: 1rem;
    flex-shrink: 0;
    margin-inline-end: 1rem;
    opacity: 0.3;
    text-align: end;
    user-select: none;
  }
}
</style>
