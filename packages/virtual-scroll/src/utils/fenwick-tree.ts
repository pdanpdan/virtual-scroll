/**
 * Fenwick Tree (Binary Indexed Tree) implementation for efficient
 * prefix sum calculations and updates.
 *
 * Provides O(log n) time complexity for both point updates and prefix sum queries.
 *
 * The tree keeps an internal capacity that can exceed its logical size:
 * growing (`resize`) only fixes the BIT entries covering the appended range
 * (O(k log n) for k new items) instead of rebuilding the whole tree, and
 * shrinking only discards the dropped values. This keeps repeated appends
 * (infinite loading) cheap on very large datasets. `length` and all public
 * operations work on the logical size; memory is released on shrink-to-zero
 * or when the size drops below half the capacity.
 */
export class FenwickTree {
  private tree: Float64Array;
  private values: Float64Array;
  /** Logical number of items (prefix sums are only meaningful for indices < size). */
  private size: number;
  /** Allocated length of `values`; `tree` is one longer. */
  private capacity: number;

  /**
   * Creates a new Fenwick Tree with the specified size.
   *
   * @param size - The number of elements in the tree.
   */
  constructor(size: number = 0) {
    this.size = size;
    this.capacity = Math.max(size, 1);
    this.values = new Float64Array(this.capacity);
    this.tree = new Float64Array(this.capacity + 1);
  }

  /**
   * Update the value at a specific index and propagate changes throughout the tree.
   *
   * @param index - The 0-based index to update.
   * @param delta - The change in value (new value - old value).
   */
  update(index: number, delta: number): void {
    if (index < 0 || index >= this.size) {
      return;
    }
    this.values[ index ] = this.values[ index ]! + delta;

    index++; // 1-based index
    while (index <= this.size) {
      this.tree[ index ] = this.tree[ index ]! + delta;
      index += index & -index;
    }
  }

  /**
   * Get the prefix sum up to a specific index (exclusive).
   *
   * @param index - 0-based index. `query(n)` returns sum of values from index 0 to n-1.
   * @returns Sum of values in range [0, index).
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
   * Set the individual value at an index without updating the prefix sum tree.
   * Call `rebuild()` after multiple sets to update the tree efficiently in O(n).
   *
   * @param index - The 0-based index.
   * @param value - The new value.
   */
  set(index: number, value: number): void {
    if (index < 0 || index >= this.size) {
      return;
    }
    this.values[ index ] = value;
  }

  /**
   * Get the number of items in the tree.
   */
  get length(): number {
    return this.size;
  }

  /**
   * Get the individual value at a specific index.
   *
   * @param index - The 0-based index.
   * @returns The value at the specified index.
   */
  get(index: number): number {
    return index >= 0 && index < this.size ? this.values[ index ]! : 0;
  }

  /**
   * Get the underlying values array as a read-only Float64Array.
   *
   * @returns The read-only values array (length equals the logical tree size).
   */
  getValues(): Readonly<Float64Array> {
    return this.values.subarray(0, this.size);
  }

  /**
   * Find the largest index such that the prefix sum is less than or equal to the given value.
   * Highly efficient search used to find which item is at a specific scroll offset.
   *
   * @param value - The prefix sum value to search for.
   * @returns The 0-based index.
   */
  findLowerBound(value: number): number {
    let index = 0;
    let power = 1;
    while ((power << 1) <= this.size) {
      power <<= 1;
    }

    while (power > 0) {
      const nextIndex = index + power;
      if (nextIndex <= this.size) {
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
   * Rebuild the entire prefix sum tree from the current values array.
   * Time complexity: O(n).
   */
  rebuild(): void {
    this.tree.fill(0);
    for (let i = 0; i < this.size; i++) {
      this.tree[ i + 1 ] = this.values[ i ] || 0;
    }
    for (let i = 1; i <= this.size; i++) {
      const j = i + (i & -i);
      if (j <= this.size) {
        this.tree[ j ] = this.tree[ j ]! + this.tree[ i ]!;
      }
    }
  }

  /**
   * Resize the tree while preserving existing values and prefix sums.
   *
   * Growing is incremental: only the BIT entries covering the newly appended
   * range are recomputed (O(k log n) for k appended items) and the underlying
   * buffers are only reallocated when the capacity is exhausted (geometric
   * growth). Shrinking discards the dropped values; buffers are released when
   * the size drops to zero or below half the capacity.
   *
   * @param size - The new size of the tree.
   */
  resize(size: number): void {
    if (size === this.size) {
      return;
    }

    if (size < this.size) {
      // Drop the values past the new size so a later regrow never resurrects them.
      // BIT entries beyond the size are left in place: a regrow recomputes every
      // entry it needs, and queries past the logical size are unspecified anyway.
      this.values.fill(0, size, Math.min(this.size, this.capacity));
      if (size < this.capacity / 2) {
        // Free memory on meaningful shrink (includes size 0).
        const newCapacity = Math.max(size, 1);
        const newValues = new Float64Array(newCapacity);
        newValues.set(this.values.subarray(0, Math.min(size, newCapacity)));
        const newTree = new Float64Array(newCapacity + 1);
        newTree.set(this.tree.subarray(0, Math.min(size, newCapacity) + 1));
        this.values = newValues;
        this.tree = newTree;
        this.capacity = newCapacity;
      }
      this.size = size;
      return;
    }

    // Growing: append `size - this.size` items of value 0.
    const grownFrom = this.size;
    if (size > this.capacity) {
      const newCapacity = Math.max(size, Math.ceil(this.capacity * 1.5));
      const newValues = new Float64Array(newCapacity);
      newValues.set(this.values.subarray(0, this.size));
      const newTree = new Float64Array(newCapacity + 1);
      newTree.set(this.tree.subarray(0, this.size + 1));
      this.values = newValues;
      this.tree = newTree;
      this.capacity = newCapacity;
    } else {
      // Buffers already cover the range; clear a stale tail left by an earlier shrink.
      this.values.fill(0, this.size, Math.min(size, this.capacity));
    }

    // Fix the BIT entries newly in range. Querying prefix sums below `k` is
    // valid while ascending because entries between grownFrom and k-1 have
    // already been recomputed, and entries <= grownFrom are untouched.
    for (let k = grownFrom + 1; k <= size; k++) {
      // Appended items are all zero-valued, so prefix(k) is just query(k - 1).
      const prefixK = this.query(k - 1);
      this.tree[ k ] = prefixK - this.query(k - (k & -k));
    }

    this.size = size;
  }

  /**
   * Shift values by a given offset and rebuild the tree.
   * Useful when items are prepended to the list to maintain existing measurements.
   *
   * @param offset - Number of positions to shift. Positive for prepending (shifts right).
   */
  shift(offset: number): void {
    if (offset === 0 || this.size === 0) {
      // Nothing stored to shift (e.g. a uniform axis without a backing tree).
      return;
    }
    const size = this.size;
    const shiftAmount = Math.min(Math.abs(offset), size);
    const newValues = new Float64Array(size);
    if (offset > 0) {
      newValues.set(this.values.subarray(0, size - shiftAmount), shiftAmount);
    } else {
      newValues.set(this.values.subarray(shiftAmount, size));
    }
    this.values = newValues;
    this.capacity = Math.max(size, 1);
    this.tree = new Float64Array(this.capacity + 1);
    this.rebuild();
  }
}
