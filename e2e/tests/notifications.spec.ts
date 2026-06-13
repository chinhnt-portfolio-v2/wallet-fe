import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Notifications Page ──────────────────────────────────────────────────────────
test.describe('Notifications Page', () => {
  test('renders with "Thông báo" heading', async ({ page }) => {
    await page.goto(`${BASE}/notifications`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Thông báo/i }).first()).toBeVisible()
  })

  test('browser push card visible', async ({ page }) => {
    await page.goto(`${BASE}/notifications`)
    await waitForReact(page)
    await expect(content(page).getByText(/Thông báo trình duyệt/i).first()).toBeVisible()
  })

  test('shows empty state or a notification list', async ({ page }) => {
    await page.goto(`${BASE}/notifications`)
    await waitForReact(page)
    // EmptyState ("Chưa có thông báo") OR a populated list ("Tất cả đã đọc"/"chưa đọc").
    const c = content(page)
    const hasEmpty = (await c.getByText(/Chưa có thông báo/i).count()) > 0
    const hasList = (await c.getByText(/Tất cả đã đọc|chưa đọc/i).count()) > 0
    expect(hasEmpty || hasList).toBeTruthy()
  })
})
