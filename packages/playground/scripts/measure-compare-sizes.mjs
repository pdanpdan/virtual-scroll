/**
 * Measures the bundle sizes on the comparison page and writes
 * `packages/playground/lib/compare-sizes.ts`.
 *
 * Every row uses one recipe so the table stays comparable: the entry is
 * installed from npm at the version the page lists, bundled with esbuild
 * (`--bundle --minify --format=esm --external:vue`), and `min` is the minified
 * JavaScript plus the stylesheet that entry needs, `gz` is gzip level 9 over the
 * two concatenated. kB is 1000 bytes.
 *
 * Modes:
 *
 *   node scripts/measure-compare-sizes.mjs          measure every row, ours and the
 *                                                   contenders (needs npm)
 *   node scripts/measure-compare-sizes.mjs --ours   measure only this package, keep
 *                                                   the contender snapshot (offline)
 *
 * `pnpm build` runs `--ours`, so the comparison page always shows this package's
 * current version and sizes. Run the full measurement when a contender publishes
 * a version the page should track:
 *
 *   pnpm --filter playground measure:sizes
 */
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import { gzipSync } from 'node:zlib';

import { build } from 'vite';

const playgroundDir = resolve(import.meta.dirname, '..');
const repoRoot = resolve(playgroundDir, '../..');
const libraryDir = resolve(repoRoot, 'packages/virtual-scroll');
const librarySrc = resolve(libraryDir, 'src');
const distDir = resolve(libraryDir, 'dist');
// Pinned on purpose, both here and in the scratch manifest below: whether the entry
// counts as ESM decides which condition esbuild resolves a dependency through.
// Measured on the same install, the ESM entry picked the dependencies' `import`
// condition (24.3 kB for @tanstack/vue-virtual) while a CommonJS-typed entry kept
// their CommonJS interop wrappers (24.7 kB). An ESM entry is what a consumer's
// bundler resolves, so the scratch tree stays outside the repository and its
// package.json keeps `"type": "module"`.
const workDir = resolve(tmpdir(), 'virtual-scroll-compare-sizes');
const outputFile = resolve(playgroundDir, 'lib/compare-sizes.ts');

const oursOnly = process.argv.includes('--ours');

/**
 * This package's own entries, measured from the built `dist` the way a consumer
 * imports them. The composable ladder is what the page's prose prices.
 */
const OUR_ENTRIES = {
  oursFull: { file: 'index.mjs', symbols: [ 'VirtualScroll' ], style: 'virtual-scroll.css' },
  oursCore: { file: 'core.mjs', symbols: [ 'VirtualScroll' ], style: 'core.css' },
  oursComposable: { file: 'index.mjs', symbols: [ 'useVirtualScroll' ], style: null },
  oursHeadlessWired: {
    file: 'index.mjs',
    symbols: [ 'useVirtualScroll', 'useVirtualScrollObservers', 'useVirtualScrollKeyboard', 'useVirtualScrollbar' ],
    style: null,
  },
  oursEngineObservers: { file: 'index.mjs', symbols: [ 'useVirtualScroll', 'useVirtualScrollObservers' ], style: null },
  oursEngineObserversKeyboard: {
    file: 'index.mjs',
    symbols: [ 'useVirtualScroll', 'useVirtualScrollObservers', 'useVirtualScrollKeyboard' ],
    style: null,
  },
  oursWired: {
    file: 'index.mjs',
    symbols: [
      'useVirtualScroll',
      'useVirtualScrollObservers',
      'useVirtualScrollKeyboard',
      'useVirtualScrollbar',
      'useVirtualScrollInertia',
      'useRtlExtension',
      'useSnappingExtension',
      'useStickyExtension',
      'useInfiniteLoadingExtension',
      'usePrependRestorationExtension',
      'useCoordinateScalingExtension',
    ],
    style: null,
  },
};

/**
 * The contenders, at the versions the page's table lists: keep these in step with
 * that table. The name and version each entry resolves to is printed on install.
 */
