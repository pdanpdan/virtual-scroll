import { describe, expect, it } from 'vitest';

import { FenwickTree } from '../../src/utils/fenwick-tree';

describe('fenwickTree', () => {
  describe('initialization', () => {
    it('initializes with correct size', () => {
      const tree = new FenwickTree(5);
      expect(tree.query(5)).toBe(0);
      expect(tree.length).toBe(5);
    });
  });

  describe('updates & queries', () => {
    it('updates and queries values', () => {
      const tree = new FenwickTree(5);
      tree.update(0, 10);
      tree.update(1, 20);
      tree.update(2, 30);

      expect(tree.query(0)).toBe(0);
      expect(tree.query(1)).toBe(10);
      expect(tree.query(2)).toBe(30);
      expect(tree.query(3)).toBe(60);
    });

    it('handles updates to existing indices', () => {
      const tree = new FenwickTree(3);
      tree.update(1, 10);
      expect(tree.query(2)).toBe(10);
      tree.update(1, 5); // Add 5 to index 1
      expect(tree.query(2)).toBe(15);
    });

    it('ignores updates for out of bounds indices', () => {
      const tree = new FenwickTree(5);
      tree.update(-1, 10);
      tree.update(5, 10);
      expect(tree.query(5)).toBe(0);
    });
  });

  describe('value access', () => {
    it('returns the individual value at an index', () => {
      const tree = new FenwickTree(3);
      tree.update(0, 10);
      expect(tree.get(0)).toBe(10);
      expect(tree.get(-1)).toBe(0);
      expect(tree.get(10)).toBe(0);
    });

    it('returns the underlying values array', () => {
      const tree = new FenwickTree(3);
      tree.update(0, 10);
      tree.update(1, 20);
      const values = tree.getValues();
      expect(values).toBeInstanceOf(Float64Array);
      expect(values[ 0 ]).toBe(10);
      expect(values[ 1 ]).toBe(20);
      expect(values[ 2 ]).toBe(0);
    });
  });

  describe('rebuild & resize', () => {
    it('sets and rebuilds correctly', () => {
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

    it('resizes and preserves existing values', () => {
      const tree = new FenwickTree(5);
      tree.update(0, 10);
      tree.resize(10);
      expect(tree.query(1)).toBe(10);
      expect(tree.query(10)).toBe(10);
      tree.resize(10); // same size
    });
  });

  describe('search & bounds', () => {
    it('finds lower bound correctly', () => {
      const tree = new FenwickTree(5);
      tree.update(0, 10); // sum up to 1: 10
      tree.update(1, 10); // sum up to 2: 20
      tree.update(2, 10); // sum up to 3: 30

      expect(tree.findLowerBound(5)).toBe(0);
      expect(tree.findLowerBound(15)).toBe(1);
      expect(tree.findLowerBound(25)).toBe(2);
      expect(tree.findLowerBound(35)).toBe(5); // Returns size when not found
    });
  });

  describe('shift operations', () => {
    it('does nothing when offset is 0', () => {
      const tree = new FenwickTree(3);
      tree.update(0, 10);
      tree.shift(0);
      expect(tree.get(0)).toBe(10);
    });

    it('shifts values forward when offset is positive', () => {
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

    it('shifts values backward when offset is negative', () => {
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
