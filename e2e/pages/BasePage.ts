import { Page, expect } from '@playwright/test'

/**
 * BasePage — shared navigation and common assertions
 */
export class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path)
    await this.waitForPageReady()
  }

  async waitForPageReady() {
    // Wait for loading states to resolve
    await this.page.waitForSelector('[data-testid="page-ready"], main, .page', { timeout: 10_000 }).catch(() => {})
    // Give React time to hydrate
    await this.page.waitForLoadState('networkidle').catch(() => {})
  }

  async getToast(): Promise<string | null> {
    const toast = this.page.locator('[role="status"], [role="alert"], .toast, [class*="toast"]').last()
    if (await toast.isVisible()) {
      return toast.textContent()
    }
    return null
  }

  async dismissToast() {
    await this.page.keyboard.press('Escape')
    await this.page.waitForTimeout(300)
  }
}
