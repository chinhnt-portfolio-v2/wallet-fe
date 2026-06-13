import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Add Transaction Page ────────────────────────────────────────────────────────
test.describe('Add Transaction Page', () => {
  test('renders with type toggle buttons', async ({ page }) => {
    await page.goto(`${BASE}/add`)
    await waitForReact(page)
    // Type tabs render plain text labels (no emoji): "Chi tiêu" / "Thu nhập".
    // Exact match so the "Lưu chi tiêu →" submit pill isn't also matched.
    await expect(content(page).getByRole('button', { name: 'Chi tiêu', exact: true })).toBeVisible()
    await expect(content(page).getByRole('button', { name: 'Thu nhập', exact: true })).toBeVisible()
  })

  test('amount input visible', async ({ page }) => {
    await page.goto(`${BASE}/add`)
    await waitForReact(page)
    // Editorial serif amount input — aria-label "Số tiền giao dịch".
    await expect(content(page).getByRole('textbox', { name: /Số tiền giao dịch/i })).toBeVisible()
  })

  test('wallet selector chips visible', async ({ page }) => {
    await page.goto(`${BASE}/add`)
    await waitForReact(page)
    // Wallets render as aria-pressed chips ("Chọn ví {name}").
    await expect(content(page).locator('button[aria-pressed]').first()).toBeVisible()
  })

  test('page header renders', async ({ page }) => {
    await page.goto(`${BASE}/add`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Ghi nhận giao dịch/i })).toBeVisible()
  })

  test('submit disabled when form empty', async ({ page }) => {
    await page.goto(`${BASE}/add`)
    await waitForReact(page)
    // Submit pill: "Lưu chi tiêu →" (expense default), disabled until wallet+amount.
    await expect(content(page).getByRole('button', { name: /Lưu chi tiêu/i })).toBeDisabled()
  })
})

// ─── Form Interaction ──────────────────────────────────────────────────────────
test.describe('Form Interaction', () => {
  test('amount input accepts digits and shows formatted preview', async ({ page }) => {
    await page.goto(`${BASE}/add`)
    await waitForReact(page)
    const amount = content(page).getByRole('textbox', { name: /Số tiền giao dịch/i })
    await amount.fill('500000')
    // Display formats with thousands separators.
    await expect(amount).toHaveValue(/500.000/)
  })

  test('selecting a wallet enables submit', async ({ page }) => {
    await page.goto(`${BASE}/add`)
    await waitForReact(page)
    await content(page).getByRole('textbox', { name: /Số tiền giao dịch/i }).fill('50000')
    await content(page).locator('button[aria-pressed]').first().click()
    await expect(content(page).getByRole('button', { name: /Lưu chi tiêu/i })).not.toBeDisabled()
  })
})

// ─── Submit Flow ───────────────────────────────────────────────────────────────
test.describe('Submit Flow', () => {
  test('stays on /add when amount entered but no wallet selected', async ({ page }) => {
    await page.goto(`${BASE}/add`)
    await waitForReact(page)
    await content(page).getByRole('textbox', { name: /Số tiền giao dịch/i }).fill('50000')
    // No wallet selected → submit stays disabled, page stays on /add.
    await expect(content(page).getByRole('button', { name: /Lưu chi tiêu/i })).toBeDisabled()
    await expect(page).toHaveURL(/\/add/)
  })
})
