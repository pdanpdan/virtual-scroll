import { resolve } from 'node:path';

import vue from '@vitejs/plugin-vue';
import browserslist from 'browserslist';
import { browserslistToTargets, Features } from 'lightningcss';
import { defineConfig } from 'vite';

/**
 * Lean (`./core`) bundle: the same public surface as `vite.config.ts`, built with
 * `__VS_CORE_BUILD__` set so `VirtualScroll` leaves the optional wiring out
 * (keyboard navigation, custom scrollbars, snapping, sticky items, infinite
 * loading and prepend restoration).
 *
 * The flag is read by `composables/useVirtualScrollComponent.ts`, the base
 * `VirtualScroll.vue` and `VirtualScrollTable.vue` share, so the pruning covers
 * both components; `VirtualScrollMasonry` has no optional wiring to remove. The
 * composables, extensions and types are shared with the full entry, and both
 * builds are asserted by `scripts/size.ts` and `tests/build-output.test.ts`.
 *
 * Types are shared with the full entry (`dist/index.d.ts`); only the runtime
 * differs, so declarations are generated once by `vite.config.ts`.
 */
export default defineConfig({
  plugins: [ vue() ],
  define: {
    __VS_CORE_BUILD__: 'true',
  },
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
      formats: [ 'es', 'cjs' ],
      fileName: (format) => `core.${ format === 'es' ? 'mjs' : 'cjs' }`,
      cssFileName: 'core',
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
