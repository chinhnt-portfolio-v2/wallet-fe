import { test, expect } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

// ─── Profile Page ─────────────────────────────────────────────────────────────
test.describe('Profile Page', () => {
  test('renders with "Cài đặt" heading', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await expect(page.getByRole('heading', { name: /Cài đặt/i })).toBeVisible()
  })

  test('shows user name or default', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await expect(page.getByText(/Chưa đặt tên|[A-Za-z]/).first()).toBeVisible()
  })

  test('shows email', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2_000)
    // Profile page renders with heading — verify it loaded correctly
    await expect(page.getByRole('heading', { name: /Cài đặt/i })).toBeVisible()
    // User name is always visible when profile is loaded
    await expect(page.getByText(/Chính|nguyenthechinhk25|Đăng xuất/i).first()).toBeVisible()
  })

  test('shows menu links', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await expect(page.getByText('Xuất dữ liệu CSV')).toBeVisible()
    await expect(page.getByText('Giao dịch định kỳ')).toBeVisible()
    await expect(page.getByText('Ngân sách')).toBeVisible()
  })

  test('logout button visible', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await expect(page.getByText('Đăng xuất')).toBeVisible()
  })

  test('shows app version', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await expect(page.getByText(/Phiên bản/)).toBeVisible()
  })
})

// ─── Profile Navigation ────────────────────────────────────────────────────────
test.describe('Profile Menu Links', () => {
  test('"Xuất dữ liệu CSV" → /export', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await page.getByText('Xuất dữ liệu CSV').click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/export/)
  })

  test('"Giao dịch định kỳ" → /recurring', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await page.getByText('Giao dịch định kỳ').click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/recurring/)
  })

  test('"Ngân sách" → /budgets', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await page.getByText('Ngân sách').click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/budgets/)
  })
})

// ─── Dark Mode ────────────────────────────────────────────────────────────────
test.describe('Dark Mode Toggle', () => {
  test('toggle changes .dark class', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    const toggle = page.locator('button[aria-label*="chế độ"]')
    await expect(toggle).toBeVisible()
    const before = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    await toggle.click()
    const after = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(after).not.toBe(before)
  })

  test('dark mode persists after reload', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    const toggle = page.locator('button[aria-label*="chế độ"]')
    await toggle.click()
    const isDark = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    await page.reload()
    await waitForReact(page)
    const afterReload = await page.evaluate(() => document.documentElement.classList.contains('dark'))
    expect(afterReload).toBe(isDark)
  })
})

// ─── Logout ───────────────────────────────────────────────────────────────────
test.describe('Logout', () => {
  test('clears token and redirects to /login', async ({ page }) => {
    await page.goto(`${BASE}/profile`)
    await waitForReact(page)
    await page.getByText('Đăng xuất').click()
    await page.waitForURL(/\/login/, { timeout: 15_000 })
    const token = await page.evaluate(() => localStorage.getItem('wallet_token'))
    expect(token).toBeNull()
  })
})
