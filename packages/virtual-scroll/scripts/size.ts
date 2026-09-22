import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
/**
 * Bundle size and tree-shaking gate.
 *
 * Builds the published entries and a tree-shaken scenario bundle per import,
 * then fails when a feature that a scenario does not use survives in its bundle,
 * or when an entry leaves its size budget. Run with `pnpm size`; CI runs it as
 * part of the release gate.
 *
 * Usage:
 *   pnpm --filter @pdanpdan/virtual-scroll size
 */
import process from 'node:process';
import { gzipSync } from 'node:zlib';

import { build } from 'vite';

const pkgRoot = resolve(import.meta.dirname, '..');
const tmpRoot = resolve(pkgRoot, 'node_modules/.tmp/size');
const distRoot = resolve(tmpRoot, 'dist');

/** Marker strings that only survive in a bundle when the feature is included. */
const FEATURE_MARKERS = {
  keyboard: '"PageDown"',
  snapping: '"snapping"',
  sticky: '"sticky"',
  infiniteLoading: '"infinite-loading"',
  prependRestoration: '"prepend-restoration"',
  scrollbar: '"virtual-scrollbar-track"',
  table: '"VirtualScrollTable"',
  masonry: '"VirtualScrollMasonry"',
} as const;

type FeatureName = keyof typeof FEATURE_MARKERS;

interface Scenario {
  name: string;
  /** Entry to import from, relative to the built dist root. */
  entry: string;
  /** Named exports the scenario keeps alive. */
  imports: string[];
  /** Features that must NOT survive in this scenario's bundle. */
  absent: FeatureName[];
  /** Features that must survive in this scenario's bundle. */
  present: FeatureName[];
  /** Gzipped size window in KB. */
  budget: [ number, number ];
}

const noOptionalWiring: FeatureName[] = [ 'keyboard', 'snapping', 'sticky', 'infiniteLoading', 'prependRestoration', 'scrollbar' ];

const scenarios: Scenario[] = [
  {
    name: 'VirtualScroll (full)',
    entry: 'index.mjs',
    imports: [ 'VirtualScroll' ],
    absent: [ 'masonry', 'table' ],
    present: [ 'keyboard', 'snapping', 'sticky', 'infiniteLoading', 'prependRestoration', 'scrollbar' ],
    budget: [ 19, 25 ],
  },
  {
    name: 'VirtualScroll (core)',
    entry: 'core.mjs',
    imports: [ 'VirtualScroll' ],
    absent: noOptionalWiring,
    present: [],
    budget: [ 14, 19 ],
  },
  {
    name: 'useVirtualScroll',
    entry: 'index.mjs',
    imports: [ 'useVirtualScroll' ],
    absent: [ 'table', 'masonry', 'keyboard', 'snapping', 'sticky', 'infiniteLoading', 'prependRestoration', 'scrollbar' ],
    present: [],
    budget: [ 9, 13 ],
  },
  {
    name: 'VirtualScrollTable',
    entry: 'index.mjs',
    imports: [ 'VirtualScrollTable' ],
    absent: [ 'masonry' ],
    present: [ 'table', 'sticky' ],
    budget: [ 20, 26 ],
  },
  {
    name: 'VirtualScrollTable (core)',
    entry: 'core.mjs',
    imports: [ 'VirtualScrollTable' ],
    // The table keeps the flow-mode scrollbar it always renders, so `scrollbar`
    // stays present while the optional wiring goes.
    absent: [ 'masonry', 'keyboard', 'snapping', 'sticky', 'infiniteLoading', 'prependRestoration' ],
    present: [ 'table', 'scrollbar' ],
    budget: [ 17, 23 ],
  },
  {
    name: 'VirtualScrollMasonry',
    entry: 'index.mjs',
    imports: [ 'VirtualScrollMasonry' ],
    absent: [ 'table', 'snapping' ],
    present: [ 'masonry' ],
    budget: [ 6, 10 ],
  },
];

interface Result {
  name: string;
  gzipKB: number;
  minKB: number;
}

