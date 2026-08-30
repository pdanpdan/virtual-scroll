import type { ExtensionContext } from '../../src/extensions';

import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useRtlExtension } from '../../src/extensions/rtl';

function makeCtx() {
  const isRtl = ref(false);
  const originalUpdateDirection = vi.fn();
  const ctx = {
    props: ref({ container: document.createElement('div'), hostRef: null }),
    internalState: { isRtl },
    methods: { updateDirection: originalUpdateDirection },
  } as unknown as ExtensionContext<unknown>;
  return { ctx, isRtl, originalUpdateDirection };
}

describe('useRtlExtension', () => {
  it('reflects the container direction and chains the original updateDirection', () => {
    const { ctx, isRtl, originalUpdateDirection } = makeCtx();
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration);

    const extension = useRtlExtension();
    extension.onInit!(ctx);

    // onInit refreshes the direction immediately
    expect(isRtl.value).toBe(true);

    // The patched method refreshes the rtl flag first, then delegates
    ctx.methods!.updateDirection!();
    expect(originalUpdateDirection).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });

  it('keeps the initial direction when the container is not rtl', () => {
    const { ctx, isRtl, originalUpdateDirection } = makeCtx();
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ direction: 'ltr' } as CSSStyleDeclaration);

    const extension = useRtlExtension();
    extension.onInit!(ctx);

    expect(isRtl.value).toBe(false);
    ctx.methods!.updateDirection!();
    expect(originalUpdateDirection).toHaveBeenCalledTimes(1);

    vi.restoreAllMocks();
  });

  it('does not touch the window when running without a window (SSR)', () => {
    const { ctx, isRtl } = makeCtx();

    vi.stubGlobal('window', undefined);
    try {
      useRtlExtension().onInit!(ctx);
      expect(isRtl.value).toBe(false);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
