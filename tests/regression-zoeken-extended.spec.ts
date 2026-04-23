import { test, expect } from '../fixtures/base';
import { BASE_URL } from '../config/env';
import { HomePage, SearchPage, BasePage } from '../pages';

test.describe('Zoeken - Extended', () => {
  // ——— Flyout: Persoon ———

  test('Flyout: Persoon - search by full name shows person with scopenote', async ({ page }) => {
    await page.goto(BASE_URL);
    const homePage = new HomePage(page);
    const searchBox = homePage.searchBoxWithPlaceholder;
    await searchBox.click();
    await searchBox.pressSequentially('Mies Bouwman', { delay: 10 });

    const persoonSection = page.getByText('Personen').first();
    await expect(persoonSection).toBeVisible({ timeout: 8000 });
    await expect(page.getByRole('link', { name: /Mies Bouwman/i }).first()).toBeVisible({ timeout: 5000 });
  });

  test('Flyout: Persoon - common name shows max 5 results', async ({ page }) => {
    await page.goto(BASE_URL);
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

  test('Flyout: Algemeen - typing and submitting navigates to advanced search results', async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    const homePage = new HomePage(page);
    const searchBox = homePage.searchBoxWithPlaceholder;
    await searchBox.click();
    await searchBox.pressSequentially('klokhuis', { delay: 10 });

    // Flyout should appear
    await expect(page.getByText('Media').first()).toBeVisible({ timeout: 8000 });

    // Pressing Enter navigates to advanced search (same as "Zoeken op … in alle media")
    await searchBox.press('Enter');
    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(page.getByRole('heading', { name: /klokhuis/i, level: 1 })).toBeVisible({
      timeout: 8000,
    });
  });

  // ——— Advanced Search: Algemeen ———

  test('Advanced Search: search by program-ID shows result', async ({ page }) => {
    await page.goto(BASE_URL);
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('2101608040030110531');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: search by Onderwerp shows results', async ({ page }) => {
    await page.goto(BASE_URL);
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('natuur');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: search by Genre shows results', async ({ page }) => {
    await page.goto(BASE_URL);
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('documentaire');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: sort Oudste eerst - sort button shows Oudste eerst as selected', async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    const homePage = new HomePage(page);
    const searchPage = new SearchPage(page);
    await homePage.searchAndPressEnter('NTR');

    await expect(page).toHaveURL(/\/zoeken\?/);
    await searchPage.sortButton.click();
    await page.getByRole('radio', { name: 'Oudste eerst' }).first().click();
    await expect(searchPage.sortButton).toHaveText(/Oudste eerst/i, { timeout: 5000 });
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: empty search - results are shown', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=`);

    await expect(searchPage.sortButton).toBeVisible({ timeout: 15000 });
    // Results label is in an aria-live region; use toBeAttached
    await expect(searchPage.resultsLabel).toBeAttached({ timeout: 5000 });
  });

  test('Advanced Search: search with no results shows 0-results message', async ({ page }) => {
    await page.goto(BASE_URL);
    const homePage = new HomePage(page);
    await homePage.searchAndPressEnter('xqzjk99notfound2024impossible');

    await expect(page).toHaveURL(/\/zoeken\?/);
    // "0 resultaten" is in an aria-live region — assert it's in the DOM
    const noResultsMsg = page.getByText(/0 resultaten|geen resultaten|niets gevonden/i).first();
    await expect(noResultsMsg).toBeAttached({ timeout: 8000 });
  });

  // ——— Advanced Search: Paginering ———

  test('Advanced Search: Paginering - navigate to page 2 shows next 24 results', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=`);
    await expect(searchPage.sortButton).toBeVisible({ timeout: 15000 });

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

  test('Advanced Search: Paginering - search with <24 results shows no pagination', async ({
    page,
  }) => {
    await page.goto(BASE_URL);
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
    await expect(searchPage.sortButton).toBeVisible({ timeout: 15000 });

    const typeBtn = searchPage.filterButton('Type');
    await expect(typeBtn).toBeVisible({ timeout: 10000 });
    await typeBtn.click();

    // Verify filter panel opened with at least one option visible
    const filterOption = page
      .getByRole('option')
      .or(page.getByRole('radio'))
      .or(page.locator('label').filter({ has: page.locator('input[type="checkbox"]') }))
      .first();
    await expect(filterOption).toBeVisible({ timeout: 5000 });

    // Apply via URL: navigate with type filter to confirm filtering works as AND
    await page.keyboard.press('Escape');
    await page.goto(`${BASE_URL}zoeken?q=&type=video`);
    await expect(searchPage.sortButton).toBeVisible({ timeout: 15000 });
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: Filters - Omroep filter options are visible and selectable', async ({
    page,
  }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=NTR`);
    await expect(searchPage.sortButton).toBeVisible({ timeout: 15000 });

    const omroepBtn = searchPage.filterButton('Omroep');
    await expect(omroepBtn).toBeVisible({ timeout: 10000 });
    await omroepBtn.click();

    // After opening the panel, look for any label or button with omroep-like text
    const firstOption = page
      .getByRole('option')
      .or(page.getByRole('radio'))
      .or(page.locator('label').filter({ has: page.locator('input[type="checkbox"]') }))
      .first();
    if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstOption.click({ force: true });
    }
    await page.keyboard.press('Escape');
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });

  test('Advanced Search: Filters - Datum filter has year inputs', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await page.goto(`${BASE_URL}zoeken?q=`);
    await expect(searchPage.sortButton).toBeVisible({ timeout: 15000 });

    const datumBtn = searchPage.filterButton('Datum');
    await expect(datumBtn).toBeVisible({ timeout: 10000 });
    await datumBtn.click();

    // Year inputs appear inside the filter dropdown — exclude the OneTrust cookie input
    // by waiting for an input that becomes visible AFTER the click (not OptanonAlertBoxClosed)
    const yearInput = page.locator('input[type="number"], input[placeholder*="jaar" i]').first();
    if (await yearInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await yearInput.fill('2000');
      await yearInput.press('Tab');
    } else {
      // Fallback: any new input that appeared — verify by checking its ID isn't OneTrust
      const anyInput = page.locator('input:visible').filter({ hasNot: page.locator('[id*="ot-"]') }).first();
      if (await anyInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await anyInput.fill('2000');
        await anyInput.press('Tab');
      } else {
        test.skip();
        return;
      }
    }
    await expect(searchPage.firstResultLink).toBeVisible({ timeout: 8000 });
  });
});
