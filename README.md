# Virtual Scroll

Monorepo for a high-performance Vue 3 virtual scrolling library and its playground/demonstration environment.

## Packages

- **[@pdanpdan/virtual-scroll](./packages/virtual-scroll)**: Core library providing high-performance virtualization for Vue 3.
- **[playground](./packages/playground)**: Live playground/demonstration environment, showcase various usage scenarios.

## Getting Started

### Installation

```bash
pnpm install
```

### Development

Start the playground in development mode with SSR and HMR enabled for the library:

```bash
pnpm dev
```

### Build

Build all packages in the workspace:

```bash
pnpm build
```

### Testing

Run all test and checks for the core library (linting, typescript type checking, test suite):

```bash
pnpm test:all
```

Run the test suite for the core library:

```bash
pnpm test
```

Run the test suite for the core library and show result in web interface:

```bash
pnpm test:ui
```

### Linting

Run linting across the entire workspace:

```bash
pnpm lint
```

Fix linting across the entire workspace:

```bash
pnpm lint:fix
```

## License

MIT
