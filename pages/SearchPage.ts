import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Search flyout (on homepage) and search results page (/zoeken).
 */
export class SearchPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // —— Flyout (after typing in header search) ——
  get flyoutMediaHeading(): Locator {
    return this.page.getByText('Media').first();
  }

  get flyoutMediaItems(): Locator {
    return this.page.getByRole('link', { name: /\((Serie|Programma)\)$/ });
  }

  get flyoutOmroepLinks(): Locator {
    return this.page.getByRole('link', { name: /\bOmroep$/ });
  }

  linkNtrOmroep(): Locator {
    return this.page.getByRole('link', { name: 'NTR Omroep' });
  }

  // —— Search results page (/zoeken) ——
  get resultsHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  get sortTrigger(): Locator {
    return this.page.getByRole('button', { name: 'Relevantie' });
  }

  get playableSwitch(): Locator {
    return this.page.getByRole('switch');
  }

  get pagination(): Locator {
    return this.page.getByRole('navigation', { name: /Paginering|Pagination/i });
  }

  filterButton(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  async expectOnSearchResultsPage(): Promise<void> {
    await this.page.waitForURL(/\/zoeken\?/);
  }
}
