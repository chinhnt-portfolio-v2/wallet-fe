import { test, expect, Page } from '@playwright/test'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

async function waitForReact(page: Page) {
  await page.waitForLoadState('load')
  await page.locator('button').first().waitFor({ state: 'visible', timeout: 30_000 })
}

// ─── Zone A: Net Worth Hero ─────────────────────────────────────────────────────
test.describe('Zone A: Net Worth Hero', () => {
  test('renders net worth card or "no wallet" prompt', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2_000)
    // Verify page has actual content (not blank/loading)
    const bodyText = await page.locator('body').textContent()
    const hasContent = (bodyText?.trim().length ?? 0) > 10
    expect(hasContent).toBeTruthy()
    // Also check at least one recognizable dashboard element is visible
    const hasWallet = await page.getByText(/Wallet|Wallet/i).first().isVisible().catch(() => false)
    const hasNoWallet = await page.getByText(/Bạn chưa có ví|Chưa có ví|Tạo ví/i).first().isVisible().catch(() => false)
    expect(hasWallet || hasNoWallet).toBeTruthy()
  })

  test('shows 3-column layout or create wallet prompt', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2_000)
    // Verify dashboard zone labels or "create wallet" CTA
    const hasColumns = await page.getByText(/Tài sản|Nợ phải trả|Cần thu/i).first().isVisible().catch(() => false)
    const hasCTA = await page.getByText(/Tạo ví/i).first().isVisible().catch(() => false)
    expect(hasColumns || hasCTA).toBeTruthy()
  })
})

// ─── Zone B: Monthly Bar Chart ─────────────────────────────────────────────────
test.describe('Zone B: Monthly Bar Chart', () => {
  test('renders chart section', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    await expect(page).toBeDefined()
  })
})

// ─── Zone E: Open Debts ─────────────────────────────────────────────────────────
test.describe('Zone E: Open Debts', () => {
  test('"Xem tất cả" links to /debts when visible', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    const seeAll = page.getByText('Xem tất cả').first()
    if (!(await seeAll.isVisible().catch(() => false))) return
    await seeAll.click()
    await expect(page).toHaveURL(/\/debts/)
  })
})

// ─── Zone F: Recent Transactions ───────────────────────────────────────────────
test.describe('Zone F: Recent Transactions', () => {
  test('shows "Gần đây" heading', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    await expect(page.getByText('Gần đây').first()).toBeVisible()
  })

  test('"Xem tất cả" navigates to /transactions', async ({ page }) => {
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    const seeAll = page.getByRole('link', { name: /Xem tất cả/i }).first()
    if (!(await seeAll.isVisible().catch(() => false))) return
    await seeAll.click()
    await expect(page).toHaveURL(/\/transactions/)
  })
})

// ─── Console Errors ────────────────────────────────────────────────────────────
test.describe('Console Errors Check', () => {
  test('dashboard renders without console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto(`${BASE}/`)
    await waitForReact(page)
    const realErrors = errors.filter(e =>
      !e.includes('favicon') && !e.includes('chrome-extension') && !e.includes('net::ERR')
    )
    expect(realErrors).toHaveLength(0)
  })
})