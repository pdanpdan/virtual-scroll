import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The playground runs e2e tests via Playwright (`pnpm test:e2e`), not vitest.
    include: [],
    exclude: [ '**/node_modules/**', '**/dist/**', '**/e2e/**' ],
  },
});
