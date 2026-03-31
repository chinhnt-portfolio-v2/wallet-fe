import { test, expect } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

// ─── Notifications Page ──────────────────────────────────────────────────────────
test.describe('Notifications Page', () => {
  test('renders with "Thông báo" heading', async ({ page }) => {
    await page.goto(`${BASE}/notifications`)
    await waitForReact(page)
    await expect(page.getByRole('heading', { name: /Thông báo/i })).toBeVisible()
  })

  test('push notification card visible', async ({ page }) => {
    await page.goto(`${BASE}/notifications`)
    await waitForReact(page)
    await expect(page.getByText(/Thông báo trình duyệt/i)).toBeVisible()
  })

  test('shows empty state or notification list', async ({ page }) => {
    await page.goto(`${BASE}/notifications`)
    await waitForReact(page)
    const empty = page.getByText(/Chưa có thông báo/i)
    const list = page.locator('[class*="border-l-2"]')
    const hasEmpty = await empty.isVisible().catch(() => false)
    const hasList = await list.count().then(n => n > 0).catch(() => false)
    expect(hasEmpty || hasList).toBeTruthy()
  })
})
