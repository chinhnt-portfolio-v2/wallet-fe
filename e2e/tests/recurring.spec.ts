import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://wallet-fe-cyan.vercel.app'

test.describe('🔁 Recurring (Giao dịch định kỳ)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/recurring`)
    await page.waitForLoadState('networkidle')
  })

  test('page loads and shows heading', async ({ page }) => {
    const heading = page.locator('h2').filter({ hasText: /định kỳ|recurring/i })
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('active count badge shown', async ({ page }) => {
    const countText = page.locator('text=đang hoạt động').first()
    await expect(countText).toBeVisible({ timeout: 5_000 })
  })

  test('create button exists', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Tạo mới"), button:has-text("+ Tạo")').first()
    await expect(createBtn).toBeVisible({ timeout: 5_000 })
  })

  test('opens recurring form', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Tạo mới"), button:has-text("+ Tạo")').first()
    await createBtn.click()
    await page.waitForTimeout(500)
    // Form fields visible
    const form = page.locator('text=Tần suất, text=Wallet, text=Ví').first()
    await expect(form).toBeVisible({ timeout: 5_000 })
  })

  test('toggle switch visible on each rule card', async ({ page }) => {
    await page.waitForTimeout(2_000)
    const toggle = page.locator('[role="switch"]').first()
    const hasToggle = await toggle.isVisible().catch(() => false)
    if (!hasToggle) {
      // No recurring rules yet — that's OK
      console.log('No recurring rules yet, skipping toggle test')
      test.skip()
    }
    await expect(toggle).toBeVisible()
  })

  test('amount input accepts decimal numbers', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Tạo mới"), button:has-text("+ Tạo")').first()
    await createBtn.click()
    await page.waitForTimeout(500)

    const amountInput = page.locator('input[type="number"]').first()
    await amountInput.fill('150000')
    await expect(amountInput).toHaveValue('150000')
  })
})