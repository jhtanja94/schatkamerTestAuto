import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

const LOGIN_PATH = '/inloggen';

/**
 * Login page (/inloggen). Use with LOGIN_USERNAME and LOGIN_PASSWORD from .env.
 */
export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get pageHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  get emailField(): Locator {
    return this.page.locator('input[name="email"]');
  }

  get passwordField(): Locator {
    return this.page.locator('input[type="password"]');
  }

  get submitButton(): Locator {
    return this.page
      .getByRole('button', { name: /inloggen|login|aanmelden|submit/i })
      .or(this.page.locator('button[type="submit"]'))
      .first();
  }

  /** Validation or error message (e.g. "verplicht", "ongeldig", "incorrect"). */
  get errorMessage(): Locator {
    return this.page
      .getByText(/verplicht|required|ongeldig|invalid|incorrect|fout|error|verkeerd|wrong/i)
      .first();
  }

  get alertRegion(): Locator {
    return this.page.locator('[role="alert"]').first();
  }

  get errorLikeClass(): Locator {
    return this.page.locator('.error, [class*="error" i]').first();
  }

  /** Link or button to go back (e.g. home, logo). */
  get backLink(): Locator {
    return this.page.getByRole('link', { name: /home|start|schatkamer|terug/i }).first();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailField.fill(email);
    await this.passwordField.fill(password);
    await this.submitButton.click();
  }

  async gotoLogin(path = LOGIN_PATH): Promise<void> {
    await this.page.goto(path);
  }

  /** Whether the page URL is the login page. */
  isOnLoginPage(): boolean {
    return this.page.url().includes(LOGIN_PATH);
  }
}
