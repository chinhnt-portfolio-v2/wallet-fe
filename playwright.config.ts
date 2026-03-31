import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for wallet-fe E2E tests.
 *
 * Auth strategy: storageState from global-setup
 *   1. global-setup.ts injects WALLET_TOKEN into localStorage once
 *   2. Saves browser context (with auth) to e2e/.auth/state.json
 *   3. Project "chromium-auth" inherits auth → fast, no per-test reload
 *   4. Project "chromium-noauth" has no storageState → fresh browser for
 *      unauthenticated tests (clearAuth, protected-route redirects)
 *
 * Usage:
 *   # Against Vercel deploy (recommended for CI)
 *   BASE_URL=https://wallet-fe-two.vercel.app WALLET_TOKEN=eyJ... npx playwright test
 *
 *   # Local dev (requires vite dev server on port 5173)
 *   BASE_URL=http://localhost:5173 WALLET_TOKEN=eyJ... npx playwright test
 *
 *   # Without token: all auth tests skip; unauth tests still run
 */
export default defineConfig({
  testDir: './e2e/tests',

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e/reports', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173', // Vite proxy forwards /api → GCP backend in dev
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 30s aligns with waitForReact() button-wait strategy
    actionTimeout: 30_000,
  },

  // "chromium-auth" — inherits storageState from global-setup (fast auth)
  projects: [
    {
      name: 'chromium-auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/state.json',
      },
    },
    // "chromium-noauth" — no storageState for unauthenticated tests
    {
      name: 'chromium-noauth',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile
    {
      name: 'iphone-12',
      use: {
        ...devices['iPhone 12'],
        storageState: 'e2e/.auth/state.json',
      },
    },
  ],

  globalSetup: './e2e/setup/global-setup.ts',

  timeout: 60_000,
})
