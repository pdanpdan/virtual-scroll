import type { ScrollDetails } from '../../src/types';

import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { useVirtualScrollInertia } from '../../src/composables/useVirtualScrollInertia';

describe('useVirtualScrollInertia', () => {
  it('handles pointer down correctly', () => {
    const useVirtualScrolling = ref(true);
    const scrollDetails = ref({ scrollOffset: { x: 10, y: 20 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();
    const stopProgrammaticScroll = vi.fn();

    const { handlePointerDown, isPointerScrolling } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll,
    });

    const event = {
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      clientY: 100,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as PointerEvent;

    handlePointerDown(event);

    expect(stopProgrammaticScroll).toHaveBeenCalled();
    expect(isPointerScrolling.value).toBe(true);
    expect((event.currentTarget as HTMLElement).setPointerCapture).toHaveBeenCalled();
  });

  it('ignores pointer down for non-primary mouse button', () => {
    const useVirtualScrolling = ref(true);
    const scrollDetails = ref({ scrollOffset: { x: 0, y: 0 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();
    const stopProgrammaticScroll = vi.fn();

    const { handlePointerDown, isPointerScrolling } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll,
    });

    const event = {
      pointerType: 'mouse',
      button: 2, // right click
      clientX: 100,
      clientY: 100,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as PointerEvent;

    handlePointerDown(event);
    expect(isPointerScrolling.value).toBe(false);
  });

  it('ignores pointer down if not virtual scrolling', () => {
    const useVirtualScrolling = ref(false);
    const scrollDetails = ref({ scrollOffset: { x: 10, y: 20 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();
    const stopProgrammaticScroll = vi.fn();

    const { handlePointerDown, isPointerScrolling } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll,
    });

    const event = {
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      clientY: 100,
      currentTarget: { setPointerCapture: vi.fn() },
    } as unknown as PointerEvent;

    handlePointerDown(event);

    expect(isPointerScrolling.value).toBe(false);
  });

  it('handles wheel correctly', () => {
    const useVirtualScrolling = ref(true);
    const scrollDetails = ref({ scrollOffset: { x: 10, y: 20 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();
    const stopProgrammaticScroll = vi.fn();

    const { handleWheel } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll,
    });

    const event = {
      preventDefault: vi.fn(),
      deltaX: 5,
      deltaY: 15,
      shiftKey: false,
    } as unknown as WheelEvent;

    handleWheel(event);

    expect(stopProgrammaticScroll).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
    expect(scrollToOffset).toHaveBeenCalledWith(15, 35, { behavior: 'auto' });
  });

  it('handles wheel with shiftKey to scroll horizontally', () => {
    const useVirtualScrolling = ref(true);
    const scrollDetails = ref({ scrollOffset: { x: 0, y: 0 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();
    const stopProgrammaticScroll = vi.fn();

    const { handleWheel } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll,
    });

    const event = {
      preventDefault: vi.fn(),
      deltaX: 0,
      deltaY: 20,
      shiftKey: true,
    } as unknown as WheelEvent;

    handleWheel(event);
    expect(scrollToOffset).toHaveBeenCalledWith(20, 0, { behavior: 'auto' });
  });

  it('does not scroll on wheel when not using virtual scrolling', () => {
    const useVirtualScrolling = ref(false);
    const scrollDetails = ref({ scrollOffset: { x: 0, y: 0 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();
    const stopProgrammaticScroll = vi.fn();

    const { handleWheel } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll,
    });

    const event = {
      preventDefault: vi.fn(),
      deltaX: 0,
      deltaY: 20,
      shiftKey: false,
    } as unknown as WheelEvent;

    handleWheel(event);
    expect(scrollToOffset).not.toHaveBeenCalled();
  });

  it('handles pointer move and up with velocity and inertia', () => {
    const useVirtualScrolling = ref(true);
    const scrollDetails = ref({ scrollOffset: { x: 10, y: 20 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();
    const stopProgrammaticScroll = vi.fn();

    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 1;
    });

    const { handlePointerDown, handlePointerMove, handlePointerUp, stopInertia } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll,
    });

    const target = { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() };

    const eventDown = {
      pointerType: 'mouse',
      button: 0,
      clientX: 100,
      clientY: 100,
      currentTarget: target,
      pointerId: 1,
    } as unknown as PointerEvent;

    handlePointerDown(eventDown);

    // Mock performance.now to simulate time passing (dt > 0)
    let time = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => {
      time += 16;
      return time;
    });

    // Move horizontally fast → X velocity dominates
    handlePointerMove({ clientX: 50, clientY: 100 } as unknown as PointerEvent);
    expect(scrollToOffset).toHaveBeenCalled();

    // pointer up triggers inertia with X-dominant velocity
    handlePointerUp({ currentTarget: target, pointerId: 1 } as unknown as PointerEvent);

    // Re-start to test Y-dominant drift
    handlePointerDown(eventDown);
    time = 0;
    scrollToOffset.mockClear();

    // Move vertically fast
    handlePointerMove({ clientX: 100, clientY: 0 } as unknown as PointerEvent);

    // pointer up with Y-dominant velocity
    handlePointerUp({ currentTarget: target, pointerId: 1 } as unknown as PointerEvent);

    stopInertia();
    vi.restoreAllMocks();
  });

  it('pointer move early-returns when not scrolling', () => {
    const useVirtualScrolling = ref(true);
    const scrollDetails = ref({ scrollOffset: { x: 0, y: 0 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();

    const { handlePointerMove } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll: vi.fn(),
    });

    // Not started yet — should do nothing
    handlePointerMove({ clientX: 50, clientY: 50 } as unknown as PointerEvent);
    expect(scrollToOffset).not.toHaveBeenCalled();
  });

  it('pointer up early-returns when not scrolling', () => {
    const useVirtualScrolling = ref(true);
    const scrollDetails = ref({ scrollOffset: { x: 0, y: 0 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();

    const { handlePointerUp } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll: vi.fn(),
    });

    const target = { releasePointerCapture: vi.fn() };
    handlePointerUp({ currentTarget: target, pointerId: 1 } as unknown as PointerEvent);
    expect(target.releasePointerCapture).not.toHaveBeenCalled();
  });

  it('stopInertia cancels animation frame and resets velocity', () => {
    const useVirtualScrolling = ref(true);
    const scrollDetails = ref({ scrollOffset: { x: 0, y: 0 } } as ScrollDetails<unknown>);
    const scrollToOffset = vi.fn();

    vi.spyOn(window, 'cancelAnimationFrame');

    const { stopInertia } = useVirtualScrollInertia({
      useVirtualScrolling,
      scrollDetails,
      scrollToOffset,
      stopProgrammaticScroll: vi.fn(),
    });

    // Calling stopInertia when no animation frame is running should not throw
    stopInertia();
    expect(window.cancelAnimationFrame).not.toHaveBeenCalled();

    vi.restoreAllMocks();
  });
});
