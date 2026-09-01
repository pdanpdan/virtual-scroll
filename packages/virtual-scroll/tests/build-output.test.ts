import { existsSync, readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import { build } from 'vite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const pkgRoot = resolve(__dirname, '..');
const distDir = resolve(pkgRoot, 'dist');

interface ManifestExport {
  types?: string;
  import?: string;
  require?: string;
}

interface Manifest {
  types?: string;
  main?: string;
  module?: string;
  exports?: Record<string, string | ManifestExport>;
}

beforeAll(async () => {
  rmSync(distDir, { recursive: true, force: true });
  // pin root: vitest workers run from the repo root, and vite derives root from cwd
  await build({ configFile: resolve(pkgRoot, 'vite.config.ts'), root: pkgRoot, logLevel: 'silent' });
}, 60_000);

afterAll(() => {
  rmSync(distDir, { recursive: true, force: true });
});

describe('build output layout', () => {
  it('emits the entry declaration at dist/index.d.ts', () => {
    expect(existsSync(resolve(distDir, 'index.d.ts'))).toBe(true);
  });

  it('does not nest declarations under dist/src', () => {
    expect(existsSync(resolve(distDir, 'src'))).toBe(false);
  });

  it('emits module declarations relative to the dist root', () => {
    expect(existsSync(resolve(distDir, 'composables/useVirtualScroll.d.ts'))).toBe(true);
    expect(existsSync(resolve(distDir, 'components/VirtualScroll.vue.d.ts'))).toBe(true);
  });

  it('keeps every dist path declared in the manifest present in the build output', () => {
    const manifest = JSON.parse(readFileSync(resolve(pkgRoot, 'package.json'), 'utf8')) as Manifest;
    const entries: Array<ManifestExport | string | undefined> = [
      manifest.types,
      manifest.main,
      manifest.module,
      ...Object.values(manifest.exports ?? {}),
    ];
    const declaredDistPaths = entries
      .flatMap((entry) => (typeof entry === 'string' ? [ entry ] : [ entry?.types, entry?.import, entry?.require ]))
      .filter((path): path is string => typeof path === 'string' && path.startsWith('./dist'));
    expect(declaredDistPaths.length).toBeGreaterThan(0);
    for (const path of declaredDistPaths) {
      expect(existsSync(resolve(pkgRoot, path)), `missing built file ${ path }`).toBe(true);
    }
  });
});
