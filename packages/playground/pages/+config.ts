import type { Config } from 'vike/types';

import vikeVue from 'vike-vue/config';

export default {
  ssr: true,
  prerender: true,
  trailingSlash: true,

  title: 'Virtual Scroll',
  description: 'Virtual scrolling for Vue 3: only the rows near the viewport are in the DOM.',

  extends: [ vikeVue ],
} as Config;
