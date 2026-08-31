import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';

/**
 * Configuration and Paths
 */
const PAGES_DIR = 'packages/playground/pages';
const OUTPUT_DIR = 'packages/playground/public/umd';

const reReplaceEmptyLines = /\n{3,}/g;
const reReplaceTitle = /\{\{TITLE\}\}/g;
const reReplaceDescription = /\{\{DESCRIPTION\}\}/g;
const reMatchTile = /title: ['"](.*?)['"]/;
const reMatchDescription = /description: ['"](.*?)['"]/;

/**
 * Relevant pages to generate - each shows a unique feature or pattern
 */
const RELEVANT_PAGES = [
  'essential-vertical-fixed',
  'essential-vertical-dynamic',
  'essential-horizontal-fixed',
  'essential-horizontal-dynamic',
  'essential-grid-fixed',
  'essential-grid-dynamic',
  'feature-custom-scrollbar',
  'feature-infinite-scroll',
  'feature-sticky-sections',
  'pattern-chat',
  'pattern-table',
];

// Clean and recreate output directory
if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUTPUT_DIR, { recursive: true });

/**
 * Page Detection
 */
const pages = readdirSync(PAGES_DIR).filter((f) =>
  statSync(join(PAGES_DIR, f)).isDirectory()
  && RELEVANT_PAGES.includes(f),
);

/**
 * Helper to clean up generated HTML
 * - Trims trailing whitespace
 * - Ensures no more than one consecutive empty line
 */
function cleanHtml(html) {
  return `${ html
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(reReplaceEmptyLines, '\n\n')
    .trim() }\n`;
}

/**
 * Base HTML Template
 */
const baseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{TITLE}} - Virtual Scroll Stand-alone</title>

  <!-- External Styles and Scripts -->
  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@pdanpdan/virtual-scroll/dist/index.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@pdanpdan/virtual-scroll/dist/virtual-scroll.css">

  <!-- Minimal Essential Styles -->
  <style>
    [v-cloak] { display: none; }
    html, body, #app { height: 100%; margin: 0; overflow: hidden; font-family: sans-serif; }

    .example-item { display: flex; align-items: center; border-bottom: 1px solid color-mix(in oklch, var(--color-base-content), transparent 90%); padding: 0 1rem; font-size: 0.875rem; }
    .example-item--horizontal { flex-direction: column; justify-content: center; border-bottom: 0; border-right: 1px solid color-mix(in oklch, var(--color-base-content), transparent 90%); text-align: center; }
    .example-item:hover { background-color: color-mix(in oklch, var(--color-base-content), transparent 95%); }

    .example-badge { background: var(--color-neutral); color: var(--color-neutral-content); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-right: 12px; }
    .example-badge--horizontal { margin-right: 0; margin-bottom: 8px; }

    .grid-cell { display: flex; flex-direction: column; align-items: center; justify-content: center; border-right: 1px solid color-mix(in oklch, var(--color-base-content), transparent 90%); border-bottom: 1px solid color-mix(in oklch, var(--color-base-content), transparent 90%); font-size: 11px; }

    {{EXTRA_STYLE}}
  </style>

  <!-- Theme Support -->
  <script>
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = (evt) => { document.documentElement.dataset.theme = evt.matches ? "dark" : "light"; }
    updateTheme(mediaQuery);
    mediaQuery.addListener(updateTheme);
  </script>
</head>

