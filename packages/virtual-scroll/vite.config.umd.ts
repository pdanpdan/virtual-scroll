import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';
import { defineConfig } from 'vite';

/**
 * CDN (UMD) bundle for the public entry.
 *
 * Separate from `vite.config.ts` because Vite refuses UMD output for a
 * multi-entry lib build; the `unpkg`/`jsdelivr` fields point at `dist/index.js`.
 */
export default defineConfig({
  plugins: [ vue() ],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('>0.5%, baseline widely available')),
      exclude: Features.Colors,
    },
  },
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'VirtualScroll',
      formats: [ 'umd' ],
      fileName: () => 'index.js',
      cssFileName: 'virtual-scroll',
    },
    rollupOptions: {
      external: [ 'vue' ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
  },
});
