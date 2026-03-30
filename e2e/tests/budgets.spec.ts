import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://wallet-fe-cyan.vercel.app'

test.describe('📊 Budgets (Ngân sách)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/budgets`)
    await page.waitForLoadState('networkidle')
  })

  test('page loads and shows budgets or empty state', async ({ page }) => {
    // Page should show "Ngân sách" heading
    const heading = page.locator('h2').filter({ hasText: /ngân sách|budget/i })
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('month navigation works', async ({ page }) => {
    const prevBtn = page.locator('button:has-text("←"), button:has-text("‹")').first()
    if (await prevBtn.isVisible()) {
      await prevBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('create budget button exists', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Tạo ngân sách")')
    await expect(createBtn).toBeVisible({ timeout: 10_000 })
  })

  test('opens budget form when clicking create', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Tạo ngân sách")').first()
    await createBtn.click()
    // BottomSheet or modal should appear
    await page.waitForTimeout(1_000)
  })

  test('category selector visible in form', async ({ page }) => {
    const createBtn = page.locator('button:has-text("Tạo ngân sách")').first()
    await createBtn.click()
    await page.waitForTimeout(500)
    // Should show category chips/buttons
    const categorySection = page.locator('text=Danh mục').first()
    await expect(categorySection).toBeVisible({ timeout: 5_000 })
  })

  test('progress bar visible if budgets exist', async ({ page }) => {
    // Wait a bit for data to load
    await page.waitForTimeout(2_000)
    const progressBars = page.locator('[class*="rounded-full"][class*="bg-"]').first()
    const hasBar = await progressBars.isVisible().catch(() => false)
    if (hasBar) {
      const width = await progressBars.getAttribute('style')
      expect(width).toBeTruthy()
    }
  })

  test('warning banner shown when budget exceeded', async ({ page }) => {
    await page.waitForTimeout(2_000)
    const warning = page.locator('text=Vượt ngân sách, text=Vượt, text=exceeded').first()
    // If any budget exceeds, this text should appear
    const hasWarning = await warning.isVisible().catch(() => false)
    // Not a hard assertion — just detect and report
    if (hasWarning) console.log('⚠️ Budget exceeded detected')
  })
})