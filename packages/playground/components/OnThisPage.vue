<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

// Sticky "On this page" navigation (pattern: headless-components playground).
// Two variants share the same section collection, breadcrumb and scroll spy:
// - "popup": collapsible card under the docs title card (lg+ screens)
// - "header": plain row inside the sticky mobile header, opening a dropdown
// The headless-components reference uses the CSS-only `:target-current`
// scrollspy (Chrome 140+); a rAF scroll spy is used here so the active state
// works in every browser.
const props = withDefaults(defineProps<{
  variant?: 'popup' | 'header';
}>(), {
  variant: 'popup',
});

interface TocItem {
  id: string;
  text: string;
  level: 2 | 3 | 4;
}

const tocDetailsRef = ref<HTMLDetailsElement>();
const tocListRef = ref<HTMLUListElement>();
const tocItems = ref<TocItem[]>([]);
const tocActiveId = ref<string>();
const tocActiveItem = computed(() => tocItems.value.find((item) => item.id === tocActiveId.value));
/** Breadcrumb trail of the current section: chapter (h2), then each level down to the section itself. */
const tocBreadcrumb = computed<TocItem[]>(() => {
  const active = tocActiveItem.value;
  if (!active) {
    return [];
  }
  if (active.level === 2) {
    return [ active ];
  }
  let chapter: TocItem | undefined;
  let parent: TocItem | undefined;
  for (const item of tocItems.value) {
    if (item.id === active.id) {
      break;
    }
    if (item.level === 2) {
      chapter = item;
      parent = undefined;
    } else if (item.level === 3) {
      parent = item;
    }
  }
  const crumbs: TocItem[] = [];
  if (chapter) {
    crumbs.push(chapter);
  }
  if (active.level === 4 && parent) {
    crumbs.push(parent);
  }
  crumbs.push(active);
  return crumbs;
});
/** Target elements of the TOC items, resolved once at mount. */
const tocTargets = new Map<string, Element>();
/** Viewport band (sticky bars plus breathing room) that marks a section "current". */
const TOC_STICKY_BAND = 150;
let tocRaf = 0;

function closeToc() {
  if (tocDetailsRef.value) {
    tocDetailsRef.value.open = false;
  }
}

/** Centers the active link inside the list when the popup/dropdown opens. */
function onTocToggle(event: Event) {
  const details = event.currentTarget as HTMLDetailsElement;
  if (!details.open) {
    return;
  }
  requestAnimationFrame(() => {
    const list = tocListRef.value;
    const active = list?.querySelector('.toc-link-active');
    if (!list || !active) {
      return;
    }
    const listRect = list.getBoundingClientRect();
    const linkRect = active.getBoundingClientRect();
    if (linkRect.top >= listRect.top && linkRect.bottom <= listRect.bottom) {
      return;
    }
    const delta = linkRect.top - listRect.top - (listRect.height - linkRect.height) / 2;
    list.scrollTo({ top: list.scrollTop + delta });
  });
}

function syncTocActive() {
  // The popup variant only exists on lg+ screens; skip work while hidden.
  if (props.variant === 'popup' && window.innerWidth < 1024) {
    return;
  }
  const items = tocItems.value;
  if (items.length === 0) {
    return;
  }
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll - window.scrollY <= 2) {
    tocActiveId.value = items[ items.length - 1 ]!.id;
    return;
  }
  // A section is "current" once its target has entered the sticky band (the
  // mobile header plus breathing room); the last one in document order to
  // do so wins. Rectangles are read live, so late font/layout shifts cannot
  // leave the spy pointing at a stale section.
  let activeId = items[ 0 ]!.id;
  for (const item of items) {
    const target = tocTargets.get(item.id);
    if (!target || target.getBoundingClientRect().top > TOC_STICKY_BAND) {
      break;
    }
    activeId = item.id;
  }
  tocActiveId.value = activeId;
}

function refreshTocItems() {
  const main = document.querySelector('main');
  if (!main) {
    return;
  }
  const items: TocItem[] = [];
  const targets = new Map<string, Element>();
  main.querySelectorAll<HTMLAnchorElement>('h2 > a[href^="#"], h3 > a[href^="#"], h4 > a[href^="#"]').forEach((link) => {
    const id = link.getAttribute('href')?.slice(1) ?? '';
    if (!id) {
      return;
    }
    const heading = link.parentElement;
    const tagName = heading?.tagName;
    const target = main.querySelector(`#${ CSS.escape(id) }`);
    if (target) {
      targets.set(id, target);
    }
    items.push({
      id,
      text: link.textContent?.trim() || id,
      level: tagName === 'H4' ? 4 : (tagName === 'H3' ? 3 : 2),
    });
  });
  tocItems.value = items;
  tocTargets.clear();
  targets.forEach((target, id) => tocTargets.set(id, target));
  syncTocActive();
}

function onTocScroll() {
  cancelAnimationFrame(tocRaf);
  tocRaf = requestAnimationFrame(syncTocActive);
}

onMounted(() => {
  refreshTocItems();
  window.addEventListener('scroll', onTocScroll, { passive: true });
  window.addEventListener('resize', syncTocActive);
});

