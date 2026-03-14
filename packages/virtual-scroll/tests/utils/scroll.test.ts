import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPaddingX,
  getPaddingY,
  isBody,
  isElement,
  isScrollableElement,
  isScrollToIndexOptions,
  isWindow,
  isWindowLike,
  scrollTo,
} from '../../src/utils/scroll';

describe('scroll utils', () => {
  beforeEach(() => {
    globalThis.window.scrollTo = vi.fn();
  });
  describe('element type guards', () => {
    describe('is window', () => {
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

    describe('is body', () => {
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

    describe('is window like', () => {
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

    describe('is element', () => {
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

    describe('is scrollable element', () => {
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
    describe('is scroll to index options', () => {
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
    describe('get padding x', () => {
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

    describe('get padding y', () => {
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

  describe('scrollTo utility', () => {
    it('does nothing if container is undefined', () => {
      const spy = vi.spyOn(window, 'scrollTo');
      scrollTo(undefined, { top: 100 });
      expect(spy).not.toHaveBeenCalled();
    });

    it('scrolls the window if container is null', () => {
      const spy = vi.spyOn(window, 'scrollTo');
      scrollTo(null, { top: 100 });
      expect(spy).toHaveBeenCalledWith({ top: 100 });
    });

    it('scrolls the window if container is window', () => {
      const spy = vi.spyOn(window, 'scrollTo');
      scrollTo(window, { top: 100 });
      expect(spy).toHaveBeenCalledWith({ top: 100 });
    });

    it('scrolls the window if container is document.documentElement', () => {
      const spy = vi.spyOn(window, 'scrollTo');
      scrollTo(document.documentElement, { top: 100 });
      expect(spy).toHaveBeenCalledWith({ top: 100 });
    });

    it('scrolls an element using scrollTo if available', () => {
      const el = document.createElement('div');
      const spy = vi.fn();
      el.scrollTo = spy;
      scrollTo(el, { left: 50, top: 100 });
      expect(spy).toHaveBeenCalledWith({ left: 50, top: 100 });
    });

    it('scrolls an element using scrollLeft/scrollTop if scrollTo is missing', () => {
      const el = document.createElement('div');
      // @ts-expect-error forcing missing scrollTo
      el.scrollTo = undefined;
      scrollTo(el, { left: 50, top: 100 });
      expect(el.scrollLeft).toBe(50);
      expect(el.scrollTop).toBe(100);
    });

    it('does not set undefined values on scrollLeft/scrollTop', () => {
      const el = document.createElement('div');
      el.scrollLeft = 10;
      el.scrollTop = 20;
      // @ts-expect-error forcing missing scrollTo
      el.scrollTo = undefined;
      scrollTo(el, { behavior: 'smooth' });
      expect(el.scrollLeft).toBe(10);
      expect(el.scrollTop).toBe(20);
    });
  });
});
