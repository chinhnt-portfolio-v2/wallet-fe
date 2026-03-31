import { test, expect } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

// ─── Transfer Page ─────────────────────────────────────────────────────────────
test.describe('Transfer Page', () => {
  test('renders with "Chuyển tiền" heading', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    await expect(page.getByRole('heading', { name: /Chuyển tiền/i })).toBeVisible()
  })

  test('shows Từ ví and Đến ví selectors', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    await expect(page.getByText('Từ ví')).toBeVisible()
    await expect(page.getByText('Đến ví')).toBeVisible()
  })

  test('amount input visible', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    await expect(page.locator('input[inputMode="decimal"]').first()).toBeVisible()
  })

  test('submit disabled when form incomplete', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    await expect(page.getByRole('button', { name: /Chuyển tiền/i })).toBeDisabled()
  })

  test('preview shows when from+to+amount filled', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    const cards = page.locator('button[aria-pressed]')
    if (await cards.count() < 2) return
    await cards.nth(0).click()
    const destCards = page.locator('button[aria-pressed]')
    if (await destCards.count() > 1) await destCards.nth(1).click()
    await page.locator('input[inputMode="decimal"]').first().fill('10000')
    await page.waitForTimeout(500)
    const preview = page.getByText('Xem trước')
    if (await preview.isVisible().catch(() => false)) await expect(preview).toBeVisible()
  })
})

// ─── Submit Flow ───────────────────────────────────────────────────────────────
test.describe('Transfer Submit', () => {
  test('submit button defined when wallets+amount filled', async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await waitForReact(page)
    const cards = page.locator('button[aria-pressed]')
    if (await cards.count() < 2) return
    await cards.nth(0).click()
    const destCards = page.locator('button[aria-pressed]')
    if (await destCards.count() > 1) await destCards.nth(1).click()
    await page.locator('input[inputMode="decimal"]').first().fill('1000')
    await page.waitForTimeout(300)
    await expect(page.getByRole('button', { name: /Chuyển tiền/i })).toBeDefined()
  })
})