const CONTENDERS = {
  vvs: {
    spec: [ 'vue-virtual-scroller@3.0.5' ],
    entry: `import { RecycleScroller } from 'vue-virtual-scroller';\nimport 'vue-virtual-scroller/dist/vue-virtual-scroller.css';\n`,
    symbols: [ 'RecycleScroller' ],
  },
  tanstack: {
    spec: [ '@tanstack/vue-virtual@3.13.39' ],
    entry: `import { useVirtualizer } from '@tanstack/vue-virtual';\n`,
    symbols: [ 'useVirtualizer' ],
  },
  // The package root is the React build; the Vue entry is the `virtua/vue` condition.
  virtua: {
    spec: [ 'virtua@0.52.7' ],
    entry: `import { VList } from 'virtua/vue';\n`,
    symbols: [ 'VList' ],
  },
  vueuc: {
    spec: [ 'vueuc@0.4.66' ],
    entry: `import { VVirtualList } from 'vueuc';\n`,
    symbols: [ 'VVirtualList' ],
  },
  // Published as CJS (`module.exports`), so the default import is the entry.
  vvsl: {
    spec: [ 'vue-virtual-scroll-list@2.3.5' ],
    entry: `import VirtualList from 'vue-virtual-scroll-list';\n`,
    symbols: [ 'VirtualList' ],
  },
  vlistAdapter: {
    spec: [ 'vlist@2.8.1', 'vlist-vue@2.6.0' ],
    entry: `import { useVList } from 'vlist-vue';\nimport 'vlist/styles';\n`,
    symbols: [ 'useVList' ],
  },
  vlistBase: {
    spec: [],
    entry: `import { createVList } from 'vlist';\nimport 'vlist/styles';\n`,
    symbols: [ 'createVList' ],
  },
  vlistBaseScrollbar: {
    spec: [],
    entry: `import { createVList, scrollbar } from 'vlist';\nimport 'vlist/styles';\n`,
    symbols: [ 'createVList', 'scrollbar' ],
  },
  cerious: {
    spec: [ '@ceriousdevtech/vue-cerious-scroll@1.2.0' ],
    entry: `import { CeriousScroll } from '@ceriousdevtech/vue-cerious-scroll';\n`,
    symbols: [ 'CeriousScroll' ],
  },
};

/** Rounds to the one decimal the page prints. */
const kB = (bytes) => Number((bytes / 1000).toFixed(1));

/** The package an entry imports from, for the version report. */
function packageOf(entry) {
  const specifier = entry.match(/from '([^']+)'/)?.[ 1 ] ?? '';
  const parts = specifier.split('/');
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[ 0 ];
}

/** Resolves the esbuild this repo already depends on, through Vite. */
async function loadEsbuild() {
  const require = createRequire(pathToFileURL(resolve(playgroundDir, 'package.json')));
  const fromVite = createRequire(require.resolve('vite/package.json'));
  const module = await import(pathToFileURL(fromVite.resolve('esbuild')).href);
  return module.build ?? module.default.build;
}

/** Whether the built entries are missing or older than the sources they come from. */
function distIsStale() {
  const entries = [ 'index.mjs', 'core.mjs' ];
  if (entries.some((entry) => !existsSync(resolve(distDir, entry)))) {
    return true;
  }
  const newest = Math.max(...entries.map((entry) => statSync(resolve(distDir, entry)).mtimeMs));
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((item) =>
    item.isDirectory() ? walk(resolve(dir, item.name)) : [ statSync(resolve(dir, item.name)).mtimeMs ]);
  return Math.max(...walk(librarySrc)) > newest;
}

/** Builds index.mjs/core.mjs plus their stylesheets, so our entries are measured as published. */
async function buildLibrary() {
  console.log('  building the library dist...');
  for (const configFile of [ 'vite.config.ts', 'vite.config.core.ts' ]) {
    await build({
      configFile: resolve(libraryDir, configFile),
      root: libraryDir,
      logLevel: 'silent',
      build: { outDir: distDir, emptyOutDir: false },
    });
  }
}

