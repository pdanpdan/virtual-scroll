<script lang="ts" setup>
import { usePageContext } from 'vike-vue/usePageContext';
import { computed } from 'vue';

import { matchHref, normalizeHref } from '#/navigate';

const { href } = defineProps<{
  href: string;
}>();

const pageContext = usePageContext();

const normalizedHref = computed(() => normalizeHref(href));

const active = computed(() => {
  const { urlPathname } = pageContext;
  return matchHref(href, urlPathname);
});
</script>

<template>
  <slot :active :href="normalizedHref" />
</template>
