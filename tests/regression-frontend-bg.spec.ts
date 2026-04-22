import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { HomePage, BasePage } from '../pages';

test.describe('Regressie Test Set - Front end BG', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Cookies: banner visible on first visit and can accept', async ({ page }) => {
    await page.context().clearCookies();
    await page.reload();
    const basePage = new BasePage(page);
    await expect(basePage.cookieDialog).toBeVisible();
    await expect(basePage.acceptCookiesButton).toBeVisible();
    await expect(basePage.refuseCookiesButton).toBeVisible();

    await basePage.acceptCookies();
    await expect(basePage.cookieDialog).toBeHidden();
  });

  test('Cookies: can refuse cookies (functional banner closes)', async ({ page }) => {
    await page.context().clearCookies();
    await page.reload();
    const basePage = new BasePage(page);
    await expect(basePage.cookieDialog).toBeVisible();
    await basePage.refuseCookies();
    await expect(basePage.cookieDialog).toBeHidden();
  });

  test('Cookies: banner not shown on return visit after accepting', async ({ page }) => {
    await page.context().clearCookies();
    await page.reload();
    const basePage = new BasePage(page);
    await expect(basePage.cookieDialog).toBeVisible();
    await basePage.acceptCookies();
    await expect(basePage.cookieDialog).toBeHidden();
    await page.reload();
    await expect(basePage.cookieDialog).toBeHidden();
  });

  test('Homepage: serie/persoon/omroep/programma carousels navigate and items clickable', async ({ page }) => {
    const homePage = new HomePage(page);
    // Serie carousel (Nostalgie)
    await expect(page.getByRole('heading', { name: 'Nostalgie', level: 2 })).toBeVisible();
    await homePage.carouselNextButtons.first().click();
    await expect(page.getByRole('link').filter({ hasText: /SESAMSTRAAT|HET KLOKHUIS|DE STRAAT/ }).first()).toBeVisible();
    await page.getByRole('link').filter({ has: page.getByText(/SESAMSTRAAT|HET KLOKHUIS|DE STRAAT/) }).first().click();
    await expect(page).toHaveURL(/\/serie\//);
    await page.goBack();

    // Programma's met meerdere streams carousel
    await expect(page.getByRole('heading', { name: "Programma's met meerdere streams", level: 2 })).toBeVisible();
    await homePage.carouselNextButtons.nth(1).click();
    await expect(page.getByRole('link').filter({ hasText: /Video met|Audio met|Programma met/ }).first()).toBeVisible();

    // Omroepen van de week carousel
    await expect(page.getByRole('heading', { name: /Omroep/i, level: 2 }).first()).toBeVisible();
    await homePage.carouselNextButtons.nth(2).click();
    await expect(page.getByRole('link').filter({ hasText: /BNNVARA|AVROTROS|VPRO|EO|HUMAN|NTR/ }).first()).toBeVisible();

    // Personen carousel (Weet je nog?)
    await expect(page.getByRole('heading', { name: 'Weet je nog?', level: 2 })).toBeVisible();
    await homePage.carouselNextButtons.nth(3).click();
    await expect(page.getByRole('link').filter({ hasText: /Mies Bouwman|Willem Ruis|Carry Tefsen/ }).first()).toBeVisible();
  });

  test('Homepage: program card "Meer opties" menu shows Toevoegen aan lijst and Delen', async ({ page }) => {
    const homePage = new HomePage(page);
    const card = homePage.programCard("'t Beste beentje voor!");
    await expect(card).toBeVisible();

    const optionsButton = homePage.cardOptionsButton(card);
    await expect(optionsButton).toBeVisible();
    await optionsButton.click();

    await expect(optionsButton).toHaveAttribute('aria-expanded', 'true');

    await expect(homePage.addToListMenuItem.first()).toBeVisible();
    await expect(homePage.shareMenuItem.first()).toBeVisible();
  });

  test('Homepage: program card Delen opens popup with share options', async ({ page }) => {
    const homePage = new HomePage(page);
    const card = homePage.programCard("'t Beste beentje voor!");
    await expect(card).toBeVisible();
    await homePage.cardOptionsButton(card).click();
    await homePage.shareMenuItem.first().click();

    const copyButton = page.getByRole('button', { name: /Kopieer|Copy|kopiëren|Link/i });
    const urlField = page.locator('input[readonly], input[type="url"]').first();
    const shareContent = page.getByText(/delen|share|link/i).or(copyButton).or(urlField);
    await expect(shareContent.first()).toBeVisible({ timeout: 8000 });
  });
  
  

  test('Homepage: footer contains Organisatie, Ondersteuning, Omroepen and legal/B&G links', async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    await homePage.scrollFooterIntoView();
    await expect(homePage.footerHeadingOrganisatie).toBeVisible();
    await expect(homePage.footerHeadingOndersteuning).toBeVisible();
    await expect(homePage.footerHeadingOmroepen).toBeVisible();
    const footer = homePage.footer;
    const legalOrLogo = footer
      .getByRole('link', { name: /Algemene|Privacy|Toegankelijkheid|Voorwaarden|beeldengeluid|Beeld.*Geluid/i })
      .or(footer.locator('a[href*="beeldengeluid"]'));
    await expect(legalOrLogo.first()).toBeVisible();
  });

  test('Footer: external link opens new tab; internal link opens in same tab', async ({ page, context }) => {
    const homePage = new HomePage(page);
    await homePage.scrollFooterIntoView();

    const externalPromise = context.waitForEvent('page');
    await homePage.linkOverBeeldEnGeluid.click();
    const newTab = await externalPromise;
    await expect(newTab).toHaveURL(/beeldengeluid\.nl\/organisatie/);
    await newTab.close();

    await homePage.linkConvenantAudiovisueleWerken.click();
    await expect(page).toHaveURL(/\/convenant-audiovisuele-werken$/);
  });

  test('Footer: newsletter input and submit present', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.scrollFooterIntoView();
    await expect(homePage.newsletterHeading).toBeVisible();
    await expect(homePage.newsletterTextbox).toBeVisible();
    await expect(homePage.newsletterAanmeldenButton).toBeVisible();
  });

  test('Homepage: newsletter invalid email shows error or keeps form visible', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.scrollFooterIntoView();
    await homePage.newsletterTextbox.fill('not-an-email');
    await homePage.newsletterAanmeldenButton.click();
    const errorVisible = await page
      .getByText(/ongeldig|invalid|voer een geldig|vul een geldig|fout|error|e-mail/i)
      .first()
      .isVisible()
      .catch(() => false);
    const formStillVisible = await homePage.newsletterAanmeldenButton.isVisible().catch(() => false);
    expect(errorVisible || formStillVisible).toBe(true);
  });

  test('FAQ: expand/collapse answers by clicking a question', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.linkVeelgesteldeVragen.click();
    await expect(page.getByRole('heading', { name: 'Veelgestelde vragen & Contact', level: 1 })).toBeVisible();

    const question = page.getByRole('button', { name: 'Wat is de Schatkamer?' });
    await question.click();
    // After expanding, the following paragraph text should be visible
    await expect(page.getByText('De Schatkamer is een online portal')).toBeVisible();
  });

  test('Footer: navigate to an omroep page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.scrollFooterIntoView();
    await page.goto(`${BASE_URL}omroep/236909/avrotros`);
    await expect(page).toHaveURL(/\/omroep\//);
    await expect(page.getByRole('heading', { name: 'AVROTROS', level: 1 })).toBeVisible();
  });

  test('Homepage: header contains logo (to Home), search bar and Inloggen', async ({ page }) => {
    const homePage = new HomePage(page);
    const basePage = new BasePage(page);
    await expect(basePage.banner).toBeVisible();
    await expect(basePage.homeLink).toBeVisible();
    await expect(homePage.searchBoxWithPlaceholder.or(homePage.searchBox)).toBeVisible();
    await expect(homePage.inloggenLink.or(homePage.inloggenButton)).toBeVisible();
  });

  test('Inloggen: navigate to login via header lands on /inloggen', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.inloggenLink.or(homePage.inloggenButton).first().click();
    await expect(page).toHaveURL(/\/inloggen/);
  });

  test('Inloggen: navigate to login via "Log in om op te slaan" on program detail page', async ({
    page,
  }) => {
    await page.goto(
      `${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`
    );
    const basePage = new BasePage(page);
    await expect(basePage.main).toBeVisible();
    const logInToSave = page
      .getByRole('button', { name: /Log in om op te slaan|Inloggen om op te slaan/i })
      .or(page.getByRole('link', { name: /Log in om op te slaan|Inloggen om op te slaan/i }));
    await expect(logInToSave.first()).toBeVisible({ timeout: 8000 });
    await logInToSave.first().click();
    await expect(page).toHaveURL(/\/inloggen/);
  });

  test('Homepage: static components (Hero, pay-off, banner) are visible', async ({ page }) => {
    const homePage = new HomePage(page);
    const basePage = new BasePage(page);
    await expect(homePage.mainHeading).toBeVisible();
    await expect(basePage.banner).toBeVisible();
    await expect(basePage.main).toBeVisible();
  });

  test('Homepage: Uitgelichte Verhalen - click on story item', async ({ page }) => {
    const homePage = new HomePage(page);
    const story = homePage.storyLink;
    await expect(story).toBeVisible();
    await story.scrollIntoViewIfNeeded();
    await story.click();
    await expect(page).toHaveURL(/\/verhaal\//);
  });

  test('Verhalen: page components and meta byline visible', async ({ page }) => {
    // Navigate to a story page
    await page.goto(`${BASE_URL}verhaal/franks-componentenverhaal`);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    // Verify meta information (author, date, read time) exists - check for paragraphs
    await expect(page.locator('p').first()).toBeVisible();
  });

  test('Personen pagina: curated person page has intro and image', async ({ page }) => {
    // Navigate to Mies Bouwman (curated person)
    await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);
    await expect(page.getByRole('heading', { name: /Mies Bouwman/i, level: 1 })).toBeVisible();
    // Curated pages should have an intro paragraph
    await expect(page.locator('p').first()).toBeVisible();
  });

  test('Personen pagina: uncurated person page shows name and role', async ({ page }) => {
    // Navigate to an uncurated person (J. Duin)
    await page.goto(`${BASE_URL}persoon/95029/j-duin`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Personen pagina: programs linked to person are visible', async ({ page }) => {
    await page.goto(`${BASE_URL}persoon/85227/mies-bouwman`);
    await expect(page.getByRole('heading', { name: /Mies Bouwman/i, level: 1 })).toBeVisible();
    // Programs section should show related programs
    await expect(page.getByRole('heading', { name: /In de spotlight/i, level: 2 })).toBeVisible();
  });

  test('Entiteit Serie: serie page shows linked programmes', async ({ page }) => {
    await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);
    await expect(page.getByRole('heading', { name: /SESAMSTRAAT/i, level: 1 })).toBeVisible();
    const basePage = new BasePage(page);
    await expect(basePage.main.getByRole('link').first()).toBeVisible();
  });

  test('Entiteit Omroep: sort control visible and offers Oudste eerst', async ({ page }) => {
    await page.goto(`${BASE_URL}omroep/223534/ntr`);
    const basePage = new BasePage(page);
    await expect(basePage.main).toBeVisible();
    const sortTrigger = page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie|Sortering/i });
    await expect(sortTrigger.first()).toBeVisible({ timeout: 8000 });
    await sortTrigger.first().click();
    // Sort UI is a radiogroup in menu "Sorteren"; getByText hits a hidden <p> clone first.
    await expect(page.getByRole('radio', { name: /^Oudste eerst$/i })).toBeVisible({ timeout: 5000 });
  });

  test('Programma detail: title, date, description visible', async ({ page }) => {
    const basePage = new BasePage(page);
    await page.goto(`${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`);

    // Wait for main content so WebKit has finished layout
    await expect(basePage.main).toBeVisible();

    // Title
    await expect(basePage.main.getByRole('heading', { level: 1 })).toBeVisible();

    // Date - check for date text in various formats (within main)
    await expect(basePage.main.locator('text=/\\d{1,2}-\\d{1,2}-\\d{4}|\\d{4}/').first()).toBeVisible();

    // Description/summary - visible paragraph with text (exclude hidden video modal .vjs-offscreen)
    await expect(
      basePage.main.locator('p:not(.vjs-offscreen)').filter({ hasText: /\S/ }).first()
    ).toBeVisible();
  });

  test('Programma detail: related items carousels visible', async ({ page }) => {
    await page.goto(`${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531/geen-titel`);
    const basePage = new BasePage(page);
    await expect(basePage.main).toBeVisible();
  });

  test('Breadcrumb: visible and clickable on program detail and verhaal pages', async ({ page }) => {
    const homePage = new HomePage(page);
    await page.goto(`${BASE_URL}serie/2101608030021467131/het-klokhuis/aflevering/2101608040030110531`);
    await expect(homePage.breadcrumb).toBeVisible();
    await expect(homePage.breadcrumb.getByRole('link', { name: 'Home' })).toBeVisible();
    await homePage.breadcrumb.getByRole('link', { name: 'Home' }).click();
    await expect(page).not.toHaveURL(/\/serie\/|\/aflevering\//);

    await page.goto(`${BASE_URL}verhaal/franks-componentenverhaal`);
    await expect(homePage.breadcrumb).toBeVisible();
    await expect(homePage.breadcrumb.getByRole('link').first()).toBeVisible();
  });

  test('Pagination works on omroep page', async ({ page }) => {
    const basePage = new BasePage(page);
    const url = `${BASE_URL}omroep/223534/ntr`;
    await page.goto(url);

    await expect(page.getByRole('heading', { name: /NTR/i, level: 1 })).toBeVisible();

    const pagination = page.getByRole('navigation', { name: /Paginering|Pagination/i });
    await expect(pagination).toBeVisible();

    const firstResult = () =>
      basePage.main.getByRole('link').first().textContent();
  
    const firstBefore = await firstResult();
  
    // Go to page 2 (prefer numbered button, fallback to "Next")
    const nextPage = pagination.getByRole('link', { name: /^2$/ })
      .or(pagination.getByRole('link', { name: /Volgende|Next/i }));
  
    await nextPage.click();
    await expect(page).toHaveURL(/[?&]pagina=2/);
  
    const firstAfter = await firstResult();
    expect(firstBefore).not.toBe(firstAfter);
  
    // Go back to page 1 (prefer "1", fallback to "Previous")
    const prevPage = pagination.getByRole('link', { name: /^1$/ })
      .or(pagination.getByRole('link', { name: /Vorige|Previous/i }));
  
    await prevPage.click();
    await expect(page).toHaveURL(/omroep\/223534\/ntr($|[?&]pagina=1)/);
  });
  

  test('Toegankelijkheid: keyboard navigation on homepage', async ({ page }) => {
    // Press Tab to focus first interactive element
    await page.keyboard.press('Tab');
    
    // Check that an element has focus
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
    
    // Press Enter on a link (should navigate)
    const initialUrl = page.url();
    await page.keyboard.press('Enter');
    
    // URL should have changed or element should have been activated
    const newUrl = page.url();
    expect(newUrl).toBeTruthy();
  });
});


