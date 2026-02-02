# @pdanpdan/virtual-scroll

A high-performance, flexible virtual scrolling component for Vue 3 that supports massive datasets (up to billions of pixels) through coordinate scaling.

[![NPM Version](https://img.shields.io/npm/v/@pdanpdan/virtual-scroll.svg)](https://www.npmjs.com/package/@pdanpdan/virtual-scroll)
[![License](https://img.shields.io/npm/l/@pdanpdan/virtual-scroll.svg)](./LICENSE)

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
