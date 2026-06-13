#!/usr/bin/env node
/**
 * Capture full-page screenshots of every route for UI/UX audits.
 *
 * Usage: node e2e/setup/capture-ui-screenshots.mjs
 * Env:   BASE_URL (default http://localhost:3000)
 *        API_BASE (default https://chinhnt-portfolio-platform.fly.dev)
 *        TEST_EMAIL / TEST_PASSWORD (default e2e-test@example.com / Test1234!)
 * Out:   test-results/ui-audit/{desktop|mobile}/{route}.png
 */
import { chromium } from '@playwright/test'
import * as fs from 'fs'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const API_BASE = process.env.API_BASE || 'https://chinhnt-portfolio-platform.fly.dev'
const EMAIL = process.env.TEST_EMAIL || 'e2e-test@example.com'
const PASSWORD = process.env.TEST_PASSWORD || 'Test1234!'

const AUTHED_ROUTES = [
  ['dashboard', '/'],
  ['transactions', '/transactions'],
  ['add-transaction', '/add'],
  ['debts', '/debts'],
  ['debts-new', '/debts/new'],
  ['wallets', '/wallets'],
  ['transfer', '/wallets/transfer'],
  ['categories', '/categories'],
  ['budgets', '/budgets'],
  ['recurring', '/recurring'],
  ['export', '/export'],
  ['notifications', '/notifications'],
  ['profile', '/profile'],
  ['wishlist', '/wishlist'],
]

const VIEWPORTS = {
  desktop: { width: 1366, height: 850 },
  mobile: { width: 390, height: 844 },
}

async function capture(page, dir, name, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
    await page.waitForTimeout(1500) // let charts/animations settle
    // animations:'disabled' — fullPage capture re-triggers CSS enter animations
    // and stitches a mid-fade frame, dimming the whole image
    await page.screenshot({ path: `${dir}/${name}.png`, fullPage: true, animations: 'disabled' })
    console.log(`✓ ${dir}/${name}`)
  } catch (e) {
    console.warn(`✗ ${dir}/${name}: ${e.message?.slice(0, 120)}`)
  }
}

async function main() {
  const loginResp = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const auth = await loginResp.json()
  if (!auth.accessToken) throw new Error('Login failed')

  const browser = await chromium.launch()
  for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
    const dir = `test-results/ui-audit/${vpName}`
    fs.mkdirSync(dir, { recursive: true })

    // Authed context — tokens injected before app loads
    const authedContext = await browser.newContext({ viewport, deviceScaleFactor: 1 })
    await authedContext.addInitScript(
      ([t, r]) => {
        localStorage.setItem('wallet_token', t)
        localStorage.setItem('wallet_refresh_token', r)
      },
      [auth.accessToken, auth.refreshToken],
    )
    const page = await authedContext.newPage()
    for (const [name, route] of AUTHED_ROUTES) {
      await capture(page, dir, name, `${BASE_URL}${route}`)
    }
    await authedContext.close()

    // Clean context — login page without tokens
    const cleanContext = await browser.newContext({ viewport, deviceScaleFactor: 1 })
    const cleanPage = await cleanContext.newPage()
    await capture(cleanPage, dir, 'login', `${BASE_URL}/login`)
    await cleanContext.close()
  }
  await browser.close()
  console.log('\nScreenshots saved to test-results/ui-audit/')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
