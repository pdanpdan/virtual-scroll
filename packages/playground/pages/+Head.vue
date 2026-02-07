<script lang="ts" setup>
import { normalizeHref } from '#/lib/url';

const themeUrl = normalizeHref('theme.js');
const logoUrl = normalizeHref('logo.svg');
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
  <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://pdanpdan.github.io/virtual-scroll/" />
  <link rel="icon" type="image/svg+xml" :href="logoUrl" />
  <script :src="themeUrl" />
</template>
