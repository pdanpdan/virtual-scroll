<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  /** Highlighted HTML (shiki output) to display. */
  code?: string;
  lang?: string;
  lineNumbers?: boolean;
  /** Show a copy button that copies the visible code text. */
  copyable?: boolean;
}

withDefaults(defineProps<Props>(), {
  code: '',
  lang: 'vue',
  lineNumbers: false,
  copyable: false,
});

const shellRef = ref<HTMLElement | null>(null);
const copied = ref(false);

/**
 * Reconstruct the plain source from the rendered highlighted lines so the
 * copy text matches what the user sees (gutter numbers are CSS, not copied).
 */
async function copyCode() {
  const shell = shellRef.value;
  if (!shell || typeof navigator === 'undefined') {
    return;
  }
  const lines = [ ...shell.querySelectorAll('.shiki-container .line') ];
  const text = lines.length > 0
    ? lines.map((line) => (line.textContent ?? '')).join('\n').replace(/\n$/, '')
    : (shell.textContent ?? '');
  try {
    await navigator.clipboard.writeText(text);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // Clipboard may be unavailable (insecure context); nothing to do.
  }
}
</script>

<template>
  <div
    v-if="copyable"
    ref="shellRef"
    class="code-block code-block--copyable"
    :class="{ 'has-line-numbers': lineNumbers, 'is-bash': lang === 'bash' }"
    data-theme="dark"
  >
    <div class="code-block-toolbar">
      <button type="button" class="code-copy" @click="copyCode">
        <svg
          v-if="!copied"
          class="code-copy-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg
          v-else
          class="code-copy-icon text-success"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="m4.5 12.75 6 6 9-13.5" />
        </svg>
        <span>{{ copied ? 'Copied!' : 'Copy' }}</span>
      </button>
    </div>
    <div class="code-block-scroll">
      <div class="shiki-container" v-html="code" />
    </div>
  </div>

  <div
    v-else
    ref="shellRef"
    class="code-block"
    :class="{ 'has-line-numbers': lineNumbers, 'is-bash': lang === 'bash' }"
    data-theme="dark"
  >
    <div class="shiki-container" v-html="code" />
  </div>
</template>

<style scoped>
.code-block {
  text-align: start;
}

.code-block--copyable {
  display: flex;
  flex-direction: column;
}

.code-block-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 0.25rem 0.5rem 0;
}

.code-copy {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.5rem;
  border: 0;
  border-radius: var(--radius-selector, 0.25rem);
  background: transparent;
  color: var(--color-base-content, currentColor);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-variant: small-caps;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.15s ease, background-color 0.15s ease;

  &:hover {
    opacity: 1;
    background: color-mix(in oklab, var(--color-base-content) 10%, transparent);
  }
}

.code-copy-icon {
  width: 0.875rem;
  height: 0.875rem;
  flex: none;
}

.code-block-scroll {
  overflow: auto;
  min-block-size: 0;
}

.code-block {
  .code-block-scroll {
    :deep(pre.shiki) {
      margin: 0;
      padding: 0.25rem 0 0.75rem;
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

    &.is-bash :deep(pre.shiki) .line::before {
      content: '$';
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
}
</style>