onUnmounted(() => {
  window.removeEventListener('scroll', onTocScroll);
  window.removeEventListener('resize', syncTocActive);
  cancelAnimationFrame(tocRaf);
});
</script>

<template>
  <div v-if="variant === 'popup'" class="toc-popup hidden lg:block sticky top-0 z-20">
    <details
      ref="tocDetailsRef"
      class="toc-collapse collapse-arrow collapse rounded-box border border-base-300 bg-base-200/95 shadow-md backdrop-blur-sm"
      @toggle="onTocToggle"
    >
      <summary class="collapse-title min-h-0 px-4 py-2 pe-12">
        <div class="breadcrumbs text-xs @4xl:text-sm min-w-0 overflow-x-auto">
          <ul class="flex-nowrap items-center">
            <li>
              <span class="font-semibold text-base-content/70 whitespace-nowrap">On this page</span>
            </li>
            <li v-for="(crumb, index) in tocBreadcrumb" :key="crumb.id">
              <a
                v-if="index < tocBreadcrumb.length - 1"
                :href="`#${ crumb.id }`"
                class="link link-primary font-medium whitespace-nowrap"
                :title="crumb.text"
                @click="closeToc()"
              >{{ crumb.text }}</a>
              <span
                v-else
                class="font-semibold text-base-content whitespace-nowrap"
                aria-current="page"
              >{{ crumb.text }}</span>
            </li>
          </ul>
        </div>
      </summary>
      <div class="collapse-content pt-1">
        <nav aria-label="On this page">
          <ul ref="tocListRef" class="toc-list">
            <li v-for="item in tocItems" :key="item.id">
              <a
                :href="`#${ item.id }`"
                class="toc-link text-base-content/80 hover:text-base-content hover:bg-base-content/10"
                :class="[item.level === 3 ? 'ps-9' : (item.level === 4 ? 'ps-12' : 'ps-3'), { 'toc-link-active': item.id === tocActiveId }]"
                :aria-current="item.id === tocActiveId ? 'true' : undefined"
                :title="item.text"
                @click="closeToc()"
              >
                {{ item.text }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </details>
  </div>

  <div v-else class="toc-header relative border-t border-base-content/5">
    <details
      ref="tocDetailsRef"
      class="group/onpage"
      @toggle="onTocToggle"
    >
      <summary class="flex min-h-0 cursor-pointer items-center gap-2 px-4 py-2 list-none select-none">
        <div class="breadcrumbs text-xs min-w-0 flex-1 overflow-x-auto">
          <ul class="flex-nowrap items-center">
            <li>
              <span class="font-semibold text-base-content/70 whitespace-nowrap">On this page</span>
            </li>
            <li v-for="(crumb, index) in tocBreadcrumb" :key="crumb.id">
              <a
                v-if="index < tocBreadcrumb.length - 1"
                :href="`#${ crumb.id }`"
                class="link link-primary font-medium whitespace-nowrap"
                :title="crumb.text"
                @click="closeToc()"
              >{{ crumb.text }}</a>
              <span
                v-else
                class="font-semibold text-base-content whitespace-nowrap"
                aria-current="page"
              >{{ crumb.text }}</span>
            </li>
          </ul>
        </div>
        <svg
          class="size-4 shrink-0 transition-transform group-open/onpage:rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="2.5"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <div class="absolute inset-x-0 top-full z-30 max-h-[70svh] overflow-y-auto overscroll-contain border-b border-base-content/10 bg-base-200 shadow-lg">
        <nav aria-label="On this page">
          <ul ref="tocListRef" class="toc-list p-2">
            <li v-for="item in tocItems" :key="item.id">
              <a
                :href="`#${ item.id }`"
                class="toc-link text-base-content/80 hover:text-base-content hover:bg-base-content/10"
                :class="[item.level === 3 ? 'ps-9' : (item.level === 4 ? 'ps-12' : 'ps-3'), { 'toc-link-active': item.id === tocActiveId }]"
                :aria-current="item.id === tocActiveId ? 'true' : undefined"
                :title="item.text"
                @click="closeToc()"
              >
                {{ item.text }}
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </details>
  </div>
</template>

<style scoped>
/* --- popup variant: while pinned to the scrollport top, square the top
   corners against the viewport edge (Chrome 133+ scroll-state container
   query; gracefully rounded elsewhere). */
.toc-popup {
  container-type: scroll-state;
}

.toc-collapse {
  transition: border-radius 0.2s ease;
}

@container scroll-state(stuck: top) {
  .toc-popup .toc-collapse {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}

/* --- shared list styling --- */
ul.toc-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
  max-height: min(60vh, 28rem);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.toc-header ul.toc-list {
  max-height: none;
}

.toc-link {
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: var(--radius-field, 0.5rem);
  padding-block: 0.35rem;
  padding-inline-end: 0.75rem;
  font-size: 0.8rem;
  line-height: 1.25rem;
  white-space: nowrap;
  text-overflow: ellipsis;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.toc-link-active {
  background-color: color-mix(in oklab, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
  font-weight: 600;
}

/* daisyUI renders summary markers for <details>; the header variant draws its
   own chevron, so hide the default marker there. */
.toc-header summary::-webkit-details-marker {
  display: none;
}
</style>
