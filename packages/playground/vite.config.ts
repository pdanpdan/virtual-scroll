import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import vike from 'vike/plugin';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  base: '/virtual-scroll',
  plugins: [
    vike(),
    vue({
      include: [ /\.vue$/ ],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '#': `${ resolve(__dirname) }/`,
      '@pdanpdan/virtual-scroll': resolve(__dirname, '../virtual-scroll/src/index.ts'),
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
