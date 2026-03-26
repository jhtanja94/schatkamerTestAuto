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

  /** Container that has the "Media" heading in the flyout. Uses .last() so we get the flyout (often rendered last in DOM/portal) not main content. */
  get flyoutMediaSection(): Locator {
    return this.page
      .locator('div, section, [role="listbox"], [role="region"]')
      .filter({ has: this.page.getByText('Media', { exact: true }) })
      .filter({ has: this.page.getByRole('link') })
      .last();
  }

  /** Media links in the flyout (scoped to the Media section). */
  get flyoutMediaItems(): Locator {
    return this.flyoutMediaSection.getByRole('link');
  }

  get flyoutOmroepLinks(): Locator {
    return this.page.getByRole('link', { name: /\bOmroep$/ });
  }

  linkNtrOmroep(): Locator {
    return this.page.getByRole('link', { name: 'NTR Omroep' }).first();
  }

  // —— Search results page (/zoeken) and omroep entity page ——
  get resultsHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 });
  }

  resultsHeadingWithName(name: string): Locator {
    return this.page.getByRole('heading', { name, level: 1 });
  }

  get sortTrigger(): Locator {
    return this.page.getByRole('button', { name: 'Relevantie' });
  }

  /** Sort dropdown trigger (Relevantie, Oudste eerst, or Nieuwste eerst). */
  get sortButton(): Locator {
    return this.page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie/ });
  }

  /** Panel that opens when the sort button is clicked (aria-controls="sort"). Use for scoped option click. */
  get sortDropdownPanel(): Locator {
    return this.page.locator('#sort');
  }

  get sortOptionOudsteEerst(): Locator {
    return this.page.getByText('Oudste eerst');
  }

  get sortOptionNieuwsteEerst(): Locator {
    return this.page.getByText('Nieuwste eerst');
  }

  /** "Nieuwste eerst" option scoped to the open sort dropdown (avoids matching text elsewhere on page). */
  get sortOptionNieuwsteEerstInDropdown(): Locator {
    return this.sortDropdownPanel
      .getByRole('option', { name: /Nieuwste eerst/i })
      .or(this.sortDropdownPanel.getByText('Nieuwste eerst', { exact: true }))
      .first();
  }

  get playableSwitch(): Locator {
    return this.page.getByRole('switch');
  }

  get resultsLabel(): Locator {
    return this.page.getByText(/resultaten/).first();
  }

  get pagination(): Locator {
    return this.page.getByRole('navigation', { name: /Paginering|Pagination/i });
  }

  filterButton(name: string): Locator {
    return this.page.getByRole('button', { name });
  }

  get firstResultLink(): Locator {
    return this.main.getByRole('link').first();
  }

  async expectOnSearchResultsPage(): Promise<void> {
    await this.page.waitForURL(/\/zoeken\?/);
  }
}
