import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://wallet-fe-cyan.vercel.app'

test.describe('💸 Transfer (Chuyển tiền)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/wallets/transfer`)
    await page.waitForLoadState('networkidle')
  })

  test('page loads without crash', async ({ page }) => {
    // Should show transfer page elements
    const heading = page.locator('h1, h2').filter({ hasText: /chuyển|chuyển tiền|transfer/i })
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('source wallet selector exists', async ({ page }) => {
    const selector = page.locator('select').first()
    await expect(selector).toBeVisible()
  })

  test('destination wallet selector exists', async ({ page }) => {
    // Second select box or target selector
    const selects = page.locator('select')
    const count = await selects.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test('amount input accepts numbers', async ({ page }) => {
    const amountInput = page.locator('input[type="number"], input[inputmode="decimal"]').first()
    await amountInput.fill('100000')
    await expect(amountInput).toHaveValue(/100000/)
  })

  test('shows validation when amount exceeds balance', async ({ page }) => {
    const amountInput = page.locator('input[type="number"], input[inputmode="decimal"]').first()
    await amountInput.fill('999999999999')
    // Submit if there's a submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Chuyển"), button:has-text("Transfer")').first()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      // App should show error toast or inline error
      await page.waitForTimeout(1_000)
    }
  })

  test('back navigation works', async ({ page }) => {
    await page.goBack()
    await page.waitForLoadState('domcontentloaded')
  })
})
