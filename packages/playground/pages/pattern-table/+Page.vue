<script setup lang="ts">
import type { Ref } from 'vue';

import { VirtualScrollTable } from '@pdanpdan/virtual-scroll';
import { computed, inject, ref } from 'vue';

import CodeBlock from '#/components/CodeBlock.vue';
import ExampleContainer from '#/components/ExampleContainer.vue';
import ImplementationGuide from '#/components/ImplementationGuide.vue';
import ScrollControls from '#/components/ScrollControls.vue';
import ScrollStatus from '#/components/ScrollStatus.vue';
import { useExampleScroll } from '#/lib/useExampleScroll';

import { html as highlightedCode } from './+Page.vue?highlight';

const itemCount = ref(1000);
const itemSize = ref(0);
const bufferBefore = ref(5);
const bufferAfter = ref(5);
const stickyHeader = ref(true);
const stickyFooter = ref(false);
const virtualScrollbar = ref(true);

const items = computed(() => Array.from({ length: itemCount.value }, (_, i) => ({
  id: i,
  name: `User ${ i }`,
  email: `user${ i }@example.com`,
  role: i % 3 === 0 ? 'Admin' : (i % 3 === 1 ? 'Editor' : 'Viewer'),
  status: i % 2 === 0 ? 'Active' : 'Inactive',
  age: 20 + (i * 7) % 60,
  city: `city${ 1 + i % 5 }`,
})));

const {
  virtualScrollRef,
  scrollDetails,
  onScroll,
  handleScrollToIndex,
  handleScrollToOffset,
} = useExampleScroll();

const debugMode = inject<Ref<boolean>>('debugMode', ref(false));
</script>

<template>
  <ExampleContainer :code="highlightedCode">
    <template #title>
      <span class="example-title example-title--group-5">Table</span>
    </template>

    <template #description>
      Demonstrates usage of custom tags (<strong>table</strong>, <strong>tbody</strong>, <strong>tr</strong>) for semantically correct and accessible tabular data virtualization with {{ itemCount.toLocaleString() }} items. Row height is fixed at {{ itemSize }}px.
    </template>

    <template #icon>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="example-icon example-icon--group-5"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75ZM12 3.75v16.5M3.75 12h16.5" />
      </svg>
    </template>

    <template #subtitle>
      Standard HTML <strong>&lt;table&gt;</strong> virtualization
    </template>

    <template #controls>
      <ScrollStatus :scroll-details="scrollDetails" direction="vertical" />

      <ScrollControls
        v-model:item-count="itemCount"
        v-model:item-size="itemSize"
        v-model:buffer-before="bufferBefore"
        v-model:buffer-after="bufferAfter"
        v-model:sticky-header="stickyHeader"
        v-model:sticky-footer="stickyFooter"
        v-model:virtual-scrollbar="virtualScrollbar"
        direction="vertical"
        @scroll-to-index="handleScrollToIndex"
        @scroll-to-offset="handleScrollToOffset"
        @refresh="virtualScrollRef?.refresh()"
      />
    </template>

    <VirtualScrollTable
      ref="virtualScrollRef"
      :debug="debugMode"
      class="example-container table table-zebra"
      :items="items"
      :item-size="itemSize"
      :buffer-before="bufferBefore"
      :buffer-after="bufferAfter"
      :sticky-header="stickyHeader"
      :sticky-footer="stickyFooter"
      :virtual-scrollbar="virtualScrollbar"
      aria-label="User data table"
      @scroll="onScroll"
    >
      <template #header>
        <tr class="bg-base-200 shadow-sm z-1">
          <th class="w-16 text-end border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">ID</th>
          <th class="w-48 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Name</th>
          <th class="w-72 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Email</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Age</th>
          <th class="w-56 border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">City</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Role</th>
          <th class="w-24 text-center border-b border-base-300 py-3 text-sm small-caps tracking-widest opacity-60">Status</th>
        </tr>
      </template>

      <template #item="{ item, index }">
        <td class="w-16 text-end font-mono text-sm opacity-50">#{{ index }}</td>
        <td class="w-48 font-bold text-sm">{{ item.name }}</td>
        <td class="w-72 text-xs opacity-80">{{ item.email }}</td>
        <td class="w-24 text-center text-sm tabular-nums">{{ item.age }}</td>
        <td class="w-56 text-sm">{{ item.city }}</td>
        <td class="w-24 text-center">
          <span
            class="badge badge-xs @4xl:badge-sm font-semibold"
            :class="{
              'badge-primary': item.role === 'Admin',
              'badge-secondary': item.role === 'Editor',
              'badge-soft': item.role === 'Viewer',
            }"
          >
            {{ item.role }}
          </span>
        </td>
        <td class="w-24 text-center">
          <span
            class="badge badge-xs @4xl:badge-sm font-semibold"
            :class="item.status === 'Active' ? 'badge-success' : 'badge-error'"
          >
            {{ item.status }}
          </span>
        </td>
      </template>

      <template v-if="stickyFooter" #footer>
        <tr class="bg-base-200 shadow-sm z-1">
          <td class="w-full p-4 font-bold text-center border-t border-base-300 text-xs small-caps tracking-widest opacity-60" colspan="7">
            End of {{ itemCount.toLocaleString() }} items
          </td>
        </tr>
      </template>
    </VirtualScrollTable>

    <template #implementation>
      <ImplementationGuide>
        <p>
          A data table with thousands of rows is still a table: column headers, row semantics, and CSS table styling matter as much as scroll performance. <code>VirtualScrollTable</code> virtualizes the <em>rows</em> — the same windowing math <code>VirtualScroll</code> applies to list items — while keeping the document a genuine <code>&lt;table&gt;</code>. The scrollable element is the <code>&lt;table&gt;</code> itself; your header lives in a real <code>&lt;thead&gt;</code>, every item becomes its own <code>&lt;tr&gt;</code> inside the <code>&lt;tbody&gt;</code>, and an invisible spacer row holds the total scroll height. Because only the visible window of rows is ever mounted, the browser can no longer derive column widths from the whole dataset — pinning them is the second half of the work.
        </p>

        <h3>1. Shape the slots like a real table</h3>
        <p>
          <code>VirtualScrollTable</code> renders the table structure; you supply the parts that carry your markup and data:
        </p>
        <ul>
          <li><code>#header</code> — a single <code>&lt;tr&gt;</code> of <code>&lt;th&gt;</code> cells; the component places it inside its <code>&lt;thead&gt;</code>.</li>
          <li><code>#item</code> — the cells of one row (<code>&lt;td&gt;</code>s) <em>without</em> a wrapping <code>&lt;tr&gt;</code>; the component emits one <code>&lt;tr&gt;</code> per item and provides <code>{ item, index }</code>.</li>
          <li><code>#footer</code> — an optional <code>&lt;tr&gt;</code> placed in <code>&lt;tfoot&gt;</code>; a summary row spans every column with <code>colspan</code>.</li>
        </ul>
        <p>
          Class and <code>aria-label</code> pass through to the root <code>&lt;table&gt;</code>, so borders, striping, and captions are ordinary table CSS. That same element is the scroll container, so — like any virtualized list — it needs a definite height (a fixed <code>height</code>, viewport units, or <code>flex-1 min-h-0</code> inside a flex column) before it can scroll.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          line-numbers
          code="&lt;script setup lang=&quot;ts&quot;>
