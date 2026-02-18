/**
 * Composable for virtual scrollbar logic.
 * Handles calculation of thumb position and size, track interactions, and dragging.
 */

import type { ScrollAxis } from '../types';
import type { MaybeRefOrGetter } from 'vue';

import { computed, getCurrentInstance, onUnmounted, ref, toValue } from 'vue';

/** Configuration properties for the `useVirtualScrollbar` composable. */
export interface UseVirtualScrollbarProps {
  /** The axis for this scrollbar. */
  axis: ScrollAxis;
  /** Total size of the scrollable content area in display pixels (DU). */
  totalSize: number;
  /** Current scroll position in display pixels (DU). */
  position: number;
  /** Viewport size in display pixels (DU). */
  viewportSize: number;
  /**
   * Function to scroll to a specific display pixel offset (DU) on this axis.
   * @param offset - The display pixel offset to scroll to.
   */
  scrollToOffset: (offset: number) => void;
  /** The ID of the container element this scrollbar controls. */
  containerId?: string | undefined;
  /** Whether the scrollbar is in Right-to-Left (RTL) mode. */
  isRtl?: boolean;
  /** Accessible label for the scrollbar. */
  ariaLabel?: string | undefined;
}

/**
 * Composable for virtual scrollbar logic.
 * Provides attributes and event listeners for track and thumb elements.
 *
 * @param propsInput - Configuration properties.
 */
export function useVirtualScrollbar(propsInput: MaybeRefOrGetter<UseVirtualScrollbarProps>) {
  const props = computed(() => toValue(propsInput));

  const isHorizontal = computed(() => props.value.axis === 'horizontal');

  const viewportPercent = computed(() => {
    if (props.value.totalSize <= 0) {
      return 0;
    }
    return Math.min(1, props.value.viewportSize / props.value.totalSize);
  });

  const positionPercent = computed(() => {
    const scrollableRange = props.value.totalSize - props.value.viewportSize;
    if (scrollableRange <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(1, props.value.position / scrollableRange));
  });

  const thumbSizePercent = computed(() => {
    // Minimum thumb size in pixels (32px for better touch targets and visibility)
    const minThumbSize = 32;
    const minPercent = props.value.viewportSize > 0 ? (minThumbSize / props.value.viewportSize) : 0.1;
    return Math.max(Math.min(minPercent, 0.1), viewportPercent.value) * 100;
  });
  /** Calculated thumb position as a percentage of the track size (0 to 100). */
  const thumbPositionPercent = computed(() => positionPercent.value * (100 - thumbSizePercent.value));

  /** Reactive style object for the scrollbar thumb. */
  const thumbStyle = computed(() => {
    if (isHorizontal.value) {
      return {
        inlineSize: `${ thumbSizePercent.value }%`,
        insetInlineStart: `${ thumbPositionPercent.value }%`,
      };
    }
    return {
      blockSize: `${ thumbSizePercent.value }%`,
      insetBlockStart: `${ thumbPositionPercent.value }%`,
    };
  });

  /** Reactive style object for the scrollbar track. */
  const trackStyle = computed(() => {
    const displayViewportSize = props.value.viewportSize;
    const scrollbarGap = 'var(--vs-scrollbar-has-cross-gap, var(--vsi-scrollbar-has-cross-gap, 0)) * var(--vs-scrollbar-cross-gap, var(--vsi-scrollbar-size, 8px))';

    return isHorizontal.value
      ? {
        inlineSize: `calc(${ Math.max(0, displayViewportSize - 4) }px - ${ scrollbarGap })`,
      }
      : {
        blockSize: `calc(${ Math.max(0, displayViewportSize - 4) }px - ${ scrollbarGap })`,
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
      clickPos = props.value.isRtl ? rect.right - event.clientX : event.clientX - rect.left;
    } else {
      clickPos = event.clientY - rect.top;
    }

    const thumbSize = (thumbSizePercent.value / 100) * trackSize;
    const targetPercent = (clickPos - thumbSize / 2) / (trackSize - thumbSize);
    const scrollableRange = props.value.totalSize - props.value.viewportSize;

    let targetOffset = targetPercent * scrollableRange;
    if (targetOffset > scrollableRange - 1) {
      targetOffset = scrollableRange;
    }

    props.value.scrollToOffset(Math.max(0, Math.min(scrollableRange, targetOffset)));
  }

  function handleThumbPointerDown(event: PointerEvent) {
    isDragging.value = true;
    startPos = isHorizontal.value
      ? (props.value.isRtl ? -event.clientX : event.clientX)
      : event.clientY;
    startScrollPos = props.value.position;

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
      ? (props.value.isRtl ? -event.clientX : event.clientX)
      : event.clientY;
    const delta = currentPos - startPos;
    const rect = track.getBoundingClientRect();
    const trackSize = isHorizontal.value ? rect.width : rect.height;
    const thumbSize = (thumbSizePercent.value / 100) * trackSize;

    const scrollableTrackRange = trackSize - thumbSize;
    if (scrollableTrackRange <= 0) {
      return;
    }

    const scrollableContentRange = props.value.totalSize - props.value.viewportSize;
    let targetOffset = startScrollPos + (delta / scrollableTrackRange) * scrollableContentRange;

    if (targetOffset > scrollableContentRange - 1) {
      targetOffset = scrollableContentRange;
    }

    props.value.scrollToOffset(Math.max(0, Math.min(scrollableContentRange, targetOffset)));
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
    class: [
      'virtual-scrollbar-track',
      `virtual-scrollbar-track--${ isHorizontal.value ? 'horizontal' : 'vertical' }`,
    ],
    style: trackStyle.value,
    role: 'scrollbar',
    'aria-label': props.value.ariaLabel,
    'aria-orientation': props.value.axis,
    'aria-valuenow': Math.round(props.value.position),
    'aria-valuemin': 0,
    'aria-valuemax': Math.round(props.value.totalSize - props.value.viewportSize),
    'aria-controls': props.value.containerId,
    tabindex: -1,
    onMousedown: handleTrackClick,
  }));

  const thumbProps = computed(() => ({
    class: [
      'virtual-scrollbar-thumb',
      `virtual-scrollbar-thumb--${ isHorizontal.value ? 'horizontal' : 'vertical' }`,
      {
        'virtual-scrollbar-thumb--active': isDragging.value,
      },
    ],
    style: thumbStyle.value,
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
    /** Attributes and event listeners to be bound to the track element. */
    trackProps,
    /** Attributes and event listeners to be bound to the thumb element. */
    thumbProps,
    /** Whether the thumb is currently being dragged. */
    isDragging,
  };
}
