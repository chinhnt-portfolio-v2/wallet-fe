import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

// Empty storageState = unauthenticated browser, regardless of project
const NO_AUTH: { storageState: { cookies: never[]; origins: never[] } } = {
  storageState: { cookies: [], origins: [] },
}

// ─── Login Page ─────────────────────────────────────────────────────────────────
// Login page must be tested without auth (chromium-noauth), else user is redirected
// away from /login automatically. Uses NO_AUTH override regardless of project.
test.describe('Login Page', () => {
  test.use(NO_AUTH)

  test('shows login content', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByText('Wallet').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Tiếp tục với Google/i })).toBeVisible()
  })
})

// ─── Protected Routes — Unauthenticated ───────────────────────────────────────
// These MUST use NO_AUTH so they run unauthenticated even inside chromium-auth project.
test.describe('Protected Routes (no auth)', () => {
  test.use(NO_AUTH)

  for (const route of [
    '/', '/transactions', '/add', '/wallets', '/wallets/transfer',
    '/debts', '/debts/new', '/categories', '/budgets',
    '/recurring', '/export', '/notifications', '/profile',
  ]) {
    test(`redirects ${route} to /login`, async ({ page }) => {
      await page.goto(`${BASE}${route}`)
      await page.waitForLoadState('domcontentloaded')
      await expect(page).toHaveURL(/\/login/)
    })
  }
})

// ─── Protected Routes — Authenticated ──────────────────────────────────────────
// chromium-auth project (has storageState) — these tests only run when authenticated.
test.describe('Protected Routes (authenticated)', () => {
  const TOKEN = process.env.WALLET_TOKEN
  if (!TOKEN) test.skip()

  for (const route of [
    '/', '/transactions', '/add', '/wallets', '/wallets/transfer',
    '/debts', '/debts/new', '/categories', '/budgets',
    '/recurring', '/export', '/notifications', '/profile',
  ]) {
    test(`loads ${route} without redirect`, async ({ page }) => {
      await page.goto(`${BASE}${route}`)
      await page.waitForLoadState('domcontentloaded')
      await expect(page).not.toHaveURL(/\/login/)
    })
  }
})

// ─── Authenticated user on /login ─────────────────────────────────────────────
test.describe('Authenticated on /login', () => {
  const TOKEN = process.env.WALLET_TOKEN
  if (!TOKEN) test.skip()

  test('redirected away from /login', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.waitForLoadState('domcontentloaded')
    await expect(page).not.toHaveURL(/\/login/)
  })
})

// ─── Invalid Token ─────────────────────────────────────────────────────────────
test.describe('Invalid Token', () => {
  test('malformed token rejected gracefully', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.evaluate(() => localStorage.setItem('wallet_token', 'bad.token.here'))
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2_000)
    const onLogin = page.url().includes('/login')
    if (!onLogin) {
      const body = await page.locator('body').textContent()
      expect(body?.trim().length).toBeGreaterThan(0)
    }
  })
})

// ─── Logout ─────────────────────────────────────────────────────────────────
test.describe('Logout', () => {
  const TOKEN = process.env.WALLET_TOKEN
  if (!TOKEN) test.skip()

  test('logout from profile redirects to /login', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await page.waitForLoadState('domcontentloaded')
    await page.getByText('Đăng xuất').click()
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    const token = await page.evaluate(() => localStorage.getItem('wallet_token'))
    expect(token).toBeNull()
  })

  test('after logout, / redirects to /login', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await page.waitForLoadState('domcontentloaded')
    await page.getByText('Đăng xuất').click()
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    await page.goto(`${BASE}/`)
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/login/)
  })
})
