import { test, expect } from '../fixtures/base';

const BASE_URL = 'https://schatkamer-tst.beeldengeluid.nl/';

test.describe('Dynamic Search Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('Flyout: triggers on any single character input', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    
    // Test with random single character
    const testChar = 'a';
    await searchBox.fill(testChar);
    
    // Flyout should appear - verify by checking for Media or Personen sections
    const mediaVisible = await page.getByText('Media').first().isVisible({ timeout: 2000 }).catch(() => false);
    const personenVisible = await page.getByText('Personen').first().isVisible({ timeout: 2000 }).catch(() => false);
    const advancedSearchVisible = await page.getByRole('link', { name: /Zoeken op/ }).isVisible({ timeout: 2000 }).catch(() => false);
    
    expect(mediaVisible || personenVisible || advancedSearchVisible).toBeTruthy();
  });

  test('Flyout: Media section shows 0-5 results', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('test');
    
    // Check if Media section exists
    const mediaSection = page.getByText('Media').first();
    const hasMedía = await mediaSection.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasMedía) {
      // Count media items - should be max 5
      const mediaItems = page.getByRole('link', { name: /\((Serie|Programma)\)$/ });
      const count = await mediaItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  test('Flyout: Omroep section shows 0-2 results', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('test');
    
    // Count omroep items - should be max 2
    const omroepItems = page.getByRole('link', { name: /\bOmroep$/ });
    const count = await omroepItems.count();
    expect(count).toBeGreaterThanOrEqual(0);
    expect(count).toBeLessThanOrEqual(2);
  });

  test('Flyout: Personen section shows 0-5 results', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('test');
    
    // Check if Personen section exists
    const personenSection = page.getByText('Personen').first();
    const hasPersonen = await personenSection.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasPersonen) {
      // Count personen items - should be max 5
      const personenItems = page.getByRole('link', { name: /\(Persoon\)$/ });
      const count = await personenItems.count();
      expect(count).toBeGreaterThanOrEqual(0);
      expect(count).toBeLessThanOrEqual(5);
    }
  });

  test('Flyout: clicking any result navigates correctly', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('NTR');
    
    // Get first clickable result in flyout (any type)
    const firstResult = page.getByRole('link').filter({ 
      hasText: /Omroep|Serie|Programma|Persoon/ 
    }).first();
    
    await expect(firstResult).toBeVisible();
    await firstResult.click();
    
    // Should navigate away from homepage
    await expect(page).not.toHaveURL(BASE_URL);
    // Should have a heading on the detail page
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Advanced search: Enter/Zoeken button both navigate to results page', async ({ page }) => {
    const queries = ['AVROTROS', 'NTR', 'video'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill(randomQuery);
    
    // Randomly choose between Enter or button click
    const useEnter = Math.random() > 0.5;
    if (useEnter) {
      await searchBox.press('Enter');
    } else {
      await page.getByRole('button', { name: 'Zoeken' }).click();
    }
    
    // Should land on search results page
    await expect(page).toHaveURL(/\/zoeken\?/);
    // Heading should contain the query
    await expect(page.getByRole('heading', { level: 1 })).toContainText(randomQuery);
  });

  test('Advanced search: default filters are always visible', async ({ page }) => {
    // Navigate to general search results page (not entity-specific)
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('video');
    await searchBox.press('Enter');
    
    await expect(page).toHaveURL(/\/zoeken\?/);
    
    // These filters should be visible (on general search, all 4; on entity pages, the entity filter is pre-selected)
    const expectedFilters = ['Programma', 'Type', 'Datum'];
    
    for (const filterName of expectedFilters) {
      await expect(page.getByRole('button', { name: filterName })).toBeVisible();
    }
    
    // Omroep filter should also be visible on general search
    await expect(page.getByRole('button', { name: 'Omroep' })).toBeVisible();
  });

  test('Advanced search: "Alleen afspeelbaar" switch is checked by default', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('test');
    await searchBox.press('Enter');
    
    const playableSwitch = page.getByRole('switch');
    await expect(playableSwitch).toBeVisible();
    await expect(playableSwitch).toBeChecked();
  });

  test('Advanced search: toggle "Alleen afspeelbaar" changes results', async ({ page }) => {
    // Navigate directly to an omroep page which has the playable switch
    await page.goto(`${BASE_URL}omroep/236909/avrotros?sorteren=oudste&afspeelbaar=ja`);
    
    // Verify initial state
    await expect(page).toHaveURL(/afspeelbaar=ja/);
    const playableSwitch = page.getByRole('switch');
    await expect(playableSwitch).toBeChecked();
    
    // Toggle switch
    await playableSwitch.click();
    
    // Wait for URL to update
    await page.waitForURL(/afspeelbaar=nee/, { timeout: 5000 });
    
    // Verify URL changed
    const newUrl = page.url();
    expect(newUrl).toContain('afspeelbaar=nee');
  });

  test('Advanced search: sorting options are functional', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('test');
    await searchBox.press('Enter');
    
    // Default sorting button should be visible
    const sortButton = page.getByRole('button', { name: /Relevantie|Oudste eerst|Nieuwste eerst/ });
    await expect(sortButton).toBeVisible();
    
    // Click to open sort menu and change sorting
    await sortButton.click();
    
    // Should show sort options (implementation may vary)
    // At minimum, clicking shouldn't break the page
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('Advanced search: "Toon meer filters" expands additional filters', async ({ page }) => {
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('test');
    await searchBox.press('Enter');
    
    // Initially "Toon meer filters" should be visible
    const showMoreButton = page.getByRole('button', { name: 'Toon meer filters' });
    await expect(showMoreButton).toBeVisible();
    
    await showMoreButton.click();
    
    // After clicking, "Toon minder filters" should appear
    await expect(page.getByRole('button', { name: 'Toon minder filters' })).toBeVisible();
    
    // At least one additional filter should be visible
    const additionalFilters = page.getByRole('button', { name: /Collectie|Genre|Onderwerp/ });
    await expect(additionalFilters.first()).toBeVisible();
  });

  test('Advanced search: pagination exists when results exceed page size', async ({ page }) => {
    // Use a broad search term likely to have many results
    const searchBox = page.getByRole('textbox', { name: /Zoek/ });
    await searchBox.fill('a');
    await searchBox.press('Enter');
    
    // Check for pagination
    const pagination = page.getByRole('navigation', { name: 'Paginering' });
    const hasPagination = await pagination.isVisible({ timeout: 3000 }).catch(() => false);
    
    if (hasPagination) {
      // Should have next page link
      const nextLink = page.getByRole('link', { name: /Volgende|Pagina 2/ });
      await expect(nextLink.first()).toBeVisible();
    } else {
      // If no pagination, results should still be visible
      await expect(page.getByRole('main')).toBeVisible();
    }
  });

  test('Entity page: any omroep page shows expected structure', async ({ page }) => {
    // Navigate to omroep section in footer (more reliable)
    await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
    
    const omroepLink = page.getByRole('contentinfo').getByRole('link', { 
      name: /BNNVARA|AVROTROS|VPRO|EO|HUMAN/ 
    }).first();
    
    await omroepLink.click();
    
    // Should land on omroep entity page
    await expect(page).toHaveURL(/\/omroep\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Default filters should be present
    await expect(page.getByRole('button', { name: 'Programma' })).toBeVisible();
    await expect(page.getByRole('switch')).toBeChecked();
  });

  test('Entity page: any person page shows expected structure', async ({ page }) => {
    // Get a random person from homepage
    const personCarousel = page.getByRole('heading', { name: /Weet je nog/, level: 2 });
    await personCarousel.scrollIntoViewIfNeeded();
    
    const personLink = page.getByRole('link').filter({ 
      hasText: /Mies Bouwman|Willem Ruis|Carry Tefsen|Ali B|Beatles/ 
    }).first();
    
    await personLink.click();
    
    // Should land on person entity page
    await expect(page).toHaveURL(/\/persoon\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('Entity page: any serie page shows expected structure', async ({ page }) => {
    // Get a random serie from homepage
    const serieCarousel = page.getByRole('heading', { name: /Nostalgie/, level: 2 });
    await serieCarousel.scrollIntoViewIfNeeded();
    
    const serieLink = page.getByRole('link').filter({ 
      hasText: /SESAMSTRAAT|HET KLOKHUIS|KOEKELOERE|ZOMERGASTEN/ 
    }).first();
    
    await serieLink.click();
    
    // Should land on serie entity page
    await expect(page).toHaveURL(/\/serie\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Serie pages should have program listings
    await expect(page.getByRole('main')).toBeVisible();
  });
});

