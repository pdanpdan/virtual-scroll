/* eslint-disable no-template-curly-in-string -- code generator emits template-literal syntax inside string literals */
/**
 * Generates complete, runnable code from a ConfiguratorState.
 *
 * Three outputs, all self-contained:
 * - `generateSfc(state, 'component')` — SFC using the `VirtualScroll` component.
 * - `generateSfc(state, 'composable')` — SFC using `useVirtualScroll` (+ extensions).
 * - `generateStandaloneHtml` / `generateCodePenForState` — no-build UMD page, saveable as a
 *   file or pushable to CodePen via the prefill API.
 *
 * All modes share the same data layer (Lorem API or local generation), item template and styles.
 */

import type { ConfiguratorState, SizeMode } from './state';

import { getDerived } from './state';

export type GenerateMode = 'component' | 'composable';

const LOREM_API = 'https://lorem-api.com/api/lorem';
const GITHUB_REPO = 'https://github.com/pdanpdan/virtual-scroll';
const CDN_VUE = 'https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js';
const CDN_VS_JS = 'https://cdn.jsdelivr.net/npm/@pdanpdan/virtual-scroll/dist/index.js';
const CDN_VS_CSS = 'https://cdn.jsdelivr.net/npm/@pdanpdan/virtual-scroll/dist/virtual-scroll.css';

export interface CodePenPayload {
  title: string;
  html: string;
  css: string;
  js: string;
  /** CodePen 2.0 JS preprocessor: 'none' | 'typescript' | 'vue' */
  jsPreProcessor: 'none' | 'typescript' | 'vue';
  /** Semicolon-separated external scripts (CodePen prefill format). */
  jsExternal: string[];
  /** Semicolon-separated external stylesheets (CodePen prefill format). */
  cssExternal: string[];
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function join(lines: Array<string | false | null | undefined>): string {
  return lines.filter((line): line is string => Boolean(line)).join('\n');
}

function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

/** Indents every line of a multi-line fragment. */
function indentBlock(fragment: string, indent: string): string {
  return fragment
    .split('\n')
    .map((line) => (line ? `${ indent }${ line }` : line))
    .join('\n');
}

// ---------------------------------------------------------------------------
// data model + data source fragments (shared by all outputs)
// ---------------------------------------------------------------------------

function dataModelScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  const lines: string[] = [];

  if (isTs) {
    lines.push(
      '// --- Data model ---',
      'interface Item {',
      `  id: number;${ derived.hasSections ? '\n  type?: \'header\' | \'item\';' : '' }`,
      '  text: string;',
      '}',
      '',
    );
  }

  lines.push(`const ITEM_COUNT = ${ state.itemCount };`);
  if (derived.hasSections) {
    lines.push(`const ITEMS_PER_SECTION = ${ state.itemsPerSection };`);
  }

  return join(lines);
}

function sectionHelpers(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  if (!derived.hasSections) {
    return '';
  }
  const p = isTs ? '(index: number): boolean' : '(index)';
  const l = isTs ? '(index: number): string' : '(index)';
  const m = isTs ? '(index: number, text: string): Item' : '(index, text)';
  return join([
    `function isSectionHeader${ p } {`,
    '  return index % (ITEMS_PER_SECTION + 1) === 0;',
    '}',
    '',
    `function sectionLabel${ l } {`,
    '  return `Section ${ Math.floor(index / (ITEMS_PER_SECTION + 1)) + 1 }`;',
    '}',
    '',
    `function makeItem${ m } {`,
    '  return isSectionHeader(index)',
    '    ? { id: index, type: \'header\', text: sectionLabel(index) }',
    '    : { id: index, type: \'item\', text };',
    '}',
    '',
  ]);
}

function dataSourceScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  const lines: string[] = [];
  const fc = isTs ? '(count: number): Promise<string[]>' : '(count)';
  const cc = isTs ? '(start: number, count: number): Promise<Item[]>' : '(start, count)';
  const cb = isTs ? '(text: string, i: number) => ' : '(text, i) => ';
  const cbl = isTs ? '(_, i: number) => ' : '(_, i) => ';

  if (state.dataSource === 'lorem') {
    lines.push(
      '// Placeholder text fetched from https://lorem-api.com',
      `const LOREM_API = '${ LOREM_API }';`,
      `const LOREM_SENTENCES = ${ state.loremSentences };`,
      '',
      '// One request asks for the paragraphs needed; the response is split',
      '// by ". " (paragraphs are newline-separated) and regrouped so each',
      '// item gets LOREM_SENTENCES of them.',
      'const MAX_PARAGRAPHS_PER_REQUEST = 500;',
      '',
      `async function fetchLoremTexts${ fc } {`,
      '  // The API returns ~3 sentences per paragraph, so ask for half.',
      '  const paragraphs = Math.min(MAX_PARAGRAPHS_PER_REQUEST, Math.ceil((count * LOREM_SENTENCES) / 2));',
      '  const response = await fetch(`${ LOREM_API }?paragraphs=${ paragraphs }`);',
      '  const text = (await response.text()).trim().replace(/\\n/g, " ");',
      '  const sentences = text.split(". ").map((sentence) => sentence.replace(/\\.$/, "")).filter(Boolean);',
      '  if (sentences.length === 0) {',
      '    return Array.from({ length: count }, (_, i) => `Item ${ i }`);',
      '  }',
      '  // When more sentences are needed than fetched, reuse them cyclically.',
      '  return Array.from({ length: count }, (_, i) => {',
      '    const start = (i * LOREM_SENTENCES) % sentences.length;',
      '    const end = start + LOREM_SENTENCES;',
      '    const parts = end <= sentences.length',
      '      ? sentences.slice(start, end)',
      '      : [ ...sentences.slice(start), ...sentences.slice(0, end - sentences.length) ];',
      '    return `${ parts.join(". ") }.`;',
      '  });',
      '}',
      '',
    );
  }

  if (state.dataSource === 'lorem') {
    lines.push(
      `async function createItems${ cc } {`,
      '  const texts = await fetchLoremTexts(count);',
      `  return texts.map(${ cb }${ derived.hasSections ? 'makeItem(start + i, text)' : '({ id: start + i, text })' });`,
      '}',
    );
  } else {
    lines.push(
      `function createItems${ cc } {`,
      `  return Promise.resolve(Array.from({ length: count }, ${ cbl }${ derived.hasSections ? 'makeItem(start + i, `Item ${ start + i }`)' : '({ id: start + i, text: `Item ${ start + i }` })' }));`,
      '}',
    );
  }

  return join(lines);
}

function prependScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  if (!state.restoreOnPrepend) {
    return '';
  }
  const lines: string[] = [
    '// --- Prepend restoration (chat-style "load older") ---',
    'let prependIndex = -1;',
    ...(state.dataSource === 'lorem' ? [] : [ 'let prependCount = 0;' ]),
    '',
    'async function prependItems() {',
    '  const count = 5;',
  ];

  if (state.dataSource === 'lorem') {
    lines.push(
      '  const texts = await fetchLoremTexts(count);',
      `  const newItems = texts.map(${ isTs ? '(text: string, i: number) => ' : '(text, i) => ' }({ id: prependIndex - i, type: ${ derived.hasSections ? (isTs ? "'item' as const" : "'item'") : 'undefined' }, text }));`,
      '  prependIndex -= count;',
    );
  } else {
    lines.push(
      `  const newItems = Array.from({ length: count }, ${ isTs ? '(_, i: number) => ' : '(_, i) => ' }({`,
      '    id: prependIndex - i,',
      `    type: ${ derived.hasSections ? (isTs ? "'item' as const" : "'item'") : 'undefined' },`,
      '    text: `Prepended ${ prependCount + i }`,',
      '  }));',
      '  prependIndex -= count;',
      '  prependCount += count;',
    );
  }

  lines.push(
    '  items.value = [ ...newItems, ...items.value ];',
    '}',
  );

  return join(lines);
}

function stickyIndicesScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  if (!derived.hasSections) {
    return '';
  }
  return join([
    '// --- Sticky section header indices ---',
    'const stickyIndices = computed(() => {',
    isTs ? '  const indices: number[] = [];' : '  const indices = [];',
    '  for (let i = 0; i < items.value.length; i += ITEMS_PER_SECTION + 1) {',
    '    indices.push(i);',
    '  }',
    '  return indices;',
    '});',
  ]);
}

function infiniteScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  if (!state.infiniteScroll) {
    return '';
  }
  const dl = isTs ? "(direction: 'vertical' | 'horizontal')" : '(direction)';
  return join([
    '// --- Infinite loading ---',
    `const LOAD_CHUNK = ${ state.loadChunk };`,
    '// The demo source is finite: once the limit is reached there is no more',
    '// data, so the loading slot is hidden (see the v-if on the #loading slot).',
    'const TOTAL_ITEMS = ITEM_COUNT * 5;',
    'const hasMore = ref(true);',
    '',
    'async function loadMore() {',
    '  if (loading.value || !hasMore.value) {',
    '    return;',
    '  }',
    '  loading.value = true;',
    '  const start = items.value.length;',
    '  if (start >= TOTAL_ITEMS) {',
    '    hasMore.value = false;',
    '    loading.value = false;',
    '    return;',
    '  }',
    '  items.value = [ ...items.value, ...await createItems(start, Math.min(LOAD_CHUNK, TOTAL_ITEMS - start)) ];',
    '  loading.value = false;',
    '}',
    '',
    `async function onLoad${ dl } {`,
    "  if (direction === 'vertical' || direction === 'horizontal') {",
    '    await loadMore();',
    '  }',
    '}',
  ]);
}

// ---------------------------------------------------------------------------
// configuration fragments
// ---------------------------------------------------------------------------

function sizeExpression(sizeMode: SizeMode, base: number, alt: number, min: number, max: number, item: boolean, isTs: boolean): string {
  const step = Math.max(1, Math.round((max - min) / 4));
  switch (sizeMode) {
    case 'fixed':
      return `${ base }`;
    case 'pattern':
      return `[${ base }, ${ alt }]`;
    case 'function':
      return isTs
        ? item
          ? `(_item: Item, index: number) => ${ min } + (index % ${ step }) * 4`
          : `(index: number) => ${ min } + (index % ${ step }) * 4`
        : `(item, index) => ${ min } + (index % ${ step }) * 4`;
    case 'dynamic':
      return 'null';
  }
}

function configPropsScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean, indent: string, composable: boolean): string {
  const lines: string[] = [];
  const push = (key: string, value: string, comment?: string) => {
    lines.push(`${ indent }${ key }: ${ value },${ comment ? ` // ${ comment }` : '' }`);
  };
  // Component-only props (not part of VirtualScrollProps): scrollbars and sticky slots
  // are wired manually in composable mode.
  if (composable) {
    lines.push(`${ indent }// scrollbars + sticky header/footer are wired below in composable mode`);
  }

  push('items', 'items.value');
  push('direction', `'${ state.direction }'`);
  push('itemSize', sizeExpression(state.itemSizeMode, state.itemSizeBase, state.itemSizeAlt, state.itemSizeMin, state.itemSizeMax, true, isTs));
  push('bufferBefore', `${ state.bufferBefore }`);
  push('bufferAfter', `${ state.bufferAfter }`);
  push('gap', `${ state.gap }`);
  if (derived.isGrid) {
    push('columnCount', `${ state.columnCount }`);
    push('columnWidth', sizeExpression(state.columnWidthMode, state.columnWidthBase, state.columnWidthAlt, state.columnWidthMin, state.columnWidthMax, false, isTs));
    push('columnGap', `${ state.columnGap }`);
  }
  if (state.itemSizeMode === 'dynamic') {
    push('defaultItemSize', `${ state.defaultItemSize }`);
  }
  if (derived.isGrid && state.columnWidthMode === 'dynamic') {
    push('defaultColumnWidth', `${ state.defaultColumnWidth }`);
  }
  if (!composable && (state.scrollbarStyle === 'virtual' || state.scrollbarStyle === 'custom')) {
    push('virtualScrollbar', 'true');
  }
  if (state.snap) {
    push('snap', `'${ state.snapMode }'`);
  }
  if (!composable && state.stickyHeader) {
    push('stickyHeader', 'true');
  }
  if (!composable && state.stickyFooter) {
    push('stickyFooter', 'true');
  }
  if (derived.hasSections) {
    push('stickyIndices', 'stickyIndices.value');
  }
  if (state.infiniteScroll) {
    push('loadDistance', `${ state.loadDistance }`);
    push('loading', 'loading.value');
  }
  if (state.restoreOnPrepend) {
    push('restoreScrollOnPrepend', 'true');
  }
  if (state.initialScroll) {
    push('initialScrollIndex', `${ state.initialScrollIndex }`);
    push('initialScrollAlign', `'${ state.initialScrollAlign }'`);
  }
  if (state.scrollPadding) {
    push('scrollPaddingStart', `${ state.scrollPaddingStart }`);
    push('scrollPaddingEnd', `${ state.scrollPaddingEnd }`);
  }
  if (state.ssrRange) {
    push('ssrRange', `{ start: ${ state.ssrStart }, end: ${ state.ssrEnd } }`, 'pre-render range for SSR setups');
  }
  if (state.ariaRole !== 'auto') {
    push('role', `'${ state.ariaRole }'`);
  }
  push('ariaLabel', `'${ esc(state.ariaLabel || 'Virtual scroll demo') }'`);

  return join(lines);
}

function configScriptComponent(state: ConfiguratorState, derived: ReturnType<typeof getDerived>): string {
  const lines: string[] = [
    '// --- Configuration (typed against VirtualScrollProps) ---',
    'const config = computed<VirtualScrollProps<Item>>(() => ({',
    configPropsScript(state, derived, true, '  ', false),
  ];

  if (state.containerMode === 'window') {
    lines.push('  // window container: the page scrolls natively');
    lines.push('  container: scrollContainer.value,');
  }

  lines.push('}));');
  return join(lines);
}

function configScriptComposable(state: ConfiguratorState, derived: ReturnType<typeof getDerived>): string {
  const lines: string[] = [
    '// --- Configuration (typed against VirtualScrollProps) ---',
    'const config = computed<VirtualScrollProps<Item>>(() => ({',
    configPropsScript(state, derived, true, '  ', true),
  ];

  if (state.containerMode === 'window') {
    lines.push('  // window container: `container` stays undefined, the page scrolls natively');
  } else {
    lines.push(
      '  container: containerRef.value ?? undefined,',
      '  hostElement: wrapperRef.value ?? undefined,',
      '  hostRef: containerRef.value ?? undefined,',
    );
  }

  if (state.stickyHeader) {
    lines.push('  stickyStart: { x: 0, y: 48 },');
  }
  if (state.stickyFooter) {
    lines.push('  stickyEnd: { x: 0, y: 48 },');
  }

  lines.push('}));');
  return join(lines);
}

// ---------------------------------------------------------------------------
// composable extensions
// ---------------------------------------------------------------------------

function extensionsScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  const lines: string[] = [
    '// --- Extensions: one per enabled feature ---',
    isTs ? 'const extensions: VirtualScrollExtension<Item>[] = [' : 'const extensions = [',
  ];

  const push = (call: string, comment: string) => {
    lines.push(`  ${ call },${ comment ? ` // ${ comment }` : '' }`);
  };

  if (state.rtl) {
    push('useRtlExtension()', 'automatic RTL support');
  }
  if (state.snap) {
    push('useSnappingExtension()', `snap mode: '${ state.snapMode }'`);
  }
  if (state.stickyHeader || state.stickyFooter || derived.hasSections) {
    push('useStickyExtension()', 'sticky headers/footers/indices');
  }
  if (state.infiniteScroll) {
    push(
      `useInfiniteLoadingExtension({ onLoad: ${ isTs ? "(direction: 'vertical' | 'horizontal') => onLoad(direction)" : '(direction) => onLoad(direction)' } })`,
      'trigger `load` at the threshold',
    );
  }
  if (state.restoreOnPrepend) {
    push('usePrependRestorationExtension()', 'keep position when items are prepended');
  }
  push('useCoordinateScalingExtension()', 'supports massive lists (billions of pixels)');

  lines.push('];');
  return join(lines);
}

function composableDestructureScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>): string {
  const lines = [
    '// --- Virtualization core ---',
    'const {',
    '  isHydrated,',
    '  isRtl,',
    '  renderedItems,',
    '  scrollDetails,',
  ];
  if (state.direction !== 'vertical') {
    lines.push('  renderedWidth,');
  }
  if (state.direction !== 'horizontal') {
    lines.push('  renderedHeight,');
  }
  if (derived.isGrid) {
    lines.push('  columnRange,', '  getColumnWidth,');
  }
  if (state.itemSizeMode === 'dynamic' && state.direction !== 'horizontal') {
    lines.push('  updateItemSizes,');
  }
  lines.push('  scrollToIndex,');
  if (state.scrollbarStyle === 'virtual' || state.scrollbarStyle === 'custom') {
    lines.push('  scrollToOffset,');
  }
  lines.push(
    '  refresh,',
    '} = useVirtualScroll<Item>(config, extensions);',
  );
  return join(lines);
}

// ---------------------------------------------------------------------------
// template fragments
// ---------------------------------------------------------------------------

function statusExpression(state: ConfiguratorState): string {
  const offsets: string[] = [];
  if (state.direction === 'vertical') {
    offsets.push('offset ${Math.round(scrollDetails.scrollOffset.y)}px');
  } else if (state.direction === 'horizontal') {
    offsets.push('offset ${Math.round(scrollDetails.scrollOffset.x)}px');
  } else {
    offsets.push('offset ${Math.round(scrollDetails.scrollOffset.x)},${Math.round(scrollDetails.scrollOffset.y)}px');
  }
  return `\`range \${scrollDetails.range.start}–\${scrollDetails.range.end} · ${ offsets.join(' · ') }\``;
}

