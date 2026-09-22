import type { ExtensionContext } from '../../src/extensions';

import { describe, expect, it, vi } from 'vitest';

import { useRtlExtension } from '../../src/extensions/rtl';

function makeCtx() {
  const updateDirection = vi.fn();
  const ctx = {
    props: { value: { container: document.createElement('div'), hostRef: null } },
    methods: { updateDirection },
  } as unknown as ExtensionContext<unknown>;
  return { ctx, updateDirection };
}

describe('useRtlExtension', () => {
  it('asks the engine for the container direction while initializing', () => {
    const { ctx, updateDirection } = makeCtx();

    useRtlExtension().onInit!(ctx);

    // Detection lives in the engine: the extension only triggers it, so the
    // first render happens with the direction already resolved.
    expect(updateDirection).toHaveBeenCalledTimes(1);
  });

  it('leaves the engine detection as the single owner of the direction read', () => {
    const { ctx, updateDirection } = makeCtx();
    const getComputedStyle = vi.spyOn(window, 'getComputedStyle');

    const extension = useRtlExtension();
    extension.onInit!(ctx);
    extension.onInit!(ctx);

    // Only the engine reads computed styles; the extension installs no wrapper
    // of its own, so repeated initialization stays a plain call through.
    expect(getComputedStyle).not.toHaveBeenCalled();
    expect(updateDirection).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
  });

  it('does not depend on a window to run', () => {
    const { ctx, updateDirection } = makeCtx();

    vi.stubGlobal('window', undefined);
    try {
      useRtlExtension().onInit!(ctx);
      expect(updateDirection).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
