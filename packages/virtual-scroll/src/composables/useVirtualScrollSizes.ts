import type { VirtualScrollProps } from '../types';
import type { MaybeRefOrGetter } from 'vue';

import { computed, ref, shallowRef, toValue } from 'vue';

import { DEFAULT_COLUMN_WIDTH } from '../types';
import { FenwickTree } from '../utils/fenwick-tree';
import { calculatePrependCount } from '../utils/virtual-scroll-logic';

/**
 * Configuration properties for the `useVirtualScrollSizes` composable.
 */
export interface UseVirtualScrollSizesProps<T> {
  /** Reactive reference to the virtual scroll configuration. */
  props: VirtualScrollProps<T>;
  /** Whether items have dynamic heights/widths. */
  isDynamicItemSize: boolean;
  /** Whether columns have dynamic widths. */
  isDynamicColumnWidth: boolean;
  /** Fallback size for items before they are measured. */
  defaultSize: number;
  /** Fixed item size if applicable. */
  fixedItemSize: number | null;
  /** Scroll direction. */
  direction: 'vertical' | 'horizontal' | 'both';
}

/**
 * Composable for managing item and column sizes using Fenwick Trees.
 * Handles prefix sum calculations, size updates, and scroll correction adjustments.
 */
export function useVirtualScrollSizes<T>(
  propsInput: MaybeRefOrGetter<UseVirtualScrollSizesProps<T>>,
) {
  const props = computed(() => toValue(propsInput));

  /** Fenwick Tree for item widths (horizontal mode). */
  const itemSizesX = new FenwickTree(props.value.props.items?.length || 0);
  /** Fenwick Tree for item heights (vertical/both mode). */
  const itemSizesY = new FenwickTree(props.value.props.items?.length || 0);
  /** Fenwick Tree for column widths (grid mode). */
  const columnSizes = new FenwickTree(props.value.props.columnCount || 0);

  /** Track which columns have been measured (Uint8Array for memory efficiency). */
  const measuredColumns = shallowRef(new Uint8Array(0));
  /** Track which item widths have been measured. */
  const measuredItemsX = shallowRef(new Uint8Array(0));
  /** Track which item heights have been measured. */
  const measuredItemsY = shallowRef(new Uint8Array(0));

  /** Reactive flag to trigger re-computations when trees update. */
  const treeUpdateFlag = ref(0);
  /** Whether the initial sizes have been calculated. */
  const sizesInitialized = ref(false);

  /** Cached list of previous items to detect prepending and shift measurements. */
  let lastItems: T[] = [];
  /** Gap used when the current measurements were stored, for rebasing on gap changes. */
  let lastGap = 0;
  /** Column gap used when the current measurements were stored, for rebasing on column gap changes. */
  let lastColumnGap = 0;

  /**
   * Helper to get the base size of an item from props or default fallback.
   * @param item - The data item.
   * @param index - The item index.
   */
  const getItemBaseSize = (item: T, index: number) => (typeof props.value.props.itemSize === 'function' ? (props.value.props.itemSize as (item: T, index: number) => number)(item, index) : props.value.defaultSize);
  /**
   * Internal helper to get the size of an item or column at a specific index.
   *
   * @param index - The item/column index.
   * @param sizeProp - The size property from props (number, array, or function).
   * @param defaultSize - Fallback size.
   * @param gap - Spacing between items.
   * @param tree - FenwickTree for this axis.
   * @param isX - True for horizontal axis.
   * @returns The calculated size in VU.
   */
  const getSizeAt = (
    index: number,
    sizeProp: number | (number | null | undefined)[] | ((...args: any[]) => number) | null | undefined,
    defaultSize: number,
    gap: number,
    tree: FenwickTree,
    isX: boolean,
  ) => {
    // eslint-disable-next-line ts/no-unused-expressions
    treeUpdateFlag.value;

    if (typeof sizeProp === 'number' && sizeProp > 0) {
      return sizeProp;
    }
    if (Array.isArray(sizeProp) && sizeProp.length > 0) {
      const val = sizeProp[ index % sizeProp.length ];
      return (val != null && val > 0) ? val : defaultSize;
    }
    if (typeof sizeProp === 'function') {
      const item = props.value.props.items[ index ];
      return (isX && props.value.direction !== 'both') || !isX
        ? (item !== undefined ? sizeProp(item, index) : defaultSize)
        : (sizeProp as (i: number) => number)(index);
    }
    const val = tree.get(index);
    return val > 0 ? val - gap : defaultSize;
  };

  /**
   * Resizes internal arrays and Fenwick Trees while preserving existing measurements.
   *
   * @param len - New item count.
   * @param colCount - New column count.
   */
  const resizeMeasurements = (len: number, colCount: number) => {
    itemSizesX.resize(len);
    itemSizesY.resize(len);
    columnSizes.resize(colCount);

    if (measuredItemsX.value.length !== len) {
      const newMeasuredX = new Uint8Array(len);
      newMeasuredX.set(measuredItemsX.value.subarray(0, Math.min(len, measuredItemsX.value.length)));
      measuredItemsX.value = newMeasuredX;
    }
    if (measuredItemsY.value.length !== len) {
      const newMeasuredY = new Uint8Array(len);
      newMeasuredY.set(measuredItemsY.value.subarray(0, Math.min(len, measuredItemsY.value.length)));
      measuredItemsY.value = newMeasuredY;
    }
    if (measuredColumns.value.length !== colCount) {
      const newMeasuredCols = new Uint8Array(colCount);
      newMeasuredCols.set(measuredColumns.value.subarray(0, Math.min(colCount, measuredColumns.value.length)));
      measuredColumns.value = newMeasuredCols;
    }
  };

  /**
   * Helper to initialize measurements for a single axis.
   */
  const initializeAxis = (
    count: number,
    tree: FenwickTree,
    measured: Uint8Array,
    sizeProp: number | (number | null | undefined)[] | ((...args: any[]) => number) | null | undefined,
    defaultSize: number,
    gap: number,
    isDynamic: boolean,
    isX: boolean,
    shouldReset: boolean,
    prevGap: number,
  ) => {
    let needsRebuild = false;

    if (shouldReset) {
      for (let i = 0; i < count; i++) {
        if (tree.get(i) !== 0) {
          tree.set(i, 0);
          measured[ i ] = 0;
          needsRebuild = true;
        }
      }
      return needsRebuild;
    }

    for (let i = 0; i < count; i++) {
      const current = tree.get(i);
      const isMeasured = measured[ i ] === 1;

      if (!isDynamic || (!isMeasured && current === 0)) {
        const baseSize = getSizeAt(i, sizeProp, defaultSize, gap, tree, isX) + gap;

        if (Math.abs(current - baseSize) > 0.5) {
          tree.set(i, baseSize);
          measured[ i ] = isDynamic ? 0 : 1;
          needsRebuild = true;
        } else if (!isDynamic) {
          measured[ i ] = 1;
        }
      } else if (isDynamic && prevGap !== gap) {
        // Rebase stored sizes (measured size + old gap) onto the new gap.
        const adjusted = current - prevGap + gap;

        if (Math.abs(adjusted - current) > 0.5) {
          tree.set(i, adjusted);
          needsRebuild = true;
        }
      }
    }
    return needsRebuild;
  };

  /**
   * Initializes prefix sum trees from props (fixed sizes, width arrays, or functions).
   */
  const initializeMeasurements = () => {
    const propsVal = props.value.props;
    const len = propsVal.items.length;
    const colCount = propsVal.columnCount || 0;
    const gap = propsVal.gap || 0;
    const columnGap = propsVal.columnGap || 0;
    const cw = propsVal.columnWidth;
    const itemSize = propsVal.itemSize;
    const defaultColWidth = propsVal.defaultColumnWidth || DEFAULT_COLUMN_WIDTH;
    const defaultItemSize = propsVal.defaultItemSize || props.value.defaultSize;

    // Initialize columns
    const colNeedsRebuild = initializeAxis(
      colCount,
      columnSizes,
      measuredColumns.value,
      cw,
      defaultColWidth,
      columnGap,
      props.value.isDynamicColumnWidth,
      true,
      false,
      lastColumnGap,
    );

    // Initialize items X
    const itemsXNeedsRebuild = initializeAxis(
      len,
      itemSizesX,
      measuredItemsX.value,
      itemSize,
      defaultItemSize,
      columnGap,
      props.value.isDynamicItemSize,
      true,
      props.value.direction !== 'horizontal',
      lastColumnGap,
    );

    // Initialize items Y
    const itemsYNeedsRebuild = initializeAxis(
      len,
      itemSizesY,
      measuredItemsY.value,
      itemSize,
      defaultItemSize,
      gap,
      props.value.isDynamicItemSize,
      false,
      props.value.direction === 'horizontal',
      lastGap,
    );

    lastColumnGap = columnGap;
    lastGap = gap;

    if (colNeedsRebuild) {
      columnSizes.rebuild();
    }
    if (itemsXNeedsRebuild) {
      itemSizesX.rebuild();
    }
    if (itemsYNeedsRebuild) {
      itemSizesY.rebuild();
    }
  };

  /**
   * Helper to update a single size in the tree.
   */
  /**
   * Helper to update a single size in the tree.
   * @param index - Index to update.
   * @param newSize - Measured size (without gap).
   * @param tree - Target Fenwick tree.
   * @param measured - Tracking array for measurements.
   * @param gap - Gap size.
   * @param firstIndex - Current first visible index (for delta calculation).
   * @param accumulatedDelta - Object to collect scroll correction delta.
   * @param accumulatedDelta.val - The current accumulated delta value.
   */
  const updateAxis = (index: number, newSize: number, tree: FenwickTree, measured: Uint8Array, gap: number, firstIndex: number, accumulatedDelta: { val: number; }) => {
    const oldSize = tree.get(index);
    const targetSize = newSize + gap;
    let updated = false;

    if (!measured[ index ] || Math.abs(targetSize - oldSize) > 0.1) {
      const d = targetSize - oldSize;
      tree.update(index, d);
      measured[ index ] = 1;
      updated = true;
      if (index < firstIndex && oldSize > 0) {
        accumulatedDelta.val += d;
      }
    }
    return updated;
  };

  /**
   * Initializes or updates sizes based on current props and items.
   * Handles prepending of items by shifting existing measurements.
   */
  const initializeSizes = () => {
    const propsVal = props.value.props;
    const newItems = propsVal.items;
    const len = newItems.length;
    const colCount = propsVal.columnCount || 0;

    resizeMeasurements(len, colCount);

    const prependCount = propsVal.restoreScrollOnPrepend
      ? calculatePrependCount(lastItems, newItems)
      : 0;

    if (prependCount > 0) {
      itemSizesX.shift(prependCount);
      itemSizesY.shift(prependCount);

      const newMeasuredX = new Uint8Array(len);
      const newMeasuredY = new Uint8Array(len);
      newMeasuredX.set(measuredItemsX.value.subarray(0, Math.min(len - prependCount, measuredItemsX.value.length)), prependCount);
      newMeasuredY.set(measuredItemsY.value.subarray(0, Math.min(len - prependCount, measuredItemsY.value.length)), prependCount);
      measuredItemsX.value = newMeasuredX;
      measuredItemsY.value = newMeasuredY;
    }

    initializeMeasurements();

    lastItems = [ ...newItems ];
    sizesInitialized.value = true;
    treeUpdateFlag.value++;
  };

  /**
   * Updates the size of multiple items in the Fenwick tree.
   *
   * @param updates - Array of updates.
   * @param getRowIndexAt - Helper to get row index at offset (for scroll correction check).
   * @param getColIndexAt - Helper to get col index at offset.
   * @param relativeScrollX - Current relative scroll X.
   * @param relativeScrollY - Current relative scroll Y.
   * @param onScrollCorrection - Callback to adjust scroll position.
   */
  const updateItemSizes = (
    updates: Array<{ index: number; inlineSize: number; blockSize: number; element?: HTMLElement | undefined; }>,
    getRowIndexAt: (offset: number) => number,
    getColIndexAt: (offset: number) => number,
    relativeScrollX: number,
    relativeScrollY: number,
    onScrollCorrection: (deltaX: number, deltaY: number) => void,
  ) => {
    let needUpdate = false;
    const deltaX = { val: 0 };
    const deltaY = { val: 0 };
    const propsVal = props.value.props;
    const gap = propsVal.gap || 0;
    const columnGap = propsVal.columnGap || 0;

    const firstRowIndex = getRowIndexAt(props.value.direction === 'horizontal' ? relativeScrollX : relativeScrollY);
    const firstColIndex = getColIndexAt(relativeScrollX);

    const isHorizontalMode = props.value.direction === 'horizontal';
    const isBothMode = props.value.direction === 'both';

    const processedRows = new Set<number>();
    const processedCols = new Set<number>();

    /**
     * Helper to try and update a column width from an element measurement.
     * @param colIdx - Column index.
     * @param width - Measured width.
     */
    const tryUpdateColumn = (colIdx: number, width: number) => {
      if (colIdx >= 0 && colIdx < (propsVal.columnCount || 0) && !processedCols.has(colIdx)) {
        processedCols.add(colIdx);
        if (updateAxis(colIdx, width, columnSizes, measuredColumns.value, columnGap, firstColIndex, deltaX)) {
          needUpdate = true;
        }
      }
    };

    for (const { index, inlineSize, blockSize, element } of updates) {
      // Ignore 0-size measurements as they usually indicate hidden/detached elements
      if (inlineSize <= 0 && blockSize <= 0) {
        continue;
      }

      const isMeasurable = props.value.isDynamicItemSize || typeof propsVal.itemSize === 'function';
      if (index >= 0 && !processedRows.has(index) && isMeasurable && blockSize > 0) {
        processedRows.add(index);
        if (isHorizontalMode && inlineSize > 0) {
          if (updateAxis(index, inlineSize, itemSizesX, measuredItemsX.value, columnGap, firstRowIndex, deltaX)) {
            needUpdate = true;
          }
        }
        if (!isHorizontalMode) {
          if (updateAxis(index, blockSize, itemSizesY, measuredItemsY.value, gap, firstRowIndex, deltaY)) {
            needUpdate = true;
          }
        }
      }

      // Dynamic column width measurement
      const isColMeasurable = props.value.isDynamicColumnWidth || typeof propsVal.columnWidth === 'function';
      if (
        isBothMode
        && element
        && propsVal.columnCount
        && isColMeasurable
        && (inlineSize > 0 || element.dataset.colIndex === undefined)
      ) {
        const colIndexAttr = element.dataset.colIndex;
        if (colIndexAttr != null) {
          tryUpdateColumn(Number.parseInt(colIndexAttr, 10), inlineSize);
        } else {
          // If the element is a row, try to find cells with data-col-index
          const cells = [ ...element.querySelectorAll('[data-col-index]') ] as HTMLElement[];

          for (const child of cells) {
            const colIndex = Number.parseInt(child.dataset.colIndex!, 10);
            tryUpdateColumn(colIndex, child.getBoundingClientRect().width);
          }
        }
      }
    }

    if (needUpdate) {
      treeUpdateFlag.value++;
      if (deltaX.val !== 0 || deltaY.val !== 0) {
        onScrollCorrection(deltaX.val, deltaY.val);
      }
    }

    // Measurements are now stored with the current gaps; keep the baseline for rebasing.
    lastColumnGap = columnGap;
    lastGap = gap;
  };

  /**
   * Resets all dynamic measurements and re-initializes from current props.
   */
  const refresh = () => {
    itemSizesX.resize(0);
    itemSizesY.resize(0);
    columnSizes.resize(0);
    measuredColumns.value.fill(0);
    measuredItemsX.value.fill(0);
    measuredItemsY.value.fill(0);
    initializeSizes();
  };

  return {
    /** Fenwick Tree for horizontal item sizes. */
    itemSizesX,
    /** Fenwick Tree for vertical item sizes. */
    itemSizesY,
    /** Fenwick Tree for column widths. */
    columnSizes,
    /** Measured item widths. */
    measuredItemsX,
    /** Measured item heights. */
    measuredItemsY,
    /** Measured column widths. */
    measuredColumns,
    /** Flag that updates when any tree changes. */
    treeUpdateFlag,
    /** Whether sizes have been initialized. */
    sizesInitialized,
    /** Base size of an item from props. */
    getItemBaseSize,
    /** Helper to get current size at index. */
    getSizeAt,
    /** Initialize or update sizes from props. */
    initializeSizes,
    /** Update sizes of multiple items from measurements. */
    updateItemSizes,
    /** Reset all measurements. */
    refresh,
  };
}
