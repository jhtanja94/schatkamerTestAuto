import type { Page, Locator } from '@playwright/test';

/**
 * Base page with shared layout and components (header, footer, main, cookie dialog).
 * Other page objects can extend this or compose it.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  get banner(): Locator {
    return this.page.getByRole('banner');
  }

  get main(): Locator {
    return this.page.getByRole('main');
  }

  get footer(): Locator {
    return this.page.getByRole('contentinfo');
  }

  get cookieDialog(): Locator {
    return this.page.getByRole('dialog', { name: 'Privacy' });
  }

  get acceptCookiesButton(): Locator {
    return this.cookieDialog.getByRole('button', { name: 'Alles accepteren' });
  }

  get refuseCookiesButton(): Locator {
    return this.cookieDialog.getByRole('button', { name: 'Cookies weigeren' });
  }

  get homeLink(): Locator {
    return this.page.getByRole('link', { name: 'Home' }).first();
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async scrollFooterIntoView(): Promise<void> {
    await this.footer.scrollIntoViewIfNeeded();
  }

  async acceptCookies(): Promise<void> {
    await this.acceptCookiesButton.click();
  }

  async refuseCookies(): Promise<void> {
    await this.refuseCookiesButton.click();
  }
}
