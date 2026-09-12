import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(import.meta.dirname, 'tsconfig.app.json'),
      entryRoot: resolve(import.meta.dirname, 'src'),
    }),
  ],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('>0.5%, baseline widely available')),
      exclude: Features.Colors,
    },
  },
  build: {
    lib: {
      entry: {
        index: resolve(import.meta.dirname, 'src/index.ts'),
        internal: resolve(import.meta.dirname, 'src/internal.ts'),
      },
      name: 'VirtualScroll',
      // UMD cannot be built from multiple entries: `vite.config.umd.ts` builds
      // the CDN bundle from the public entry alone.
      formats: [ 'es', 'cjs' ],
      fileName: (format, entryName) => `${ entryName }.${ format === 'es' ? 'mjs' : 'cjs' }`,
      // Pinned so the emitted stylesheet does not depend on Vite's lib-mode
      // heuristics (the exports map points `./style.css` at this file).
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
