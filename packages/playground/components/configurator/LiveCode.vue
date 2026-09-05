<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const props = withDefaults(defineProps<{
  source: string;
  lang?: string;
  lineNumbers?: boolean;
}>(), {
  lang: 'vue',
  lineNumbers: false,
});

const html = ref('');
const failed = ref(false);

type ShikiHighlighter = Awaited<ReturnType<typeof import('shiki').createHighlighter>>;
let highlighterPromise: Promise<ShikiHighlighter> | null = null;

async function update() {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const { createCssVariablesTheme, createHighlighter } = await import('shiki');
    let promise = highlighterPromise;
    if (promise === null) {
      promise = createHighlighter({
        themes: [
          createCssVariablesTheme({
            name: 'css-variables',
            variablePrefix: '--shiki-',
            variableDefaults: {},
          }),
        ],
        langs: [ 'vue', 'ts', 'js', 'html', 'css' ],
      });
      highlighterPromise = promise;
    }
    const highlighter = await promise;
    html.value = highlighter.codeToHtml(props.source, {
      lang: props.lang,
      theme: 'css-variables',
    });
    failed.value = false;
  } catch {
    failed.value = true;
  }
}

onMounted(update);
watch(() => props.source, update);
</script>

<template>
  <div
    class="code-block text-sm overflow-auto"
    :class="{ 'has-line-numbers': lineNumbers }"
    data-theme="dark"
  >
    <div v-if="html" class="shiki-container" v-html="html" />
    <pre v-else-if="failed" class="plain-code">{{ source }}</pre>
    <div v-else class="p-4 opacity-50 text-xs">Highlighting…</div>
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
        margin-block-start: -1.3em;
      }
    }
  }

  /* Empty source lines (no line-number gutter) collapse to zero height
     because .line is a flex container with no flex items. Give them an nbsp
     placeholder so blank lines keep their full line height. */
  &:not(.has-line-numbers) :deep(pre.shiki) .line:empty::before {
    content: '\00a0';
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

  .plain-code {
    margin: 0;
    padding: 0.75rem 1rem;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8125rem;
    white-space: pre;
  }
}
</style>
