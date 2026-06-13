import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Budgets Page ────────────────────────────────────────────────────────────────
test.describe('Budgets Page', () => {
  test('renders with "Ngân sách" heading', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    // Heading is "Ngân sách · {Tháng N YYYY}".
    await expect(content(page).getByRole('heading', { name: /Ngân sách/i })).toBeVisible()
  })

  test('shows month navigation controls', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await expect(content(page).getByRole('button', { name: '←' })).toBeVisible()
    await expect(content(page).getByRole('button', { name: '→' })).toBeVisible()
  })

  test('shows current month label', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    // Month selector label, e.g. "Tháng 6 2026".
    await expect(content(page).getByText(/Tháng\s+\d+\s+\d{4}/).first()).toBeVisible()
  })

  test('shows "Thêm danh mục" button', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await expect(content(page).getByRole('button', { name: /Thêm danh mục/i }).first()).toBeVisible()
  })
})

// ─── Month Navigation ─────────────────────────────────────────────────────────
test.describe('Month Navigation', () => {
  test('previous month changes the label', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    const label = content(page).getByText(/Tháng\s+\d+\s+\d{4}/).first()
    const before = await label.textContent()
    await content(page).getByRole('button', { name: '←' }).click()
    await expect(label).not.toHaveText(before ?? '')
  })

  test('next month changes the label', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    const label = content(page).getByText(/Tháng\s+\d+\s+\d{4}/).first()
    const before = await label.textContent()
    await content(page).getByRole('button', { name: '→' }).click()
    await expect(label).not.toHaveText(before ?? '')
  })
})

// ─── Create Budget ─────────────────────────────────────────────────────────────
test.describe('Create Budget', () => {
  test('opens BottomSheet form', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Thêm danh mục/i }).first().click()
    // The form's cancel button signals the sheet opened.
    await expect(content(page).getByRole('button', { name: /Hủy/i })).toBeVisible()
  })

  test('shows alert threshold options', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Thêm danh mục/i }).first().click()
    await expect(content(page).getByRole('button', { name: /Hủy/i })).toBeVisible()
    for (const pct of ['80%', '90%', '100%']) {
      await expect(content(page).getByRole('button', { name: pct }).first()).toBeVisible()
    }
  })

  test('cancel closes form', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Thêm danh mục/i }).first().click()
    const cancelBtn = content(page).getByRole('button', { name: /Hủy/i })
    await cancelBtn.waitFor({ state: 'visible', timeout: 10_000 })
    await cancelBtn.click()
    await cancelBtn.waitFor({ state: 'hidden', timeout: 5_000 })
  })
})
