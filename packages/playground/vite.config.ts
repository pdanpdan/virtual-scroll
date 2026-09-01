import { resolve } from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vike from 'vike/plugin';
import { defineConfig } from 'vite';

import { highlightPlugin } from './lib/highlight.js';

export default defineConfig({
  base: '/virtual-scroll',
  plugins: [
    highlightPlugin(),
    vike(),
    vue({
      include: [ /\.vue$/ ],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '#': `${ resolve(import.meta.dirname) }/`,
      '@pdanpdan/virtual-scroll': resolve(import.meta.dirname, '../virtual-scroll/src/index.ts'),
    },
  },
  build: {
    chunkSizeWarningLimit: 700000,
  },
  server: {
    fs: {
      allow: [ '../..' ],
    },
  },
});
