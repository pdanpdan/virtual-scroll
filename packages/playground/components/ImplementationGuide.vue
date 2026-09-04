<script setup lang="ts">
withDefaults(defineProps<{
  /** Section title, rendered as the collapsible summary header. */
  title?: string;
}>(), {
  title: 'How to build a feature like this',
});
</script>

<template>
  <!-- Native <details>: collapsed by default (keeps the example readable), fully
       openable/closeable without JS. The id lets the example header's "Details"
       button find, expand and scroll to it. -->
  <details id="implementation-guide" class="app-card overflow-hidden">
    <summary class="guide-summary">
      <h2 class="docs-section-header">
        {{ title }}
      </h2>
      <svg
        class="guide-chevron"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z" clip-rule="evenodd" />
      </svg>
    </summary>
    <div class="guide-body">
      <slot />
    </div>
  </details>
</template>

<style scoped>
.guide-summary {
  /* The whole summary row is the toggle; hide the native disclosure marker. */
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
  padding: 1rem;

  &::-webkit-details-marker {
    display: none;
  }

  .docs-section-header {
    margin: 0;
  }
}

.guide-chevron {
  width: 1.25rem;
  height: 1.25rem;
  flex: none;
  color: var(--color-base-content);
  opacity: 0.6;
  transition: transform 0.18s ease;
}

details[open] .guide-chevron {
  transform: rotate(180deg);
}

/* Author display rules on .guide-body would override the UA's default hiding,
   so collapse the body explicitly when the details element is closed. */
details:not([open]) .guide-body {
  display: none;
}

@media (width >= 64rem) {
  .guide-summary {
    padding: 1.25rem 1.5rem;
  }
}

/* Re-apply the previous body layout once expanded. */
.guide-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 1rem 1rem;

  @media (width >= 64rem) {
    gap: 1rem;
    padding: 0 1.5rem 1.5rem;
  }
}

:deep(h3) {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  font-variant: small-caps;
  color: var(--color-primary);

  &:not(:first-child) {
    margin-block-start: 0.75rem;
  }
}

:deep(p),
:deep(ul),
:deep(ol) {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.7;
  color: color-mix(in oklab, var(--color-base-content) 85%, transparent);
}

:deep(ul),
:deep(ol) {
  padding-inline-start: 1.25rem;
}

:deep(li) {
  margin-block-end: 0.25rem;
}

:deep(strong) {
  font-weight: 700;
  color: var(--color-base-content);
}

:deep(a) {
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
}

:deep(:not(pre) > code) {
  padding: 0.125rem 0.375rem;
  border: 1px solid color-mix(in oklab, var(--color-base-content) 10%, transparent);
  border-radius: var(--radius-selector);
  background: var(--color-base-200);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
  font-size: 0.9em;
  color: var(--color-base-content);
  overflow-wrap: anywhere;
}
</style>
