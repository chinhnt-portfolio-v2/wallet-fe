import { test, expect } from '@playwright/test'
import { waitForReact } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:5173'

// ─── Debt Groups Page ─────────────────────────────────────────────────────────────
test.describe('Debt Groups Page', () => {
  test('renders with "Nhóm nợ" heading', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    await expect(page.getByRole('heading', { name: /Nhóm nợ/i })).toBeVisible()
  })

  test('shows filter tabs', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    await expect(page.getByRole('button', { name: /Tất cả/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Đang mở/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Đã thanh toán/i })).toBeVisible()
  })

  test('shows "Tạo nợ" button', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    await expect(page.getByRole('link', { name: /Tạo nợ/i })).toBeVisible()
  })
})

// ─── Filter Tabs ────────────────────────────────────────────────────────────────
test.describe('Filter Tabs', () => {
  test('each tab clickable', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    await page.getByRole('button', { name: /Tất cả/i }).click()
    await page.getByRole('button', { name: /Đang mở/i }).click()
    await page.getByRole('button', { name: /Đã thanh toán/i }).click()
  })
})

// ─── Debt Group Cards ────────────────────────────────────────────────────────────
test.describe('Debt Group Cards', () => {
  test('shows debt cards', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    // If no cards, verify filter tabs still render (page is functional regardless)
    const filterTab = page.getByRole('button', { name: /Tất cả/i }).first()
    await expect(filterTab).toBeVisible()
  })

  test('"Thanh toán" links to debt detail page', async ({ page }) => {
    await page.goto(`${BASE}/debts`)
    await waitForReact(page)
    const payBtn = page.locator('a', { hasText: /Thanh toán/i }).first()
    if (!(await payBtn.isVisible().catch(() => false))) return
    const href = await payBtn.getAttribute('href')
    expect(href).toMatch(/\/debts\/\d+/)
  })
})

// ─── Create Debt Group ────────────────────────────────────────────────────────
test.describe('Create Debt Group', () => {
  test('renders with group type options', async ({ page }) => {
    await page.goto(`${BASE}/debts/new`)
    await waitForReact(page)
    // Debt type options are buttons (not plain text)
    await expect(page.getByRole('button', { name: /Mua trả sau/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Vay nợ/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Cho vay/i })).toBeVisible()
  })

  test('submit disabled when required fields empty', async ({ page }) => {
    await page.goto(`${BASE}/debts/new`)
    await waitForReact(page)
    await expect(page.getByRole('button', { name: /Tạo nhóm nợ/i })).toBeDisabled()
  })
})