async function buildLibrary(): Promise<void> {
  rmSync(tmpRoot, { recursive: true, force: true });
  mkdirSync(tmpRoot, { recursive: true });
  for (const configFile of [ 'vite.config.ts', 'vite.config.core.ts' ]) {
    await build({
      configFile: resolve(pkgRoot, configFile),
      root: pkgRoot,
      logLevel: 'silent',
      build: { outDir: distRoot, emptyOutDir: false },
    });
  }
}

async function measure(scenario: Scenario): Promise<{ result: Result; text: string; }> {
  const entryFile = resolve(tmpRoot, `${ scenario.name.replace(/\W+/g, '-') }.ts`);
  const entryPath = resolve(distRoot, scenario.entry);
  writeFileSync(entryFile, `import { ${ scenario.imports.join(', ') } } from ${ JSON.stringify(entryPath) };\nglobalThis.__scenario = [${ scenario.imports.join(', ') }];\n`);

  const outDir = resolve(tmpRoot, `out-${ scenario.name.replace(/\W+/g, '-') }`);
  await build({
    root: pkgRoot,
    configFile: false,
    logLevel: 'silent',
    build: {
      outDir,
      emptyOutDir: true,
      minify: 'esbuild',
      write: true,
      lib: { entry: entryFile, formats: [ 'es' ], fileName: 'bundle' },
      rollupOptions: { external: [ 'vue' ] },
    },
  });

  const bundleName = readdirSync(outDir).find((file) => file.endsWith('.js') || file.endsWith('.mjs'));
  if (bundleName === undefined) {
    throw new Error(`no bundle emitted for ${ scenario.name }`);
  }
  const raw = readFileSync(resolve(outDir, bundleName));
  return {
    result: {
      name: scenario.name,
      gzipKB: gzipSync(raw, { level: 9 }).length / 1024,
      minKB: raw.length / 1024,
    },
    text: raw.toString('utf8'),
  };
}

async function main(): Promise<void> {
  await buildLibrary();

  const failures: string[] = [];
  const results: Result[] = [];

  for (const scenario of scenarios) {
    const { result, text } = await measure(scenario);
    results.push(result);

    for (const feature of scenario.absent) {
      if (text.includes(FEATURE_MARKERS[ feature ])) {
        failures.push(`${ scenario.name }: "${ feature }" leaked into the bundle (${ FEATURE_MARKERS[ feature ] })`);
      }
    }
    for (const feature of scenario.present) {
      if (!text.includes(FEATURE_MARKERS[ feature ])) {
        failures.push(`${ scenario.name }: "${ feature }" is missing from the bundle (${ FEATURE_MARKERS[ feature ] })`);
      }
    }

    const [ min, max ] = scenario.budget;
    if (result.gzipKB < min || result.gzipKB > max) {
      failures.push(`${ scenario.name }: ${ result.gzipKB.toFixed(1) } KB gzipped is outside the ${ min }-${ max } KB budget`);
    }
  }

  const full = results.find((entry) => entry.name === 'VirtualScroll (full)');
  const core = results.find((entry) => entry.name === 'VirtualScroll (core)');
  if (full && core && full.gzipKB - core.gzipKB < 3) {
    failures.push(`VirtualScroll (core) is only ${ (full.gzipKB - core.gzipKB).toFixed(1) } KB smaller than the full entry - the ${ '__VS_CORE_BUILD__' } flag is not pruning`);
  }

  const nameWidth = Math.max(...results.map((entry) => entry.name.length));
  console.log('\n  Bundle size (tree-shaken, gzipped)\n');
  for (const entry of results) {
    console.log(`  ${ entry.name.padEnd(nameWidth) }  ${ entry.minKB.toFixed(1).padStart(6) } KB min  ${ entry.gzipKB.toFixed(1).padStart(6) } KB gzip`);
  }
  console.log('');

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`  ✗ ${ failure }`);
    }
    console.error('');
    process.exitCode = 1;
    return;
  }

  console.log(`  ✓ ${ scenarios.length } scenarios clean - unused features excluded\n`);
}

await main();
