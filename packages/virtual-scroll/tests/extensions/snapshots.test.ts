/* global ScrollToOptions */
import type { ExtensionContext } from '../../src/extensions';
import type { ScrollSnapshot, SnapshotsExtensionOptions } from '../../src/extensions/snapshots';
import type { MockItem } from '../test-helper';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick, ref } from 'vue';

import { useSnapshotsExtension } from '../../src/extensions/snapshots';
import { clearMocks, mockItems, setup, setupMocks } from '../test-helper';

/** Snapshot produced by {@link makeCtx} and by the engine fixture below. */
const expectedSnapshot: ScrollSnapshot = { index: 55, offset: 10, total: 100 };

afterEach(() => {
  window.localStorage.removeItem('vs-snapshots-test');
  window.sessionStorage.removeItem('vs-snapshots-test');
});

function createFakeStorage(): Storage {
  const entries = new Map<string, string>();
  return {
    get length() {
      return entries.size;
    },
    clear: () => {
      entries.clear();
    },
    getItem: (key: string) => entries.get(key) ?? null,
    key: (index: number) => [ ...entries.keys() ][ index ] ?? null,
    removeItem: (key: string) => {
      entries.delete(key);
    },
    setItem: (key: string, value: string) => {
      entries.set(key, value);
    },
  } as unknown as Storage;
}

/** Engine context mock: item 55 is visible at 10 VU inside it (items are 50 VU tall). */
function makeCtx(overrides: { direction?: 'vertical' | 'horizontal' | 'both' | null; } = {}) {
  const scrollToIndex = vi.fn(() => ({ targetX: 300, targetY: 2750, displayTargetX: 300, displayTargetY: 2750 }));
  const scrollToOffset = vi.fn();
  const direction = overrides.direction === undefined ? 'vertical' : overrides.direction;
  const ctx = {
    props: ref({
      ...(direction === null ? {} : { direction }),
      items: mockItems,
    }),
    scrollDetails: ref({
      currentIndex: 55,
      currentColIndex: 3,
      scrollOffset: { x: 200, y: 2760 },
    }),
    methods: {
      getItemOffset: (index: number) => index * 50,
      scrollToIndex,
      scrollToOffset,
    },
  } as unknown as ExtensionContext<MockItem>;

  return { ctx, scrollToIndex, scrollToOffset };
}

/** Engine fixture: 100 items of 50 VU in a 500 VU container, scrollable up to 4500 VU. */
function mountEngine(options: SnapshotsExtensionOptions = {}) {
  const container = document.createElement('div');
  Object.defineProperty(container, 'clientHeight', { configurable: true, value: 500 });
  Object.defineProperty(container, 'clientWidth', { configurable: true, value: 500 });
  let scrollTop = 0;
  Object.defineProperty(container, 'scrollTop', {
    configurable: true,
    get: () => scrollTop,
    set: (value: number) => {
      scrollTop = value;
    },
  });
  container.scrollTo = vi.fn().mockImplementation((scrollOptions: ScrollToOptions) => {
    if (scrollOptions.top !== undefined) {
      scrollTop = scrollOptions.top;
    }
    container.dispatchEvent(new Event('scroll'));
  });

  const extension = useSnapshotsExtension<MockItem>(options);
  const { props, result, wrapper } = setup({
    container,
    direction: 'vertical',
    itemSize: 50,
    items: mockItems,
  }, [ extension ]);

  const flush = async () => {
    await nextTick();
    await nextTick();
  };

  return {
    extension,
    props,
    result,
    wrapper,
    flush,
    getScrollTop: () => scrollTop,
    scrollTo: (top: number) => {
      container.scrollTop = top;
      container.dispatchEvent(new Event('scroll'));
    },
  };
}