<body>
  <div id="app" v-cloak class="max-h-dvh flex flex-col bg-base-200 text-base-content">
    <!-- Header: Title and Description -->
    <div class="px-4 py-2 bg-base-100 border-b border-base-content/10 shrink-0 flex items-center justify-between gap-4">
      <div class="min-w-0">
        <h1 class="text-lg font-black text-primary uppercase tracking-tight truncate">{{TITLE}}</h1>
        <p class="text-xs opacity-60 leading-tight truncate">{{DESCRIPTION}}</p>
      </div>

      <a href="index.html" data-vike="false" class="btn btn-xs btn-ghost gap-1 px-2 shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
        <span class="uppercase text-[10px] font-bold">Back</span>
      </a>
    </div>

    <!-- Interactive Status Bar -->
    <div class="flex items-center gap-4 p-2 bg-base-300 text-[11px] font-mono border-b border-base-content/10 shrink-0">
      <div class="flex items-center gap-1">
        <span class="opacity-50">Items:</span>
        <input v-model.number="itemCount" class="input input-xs input-bordered w-20 h-6">
      </div>

      <div v-if="direction !== 'horizontal'" class="flex items-center gap-1">
        <span class="opacity-50">Size:</span>
        <input v-model.number="itemSize" class="input input-xs input-bordered w-16 h-6">
      </div>

      <button @click="scrollToRandom" class="btn btn-xs btn-primary h-6 min-h-0 px-2 uppercase text-[10px]">Random Scroll</button>

      <div class="grow"></div>

      <div class="hidden sm:block opacity-60 uppercase tracking-tighter">
        Range: {{ scrollDetails?.range?.start }}-{{ scrollDetails?.range?.end }} |
        Offset: {{ Math.round(scrollDetails?.scrollOffset?.x || 0) }}, {{ Math.round(scrollDetails?.scrollOffset?.y || 0) }}
      </div>
    </div>

    <!-- Main Viewport Content -->
    {{CONTENT}}
  </div>

  <!-- Application Logic -->
  <script>
    const { createApp, ref, computed } = Vue;
    const { VirtualScroll } = window.VirtualScroll;

    createApp({
      setup() {
        const direction = '{{DIRECTION}}';
        const itemCount = ref(100);
        const itemSize = ref(direction === 'vertical' ? 50 : 160);
        const vs = ref(null);
        const scrollDetails = ref(null);

        const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
          id: i,
          text: 'Item ' + i,
          color: 'hsl(' + ((i * 137.5) % 360) + ', 70%, 50%)'
        })));

        const onScroll = (details) => {
          scrollDetails.value = details;
        };

        const scrollToRandom = () => {
          const idx = Math.floor(Math.random() * itemCount.value);
          vs.value?.scrollToIndex(idx, direction === 'both' ? Math.floor(Math.random() * 10) : null, { behavior: 'smooth' });
        };

        {{LOGIC}}

        return {
          itemCount,
          itemSize,
          items,
          vs,
          scrollDetails,
          onScroll,
          scrollToRandom,
          direction,
          {{EXPOSE}}
        };
      }
    })
    .component('virtual-scroll', VirtualScroll)
    .mount('#app');
  </script>