/**
 * Item content for the rendered item, at zero base indentation.
 * `composable` mode reads from `ri` (RenderedItem), component mode from slot props.
 */
function itemContentScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, composable: boolean): string {
  const item = composable ? 'ri.item' : 'item';
  const index = composable ? 'ri.index' : 'index';
  const isStickyActive = composable ? 'ri.isStickyActive' : 'isStickyActive';
  const horizontalMod = state.direction === 'horizontal' ? ' vs-item--horizontal' : '';

  const dataItem = [
    `<div class="vs-item${ horizontalMod }">`,
    `  <span class="vs-badge">#{{ ${ index } }}</span>`,
    `  <span class="vs-item-text">{{ ${ item }.text }}</span>`,
    `</div>`,
  ];

  const cells = derived.isGrid
    ? [
      '<div class="vs-grid-row">',
      '  <div',
      composable
        ? '    v-for="colIndex in columnIndexes"'
        : '    v-for="colIndex in Array.from({ length: columnRange.end - columnRange.start }, (_, i) => columnRange.start + i)"',
      '    :key="colIndex"',
      '    class="vs-grid-cell"',
      `    :style="{ inlineSize: \`\${ ${ composable ? 'getColumnWidth(colIndex)' : 'getColumnWidth(colIndex)' } }px\`, marginInlineStart: colIndex > 0 ? \`\${ ${ composable ? 'config.columnGap ?? 0' : 'columnGap' } }px\` : 0 }"${ composable ? '' : '\n    v-bind="getCellAriaProps(colIndex)"' }`,
      '  >',
      `    <span class="vs-badge">{{ ${ index } }},{{ colIndex }}</span>`,
      `    <span class="vs-item-text">{{ ${ item }.text }}</span>`,
      '  </div>',
      '</div>',
    ]
    : dataItem;

  if (!derived.hasSections) {
    return join(cells);
  }

  return join([
    `<div v-if="${ item }.type === 'header'" class="vs-section-header" :class="{ 'vs-section-header--active': ${ isStickyActive } }">`,
    `  {{ ${ item }.text }}`,
    '</div>',
    derived.isGrid
      ? join([ '<div v-else>', ...cells.map((line) => (line ? `  ${ line }` : line)), '</div>' ])
      : join([
        '<div v-else class="vs-item">',
        `  <span class="vs-badge">#{{ ${ index } }}</span>`,
        `  <span class="vs-item-text">{{ ${ item }.text }}</span>`,
        '</div>',
      ]),
  ]);
}

function toolbarTemplate(state: ConfiguratorState, composable: boolean): string {
  const t = '    ';
  const lines: string[] = [
    `${ t }<header class="vs-toolbar">`,
    `${ t }  <h1 class="vs-title">Virtual Scroll Demo</h1>`,
    composable
      ? `${ t }  <div class="vs-status">\n${ t }    <span>{{ ${ statusExpression(state) } }}</span>\n${ t }  </div>`
      : `${ t }  <div v-if="scrollDetails" class="vs-status">\n${ t }    <span>{{ ${ statusExpression(state) } }}</span>\n${ t }  </div>`,
    `${ t }  <div class="vs-actions">`,
    `${ t }    <label class="vs-field">`,
    `${ t }      <span>Scroll to</span>`,
    `${ t }      <input v-model.number="scrollTarget" type="number" class="vs-input" />`,
    `${ t }    </label>`,
    `${ t }    <button type="button" class="vs-btn vs-btn--primary" @click="scrollToTarget">Go</button>`,
  ];

  if (state.restoreOnPrepend) {
    lines.push(`${ t }    <button type="button" class="vs-btn" @click="prependItems">Prepend 5</button>`);
  }
  if (state.infiniteScroll) {
    lines.push(`${ t }    <button type="button" class="vs-btn" :disabled="loading" @click="loadMore">Load more</button>`);
  }
  if (composable) {
    lines.push(`${ t }    <button type="button" class="vs-btn" @click="refresh">Refresh</button>`);
  } else {
    lines.push(`${ t }    <button type="button" class="vs-btn" @click="virtualScrollRef?.refresh()">Refresh</button>`);
  }

  lines.push(`${ t }  </div>`, `${ t }</header>`);
  return join(lines);
}

function scrollbarSlotTemplate(state: ConfiguratorState): string {
  if (state.scrollbarStyle !== 'custom') {
    return '';
  }
  return join([
    '<template #scrollbar="{ axis, trackProps, thumbProps }">',
    '  <div v-if="axis === \'vertical\'" v-bind="trackProps" class="vs-custom-track vs-custom-track--vertical">',
    '    <div v-bind="thumbProps" class="vs-custom-thumb" />',
    '  </div>',
    '  <div v-else v-bind="trackProps" class="vs-custom-track vs-custom-track--horizontal">',
    '    <div v-bind="thumbProps" class="vs-custom-thumb" />',
    '  </div>',
    '</template>',
  ]);
}

function composableScrollbarTemplate(state: ConfiguratorState): string {
  if (state.scrollbarStyle !== 'virtual' && state.scrollbarStyle !== 'custom') {
    return '';
  }
  const t = '    ';
  const lines: string[] = [ `${ t }<div v-if="showScrollbars" class="vs-scrollbars">` ];
  if (state.direction !== 'horizontal') {
    lines.push(
      `${ t }  <div v-bind="verticalScrollbar.trackProps">`,
      `${ t }    <div v-bind="verticalScrollbar.thumbProps" />`,
      `${ t }  </div>`,
    );
  }
  if (state.direction !== 'vertical') {
    lines.push(
      `${ t }  <div v-bind="horizontalScrollbar.trackProps">`,
      `${ t }    <div v-bind="horizontalScrollbar.thumbProps" />`,
      `${ t }  </div>`,
    );
  }
  lines.push(`${ t }</div>`);
  return join(lines);
}

function virtualScrollTemplate(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, composable: boolean): string {
  const t = '    ';
  const lines: string[] = [];

  if (composable) {
    lines.push(
      state.containerMode === 'element'
        ? `${ t }<div ref="containerRef" class="vs-viewport" tabindex="0"${ state.rtl ? ' dir="rtl"' : '' }>`
        : `${ t }<div class="vs-viewport" tabindex="0"${ state.rtl ? ' dir="rtl"' : '' }>`,
    );
    if (state.stickyHeader) {
      lines.push(`${ t }  <div class="vs-sticky-header">Sticky header</div>`);
    }
    lines.push(
      state.containerMode === 'element'
        ? `${ t }  <div ref="wrapperRef" class="vs-wrapper" :style="wrapperStyle">`
        : `${ t }  <div class="vs-wrapper" :style="wrapperStyle">`,
      `${ t }    <div`,
      `${ t }      v-for="ri in renderedItems"`,
      `${ t }      :key="ri.index"`,
      `${ t }      :data-index="ri.index"`,
      `${ t }      class="vs-virtual-item"`,
      `${ state.itemSizeMode === 'dynamic' && state.direction !== 'horizontal' ? `${ t }      :ref="(el) => setItemRef(el, ri.index)"` : '' }`,
      `${ t }      :style="getItemStyle(ri)"`,
      `${ t }    >`,
    );
    lines.push(indentBlock(itemContentScript(state, derived, true), `${ t }      `));
    lines.push(
      `${ t }    </div>`,
      `${ t }  </div>`,
    );
    if (state.infiniteScroll) {
      lines.push(`${ t }  <div v-if="loading && hasMore" class="vs-loading">Loading more…</div>`);
    }
    if (state.stickyFooter) {
      lines.push(`${ t }  <div class="vs-sticky-footer">Sticky footer</div>`);
    }
    const scrollbars = composableScrollbarTemplate(state);
    if (scrollbars) {
      lines.push(indentBlock(scrollbars, t));
    }
    lines.push(`${ t }</div>`);
  } else {
    lines.push(
      `${ t }<VirtualScroll`,
      `${ t }  ref="virtualScrollRef"`,
      `${ t }  v-bind="config"`,
      `${ t }  class="vs-viewport"`,
      state.rtl ? `${ t }  dir="rtl"` : '',
      `${ t }  @scroll="onScroll"`,
      state.infiniteScroll ? `${ t }  @load="onLoad"` : '',
      `${ t }>`,
    );
    if (state.stickyHeader) {
      lines.push(
        `${ t }  <template #header>`,
        `${ t }    <div class="vs-sticky-header">Sticky header</div>`,
        `${ t }  </template>`,
      );
    }
    const slotProps = [
      'item',
      'index',
      ...(derived.hasSections ? [ 'isStickyActive' ] : []),
      ...(derived.isGrid ? [ 'columnRange', 'getColumnWidth', 'columnGap', 'getCellAriaProps' ] : []),
    ].join(', ');
    lines.push(`${ t }  <template #item="{ ${ slotProps } }">`);
    lines.push(indentBlock(itemContentScript(state, derived, false), `${ t }    `));
    lines.push(`${ t }  </template>`);
    if (state.infiniteScroll) {
      lines.push(
        `${ t }  <template v-if="hasMore" #loading>`,
        `${ t }    <div class="vs-loading">Loading more…</div>`,
        `${ t }  </template>`,
      );
    }
    const custom = scrollbarSlotTemplate(state);
    if (custom) {
      lines.push(indentBlock(custom, `${ t }  `));
    }
    if (state.stickyFooter) {
      lines.push(
        `${ t }  <template #footer>`,
        `${ t }    <div class="vs-sticky-footer">Sticky footer</div>`,
        `${ t }  </template>`,
      );
    }
    lines.push(`${ t }</VirtualScroll>`);
  }

  return join(lines);
}