/** This package's version, and the release date the changelog gives it. */
function readOwnRelease() {
  const version = JSON.parse(readFileSync(resolve(libraryDir, 'package.json'), 'utf8')).version;
  const changelog = readFileSync(resolve(repoRoot, 'CHANGELOG.md'), 'utf8');
  const releases = [];
  for (const line of changelog.split('\n')) {
    const header = /^#{1,2}[ \t]+\[?v?(\d+\.\d+\.\d+)/.exec(line);
    if (header) {
      releases.push({ version: header[ 1 ], date: /(\d{4}-\d{2}-\d{2})/.exec(line)?.[ 1 ] ?? '' });
    }
  }
  // An unreleased version is not in the changelog yet; fall back to the last release's date.
  const released = releases.find((release) => release.version === version)?.date ?? releases[ 0 ]?.date ?? '';
  return { version, released };
}

/** Bundles one entry and returns its measured size. */
async function measure(esbuild, key, entrySource, resolveDir) {
  // Inside `resolveDir`: a contender's bare imports resolve from its own node_modules.
  const dir = resolve(resolveDir, `entry-${ key }`);
  mkdirSync(dir, { recursive: true });
  const entry = resolve(dir, 'entry.js');
  const outfile = resolve(dir, 'out/app.js');
  writeFileSync(entry, entrySource);

  await esbuild({
    entryPoints: [ entry ],
    outfile,
    bundle: true,
    minify: true,
    format: 'esm',
    external: [ 'vue' ],
    logLevel: 'warning',
    absWorkingDir: resolveDir,
  });

  const js = statSync(outfile).size;
  const cssFile = outfile.replace(/\.js$/, '.css');
  const css = existsSync(cssFile) ? statSync(cssFile).size : 0;
  const gz = gzipSync(Buffer.concat([ readFileSync(outfile), css > 0 ? readFileSync(cssFile) : Buffer.alloc(0) ]), { level: 9 }).length;
  return { min: kB(js + css), gz: kB(gz) };
}

/** The file's current contents, so a run keeps whatever it is not re-measuring. */
function readCurrent() {
  if (!existsSync(outputFile)) {
    return { sizes: {}, contendersMeasuredOn: '' };
  }
  const text = readFileSync(outputFile, 'utf8');
  const sizes = {};
  for (const match of text.matchAll(/^ {2}(\w+): \{ min: ([\d.]+), gz: ([\d.]+) \},$/gm)) {
    sizes[ match[ 1 ] ] = { min: Number(match[ 2 ]), gz: Number(match[ 3 ]) };
  }
  return {
    sizes,
    contendersMeasuredOn: text.match(/CONTENDERS_MEASURED_ON = '([^']*)'/)?.[ 1 ] ?? '',
  };
}

/** Writes the data module the comparison page reads. */
function writeModule({ sizes, contendersMeasuredOn, version, released }) {
  const rows = Object.entries(sizes).map(([ key, size ]) => `  ${ key }: { min: ${ size.min }, gz: ${ size.gz } },`).join('\n');
  writeFileSync(outputFile, `/**
 * This package's row on the comparison page and the committed contender snapshot
 * (kB = 1000 bytes). Generated by
 * \`packages/playground/scripts/measure-compare-sizes.mjs\` - do not edit by hand.
 *
 * Recipe: each library's entry for rendering a list, installed from npm at the
 * version the page lists, bundled with
 * \`esbuild --bundle --minify --format=esm --external:vue\`. \`min\` is the minified
 * JavaScript plus the stylesheet that entry needs, \`gz\` is gzip level 9 over the
 * two concatenated.
 */

/** When the contenders were last measured, in full. */
export const CONTENDERS_MEASURED_ON = '${ contendersMeasuredOn }';

/** This package's version, from its manifest, and the date the changelog gives it. */
export const OURS_VERSION = '${ version }';
export const OURS_RELEASED = '${ released }';

export const SIZES = {
${ rows }
};
`);
}

