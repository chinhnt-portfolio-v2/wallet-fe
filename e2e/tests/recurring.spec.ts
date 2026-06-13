import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Recurring Page ─────────────────────────────────────────────────────────
test.describe('Recurring Page', () => {
  test('renders with "Giao dịch định kỳ" heading', async ({ page }) => {
    await page.goto(`${BASE}/recurring`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Giao dịch định kỳ/i })).toBeVisible()
  })

  test('shows "Tạo mới" button', async ({ page }) => {
    await page.goto(`${BASE}/recurring`)
    await waitForReact(page)
    await expect(content(page).getByRole('button', { name: /Tạo mới/i })).toBeVisible()
  })

  test('renders seeded recurring rules (no 500)', async ({ page }) => {
    await page.goto(`${BASE}/recurring`)
    await waitForReact(page)
    // P1 fixed the GET /recurring 500. Seeded rules: "Lương hàng tháng" + "Internet".
    // The page must render a rules section ("Đang hoạt động"), never an error.
    await expect(content(page).getByText(/Đang hoạt động/i).first()).toBeVisible({ timeout: 30_000 })
  })
})

// ─── Create Recurring Rule ───────────────────────────────────────────────────
test.describe('Create Recurring Rule', () => {
  test('opens BottomSheet with type tabs', async ({ page }) => {
    await page.goto(`${BASE}/recurring`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Tạo mới/i }).first().click()
    const cancelBtn = content(page).getByRole('button', { name: /Hủy/i })
    await cancelBtn.waitFor({ state: 'visible', timeout: 10_000 })
    // Type tabs are a SegmentedControl: "Chi" / "Thu".
    await expect(content(page).getByRole('tab', { name: /Chi/i })).toBeVisible()
    await expect(content(page).getByRole('tab', { name: /Thu/i })).toBeVisible()
  })

  test('shows frequency options', async ({ page }) => {
    await page.goto(`${BASE}/recurring`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Tạo mới/i }).first().click()
    await content(page).getByRole('button', { name: /Hủy/i }).waitFor({ state: 'visible', timeout: 10_000 })
    for (const freq of ['Hàng ngày', 'Hàng tuần', 'Hàng tháng', 'Hàng năm']) {
      await expect(content(page).getByRole('button', { name: freq }).first()).toBeVisible()
    }
  })

  test('cancel closes form', async ({ page }) => {
    await page.goto(`${BASE}/recurring`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Tạo mới/i }).first().click()
    const cancelBtn = content(page).getByRole('button', { name: /Hủy/i })
    await cancelBtn.waitFor({ state: 'visible', timeout: 10_000 })
    await cancelBtn.click()
    await cancelBtn.waitFor({ state: 'hidden', timeout: 5_000 })
  })
})
