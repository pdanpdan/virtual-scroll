import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [ vue() ],
  test: {
    environment: 'jsdom',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: [ 'text', 'json', 'html' ],
      include: [ 'src/**' ],
      exclude: [
        'src/index.ts',
        'src/**/*.test.ts',
        'src/**/*.d.ts',
      ],
    },
  },
});
