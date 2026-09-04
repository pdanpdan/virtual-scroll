<script setup lang="ts">
import { VirtualScrollbar } from '@pdanpdan/virtual-scroll';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * Overlay horizontal scrollbar for example lists that virtualize only the
 * vertical axis but render rows wider than the viewport (code viewer, log
 * viewer, live streaming, side-by-side diff).
 *
 * VirtualScroll draws a horizontal scrollbar only in `horizontal`/`both`
 * direction, so this component watches the example's `.virtual-scroll-container`,
 * lets the native horizontal overflow happen (rows must be laid out with
 * `contain: none` — done by the page CSS) and mirrors it as a styled scrollbar.
 */
const props = withDefaults(defineProps<{
  /** Whether the overlay should be shown; disable when native scrollbars are visible. */
  enabled?: boolean;
}>(), {
  enabled: true,
});

const barRef = ref<HTMLElement | null>(null);

const host = ref<HTMLElement | null>(null);
const viewportSize = ref(0);
const totalSize = ref(0);
const position = ref(0);
const isRtl = ref(false);

let timerId = 0;
let dirty = false;
let resizeObserver: ResizeObserver | undefined;
let mutationObserver: MutationObserver | undefined;

function scheduleSync() {
  if (dirty) {
    return;
  }
  dirty = true;
  timerId = window.setTimeout(sync, 0);
}

function sync() {
  dirty = false;
  const el = host.value;
  if (!el) {
    return;
  }
  isRtl.value = getComputedStyle(el).direction === 'rtl';
  viewportSize.value = el.clientWidth;
  totalSize.value = el.scrollWidth;
  position.value = isRtl.value ? -el.scrollLeft : el.scrollLeft;
}

function scrollToOffset(offset: number) {
  const el = host.value;
  if (!el) {
    return;
  }
  // Programmatic scrolls do not fire scroll events, so re-sync explicitly.
  el.scrollLeft = isRtl.value ? -offset : offset;
  scheduleSync();
}

const scrollable = computed(() => props.enabled && host.value !== null && totalSize.value > viewportSize.value);

onMounted(() => {
  const el = barRef.value?.parentElement?.querySelector('.virtual-scroll-container') as HTMLElement | null;
  if (!el) {
    return;
  }
  host.value = el;
  el.addEventListener('scroll', scheduleSync, { passive: true });
  window.addEventListener('resize', scheduleSync, { passive: true });
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(scheduleSync);
    resizeObserver.observe(el);
  }
  if (typeof MutationObserver !== 'undefined') {
    mutationObserver = new MutationObserver(scheduleSync);
    mutationObserver.observe(el, { childList: true, subtree: true, attributes: true });
  }
  sync();
});

onBeforeUnmount(() => {
  if (timerId) {
    clearTimeout(timerId);
  }
  host.value?.removeEventListener('scroll', scheduleSync);
  window.removeEventListener('resize', scheduleSync);
  resizeObserver?.disconnect();
  mutationObserver?.disconnect();
});
</script>

<template>
  <div ref="barRef" class="example-x-scrollbar" aria-hidden="true">
    <VirtualScrollbar
      v-if="scrollable"
      axis="horizontal"
      :total-size="totalSize"
      :position="position"
      :viewport-size="viewportSize"
      :is-rtl="isRtl"
      :container-id="host?.id"
      aria-label="Horizontal scroll"
      :scroll-to-offset="scrollToOffset"
    />
  </div>
</template>

<style scoped>
.example-x-scrollbar {
  --vsi-scrollbar-has-cross-gap: 1;
  --vsi-scrollbar-cross-gap: 12px;

  position: absolute;
  inset-block-end: 0;
  inset-inline: 0;
  z-index: 30;
  block-size: calc(var(--vs-scrollbar-size, 8px) + 2px);
  pointer-events: none;
}
</style>
