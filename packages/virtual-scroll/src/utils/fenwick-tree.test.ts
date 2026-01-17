import { describe, expect, it } from 'vitest';

import { FenwickTree } from './fenwick-tree';

describe('fenwickTree', () => {
  it('should initialize with correct size', () => {
    const tree = new FenwickTree(5);
    expect(tree.query(5)).toBe(0);
  });

  it('should update and query values', () => {
    const tree = new FenwickTree(5);
    tree.update(0, 10);
    tree.update(1, 20);
    tree.update(2, 30);

    expect(tree.query(0)).toBe(0);
    expect(tree.query(1)).toBe(10);
    expect(tree.query(2)).toBe(30);
    expect(tree.query(3)).toBe(60);
  });

  it('should handle updates to existing indices', () => {
    const tree = new FenwickTree(3);
    tree.update(1, 10);
    expect(tree.query(2)).toBe(10);
    tree.update(1, 5); // Add 5 to index 1
    expect(tree.query(2)).toBe(15);
  });

  it('should find lower bound correctly', () => {
    const tree = new FenwickTree(5);
    tree.update(0, 10); // sum up to 1: 10
    tree.update(1, 10); // sum up to 2: 20
    tree.update(2, 10); // sum up to 3: 30

    expect(tree.findLowerBound(5)).toBe(0);
    expect(tree.findLowerBound(15)).toBe(1);
    expect(tree.findLowerBound(25)).toBe(2);
    expect(tree.findLowerBound(35)).toBe(5); // Returns size when not found
  });

  it('should resize and preserve existing values', () => {
    const tree = new FenwickTree(5);
    tree.update(0, 10);
    tree.resize(10);
    expect(tree.query(1)).toBe(10);
    expect(tree.query(10)).toBe(10);
    tree.resize(10); // same size
  });

  it('should ignore updates for out of bounds indices', () => {
    const tree = new FenwickTree(5);
    tree.update(-1, 10);
    tree.update(5, 10);
    expect(tree.query(5)).toBe(0);
  });

  it('should set and rebuild correctly', () => {
    const tree = new FenwickTree(5);
    tree.set(0, 10);
    tree.set(1, 20);
    tree.set(2, 30);
    tree.set(-1, 40); // ignore
    tree.set(5, 50); // ignore
    expect(tree.query(3)).toBe(0); // not rebuilt yet
    tree.rebuild();
    expect(tree.query(3)).toBe(60);
  });

  it('should return the underlying values array', () => {
    const tree = new FenwickTree(3);
    expect(tree.length).toBe(3);
    tree.update(0, 10);
    tree.update(1, 20);
    const values = tree.getValues();
    expect(values).toBeInstanceOf(Float64Array);
    expect(values[ 0 ]).toBe(10);
    expect(values[ 1 ]).toBe(20);
    expect(values[ 2 ]).toBe(0);
    expect(tree.get(0)).toBe(10);
    expect(tree.get(-1)).toBe(0);
    expect(tree.get(10)).toBe(0);
  });

  describe('shift', () => {
    it('should do nothing when offset is 0', () => {
      const tree = new FenwickTree(3);
      tree.update(0, 10);
      tree.shift(0);
      expect(tree.get(0)).toBe(10);
    });

    it('should shift values forward when offset is positive', () => {
      const tree = new FenwickTree(5);
      tree.update(0, 10);
      tree.update(1, 20);
      tree.shift(2);
      expect(tree.get(0)).toBe(0);
      expect(tree.get(1)).toBe(0);
      expect(tree.get(2)).toBe(10);
      expect(tree.get(3)).toBe(20);
      expect(tree.query(3)).toBe(10);
      expect(tree.query(4)).toBe(30);
    });

    it('should shift values backward when offset is negative', () => {
      const tree = new FenwickTree(5);
      tree.update(2, 10);
      tree.update(3, 20);
      tree.shift(-2);
      expect(tree.get(0)).toBe(10);
      expect(tree.get(1)).toBe(20);
      expect(tree.get(2)).toBe(0);
      expect(tree.query(1)).toBe(10);
      expect(tree.query(2)).toBe(30);
    });
  });
});
