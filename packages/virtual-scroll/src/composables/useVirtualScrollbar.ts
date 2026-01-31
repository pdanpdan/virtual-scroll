import type { ScrollAxis } from '../types';
import type { MaybeRefOrGetter } from 'vue';

import { computed, getCurrentInstance, onUnmounted, ref, toValue } from 'vue';

/** Configuration properties for the `useVirtualScrollbar` composable. */
export interface UseVirtualScrollbarProps {
  /** The axis for this scrollbar. */
  axis: MaybeRefOrGetter<ScrollAxis>;
  /** Total size of the scrollable content area in display pixels (DU). */
  totalSize: MaybeRefOrGetter<number>;
  /** Current scroll position in display pixels (DU). */
  position: MaybeRefOrGetter<number>;
  /** Viewport size in display pixels (DU). */
  viewportSize: MaybeRefOrGetter<number>;
  /**
   * Function to scroll to a specific display pixel offset (DU) on this axis.
   * @param offset - The display pixel offset to scroll to.
   */
  scrollToOffset: (offset: number) => void;
  /** The ID of the container element this scrollbar controls. */
  containerId?: MaybeRefOrGetter<string | undefined>;
  /** Whether the scrollbar is in Right-to-Left (RTL) mode. */
  isRtl?: MaybeRefOrGetter<boolean>;
}

/**
 * Composable for virtual scrollbar logic.
 * Provides attributes and event listeners for track and thumb elements.
 *
 * @param props - Configuration properties.
 */
