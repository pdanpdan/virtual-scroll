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
      tsconfigPath: resolve(__dirname, 'tsconfig.app.json'),
      entryRoot: resolve(__dirname, 'src'),
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
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VirtualScroll',
      fileName: (format) => `index.${ format === 'es' ? 'mjs' : format === 'cjs' ? 'cjs' : 'js' }`,
      formats: [ 'es', 'cjs', 'umd' ],
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
