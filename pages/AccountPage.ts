import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Account page (when logged in): edit password, year of birth, and Lijsten tab.
 * URL may be /account, /mijn-account, or similar.
 */
export class AccountPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** Main page heading (e.g. "Mijn account" or "Account"). */
  get accountHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  /** Link or button to go to account (e.g. in header after login). */
  get accountLink(): Locator {
    return this.page
      .getByRole('link', { name: /account|mijn account|profiel/i })
      .or(this.page.getByRole('button', { name: /account|mijn account|profiel/i }))
      .first();
  }

  /** Tab or link "Lijsten" / "Mijn lijsten" (lists). */
  get tabLijsten(): Locator {
    return this.page
      .getByRole('tab', { name: /Lijsten|Mijn lijsten/i })
      .or(this.page.getByRole('link', { name: /Lijsten|Mijn lijsten/i }))
      .first();
  }

  /** Section or heading for password. */
  get passwordSection(): Locator {
    return this.page
      .getByRole('heading', { name: /wachtwoord|password/i })
      .or(this.page.getByText(/wachtwoord wijzigen|change password/i))
      .first();
  }

  /** Link or button to edit password. */
  get editPasswordTrigger(): Locator {
    return this.page
      .getByRole('button', { name: /wachtwoord|password|wijzigen|bewerken|edit/i })
      .or(this.page.getByRole('link', { name: /wachtwoord|password|wijzigen|bewerken|edit/i }))
      .first();
  }

  /** Section or label for year of birth (single element). */
  get yearOfBirthSection(): Locator {
    return this.page
      .getByRole('heading', { name: /geboortejaar|geboortedatum|year of birth|birth/i })
      .or(this.page.getByText('Geboortejaar', { exact: true }))
      .first();
  }

  /** Link or button to edit year of birth (in the same block as "Geboortejaar" label in main content). */
  get editYearOfBirthTrigger(): Locator {
    return this.main.getByRole('button', { name: 'Wijzigen' }).nth(2);
  }

  /** Input for birth year (when editing). */
get yearOfBirthInput(): Locator {
  return this.main.locator('input[name="birthyear"]');
}

  /** Save / submit button for birth year form. */
  get saveBirthYearButton(): Locator {
    return this.main
      .getByRole('button', { name: /opslaan|bewerken opslaan|save|submit/i })
      .or(this.main.locator('button[type="submit"]'))
      .first();
  }

  /** Validation error when birth year is too young (under 16) or invalid. */
  get birthYearValidationError(): Locator {
    return this.page
      .getByText(/16.*jaar|minimaal 16|je moet 16|te jong|too young|under 16|leeftijd|geboortejaar.*ongeldig|invalid/i)
      .first();
  }

  /** New password input (when editing password). */
  get newPasswordInput(): Locator {
    return this.page.locator('input[type="password"]').first();
  }

  /** Create new list button on Lijsten tab. */
  get createListButton(): Locator {
    return this.page
      .getByRole('button', { name: /nieuwe lijst|maak lijst|create list|toevoegen/i })
      .or(this.page.getByRole('link', { name: /nieuwe lijst|maak lijst|create list/i }))
      .first();
  }

  /** Lists container or heading on Lijsten tab (single element). */
  get lijstenHeading(): Locator {
    return this.page.getByRole('heading', { name: /lijsten|mijn lijsten|lists/i }).first();
  }

  async gotoAccount(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}account`);
  }

  async gotoMijnAccount(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}mijn-account`);
  }

  /** Set birth year (works for input or select). */
  async setBirthYear(year: number): Promise<void> {
    const selectEl = this.main.locator('select').first();
    const isSelect = await selectEl.isVisible().catch(() => false);
    if (isSelect) {
      await selectEl.selectOption(String(year));
    } else {
      await this.yearOfBirthInput.fill(String(year));
    }
  }
}