</body>
</html>`;

/**
 * Specialized configurations for specific example pages
 */
const pageConfigs = {
  'essential-grid-fixed': {
    content: `
    <virtual-scroll
      ref="vs"
      virtual-scrollbar
      class="flex-1"
      direction="both"
      :items="items"
      :item-size="itemSize"
      :column-count="100"
      :column-width="150"
      @scroll="onScroll"
    >
      <template #item="{ index, columnRange }">
        <div v-if="columnRange" class="flex h-full">
          <div v-for="col in (columnRange.end - columnRange.start)" :key="col" class="grid-cell shrink-0" style="width: 150px">
            <span class="opacity-40">R{{ index }}</span>
            <span class="font-bold">C{{ columnRange.start + col - 1 }}</span>
          </div>
        </div>
      </template>
    </virtual-scroll>
    `,
  },
  'essential-grid-dynamic': {
    content: `
    <virtual-scroll
      ref="vs"
      virtual-scrollbar
      class="flex-1"
      direction="both"
      :items="items"
      :column-count="100"
      :column-width="colSizeFn"
      @scroll="onScroll"
    >
      <template #item="{ index, columnRange, getColumnWidth }">
        <div v-if="columnRange" class="flex h-full">
          <div
            v-for="col in (columnRange.end - columnRange.start)"
            :key="col"
            class="grid-cell shrink-0"
            :data-col-index="columnRange.start + col - 1"
            :style="{ width: getColumnWidth(columnRange.start + col - 1) + 'px', height: (80 + (index % 4) * 20) + 'px' }"
          >
            <span class="opacity-40">R{{ index }}</span>
            <span class="font-bold">C{{ columnRange.start + col - 1 }}</span>
          </div>
        </div>
      </template>
    </virtual-scroll>
    `,
    logic: `
        const colSizeFn = (c) => 100 + (c % 5) * 50;
    `,
    expose: 'colSizeFn',
  },
  'essential-vertical-dynamic': {
    content: `
    <virtual-scroll
      ref="vs"
      virtual-scrollbar
      class="flex-1"
      :items="items"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="example-item" :style="{ height: (itemSize + (index % 10) * 10) + 'px' }">
          <span class="example-badge">#{{ index }}</span>
          <div class="flex flex-col">
            <span class="font-bold">Dynamic Item {{ index }}</span>
            <span class="text-[10px] opacity-50 italic">Height: {{ itemSize + (index % 10) * 10 }}px (Auto-detected)</span>
          </div>
        </div>
      </template>
    </virtual-scroll>
    `,
  },
  'essential-horizontal-fixed': {
    content: `
    <virtual-scroll
      ref="vs"
      virtual-scrollbar
      class="flex-1"
      direction="horizontal"
      :items="items"
      :item-size="itemSize"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="example-item example-item--horizontal h-full shrink-0" :style="{ width: itemSize + 'px' }">
          <span class="example-badge example-badge--horizontal">#{{ index }}</span>
          <span class="font-bold whitespace-nowrap">Fixed Item {{ index }}</span>
        </div>
      </template>
    </virtual-scroll>
    `,
  },
  'essential-horizontal-dynamic': {
    content: `
    <virtual-scroll
      ref="vs"
      virtual-scrollbar
      class="flex-1"
      direction="horizontal"
      :items="items"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="example-item example-item--horizontal h-full shrink-0" :style="{ width: (itemSize + (index % 8) * 40) + 'px' }">
          <span class="example-badge example-badge--horizontal">#{{ index }}</span>
          <div class="flex flex-col gap-1">
            <span class="font-bold whitespace-nowrap">Dynamic Item {{ index }}</span>
            <span class="text-[10px] opacity-50">Width: {{ itemSize + (index % 8) * 40 }}px</span>
          </div>
        </div>
      </template>
    </virtual-scroll>
    `,
  },
  'feature-custom-scrollbar': {
    content: `
    <virtual-scroll
      ref="vs"
      class="flex-1 custom-scrollbar"
      :items="items"
      :item-size="itemSize"
      virtual-scrollbar
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="example-item h-full">
          <span class="example-badge">#{{ index }}</span>
          <span class="font-medium">Item with custom scrollbar {{ index }}</span>
        </div>
      </template>
    </virtual-scroll>
    `,
    extraStyle: `
    .custom-scrollbar {
      --vs-scrollbar-size: 12px;
      --vs-scrollbar-bg: color-mix(in oklch, var(--color-base-content), transparent 95%);
      --vs-scrollbar-thumb-bg: var(--color-primary);
      --vs-scrollbar-radius: 6px;
    }
    `,
  },
  'feature-infinite-scroll': {
    content: `
    <virtual-scroll
      ref="vs"
      virtual-scrollbar
      class="flex-1"
      :items="infiniteItems"
      :item-size="itemSize"
      :loading="loading"
      @load="onLoad"
      @scroll="onScroll"
    >
      <template #item="{ index }">
        <div class="example-item h-full">
          <span class="example-badge">#{{ index }}</span>
          <span>Infinite Item {{ index }}</span>
        </div>
      </template>

      <template #loading>
        <div class="p-4 text-center text-primary font-bold animate-pulse uppercase text-xs tracking-widest">
          Loading more items...
        </div>
      </template>
    </virtual-scroll>
    `,
    logic: `
        const infiniteItems = ref([]);
        const loading = ref(false);
        itemCount.value = 100;
        const onLoad = () => {
          if (loading.value || infiniteItems.value.length > itemCount.value + 500) return;
          loading.value = true;
          setTimeout(() => {
            const start = infiniteItems.value.length;
            infiniteItems.value.push(...Array.from({ length: 20 }, (_, i) => start + i));
            loading.value = false;
          }, 800);
        };
        Vue.watch(itemCount, (val) => {
          infiniteItems.value = Array.from({ length: val }, (_, i) => i);
        }, { immediate: true });
    `,
    expose: 'infiniteItems, loading, onLoad',
  },
  'feature-sticky-sections': {
    content: `
    <virtual-scroll
      ref="vs"
      virtual-scrollbar
      class="flex-1"
      :items="stickyItems"
      :sticky-indices="stickyIndices"
      @scroll="onScroll"
    >
      <template #item="{ item, index, isStickyActive }">
        <div
          v-if="item.type === 'header'"
          class="bg-base-300 px-4 py-2 font-bold text-xs uppercase tracking-widest border-b border-base-content/10"
          :class="{ 'text-primary shadow-md z-10': isStickyActive }"
        >
          {{ item.text }}
        </div>
        <div v-else class="example-item" :style="{ height: itemSize + 'px' }">
          <span class="example-badge">#{{ index }}</span>
          <span>{{ item.text }}</span>
        </div>
      </template>
    </virtual-scroll>
    `,
    logic: `
        const stickyIndices = computed(() => {
          const indices = [];
          for (let i = 0; i < itemCount.value; i += 20) indices.push(i);
          return indices;
        });
        const stickyItems = computed(() => {
          const result = [];
          const indices = stickyIndices.value;
          for (let i = 0; i < itemCount.value; i++) {
            if (indices.includes(i)) {
              result.push({ type: 'header', text: 'Section ' + (Math.floor(i/20) + 1) });
            } else {
              result.push({ type: 'item', text: 'Item ' + i });
            }
          }
          return result;
        });
    `,
    expose: 'stickyItems, stickyIndices',
  },
  'pattern-chat': {
    content: `
    <virtual-scroll
      ref="vs"
      virtual-scrollbar
      class="flex-1"
      :items="messages"
      :initial-scroll-index="itemCount - 1"
      initial-scroll-align="end"
      @scroll="onScroll"
    >
      <template #item="{ item, index }">
        <div class="p-4 flex flex-col" :style="{ alignItems: index % 2 === 0 ? 'flex-end' : 'flex-start' }">
          <div
            class="chat-bubble shadow-sm max-w-[80%] p-3 rounded-lg text-sm"
            :class="index % 2 === 0 ? 'bg-primary text-primary-content' : 'bg-secondary text-secondary-content'"
          >
            <div class="text-[10px] font-bold mb-1 opacity-70">User {{ index % 2 === 0 ? 'A' : 'B' }}</div>
            <div>{{ item.text }}</div>
          </div>
        </div>
      </template>
    </virtual-scroll>
    `,
    logic: `
        const messages = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
          id: i,
          text: i % 7 === 0 ? 'This is a multi-line message to test dynamic height calculation within the virtual scroll viewport.' : 'Short message ' + i
        })));
    `,
    expose: 'messages',
  },
  'pattern-table': {
    content: `
      <div class="flex-1 overflow-hidden p-4 flex flex-col">
        <div class="flex-1 overflow-auto border border-base-content/10 rounded-box bg-base-100">
          <virtual-scroll
            ref="vs"
            virtual-scrollbar
            container-tag="table"
            wrapper-tag="tbody"
            item-tag="tr"
            :items="items"
            :item-size="itemSize"
            sticky-header
            class="table table-xs w-full min-w-200"
            style="table-layout: fixed"
            @scroll="onScroll"
          >
            <template #header>
              <tr class="bg-base-300 shadow-sm">
                <th style="width: 80px" class="text-center">ID</th>
                <th style="width: 500px">Content Description</th>
                <th style="width: 200px">Color Info</th>
              </tr>
            </template>

            <template #item="{ item, index }">
              <td style="width: 80px" class="font-mono text-center opacity-70">#{{ index }}</td>
              <td style="width: 500px" class="font-bold truncate">
                {{ item.text }} - Extended description for semantic table virtualization testing.
              </td>
              <td style="width: 200px">
                <div class="flex items-center gap-3">
                  <div class="size-3 rounded-full" :style="{ background: item.color }"></div>
                  <span class="text-[10px] font-mono opacity-60">{{ item.color }}</span>
                </div>
              </td>
            </template>
          </virtual-scroll>
        </div>
      </div>
    `,
  },
};

const links = [];

/**
 * Main Generation Loop
 * Processes each page directory and creates a stand-alone HTML file
 */
pages.forEach((page) => {
  const configPath = join(PAGES_DIR, page, '+config.ts');
  let title = page.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let description = '';

  // Extract metadata from existing playground configs
  if (existsSync(configPath)) {
    const configContent = readFileSync(configPath, 'utf-8');
    const titleMatch = configContent.match(reMatchTile);
    const descMatch = configContent.match(reMatchDescription);
    if (titleMatch) {
      title = titleMatch[ 1 ].replace(' | Virtual Scroll', '');
    }
    if (descMatch) {
      description = descMatch[ 1 ];
    }
  }

  // Fallback to a default template for items if no specific config exists
  const pageConfig = pageConfigs[ page ] || {
    content: `
    <virtual-scroll ref="vs" virtual-scrollbar class="flex-1" :direction="direction" :items="items" :item-size="itemSize" @scroll="onScroll">
      <template #item="{ index }">
        <div class="example-item h-full">
          <span class="example-badge">#{{ index }}</span>
          <span class="font-medium">Virtualized Item {{ index }}</span>
        </div>
      </template>
    </virtual-scroll>
    `,
    logic: '',
    expose: '',
    extraStyle: '',
  };

  const direction = page.includes('grid') ? 'both' : page.includes('horizontal') ? 'horizontal' : 'vertical';

  const html = baseHtml
    .replace(reReplaceTitle, title)
    .replace(reReplaceDescription, description)
    .replace('{{CONTENT}}', pageConfig.content)
    .replace('{{LOGIC}}', pageConfig.logic || '')
    .replace('{{EXPOSE}}', pageConfig.expose ? `${ pageConfig.expose },` : '')
    .replace('{{EXTRA_STYLE}}', pageConfig.extraStyle || '')
    .replace('{{DIRECTION}}', direction);

  writeFileSync(join(OUTPUT_DIR, `${ page }.html`), cleanHtml(html));
  links.push({ title, description, href: `${ page }.html` });
});

/**
 * Generate Index Page
 * Creates an entry point for all UMD examples
 */
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Virtual Scroll UMD Examples</title>

  <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>

  <style>
    html, body { height: 100%; margin: 0; background-color: var(--color-base-200); }
  </style>

  <!-- Theme Support -->
  <script>
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = (evt) => { document.documentElement.dataset.theme = evt.matches ? "dark" : "light"; }
    updateTheme(mediaQuery);
    mediaQuery.addListener(updateTheme);
  </script>
</head>

<body>
  <div class="max-w-4xl mx-auto p-4 md:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-black text-primary uppercase tracking-tighter">Virtual Scroll</h1>
      <p class="text-lg opacity-60">Stand-alone UMD Examples</p>
    </header>

    <!-- Examples Grid -->
    <div class="grid gap-4">
      ${ links.map((link) => `
        <a href="${ link.href }" data-vike="false" class="card bg-base-100 shadow-sm hover:shadow-md transition-shadow border border-base-content/5 group">
          <div class="card-body p-4 flex-row items-center justify-between">
            <div>
              <h2 class="card-title text-base font-bold group-hover:text-primary transition-colors">${ link.title }</h2>
              <p class="text-xs opacity-60">${ link.description }</p>
            </div>

            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-4 opacity-20 group-hover:opacity-100 transition-opacity">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </a>
      `).join('') }
    </div>
  </div>
</body>
</html>`;

writeFileSync(join(OUTPUT_DIR, 'index.html'), cleanHtml(indexHtml));

/**
 * Console Output
 * Prints status and llms.txt snippet
 */
console.log(`Generated minimal UMD examples in ${ OUTPUT_DIR }`);
console.log('\nAdd this to llms.txt:\n');

const llmsEntries = links
  .map((l) => `- [${ l.title }](https://pdanpdan.github.io/virtual-scroll/umd/${ l.href }): ${ l.description }`)
  .join('\n');

console.log(`## UMD Stand-alone Examples\n${ llmsEntries }`);
