import type { ScrollDetails } from '../types';
import type { Ref } from 'vue';

import { ref } from 'vue';

import { calculateInertiaStep, calculateInstantaneousVelocity } from '../utils/virtual-scroll-logic';

export interface UseVirtualScrollInertiaOptions<T> {
  useVirtualScrolling: Ref<boolean>;
  scrollDetails: Ref<ScrollDetails<T>>;
  scrollToOffset: (x?: number | null, y?: number | null, options?: { behavior?: 'auto' | 'smooth'; }) => void;
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
  // Minimum velocity to continue the animation
  const MIN_VELOCITY = 0.1;

  /**
   * Recursively animates the scroll offset based on velocity and friction.
   */
  function startInertiaAnimation() {
    const step = () => {
      const { nextVelocity, delta } = calculateInertiaStep(velocity, FRICTION);
      velocity.x = nextVelocity.x;
      velocity.y = nextVelocity.y;

      // Calculate the new scroll offset
      const { x: currentX, y: currentY } = scrollDetails.value.scrollOffset;

      // Move the scroll position by the current velocity
      scrollToOffset(
        currentX + delta.x,
        currentY + delta.y,
        { behavior: 'auto' },
      );

      // Continue animation if we haven't slowed down to a halt
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
    stopInertia(); // Stop any existing momentum

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
      // Calculate instantaneous velocity (pixels per millisecond)
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
      // Prevent default browser scroll as we are handling it manually
      event.preventDefault();

      // For large content we manually scroll to keep precision/control
      let { deltaX, deltaY } = event;

      if (event.shiftKey && deltaX === 0) {
        deltaX = deltaY;
        deltaY = 0;
      }

      scrollToOffset(scrollDetails.value.scrollOffset.x + deltaX, scrollDetails.value.scrollOffset.y + deltaY, { behavior: 'auto' });
    }
  };

  return {
    isPointerScrolling,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
    stopInertia,
  };
}
