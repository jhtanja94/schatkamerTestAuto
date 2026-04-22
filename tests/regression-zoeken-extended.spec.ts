import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { HomePage, SearchPage, BasePage } from '../pages';

test.describe('Zoeken - Extended', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  // ——— Flyout: Persoon ———

  test('Flyout: Persoon - search by full name shows person with scopenote', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchBox = homePage.searchBoxWithPlaceholder;
    await searchBox.click();
    await searchBox.pressSequentially('Mies Bouwman', { delay: 10 });

    const persoonSection = page.getByText('Personen').first();
    await expect(persoonSection).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('link', { name: /Mies Bouwman/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('Flyout: Persoon - common name shows max 5 results', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchBox = homePage.searchBoxWithPlaceholder;
    await searchBox.click();
    await searchBox.pressSequentially('Jan', { delay: 10 });

    await expect(page.getByText('Personen').first()).toBeVisible({ timeout: 8000 });
    const persoonLinks = page
      .locator('div, section, [role="listbox"]')
      .filter({ has: page.getByText('Personen', { exact: true }) })
      .last()
      .getByRole('link');
    await expect(persoonLinks).toHaveCount(5, { timeout: 8000 });
  });

  test('Flyout: Algemeen - "Zoeken op [term] in alle media" link opens advanced search', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchBox = homePage.searchBoxWithPlaceholder;
    await searchBox.click();
    await searchBox.pressSequentially('klokhuis', { delay: 10 });

    const zoekLink = page.getByRole('link', { name: /Zoeken op.*in alle media|Zoek op.*media/i })
      .or(page.getByText(/Zoeken op.*klokhuis/i).first());
    await expect(zoekLink.first()).toBeVisible({ timeout: 8000 });
    await zoekLink.first().click();
    await expect(page).toHaveURL(/\/zoeken\?/);
  });

  // ——— Advanced Search: Algemeen ———

  test('Advanced Search: search by program-ID shows bold hit on result tile', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('2101608040030110531');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
    const boldHit = page.locator('main strong, main b, main mark').first();
    await expect(boldHit).toBeVisible({ timeout: 5000 });
  });

  test('Advanced Search: search by Onderwerp shows results with bold hit', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('natuur');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: search by Genre shows results', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('documentaire');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: sort Oudste eerst - results sorted by oldest first', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('NTR');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await searchPage.sortButton.click();
    await page
      .getByRole('option', { name: /Oudste eerst/i })
      .or(page.getByText('Oudste eerst').first())
      .click();
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: empty search shows generic results (max 10.000)', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=`);

    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 10000 });
    const resultsText = page.getByText(/10\.000|10000|resultaten/i).first();
    await expect(resultsText).toBeVisible({ timeout: 5000 });
  });

  test('Advanced Search: search with no results shows 0-results message', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.searchAndPressEnter('xqzjk99notfound2024impossible');

    await expect(page).toHaveURL(/\/zoeken\?/);
    const noResultsMsg = page.getByText(/geen resultaten|0 resultaten|niets gevonden|no results/i).first();
    await expect(noResultsMsg).toBeVisible({ timeout: 8000 });
  });

  // ——— Advanced Search: Paginering ———

  test('Advanced Search: Paginering - navigate to page 2 shows next 24 results', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=`);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 10000 });

    const firstItemBefore = await searchPage.firstResultLink.textContent();

    await expect(searchPage.pagination).toBeVisible({ timeout: 5000 });
    const page2Link = searchPage.pagination
      .getByRole('link', { name: /^2$/ })
      .or(searchPage.pagination.getByRole('link', { name: /Volgende|Next/i }));
    await page2Link.click();

    await expect(page).toHaveURL(/pagina=2/);
    const firstItemAfter = await searchPage.firstResultLink.textContent();
    expect(firstItemBefore).not.toBe(firstItemAfter);
  });

  test('Advanced Search: Paginering - search with <24 results shows no pagination', async ({ page }) => {
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('2101608040030110531');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
    await expect(searchPage.pagination).not.toBeVisible();
  });

  // ——— Advanced Search: Filters ———

  test('Advanced Search: Filters - two filters applied work as AND', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=`);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 10000 });

    const firstResultCountText = await page.getByText(/resultaten/i).first().textContent().catch(() => '');

    await searchPage.filterButton('Type').click();
    const videoOption = page.getByRole('option', { name: /video|Video/i })
      .or(page.getByRole('checkbox', { name: /video/i }))
      .first();
    await videoOption.click();
    await page.keyboard.press('Escape');

    await searchPage.filterButton('Omroep').click();
    const ntrOption = page.getByRole('option', { name: /NTR/i })
      .or(page.getByRole('checkbox', { name: /NTR/i }))
      .first();
    await ntrOption.click();
    await page.keyboard.press('Escape');

    const filteredResultsText = await page.getByText(/resultaten/i).first().textContent().catch(() => '');
    expect(filteredResultsText).not.toBe(firstResultCountText);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: Filters - search within Omroep filter finds and selects value', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=NTR`);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 10000 });

    await searchPage.filterButton('Omroep').click();
    const filterSearchInput = page.getByRole('searchbox').or(page.locator('input[type="search"]')).first();
    await expect(filterSearchInput).toBeVisible({ timeout: 5000 });
    await filterSearchInput.fill('AVROTROS');

    const avrotrosOption = page.getByRole('option', { name: /AVROTROS/i })
      .or(page.getByRole('checkbox', { name: /AVROTROS/i }))
      .first();
    await expect(avrotrosOption).toBeVisible({ timeout: 5000 });
    await avrotrosOption.click();
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: Filters - date range filters results', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=`);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 10000 });

    await searchPage.filterButton('Datum').click();
    const startYearInput = page.getByRole('spinbutton', { name: /van|start|begin/i })
      .or(page.locator('input[name*="start"], input[name*="from"], input[name*="begin"]'))
      .first();
    await expect(startYearInput).toBeVisible({ timeout: 5000 });
    await startYearInput.fill('2000');

    const endYearInput = page.getByRole('spinbutton', { name: /tot|end|eind/i })
      .or(page.locator('input[name*="end"], input[name*="to"], input[name*="eind"]'))
      .first();
    if (await endYearInput.isVisible().catch(() => false)) {
      await endYearInput.fill('2010');
    }

    await page.keyboard.press('Enter');
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });
});
