import { test, expect, Page } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// Authed specs (chromium-auth desktop + iphone-12 mobile). The layout differs by
// viewport: desktop renders the Sidebar (md:flex), mobile renders the Header brand
// + BottomNav (md:hidden). The app-shell keeps BOTH layouts in the DOM and hides
// one per viewport with CSS, so queries must target the *visible* element.

/** A visible nav link whose accessible name contains `name` (glyph-prefixed). */
function navLink(page: Page, name: RegExp) {
  return page.getByRole('link', { name }).locator('visible=true').first()
}

// ─── Primary navigation links ──────────────────────────────────────────────────
test.describe('Primary Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
  })

  test('shows the 4 primary nav items', async ({ page }) => {
    await expect(navLink(page, /Tổng quan/)).toBeVisible()
    await expect(navLink(page, /Giao dịch/)).toBeVisible()
    await expect(navLink(page, /Nợ/)).toBeVisible()
    await expect(navLink(page, /Ngân sách/)).toBeVisible()
  })

  test('Tổng quan → /', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await navLink(page, /Tổng quan/).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(`${BASE}/`)
  })

  test('Giao dịch → /transactions', async ({ page }) => {
    await navLink(page, /Giao dịch/).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/transactions/)
  })

  test('Nợ → /debts', async ({ page }) => {
    await navLink(page, /Nợ/).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/debts/)
  })

  test('Ngân sách → /budgets', async ({ page }) => {
    await navLink(page, /Ngân sách/).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/budgets/)
  })
})

// ─── Header ───────────────────────────────────────────────────────────────────
test.describe('Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
  })

  test('notification bell points to /notifications', async ({ page }) => {
    await expect(page.locator('a[href="/notifications"]').locator('visible=true').first()).toBeVisible()
  })

  test('language toggle is visible and clickable', async ({ page }) => {
    // Header replaced the dark-mode toggle with an EN/VI language toggle.
    const toggle = page
      .getByRole('button', { name: /Switch to English|Chuyển sang Tiếng Việt/i })
      .locator('visible=true')
      .first()
    await expect(toggle).toBeVisible()
    await toggle.click()
  })

  test('"Log expense" pill navigates to /add', async ({ page }) => {
    await page
      .getByRole('button', { name: /Ghi chi tiêu/i })
      .locator('visible=true')
      .first()
      .click()
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
