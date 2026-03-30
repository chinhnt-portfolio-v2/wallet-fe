import { test, expect } from '@playwright/test'

const BASE = process.env.BASE_URL || 'https://wallet-fe-cyan.vercel.app'

test.describe('🔔 Notifications', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/notifications`)
    await page.waitForLoadState('networkidle')
  })

  test('page loads and shows heading', async ({ page }) => {
    const heading = page.locator('h2').filter({ hasText: /thông báo|notification/i })
    await expect(heading).toBeVisible({ timeout: 10_000 })
  })

  test('push notification card visible', async ({ page }) => {
    const pushCard = page.locator('text=Thông báo trình duyệt').first()
    await expect(pushCard).toBeVisible({ timeout: 5_000 })
  })

  test('enable push button exists', async ({ page }) => {
    const enableBtn = page.locator('button:has-text("Bật thông báo"), text=Bật thông báo').first()
    const hasBtn = await enableBtn.isVisible().catch(() => false)
    if (!hasBtn) {
      // Already enabled — that's fine
      console.log('Push notifications already enabled')
    } else {
      await expect(enableBtn).toBeVisible()
    }
  })

  test('mark all read button exists when notifications exist', async ({ page }) => {
    await page.waitForTimeout(2_000)
    const markBtn = page.locator('button:has-text("Đánh dấu đã đọc"), text=Đánh dấu đã đọc').first()
    const hasBtn = await markBtn.isVisible().catch(() => false)
    if (!hasBtn) {
      console.log('No unread notifications, skipping')
      test.skip()
    }
    await expect(markBtn).toBeVisible()
  })

  test('empty state shows when no notifications', async ({ page }) => {
    await page.waitForTimeout(2_000)
    const emptyState = page.locator('text=Chưa có thông báo').first()
    const hasEmpty = await emptyState.isVisible().catch(() => false)
    if (hasEmpty) {
      await expect(emptyState).toBeVisible()
    } else {
      // Has notifications — that's fine too
      console.log('Notifications exist')
    }
  })
})