import { chromium, FullConfig } from '@playwright/test'

/**
 * Global setup — runs once before all tests.
 * Handles Google OAuth login so tests are pre-authenticated.
 *
 * Requires env vars:
 *   TEST_EMAIL     — Google account email
 *   TEST_PASSWORD  — Google account password
 *
 * In CI: set these as GitHub Secrets → workflow env vars
 */
async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch()
  const storageStatePath = 'e2e/.auth/state.json'

  // If already authenticated, skip login
  const fs = await import('fs')
  if (fs.existsSync(storageStatePath)) {
    await browser.close()
    return
  }

  const { TEST_EMAIL, TEST_PASSWORD } = process.env
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.warn(
      '⚠️  TEST_EMAIL / TEST_PASSWORD not set — skipping auth setup.\n' +
      'Tests that require auth will be skipped. Set these env vars to enable E2E tests.'
    )
    await browser.close()
    return
  }

  const page = await browser.newPage()

  console.log(`🔐 Logging in as ${TEST_EMAIL}...`)

  await page.goto(process.env.BASE_URL || 'http://localhost:5173')

  // Click "Sign in with Google"
  const googleBtn = page.locator('button:has-text("Google"), [data-provider="google"]').first()
  await googleBtn.click()

  // Fill Google login form
  await page.waitForURL('**accounts.google.com/**', { timeout: 10_000 })
  await page.fill('input[type="email"]', TEST_EMAIL)
  await page.click('button:has-text("Next")')
  await page.waitForTimeout(1_000)
  await page.fill('input[type="password"]', TEST_PASSWORD)
  await page.click('button:has-text("Sign in"), button:has-text("Next")')

  // Wait for OAuth callback + app redirect
  await page.waitForURL(url => !url.toString().includes('accounts.google.com'), { timeout: 15_000 })

  // Save auth state
  await page.context().storageState({ path: storageStatePath as any })
  console.log(`✅ Auth state saved to ${storageStatePath}`)

  await browser.close()
}

export default globalSetup
