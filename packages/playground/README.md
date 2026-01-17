# Virtual Scroll Playground

This is the development and demonstration environment for `@pdanpdan/virtual-scroll`.

## Getting Started

1. Install dependencies from the root:
   ```bash
   pnpm install
   ```

2. Run the playground:
   ```bash
   pnpm --filter playground dev
   ```

3. Open your browser at `http://localhost:5173`.

## Features

- **Live HMR**: Changes made to `packages/virtual-scroll/src` are immediately reflected in the playground without a rebuild.
- **SSR**: All pages are server side generated and hydrated in client. You can test them with JS enables/disabled to see the behavior and to check for htdration errors.

## Tech Stack

- [Vike](https://vike.dev/)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [daisyUI](https://daisyui.com/)
