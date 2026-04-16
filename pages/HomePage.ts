import type { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Homepage (/): search, content sections, footer, carousels, program cards.
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // —— Search (header) ——
  get searchBox(): Locator {
    return this.page.getByRole('textbox', { name: /Zoek/ });
  }

  get searchBoxWithPlaceholder(): Locator {
    return this.page
      .getByRole('textbox', { name: /Zoek op programma's, personen, verhalen en omroepen/ })
      .first();
  }

  get zoekenButton(): Locator {
    return this.page.getByRole('button', { name: 'Zoeken' });
  }

  // —— Header / nav ——
  get inloggenLink(): Locator {
    return this.page.getByRole('link', { name: 'Inloggen' });
  }

  get inloggenButton(): Locator {
    return this.page.getByRole('button', { name: 'Inloggen' });
  }

  // —— Main content ——
  get mainHeading(): Locator {
    return this.page.getByRole('heading', { level: 1 }).first();
  }

  get contentLinksWithImage(): Locator {
    return this.page.getByRole('link').filter({ has: this.page.locator('img') });
  }

  get carouselNextButtons(): Locator {
    return this.page.getByRole('button', { name: 'Navigeer naar rechts' });
  }

  /** First "Meer opties" button in main (program card menu). */
  get firstProgramCardOptionsButton(): Locator {
    return this.main.locator('button[data-gtm-interaction-text="Meer opties"]').first();
  }

  /** Program card by program title (e.g. "'t Beste beentje voor!").
   * Finds the card that contains a link whose name includes the given title.
   * (Swimlane sections use their own aria-label like "Het Lichaam", not the program title.) */
  programCard(programTitle: string): Locator {
    const escaped = programTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const linkWithTitle = this.page.getByRole('link', { name: new RegExp(escaped) });
    return this.page
      .locator('div[data-gtm-ux-component="swimlane-card-numbered-list"]')
      .filter({ has: linkWithTitle })
      .first();
  }

  /** "Meer opties" button inside a specific card. */
  cardOptionsButton(card: Locator): Locator {
    return card.locator('button[data-gtm-interaction-text="Meer opties"][aria-haspopup="true"]');
  }

  /** "Log in om op te slaan" in program card menu when not logged in (button or menuitem). */
  get addToListMenuItem(): Locator {
    return this.page
      .getByRole('button', { name: 'Log in om op te slaan' })
      .or(this.page.getByRole('menuitem', { name: 'Log in om op te slaan' }))
      .or(this.page.getByText('Log in om op te slaan', { exact: true }));
  }

  /** "Toevoegen aan lijst" in program card menu when logged in (button or menuitem). */
  get addToListMenuItemLoggedIn(): Locator {
    return this.page
      .getByRole('button', { name: /Toevoegen aan lijst|toevoegen aan lijst/i })
      .or(this.page.getByRole('menuitem', { name: /Toevoegen aan lijst|toevoegen aan lijst/i }))
      .or(this.page.getByText(/Toevoegen aan lijst|toevoegen aan lijst/i));
  }

  /** "Delen" in program card menu (button or menuitem). */
  get shareMenuItem(): Locator {
    return this.page
      .getByRole('button', { name: 'Delen' })
      .or(this.page.getByRole('menuitem', { name: 'Delen' }))
      .or(this.page.getByText('Delen', { exact: true }));
  }

  // —— Footer ——
  get footerHeadingOrganisatie(): Locator {
    return this.footer.getByRole('heading', { name: 'Organisatie' });
  }

  get footerHeadingOndersteuning(): Locator {
    return this.footer.getByRole('heading', { name: 'Ondersteuning' });
  }

  get footerHeadingOmroepen(): Locator {
    return this.footer.getByRole('heading', { name: 'Omroepen' });
  }

  get linkOverBeeldEnGeluid(): Locator {
    return this.page.getByRole('link', { name: 'Over Beeld & Geluid' });
  }

  get linkVeelgesteldeVragen(): Locator {
    return this.page.getByRole('link', { name: 'Veelgestelde vragen & Contact' });
  }

  get linkConvenantAudiovisueleWerken(): Locator {
    return this.page.getByRole('link', { name: 'Convenant Audiovisuele Werken' });
  }

  /** Legacy title; CMS may use another heading for the same swimlane. */
  get headingLeesIetsAnders(): Locator {
    return this.page.getByRole('heading', { name: 'Lees iets anders', level: 2 });
  }

  /** First in-main link to a story detail page (featured swimlane or hero). */
  get storyLink(): Locator {
    return this.main.locator('a[href*="/verhaal/"]').first();
  }

  get newsletterHeading(): Locator {
    return this.page.getByRole('heading', { name: 'Ontvang de nieuwsbrief en blijf op de hoogte' });
  }

  get newsletterAanmeldenButton(): Locator {
    return this.footer.getByRole('button', { name: 'Aanmelden' });
  }

  get newsletterTextbox(): Locator {
    return this.footer.getByRole('textbox');
  }

  get attributionText(): Locator {
    return this.page.getByText('De Schatkamer is een initiatief van Beeld & Geluid');
  }

  get breadcrumb(): Locator {
    return this.page.getByRole('navigation', { name: 'breadcrumb' });
  }

  // —— Actions ——
  async search(query: string): Promise<void> {
    await this.searchBox.fill(query);
  }

  async searchAndSubmit(query: string): Promise<void> {
    await this.searchBox.fill(query);
    await this.zoekenButton.click();
  }

  async searchAndPressEnter(query: string): Promise<void> {
    await this.searchBox.fill(query);
    await this.searchBox.press('Enter');
  }

  async openFirstProgramCardOptions(): Promise<void> {
    await this.firstProgramCardOptionsButton.click();
  }
}
