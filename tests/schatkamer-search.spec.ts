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
    // On mobile, the Zoeken button may not be visible, so check if it exists
    const zoekenButton = page.getByRole('button', { name: 'Zoeken' });
    if (await zoekenButton.isVisible().catch(() => false)) {
      await expect(zoekenButton).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Inloggen' })).toBeVisible();

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
// Use the first matching search box (the header one)
const searchBox = page
  .getByRole('textbox', { name: /Zoek op programma's, personen, verhalen en omroepen/ })
  .first();
await searchBox.click();
await searchBox.fill('NTR');


    // Verify Media section appears with up to 5 items
    await expect(page.getByText('Media').first()).toBeVisible();
    const mediaItems = page.getByRole('link', { name: /\((Serie|Programma)\)$/ });
    await expect(mediaItems).toHaveCount(5);
  });

  test('Flyout: Omroep shows max 2 and click navigates to entity page', async ({ page }) => {
    const searchBox = page
  .getByRole('textbox', { name: /Zoek op programma's, personen, verhalen en omroepen/ })
  .first();
await searchBox.click();
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
  
    // Trigger search via Enter
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill(query);
    await searchBox.press('Enter');
  
   // Assert we’re on the advanced search page with correct heading
    await expect(page).toHaveURL(/\/zoeken\?/);
    await expect(page.getByRole('heading', { name: query, level: 1 })).toBeVisible();
  
    //  Assert visible filters
    const filterNames = ['Programma', 'Type', 'Datum', 'Omroep', 'Collectie', 'Genre', 'Persoon', 'Onderwerp'];
    for (const name of filterNames) {
      await expect(page.getByRole('button', { name })).toBeVisible();
    }
  
    // Assert sorting control and its options
    const sortTrigger = page.getByRole('button', { name: 'Relevantie' });
    await expect(sortTrigger).toBeVisible();
    await sortTrigger.click();
    await expect(page.getByText('Oudste eerst')).toBeVisible();
    await expect(page.getByText('Nieuwste eerst')).toBeVisible();
  
    // Assert “Alleen afspeelbaar” switch and that results exist
    const playableSwitch = page.getByRole('switch');
    await expect(playableSwitch).toBeVisible();
    await expect(playableSwitch).toBeChecked();
  
    await expect(page.getByRole('link').first()).toBeVisible();
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
    const footer = page.getByRole('contentinfo');
    await footer.scrollIntoViewIfNeeded();
  
    // Verify footer headings
    await expect(footer.getByRole('heading', { name: 'Organisatie' })).toBeVisible();
    await expect(footer.getByRole('heading', { name: 'Ondersteuning' })).toBeVisible();
    await expect(footer.getByRole('heading', { name: 'Omroepen' })).toBeVisible();
  
    // Expected links per section
    const organisatieLinks = ['Over Beeld & Geluid', 'Ethische verklaring', 'AV-Convenant'];
    const ondersteuningLinks = ['Veelgestelde vragen & Contact'];
    const omroepLinks = ['AVROTROS', 'VPRO'];
  
    for (const name of organisatieLinks) {
      await expect(footer.getByRole('link', { name })).toBeVisible();
    }
  
    for (const name of ondersteuningLinks) {
      await expect(footer.getByRole('link', { name })).toBeVisible();
    }
  
    for (const name of omroepLinks) {
      await expect(footer.getByRole('link', { name })).toBeVisible();
    }
  
    // Newsletter signup
    await expect(
      footer.getByRole('heading', { name: 'Ontvang de nieuwsbrief en blijf op de hoogte' })
    ).toBeVisible();
    await expect(footer.getByRole('button', { name: 'Aanmelden' })).toBeVisible();
  
          
  });
});
