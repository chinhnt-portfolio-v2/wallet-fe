import { Page } from '@playwright/test'

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
  // A button is always React-rendered; its appearance signals hydration complete
  await page.locator('button').first().waitFor({ state: 'visible', timeout: 30_000 })
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
