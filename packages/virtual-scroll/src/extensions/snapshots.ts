import type { ExtensionContext, VirtualScrollExtension } from './index';

/**
 * A saved scroll position.
 */
export interface ScrollSnapshot {
  /** Index of the first visible item at the saved position. */
  index: number;
  /** Offset (VU) inside that item, measured from its start. */
  offset: number;
  /** Number of items the snapshot was taken with. */
  total: number;
}

/** Options for {@link useSnapshotsExtension}. */
export interface SnapshotsExtensionOptions {
  /**
   * Where snapshots are persisted. `'memory'` (default) keeps them in the extension.
   * @default 'memory'
   */
  storage?: 'memory' | 'session' | 'local' | Storage;
  /**
   * Storage key used by `'session'`/`'local'` and by a custom `Storage`.
   * @default 'virtual-scroll:snapshot'
   */
  key?: string;
  /**
   * Persist on every scroll end.
   * @default false
   */
  autoSave?: boolean;
}

/**
 * Extension returned by {@link useSnapshotsExtension}.
 */
export interface SnapshotsExtension<T = unknown> extends VirtualScrollExtension<T> {
  /**
   * Capture the current scroll position, keep it in memory and persist it when a
   * storage is configured.
   * @returns The captured snapshot.
   */
  save: () => ScrollSnapshot;
  /**
   * Scroll back to the given snapshot, or to the last saved one when omitted.
   * @param snapshot - Snapshot to restore; `null` or an invalid snapshot is ignored.
   * @returns `true` when the scroll was performed, `false` when there was nothing
   * valid to restore or the snapshot no longer matches the current item count.
   */
  restore: (snapshot?: ScrollSnapshot | null) => boolean;
  /** Drop the in-memory snapshot and the stored entry. */
  clear: () => void;
}

/** Default storage key used by {@link SnapshotsExtensionOptions.key}. */
const DEFAULT_KEY = 'virtual-scroll:snapshot';

/**
 * Storage used when the requested one is unavailable (SSR, privacy mode, quota).
 * @param source - Configured storage option.
 * @returns The storage to use, or `null` to keep snapshots in memory.
 */
function resolveStorage(source: SnapshotsExtensionOptions[ 'storage' ]): Storage | null {
  if (source === undefined || source === 'memory') {
    return null;
  }
  if (typeof source !== 'string') {
    return source;
  }
  try {
    return source === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    // SSR (no window) or a storage accessor blocked by the browser.
    return null;
  }
}

/**
 * Validate an untrusted value (stored entry or caller supplied snapshot).
 * @param value - Value to validate.
 * @returns A normalized snapshot, or `null` when the value is not a usable snapshot.
 */
function normalizeSnapshot(value: unknown): ScrollSnapshot | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  const { index, offset, total } = value as { index?: unknown; offset?: unknown; total?: unknown; };
  if (typeof index !== 'number' || !Number.isInteger(index) || index < 0) {
    return null;
  }
  if (typeof offset !== 'number' || !Number.isFinite(offset)) {
    return null;
  }
  if (typeof total !== 'number' || !Number.isInteger(total) || total < 0) {
    return null;
  }
  return { index, offset, total };
}

/**
 * Extension for scroll snapshots.
 * Captures the visible position so it can be restored later, optionally through
 * `sessionStorage`/`localStorage` (or any custom `Storage`) so it survives a reload.
 *
 * A snapshot is only restored when its `total` still matches the current item count,
 * so a list that changed shape falls back to its normal start position instead of
 * jumping to an unrelated index.
 *
 * @param options - Extension options.
 * @param options.storage - Where snapshots are persisted (`'memory'` by default).
 * @param options.key - Storage key used by persistent storages.
 * @param options.autoSave - Persist on every scroll end.
 */
export function useSnapshotsExtension<T = unknown>(options: SnapshotsExtensionOptions = {}): SnapshotsExtension<T> {
  const key = options.key ?? DEFAULT_KEY;
  const storage = resolveStorage(options.storage);
  const autoSave = options.autoSave ?? false;

  let ctx: ExtensionContext<T> | null = null;
  let snapshot: ScrollSnapshot | null = null;

  /** Read the persisted snapshot, tolerating a missing or blocked storage. */
  const read = (): ScrollSnapshot | null => {
    if (!storage) {
      return null;
    }
    try {
      const raw = storage.getItem(key);
      return raw === null ? null : normalizeSnapshot(JSON.parse(raw) as unknown);
    } catch {
      // Blocked storage or a corrupted entry: fall back to memory.
      return null;
    }
  };

  /** Persist (or drop) the stored entry, tolerating a blocked or full storage. */
  const write = (value: ScrollSnapshot | null) => {
    if (!storage) {
      return;
    }
    try {
      if (value === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, JSON.stringify(value));
      }
    } catch {
      // Quota exceeded or blocked storage: the in-memory snapshot still works.
    }
  };

  /** Snapshot the current position from the engine state. */
  const capture = (context: ExtensionContext<T>): ScrollSnapshot => {
    const horizontal = (context.props.value.direction || 'vertical') === 'horizontal';
    const details = context.scrollDetails.value;
    const index = horizontal ? details.currentColIndex : details.currentIndex;
    const scrollOffset = horizontal ? details.scrollOffset.x : details.scrollOffset.y;

    const captured: ScrollSnapshot = {
      index,
      offset: scrollOffset - context.methods.getItemOffset(index),
      total: context.props.value.items.length,
    };
    snapshot = captured;
    write(captured);
    return { ...captured };
  };

  return {
    name: 'snapshots',
    onInit(context: ExtensionContext<T>) {
      ctx = context;
      // A stored position may still be restorable after a reload.
      snapshot = read();
    },
    onScrollEnd(context: ExtensionContext<T>) {
      if (autoSave) {
        capture(context);
      }
    },
    save() {
      // Before initialization there is no scroll state to capture.
      return ctx ? capture(ctx) : { index: 0, offset: 0, total: 0 };
    },
    restore(target?: ScrollSnapshot | null) {
      const context = ctx;
      if (!context) {
        return false;
      }

      const wanted = normalizeSnapshot(target ?? snapshot);
      const itemCount = context.props.value.items.length;
      if (!wanted || wanted.total !== itemCount || wanted.index >= itemCount) {
        return false;
      }

      const horizontal = (context.props.value.direction || 'vertical') === 'horizontal';
      const { targetX, targetY } = context.methods.scrollToIndex(
        horizontal ? null : wanted.index,
        horizontal ? wanted.index : null,
        { align: 'start', behavior: 'auto' },
      );

      // `scrollToIndex` aligns the item start; re-apply the offset inside the item on top.
      if (wanted.offset !== 0) {
        context.methods.scrollToOffset(
          horizontal ? targetX + wanted.offset : null,
          horizontal ? null : targetY + wanted.offset,
          { behavior: 'auto' },
        );
      }

      snapshot = { ...wanted };
      return true;
    },
    clear() {
      snapshot = null;
      write(null);
    },
  };
}
