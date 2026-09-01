import { env } from 'node:process';

import { defineConfig, devices } from '@playwright/test';

import { BASE_URL } from './e2e/env';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!env.CI,
  retries: env.CI ? 2 : 0,
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    ...devices[ 'Desktop Chromium' ],
  },
});
