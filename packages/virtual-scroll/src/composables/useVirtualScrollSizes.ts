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
    sizeProp: number | number[] | ((...args: any[]) => number) | null | undefined,
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
    if (isX && Array.isArray(sizeProp) && sizeProp.length > 0) {
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
   * Initializes prefix sum trees from props (fixed sizes, width arrays, or functions).
   */
  const initializeMeasurements = () => {
    const propsVal = props.value.props;
    const newItems = propsVal.items;
    const len = newItems.length;
    const colCount = propsVal.columnCount || 0;
    const gap = propsVal.gap || 0;
    const columnGap = propsVal.columnGap || 0;
    const cw = propsVal.columnWidth;

    let colNeedsRebuild = false;
    let itemsNeedRebuild = false;

    // Initialize columns
    if (colCount > 0) {
      for (let i = 0; i < colCount; i++) {
        const currentW = columnSizes.get(i);
        const isMeasured = measuredColumns.value[ i ] === 1;

        if (!props.value.isDynamicColumnWidth || (!isMeasured && currentW === 0)) {
          let baseWidth = 0;
          if (typeof cw === 'number' && cw > 0) {
            baseWidth = cw;
          } else if (Array.isArray(cw) && cw.length > 0) {
            baseWidth = cw[ i % cw.length ] || propsVal.defaultColumnWidth || DEFAULT_COLUMN_WIDTH;
          } else if (typeof cw === 'function') {
            baseWidth = cw(i);
          } else {
            baseWidth = propsVal.defaultColumnWidth || DEFAULT_COLUMN_WIDTH;
          }

          const targetW = baseWidth + columnGap;
          if (Math.abs(currentW - targetW) > 0.5) {
            columnSizes.set(i, targetW);
            measuredColumns.value[ i ] = props.value.isDynamicColumnWidth ? 0 : 1;
            colNeedsRebuild = true;
          } else if (!props.value.isDynamicColumnWidth) {
            measuredColumns.value[ i ] = 1;
          }
        }
      }
    }

    // Initialize items
    for (let i = 0; i < len; i++) {
      const item = propsVal.items[ i ];
      const currentX = itemSizesX.get(i);
      const currentY = itemSizesY.get(i);
      const isMeasuredX = measuredItemsX.value[ i ] === 1;
      const isMeasuredY = measuredItemsY.value[ i ] === 1;

      if (props.value.direction === 'horizontal') {
        if (!props.value.isDynamicItemSize || (!isMeasuredX && currentX === 0)) {
          const baseSize = getItemBaseSize(item as T, i);
          const targetX = baseSize + columnGap;
          if (Math.abs(currentX - targetX) > 0.5) {
            itemSizesX.set(i, targetX);
            measuredItemsX.value[ i ] = props.value.isDynamicItemSize ? 0 : 1;
            itemsNeedRebuild = true;
          } else if (!props.value.isDynamicItemSize) {
            measuredItemsX.value[ i ] = 1;
          }
        }
      } else if (currentX !== 0) {
        itemSizesX.set(i, 0);
        measuredItemsX.value[ i ] = 0;
        itemsNeedRebuild = true;
      }

      if (props.value.direction !== 'horizontal') {
        if (!props.value.isDynamicItemSize || (!isMeasuredY && currentY === 0)) {
          const baseSize = getItemBaseSize(item as T, i);
          const targetY = baseSize + gap;
          if (Math.abs(currentY - targetY) > 0.5) {
            itemSizesY.set(i, targetY);
            measuredItemsY.value[ i ] = props.value.isDynamicItemSize ? 0 : 1;
            itemsNeedRebuild = true;
          } else if (!props.value.isDynamicItemSize) {
            measuredItemsY.value[ i ] = 1;
          }
        }
      } else if (currentY !== 0) {
        itemSizesY.set(i, 0);
        measuredItemsY.value[ i ] = 0;
        itemsNeedRebuild = true;
      }
    }

    if (colNeedsRebuild) {
      columnSizes.rebuild();
    }
    if (itemsNeedRebuild) {
      itemSizesX.rebuild();
      itemSizesY.rebuild();
    }
  };

  /**
   * Initializes or updates sizes based on current props and items.
   * Handles prepending of items by shifting existing measurements.
   *
   * @param onScrollCorrection - Callback to adjust scroll position when items are prepended.
   */
  const initializeSizes = (onScrollCorrection?: (addedX: number, addedY: number) => void) => {
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

      // Calculate added size
      const gap = propsVal.gap || 0;
      const columnGap = propsVal.columnGap || 0;
      let addedX = 0;
      let addedY = 0;

      for (let i = 0; i < prependCount; i++) {
        const size = getItemBaseSize(newItems[ i ] as T, i);
        if (props.value.direction === 'horizontal') {
          addedX += size + columnGap;
        } else { addedY += size + gap; }
      }

      if ((addedX > 0 || addedY > 0) && onScrollCorrection) {
        onScrollCorrection(addedX, addedY);
      }
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
    let deltaX = 0;
    let deltaY = 0;
    const propsVal = props.value.props;
    const gap = propsVal.gap || 0;
    const columnGap = propsVal.columnGap || 0;

    const firstRowIndex = getRowIndexAt(props.value.direction === 'horizontal' ? relativeScrollX : relativeScrollY);
    const firstColIndex = getColIndexAt(relativeScrollX);

    const isHorizontalMode = props.value.direction === 'horizontal';
    const isBothMode = props.value.direction === 'both';

    const processedRows = new Set<number>();
    const processedCols = new Set<number>();

    const tryUpdateColumn = (colIdx: number, width: number) => {
      if (colIdx >= 0 && colIdx < (propsVal.columnCount || 0) && !processedCols.has(colIdx)) {
        processedCols.add(colIdx);
        const oldW = columnSizes.get(colIdx);
        const targetW = width + columnGap;

        if (!measuredColumns.value[ colIdx ] || Math.abs(oldW - targetW) > 0.1) {
          const d = targetW - oldW;
          if (Math.abs(d) > 0.1) {
            columnSizes.update(colIdx, d);
            needUpdate = true;
            if (colIdx < firstColIndex && oldW > 0) {
              deltaX += d;
            }
          }
          measuredColumns.value[ colIdx ] = 1;
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
          const oldWidth = itemSizesX.get(index);
          const targetWidth = inlineSize + columnGap;
          if (!measuredItemsX.value[ index ] || Math.abs(targetWidth - oldWidth) > 0.1) {
            const d = targetWidth - oldWidth;
            itemSizesX.update(index, d);
            measuredItemsX.value[ index ] = 1;
            needUpdate = true;
            if (index < firstRowIndex && oldWidth > 0) {
              deltaX += d;
            }
          }
        }
        if (!isHorizontalMode) {
          const oldHeight = itemSizesY.get(index);
          const targetHeight = blockSize + gap;

          if (!measuredItemsY.value[ index ] || Math.abs(targetHeight - oldHeight) > 0.1) {
            const d = targetHeight - oldHeight;
            itemSizesY.update(index, d);
            measuredItemsY.value[ index ] = 1;
            needUpdate = true;
            if (index < firstRowIndex && oldHeight > 0) {
              deltaY += d;
            }
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
          const cells = Array.from(element.querySelectorAll('[data-col-index]')) as HTMLElement[];

          for (const child of cells) {
            const colIndex = Number.parseInt(child.dataset.colIndex!, 10);
            tryUpdateColumn(colIndex, child.getBoundingClientRect().width);
          }
        }
      }
    }

    if (needUpdate) {
      treeUpdateFlag.value++;
      if (deltaX !== 0 || deltaY !== 0) {
        onScrollCorrection(deltaX, deltaY);
      }
    }
  };

  /**
   * Resets all dynamic measurements and re-initializes from current props.
   *
   * @param onScrollCorrection - Callback to adjust scroll position.
   */
  const refresh = (onScrollCorrection?: (addedX: number, addedY: number) => void) => {
    itemSizesX.resize(0);
    itemSizesY.resize(0);
    columnSizes.resize(0);
    measuredColumns.value.fill(0);
    measuredItemsX.value.fill(0);
    measuredItemsY.value.fill(0);
    initializeSizes(onScrollCorrection);
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
