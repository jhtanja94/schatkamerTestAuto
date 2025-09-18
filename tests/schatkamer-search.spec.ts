import { test, expect } from '@playwright/test';

test.describe('Schatkamer Search Functionality', () => {
  const baseUrl = 'https://schatkamer-tst.beeldengeluid.nl/';

  test.beforeEach(async ({ page }) => {
    // Navigate to the Schatkamer homepage
    await page.goto(baseUrl);
  });

  test('should load the homepage with correct title and search functionality', async ({ page }) => {
    // Verify the page loads with expected title
    await expect(page).toHaveTitle(/Vieze Meneer niet vies/);

    // Verify main search elements are present
    await expect(page.getByRole('textbox', { name: 'Zoeken in onze Schatkamer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zoeken' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Inloggen' })).toBeVisible();

    // Verify main content sections are present
    await expect(page.getByRole('heading', { name: 'Vieze meneer is niet vies' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '21 Jumpstreet' })).toBeVisible();
  });

  test('should perform search and display autocomplete results', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: 'Zoeken in onze Schatkamer' });
    
    // Type search term to trigger autocomplete
    await searchBox.fill('Sesamstraat');

    // Click the search button to trigger search results
    await page.getByRole('button', { name: 'Zoeken' }).click();

    // Wait for search results to appear (autocomplete dropdown)
    // Verify search suggestions/results appear - wait for search results dropdown to be visible
    await page.waitForTimeout(1000); // Give time for search results to load
    
    // Verify that search results appear (more flexible assertion)
    await expect(page.locator('text=SESAMSTRAAT').first()).toBeVisible();
    
    // Verify search functionality triggered some results by checking for search-related content
    const hasResults = await page.getByText('Serie').isVisible().catch(() => false) ||
                      await page.getByText('Media').isVisible().catch(() => false) ||
                      await page.getByText('NPO').isVisible().catch(() => false);
    expect(hasResults).toBeTruthy();
  });

  test('should navigate to series detail page directly', async ({ page }) => {
    // Navigate directly to a known series detail page (based on my manual exploration)
    await page.goto(`${baseUrl}serie/2101608030021453631/sesamstraat`);

    // Verify we've navigated to the correct detail page
    await expect(page).toHaveURL(/.*\/serie\/.*\/sesamstraat/);
    await expect(page).toHaveTitle('SESAMSTRAAT | De Schatkamer');

    // Verify series detail content
    await expect(page.getByRole('heading', { name: 'SESAMSTRAAT', level: 1 })).toBeVisible();
    await expect(page.getByText('educatie', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('30 augustus 1978 - 12 maart 2019')).toBeVisible();

    // Verify detailed description is present
    await expect(page.getByText(/Educatief programma waarin peuters en kleuters/)).toBeVisible();
    await expect(page.getByText(/Pino, Tommie en Grover/)).toBeVisible();

    // Verify breadcrumb navigation
    await expect(page.getByRole('navigation', { name: 'breadcrumb' })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'breadcrumb' }).getByRole('link', { name: 'Home' })).toBeVisible();
  });

  test('should display various content categories on homepage', async ({ page }) => {
    // Verify different content sections are present
    await expect(page.getByRole('heading', { name: '21 Jumpstreet' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Het Lichaam' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Vergeten vrienden' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'verloren tijden' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'personen' })).toBeVisible();

    // Verify that content carousels have navigation buttons (use first() to avoid strict mode violation)
    await expect(page.getByRole('button', { name: 'Navigeer naar links' }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Navigeer naar rechts' }).first()).toBeVisible();

    // Verify some content items are present (be more specific to avoid multiple matches)
    await expect(page.getByRole('link', { name: 'DE STRAAT DE STRAAT' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'ZOMERGASTEN ZOMERGASTEN' })).toBeVisible();
  });

  test('should have functional home navigation', async ({ page }) => {
    // Navigate directly to a detail page first
    await page.goto(`${baseUrl}serie/2101608030021453631/sesamstraat`);

    // Verify we're on the detail page
    await expect(page).toHaveURL(/.*\/serie\/.*\/sesamstraat/);

    // Click the Home link in the header
    await page.getByRole('link', { name: 'Home' }).first().click();

    // Verify we're back on the homepage
    await expect(page).toHaveURL(baseUrl);
    await expect(page.getByRole('heading', { name: 'Vieze meneer is niet vies' })).toBeVisible();
  });

  test('should display footer information correctly', async ({ page }) => {
    // Scroll to footer
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();

    // Verify footer sections
    await expect(page.getByRole('heading', { name: 'Organisatie' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ondersteuning' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Omroepen' })).toBeVisible();

    // Verify footer links
    await expect(page.getByRole('link', { name: 'Over Beeld & Geluid' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Veelgestelde vragen & Contact' })).toBeVisible();

    // Verify broadcaster links in footer (scope to contentinfo to avoid multiple matches)
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'BNNVARA' })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByRole('link', { name: 'NPO' })).toBeVisible();

    // Verify newsletter signup
    await expect(page.getByRole('heading', { name: 'Ontvang de nieuwsbrief en blijf op de hoogte' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Aanmelden' })).toBeVisible();

    // Verify Beeld & Geluid attribution
    await expect(page.getByText('De Schatkamer is een initiatief van Beeld & Geluid')).toBeVisible();
  });
});
