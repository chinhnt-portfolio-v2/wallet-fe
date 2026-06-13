import { chromium, FullConfig, request } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

/**
 * Global setup — runs once before all test files.
 *
 * Auth strategy (priority order):
 *   1. TEST_EMAIL + TEST_PASSWORD → login via POST /api/v1/auth/login, inject token
 *   2. WALLET_TOKEN env var → inject pre-existing JWT directly into localStorage
 *   3. Neither set → skip auth; tests requiring auth will skip
 *
 * Hardcoded dev credentials (seeded by DevDataSeeder on local profile):
 *   TEST_EMAIL=test@example.com  TEST_PASSWORD=Test1234!
 *
 * Usage:
 *   # Local dev (email/password — recommended)
 *   TEST_EMAIL=test@example.com TEST_PASSWORD=Test1234! npx playwright test
 *
 *   # Pre-existing JWT token
 *   WALLET_TOKEN=eyJhbGci... npx playwright test
 *
 *   # Against Vercel deploy
 *   BASE_URL=https://wallet-fe-two.vercel.app TEST_EMAIL=... TEST_PASSWORD=... npx playwright test
 */
async function globalSetup(_config: FullConfig) {
  const storageStatePath = path.join(process.cwd(), 'e2e/.auth/state.json')
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true })

  const baseURL = process.env.BASE_URL || 'http://localhost:5173'
  const apiBase = process.env.VITE_API_BASE_URL || baseURL

  const email = process.env.TEST_EMAIL
  const password = process.env.TEST_PASSWORD
  let token = process.env.WALLET_TOKEN

  // Strategy 1: email/password login via API
  if (email && password) {
    console.log(`🔐 Logging in as ${email} via API...`)
    const api = await request.newContext()
    try {
      const resp = await api.post(`${apiBase}/api/v1/auth/login`, {
        data: { email, password },
      })
      if (!resp.ok()) {
        console.warn(`⚠️  Login failed (${resp.status()}) — auth tests will skip.`)
        await api.dispose()
        return
      }
      const data = await resp.json()
      token = data.accessToken
      console.log(`✅ Login successful, got access token`)
    } catch (err) {
      console.warn(`⚠️  API login error: ${err} — auth tests will skip.`)
      await api.dispose()
      return
    }
    await api.dispose()
  }

  if (!token) {
    console.warn(
      '\n⚠️  No auth credentials — auth setup skipped.\n' +
      '   Set TEST_EMAIL + TEST_PASSWORD (or WALLET_TOKEN) to enable auth tests.\n' +
      '   Hardcoded dev user: test@example.com / Test1234!\n'
    )
    return
  }

  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    await page.goto(baseURL)
  } catch {
    console.warn(
      `⚠️  Could not reach ${baseURL} — is the dev server running?\n` +
      `   global-setup skipped. Tests will run unauthenticated.`
    )
    await browser.close()
    return
  }

  try {
    await page.evaluate(
      (t) => {
        localStorage.setItem('wallet_token', t)
        // Pin the UI language so spec text is deterministic. Headless Chrome
        // reports English to the language detector; the product's primary
        // language is Vietnamese, so all specs assert vi.ts strings.
        localStorage.setItem('wallet_language', 'vi')
        // Mark onboarding done so the modal never overlays seeded pages.
        localStorage.setItem('wallet_onboarding_done', 'true')
      },
      token,
    )

    await page.reload()
    await page.waitForLoadState('domcontentloaded')
    // Give React a moment to hydrate + run the auth redirect so the URL check
    // below reflects the real authenticated state (not a pre-hydration snapshot).
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(1_000)

    const currentURL = page.url()
    if (currentURL.includes('/login')) {
      console.warn(
        `⚠️  Token injected but app redirected to /login — token may be invalid.\n` +
        `   Current URL: ${currentURL}`
      )
    } else {
      console.log(`✅ Auth state verified — on: ${currentURL}`)
    }

    await context.storageState({ path: storageStatePath })
    console.log(`✅ Auth state saved to ${storageStatePath}`)
  } finally {
    await browser.close()
  }
}

export default globalSetup
