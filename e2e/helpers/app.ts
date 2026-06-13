import { Locator, Page } from '@playwright/test'

/**
 * Scope queries to the VISIBLE page content.
 *
 * The app-shell renders the page (`<main>`) twice — once in the mobile layout
 * (`md:hidden`) and once in the desktop layout (`hidden md:flex`) — and hides one
 * per viewport with CSS. A bare `getByText(...)` therefore matches TWO elements
 * (strict-mode violation) and `.first()` often resolves to the HIDDEN copy.
 *
 * `content(page)` returns the single visible `<main>`, so every query inside it
 * targets exactly the rendered layout on both desktop and mobile.
 */
export function content(page: Page): Locator {
  return page.locator('main:visible')
}

/**
 * Recover from transient data-load errors.
 *
 * Under sustained full-suite load the dev-server proxy can intermittently drop a
 * React Query request, leaving the app in an error state ("Không tải được…" with a
 * "Thử lại" retry). That's environmental, not a regression — so click the in-app
 * retry (and reload as a fallback) until the error clears or we run out of tries.
 */
export async function recoverFromLoadError(page: Page, tries = 3): Promise<void> {
  for (let i = 0; i < tries; i++) {
    const retry = page.getByRole('button', { name: /Thử lại/i })
    if ((await retry.count()) === 0) return
    await retry.first().click().catch(() => {})
    await page.waitForLoadState('networkidle').catch(() => {})
    await page.waitForTimeout(500)
  }
  // Final fallback: a full reload settles any remaining error state.
  if ((await page.getByRole('button', { name: /Thử lại/i }).count()) > 0) {
    await page.reload()
    await page.waitForLoadState('networkidle').catch(() => {})
  }
}

/**
 * Pin the UI language to Vietnamese for an UNAUTHENTICATED context.
 *
 * The authed projects inherit `wallet_language='vi'` from global-setup's
 * storageState, but the chromium-noauth project starts from a blank state and
 * would otherwise pick the browser language (English in headless Chrome). Call
 * this BEFORE the first page.goto() so i18next reads vi from localStorage on init.
 */
export async function pinLocale(page: Page): Promise<void> {
  await page.addInitScript(() => {
    localStorage.setItem('wallet_language', 'vi')
  })
}

/**
 * Wait for React to hydrate — use before any toBeVisible() assertions.
 *
 * `domcontentloaded` fires before React renders. Playwright's built-in
 * toBeVisible() timeout (~5s) is too short for Vercel cold-start + API
 * response + React hydration. This waits for load + a React button to appear.
 *
 * Usage: call at the top of every test, right after page.goto().
 */
export async function waitForReact(page: Page): Promise<void> {
  await page.waitForLoadState('load')
  // A button is always React-rendered; its appearance signals hydration complete.
  // The app-shell renders BOTH the mobile and desktop layouts in the DOM (one is
  // CSS-hidden per viewport), so `button.first()` may resolve to a hidden node.
  // Wait for the first VISIBLE button instead so this works on desktop + mobile.
  await page.locator('button:visible').first().waitFor({ state: 'visible', timeout: 30_000 })
  // Let in-flight React Query fetches settle so data-dependent UI (charts, lists,
  // rules) is rendered before assertions. Under sequential full-suite load the dev
  // server can be slow enough that a bare button-wait races the data render.
  await page.waitForLoadState('networkidle').catch(() => {})
}

/**
 * Wait for a specific heading to be visible on the given page.
 *
 * Why? `waitForLoadState('domcontentloaded')` fires before React hydrates.
 * Headings like "Số dư thực", "Giao dịch" are React-rendered, not in initial HTML.
 * Playwright's built-in `toBeVisible()` timeout (default 5s) is too short for
 * Vercel cold-start + API response + React hydration chain.
 *
 * Solution: explicitly wait for the specific heading element the test will check.
 * This is the most reliable pattern — wait for exactly what you test.
 */
export async function waitForHeading(
  page: Page,
  headingText: string,
  timeout = 30_000,
): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  const heading = page.getByRole('heading', { name: new RegExp(headingText, 'i') }).first()
  await heading.waitFor({ state: 'visible', timeout })
}

/**
 * Wait for a specific text element to be visible.
 */
export async function waitForText(
  page: Page,
  text: string,
  timeout = 30_000,
): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  const el = page.getByText(text).first()
  await el.waitFor({ state: 'visible', timeout })
}

/**
 * Wait for a button to be visible.
 */
export async function waitForButton(
  page: Page,
  text: string,
  timeout = 30_000,
): Promise<void> {
  await page.waitForLoadState('domcontentloaded')
  const btn = page.getByRole('button', { name: new RegExp(text, 'i') }).first()
  await btn.waitFor({ state: 'visible', timeout })
}
