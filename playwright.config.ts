import { defineConfig, devices } from '@playwright/test'

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
    baseURL: process.env.BASE_URL || 'https://wallet-fe-cyan.vercel.app',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  globalSetup: './e2e/setup/global-setup.ts',
  webServer: process.env.CI ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Reuse auth state from globalSetup
        storageState: 'e2e/.auth/state.json',
      },
    },
    {
      name: 'iphone-12',
      use: {
        ...devices['iPhone 12'],
        storageState: 'e2e/.auth/state.json',
      },
    },
  ],
})
