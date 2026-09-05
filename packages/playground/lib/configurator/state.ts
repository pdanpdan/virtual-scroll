/**
 * State model for the Virtual Scroll Configurator.
 * Every field maps 1:1 to a question in the form and to a generated
 * code fragment (component mode, composable mode, or standalone CodePen pen).
 */

export type Direction = 'vertical' | 'horizontal' | 'both';
export type RendererMode = 'list' | 'table' | 'masonry';
export type TableColumnMode = 'auto' | 'first' | 'custom';
export type SizeMode = 'fixed' | 'pattern' | 'function' | 'dynamic';
export type ScrollbarStyle = 'auto' | 'virtual' | 'custom' | 'independent';
export type DataSource = 'lorem' | 'local';
export type ContainerMode = 'element' | 'window';
export type AriaRole = 'auto' | 'list' | 'grid' | 'tree' | 'listbox' | 'menu';
export type SnapMode = 'auto' | 'next' | 'start' | 'center' | 'end';
export type AlignMode = 'auto' | 'start' | 'center' | 'end';

export interface ConfiguratorState {
  // --- Basics ---
  direction: Direction;
  renderer: RendererMode;
  tableColumnMode: TableColumnMode;
  tableColumnWidths: string;

  // --- Masonry (renderer 'masonry') ---
  masonryTargetColumnWidth: number;
  masonryMinColumns: number;
  masonryMaxColumns: number;
  itemCount: number;
  containerMode: ContainerMode;
  rtl: boolean;
  ariaRole: AriaRole;
  ariaLabel: string;

  // --- Data ---
  dataSource: DataSource;
  loremSentences: number;

  // --- Sizing ---
  itemSizeMode: SizeMode;
  itemSize: number;
  itemSizeBase: number;
  itemSizeAlt: number;
  itemSizeMin: number;
  itemSizeMax: number;
  defaultItemSize: number;
  gap: number;
  bufferBefore: number;
  bufferAfter: number;

  // --- Grid (direction 'both') ---
  columnCount: number;
  columnWidthMode: SizeMode;
  columnWidth: number;
  columnWidthBase: number;
  columnWidthAlt: number;
  columnWidthMin: number;
  columnWidthMax: number;
  defaultColumnWidth: number;
  columnGap: number;

  // --- Features ---
  scrollbarStyle: ScrollbarStyle;
  snap: boolean;
  snapMode: SnapMode;
  stickyHeader: boolean;
  stickyFooter: boolean;
  stickySections: boolean;
  itemsPerSection: number;
  infiniteScroll: boolean;
  loadDistance: number;
  loadChunk: number;
  restoreOnPrepend: boolean;
  initialScroll: boolean;
  initialScrollIndex: number;
  initialScrollAlign: AlignMode;
  scrollPadding: boolean;
  scrollPaddingStart: number;
  scrollPaddingEnd: number;
  ssrRange: boolean;
  ssrStart: number;
  ssrEnd: number;
}

export const defaultState: ConfiguratorState = {
  direction: 'vertical',
  renderer: 'list',
  tableColumnMode: 'first',
  tableColumnWidths: '72, 96, 320, 120',
  masonryTargetColumnWidth: 240,
  masonryMinColumns: 1,
  masonryMaxColumns: 8,
  itemCount: 200,
  containerMode: 'element',
  rtl: false,
  ariaRole: 'auto',
  ariaLabel: 'Virtual scroll demo',

  dataSource: 'lorem',
  loremSentences: 1,

  itemSizeMode: 'fixed',
  itemSize: 48,
  itemSizeBase: 48,
  itemSizeAlt: 96,
  itemSizeMin: 32,
  itemSizeMax: 96,
  defaultItemSize: 48,
  gap: 8,
  bufferBefore: 5,
  bufferAfter: 5,

  columnCount: 20,
  columnWidthMode: 'fixed',
  columnWidth: 120,
  columnWidthBase: 120,
  columnWidthAlt: 180,
  columnWidthMin: 80,
  columnWidthMax: 200,
  defaultColumnWidth: 120,
  columnGap: 8,

  scrollbarStyle: 'virtual',
  snap: false,
  snapMode: 'next',
  stickyHeader: false,
  stickyFooter: false,
  stickySections: false,
  itemsPerSection: 10,
  infiniteScroll: false,
  loadDistance: 300,
  loadChunk: 20,
  restoreOnPrepend: false,
  initialScroll: false,
  initialScrollIndex: 100,
  initialScrollAlign: 'auto',
  scrollPadding: false,
  scrollPaddingStart: 8,
  scrollPaddingEnd: 8,
  ssrRange: false,
  ssrStart: 0,
  ssrEnd: 20,
};

/** Derived helpers used by both the form and the generators. */
export interface ConfiguratorDerived {
  isGrid: boolean;
  hasSections: boolean;
  isIndependent: boolean;
  usesVirtualScroll: boolean;
  isTable: boolean;
  isMasonry: boolean;
}

export function getDerived(state: ConfiguratorState): ConfiguratorDerived {
  const isGrid = state.direction === 'both' && state.renderer === 'list';
  const hasSections = state.stickySections && state.itemsPerSection > 0 && state.renderer === 'list';
  const isTable = state.renderer === 'table';
  const isMasonry = state.renderer === 'masonry';
  const isIndependent = state.scrollbarStyle === 'independent' && !isTable && !isMasonry;
  return {
    isGrid,
    hasSections,
    isIndependent,
    usesVirtualScroll: !isIndependent,
    isTable,
    isMasonry,
  };
}

export const roleOptions: Array<{ value: AriaRole; label: string; description: string; }> = [
  { value: 'auto', label: 'Auto', description: 'list for vertical/horizontal, grid for both' },
  { value: 'list', label: 'list', description: 'item role: listitem' },
  { value: 'grid', label: 'grid', description: 'item role: row' },
  { value: 'tree', label: 'tree', description: 'item role: treeitem' },
  { value: 'listbox', label: 'listbox', description: 'item role: option' },
  { value: 'menu', label: 'menu', description: 'item role: menuitem' },
];

export const snapOptions: Array<{ value: SnapMode; label: string; description: string; }> = [
  { value: 'auto', label: 'auto', description: 'snap towards scroll direction' },
  { value: 'next', label: 'next', description: 'snap to next position in scroll direction' },
  { value: 'start', label: 'start', description: 'align first visible item to start' },
  { value: 'center', label: 'center', description: 'align intersecting item to center' },
  { value: 'end', label: 'end', description: 'align last visible item to end' },
];

export const alignOptions: Array<{ value: AlignMode; label: string; description: string; }> = [
  { value: 'auto', label: 'auto', description: 'only scroll if not fully visible' },
  { value: 'start', label: 'start', description: 'align to start edge' },
  { value: 'center', label: 'center', description: 'align to viewport center' },
  { value: 'end', label: 'end', description: 'align to end edge' },
];
