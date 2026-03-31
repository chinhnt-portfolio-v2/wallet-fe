import { chromium, FullConfig } from '@playwright/test'
import * as path from 'path'

/**
 * Global setup — runs once before all test files.
 *
 * Auth strategy:
 *   1. If WALLET_TOKEN env var is set → inject it into browser localStorage,
 *      then save browser context state to e2e/.auth/state.json
 *      so all tests inherit the authenticated session automatically.
 *   2. If not set → skip auth entirely; tests requiring auth will be skipped.
 *
 * Usage:
 *   # Local dev with token
 *   WALLET_TOKEN=eyJhbGci... npx playwright test
 *
 *   # Against Vercel deploy
 *   BASE_URL=https://wallet-fe-your-vercel.app WALLET_TOKEN=eyJ... npx playwright test
 *
 *   # CI (GitHub Actions) — set WALLET_TOKEN and BASE_URL as secrets/env vars
 */
async function globalSetup(config: FullConfig) {
  const storageStatePath = path.join(process.cwd(), 'e2e/.auth/state.json')
  const token = process.env.WALLET_TOKEN

  if (!token) {
    console.warn(
      '\n⚠️  WALLET_TOKEN not set — auth setup skipped.\n' +
      '   Tests that require authentication will be SKIPPED.\n' +
      '   To enable auth tests, set WALLET_TOKEN env var with a valid JWT:\n' +
      '   WALLET_TOKEN=your.jwt.token npx playwright test\n'
    )
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log(`🔐 Injecting WALLET_TOKEN and saving auth state to ${storageStatePath}...`)

  const baseURL = process.env.BASE_URL || 'http://localhost:5173'

  try {
    // Navigate to app root and inject token
    await page.goto(baseURL)
  } catch {
    console.warn(
      `⚠️  Could not reach ${baseURL} — is the dev server or Vercel deploy running?\n` +
      `   global-setup skipped. Tests will run unauthenticated.\n` +
      `   Start server and re-run: npx playwright test`
    )
    await browser.close()
    return
  }

  try {
    await page.evaluate(
      (t) => {
        localStorage.setItem('wallet_token', t)
        localStorage.removeItem('wallet_onboarding_done')
      },
      token,
    )

    // Reload so React reads the token and renders authenticated UI
    await page.reload()
    await page.waitForLoadState('domcontentloaded')

    // Verify we are NOT on /login after reload (auth worked)
    const currentURL = page.url()
    if (currentURL.includes('/login')) {
      console.warn(
        `⚠️  Token was injected but app redirected to /login.\n` +
        `   The token may be invalid or expired. Check WALLET_TOKEN.\n` +
        `   Current URL: ${currentURL}`
      )
    } else {
      console.log(`✅ Auth state verified — on: ${currentURL}`)
    }

    // Save the authenticated browser context for all tests to reuse
    await context.storageState({ path: storageStatePath })
    console.log(`✅ Auth state saved to ${storageStatePath}`)
  } finally {
    await browser.close()
  }
}

export default globalSetup
