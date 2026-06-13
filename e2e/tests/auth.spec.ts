import { test, expect } from '@playwright/test'
import { content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// Authenticated specs — run in chromium-auth + iphone-12 (storageState from
// global-setup). The unauthenticated counterparts live in auth.noauth.spec.ts.

// ─── Protected Routes — Authenticated ──────────────────────────────────────────
test.describe('Protected Routes (authenticated)', () => {
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
  test('redirected away from /login', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.waitForLoadState('domcontentloaded')
    await expect(page).not.toHaveURL(/\/login/)
  })
})

// ─── Logout ─────────────────────────────────────────────────────────────────
test.describe('Logout', () => {
  test('logout from profile redirects to /login', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await page.waitForLoadState('domcontentloaded')
    // Danger-zone CTA: "Đăng xuất thiết bị này →"
    await content(page).getByRole('button', { name: /Đăng xuất/i }).click()
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    const token = await page.evaluate(() => localStorage.getItem('wallet_token'))
    expect(token).toBeNull()
  })

  test('after logout, / redirects to /login', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await page.waitForLoadState('domcontentloaded')
    await content(page).getByRole('button', { name: /Đăng xuất/i }).click()
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    await page.goto(`${BASE}/`)
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/login/)
  })
})
