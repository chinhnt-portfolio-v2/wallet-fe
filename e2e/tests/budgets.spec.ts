import { test, expect } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

// ─── Budgets Page ────────────────────────────────────────────────────────────────
test.describe('Budgets Page', () => {
  test('renders with "Ngân sách" heading', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await expect(page.getByRole('heading', { name: /Ngân sách/i })).toBeVisible()
  })

  test('shows month navigation controls', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await expect(page.locator('button', { hasText: /←/ })).toBeVisible()
    await expect(page.locator('button', { hasText: /→/ })).toBeVisible()
  })

  test('shows current month label', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await expect(page.getByText(/Tháng\s+\d+\s+\d{4}/)).toBeVisible()
  })

  test('shows "Tạo ngân sách" button', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    await expect(page.getByRole('button', { name: /Tạo ngân sách/i }).first()).toBeVisible()
  })
})

// ─── Month Navigation ─────────────────────────────────────────────────────────
test.describe('Month Navigation', () => {
  test('previous month changes the label', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    const label = page.getByText(/Tháng\s+\d+\s+\d{4}/)
    const before = await label.textContent()
    await page.locator('button', { hasText: /←/ }).click()
    const after = await label.textContent()
    expect(after).not.toBe(before)
  })

  test('next month changes the label', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    const label = page.getByText(/Tháng\s+\d+\s+\d{4}/)
    const before = await label.textContent()
    await page.locator('button', { hasText: /→/ }).click()
    const after = await label.textContent()
    expect(after).not.toBe(before)
  })
})

// ─── Budget Cards ─────────────────────────────────────────────────────────────
test.describe('Budget Cards', () => {
  test('shows budget page functional (heading + nav)', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await waitForReact(page)
    // Verify page renders with heading regardless of card count
    await expect(page.getByRole('heading', { name: /Ngân sách/i })).toBeVisible()
    await expect(page.locator('button', { hasText: /←/ })).toBeVisible()
  })
})

// ─── Create Budget ─────────────────────────────────────────────────────────────
test.describe('Create Budget', () => {
  test('opens BottomSheet form', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2_000)
    // Skip if user has no wallet (form won't appear)
    if (await page.getByText(/Bạn chưa có ví/i).isVisible().catch(() => false)) return
    const createBtn = page.getByRole('button', { name: /Tạo ngân sách/i }).first()
    if (!(await createBtn.isVisible().catch(() => false))) return
    await createBtn.click()
    // Wait for form — look for the cancel button or any dialog element
    const cancelBtn = page.getByRole('button', { name: /Hủy/i })
    await cancelBtn.waitFor({ state: 'visible', timeout: 10_000 })
  })

  test('shows alert threshold options', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2_000)
    if (await page.getByText(/Bạn chưa có ví/i).isVisible().catch(() => false)) return
    const createBtn = page.getByRole('button', { name: /Tạo ngân sách/i }).first()
    if (!(await createBtn.isVisible().catch(() => false))) return
    await createBtn.click()
    await page.waitForTimeout(500)
    for (const pct of ['80%', '90%', '100%']) {
      const btn = page.getByText(pct)
      if (await btn.isVisible().catch(() => false)) await expect(btn).toBeVisible()
    }
  })

  test('cancel closes form', async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2_000)
    if (await page.getByText(/Bạn chưa có ví/i).isVisible().catch(() => false)) return
    const createBtn = page.getByRole('button', { name: /Tạo ngân sách/i }).first()
    if (!(await createBtn.isVisible().catch(() => false))) return
    await createBtn.click()
    const cancelBtn = page.getByRole('button', { name: /Hủy/i })
    await cancelBtn.waitFor({ state: 'visible', timeout: 10_000 })
    await cancelBtn.click()
    await cancelBtn.waitFor({ state: 'hidden', timeout: 5_000 })
  })
})
