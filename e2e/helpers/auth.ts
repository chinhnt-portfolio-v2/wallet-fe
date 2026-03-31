import { test as base, Page } from '@playwright/test'

// ── Manual token auth helpers ─────────────────────────────────────────────────

/**
 * Inject a JWT token into localStorage, simulating a logged-in user.
 * Call this BEFORE navigating to a protected route.
 *
 * Usage:
 *   await injectToken(page, 'your.jwt.token.here')
 *   await page.goto('/dashboard')
 */
export async function injectToken(page: Page, token: string) {
  await page.goto('/')
  await page.evaluate(
    (t) => {
      localStorage.setItem('wallet_token', t)
      localStorage.removeItem('wallet_onboarding_done') // ensure onboarding re-runs
    },
    token,
  )
  await page.reload()
}

/**
 * Clear the auth token from localStorage, simulating a logged-out user.
 */
export async function clearAuth(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('wallet_token')
    localStorage.removeItem('wallet_refresh_token')
    localStorage.removeItem('wallet_onboarding_done')
    localStorage.removeItem('wallet_theme')
  })
}

/**
 * Get the current auth token from localStorage (for debugging).
 */
export async function getToken(page: Page): Promise<string | null> {
  return page.evaluate(() => localStorage.getItem('wallet_token'))
}

// ── Playwright test fixture that pre-authenticates every test ─────────────────

/**
 * Returns the raw WALLET_TOKEN env var. If not set, returns null.
 * Tests that need auth will skip if this is null.
 */
export function getTestToken(): string | null {
  return process.env.WALLET_TOKEN ?? null
}

/**
 * Base test fixture — optionally pre-authenticated.
 *
 * If WALLET_TOKEN is set:
 *   → inject token, goto baseURL, skip if auth fails
 * If WALLET_TOKEN is not set:
 *   → goto baseURL as-is (tests will be unauthenticated)
 */
export const authenticatedTest = base.extend<{ token: string | null }>({
  token: async ({ page }, use) => {
    const token = getTestToken()
    if (token) {
      await injectToken(page, token)
      // Verify auth worked — dashboard should NOT redirect to /login
      await page.waitForURL(url => !url.pathname.endsWith('/login'), { timeout: 10_000 }).catch(() => {})
    }
    await use(token)
  },
})

export { test as unauthenticatedTest } from '@playwright/test'

// ── Assertions helpers ────────────────────────────────────────────────────────

/**
 * Check if the current page is on the login page.
 */
export async function isOnLoginPage(page: Page): Promise<boolean> {
  return page.url().includes('/login')
}

/**
 * Check if the current page is on a protected route (dashboard loaded).
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const url = page.url()
  return !url.includes('/login') && !url.includes('/auth')
}
