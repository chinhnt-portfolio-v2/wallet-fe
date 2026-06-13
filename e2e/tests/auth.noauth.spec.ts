import { test, expect } from '@playwright/test'
import { pinLocale } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// This file runs ONLY in the chromium-noauth project (no storageState), so the
// browser is genuinely unauthenticated. See playwright.config.ts testMatch.

// ─── Login Page ───────────────────────────────────────────────────────────────
test.describe('Login Page', () => {
  test('shows login content', async ({ page }) => {
    await pinLocale(page)
    await page.goto(`${BASE}/login`)
    await page.waitForLoadState('domcontentloaded')
    // Brand mark is the page h1 "Ví" (Minh redesign).
    await expect(page.getByRole('heading', { name: 'Ví', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /Tiếp tục với Google/i })).toBeVisible()
  })

  test('shows email + password fields and sign-in CTA', async ({ page }) => {
    await pinLocale(page)
    await page.goto(`${BASE}/login`)
    await page.waitForLoadState('domcontentloaded')
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Đăng nhập/i }).first()).toBeVisible()
  })
})

// ─── Protected Routes — Unauthenticated ───────────────────────────────────────
test.describe('Protected Routes (no auth)', () => {
  for (const route of [
    '/', '/transactions', '/add', '/wallets', '/wallets/transfer',
    '/debts', '/debts/new', '/categories', '/budgets',
    '/recurring', '/export', '/notifications', '/profile',
  ]) {
    test(`redirects ${route} to /login`, async ({ page }) => {
      await pinLocale(page)
      await page.goto(`${BASE}${route}`)
      await page.waitForLoadState('domcontentloaded')
      await expect(page).toHaveURL(/\/login/)
    })
  }
})

// ─── Invalid Token ─────────────────────────────────────────────────────────────
test.describe('Invalid Token', () => {
  test('malformed token rejected gracefully', async ({ page }) => {
    await pinLocale(page)
    await page.goto(`${BASE}/`)
    await page.evaluate(() => localStorage.setItem('wallet_token', 'bad.token.here'))
    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2_000)
    // Either redirected to /login OR rendered the app shell without a blank screen.
    const onLogin = page.url().includes('/login')
    if (!onLogin) {
      const body = await page.locator('body').textContent()
      expect(body?.trim().length).toBeGreaterThan(0)
    }
  })
})