describe('useSnapshotsExtension', () => {
  it('captures the first visible item and the offset inside it', () => {
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(makeCtx().ctx);

    expect(extension.save()).toEqual(expectedSnapshot);
  });

  it('captures the column index in horizontal mode', () => {
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(makeCtx({ direction: 'horizontal' }).ctx);

    expect(extension.save()).toEqual({ index: 3, offset: 200 - 3 * 50, total: 100 });
  });

  it('treats a missing direction as the vertical axis', () => {
    const { ctx, scrollToIndex, scrollToOffset } = makeCtx({ direction: null });
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(ctx);

    expect(extension.save()).toEqual(expectedSnapshot);
    expect(extension.restore()).toBe(true);
    expect(scrollToIndex).toHaveBeenCalledWith(55, null, { align: 'start', behavior: 'auto' });
    expect(scrollToOffset).toHaveBeenCalledWith(null, 2760, { behavior: 'auto' });
  });

  it('restores the item and the offset inside it', () => {
    const { ctx, scrollToIndex, scrollToOffset } = makeCtx();
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(ctx);

    expect(extension.restore(expectedSnapshot)).toBe(true);
    expect(scrollToIndex).toHaveBeenCalledWith(55, null, { align: 'start', behavior: 'auto' });
    expect(scrollToOffset).toHaveBeenCalledWith(null, 2760, { behavior: 'auto' });
  });

  it('restores the column on the x axis in horizontal mode', () => {
    const { ctx, scrollToIndex, scrollToOffset } = makeCtx({ direction: 'horizontal' });
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(ctx);

    expect(extension.restore({ index: 3, offset: 50, total: 100 })).toBe(true);
    expect(scrollToIndex).toHaveBeenCalledWith(null, 3, { align: 'start', behavior: 'auto' });
    expect(scrollToOffset).toHaveBeenCalledWith(350, null, { behavior: 'auto' });
  });

  it('does not re-apply a zero offset', () => {
    const { ctx, scrollToIndex, scrollToOffset } = makeCtx();
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(ctx);

    expect(extension.restore({ index: 55, offset: 0, total: 100 })).toBe(true);
    expect(scrollToIndex).toHaveBeenCalledTimes(1);
    expect(scrollToOffset).not.toHaveBeenCalled();
  });

  it('returns false without scrolling when the snapshot total does not match', () => {
    const { ctx, scrollToIndex, scrollToOffset } = makeCtx();
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(ctx);

    expect(extension.restore({ index: 55, offset: 10, total: 42 })).toBe(false);
    expect(extension.restore({ index: 150, offset: 10, total: 100 })).toBe(false);
    expect(scrollToIndex).not.toHaveBeenCalled();
    expect(scrollToOffset).not.toHaveBeenCalled();
  });

  it('returns false without scrolling when there is no snapshot', () => {
    const { ctx, scrollToIndex } = makeCtx();
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(ctx);

    expect(extension.restore()).toBe(false);
    expect(extension.restore(null)).toBe(false);
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('returns false without scrolling for malformed snapshots', () => {
    const { ctx, scrollToIndex } = makeCtx();
    const extension = useSnapshotsExtension<MockItem>();
    extension.onInit!(ctx);

    const malformed: ScrollSnapshot[] = [
      { index: -1, offset: 0, total: 100 },
      { index: 1.5, offset: 0, total: 100 },
      { index: 0, offset: Number.NaN, total: 100 },
      { index: 0, offset: 0, total: 1.5 },
      { index: 0, offset: 0, total: -1 },
    ];
    for (const snapshot of malformed) {
      expect(extension.restore(snapshot)).toBe(false);
    }
    expect(scrollToIndex).not.toHaveBeenCalled();
  });

  it('is inert before the engine is initialized', () => {
    const extension = useSnapshotsExtension<MockItem>({ storage: 'memory' });

    expect(extension.save()).toEqual({ index: 0, offset: 0, total: 0 });
    expect(extension.restore()).toBe(false);
    extension.clear();
  });

  it('persists on save and reloads the snapshot on init', () => {
    const storage = createFakeStorage();
    const extension = useSnapshotsExtension<MockItem>({ storage });
    extension.onInit!(makeCtx().ctx);

    expect(extension.restore()).toBe(false);
    expect(extension.save()).toEqual(expectedSnapshot);
    expect(storage.getItem('virtual-scroll:snapshot')).toBe(JSON.stringify(expectedSnapshot));

    const { ctx, scrollToIndex, scrollToOffset } = makeCtx();
    const reloaded = useSnapshotsExtension<MockItem>({ storage });
    reloaded.onInit!(ctx);

    expect(reloaded.restore()).toBe(true);
    expect(scrollToIndex).toHaveBeenCalledWith(55, null, { align: 'start', behavior: 'auto' });
    expect(scrollToOffset).toHaveBeenCalledWith(null, 2760, { behavior: 'auto' });
  });

  it('drops the stored entry on clear', () => {
    const storage = createFakeStorage();
    const extension = useSnapshotsExtension<MockItem>({ storage, key: 'vs-clear' });
    extension.onInit!(makeCtx().ctx);
    extension.save();

    extension.clear();

    expect(storage.getItem('vs-clear')).toBeNull();
    expect(extension.restore()).toBe(false);
  });

  it('ignores corrupted stored entries', () => {
    const storage = createFakeStorage();
    const corrupted = [
      'not json',
      JSON.stringify(42),
      JSON.stringify({ index: 'first', offset: 0, total: 100 }),
      JSON.stringify({ index: 0, offset: null, total: 100 }),
      JSON.stringify({ index: 0, offset: 0, total: 'all' }),
    ];

    for (const raw of corrupted) {
      storage.setItem('vs-corrupted', raw);
      const extension = useSnapshotsExtension<MockItem>({ storage, key: 'vs-corrupted' });
      extension.onInit!(makeCtx().ctx);

      expect(extension.restore()).toBe(false);
    }
  });

  it('uses the built-in session and local storages', () => {
    const session = useSnapshotsExtension<MockItem>({ storage: 'session', key: 'vs-snapshots-test' });
    session.onInit!(makeCtx().ctx);
    session.save();
    expect(window.sessionStorage.getItem('vs-snapshots-test')).toBe(JSON.stringify(expectedSnapshot));

    session.clear();
    expect(window.sessionStorage.getItem('vs-snapshots-test')).toBeNull();

    const local = useSnapshotsExtension<MockItem>({ storage: 'local', key: 'vs-snapshots-test' });
    local.onInit!(makeCtx().ctx);
    local.save();
    expect(window.localStorage.getItem('vs-snapshots-test')).toBe(JSON.stringify(expectedSnapshot));

    local.clear();
    expect(window.localStorage.getItem('vs-snapshots-test')).toBeNull();
  });

  it('falls back to memory when the built-in storage is unavailable', () => {
    const blocked = vi.spyOn(window, 'sessionStorage', 'get').mockImplementation(() => {
      throw new Error('blocked');
    });

    try {
      const extension = useSnapshotsExtension<MockItem>({ storage: 'session', key: 'vs-blocked' });
      extension.onInit!(makeCtx().ctx);

      expect(extension.save()).toEqual(expectedSnapshot);
      expect(extension.restore()).toBe(true);
    } finally {
      blocked.mockRestore();
    }
  });

  it('falls back to memory when the injected storage throws', () => {
    const storage = {
      get length() {
        return 0;
      },
      clear: () => {},
      getItem: () => {
        throw new Error('blocked');
      },
      key: () => null,
      removeItem: () => {
        throw new Error('full');
      },
      setItem: () => {
        throw new Error('full');
      },
    } as unknown as Storage;

    const extension = useSnapshotsExtension<MockItem>({ storage, key: 'vs-throwing' });
    const { ctx, scrollToIndex } = makeCtx();
    extension.onInit!(ctx);

    expect(extension.restore()).toBe(false);

    expect(extension.save()).toEqual(expectedSnapshot);
    expect(extension.restore()).toBe(true);
    expect(scrollToIndex).toHaveBeenCalledTimes(1);

    extension.clear();
    expect(extension.restore()).toBe(false);
  });
});

describe('useSnapshotsExtension (engine)', () => {
  setupMocks();

  beforeEach(() => {
    clearMocks();
  });

  it('round-trips the visible position', async () => {
    const engine = mountEngine();
    await engine.flush();

    engine.scrollTo(2760);
    await engine.flush();

    const saved = engine.extension.save();
    expect(saved).toEqual(expectedSnapshot);

    engine.scrollTo(0);
    await engine.flush();

    expect(engine.extension.restore()).toBe(true);
    await engine.flush();

    expect(engine.getScrollTop()).toBe(2760);
    expect(engine.result.scrollDetails.value.scrollOffset.y).toBe(2760);
    engine.wrapper.unmount();
  });

  it('refuses to restore a snapshot whose item total changed', async () => {
    const engine = mountEngine();
    await engine.flush();

    engine.scrollTo(2760);
    await engine.flush();
    const saved = engine.extension.save();

    engine.props.value.items = mockItems.slice(0, 50);
    engine.scrollTo(1000);
    await engine.flush();

    expect(engine.extension.restore(saved)).toBe(false);
    expect(engine.getScrollTop()).toBe(1000);
    engine.wrapper.unmount();
  });

  it('restores a position persisted by a previous engine', async () => {
    const storage = createFakeStorage();
    const options: SnapshotsExtensionOptions = { storage, key: 'vs-engine' };

    const first = mountEngine(options);
    await first.flush();
    first.scrollTo(2760);
    await first.flush();
    first.extension.save();
    first.wrapper.unmount();

    const second = mountEngine(options);
    await second.flush();
    expect(second.getScrollTop()).toBe(0);

    expect(second.extension.restore()).toBe(true);
    await second.flush();

    expect(second.getScrollTop()).toBe(2760);
    second.wrapper.unmount();
  });

  it('persists on scroll end when autoSave is enabled', async () => {
    vi.useFakeTimers();
    const storage = createFakeStorage();

    try {
      const engine = mountEngine({ storage, key: 'vs-auto', autoSave: true });
      await engine.flush();

      engine.scrollTo(2760);
      await engine.flush();
      vi.advanceTimersByTime(300);
      await engine.flush();

      expect(storage.getItem('vs-auto')).toBe(JSON.stringify(expectedSnapshot));
      engine.wrapper.unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it('does not persist on scroll end unless autoSave is enabled', async () => {
    vi.useFakeTimers();
    const storage = createFakeStorage();

    try {
      const engine = mountEngine({ storage, key: 'vs-manual' });
      await engine.flush();

      engine.scrollTo(2760);
      await engine.flush();
      vi.advanceTimersByTime(300);
      await engine.flush();

      expect(storage.getItem('vs-manual')).toBeNull();
      engine.wrapper.unmount();
    } finally {
      vi.useRealTimers();
    }
  });
});
