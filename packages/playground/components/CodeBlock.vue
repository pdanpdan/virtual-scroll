<script setup lang="ts">
import type { Highlighter } from 'shikiji';

import { computed, onMounted, onServerPrefetch, ref, watch } from 'vue';

interface Props {
  code?: string;
  lang?: string;
  lineNumbers?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  code: '',
  lang: 'vue',
  lineNumbers: false,
});

const highlightedCode = ref('');
let highlighterInstance: Highlighter | null = null;

async function getHighlighter() {
  if (highlighterInstance) {
    return highlighterInstance;
  }
  const { getHighlighter } = await import('shikiji/bundle/full');
  const { createCssVariablesTheme } = await import('shikiji/theme-css-variables');
  highlighterInstance = await getHighlighter({
    themes: [
      createCssVariablesTheme({
        name: 'css-variables',
        variablePrefix: '--shiki-',
        variableDefaults: {},
      }),
    ],
    langs: [ 'vue', 'bash', 'ts', 'js', 'python', 'cpp' ],
  });
  return highlighterInstance;
}

function dedent(str: string) {
  if (!str) {
    return '';
  }
  const lines = str.split('\n');
  while (lines.length > 0 && lines[ 0 ].trim() === '') {
    lines.shift();
  }
  while (lines.length > 0 && lines[ lines.length - 1 ].trim() === '') {
    lines.pop();
  }
  if (lines.length === 0) {
    return '';
  }
  const minIndent = lines.reduce((min, line) => {
    if (line.trim() === '') {
      return min;
    }
    const indent = line.match(/^\\s*/)?.[ 0 ].length ?? 0;
    return Math.min(min, indent);
  }, Infinity);
  return lines.map((line) => line.slice(minIndent === Infinity ? 0 : minIndent)).join('\n');
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const displayHtml = computed(() => {
  if (highlightedCode.value) {
    return highlightedCode.value;
  }
  // This fallback structure must match the tag structure of Shikiji's output
  // to avoid hydration mismatch (Shikiji returns a <pre> tag).
  return `<pre class="shiki px-6 py-3"><code>${ escapeHtml(dedent(props.code)) }</code></pre>`;
});

async function highlight() {
  const codeToHighlight = dedent(props.code);
  if (!codeToHighlight) {
    highlightedCode.value = '';
    return;
  }
  try {
    const highlighter = await getHighlighter();
    highlightedCode.value = highlighter.codeToHtml(codeToHighlight, {
      lang: props.lang,
      theme: 'css-variables',
    });
  } catch (err) {
    console.error('Shikiji highlighting failed:', err);
    highlightedCode.value = `<pre class="shiki px-6 py-3"><code>${ escapeHtml(codeToHighlight) }</code></pre>`;
  }
}

onServerPrefetch(highlight);
onMounted(() => {
  if (!highlightedCode.value) {
    highlight();
  }
});
watch(() => props.code, highlight);
</script>

<template>
  <div
    class="code-block text-sm overflow-auto"
    :class="{ 'has-line-numbers': lineNumbers, 'is-bash': lang === 'bash' }"
    data-theme="dark"
  >
    <div class="shiki-container" v-html="displayHtml" />
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
    margin-right: 0.5rem;
    opacity: 0.5;
    text-align: right;
    user-select: none;
  }

  &.has-line-numbers :deep(pre.shiki) .line::before {
    counter-increment: line;
    content: counter(line);
    width: 1rem;
    flex-shrink: 0;
    margin-right: 1rem;
    opacity: 0.3;
    text-align: right;
    user-select: none;
  }
}
</style>
