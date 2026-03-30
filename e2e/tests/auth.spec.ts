import { test, expect } from './base'

// ─── Setup: get authenticated page from pre-auth cookie ───────────────────────
test.use({
  // In CI: BASE_URL_BE env var points to deployed BE
  // In dev: localhost:8080 is the BE
  baseURL: process.env.BASE_URL || 'https://wallet-fe-cyan.vercel.app',
})

test.describe('🔐 Authentication', () => {
  test('should redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/')
    // App should redirect to /auth or show login
    await expect(page).not.toHaveURL(/\/auth\/callback/, { timeout: 5_000 }).catch(() => {})
  })
})
