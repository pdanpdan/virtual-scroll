import type { Config } from 'vike/types';

import vikeVue from 'vike-vue/config';

export default {
  ssr: true,
  prerender: true,
  trailingSlash: true,

  title: 'Virtual Scroll Playground',
  description: 'Showcase of @pdanpdan/virtual-scroll component',

  extends: [ vikeVue ],
} as Config;
