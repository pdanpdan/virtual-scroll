import { describe, expect, it } from 'vitest';

import { getPaddingX, getPaddingY, isBody, isElement, isScrollableElement, isScrollToIndexOptions, isWindow, isWindowLike } from './scroll';

describe('scroll utils', () => {
  describe('isWindow', () => {
    it('should return true for null', () => {
      expect(isWindow(null)).toBe(true);
    });

    it('should return true for window object', () => {
      expect(isWindow(window)).toBe(true);
    });

    it('should return false for an element', () => {
      const el = document.createElement('div');
      expect(isWindow(el)).toBe(false);
    });
  });

  describe('isBody', () => {
    it('should return true for document.body', () => {
      expect(isBody(document.body)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isBody(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isBody(undefined)).toBe(false);
    });

    it('should return false for a string', () => {
      // @ts-expect-error testing invalid input
      expect(isBody('not an object')).toBe(false);
    });

    it('should return false for a plain object', () => {
      // @ts-expect-error testing invalid input
      expect(isBody({})).toBe(false);
    });

    it('should return false for a div', () => {
      const el = document.createElement('div');
      expect(isBody(el)).toBe(false);
    });

    it('should return false for window', () => {
      expect(isBody(window)).toBe(false);
    });
  });

  describe('isWindowLike', () => {
    it('should return true for window', () => {
      expect(isWindowLike(window)).toBe(true);
    });

    it('should return true for body', () => {
      expect(isWindowLike(document.body)).toBe(true);
    });

    it('should return true for null', () => {
      expect(isWindowLike(null)).toBe(true);
    });

    it('should return false for a div', () => {
      const el = document.createElement('div');
      expect(isWindowLike(el)).toBe(false);
    });
  });

  describe('isElement', () => {
    it('should return true for a div', () => {
      const el = document.createElement('div');
      expect(isElement(el)).toBe(true);
    });

    it('should return false for window', () => {
      expect(isElement(window)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isElement(null)).toBe(false);
    });
  });

  describe('isScrollableElement', () => {
    it('should return true for a div', () => {
      const el = document.createElement('div');
      expect(isScrollableElement(el)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isScrollableElement(null)).toBe(false);
    });
  });

  describe('isScrollToIndexOptions', () => {
    it('should return true for valid options', () => {
      expect(isScrollToIndexOptions({ align: 'start' })).toBe(true);
      expect(isScrollToIndexOptions({ behavior: 'smooth' })).toBe(true);
      expect(isScrollToIndexOptions({ isCorrection: true })).toBe(true);
    });

    it('should return false for other values', () => {
      expect(isScrollToIndexOptions(null)).toBe(false);
      expect(isScrollToIndexOptions('start')).toBe(false);
      expect(isScrollToIndexOptions({})).toBe(false);
    });
  });

  describe('getPaddingX', () => {
    it('should handle numeric padding', () => {
      expect(getPaddingX(10, 'horizontal')).toBe(10);
      expect(getPaddingX(10, 'both')).toBe(10);
      expect(getPaddingX(10, 'vertical')).toBe(0);
      expect(getPaddingX(0, 'horizontal')).toBe(0);
    });

    it('should handle object padding', () => {
      expect(getPaddingX({ x: 15 }, 'vertical')).toBe(15);
      expect(getPaddingX({ y: 20 }, 'horizontal')).toBe(0);
    });

    it('should return 0 for undefined', () => {
      expect(getPaddingX(undefined)).toBe(0);
    });
  });

  describe('getPaddingY', () => {
    it('should handle numeric padding', () => {
      expect(getPaddingY(10, 'vertical')).toBe(10);
      expect(getPaddingY(10, 'both')).toBe(10);
      expect(getPaddingY(10, 'horizontal')).toBe(0);
      expect(getPaddingY(0, 'vertical')).toBe(0);
    });

    it('should handle object padding', () => {
      expect(getPaddingY({ y: 15 }, 'horizontal')).toBe(15);
      expect(getPaddingY({ x: 20 }, 'vertical')).toBe(0);
    });

    it('should return 0 for undefined', () => {
      expect(getPaddingY(undefined)).toBe(0);
    });
  });
});
