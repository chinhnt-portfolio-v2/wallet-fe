import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for wallet-fe E2E tests.
 *
 * Auth strategy: storageState from global-setup
 *   1. global-setup.ts logs in (TEST_EMAIL/TEST_PASSWORD) or injects WALLET_TOKEN,
 *      pins wallet_language='vi', and saves the context to e2e/.auth/state.json.
 *   2. Project "chromium-auth" + "iphone-12" inherit auth → fast, no per-test reload.
 *   3. Project "chromium-noauth" has NO storageState → fresh browser for the
 *      unauthenticated specs (login page, protected-route redirects).
 *
 * Project / spec split (the key fix — previously every spec ran in every project,
 * so auth specs always failed in chromium-noauth):
 *   - `*.noauth.spec.ts` → run ONLY in chromium-noauth (unauthenticated).
 *   - every other `*.spec.ts` → run in chromium-auth + iphone-12 (authenticated),
 *     and are EXCLUDED from chromium-noauth.
 *
 * Usage (local stack):
 *   BASE_URL=http://localhost:3000 VITE_API_BASE_URL=http://localhost:8080 \
 *     TEST_EMAIL=test@example.com TEST_PASSWORD='Test1234!' npx playwright test
 */
const NOAUTH_GLOB = '**/*.noauth.spec.ts'

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
    // Local FE runs on :3000 (vite dev, proxies /api → :8080). E2E command passes
    // BASE_URL explicitly; the default mirrors that so a bare run still works.
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // 30s aligns with waitForReact() button-wait strategy.
    actionTimeout: 30_000,
  },

  projects: [
    // Authenticated desktop — inherits storageState from global-setup.
    {
      name: 'chromium-auth',
      testIgnore: NOAUTH_GLOB,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/state.json',
      },
    },
    // Unauthenticated — only the noauth specs (login page, redirect guards).
    {
      name: 'chromium-noauth',
      testMatch: NOAUTH_GLOB,
      use: { ...devices['Desktop Chrome'] },
    },
    // Authenticated mobile.
    {
      name: 'iphone-12',
      testIgnore: NOAUTH_GLOB,
      use: {
        ...devices['iPhone 12'],
        storageState: 'e2e/.auth/state.json',
      },
    },
  ],

  globalSetup: './e2e/setup/global-setup.ts',

  timeout: 60_000,
})