async function main() {
  const current = readCurrent();
  const release = readOwnRelease();
  const esbuild = await loadEsbuild();

  rmSync(workDir, { recursive: true, force: true });
  mkdirSync(workDir, { recursive: true });
  if (distIsStale()) {
    await buildLibrary();
  }

  const measured = {};
  const report = (key) => console.log(`  ${ key.padEnd(28) } ${ String(measured[ key ].min).padStart(6) } kB min  ${ String(measured[ key ].gz).padStart(5) } kB gzip`);

  for (const [ key, entry ] of Object.entries(OUR_ENTRIES)) {
    const target = resolve(distDir, entry.file);
    const style = entry.style ? `import ${ JSON.stringify(resolve(distDir, entry.style)) };\n` : '';
    measured[ key ] = await measure(esbuild, key, `import { ${ entry.symbols.join(', ') } } from ${ JSON.stringify(target) };\n${ style }globalThis.__s = [ ${ entry.symbols.join(', ') } ];\n`, workDir);
    report(key);
  }

  let contendersMeasuredOn = current.contendersMeasuredOn;
  if (!oursOnly) {
    contendersMeasuredOn = new Date().toISOString().slice(0, 10);
    const contendersDir = resolve(workDir, 'contenders');
    mkdirSync(contendersDir, { recursive: true });
    writeFileSync(resolve(contendersDir, 'package.json'), `${ JSON.stringify({ name: 'compare-sizes', private: true, type: 'module' }, null, 2) }\n`);
    const specs = [ ...new Set(Object.values(CONTENDERS).flatMap((contender) => contender.spec)) ];
    console.log(`  installing ${ specs.length } packages from npm...`);
    execFileSync('npm', [ 'install', '--no-audit', '--no-fund', '--silent', ...specs ], { cwd: contendersDir, stdio: [ 'ignore', 'ignore', 'inherit' ] });

    for (const [ key, contender ] of Object.entries(CONTENDERS)) {
      const name = packageOf(contender.entry);
      const manifest = JSON.parse(readFileSync(resolve(contendersDir, 'node_modules', ...name.split('/'), 'package.json'), 'utf8'));
      measured[ key ] = await measure(esbuild, key, `${ contender.entry }globalThis.__s = [ ${ contender.symbols.join(', ') } ];\n`, contendersDir);
      console.log(`  ${ key.padEnd(28) } ${ String(measured[ key ].min).padStart(6) } kB min  ${ String(measured[ key ].gz).padStart(5) } kB gzip   (${ name }@${ manifest.version })`);
    }
  }

  // The page lists our entries first, then the contenders, in this order.
  const sizes = {};
  for (const key of Object.keys(OUR_ENTRIES)) {
    sizes[ key ] = measured[ key ];
  }
  for (const key of Object.keys(CONTENDERS)) {
    const size = measured[ key ] ?? current.sizes[ key ];
    if (size === undefined) {
      throw new Error(`no measured size for ${ key } - run the full measurement once`);
    }
    sizes[ key ] = size;
  }

  const moved = Object.keys(sizes).filter((key) => current.sizes[ key ] && (current.sizes[ key ].min !== sizes[ key ].min || current.sizes[ key ].gz !== sizes[ key ].gz));
  if (moved.length > 0) {
    console.log('\n  moved since the last run:');
    for (const key of moved) {
      console.log(`  ${ key.padEnd(28) } ${ current.sizes[ key ].min } -> ${ sizes[ key ].min } kB min, ${ current.sizes[ key ].gz } -> ${ sizes[ key ].gz } kB gzip`);
    }
  }

  writeModule({ sizes, contendersMeasuredOn, ...release });
  console.log(`\n  wrote ${ outputFile.slice(repoRoot.length + 1) } for ${ release.version }${ oursOnly ? ' (contender snapshot kept)' : '' }\n`);
}

await main();