export function useVirtualScrollbar(props: UseVirtualScrollbarProps) {
  const axis = computed(() => toValue(props.axis));
  const totalSize = computed(() => toValue(props.totalSize));
  const position = computed(() => toValue(props.position));
  const viewportSize = computed(() => toValue(props.viewportSize));
  const containerId = computed(() => toValue(props.containerId));
  const isRtl = computed(() => !!toValue(props.isRtl));

  const isHorizontal = computed(() => axis.value === 'horizontal');

  const viewportPercent = computed(() => {
    if (totalSize.value <= 0) {
      return 0;
    }
    return Math.min(1, viewportSize.value / totalSize.value);
  });

  const positionPercent = computed(() => {
    const scrollableRange = totalSize.value - viewportSize.value;
    if (scrollableRange <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(1, position.value / scrollableRange));
  });

  const thumbSizePercent = computed(() => {
    // Minimum thumb size in pixels
    const minThumbSize = 20;
    const minPercent = viewportSize.value > 0 ? (minThumbSize / viewportSize.value) : 0.1;
    return Math.max(Math.min(minPercent, 0.1), viewportPercent.value) * 100;
  });
  const thumbPositionPercent = computed(() => positionPercent.value * (100 - thumbSizePercent.value));

  const thumbStyle = computed(() => {
    if (isHorizontal.value) {
      return {
        position: 'absolute' as const,
        inlineSize: `${ thumbSizePercent.value }%`,
        insetInlineStart: `${ thumbPositionPercent.value }%`,
        blockSize: '100%',
      };
    }
    return {
      position: 'absolute' as const,
      blockSize: `${ thumbSizePercent.value }%`,
      insetBlockStart: `${ thumbPositionPercent.value }%`,
      inlineSize: '100%',
    };
  });

  const trackStyle = computed(() => {
    const displayViewportSize = viewportSize.value;
    const scrollbarGap = 'var(--vs-scrollbar-has-cross-gap, var(--vsi-scrollbar-has-cross-gap, 0)) * var(--vs-scrollbar-cross-gap, var(--vsi-scrollbar-size, 8px))';
    if (isHorizontal.value) {
      return {
        inlineSize: `calc(${ Math.max(0, displayViewportSize - 4) }px - ${ scrollbarGap })`,
        position: 'absolute' as const,
        insetInlineStart: '2px',
        insetBlockEnd: '2px',
      };
    }
    return {
      blockSize: `calc(${ Math.max(0, displayViewportSize - 4) }px - ${ scrollbarGap })`,
      position: 'absolute' as const,
      insetBlockStart: '2px',
      insetInlineEnd: '2px',
    };
  });

  const isDragging = ref(false);
  let startPos = 0;
  let startScrollPos = 0;

  function handleTrackClick(event: MouseEvent) {
    const track = event.currentTarget as HTMLElement;
    if (event.target !== track) {
      return;
    }

    const rect = track.getBoundingClientRect();
    const trackSize = isHorizontal.value ? rect.width : rect.height;
    let clickPos = 0;

    if (isHorizontal.value) {
      clickPos = isRtl.value ? rect.right - event.clientX : event.clientX - rect.left;
    } else {
      clickPos = event.clientY - rect.top;
    }

    const thumbSize = (thumbSizePercent.value / 100) * trackSize;
    const targetPercent = (clickPos - thumbSize / 2) / (trackSize - thumbSize);
    const scrollableRange = totalSize.value - viewportSize.value;

    let targetOffset = targetPercent * scrollableRange;
    if (targetOffset > scrollableRange - 1) {
      targetOffset = scrollableRange;
    }

    props.scrollToOffset(Math.max(0, Math.min(scrollableRange, targetOffset)));
  }

  function handleThumbPointerDown(event: PointerEvent) {
    isDragging.value = true;
    startPos = isHorizontal.value
      ? (isRtl.value ? -event.clientX : event.clientX)
      : event.clientY;
    startScrollPos = position.value;

    const thumb = event.currentTarget as HTMLElement;
    thumb.setPointerCapture(event.pointerId);
    event.preventDefault();
    event.stopPropagation();
  }

  function handleThumbPointerMove(event: PointerEvent) {
    if (!isDragging.value) {
      return;
    }

    const thumb = event.currentTarget as HTMLElement;
    const track = thumb.parentElement;
    if (!track) {
      return;
    }

    const currentPos = isHorizontal.value
      ? (isRtl.value ? -event.clientX : event.clientX)
      : event.clientY;
    const delta = currentPos - startPos;
    const rect = track.getBoundingClientRect();
    const trackSize = isHorizontal.value ? rect.width : rect.height;
    const thumbSize = (thumbSizePercent.value / 100) * trackSize;

    const scrollableTrackRange = trackSize - thumbSize;
    if (scrollableTrackRange <= 0) {
      return;
    }

    const scrollableContentRange = totalSize.value - viewportSize.value;
    let targetOffset = startScrollPos + (delta / scrollableTrackRange) * scrollableContentRange;

    if (targetOffset > scrollableContentRange - 1) {
      targetOffset = scrollableContentRange;
    }

    props.scrollToOffset(Math.max(0, Math.min(scrollableContentRange, targetOffset)));
  }

  function handleThumbPointerUp(event: PointerEvent) {
    if (!isDragging.value) {
      return;
    }
    isDragging.value = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  if (getCurrentInstance()) {
    onUnmounted(() => {
      isDragging.value = false;
    });
  }

  const trackProps = computed(() => ({
    style: {
      ...trackStyle.value,
      pointerEvents: 'auto' as const,
    },
    role: 'scrollbar',
    'aria-orientation': axis.value,
    'aria-valuenow': Math.round(position.value),
    'aria-valuemin': 0,
    'aria-valuemax': Math.round(totalSize.value - viewportSize.value),
    'aria-controls': containerId.value,
    tabindex: -1,
    onMousedown: handleTrackClick,
  }));

  const thumbProps = computed(() => ({
    style: {
      ...thumbStyle.value,
      pointerEvents: 'auto' as const,
    },
    onPointerdown: handleThumbPointerDown,
    onPointermove: handleThumbPointerMove,
    onPointerup: handleThumbPointerUp,
    onPointercancel: handleThumbPointerUp,
  }));

  return {
    /** Viewport size as a percentage of total size (0 to 1). */
    viewportPercent,
    /** Current scroll position as a percentage of the scrollable range (0 to 1). */
    positionPercent,
    /** Calculated thumb size as a percentage of the track size (0 to 100). */
    thumbSizePercent,
    /** Calculated thumb position as a percentage of the track size (0 to 100). */
    thumbPositionPercent,
    /** Reactive style object for the scrollbar track. */
    trackStyle,
    /** Reactive style object for the scrollbar thumb. */
    thumbStyle,
    /** attributes and event listeners to be bound to the track element. */
    trackProps,
    /** attributes and event listeners to be bound to the thumb element. */
    thumbProps,
    /** Whether the thumb is currently being dragged. */
    isDragging,
  };
}