// ---------------------------------------------------------------------------
// styles (shared)
// ---------------------------------------------------------------------------

function stylesBlock(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, composable: boolean, includeControls = true): string {
  const windowMode = state.containerMode === 'window';
  const lines: string[] = [];

  lines.push(
    'body {',
    '  margin: 0;',
    '}',
    '.vs-app {',
    '  display: flex;',
    '  flex-direction: column;',
    windowMode ? '  min-block-size: 100dvh;' : '  block-size: 100dvh;',
    '  background: #fafafa;',
    '  color: #18181b;',
    '  font-family: system-ui, sans-serif;',
    '}',
    '',
    '.vs-toolbar {',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  align-items: center;',
    '  gap: 0.75rem 1rem;',
    '  padding: 0.5rem 1rem;',
    '  background: #e4e4e7;',
    '  border-bottom: 1px solid #d4d4d8;',
    '  flex: none;',
    '}',
    '',
    '.vs-title {',
    '  font-size: 0.875rem;',
    '  font-weight: 800;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.1em;',
    '}',
    '',
    '.vs-status {',
    '  display: flex;',
    '  gap: 1rem;',
    '  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;',
    '  font-size: 0.6875rem;',
    '  opacity: 0.6;',
    '}',
    '',
    ...(includeControls
      ? [
        '.vs-actions {',
        '  display: flex;',
        '  align-items: center;',
        '  gap: 0.5rem;',
        '  margin-inline-start: auto;',
        '}',
        '',
        '.vs-field {',
        '  display: flex;',
        '  align-items: center;',
        '  gap: 0.375rem;',
        '  font-size: 0.75rem;',
        '  font-weight: 600;',
        '}',
        '',
        '.vs-input {',
        '  inline-size: 5rem;',
        '  padding: 0.25rem 0.5rem;',
        '  border: 1px solid #d4d4d8;',
        '  border-radius: 6px;',
        '  background: #ffffff;',
        '  font: inherit;',
        '}',
        '',
        '.vs-btn {',
        '  padding: 0.3125rem 0.75rem;',
        '  border: 1px solid #d4d4d8;',
        '  border-radius: 6px;',
        '  background: #ffffff;',
        '  font-size: 0.75rem;',
        '  font-weight: 600;',
        '  cursor: pointer;',
        '}',
        '',
        '.vs-btn:hover {',
        '  background: #f4f4f5;',
        '}',
        '',
        '.vs-btn--primary {',
        '  background: #18181b;',
        '  border-color: #18181b;',
        '  color: #fafafa;',
        '}',
        '',
        '.vs-btn:disabled {',
        '  opacity: 0.5;',
        '  cursor: default;',
        '}',
        '',
      ]
      : []),
    '.vs-viewport {',
    '  flex: 1 1 auto;',
    '  min-block-size: 0;',
    '}',
  );

  if (composable) {
    lines.push(
      '',
      '.vs-wrapper {',
      '  position: relative;',
      '  contain: layout;',
      '}',
      '',
      '.vs-virtual-item {',
      '  position: absolute;',
      '  inset-block-start: 0;',
      '  inset-inline-start: 0;',
      '  box-sizing: border-box;',
      '  will-change: transform;',
      '}',
      '',
      '.vs-viewport {',
      '  overflow: auto;',
      '  overscroll-behavior: contain;',
      '}',
    );
  }

  lines.push(
    '',
    '.vs-item {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 0.75rem;',
    '  padding: 0 1rem;',
    '  box-sizing: border-box;',
    '  border-bottom: 1px solid #e4e4e7;',
    '  background: #fafafa;',
    '  overflow: hidden;',
    '}',
    '',
    '.vs-item--horizontal {',
    '  flex-direction: column;',
    '  justify-content: center;',
    '  text-align: center;',
    '  border-bottom: none;',
    '  border-inline-end: 1px solid #e4e4e7;',
    '}',
    '',
    '.vs-badge {',
    '  flex: none;',
    '  padding: 2px 6px;',
    '  border-radius: 4px;',
    '  background: #e4e4e7;',
    '  font-size: 0.625rem;',
    '  font-weight: 700;',
    '}',
    '',
    '.vs-item-text {',
    '  font-size: 0.8125rem;',
    '  line-height: 1.4;',
    '  overflow: hidden;',
    '  display: -webkit-box;',
    '  -webkit-line-clamp: 2;',
    '  -webkit-box-orient: vertical;',
    '}',
  );

  if (state.stickyHeader) {
    lines.push(
      '',
      '.vs-sticky-header {',
      ...(composable
        ? [
          '  position: sticky;',
          '  inset-block-start: 0;',
          '  z-index: 20;',
        ]
        : []),
      '  display: flex;',
      '  align-items: center;',
      '  block-size: 48px;',
      '  padding: 0 1rem;',
      '  background: #18181b;',
      '  color: #fafafa;',
      '  font-weight: 700;',
      '  font-size: 0.875rem;',
      '}',
    );
  }
  if (state.stickyFooter) {
    lines.push(
      '',
      '.vs-sticky-footer {',
      ...(composable
        ? [
          '  position: sticky;',
          '  inset-block-end: 0;',
          '  z-index: 20;',
        ]
        : []),
      '  display: flex;',
      '  align-items: center;',
      '  block-size: 48px;',
      '  padding: 0 1rem;',
      '  background: #18181b;',
      '  color: #fafafa;',
      '  font-weight: 700;',
      '  font-size: 0.875rem;',
      '}',
    );
  }
  if (derived.hasSections) {
    lines.push(
      '',
      '.vs-section-header {',
      '  display: flex;',
      '  align-items: center;',
      '  block-size: 40px;',
      '  padding: 0 1rem;',
      '  background: #d4d4d8;',
      '  font-weight: 800;',
      '  font-size: 0.75rem;',
      '  text-transform: uppercase;',
      '  letter-spacing: 0.08em;',
      '}',
      '',
      '.vs-section-header--active {',
      '  background: #b8b8bf;',
      '}',
    );
  }
  if (state.infiniteScroll) {
    lines.push(
      '',
      '.vs-loading {',
      '  display: flex;',
      '  align-items: center;',
      '  justify-content: center;',
      '  padding: 1rem;',
      '  background: #f4f4f5;',
      '  border-top: 1px solid #e4e4e7;',
      '  font-size: 0.75rem;',
      '  font-weight: 700;',
      '}',
    );
  }
  if (derived.isGrid) {
    lines.push(
      '',
      '.vs-grid-row {',
      '  display: flex;',
      '  block-size: 100%;',
      '}',
      '',
      '.vs-grid-cell {',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  gap: 0.25rem;',
      '  box-sizing: border-box;',
      '  padding: 0.25rem;',
      '  border: 1px solid #e4e4e7;',
      '  border-inline-start: none;',
      '  border-block-start: none;',
      '  background: #fafafa;',
      '  text-align: center;',
      '  overflow: hidden;',
      '}',
      '',
      '.vs-grid-row > .vs-grid-cell:first-child {',
      '  border-inline-start: 1px solid #e4e4e7;',
      '}',
    );
  }
  if (state.scrollbarStyle === 'custom') {
    lines.push(
      '',
      '.vs-custom-track {',
      '  position: absolute;',
      '  inset-block-start: 2px;',
      '  inset-inline-end: 2px;',
      '  inline-size: 10px;',
      '  background: rgba(24, 24, 27, 0.12);',
      '  border-radius: 5px;',
      '  pointer-events: auto;',
      '  overflow: clip;',
      '}',
      '',
      '.vs-custom-track--horizontal {',
      '  inset-block-start: auto;',
      '  inset-block-end: 2px;',
      '  inset-inline-end: 2px;',
      '  inline-size: auto;',
      '  block-size: 10px;',
      '}',
      '',
      '.vs-custom-thumb {',
      '  position: absolute;',
      '  inset-block-start: 0;',
      '  inset-inline-start: 0;',
      '  background: rgba(24, 24, 27, 0.45);',
      '  border-radius: 5px;',
      '}',
      '',
      '.vs-custom-thumb:hover {',
      '  background: rgba(24, 24, 27, 0.7);',
      '}',
    );
  }
  if (composable && (state.scrollbarStyle === 'virtual' || state.scrollbarStyle === 'custom')) {
    lines.push(
      '',
      '.vs-scrollbars {',
      '  position: sticky;',
      '  inset-block-start: 0;',
      '  block-size: 0;',
      '  inline-size: 100%;',
      '  z-index: 30;',
      '  pointer-events: none;',
      '}',
    );
  }

  return join(lines);
}

