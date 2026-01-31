import { describe, expect, it } from 'vitest';

import { getPaddingX, getPaddingY, isBody, isElement, isScrollableElement, isScrollToIndexOptions, isWindow, isWindowLike } from './scroll';

describe('scroll utils', () => {
  describe('element type guards', () => {
    describe('iswindow', () => {
      it('returns true for null', () => {
        expect(isWindow(null)).toBe(true);
      });

      it('returns true for window object', () => {
        expect(isWindow(window)).toBe(true);
      });

      it('returns true for document.documentelement object', () => {
        expect(isWindow(document.documentElement)).toBe(true);
      });

      it('returns false for an element', () => {
        const el = document.createElement('div');
        expect(isWindow(el)).toBe(false);
      });

      it('returns false for undefined', () => {
        expect(isWindow(undefined)).toBe(false);
      });
    });

    describe('isbody', () => {
      it('returns true for document.body', () => {
        expect(isBody(document.body)).toBe(true);
      });

      it('returns false for null', () => {
        expect(isBody(null)).toBe(false);
      });

      it('returns false for undefined', () => {
        expect(isBody(undefined)).toBe(false);
      });

      it('returns false for a string', () => {
        // @ts-expect-error testing invalid input
        expect(isBody('not an object')).toBe(false);
      });

      it('returns false for a plain object', () => {
        // @ts-expect-error testing invalid input
        expect(isBody({})).toBe(false);
      });

      it('returns false for a div', () => {
        const el = document.createElement('div');
        expect(isBody(el)).toBe(false);
      });

      it('returns false for window', () => {
        expect(isBody(window)).toBe(false);
      });

      it('returns false for document.documentelement', () => {
        expect(isBody(document.documentElement)).toBe(false);
      });
    });

    describe('iswindowlike', () => {
      it('returns true for window', () => {
        expect(isWindowLike(window)).toBe(true);
      });

      it('returns true for document.documentelement', () => {
        expect(isWindowLike(document.documentElement)).toBe(true);
      });

      it('returns true for body', () => {
        expect(isWindowLike(document.body)).toBe(true);
      });

      it('returns true for null', () => {
        expect(isWindowLike(null)).toBe(true);
      });

      it('returns false for a div', () => {
        const el = document.createElement('div');
        expect(isWindowLike(el)).toBe(false);
      });
    });

    describe('iselement', () => {
      it('returns true for a div', () => {
        const el = document.createElement('div');
        expect(isElement(el)).toBe(true);
      });

      it('returns true for document.documentelement', () => {
        expect(isElement(document.documentElement)).toBe(true);
      });

      it('returns false for window', () => {
        expect(isElement(window)).toBe(false);
      });

      it('returns false for null', () => {
        expect(isElement(null)).toBe(false);
      });
    });

    describe('isscrollableelement', () => {
      it('returns true for a div', () => {
        const el = document.createElement('div');
        expect(isScrollableElement(el)).toBe(true);
      });

      it('returns false for null', () => {
        expect(isScrollableElement(null)).toBe(false);
      });
    });
  });

  describe('options type guards', () => {
    describe('isscrolltoindexoptions', () => {
      it('returns true for valid options', () => {
        expect(isScrollToIndexOptions({ align: 'start' })).toBe(true);
        expect(isScrollToIndexOptions({ behavior: 'smooth' })).toBe(true);
        expect(isScrollToIndexOptions({ isCorrection: true })).toBe(true);
      });

      it('returns false for other values', () => {
        expect(isScrollToIndexOptions(null)).toBe(false);
        expect(isScrollToIndexOptions('start')).toBe(false);
        expect(isScrollToIndexOptions({})).toBe(false);
      });
    });
  });

  describe('padding utilities', () => {
    describe('getpaddingx', () => {
      it('handles numeric padding', () => {
        expect(getPaddingX(10, 'horizontal')).toBe(10);
        expect(getPaddingX(10, 'both')).toBe(10);
        expect(getPaddingX(10, 'vertical')).toBe(0);
        expect(getPaddingX(0, 'horizontal')).toBe(0);
      });

      it('handles object padding', () => {
        expect(getPaddingX({ x: 15 }, 'vertical')).toBe(15);
        expect(getPaddingX({ y: 20 }, 'horizontal')).toBe(0);
      });

      it('returns 0 for undefined', () => {
        expect(getPaddingX(undefined)).toBe(0);
      });
    });

    describe('getpaddingy', () => {
      it('handles numeric padding', () => {
        expect(getPaddingY(10, 'vertical')).toBe(10);
        expect(getPaddingY(10, 'both')).toBe(10);
        expect(getPaddingY(10, 'horizontal')).toBe(0);
        expect(getPaddingY(0, 'vertical')).toBe(0);
      });

      it('handles object padding', () => {
        expect(getPaddingY({ y: 15 }, 'horizontal')).toBe(15);
        expect(getPaddingY({ x: 20 }, 'vertical')).toBe(0);
      });

      it('returns 0 for undefined', () => {
        expect(getPaddingY(undefined)).toBe(0);
      });
    });
  });
});
