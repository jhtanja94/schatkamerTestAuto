import { test, expect } from '../fixtures/base';

const BASE_URL = 'https://schatkamer-tst.beeldengeluid.nl/';

test.describe('Schatkamer Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should load the homepage with correct title and search functionality', async ({ page }) => {
    // Verify the page loads with expected title
    await expect(page).toHaveTitle(/De Schatkamer/);

    // Verify main search elements are present
    await expect(page.getByRole('textbox', { name: /Zoek/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zoeken' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Inloggen' })).toBeVisible();

    // Verify main content sections are present
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('Flyout: appears on first character typed', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('s');
    // Flyout should render immediately with sections like Media or Personen
    await expect(page.getByText('Media').first()).toBeVisible();
  });

  test('Flyout: Media shows up to 5 results for query', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('NTR');

    // Verify Media section appears with up to 5 items
    await expect(page.getByText('Media').first()).toBeVisible();
    const mediaItems = page.getByRole('link', { name: /\((Serie|Programma)\)$/ });
    await expect(mediaItems).toHaveCount(5);
  });

  test('Flyout: Omroep shows max 2 and click navigates to entity page', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('NTR');

    // Expect Omroep links in flyout (e.g., "NTR Omroep") and maximum 2 items
    const omroepLinks = page.getByRole('link', { name: /\bOmroep$/ });
    await expect(omroepLinks).toHaveCount(2);

    // Click the NTR Omroep entry
    await page.getByRole('link', { name: 'NTR Omroep' }).click();

    // Verify Omroep entity page
    await expect(page).toHaveURL(/\/omroep\//);
    await expect(page.getByRole('heading', { name: 'NTR', level: 1 })).toBeVisible();

    // Alleen afspeelbaar is a switch that should be checked by default
    const playableSwitch = page.getByRole('switch');
    await expect(playableSwitch).toBeVisible();
    await expect(playableSwitch).toBeChecked();

    // Sorting and results label present
    await expect(page.getByRole('button', { name: /Oudste eerst|Nieuwste eerst|Relevantie/ })).toBeVisible();
    await expect(page.getByText(/resultaten/).first()).toBeVisible();

    // Pagination visible
    await expect(page.getByRole('navigation', { name: 'Paginering' })).toBeVisible();
  });

  test('Advanced search: Enter key navigates to results with default filters', async ({ page }) => {
    const query = 'NTR';
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill(query);
    await searchBox.press('Enter');

    // Verify landing on advanced search results page
    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(page.getByRole('heading', { name: query, level: 1 })).toBeVisible();

    // Default visible filters
    await expect(page.getByRole('button', { name: 'Programma' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Type' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Datum' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Omroep' })).toBeVisible();

    // Sorting default visible and set to Relevantie
    await expect(page.getByRole('button', { name: 'Relevantie' })).toBeVisible();

    // Alleen afspeelbaar is checked by default
    const playableSwitch = page.getByRole('switch');
    await expect(playableSwitch).toBeVisible();
    await expect(playableSwitch).toBeChecked();

    // Results exist
    await expect(page.getByRole('link').first()).toBeVisible();

    // Show more filters and verify additional filters become visible
    await page.getByRole('button', { name: 'Toon meer filters' }).click();
    await expect(page.getByRole('button', { name: 'Collectie' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Genre' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Onderwerp' })).toBeVisible();
    // Verify more filters section is expanded
    await expect(page.getByRole('button', { name: 'Toon minder filters' })).toBeVisible();
  });

  test('Advanced search: clicking Zoeken button navigates to results', async ({ page }) => {
    const query = 'NTR';
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill(query);
    await page.getByRole('button', { name: 'Zoeken' }).click();

    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(page.getByRole('heading', { name: query, level: 1 })).toBeVisible();
  });

  test('should navigate to series detail page directly', async ({ page }) => {
    // Navigate directly to a known series detail page
    await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);

    // Verify we've navigated to the correct detail page
    await expect(page).toHaveURL(/.*\/serie\/.*\/sesamstraat/);
    await expect(page).toHaveTitle('SESAMSTRAAT | De Schatkamer');

    // Verify series detail content
    await expect(page.getByRole('heading', { name: 'SESAMSTRAAT', level: 1 })).toBeVisible();
    await expect(page.getByText('educatie', { exact: true }).first()).toBeVisible();
    // Date range should be visible (format may vary)
    await expect(page.locator('text=/\\d{1,2} \\w+ \\d{4}/').first()).toBeVisible();

    // Verify detailed description is present
    await expect(page.getByText(/Educatief programma/)).toBeVisible();

    // Verify breadcrumb navigation
    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'breadcrumb' }).getByRole('link', { name: 'Home' })).toBeVisible();
  });

  test('should have functional home navigation', async ({ page }) => {
    // Navigate directly to a detail page first
    await page.goto(`${BASE_URL}serie/2101608030021453631/sesamstraat`);

    // Verify we're on the detail page
    await expect(page).toHaveURL(/.*\/serie\/.*\/sesamstraat/);

    // Click the Home link in the header
    await page.getByRole('link', { name: 'Home' }).first().click();

    // Verify we're back on the homepage
    await expect(page).toHaveURL(BASE_URL);
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
  });

  test('should display footer information correctly', async ({ page }) => {
    // Scroll to footer
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();

    // Verify footer sections (scope to contentinfo)
    await expect(page.getByRole('contentinfo').getByRole('heading', { name: 'Organisatie' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('heading', { name: 'Ondersteuning' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('heading', { name: 'Omroepen' })).toBeVisible();

    // Verify footer links
    await expect(page.getByRole('link', { name: 'Over Beeld & Geluid' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Veelgestelde vragen & Contact' })).toBeVisible();

    // Verify broadcaster links in footer (scope to contentinfo to avoid multiple matches)
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'BNNVARA' })).toBeVisible();

    // Verify newsletter signup
    await expect(page.getByRole('heading', { name: 'Ontvang de nieuwsbrief en blijf op de hoogte' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('button', { name: 'Aanmelden' })).toBeVisible();

    // Verify Beeld & Geluid attribution
    await expect(page.getByText('De Schatkamer is een initiatief van Beeld & Geluid')).toBeVisible();
  });
});