// ---------------------------------------------------------------------------
// script sections
// ---------------------------------------------------------------------------

function componentScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>): string {
  const lines: string[] = [
    '<script setup lang="ts">',
    "import type { ScrollDetails, VirtualScrollInstance, VirtualScrollProps } from '@pdanpdan/virtual-scroll';",
    "import { VirtualScroll } from '@pdanpdan/virtual-scroll';",
    '',
    "import '@pdanpdan/virtual-scroll/style.css';",
    '',
    "import { computed, onMounted, ref } from 'vue';",
    '',
  ];

  lines.push(dataModelScript(state, derived, true));
  lines.push('');
  lines.push(sectionHelpers(state, derived, true));
  lines.push('const items = ref<Item[]>([]);');
  if (state.infiniteScroll) {
    lines.push('const loading = ref(false);');
  }
  lines.push('');
  lines.push(dataSourceScript(state, derived, true));

  lines.push('');
  lines.push('onMounted(async () => {');
  lines.push('  items.value = await createItems(0, ITEM_COUNT);');
  lines.push('});');
  lines.push('');

  lines.push('// --- Scroll state ---');

  lines.push('const scrollDetails = ref<ScrollDetails<Item> | null>(null);');
  lines.push('const virtualScrollRef = ref<VirtualScrollInstance<Item> | null>(null);');
  lines.push('');
  lines.push('function onScroll(details: ScrollDetails<Item>) {');
  lines.push('  scrollDetails.value = details;');
  lines.push('}');
  lines.push('');

  if (state.containerMode === 'window') {
    lines.push('// --- Window container ---');
    lines.push('const scrollContainer = ref<Window | null>(null);');
    lines.push('');
    lines.push('onMounted(() => {');
    lines.push('  scrollContainer.value = window;');
    lines.push('});');
    lines.push('');
  }

  const infinite = infiniteScript(state, derived, true);
  if (infinite) {
    lines.push(infinite);
    lines.push('');
  }
  const prepend = prependScript(state, derived, true);
  if (prepend) {
    lines.push(prepend);
    lines.push('');
  }
  const sticky = stickyIndicesScript(state, derived, true);
  if (sticky) {
    lines.push(sticky);
    lines.push('');
  }

  lines.push('// --- Scroll target ---');
  lines.push('const scrollTarget = ref(100);');
  lines.push('');
  lines.push('function scrollToTarget() {');
  lines.push(state.direction === 'horizontal'
    ? "  virtualScrollRef.value?.scrollToIndex(null, scrollTarget.value, { behavior: 'smooth' });"
    : "  virtualScrollRef.value?.scrollToIndex(scrollTarget.value, null, { behavior: 'smooth' });");
  lines.push('}');
  lines.push('');
  lines.push(configScriptComponent(state, derived));
  lines.push('</script>');

  return join(lines);
}

function composableScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>): string {
  const lines: string[] = [
    '<script setup lang="ts">',
    "import type { RenderedItem, VirtualScrollExtension, VirtualScrollProps } from '@pdanpdan/virtual-scroll';",
    'import {',
    '  calculateItemStyle,',
    '  getPaddingX,',
    '  getPaddingY,',
    '  useCoordinateScalingExtension,',
    '  useVirtualScroll,',
  ];

  if (state.rtl) {
    lines.push('  useRtlExtension,');
  }
  if (state.snap) {
    lines.push('  useSnappingExtension,');
  }
  if (state.stickyHeader || state.stickyFooter || derived.hasSections) {
    lines.push('  useStickyExtension,');
  }
  if (state.infiniteScroll) {
    lines.push('  useInfiniteLoadingExtension,');
  }
  if (state.restoreOnPrepend) {
    lines.push('  usePrependRestorationExtension,');
  }
  if (state.scrollbarStyle === 'virtual' || state.scrollbarStyle === 'custom') {
    lines.push('  useVirtualScrollbar,');
  }

  lines.push(
    "} from '@pdanpdan/virtual-scroll';",
    '',
    "import '@pdanpdan/virtual-scroll/style.css';",
    '',
    `import { computed, onMounted${ state.itemSizeMode === 'dynamic' && state.direction !== 'horizontal' ? ', onUnmounted' : '' }, ref } from 'vue';`,
    '',
  );

  lines.push(dataModelScript(state, derived, true));
  lines.push('');
  lines.push(sectionHelpers(state, derived, true));
  lines.push('const items = ref<Item[]>([]);');
  if (state.infiniteScroll) {
    lines.push('const loading = ref(false);');
  }
  lines.push('');
  lines.push(dataSourceScript(state, derived, true));

  lines.push('');
  lines.push('onMounted(async () => {');
  lines.push('  items.value = await createItems(0, ITEM_COUNT);');
  lines.push('});');
  lines.push('');

  const infinite = infiniteScript(state, derived, true);
  if (infinite) {
    lines.push(infinite);
    lines.push('');
  }
  const prepend = prependScript(state, derived, true);
  if (prepend) {
    lines.push(prepend);
    lines.push('');
  }
  const sticky = stickyIndicesScript(state, derived, true);
  if (sticky) {
    lines.push(sticky);
    lines.push('');
  }

  if (state.containerMode === 'element') {
    lines.push('// --- Host elements ---');
    lines.push('const containerRef = ref<HTMLElement | null>(null);');
    lines.push('const wrapperRef = ref<HTMLElement | null>(null);');
    lines.push('');
  }
  lines.push(configScriptComposable(state, derived));
  lines.push('');
  lines.push(extensionsScript(state, derived, true));
  lines.push('');
  lines.push(composableDestructureScript(state, derived));

  if (state.scrollbarStyle === 'virtual' || state.scrollbarStyle === 'custom') {
    lines.push('');
    lines.push('// --- Virtual scrollbars ---');
    lines.push('const showScrollbars = computed(() =>');
    lines.push('  scrollDetails.value.totalSize.height > scrollDetails.value.viewportSize.height ||');
    lines.push('  scrollDetails.value.totalSize.width > scrollDetails.value.viewportSize.width,');
    lines.push(');');
    if (state.direction !== 'horizontal') {
      lines.push('const verticalScrollbar = useVirtualScrollbar(computed(() => ({');
      lines.push("  axis: 'vertical',");
      lines.push('  totalSize: scrollDetails.value.totalSize.height,');
      lines.push('  viewportSize: scrollDetails.value.viewportSize.height,');
      lines.push('  position: scrollDetails.value.displayScrollOffset.y,');
      lines.push('  scrollToOffset: (offset: number) => scrollToOffset(null, offset),');
      lines.push('})));');
    }
    if (state.direction !== 'vertical') {
      lines.push('const horizontalScrollbar = useVirtualScrollbar(computed(() => ({');
      lines.push("  axis: 'horizontal',");
      lines.push('  totalSize: scrollDetails.value.totalSize.width,');
      lines.push('  viewportSize: scrollDetails.value.viewportSize.width,');
      lines.push('  position: scrollDetails.value.displayScrollOffset.x,');
      lines.push('  scrollToOffset: (offset: number) => scrollToOffset(offset, null),');
      lines.push('})));');
    }
  }

  if (derived.isGrid) {
    lines.push('');
    lines.push('// --- Column indexes for the currently visible row range ---');
    lines.push('const columnIndexes = computed(() =>');
    lines.push('  Array.from({ length: columnRange.value.end - columnRange.value.start }, (_, i) => columnRange.value.start + i),');
    lines.push(');');
  }

  lines.push('');
  lines.push('// --- Wrapper sizing (clamped display size) ---');
  lines.push('const wrapperStyle = computed(() => ({');
  lines.push(`  inlineSize: ${ state.direction === 'vertical' ? "'1px'" : '`${ renderedWidth.value }px`' },`);
  lines.push(`  blockSize: ${ state.direction === 'horizontal' ? "'1px'" : '`${ renderedHeight.value }px`' },`);
  lines.push('}));');
  lines.push('');
  lines.push('function getItemStyle(item: RenderedItem<Item>) {');
  lines.push('  return calculateItemStyle({');
  lines.push("    containerTag: 'div',");
  lines.push("    direction: config.value.direction ?? 'vertical',");
  lines.push('    isHydrated: isHydrated.value,');
  lines.push('    item,');
  lines.push('    itemSize: config.value.itemSize,');
  lines.push('    // Sticky items stick below the sticky header/footer: scroll padding + sticky start/end.');
  lines.push('    paddingStartX: getPaddingX(config.value.scrollPaddingStart, config.value.direction) + getPaddingX(config.value.stickyStart, config.value.direction),');
  lines.push('    paddingStartY: getPaddingY(config.value.scrollPaddingStart, config.value.direction) + getPaddingY(config.value.stickyStart, config.value.direction),');
  lines.push('    isRtl: isRtl.value,');
  lines.push('  });');
  lines.push('}');
  lines.push('');

  lines.push('// --- Scroll target ---');
  lines.push('const scrollTarget = ref(100);');
  lines.push('');
  lines.push('function scrollToTarget() {');
  lines.push(state.direction === 'horizontal'
    ? "  scrollToIndex(null, scrollTarget.value, { behavior: 'smooth' });"
    : "  scrollToIndex(scrollTarget.value, null, { behavior: 'smooth' });");
  lines.push('}');

  if (state.itemSizeMode === 'dynamic' && state.direction !== 'horizontal') {
    lines.push('');
    lines.push('// --- Measure dynamic item sizes with ResizeObserver ---');
    lines.push('const itemRefs = new Map<number, HTMLElement>();');
    lines.push('let itemObserver: ResizeObserver | null = null;');
    lines.push('');
    lines.push('function setItemRef(el: unknown, index: number) {');
    lines.push('  const element = el as HTMLElement | null;');
    lines.push('  const previous = itemRefs.get(index);');
    lines.push('  if (previous) {');
    lines.push('    itemObserver?.unobserve(previous);');
    lines.push('  }');
    lines.push('  if (element) {');
    lines.push('    itemRefs.set(index, element);');
    lines.push('    itemObserver?.observe(element);');
    lines.push('  } else {');
    lines.push('    itemRefs.delete(index);');
    lines.push('  }');
    lines.push('}');
    lines.push('');
    lines.push('onMounted(() => {');
    lines.push('  itemObserver = new ResizeObserver((entries) => {');
    lines.push('    const updates: Array<{ index: number; inlineSize: number; blockSize: number; }> = [];');
    lines.push('    for (const entry of entries) {');
    lines.push('      const index = Number((entry.target as HTMLElement).dataset.index);');
    lines.push('      if (!Number.isNaN(index)) {');
    lines.push('        updates.push({ index, inlineSize: entry.contentRect.width, blockSize: entry.contentRect.height });');
    lines.push('      }');
    lines.push('    }');
    lines.push('    if (updates.length > 0) {');
    lines.push('      updateItemSizes(updates);');
    lines.push('    }');
    lines.push('  });');
    lines.push('  for (const el of itemRefs.values()) {');
    lines.push('    itemObserver.observe(el);');
    lines.push('  }');
    lines.push('});');
    lines.push('');
    lines.push('onUnmounted(() => {');
    lines.push('  itemObserver?.disconnect();');
    lines.push('});');
  }

  lines.push('</script>');
  return join(lines);
}

