<script lang="ts" setup>
import { normalizeHref } from '#/navigate';

const themeUrl = normalizeHref('theme.js');
const logoUrl = normalizeHref('logo.svg');
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
  <meta name="description" content="High-performance virtualization library for Vue 3. Supports vertical, horizontal, and bidirectional scrolling with dynamic item sizes." />
  <meta property="og:title" content="Virtual Scroll Playground" />
  <meta property="og:description" content="Showcase of @pdanpdan/virtual-scroll - a powerful Vue 3 virtualization component." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://pdanpdan.github.io/virtual-scroll/" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" type="image/svg+xml" :href="logoUrl" />
  <script :src="themeUrl" />
</template>
