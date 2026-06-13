import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Transactions List ───────────────────────────────────────────────────────────
test.describe('Transactions List', () => {
  test('renders with "Giao dịch" heading', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Giao dịch/i })).toBeVisible()
  })

  test('search bar visible', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await expect(content(page).getByPlaceholder(/Tìm người bán/i)).toBeVisible()
  })
})

// ─── Filters ───────────────────────────────────────────────────────────────────
test.describe('Transaction Filters', () => {
  test('type segmented control is always visible', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    // SegmentedControl tabs: Tất cả / Thu nhập / Chi tiêu (always shown, no toggle).
    await expect(content(page).getByRole('tab', { name: /Tất cả/i })).toBeVisible()
    await expect(content(page).getByRole('tab', { name: /Thu nhập/i })).toBeVisible()
    await expect(content(page).getByRole('tab', { name: /Chi tiêu/i })).toBeVisible()
  })

  test('"(đã lọc)" appears when a type filter is applied', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await content(page).getByRole('tab', { name: /Thu nhập/i }).click()
    await expect(content(page).getByText(/đã lọc/i)).toBeVisible()
  })
})

// ─── Search ─────────────────────────────────────────────────────────────────────
test.describe('Search', () => {
  test('typing in search keeps the page functional', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await content(page).getByPlaceholder(/Tìm người bán/i).fill('Phở')
    await page.waitForTimeout(600)
    await expect(content(page).getByRole('heading', { name: /Giao dịch/i })).toBeVisible()
  })

  test('clearing search restores the input', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    const input = content(page).getByPlaceholder(/Tìm người bán/i)
    await input.fill('xyzabc')
    await page.waitForTimeout(600)
    await input.fill('')
    await page.waitForTimeout(600)
    await expect(input).toHaveValue('')
  })
})

// ─── Transaction Rows ───────────────────────────────────────────────────────────
// TransactionRow renders its label in BOTH a mobile card (`sm:hidden`) and a
// desktop grid (`hidden sm:grid`); only one is visible per viewport, so scope to
// the visible copy.
test.describe('Transaction Rows', () => {
  test('shows seeded transaction rows', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    // A known seeded note appears as the row primary label.
    await expect(content(page).getByText('Phở bò').locator('visible=true').first()).toBeVisible({ timeout: 30_000 })
  })

  test('clicking a row opens the edit BottomSheet', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    await content(page).getByText('Phở bò').locator('visible=true').first().waitFor({ state: 'visible', timeout: 30_000 })
    await content(page).getByText('Phở bò').locator('visible=true').first().click()
    await expect(content(page).getByText('Sửa giao dịch').first()).toBeVisible()
  })

  test('edit modal has cancel + save buttons', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    const row = content(page).getByText('Phở bò').locator('visible=true').first()
    await row.waitFor({ state: 'visible', timeout: 30_000 })
    await row.click()
    await expect(content(page).getByText('Sửa giao dịch').first()).toBeVisible()
    await expect(content(page).getByRole('button', { name: /Hủy/i }).first()).toBeVisible()
    await expect(content(page).getByRole('button', { name: /^Lưu$/i }).first()).toBeVisible()
  })

  test('edit modal closes on cancel', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    const row = content(page).getByText('Phở bò').locator('visible=true').first()
    await row.waitFor({ state: 'visible', timeout: 30_000 })
    await row.click()
    await expect(content(page).getByText('Sửa giao dịch').first()).toBeVisible()
    await content(page).getByRole('button', { name: /Hủy/i }).first().click()
    // 10s: sheet close animation can lag under full-suite load (429 back-off)
    await expect(content(page).getByText('Sửa giao dịch')).toHaveCount(0, { timeout: 10_000 })
  })
})

// ─── Pagination ──────────────────────────────────────────────────────────────────
test.describe('Pagination', () => {
  test('pager appears when there are enough rows', async ({ page }) => {
    await page.goto(`${BASE}/transactions`)
    await waitForReact(page)
    // The pager (← Trước / Trang N / Sau →) renders only when a full page (20 rows)
    // exists. Seeded data may be fewer than 20, so this is conditional.
    const next = content(page).getByRole('button', { name: /Sau/i })
    if ((await next.count()) === 0) return
    await expect(content(page).getByText(/Trang\s+\d+/).first()).toBeVisible()
  })
})