function sfcTemplate(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, composable: boolean): string {
  const lines: string[] = [
    '<template>',
    '  <div class="vs-app">',
  ];
  lines.push(toolbarTemplate(state, composable));
  lines.push(virtualScrollTemplate(state, derived, composable));
  lines.push('  </div>', '</template>');
  return join(lines);
}

// ---------------------------------------------------------------------------
// public SFC generator
// ---------------------------------------------------------------------------

export function generateSfc(state: ConfiguratorState, mode: GenerateMode): string {
  const derived = getDerived(state);

  if (derived.isIndependent) {
    return generateSfcIndependent(state);
  }

  const composable = mode === 'composable';
  const script = composable ? composableScript(state, derived) : componentScript(state, derived);
  const template = sfcTemplate(state, derived, composable);
  const styles = [
    '<style scoped>',
    stylesBlock(state, derived, composable),
    '</style>',
  ].join('\n');

  return [ script, '', template, '', styles, '' ].join('\n');
}

// ---------------------------------------------------------------------------
// independent scrollbars variant (standalone VirtualScrollbar usage)
// ---------------------------------------------------------------------------

function generateSfcIndependent(state: ConfiguratorState): string {
  const rows = Math.max(10, state.itemCount);
  const cols = Math.max(5, state.columnCount);
  const rowSize = state.itemSizeBase;
  const colSize = state.columnWidthBase;
  const gap = state.gap;
  const colGap = state.columnGap;

  return `<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

import { VirtualScrollbar } from '@pdanpdan/virtual-scroll';

import '@pdanpdan/virtual-scroll/style.css';

// --- Grid metrics ---
const ROWS = ${ rows };
const COLS = ${ cols };
const ROW_SIZE = ${ rowSize };
const COL_SIZE = ${ colSize };
const GAP = ${ gap };
const COL_GAP = ${ colGap };

const totalWidth = COLS * (COL_SIZE + COL_GAP) - COL_GAP;
const totalHeight = ROWS * (ROW_SIZE + GAP) - GAP;

const cells = computed(() =>
  Array.from({ length: ROWS }, (_, row) =>
    Array.from({ length: COLS }, (_, col) => ({ row, col })),
  ).flat(),
);

// --- Scroll state (native scrolling, independent virtual scrollbars) ---
const containerRef = ref<HTMLElement | null>(null);
const scrollX = ref(0);
const scrollY = ref(0);
const viewportWidth = ref(0);
const viewportHeight = ref(0);

function onScroll(event: Event) {
  const target = event.target as HTMLElement;
  scrollX.value = target.scrollLeft;
  scrollY.value = target.scrollTop;
}

function scrollToX(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollLeft = offset;
  }
}

function scrollToY(offset: number) {
  if (containerRef.value) {
    containerRef.value.scrollTop = offset;
  }
}

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      viewportWidth.value = entry.contentRect.width;
      viewportHeight.value = entry.contentRect.height;
    }
  });
  if (containerRef.value) {
    resizeObserver.observe(containerRef.value);
    viewportWidth.value = containerRef.value.clientWidth;
    viewportHeight.value = containerRef.value.clientHeight;
  }
});

onUnmounted(() => {
  resizeObserver?.disconnect();
});
</script>

<template>
  <div class="vs-app">
    <header class="vs-toolbar">
      <h1 class="vs-title">Independent Scrollbars</h1>
      <div class="vs-status">
        <span>offset {{ Math.round(scrollY) }},{{ Math.round(scrollX) }}px</span>
        <span>{{ ROWS }} × {{ COLS }} cells</span>
      </div>
    </header>

    <div ref="containerRef" class="vs-scroll-area" @scroll="onScroll">
      <div class="vs-grid" :style="{ inlineSize: \`\${ totalWidth }px\`, blockSize: \`\${ totalHeight }px\` }">
        <div
          v-for="cell in cells"
          :key="\`\${ cell.row }-\${ cell.col }\`"
          class="vs-cell"
          :style="{ inlineSize: \`\${ COL_SIZE }px\`, blockSize: \`\${ ROW_SIZE }px\` }"
        >
          <span class="vs-badge">{{ cell.row }},{{ cell.col }}</span>
        </div>
      </div>
    </div>

    <VirtualScrollbar
      axis="vertical"
      :total-size="totalHeight"
      :viewport-size="viewportHeight"
      :position="scrollY"
      aria-label="Independent vertical scroll"
      @scroll-to-offset="scrollToY"
    />
    <VirtualScrollbar
      axis="horizontal"
      :total-size="totalWidth"
      :viewport-size="viewportWidth"
      :position="scrollX"
      aria-label="Independent horizontal scroll"
      @scroll-to-offset="scrollToX"
    />
  </div>
</template>

<style>
body {
  margin: 0;
}
.vs-app {
  display: flex;
  flex-direction: column;
  block-size: 100dvh;
  background: #fafafa;
  color: #18181b;
  font-family: system-ui, sans-serif;
}

.vs-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  padding: 0.5rem 1rem;
  background: #e4e4e7;
  border-bottom: 1px solid #d4d4d8;
  flex: none;
}

.vs-title {
  font-size: 0.875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.vs-status {
  display: flex;
  gap: 1rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.6875rem;
  opacity: 0.6;
}

.vs-scroll-area {
  position: relative;
  flex: 1 1 auto;
  min-block-size: 0;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.vs-grid {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: ${ gap }px ${ colGap }px;
}

.vs-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border: 1px solid #e4e4e7;
  background: #fafafa;
}

.vs-badge {
  padding: 2px 6px;
  border-radius: 4px;
  background: #e4e4e7;
  font-size: 0.625rem;
  font-weight: 700;
}
</style>
`;
}

// ---------------------------------------------------------------------------
// CodePen / standalone HTML (UMD builds, no build step)
// ---------------------------------------------------------------------------

