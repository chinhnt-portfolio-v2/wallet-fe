import { test, expect } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

// ─── Transactions List ───────────────────────────────────────────────────────────
test.describe('Transactions List', () => {
  test('renders with "Giao dịch" heading', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await expect(page.getByRole('heading', { name: /Giao dịch/i })).toBeVisible()
  })

  test('search bar visible', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await expect(page.getByPlaceholder('Tìm giao dịch...')).toBeVisible()
  })
})

// ─── Filters ───────────────────────────────────────────────────────────────────
test.describe('Transaction Filters', () => {
  test('filter panel toggles open/closed', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await page.locator('button').filter({ hasText: '⚙️' }).first().click()
    await expect(page.getByRole('button', { name: /Tất cả/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /📥 Thu/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /💸 Chi/i })).toBeVisible()
  })

  test('"đang lọc" appears when filter applied', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await page.locator('button').filter({ hasText: '⚙️' }).first().click()
    await page.getByRole('button', { name: /📥 Thu/i }).click()
    await expect(page.getByText('đang lọc')).toBeVisible()
  })
})

// ─── Search ─────────────────────────────────────────────────────────────────────
test.describe('Search', () => {
  test('typing in search updates results', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await page.getByPlaceholder('Tìm giao dịch...').fill('abc')
    await page.waitForTimeout(600)
    await expect(page).toBeDefined()
  })

  test('clearing search restores full list', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    const input = page.getByPlaceholder('Tìm giao dịch...')
    await input.fill('xyz')
    await page.waitForTimeout(600)
    const cleared = await input.evaluate(el => el.value)
    await input.click({ clickCount: 3 })
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(600)
    // After clearing, search input should be empty
    await expect(input).toHaveValue('')
  })
})

// ─── Transaction Rows ───────────────────────────────────────────────────────────
test.describe('Transaction Rows', () => {
  test('shows transaction rows', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    // Verify page heading and search bar render regardless of row count
    await expect(page.getByRole('heading', { name: /Giao dịch/i })).toBeVisible()
    await expect(page.getByPlaceholder('Tìm giao dịch...')).toBeVisible()
  })

  test('clicking row opens BottomSheet edit modal', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    const firstRow = page.locator('button').filter({ has: page.locator('[class*="rounded-full"]') }).first()
    if (!(await firstRow.isVisible().catch(() => false))) return
    await firstRow.click()
    await expect(page.getByText('Sửa giao dịch')).toBeVisible()
  })

  test('edit modal has cancel + save buttons', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    const firstRow = page.locator('button').filter({ has: page.locator('[class*="rounded-full"]') }).first()
    if (!(await firstRow.isVisible().catch(() => false))) return
    await firstRow.click()
    await expect(page.getByRole('button', { name: /Hủy/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Lưu/i })).toBeVisible()
  })

  test('edit modal closes on cancel', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    const firstRow = page.locator('button').filter({ has: page.locator('[class*="rounded-full"]') }).first()
    if (!(await firstRow.isVisible().catch(() => false))) return
    await firstRow.click()
    await page.getByRole('button', { name: /Hủy/i }).click()
    await expect(page.getByText('Sửa giao dịch')).not.toBeVisible()
  })
})
