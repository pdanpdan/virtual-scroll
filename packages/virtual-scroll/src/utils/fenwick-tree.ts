/**
 * Fenwick Tree (Binary Indexed Tree) implementation for efficient
 * prefix sum calculations and updates.
 */
export class FenwickTree {
  private tree: Float64Array;
  private values: Float64Array;

  constructor(size: number) {
    this.tree = new Float64Array(size + 1);
    this.values = new Float64Array(size);
  }

  /**
   * Update the value at a specific index and propagate changes.
   * @param index 0-based index
   * @param delta The change in value (new value - old value)
   */
  update(index: number, delta: number): void {
    if (index < 0 || index >= this.values.length) {
      return;
    }
    this.values[ index ] = this.values[ index ]! + delta;

    index++; // 1-based index
    while (index < this.tree.length) {
      this.tree[ index ] = this.tree[ index ]! + delta;
      index += index & -index;
    }
  }

  /**
   * Get the prefix sum up to a specific index (exclusive).
   * @param index 0-based index. query(n) returns sum of values from 0 to n-1.
   * @returns Sum of values in range [0, index)
   */
  query(index: number): number {
    let sum = 0;
    while (index > 0) {
      sum += this.tree[ index ] || 0;
      index -= index & -index;
    }
    return sum;
  }

  /**
   * Set the individual value at an index without updating the tree.
   * Call rebuild() after multiple sets to update the tree efficiently.
   */
  set(index: number, value: number): void {
    if (index < 0 || index >= this.values.length) {
      return;
    }
    this.values[ index ] = value;
  }

  /**
   * Get the number of items in the tree.
   */
  get length(): number {
    return this.values.length;
  }

  /**
   * Get the individual value at an index.
   */
  get(index: number): number {
    return this.values[ index ] || 0;
  }

  /**
   * Get the underlying values array.
   */
  getValues(): Readonly<Float64Array> {
    return this.values;
  }

  /**
   * Find the largest index such that the prefix sum is less than or equal to the given value.
   * Useful for finding which item is at a specific scroll offset.
   * @param value The prefix sum value to search for
   * @returns The 0-based index
   */
  findLowerBound(value: number): number {
    let index = 0;
    const len = this.tree.length;
    let power = 1 << Math.floor(Math.log2(len - 1));

    while (power > 0) {
      const nextIndex = index + power;
      if (nextIndex < len) {
        const treeVal = this.tree[ nextIndex ] || 0;
        if (treeVal <= value) {
          index = nextIndex;
          value -= treeVal;
        }
      }
      power >>= 1;
    }
    return index;
  }

  /**
   * Rebuild the entire tree from the current values array in O(N).
   * Useful after bulk updates to the values array.
   */
  rebuild(): void {
    this.tree.fill(0);
    for (let i = 0; i < this.values.length; i++) {
      this.tree[ i + 1 ] = this.values[ i ] || 0;
    }
    for (let i = 1; i < this.tree.length; i++) {
      const j = i + (i & -i);
      if (j < this.tree.length) {
        this.tree[ j ] = this.tree[ j ]! + this.tree[ i ]!;
      }
    }
  }

  /**
   * Resize the tree while preserving existing values.
   * @param size New size of the tree
   */
  resize(size: number): void {
    if (size === this.values.length) {
      return;
    }
    const newValues = new Float64Array(size);
    newValues.set(this.values.subarray(0, Math.min(size, this.values.length)));

    this.values = newValues;
    this.tree = new Float64Array(size + 1);
    this.rebuild();
  }

  /**
   * Shift values by a given offset and rebuild the tree.
   * Useful when items are prepended to the list.
   * @param offset Number of positions to shift (positive for prepending)
   */
  shift(offset: number): void {
    if (offset === 0) {
      return;
    }
    const size = this.values.length;
    const newValues = new Float64Array(size);
    if (offset > 0) {
      newValues.set(this.values.subarray(0, Math.min(size - offset, this.values.length)), offset);
    } else {
      newValues.set(this.values.subarray(-offset));
    }
    this.values = newValues;
    this.rebuild();
  }
}
