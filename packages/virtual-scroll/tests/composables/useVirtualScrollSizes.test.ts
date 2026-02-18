import type { VirtualScrollProps } from '../../src/types';
import type { Ref } from 'vue';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { computed, defineComponent, nextTick, ref } from 'vue';

import { useVirtualScrollSizes } from '../../src/composables/useVirtualScrollSizes';
import { DEFAULT_ITEM_SIZE } from '../../src/types';

interface MockItem {
  id: number;
}

function setup<T>(propsValue: VirtualScrollProps<T>) {
  const props = ref(propsValue) as Ref<VirtualScrollProps<T>>;
  let result: ReturnType<typeof useVirtualScrollSizes<T>>;

  const TestComponent = defineComponent({
    setup() {
      const isDynamicItemSize = computed(() =>
        props.value.itemSize === undefined || props.value.itemSize === null || props.value.itemSize === 0,
      );

      const isDynamicColumnWidth = computed(() =>
        props.value.columnWidth === undefined || props.value.columnWidth === null || props.value.columnWidth === 0,
      );

      const fixedItemSize = computed(() =>
        (typeof props.value.itemSize === 'number' && props.value.itemSize > 0) ? props.value.itemSize : null,
      );

      const direction = computed(() =>
        (props.value.direction === 'horizontal' || props.value.direction === 'both') ? props.value.direction : 'vertical',
      );

      const defaultSize = computed(() => props.value.defaultItemSize || fixedItemSize.value || DEFAULT_ITEM_SIZE);

      result = useVirtualScrollSizes(computed(() => ({
        props: props.value,
        isDynamicItemSize: isDynamicItemSize.value,
        isDynamicColumnWidth: isDynamicColumnWidth.value,
        defaultSize: defaultSize.value,
        fixedItemSize: fixedItemSize.value,
        direction: direction.value,
      })));
      return () => null;
    },
  });
  const wrapper = mount(TestComponent);
  return { props, result: result!, wrapper };
}