function penStateScript(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  const lines: string[] = [];

  if (isTs) {
    lines.push(dataModelScript(state, derived, true));
  } else {
    lines.push('// --- Data ---');
    lines.push(`const ITEM_COUNT = ${ state.itemCount };`);
    if (derived.hasSections) {
      lines.push(`const ITEMS_PER_SECTION = ${ state.itemsPerSection };`);
    }
  }
  lines.push(isTs ? 'const items = ref<Item[]>([]);' : 'const items = ref([]);');
  if (state.infiniteScroll) {
    lines.push('const loading = ref(false);');
  }
  lines.push('');

  const sectionHelpersJs = sectionHelpers(state, derived, isTs);
  if (sectionHelpersJs) {
    lines.push(sectionHelpersJs.trimEnd());
    lines.push('');
  }

  lines.push(dataSourceScript(state, derived, isTs));
  lines.push('');
  lines.push('onMounted(async () => {');
  lines.push('  items.value = await createItems(0, ITEM_COUNT);');
  lines.push('});');
  lines.push('');

  const infinite = infiniteScript(state, derived, isTs);
  if (infinite) {
    lines.push(infinite);
    lines.push('');
  }
  const prepend = prependScript(state, derived, isTs);
  if (prepend) {
    lines.push(prepend);
    lines.push('');
  }
  const sticky = stickyIndicesScript(state, derived, isTs);
  if (sticky) {
    lines.push(sticky);
    lines.push('');
  }

  if (isTs) {
    lines.push(
      '// Minimal shape used by the status bar (the full type comes from the package).',
      'interface ScrollDetails {',
      '  range: { start: number; end: number };',
      '  scrollOffset: { x: number; y: number };',
      '}',
      '',
    );
  }
  lines.push(isTs ? 'const scrollDetails = ref<ScrollDetails | null>(null);' : 'const scrollDetails = ref(null);');
  lines.push('');
  lines.push(isTs
    ? 'function onScroll(details: ScrollDetails) {'
    : 'function onScroll(details) {');
  lines.push('  scrollDetails.value = details;');
  lines.push('}');
  lines.push('');

  if (state.containerMode === 'window') {
    lines.push('// --- Window container: the page scrolls natively ---');
    lines.push('const scrollContainer = ref(null);');
    lines.push('');
    lines.push('onMounted(() => {');
    lines.push('  scrollContainer.value = window;');
    lines.push('});');
    lines.push('');
  }

  lines.push('// --- Configuration ---');
  lines.push('const config = computed(() => ({');
  lines.push(configPropsScript(state, derived, isTs, '  ', false));
  if (state.containerMode === 'window') {
    lines.push('  container: scrollContainer.value,');
  }
  lines.push('}));');
  lines.push('');

  lines.push('// --- Scroll target ---');
  lines.push('const scrollTarget = ref(100);');
  lines.push('');
  lines.push('function scrollToTarget() {');
  lines.push(state.direction === 'horizontal'
    ? "  vs.value?.scrollToIndex(null, scrollTarget.value, { behavior: 'smooth' });"
    : "  vs.value?.scrollToIndex(scrollTarget.value, null, { behavior: 'smooth' });");
  lines.push('}');

  return join(lines);
}

function penSetupReturn(state: ConfiguratorState): string {
  const names = [
    'items',
    'config',
    'scrollDetails',
    'onScroll',
    'scrollTarget',
    'scrollToTarget',
  ];
  if (state.infiniteScroll) {
    names.push('loading', 'loadMore', 'onLoad');
  }
  if (state.restoreOnPrepend) {
    names.push('prependItems');
  }
  if (state.dataSource === 'lorem') {
    names.push('fetchLoremTexts');
  }
  return join(names.map((name) => `      ${ name },`));
}

function penTemplate(state: ConfiguratorState, derived: ReturnType<typeof getDerived>): string {
  const t = '  ';
  const lines: string[] = [
    '<div id="app" v-cloak class="vs-app">',
    `${ t }<header class="vs-toolbar">`,
    `${ t }  <h1 class="vs-title">Virtual Scroll Demo</h1>`,
    `${ t }  <div v-if="scrollDetails" class="vs-status">`,
    `${ t }    <span>{{ ${ statusExpression(state) } }}</span>`,
    `${ t }  </div>`,
    `${ t }  <div class="vs-actions">`,
    `${ t }    <label class="vs-field">`,
    `${ t }      <span>Scroll to</span>`,
    `${ t }      <input v-model.number="scrollTarget" type="number" class="vs-input" />`,
    `${ t }    </label>`,
    `${ t }    <button type="button" class="vs-btn vs-btn--primary" @click="scrollToTarget">Go</button>`,
  ];

  if (state.restoreOnPrepend) {
    lines.push(`${ t }    <button type="button" class="vs-btn" @click="prependItems">Prepend 5</button>`);
  }
  if (state.infiniteScroll) {
    lines.push(`${ t }    <button type="button" class="vs-btn" :disabled="loading" @click="loadMore">Load more</button>`);
  }
  lines.push(`${ t }    <button type="button" class="vs-btn" @click="vs?.refresh()">Refresh</button>`);
  lines.push(`${ t }    <a href="${ GITHUB_REPO }" target="_blank" rel="noopener" class="vs-link">GitHub</a>`);
  lines.push(`${ t }  </div>`, `${ t }</header>`, '');

  lines.push(
    `${ t }<virtual-scroll`,
    `${ t }  ref="vs"`,
    `${ t }  v-bind="config"`,
    `${ t }  class="vs-viewport"`,
    state.rtl ? `${ t }  dir="rtl"` : '',
    `${ t }  @scroll="onScroll"`,
    state.infiniteScroll ? `${ t }  @load="onLoad"` : '',
    `${ t }>`,
  );

  if (state.stickyHeader) {
    lines.push(
      `${ t }  <template #header>`,
      `${ t }    <div class="vs-sticky-header">Sticky header</div>`,
      `${ t }  </template>`,
    );
  }

  const slotProps = [
    'item',
    'index',
    ...(derived.hasSections ? [ 'isStickyActive' ] : []),
    ...(derived.isGrid ? [ 'columnRange', 'getColumnWidth', 'columnGap', 'getCellAriaProps' ] : []),
  ].join(', ');
  lines.push(`${ t }  <template #item="{ ${ slotProps } }">`);
  lines.push(indentBlock(itemContentScript(state, derived, false), `${ t }    `));
  lines.push(`${ t }  </template>`);

  if (state.infiniteScroll) {
    lines.push(
      `${ t }  <template #loading>`,
      `${ t }    <div class="vs-loading">Loading more…</div>`,
      `${ t }  </template>`,
    );
  }
  if (state.scrollbarStyle === 'custom') {
    lines.push(
      `${ t }  <template #scrollbar="{ axis, trackProps, thumbProps }">`,
      `${ t }    <div v-if="axis === 'vertical'" v-bind="trackProps" class="vs-custom-track vs-custom-track--vertical">`,
      `${ t }      <div v-bind="thumbProps" class="vs-custom-thumb"></div>`,
      `${ t }    </div>`,
      `${ t }    <div v-else v-bind="trackProps" class="vs-custom-track vs-custom-track--horizontal">`,
      `${ t }      <div v-bind="thumbProps" class="vs-custom-thumb"></div>`,
      `${ t }    </div>`,
      `${ t }  </template>`,
    );
  }
  if (state.stickyFooter) {
    lines.push(
      `${ t }  <template #footer>`,
      `${ t }    <div class="vs-sticky-footer">Sticky footer</div>`,
      `${ t }  </template>`,
    );
  }
  lines.push(`${ t }</virtual-scroll>`, '</div>');

  return join(lines);
}

function penJs(state: ConfiguratorState, derived: ReturnType<typeof getDerived>, isTs: boolean): string {
  return join([
    isTs
      ? 'declare const Vue: { createApp: (options: object) => { mount(el: string): unknown; component(name: string, comp: unknown): { mount(el: string): unknown; component(name: string, comp: unknown): unknown; }; }; ref: <T>(value: T) => { value: T }; computed: <T>(fn: () => T) => { value: T }; onMounted: (fn: () => void | Promise<void>) => void; };'
      : '',
    isTs
      ? 'const VirtualScroll = (window as unknown as { VirtualScroll: { VirtualScroll: unknown } }).VirtualScroll.VirtualScroll;'
      : 'const { VirtualScroll } = window.VirtualScroll;',
    'const { createApp, ref, computed, onMounted } = Vue;',
    '',
    'createApp({',
    '  setup() {',
    isTs
      ? '    const vs = ref<{ scrollToIndex: (row: number | null, col: number | null, options?: { behavior?: \'auto\' | \'smooth\' }) => void; refresh: () => void; } | null>(null);'
      : '    const vs = ref(null);',
    '    ',
    indentBlock(penStateScript(state, derived, isTs), '    '),
    '',
    '    return {',
    '      vs,',
    penSetupReturn(state),
    '    };',
    '  },',
    '})',
    "  .component('virtual-scroll', VirtualScroll)",
    "  .mount('#app');",
  ]);
}

