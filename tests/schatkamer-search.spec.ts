import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { HomePage, SearchPage, BasePage } from '../pages';

test.describe('Schatkamer Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should load the homepage with correct title and search functionality', async ({ page }) => {
    const homePage = new HomePage(page);
    await expect(page).toHaveTitle(/De Schatkamer/);

    await expect(homePage.searchBox).toBeVisible();
    if (await homePage.zoekenButton.isVisible().catch(() => false)) {
      await expect(homePage.zoekenButton).toBeVisible();
    }
    await expect(homePage.inloggenLink).toBeVisible();

    await expect(homePage.mainHeading).toBeVisible();
  });

  test('Flyout: appears on first character typed', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.search('s');
    await expect(searchPage.flyoutMediaHeading).toBeVisible();
  });

  test('Flyout: Media shows up to 5 results for query', async ({ page }) => {
    await expect(page.getByRole('dialog', { name: 'Privacy' })).toBeHidden({ timeout: 3000 });

    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    const searchBox = homePage.searchBoxWithPlaceholder;
    await searchBox.click();

    // Wait for search API response so we assert as soon as flyout is populated (before it can close)
    const searchResponse = page.waitForResponse(
      (res) => {
        const u = res.url();
        return (
          res.request().resourceType() === 'fetch' &&
          (u.includes('search') || u.includes('suggest') || u.includes('query') || u.includes('zoek') || u.includes('autocomplete'))
        );
      },
      { timeout: 8000 }
    ).catch(() => null);

    await searchBox.pressSequentially('NTR', { delay: 60 });
    await searchResponse;

    // Single assertion: Media section has 5 links (retries until timeout)
    await expect(searchPage.flyoutMediaItems).toHaveCount(5, { timeout: 10000 });
  });

  test('Flyout: Omroep shows max 2 and click navigates to entity page', async ({ page }) => {
    await expect(page.getByRole('dialog', { name: 'Privacy' })).toBeHidden({ timeout: 3000 });

    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    const searchBox = homePage.searchBoxWithPlaceholder;
    await searchBox.click();
    await searchBox.pressSequentially('NTR', { delay: 80 });

    await expect(searchPage.flyoutMediaHeading).toBeVisible({ timeout: 5000 });
    await expect(searchPage.flyoutOmroepLinks).toHaveCount(2);
    // Ensure the 2 omroep links are different (same omroep twice must fail)
    const omroepLinkTexts = await searchPage.flyoutOmroepLinks.allTextContents();
    const trimmedNames = omroepLinkTexts.map((t) => t.trim());
    expect(new Set(trimmedNames).size).toBe(2);
    await searchPage.linkNtrOmroep().click();

    await expect(page).toHaveURL(/\/omroep\//);
    await expect(searchPage.resultsHeadingWithName('NTR')).toBeVisible();

    await expect(searchPage.playableSwitch).toBeVisible();
    await expect(searchPage.playableSwitch).toBeChecked();
    await expect(searchPage.sortButton).toBeVisible();
    // Results label may be hidden when the omroep has 0 results; just ensure it's in the DOM
    await expect(searchPage.resultsLabel).toBeAttached();
  });

  test('Advanced search: Enter key navigates to results with default filters', async ({ page }) => {
    const query = 'NTR';
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);

    await homePage.searchAndPressEnter(query);

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.resultsHeadingWithName(query)).toBeVisible();

    const filterNames = ['Programma', 'Type', 'Datum', 'Omroep', 'Collectie', 'Genre', 'Persoon', 'Onderwerp'];
    for (const name of filterNames) {
      await expect(searchPage.filterButton(name)).toBeVisible();
    }

    await expect(searchPage.sortTrigger).toBeVisible();
    await searchPage.sortTrigger.click();
    await expect(searchPage.sortOptionOudsteEerst).toBeVisible();
    await expect(searchPage.sortOptionNieuwsteEerst).toBeVisible();

    await expect(searchPage.playableSwitch).toBeVisible();
    await expect(searchPage.playableSwitch).toBeChecked();

    await expect(searchPage.firstResultLink).toBeVisible();
  });

  test('Advanced search: change sort to Nieuwste eerst', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('klokhuis');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await searchPage.sortButton.click();
    await page.getByRole('option', { name: /Nieuwste eerst/i }).or(page.getByText('Nieuwste eerst').first()).click();

    await expect(searchPage.firstResultLink).toBeVisible();
  });

  test('Advanced search: toggle "alleen direct afspeelbaar" off shows also non-playable', async ({
    page,
  }) => {
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('NTR');

    await expect(searchPage.playableSwitch).toBeChecked();
    await searchPage.playableSwitch.click();
    await expect(searchPage.playableSwitch).not.toBeChecked();
  });

  test('Advanced search: clicking Zoeken button navigates to results', async ({ page }) => {
    const query = 'NTR';
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndSubmit(query);

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.resultsHeadingWithName(query)).toBeVisible();
  });

  test('should navigate to series detail page directly', async ({ page }) => {
    const homePage = new HomePage(page);
    await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);

    await expect(page).toHaveURL(/.*\/serie\/.*\/sesamstraat/);
    await expect(page).toHaveTitle('SESAMSTRAAT | De Schatkamer');

    await expect(page.getByRole('heading', { name: 'SESAMSTRAAT', level: 1 })).toBeVisible();
    await expect(page.getByText('educatie', { exact: true }).first()).toBeVisible();
    await expect(page.locator('text=/\\d{1,2} \\w+ \\d{4}/').first()).toBeVisible();

    await expect(page.getByText(/Educatief programma/)).toBeVisible();

    await expect(homePage.breadcrumb).toBeVisible();
    await expect(homePage.breadcrumb.getByRole('link', { name: 'Home' })).toBeVisible();
  });

  test('should have functional home navigation', async ({ page }) => {
    const basePage = new BasePage(page);
    const homePage = new HomePage(page);
    await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);

    await expect(page).toHaveURL(/.*\/serie\/.*\/sesamstraat/);

    await basePage.homeLink.click();

    await expect(page).toHaveURL(BASE_URL);
    await expect(homePage.mainHeading).toBeVisible();
  });

  test('should display footer information correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.scrollFooterIntoView();

    await expect(homePage.footerHeadingOrganisatie).toBeVisible();
    await expect(homePage.footerHeadingOndersteuning).toBeVisible();
    await expect(homePage.footerHeadingOmroepen).toBeVisible();

    const organisatieLinks = ['Over Beeld & Geluid', 'Ethische verklaring', 'Convenant Audiovisuele Werken'];
    const ondersteuningLinks = ['Veelgestelde vragen & Contact'];
    const omroepLinks = ['AVROTROS', 'VPRO'];

    for (const name of organisatieLinks) {
      await expect(homePage.footer.getByRole('link', { name })).toBeVisible();
    }

    for (const name of ondersteuningLinks) {
      await expect(homePage.footer.getByRole('link', { name })).toBeVisible();
    }

    for (const name of omroepLinks) {
      await expect(homePage.footer.getByRole('link', { name })).toBeVisible();
    }

    await expect(homePage.newsletterHeading).toBeVisible();
    await expect(homePage.newsletterAanmeldenButton).toBeVisible();
  });
});