describe('useVirtualScrollSizes', () => {
  const mockItems: MockItem[] = Array.from({ length: 100 }, (_, i) => ({ id: i }));

  it('initializes sizes correctly for fixed item size', async () => {
    const { result, wrapper } = setup({
      itemSize: 50,
      items: mockItems,
    });

    result.initializeSizes();
    await nextTick();

    // Fixed size doesn't populate Fenwick tree values for item sizes if dynamic is false,
    // but initializeMeasurements logic differs.
    // If fixedItemSize is present, isDynamicItemSize is false.
    // initializeMeasurements iterates items. currentY = itemSizesY.get(i).
    // if currentY !== 0, it resets to 0.
    // So for fixed size, the trees should be empty/zero basically?
    // Wait, useVirtualScroll uses the trees even for fixed size?
    // No, useVirtualScroll checks `fixedSize !== null` and uses math instead of tree query.
    // But `initializeMeasurements` might still run.

    expect(result.sizesInitialized.value).toBe(true);
    wrapper.unmount();
  });

  it('initializes sizes correctly for dynamic item size', async () => {
    const { result, wrapper } = setup({
      itemSize: 0,
      items: mockItems,
      defaultItemSize: 40,
    });

    result.initializeSizes();
    await nextTick();

    expect(result.itemSizesY.get(0)).toBe(40);
    expect(result.itemSizesY.query(10)).toBe(400); // 10 * 40
    wrapper.unmount();
  });

  it('updates item sizes and triggers scroll correction callback', async () => {
    const onScrollCorrection = vi.fn();
    const { result, wrapper } = setup({
      itemSize: 0,
      items: mockItems,
      defaultItemSize: 40,
    });

    result.initializeSizes();
    await nextTick();

    // Mock getRowIndexAt/getColIndexAt
    const getRowIndexAt = (offset: number) => Math.floor(offset / 40);
    const getColIndexAt = () => 0;

    // Simulate update. Changing item 0 from 40 to 100.
    // relativeScrollY is 100. item 0 is at 0. So item 0 is BEFORE viewport.
    result.updateItemSizes(
      [ { index: 0, inlineSize: 100, blockSize: 100 } ],
      getRowIndexAt,
      getColIndexAt,
      0,
      100, // relativeScrollY
      onScrollCorrection,
    );

    await nextTick();

    expect(result.itemSizesY.get(0)).toBe(100);
    // Delta should be 100 - 40 = 60.
    expect(onScrollCorrection).toHaveBeenCalledWith(0, 60);
    wrapper.unmount();
  });

  it('does not trigger correction if item is after viewport', async () => {
    const onScrollCorrection = vi.fn();
    const { result, wrapper } = setup({
      itemSize: 0,
      items: mockItems,
      defaultItemSize: 40,
    });

    result.initializeSizes();
    await nextTick();

    const getRowIndexAt = () => 0; // Viewport at top
    const getColIndexAt = () => 0;

    // Update item 10. Viewport at 0. Item 10 is AFTER viewport.
    result.updateItemSizes(
      [ { index: 10, inlineSize: 100, blockSize: 100 } ],
      getRowIndexAt,
      getColIndexAt,
      0,
      0,
      onScrollCorrection,
    );

    await nextTick();

    expect(result.itemSizesY.get(10)).toBe(100);
    expect(onScrollCorrection).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('handles prepending items with scroll correction', async () => {
    const correctionSpy = vi.fn();
    const items = Array.from({ length: 10 }, (_, i) => ({ id: i }));
    const { props, result, wrapper } = setup({
      itemSize: 50,
      items,
      restoreScrollOnPrepend: true,
    });

    result.initializeSizes();
    await nextTick();

    // Prepend 2 items
    props.value.items = [ { id: -1 }, { id: -2 }, ...items ];

    result.initializeSizes(correctionSpy);
    await nextTick();

    // Should detect 2 new items. 2 * 50 = 100px.
    expect(correctionSpy).toHaveBeenCalledWith(0, 100);
    wrapper.unmount();
  });

  it('correctly handles column width updates', async () => {
    const { result, wrapper } = setup({
      direction: 'both',
      columnCount: 5,
      columnWidth: 0, // dynamic
      items: mockItems,
      defaultColumnWidth: 100,
    });

    result.initializeSizes();
    await nextTick();

    expect(result.columnSizes.get(0)).toBe(100);

    const onScrollCorrection = vi.fn();
    const getRowIndexAt = () => 0;
    const getColIndexAt = () => 1; // Viewport starts at column 1 (100px)

    // Update column 0 (before viewport)
    const rowEl = document.createElement('div');
    const cell = document.createElement('div');
    cell.dataset.colIndex = '0';
    Object.defineProperty(cell, 'getBoundingClientRect', { value: () => ({ width: 150 }) });
    rowEl.appendChild(cell);

    result.updateItemSizes(
      [ { index: 0, inlineSize: 0, blockSize: 50, element: rowEl } ],
      getRowIndexAt,
      getColIndexAt,
      100, // relativeScrollX
      0,
      onScrollCorrection,
    );

    await nextTick();

    expect(result.columnSizes.get(0)).toBe(150);
    // DeltaX = 150 - 100 = 50.
    expect(onScrollCorrection).toHaveBeenCalledWith(50, 0);
    wrapper.unmount();
  });

  it('skips scroll correction when item starts from 0 size (initialization)', async () => {
    const onScrollCorrection = vi.fn();
    const { result, wrapper } = setup({
      itemSize: 0,
      items: mockItems,
      defaultItemSize: 40,
    });

    // Manually ensure it's 0 first (simulate unmeasured state)
    // By default initializeSizes sets them to defaultItemSize if not dynamic?
    // Wait, initializeMeasurements sets them if isDynamicItemSize is false or if not measured.
    // If we want to simulate the "0 to measured" transition without default assumption:
    // Actually, updateItemSizes logic checks `oldWidth > 0` before correcting.
    // If we have defaultItemSize, it will be > 0.
    // To test the fix, we need a case where tree value is 0.
    // Fenwick tree initialized with 0s.

    // Don't call initializeSizes right away, or modify tree manually.

    // Mock getRowIndexAt/getColIndexAt
    const getRowIndexAt = () => 5; // Viewport starts at index 5
    const getColIndexAt = () => 0;

    // Item 0 is 0 size in tree initially.
    result.updateItemSizes(
      [ { index: 0, inlineSize: 100, blockSize: 100 } ],
      getRowIndexAt,
      getColIndexAt,
      200, // scrollY
      200,
      onScrollCorrection,
    );

    await nextTick();

    expect(result.itemSizesY.get(0)).toBe(100);
    // Should NOT have corrected because old size was 0
    expect(onScrollCorrection).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  it('initializes measurements with function-based column widths', async () => {
    const { result, wrapper } = setup({
      columnCount: 5,
      columnWidth: (i: number) => (i + 1) * 100,
      direction: 'both',
      items: mockItems,
    });

    result.initializeSizes();
    await nextTick();

    expect(result.columnSizes.get(0)).toBe(100);
    expect(result.columnSizes.get(1)).toBe(200);
    wrapper.unmount();
  });

  it('supports refresh method to reset all measurements', async () => {
    const { result, wrapper } = setup({
      itemSize: 50,
      items: mockItems,
    });

    result.initializeSizes();
    await nextTick();

    result.refresh();
    await nextTick();

    expect(result.sizesInitialized.value).toBe(true);
    expect(result.itemSizesY.length).toBe(mockItems.length);
    wrapper.unmount();
  });

  it('triggers scroll correction in updateItemSizes when delta is non-zero', async () => {
    const onScrollCorrection = vi.fn();
    const { result, wrapper } = setup({
      itemSize: 0,
      items: mockItems,
      defaultItemSize: 40,
    });
    result.initializeSizes();
    await nextTick();

    // Item 0 is at offset 0. Viewport is at 500. Item 0 is BEFORE viewport.
    result.updateItemSizes(
      [ { index: 0, inlineSize: 100, blockSize: 100 } ],
      (o) => Math.floor(o / 40),
      () => 0,
      0,
      500,
      onScrollCorrection,
    );
    expect(onScrollCorrection).toHaveBeenCalled();
    wrapper.unmount();
  });

  it('resets horizontal measurements when direction is vertical', async () => {
    const { result, wrapper } = setup({
      items: mockItems,
      direction: 'vertical',
    });
    // Manually set some X sizes to simulate switch or dirty state
    result.itemSizesX.set(0, 100);
    result.itemSizesX.rebuild();

    result.initializeSizes();
    await nextTick();

    expect(result.itemSizesX.get(0)).toBe(0);
    wrapper.unmount();
  });

  it('marks columns as measured when fixed width matches existing value', async () => {
    const { result, wrapper } = setup({
      columnCount: 5,
      columnWidth: 100,
      direction: 'both',
      items: mockItems,
    });

    result.initializeSizes();
    await nextTick();

    // Call initialize again. currentW (100) will match targetW (100).
    result.initializeSizes();
    await nextTick();

    expect((result as { measuredColumns: { value: Uint8Array; }; }).measuredColumns.value[ 0 ]).toBe(1);
    wrapper.unmount();
  });

  it('calculates deltaX in updateItemSizes when horizontal item is before viewport', async () => {
    const onScrollCorrection = vi.fn();
    const { result, wrapper } = setup({
      itemSize: 0,
      items: mockItems,
      defaultItemSize: 40,
      direction: 'horizontal',
    });
    result.initializeSizes();
    await nextTick();

    // firstRowIndex will be 5. item 0 is before it.
    result.updateItemSizes(
      [ { index: 0, inlineSize: 100, blockSize: 100 } ],
      () => 5,
      () => 0,
      500,
      0,
      onScrollCorrection,
    );
    expect(onScrollCorrection).toHaveBeenCalledWith(60, 0);
    wrapper.unmount();
  });
});
