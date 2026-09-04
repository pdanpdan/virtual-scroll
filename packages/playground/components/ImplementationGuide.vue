<script setup lang="ts">
withDefaults(defineProps<{
  /** Section title, rendered as an anchored header. */
  title?: string;
}>(), {
  title: 'How to build a feature like this',
});
</script>

<template>
  <section id="implementation-guide" class="app-card overflow-hidden">
    <div class="card-body items-stretch gap-0 p-4 @4xl:p-8">
      <h2 class="docs-section-header">
        <a href="#implementation-guide" aria-label="Link to Implementation guide section">{{ title }}</a>
      </h2>
      <div class="guide-body">
        <slot />
      </div>
    </div>
  </section>
</template>

<style scoped>
.guide-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-block-start: 0.75rem;
}

/* Small-caps step headings, primary-tinted to match the site's docs styling. */
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
  max-width: 56rem;
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
  list-style-type: square;
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

/* Inline code: distinguish it from surrounding prose. */
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

@media (width >= 64rem) {
  .guide-body {
    gap: 1rem;
  }

  :deep(h3) {
    font-size: 0.9375rem;
  }

  :deep(p),
  :deep(ul),
  :deep(ol) {
    font-size: 1rem;
  }
}
</style>
