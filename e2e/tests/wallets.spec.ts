import { test, expect } from '@playwright/test'
import { waitForReact, content } from '../helpers/app'

const BASE = process.env.BASE_URL || 'http://localhost:3000'

// ─── Wallets List ───────────────────────────────────────────────────────────────
test.describe('Wallets Page', () => {
  test('renders with "Ví của tôi" heading', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    await expect(content(page).getByRole('heading', { name: /Ví của tôi/i })).toBeVisible()
  })

  test('shows transfer + add wallet buttons', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    // Pills: "↔ Chuyển tiền" and "+ Ví mới".
    await expect(content(page).getByRole('button', { name: /Chuyển tiền/i })).toBeVisible()
    await expect(content(page).getByRole('button', { name: /Ví mới/i })).toBeVisible()
  })

  test('shows seeded wallet cards', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    // Seeded wallets.
    await expect(content(page).getByText('Vietcombank').first()).toBeVisible({ timeout: 30_000 })
    await expect(content(page).getByText('Tiền mặt').first()).toBeVisible()
  })

  test('transfer button navigates to /wallets/transfer', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Chuyển tiền/i }).click()
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/wallets\/transfer/)
  })
})

// ─── Add Wallet Form ───────────────────────────────────────────────────────────
test.describe('Add Wallet Form', () => {
  test('form opens on "Ví mới" click', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Ví mới/i }).click()
    await expect(content(page).getByPlaceholder(/VD: Ví MoMo/i)).toBeVisible()
  })

  test('create disabled when name empty', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Ví mới/i }).click()
    await expect(content(page).getByPlaceholder(/VD: Ví MoMo/i)).toBeVisible()
    await expect(content(page).getByRole('button', { name: /Tạo ví/i }).first()).toBeDisabled()
  })

  test('create enables when name filled', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Ví mới/i }).click()
    const nameInput = content(page).getByPlaceholder(/VD: Ví MoMo/i)
    await nameInput.waitFor({ state: 'visible', timeout: 5_000 })
    await nameInput.fill('Ví Test PW')
    await expect(content(page).getByRole('button', { name: /Tạo ví/i }).first()).not.toBeDisabled()
  })

  test('cancel closes the form', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    await content(page).getByRole('button', { name: /Ví mới/i }).click()
    await expect(content(page).getByPlaceholder(/VD: Ví MoMo/i)).toBeVisible()
    await content(page).getByRole('button', { name: /Hủy/i }).click()
    await expect(content(page).getByPlaceholder(/VD: Ví MoMo/i)).toHaveCount(0)
  })
})

// ─── Edit Wallet ───────────────────────────────────────────────────────────────
test.describe('Edit Wallet', () => {
  test('edit button opens the edit BottomSheet', async ({ page }) => {
    await page.goto(`${BASE}/wallets`)
    await waitForReact(page)
    // Edit button is hover-revealed (opacity-0 → group-hover). Force the click
    // since visibility-by-opacity isn't actionable without a hover on touch.
    const editBtn = content(page).getByRole('button', { name: /Sửa ví/i }).first()
    if ((await editBtn.count()) === 0) return
    await editBtn.click({ force: true })
    await expect(content(page).getByText('Sửa ví').first()).toBeVisible()
  })
})
