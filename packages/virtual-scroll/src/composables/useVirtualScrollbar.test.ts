import type { UseVirtualScrollbarProps } from './useVirtualScrollbar';

import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';

import { useVirtualScrollbar } from './useVirtualScrollbar';

// Helper to test composable
function setup(propsValue: UseVirtualScrollbarProps) {
  let result: ReturnType<typeof useVirtualScrollbar>;

  const TestComponent = defineComponent({
    setup() {
      result = useVirtualScrollbar(propsValue);
      return () => h('div', result.trackProps.value, [
        h('div', result.thumbProps.value),
      ]);
    },
  });
  const wrapper = mount(TestComponent);
  return { result: result!, wrapper };
}

// Mock PointerCapture APIs for JSDOM
if (typeof HTMLElement !== 'undefined') {
  HTMLElement.prototype.setPointerCapture = vi.fn();
  HTMLElement.prototype.releasePointerCapture = vi.fn();
}

describe('useVirtualScrollbar', () => {
  describe('core calculations', () => {
    it('calculates percentages correctly for vertical ltr', () => {
      const { result } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 200,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      });

      expect(result.viewportPercent.value).toBe(0.2);
      // position 200, scrollable range (1000 - 200) = 800. 200/800 = 0.25
      expect(result.positionPercent.value).toBe(0.25);
      expect(result.thumbSizePercent.value).toBe(20);
      // positionPercent * (100 - thumbSizePercent) = 0.25 * 80 = 20
      expect(result.thumbPositionPercent.value).toBe(20);

      expect(result.thumbStyle.value).toMatchObject({
        blockSize: '20%',
        insetBlockStart: '20%',
      });
    });

    it('handles small content where totalsize <= viewportsize', () => {
      const { result } = setup({
        axis: 'vertical',
        totalSize: 500,
        position: 0,
        viewportSize: 600,
        scrollToOffset: vi.fn(),
      });

      expect(result.viewportPercent.value).toBe(1);
      expect(result.positionPercent.value).toBe(0);
      expect(result.thumbSizePercent.value).toBe(100);
      expect(result.thumbPositionPercent.value).toBe(0);
    });

    it('handles totalsize <= 0', () => {
      const { result } = setup({
        axis: 'vertical',
        totalSize: 0,
        position: 0,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      });

      expect(result.viewportPercent.value).toBe(0);
    });

    it('handles viewportsize <= 0 in thumbsizepercent', () => {
      const { result } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 0,
        scrollToOffset: vi.fn(),
      });

      // When viewportSize is 0, minPercent should be 0.1, so thumbSizePercent should be 10.
      expect(result.thumbSizePercent.value).toBe(10);
    });

    it('detects rtl mode from props', () => {
      const { result } = setup({
        axis: 'horizontal',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
        isRtl: true,
      });

      expect(result.trackProps.value.style).toBeDefined();
    });
  });

  describe('reactivity', () => {
    it('updates when props change reactively', async () => {
      const position = ref(0);
      const { result } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      });

      expect(result.positionPercent.value).toBe(0);

      position.value = 400;
      await nextTick();
      expect(result.positionPercent.value).toBe(0.5);
    });
  });

  describe('track interactions', () => {
    it('calls scrolltooffset on track click (vertical)', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset,
      });

      const track = wrapper.find('.virtual-scrollbar-track');
      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 200,
        height: 100,
        left: 0,
        right: 10,
        top: 100,
        width: 10,
        x: 0,
        y: 100,
        toJSON: () => {},
      } as DOMRect);

      // Click at y=150 (50px from track top)
      // trackSize 100, thumbSize 20% = 20px
      // targetPercent = (50 - 10) / (100 - 20) = 40 / 80 = 0.5
      // scrollableRange = 800. 0.5 * 800 = 400
      await track.trigger('mousedown', { clientY: 150 });
      await nextTick();
      expect(scrollToOffset).toHaveBeenCalledWith(400);
    });

    it('calls scrolltooffset on track click (horizontal ltr)', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'horizontal',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset,
        isRtl: false,
      });

      const track = wrapper.find('.virtual-scrollbar-track');
      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 10,
        height: 10,
        left: 100,
        right: 200,
        top: 0,
        width: 100,
        x: 100,
        y: 0,
        toJSON: () => {},
      } as DOMRect);

      // Click at x=150 (50px from track left)
      await track.trigger('mousedown', { clientX: 150 });
      expect(scrollToOffset).toHaveBeenCalledWith(400);
    });

    it('calls scrolltooffset on track click (horizontal rtl)', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'horizontal',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset,
        isRtl: true,
      });

      const track = wrapper.find('.virtual-scrollbar-track');
      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 10,
        height: 10,
        left: 100,
        right: 200,
        top: 0,
        width: 100,
        x: 100,
        y: 0,
        toJSON: () => {},
      } as DOMRect);

      // Click at x=125. Since RTL, distance from right is (200 - 125) = 75px.
      // trackSize 100, thumbSize 20% = 20px
      // targetPercent = (75 - 10) / (100 - 20) = 65 / 80 = 0.8125
      // scrollableRange = 800. 0.8125 * 800 = 650
      await track.trigger('mousedown', { clientX: 125 });
      expect(scrollToOffset).toHaveBeenCalledWith(650);
    });

    it('scrolls to absolute end when clicking near the end of the track', async () => {
      const scrollToOffset = vi.fn();
      const props = {
        axis: 'vertical' as const,
        position: 0,
        scrollToOffset,
        totalSize: 1000,
        viewportSize: 500,
      };

      const { trackProps } = useVirtualScrollbar(props);

      const track = document.createElement('div');
      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        bottom: 500,
        height: 500,
        left: 0,
        right: 10,
        top: 0,
        width: 10,
      } as DOMRect);

      // Click at 499px (very bottom)
      trackProps.value.onMousedown({
        clientY: 499,
        currentTarget: track,
        target: track,
      } as unknown as MouseEvent);

      // scrollableRange = 1000 - 500 = 500.
      expect(scrollToOffset).toHaveBeenCalledWith(500);
    });
  });

  describe('thumb interactions & dragging', () => {
    it('handles dragging (vertical)', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 100,
        viewportSize: 200,
        scrollToOffset,
      });

      const thumb = wrapper.find('.virtual-scrollbar-thumb');

      vi.spyOn(wrapper.element as HTMLElement, 'getBoundingClientRect').mockReturnValue({
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

      // Mock pointer capture
      thumb.element.setPointerCapture = vi.fn();
      thumb.element.releasePointerCapture = vi.fn();

      // Start drag at y=20
      thumb.element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientY: 20, pointerId: 1 }));
      expect(thumb.element.setPointerCapture).toHaveBeenCalledWith(1);

      // Move to y=60 (delta +40)
      thumb.element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientY: 60 }));
      expect(scrollToOffset).toHaveBeenCalledWith(500);

      // End drag
      thumb.element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
      expect(thumb.element.releasePointerCapture).toHaveBeenCalledWith(1);
    });

    it('handles dragging (horizontal ltr)', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'horizontal',
        totalSize: 1000,
        position: 100,
        viewportSize: 200,
        scrollToOffset,
        isRtl: false,
      });

      const thumb = wrapper.find('.virtual-scrollbar-thumb');
      const track = wrapper.find('.virtual-scrollbar-track');

      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        bottom: 10,
        height: 10,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect);

      thumb.element.setPointerCapture = vi.fn();

      // Start drag at x=20
      thumb.element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 20, pointerId: 1 }));

      // Move to x=60 (delta +40)
      thumb.element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 60 }));
      expect(scrollToOffset).toHaveBeenCalledWith(500);
    });

    it('handles dragging (horizontal rtl)', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'horizontal',
        totalSize: 1000,
        position: 100,
        viewportSize: 200,
        scrollToOffset,
        isRtl: true,
      });

      const thumb = wrapper.find('.virtual-scrollbar-thumb');

      vi.spyOn(wrapper.element as HTMLElement, 'getBoundingClientRect').mockReturnValue({
        bottom: 10,
        height: 10,
        left: 0,
        right: 100,
        top: 0,
        width: 100,
        x: 0,
        y: 0,
        toJSON: () => {},
      } as DOMRect);

      thumb.element.setPointerCapture = vi.fn();

      // Start drag at x=80
      thumb.element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 80, pointerId: 1 }));

      // Move to x=40
      thumb.element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 40 }));
      await nextTick();
      expect(scrollToOffset).toHaveBeenCalledWith(500);
    });

    it('clamps targetoffset to scrollablecontentrange when dragging thumb to the absolute end', async () => {
      const scrollToOffset = vi.fn();
      const props = {
        axis: 'vertical' as const,
        position: 0,
        scrollToOffset,
        totalSize: 1000,
        viewportSize: 500,
      };

      const { thumbProps } = useVirtualScrollbar(props);

      const thumb = document.createElement('div');
      const track = document.createElement('div');
      track.appendChild(thumb);

      vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
        bottom: 500,
        height: 500,
        top: 0,
      } as DOMRect);

      thumbProps.value.onPointerdown({
        clientX: 0,
        clientY: 0,
        currentTarget: thumb,
        pointerId: 1,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
      } as unknown as PointerEvent);

      // Drag down 300px (more than scrollableTrackRange 250px)
      thumbProps.value.onPointermove({
        clientX: 0,
        clientY: 300,
        currentTarget: thumb,
        pointerId: 1,
      } as unknown as PointerEvent);

      expect(scrollToOffset).toHaveBeenCalledWith(500);
    });

    it('ignores thumb move when not dragging', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset,
      });

      const thumb = wrapper.find('.virtual-scrollbar-thumb');
      thumb.element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientY: 50 }));
      expect(scrollToOffset).not.toHaveBeenCalled();
    });

    it('ignores track click when thumb is clicked', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset,
      });

      const thumb = wrapper.find('.virtual-scrollbar-thumb');

      // mousedown on thumb bubbles up to track
      await thumb.trigger('mousedown');
      expect(scrollToOffset).not.toHaveBeenCalled();
    });
  });

  describe('edge cases & cleanup', () => {
    it('handles scrollabletrackrange <= 0', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset,
      });

      const thumb = wrapper.find('.virtual-scrollbar-thumb');
      const track = wrapper.find('.virtual-scrollbar-track');

      thumb.element.setPointerCapture = vi.fn();

      vi.spyOn(track.element, 'getBoundingClientRect').mockReturnValue({
        height: 0,
        width: 0,
        toJSON: () => {},
      } as DOMRect);

      thumb.element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));
      thumb.element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientY: 50 }));
      expect(scrollToOffset).not.toHaveBeenCalled();
    });

    it('handles missing track element during move', () => {
      const { wrapper } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      });

      wrapper.unmount();
    });

    it('handles move with missing parent track', async () => {
      const scrollToOffset = vi.fn();
      const { wrapper } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset,
      });

      const thumb = wrapper.find('.virtual-scrollbar-thumb');
      thumb.element.setPointerCapture = vi.fn();

      thumb.element.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, pointerId: 1 }));

      // Manually remove thumb from DOM so it has no parent
      const el = thumb.element as HTMLElement;
      const parent = el.parentElement;
      if (parent) {
        parent.removeChild(el);
      }

      thumb.element.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientY: 50 }));
      expect(scrollToOffset).not.toHaveBeenCalled();
    });

    it('handles release capture when not dragging', () => {
      const { wrapper } = setup({
        axis: 'vertical',
        totalSize: 1000,
        position: 0,
        viewportSize: 200,
        scrollToOffset: vi.fn(),
      });

      const thumb = wrapper.find('.virtual-scrollbar-thumb');
      thumb.element.releasePointerCapture = vi.fn();

      thumb.element.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
      expect(thumb.element.releasePointerCapture).not.toHaveBeenCalled();
    });
  });
});
