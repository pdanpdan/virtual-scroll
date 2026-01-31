import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';

import VirtualScrollbar from './VirtualScrollbar.vue';

describe('virtualScrollbar', () => {
  it('renders correctly for vertical axis', () => {
    const wrapper = mount(VirtualScrollbar, {
      props: {
        axis: 'vertical',
        totalSize: 1000,
        position: 100,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      },
    });

    const track = wrapper.find('.virtual-scrollbar-track');
    expect(track.classes()).toContain('virtual-scrollbar-track--vertical');
    expect(track.attributes('role')).toBe('scrollbar');
    expect(track.attributes('aria-orientation')).toBe('vertical');

    const thumb = wrapper.find('.virtual-scrollbar-thumb');
    expect(thumb.classes()).toContain('virtual-scrollbar-thumb--vertical');

    // Viewport is 20% of total size, so thumb should be 20% (minimum is 10%)
    expect((thumb.element as HTMLElement).style.blockSize).toBe('20%');
  });

  it('renders correctly for horizontal axis', () => {
    const wrapper = mount(VirtualScrollbar, {
      props: {
        axis: 'horizontal',
        totalSize: 1000,
        position: 200,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      },
    });

    const track = wrapper.find('.virtual-scrollbar-track');
    expect(track.classes()).toContain('virtual-scrollbar-track--horizontal');

    const thumb = wrapper.find('.virtual-scrollbar-thumb');
    expect(thumb.classes()).toContain('virtual-scrollbar-thumb--horizontal');
    expect((thumb.element as HTMLElement).style.inlineSize).toBe('20%');
  });

  it('calls scrollToOffset when track is clicked', async () => {
    const scrollToOffset = vi.fn();
    const wrapper = mount(VirtualScrollbar, {
      props: {
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset,
      },
    });

    const track = wrapper.find('.virtual-scrollbar-track');

    // Mock getBoundingClientRect for track
    vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
      top: 0,
      left: 0,
      width: 10,
      height: 100,
      bottom: 100,
      right: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Click at middle of track (50px)
    // totalSize 1000, viewportSize 200, scrollableRange 800
    // thumbSize is 20% of 100px = 20px
    // targetPercent = (50 - 20/2) / (100 - 20) = 40 / 80 = 0.5
    // targetOffset = 0.5 * 800 = 400
    await track.trigger('mousedown', { clientY: 50 });

    expect(scrollToOffset).toHaveBeenCalledWith(400);
  });

  it('enforces minimum thumb size', () => {
    const wrapper = mount(VirtualScrollbar, {
      props: {
        axis: 'vertical',
        totalSize: 10000,
        position: 0,
        viewportSize: 100,
        scrollToOffset: vi.fn(),
      },
    });

    const thumb = wrapper.find('.virtual-scrollbar-thumb');
    // viewportPercent is 1%, but minimum is 10%
    expect((thumb.element as HTMLElement).style.blockSize).toBe('10%');
  });

  it('emits scroll-to-offset when clicked', async () => {
    const wrapper = mount(VirtualScrollbar, {
      props: {
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      },
    });

    const track = wrapper.find('.virtual-scrollbar-track');
    vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
      height: 100,
      left: 0,
      right: 10,
      top: 0,
      width: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    } as DOMRect);

    // Click at middle
    await track.trigger('mousedown', { clientY: 50 });
    expect(wrapper.emitted('scrollToOffset')?.[ 0 ]).toEqual([ 400 ]);
  });

  it('applies active class when dragging thumb', async () => {
    const wrapper = mount(VirtualScrollbar, {
      props: {
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      },
    });

    const thumb = wrapper.find('.virtual-scrollbar-thumb');

    // Mock setPointerCapture and releasePointerCapture
    thumb.element.setPointerCapture = vi.fn();
    thumb.element.releasePointerCapture = vi.fn();

    // Check initial state
    expect(thumb.classes()).not.toContain('virtual-scrollbar-thumb--active');

    // Start dragging
    await thumb.element.dispatchEvent(new PointerEvent('pointerdown', {
      clientY: 0,
      pointerId: 1,
      bubbles: true,
      cancelable: true,
    }));
    expect(thumb.classes()).toContain('virtual-scrollbar-thumb--active');

    // Stop dragging
    await thumb.element.dispatchEvent(new PointerEvent('pointerup', {
      pointerId: 1,
      bubbles: true,
      cancelable: true,
    }));
    expect(thumb.classes()).not.toContain('virtual-scrollbar-thumb--active');
  });
});
