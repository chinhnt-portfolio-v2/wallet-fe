import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Export Page ──────────────────────────────────────────────────────────────
test.describe('Export Page', () => {
  test('renders with "Xuất dữ liệu" heading', async ({ page }) => {
    await page.goto(`${BASE}/export`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Xuất dữ liệu/i })).toBeVisible()
  })

  test('shows date-range presets', async ({ page }) => {
    await page.goto(`${BASE}/export`)
    await waitForReact(page)
    await expect(content(page).getByRole('button', { name: /Tất cả/i })).toBeVisible()
    await expect(content(page).getByRole('button', { name: /7 ngày/i })).toBeVisible()
    await expect(content(page).getByRole('button', { name: /Tháng này/i })).toBeVisible()
  })

  test('shows the download CTA', async ({ page }) => {
    await page.goto(`${BASE}/export`)
    await waitForReact(page)
    // CTA: "Tải file CSV · {count} giao dịch" (or "Đang chuẩn bị..." while loading).
    await expect(content(page).getByRole('button', { name: /Tải file CSV|Đang chuẩn bị/i })).toBeVisible()
  })

  test('preset selection updates the active preset', async ({ page }) => {
    await page.goto(`${BASE}/export`)
    await waitForReact(page)
    // Selecting a preset is pure UI state (the "from → to" range line is gated on the
    // slow `useExportTransactions` query, so we assert the preset's active styling
    // instead — deterministic and independent of data load).
    const preset = content(page).getByRole('button', { name: /7 ngày/i })
    await preset.click()
    // Active preset gets the accent border/text classes.
    await expect(preset).toHaveClass(/border-accent/)
  })
})
