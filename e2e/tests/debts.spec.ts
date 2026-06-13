import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Debt Groups Page ─────────────────────────────────────────────────────────────
test.describe('Debt Groups Page', () => {
  test('renders with "Nợ" heading', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: 'Nợ', exact: true })).toBeVisible()
  })

  test('shows status filter tabs', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    // SegmentedControl: ALL / OPEN / SETTLED → "Tất cả" / "Đang mở" / "Đã trả".
    await expect(content(page).getByRole('tab', { name: /Tất cả/i })).toBeVisible()
    await expect(content(page).getByRole('tab', { name: /Đang mở/i })).toBeVisible()
    await expect(content(page).getByRole('tab', { name: /Đã trả/i })).toBeVisible()
  })

  test('shows "Thêm khoản nợ" CTA linking to /debts/new', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    const cta = content(page).locator('a[href="/debts/new"]').first()
    await expect(cta).toBeVisible()
    await expect(cta.getByText(/Thêm khoản nợ/i)).toBeVisible()
  })
})

// ─── Filter Tabs ────────────────────────────────────────────────────────────────
test.describe('Filter Tabs', () => {
  test('each tab clickable', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    await content(page).getByRole('tab', { name: /Tất cả/i }).click()
    await content(page).getByRole('tab', { name: /Đang mở/i }).click()
    await content(page).getByRole('tab', { name: /Đã trả/i }).click()
    await expect(content(page).getByRole('tab', { name: /Đã trả/i })).toHaveAttribute('aria-selected', 'true')
  })
})

// ─── Debt Group Rows ────────────────────────────────────────────────────────────
test.describe('Debt Group Rows', () => {
  test('shows seeded debt rows', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    // Seeded: "Vay anh Tuấn" (payable) + "Cho Linh mượn" (receivable). Rows render
    // after useDebtGroups resolves — generous timeout for slow dev-proxy loads.
    await expect(content(page).getByText('Vay anh Tuấn').first()).toBeVisible({ timeout: 30_000 })
    await expect(content(page).getByText('Cho Linh mượn').first()).toBeVisible({ timeout: 30_000 })
  })

  test('receivable row shows "Thu nợ" action (audit §2.4)', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    // The LOAN_GIVEN group "Cho Linh mượn" must render a "Thu nợ" (collect) pill,
    // never "Trả" (pay). Its row links to /debts/{id}.
    await expect(content(page).getByText('Cho Linh mượn').first()).toBeVisible({ timeout: 30_000 })
    await expect(content(page).getByRole('link', { name: /Thu nợ/i }).first()).toBeVisible({ timeout: 30_000 })
  })

  test('payable row action links to a debt detail page', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    const payLink = content(page).getByRole('link', { name: /^Trả$/i }).first()
    await expect(payLink).toBeVisible({ timeout: 30_000 })
    const href = await payLink.getAttribute('href')
    expect(href).toMatch(/\/debts\/\d+/)
  })
})

// ─── Create Debt Group ────────────────────────────────────────────────────────
test.describe('Create Debt Group', () => {
  test('renders with group type options', async ({ page }) => {
    await page.goto(`${BASE}/debts/new`)
    await waitForReact(page)
    // DebtTypePicker labels: Tín dụng / BNPL / Bạn bè / Cho vay.
    await expect(content(page).getByRole('button', { name: /Tín dụng/i })).toBeVisible()
    await expect(content(page).getByRole('button', { name: /BNPL/i })).toBeVisible()
    await expect(content(page).getByRole('button', { name: /Bạn bè/i })).toBeVisible()
    await expect(content(page).getByRole('button', { name: /Cho vay/i })).toBeVisible()
  })

  test('submit disabled when required fields empty', async ({ page }) => {
    await page.goto(`${BASE}/debts/new`)
    await waitForReact(page)
    await expect(content(page).getByRole('button', { name: /Tạo nhóm nợ/i })).toBeDisabled()
  })

  test('submit enables after filling title + amount', async ({ page }) => {
    await page.goto(`${BASE}/debts/new`)
    await waitForReact(page)
    // Default groupType is DEBT → title placeholder "VD: Vay mẹ tiền mua xe".
    await content(page).getByPlaceholder(/Vay mẹ tiền mua xe/i).fill('Test debt PW')
    await content(page).locator('input[type="number"]').first().fill('1000000')
    await expect(content(page).getByRole('button', { name: /Tạo nhóm nợ/i })).not.toBeDisabled()
  })
})
