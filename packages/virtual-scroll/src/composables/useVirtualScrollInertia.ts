import type { ScrollDetails, ScrollToOffsetOptions } from '../types';
import type { Ref } from 'vue';

import { ref } from 'vue';

import { calculateInertiaStep, calculateInstantaneousVelocity } from '../utils/virtual-scroll-logic';

export interface UseVirtualScrollInertiaOptions<T> {
  useVirtualScrolling: Ref<boolean>;
  scrollDetails: Ref<ScrollDetails<T>>;
  scrollToOffset: (x?: number | null, y?: number | null, options?: ScrollToOffsetOptions) => void;
  stopProgrammaticScroll: () => void;
}

export function useVirtualScrollInertia<T>({
  useVirtualScrolling,
  scrollDetails,
  scrollToOffset,
  stopProgrammaticScroll,
}: UseVirtualScrollInertiaOptions<T>) {
  /**
   * State for inertia scrolling
   */
  const isPointerScrolling = ref(false);
  let startPointerPos = { x: 0, y: 0 };
  let startScrollOffset = { x: 0, y: 0 };
  let lastPointerPos = { x: 0, y: 0 };
  let lastPointerTime = 0;
  let velocity = { x: 0, y: 0 };
  let inertiaAnimationFrame: number | null = null;

  // Friction constant (0.9 to 0.98 is usually best)
  const FRICTION = 0.95;
  const MIN_VELOCITY = 0.1;

  /**
   * Recursively animates the scroll offset based on velocity and friction.
   */
  function startInertiaAnimation() {
    const step = () => {
      const { nextVelocity, delta } = calculateInertiaStep(velocity, FRICTION);
      velocity.x = nextVelocity.x;
      velocity.y = nextVelocity.y;

      const { x: currentX, y: currentY } = scrollDetails.value.scrollOffset;

      scrollToOffset(
        currentX + delta.x,
        currentY + delta.y,
        { behavior: 'auto' },
      );

      if (Math.abs(velocity.x) > MIN_VELOCITY || Math.abs(velocity.y) > MIN_VELOCITY) {
        inertiaAnimationFrame = requestAnimationFrame(step);
      } else {
        stopInertia();
      }
    };

    inertiaAnimationFrame = requestAnimationFrame(step);
  }

  /**
   * Stops any ongoing inertia animation
   */
  function stopInertia() {
    if (inertiaAnimationFrame !== null) {
      cancelAnimationFrame(inertiaAnimationFrame);
      inertiaAnimationFrame = null;
    }
    velocity = { x: 0, y: 0 };
  }

  /**
   * Handles pointer down events on the container to start emulated scrolling when scaling is active.
   *
   * @param event - The pointer down event.
   */
  const handlePointerDown = (event: PointerEvent) => {
    stopProgrammaticScroll();
    stopInertia();

    if (!useVirtualScrolling.value) {
      return;
    }

    // Only handle primary button or touch
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    isPointerScrolling.value = true;
    startPointerPos = { x: event.clientX, y: event.clientY };
    lastPointerPos = { x: event.clientX, y: event.clientY };
    lastPointerTime = performance.now();
    startScrollOffset = {
      x: scrollDetails.value.scrollOffset.x,
      y: scrollDetails.value.scrollOffset.y,
    };

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  /**
   * Handles pointer move events on the container to perform emulated scrolling.
   *
   * @param event - The pointer move event.
   */
  const handlePointerMove = (event: PointerEvent) => {
    if (!isPointerScrolling.value) {
      return;
    }

    const now = performance.now();
    const dt = now - lastPointerTime;

    if (dt > 0) {
      const instantVelocity = calculateInstantaneousVelocity(lastPointerPos, { x: event.clientX, y: event.clientY }, dt);

      // Use a moving average for smoother velocity tracking
      velocity.x = velocity.x * 0.2 + instantVelocity.x * 0.8;
      velocity.y = velocity.y * 0.2 + instantVelocity.y * 0.8;
    }

    lastPointerPos = { x: event.clientX, y: event.clientY };
    lastPointerTime = now;

    const deltaX = startPointerPos.x - event.clientX;
    const deltaY = startPointerPos.y - event.clientY;

    requestAnimationFrame(() => {
      scrollToOffset(
        startScrollOffset.x + deltaX,
        startScrollOffset.y + deltaY,
        { behavior: 'auto' },
      );
    });
  };

  /**
   * Handles pointer up and cancel events to end emulated scrolling.
   *
   * @param event - The pointer event.
   */
  const handlePointerUp = (event: PointerEvent) => {
    if (!isPointerScrolling.value) {
      return;
    }

    isPointerScrolling.value = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);

    // If the user was moving fast enough, start the inertia loop
    if (Math.abs(velocity.x) > MIN_VELOCITY || Math.abs(velocity.y) > MIN_VELOCITY) {
      // avoid unwanted cross-axis drift
      if (Math.abs(velocity.x) > 4 * Math.abs(velocity.y)) {
        velocity.y = 0;
      } else if (Math.abs(velocity.y) > 4 * Math.abs(velocity.x)) {
        velocity.x = 0;
      }

      startInertiaAnimation();
    }
  };

  /**
   * Handles mouse wheel events to support high-precision scrolling for large content or virtual scrollbars.
   *
   * @param event - The wheel event.
   */
  const handleWheel = (event: WheelEvent) => {
    stopProgrammaticScroll();

    if (useVirtualScrolling.value) {
      event.preventDefault();

      let { deltaX, deltaY } = event;

      if (event.shiftKey && deltaX === 0) {
        deltaX = deltaY;
        deltaY = 0;
      }

      scrollToOffset(scrollDetails.value.scrollOffset.x + deltaX, scrollDetails.value.scrollOffset.y + deltaY, { behavior: 'auto' });
    }
  };

  /**
   * Follows a content-size correction while a drag is in progress.
   *
   * Drag targets are measured from the offset captured on pointer down, so a
   * measurement that shifts the content would otherwise be undone by the next
   * pointer move. Moving the captured origin by the same delta keeps the content
   * under the pointer. The inertia loop reads the live offset, so it needs no
   * adjustment.
   *
   * @param deltaX - Correction along the horizontal axis (VU).
   * @param deltaY - Correction along the vertical axis (VU).
   */
  function shiftOrigin(deltaX: number, deltaY: number) {
    if (!isPointerScrolling.value) {
      return;
    }
    startScrollOffset = {
      x: startScrollOffset.x + deltaX,
      y: startScrollOffset.y + deltaY,
    };
  }

  return {
    isPointerScrolling,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    stopInertia,
    shiftOrigin,
  };
}
