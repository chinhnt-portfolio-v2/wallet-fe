import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Profile Page ─────────────────────────────────────────────────────────────
test.describe('Profile Page', () => {
  test('renders with "Cài đặt" heading', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Cài đặt/i })).toBeVisible()
  })

  test('shows the real user email', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    // F12 fix: real authenticated user, not hardcoded "khanh.ng".
    await expect(content(page).getByText('test@example.com').first()).toBeVisible({ timeout: 30_000 })
  })

  test('shows name (or "Chưa đặt tên" fallback)', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    // Seeded user has no name → fallback "Chưa đặt tên".
    await expect(content(page).getByText(/Chưa đặt tên/i).first()).toBeVisible()
  })

  test('shows preference menu links', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await expect(content(page).getByText('Xuất dữ liệu CSV')).toBeVisible()
    await expect(content(page).getByText('Giao dịch định kỳ')).toBeVisible()
    await expect(content(page).getByText('Ngân sách', { exact: true })).toBeVisible()
  })

  test('logout CTA visible', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await expect(content(page).getByRole('button', { name: /Đăng xuất/i })).toBeVisible()
  })

  test('shows app version footer', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    // Footer: "Wallet · v2.0 · Dark Editorial".
    await expect(content(page).getByText(/Wallet ·.*·.*Editorial/i)).toBeVisible()
  })
})

// ─── Profile Menu Links ────────────────────────────────────────────────────────
test.describe('Profile Menu Links', () => {
  test('"Xuất dữ liệu CSV" → /export', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await content(page).getByText('Xuất dữ liệu CSV').click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/export/)
  })

  test('"Giao dịch định kỳ" → /recurring', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await content(page).getByText('Giao dịch định kỳ').click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/recurring/)
  })

  test('"Ngân sách" → /budgets', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await content(page).getByText('Ngân sách', { exact: true }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/budgets/)
  })
})

// ─── Logout ───────────────────────────────────────────────────────────────────
test.describe('Logout', () => {
  test('clears token and redirects to /login', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Đăng xuất/i }).click()
    await page.waitForURL(/\/login/, { timeout: 30_000 })
    const token = await page.evaluate(() => localStorage.getItem('wallet_token'))
    expect(token).toBeNull()
  })
})
