import type { Config } from 'vike/types';

import vikeVue from 'vike-vue/config';

export default {
  ssr: true,
  prerender: true,
  trailingSlash: true,

  title: 'Virtual Scroll',
  description: 'A high-performance virtualization library for Vue 3.',

  extends: [ vikeVue ],
} as Config;
