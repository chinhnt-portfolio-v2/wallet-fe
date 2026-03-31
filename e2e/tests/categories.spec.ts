import { test, expect } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

test.describe('Categories Page', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto(`${BASE}/categories`)
    await waitForReact(page)
    const body = await page.locator('body').textContent()
    expect(body?.trim().length).toBeGreaterThan(0)
  })
})
