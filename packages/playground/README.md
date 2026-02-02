# @pdanpdan/virtual-scroll Playground

This is the development, testing, and demonstration environment for the [`@pdanpdan/virtual-scroll`](../virtual-scroll) package.

It contains numerous examples showcasing various features and patterns of the library.

## Explore

- **Documentation & Examples:** [Live Demo & Docs](https://pdanpdan.github.io/virtual-scroll/)
- **LLM Documentation:** [llms.txt](./public/llms.txt) ([web](https://pdanpdan.github.io/virtual-scroll/llms.txt))
- **Main Package:** [`@pdanpdan/virtual-scroll`](../virtual-scroll)

## Getting Started

1. Install dependencies from the project root:
   ```bash
   pnpm install
   ```

2. Run the playground in development mode:
   ```bash
   pnpm --filter playground dev
   ```

3. Open your browser at `http://localhost:5173`.

## Features

- **Live HMR**: Changes made to `packages/virtual-scroll/src` are immediately reflected in the playground without a rebuild.
- **SSR Support**: All pages are Server-Side Generated (SSG) and hydrated in the client, allowing you to test performance and SEO-friendliness.

## Tech Stack

- [Vike](https://vike.dev/)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)
