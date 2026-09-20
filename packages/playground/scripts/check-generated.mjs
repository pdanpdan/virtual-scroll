import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Generates the configurator's SFC output for a matrix of configurations and
 * leaves the files in `tmp-generated/`, which `vue-tsc --noEmit` then compiles
 * as part of `test:types`.
 *
 * The generator emits user-facing code, so a change to the library's API that the
 * generator does not follow - or a generator bug - shows up as a type error here
 * instead of in somebody's editor.
 */
import { build } from 'vite';

const pkgRoot = resolve(import.meta.dirname, '..');
const bundleDir = resolve(pkgRoot, 'node_modules/.tmp/generator');
const targetDir = resolve(pkgRoot, 'tmp-generated');

await build({
  configFile: false,
  root: pkgRoot,
  logLevel: 'silent',
  build: {
    outDir: bundleDir,
    emptyOutDir: true,
    minify: false,
    lib: {
      entry: {
        generate: resolve(pkgRoot, 'lib/configurator/generate.ts'),
        state: resolve(pkgRoot, 'lib/configurator/state.ts'),
      },
      formats: [ 'es' ],
      fileName: (_format, name) => `${ name }.mjs`,
    },
  },
});

const { generateSfc } = await import(`${ bundleDir }/generate.mjs`);
const { defaultState } = await import(`${ bundleDir }/state.mjs`);

const base = (overrides) => Object.assign(structuredClone(defaultState), overrides);

/** One entry per output shape the generator can produce. */
const cases = {
  'list-default': [ base(), 'component' ],
  'list-sticky-sections': [ base({ stickySections: true, stickyHeader: true, itemsPerSection: 10 }), 'component' ],
  'list-item-model': [ base({ keyboardActivation: 'item', snapshots: true, infiniteScroll: true }), 'component' ],
  'list-item-model-auto': [ base({ ariaRole: 'listbox', snapshots: true }), 'component' ],
  'list-viewport-keyboard': [ base({ keyboardActivation: 'viewport', snapshots: true }), 'component' ],
  'list-window-infinite': [ base({ containerMode: 'window', infiniteScroll: true, infiniteFlingVelocity: 3, infinitePreload: 200 }), 'component' ],
  'grid-item-model': [ base({ direction: 'both', keyboardActivation: 'item', snapshots: true }), 'component' ],
  'grid-dynamic-columns': [ base({ direction: 'both', columnWidthMode: 'dynamic', itemSizeMode: 'function', snap: true, snapMode: 'center' }), 'component' ],
  'table-item-model': [ base({ renderer: 'table', keyboardActivation: 'item', infiniteScroll: true }), 'component' ],
  'table-features': [ base({ renderer: 'table', rtl: true, snap: true, snapMode: 'center', snapshots: true, snapshotStorage: 'local', initialScroll: true, initialScrollIndex: 20, initialScrollAlign: 'center', restoreOnPrepend: true, stickyHeader: true, stickyFooter: true, ariaRole: 'grid' }), 'component' ],
  'list-local-storage': [ base({ snapshots: true, snapshotStorage: 'local' }), 'component' ],
  'table-default': [ base({ renderer: 'table' }), 'component' ],
  'masonry-default': [ base({ renderer: 'masonry' }), 'component' ],
  'masonry-aria': [ base({ renderer: 'masonry', ariaRole: 'list', gap: 16 }), 'component' ],
  'independent-scrollbars': [ base({ scrollbarStyle: 'independent', direction: 'both', rtl: true }), 'component' ],
  'composable-default': [ base(), 'composable' ],
  'composable-item-model': [ base({ keyboardActivation: 'item', snapshots: true, infiniteScroll: true, infiniteFlingVelocity: 3, infinitePreload: 150 }), 'composable' ],
  'composable-role-auto': [ base({ ariaRole: 'menu', snapshots: true }), 'composable' ],
  'composable-rtl-dynamic': [ base({ rtl: true, itemSizeMode: 'dynamic', stickySections: true, restoreOnPrepend: true, scrollbarStyle: 'custom' }), 'composable' ],
  'composable-window': [ base({ containerMode: 'window', restoreOnPrepend: true }), 'composable' ],
};

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });

for (const [ name, [ state, mode ] ] of Object.entries(cases)) {
  writeFileSync(resolve(targetDir, `${ name }.vue`), generateSfc(state, mode));
}

console.log(`generated ${ Object.keys(cases).length } configurations into tmp-generated/`);
