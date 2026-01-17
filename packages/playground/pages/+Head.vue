<script lang="ts" setup>
import { normalizeHref } from '#/navigate';

const themeUrl = normalizeHref('theme.js');
const logoUrl = normalizeHref('logo.svg');
</script>

<template>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="icon" type="image/svg+xml" :href="logoUrl" />
  <script :src="themeUrl" />
</template>