import { VirtualScrollTable } from '@pdanpdan/virtual-scroll';
import { ref } from 'vue';

import '@pdanpdan/virtual-scroll/style.css';

// Real row records: each entry becomes one virtualized &amp;lt;tr>.
const rows = ref(
  Array.from({ length: 100_000 }, (_, id) => ({
    id,
    name: `User ${ id }`,
    email: `user${ id }@example.com`,
    role: id % 3 === 0 ? 'Admin' : 'Editor',
  })),
);
&lt;/script>

&lt;template>
  &amp;lt;!-- The scrollable element IS the semantic &lt;table> and needs a definite
       height to scroll. No item-size => rows measured from the cells;
       a numeric :item-size gives uniform rows with O(1) math instead. -->
  &lt;VirtualScrollTable class=&quot;data-table&quot; :items=&quot;rows&quot; aria-label=&quot;Users table&quot;>
    &amp;lt;!-- #header: a real &lt;tr>, placed in the component's &lt;thead>. -->
    &lt;template #header>
      &lt;tr>
        &lt;th class=&quot;col-id&quot;>ID&lt;/th>
        &lt;th class=&quot;col-name&quot;>Name&lt;/th>
        &lt;th class=&quot;col-email&quot;>Email&lt;/th>
        &lt;th class=&quot;col-role&quot;>Role&lt;/th>
      &lt;/tr>
    &lt;/template>
    &amp;lt;!-- #item: the cells only - the component emits the &lt;tr> per row. -->
    &lt;template #item=&quot;{ item }&quot;>
      &lt;td class=&quot;col-id&quot;>{{ item.id }}&lt;/td>
      &lt;td class=&quot;col-name&quot;>{{ item.name }}&lt;/td>
      &lt;td class=&quot;col-email&quot;>{{ item.email }}&lt;/td>
      &lt;td class=&quot;col-role&quot;>{{ item.role }}&lt;/td>
    &lt;/template>
    &amp;lt;!-- #footer (optional): placed in &lt;tfoot>; span all columns. -->
    &lt;template #footer>
      &lt;tr>
        &lt;td colspan=&quot;4&quot;>{{ rows.length.toLocaleString() }} rows&lt;/td>
      &lt;/tr>
    &lt;/template>
  &lt;/VirtualScrollTable>
