# @pdanpdan/virtual-scroll

A virtual scrolling component for Vue 3: only the rows near the viewport are in the DOM, so lists, grids, tables and masonry layouts stay fast however long they get.

[![NPM Version](https://img.shields.io/npm/v/@pdanpdan/virtual-scroll.svg)](https://www.npmjs.com/package/@pdanpdan/virtual-scroll)
[![License](https://img.shields.io/npm/l/@pdanpdan/virtual-scroll.svg)](./LICENSE)

**Documentation and live examples: [pdanpdan.github.io/virtual-scroll](https://pdanpdan.github.io/virtual-scroll/)** - every feature there is a running example with its code next to it, and the [configurator](https://pdanpdan.github.io/virtual-scroll/configurator/) writes the component for the options you pick.

Rows can be a plain vertical list, a horizontal strip, or a grid on both axes, in its own scroll container or in the page itself. Sizes can be one number, a value per row, or measured from the DOM as rows change. Sticky headers, snapping, infinite loading, RTL, keyboard navigation, ARIA roles, SSR and virtual scrollbars are opt-in, and there are dedicated components for table and masonry layouts. No dependencies besides Vue.

```vue
<script setup>
import { VirtualScroll } from '@pdanpdan/virtual-scroll';

import '@pdanpdan/virtual-scroll/style.css';

const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, label: `Item ${ i }` }));
</script>

<template>
  <VirtualScroll :items="items" :item-size="50" class="list">
    <template #item="{ item }">
      <div class="row">{{ item.label }}</div>
    </template>
  </VirtualScroll>
</template>

<style scoped>
.list { height: 500px; }
.row { height: 50px; }
</style>
```

Ten thousand rows, about twenty of them in the DOM. The usage documentation - props, slots, events, composables and the rest - is in [`packages/virtual-scroll/README.md`](./packages/virtual-scroll/README.md) and on the site above. What follows here is about working on this repository.

## Links

- **Documentation & Live Examples:** [https://pdanpdan.github.io/virtual-scroll/](https://pdanpdan.github.io/virtual-scroll/)
- **LLM Documentation:** [llms.txt](./packages/playground/public/llms.txt) ([web](https://pdanpdan.github.io/virtual-scroll/llms.txt))
- **NPM Package:** [https://www.npmjs.com/package/@pdanpdan/virtual-scroll](https://www.npmjs.com/package/@pdanpdan/virtual-scroll)
- **GitHub Repository:** [https://github.com/pdanpdan/virtual-scroll](https://github.com/pdanpdan/virtual-scroll)

## Project Structure

This is a monorepo managed by `pnpm`.

- **[`@pdanpdan/virtual-scroll`](./packages/virtual-scroll)**: The core library.
- **[`playground`](./packages/playground)**: Documentation and demonstration environment.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

Start the playground in development mode (with SSR and HMR enabled for the library):

```bash
pnpm dev
```

### Build

Build all packages:

```bash
pnpm build
```

### Testing

Run all checks (linting, type checking, tests) for the core library:

```bash
pnpm test:all
```

## License

MIT
