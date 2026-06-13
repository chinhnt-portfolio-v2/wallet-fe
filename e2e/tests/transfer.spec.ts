import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Transfer Page ─────────────────────────────────────────────────────────────
test.describe('Transfer Page', () => {
  test('renders with "Chuyển tiền" heading', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Chuyển tiền/i })).toBeVisible()
  })

  test('shows "Từ ví" and "Đến ví" selectors', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    await expect(content(page).getByText('Từ ví').first()).toBeVisible()
    await expect(content(page).getByText('Đến ví').first()).toBeVisible()
  })

  test('amount input visible', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    await expect(content(page).getByRole('textbox', { name: /Số tiền chuyển/i })).toBeVisible()
  })

  test('submit disabled when form incomplete', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    // Submit label: "✓ Xác nhận chuyển tiền".
    await expect(content(page).getByRole('button', { name: /Xác nhận chuyển tiền/i })).toBeDisabled()
  })

  test('preview shows when from + to + amount selected', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    const c = content(page)
    const fromCards = c.locator('button[aria-pressed]')
    if ((await fromCards.count()) < 1) return
    // Pick the first "from" wallet.
    await fromCards.first().click()
    // After picking "from", the "to" list excludes it; pick the last available.
    const toCards = c.locator('button[aria-pressed]')
    const count = await toCards.count()
    if (count < 2) return
    await toCards.nth(count - 1).click()
    await c.getByRole('textbox', { name: /Số tiền chuyển/i }).fill('10000')
    await page.waitForTimeout(400)
    await expect(c.getByText(/Xem trước/i).first()).toBeVisible()
  })
})

// ─── Submit Flow ───────────────────────────────────────────────────────────────
test.describe('Transfer Submit', () => {
  test('submit enables when from + to + valid amount filled', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    const c = content(page)
    const fromCards = c.locator('button[aria-pressed]')
    if ((await fromCards.count()) < 1) return
    await fromCards.first().click()
    const toCards = c.locator('button[aria-pressed]')
    const count = await toCards.count()
    if (count < 2) return
    await toCards.nth(count - 1).click()
    // Use a small amount to stay within balance.
    await c.getByRole('textbox', { name: /Số tiền chuyển/i }).fill('1000')
    await page.waitForTimeout(300)
    await expect(c.getByRole('button', { name: /Xác nhận chuyển tiền/i })).not.toBeDisabled()
  })
})