&lt;/template>

&lt;style scoped>
.data-table {
  height: 480px;
}
&lt;/style>"
        />

        <h3>2. Choose how row heights are known</h3>
        <p>
          Row sizing offers the same two modes as list virtualization. Leave <code>item-size</code> unset (or pass <code>0</code>) so every mounted row is measured with a <code>ResizeObserver</code>: cells may pad or wrap freely, and the fallback estimate (<code>default-item-size</code>, default <code>40</code>) is used only until a row mounts. For uniform rows, pass a numeric <code>item-size</code>: positions then resolve arithmetically, at the cost that the rendered cell height must equal that number exactly (padding and borders included). When sizes follow a known per-row pattern, an array or a size function works as well.
        </p>

        <h3>3. Pin the column layout</h3>
        <p>
          Table layout is driven by the cells present in the DOM — the header plus whatever rows are currently mounted. As the window moves, different cell content would renegotiate column widths and the table would shift under the cursor; content in unmounted rows never contributes at all. Give every column the same explicit width on the header <code>&lt;th&gt;</code> and the body <code>&lt;td&gt;</code>, either with matching width classes or with <code>nth-child</code> rules as below. Each virtualized row <code>&lt;tr&gt;</code> also carries the library class <code>.virtual-scroll-item</code> (the leading spacer row does not), which gives row-pattern selectors a stable hook for striping.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="css"
          line-numbers
          code="/* Table layout sees only the header plus the mounted window of rows, so
   column widths must be pinned: set the SAME width on the header &amp;lt;th> and
   the body &amp;lt;td> of every column. */
.data-table th.col-id,
.data-table td.col-id {
  width: 6rem;
}

.data-table th.col-name,
.data-table td.col-name {
  width: 14rem;
}

.data-table th.col-email,
.data-table td.col-email {
  width: 18rem;
}

.data-table th.col-role,
.data-table td.col-role {
  width: 8rem;
}

/* Zebra striping and cell chrome are plain CSS. Every virtualized row &amp;lt;tr>
   carries the library class .virtual-scroll-item (the leading spacer &amp;lt;tr>
   does not), so row-pattern selectors can use it to skip the spacer. */
.data-table .virtual-scroll-item:nth-child(even) td {
  background: oklch(50% 0 0 / 0.04);
}

.data-table :is(th, td) {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid oklch(50% 0 0 / 0.12);
  white-space: nowrap;
}"
        />

        <p>
          When column widths or row heights should follow content instead of CSS, set <code>flow-table</code>: rows stay in real table flow (invisible spacer rows keep the virtual offsets) and the browser sizes rows and columns itself. In that mode two strategies replace hand-pinned widths — <code>auto-size-columns</code> measures the first mounted window and pins it as a <code>&lt;colgroup&gt;</code> with <code>table-layout: fixed</code>, and <code>column-widths</code> pins an explicit pixel array. Both require every row to expose the same number of direct cells. Note the root element is then a plain scroll container wrapping the real table, so size that container; wide pinned tables scroll horizontally on their own axis, because only the vertical axis is virtualized.
        </p>

        <CodeBlock
          class="guide-code-block"
          lang="vue"
          code="&lt;template>
  &amp;lt;!-- Alternative: flow-table keeps rows in real table flow (invisible spacer
     rows hold the virtual offsets), so the browser sizes rows and columns
     from actual content. Column strategies apply in this mode:
     auto-size-columns measures the first mounted window (header + rows) and
     pins the widths via a &lt;colgroup> with table-layout: fixed; column-widths
     pins an explicit number[] instead. Every row must expose the same number
     of direct cells. -->
  &lt;VirtualScrollTable
    class=&quot;data-table&quot;
    :items=&quot;rows&quot;
    flow-table
    auto-size-columns
    aria-label=&quot;Users table&quot;
  >
    &lt;template #header>
      &lt;tr>
        &lt;th>ID&lt;/th>
        &lt;th>Name&lt;/th>
        &lt;th>Email&lt;/th>
      &lt;/tr>
    &lt;/template>
    &lt;template #item=&quot;{ item }&quot;>
      &lt;td>{{ item.id }}&lt;/td>
      &lt;td>{{ item.name }}&lt;/td>
      &lt;td>{{ item.email }}&lt;/td>
    &lt;/template>
  &lt;/VirtualScrollTable>
&lt;/template>"
        />
      </ImplementationGuide>
    </template>
  </ExampleContainer>
</template>
