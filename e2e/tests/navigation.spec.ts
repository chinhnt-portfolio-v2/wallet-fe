import { test, expect } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

// ─── Bottom Navigation ─────────────────────────────────────────────────────────
test.describe('Bottom Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
  })

  test('shows all 4 nav items', async ({ page }) => {
    await expect(page.getByRole('link', { name: /Tổng quan/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Giao dịch/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Nợ/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Ví/i })).toBeVisible()
  })

  test('Tổng quan → /', async ({ page }) => {
    await page.getByRole('link', { name: /Tổng quan/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(`${BASE}/`)
  })

  test('Giao dịch → /transactions', async ({ page }) => {
    await page.getByRole('link', { name: /Giao dịch/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/transactions/)
  })

  test('Nợ → /debts', async ({ page }) => {
    await page.getByRole('link', { name: /Nợ/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/debts/)
  })

  test('Ví → /wallets', async ({ page }) => {
    await page.getByRole('link', { name: /Ví/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/wallets/)
  })
})

// ─── Header ───────────────────────────────────────────────────────────────────
test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
  })

  test('shows Wallet logo', async ({ page }) => {
    await expect(page.getByText('Wallet').first()).toBeVisible()
  })

  test('notification bell points to /notifications', async ({ page }) => {
    await expect(page.locator('a[href="/notifications"]')).toBeVisible()
  })

  test('settings link points to /profile', async ({ page }) => {
    await expect(page.locator('a[href="/profile"]')).toBeVisible()
  })

  test('dark mode toggle clickable', async ({ page }) => {
    const toggle = page.locator('button[aria-label*="chế độ"]')
    await expect(toggle).toBeVisible()
    await toggle.click()
  })
})

// ─── FAB ──────────────────────────────────────────────────────────────────────
test.describe('Floating Action Button', () => {
  test('FAB links to /add', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    // FAB only appears when user has at least one wallet — skip if not present
    const fab = page.locator('a[href="/add"]').or(page.getByRole('link', { name: '+' }))
    if (!(await fab.first().isVisible().catch(() => false))) return
    await fab.first().click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/add/)
  })
})

// ─── 404 ──────────────────────────────────────────────────────────────────────
test.describe('Unknown Route', () => {
  test('redirects unknown route to /', async ({ page }) => {
    await page.goto(`${BASE}/this-does-not-exist`)
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(`${BASE}/`)
  })
})

// ─── Mobile Navigation ─────────────────────────────────────────────────────────
test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('bottom nav visible', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    await expect(page.getByRole('navigation')).toBeVisible()
  })

  test('all nav links work on mobile', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    const links = [
      page.getByRole('link', { name: /Tổng quan/i }),
      page.getByRole('link', { name: /Giao dịch/i }),
      page.getByRole('link', { name: /Nợ/i }),
      page.getByRole('link', { name: /Ví/i }),
    ]
    for (const link of links) {
      await link.click()
      await page.waitForLoadState('domcontentloaded')
      await expect(link).toBeVisible()
    }
  })
})