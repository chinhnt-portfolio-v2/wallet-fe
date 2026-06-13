import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Categories Page ──────────────────────────────────────────────────────────
test.describe('Categories Page', () => {
  test('renders with "Danh mục" heading', async ({ page }) => {
    await page.goto(`${BASE}/categories`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Danh mục/i })).toBeVisible()
  })

  test('shows EXPENSE / INCOME segmented tabs', async ({ page }) => {
    await page.goto(`${BASE}/categories`)
    await waitForReact(page)
    await expect(content(page).getByRole('tab', { name: /Chi tiêu/i })).toBeVisible()
    await expect(content(page).getByRole('tab', { name: /Thu nhập/i })).toBeVisible()
  })

  test('lists seeded expense categories', async ({ page }) => {
    await page.goto(`${BASE}/categories`)
    await waitForReact(page)
    // Default tab is EXPENSE; "Ăn uống" is a seeded expense category.
    await expect(content(page).getByText('Ăn uống').first()).toBeVisible({ timeout: 30_000 })
  })

  test('"Thêm" opens the create form', async ({ page }) => {
    await page.goto(`${BASE}/categories`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Thêm/i }).first().click()
    // The create form input ("Tên danh mục" placeholder) appears.
    await expect(content(page).getByPlaceholder(/VD: Ăn uống, Đi lại/i)).toBeVisible()
  })
})