function penBasePayload(state: ConfiguratorState, js: string, jsPreProcessor: CodePenPayload[ 'jsPreProcessor' ]): CodePenPayload {
  const derived = getDerived(state);
  return {
    title: 'Virtual Scroll — Configurator Demo',
    html: penTemplate(state, derived),
    css: stylesBlock(state, derived, false, false),
    js,
    jsPreProcessor,
    jsExternal: [ CDN_VUE, CDN_VS_JS ],
    cssExternal: [ CDN_VS_CSS ],
  };
}

export function generateCodePenForState(state: ConfiguratorState): CodePenPayload {
  const derived = getDerived(state);

  if (derived.isIndependent) {
    return generatePenIndependent(state);
  }

  return penBasePayload(state, penJs(state, derived, false), 'none');
}

/**
 * TypeScript pen: the JS pane is TypeScript and CodePen compiles it with the
 * `typescript` preprocessor (CodePen 2.0).
 */
export function generateCodePenTypeScript(state: ConfiguratorState): CodePenPayload {
  const derived = getDerived(state);

  if (derived.isIndependent) {
    return generatePenIndependent(state);
  }

  return penBasePayload(state, penJs(state, derived, true), 'typescript');
}

export function generateStandaloneHtml(state: ConfiguratorState): string {
  const pen = generateCodePenForState(state);

  return join([
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="UTF-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">',
    `  <title>${ esc(pen.title) }</title>`,
    `  <link rel="stylesheet" href="${ CDN_VS_CSS }">`,
    `  <script src="${ CDN_VUE }"></script>`,
    `  <script src="${ CDN_VS_JS }"></script>`,
    '  <style>',
    '    [v-cloak] { display: none; }',
    pen.css,
    '  </style>',
    '</head>',
    '<body>',
    pen.html,
    '  <script>',
    pen.js,
    '  </script>',
    '</body>',
    '</html>',
  ]);
}

function generatePenIndependent(state: ConfiguratorState): CodePenPayload {
  const rows = Math.max(10, state.itemCount);
  const cols = Math.max(5, state.columnCount);
  const rowSize = state.itemSizeBase;
  const colSize = state.columnWidthBase;
  const gap = state.gap;
  const colGap = state.columnGap;

  const html = [
    '<div id="app" v-cloak class="vs-app">',
    '  <header class="vs-toolbar">',
    '    <h1 class="vs-title">Independent Scrollbars</h1>',
    '    <div class="vs-status">',
    '      <span>{{ ROWS }} × {{ COLS }} cells</span>',
    '    </div>',
    `    <a href="${ GITHUB_REPO }" target="_blank" rel="noopener" class="vs-link">GitHub</a>`,
    '  </header>',
    '',
    '  <div ref="containerRef" class="vs-scroll-area" @scroll="onScroll">',
    '    <div class="vs-grid" :style="{ inlineSize: totalWidth + \'px\', blockSize: totalHeight + \'px\' }">',
    '      <div v-for="cell in cells" :key="cell.row + \'-\' + cell.col" class="vs-cell" :style="{ inlineSize: COL_SIZE + \'px\', blockSize: ROW_SIZE + \'px\' }">',
    '        <span class="vs-badge">{{ cell.row }},{{ cell.col }}</span>',
    '      </div>',
    '    </div>',
    '  </div>',
    '',
    '  <virtual-scrollbar axis="vertical" :total-size="totalHeight" :viewport-size="viewportHeight" :position="scrollY" aria-label="Independent vertical scroll" @scroll-to-offset="scrollToY"></virtual-scrollbar>',
    '  <virtual-scrollbar axis="horizontal" :total-size="totalWidth" :viewport-size="viewportWidth" :position="scrollX" aria-label="Independent horizontal scroll" @scroll-to-offset="scrollToX"></virtual-scrollbar>',
    '</div>',
  ].join('\n');

  const js = [
    'const { createApp, ref, computed, onMounted, onUnmounted } = Vue;',
    'const { VirtualScrollbar } = window.VirtualScroll;',
    '',
    'createApp({',
    '  setup() {',
    `    const ROWS = ${ rows };`,
    `    const COLS = ${ cols };`,
    `    const ROW_SIZE = ${ rowSize };`,
    `    const COL_SIZE = ${ colSize };`,
    '',
    `    const GAP = ${ gap };`,
    `    const COL_GAP = ${ colGap };`,
    '    const totalWidth = COLS * (COL_SIZE + COL_GAP) - COL_GAP;',
    '    const totalHeight = ROWS * (ROW_SIZE + GAP) - GAP;',
    '',
    '    const cells = computed(() =>',
    '      Array.from({ length: ROWS }, (_, row) =>',
    '        Array.from({ length: COLS }, (_, col) => ({ row, col })),',
    '      ).flat(),',
    '    );',
    '',
    '    const containerRef = ref(null);',
    '    const scrollX = ref(0);',
    '    const scrollY = ref(0);',
    '    const viewportWidth = ref(0);',
    '    const viewportHeight = ref(0);',
    '',
    '    function onScroll(event) {',
    '      const target = event.target;',
    '      scrollX.value = target.scrollLeft;',
    '      scrollY.value = target.scrollTop;',
    '    }',
    '',
    '    function scrollToX(offset) {',
    '      if (containerRef.value) containerRef.value.scrollLeft = offset;',
    '    }',
    '',
    '    function scrollToY(offset) {',
    '      if (containerRef.value) containerRef.value.scrollTop = offset;',
    '    }',
    '',
    '    let resizeObserver = null;',
    '',
    '    onMounted(() => {',
    '      resizeObserver = new ResizeObserver((entries) => {',
    '        for (const entry of entries) {',
    '          viewportWidth.value = entry.contentRect.width;',
    '          viewportHeight.value = entry.contentRect.height;',
    '        }',
    '      });',
    '      if (containerRef.value) {',
    '        resizeObserver.observe(containerRef.value);',
    '        viewportWidth.value = containerRef.value.clientWidth;',
    '        viewportHeight.value = containerRef.value.clientHeight;',
    '      }',
    '    });',
    '',
    '    onUnmounted(() => {',
    '      if (resizeObserver) resizeObserver.disconnect();',
    '    });',
    '',
    '    return {',
    '      ROWS, COLS, ROW_SIZE, COL_SIZE,',
    '      totalWidth, totalHeight,',
    '      cells,',
    '      containerRef, scrollX, scrollY, viewportWidth, viewportHeight,',
    '      onScroll, scrollToX, scrollToY,',
    '    };',
    '  },',
    '})',
    "  .component('virtual-scrollbar', VirtualScrollbar)",
    "  .mount('#app');",
  ].join('\n');

  const css = [
    'body {',
    '  margin: 0;',
    '}',
    '.vs-app {',
    '  display: flex;',
    '  flex-direction: column;',
    '  block-size: 100dvh;',
    '  background: #fafafa;',
    '  color: #18181b;',
    '  font-family: system-ui, sans-serif;',
    '}',
    '',
    '.vs-toolbar {',
    '  display: flex;',
    '  align-items: center;',
    '  gap: 1rem;',
    '  padding: 0.5rem 1rem;',
    '  background: #e4e4e7;',
    '  border-bottom: 1px solid #d4d4d8;',
    '  flex: none;',
    '}',
    '',
    '.vs-title {',
    '  font-size: 0.875rem;',
    '  font-weight: 800;',
    '  text-transform: uppercase;',
    '  letter-spacing: 0.1em;',
    '}',
    '',
    '.vs-status {',
    '  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;',
    '  font-size: 0.6875rem;',
    '  opacity: 0.6;',
    '}',
    '',
    '.vs-scroll-area {',
    '  position: relative;',
    '  flex: 1 1 auto;',
    '  min-block-size: 0;',
    '  overflow: auto;',
    '  overscroll-behavior: contain;',
    '  scrollbar-width: none;',
    '  -ms-overflow-style: none;',
    '',
    '  &::-webkit-scrollbar {',
    '    display: none;',
    '  }',
    '}',
    '',
    '.vs-grid {',
    '  display: flex;',
    '  flex-wrap: wrap;',
    '  align-content: flex-start;',
    `  gap: ${ gap }px ${ colGap }px;`,
    '}',
    '',
    '.vs-cell {',
    '  display: flex;',
    '  align-items: center;',
    '  justify-content: center;',
    '  box-sizing: border-box;',
    '  border: 1px solid #e4e4e7;',
    '  background: #fafafa;',
    '}',
    '',
    '.vs-badge {',
    '  padding: 2px 6px;',
    '  border-radius: 4px;',
    '  background: #e4e4e7;',
    '  font-size: 0.625rem;',
    '  font-weight: 700;',
    '}',
  ].join('\n');

  return {
    title: 'Virtual Scroll — Independent Scrollbars',
    html,
    css,
    js,
    jsPreProcessor: 'none',
    jsExternal: [ CDN_VUE, CDN_VS_JS ],
    cssExternal: [ CDN_VS_CSS ],
  };
}
